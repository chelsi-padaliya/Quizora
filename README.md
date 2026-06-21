# Interview Preparation Hub

A full-stack personal interview preparation platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, **NextAuth**, **React Hook Form**, **Zod**, and **shadcn/ui**.

Practice backend, JavaScript, React, Node.js, MongoDB, SQL, Redis, Git, Laravel, API, and system design questions in **Quiz Mode** and **Theory Mode**.

## Features

- **Authentication** – Single admin login with email/password, protected routes, logout
- **Dashboard** – Stats, recent activity, subject overview
- **Quiz Mode** – MCQ with filters, timer, navigation, score & review
- **Theory Mode** – Accordion Q&A with search, filters, pagination
- **Admin CRUD** – Create, update, delete, bulk import questions
- **14 Subjects** – JavaScript, React, Node.js, Express.js, MongoDB, SQL, PostgreSQL, Redis, JWT, API, Git, Laravel, PHP, System Design

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 (Credentials) |
| Forms | React Hook Form + Zod |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Installation

### 1. Clone and install dependencies

```bash
cd D:\chelsi\Quiz
npm install
```

### 2. Configure environment variables

Copy the example env file and update values:

```bash
copy .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/interview_prep_hub?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-32-char-secret"
AUTH_SECRET="generate-a-random-32-char-secret"

ADMIN_EMAIL="admin@interviewhub.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Admin"
```

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create PostgreSQL database

```sql
CREATE DATABASE interview_prep_hub;
```

### 4. Run migrations and seed

```bash
npm run db:push
npm run db:seed
```

Or with migrations:

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your admin credentials.

## Default Login

| Field | Value |
|-------|-------|
| Email | admin@interviewhub.com |
| Password | Admin@123456 |

Change these in `.env` before seeding.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/questions/   # Admin CRUD
│   ├── dashboard/         # Dashboard
│   ├── quiz/              # Quiz mode & results
│   ├── theory/            # Theory mode
│   ├── subjects/[slug]/   # Subject detail
│   └── login/             # Authentication
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Navbar, Sidebar, DashboardLayout
│   ├── quiz/              # Quiz player, results
│   ├── theory/            # Theory cards
│   ├── dashboard/         # Dashboard widgets
│   └── forms/             # Question forms
├── actions/               # Server actions
├── services/              # Database service layer
├── auth/                  # NextAuth configuration
├── validations/           # Zod schemas
├── constants/             # App constants
├── types/                 # TypeScript types
├── lib/                   # Utilities, Prisma client
└── middleware.ts          # Route protection
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Database Schema

- **users** – Admin user accounts
- **subjects** – Interview subjects (14 total)
- **topics** – Topics per subject
- **questions** – Quiz & theory questions
- **quiz_attempts** – Quiz history and scores

## Bulk Import Format

Import questions via Admin → Bulk Import as JSON:

```json
[
  {
    "subjectId": "clxxx...",
    "type": "quiz",
    "difficulty": "beginner",
    "question": "Your question here?",
    "optionA": "Option A",
    "optionB": "Option B",
    "optionC": "Option C",
    "optionD": "Option D",
    "correctAnswer": "A",
    "explanation": "Why A is correct"
  },
  {
    "subjectId": "clxxx...",
    "type": "theory",
    "difficulty": "intermediate",
    "question": "Explain X",
    "answer": "Detailed answer here"
  }
]
```

## License

Private – personal use.
