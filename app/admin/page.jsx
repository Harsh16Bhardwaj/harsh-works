"use client";

import { useState } from "react";
import { ArrowLeft, Pin, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useBlogs } from "../../src/BlogStore.jsx";
import { formatBlogDate, getBlogImage } from "../../src/data/blogs.js";

const emptyForm = {
  image: "",
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  likes: 0,
  link: "",
  pinned: false,
};

export default function AdminPage() {
  const { blogs, addBlog, removeBlog, resetBlogs, togglePinned } = useBlogs();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function submit(event) {
    event.preventDefault();
    addBlog({ ...form, likes: Number(form.likes) || 0 });
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setMessage("Blog entity created and added to the archive.");
  }

  return (
    <main className="blog-admin">
      <header className="admin-header">
        <a href="/blogs"><ArrowLeft size={16} /> Field Notes</a>
        <p>Local content console</p>
        <h1>Blog Admin</h1>
        <span>Creates and pinning changes persist in this browser.</span>
      </header>

      <section className="admin-layout">
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-head">
            <div>
              <p>New entity</p>
              <h2>Create a field note</h2>
            </div>
            <Plus size={22} aria-hidden="true" />
          </div>

          <label>Title<input required name="title" value={form.title} onChange={updateField} /></label>
          <label>Description<textarea required name="description" value={form.description} onChange={updateField} rows="5" /></label>
          <label>Image link<input name="image" type="url" value={form.image} onChange={updateField} placeholder="Optional — placeholder used if empty" /></label>
          <div className="admin-form-row">
            <label>Date<input required name="date" type="date" value={form.date} onChange={updateField} /></label>
            <label>Likes<input required min="0" name="likes" type="number" value={form.likes} onChange={updateField} /></label>
          </div>
          <label>External link<input required name="link" type="url" value={form.link} onChange={updateField} /></label>
          <label className="admin-checkbox"><input name="pinned" type="checkbox" checked={form.pinned} onChange={updateField} /> Pin this note</label>
          <button className="admin-submit" type="submit">Create entity</button>
          {message ? <p className="admin-message" role="status">{message}</p> : null}
        </form>

        <div className="admin-entities">
          <div className="admin-entities-head">
            <div><p>Current archive</p><h2>{blogs.length} entities</h2></div>
            <button type="button" onClick={resetBlogs}><RotateCcw size={15} /> Reset seed data</button>
          </div>
          <div className="admin-entity-list">
            {blogs.map((blog, index) => (
              <article className="admin-entity" key={blog.id}>
                <img src={getBlogImage(blog, index)} alt="" />
                <div>
                  <span>{formatBlogDate(blog.date)}</span>
                  <h3>{blog.title}</h3>
                  <p>{blog.description}</p>
                </div>
                <div className="admin-entity-actions">
                  <button
                    className={blog.pinned ? "is-active" : ""}
                    onClick={() => togglePinned(blog.id)}
                    type="button"
                    aria-label={`${blog.pinned ? "Unpin" : "Pin"} ${blog.title}`}
                  >
                    <Pin size={16} /> {blog.pinned ? "Pinned" : "Pin"}
                  </button>
                  <button onClick={() => removeBlog(blog.id)} type="button" aria-label={`Delete ${blog.title}`}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
