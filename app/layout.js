export const metadata = {
  title: "김기현의 비즈니스 AI랩",
  description: "네이버 블로그 kingnation의 글을 모은 검색 가능한 아카이브입니다.",
  metadataBase: new URL("https://mmpi-people.kr"),
  verification: {
    google: [
      "mHel28dtfT9XNPNgr2QW2fSDc8_ys7XEIThb3m-xO8c",
      "DygTh4U9GSwzJ_41exp75QLL3boNvWGo7h80IOdVkY0",
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          background: "#f7f7f8",
          color: "#222",
        }}
      >
        {children}
      </body>
    </html>
  );
}
