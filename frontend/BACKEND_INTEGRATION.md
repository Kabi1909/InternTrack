# Frontend/API integration

`services/api.js` configures Axios, the API base URL, Bearer authentication, error messages, and session expiry handling. `AuthContext` calls register/login/me/logout and retains the server-assigned identity and role. `DataContext` loads the real workspace and displays loading, retry and empty states.

`workspaceService.js` fetches public opportunities and role-authorized applications, interviews, notifications, analytics, profile, and saved jobs/followups or own vacancies. It follows pagination beyond the first page. Populated application/job relationships supply candidate and archived-job context without exposing a global user directory.

`normalizers.js` translates API fields into the existing presentation model. User IDs remain authoritative; profile IDs never replace them. Upload URLs resolve against the configured API. UTC startsAt timestamps are displayed in the browser's local time.

Mutation services call the appropriate API and refresh auth/workspace state after success. Components never write business records to localStorage. `uploadService.js` converts the selected in-memory file into multipart data and downloads private CVs with the token. Static categories/status choices remain in data/options.js; they are not sample records.

| Frontend action                | API                                                                      |
| ------------------------------ | ------------------------------------------------------------------------ |
| Sign in / register / restore   | /auth/login, /auth/register, /auth/me                                    |
| Public jobs / own jobs         | /jobs, /jobs?mine=true                                                   |
| Job editor / close / remove    | /jobs/:id, /jobs/:id/close                                               |
| Saved jobs                     | /saved-jobs/:jobId                                                       |
| Apply / tracking / notes       | /applications/*                                                          |
| Student/company profile        | /users/me, /students/profile, /providers/profile                         |
| Profile CV / picture / logo    | /students/profile/cv, /students/profile/picture, /providers/profile/logo |
| Schedule / reschedule / cancel | /interviews, /interviews/:id, /interviews/:id/cancel                     |
| Notifications                  | /notifications/*                                                         |
| Analytics                      | /students/analytics, /providers/analytics                                |
| Calendar follow-ups            | /students/followups/*                                                    |

Current scaling tradeoff: the workspace adapter loads all authorized pages to preserve existing client-side filters and tables. For large datasets, move each page to server-side pagination and filtered queries. The backend already supports these query parameters. Updates from another session appear after Refresh workspace or reloading; real-time delivery is not implemented. Password recovery and outbound email are not implemented.
