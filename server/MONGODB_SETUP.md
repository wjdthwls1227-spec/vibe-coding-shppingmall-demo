# MongoDB 연결 설정 가이드

## 방법 1: MongoDB Atlas 사용 (권장 - 가장 간단)

### 1단계: MongoDB Atlas 계정 생성
1. https://www.mongodb.com/cloud/atlas 접속
2. "Try Free" 버튼 클릭하여 무료 계정 생성
3. 이메일로 가입

### 2단계: 클러스터 생성
1. "Build a Database" 클릭
2. "FREE" 플랜 선택 (M0 - 무료)
3. 클라우드 제공자 선택 (AWS 권장)
4. 리전 선택 (가장 가까운 지역, 예: Seoul)
5. 클러스터 이름 설정 (예: "shoping-mall-cluster")
6. "Create" 클릭

### 3단계: 데이터베이스 사용자 생성
1. "Database Access" 메뉴 클릭
2. "Add New Database User" 클릭
3. Authentication Method: "Password" 선택
4. Username과 Password 설정 (기억해두세요!)
5. Database User Privileges: "Atlas admin" 선택
6. "Add User" 클릭

### 4단계: 네트워크 액세스 설정
1. "Network Access" 메뉴 클릭
2. "Add IP Address" 클릭
3. "Allow Access from Anywhere" 선택 (개발용)
   - 또는 "Add Current IP Address" 선택
4. "Confirm" 클릭

### 5단계: 연결 문자열 가져오기
1. "Database" 메뉴로 돌아가기
2. "Connect" 버튼 클릭
3. "Connect your application" 선택
4. Driver: "Node.js", Version: "5.5 or later" 선택
5. 연결 문자열 복사 (예: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 6단계: .env 파일 설정
`server` 폴더에 `.env` 파일을 생성하고:

```env
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shoping-mall?retryWrites=true&w=majority
```

**중요**: `username`과 `password`를 실제 값으로 변경하고, `cluster.mongodb.net`을 실제 클러스터 주소로 변경하세요.

---

## 방법 2: Docker로 로컬 MongoDB 실행

Docker가 설치되어 있다면:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

이제 `mongodb://localhost:27017/shoping-mall`로 연결됩니다.

---

## 방법 3: 로컬 MongoDB 설치

### Windows
1. https://www.mongodb.com/try/download/community 에서 다운로드
2. 설치 후 MongoDB 서비스 시작
3. 기본 포트 27017에서 실행됨

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

---

## 연결 테스트

설정이 완료되면:

```bash
cd server
node check-db.js
```

또는 서버 실행:

```bash
npm run dev
```

성공 메시지:
```
✅ MongoDB 연결 성공: localhost (또는 클러스터 주소)
   데이터베이스: shoping-mall
```










