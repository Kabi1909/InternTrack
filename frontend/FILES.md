# Frontend source map

- `src/App.js`: public, student, and provider routes with lazy page imports.
- `src/main.js`: router, authentication, data provider, and toast setup.
- `src/components/common`: reusable controls, dialogs, cards, badges, avatars, loading/empty states, pagination, error boundary, and route guards.
- `src/components/jobs`: opportunity cards, filters, and create/edit form.
- `src/components/applications`: application form, status badges, timeline, authenticated CV download, interview form.
- `src/components/dashboard`: statistic cards and API-backed analytics charts.
- `src/components/profile`: validated file selection.
- `src/components/notifications`: notification item.
- `src/layouts`: public layout and separate student/provider dashboard shells.
- `src/pages/public`: Home, About, AuthPage, BrowseJobs, JobDetails.
- `src/pages/student`: Dashboard, Profile, Applications, ApplicationDetails, SavedJobs, Interviews, Calendar, Notifications.
- `src/pages/provider`: Dashboard, Profile, Jobs, JobEditor, Applicants, CandidateDetails.
- `src/context`: AuthContext and DataContext.
- `src/services`: Axios, session, response normalizers, workspace loading, refresh helpers, authentication, jobs, applications, interviews, notifications, profiles, uploads, and follow-ups.
- `src/data/options.js`: category/status vocabulary only.
- `src/utils/helpers.js`: display dates, initials, safe URLs, and calendar exports.
- `tests/services.test.js`: API mapping, empty-state, time conversion and pagination tests.
- `src/styles.css`, `vite.config.js`: responsive styles, Tailwind, JSX-in-JS transform, API development proxy.

The obsolete mockData.js and mockStore.js have been removed.
