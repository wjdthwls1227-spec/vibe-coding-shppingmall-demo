# Shopping Mall Demo

React + Node.js + MongoDB를 사용한 쇼핑몰 데모 프로젝트입니다.

## 프로젝트 구조

```
shoping-mall-demo/
├── client/          # React 프론트엔드 (Vite)
├── server/          # Node.js 백엔드 (Express)
└── README.md        # 프로젝트 설명서
```

## 기술 스택

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT 인증
- PortOne (Iamport) 결제 연동
- Cloudinary 이미지 업로드

## 시작하기

### 사전 요구사항
- Node.js (v16 이상)
- MongoDB (로컬 또는 MongoDB Atlas)

### 설치 및 실행

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd shoping-mall-demo
```

#### 2. 서버 설정
```bash
cd server
npm install
```

환경 변수 설정 (`server/.env` 파일 생성):
```env
PORT=5002
MONGODB_ATLAS_URL=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
PORTONE_REST_API_KEY=your_portone_api_key
PORTONE_REST_API_SECRET=your_portone_api_secret
```

서버 실행:
```bash
npm run dev
```

#### 3. 클라이언트 설정
```bash
cd client
npm install
```

환경 변수 설정 (`client/.env` 파일 생성):
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_preset
VITE_API_URL=http://localhost:5002/api
```

클라이언트 실행:
```bash
npm run dev
```

## 배포

### 서버 (Render)
1. Render 대시보드에서 Web Service 생성
2. GitHub 저장소 연결
3. Root Directory: `server` 설정
4. 환경 변수 설정 (Render 대시보드)
5. Build Command: `npm install`
6. Start Command: `npm start`

### 클라이언트 (Vercel)
1. Vercel 대시보드에서 프로젝트 생성
2. GitHub 저장소 연결
3. Root Directory: `client` 설정
4. Framework Preset: `Vite` 선택
5. 환경 변수 설정:
   - `VITE_API_URL`: Render 서버 URL
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

## 주요 기능

- 사용자 인증 (회원가입, 로그인, JWT)
- 상품 관리 (CRUD)
- 장바구니 기능
- 주문 관리
- 결제 연동 (PortOne)
- 이미지 업로드 (Cloudinary)
- 관리자 페이지

## 라이선스

ISC

