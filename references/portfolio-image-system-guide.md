# Portfolio Image System Guide

This file documents the visual universe we planned for Harsh Bhardwaj's portfolio: what image belongs to which section, when to use it, how it should transition, and what content should sit on top of it.

The main visual direction is a **minimal Dune-inspired sci-fi editorial universe**: vast desert horizons, moons, dunes, observation decks, dark teal cosmic chambers, planetary footer visuals, and light editorial case-file sections.

---

## 1. Core Visual Universe

The portfolio should feel like one continuous world, not a random set of images.

### Primary visual language

- Minimal sci-fi desert world
- Long horizons
- Dunes and distant ridges
- One huge moon / celestial body
- Muted rose, peach, mauve, violet, sand, indigo
- Later transition into dark teal, blue-black, galaxy, Milky Way visuals
- Editorial case-file layouts for projects and blogs
- No generic SaaS/dashboard aesthetic
- No over-realistic photo look where possible
- No random tech icons dumped on top

### Mood words

Use these consistently:

- cinematic
- minimal
- spacious
- premium
- quiet
- monumental
- proof-oriented
- systems-builder
- sci-fi editorial

---

## 2. High-Level Section Order

Final working order after our latest changes:

1. **Hero / Landing**
2. **About Me / Builder Thesis**
3. **Work Console / Work Experience**
4. **Projects / Case Files**
5. **ML Lab / Data Experiments**
6. **Experience / Duke History**
7. **Field Notes / Blogs**
8. **Resources / Spice Storage**
9. **Wall of Honor / Hitlist**
10. **Build Wishlist / Orbitals**
11. **Footer / Planet Heatmap + Links**

Important update: **GitHub Map / heatmap should not be a large mid-page section.** It can be placed near the footer, over the dark planet surface, with links and copyright below the sun flare.

---

## 3. Section-by-Section Image Usage

## 3.1 Hero / Landing

### Selected image concept

A lone robed figure standing on a dune ridge under a huge moon.

### Visual role

This is the identity image. It introduces the universe and sets the emotional tone.

### Use when

Use this as the first full-screen hero background.

### Content overlay

Primary hierarchy:

1. `Harsh Bhardwaj`
2. Builder identity line
3. Short proof-trail sentence
4. Small chips and CTAs

Suggested copy:

```txt
Harsh Bhardwaj
Builder of ML products, full-stack systems, automation workflows, and public learning trails.

I turn rough ideas into working artifacts — products, models, automation tools, notes, and build logs that show how I think.
```

### Layout guidance

- Keep text on the left or lower-left.
- Do not cover the figure/moon focal point.
- Use large negative space.
- Do not add heavy UI cards.
- Keep chips minimal.

### Current candidate asset

```txt
/mnt/data/lonely_figure_under_the_glowing_moon.png
/mnt/data/92e27e50-6fcb-4434-93c6-c603a85f48ee.png
```

---

## 3.2 About Me / Builder Thesis

### Selected image concept

A futuristic desert observation deck / base interior overlooking the same rose-violet desert and moon world.

### Visual role

This bridges the open hero landscape into the personal world. The hero says, “this is the universe.” The About section says, “this is how I think inside it.”

### Use when

Use immediately after the hero.

### Transition from hero

The bottom of the hero has dune darkness and desert depth. The About section should feel like the viewer has entered a nearby base or observation room overlooking the same dunes.

### Content overlay

Title options:

```txt
Builder Thesis
```

or

```txt
Not a portfolio of claims. A trail of decisions.
```

Body:

```txt
I learn by building public artifacts. Every repo, notebook, utility, model, and field note becomes part of a proof trail — showing not just what I built, but how I worked through tradeoffs, mistakes, and iteration.
```

Small loop:

```txt
Learn → Build → Break → Document → Ship
```

Supporting pillars:

1. **Systems**  
   I turn scattered problems into working systems.

