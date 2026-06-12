export const metadata = {
  title: "ainui 블로그 글 모음",
  description: "ainui의 네이버 블로그 글 모음 - 최신 글 목록을 자동으로 보여줍니다.",
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
