import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import HomeNavbar from './HomeNavbar.jsx';
import { useCartDispatch } from '../context/CartContext.jsx';
import '../App.css';

function ProductList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const cartDispatch = useCartDispatch();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (category) {
        params.category = category;
      }
      const response = await api.get('/products', { params });
      if (response.data?.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.data?.message || '상품 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, category]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
          alert('장바구니에 추가되었습니다.');
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

  const categoryTitle = useMemo(() => {
    if (category === '상의') return 'Women';
    if (category === '하의') return 'Men';
    if (category === '악세사리') return 'Accessories';
    return 'All Products';
  }, [category]);

  return (
    <div className="home-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="home-main" style={{ paddingTop: '48px' }}>
        <div className="category-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
          <div className="section-header">
            <h2>{categoryTitle}</h2>
          </div>
          {loading ? (
            <div className="home-list-placeholder">상품을 불러오는 중입니다...</div>
          ) : error ? (
            <div className="home-list-error">{error}</div>
          ) : products.length > 0 ? (
            <>
              <div className="arrivals-grid">
                {products.map((item) => (
                  <article
                    key={item._id || item.id}
                    className="arrival-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/products/${item._id || item.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${item._id || item.id}`)}
                  >
                    <div className="arrival-image">
                      <img src={item.image} alt={item.name} />
                      <button
                        type="button"
                        className="arrival-favorite"
                        aria-label="장바구니에 추가"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
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
                ))}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '48px' }}>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '8px 16px', border: '1px solid #ddd', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    이전
                  </button>
                  <span style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '8px 16px', border: '1px solid #ddd', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="home-list-empty">등록된 상품이 없습니다.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProductList;

