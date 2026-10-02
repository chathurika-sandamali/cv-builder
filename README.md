# CV Builder

An evidence-based CV builder. Instead of asking an AI to invent a polished CV from scratch, this app builds CV bullets only from real evidence: your GitHub repositories, their READMEs, and what you actually tell it about your role and impact. Every AI-drafted bullet carries a note showing which piece of evidence it came from.

**Live app:** https://cv-builder-sepia-pi.vercel.app

## Why evidence-based?

Most AI CV tools will happily write "increased performance by 40%" for a project that never had a benchmark. This one won't. The AI is instructed to use only facts present in your GitHub data and your own answers, and any bullet containing a number that can't be found in that evidence gets flagged for review before you can add it. It's not a perfect guarantee against a vague, unsupported claim slipping through, but it removes most fabricated statistics by construction rather than by trusting the model to behave.

## Features

- **Template gallery** — Simple, Modern, and Minimal layouts, switchable at any time, all rendering from the same CV data
- **Live editor** — two-column editor and preview; edit basics, summary, experience, projects, education, skills, and certifications, with changes reflected instantly
- **GitHub repository analysis** — pulls your public repos, languages, and topics, and lets you add any of them as CV projects with one click (no invented data, only what GitHub actually returns)
- **AI-drafted bullets** — for any project linked to a GitHub repo, drafts 2-3 bullets grounded in the repo's README, languages, and your own short answers about role and impact; every bullet shows its supporting evidence and is flagged if it contains a number not found in that evidence
- **Job description tailoring** — paste a job description and get a comparison against your actual CV data: which required skills you already have evidence for, and which are missing, with an option to reorder your existing skills list (never adds skills you don't have)
- **PDF export** — clean, ATS-friendly PDF generated straight from the browser's print engine, with proper print styling and A4 sizing
- **Accounts and cloud storage** — sign up, log in, and your CV is saved per-account in a database, not just in one browser

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — Postgres database and authentication, with Row Level Security so each user can only read and write their own CV
- **Google Gemini API** (`gemini-3.5-flash-lite`) — AI bullet drafting and job tailoring, called only from server routes
- **GitHub REST API** — repository, language, and README data
- **Vercel** — hosting and deployment

## Architecture notes

- The entire CV is one JSON object (see `src/types/cv.ts`), and every template is a pure function of that JSON plus `sectionOrder`. Adding a new template means writing a new component, not touching the data model.
- AI calls happen only in server routes (`src/app/api/`), so the Gemini and GitHub API keys are never exposed to the browser.
- AI-drafted bullets are checked against the evidence text after generation: any number in a bullet that doesn't appear in the README, languages, topics, or the user's own answers is marked `unverified` and surfaced to the user before they can add it.
- Each user's CV is a single row in a `cvs` table, protected by Postgres Row Level Security policies, so the database itself enforces that users can only see their own data, not just the application code.

## Running it locally

```bash
npm install
npm run dev
```

You'll need a `.env.local` file (not committed) with:

```env
GITHUB_TOKEN=            # optional, raises GitHub's rate limit; fine-grained, public repos, read-only
GEMINI_API_KEY=          # from Google AI Studio
GEMINI_MODEL=gemini-3.5-flash-lite
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The Supabase project needs a `cvs` table with Row Level Security enabled (see `supabase/schema.sql` if present, or the setup in the project's commit history).

## Known limitations

- The number-matching check on AI bullets catches fabricated statistics, but can't catch an unsupported qualitative claim with no number attached (e.g. "significantly improved performance").
- Job-description tailoring has no equivalent code-level check yet; it relies on the prompt instruction not to invent matched skills.
- Free-tier AI and GitHub API limits apply; heavy use may hit rate limits.

## Status

Built as a personal project, evolving from a local, single-user tool into a small multi-user product with accounts. Not intended for production use at scale.
