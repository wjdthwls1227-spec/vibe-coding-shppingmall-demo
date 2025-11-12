import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../HomeNavbar.jsx';
import api from '../../services/api';
import './AdminOrderList.css';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function AdminOrderList() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!currentUser || currentUser.user_type !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleAuthChanged = (event) => {
      setCurrentUser(event.detail?.user ?? null);
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    return () => window.removeEventListener('auth-changed', handleAuthChanged);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page,
          limit,
        };
        if (selectedStatus !== 'all') {
          params.status = selectedStatus;
        }

        const response = await api.get('/orders', { params });
        if (response.data?.success) {
          setOrders(response.data.data || []);
          setTotal(response.data.total || 0);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setError(response.data?.message || '주문 목록을 불러오는데 실패했습니다.');
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

    if (currentUser?.user_type === 'admin') {
      fetchOrders();
    }
  }, [currentUser, selectedStatus, page, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

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

  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`주문 상태를 "${getStatusLabel(newStatus)}"로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const response = await api.patch(`/orders/detail/${orderId}/status`, {
        status: newStatus,
      });

      if (response.data?.success) {
        // 주문 목록 새로고침
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? response.data.data : order))
        );
        alert('주문 상태가 업데이트되었습니다.');
      }
    } catch (err) {
      console.error('❌ 주문 상태 업데이트 오류:', err);
      alert('주문 상태 업데이트에 실패했습니다.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('정말 이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await api.delete(`/orders/detail/${orderId}`);
      if (response.data?.success) {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        setTotal((prev) => prev - 1);
        alert('주문이 삭제되었습니다.');
      }
    } catch (err) {
      console.error('❌ 주문 삭제 오류:', err);
      alert('주문 삭제에 실패했습니다.');
    }
  };

  const statusTabs = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기 중' },
    { value: 'paid', label: '결제 완료' },
    { value: 'preparing', label: '준비 중' },
    { value: 'shipped', label: '배송 중' },
    { value: 'delivered', label: '배송 완료' },
    { value: 'cancelled', label: '취소됨' },
  ];

  const statusOptions = [
    { value: 'pending', label: '대기 중' },
    { value: 'paid', label: '결제 완료' },
    { value: 'preparing', label: '준비 중' },
    { value: 'shipped', label: '배송 중' },
    { value: 'delivered', label: '배송 완료' },
    { value: 'cancelled', label: '취소됨' },
  ];

  return (
    <div className="admin-order-list-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="admin-order-list-main">
        <header className="admin-order-list-header">
          <div>
            <h1>주문 관리</h1>
            <p>전체 주문 목록을 확인하고 관리하세요.</p>
          </div>
          <button
            type="button"
            className="admin-action-button"
            onClick={() => navigate('/admin')}
          >
            대시보드로 돌아가기
          </button>
        </header>

        <div className="admin-order-status-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`admin-order-status-tab ${
                selectedStatus === tab.value ? 'active' : ''
              }`}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-order-list-loading">주문 목록을 불러오는 중...</div>
        ) : error ? (
          <div className="admin-order-list-error">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              다시 시도
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-order-list-empty">
            <p>
              {selectedStatus === 'all'
                ? '주문 내역이 없습니다.'
                : `${getStatusLabel(selectedStatus)} 상태의 주문이 없습니다.`}
            </p>
          </div>
        ) : (
          <>
            <div className="admin-order-list-info">
              <span>
                총 {total}건의 주문 ({page}/{totalPages} 페이지)
              </span>
            </div>

            <div className="admin-order-table-container">
              <table className="admin-order-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>고객명</th>
                    <th>이메일</th>
                    <th>상태</th>
                    <th>결제금액</th>
                    <th>결제수단</th>
                    <th>주문일자</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id-cell">{order._id}</td>
                      <td>{order.user?.name || '-'}</td>
                      <td>{order.user?.email || '-'}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`admin-order-status-select ${getStatusClass(order.status)}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="order-amount-cell">
                        {order.totalAmount?.toLocaleString() || '0'}원
                      </td>
                      <td>{getPaymentMethodLabel(order.paymentInfo?.method)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="order-actions-cell">
                        <button
                          type="button"
                          className="admin-order-action-btn view"
                          onClick={() => navigate(`/orders/detail/${order._id}`)}
                        >
                          상세보기
                        </button>
                        <button
                          type="button"
                          className="admin-order-action-btn delete"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-order-pagination">
                <button
                  type="button"
                  className="admin-pagination-btn"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  이전
                </button>
                <span className="admin-pagination-info">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="admin-pagination-btn"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminOrderList;

