import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import HomeNavbar from './HomeNavbar.jsx';
import './Login.css';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email) {
          setCurrentUser(parsedUser);
          navigate('/', { replace: true });
        }
      } catch {
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handleAuthChanged = (event) => {
      setCurrentUser(event.detail?.user ?? null);
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    return () => window.removeEventListener('auth-changed', handleAuthChanged);
  }, []);

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (feedback) {
      setFeedback(null);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = '이메일을 입력해주세요.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      nextErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      if (response.data?.success) {
        const { token, data } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setCurrentUser(data);
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: data } }));
        setFeedback({ type: 'success', message: '로그인에 성공했습니다.' });
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: response.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.',
        });
      }
    } catch (error) {
      console.error('❌ 로그인 오류 상세:', error);
      
      if (error.response?.status === 401) {
        setFeedback({
          type: 'error',
          message: error.response.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
      } else if (error.response?.status === 400) {
        setFeedback({
          type: 'error',
          message: error.response.data?.message || '입력 값을 다시 확인해주세요.',
        });
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못함 (네트워크 오류, CORS, 서버 다운 등)
        console.error('❌ 서버 응답 없음:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: error.config?.baseURL + error.config?.url,
        });
        setFeedback({
          type: 'error',
          message: `서버에 연결할 수 없습니다. (${error.config?.baseURL || 'URL 확인 불가'}) 서버가 실행 중인지 확인해주세요.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: `로그인 처리 중 오류가 발생했습니다: ${error.message}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <div className="login-page">
        <div className="login-wrapper">
          <section className="login-panel">
            <header className="login-brand">
              <h1>ATELIER</h1>
              <p>Sign in to your account</p>
            </header>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="login-error">{errors.email}</span>}
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="login-error">{errors.password}</span>}
              </div>

              <div className="login-actions">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              {feedback && (
                <div className={`login-message ${feedback.type === 'success' ? 'success' : 'error'}`}>
                  {feedback.message}
                </div>
              )}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <footer className="login-footer">
              <span>Don&apos;t have an account?</span>
              <Link to="/signup">Sign up</Link>
            </footer>
          </section>

          <aside className="login-image">
            <div className="login-image-content">
              <h2>Discover Timeless Elegance</h2>
              <p>Experience luxury fashion curated for the modern lifestyle.</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default Login;


