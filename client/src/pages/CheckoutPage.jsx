import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from './HomeNavbar.jsx';
import { useCartDispatch, useCartState } from '../context/CartContext.jsx';
import api from '../services/api';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartState();
  const cartDispatch = useCartDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [impReady, setImpReady] = useState(false);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const [shippingInfo, setShippingInfo] = useState({
    recipientName: currentUser?.name || '',
    contact: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '대한민국',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  useEffect(() => {
    if (impReady) return undefined;

    const initImp = () => {
      if (window.IMP) {
        window.IMP.init('imp36600040');
        setImpReady(true);
        return true;
      }
      return false;
    };

    if (initImp()) return undefined;

    const intervalId = window.setInterval(() => {
      if (initImp()) {
        window.clearInterval(intervalId);
      }
    }, 300);

    return () => window.clearInterval(intervalId);
  }, [impReady]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
      return;
    }

    if (cart.totalQuantity === 0) {
      alert('장바구니가 비어 있습니다.');
      navigate('/cart');
      return;
    }

    if (!impReady || !window.IMP) {
      alert('결제 모듈이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setSubmitting(true);
    setFeedback('');

    try {
      const payMethodMap = {
        card: 'card',
        credit_card: 'card',
        bank_transfer: 'trans',
        kakao_pay: 'kakaopay',
      };

      const paymentRequest = await new Promise((resolve, reject) => {
        const IMP = window.IMP;
        const merchantUid = `order_${Date.now()}`;
 
        IMP.request_pay(
           {
            pg: 'html5_inicis.INIpayTest',
            pay_method: payMethodMap[paymentMethod] || 'card',
            merchant_uid: merchantUid,
            name: '주문명:결제테스트',
            amount: cart.totalPrice || 0,
            buyer_email: currentUser?.email || 'iamport@siot.do',
            buyer_name: shippingInfo.recipientName || '구매자이름',
            buyer_tel: shippingInfo.contact || '010-1234-5678',
            buyer_addr:
              `${shippingInfo.addressLine1} ${shippingInfo.addressLine2}`.trim() ||
              '서울특별시 강남구 삼성동',
            buyer_postcode: shippingInfo.postalCode || '123-456',
            m_redirect_url: window.location.origin + '/payments/complete/mobile',
          },
          (rsp) => {
            if (rsp.success) {
              resolve(rsp);
            } else {
              reject(new Error(rsp.error_msg || '결제가 취소되었습니다.'));
            }
          }
        );
      });

      const payload = {
        items: cart.items.map((item) => ({
          product: item.product?._id || item.product,
          name: item.product?.name || item.name || '상품',
          image: item.product?.image || item.image || '',
          price: item.price,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || {},
        })),
        shippingInfo,
        paymentInfo: {
          method: paymentMethod,
          status: 'paid',
          transactionId: paymentRequest.imp_uid,
          paidAt: paymentRequest.paid_at ? new Date(paymentRequest.paid_at * 1000) : new Date(),
        },
        subtotal: cart.totalPrice,
        shippingFee: 0,
        discount: 0,
        totalAmount: cart.totalPrice,
      };

      const userId = currentUser?.id || currentUser?._id;
      const response = await api.post(`/orders/${userId}`, payload);

      if (response.data?.success) {
        cartDispatch({ type: 'SET_CART', payload: { items: [], totalQuantity: 0, totalPrice: 0 } });
        // 주문 성공 페이지로 이동 (주문 정보 전달)
        navigate('/order/success', {
          state: {
            order: response.data.data,
          },
        });
      } else {
        setFeedback(response.data?.message || '주문 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 주문 오류:', error);
      if (error.response?.data?.message) {
        setFeedback(error.response.data.message);
      } else if (error.request) {
        setFeedback('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.message) {
        setFeedback(error.message);
      } else {
        setFeedback('주문 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="checkout-main">
        <button type="button" className="checkout-back" onClick={() => navigate('/cart')}>
          ← 장바구니로 돌아가기
        </button>

        <header className="checkout-header">
          <div>
            <h1>Checkout</h1>
            <p>주문 정보를 입력하고 결제를 완료해 주세요.</p>
          </div>
          <span>총 {cart.totalQuantity}개 상품</span>
        </header>

        <section className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>배송 정보</h2>
            <div className="checkout-grid">
              <label>
                받는 분 이름 *
                <input
                  type="text"
                  name="recipientName"
                  value={shippingInfo.recipientName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                연락처 *
                <input
                  type="text"
                  name="contact"
                  value={shippingInfo.contact}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  required
                />
              </label>
              <label className="checkout-grid-full">
                주소 *
                <input
                  type="text"
                  name="addressLine1"
                  value={shippingInfo.addressLine1}
                  onChange={handleChange}
                  placeholder="도로명 주소"
                  required
                />
              </label>
              <label className="checkout-grid-full">
                상세 주소
                <input
                  type="text"
                  name="addressLine2"
                  value={shippingInfo.addressLine2}
                  onChange={handleChange}
                  placeholder="동/호수 등"
                />
              </label>
              <label>
                도시 *
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                우편번호 *
                <input
                  type="text"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                국가 *
                <input
                  type="text"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                주/도 (선택)
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="checkout-payment">
              <h3>결제 수단</h3>
              <div className="checkout-payment-options">
                {[
                  { value: 'card', label: '카드 결제' },
                  { value: 'credit_card', label: '신용카드' },
                  { value: 'bank_transfer', label: '계좌 이체' },
                  { value: 'kakao_pay', label: '카카오페이' },
                ].map((option) => (
                  <label key={option.value} className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {feedback && <div className="checkout-feedback">{feedback}</div>}

            <button type="submit" className="checkout-submit" disabled={submitting}>
              {submitting ? '결제 처리 중...' : '결제 완료하기'}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>주문 요약</h2>
            <div className="checkout-summary-section">
              <h3>결제 정보</h3>
              <p>
                결제수단:{' '}
                {
                  {
                    card: '카드 결제',
                    credit_card: '신용카드',
                    bank_transfer: '계좌 이체',
                    kakao_pay: '카카오페이',
                  }[paymentMethod]
                }
              </p>
              <p>결제상태: 결제 대기</p>
            </div>
            <div className="checkout-summary-list">
              {cart.items.map((item) => (
                <div key={item._id || item.product?._id} className="checkout-summary-item">
                  <div className="checkout-summary-thumb">
                    <img src={item.product?.image || item.image} alt={item.product?.name} />
                  </div>
                  <div>
                    <h3>{item.product?.name || '상품'}</h3>
                    <span>수량: {item.quantity}개</span>
                    <span>
                      {(item.price * item.quantity).toLocaleString()}
                      원
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-summary-row">
              <span>상품 금액</span>
              <span>{cart.totalPrice.toLocaleString()}원</span>
            </div>
            <div className="checkout-summary-row">
              <span>배송비</span>
              <span>0원</span>
            </div>
            <div className="checkout-summary-total">
              <span>총 결제 금액</span>
              <span>{cart.totalPrice.toLocaleString()}원</span>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default CheckoutPage;