2. **Proof**  
   GitHub, notes, projects, and build logs become the public trail.

3. **Leverage**  
   I care about tools, automation, and workflows that compound.

### Layout guidance

- Keep About less dramatic than Hero.
- Use one main paragraph and 3 compact pillars.
- Do not make it a huge resume block.
- Put text in the darker/cleaner region of the image.
- Use glass/soft panels only if readability needs it.

### Current candidate assets

Two strongest About candidates:

```txt
/mnt/data/futuristic_architectural_view_at_sunset.png
/mnt/data/futuristic_terrace_overlooking_a_desert_expanse.png
```

The first candidate is stronger for an intimate “inside the base” feeling.  
The second candidate is stronger if we want the transition to remain more exterior/desert-facing.

---

## 3.3 Work Console / Work Experience

### Important content change

This section will contain **3 work experiences scattered across time**, so it will take roughly **1.7 visible heights**. Therefore, it should use **two seamless background images** stacked vertically.

### Visual role

This section should feel like a darker work/rank chamber. It moves from the warm desert base into a grand cosmic teal observatory.

The About section says:

```txt
This is how I think.
```

The Work Console says:

```txt
This is where the work record lives.
```

### Image style

Use dark teal / blue-black / Milky Way / cosmic observatory imagery.

Important correction from the last iteration:

- Keep it stylized and cinematic.
- Do not make it too photorealistic.
- Do not make it too busy.
- Keep strong texture sharpness.
- Keep dark teal as the main palette.
- Use Milky Way as the grand visual identity.

### Two-image structure

#### Work Console Image 1 — Top half

Use for the beginning of the Work Console section.

Should include:

- grand futuristic observatory
- dark teal palette
- large Milky Way visible
- curved architecture
- circular floor / platform
- enough negative space for title and first work item
- top still has some architectural presence

Best current assets:

```txt
/mnt/data/futuristic_observatory_overlooking_the_cosmos.png
/mnt/data/futuristic_observatory_under_starry_skies.png
/mnt/data/futuristic_observatory_under_the_stars.png
/mnt/data/futuristic_observatory_with_cosmic_view.png
```

#### Work Console Image 2 — Bottom half

Use directly below Image 1.

Should include:

- continuation of teal cosmic chamber
- darker, cleaner space
- starfield / nebula / Milky Way haze
- minimal ring lines or floor geometry near top
- mostly open dark region for second and third work entries

Best current asset:

```txt
/mnt/data/cosmic_rings_and_nebula_haze.png
```

### Seam rule

When stacking the two Work Console images:

- Top image bottom edge should fade into deep teal/indigo.
- Bottom image top edge should begin with similar deep teal/indigo and faint floor/ring hints.
- Add a CSS overlay gradient between them if needed:

```css
background: linear-gradient(
  to bottom,
  rgba(3, 20, 30, 0) 0%,
  rgba(3, 20, 30, 0.65) 55%,
  rgba(3, 20, 30, 1) 100%
);
```

### Content overlay

Section title:

```txt
Work Console
```

Subtitle:

```txt
Three work records across time — where systems, responsibility, and learning started becoming real.
```

Alternative section title if you want more worldbuilding:

```txt
Duke History
```

or

```txt
Field Record
```

Experience cards should be large, not tiny.

Recommended card pattern:

```txt
01 / Role Name
Organization · Timeline

What I actually did in 2–3 lines.

Proof / tools / output chips
```

### Layout guidance

- Use three large vertical records.
- Do not use a dense timeline with tiny text.
- Place cards on alternating left/right positions if the background allows.
- Keep text in pale cyan/off-white.
- Use faint teal borders and small mono labels.
- Avoid orange here; this section should feel like a new colder chapter.

---

## 3.4 Projects / Case Files

### Visual concept

Light editorial case-file layout, inspired by the attached references with “Project Horizon”, “Sietch Platform”, and “Case Files”.

### Visual role

