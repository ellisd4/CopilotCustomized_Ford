<!--
Project-specific Copilot instructions for OctoCAT Supply (CopilotCustomized_Ford)
Purpose: Give AI coding agents the minimal, high-value knowledge they need to be productive.
-->

# Copilot Instructions — OctoCAT Supply (project-wide)

Overview
- This repo is a TypeScript demo with two main services: an Express API under `api/` and a React + Vite frontend under `frontend/`.
- The frontend calls the backend REST API; the API exposes endpoints under `/api/*` and serves OpenAPI docs at `/api-docs`.

Goals for AI agents
- Be able to run, test, and change the API and frontend locally.
- Follow existing patterns when adding routes, tests, or UI components.
- Prefer minimal, focused changes; keep PRs small and well-scoped.

Quick start commands (dev + build)
- Install and build all workspaces:

  npm install
  npm run build

- Run the monorepo in development from repository root:

  npm run dev

- API dev: the API listens on `process.env.PORT || 3000`. Swagger UI is available at `http://localhost:3000/api-docs`.

Key locations (examples)
- API entry: api/src/index.ts — registers CORS, Swagger, and route modules.
- API models: api/src/models/*.ts — data shapes used in OpenAPI generation.
- API routes: api/src/routes/*.ts — route handlers and existing tests (branch.test.ts).
- Frontend entry: frontend/src/main.tsx and frontend/src/App.tsx — routing and component layout.
- Frontend API helpers: frontend/src/api/config.ts — base URL and fetch helpers.
- Docs: docs/architecture.md and docs/build.md — architectural rationale and build steps.
- Prompts & agent artifacts: .github/prompts/* and .github/chatmodes/* — helpful examples to follow for prompt formats.

Architecture notes (what matters)
- The app follows a strict separation: `api/` is a pure REST service generating OpenAPI from models and route JSDoc; `frontend/` is a Vite React app that consumes the REST API.
- Data relationships follow an ERD (see `api/ERD.png`) and the models reference each other (e.g., `Order` -> `OrderDetail` -> `OrderDetailDelivery`).
- CORS is enabled in `api/src/index.ts` and expects the frontend during dev to be on a localhost origin (several ports are allowed).

Project-specific conventions and patterns
- Tests
  - The API uses `vitest` and `supertest` for route tests. See `api/src/routes/branch.test.ts` for the established pattern.
  - Test files live alongside routes as `*.test.ts` under `api/src/routes`.
  - Running API tests: `npm run test:api` (see .github/prompts/Unit-Test-Coverage.prompt.md for examples).

- API routes and OpenAPI
  - Route files include JSDoc OpenAPI comments; these are used by `swagger-jsdoc` configured in `api/src/index.ts` (apis: ['./src/models/*.ts', './src/routes/*.ts']).
  - When adding new models or routes, update the schema JSDoc in `api/src/models` and ensure route files include tags for swagger discoverability.

- Frontend patterns
  - Components are TypeScript React function components; prefer existing patterns in `frontend/src/components/` (e.g., `Products.tsx`, `ProductForm.tsx`).
  - Styling uses Tailwind — classes are used directly in JSX.

Integration points & environment
- The API reads `API_CORS_ORIGINS` env var to override allowed origins. Default ports used in dev are 3000 (API) and the Vite dev server port from `frontend` (see `frontend/vite.config.ts`).
- Docker and CI: repo contains a simple GitHub Actions workflow for Copilot setup (.github/workflows/copilot-setup-steps.yml). CI builds use Node 22 in that workflow.

What to change and how (concise rules for an agent)
- Keep changes small. When working on the API:
  - Add routes in `api/src/routes/` and export them from `api/src/index.ts` (follow existing naming and path conventions).
  - Add model types in `api/src/models/` and add JSDoc OpenAPI comments to them so `swagger-jsdoc` will pick them up.
  - Add tests following `branch.test.ts` and wire them into `npm run test:api`.
- When working on the frontend:
  - Mirror backend entities with typed API calls using `frontend/src/api/config.ts` as a starting point.
  - Reuse existing components when possible. Add new UI pieces under `frontend/src/components/` and subfolders (e.g., `entity/product/`).

Examples (from this repo)
- API: `api/src/routes/product.ts` — follow the route shape and JSDoc tags used there.
- Test: `api/src/routes/branch.test.ts` — shows `vitest` + `supertest` setup used across API tests.
- Frontend API: `frontend/src/api/config.ts` — shows how the frontend builds requests to the API.

Helpful hints for debugging and running locally
- Use `npm run build` from the repo root to compile both workspaces before running production-like servers.
- The VS Code tasks are defined for building API and frontend (`Build API`, `Build Frontend`) — use them if you prefer the Tasks UI.
- If Swagger doesn't show new models, verify model JSDoc location and `swaggerOptions.apis` globs in `api/src/index.ts`.

What not to do
- Don't change the workspace layout (moving `api` or `frontend` directories) — tooling and paths assume the current structure.
- Don't add global state in front-end that bypasses React contexts; prefer `AuthContext` and `ThemeContext` found in `frontend/src/context`.

References (files to inspect when making changes)
- [api/src/index.ts](../api/src/index.ts)
- [api/src/routes/branch.test.ts](../api/src/routes/branch.test.ts)
- [frontend/src/api/config.ts](../frontend/src/api/config.ts)
- [docs/architecture.md](../docs/architecture.md)
- [.github/prompts/Unit-Test-Coverage.prompt.md](prompts/Unit-Test-Coverage.prompt.md)

If anything is unclear
- Ask one short clarifying question and include a suggested minimal change (one-file PR) to speed review.
