import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import HomeNavbar from './HomeNavbar.jsx';
import api from '../services/api';
import { useCartDispatch } from '../context/CartContext.jsx';

const categories = [
  {
    id: 'women',
    title: 'Women',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'men',
    title: 'Men',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
];

function Home({ user }) {
  const navigate = useNavigate();
  const cartDispatch = useCartDispatch();
  const [arrivals, setArrivals] = useState([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const [arrivalsError, setArrivalsError] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  const handleAddToCart = useCallback(
    async (product) => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('로그인 후 이용 가능합니다.');
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id || parsedUser._id;

      if (!userId) {
        alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }

      try {
        const response = await api.post(`/carts/${userId}/items`, {
          productId: product._id || product.id,
          quantity: 1,
        });

        if (response.data?.success && response.data.data) {
          cartDispatch({ type: 'SET_CART', payload: response.data.data });
        } else {
          alert(response.data?.message || '장바구니에 담지 못했습니다.');
        }
      } catch (error) {
        console.error('❌ 장바구니 추가 오류:', error);
        alert('장바구니에 담는 중 오류가 발생했습니다.');
      }
    },
    [cartDispatch, navigate]
  );

  useEffect(() => {
    const fetchArrivals = async () => {
      setArrivalsLoading(true);
      setArrivalsError('');
      try {
        const response = await api.get('/products', {
          params: { page: 1, limit: 8 },
        });
        if (response.data?.success) {
          setArrivals(response.data.data || []);
        } else {
          setArrivalsError(response.data?.message || '신상품 정보를 불러오지 못했습니다.');
        }
      } catch (error) {
        if (error.response?.data?.message) {
          setArrivalsError(error.response.data.message);
        } else if (error.request) {
          setArrivalsError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setArrivalsError('신상품 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setArrivalsLoading(false);
      }
    };

    fetchArrivals();
  }, []);

  return (
    <div className="home-page">
      <HomeNavbar user={user} onLogout={handleLogout} onAdmin={handleAdmin} />

      <main className="home-main">
        <HeroSection />
        <ArrivalsSection
          items={arrivals}
          loading={arrivalsLoading}
          error={arrivalsError}
          onAddToCart={handleAddToCart}
        />
        <CategorySection categories={categories} />
        <NewsletterSection />
      </main>

      <FooterSection />
    </div>
  );
}

export default Home;

const HeroSection = memo(function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-subtitle">Spring Collection 2025</p>
          <h1>Discover timeless elegance with our new seasonal pieces.</h1>
          <p className="hero-description">
            Experience curated looks crafted with refined silhouettes, luxurious textures, and
            effortless sophistication for every occasion.
          </p>
          <div className="hero-actions">
            <button type="button" className="hero-cta">
              Shop Now
            </button>
            <button type="button" className="hero-secondary">
              View Lookbook
            </button>
          </div>
        </div>
        <div className="hero-image" />
      </div>
    </section>
  );
});

const CategorySection = memo(function CategorySection({ categories }) {
  return (
    <section className="category-section">
      <div className="section-header">
        <h2>Shop by Category</h2>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <article key={category.id} className="category-card">
            <img src={category.image} alt={category.title} />
            <div className="category-overlay">
              <span>{category.title}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});

const ArrivalsSection = memo(function ArrivalsSection({ items, loading, error, onAddToCart }) {
  const navigate = useNavigate();
  const hasItems = items && items.length > 0;
  return (
    <section className="arrivals-section">
      <div className="section-header">
        <h2>New Arrivals</h2>
        <button type="button" className="section-link" onClick={() => navigate('/admin/products')}>
          View All
        </button>
      </div>
      {loading ? (
        <div className="home-list-placeholder">신상품을 불러오는 중입니다...</div>
      ) : error ? (
        <div className="home-list-error">{error}</div>
      ) : hasItems ? (
        <div className="arrivals-grid">
          {items.map((item) => (
            <ArrivalCard
              key={item._id || item.id}
              item={item}
              onSelect={() => navigate(`/products/${item._id || item.id}`)}
              onAddToCart={() => onAddToCart(item)}
            />
          ))}
        </div>
      ) : (
        <div className="home-list-empty">등록된 신상품이 없습니다.</div>
      )}
    </section>
  );
});

const ArrivalCard = memo(function ArrivalCard({ item, onSelect, onAddToCart }) {
  return (
    <article className="arrival-card" role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}>
      <div className="arrival-image">
        <img src={item.image} alt={item.name} />
        <button
          type="button"
          className="arrival-favorite"
          aria-label="즐겨찾기"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          ♡
        </button>
      </div>
      <div className="arrival-info">
        <span className="arrival-category">{item.category}</span>
        <h3>{item.name}</h3>
        <span className="arrival-price">
          {item.price !== undefined ? `${Number(item.price).toLocaleString()}원` : '-'}
        </span>
      </div>
    </article>
  );
});

const NewsletterSection = memo(function NewsletterSection() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <h2>Join Our Newsletter</h2>
        <p>Subscribe to receive updates on new arrivals, special offers, and exclusive content.</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email" aria-label="이메일 입력" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
});

const FooterSection = memo(function FooterSection() {
  return (
    <footer className="home-footer">
      <div className="footer-columns">
        <div>
          <h4>Shop</h4>
          <ul>
            <li>
              <button type="button">Women</button>
            </li>
            <li>
              <button type="button">Men</button>
            </li>
            <li>
              <button type="button">Kids</button>
            </li>
            <li>
              <button type="button">Accessories</button>
            </li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li>
              <button type="button">Customer Service</button>
            </li>
            <li>
              <button type="button">Shipping & Returns</button>
            </li>
            <li>
              <button type="button">Size Guide</button>
            </li>
            <li>
              <button type="button">Contact Us</button>
            </li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li>
              <button type="button">About Us</button>
            </li>
            <li>
              <button type="button">Careers</button>
            </li>
            <li>
              <button type="button">Sustainability</button>
            </li>
            <li>
              <button type="button">Press</button>
            </li>
          </ul>
        </div>
        <div>
          <h4>Follow Us</h4>
          <ul>
            <li>
              <button type="button">Instagram</button>
            </li>
            <li>
              <button type="button">Facebook</button>
            </li>
            <li>
              <button type="button">Twitter</button>
            </li>
            <li>
              <button type="button">Pinterest</button>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 ATELIER. All rights reserved.</span>
        <div className="footer-links">
          <button type="button">Privacy Policy</button>
          <button type="button">Terms of Service</button>
        </div>
      </div>
    </footer>
  );
});