Projects need readability. Do not use a full cinematic background for every project. Use an editorial archive style.

### Use when

Use after Work Console.

### Background style

- Pale sand / ivory / off-white background
- Black or deep charcoal typography
- Serif headings
- Mono labels
- Framed project images
- Case-study buttons
- Lots of whitespace

### Content overlay

Section title:

```txt
Case Files
```

or

```txt
Selected Systems
```

Project list:

- NameFrame — Certificate automation system
- PersonalCloud — Personal storage and sync system
- JEDI — Job intelligence and ranking workflow
- ClipHawk — Reels intelligence and scraping pipeline
- ML Atlas — Public ML learning trail
- FIFA Predictor — Sports ML prediction experiment

### Layout guidance

Use 2–3 large featured projects first.

Example pattern:

```txt
[large image]        01 / SYSTEM DESIGN
                     NameFrame
                     Certificate automation system...
                     [NEXT.JS] [PRISMA] [QUEUE]
                     Read case study →
```

Then a “See more projects” / “Open Archive” action.

### Do not

- Do not make this a cluttered grid.
- Do not use tiny equal cards for all 6 projects.
- Do not add too much sci-fi decoration.
- Do not over-darken this section; it should give the user visual relief after the teal Work Console.

---

## 3.5 ML Lab / Data Experiments

### Visual concept

A desert research lab / analytical chamber.

### Visual role

This section should show model thinking, metrics, experiments, validation notes, and learning from ML/data work.

### Image idea

- Minimal research station inside a desert base
- Large screens are okay, but no visible fake UI text in the image
- Abstract model charts can be added in frontend overlay, not baked into image
- Spice-like particle flow or sand-data metaphor can appear subtly

### Content

Use this for:

- ML case-study wall
- metrics decisions
- validation notes
- false positive / false negative tradeoffs
- EDA learnings
- notebooks

### Layout guidance

- Cards can be darker or sand-toned.
- Keep diagrams as real frontend elements, not generated text in images.
- Use 2-column layout: left explanation, right metrics/notes.

---

## 3.6 Experience / Duke History

### Visual concept

Dark blue / teal-black sky full of stars, visible Milky Way, rank-record energy.

### Visual role

This section is about progression, history, and work/role evolution.

Since Work Console may already cover work experience, use this section only if you want a more theatrical version of experience/history.

### Section name options

```txt
Duke History
Service Record
Field Record
Command History
```

### Layout guidance

- Use vertical timeline or rank plaques.
- Use light typography on dark sky.
- Add subtle gold/teal lines.
- Avoid making it game-like.

---

## 3.7 Field Notes / Blogs

### Visual concept

Light editorial / desert archive.

### Visual role

This is for writing, blog posts, reflections, engineering notes.

### Background style

Use the attached editorial references:

- off-white / pale sand
- large serif title
- framed image blocks
- small uppercase category labels
- restrained buttons

### Content

Show 3 featured notes first, then a “See more” button.

Suggested section names:

```txt
Field Notes
Dispatches
Written Records
Build Logs
```

### Layout guidance

- Do not show too many posts at once.
- Use 3 featured cards and one archive CTA.
- Keep this clean and readable.

---

## 3.8 Resources / Spice Storage

### Visual concept

Spice storage facilities / archive silos.

### Visual role

This is the materials dump: PDFs, sheets, notebooks, checklists, reports, model outputs.

### Image idea

- Large storage chamber
- rows of silos / containers / vaults
- warm sand palette or muted industrial dark
- subtle glowing labels added via frontend, not baked into image

### Section names

```txt
Resource Silos
Spice Stores
Knowledge Vault
Field Storage
Materials Archive
```

### Layout guidance

- Use shelf-like cards.
- Group materials by type:
  - Notebooks
  - Reports
  - Sheets
  - Checklists
  - PDFs
  - Model outputs
- Keep each resource card simple.

---

## 3.9 Wall of Honor / Hitlist

