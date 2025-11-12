require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

// 포트 설정 (환경 변수 또는 기본값 5002 사용)
const PORT = process.env.PORT || 5002;

// MongoDB 연결 시도 (연결 실패해도 서버는 계속 실행)
connectDB().catch((error) => {
  console.error('⚠️ MongoDB 연결 실패, 서버는 계속 실행됩니다.');
  console.error('   MongoDB를 시작하거나 연결 정보를 확인해주세요.');
  console.error(`   오류: ${error.message}`);
});

// 서버 시작 (포트 충돌 처리)
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error(`   다른 포트를 사용하거나 기존 프로세스를 종료해주세요.`);
    console.error(`   해결 방법:`);
    console.error(`   1. 다른 포트 사용: set PORT=5002 && npm run dev`);
    console.error(`   2. 기존 프로세스 종료: netstat -ano | findstr :${PORT}`);
    console.error(`   3. 프로세스 종료: node kill-port-5001.js`);
    process.exit(1);
  } else {
    console.error('❌ 서버 시작 오류:', err);
    process.exit(1);
  }
});

