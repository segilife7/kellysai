# Kelly's AI

프롬프트와 직접 만든 웹 도구를 모아 두는 정적 사이트입니다.
빌드 도구나 서버 없이 GitHub Pages에 그대로 올라갑니다.

## 폴더 구조

```
index.html        홈 — 히어로, 대표 프롬프트, 미리보기
prompts.html      프롬프트 전체 목록 + 분류 필터
programs.html     만든 도구 목록
about.html        소개와 문의
404.html          잘못된 주소
robots.txt        검색엔진 수집 허용
.nojekyll         GitHub Pages의 Jekyll 처리 끄기

assets/
  style.css       모든 스타일. 색은 파일 상단 :root 변수에 모여 있습니다.
  app.js          데이터 로딩과 화면 그리기
  logo.svg        파비콘과 공유 이미지용 로고

data/
  menu.json       상단 메뉴
  profile.json    브랜드명, 히어로 문구, 소개글, 강의 분야, 문의 정보
  prompts.json    프롬프트 목록
  programs.json   프로그램 목록
```

**핵심 원칙: HTML은 뼈대만 갖고 있고 내용은 전부 `data/` 의 JSON에서 옵니다.**
글을 고치려고 HTML을 열 일은 없습니다. JSON만 바꾸면 됩니다.

## 올리기 전에 채워야 할 것

`data/profile.json` 의 `contactHref` 가 `mailto:여기에주소를넣으세요` 로 비어 있습니다.
실제 메일 주소로 바꾸세요. 문의 버튼을 아예 빼려면 값을 `""` 로 두면 버튼이 사라집니다.

## 배포

1. GitHub에 레포를 만들고 이 폴더의 내용물을 그대로 올립니다.
2. Settings → Pages → Source 를 `Deploy from a branch`, 브랜치는 `main`, 폴더는 `/ (root)` 로 지정합니다.
3. 1~2분 뒤 주소가 열립니다.

경로를 전부 상대경로로 썼기 때문에 아래 두 경우 모두 수정 없이 동작합니다.

- 사용자 사이트 루트: `https://아이디.github.io/`
- 프로젝트 사이트 하위 경로: `https://아이디.github.io/레포이름/`

## 내 컴퓨터에서 미리 보기

HTML 파일을 더블클릭해서 열면 **화면이 비어 있고 오류 안내만 나옵니다.**
브라우저 보안 정책상 `file://` 에서는 JSON을 읽지 못하기 때문입니다. 정상입니다.

폴더에서 아래를 실행한 뒤 `http://localhost:8000` 으로 접속하세요.

```bash
python3 -m http.server 8000
```

## 내용 추가하기

지금은 JSON을 직접 고칩니다. 3단계에서 만들 관리자 페이지가 이 작업을 폼으로 바꿔 줍니다.

### 프로그램 한 줄 추가

`data/programs.json` 배열에 객체를 하나 더합니다.

```json
{
  "id": "g4",
  "mark": "GS",
  "title": "도구 이름",
  "summary": "무엇을 해 주는 도구인지 두세 문장.",
  "tags": ["분류", "분류"],
  "url": "https://아이디.github.io/도구주소/"
}
```

- `mark` 는 왼쪽 사각 타일에 들어갈 두 글자 정도의 짧은 표시입니다.
- `url` 을 빈 문자열로 두면 바로가기 버튼 대신 "준비 중" 으로 표시됩니다.
- 배열 순서가 곧 화면 순서입니다.

### 프롬프트 한 개 추가

`data/prompts.json` 배열에 객체를 하나 더합니다.

```json
{
  "id": "p9",
  "featured": false,
  "category": "수업 설계",
  "title": "카드에 보일 제목",
  "summary": "한 줄 설명.",
  "tags": ["태그"],
  "body": "프롬프트 전문.\n줄바꿈은 \\n 으로 씁니다.",
  "tip": "왜 이렇게 썼는지 메모. 비워도 됩니다."
}
```

- `category` 는 자동으로 상단 필터 버튼이 됩니다. 새 분류를 쓰면 버튼이 새로 생깁니다.
- `featured` 를 `true` 로 둔 프롬프트가 홈 화면 카드에 올라갑니다. 하나만 true 로 두세요.
- `id` 는 겹치지 않게. `prompts.html#p9` 로 링크하면 그 프롬프트가 열린 채로 열립니다.

### 메뉴 바꾸기

`data/menu.json` 에서 `visible` 을 `false` 로 하면 메뉴에서 사라지고,
`order` 숫자로 순서가 정해집니다. 새 메뉴를 넣으려면 항목을 추가하고
같은 이름의 HTML 파일을 하나 만들면 됩니다.

## 다음 단계

3단계에서 `admin.html` 을 추가합니다. GitHub 토큰을 한 번 입력해 두면
폼으로 항목을 추가·수정·삭제하고, 저장 버튼이 이 JSON 파일들을 커밋합니다.
그 뒤 1~2분이면 공개 사이트에 반영됩니다.
