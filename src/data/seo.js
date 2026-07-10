export const siteUrl = "https://www.harshbhardwaj.dev";

export const siteName = "Harsh Bhardwaj";

export const siteTitle =
  "Harsh Bhardwaj | ML Products, Full-Stack Systems & Public Learning Trails";

export const siteDescription =
  "Harsh Bhardwaj builds ML products, full-stack systems, automation workflows, public learning trails, and proof-heavy engineering artifacts.";

export const blogsTitle = "Field Notes";

export const blogsDescription =
  "Technical field notes by Harsh Bhardwaj on machine learning, AWS, system design, data pipelines, realtime systems, databases, and public learning trails.";

export const ogImagePath = "/og/harsh-bhardwaj-og.png";

export const socialLinks = {
  github: "https://github.com/Harsh16Bhardwaj",
  linkedin: "https://www.linkedin.com/in/harsh-bhardwaj16/",
  devto: "https://dev.to/harsh_bhardwaj_809a89d3a7",
  resume: `${siteUrl}/resume.pdf`,
};

export const seoKeywords = [
  "Harsh Bhardwaj",
  "Harsh16Bhardwaj",
  "ML products",
  "machine learning engineer",
  "full-stack systems",
  "software engineer",
  "automation workflows",
  "public learning trails",
  "portfolio",
  "GitHub projects",
  "AWS",
  "system design",
];

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, siteUrl).toString();
}

export function getSharedOpenGraph(overrides = {}) {
  return {
    title: overrides.title ?? siteTitle,
    description: overrides.description ?? siteDescription,
    url: overrides.url ?? "/",
    siteName,
    locale: "en_US",
    type: overrides.type ?? "profile",
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "Harsh Bhardwaj portfolio preview",
      },
    ],
  };
}

export function getSharedTwitter(overrides = {}) {
  return {
    card: "summary_large_image",
    title: overrides.title ?? siteTitle,
    description: overrides.description ?? siteDescription,
    images: [ogImagePath],
  };
}

export function stringifyJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getHomeJsonLd() {
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const profilePageId = `${siteUrl}/#profile-page`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: siteName,
        alternateName: ["Harsh16Bhardwaj", "Harsh Bhardwaj"],
        url: siteUrl,
        image: absoluteUrl("/avatar-harsh.png"),
        jobTitle: "Software Engineer",
        description: siteDescription,
        sameAs: [socialLinks.github, socialLinks.linkedin, socialLinks.devto],
        knowsAbout: [
          "Machine learning products",
          "Full-stack systems",
          "Automation workflows",
          "AWS",
          "System design",
          "Data pipelines",
          "Public learning trails",
          "Agentic engineering workflows",
        ],
        subjectOf: [
          {
            "@type": "CreativeWork",
            name: "Harsh Bhardwaj Resume",
            url: socialLinks.resume,
          },
          {
            "@type": "Blog",
            name: "Harsh Bhardwaj on DEV Community",
            url: socialLinks.devto,
          },
        ],
        mainEntityOfPage: {
          "@id": profilePageId,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: siteName,
        alternateName: "Harsh Bhardwaj Portfolio",
        description: siteDescription,
        inLanguage: "en",
        publisher: {
          "@id": personId,
        },
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        url: siteUrl,
        name: siteTitle,
        description: siteDescription,
        inLanguage: "en",
        isPartOf: {
          "@id": websiteId,
        },
        about: {
          "@id": personId,
        },
        mainEntity: {
          "@id": personId,
        },
      },
    ],
  };
}

export function getBlogsJsonLd(blogs, getBlogImage) {
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const collectionId = `${siteUrl}/blogs#collection`;
  const itemListId = `${siteUrl}/blogs#item-list`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": collectionId,
        url: `${siteUrl}/blogs`,
        name: `${blogsTitle} | ${siteName}`,
        description: blogsDescription,
        inLanguage: "en",
        isPartOf: {
          "@id": websiteId,
        },
        about: {
          "@id": personId,
        },
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "Harsh Bhardwaj writing archive",
        itemListElement: blogs.map((blog, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: blog.link,
          name: blog.title,
          description: blog.description,
          datePublished: blog.date,
          image: absoluteUrl(getBlogImage(blog, index)),
        })),
      },
    ],
  };
}
