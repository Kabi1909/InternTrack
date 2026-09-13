import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const { default: app } = await import('../app.js');
const { connectDB } = await import('../config/db.js');
const { env } = await import('../config/env.js');
const { default: User } = await import('../models/User.js');
const { default: Upload } = await import('../models/Upload.js');
const databaseName = `interntrack_test_${randomUUID().replaceAll('-', '')}`;
const call = (method, url, token) => {
  const operation = request(app)[method](`/api${url}`);
  return token ? operation.auth(token, { type: 'bearer' }) : operation;
};

test('MongoDB-backed recruitment workflow and authorization', async (t) => {
  const base = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017';
  const separator = base.indexOf('?');
  const uri = separator < 0 ? base : base.slice(0, separator);
  const options = separator < 0 ? '' : base.slice(separator);
  const authorityEnd = uri.indexOf('/', uri.indexOf('://') + 3);
  const authority = authorityEnd < 0 ? uri : uri.slice(0, authorityEnd);
  await connectDB(`${authority}/${databaseName}${options}`);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  t.after(async () => {
    const uploads = await Upload.find().select('+storageKey');
    for (const file of uploads) {
      if (file.driver === 'local' && path.basename(file.storageKey) === file.storageKey) {
        await unlink(path.join(env.uploadDir, file.storageKey)).catch(() => {});
      }
    }
    assert.equal(mongoose.connection.name, databaseName);
    assert.match(databaseName, /^interntrack_test_[a-f0-9]+$/);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  let student, provider, outsider, jobId, applicationId, cvId, interviewId;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const deadline = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const job = {
    title: 'Frontend Engineer',
    description: 'Build accessible and responsive recruitment software.',
    jobType: 'Internship',
    workMode: 'Remote',
    location: 'Colombo',
    category: 'Software Development',
    requiredSkills: ['React'],
    numberOfPositions: 2,
    applicationDeadline: deadline,
    status: 'Active',
  };
  await t.test('registration hashes passwords and creates role profiles', async () => {
    for (const role of ['student', 'provider', 'outsider']) {
      const response = await call('post', '/auth/register')
        .send({
          name: `${role} Tester`,
          email: `${role}@example.test`,
          password: 'SecurePassword123!',
          role: role === 'student' ? 'student' : 'provider',
          companyName: 'Test Company',
          university: 'Test University',
          degree: 'Computer Science',
        })
        .expect(201);
      assert.equal(response.body.data.user.password, undefined);
      assert.ok(response.body.data.profile.id);
      if (role === 'student') student = response.body.data.token;
      else if (role === 'provider') provider = response.body.data.token;
      else outsider = response.body.data.token;
    }
    const stored = await User.findOne({ email: 'student@example.test' }).select(
      '+password',
    );
    assert.match(stored.password, /^\$2/);
    assert.equal(await stored.comparePassword('SecurePassword123!'), true);
    await call('post', '/auth/register')
      .send({
        name: 'Duplicate',
        email: 'student@example.test',
        password: 'SecurePassword123!',
        role: 'student',
      })
      .expect(409);
    await call('post', '/auth/register')
      .send({ name: 'Bad', email: 'bad', password: 'x', role: 'admin' })
      .expect(400);
  });
  await t.test('login, authentication, validation and role boundaries', async () => {
    await call('post', '/auth/login')
      .send({ email: 'student@example.test', password: 'wrong' })
      .expect(401);
    await call('post', '/auth/login')
      .send({ email: 'student@example.test', password: 'SecurePassword123!' })
      .expect(200);
    await call('get', '/auth/me', student).expect(200);
    await call('get', '/students/profile').expect(401);
    await call('get', '/students/profile', provider).expect(403);
    await call('post', '/jobs', student).send(job).expect(403);
    await call('get', '/jobs/invalid').expect(400);
    await call('post', '/auth/login')
      .send({ email: { $ne: null }, password: 'x' })
      .expect(400);
  });
  await t.test('owned job CRUD and public search pagination', async () => {
    const result = await call('post', '/jobs', provider).send(job).expect(201);
    jobId = result.body.data.id;
    const browse = await call('get', '/jobs?search=frontend&skills=React&limit=1').expect(
      200,
    );
    assert.equal(browse.body.pagination.total, 1);
    assert.equal(browse.body.data[0].company, 'Test Company');
    await call('put', `/jobs/${jobId}`, outsider).send(job).expect(404);
    await call('delete', `/jobs/${jobId}`, student).expect(403);
    await call('get', '/jobs?status=Draft').expect(403);
    await call('put', `/jobs/${jobId}`, provider)
      .send({ ...job, salaryText: 'Paid internship' })
      .expect(200);
  });
  await t.test('CV uploads validate file content and protect documents', async () => {
    await call('post', '/students/profile/cv', student)
      .attach('file', Buffer.from('not a pdf'), {
        filename: 'cv.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);
    const result = await call('post', '/students/profile/cv', student)
      .attach('file', Buffer.from('%PDF-1.4\n%%EOF'), {
        filename: 'cv.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    cvId = result.body.data.id;
    await call('get', `/uploads/${cvId}`).expect(401);
    await call('get', `/uploads/${cvId}`, outsider).expect(404);
    await call('get', `/uploads/${cvId}`, student).expect(200);
  });
  await t.test('save and apply without duplicate applications', async () => {
    await call('post', `/saved-jobs/${jobId}`, student).expect(201);
    await call('post', `/saved-jobs/${jobId}`, student).expect(201);
    const saved = await call('get', '/saved-jobs', student).expect(200);
    assert.equal(saved.body.pagination.total, 1);
    const result = await call('post', `/applications/${jobId}`, student)
      .send({ coverLetter: 'I would love to join.' })
      .expect(201);
    applicationId = result.body.data.id;
    await call('post', `/applications/${jobId}`, student).send({}).expect(409);
    await call('get', `/uploads/${cvId}`, provider).expect(200);
    await call('get', `/applications/${applicationId}`, outsider).expect(404);
  });
  await t.test('candidate filters and private notes are role scoped', async () => {
    await call('put', '/students/profile', student)
      .send({ skills: ['React'], university: 'Test University' })
      .expect(200);
    const candidates = await call(
      'get',
      `/jobs/${jobId}/applications?skill=React&university=Test`,
      provider,
    ).expect(200);
    assert.equal(candidates.body.data.length, 1);
    await call('patch', `/applications/${applicationId}/notes`, student)
      .send({ personalNotes: 'Student secret' })
      .expect(200);
    await call('patch', `/applications/${applicationId}/provider-notes`, provider)
      .send({ providerNotes: 'Provider secret' })
      .expect(200);
    const studentView = await call(
      'get',
      `/applications/${applicationId}`,
      student,
    ).expect(200);
    const providerView = await call(
      'get',
      `/applications/${applicationId}`,
      provider,
    ).expect(200);
    assert.equal(studentView.body.data.providerNotes, undefined);
    assert.equal(providerView.body.data.personalNotes, undefined);
    await call('patch', `/applications/${applicationId}/status`, student)
      .send({ status: 'Offered' })
      .expect(403);
    await call('patch', `/applications/${applicationId}/status`, provider)
      .send({ status: 'Shortlisted' })
      .expect(200);
  });
  const interview = {
    application: '',
    interviewDate: tomorrow,
    interviewTime: '10:00',
    interviewType: 'Online',
    meetingLink: 'https://meet.example.com/interview',
  };
  await t.test(
    'schedule, conflict, reschedule and cancellation notifications',
    async () => {
      interview.application = applicationId;
      const result = await call('post', '/interviews', provider)
        .send(interview)
        .expect(201);
      interviewId = result.body.data.id;
      await call('post', '/interviews', provider).send(interview).expect(409);
      await call('put', `/interviews/${interviewId}`, provider)
        .send({ ...interview, interviewTime: '12:00' })
        .expect(200);
      await call('patch', `/interviews/${interviewId}/cancel`, outsider).expect(404);
      await call('patch', `/interviews/${interviewId}/cancel`, provider).expect(200);
      const notifications = await call('get', '/notifications', student).expect(200);
      for (const type of [
        'APPLICATION_SUBMITTED',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_RESCHEDULED',
        'INTERVIEW_CANCELLED',
      ])
        assert.ok(notifications.body.data.some((item) => item.type === type));
      await call(
        'patch',
        `/notifications/${notifications.body.data[0].id}/read`,
        outsider,
      ).expect(404);
      await call('patch', '/notifications/read-all', student).expect(200);
      assert.equal(
        (await call('get', '/notifications', student)).body.data.every(
          (item) => item.isRead,
        ),
        true,
      );
    },
  );
  await t.test('offers update chart-ready analytics and dashboards', async () => {
    await call('patch', `/applications/${applicationId}/status`, provider)
      .send({ status: 'Offered' })
      .expect(200);
    const studentStats = await call('get', '/students/analytics', student).expect(200);
    const providerStats = await call('get', '/providers/analytics', provider).expect(200);
    assert.equal(studentStats.body.data.offers, 1);
    assert.equal(providerStats.body.data.offersMade, 1);
    assert.equal(providerStats.body.data.applicantsByJob[0].count, 1);
    await call('get', '/students/dashboard', student).expect(200);
    await call('get', '/providers/dashboard', provider).expect(200);
    await call('get', '/interviews/my', student).expect(200);
  });
  await t.test(
    'withdrawal allows reapplication; closure blocks new applications',
    async () => {
      await call('patch', `/applications/${applicationId}/withdraw`, student).expect(200);
      await call('post', `/applications/${jobId}`, student).send({}).expect(201);
      await call('patch', `/jobs/${jobId}/close`, provider).expect(200);
      await call('post', `/applications/${jobId}`, student).send({}).expect(409);
      await call('delete', `/jobs/${jobId}`, provider).expect(200);
      await call('get', `/jobs/${jobId}`).expect(404);
      await call('get', `/applications/${applicationId}`, student).expect(200);
    },
  );
  await t.test('authentication limiter does not block session reads', async () => {
    env.mode = 'development';
    try {
      for (let index = 0; index < 31; index += 1) {
        await call('get', '/auth/me', provider).expect(200);
      }
      for (let index = 0; index < 30; index += 1) {
        await call('post', '/auth/login').send({}).expect(400);
      }
      await call('post', '/auth/login').send({}).expect(429);
      await call('get', '/auth/me', provider).expect(200);
    } finally {
      env.mode = 'test';
    }
  });
  await t.test('logout revokes existing tokens', async () => {
    await call('post', '/auth/logout', student).expect(200);
    await call('get', '/auth/me', student).expect(401);
  });
});