### Visual concept

A dark hall with golden/brass frames or plaques.

### Visual role

This represents ambition, targets, achievements, or dream-company hitlist.

### Image idea

- Dim hall
- golden frames
- spotlight glows
- premium plaques
- not too game-like

### Section names

```txt
Wall of Honor
The Hitlist
Targets
Command Board
```

### Layout guidance

- Use restrained gold highlights.
- Do not overdo shine.
- Each item should feel like a framed objective, not a cheesy trophy.

---

## 3.10 Build Wishlist / Orbitals

### Visual concept

Orbital chart / planets / future signals.

### Visual role

Future-looking roadmap: next builds, paused ideas, dream builds, ideas needing data/deployment.

### Image idea

- Dark space map
- planets / orbital rings
- faint labels via frontend
- small nodes around large planets

### Section names

```txt
In Orbit
Build Constellation
Future Signals
Orbitals
```

### Layout guidance

- Use node cards in orbit paths.
- Group by status:
  - Next
  - Paused
  - Needs data
  - Needs deployment
  - Dream build

---

## 3.11 Footer / GitHub Heatmap + Links

### Final footer concept

A huge dark planet occupies the upper portion of the footer. A sun gleams from behind its lower rim. Below the flare, the image fades into darkness.

This is where the GitHub contribution heatmap can go.

### Why GitHub moved here

The GitHub heatmap is useful, but not big enough to carry a full major section. It works better as a footer/world-ending detail.

### Use when

Use as the final page section.

### Layout

- Heatmap goes on the dark planet surface.
- Links and copyright go below the flare, in the dark fade area.
- Keep social links minimal.

### Important image requirements

The planet must be:

- dark enough for heatmap visibility
- textured enough to feel physical
- not too vivid or colorful
- mostly monotone
- upper half of the image
- lower portion should fade into dark gradient

### Current candidate assets

```txt
/mnt/data/surreal_planet_edge_with_glowing_horizon.png
/mnt/data/crescent_planet_with_fiery_horizon_glow.png
/mnt/data/luminous_horizon_and_distant_planet.png
/mnt/data/dawn_over_a_distant_planet_surface.png
/mnt/data/dawn_on_a_distant_world.png
```

Best direction based on our latest requirement:

- Use one of the darker planet versions.
- Avoid the brighter warm one if the heatmap lacks contrast.
- Overlay heatmap in light teal / soft green / pale amber depending on final palette.

### Footer content

Footer copy can be minimal:

```txt
GitHub proof trail
Contribution heatmap

GitHub · LinkedIn · Email · Resume
© Harsh Bhardwaj
```

### CSS overlay idea

Add a dark overlay to make heatmap readable:

```css
.footer-planet::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.25) 40%,
    rgba(0, 0, 0, 0.95) 100%
  );
}
```

---

## 4. Image Transition Rules

### Hero → About

Open dune exterior becomes an observation base interior.

Use:

- same rose/mauve/desert palette
- same moon/world logic
- gradually introduce architecture

Avoid:

- sudden dark teal jump here
- completely new planet/space scene

---

### About → Work Console

Warm base interior transitions into dark teal cosmic chamber.

Use:

- curved architecture continuity
- fade from warm rose/orange into navy/teal
- reduce desert visibility
- introduce stars and Milky Way

Avoid:

- immediately cutting to pure space without architectural bridge
- making it too realistic

---

### Work Console Image 1 → Work Console Image 2

Grand teal observatory continues downward into darker starfield / cosmic floor.

Use:

- same teal/indigo palette
- same floor/ring geometry
- same Milky Way/nebula texture
- CSS gradient between images if needed

Avoid:

- different architecture style
- different scale
- sudden color change

---

### Work Console → Projects

Dark cosmic section should resolve into a light editorial archive.

Use:

- fade from deep teal/black into ivory/sand
- maybe a thin divider resembling a case-file page edge
- projects should feel like records pulled from the universe

