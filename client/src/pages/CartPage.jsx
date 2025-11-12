import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from './HomeNavbar.jsx';
import { useCartState, useCartDispatch } from '../context/CartContext.jsx';
import api from '../services/api';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const cart = useCartState();
  const cartDispatch = useCartDispatch();
  const [loading, setLoading] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const userId = currentUser?.id || currentUser?._id;

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  // 장바구니 새로고침
  const refreshCart = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/carts/${userId}`);
      if (response.data?.success) {
        cartDispatch({
          type: 'SET_CART',
          payload: response.data.data,
        });
      }
    } catch (error) {
      console.error('❌ 장바구니 조회 오류:', error);
    }
  }, [userId, cartDispatch]);

  // 개별 항목 삭제
  const handleRemoveItem = useCallback(
    async (itemId) => {
      if (!userId || !itemId) return;

      setDeletingItemId(itemId);
      try {
        const response = await api.delete(`/carts/${userId}/items/${itemId}`);
        if (response.data?.success) {
          await refreshCart();
        }
      } catch (error) {
        console.error('❌ 장바구니 항목 삭제 오류:', error);
        alert('항목 삭제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setDeletingItemId(null);
      }
    },
    [userId, refreshCart]
  );

  // 전체 비우기
  const handleClearCart = useCallback(async () => {
    if (!userId) return;

    if (!confirm('장바구니의 모든 항목을 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete(`/carts/${userId}`);
      if (response.data?.success) {
        cartDispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('❌ 장바구니 비우기 오류:', error);
      alert('장바구니 비우기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [userId, cartDispatch]);

  // 페이지 마운트 시 장바구니 불러오기
  useEffect(() => {
    if (userId) {
      refreshCart();
    }
  }, [userId, refreshCart]);

  return (
    <div className="cart-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="cart-main">
        <header className="cart-header">
          <h1>My Bag</h1>
          <p>장바구니 ({cart.totalQuantity}개)</p>
        </header>

        {cart.totalQuantity === 0 ? (
          <div className="cart-empty">
            <p>장바구니가 비어 있습니다.</p>
            <button type="button" onClick={() => navigate('/')}>
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <section className="cart-content">
            <div className="cart-items">
              <div className="cart-items-header">
                <h2>장바구니 상품</h2>
                <button
                  type="button"
                  className="cart-clear-all"
                  onClick={handleClearCart}
                  disabled={loading}
                >
                  {loading ? '삭제 중...' : '전체 삭제'}
                </button>
              </div>
              {cart.items.map((item) => (
                <article key={item._id || item.product?._id} className="cart-item">
                  <div className="cart-item-thumb">
                    <img src={item.product?.image || item.image} alt={item.product?.name} />
                  </div>
                  <div className="cart-item-info">
                    <h2>{item.product?.name || '상품'}</h2>
                    <span>{item.product?.category}</span>
                    <div className="cart-item-meta">
                      <span>수량: {item.quantity}</span>
                      <span>
                        가격: {item.price ? `${Number(item.price).toLocaleString()}원` : '-'}
                      </span>
                      <span>
                        합계:{' '}
                        {item.price && item.quantity
                          ? `${(item.price * item.quantity).toLocaleString()}원`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => handleRemoveItem(item._id)}
                    disabled={deletingItemId === item._id}
                    aria-label="항목 삭제"
                  >
                    {deletingItemId === item._id ? '삭제 중...' : '✕'}
                  </button>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>주문 요약</h2>
              <div className="cart-summary-row">
                <span>총 수량</span>
                <span>{cart.totalQuantity}개</span>
              </div>
              <div className="cart-summary-row">
                <span>총 금액</span>
                <span>{cart.totalPrice.toLocaleString()}원</span>
              </div>
              <button
                type="button"
                className="cart-checkout"
                onClick={() => navigate('/checkout')}
              >
                결제하기
              </button>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default CartPage;


