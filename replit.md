# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
This is the **ACB Dynamic QR Studio** — an Algebraic Codex Build tool for generating, styling, tracking, and testing dynamic QR codes.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + framer-motion
- **QR Generation**: `qrcode` + `sharp` (server-side image processing)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── acb-qr/             # React frontend — ACB Dynamic QR Studio
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## ACB QR Studio Features

### Variables (ACB Parameters)
- `qrData` — Primary data to encode (URL or text)
- `dynamicContent` — Runtime override for qrData
- `cornerColor` — RGB hex for the 4 finder square corners
- `logoImage` — Central logo URL (transparent supported)
- `logoScale` — 0.0–0.4 scale relative to QR size (max 40% preserves scannability)
- `textOverlay` — { text, font (bold/italic/cursive/normal), size, x, y, color }
- `whiteFill` + `whiteFillColor` — Paint bucket fill for white QR modules
- `tabsToOpen` — 1–10 browser tabs
- `trackTraffic` — Premium traffic tracking
- `vocalIntro` — Audio autoplay on page load (premium)

### Color Schemes
- `standard` — Default black modules with colored finder corners
- `tricolor` — Three distinct corner colors (cyan/violet/amber by default)
- `monochrome` — Grayscale gradient modules with stark white corners
- `rainbow` — Full spectrum HSL gradient across all modules
- `profile` — Colors derived from the searched platform (primary/secondary/accent)

### Finder Pattern Rendering
- Outer border ring = chosen color (per corner or per scheme)
- White gap ring between outer and center
- Center dot = same chosen color
- Data modules outside finders = standard black (or scheme-dependent)

### SCAN ME Text
- Rendered below the QR code in a separate SVG area (56px height)
- Never overlaps QR modules — guarantees scannability
- `scanMeText` and `scanMeColor` control the label content and color

### Options
- `highlightCorners` — Apply cornerColor to finder squares
- `testScanMode` — Simulate QR scan and get reliability score
- `metadataFriendly` — Auto-generate SEO meta tags + alt text
- `multiTabOpen` — Open session page in multiple tabs
- `premiumFeatures` — Unlock traffic tracking + vocal intro
- `fullWhiteFill` — Apply paint bucket to all white modules

### Outputs
- `qrImage` — Base64 PNG with corner highlights + logo + text overlay
- `pageHTML` — Full HTML page with QR embedded, SEO meta, audio, tracking
- `testResults` — Scan confidence score, issues, warnings, recommendations
- `trafficReport` — Visit counts, unique visitors, source breakdown

## API Routes

- `POST /api/qr/generate` — Generate QR with all ACB parameters
- `GET /api/qr/sessions` — List all QR sessions
- `GET /api/qr/sessions/:id` — Get specific session
- `DELETE /api/qr/sessions/:id` — Delete session + traffic data
- `POST /api/qr/test` — Run QR scan simulation and reliability analysis
- `GET /api/qr/page/:id` — Get rendered HTML page for session (used for tab opening)
- `GET /api/traffic/:sessionId` — Get traffic report (premium)
- `POST /api/traffic/:sessionId/track` — Record a page visit (auto-called by pages)

## Database Schema

- `qr_sessions` — All QR session data including base64 image and config
- `visits` — Traffic tracking visits per session

## TypeScript & Composite Projects

Every lib extends `tsconfig.base.json` with `composite: true`.

- **Always typecheck from the root** — `pnpm run typecheck`
- Artifacts are leaf packages, not in root tsconfig references

## Root Scripts

- `pnpm run build` — typecheck + recursive build
- `pnpm run typecheck` — full TS check

## Packages

### `artifacts/acb-qr` (`@workspace/acb-qr`)
React + Vite frontend. Previewed at `/`. Components in `src/pages/dashboard/`.
- `/demo` — Productivity demo page with interactive variables, 4 QR design variants, morphing QR carousel (9 real scannable codes auto-cycling with countdown timer), and 9-page target matrix for AZAKELS
- `/demo/qr-carousel.tsx` — Animated QR carousel component with play/pause, skip controls, download individual/all, and per-page detail cards

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API. Routes in `src/routes/`. Uses `@workspace/api-zod` for validation and `@workspace/db` for persistence.

### `lib/db` (`@workspace/db`)
Drizzle ORM + PostgreSQL. Schema in `src/schema/`. Run `pnpm --filter @workspace/db run push` for migrations.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks and Zod schemas.
