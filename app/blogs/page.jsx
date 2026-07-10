"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Heart, Search } from "lucide-react";
import { useBlogs } from "../../src/BlogStore.jsx";
import { formatBlogDate, getBlogImage } from "../../src/data/blogs.js";

export default function BlogsPage() {
  const { blogs } = useBlogs();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const pinned = blogs.filter((blog) => blog.pinned);
  const years = [...new Set(blogs.map((blog) => blog.date.slice(0, 4)))].sort().reverse();

  const filteredBlogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return blogs
      .filter((blog) => {
        if (filter === "pinned" && !blog.pinned) return false;
        if (/^\d{4}$/.test(filter) && !blog.date.startsWith(filter)) return false;
        return !normalized || `${blog.title} ${blog.description}`.toLowerCase().includes(normalized);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [blogs, filter, query]);

  return (
    <main className="blog-archive">
      <div className="archive-background-marks" aria-hidden="true">
        <span className="archive-orbit-mark" />
        <span className="archive-coordinate">28.6139° N / 77.2090° E</span>
        <span className="archive-record-code">FIELD RECORDS · HB-07</span>
      </div>
      <header className="archive-header">
        <a href="/#field-notes" className="archive-back"><ArrowLeft size={16} /> Field Notes</a>
        <div className="archive-title-block">
          <p>Public Learning Trail / 07</p>
          <h1>Field Notes</h1>
          <span>Build records, technical explanations, and lessons made public.</span>
        </div>
      </header>

      <section className="archive-pinned" aria-labelledby="pinned-title">
        <div className="archive-section-title">
          <p>Selected records</p>
          <h2 id="pinned-title">Pinned Notes</h2>
        </div>
        <div className="archive-pinned-grid">
          {pinned.map((blog, index) => (
            <article className="archive-card" key={blog.id}>
              <a href={blog.link} target="_blank" rel="noreferrer">
                <img src={getBlogImage(blog, index)} alt="" />
                <i className="image-corner-mark" aria-hidden="true" />
                <small className="image-plate-label" aria-hidden="true">
                  Plate {String(index + 1).padStart(2, "0")}
                </small>
              </a>
              <div>
                <span>{formatBlogDate(blog.date)}</span>
                <h3>{blog.title}</h3>
                <p>{blog.description}</p>
                <footer>
                  <span><Heart size={14} /> {blog.likes}</span>
                  <a href={blog.link} target="_blank" rel="noreferrer" aria-label={`Read ${blog.title}`}>
                    Read <ArrowUpRight size={15} />
                  </a>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="archive-browser" aria-labelledby="all-notes-title">
        <aside className="archive-controls">
          <p>Search archive</p>
          <label className="archive-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search field notes</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or description"
            />
          </label>
          <div className="archive-filters" aria-label="Filter field notes">
            <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")} type="button">All</button>
            <button className={filter === "pinned" ? "is-active" : ""} onClick={() => setFilter("pinned")} type="button">Pinned</button>
            {years.map((year) => (
              <button className={filter === year ? "is-active" : ""} onClick={() => setFilter(year)} type="button" key={year}>{year}</button>
            ))}
          </div>
        </aside>

        <div className="archive-list">
          <div className="archive-list-head">
            <div>
              <p>Archive index</p>
              <h2 id="all-notes-title">All notes</h2>
            </div>
            <strong>{filteredBlogs.length} / {blogs.length} entities</strong>
          </div>
          {filteredBlogs.length ? filteredBlogs.map((blog, index) => (
            <article className="archive-list-item" key={blog.id}>
              <img src={getBlogImage(blog, index)} alt="" loading="lazy" />
              <div>
                <span>{formatBlogDate(blog.date)} {blog.pinned ? " / PINNED" : ""}</span>
                <h3>{blog.title}</h3>
                <p>{blog.description}</p>
              </div>
              <a href={blog.link} target="_blank" rel="noreferrer" aria-label={`Read ${blog.title}`}>
                <ArrowUpRight size={18} />
              </a>
            </article>
          )) : <p className="archive-empty">No field notes match this search.</p>}
        </div>
      </section>
    </main>
  );
}
