import App from "../src/App.jsx";
import { getHomeJsonLd, stringifyJsonLd } from "../src/data/seo.js";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(getHomeJsonLd()) }}
      />
      <App />
    </>
  );
}
