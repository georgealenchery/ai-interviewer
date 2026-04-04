# ACE.AI — Claude Briefing

This document tells you everything you need to know before touching this codebase. Read it fully before making any change.

---

## What This App Does

ACE.AI is a voice-driven engineering interview practice platform. Users pick a role and difficulty, then conduct a realistic mock interview with an AI interviewer spoken through their microphone. Two interview types:

- **Behavioral** — voice-only, AI asks and evaluates STAR-method engineering questions
- **Technical** — voice discussion + Monaco code editor, AI asks 3 coding problems, user writes and runs code in-browser while explaining their approach

After every session, OpenAI evaluates the transcript and returns scores, per-question breakdowns, strengths, and improvement areas. Users can replay past interviews with a full transcript timeline.

---

## Monorepo Structure

```
ai-interviewer/
├── frontend/          React + Vite + TypeScript (port 5173)
│   └── src/
│       ├── assets/        Static files (logo, hero image)
│       ├── components/    Page-level and feature components
│       │   ├── TechnicalInterview/   All technical interview UI
│       │   ├── UI/                   shadcn/ui primitives (rarely touch these)
│       │   └── *.tsx                 Top-level page components
│       ├── data/          Static local data (technicalProblems.ts)
│       ├── hooks/         Custom React hooks
│       ├── lib/           Thin clients (supabase.ts, vapi.ts)
│       ├── pages/         Route-level page components
│       ├── services/      API clients and auth (auth.ts, api.ts)
│       ├── types/         Shared TypeScript types
│       └── routes.tsx     All React Router route definitions
│
├── backend/           Express + TypeScript (port 3001)
│   └── src/
│       ├── middleware/    auth.ts — Supabase JWT verification
│       ├── prompts/       OpenAI system prompt builders
│       ├── routes/        Express route handlers
│       ├── services/      aiService.ts, storageService.ts, supabase.ts
│       ├── types/         Shared types + Express augmentation
│       └── utils/         Formatters
│
└── CLAUDE.md
```

---

## Tech Stack

### Frontend
| Concern | Library |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript 5.9 |
| Routing | React Router v7 (no loaders/actions — plain `useNavigate`) |
| Styling | Tailwind CSS v4 — utility classes only, no CSS modules |
| Animation | Framer Motion (`motion/react`) |
| UI primitives | Radix UI (headless) + shadcn components in `components/UI/` |
| Voice interviews | `@vapi-ai/web` SDK |
| Code editor | `@monaco-editor/react` |
| Auth + DB | `@supabase/supabase-js` (anon key on frontend) |
| Charts | Recharts |
| Icons | Lucide React |

### Backend
| Concern | Library |
|---|---|
| Framework | Express 5 |
| Language | TypeScript 6 (commonjs) |
| AI | OpenAI SDK (`gpt-4.1` for interviews, `gpt-4o-mini` for lighter tasks) |
| Voice backend | `@vapi-ai/server-sdk` |
| Auth + DB | `@supabase/supabase-js` (service-role key on backend) |
| Dev runner | `ts-node-dev` |

### Infrastructure
- **Auth**: Supabase Auth (email/password). Frontend handles login/signup directly — no custom auth endpoints.
- **Database**: Supabase Postgres. Two tables: `public.profiles`, `public.interviews`. RLS enabled.
- **Backend DB access**: Always via the service-role client in `backend/src/services/supabase.ts` — this bypasses RLS.

---

## Key Files to Know

### Frontend

| File | Purpose |
|---|---|
| `src/lib/vapi.ts` | Singleton Vapi client instance — **never modify** |
| `src/lib/supabase.ts` | Supabase anon client for frontend |
| `src/services/auth.ts` | `login()`, `signup()`, `logout()`, `getUser()`, `apiFetch()` — the only auth surface |
| `src/services/api.ts` | Typed functions for every backend API call |
| `src/routes.tsx` | All routes in one place. Protected routes wrapped in `<ProtectedRoute>` |
| `src/hooks/useVapiInterview.ts` | Manages behavioral interview call state (status, transcript, mute, volume, evaluation) |
| `src/hooks/useVapiTechnicalInterview.ts` | Same for technical interviews |
| `src/hooks/useCodeExecution.ts` | Sandboxed code runner (JS/TS via `new Function`, Python via Pyodide WASM, Java/C++/Bash via backend) |
| `src/data/technicalProblems.ts` | Local bank of coding problems with topic tags. Used when user selects topic filters. |
| `src/components/DashboardNavbar.tsx` | Shared navbar. Props: `activeTab`, `variant` (`"light"` \| `"dark"`), `compact`. Add to every page. |

### Backend

