import { getAllPostSummaries } from "./lib/naverPosts";

export default async function Home() {
  const posts = (await getAllPostSummaries()).slice(0, 50);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>김기현의 비즈니스 AI랩</h1>
      <p style={{ marginBottom: 32, color: "#666", lineHeight: 1.6 }}>
        네이버 블로그 kingnation의 글 아카이브입니다. 최신 50개 글을 먼저 보여줍니다.{" "}
        <a href="/archive">전체 글 보기</a>
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li key={post.slug} style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}>
            <a
              href={`/posts/${post.slug}`}
              style={{ fontSize: 16, color: "#1a1a1a", textDecoration: "none", fontWeight: 500 }}
            >
              {post.title}
            </a>
            {post.addDate && (
              <time style={{ display: "block", marginTop: 4, fontSize: 12, color: "#999" }}>
                {post.addDate}
              </time>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
