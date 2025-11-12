# 서버 연결 문제 해결 가이드

## 문제: "서버에 연결할 수 없습니다"

### 1. Vercel 환경 변수 확인

**Vercel 대시보드에서:**
1. 프로젝트 선택
2. **Settings** → **Environment Variables**
3. `VITE_API_URL` 확인:
   ```
   Key: VITE_API_URL
   Value: https://vibe-coding-shppingmall-demo.onrender.com/api
   Environment: Production, Preview, Development 모두 선택
   ```

**문제:** 환경 변수가 없거나 잘못 설정됨
**해결:** 올바른 값으로 설정 후 **재배포**

### 2. Render 서버 상태 확인

**브라우저에서 직접 접속:**
```
https://vibe-coding-shppingmall-demo.onrender.com/
```

**정상 응답:**
```json
{
  "message": "Shopping Mall API Server",
  "status": "running"
}
```

**문제:** 서버가 응답하지 않음
**해결:** Render 대시보드에서 서비스 상태 확인

### 3. Render 서버 헬스 체크

**브라우저에서 접속:**
```
https://vibe-coding-shppingmall-demo.onrender.com/api/health
```

**정상 응답:**
```json
{
  "success": true,
  "server": "running",
  "database": {
    "status": "connected",
    ...
  }
}
```

**문제:** MongoDB 연결 실패
**해결:** Render 환경 변수 `MONGODB_ATLAS_URL` 확인

### 4. CORS 문제 확인

**Render 대시보드에서:**
1. 서비스 선택
2. **Environment** 탭
3. `CLIENT_URL` 확인:
   ```
   CLIENT_URL = https://vibe-coding-shppingmall-demo.vercel.app
   ```

**문제:** CORS 에러
**해결:** `CLIENT_URL`에 Vercel 배포 URL 추가

### 5. 브라우저 콘솔 확인

**F12 → Console 탭:**
- `🔍 API Base URL:` 확인
- `❌ API 요청 실패:` 에러 상세 확인
- `❌ 서버 응답 없음:` URL 확인

**예상 로그:**
```
🔍 API Base URL: /api  ← 잘못됨! (환경 변수 미설정)
🔍 API Base URL: https://vibe-coding-shppingmall-demo.onrender.com/api  ← 정상
```

## 빠른 체크리스트

- [ ] Vercel `VITE_API_URL` 환경 변수 설정됨
- [ ] Vercel 재배포 완료
- [ ] Render 서버가 실행 중 (`/` 엔드포인트 응답)
- [ ] MongoDB 연결됨 (`/api/health` 확인)
- [ ] Render `CLIENT_URL` 환경 변수 설정됨
- [ ] 브라우저 콘솔에서 올바른 API URL 확인

