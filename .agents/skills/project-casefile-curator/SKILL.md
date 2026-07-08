---
name: project-casefile-curator
description: Turning rough project notes, repos, READMEs, screenshots, notebooks, and architecture notes into strong portfolio case files.
---

# Project Casefile Curator

## Mission
Turn major projects into serious, proof-backed case files.

A case file is not a project description.
A case file shows:

- problem
- system
- decisions
- failures
- proof
- learning
- role fit

## Required project case-file structure

For every serious project, create this structure:

```md
# Project Name

## System identity
One sentence that explains what this system is.

## Problem
What messy workflow, data problem, or user pain existed?

## Built system
What was built? Avoid listing technologies before explaining behavior.

## Architecture
Flow, components, storage, workers, APIs, frontend, external services.

## Key decisions
3-6 decisions that show engineering thinking.

## Failure paths / tradeoffs
What can break? What fallback exists? What was intentionally not solved yet?

## Evidence
Links, screenshots, repo files, docs, notebooks, deployment, logs, tests.

## What I learned
Concrete learning, not motivational fluff.

## Recruiter signal
What this proves for SDE / ML / AI engineering roles.
```

## Project-specific guidance

### NameFrame

System identity:
Certificate automation and delivery system for college/community events.

Focus on:

- CSV ingestion from forms
- template coordinate mapping
- batch certificate generation
- email delivery
- delivery fallback / DLQ if implemented/planned
- QR/authenticity verification if implemented/planned
- logs and operator visibility
- GDG/GDSC event pain: hundreds of certificates, manual Canva work

Do not overclaim scale unless proven.

Potential case-file angle:

> From 3-4 days of manual certificate work to an operator-controlled certificate generation and delivery pipeline.

### PersonalCloud

System identity:
Personal cloud storage/sync system.

Focus on:

- secondary PC/server storage
- upload/download flow
- encrypted transfer if implemented/planned
- offline availability if implemented/planned
- queue/worker sync
- direct sharing
- reliability and file integrity

Potential angle:

> A self-hosted cloud workflow that explores file transfer, sync, offline access, and ownership of storage.

### JEDI

System identity:
Job intelligence and profile-fit ranking system.

Focus on:

- ingesting job CSVs
- screening roles
- annotation columns
- profile-fit scoring
- company/role/salary enrichment
- local persistent UI
- downloadable master workbook
- manual + semi-automated career workflow

Potential angle:

> A job search intelligence console for turning scattered listings into ranked, annotated, profile-aware opportunities.

### ClipHawk

System identity:
Instagram/Reels intelligence scraping and classification pipeline.

Focus on:

- input audio URL
- reel URL discovery
- Playwright scraping
- likes/comments/caption/date/sound link/username
- creator profile extraction
- commercial/sponsored signals
- structured JSON/CSV/API output
- cookies/session reuse

Potential angle:

> A creator-content intelligence pipeline that turns Instagram audio/reel trails into structured commercial signals.

### ML Atlas

System identity:
Public ML learning trail and algorithm reference system.

Focus on:

- algorithm pages
- theory-to-practice notes
- interview drawer
- forbidden chamber/math notes
- public proof of ML learning
- visual explanation system

Potential angle:

> A public ML knowledge base that turns study into reusable explanation, notebooks, and interview material.

### FIFA Predictor

System identity:
Sports ML prediction project.

Focus on:

- feature engineering
- match state
- target definition
- metrics
- validation
- tradeoffs
- prediction limitations

Potential angle:

> A sports prediction experiment focused less on hype and more on features, validation, and model failure modes.

## Writing rules

Do not write:

- "This project uses React and Tailwind..."
- "A beautiful website..."
- "An innovative solution..."
- "Implemented many features..."

Write:

- "The system ingests X, transforms Y, and outputs Z."
- "The hardest part was deciding..."
- "The fallback path handles..."
- "The model was evaluated using... because..."
- "This is currently limited by..."

## Proof honesty rules

Never invent:

- users
- metrics
- production deployment
- revenue
- model accuracy
- load numbers
- external integrations

If missing, write:

- `needs screenshot`
- `needs repo link`
- `needs metric`
- `needs architecture diagram`
- `needs before/after proof`

## Output formats

Depending on task, produce:

- `references/projects/<project>.md`
- `src/data/projects.ts` entry
- case-file page copy
- card copy
- proof gap checklist
- architecture diagram description

## Final checklist

A good case file has:

- one-line identity
- specific problem
- concrete system flow
- engineering decisions
- honest limitations
- proof artifacts
- recruiter signal
