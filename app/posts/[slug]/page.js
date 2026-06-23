import { notFound } from "next/navigation";
import { getPostBySlug, revalidate, stripHtml } from "../../lib/naverPosts";

export { revalidate };

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };

  return {
    title: post.title,
    description: (post.description || stripHtml(post.content)).slice(0, 160),
  };
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <nav style={{ marginBottom: 24 }}>
        <a href="/" style={{ color: "#666", textDecoration: "none", fontSize: 14 }}>
          목록으로
        </a>
      </nav>
      <article>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{post.title}</h1>
        {(post.pubDate || post.addDate) && (
          <time style={{ display: "block", marginBottom: 24, fontSize: 13, color: "#999" }}>
            {post.pubDate || post.addDate}
          </time>
        )}
        {post.content ? (
          <div
            style={{ lineHeight: 1.8, color: "#333", fontSize: 16 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p style={{ lineHeight: 1.8, color: "#555" }}>
            본문을 불러오지 못했습니다. 아래 원문 링크에서 내용을 확인할 수 있습니다.
          </p>
        )}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #eee" }}>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#03c75a", textDecoration: "none", fontSize: 14 }}
          >
            네이버 블로그 원문 보기
          </a>
        </div>
      </article>
    </main>
  );
}
