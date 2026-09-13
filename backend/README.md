# InternTrack backend

Express 5 REST API with MongoDB/Mongoose, bcrypt passwords, JWT authentication, separate controllers/services, and role-scoped resources.

## Setup

```sh
cd backend
npm install
```

Copy `.env.example` to `.env`, configure it, then run `npm run dev`. Use `npm start` for the production process. `GET /api/health` returns 200 only when MongoDB is connected. The server refuses to start without MongoDB and a sufficiently long JWT secret.

| Variable                | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `PORT`                  | API port; default 5000                              |
| `NODE_ENV`              | development, test, or production                    |
| `MONGO_URI`             | MongoDB URI including database name                 |
| `JWT_SECRET`            | Random secret of at least 32 bytes; never commit it |
| `JWT_EXPIRES_IN`        | Token lifetime, default 7d                          |
| `CLIENT_URL`            | Comma-separated allowed frontend origins            |
| `UPLOAD_DRIVER`         | local or cloudinary; default local                  |
| `CLOUDINARY_CLOUD_NAME` | Required when using Cloudinary                      |
| `CLOUDINARY_API_KEY`    | Required when using Cloudinary                      |
| `CLOUDINARY_API_SECRET` | Required when using Cloudinary                      |
| `MONGO_TEST_URI`        | Optional isolated-test MongoDB server URI           |

Generate a secret locally with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and put it only in `.env`. Use an Atlas connection string or a local MongoDB URI. Configure the Atlas network allowlist and database user separately if using Atlas.

## Architecture and relationships

All `student`, `provider`, `owner`, and `recipient` references point to **User**, consistently. StudentProfile.user and ProviderProfile.user are unique references to User. Job.provider identifies the owning User. Application connects student User, provider User, and Job. Interview references Application, Job, and both users. This avoids mixing profile IDs with authenticated user IDs.

Models: User, StudentProfile, ProviderProfile, Job, Application, SavedJob, Interview, Notification, Upload, and Followup.

Controllers: auth, user, student, provider, job, application, savedJob, interview, notification, upload.

Middleware: authentication, role authorization, centralized errors, request validation/unsafe-key rejection, and Multer uploads. Express, CORS, Helmet, Morgan, body limits, and authentication rate limiting are configured in app.js. server.js handles startup and graceful shutdown.

Services: application presentation, job/company presentation, analytics, upload storage, notifications, reminder generation, and an explicit email transport stub.

## Behavior

- Registration creates the appropriate role profile. User passwords use bcrypt with cost 12 and are excluded from JSON. Roles are read from MongoDB after token verification, never trusted from a request body.
- JWTs validate algorithm, issuer, audience, expiry, and token version. Logout revokes all tokens for that user. No refresh tokens are implemented.
- Providers manage only their own jobs, applications, and interviews. Students see only their own private records. Each role's notes are removed from the other role's responses.
- Job deletion is soft deletion, preserving submitted application history. Public browsing excludes drafts, closed, expired, and deleted jobs. Existing closed/expired job detail pages remain available; deleted and unauthorized draft details return 404.
- A partial unique index prevents duplicate active applications. Withdrawal releases that index and allows reapplication while the job is open. Saved-job pairs are unique and saves are idempotent.
- Interviews use a timezone-aware startsAt timestamp. API clients should send it with an offset or Z; date/time without startsAt are interpreted as UTC. Overlap checks consider both participant and provider, including duration. Date-only job deadlines expire at the end of that UTC day.
- Notifications are persisted for submissions, new applicants, status changes, scheduling, rescheduling, and cancellation. Reminder generation is an exported, deduplicated service for a future scheduler; it does not run automatically.

## Uploads

Send one file in multipart field `file`. CVs must be PDF, at most 5 MB. Images must be JPEG, PNG, or WebP, at most 2 MB. MIME type and signature are checked. Local storage uses generated filenames outside the public static surface.

URLs use `/api/uploads/:id`. CV downloads require a Bearer token and ownership or a corresponding provider application. Image URLs are public. Original storage paths are never returned. Old CVs remain accessible for applications that reference them even after a new profile CV is uploaded.

For Cloudinary, set UPLOAD_DRIVER=cloudinary and all three credentials. CVs are uploaded as authenticated raw resources and downloads use short-lived signed URLs; images use secure delivery URLs. Cloudinary delivery has not been exercised without credentials.

## Tests

`npm test` runs the API workflow against MongoDB, covering valid flows, duplicate constraints, invalid input, role/ownership denials, CV privacy, note privacy, notifications, analytics, withdrawal/reapplication, and token revocation. Its database name is generated per run, checked before cleanup, and never uses the application's database.

`npm run check` checks all backend JavaScript syntax. `npm run format:check` verifies readable formatting.

## Production follow-ups

Configure HTTPS, production origins, database backups, secrets management, a production process manager and a shared rate-limit store for multiple instances. Add email delivery and password recovery if required. Multi-document updates currently use sequential operations/compensation and do not guarantee atomicity across a process crash. A replica-set transaction/outbox design and a database-backed scheduling lock would strengthen notification delivery and concurrent interview booking. Add antivirus scanning and orphan upload retention rules before accepting untrusted uploads at scale. The browser currently keeps Bearer tokens in local/session storage; a same-site HttpOnly-cookie session design is a future security improvement requiring coordinated frontend changes.
