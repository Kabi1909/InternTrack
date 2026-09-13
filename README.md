# InternTrack

A MERN application for students and job providers. The React frontend connects to the Express API and MongoDB. There are no demo accounts, seeded listings, or browser-stored business records.

## Run locally

Requirements: Node.js 22 or newer and a running MongoDB instance.

1. Install packages with `npm install --prefix backend` and `npm install --prefix frontend`.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and a random `JWT_SECRET` of at least 32 bytes.
3. Start the API: `npm run dev --prefix backend`.
4. In another terminal start the frontend: `npm run dev --prefix frontend`.
5. Open http://localhost:5173. Register a provider to publish opportunities and a student to apply.

The frontend development server proxies `/api` to port 5000. No seed runs automatically. The local `.env` and uploaded files are ignored by Git.

## Checks

```sh
npm run check --prefix backend
npm test --prefix backend
npm test --prefix frontend
npm run build --prefix frontend
npm run format:check --prefix backend
npm run format:check --prefix frontend
```

Backend tests use a unique temporary `interntrack_test_*` database and remove only their own records and files. Set `MONGO_TEST_URI` when the test MongoDB host differs from localhost.

## Documentation

- [Backend setup and architecture](backend/README.md)
- [API reference](backend/API.md)
- [Frontend setup](frontend/README.md)
- [Integration contract](frontend/BACKEND_INTEGRATION.md)
- [Verification report](VERIFICATION.md)
- [20 implementation commit groups](COMMIT_PLAN.md)

This implementation is organized into 20 local commits on main. Review the history, then use Sync Changes to push them to origin/main.
