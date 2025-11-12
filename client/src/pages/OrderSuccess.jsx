import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeNavbar from './HomeNavbar.jsx';
import './OrderSuccess.css';

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.order;

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  return (
    <div className="order-success-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="order-success-main">
        <div className="order-success-container">
          <div className="order-success-icon">✓</div>
          <h1>주문이 완료되었습니다!</h1>
          <p className="order-success-message">
            주문해주셔서 감사합니다. 주문이 정상적으로 처리되었습니다.
          </p>

          {orderData && (
            <div className="order-success-info">
              <div className="order-info-section">
                <h2>주문 정보</h2>
                <div className="order-info-row">
                  <span>주문 번호</span>
                  <span>{orderData._id || orderData.orderId || '-'}</span>
                </div>
                <div className="order-info-row">
                  <span>결제 금액</span>
                  <span className="order-total-amount">
                    {orderData.totalAmount?.toLocaleString() || '0'}원
                  </span>
                </div>
                <div className="order-info-row">
                  <span>결제 수단</span>
                  <span>
                    {
                      {
                        card: '카드 결제',
                        credit_card: '신용카드',
                        bank_transfer: '계좌 이체',
                        kakao_pay: '카카오페이',
                      }[orderData.paymentInfo?.method] || orderData.paymentInfo?.method || '-'
                    }
                  </span>
                </div>
                <div className="order-info-row">
                  <span>주문 상태</span>
                  <span className="order-status">
                    {
                      {
                        pending: '대기 중',
                        paid: '결제 완료',
                        preparing: '준비 중',
                        shipped: '배송 중',
                        delivered: '배송 완료',
                        cancelled: '취소됨',
                      }[orderData.status] || orderData.status || '-'
                    }
                  </span>
                </div>
              </div>

              {orderData.shippingInfo && (
                <div className="order-info-section">
                  <h2>배송 정보</h2>
                  <div className="order-info-row">
                    <span>받는 분</span>
                    <span>{orderData.shippingInfo.recipientName || '-'}</span>
                  </div>
                  <div className="order-info-row">
                    <span>연락처</span>
                    <span>{orderData.shippingInfo.contact || '-'}</span>
                  </div>
                  <div className="order-info-row">
                    <span>주소</span>
                    <span>
                      {orderData.shippingInfo.addressLine1 || ''}
                      {orderData.shippingInfo.addressLine2
                        ? ` ${orderData.shippingInfo.addressLine2}`
                        : ''}
                    </span>
                  </div>
                </div>
              )}

              {orderData.items && orderData.items.length > 0 && (
                <div className="order-info-section">
                  <h2>주문 상품</h2>
                  <div className="order-items-list">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="order-item-image">
                          <img src={item.image || ''} alt={item.name || '상품'} />
                        </div>
                        <div className="order-item-details">
                          <h3>{item.name || '상품'}</h3>
                          <span>수량: {item.quantity || 0}개</span>
                          <span>
                            가격: {item.price ? `${item.price.toLocaleString()}원` : '-'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="order-success-actions">
            <button
              type="button"
              className="order-success-btn primary"
              onClick={() => navigate('/')}
            >
              쇼핑 계속하기
            </button>
            {currentUser && (
              <button
                type="button"
                className="order-success-btn secondary"
                onClick={() => navigate('/orders')}
              >
                주문 내역 보기
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccess;

