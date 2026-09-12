# InternTrack

A responsive, frontend-only recruitment workspace for students, graduates, and internship/job providers. Built with React, Tailwind CSS, React Router, Axios, Recharts, Lucide React, and React Hot Toast.

The visual system uses warm ivory surfaces, forest-green actions, generous spacing, and reusable application components. All React components and application logic use readable, Prettier-formatted **`.js` files**, including JSX inside `.js`. Standard HTML, CSS, JSON, and Markdown files keep their conventional extensions.

## Run locally

Use Node.js 22 or a compatible maintained Node version.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

```bash
npm run build         # Production files in dist/
npm run preview       # Preview the production build
npm test              # Nine isolated workflow tests
npm run format        # Format source and documentation
npm run format:check  # Verify consistent formatting
```

No backend, database, API keys, or external accounts are needed. `npm ci` can replace `npm install` when using the committed lockfile.

## Demo accounts

Use the **Student demo** or **Provider demo** buttons on the login page for immediate access.

| Role     | Email                  | Demo password |
| -------- | ---------------------- | ------------- |
| Student  | alex@interntrack.demo  | Demo123!      |
| Provider | jamie@interntrack.demo | Demo123!      |

Registration creates a browser-local demo profile. Entered registration passwords are validated but intentionally never saved. A registered profile can return using its email and the universal demo password `Demo123!`. These are demonstration controls, not real authentication.

Saved jobs, applications, notes, company edits, uploaded documents, interviews, and read states persist in this browser. Remember-me uses localStorage; an unchecked remember-me option uses sessionStorage for the session identifier. Uploaded demo files remain local, with a 2 MB document limit and 1 MB image limit. Browser storage quota failures show a toast without discarding the previously saved state.

To start fresh, clear site data for the local preview in your browser. This removes local demo changes and restores the seeded dataset on the next visit.

## Pages and routes

| Area     | Routes                                                                                                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public   | `/`, `/about`, `/jobs`, `/jobs/:id`, `/login`, `/register`                                                                                                                                                                                            |
| Student  | `/student/dashboard`, `/student/profile`, `/student/applications`, `/student/applications/:id`, `/student/saved-jobs`, `/student/interviews`, `/student/calendar`, `/student/notifications`                                                           |
| Provider | `/provider/dashboard`, `/provider/profile`, `/provider/jobs`, `/provider/jobs/new`, `/provider/jobs/:id/edit`, `/provider/jobs/:id/applicants`, `/provider/applicants`, `/provider/applicants/:id`, `/provider/interviews`, `/provider/notifications` |

These are 24 route patterns, plus workspace index redirects and a not-found page. Provider candidate detail IDs refer to application IDs, so a candidate can have a separate hiring pipeline for each vacancy.

### Public experience

- Custom CSS/React hero illustration, search, categories, featured internships, latest listings, benefits, and student/employer workflow tabs.
- URL-backed search and filters for location, work arrangement, type, category, experience, and skills; sorting, pagination, skeletons, retry UI, and empty states.
- Job details, company information, salary, deadlines, CV selection/upload, cover letters, and duplicate-application prevention.
- Validated registration, password visibility and strength feedback, loading states, demo login, and a clear mock password-reset explanation.

### Student workspace

- Six statistics and application analytics computed from the same records used by the lists.
- Editable profile, image and CV uploads, removable skills, professional links, and profile completion.
- Application filters, status badges, timeline, submitted CV preview, cover letter, private personal notes, history, and withdrawal confirmation.
- Saved jobs, upcoming/past interviews, calendar-file downloads, monthly calendar, mobile event agenda, and follow-up reminders.
- Read/unread notifications and mark-all-as-read.

### Provider workspace

- Recruitment analytics, vacancies, candidate activity, and upcoming interviews.
- Editable company profile and logo.
- Vacancy create/edit/publish/draft/close/delete, validation, skill tags, applicant counts, and confirmations.
- Candidate filtering, CV preview, application history, private hiring notes, shortlist/reject/status actions, and interview scheduling.
- Scheduling validates future times and prevents exact-time conflicts for the candidate or company. Scheduling creates a demo notification; it does not create a real meeting.
- Deleted vacancies disappear from management and discovery while their records remain internally available to preserve submitted applications.

## Reusable components

`components/common/UI.js` contains Button, ButtonLink, Input, Select, Textarea, Card, Badge, Avatar, CompanyLogo, Dropdown, Modal, ConfirmDialog, EmptyState, LoadingSpinner, Skeleton, Pagination, SearchBar, PageHeader, SectionHeader, and SkillTags.

Feature components include JobCard, FilterPanel, JobForm, ApplicationStatusBadge, ApplicationTimeline, ApplicationModal, CVPreview, InterviewModal, StatCard, Analytics, DashboardOverview, FileUpload, and NotificationItem. PublicLayout and shared DashboardLayout power distinct student and provider layout wrappers.

Modal and mobile-sidebar keyboard handling includes focus management, Escape closing, and focus trapping. Other accessibility details include skip links, labeled controls, native semantic forms, visible focus styles, reduced-motion support, and text labels alongside status colors.

## Project organization

```text
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── notifications/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   │   ├── public/
│   │   ├── student/
│   │   └── provider/
│   ├── services/
│   ├── utils/
│   ├── App.js
│   ├── main.js
│   └── styles.css
├── tests/services.test.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── prettier.config.js
```

The original frontend directory had no working application. The implementation adds the application, configuration, lockfile, and documentation without replacing existing working code. See [FILES.md](FILES.md) for the complete source inventory.

## Packages

Runtime: `react`, `react-dom`, `react-router-dom`, `axios`, `recharts`, `lucide-react`, and `react-hot-toast`.

Development: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, and `prettier`. Tests use Node's native test runner. The Vite transform accepts JSX in `.js` files.

## Integration and verification

- [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) describes service adapters, intended endpoints, authentication replacement, uploads, and deployment rewrites.
- [VERIFICATION.md](VERIFICATION.md) records the automated tests and browser checks.

This implementation contains no backend. Listings and company references are illustrative portfolio data, not actual vacancies or endorsements. Seeded CVs are clearly labeled text previews; real uploaded demo documents are downloadable locally. Meeting links are placeholders. Matching uses simple skill overlap and is not an AI ranking system.

## Implementation history

The implementation is organized into exactly 20 commits after the pre-existing repository history:

1. Scaffold React frontend with Vite and Tailwind.
2. Add realistic recruitment demo datasets.
3. Add persistent mock services and role authentication.
4. Build accessible reusable UI and opportunity cards.
5. Establish the responsive forest and ivory design system.
6. Add public and role-specific navigation layouts.
7. Create the career-discovery homepage and About page.
8. Implement validated registration and demo login.
9. Add searchable opportunities, filters, and pagination.
10. Add opportunity details and CV application submission.
11. Build student and employer dashboards with analytics.
12. Add editable student and company profiles.
13. Add application timelines, notes, and saved jobs.
14. Implement interviews, scheduling, and career calendar.
15. Add employer vacancy management and job editor.
16. Implement candidate screening and pipeline controls.
17. Add role-scoped notifications and unread management.
18. Connect protected routing and lazy-loaded frontend shell.
19. Verify workflows and harden responsive accessibility.
20. Document setup, source inventory, verification, and backend integration.