| File | Purpose |
|---|---|
| `src/services/supabase.ts` | Service-role Supabase client. Used in all DB operations. |
| `src/middleware/auth.ts` | Calls `supabase.auth.getUser(token)` to verify every protected request |
| `src/services/storageService.ts` | All interview CRUD (`saveInterview`, `getInterviews`, `getInterviewById`) |
| `src/routes/analysis.ts` | `POST /evaluate` — calls OpenAI, saves interview with transcript |
| `src/routes/auth.ts` | Only `/me` and `/me/role` — login/signup are frontend-only |
| `src/db.ts` | **Deprecated stub.** Do not import from it. |

---

## Data Flow: Voice Interview

```
SetupDashboard
  └─ navigates with router state: { role, questionType, difficulty, strictness,
                                    experienceLevel, interviewer, selectedTopics, language }

VapiInterviewPanel (behavioral) / TechnicalInterviewLayout (technical)
  └─ reads config from location.state
  └─ useVapiInterview / useVapiTechnicalInterview
        └─ builds inline CreateAssistantDTO (system prompt + voice)
        └─ vapi.start(config)          ← starts WebRTC session
        └─ listens: call-start/end, speech-start/end, message, volume-level

  On end:
  └─ evaluateTranscript(messages, config)
        └─ POST /api/analysis/evaluate  → OpenAI → saveInterview() → Supabase
        └─ returns { result: VapiAnalysisResult, id: string }
  └─ navigate("/analytics", { state: { result, config, interviewId } })
```

---

## Database Schema

```sql
-- Supabase Postgres (not local)
public.profiles (
  id          uuid PRIMARY KEY  -- mirrors auth.users.id
  email       text
  name        text
  role        text DEFAULT 'fullstack'
  created_at  timestamptz
)

public.interviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
  user_id       uuid REFERENCES auth.users(id)
  role          text       -- "frontend", "backend", etc.
  question_type text       -- "behavioral" | "technical"
  config        jsonb      -- VapiInterviewConfig
  result        jsonb      -- VapiAnalysisResult (score, breakdown, strengths...)
  transcript    jsonb      -- VapiTranscriptEntry[] (role, text, timestamp)
  created_at    timestamptz
)
```

The backend maps `created_at` → `date` in responses to match the `SavedInterview` frontend type.

---

## API Routes

### Public (no auth)
- `GET /` — health check
- `POST /api/vapi/*` — Vapi webhooks
- `GET/PATCH /api/auth/me` — profile (uses authMiddleware but frontend calls it rarely)

### Protected (require `Authorization: Bearer <supabase-access-token>`)
- `POST /api/analysis/questions` — generate coding problems via OpenAI
- `POST /api/analysis/evaluate` — evaluate transcript via OpenAI, store result
- `GET /api/analysis/history` — list all user interviews
- `GET /api/interviews` — same, lighter response (no transcript)
- `GET /api/interviews/:id` — single interview with full transcript
- `POST /api/execute` — run Java/C++/Bash code remotely
- `POST /api/start`, `POST /api/next` — text-based interview (legacy)

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase, named export | `export function SetupDashboard()` |
| Hooks | camelCase, `use` prefix | `useVapiInterview` |
| Component files | PascalCase | `VapiInterviewPanel.tsx` |
| Hook/service files | camelCase | `useCodeExecution.ts`, `storageService.ts` |
| Types / interfaces | PascalCase | `VapiAnalysisResult`, `TranscriptEntry` |
| Backend route files | camelCase | `analysis.ts`, `interviews.ts` |
| DB columns | snake_case | `user_id`, `question_type`, `created_at` |
| Frontend type fields | camelCase | `questionType`, `userId` |
| CSS | Tailwind utility classes only | `className="flex items-center gap-4"` |

No default exports anywhere. Every export is named.

---

## Component Architecture

### Page layout pattern
Every page that has a light background (`from-pink-100 via-purple-100 to-blue-100`):
```tsx
<div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
  <DashboardNavbar activeTab="..." />
  <div className="max-w-7xl mx-auto p-6">
    {/* content */}
  </div>
</div>
```

Dark background pages (`from-gray-900 via-gray-800 to-gray-900`):
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
  <DashboardNavbar activeTab="..." variant="dark" compact />
  {/* content */}
</div>
```

`h-screen` flex pages (TechnicalInterviewLayout only):
```tsx
<div className="h-screen ... flex flex-col overflow-hidden">
  <DashboardNavbar ... compact />
  <div className="flex-1 flex flex-col p-4 min-h-0">
    {/* content — flex-1 fills remaining height */}
  </div>
