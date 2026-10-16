import { siteOrigin } from "@/lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/", "/slice-simulator", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", siteOrigin()).href,
  };
}
