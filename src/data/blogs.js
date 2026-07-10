export const BLOG_STORAGE_KEY = "harsh-portfolio-blogs-v6";

export const blogPlaceholders = [
  "/backgrounds/github-giedi-prime.webp",
  "/backgrounds/worklog.webp",
  "/backgrounds/clean-bg.webp",
  "/backgrounds/about-section.webp",
  "/backgrounds/moon.png",
  "/backgrounds/footer.webp",
];

export const initialBlogs = [
  {
    id: "how-not-to-make-machines-learn",
    image: "/blogs/first-blog.png",
    title: "How not to make Machine's Learn",
    description:
      "A practical map of the places machine-learning systems break: data, sampling, features, evaluation, and assumptions.",
    date: "2026-05-29",
    likes: 4,
    link: "https://dev.to/harsh_bhardwaj_809a89d3a7/how-not-to-make-machines-learn-16pa",
    pinned: true,
  },
  {
    id: "what-the-heck-is-iam-in-aws",
    image: "/blogs/second-blog-v2.png",
    title: "What the heck is IAM in AWS",
    description:
      "A direct introduction to securing an AWS sandbox with identities, permissions, and deliberate access boundaries.",
    date: "2025-08-12",
    likes: 2,
    link: "https://dev.to/harsh_bhardwaj_809a89d3a7/what-the-heck-is-iam-in-aws-234j",
    pinned: true,
  },
  {
    id: "keep-your-db-awake-with-hibernot",
    image: "/blogs/third-blog.png",
    title: "Keep Your DB Awake with Hibernot",
    description:
      "The build story behind a small automation that prevents free-tier databases from quietly hibernating.",
    date: "2025-05-25",
    likes: 7,
    link: "https://dev.to/harsh_bhardwaj_809a89d3a7/tired-of-receiving-database-hibernated-messages-keep-your-db-awake-with-hibernot--1hhb",
    pinned: true,
  },
  {
    id: "in-quest-of-clarity",
    image: "/backgrounds/about-section.webp",
    title: "In Quest of Clarity: The Methodical Madness Behind Research",
    description:
      "A field note on turning scattered startup and hackathon research into a method that produces clearer decisions.",
    date: "2025-01-02",
    likes: 6,
    link: "https://dev.to/harsh_bhardwaj_809a89d3a7/in-quest-of-clarity-the-methodical-madness-behind-research-3ief",
    pinned: false,
  },
  {
    id: "realtime-chat-tradeoffs",
    image: "/backgrounds/moon.png",
    title: "How Realtime Chat Apps Work: Know the Trade-Offs",
    description:
      "A system-level look at realtime chat architecture and the engineering trade-offs behind familiar messaging products.",
    date: "2025-05-03",
    likes: 4,
    link: "https://dev.to/harsh_bhardwaj_809a89d3a7/how-realtime-chat-apps-are-know-the-trade-offs-5f0",
    pinned: false,
  },
  {
    id: "what-is-a-data-pipeline",
    image: "/backgrounds/footer.webp",
    title: "What Is a Data Pipeline (And Why You Should Care)",
    description:
      "A concise explanation of how raw application data moves through collection, transformation, storage, and delivery.",
    date: "2025-05-08",
    likes: 1,
    link: "https://dev.to/harsh_bhardwaj_809a89d3a7/what-is-a-data-pipeline-and-why-you-should-care-25lg",
    pinned: false,
  },
  {
    id: "notion-sql",
    image: "/backgrounds/personalcloud-flowchart.png",
    title: "SQL",
    description:
      "Structured notes on relational data, query construction, joins, aggregation, and the database concepts worth keeping close during implementation.",
    date: "2026-07-09",
    likes: 0,
    link: "https://steady-prose-30d.notion.site/SQL-338069a4ef8d80b983f9db86d708b895",
    pinned: false,
  },
  {
    id: "notion-system-design-101",
    image: "/backgrounds/flowchartnameframe.png",
    title: "System Design 101",
    description:
      "A working reference for reasoning about scale, service boundaries, data flow, reliability, caching, queues, and architectural trade-offs.",
    date: "2026-07-09",
    likes: 0,
    link: "https://steady-prose-30d.notion.site/System-Design-101-309069a4ef8d80b1aa57c5bf016dada7",
    pinned: false,
  },
  {
    id: "notion-aws-networking-101",
    image: "/backgrounds/github-giedi-prime.webp",
    title: "AWS Networking 101",
    description:
      "Field notes covering VPC structure, subnets, routing, gateways, security boundaries, and the network paths behind deployed AWS systems.",
    date: "2026-07-09",
    likes: 0,
    link: "https://steady-prose-30d.notion.site/AWS-Networking-101-247069a4ef8d80beb928cc3c27869f5a",
    pinned: false,
  },
];

export function getBlogImage(blog, index = 0) {
  return blog.image?.trim() || blogPlaceholders[index % blogPlaceholders.length];
}

export function formatBlogDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
