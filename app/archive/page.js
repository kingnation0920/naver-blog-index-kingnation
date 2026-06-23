import { getAllPostSummaries, NAVER_BLOG_ID, revalidate } from "../lib/naverPosts";

export const metadata = {
  title: "김기현의 비즈니스 AI랩 전체 글 목록",
  description: "네이버 블로그 kingnation의 전체 글 아카이브입니다.",
};

export default async function ArchivePage() {
  let posts = [];
  let error = null;

  try {
    posts = await getAllPostSummaries();
  } catch (e) {
    error = String(e);
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>전체 글 목록</h1>
        <p style={{ color: "#666", lineHeight: 1.6 }}>
          네이버 블로그{" "}
          <a
            href={`https://m.blog.naver.com/${NAVER_BLOG_ID}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            m.blog.naver.com/{NAVER_BLOG_ID}
          </a>{" "}
          의 전체 글 {posts.length}개입니다. ({revalidate / 3600}시간마다 자동 갱신)
        </p>
        <p style={{ marginTop: 8 }}>
          <a href="/">최신 글 보기</a>
        </p>
      </header>

      {error && <p style={{ color: "#c00" }}>글 목록을 불러오는 중 오류가 발생했습니다: {error}</p>}

      {!error && posts.length === 0 && <p style={{ color: "#666" }}>표시할 글이 없습니다.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li
            key={post.logNo}
            style={{
              background: "#fff",
              border: "1px solid #e5e5e8",
              borderRadius: 8,
              padding: "14px 18px",
              marginBottom: 10,
            }}
          >
            <a
              href={`/posts/${post.logNo}`}
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
              }}
            >
              {post.title}
            </a>
            {post.addDate && (
              <time style={{ display: "block", marginTop: 6, fontSize: 12, color: "#999" }}>
                {post.addDate}
              </time>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
