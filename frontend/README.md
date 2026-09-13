# InternTrack frontend

React, React Router, Tailwind CSS, Axios, Recharts, Lucide React, and React Hot Toast. React source uses `.js` files with JSX; Vite handles the transform. Existing reusable layouts, forms, cards, tables, charts, dialogs and responsive navigation are preserved.

## Run

```sh
npm install
npm run dev
```

Start the backend on port 5000 first. Open http://localhost:5173. The development proxy forwards `/api` to the backend. Register real student/provider accounts; no shared passwords or demo accounts exist.

For a separate production API set `VITE_API_BASE_URL=https://your-api.example.com/api` before building. Set CLIENT_URL on the API to the frontend origin. Alternatively, reverse proxy `/api` from the frontend host. Configure the web host to serve index.html for React Router routes.

```sh
npm test
npm run build
npm run format:check
```

Business records come from MongoDB through API services. Browser storage contains only the JWT: localStorage for Remember me or sessionStorage otherwise. Legacy demo storage is cleared on startup. Files are uploaded using multipart form requests and CV downloads use authenticated requests.

Source organization: components, layouts, pages/public, pages/student, pages/provider, context, hooks, data/options.js (static UI choices only), services, utils. All API field translations live in services/normalizers.js; UI components do not depend on Mongoose field names.

See [integration details](BACKEND_INTEGRATION.md), [file map](FILES.md), and [verification](VERIFICATION.md).
