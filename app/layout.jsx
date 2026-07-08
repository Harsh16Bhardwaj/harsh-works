import "../src/styles.css";

export const metadata = {
  title: "Harsh Bhardwaj | Personal Platform",
  description:
    "Harsh Bhardwaj's personal platform for builds, notes, experiments, project case files, and public proof trails.",
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23050606'/%3E%3Ctext x='32' y='38' text-anchor='middle' font-family='monospace' font-size='20' font-weight='700' fill='%23f2a7bb'%3EHB%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
