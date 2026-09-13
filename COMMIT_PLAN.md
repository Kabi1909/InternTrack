# Implementation commit guide

This implementation is organized into the 20 local commits below. They are not pushed automatically. Review the history, then use Sync Changes to push main to origin/main at https://github.com/Kabi1909/InternTrack.

These commits split an already integrated implementation into review groups. Some earlier groups reference modules added later in the series; run the documented checks against the completed series.

| #   | Commit message                                                  | Files |
| --- | --------------------------------------------------------------- | ----- |
| 1   | chore(backend): configure dependencies and environment          | 6     |
| 2   | feat(backend): initialize Express and MongoDB lifecycle         | 4     |
| 3   | feat(auth): add user profiles and bcrypt password hashing       | 4     |
| 4   | feat(auth): implement JWT registration login and logout         | 6     |
| 5   | feat(api): centralize validation authorization and errors       | 8     |
| 6   | feat(profiles): add student and company profile APIs            | 5     |
| 7   | feat(jobs): add owned vacancy CRUD and search                   | 4     |
| 8   | feat(saved-jobs): persist unique student bookmarks              | 3     |
| 9   | feat(applications): add submissions tracking and private notes  | 4     |
| 10  | feat(interviews): add scheduling rescheduling and cancellation  | 3     |
| 11  | feat(notifications): add recipient updates and reminder hooks   | 6     |
| 12  | feat(analytics): add role-scoped dashboard summaries            | 1     |
| 13  | feat(uploads): secure CV and image storage adapters             | 6     |
| 14  | test(backend): verify MongoDB workflows and security boundaries | 2     |
| 15  | feat(frontend): add API sessions and response adapters          | 9     |
| 16  | feat(frontend): load real workspaces and remove mock storage    | 10    |
| 17  | feat(frontend): connect jobs applications profiles and uploads  | 9     |
| 18  | feat(frontend): connect calendar interviews and analytics       | 9     |
| 19  | fix(frontend): remove demo content and verify API contracts     | 10    |
| 20  | docs: document full-stack setup API contracts and verification  | 9     |

Secrets, node_modules, build output, and uploaded documents are excluded by the repository ignore rules.
