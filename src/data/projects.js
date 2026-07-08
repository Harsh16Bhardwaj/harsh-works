export const projects = [
  {
    id: "nameframe",
    name: "NameFrame",
    lane: "full-stack",
    type: "Production web system",
    maturity: "flagship",
    oneLine: "Certificate automation system for organizers, templates, imports, verification, and delivery workflows.",
    problem: "Event teams need certificate generation that does not collapse into manual editing and fragile email sending.",
    system:
      "Next.js product with event dashboards, participant imports, preview flows, verification routes, and queue-backed delivery state.",
    proof: [
      "Template mapping and participant import preview",
      "Delivery jobs, queue items, attempts, retries, and verification codes",
      "Live organizer-facing product surface",
    ],
    tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Clerk"],
    links: {
      github: "https://github.com/Harsh16Bhardwaj/NameFrame",
      demo: "https://www.nameframe.site/",
    },
  },
  {
    id: "personalcloud",
    name: "PersonalCloud",
    lane: "full-stack",
    type: "Private infrastructure",
    maturity: "serious",
    oneLine: "Local-first private cloud that turns a Windows PC into a trusted storage server.",
    problem: "Personal files need ownership, search, previews, and remote access without throwing the whole surface at a public SaaS.",
    system:
      "Next.js BFF with signed sessions plus FastAPI storage service constrained to one configured storage root.",
    proof: [
      "Upload, preview, search, archive, move, copy, rename, and soft delete flows",
      "Internal token hidden behind a browser-facing BFF",
      "Designed for Tailscale access and Windows watchdog startup",
    ],
    tech: ["Next.js", "FastAPI", "Python", "BFF", "Tailscale"],
    links: {},
  },
  {
    id: "jedi",
    name: "JEDI",
    lane: "ml-data",
    type: "ML ranking product",
    maturity: "flagship",
    oneLine: "Job intelligence and profile-fit ranking pipeline for daily role review.",
    problem: "Raw job lists are noisy; useful review needs ranking, enrichment, and a guardrail against weak matches.",
    system:
      "Annotated dataset, fit scoring, preference scoring, apply-probability guardrail, and local review outputs.",
    proof: [
      "691 cleaned annotated rows with repaired experience fit and salary buckets",
      "Final classifier reached 93.20% ROC-AUC",
      "Ranking output reached Precision@50 of 90.80% and NDCG@50 of 0.9244",
    ],
    tech: ["Python", "XGBoost", "Pandas", "scikit-learn", "Ranking"],
    links: {},
  },
  {
    id: "cliphawk",
    name: "ClipHawk",
    lane: "automation-learning",
    type: "Automation pipeline",
    maturity: "serious",
    oneLine: "Instagram/Reels intelligence scraping and classification workflow.",
    problem: "Creator discovery needs structured commercial signals, not manual scrolling and copied URLs.",
    system:
      "Playwright session persistence, parallel scraping modes, metadata extraction, and JSON/CSV handoff.",
    proof: [
      "Scrapes reel URLs, views, likes, comments, captions, bios, categories, and follower data",
      "Supports single, quick, and multi-browser scraping modes",
      "Outputs structured exports for downstream screening dashboards",
    ],
    tech: ["Python", "Playwright", "Pydantic", "JSON", "CSV"],
    links: {
      github: "https://github.com/Harsh16Bhardwaj/ClipHawk-Screener",
    },
  },
  {
    id: "ml-atlas",
    name: "ML Atlas",
    lane: "ml-data",
    type: "Learning platform",
    maturity: "serious",
    oneLine: "Machine-learning education system with chapters, visual labs, and revision modes.",
    problem: "ML learning often disappears into scattered notes without an inspectable public artifact.",
    system:
      "Topic registry, visual labs, interview drawers, revision tracks, and reusable topic components.",
    proof: [
      "Covers foundations, tree methods, clustering, dimensionality reduction, evaluation, and feature engineering",
      "Topic pages split intuition, theory, math, implementation, evaluation, mistakes, and use cases",
      "Designed as a study product rather than loose notes",
    ],
    tech: ["Next.js", "TypeScript", "ML Content", "Visual Labs"],
    links: {
      github: "https://github.com/Harsh16Bhardwaj/ML101",
      demo: "https://ml-101-tau.vercel.app/",
    },
  },
  {
    id: "fifa-predictor",
    name: "FIFA Predictor",
    lane: "ml-data",
    type: "ML systems research",
    maturity: "blueprint",
    oneLine: "Probabilistic World Cup prediction design with priors, live updates, and simulation.",
    problem: "A useful sports model needs source coverage, calibration, and confidence, not one black-box score.",
    system:
      "Three-block pre-match score, live match-state update path, missing-data confidence, and tournament simulation framing.",
    proof: [
      "Mapped general trends, historical team trends, and current player/team context",
      "Defined source coverage across rankings, open match data, weather, odds, and provider APIs",
      "Planned calibration and simulation outputs as first-class model artifacts",
    ],
    tech: ["Probability", "Calibration", "Feature Design", "Simulation"],
    links: {},
  },
];
