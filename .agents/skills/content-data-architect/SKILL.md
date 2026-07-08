---
name: content-data-architect
description: Designing portfolio content schemas, data files, project inventory, GitHub map data, event logs, readlists, materials shelves, and editable content models.
---

# Content Data Architect

## Mission
Design the content layer so the portfolio is editable, scalable, and not hardcoded chaos.

Harsh's site has many sections. The data should be structured cleanly from the beginning.

## Content philosophy

Use curated local data first.
Live APIs can come later.

Reason:

- The portfolio needs narrative control.
- GitHub API dumps are messy.
- Recruiters need clarity, not every repo.
- Local data can be edited like a personal CMS.

## Recommended data files

```txt
src/data/
  identity.ts
  sections.ts
  github-map.ts
  projects.ts
  work-lanes.ts
  ml-lab.ts
  tiny-builds.ts
  field-notes.ts
  materials.ts
  event-log.ts
  readlist.ts
  wishlist.ts
```

## First-five data models

### identity.ts

```ts
export const identity = {
  name: 'Harsh Bhardwaj',
  primaryLine: 'I build ML products, full-stack systems, and public learning trails.',
  currentDirection: ['AI/ML', 'Full-stack systems', 'Automation', 'Public learning'],
  liveStatus: [
    'Training JEDI ranking model',
    'Building ML Lab',
    'Mapping GitHub proof trail',
    'Refining NameFrame queue'
  ],
  ctas: [
    { label: 'View Systems', href: '#project-gallery', variant: 'primary' },
    { label: 'GitHub', href: 'https://github.com/bhardwajharshmait23', variant: 'secondary' }
  ]
};
```

### work-lanes.ts

```ts
export const workLanes = [
  {
    id: 'ml-data',
    title: 'ML + Data',
    thesis: 'EDA, feature decisions, model validation, and metric tradeoffs.',
    outputs: ['notebooks', 'model reports', 'validation notes', 'case studies'],
    projects: ['ML Atlas', 'FIFA Predictor', 'RoomSense'],
    proof: ['metrics decisions', 'EDA reports', 'model comparison']
  },
  {
    id: 'full-stack',
    title: 'Full-stack Products',
    thesis: 'Auth, DB, dashboards, queues, deployment, and operator-facing workflows.',
    outputs: ['web apps', 'dashboards', 'APIs', 'queues'],
    projects: ['NameFrame', 'PersonalCloud', 'JEDI'],
    proof: ['architecture', 'deployment', 'workflow depth']
  },
  {
    id: 'automation-learning',
    title: 'Automation + Learning Systems',
    thesis: 'Scrapers, agents, checklists, public notes, and workflow accelerators.',
    outputs: ['scripts', 'agents', 'learning trails', 'resource shelves'],
    projects: ['ClipHawk', 'ML Atlas', 'Codex workflows'],
    proof: ['structured extraction', 'public writing', 'repeatable workflows']
  }
];
```

### projects.ts

```ts
export type Project = {
  id: string;
  name: string;
  status: 'flagship' | 'serious' | 'learning' | 'tiny' | 'paused';
  lane: 'ML + Data' | 'Full-stack Products' | 'Automation + Learning Systems';
  oneLine: string;
  problem: string;
  system: string;
  proof: string[];
  tech: string[];
  links: {
    github?: string;
    demo?: string;
    caseFile?: string;
  };
  needsProof?: string[];
};
```

## Editing rules

- Content files should be human-readable.
- Do not scatter copy inside components unless it is purely UI text.
- Project card copy should come from `projects.ts`.
- Work Console should come from `work-lanes.ts`.
- GitHub Map should come from `github-map.ts`.
- Later logs/readlists can use MDX or local TS arrays.

## Proof gaps

Add `needsProof` fields instead of inventing claims.

Examples:

- needs screenshot
- needs deployment link
- needs repo URL
- needs architecture diagram
- needs metric
- needs before/after note

## Deliverables when invoked

Produce:

- recommended data schema
- example data entries
- migration plan from hardcoded content
- content gap list
- file-by-file implementation plan

## Final checklist

- Is content editable?
- Is proof separate from claim?
- Can sections filter each other?
- Are flagship projects separated from tiny builds?
- Can Codex update content without touching layout?
