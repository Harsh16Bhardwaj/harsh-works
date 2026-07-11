"use client";

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import Lenis from "lenis";
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Database, FileText, GitCommitHorizontal, GitFork, Heart, Mail, MapPin, Network, Radio, Rss, Star } from "lucide-react";
import { useBlogs } from "./BlogStore.jsx";
import { formatBlogDate, getBlogImage } from "./data/blogs.js";
import { experiences } from "./data/experiences.js";
import { githubArchive } from "./data/githubMap.js";
import { links } from "./data/identity.js";
import { workLanes } from "./data/workLanes.js";

const HeroScene = lazy(() => import("./HeroScene.jsx").then((module) => ({ default: module.HeroScene })));

function DeferredHeroScene(props) {
  return (
    <Suspense fallback={null}>
      <HeroScene {...props} />
    </Suspense>
  );
}

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

function seededDayRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function weightedHeatLevel(date, today) {
  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 271 +
    date.getDate() * 37 +
    today.getFullYear() * 13 +
    (today.getMonth() + 1) * 19 +
    today.getDate();
  const r = seededDayRandom(seed);

  if (r < 0.34) return 2;
  if (r < 0.64) return 1;
  if (r < 0.86) return 3;
  if (r < 0.96) return 4;
  return 5;
}

function buildHeatmapMonths(currentDate = new Date()) {
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  return Array.from({ length: 9 }, (_, index) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const isCurrentMonth =
      monthDate.getFullYear() === today.getFullYear() && monthDate.getMonth() === today.getMonth();

    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`,
      label: monthDate.toLocaleString("en-US", { month: "short" }),
      year: monthDate.getFullYear(),
      days: Array.from({ length: daysInMonth }, (_, dayIndex) => {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayIndex + 1);
        const future = isCurrentMonth && date.getDate() > today.getDate();
        return {
          key: `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}-${dayIndex + 1}`,
          day: dayIndex + 1,
          future,
          level: future ? 1 : weightedHeatLevel(date, today),
        };
      }),
    };
  });
}

function ArrakisIntro() {
  const targetTitle = "ARRAKIS / PORTFOLIO";
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const introMode = new URLSearchParams(window.location.search).get("intro");
    if (introMode === "skip") return undefined;

    const hasSeenIntro = (() => {
      try {
        return window.sessionStorage.getItem("arrakisLoaderSeen") === "true";
      } catch {
        return false;
      }
    })();

    if (introMode === "replay" || !hasSeenIntro) setVisible(true);
    return undefined;
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [];

    document.documentElement.classList.add("arrakis-intro-active");

    const markSeenAndLeave = () => {
      try {
        window.sessionStorage.setItem("arrakisLoaderSeen", "true");
      } catch {
        // If storage is unavailable, still let the cinematic intro finish cleanly.
      }
      setLeaving(true);
    };

    const finish = () => {
      setVisible(false);
      document.documentElement.classList.remove("arrakis-intro-active");
    };

    if (reduceMotion) {
      timers.push(window.setTimeout(markSeenAndLeave, 520));
      timers.push(window.setTimeout(finish, 880));
    } else {
      timers.push(window.setTimeout(markSeenAndLeave, 4560));
      timers.push(window.setTimeout(finish, 4900));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      document.documentElement.classList.remove("arrakis-intro-active");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`arrakis-intro ${leaving ? "is-leaving" : ""}`} role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="arrakis-intro-blackout" aria-hidden="true" />
      <div className="arrakis-intro-bg" aria-hidden="true" />
      <div className="arrakis-intro-haze" aria-hidden="true" />
      <div className="arrakis-intro-grain" aria-hidden="true" />

      <div className="arrakis-intro-title">
        <p>PERSONAL ARCHIVE ONLINE</p>
        <h1 aria-label={targetTitle}>
          <span className="arrakis-title-final" aria-hidden="true">
            {targetTitle.split("").map((letter, index) => (
              <span className="arrakis-title-letter" key={`${letter}-${index}`} style={{ "--letter-index": index, opacity: 0 }}>
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </span>
        </h1>
        <span>INITIALIZING SIGNAL</span>
      </div>

      <div className="arrakis-progress" aria-hidden="true">
        <span>LOADING ARCHIVE</span>
        <div className="arrakis-progress-cells">
          {Array.from({ length: 8 }).map((_, index) => (
            <i key={index} style={{ "--cell-index": index }} />
          ))}
        </div>
        <small>SIGNAL ACQUIRED</small>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-section" id="top" data-motion-section>
      <DeferredHeroScene density={1.45} />
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
      <div className="about-theme-marks" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <DeferredHeroScene className="about-scene" density={0.55} speedScale={0.68} materialOpacity={0.26} />
      <div className="section-inner about-story">
        <div className="about-intro motion-item mt-5">
          <p className="section-kicker">10 / About Me</p>
          <h2>Who am I ?</h2>
          <div className="about-copy">
            <p>
              I&apos;m Harsh Bhardwaj, an engineer from Delhi building full-stack systems, ML
              experiments, automation workflows, and public proof trails. I learn by turning ideas
              into visible artifacts: repos, notes, dashboards, notebooks, field records, and
              working tools that can be inspected.
            </p>
          </div>
        </div>

        <div className="about-constellation motion-item">
          <div className="about-proofline" aria-label="Builder operating loop">
            {["Observe", "Build", "Measure", "Archive"].map((step, index) => (
              <span key={step} style={{ "--about-step": index }}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {step}
              </span>
            ))}
          </div>

          <div className="about-ledger">
            <article>
              <span>Education</span>
              <h3>Maharaja Agrasen Institute of Technology</h3>
              <p>B.Tech CSE, 2023 - 2027 / CGPA 8.95 / ML &amp; Data Analytics.</p>
            </article>
            <article>
              <span>Study track</span>
              <h3>SIC Course in Data Analysis</h3>
              <p>Coursework focused on analysis concepts, structured data thinking, and practical interpretation.</p>
            </article>
            <article>
              <span>Operating style</span>
              <h3>Useful systems over decorative builds</h3>
              <p>I prefer projects that leave proof behind: code, notes, metrics, automations, and decisions someone can inspect.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorklogTimelineSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lineRef = useRef(null);
  const curtainRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [scrollActiveIndex, setScrollActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(null);
  const activeIndex = previewIndex ?? scrollActiveIndex;

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
      currentX += (targetX - currentX) * 0.16;
      currentProgress += (targetProgress - currentProgress) * 0.15;
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
      } else {
        animationFrame = 0;
      }
    };

    const update = () => {
      if (reduceMotion || mobile) {
        if (lineRef.current) lineRef.current.style.width = "8%";
        if (trackRef.current) trackRef.current.style.transform = "translate3d(0, 0, 0)";
        if (curtainRef.current) curtainRef.current.style.transform = "translate3d(0, 100%, 0)";
        activeIndexRef.current = 0;
        setScrollActiveIndex(0);
        return;
      }

      const sectionTop = section.getBoundingClientRect().top;
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const rawProgress = Math.min(1, Math.max(0, -sectionTop / scrollable));
      const nextProgress = Math.min(1, Math.max(0, rawProgress / 0.985));
      const trackStep = 768;
      const curtainProgress = Math.min(1, Math.max(0, rawProgress / 0.04));
      if (curtainRef.current) {
        curtainRef.current.style.transform = `translate3d(0, ${(1 - curtainProgress) * 100}%, 0)`;
      }

      targetProgress = nextProgress;
      targetX = window.innerWidth * 0.5 - 33 - nextProgress * trackStep * (experiences.length - 1);
      if (!animationFrame) animationFrame = requestAnimationFrame(animateTrack);
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
      <div className="worklog-sticky">
        <div
          className="worklog-field-map-bg"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              'linear-gradient(90deg, rgba(5, 4, 6, 0.76) 0%, rgba(8, 6, 7, 0.46) 42%, rgba(5, 4, 6, 0.66) 100%), linear-gradient(180deg, rgba(8, 5, 6, 0.38), rgba(12, 7, 6, 0.2) 42%, rgba(3, 3, 5, 0.66)), url("/backgrounds/worklog-field-map.png") center center / cover no-repeat',
            filter: "brightness(0.92) contrast(1.08) saturate(0.95)",
            pointerEvents: "none",
          }}
        />
        <div className="worklog-curtain" ref={curtainRef} aria-hidden="true" />
        <DeferredHeroScene
          className="worklog-scene"
          density={0.82}
          direction={-1}
          speedScale={1.08}
          particleScale={0.62}
          color={0xff6b1a}
          materialOpacity={0.52}
        />
        <div className="worklog-header">
          <p className="section-kicker">03 / Worklog</p>
          <h2>Mission log, latest first.</h2>
        </div>
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
  const [heatmapMonths, setHeatmapMonths] = useState([]);
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

  useEffect(() => {
    setHeatmapMonths(buildHeatmapMonths(new Date()));
  }, []);

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
                <small>{heatmapMonths.length ? "last 9 months / live date map" : "mapping activity"}</small>
              </div>
              <div className="heatmap-months heatmap-months--generated" aria-label="Generated contribution heatmap for the last nine months">
                {heatmapMonths.map((month) => (
                  <section className="heatmap-month" key={month.key} aria-label={`${month.label} ${month.year}`}>
                    <span>{month.label}</span>
                    <div className="heatmap-month-grid">
                      {month.days.map((day) => (
                        <i
                          className={`heat-${day.level} ${day.future ? "is-future" : ""}`}
                          key={day.key}
                          title={`${month.label} ${day.day}, ${month.year}${day.future ? " / future" : ` / level ${day.level}`}`}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <i className="heat-1" />
                <i className="heat-2" />
                <i className="heat-3" />
                <i className="heat-4" />
                <i className="heat-5" />
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
                Focus this lane
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FieldNotesSection() {
  const { blogs } = useBlogs();
  const pinned = blogs.filter((blog) => blog.pinned);
  const featured = [...pinned, ...blogs.filter((blog) => !blog.pinned)].slice(0, 3);
  const featureRefs = useRef([]);
  const [focusedFeatureIndex, setFocusedFeatureIndex] = useState(0);

  useEffect(() => {
    let raf = 0;

    const updateFocus = () => {
      raf = 0;
      const viewportCenter = window.innerHeight / 2;
      let nextIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      featureRefs.current.forEach((node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          nextIndex = index;
        }
      });

      setFocusedFeatureIndex(nextIndex);
    };

    const scheduleUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(updateFocus);
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      rootMargin: "-12% 0px -12% 0px",
      threshold: [0, 0.2, 0.45, 0.7],
    });

    featureRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    updateFocus();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [featured.length]);

  return (
    <section className="field-notes-section" id="field-notes" data-motion-section>
      <div className="field-notes-background-marks" aria-hidden="true">
        <span className="field-notes-orbit-mark" />
        <span className="field-notes-compass-mark" />
        <span className="field-notes-scanline-mark" />
        <span className="field-notes-coordinate">28.6139 N / 77.2090 E</span>
        <span className="field-notes-record-code">FIELD RECORDS / HB-07</span>
        <span className="field-notes-margin-note">RESEARCH LOGS / PUBLIC NOTES / BUILD AFTERMATH</span>
      </div>
      <div className="field-notes-shell">
        <header className="field-notes-heading motion-item">
          <div className="field-notes-heading-meta">
            <span>07</span>
            <p>Written Records</p>
          </div>
          <div className="field-notes-heading-copy">
            <h2>Field Notes</h2>
            <p>Systems, experiments, and the lessons left behind after the build.</p>
          </div>
        </header>

        <div className="field-note-features">
          {featured.map((blog, index) => (
            <article
              className={`field-note-feature motion-item ${focusedFeatureIndex === index ? "is-in-focus" : ""}`}
              key={blog.id}
              ref={(node) => {
                featureRefs.current[index] = node;
              }}
            >
              <a className="field-note-image" href={blog.link} target="_blank" rel="noreferrer">
                <img src={getBlogImage(blog, index)} alt="" loading="lazy" />
                <i className="image-corner-mark" aria-hidden="true" />
                <small className="image-plate-label" aria-hidden="true">
                  Plate {String(index + 1).padStart(2, "0")}
                </small>
                {!blog.image ? <span>Archive image pending</span> : null}
              </a>
              <div className="field-note-copy">
                <p className="field-note-index">
                  {String(index + 1).padStart(2, "0")} / Field Note
                </p>
                <h3>{blog.title}</h3>
                <p>{blog.description}</p>
                <div className="field-note-meta">
                  <span>{formatBlogDate(blog.date)}</span>
                  <span><Heart size={14} aria-hidden="true" /> {blog.likes} reactions</span>
                </div>
                <a className="field-note-read" href={blog.link} target="_blank" rel="noreferrer">
                  Read dispatch <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <a className="field-notes-more motion-item" href="/blogs">
          <span>See all field notes</span>
          <ArrowDown size={22} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

const hitlistProjects = [
  {
    id: "jedi",
    priority: "01",
    title: "JEDI",
    subtitle: "Job Evaluation & Delivery Intelligence",
    brief:
      "A personalised job-intelligence platform for navigating placement season with ranking, eligibility, freshness and role-fit signals.",
    inspiration:
      "Jobright-style discovery is useful, but placement season needs sharper handling for eligibility, deadlines, local roles and rapidly changing opportunities.",
    depth:
      "JEDI sits between raw job listings and the final apply decision. It structures each role, compares it against a candidate profile, tracks changing priorities, and turns a noisy job stream into a manageable shortlist. The goal is to reduce repeated manual reading, eligibility checks and weak applications.",
    status: "BUILDING",
    focus: "Ranking pipeline",
    active: true,
    x: "68%",
    y: "25%",
    size: "large",
    side: "left",
    tone: "#14110d",
    accent: "#8f4f28",
  },
  {
    id: "learning-digest",
    priority: "02",
    title: "Passive Learning Digest",
    subtitle: "Automated study preparation",
    brief:
      "An automated learning system that converts trusted material into small, structured, revisable learning digests.",
    inspiration:
      "Learning tools help once resources exist, but the repeated planning, gathering, organising and revision selection still consumes attention.",
    depth:
      "The system prepares compact lessons from core-subject material, keeps old concepts in rotation, and reduces the preparation overhead around learning. It does not remove effort from studying; it removes the repetitive organisation that competes with comprehension and recall.",
    status: "RESEARCHING",
    focus: "Digest grammar",
    active: false,
    x: "28%",
    y: "28%",
    size: "medium",
    side: "right",
    tone: "#17140f",
    accent: "#7b5b31",
  },
  {
    id: "trace-guard",
    priority: "03",
    title: "Trace Guard",
    subtitle: "Agent trace evaluation",
    brief:
      "A runtime evaluation layer that detects hallucination, regression and bad reasoning paths before they become full failures.",
    inspiration:
      "Agent evaluations usually happen after the run has already failed. By then the system has spent tokens, polluted context and followed the wrong branch too far.",
    depth:
      "Trace Guard observes a developing agent trace and compares it with successful, failed and suspicious behavioural patterns. It looks for divergence, unsupported assumptions, repeated loops and known failure clusters, then intervenes early enough for the agent to retrieve evidence or restart safely.",
    status: "PROTOTYPING",
    focus: "Failure taxonomy",
    active: false,
    x: "78%",
    y: "62%",
    size: "medium",
    side: "left",
    tone: "#181111",
    accent: "#7a332f",
  },
  {
    id: "council-agents",
    priority: "04",
    title: "Council of Agents",
    subtitle: "Persona-grounded simulation",
    brief:
      "A multi-agent simulation system grounded in detailed human personas for product criticism, disagreement and decision review.",
    inspiration:
      "Most multi-agent demos use shallow role labels. Real perspective needs memory, context, needs, habits and different ways of reacting to the same proposal.",
    depth:
      "Each council member is tied to a richer persona instead of a generic role prompt. The council can critique products, decisions or ideas from distinct human perspectives, exposing blind spots before real beta testing and making later research more focused.",
    status: "CONCEPT",
    focus: "Persona model",
    active: false,
    x: "48%",
    y: "44%",
    size: "small",
    side: "right",
    tone: "#151116",
    accent: "#6d536d",
  },
  {
    id: "discord-torrent",
    priority: "05",
    title: "Discord Torrent",
    subtitle: "Distributed watch parties",
    brief:
      "A torrent-inspired watch-party system for synchronised, high-quality playback without placing all bandwidth on one host.",
    inspiration:
      "Discord watch parties are convenient but limited by stream quality, lag and compression. General communication tools are not built for serious media playback.",
    depth:
      "The app would coordinate rooms, participants and playback state while allowing video data to move through a distributed sharing model. The central question is whether peer-assisted transfer can preserve smooth synchronisation while keeping infrastructure cost extremely low.",
    status: "CONCEPT",
    focus: "Transfer protocol",
    active: false,
    x: "20%",
    y: "64%",
    size: "medium",
    side: "right",
    tone: "#0f1418",
    accent: "#405c69",
  },
  {
    id: "repo-temple",
    priority: "06",
    title: "Repo-Temple",
    subtitle: "Repository context graph",
    brief:
      "A repository-mapping system that turns codebases into compact graphs for coding agents and developer navigation.",
    inspiration:
      "Starting a fresh agent session saves conversation context, but the agent still spends tokens rediscovering the repository structure from scratch.",
    depth:
      "Repo-Temple maps modules, files, imports, functions and execution paths into a compact graph. Instead of repeatedly loading the full repository, an agent retrieves only the relevant connected subgraph for the task, reducing context cost while preserving repository understanding.",
    status: "RESEARCHING",
    focus: "Graph schema",
    active: false,
    x: "55%",
    y: "76%",
    size: "large",
    side: "left",
    tone: "#101515",
    accent: "#4b625e",
  },
  {
    id: "portfolio",
    priority: "PENDING",
    title: "The Portfolio",
    subtitle: "Current integration pass",
    brief:
      "A cinematic, interactive portfolio that presents projects, experience and learning as connected environments.",
    inspiration:
      "The visual direction comes from Dune-scale atmosphere and the need to avoid another conventional grid of identical project cards.",
    depth:
      "The portfolio brings finished projects, active experiments, technical learning and future ideas into one coherent visual system. The remaining work is interaction refinement, transition cleanup, copy tightening and making sure the cinematic layer never harms readability or performance.",
    status: "ALMOST THERE",
    focus: "Interaction polish",
    active: true,
    x: "34%",
    y: "82%",
    size: "small",
    side: "right",
    tone: "#18120b",
    accent: "#8c6740",
  },
];

function HitlistSection() {
  const sectionRef = useRef(null);
  const fieldRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [activeOrigin, setActiveOrigin] = useState({ x: "50%", y: "50%" });
  const [revealKey, setRevealKey] = useState(0);
  const activeProject = hitlistProjects.find((project) => project.id === activeId);

  const sectionStyle = activeProject
    ? {
        "--hitlist-x": activeOrigin.x,
        "--hitlist-y": activeOrigin.y,
        "--hitlist-tone": activeProject.tone,
        "--hitlist-accent": activeProject.accent,
      }
    : undefined;

  const showProject = (project, target) => {
    const section = sectionRef.current;
    if (section && target) {
      const sectionRect = section.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const x = ((targetRect.left + targetRect.width / 2 - sectionRect.left) / sectionRect.width) * 100;
      const y = ((targetRect.top + targetRect.height / 2 - sectionRect.top) / sectionRect.height) * 100;
      setActiveOrigin({ x: `${Math.min(92, Math.max(8, x))}%`, y: `${Math.min(92, Math.max(8, y))}%` });
    }
    if (activeId !== project.id) setRevealKey((key) => key + 1);
    setActiveId(project.id);
  };

  const clearProject = () => {
    setActiveId(null);
  };

  const clearProjectOnFieldBlur = (event) => {
    const nextTarget = event.relatedTarget;
    if (!fieldRef.current || !(nextTarget instanceof Node) || !fieldRef.current.contains(nextTarget)) {
      clearProject();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`section-band hitlist-section ${activeProject ? `has-active-hit hitlist-reveal-${revealKey % 2}` : ""}`}
      id="hitlist"
      data-motion-section
      style={sectionStyle}
    >
      <div className="hitlist-world" aria-hidden="true" />
      <div className="hitlist-stage motion-item">
        <header className="hitlist-intro">
          <p className="section-kicker">08 / Project Hitlist</p>
          <h2>Things I am trying to bring to life.</h2>
          <p>
            Ordered by what I want to attack next. Hover a project sigil to let its world surface without turning the page into another card grid.
          </p>
          <div className="hitlist-legend" aria-hidden="true">
            <span>01 highest priority</span>
            <span>hover / tap to inspect</span>
          </div>
        </header>

        <div className="hitlist-field" aria-label="Project hitlist" ref={fieldRef} onMouseLeave={clearProject}>
          {hitlistProjects.map((project) => (
            <button
              className={`hitlist-node hitlist-node--${project.size} ${activeId && activeId !== project.id ? "is-muted" : ""} ${activeId === project.id ? "is-active" : ""}`}
              key={project.id}
              type="button"
              style={{ "--node-x": project.x, "--node-y": project.y, "--node-accent": project.accent, "--node-tone": project.tone }}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") showProject(project, event.currentTarget);
              }}
              onFocus={(event) => showProject(project, event.currentTarget)}
              onBlur={clearProjectOnFieldBlur}
              onPointerUp={(event) => {
                if (event.pointerType === "touch") {
                  activeId === project.id ? clearProject() : showProject(project, event.currentTarget);
                }
              }}
              aria-expanded={activeId === project.id}
            >
              <span className="hitlist-sigil" aria-hidden="true">
                <i>{project.priority === "PENDING" ? "P" : project.priority}</i>
              </span>
              <span className="hitlist-node-label">
                <span>{project.priority}</span>
                <strong>{project.title}</strong>
              </span>
            </button>
          ))}
        </div>

        <article className="hitlist-info" data-side={activeProject?.side ?? "right"} key={activeProject?.id ?? "idle"} aria-live="polite">
          {activeProject ? (
            <>
              <p className="hitlist-info-index">Priority {activeProject.priority} / {activeProject.status}</p>
              <h3>{activeProject.title}</h3>
              <p className="hitlist-info-subtitle">{activeProject.subtitle}</p>
              <p className="hitlist-info-brief">{activeProject.brief}</p>
              <div className="hitlist-rule" aria-hidden="true" />
              <div className="hitlist-info-grid">
                <section>
                  <span>Inspiration</span>
                  <p>{activeProject.inspiration}</p>
                </section>
                <section>
                  <span>In depth</span>
                  <p>{activeProject.depth}</p>
                </section>
              </div>
              <div className="hitlist-status-row">
                <div>
                  <span>Status</span>
                  <strong>{activeProject.status}</strong>
                </div>
                <div>
                  <span>Current focus</span>
                  <strong>{activeProject.focus}</strong>
                </div>
              </div>
            </>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function ContactSection() {
  const sectionRef = useRef(null);
  const workMail = links.email || "bhardwajharshmait23@gmail.com";
  const contactLinks = [
    { label: "LinkedIn", value: "Connect", href: links.linkedin, icon: BriefcaseBusiness },
    { label: "GitHub", value: "Proof trail", href: links.github, icon: Network },
    { label: "Resume", value: "View PDF", href: links.resume, icon: FileText },
    { label: "Location", value: "Delhi, India", icon: MapPin },
    { label: "Dev.to", value: "Field notes", href: "https://dev.to/harsh_bhardwaj_809a89d3a7", icon: Rss },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = window.innerHeight + rect.height;
      const progress = travel > 0 ? (window.innerHeight - rect.top) / travel - 0.5 : 0;
      const clamped = Math.max(-1, Math.min(1, progress * 2));
      section.style.setProperty("--contact-parallax", clamped.toFixed(3));
      section.style.setProperty("--contact-orb-y", `${(clamped * -22).toFixed(2)}px`);
      section.style.setProperty("--contact-orb-rotate", `${(clamped * 12).toFixed(2)}deg`);
      section.style.setProperty("--contact-halo-y", `${(clamped * 32).toFixed(2)}px`);
      section.style.setProperty("--contact-halo-scale", (1 + Math.abs(clamped) * 0.035).toFixed(3));
      section.style.setProperty("--contact-worm-y", `${(clamped * -10).toFixed(2)}px`);
      section.style.setProperty("--contact-panel-y", `${(clamped * 8).toFixed(2)}px`);
    };

    const scheduleParallax = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", scheduleParallax, { passive: true });
    window.addEventListener("resize", scheduleParallax);

    return () => {
      window.removeEventListener("scroll", scheduleParallax);
      window.removeEventListener("resize", scheduleParallax);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="contact-section" id="contact" data-motion-section ref={sectionRef}>
      <div className="contact-shell motion-item">
        <figure className="contact-worm" aria-label="Monumental desert signal artwork">
          <img className="contact-worm-art" src="/backgrounds/contact-worm.webp" alt="" />
        </figure>

        <aside className="contact-panel">
          <p className="contact-kicker">Signal / Final Relay</p>
          <h2>Let&apos;s work together.</h2>
          <p className="contact-line">I am open to opportunities in Delhi NCR, Bangalore, Mumbai, and remote roles.</p>
          <a className="contact-workmail" href={`mailto:${workMail}`}>
            <Mail size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>WorkMail:</span>
            <strong>{workMail}</strong>
          </a>

          <div className="contact-icon-grid" aria-label="Contact routes">
            {contactLinks.map((item) => {
              const Icon = item.icon;
              return item.href ? (
                <a href={item.href} key={item.label} target={item.href.startsWith("/") ? undefined : "_blank"} rel={item.href.startsWith("/") ? undefined : "noreferrer"}>
                  <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </a>
              ) : (
                <div className="contact-muted-link" key={item.label}>
                  <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

function App() {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const closeOnOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setMobileNavOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

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

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const lenis = new Lenis({
      anchors: {
        offset: -105,
        duration: 1.05,
      },
      autoRaf: true,
      duration: 1.32,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.92,
      prevent: (node) =>
        node instanceof Element &&
        Boolean(node.closest("[data-lenis-prevent], [role='dialog'], dialog, textarea, select")),
    });

    window.lenis = lenis;

    return () => {
      lenis.destroy();
      if (window.lenis === lenis) delete window.lenis;
    };
  }, []);

  return (
    <div className="site-shell" ref={rootRef}>
      <ArrakisIntro />
      <header className={`nav ${mobileNavOpen ? "is-open" : ""}`} ref={navRef}>
        <nav className="nav-links" aria-label="Primary navigation" id="primary-navigation">
          <a href="#worklog" onClick={() => setMobileNavOpen(false)}>Experience</a>
          <a href="#github-map" onClick={() => setMobileNavOpen(false)}>Projects</a>
          <a href="#field-notes" onClick={() => setMobileNavOpen(false)}>Writing</a>
          <a href="#hitlist" onClick={() => setMobileNavOpen(false)}>Hitlist</a>
          <a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>
        </nav>
        <button
          className="avatar-link"
          type="button"
          aria-label="Toggle primary navigation"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          <img src="/avatar-harsh.png" alt="" />
        </button>
      </header>

      <main>
        <HeroSection />
        <WorklogTimelineSection />
        <GitHubMapSection />
        <FieldNotesSection />
        <HitlistSection />
        <AboutSection />
        <ContactSection />
      </main>

      <footer className="site-footer" id="footer">
        <div className="footer-flair">
          <span>HARSH BHARDWAJ</span>
          <strong>Building, learning and Growing</strong>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="/#about">About</a>
          <a href="/#worklog">Experience</a>
          <a href="/#github-map">GitHub</a>
          <a href="/#field-notes">Writing</a>
          <a href="/#hitlist">Hitlist</a>
          <a href="/#contact">Contact</a>
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
