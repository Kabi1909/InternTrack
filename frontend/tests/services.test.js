import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUser,
  normalizeJob,
  normalizeApplication,
  normalizeInterview,
  emptyWorkspace,
} from '../src/services/normalizers.js';
import { jobPayload } from '../src/services/jobService.js';
import { interviewPayload } from '../src/services/interviewService.js';
import { fetchAll } from '../src/services/serviceUtils.js';

test('empty workspaces contain no fabricated users or opportunities', () => {
  const workspace = emptyWorkspace();
  assert.deepEqual(workspace.jobs, []);
  assert.deepEqual(workspace.users, []);
  assert.deepEqual(workspace.saved, {});
});
test('API identity remains authoritative when profiles have their own IDs', () => {
  const user = normalizeUser(
    { id: 'user-id', role: 'provider', name: 'Provider' },
    { id: 'profile-id', skills: [] },
  );
  assert.equal(user.id, 'user-id');
  assert.equal(user.companyId, 'user-id');
});
test('job contracts map form fields without sending client ownership', () => {
  const job = normalizeJob({
    id: 'job-id',
    provider: 'provider-id',
    jobType: 'Internship',
    workMode: 'Remote',
    requiredSkills: ['React'],
    applicationDeadline: '2099-12-31T23:59:59Z',
    numberOfPositions: 2,
    status: 'Active',
  });
  const payload = jobPayload(job);
  assert.equal(payload.jobType, 'Internship');
  assert.equal(payload.numberOfPositions, 2);
  assert.equal(payload.provider, undefined);
  assert.deepEqual(payload.requiredSkills, ['React']);
});
test('applications preserve relation IDs, submitted CV and status history', () => {
  const application = normalizeApplication({
    id: 'application-id',
    student: { id: 'student-id' },
    job: { id: 'job-id' },
    cvUrl: '/api/uploads/file-id',
    statusHistory: [{ status: 'Applied', at: '2026-01-01T00:00:00Z' }],
  });
  assert.equal(application.userId, 'student-id');
  assert.equal(application.jobId, 'job-id');
  assert.equal(application.history[0].date, '2026-01-01T00:00:00Z');
  assert.equal(application.cvUrl, '/api/uploads/file-id');
});
test('interview date round-trips preserve the local time and cancellation state', () => {
  const payload = interviewPayload({
    applicationId: 'application-id',
    date: '2099-06-12',
    time: '14:30',
    type: 'Video call',
    link: 'https://meet.example.com/room',
  });
  const normalized = normalizeInterview({ ...payload, status: 'Cancelled' });
  assert.equal(normalized.date, '2099-06-12');
  assert.equal(normalized.time, '14:30');
  assert.equal(normalized.status, 'Cancelled');
});
test('paginated API loading includes records after the first page', async () => {
  const pages = [];
  const transport = {
    async get(endpoint, { params }) {
      pages.push(params.page);
      return { data: { data: [params.page], pagination: { pages: 3 } } };
    },
  };
  assert.deepEqual(await fetchAll(transport, '/records'), [1, 2, 3]);
  assert.deepEqual(pages, [1, 2, 3]);
});
