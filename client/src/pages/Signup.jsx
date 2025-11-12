import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import HomeNavbar from './HomeNavbar.jsx';
import './Signup.css';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    user_type: 'customer',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  useEffect(() => {
    const handleAuthChanged = (event) => {
      setCurrentUser(event.detail?.user ?? null);
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    return () => window.removeEventListener('auth-changed', handleAuthChanged);
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수입니다.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호는 필수입니다.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (!formData.user_type) {
      newErrors.user_type = '사용자 타입은 필수입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('📤 회원가입 요청 전송:', { ...formData, password: '***' });
      const response = await api.post('/users', formData);
      console.log('✅ 회원가입 성공:', response.data);

      if (response.data.success) {
        setMessage('회원가입이 완료되었습니다!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ 회원가입 오류:', error);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const serverErrors = {};
          errorData.errors.forEach((err) => {
            if (err.includes('이메일')) {
              serverErrors.email = err;
            } else if (err.includes('이름')) {
              serverErrors.name = err;
            } else if (err.includes('비밀번호')) {
              serverErrors.password = err;
            } else if (err.includes('사용자 타입')) {
              serverErrors.user_type = err;
            }
          });
          setErrors(serverErrors);
        }

        if (errorData.message) {
          setMessage(errorData.message);
        }
      } else if (error.request) {
        setMessage('서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        setMessage('요청 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <div className="signup-page">
        <div className="signup-wrapper">
          <section className="signup-panel">
            <header className="signup-brand">
              <h1>ATELIER</h1>
              <p>Create your account</p>
            </header>

            {message && (
              <div className={`signup-alert ${message.includes('완료') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="signup-error">{errors.email}</span>}
              </div>

              <div className="signup-field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="홍길동"
                  autoComplete="name"
                />
                {errors.name && <span className="signup-error">{errors.name}</span>}
              </div>

              <div className="signup-field">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="최소 6자 이상"
                  autoComplete="new-password"
                />
                {errors.password && <span className="signup-error">{errors.password}</span>}
              </div>

              <div className="signup-field">
                <label htmlFor="user_type">User Type</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className={errors.user_type ? 'error' : ''}
                >
                  <option value="customer">고객 (Customer)</option>
                  <option value="admin">관리자 (Admin)</option>
                </select>
                {errors.user_type && <span className="signup-error">{errors.user_type}</span>}
              </div>

              <div className="signup-field">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="서울시 강남구 (선택사항)"
                  autoComplete="street-address"
                />
              </div>

              <button type="submit" className="signup-button" disabled={loading}>
                {loading ? 'Processing...' : 'Create Account'}
              </button>
            </form>

            <footer className="signup-footer">
              <span>이미 계정이 있으신가요?</span>
              <Link to="/login">Sign in</Link>
            </footer>
          </section>

          <aside className="signup-image">
            <div className="signup-image-content">
              <h2>Refine Your Style</h2>
              <p>Join the Atelier community and access curated looks crafted just for you.</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default Signup;

