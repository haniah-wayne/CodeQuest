# CodeQuest

Location-based coding challenges for Wayne State computer science students. Professors pin programming challenges to spots on campus for students to walk to and unlock them. They solve each challenge in the browser and climb a live class leaderboard.

## Features

**For students:**

- **Walk to unlock.** Each challenge sits on a campus map with an unlock radius and stays locked until you're within range.
- **Code anywhere.** Write, run, and submit Python, Java, C++, or JavaScript in a browser editor that works on your phone.
- **Live leaderboard.** Correct solutions earn points and class standings update in real time.

**For professors:**

- **Classes.** Create classes, share a join code, and manage the roster.
- **Challenge authoring.** Write challenges by hand or describe one and let AI draft it.
- **Grading.** Submissions are checked automatically against your test cases. AI can review any submission and suggest a score and feedback, and you can override points and leave your own feedback.

The app is also installable as a PWA.

## Tech stack

| Area           | Tools                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| Framework      | [Next.js](https://nextjs.org) 16 (App Router), React 19, and TypeScript                   |
| UI             | Tailwind CSS 4, shadcn, Hugeicons, and TanStack Table                                     |
| Editor         | CodeMirror 6                                                                              |
| Backend        | [Supabase](https://supabase.com): Postgres, Auth, Row Level Security, and Realtime        |
| Maps           | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)                                     |
| Code execution | [Piston](https://github.com/engineer-man/piston), self-hosted at `piston.olivermrose.com` |
| AI             | Google Gemini via `@google/genai`                                                         |
| Tooling        | pnpm, oxlint, oxfmt, Lefthook, and Docker                                                 |

> [!NOTE]
> This project uses Next.js 16, which renames middleware to `proxy.ts` and has other breaking changes. Check the [Next.js docs](https://nextjs.org/docs) before relying on older Next.js conventions.

## Getting started

### Prerequisites

- Node.js 24 or newer
- pnpm 12 (the version is pinned in `package.json` under `devEngines`)
- A Supabase project, or the [Supabase CLI](https://supabase.com/docs/guides/local-development) with Docker for a local one
- A Mapbox access token
- A Gemini API key (needed only for AI challenge generation and grading)

### 1. Install dependencies

```bash
pnpm install
```

This also installs the Lefthook pre-commit hook which runs `pnpm lint:fix` on staged JS and TS files.

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=

GEMINI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Set up the database

The schema, RLS policies, and RPC functions live in [`supabase/migrations`](./supabase/migrations/).

**Local Supabase:**

```bash
supabase start      # prints the local URL and keys for .env
supabase db reset   # applies every migration
```

**Hosted Supabase:**

```bash
supabase link --project-ref <project-ref>
supabase db push
```

After changing the schema, regenerate the types:

```bash
supabase gen types typescript --local > supabase/database.types.ts
```

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Location unlocking uses the browser's Geolocation API, so testing it on a phone requires HTTPS (for example `next dev --experimental-https` or a tunnel).

### Running with Docker

The Compose setup runs the dev server in a container, reads `.env`, and syncs file changes into it:

```bash
pnpm docker:dev     # build and start with file watching
pnpm docker:down    # stop
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the dev server                         |
| `pnpm build`        | Build for production                         |
| `pnpm start`        | Serve the production build                   |
| `pnpm lint`         | Run oxlint and check formatting with oxfmt   |
| `pnpm lint:fix`     | Fix lint issues and format                   |
| `pnpm docker:dev`   | Run the dev server in Docker with watch mode |
| `pnpm docker:build` | Rebuild the Docker image                     |
| `pnpm docker:down`  | Stop the Docker containers                   |
