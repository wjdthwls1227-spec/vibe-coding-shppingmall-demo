import axios from 'axios';

// API 기본 설정
// VITE_API_URL 환경 변수가 있으면 사용, 없으면 개발/프로덕션에 따라 설정
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5002/api' : '/api');

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 처리
    if (error.response?.status === 401) {
      // 인증 오류 처리
      localStorage.removeItem('token');
      // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export default api;

