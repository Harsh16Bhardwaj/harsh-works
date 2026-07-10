import { siteUrl } from "../src/data/seo.js";

const lastModified = new Date("2026-07-11T00:00:00.000Z");

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
