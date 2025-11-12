import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import api from './services/api';
import { CartProvider } from './context/CartContext.jsx';

function Root() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingUser(false);
      return;
    }

    const controller = new AbortController();

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me', { signal: controller.signal });
        if (response.data?.success) {
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } else {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('❌ 사용자 정보 조회 실패:', error);
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingUser(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const handleAuthChanged = (event) => {
      const nextUser = event.detail?.user ?? null;
      if (nextUser) {
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    return () => window.removeEventListener('auth-changed', handleAuthChanged);
  }, []);

  return (
    <React.StrictMode>
      <CartProvider>
        <App user={user} />
      </CartProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
