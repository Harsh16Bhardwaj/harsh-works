---
name: github-proof-cartographer
description: Analyzing GitHub repositories, clustering repos, building GitHub Map data, extracting proof from codebases, and deciding portfolio visibility.
---

# GitHub Proof Cartographer

## Mission
Convert Harsh's GitHub into a structured proof trail.

Do not create a raw repo grid.
Do not treat every repo as equally important.
Do not use stars/forks as the main proof.

The goal is to answer:

> What does this repository prove about Harsh's builder ability?

## Preferred MCP
Use GitHub MCP when available.

Use it to inspect:

- repo names
- READMEs
- package files
- folder structure
- commit patterns
- notebooks
- screenshots/assets
- issue/PR history
- deployment links

Do not invent repo details. If the repo lacks proof, mark it as `needs-proof`.

## Cluster taxonomy

Every repo should map to one of these clusters:

### ML Lab
Repos/notebooks that show:

- EDA
- regression/classification
- feature engineering
- metric tradeoffs
- validation notes
- model comparison
- data cleaning
- error analysis

### Full-Stack Systems
Repos that show:

- auth
- database
- dashboards
- queues
- API design
- deployment
- product workflows
- multi-page UX
- serious frontend/backend integration

### Automation
Repos/scripts that show:

- scraping
- Playwright/Selenium
- batch processing
- file generation
- queue workers
- agent workflows
- data extraction
- workflow automation

### Learning Repos
Repos that show:

- DSA
- SQL
- OS/core subjects
- ML notes
- interview prep
- algorithm references
- public study trails

### Tiny Builds
Small but interesting:

- UI experiments
- weekend apps
- small tools
- mini dashboards
- proof-of-concept builds

### Archived / Hidden
Should not be prominent:

- abandoned
- duplicate
- weak proof
- broken
- outdated
- no README
- unclear purpose

## Repo extraction schema

For each repo, produce:

```ts
export type RepoProof = {
  name: string;
  slug: string;
  url?: string;
  cluster: 'ML Lab' | 'Full-Stack Systems' | 'Automation' | 'Learning Repos' | 'Tiny Builds' | 'Archived';
  maturity: 'case-file' | 'serious' | 'learning' | 'tiny' | 'archived' | 'needs-proof';
  visibility: 'hero' | 'project-gallery' | 'github-map' | 'tiny-shelf' | 'hidden';
  oneLineIdentity: string;
  whatItProves: string[];
  evidence: {
    readme?: boolean;
    screenshots?: boolean;
    deployment?: string;
    notebooks?: boolean;
    tests?: boolean;
    commits?: string;
    notes?: string;
  };
  technologies: string[];
  relatedProjects: string[];
  needs: string[];
};
```

## Visibility rules

### Project Gallery
Only include serious selected projects:

- NameFrame
- PersonalCloud
- JEDI
- ClipHawk
- ML Atlas
- FIFA Predictor

### GitHub Map
Can include more repos, but grouped.

### Tiny Builds Shelf
Small experiments belong here, not in main gallery.

### Hidden
Hide anything that weakens the first impression.

## Proof scoring

Score each repo from 0-5:

0 = broken/no value
1 = weak or unclear
2 = learning exercise
3 = useful tiny/learning artifact
4 = serious project or strong proof
5 = flagship case file

Scoring factors:

- Has clear problem
- Has real system structure
- Has README/docs
- Has deployment/demo/screenshot
- Shows tradeoffs
- Shows data/model/architecture decisions
- Connects to Harsh's identity

## Output tasks

When invoked, update or produce:

- `references/github-clusters.md`
- `references/project-inventory.md`
- `src/data/github-map.ts`
- `src/data/projects.ts`
- a `needs-proof.md` list

## Copy rules

Bad:

> A React project using Tailwind.

Better:

> A certificate automation system that turns CSV event data into verified, batch-delivered certificates.

Bad:

> ML model for prediction.

Better:

> A sports prediction notebook focused on match-state features, validation choices, and metric tradeoffs.

## Final review checklist

- Are serious projects separated from tiny builds?
- Does each repo have a one-line proof claim?
- Are weak repos hidden or marked as learning?
- Does the map show range without looking messy?
- Is there no fake metric or invented claim?
