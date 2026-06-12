# 네이버 블로그 글 모음 사이트 (Vercel)

네이버 블로그(`m.blog.naver.com`)의 RSS 피드를 자동으로 읽어와 최신 글 목록을 보여주는
Next.js 사이트입니다. 글을 새로 쓰면 1시간 이내에 이 사이트도 자동으로 갱신됩니다.

## 0. 블로그 ID 설정 (필수)

`app/page.js` 파일 상단의 아래 줄을 본인의 네이버 블로그 ID로 바꿔주세요.

```js
const NAVER_BLOG_ID = "kingnation"; // m.blog.naver.com/본인아이디
```

## 1. GitHub에 올리기

1. https://github.com 에서 새 저장소(Repository) 생성 (예: `naver-blog-index`)
2. 이 폴더 전체를 그 저장소에 푸시
   ```bash
   cd naver-blog-index
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/내계정/naver-blog-index.git
   git push -u origin main
   ```

## 2. Vercel에 배포

1. https://vercel.com 가입/로그인 (GitHub 계정으로 로그인하면 편함)
2. "Add New..." → "Project" → 방금 만든 GitHub 저장소 선택
3. Framework Preset이 자동으로 "Next.js"로 인식됨 → "Deploy" 클릭
4. 배포 완료 후 `https://프로젝트명.vercel.app` 주소로 사이트 접속 가능

## 3. 구글 서치콘솔 등록 (색인 요청)

1. https://search.google.com/search-console 접속
2. "속성 추가" → URL 접두어 방식으로 Vercel 주소 입력 (예: `https://naver-blog-index.vercel.app`)
3. 소유권 확인: "HTML 태그" 방식 선택 → 발급된 `<meta name="google-site-verification" ...>` 태그를
   `app/layout.js`의 `<head>`에 추가 (Next.js의 `metadata` 객체에 추가해도 됨)

   ```js
   export const metadata = {
     title: "...",
     description: "...",
     verification: {
       google: "여기에_발급받은_코드만_입력",
     },
   };
   ```

   추가 후 다시 git push → Vercel 자동 재배포 → 서치콘솔에서 "확인" 클릭

4. 서치콘솔 상단 검색창에 사이트 주소 입력 → "색인 생성 요청" 클릭
5. 사이트 안의 m.blog.naver.com 링크들도 구글이 크롤링하면서 함께 발견 → 백링크 효과

## 4. 자동 갱신 주기 변경

`app/page.js`의 `export const revalidate = 3600;` 값을 바꾸면 갱신 주기(초)를 조절할 수 있습니다.
(예: 600 = 10분마다)

## 로컬에서 테스트

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속
