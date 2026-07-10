import { initialBlogs, getBlogImage } from "../../src/data/blogs.js";
import {
  blogsDescription,
  blogsTitle,
  getBlogsJsonLd,
  getSharedOpenGraph,
  getSharedTwitter,
  siteName,
  stringifyJsonLd,
} from "../../src/data/seo.js";

const title = `${blogsTitle} | ${siteName}`;

export const metadata = {
  title: blogsTitle,
  description: blogsDescription,
  alternates: {
    canonical: "/blogs",
  },
  openGraph: getSharedOpenGraph({
    title,
    description: blogsDescription,
    url: "/blogs",
    type: "website",
  }),
  twitter: getSharedTwitter({
    title,
    description: blogsDescription,
  }),
};

export default function BlogsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getBlogsJsonLd(initialBlogs, getBlogImage)),
        }}
      />
      {children}
    </>
  );
}
