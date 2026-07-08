"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import { ArrowUpRight, Database, GitCommitHorizontal, GitFork, Radio, Star } from "lucide-react";
import { HeroScene } from "./HeroScene.jsx";
import { experiences } from "./data/experiences.js";
import { githubArchive, heatmapWeeks } from "./data/githubMap.js";
import { links } from "./data/identity.js";
import { projects } from "./data/projects.js";
import { workLanes } from "./data/workLanes.js";

function ExternalLink({ href, children, className = "", icon: Icon = ArrowUpRight }) {
  return (
    <a className={`action-link ${className}`} href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <Icon size={17} strokeWidth={1.8} />
    </a>
  );
}

function SectionHeading({ kicker, title, copy, align = "left" }) {
  return (
    <div className={`section-heading ${align === "split" ? "section-heading--split" : ""}`}>
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-section" id="top" data-motion-section>
      <HeroScene density={1.45} />
      <div className="hero-atmosphere" aria-hidden="true" />

      <div className="hero-content">
        <h1 className="hero-title-stack motion-item" aria-label="Trying Building, Thinking and Engineering, Harsh Bhardwaj">
          <span className="hero-title-line">Thinking,</span>
          <span className="hero-title-line">Building &amp; Engineering..</span>
          <span className="hero-title-line hero-title-line--name">HARSH BHARDWAJ</span>
        </h1>
        <p className="hero-subline motion-item">
          Architecting intelligent systems across the stack. From foundational models to deployed
          applications, building artifacts that prove capability.
        </p>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section-band about-section" id="about" data-motion-section>
      <div className="about-transition" aria-hidden="true" />
      <div className="about-moon" aria-hidden="true" />
      <HeroScene className="about-scene" />
      <div className="section-inner about-story">
        <div className="about-intro motion-item mt-5">
          <p className="section-kicker">02 / About Me</p>
          <h2>Who am I ?</h2>
          <div className="about-copy">
            <p>
              Hello, I&apos;m Harsh Bhardwaj, an engineer from Delhi with a strong interest in
              building things that are both useful and well-crafted. I specialize in full-stack
              development and, over the last six months, I&apos;ve been actively exploring machine
              learning to expand the way I think about technology and problem-solving.
            </p>
            <p>
              Outside of tech, I love sports, stories, films, and consuming all kinds of content
              that keeps my perspective fresh. Long term, I hope to build something of my own and
              grow it into a meaningful business by the time I&apos;m 40.
            </p>
          </div>
        </div>

        <div className="about-panels motion-item">
          <article className="about-panel about-panel--study">
            <span>EDUCATION</span>
            <div className="education-list">
              <article>
                <h3 className="education-title">
                  <span className="education-icon education-icon--college" aria-hidden="true" />
                  Maharaja Agrasen Institute of Technology 
                </h3>
                <p>Bachelor of Technology in Computer Science (2023 - 2027)</p>
                <p>CGPA: 8.95</p>
                <p>Specialisation: Machine Learning &amp; Data Analytics</p>
              </article>
              <article>
                <h3 className="education-title">
                  <span className="education-icon education-icon--course" aria-hidden="true" />
                  SIC Course in Data Analysis
                </h3>
                <p>Dec 2025 - Mar 2026, Conducted by samsung</p>
                <p>Completed coursework focused on data analysis concepts.</p>
              </article>
              
            </div>
          </article>

          <article className="about-panel about-panel--philosophy">
            <span>MY PHILOSOPHY OF ENGINEERING</span>
            <p>
              I believe engineering is at its best when it solves a real problem, even if that
              problem belongs to just one person.
            </p>
            <p>
              For me, building is not only about writing code or shipping features. It is about
              creating tools, systems, websites, automations, and experiences that make something
              easier, faster, clearer, or more useful than it was before.
            </p>
            <p>
              I also believe imagination is one of the most underrated skills an engineer can have.
              Good engineering starts with understanding constraints, but great engineering begins
              with being able to imagine a better way through them.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function WorklogTimelineSection() {
  const sectionRef = useRef(null);
  const anchorRef = useRef(null);
  const trackRef = useRef(null);
  const lineRef = useRef(null);
  const curtainRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [scrollActiveIndex, setScrollActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const activeIndex = previewIndex ?? scrollActiveIndex;
  const trackStep = viewportWidth < 900 ? 0 : 768;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 820px)").matches;

    let targetX = 0;
    let currentX = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let animationFrame = 0;

    const animateTrack = () => {
      currentX += (targetX - currentX) * 0.11;
      currentProgress += (targetProgress - currentProgress) * 0.1;
      const nextSmoothedIndex = Math.min(
        experiences.length - 1,
        Math.max(0, Math.round(currentProgress * (experiences.length - 1))),
      );
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`;
      }
      if (lineRef.current) {
        lineRef.current.style.width = `${Math.max(8, currentProgress * 100)}%`;
      }
      if (activeIndexRef.current !== nextSmoothedIndex) {
        activeIndexRef.current = nextSmoothedIndex;
        setScrollActiveIndex(nextSmoothedIndex);
      }
      if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetProgress - currentProgress) > 0.002) {
        animationFrame = requestAnimationFrame(animateTrack);
      }
    };

    const update = () => {
      const anchor = anchorRef.current;
      setViewportWidth(window.innerWidth);
      if (reduceMotion || mobile) {
        if (lineRef.current) lineRef.current.style.width = "8%";
        if (trackRef.current) trackRef.current.style.transform = "translate3d(0, 0, 0)";
        if (curtainRef.current) curtainRef.current.style.transform = "translate3d(0, 100%, 0)";
        activeIndexRef.current = 0;
        setScrollActiveIndex(0);
        return;
      }

      const anchorTop = anchor?.getBoundingClientRect().top ?? section.getBoundingClientRect().top;
      const anchorOffset = anchor?.offsetTop ?? 0;
      const scrollable = Math.max(1, section.offsetHeight - anchorOffset - window.innerHeight);
      const rawProgress = Math.min(1, Math.max(0, -anchorTop / scrollable));
      const nextProgress = Math.min(1, Math.max(0, rawProgress / 0.985));
      const curtainProgress = Math.min(1, Math.max(0, rawProgress / 0.04));
      if (curtainRef.current) {
        curtainRef.current.style.transform = `translate3d(0, ${(1 - curtainProgress) * 100}%, 0)`;
      }

      targetProgress = nextProgress;
      targetX = window.innerWidth * 0.5 - 33 - nextProgress * trackStep * (experiences.length - 1);
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(animateTrack);
    };

    let raf = 0;
    const requestUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section className="section-band worklog-section" id="worklog" ref={sectionRef} data-motion-section>
      <div className="worklog-header">
        <p className="section-kicker">03 / Worklog</p>
        <h2>Mission log, latest first.</h2>
        <p>
          A horizontal work trail across contracts, AI evaluation, startup building, product
          engineering, and mentorship.
        </p>
      </div>

      <div className="worklog-scroll-anchor" ref={anchorRef} aria-hidden="true" />

      <div className="worklog-sticky">
        <div className="worklog-curtain" ref={curtainRef} aria-hidden="true" />
        <HeroScene
          className="worklog-scene"
          density={1.35}
          direction={-1}
          speedScale={1.35}
          particleScale={0.74}
          color={0xb8894a}
          materialOpacity={0.34}
        />
        <div className="worklog-track-wrap">
          <div className="worklog-line" aria-hidden="true" />
          <div className="worklog-line worklog-line--active" ref={lineRef} aria-hidden="true" />

          <div className="worklog-track" ref={trackRef}>
            {experiences.map((item, index) => {
              const active = index === activeIndex;

              return (
                <article className={`worklog-item ${active ? "is-active" : ""}`} key={item.id}>
                  <div className="worklog-meta" aria-hidden={!active}>
                    <span>{item.period}</span>
                    <h3>{item.role}</h3>
                  </div>

                  <button
                    className="worklog-node"
                    type="button"
                    aria-current={active ? "step" : undefined}
                    aria-label={`View ${item.company} experience, ${item.period}`}
                    onFocus={() => setPreviewIndex(index)}
                    onBlur={() => setPreviewIndex(null)}
                    onMouseEnter={() => setPreviewIndex(index)}
                    onMouseLeave={() => setPreviewIndex(null)}
                  >
                    <img className="worklog-sigil" src={item.sigil} alt="" loading="lazy" />
                  </button>

                  <div className="worklog-card" aria-hidden={!active}>
                    <h4>{item.company}</h4>
                    <p>{item.summary}</p>
                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <div className="worklog-tags">
                      {item.tags.map((tag) => (
                        <small key={tag}>{tag}</small>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function GitHubMapSection() {
  const [activeClusterId, setActiveClusterId] = useState("projects");
  const [hoveredRepoId, setHoveredRepoId] = useState(null);
  const [selectedPinnedRepo, setSelectedPinnedRepo] = useState(null);
  const activeCluster = useMemo(
    () => githubArchive.categories.find((cluster) => cluster.id === activeClusterId) ?? githubArchive.categories[0],
    [activeClusterId],
  );
  const visibleRepos = useMemo(
    () => githubArchive.repos.filter((repo) => activeCluster.repos.includes(repo.name) || repo.also?.includes(activeClusterId)),
    [activeCluster, activeClusterId],
  );
  const hoveredRepo = githubArchive.repos.find((repo) => repo.id === hoveredRepoId) ?? visibleRepos[0];
  const pinnedRepos = githubArchive.repos.filter((repo) => repo.pinned);
  const metricIcons = { star: Star, fork: GitFork, commit: GitCommitHorizontal, storage: Database };

  return (
    <section className="section-band github-section" id="github-map" data-motion-section>
      <div className="github-archive">
        <div className="github-side-rail" aria-hidden="true">
          <span>GIEDI PRIME</span>
          <span>ARCHIVE DECK</span>
          <i>SECTOR G-07</i>
        </div>

        <header className="github-hero">
          <p className="section-kicker">// CODE ARCHIVE</p>
          <h2>Repository Atlas.</h2>
          <p>
            A monochrome proof map of the codebase: learning trails, small tools, ML experiments,
            archived context, and the projects worth inspecting.
          </p>
        </header>

        <section className="pinned-repos pinned-repos--featured" aria-label="Pinned repositories">
          <div className="github-strip-title"><span>Proof-of-Work Vault</span><small>{pinnedRepos.length} selected builds / click to inspect</small></div>
          <div className="pinned-grid">
            {pinnedRepos.map((repo, index) => (
              <button className="pinned-repo-card" key={repo.id} type="button" onClick={() => setSelectedPinnedRepo(repo)}>
                <div className="pinned-card-head">
                  <span className="pinned-icon">{repo.logo ? <img src={repo.logo} alt="" /> : repo.icon}</span>
                  <strong>{repo.name}</strong>
                  <span className="pinned-badge">Pinned 0{index + 1}</span>
                </div>
                <p>{repo.cardDescription ?? repo.oneLine}</p>
                <small className="pinned-card-stack">{repo.cardMeta ?? repo.phase}</small>
                <div className="pinned-card-tags">
                  {(repo.cardTags ?? repo.tags ?? []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <em>{repo.focusLine}</em>
              </button>
            ))}
          </div>
        </section>

        <div className="github-dashboard motion-item">
          <section className="repo-orbit" aria-label="Repository cluster atlas">
            <div className="repo-orbit-label">
              <span>Repository Atlas</span>
              <small>{githubArchive.repos.length} repos indexed</small>
            </div>
            <svg viewBox="0 0 820 360" role="img" aria-label="Giedi Prime repository orbit map">
              <circle className="orbit-ring" cx="410" cy="180" r="148" />
              <circle className="orbit-ring orbit-ring--wide" cx="410" cy="180" r="212" />
              {githubArchive.categories.map((cluster) => {
                const selected = cluster.id === activeClusterId;
                return (
                  <g
                    className={`archive-cluster ${selected ? "is-selected" : ""}`}
                    key={cluster.id}
                    onMouseEnter={() => setActiveClusterId(cluster.id)}
                    onFocus={() => setActiveClusterId(cluster.id)}
                    tabIndex="0"
                  >
                    {cluster.nodes.slice(1).map((node, index) => (
                      <line key={`${cluster.id}-${index}`} x1={cluster.nodes[0].x} y1={cluster.nodes[0].y} x2={node.x} y2={node.y} />
                    ))}
                    {cluster.nodes.map((node, index) => (
                      <circle key={`${cluster.id}-node-${index}`} cx={node.x} cy={node.y} r={selected ? node.r + 3 : node.r} />
                    ))}
                    <text x={cluster.nodes[0].x + 46} y={cluster.nodes[0].y - 4}>{cluster.title}</text>
                    <text className="archive-cluster-sub" x={cluster.nodes[0].x + 46} y={cluster.nodes[0].y + 17}>{cluster.access}</text>
                  </g>
                );
              })}
            </svg>

            <div className="repo-heatmap">
              <div className="repo-heatmap-head">
                <span>Contribution Frequency</span>
                <small>under work / 2026</small>
              </div>
              <div className="heatmap-months" aria-hidden="true">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
              <div className="heatmap-grid" aria-hidden="true">
                {heatmapWeeks.flatMap((week, weekIndex) =>
                  week.map((value, dayIndex) => <i className={`heat-${value}`} key={`${weekIndex}-${dayIndex}`} />),
                )}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <i className="heat-1" />
                <i className="heat-2" />
                <i className="heat-3" />
                <i className="heat-4" />
                <span>More</span>
              </div>
            </div>
          </section>

          <aside className="repo-access-panel">
            <div className="repo-filter-row">
              {githubArchive.categories.map((cluster) => (
                <button
                  className={cluster.id === activeClusterId ? "is-active" : ""}
                  key={cluster.id}
                  type="button"
                  onClick={() => {
                    setActiveClusterId(cluster.id);
                    setHoveredRepoId(null);
                  }}
                >
                  {cluster.title}
                </button>
              ))}
            </div>

            <div className="repo-signal-card">
              <dl>
                <div><dt>Type</dt><dd>{activeCluster.title}</dd></div>
                <div><dt>Access</dt><dd>{activeCluster.access}</dd></div>
                <div><dt>Repo</dt><dd>{hoveredRepo?.name}</dd></div>
                <div><dt>Purpose</dt><dd>{hoveredRepo?.oneLine ?? activeCluster.signal}</dd></div>
              </dl>
            </div>

            <div className="repo-stack">
              {visibleRepos.map((repo) => (
                <a className="repo-row" href={repo.url} key={repo.id} onMouseEnter={() => setHoveredRepoId(repo.id)} onFocus={() => setHoveredRepoId(repo.id)} rel="noreferrer" target="_blank">
                  <span>{repo.logo ? <img src={repo.logo} alt="" /> : repo.icon}</span>
                  <strong>{repo.name}</strong>
                  <p title={repo.detail}>{repo.detail}</p>
                  <small>Open</small>
                </a>
              ))}
            </div>
          </aside>
        </div>

        <section className="commit-console" aria-label="Recent GitHub activity">
          <div className="github-strip-title"><span>Recent commits</span><small>activity timeline</small></div>
          <div className="commit-list">
            {githubArchive.commits.map((commit) => (
              <article className="commit-row" key={commit.hash}>
                <time>{commit.when}</time><code>{commit.hash}</code><strong>{commit.title}</strong><span>{commit.repo}</span><small>{commit.meta}</small>
              </article>
            ))}
          </div>
        </section>
      </div>

      {selectedPinnedRepo ? (
        <div className="repo-dialog-backdrop" role="presentation" onMouseDown={() => setSelectedPinnedRepo(null)}>
          <article className="repo-dialog" role="dialog" aria-modal="true" aria-label={`${selectedPinnedRepo.displayName ?? selectedPinnedRepo.name} repository details`} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedPinnedRepo(null)} aria-label="Close repository details">x</button>
            <div className="repo-dialog-head">
              <div className="repo-dialog-main">
                <span className="dialog-label dialog-label--tag">{selectedPinnedRepo.phase}</span>
                <div className="repo-title-line">
                  {selectedPinnedRepo.logo ? <img src={selectedPinnedRepo.logo} alt="" /> : <span className="repo-dialog-icon">{selectedPinnedRepo.icon}</span>}
                  <h3 className={selectedPinnedRepo.live ? "has-live" : ""}>{selectedPinnedRepo.displayName ?? selectedPinnedRepo.name}</h3>
                </div>
                <div className="repo-brief-copy">
                  {(selectedPinnedRepo.brief ?? [selectedPinnedRepo.detail]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
              <aside className="repo-dialog-aside">
                <div className="repo-dialog-stats">
                  {selectedPinnedRepo.metrics.map((metric) => {
                    const MetricIcon = metricIcons[metric.icon] ?? Radio;
                    return (
                      <div key={metric.label}>
                        <MetricIcon size={15} strokeWidth={1.8} />
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>
                    );
                  })}
                </div>
                <div className="repo-contributors">
                  <span>Contributors</span>
                  {Array.isArray(selectedPinnedRepo.contributors) ? selectedPinnedRepo.contributors.map((person) => (
                    <a href={person.url} key={person.handle} target="_blank" rel="noreferrer">
                      <small>@{person.handle}</small>
                      <strong>{person.name}</strong>
                    </a>
                  )) : <p>{selectedPinnedRepo.contributors}</p>}
                </div>
                <div className="repo-link-row">
                  {selectedPinnedRepo.live ? <a href={selectedPinnedRepo.live} target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Live link</a> : null}
                  <a href={selectedPinnedRepo.url} target="_blank" rel="noreferrer"><ArrowUpRight size={14} /> Repo link</a>
                  {selectedPinnedRepo.live ? <span>Live</span> : null}
                </div>
              </aside>
            </div>
            <div className="repo-tech-stack">
              {(selectedPinnedRepo.technologies ?? selectedPinnedRepo.tags).map((tag) => <i key={tag}>{tag}</i>)}
            </div>
            <div className="repo-dialog-grid">
              <section className="repo-dialog-card"><span>{selectedPinnedRepo.featuresTitle ?? "Features"}</span><ul>{selectedPinnedRepo.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></section>
              <section className="repo-dialog-card"><span>{selectedPinnedRepo.architectureTitle ?? "Architecture"}</span><ul>{selectedPinnedRepo.architecture.map((item) => <li key={item}>{item}</li>)}</ul></section>
            </div>
            {selectedPinnedRepo.flowchart ? <img className="repo-flowchart" src={selectedPinnedRepo.flowchart} alt={`${selectedPinnedRepo.name} architecture flowchart`} /> : null}
            <div className="language-bars">
              {selectedPinnedRepo.languages.map((language) => <div key={language.name}><span>{language.name}</span><i style={{ width: `${language.value}%` }} /></div>)}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function WorkConsoleSection({ activeLaneId, onLaneChange }) {
  return (
    <section className="section-band console-section" id="work-console" data-motion-section>
      <div className="section-inner">
        <SectionHeading
          kicker="04 / Work Console"
          title="What I am building, studying, and cleaning up."
          copy="This is less of a product dashboard and more of my operating table: active work, outputs, proof, and the kinds of artifacts I keep producing."
          align="split"
        />
        <div className="lane-grid motion-item">
          {workLanes.map((lane, index) => (
            <article
              className={`lane-card ${lane.id === activeLaneId ? "is-active" : ""}`}
              key={lane.id}
              onMouseEnter={() => onLaneChange(lane.id)}
            >
              <div className="lane-head">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Radio size={16} strokeWidth={1.8} />
              </div>
              <h3>{lane.title}</h3>
              <p>{lane.thesis}</p>
              <div className="lane-current">
                <span>CURRENT</span>
                <strong>{lane.current}</strong>
              </div>
              <div className="lane-columns">
                <div>
                  <span>OUTPUTS</span>
                  <ul>
                    {lane.outputs.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>PROOF</span>
                  <ul>
                    {lane.proof.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="chip-row">
                {lane.projects.map((project) => (
                  <span className="chip" key={project}>
                    {project}
                  </span>
                ))}
              </div>
              <button className="lane-filter" type="button" onClick={() => onLaneChange(lane.id)}>
                Filter case files
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectGallerySection({ activeLaneId, onLaneChange }) {
  const [expandedId, setExpandedId] = useState(projects[0].id);
  const filteredProjects = activeLaneId === "all" ? projects : projects.filter((project) => project.lane === activeLaneId);

  return (
    <section className="section-band gallery-section" id="project-gallery" data-motion-section>
      <div className="section-inner">
        <SectionHeading
          kicker="05 / Project Gallery"
          title="Case files from my build desk."
          copy="These are the projects I want opened first. They are not the whole platform; they are the strongest windows into how I think and build."
          align="split"
        />

        <div className="gallery-toolbar motion-item">
          <button className={activeLaneId === "all" ? "is-active" : ""} type="button" onClick={() => onLaneChange("all")}>
            All case files
          </button>
          {workLanes.map((lane) => (
            <button
              className={lane.id === activeLaneId ? "is-active" : ""}
              key={lane.id}
              type="button"
              onClick={() => onLaneChange(lane.id)}
            >
              {lane.title}
            </button>
          ))}
        </div>

        <div className="case-grid motion-item">
          {filteredProjects.map((project) => {
            const expanded = project.id === expandedId;
            return (
              <article className={`case-card ${expanded ? "is-expanded" : ""}`} key={project.id}>
                <button className="case-main" type="button" onClick={() => setExpandedId(expanded ? "" : project.id)}>
                  <span className="case-meta">
                    {project.type} / {project.maturity}
                  </span>
                  <h3>{project.name}</h3>
                  <p>{project.oneLine}</p>
                  <span className="case-command">{expanded ? "Close case file" : "Open case file"}</span>
                </button>
                <div className="case-detail">
                  <div>
                    <span>PROBLEM</span>
                    <p>{project.problem}</p>
                  </div>
                  <div>
                    <span>SYSTEM</span>
                    <p>{project.system}</p>
                  </div>
                  <div>
                    <span>PROOF</span>
                    <ul>
                      {project.proof.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="chip-row">
                    {project.tech.map((item) => (
                      <span className="chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="case-links">
                    {project.links.github ? <ExternalLink href={project.links.github}>Source</ExternalLink> : null}
                    {project.links.demo ? <ExternalLink href={project.links.demo}>Live</ExternalLink> : null}
                    {!project.links.github && !project.links.demo ? <span>Local case file pending</span> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const contactLinks = [
    links.email ? { label: "Email", value: links.email, href: `mailto:${links.email}` } : { label: "Email", value: "bhardwajharshmait23@gmail.com" },
    { label: "LinkedIn", value: "Connect professionally", href: links.linkedin },
    { label: "GitHub", value: "Open the proof trail", href: links.github },
    { label: "Resume", value: "Download the current brief", href: links.resume },
  ];

  return (
    <section className="contact-section" id="contact" data-motion-section>
      <div className="contact-shell motion-item">
        <figure className="contact-worm" aria-label="Monumental desert signal artwork">
          <img src="/backgrounds/contact-worm.png" alt="" />
        </figure>

        <aside className="contact-panel">
          <p className="contact-kicker">Signal / Final Relay</p>
          <h2>Summon the Maker</h2>
          <p className="contact-line">For collaboration, ideas, or interesting problems.</p>

          <div className="contact-grid" aria-label="Contact routes">
            <div className="contact-group">
              <span>Signal</span>
              <strong>Send a signal.</strong>
              <p>Open to systems, products, and thoughtful work.</p>
            </div>

            <div className="contact-group">
              <span>Coordinates</span>
              <strong>Delhi, India</strong>
              <p>Available for remote-first work and serious build conversations.</p>
            </div>

            <div className="contact-group contact-group--links">
              <span>Elsewhere</span>
              <div className="contact-link-stack">
                {contactLinks.map((item) =>
                  item.href ? (
                    <a href={item.href} key={item.label} target={item.href.startsWith("/") ? undefined : "_blank"} rel={item.href.startsWith("/") ? undefined : "noreferrer"}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </a>
                  ) : (
                    <div className="contact-muted-link" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function App() {
  const rootRef = useRef(null);
  const [activeLaneId, setActiveLaneId] = useState("all");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("motion-ready");
    if (reduceMotion) return undefined;

    let observer;
    const scope = createScope({ root: rootRef }).add(() => {
      animate(".hero-title-line--name", {
        opacity: [0, 1],
        y: [28, 0],
        filter: ["blur(8px)", "blur(0px)"],
        duration: 1050,
        delay: 260,
        ease: "out(3)",
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.target.dataset.motionPlayed === "true") return;
            entry.target.dataset.motionPlayed = "true";
            const items = entry.target.querySelectorAll(".motion-item");
            animate(items, {
              opacity: [0, 1],
              y: [22, 0],
              duration: 780,
              delay: stagger(70),
              ease: "out(3)",
            });
          });
        },
        { threshold: 0.22 },
      );

      rootRef.current.querySelectorAll("[data-motion-section]").forEach((section) => observer.observe(section));
    });

    return () => {
      observer?.disconnect();
      scope.revert();
    };
  }, []);

  return (
    <div className="site-shell" ref={rootRef}>
      <header className="nav">
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#worklog">Experience</a>
          <a href="#worklog">Worklog</a>
          <a href="#project-gallery">Hitlist</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#top" className="avatar-link" aria-label="Harsh Bhardwaj home">
          <img src="/avatar-harsh.png" alt="" />
        </a>
      </header>

      <main>
        <HeroSection />
        <AboutSection />
        <WorklogTimelineSection />
        <GitHubMapSection />
        <WorkConsoleSection activeLaneId={activeLaneId} onLaneChange={setActiveLaneId} />
        <ProjectGallerySection activeLaneId={activeLaneId} onLaneChange={setActiveLaneId} />
        <ContactSection />
      </main>

      <footer className="site-footer" id="footer">
        <div className="footer-flair">
          <span>HARSH BHARDWAJ</span>
          <strong>Building, learning and Growing</strong>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#top">Home</a>
          <a href="#about">About</a>
          <a href="#worklog">Experience</a>
          <a href="#github-map">GitHub</a>
          <a href="#work-console">Console</a>
          <a href="#project-gallery">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="footer-bottom">
          <span>CC BY-NC 2026</span>
          <span>Designed and built by Harsh Bhardwaj</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
