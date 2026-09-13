# API reference

Base URL: `http://localhost:5000/api`.

Protected requests use `Authorization: Bearer <JWT>`. Responses use `{ success: true, data, message? }`. List endpoints include `pagination: { page, limit, total, pages }`. Errors use `{ success: false, message, errors?: [{ field, message }] }`. Typical statuses: 200, 201, 400, 401, 403, 404, 409, 413, 429, 500.

## Authentication and identity

| Method    | Path           | Access                                                                                                     |
| --------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| POST      | /auth/register | Public: name, email, password, role (student/provider); optional university/degree or companyName/industry |
| POST      | /auth/login    | Public: email, password                                                                                    |
| GET       | /auth/me       | Authenticated; safe user and profile                                                                       |
| POST      | /auth/logout   | Authenticated; revokes all user tokens                                                                     |
| GET / PUT | /users/me      | Authenticated; update name/email only                                                                      |

Registration/login return `{ token, user, profile }`. Registration passwords must have at least 8 characters and at most 72 UTF-8 bytes. Login/register are limited to 30 requests per IP per 15 minutes. Session lookup is not included in this limit.

## Profiles and dashboards

| Method     | Path                      | Access                        |
| ---------- | ------------------------- | ----------------------------- |
| GET / PUT  | /students/profile         | Student                       |
| POST       | /students/profile/cv      | Student; multipart file       |
| POST       | /students/profile/picture | Student; multipart file       |
| GET        | /students/analytics       | Student                       |
| GET        | /students/dashboard       | Student                       |
| GET / POST | /students/followups       | Student; POST title/date      |
| DELETE     | /students/followups/:id   | Owner student                 |
| GET / PUT  | /providers/profile        | Provider                      |
| POST       | /providers/profile/logo   | Provider; multipart file      |
| GET        | /providers/analytics      | Provider                      |
| GET        | /providers/dashboard      | Provider                      |
| GET        | /uploads/:id              | Images public; CVs restricted |

Student fields: phone, university, degree, graduationYear, skills[], preferredJobRoles[], preferredWorkLocation, linkedinUrl, githubUrl, bio. CV and image fields are updated through upload endpoints only.

Provider fields: companyName, companyDescription, website, industry, location, contactEmail. Company name changes update existing jobs.

## Opportunities

| Method | Path            | Access                                                      |
| ------ | --------------- | ----------------------------------------------------------- |
| GET    | /jobs           | Public active jobs; provider `mine=true` lists own statuses |
| GET    | /jobs/:id       | Public except unauthorized drafts/deleted jobs              |
| POST   | /jobs           | Provider                                                    |
| PUT    | /jobs/:id       | Owner provider; full editable job form                      |
| PATCH  | /jobs/:id/close | Owner provider                                              |
| DELETE | /jobs/:id       | Owner provider; soft deletion                               |

Filters: search, location, jobType, workMode, skills (comma separated; all required), category, experienceRequirements, status, mine, page, limit. Search matches title/company/location/skills/category. Sort: latest, oldest, deadline, title. Default page 1, limit 10, maximum limit 100. Public status is restricted to Active. Providers use mine=true to filter their other statuses.

Example payload:

```json
{
  "title": "Frontend Developer Intern",
  "description": "Build accessible, responsive interfaces with our product team.",
  "responsibilities": "Implement UI components\nReview accessibility",
  "requiredSkills": ["React", "JavaScript"],
  "qualifications": "Working toward a relevant degree",
  "jobType": "Internship",
  "workMode": "Hybrid",
  "location": "Colombo",
  "salaryText": "Paid internship",
  "applicationDeadline": "2099-12-31",
  "numberOfPositions": 2,
  "experienceRequirements": "Entry level",
  "category": "Software Development",
  "status": "Active"
}
```

Company/provider are derived from the authenticated company profile. Optional salaryMin and salaryMax must be nonnegative; salaryMax cannot be below salaryMin.

## Saved jobs and applications

| Method        | Path                             | Access                                                                    |
| ------------- | -------------------------------- | ------------------------------------------------------------------------- |
| GET           | /saved-jobs                      | Student                                                                   |
| POST / DELETE | /saved-jobs/:jobId               | Student                                                                   |
| POST          | /applications/:jobId             | Student; coverLetter optional, cvUpload optional (defaults to profile CV) |
| GET           | /applications/my                 | Student                                                                   |
| GET           | /applications/provider           | Provider                                                                  |
| GET           | /jobs/:jobId/applications        | Owner provider                                                            |
| GET           | /applications/:id                | Owner student or provider                                                 |
| PATCH         | /applications/:id/withdraw       | Owner student                                                             |
| PATCH         | /applications/:id/notes          | Owner student; personalNotes                                              |
| PATCH         | /applications/:id/status         | Owner provider; status                                                    |
| PATCH         | /applications/:id/provider-notes | Owner provider; providerNotes                                             |

Application filters: status, company, from (ISO date), page, limit. Providers additionally use skill, university and search (candidate name).

Statuses: Applied, Under Review, Shortlisted, Interview Scheduled, Offered, Rejected, Withdrawn. Providers may set Under Review, Shortlisted, Interview Scheduled, Offered, Rejected; Interview Scheduled requires an existing upcoming interview. Withdrawal is student-only. Status changes append statusHistory. There is no arbitrary status-writing student endpoint.

## Interviews

| Method | Path                   | Access         |
| ------ | ---------------------- | -------------- |
| POST   | /interviews            | Provider       |
| PUT    | /interviews/:id        | Owner provider |
| PATCH  | /interviews/:id/cancel | Owner provider |
| GET    | /interviews/provider   | Provider       |
| GET    | /interviews/my         | Student        |

```json
{
  "application": "<application ID>",
  "interviewDate": "2099-12-01",
  "interviewTime": "10:00",
  "startsAt": "2099-12-01T10:00:00+05:30",
  "durationMinutes": 60,
  "interviewType": "Online",
  "meetingLink": "https://meet.example.com/your-room",
  "notes": "Please prepare a short walkthrough of a project."
}
```

Types: Online, In-person, Phone. Online requires meetingLink. Other types require physicalLocation (address or phone). Updates can reschedule or mark a past interview Completed. Use the cancellation endpoint to cancel without resending a form. External meeting rooms are not created automatically.

## Notifications

| Method | Path                    | Access                                               |
| ------ | ----------------------- | ---------------------------------------------------- |
| GET    | /notifications          | Authenticated; newest first, pagination, unreadCount |
| PATCH  | /notifications/read-all | Authenticated; own only                              |
| PATCH  | /notifications/:id/read | Recipient only                                       |
| DELETE | /notifications/:id      | Recipient only                                       |

Types: APPLICATION_SUBMITTED, NEW_APPLICATION, APPLICATION_STATUS_CHANGED, INTERVIEW_SCHEDULED, INTERVIEW_RESCHEDULED, INTERVIEW_CANCELLED, DEADLINE_REMINDER, JOB_CLOSING_SOON.

## Analytics

Student response: totalApplications, underReview, shortlisted, interviews, offers, rejections, savedJobs, applicationsByStatus[{status,count}], applicationsOverTime[{date,count}].

Provider response: totalVacancies, activeVacancies, closedVacancies, totalApplicants, shortlistedCandidates, interviewsScheduled, offersMade, applicationsByStatus[{status,count}], applicantsByJob[{jobId,title,count}]. Candidate counts refer to applications, so distinct applications by one person are counted individually.

Dashboard endpoints add upcoming interviews, recent activity, opportunities/deadlines or vacancies, and provider notifications.
