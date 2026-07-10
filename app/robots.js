import { siteUrl } from "../src/data/seo.js";

export default function robots() {
  const { host } = new URL(siteUrl);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}
