const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
// CORS 설정: 개발 환경에서는 모든 origin 허용, 프로덕션에서는 특정 origin만 허용
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
      ? process.env.CLIENT_URL.split(',').map(url => url.trim())
      : true // CLIENT_URL이 없으면 모든 origin 허용 (임시)
    : true, // 개발 환경에서는 모든 origin 허용
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shopping Mall API Server',
    status: 'running'
  });
});

// 헬스체크 라우트 (MongoDB 연결 상태 포함)
try {
  const healthController = require('./controllers/healthController');
  app.get('/api/health', healthController.checkHealth);
} catch (error) {
  console.error('⚠️ healthController 로드 실패:', error.message);
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      note: 'healthController를 사용할 수 없습니다.'
    });
  });
}

// API 라우트
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);

module.exports = app;

