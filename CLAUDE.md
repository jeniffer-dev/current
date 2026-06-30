# CLAUDE.md

# CURRENT 🌊

A calm elite athlete operating system focused on long-term athletic preparation.

CURRENT helps athletes execute, understand, and evolve through macrocycles using:
- Training planning
- Progression tracking
- Testing systems
- Lessons learned
- Readiness context

CURRENT is NOT a generic workout tracker or productivity app.

> Philosophy: **Support the process.**

---

# Product Philosophy

CURRENT is: cycle-centric · preparation-focused · progression-aware · reflection-oriented

Should feel: calm · intentional · premium · reflective · athlete-focused · cognitively lightweight

Should NEVER feel like:
- A bodybuilding app
- Hustle culture software
- A productivity tracker
- A gamified dopamine machine

Core emotional principles:
- Awareness over obsession
- Preparation over productivity
- Reflection over anxiety
- Long-term evolution over isolated workouts

---

# Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) · TypeScript · TailwindCSS · shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL |
| Charts | Recharts |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

# General Architecture

```
current/
  frontend/   ← Next.js app
  backend/    ← Supabase schema, migrations, logic
```

## Database Hierarchy

```
Macrocycle
  → Phases
      → Training Days
          → Sessions
              → Logs
```

## Core Tables

- `users`
- `macrocycles`
- `phases`
- `training_days`
- `gym_session_templates`
- `gym_session_exercises`
- `swim_session_templates`
- `exercises`
- `strength_logs`
- `test_templates`
- `test_results`
- `lessons_learned`

---

# Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files | kebab-case | `training-day-card.tsx` |
| Components | PascalCase | `TrainingDayCard` |
| Variables | camelCase | `trainingLoad` |
| DB Tables | snake_case | `training_days` |
| IDs | UUID | everywhere |

---

# UX Principles

Every page has a psychological role:

| Page | Role | Question |
|---|---|---|
| Dashboard | Orientation | "Where am I in the process?" |
| Planner | Strategy | "Where is this preparation going?" |
| Day View | Execution | "What matters today?" |
| Performance | Reflection | "Am I evolving?" |

---

# Security Rules

- Never commit secrets — use `.env.local`
- Validate all user input
- Use Supabase Row Level Security (RLS)
- Never expose service keys client-side
- Never trust client calculations

---

# Product Constraints

CURRENT should:
- Feel lightweight and reduce cognitive fatigue
- Support long-term athletic evolution
- Remain emotionally calm

Avoid:
- Feature creep
- Unnecessary gamification
- Noisy dashboards
- Productivity anxiety UX

## Future Features (NOT MVP)

Do not implement now:
- AI coaching
- Social systems
- Messaging
- Nutrition tracking
- Complex readiness engines
