# Shopping Mall Server

Node.js, Express, MongoDB를 사용한 쇼핑몰 데모 서버입니다.

## 설치 방법

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 열어서 MongoDB 연결 정보를 설정하세요.

## 실행 방법

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

## MongoDB 설정

### 로컬 MongoDB 사용
1. MongoDB를 로컬에 설치하고 실행
2. `.env` 파일에서 `MONGODB_URI=mongodb://localhost:27017/shoping-mall` 설정

### MongoDB Atlas 사용 (클라우드)
1. MongoDB Atlas 계정 생성 및 클러스터 생성
2. `.env` 파일에서 Atlas 연결 문자열 설정

## 프로젝트 구조

```
server/
├── config/
│   └── database.js      # MongoDB 연결 설정
├── routes/              # API 라우트 (추가 예정)
├── models/              # MongoDB 모델 (추가 예정)
├── controllers/         # 컨트롤러 (추가 예정)
├── middleware/          # 미들웨어 (추가 예정)
├── app.js               # Express 앱 설정
├── index.js             # 서버 진입점 (메인 파일)
├── package.json
└── .env                 # 환경 변수 (gitignore에 포함됨)
```

