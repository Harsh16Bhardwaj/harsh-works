import "../src/styles.css";
import { BlogProvider } from "../src/BlogStore.jsx";
import {
  getSharedOpenGraph,
  getSharedTwitter,
  ogImagePath,
  seoKeywords,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from "../src/data/seo.js";

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: seoKeywords,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "portfolio",
  alternates: {
    canonical: "/",
  },
  openGraph: getSharedOpenGraph(),
  twitter: getSharedTwitter(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { rel: "image_src", url: ogImagePath },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BlogProvider>{children}</BlogProvider>
      </body>
    </html>
  );
}
