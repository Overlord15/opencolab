# OpenColab

> A collaborative workspace for organisations — task management, real-time communication, shared whiteboards, and event sync, all scoped to your org.

**Live:** [opencolab.vercel.app](https://opencolab.vercel.app)

---

## What is OpenColab?

OpenColab is an internal collaboration platform for teams within the same organisation. Every organisation gets a unique **org code** — members join using that code and instantly get access to a shared workspace where they can communicate, manage tasks, collaborate on whiteboards, and stay in sync through shared events.

No cross-org data leakage. Everything stays within your org boundary.

---

## Features

### Organisation Codes
Join or create an organisation with a unique org code. Everyone who joins with the same code is part of the same workspace — no manual invites, no admin overhead.

### Messaging
Real-time chat between all members of your org. Everyone sees the same conversation, keeping communication centralised and transparent.

### Task Management
Create, assign, and track tasks across your team. Task state syncs live — when someone updates a task, everyone in the org sees it immediately.

### Shared Whiteboard
A collaborative canvas for brainstorming, diagrams, or planning. Multiple org members can draw and annotate simultaneously in real time.

### Event Sync
Org-wide event calendar. Create events and they instantly appear for all members — no need to manually share or copy calendar invites.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth & Realtime | Firebase 12 |
| Database | Supabase (PostgreSQL) |
| AI Features | Google Gemini (`@google/genai`) |
| Backend | Express (lightweight API server) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project
- A Supabase project
- A Google Gemini API key

### Installation

```bash
git clone https://github.com/Overlord15/opencolab.git
cd opencolab
npm install
```

### Environment Setup

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required variables (see `.env.example` for the full list):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

### Database Setup

Run the Supabase schema to set up your tables:

```bash
# In your Supabase project dashboard, run:
supabase_schema.sql
```

Firestore security rules are in `firestore.rules`. Deploy them via the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

### Run Locally

```bash
npm run dev
```

The app starts at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
opencolab/
├── src/                        # Application source
├── index.html                  # Entry point
├── firebase-blueprint.json     # Firebase project schema
├── firebase-applet-config.json # Firebase app config
├── firestore.rules             # Firestore security rules
├── supabase_schema.sql         # Supabase table definitions
├── firebase.md                 # Firebase setup notes
├── security_spec.md            # Security specification
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
└── .env.example                # Environment variable template
```

---

## Security

OpenColab takes data isolation seriously. Org data is scoped strictly by org code — users can only read and write data belonging to their own organisation.

See [`security_spec.md`](./security_spec.md) for the full security specification, including Firestore rules logic and Supabase row-level security policies.

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## Author

**Anupam** — [@Overlord15](https://github.com/Overlord15)

---

## License

MIT
