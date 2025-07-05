# 대학생 AI 챗봇 서비스

대학생들의 학교생활 고민을 해결해주는 AI 선배 챗봇 서비스입니다. 

## 🌟 주요 기능

- **캐릭터 선택**: 5가지 성격의 AI 선배 중 선택
- **학교생활 상담**: 대학 적응, 인간관계, 진로 고민 등
- **학사일정 안내**: 수강신청, 시험 일정, 학교 행사 등
- **도서관 서비스**: 도서 검색, 추천, 대출 현황 등
- **실시간 채팅**: 자연스러운 대화형 인터페이스

## 🎭 AI 선배 캐릭터

- **써니** 🌞: 밝고 활발한 선배 (학교생활 적응 전문)
- **세이지** 🧠: 차분하고 신중한 선배 (학업 관리 전문)
- **스파크** ⚡: 창의적이고 열정적인 선배 (프로젝트 기획 전문)
- **칼름** 💚: 따뜻하고 공감하는 선배 (스트레스 관리 전문)
- **버디** 😄: 재미있고 유머러스한 선배 (캠퍼스 생활 전문)

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 14, TypeScript, Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **상태 관리**: React Context, Zustand
- **API**: OpenAI GPT API
- **데이터**: JSON 파일 기반 (서버리스 환경)

## 🚀 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd lib_y_202507
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API 키 (필수)
OPENAI_API_KEY=your_openai_api_key_here

# 기본 URL (선택사항)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
lib_y_202507/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # 마케팅 페이지
│   │   ├── api/               # API 라우트
│   │   │   ├── chat/          # 채팅 API
│   │   │   ├── academic/      # 학사일정 API
│   │   │   └── library/       # 도서관 API
│   │   ├── character-select/   # 캐릭터 선택 페이지
│   │   └── chat/              # 채팅 페이지
│   ├── components/            # React 컴포넌트
│   │   ├── ui/                # shadcn/ui 컴포넌트
│   │   ├── marketing/         # 마케팅 페이지 컴포넌트
│   │   └── dashboard/         # 대시보드 컴포넌트
│   └── lib/                   # 유틸리티 함수
├── content/                   # 데이터 파일
│   ├── characters.json        # 캐릭터 정보
│   ├── academic-calendar.json # 학사일정 데이터
│   └── library-books.json     # 도서관 도서 데이터
├── FRONTEND_RULES.md          # 프론트엔드 개발 규칙
└── BACKEND_RULES.md           # 백엔드 개발 규칙
```

## 🔧 API 엔드포인트

### 채팅 API
- `POST /api/chat`: AI 챗봇과의 대화

### 학사일정 API
- `GET /api/academic`: 학사일정 조회
- `POST /api/academic`: 학사일정 검색

### 도서관 API
- `GET /api/library`: 도서 조회
- `POST /api/library`: 도서 검색

## 📝 사용 방법

1. **캐릭터 선택**: 메인 페이지에서 원하는 AI 선배 선택
2. **대화 시작**: 선택한 캐릭터와 자유롭게 대화
3. **학사일정 문의**: "시험 일정", "수강신청" 등 키워드로 질문
4. **도서 검색**: "책 추천", "전공 도서" 등 키워드로 질문

## 🎯 주요 질문 예시

### 학교생활 상담
- "학교 적응이 어려워요"
- "진로 고민이 있어요"
- "동아리 활동 추천해주세요"

### 학사일정
- "이번 학기 시험 일정 알려주세요"
- "수강신청 언제예요?"
- "방학은 언제부터인가요?"

### 도서관 서비스
- "컴퓨터 관련 책 추천해주세요"
- "심리학 책 찾고 있어요"
- "신입생 추천 도서 알려주세요"

## 🔒 환경 변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `OPENAI_API_KEY` | OpenAI API 키 | 필수 |
| `NEXT_PUBLIC_BASE_URL` | 애플리케이션 기본 URL | 선택 |

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 정적 분석

```bash
npm run lint
npm run type-check
```

## 🤝 개발 규칙

- 프론트엔드 개발 규칙: `FRONTEND_RULES.md` 참조
- 백엔드 개발 규칙: `BACKEND_RULES.md` 참조

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🆘 문제 해결

### OpenAI API 키 오류
- `.env.local` 파일에 올바른 API 키가 설정되어 있는지 확인
- API 키가 유효하고 크레딧이 있는지 확인

### 빌드 오류
- Node.js 버전이 18 이상인지 확인
- `npm install`로 의존성을 다시 설치

### 개발 서버 오류
- 포트 3000이 사용 중인지 확인
- 환경 변수가 올바르게 설정되어 있는지 확인
