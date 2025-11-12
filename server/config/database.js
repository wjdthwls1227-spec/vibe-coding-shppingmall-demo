const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGODB_ATLAS_URL을 우선 사용, 없으면 로컬 주소 사용
    const MONGODB_URI = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/shoping-mall';
    
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
    console.log(`   데이터베이스: ${conn.connection.name}`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB 연결이 끊어졌습니다.');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB 연결 실패: ${error.message}`);
    console.error('   MongoDB가 실행 중인지 확인해주세요.');
    throw error; // 에러를 다시 throw하여 호출자가 처리할 수 있도록
  }
};

module.exports = connectDB;