</div>
```

### Card style
```tsx
className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 shadow-xl"  // dark
className="backdrop-blur-lg bg-white/40 rounded-2xl border border-white/50 shadow-xl"  // light
```

### Color accents
- AI / assistant: purple (`text-purple-400`, `bg-purple-500/10`, `border-purple-500/20`)
- User / candidate: blue/cyan (`text-cyan-400`, `bg-blue-500/10`, `border-blue-500/20`)
- Success: green (`text-green-400`)
- Warning: amber (`text-amber-400`)
- Error / end: red (`text-red-400`)

---

## Environment Variables

### Backend (`.env`)
```
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1
VAPI_PRIVATE_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE=
PORT=3001
```

### Frontend (`.env`)
```
VITE_VAPI_PUBLIC_KEY=
VITE_VAPI_ASSISTANT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001/api
```

---

## Hard Rules — Do NOT Do These

1. **Do not touch `frontend/src/lib/vapi.ts`.** It is a singleton. Modifying it breaks all voice interviews.

2. **Do not rewrite the Vapi hooks** (`useVapiInterview`, `useVapiTechnicalInterview`) unless the change directly requires it. Interview state is delicate.

3. **Do not import from `backend/src/db.ts`.** It is a deprecated stub. All DB access goes through `backend/src/services/supabase.ts`.

4. **Do not add backend routes for login or signup.** Authentication is handled entirely by the Supabase frontend client. The backend only verifies tokens.

5. **Do not use the `pg` Pool** or write raw SQL queries in the backend. Use the Supabase service-role client.

6. **Do not use `localStorage` for auth state.** Supabase manages sessions internally. Read auth state via `supabase.auth.getSession()` or the `getUser()` cache in `auth.ts`.

7. **Do not introduce Prisma, Drizzle, node-pg-migrate, or any new ORM/migration tool.**

8. **Do not add default exports.** All exports are named.

9. **Do not add comments unless the logic is genuinely non-obvious.** Don't explain what the code says — only explain why it does something unexpected.

10. **Do not add docstrings, PropTypes, or type annotations to code you didn't change.**

11. **Do not add error handling or fallbacks for impossible scenarios.** Trust Supabase/React/TypeScript's guarantees. Only validate at real system boundaries (user input, external APIs).

12. **Do not add emojis to code, comments, or UI** unless explicitly asked.

13. **Do not create abstraction layers or utilities for one-off operations.** Three similar lines of code beats a premature helper.

14. **Do not change routing logic in `routes.tsx`** unless adding a new route. Never remove a protected route's `<ProtectedRoute>` wrapper.

15. **Do not pass sensitive secrets to the frontend.** `SUPABASE_SERVICE_ROLE` and `OPENAI_API_KEY` are backend-only. Frontend only ever sees `VITE_SUPABASE_ANON_KEY`.

---

## Patterns Worth Knowing

### Router state over URL params
Config always flows through `location.state`, not query strings or URL segments. When navigating to an interview:
```ts
navigate("/interview/voice", { state: { role, difficulty, interviewer, ... } });
// Then inside the page:
const state = location.state as { role?: string; ... } | null;
```

### `apiFetch` is the only way to hit the backend
Always use `apiFetch(path, options)` from `frontend/src/services/auth.ts`. It attaches the Supabase session token automatically. Never call `fetch()` directly for authenticated endpoints.

### `evaluateTranscript` returns `{ result, id }`
Both `useVapiInterview` and `useVapiTechnicalInterview` expose `evaluateTranscript()`. It returns `{ result: VapiAnalysisResult, id: string } | null`. Always pass `id` to the analytics navigation state as `interviewId` so the replay link works.

### Topic filtering in technical interviews
When `selectedTopics.length > 0`, `TechnicalInterviewLayout` uses the local problem bank (`data/technicalProblems.ts`) via `pickRandomProblems()` and skips the OpenAI question generation API call. If topics is empty, it falls back to API generation.

### Code execution sandboxing
- JS/TS: `new Function(code + "; return functionName;")()` — runs in browser, no network access
- Python: Pyodide loaded from CDN (first load ~5–7s). Results round-trip via JSON to avoid PyProxy issues.
- Java/C++/Bash: sent to `POST /api/execute` on the backend

### Supabase `created_at` vs frontend `date`
The Supabase `interviews` table uses `created_at`. The `SavedInterview` frontend type has a `date` field. `storageService.ts` maps `row.created_at → date`. The `interviews.ts` route also adds `date: r.created_at` to responses. Don't break this mapping.

### DashboardNavbar on every page
Every page needs `<DashboardNavbar activeTab="..." />`. Light pages get no extra props. Dark pages get `variant="dark" compact`. Interview pages with `h-screen` layouts get `compact`. See the Component Architecture section above.

### `MicVisualizer` for volume feedback
Both voice interview panels display `<MicVisualizer volumeLevel={volumeLevel} isListening={isListening} isSpeaking={isSpeaking} />`. The `volumeLevel` comes from `vapi.on("volume-level", ...)` registered in both hooks.

---

## Running the App

```bash
# Backend (http://localhost:3001)
cd backend && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

Both must be running simultaneously. There is no proxy setup — the frontend hits the backend directly via `VITE_API_URL`.
