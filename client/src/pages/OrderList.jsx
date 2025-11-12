import { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HomeNavbar from './HomeNavbar.jsx';
import api from '../services/api';
import './OrderList.css';

function OrderList() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUserId = userId || currentUser?.id || currentUser?._id;

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
    if (!currentUserId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${currentUserId}`);
        if (response.data?.success) {
          setOrders(response.data.data || []);
        } else {
          setError('주문 목록을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('❌ 주문 목록 조회 오류:', err);
        if (err.response?.status === 401) {
          setError('로그인이 필요합니다.');
          navigate('/login');
        } else {
          setError('주문 목록을 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUserId, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: '대기 중',
      paid: '결제 완료',
      preparing: '준비 중',
      shipped: '배송 중',
      delivered: '배송 완료',
      cancelled: '취소됨',
    };
    return statusMap[status] || status || '-';
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending: 'status-pending',
      paid: 'status-paid',
      preparing: 'status-preparing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return classMap[status] || '';
  };

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      card: '카드 결제',
      credit_card: '신용카드',
      bank_transfer: '계좌 이체',
      kakao_pay: '카카오페이',
      naver_pay: '네이버페이',
      paypal: 'PayPal',
      cash: '현금',
    };
    return methodMap[method] || method || '-';
  };

  // 주문 상태별 필터링
  const filteredOrders =
    selectedStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const statusTabs = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기 중' },
    { value: 'paid', label: '결제 완료' },
    { value: 'preparing', label: '준비 중' },
    { value: 'shipped', label: '배송 중' },
    { value: 'delivered', label: '배송 완료' },
    { value: 'cancelled', label: '취소됨' },
  ];

  if (loading) {
    return (
      <div className="order-list-page">
        <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
        <main className="order-list-main">
          <div className="order-list-loading">주문 목록을 불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-list-page">
        <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
        <main className="order-list-main">
          <div className="order-list-error">
            <p>{error}</p>
            <button type="button" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="order-list-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="order-list-main">
        <header className="order-list-header">
          <h1>주문 내역</h1>
          <p>
            {selectedStatus === 'all'
              ? `총 ${orders.length}개의 주문`
              : `${getStatusLabel(selectedStatus)} ${filteredOrders.length}개`}
          </p>
        </header>

        <div className="order-status-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`order-status-tab ${selectedStatus === tab.value ? 'active' : ''}`}
              onClick={() => setSelectedStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="order-list-empty">
            <p>주문 내역이 없습니다.</p>
            <button type="button" onClick={() => navigate('/')}>
              쇼핑하러 가기
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="order-list-empty">
            <p>
              {selectedStatus === 'all'
                ? '주문 내역이 없습니다.'
                : `${getStatusLabel(selectedStatus)} 상태의 주문이 없습니다.`}
            </p>
            <button type="button" onClick={() => navigate('/')}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div className="order-list-container">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-card-info">
                    <h2>주문 번호: {order._id}</h2>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-summary">
                    <div className="order-summary-item">
                      <span>결제 금액</span>
                      <span className="order-total">
                        {order.totalAmount?.toLocaleString() || '0'}원
                      </span>
                    </div>
                    <div className="order-summary-item">
                      <span>결제 수단</span>
                      <span>{getPaymentMethodLabel(order.paymentInfo?.method)}</span>
                    </div>
                    {order.paymentInfo?.transactionId && (
                      <div className="order-summary-item">
                        <span>거래 번호</span>
                        <span className="order-transaction-id">
                          {order.paymentInfo.transactionId}
                        </span>
                      </div>
                    )}
                  </div>

                  {order.shippingInfo && (
                    <div className="order-shipping">
                      <h3>배송 정보</h3>
                      <p>
                        {order.shippingInfo.recipientName} | {order.shippingInfo.contact}
                      </p>
                      <p>
                        {order.shippingInfo.addressLine1}
                        {order.shippingInfo.addressLine2
                          ? ` ${order.shippingInfo.addressLine2}`
                          : ''}
                      </p>
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="order-items">
                      <h3>주문 상품 ({order.items.length}개)</h3>
                      <div className="order-items-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="order-item-image">
                              <img src={item.image || ''} alt={item.name || '상품'} />
                            </div>
                            <div className="order-item-info">
                              <h4>{item.name || '상품'}</h4>
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

                <div className="order-card-footer">
                  <button
                    type="button"
                    className="order-detail-btn"
                    onClick={() => navigate(`/orders/detail/${order._id}`)}
                  >
                    상세 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderList;

