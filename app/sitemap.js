import { BASE_URL, getAllPostSummaries } from "./lib/naverPosts";

function toSafeDate(value) {
  if (!value) return new Date();

  const normalized = value
    .replace(/\./g, "-")
    .replace(/\s+/g, "")
    .replace(/-$/, "");
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap() {
  const posts = await getAllPostSummaries();
  const postUrls = posts.map((p) => ({
    url: `${BASE_URL}/posts/${p.slug}`,
    lastModified: toSafeDate(p.addDate),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/archive`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...postUrls,
  ];
}
