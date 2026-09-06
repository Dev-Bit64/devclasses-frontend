# Dev Classes — Web Portal (Frontend)

Admin and college web portal for **Dev Classes Institute**. A single-page React
application that serves two product areas from one codebase:

- **School** (existing product) — user management, subjects, question bank, exams/tests,
  results and analytics, dashboard.
- **College (B.Com)** — curriculum builder, video/notes content, student management,
  Razorpay orders, and device-unlock requests. These screens talk to the backend's
  `/api/v2` namespace, which is backed by a separate database.

## Tech stack

| Area | Choice |
| --- | --- |
| Build tool | Vite 6 (`@vitejs/plugin-react`) |
| Language | TypeScript 5 (strict, project references) |
| UI | React 18, Tailwind CSS 3, Radix UI primitives, `lucide-react` icons |
| State | Redux Toolkit + React Redux, `@tanstack/react-query` for server cache |
| Routing | React Router v6 (`createBrowserRouter`, lazy routes, shared error boundary) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| Animation | Framer Motion |
| Notifications | `react-hot-toast` |

## Getting started

```bash
npm install
cp .env .env.local   # or create .env with the keys below
npm run dev          # Vite dev server (default http://localhost:5173)
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `npm start` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |

After `npm run build`, `rollup-plugin-visualizer` writes and opens
`bundle-report.html` at the repo root.

## Environment variables

`.env` is git-ignored. Required keys:

| Key | Purpose |
| --- | --- |
| `VITE_REACT_APP_API_ENDPOINT` | Base URL of the Dev Classes API (e.g. `http://localhost:3000`, `https://api.devclasses.in`) |
| `VITE_ENCRYPTION_KEY` | 64-character hex AES-256 key used to encrypt request payloads. **Must match** the backend's `ENCRYPTION_KEY` and the mobile app's `EXPO_PUBLIC_ENCRYPTION_KEY`. |

## Payload encryption

Request bodies are encrypted client-side with **AES-256-GCM** in
[`src/utils/cryptoHelper.ts`](src/utils/cryptoHelper.ts) and sent with an
`x-payload-encrypted` marker; the backend's decryption middleware unwraps them.
All three clients (this portal, the mobile app, the backend) share one key.

## Project structure

```
src/
  main.tsx, App.tsx     App bootstrap, RouterProvider, global Toaster
  routes/               Route table, lazy pages, AdminRoute guard, error boundary
  layouts/              GlobalLayout and app shell
  pages/                One folder per screen:
                          School  — Users, Subjects, Questions, Test, QuizDetails,
                                    Results, YourResult, EditProfile, Login, Register,
                                    ResetPassword, LandingPage, NotFound
                          College — CollegeCurriculum, CollegeContent, CollegeOrders,
                                    CollegeStudents, CollegeDeviceRequests
  components/           Feature and shared components (ui/, layout/, college/, exam/,
                          dashboard/, auth/, landing/, SEO/, common/, Global/ ...)
  redux/
    slice/              Redux Toolkit slices (auth, dashboard, exam, question, subject,
                          user, college* )
    action/             Async thunks / API actions per slice
  hooks/  helpers/  utils/  interfaces/  constants/  styles/  lib/
```

Route guarding via `AdminRoute` is **navigation UX only** — the API authorises every
call itself.

## Responsiveness

The portal must be fully responsive, including a working phone layout. Notably, the
DataTable's `expandedRowRender` is dropped below the `md` breakpoint, so any data shown
only in an expanded row must have a mobile-visible fallback. Always build and check the
phone layout before considering a screen done.

## Deployment

`npm run build` produces a static bundle in `dist/` (SPA — configure the host to
fall back to `index.html`). Set the production `VITE_*` values at build time.