Avoid:

- another dark cinematic background immediately after Work Console

---

### Projects → Later Sections

After Projects, alternate heavy and light sections to avoid fatigue.

Recommended rhythm:

```txt
Dark cinematic → Light editorial → Dark lab → Light notes/resources → Dark footer
```

---

## 5. Overlay and Readability Rules

### For image-heavy sections

- Use large text blocks, not many tiny labels.
- Add subtle dark overlays when text sits on bright image areas.
- Keep generated images free of text and UI.
- Build actual UI in frontend, not inside the image.

### Text colors

For desert/warm sections:

```txt
Primary text: #fff5ea / #f6e7d6
Muted text: #d6b8a8
Accent: #ff9b75 / #f0b37e
```

For teal/cosmic sections:

```txt
Primary text: #e8ffff
Muted text: #8bbec4
Accent: #32e0d0 / #7fffe7
Panel border: rgba(127, 255, 231, 0.22)
```

For editorial sections:

```txt
Primary text: #17130f
Muted text: #6d6259
Accent: #a66a4f / #b97552
Background: #f5efe5 / #efe6d9
```

---

## 6. Image Generation Rules Going Forward

Whenever generating the next section image, use these constraints:

1. Generate **4 variants** first.
2. Pick one.
3. Generate the next section by matching the selected image’s bottom edge / mood.
4. No text inside the image.
5. No UI inside the image unless it is abstract and unreadable.
6. Preserve the same universe.
7. Avoid photorealism unless specifically requested.
8. Keep negative space for content.
9. For long sections, use 2 seamless images.
10. Always decide the section’s content density before generating the image.

---

## 7. Current Visual Decisions

### Locked / preferred

- Hero: lone figure on dune under huge moon.
- About: observation deck / desert base interior.
- Work Console: dark teal cosmic observatory with Milky Way.
- Footer: dark planet with flare, heatmap on planet, links below.

### Still to decide

- Which About image between the two candidates.
- Which teal Work Console variant to use as Image 1.
- Whether Work Console should be named `Work Console`, `Field Record`, or `Duke History`.
- How project cards should be visually paired with generated project images.
- Whether the Hitlist section should be included or kept private.

---

## 8. Recommended Implementation Strategy

### Step 1

Finalize Hero, About, Work Console Image 1, Work Console Image 2, and Footer.

### Step 2

Build a vertical prototype with only these sections:

1. Hero
2. About
3. Work Console
4. Projects placeholder
5. Footer

### Step 3

Test seamlessness before generating the rest.

### Step 4

Generate project/case-file images only after the layout is decided.

---

## 9. Short Summary Table

| Section | Image style | Purpose | Content density | Notes |
|---|---|---:|---:|---|
| Hero | Lone dune figure + huge moon | Identity | Low | Keep text minimal |
| About | Observation deck / desert base | Builder thesis | Medium | 1 note + 3 pillars |
| Work Console | Dark teal cosmic observatory | Work experience | High | Needs 2 images |
| Projects | Light editorial case files | Proof/projects | High | Use layout, not full BG |
| ML Lab | Research chamber / data lab | ML thinking | Medium-high | Use frontend diagrams |
| Experience / Duke History | Starry rank-history scene | Progression | Medium | Optional if Work covers exp |
| Field Notes | Light editorial archive | Blogs/writing | Medium | 3 featured + See more |
| Resources | Spice storage / vault | Materials | Medium | Shelf/card layout |
| Hitlist | Gold framed hall | Targets/ambition | Low-medium | Keep classy |
| Wishlist | Orbital roadmap | Future builds | Medium | Planets/nodes |
| Footer | Dark planet + flare | Heatmap/contact | Low | Heatmap on planet |

---

## 10. Core Sentence for the Portfolio

Everything should eventually support this impression:

```txt
Harsh Bhardwaj — a systems builder with a public proof trail.
```
