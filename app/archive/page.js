// ★ 본인의 네이버 블로그 ID를 입력하세요. (app/page.js 와 동일하게)
const NAVER_BLOG_ID = "kingnation";

// 6시간마다 전체 글 목록을 다시 가져와 갱신합니다 (ISR).
export const revalidate = 21600;

const POST_LIST_API = (page) =>
  `https://blog.naver.com/PostTitleListAsync.naver?blogId=${NAVER_BLOG_ID}&viewdate=&currentPage=${page}&categoryNo=0&parentCategoryNo=&countPerPage=30`;

function decodeTitle(raw = "") {
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ");
  } catch {
    return raw.replace(/\+/g, " ");
  }
}

function toMobileLink(logNo) {
  return `https://m.blog.naver.com/${NAVER_BLOG_ID}/${logNo}`;
}

const ITEM_REGEX =
  /"logNo":"(\d+)"[\s\S]*?"title":"([^"]*)"[\s\S]*?"addDate":"([^"]*)"/g;

async function getAllPosts() {
  const headers = { "User-Agent": "Mozilla/5.0 (compatible; ArchiveBot/1.0)" };
  const posts = new Map();
  let page = 1;
  let emptyStreak = 0;

  while (page <= 100) {
    try {
      const res = await fetch(POST_LIST_API(page), {
        headers,
        next: { revalidate },
      });

      if (!res.ok) break;

      const text = await res.text();
      let found = 0;
      let match;
      const regex = new RegExp(ITEM_REGEX);
      while ((match = regex.exec(text)) !== null) {
        found++;
        const [, logNo, title, addDate] = match;
        if (!posts.has(logNo)) {
          posts.set(logNo, {
            logNo,
            title: decodeTitle(title),
            addDate,
          });
        }
      }

      if (found === 0) {
        emptyStreak++;
        if (emptyStreak > 2) break;
      } else {
        emptyStreak = 0;
      }
    } catch {
      break;
    }
    page++;
  }

  return Array.from(posts.values()).sort(
    (a, b) => Number(b.logNo) - Number(a.logNo)
  );
}

export const metadata = {
  title: "ainui 블로그 전체 글 목록",
  description: "ainui 네이버 블로그의 전체 글 목록입니다.",
};

export default async function ArchivePage() {
  let posts = [];
  let error = null;

  try {
    posts = await getAllPosts();
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
          의 전체 글 {posts.length}개입니다. ({revalidate / 3600}시간마다 자동
          갱신)
        </p>
        <p style={{ marginTop: 8 }}>
          <a href="/">← 최신 글 보기</a>
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
            key={post.logNo}
            style={{
              background: "#fff",
              border: "1px solid #e5e5e8",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 10,
            }}
          >
            <a
              href={toMobileLink(post.logNo)}
              target="_blank"
              rel="noopener noreferrer"
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
