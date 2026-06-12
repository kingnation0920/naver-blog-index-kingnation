import { XMLParser } from "fast-xml-parser";

// ★ 여기에 본인의 네이버 블로그 ID를 입력하세요.
// 예: m.blog.naver.com/kingnation -> "kingnation"
const NAVER_BLOG_ID = "kingnation";

const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;

// 1시간마다 RSS를 다시 가져와 페이지를 갱신합니다 (ISR).
export const revalidate = 3600;

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toMobileLink(link = "") {
  // PC 주소(blog.naver.com)를 모바일 주소(m.blog.naver.com)로 변환
  return link.replace("://blog.naver.com", "://m.blog.naver.com");
}

async function getPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });

    if (!res.ok) {
      return { posts: [], error: `RSS 응답 오류 (status ${res.status})` };
    }

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);

    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];

    const posts = items.map((item) => ({
      title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "(제목 없음)",
      link: toMobileLink(item.link ?? "#"),
      description: stripHtml(
        typeof item.description === "string"
          ? item.description
          : item.description?.["#text"] ?? ""
      ).slice(0, 160),
      pubDate: item.pubDate ?? "",
    }));

    return { posts, error: null };
  } catch (e) {
    return { posts: [], error: String(e) };
  }
}

export default async function Home() {
  const { posts, error } = await getPosts();

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>ainui 블로그 글 모음</h1>
        <p style={{ color: "#666", lineHeight: 1.6 }}>
          네이버 블로그{" "}
          <a
            href={`https://m.blog.naver.com/${NAVER_BLOG_ID}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            m.blog.naver.com/{NAVER_BLOG_ID}
          </a>{" "}
          의 최신 글 목록입니다. (RSS 기반, {revalidate / 60}분마다 자동 갱신)
        </p>
      </header>

      {error && (
        <p style={{ color: "#c00" }}>
          글 목록을 불러오는 중 오류가 발생했습니다: {error}
        </p>
      )}

      {!error && posts.length === 0 && (
        <p style={{ color: "#666" }}>표시할 글이 없습니다.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li
            key={post.link}
            style={{
              background: "#fff",
              border: "1px solid #e5e5e8",
              borderRadius: 12,
              padding: "18px 20px",
              marginBottom: 14,
            }}
          >
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
              }}
            >
              {post.title}
            </a>
            {post.description && (
              <p style={{ margin: "8px 0 0", color: "#555", fontSize: 14, lineHeight: 1.6 }}>
                {post.description}
              </p>
            )}
            {post.pubDate && (
              <time style={{ display: "block", marginTop: 8, fontSize: 12, color: "#999" }}>
                {post.pubDate}
              </time>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
