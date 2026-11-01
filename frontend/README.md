# IdeaForge AI 🔨

**IdeaForge AI** is an AI-powered startup/project idea analyzer. Describe an idea in plain
words — for example, *"An AI system that helps Kathmandu manage waste collection"* — and get
back a structured breakdown:

- Problem
- Proposed Solution
- Target Users
- Key Features
- Suggested Tech Stack
- Possible Challenges
- Future Improvements

> **Status: frontend-only.** This project currently runs entirely in the browser with mock
> data. No backend, database, authentication server, or AI integration exists yet — the code
> is structured so all of that can be connected later. See [Future Backend](#future-backend).

---

## Technologies Used

| Tool | Purpose |
| --- | --- |
| [React](https://react.dev/) (JavaScript, no TypeScript) | UI components & pages |
| [Vite](https://vitejs.dev/) | Dev server & build tool |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Styling (utility classes) |
| [React Router](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP client (configured & ready, calls mocked for now) |

No backend, no database, no AI keys — everything runs with `npm run dev` alone.

---

## How to Install

Requirements: **Node.js 18+** and npm.

```bash
# 1. Move into the project folder
cd ideaforge-ai

# 2. Install dependencies
npm install
```

## How to Run

```bash
# Start the development server (opens on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

Then open **http://localhost:5173** in your browser. Try this flow:

1. Click **Start Building** → create an account (frontend-only, any details work).
2. You'll land on the **Dashboard** with sample ideas — search & filter them.
3. Click **Create New Idea**, describe something, hit **Analyze with AI ✨**.
4. Save it, open it from the dashboard, try **Edit**, **Analyze Again**, and **Delete**.
5. Visit **Profile** to edit your name or log out.

---

## Folder Structure

```text
ideaforge-ai/
├── index.html              # Page title + root mount point
├── vite.config.js          # Vite + Tailwind plugin
├── package.json
├── README.md
└── src/
    ├── main.jsx            # Entry point: router + providers
    ├── App.jsx             # All routes in one place
    ├── index.css           # Tailwind import + tiny global styles
    │
    ├── components/         # Reusable UI pieces (one file per section)
    │   ├── Navbar.jsx      # Public top navigation (landing page)
    │   ├── Sidebar.jsx     # Logged-in sidebar navigation
    │   ├── Footer.jsx      # Public footer
    │   ├── Button.jsx      # Shared button (variants: primary/outline/danger…)
    │   ├── IdeaInput.jsx   # The idea submission form
    │   ├── IdeaCard.jsx    # Single idea preview card
    │   ├── IdeaList.jsx    # Grid of cards + empty states
    │   ├── AIAnalysis.jsx  # Renders the structured AI breakdown
    │   ├── LoadingState.jsx
    │   ├── EmptyState.jsx
    │   ├── ErrorState.jsx
    │   ├── SuccessMessage.jsx
    │   └── ProtectedRoute.jsx  # Redirects to /login when logged out
    │
    ├── pages/              # One file per route
    │   ├── Landing.jsx     # Marketing page (hero, features, how-it-works…)
    │   ├── Login.jsx       # Login form (mock auth, TODOs marked)
    │   ├── Signup.jsx      # Signup form (mock auth, TODOs marked)
    │   ├── Dashboard.jsx   # Welcome, stats, search/filter, idea cards
    │   ├── CreateIdea.jsx  # Main feature: form → analyze → save
    │   ├── IdeaDetails.jsx # Full idea + analysis + edit/delete actions
    │   └── Profile.jsx     # User info, edit name, logout
    │
    ├── layouts/
    │   ├── MainLayout.jsx  # Sidebar + mobile drawer for private pages
    │   └── AuthLayout.jsx  # Centered card for login/signup
    │
    ├── context/            # Simple React state (no Redux — useState only)
    │   ├── AuthContext.jsx # Fake logged-in user (later: JWT from Express)
    │   └── IdeasContext.jsx# In-memory idea list (later: MongoDB via Express)
    │
    ├── services/
    │   └── api.js          # ⭐ Axios instance + ALL future API calls.
    │                       #    Every endpoint is documented here with the
    │                       #    real call commented out + mock behavior.
    │
    └── data/
        └── mockIdeas.js    # Mock ideas + mock AI analysis generator.
                            #    Shaped exactly like the future MongoDB model.
```

### Where to look when connecting the backend

- **API calls** → `src/services/api.js` (replace each mock with the real `api.post(...)` / `api.get(...)` — the exact lines are already written as comments).
- **Auth state** → `src/context/AuthContext.jsx` (store the real JWT + user from Express).
- **Idea data** → `src/context/IdeasContext.jsx` (fetch from `GET /ideas` instead of mock data).
- **Route guard** → `src/components/ProtectedRoute.jsx` (check the real token instead of the mock flag).

---

## Current Frontend-Only Status

What works today (with mock data, no server needed):

- ✅ Landing page with features, how-it-works, and example analysis
- ✅ Login / signup UI with validation (any credentials "work")
- ✅ Dashboard with stats, search, category filter, and idea cards
- ✅ Create Idea with simulated AI analysis (loading → result → save)
- ✅ Idea Details with edit, delete (confirmed), and re-analyze
- ✅ Profile page with edit-name and logout
- ✅ Protected routes that redirect logged-out visitors to `/login`
- ✅ Fully responsive: desktop sidebar becomes a mobile drawer

What is intentionally **not** implemented:

- ❌ No Express server, no MongoDB, no real API
- ❌ No real authentication / JWT (never trust this mock for security)
- ❌ No AI API calls — responses are generated locally from templates
- ❌ No persistence — ideas reset when you reload (no localStorage-as-database tricks)
- ❌ No API keys anywhere (and there never should be in the frontend)

---

## Future Backend

The next stage connects this frontend to a real backend. Planned architecture:

```text
React (this app)
   ↓  Axios → http://localhost:5000/api
Node.js + Express (REST API + JWT auth)
   ↓
MongoDB (users + ideas collections)
   +
AI API (called server-side by Express — key stays secret)
```

### Planned endpoints

```text
POST   /api/auth/signup      # create account → { user, token }
POST   /api/auth/login       # log in → { user, token }
GET    /api/ideas            # list my ideas
POST   /api/ideas            # save an idea + analysis
GET    /api/ideas/:id        # fetch one idea
PUT    /api/ideas/:id        # update an idea
DELETE /api/ideas/:id        # delete an idea
POST   /api/ai/analyze       # send idea → Express → AI → structured analysis
```

### Planned MongoDB `Idea` model

```js
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),       // owner of the idea
  title: "Smart Waste Management",
  description: "AI-powered waste collection system",
  category: "AI / Sustainability",
  targetAudience: "Municipalities",
  aiAnalysis: {
    problem: String,
    solution: String,
    targetUsers: String,
    features: [String],
    techStack: [String],
    challenges: String,
    futureImprovements: String
  },
  createdAt: Date
}
```

The frontend already uses this exact shape (see `src/data/mockIdeas.js`), so the UI code
won't need to change — only the data source will.

---

Built as a learning project for full-stack development practice. Happy forging! 🔥
