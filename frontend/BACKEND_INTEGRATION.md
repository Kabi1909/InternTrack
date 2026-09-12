# Future backend integration

No backend is implemented or started by this frontend.

## Service boundary

`src/services/api.js` exports an Axios instance with a 15-second timeout and a base URL from `VITE_API_BASE_URL`, falling back to `/api`. Copy `.env.example` to `.env` when configuring a future API. Changing the URL alone does not disable mock mode: replace the mock methods with endpoint requests as described below.

| Adapter                | Intended endpoints                                                                                    | Replace                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| authService.js         | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`        | Demo login and browser session identifiers                     |
| jobService.js          | `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PATCH /api/jobs/:id`, `DELETE /api/jobs/:id` | Local filtering and vacancy mutations                          |
| applicationService.js  | `GET /api/applications`, `POST /api/applications`, `PATCH /api/applications/:id`                      | Application submission, notes, status transitions, and history |
| interviewService.js    | `GET /api/interviews`, `POST /api/interviews`                                                         | Interview creation, conflict checks, and persistence           |
| notificationService.js | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`    | Notification loading and read state                            |
| profileService.js      | `GET /api/profile`, `PATCH /api/profile`, `GET /api/companies/:id`, `PATCH /api/companies/:id`        | Student and company profile persistence                        |

Suggested additional endpoints: saved jobs under `/api/users/me/saved-jobs`, follow-ups under `/api/followups`, and multipart uploads under `/api/uploads`.

For example, a job adapter can preserve its existing interface:

```js
import api from './api.js';

export const jobService = {
  async list() {
    const response = await api.get('/jobs');
    return response.data;
  },
};
```

## State and data loading

`DataContext` currently reads one browser-local demo snapshot and subscribes to `interntrack:change`. Replace this initial loading path with requests for the signed-in role and appropriate loading/error states. Refetch or update context after successful service calls. `BrowseJobs` currently uses `jobService.list()` for loading/error behavior and shared context for current data; migrate those together to avoid two sources of truth.

The current model uses stable IDs linking users, companies, jobs, applications, interviews, and notifications. Normalize backend MongoDB `_id` values to `id` in adapters, or migrate all consumers consistently. Keep applicant details scoped to application IDs.

## Authentication and authorization

Replace demo buttons and the universal demo password with the real login/register/session flow. `ProtectedRoute` controls frontend navigation only; every backend endpoint must enforce authenticated identity, ownership, and role permissions independently. Provider-only notes must be omitted from student API responses. Replace demo registration password behavior with server-side password hashing and account recovery.

Use your chosen secure session strategy. If the API uses cookies, configure credentials and CORS intentionally. Do not place secrets in Vite environment variables; they are included in browser bundles.

## Uploads

The demo stores small image/document data URLs in browser storage. Replace them with multipart uploads and server-issued file IDs or URLs. Store references on profiles and applications. Preserve the submitted CV reference on each application even when a user later changes their profile CV. Validate file type and size on the backend and control document access by ownership.

## Workflow rules

- Reject duplicate active applications per candidate and vacancy.
- Validate vacancy deadlines and allowed state transitions server-side.
- Retain application history when a vacancy is removed or archived.
- Enforce access to personal and provider-private notes separately.
- Use explicit timezones and server timestamps. The demo schedules in the viewer's local timezone and exports floating local times in `.ics` files.
- Replace exact-time demo conflict checking with duration-aware scheduling rules.
- Add pagination, search, and filters at the API level for larger datasets.
- Generate notifications and send any emails from the backend. The current app does not send email or create real video calls.
- Add a follow-up service adapter before moving the calendar's small local follow-up mutations to the backend.

## Hosting

Run `npm run build` and serve `frontend/dist`. React Router uses browser history, so the static host must rewrite non-asset routes to `index.html`. Configure this for the hosting provider you choose. A backend deployment is separate and outside this task.
