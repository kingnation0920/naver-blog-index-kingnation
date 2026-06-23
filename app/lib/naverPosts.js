import { XMLParser } from "fast-xml-parser";

export const NAVER_BLOG_ID = "kingnation";
export const BASE_URL = "https://mmpi-people.kr";
export const revalidate = 21600;

const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
const LIST_API = (page) =>
  `https://blog.naver.com/PostTitleListAsync.naver?blogId=${NAVER_BLOG_ID}&viewdate=&currentPage=${page}&categoryNo=0&parentCategoryNo=&countPerPage=30`;

const headers = {
  "User-Agent": "Mozilla/5.0 (compatible; KingnationArchive/1.0)",
};

const ITEM_REGEX =
  /"logNo":"(\d+)"[\s\S]*?"title":"([^"]*)"[\s\S]*?"addDate":"([^"]*)"/g;

export function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeTitle(raw = "") {
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ");
  } catch {
    return raw.replace(/\+/g, " ");
  }
}

function decodeHtml(raw = "") {
  return raw
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—");
}

function extractMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`<meta\\s+property=["']${escaped}["']\\s+content=["']([^"']*)["']`, "i")
  );
  return match ? decodeHtml(match[1]) : "";
}

function extractContainer(html, className) {
  const marker = `class="${className}"`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return "";

  const start = html.lastIndexOf("<div", markerIndex);
  if (start < 0) return "";

  let cursor = start;
  let depth = 0;
  while (cursor < html.length) {
    const nextOpen = html.indexOf("<div", cursor);
    const nextClose = html.indexOf("</div>", cursor);

    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      cursor = nextOpen + 4;
      continue;
    }

    depth--;
    cursor = nextClose + 6;
    if (depth === 0) return html.slice(start, cursor);
  }

  return "";
}

function normalizeNaverHtml(html = "") {
  return html
    .replace(/src="\/\//g, 'src="https://')
    .replace(/href="\/\//g, 'href="https://')
    .replace(/src="\//g, 'src="https://m.blog.naver.com/')
    .replace(/href="\//g, 'href="https://m.blog.naver.com/')
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
}

export function originalPostUrl(logNo) {
  return `https://m.blog.naver.com/${NAVER_BLOG_ID}/${logNo}`;
}

export async function getAllPostSummaries() {
  const posts = new Map();
  let emptyStreak = 0;

  for (let page = 1; page <= 100; page++) {
    const res = await fetch(LIST_API(page), {
      headers,
      next: { revalidate },
    });

    if (!res.ok) break;

    const text = await res.text();
    const regex = new RegExp(ITEM_REGEX);
    let found = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      found++;
      const [, logNo, title, addDate] = match;
      if (!posts.has(logNo)) {
        posts.set(logNo, {
          slug: logNo,
          logNo,
          title: decodeTitle(title),
          addDate,
          link: originalPostUrl(logNo),
        });
      }
    }

    if (found === 0) {
      emptyStreak++;
      if (emptyStreak > 2) break;
    } else {
      emptyStreak = 0;
    }
  }

  return Array.from(posts.values()).sort((a, b) => Number(b.logNo) - Number(a.logNo));
}

export async function getRssPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 3600 },
      headers,
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];

    return items
      .map((item) => {
        const link = item.link ?? "#";
        const match = link.match(/\/(\d+)(?:\?|$)/);
        const slug = match ? match[1] : null;
        return {
          slug,
          logNo: slug,
          title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "제목 없음",
          link,
          content: typeof item.description === "string" ? item.description : item.description?.["#text"] ?? "",
          pubDate: item.pubDate ?? "",
        };
      })
      .filter((post) => post.slug);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug) {
  const rssPosts = await getRssPosts();
  const rssPost = rssPosts.find((post) => post.slug === slug);
  if (rssPost?.content) return rssPost;

  const summaries = await getAllPostSummaries();
  const summary = summaries.find((post) => post.slug === slug);
  if (!summary) return null;

  try {
    const res = await fetch(originalPostUrl(slug), {
      headers,
      next: { revalidate },
    });
    if (!res.ok) return summary;

    const html = await res.text();
    const content = normalizeNaverHtml(extractContainer(html, "se-main-container"));
    return {
      ...summary,
      title: extractMeta(html, "og:title") || summary.title,
      description: extractMeta(html, "og:description"),
      content,
    };
  } catch {
    return summary;
  }
}
