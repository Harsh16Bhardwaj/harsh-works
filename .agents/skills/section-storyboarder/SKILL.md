---
name: section-storyboarder
description: Storyboarding portfolio sections, scroll narrative, first-five-section planning, section purpose, section interaction, and component breakdown.
---

# Section Storyboarder

## Mission
Turn Harsh's portfolio into a scroll story with strong sequence and intentional emotional pacing.

The first five sections must feel like:

1. Identity
2. Thesis
3. Proof map
4. Work operating system
5. Serious case-file gallery

This is not a resume page. It is a guided reveal of how Harsh builds.

## Fixed first five section order

### 1. Hero / Current Identity

Purpose:
Immediate positioning and visual memory.

Core message:

> I build ML products, full-stack systems, and public learning trails.

Must show:

- Name
- Role direction
- Live status chips
- Sakura-petal scene or equivalent visual anchor
- Primary CTA
- Secondary CTA

Visual metaphor:

- boot screen
- builder console
- cinematic quiet garden + technical overlay
- petals drifting over a dark system grid

Interaction:

- subtle cursor movement in petal scene
- live status chips hover/focus
- CTA magnetic hover only if tasteful

Animation:

- text reveals in 2-3 beats
- chips appear staggered
- petals always slow and non-distracting

Do not include:

- all skills
- all projects
- long paragraph
- noisy 3D

### 2. About Me / Builder Thesis

Purpose:
Explain how Harsh thinks and learns.

Core message:

> I learn by building public artifacts and turning GitHub into a proof trail.

Must show:

- Learn -> Build -> Break -> Document -> Ship
- GitHub as proof trail
- Evidence-based builder identity

Visual metaphor:

- thesis card
- field-note excerpt
- small flow diagram

Interaction:

- hover on each step to reveal concrete example

Animation:

- calm staggered text reveal
- small line/path drawing animation

Do not include:

- childhood story
- generic motivation
- paragraph wall

### 3. GitHub Map

Purpose:
Show GitHub as structured proof instead of a raw repo dump.

Core message:

> The repos are clustered into systems, labs, utilities, learning trails, and tiny builds.

Clusters:

- ML Lab
- Full-Stack Systems
- Automation
- Learning Repos
- Tiny Builds
- Archived / Experiments

Visual metaphor:

- constellation map
- system graph
- repo clusters
- proof density map

Interaction:

- filter by cluster
- hover repo for one-line proof
- click repo to open case file or GitHub link

Animation:

- nodes settle into clusters
- selected cluster expands
- weak connections fade

Do not include:

- every repo as equal importance
- huge GitHub API dump
- empty stars/forks vanity

### 4. Work Console

Purpose:
Show what Harsh actually does.

Core message:

> My work sits across ML + Data, Full-stack Products, and Automation + Learning Systems.

Lanes:

1. ML + Data
2. Full-stack Products
3. Automation + Learning Systems

Each lane must include:

- Current work
- What outputs it creates
- Tools/practices
- Project examples
- Proof artifacts

Visual metaphor:

- three vertical console lanes
- operating dashboard
- command center

Interaction:

- lane hover expands details
- selected lane highlights related projects
- quick filters to project gallery

Animation:

- console boot sequence
- lanes load from top to bottom
- status indicators pulse subtly

Do not include:

- generic skills cloud
- too much text
- unrelated technologies

### 5. Project Gallery

Purpose:
Present serious selected projects only.

Projects:

- NameFrame
- PersonalCloud
- JEDI
- ClipHawk
- ML Atlas
- FIFA Predictor

Core message:

> These are the main systems worth inspecting.

Card format:

- Name
- System identity
- Problem -> System -> Proof
- Tech tags
- Maturity badge
- Open Case File CTA

Visual metaphor:

- case files
- build archive
- serious project wall

Interaction:

- click opens case panel or route
- filter by lane from Work Console
- hover reveals architecture mini-map

Animation:

- cards reveal as files/cards sliding into grid
- selected card expands with layout animation

Do not include:

- tiny builds
- half-baked repos
- duplicate learning exercises

## Story pacing

Section pacing should feel like this:

- Hero: emotional hook
- About: intellectual hook
- GitHub Map: proof hook
- Work Console: capability hook
- Project Gallery: inspection hook

## Component breakdown template

When planning implementation, output:

```txt
SectionName
- Purpose
- User memory after section
- Components
- Data needed
- Copy needed
- Animation needed
- Interaction needed
- Edge cases
- Mobile behavior
```

## Mobile rules

Mobile must not be a degraded desktop.

- Hero: shorter text, petals reduced, chips scroll horizontally if needed.
- About: thesis flow becomes vertical.
- GitHub Map: cluster list + simplified node view.
- Work Console: lanes become stacked accordions.
- Project Gallery: one-card column with filters.

## Completion checklist

Before calling a section done:

- Does it have a clear purpose?
- Does it prove something?
- Is the copy specific?
- Is mobile planned?
- Is there one dominant visual idea?
- Does the next section naturally follow?
