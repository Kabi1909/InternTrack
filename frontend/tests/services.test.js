import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initialData } from '../src/data/mockData.js';
import { readStore, writeStore } from '../src/services/mockStore.js';
import { applicationService } from '../src/services/applicationService.js';
import { authService } from '../src/services/authService.js';
import { interviewService } from '../src/services/interviewService.js';
import { jobService } from '../src/services/jobService.js';
import { notificationService } from '../src/services/notificationService.js';
import { profileService } from '../src/services/profileService.js';

// An isolated browser-storage adapter: tests never touch a user's demo workspace.
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();

beforeEach(() => writeStore(structuredClone(initialData)));

const futureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 20);
  return date.toISOString().slice(0, 10);
};

const submission = {
  userId: 'u1',
  jobId: 'j8',
  cv: 'Test_Resume.pdf',
  coverLetter:
    'I would love to contribute to the team and learn from experienced engineers.',
};

test('application submission updates both roles and prevents duplicates', async () => {
  const before = readStore().notifications.length;
  const application = await applicationService.apply(submission);
  assert.equal(application.status, 'Applied');
  assert.equal(readStore().notifications.length, before + 2);
  assert.ok(
    readStore().notifications.some(
      (item) => item.userId === 'u2' && item.type === 'New applicant received',
    ),
  );
  await assert.rejects(applicationService.apply(submission), /already applied/);
});

test('withdrawal preserves history and permits a fresh application', async () => {
  const first = await applicationService.apply(submission);
  await applicationService.update(first.id, { status: 'Withdrawn' });
  const second = await applicationService.apply(submission);
  assert.notEqual(first.id, second.id);
  assert.equal(
    readStore()
      .applications.find((item) => item.id === first.id)
      .history.at(-1).status,
    'Withdrawn',
  );
  await assert.rejects(
    applicationService.update(first.id, { status: 'Offered' }),
    /withdrawn/,
  );
});

test('closed and deleted vacancies reject new applications while preserving existing records', async () => {
  await jobService.close('j8');
  await assert.rejects(applicationService.apply(submission), /no longer accepting/);
  const before = readStore().applications.filter((item) => item.jobId === 'j1').length;
  await jobService.remove('j1');
  assert.equal(readStore().jobs.find((job) => job.id === 'j1').status, 'Deleted');
  assert.equal(
    readStore().applications.filter((item) => item.jobId === 'j1').length,
    before,
  );
  assert.ok(!(await jobService.list()).some((job) => job.id === 'j1'));
});

test('interview scheduling updates the pipeline and rejects scheduling conflicts', async () => {
  const values = {
    applicationId: 'a7',
    date: futureDate(),
    time: '11:00',
    type: 'Video call',
    link: 'https://meet.google.com',
  };
  const interview = await interviewService.save(values);
  assert.equal(interview.userId, 'u3');
  assert.equal(
    readStore().applications.find((item) => item.id === 'a7').status,
    'Interview Scheduled',
  );
  assert.ok(
    readStore().notifications.some(
      (item) => item.userId === 'u3' && item.type === 'Interview scheduled',
    ),
  );
  await assert.rejects(
    interviewService.save({ ...values, applicationId: 'a8' }),
    /already has an interview/,
  );
  await assert.rejects(
    interviewService.save({ ...values, date: '2020-01-01' }),
    /future/,
  );
});

test('marking all notifications read stays within the current account', async () => {
  await notificationService.markAll('u1');
  assert.ok(
    readStore()
      .notifications.filter((item) => item.userId === 'u1')
      .every((item) => item.read),
  );
  assert.ok(readStore().notifications.some((item) => item.userId === 'u2' && !item.read));
});

test('profile edits preserve identity and prevent duplicate account emails', async () => {
  await profileService.updateUser('u1', {
    name: 'Alex Updated',
    role: 'provider',
    id: 'replacement',
  });
  const user = readStore().users.find((item) => item.id === 'u1');
  assert.equal(user.name, 'Alex Updated');
  assert.equal(user.role, 'student');
  await assert.rejects(
    profileService.updateUser('u1', { email: 'jamie@interntrack.demo' }),
    /already belongs/,
  );
});

test('provider registration creates a company and never persists the entered password', async () => {
  const user = await authService.register({
    name: 'Test Recruiter',
    email: 'test@interntrack.demo',
    role: 'provider',
    companyName: 'Test Studio',
    industry: 'Software',
    password: 'Example123!',
    confirmPassword: 'Example123!',
  });
  assert.ok(readStore().companies.some((company) => company.id === user.companyId));
  assert.equal(user.password, undefined);
  assert.equal(user.confirmPassword, undefined);
  assert.equal(
    (await authService.login({ email: user.email, password: 'Demo123!' })).id,
    user.id,
  );
});

test('storage failures leave the last successfully saved state intact', async () => {
  const previous = structuredClone(readStore());
  const setItem = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error('QuotaExceeded');
  };
  try {
    await assert.rejects(jobService.toggleSaved('u1', 'j3'), /could not be saved/);
    assert.deepEqual(readStore(), previous);
  } finally {
    localStorage.setItem = setItem;
  }
});

test('saved jobs toggle without duplicates and persist to browser storage', async () => {
  await jobService.toggleSaved('u1', 'j3');
  assert.ok(readStore().saved.u1.includes('j3'));
  await jobService.toggleSaved('u1', 'j3');
  assert.ok(!readStore().saved.u1.includes('j3'));
  assert.deepEqual(
    JSON.parse(localStorage.getItem('interntrack.data.v1')).saved,
    readStore().saved,
  );
});
