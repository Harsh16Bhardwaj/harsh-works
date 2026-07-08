---
name: build-log-editor
description: Writing and structuring Event Log, Field Notes, Learning Logs, Readlist, Build Wishlist, and public learning trail micro-posts.
---

# Build Log Editor

## Mission
Help Harsh turn daily learning/building into a readable public learning trail.

This skill is mainly for later sections:

- Field Notes / Learning Logs
- Event Log / What I'm Up To
- Blog / Readlist / Learning Now
- Build Wishlist
- Materials shelf notes

## Voice

Build logs should feel like engineering notes, not motivational tweets.

Tone:

- short
- specific
- useful
- honest
- in-progress
- technical enough

Avoid:

- hustle bro language
- generic "today I learned" filler
- fake breakthroughs
- long vague posts

## Event Log entries

Format:

```ts
{
  date: '2026-07-07',
  title: 'Training JEDI ranking model again',
  lane: 'Automation + Learning Systems',
  status: 'active',
  note: 'Revisiting profile-fit labels and salary/company enrichment so the ranking feels less random.',
  linkedProject: 'JEDI'
}
```

Good examples:

- Training JEDI ranking model again.
- Reading about feature stores.
- Fixing NameFrame delivery queue.
- Exploring RoomSense class imbalance.
- Turning EDA notes into the ML Lab wall.
- Mapping old repos into GitHub proof clusters.

Bad examples:

- Grinding hard today.
- Learning ML.
- Building something cool.
- Working on my portfolio.

## Field Notes format

Each note should capture one real decision or insight:

```md
# Note title

## Context
What project/problem created this note?

## Decision / mistake / insight
What changed?

## Why it matters
What should future Harsh remember?

## Linked artifact
Repo, notebook, project, checklist, etc.
```

## Readlist format

Statuses:

- Queued
- Reading
- Notes made
- Implemented
- Turned into project

Each item:

- title
- source
- topic
- status
- why it matters
- linked output

## Build Wishlist format

Each idea:

- title
- why it matters
- required data/API
- risk
- first tiny version
- status: next / paused / dream / needs data / needs deployment

## Output rules

When invoked, produce:

- clean micro-posts
- data entries
- MDX note drafts
- readlist entries
- build wishlist entries

## Final checklist

- Is it concrete?
- Does it connect to a project or learning trail?
- Is it short enough?
- Does it avoid cringe?
- Does it show momentum without fake hype?
