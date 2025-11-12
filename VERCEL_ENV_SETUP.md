# Vercel 환경 변수 설정 가이드

## Render 서버 정보
- Render 서버 URL: `https://vibe-coding-shppingmall-demo.onrender.com`
- API Base URL: `https://vibe-coding-shppingmall-demo.onrender.com/api`

## Vercel 환경 변수 설정

### 1. Vercel 대시보드 접속
1. https://vercel.com 접속
2. 프로젝트 선택

### 2. Environment Variables 설정
**Settings** → **Environment Variables** → **Add New**

### 3. 추가할 환경 변수

#### 필수 환경 변수:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://vibe-coding-shppingmall-demo.onrender.com/api` | Production, Preview, Development 모두 선택 |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your-cloudinary-cloud-name` | Production, Preview, Development 모두 선택 |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `your-upload-preset-name` | Production, Preview, Development 모두 선택 |

### 4. 저장 후 재배포
- 환경 변수 저장 후 자동으로 재배포되거나
- **Deployments** 탭 → 최신 배포의 **⋮** 메뉴 → **Redeploy**

## 확인 방법

### 1. 브라우저 콘솔 확인
재배포 후 브라우저 개발자 도구(F12) → Console 탭:
```
🔍 API Base URL: https://vibe-coding-shppingmall-demo.onrender.com/api
🔍 VITE_API_URL: https://vibe-coding-shppingmall-demo.onrender.com/api
```

### 2. Network 탭 확인
로그인 시도 후:
- 요청 URL: `https://vibe-coding-shppingmall-demo.onrender.com/api/auth/login`
- `x-vercel-id` 헤더가 없어야 함 (직접 호출이므로)

### 3. Render 서버 확인
브라우저에서 직접 접속:
- https://vibe-coding-shppingmall-demo.onrender.com/api/health
- MongoDB 연결 상태 확인

## Render 서버 CORS 설정 확인

Render 대시보드에서 `CLIENT_URL` 환경 변수 확인:
```
CLIENT_URL = https://your-vercel-app.vercel.app
```

Vercel 배포 URL을 알려주시면 정확한 `CLIENT_URL` 값을 설정할 수 있습니다.

