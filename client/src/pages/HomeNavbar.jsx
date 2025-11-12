import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartState } from '../context/CartContext.jsx';

const HomeNavbar = memo(function HomeNavbar({ user, onLogout, onAdmin }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalQuantity } = useCartState();

  useEffect(() => {
    setMenuOpen(false);
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return '';
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return '사용자';
  }, [user]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleLogoutClick = useCallback(() => {
    setMenuOpen(false);
    onLogout();
  }, [onLogout]);

  const handleOrderListClick = useCallback(() => {
    setMenuOpen(false);
    navigate('/orders');
  }, [navigate]);

  return (
    <nav className="home-navbar">
      <Link to="/" className="nav-brand nav-brand--link">ATELIER</Link>
      <ul className="nav-menu">
        <li>
          <button type="button" onClick={() => navigate('/products?category=상의')}>Women</button>
        </li>
        <li>
          <button type="button" onClick={() => navigate('/products?category=하의')}>Men</button>
        </li>
        <li>
          <button type="button" onClick={() => navigate('/products?category=악세사리')}>Accessories</button>
        </li>
        <li>
          <button type="button" onClick={() => navigate('/')}>New Arrivals</button>
        </li>
        <li>
          <button type="button" onClick={() => navigate('/products')}>All Products</button>
        </li>
      </ul>
      <div className="nav-actions">
        {user?.user_type === 'admin' && (
          <button type="button" className="nav-action-link" onClick={onAdmin}>
            어드민
          </button>
        )}
        <Link to="/cart" className="nav-cart-btn">
          <span className="nav-cart-icon" role="img" aria-label="장바구니">
            🛒
          </span>
          <span className="nav-cart-count">{totalQuantity}</span>
        </Link>
        {user ? (
          <div className="nav-user">
            <button type="button" className="nav-user-trigger" onClick={toggleMenu}>
              <span className="nav-user-greeting">{displayName}님 환영합니다</span>
              <span className={`chevron ${menuOpen ? 'open' : ''}`} />
            </button>
            {menuOpen && (
              <div className="nav-user-dropdown">
                <button type="button" onClick={handleOrderListClick}>
                  내 주문 목록
                </button>
                <button type="button" onClick={handleLogoutClick}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-login-btn">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
});

export default HomeNavbar;


