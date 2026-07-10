export const metadata = {
  title: "Blog Admin",
  alternates: {
    canonical: "/admin",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }) {
  return children;
}
