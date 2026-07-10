"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BLOG_STORAGE_KEY, initialBlogs } from "./data/blogs.js";

const BlogContext = createContext(null);

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BLOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setBlogs(parsed);
      }
    } catch {
      // Keep curated defaults if browser storage is unavailable or malformed.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(blogs));
  }, [blogs, hydrated]);

  const value = useMemo(
    () => ({
      blogs,
      addBlog(blog) {
        setBlogs((current) => [{ ...blog, id: crypto.randomUUID() }, ...current]);
      },
      togglePinned(id) {
        setBlogs((current) =>
          current.map((blog) => (blog.id === id ? { ...blog, pinned: !blog.pinned } : blog)),
        );
      },
      removeBlog(id) {
        setBlogs((current) => current.filter((blog) => blog.id !== id));
      },
      resetBlogs() {
        setBlogs(initialBlogs);
      },
    }),
    [blogs],
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlogs() {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlogs must be used inside BlogProvider");
  return context;
}
