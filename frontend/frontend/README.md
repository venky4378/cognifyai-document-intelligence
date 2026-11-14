# CognifyAI frontend

The CognifyAI web app lets users create an account, upload and manage PDF documents, and ask questions against their document library.

Authentication has separate `/login` and `/register` pages. The root path redirects to the workspace when signed in, or to the sign-in page otherwise.

## Requirements

- Node.js supported by the installed Vite version
- The Spring Boot API running on `http://localhost:8181` (the backend's configured port)

## Local development

From this directory:

```sh
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8181`. To use another local backend, set `VITE_DEV_API_TARGET` in a `.env.local` file. The API base URL defaults to `/api`; set `VITE_API_BASE_URL` when the API is exposed at a different URL.

## Production build

```sh
npm run lint
npm run build
npm run preview
```

Deploy the generated `dist` directory to a static web host and configure it to serve `index.html` for app routes. The API must be reachable at the configured `VITE_API_BASE_URL`. When the frontend and API are on different origins, configure the backend to allow the frontend origin and the required authorization/content headers. Do not put credentials or secret API keys in frontend environment variables; Vite exposes `VITE_*` values to the browser.
