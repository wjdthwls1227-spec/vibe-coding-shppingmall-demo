# DB와 백엔드 연결 확인 가이드

## 1. 브라우저 개발자 도구에서 확인

### 단계:
1. Vercel 배포된 사이트를 브라우저에서 열기
2. `F12` 또는 `우클릭 → 검사`로 개발자 도구 열기
3. **Console** 탭 확인:
   - 에러 메시지가 있는지 확인
   - API 호출 실패 메시지 확인

4. **Network** 탭 확인:
   - 페이지 로드 후 네트워크 요청 확인
   - API 요청이 성공(200)인지 실패(404, 500 등)인지 확인
   - 요청 URL이 올바른지 확인

## 2. API 엔드포인트 직접 테스트

### Render 서버 헬스 체크:
브라우저 주소창에 직접 입력:
```
https://your-render-service.onrender.com/api/health
```

**정상 응답 예시:**
```json
{
  "success": true,
  "server": "running",
  "database": {
    "status": "connected",
    "database": "your-database-name",
    "host": "cluster0.xxxxx.mongodb.net",
    "port": 27017
  },
  "timestamp": "2025-01-12T..."
}
```

**DB 연결 실패 시:**
```json
{
  "success": false,
  "server": "running",
  "database": {
    "status": "disconnected"
  }
}
```

### Render 서버 기본 확인:
```
https://your-render-service.onrender.com/
```

**정상 응답:**
```json
{
  "message": "Shopping Mall API Server",
  "status": "running"
}
```

## 3. 실제 기능 테스트

### 상품 목록 조회:
```
https://your-render-service.onrender.com/api/products
```

### 로그인 테스트:
1. Vercel 사이트에서 로그인 페이지 접속
2. 테스트 계정으로 로그인 시도
3. 개발자 도구 Network 탭에서 `/api/auth/login` 요청 확인

## 4. Vercel 환경 변수 확인

Vercel 대시보드에서:
1. 프로젝트 → Settings → Environment Variables
2. `VITE_API_URL`이 올바른 Render 서버 URL로 설정되어 있는지 확인
   - 예: `https://your-service.onrender.com/api`

## 5. Render 로그 확인

Render 대시보드에서:
1. 서비스 선택 → **Logs** 탭
2. MongoDB 연결 관련 로그 확인:
   - ✅ `MongoDB 연결 성공`
   - ❌ `MongoDB 연결 실패` 또는 에러 메시지

## 문제 해결 체크리스트

- [ ] Render 서버가 실행 중인가? (`/` 엔드포인트 확인)
- [ ] MongoDB 연결이 되어 있는가? (`/api/health` 엔드포인트 확인)
- [ ] Vercel의 `VITE_API_URL`이 올바른가?
- [ ] Render의 `MONGODB_ATLAS_URL`이 올바른가?
- [ ] CORS 설정이 올바른가? (Render의 `CLIENT_URL` 확인)

