import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../HomeNavbar.jsx';
import api from '../../services/api';
import './Admin.css';

const statsCards = [
  { id: 'sales', label: '오늘 매출', value: '₩1,280,000', change: '+12.5%' },
  { id: 'orders', label: '주문 수', value: '86건', change: '+5.2%' },
  { id: 'customers', label: '신규 회원', value: '24명', change: '+8.1%' },
  { id: 'refunds', label: '환불 요청', value: '3건', change: '-1.3%' },
];

const mockOrders = [
  { id: 'ORD-1048', customer: '김서현', status: '배송중', total: '₩189,000', date: '2025-11-09' },
  { id: 'ORD-1047', customer: '정채연', status: '결제완료', total: '₩259,000', date: '2025-11-09' },
  { id: 'ORD-1046', customer: '이도윤', status: '배송완료', total: '₩319,000', date: '2025-11-09' },
  { id: 'ORD-1045', customer: '박지현', status: '배송대기', total: '₩142,000', date: '2025-11-08' },
];

const mockNotices = [
  { id: 1, title: '11월 배송 안내', date: '2025-11-08', author: '운영팀' },
  { id: 2, title: '블랙프라이데이 프로모션 준비', date: '2025-11-06', author: '마케팅팀' },
  { id: 3, title: 'CS 응대 매뉴얼 업데이트', date: '2025-11-03', author: '고객센터' },
];

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState('');
  const [productLoading, setProductLoading] = useState(true);

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
    const fetchProducts = async () => {
      setProductLoading(true);
      setProductError('');
      try {
        const response = await api.get('/products', {
          params: { page: 1, limit: 4 },
        });
        if (response.data?.success) {
          setProducts(response.data.data.slice(0, 4));
        } else {
          setProductError(response.data?.message || '상품 정보를 불러오지 못했습니다.');
        }
      } catch (error) {
        if (error.response?.data?.message) {
          setProductError(error.response.data.message);
        } else if (error.request) {
          setProductError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setProductError('상품 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
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

  const greeting = useMemo(() => {
    if (!currentUser) return '';
    if (currentUser.name) return `${currentUser.name} 관리자님, 환영합니다 👋`;
    return '관리자님, 환영합니다 👋';
  }, [currentUser]);

  return (
    <div className="admin-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-greeting">{greeting}</p>
            <h1>대시보드 개요</h1>
            <p className="admin-description">
              오늘의 매출 현황과 주문 상황을 확인하고, 필요한 조치를 빠르게 수행하세요.
            </p>
          </div>
          <div className="admin-header-actions">
            <button type="button" className="admin-action-button admin-action-button--light">
              + 새 공지 작성
            </button>
            <button
              type="button"
              className="admin-action-button admin-action-button--light"
              onClick={() => navigate('/admin/orders')}
            >
              주문 관리
            </button>
            <button
              type="button"
              className="admin-action-button admin-action-button--light"
              onClick={() => navigate('/admin/products')}
            >
              상품 관리
            </button>
            <button
              type="button"
              className="admin-action-button"
              onClick={() => navigate('/admin/products/new')}
            >
              + 새 상품 등록
            </button>
          </div>
        </header>

        <section className="admin-stats-grid">
          {statsCards.map((card) => (
            <article key={card.id} className="admin-stat-card">
              <span className="admin-stat-label">{card.label}</span>
              <strong className="admin-stat-value">{card.value}</strong>
              <span
                className={`admin-stat-change ${
                  card.change.startsWith('-') ? 'negative' : 'positive'
                }`}
              >
                {card.change} 전일 대비
              </span>
            </article>
          ))}
        </section>

        <section className="admin-content-grid">
          <article className="admin-panel">
            <header className="admin-panel-header">
              <h2>최근 주문 현황</h2>
              <button
                type="button"
                className="admin-link"
                onClick={() => navigate('/admin/orders')}
              >
                전체 주문 보기
              </button>
            </header>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객명</th>
                  <th>상태</th>
                  <th>결제금액</th>
                  <th>주문일자</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>
                      <span className={`admin-status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.total}</td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="admin-panel admin-panel--right">
            <header className="admin-panel-header">
              <h2>공지 사항</h2>
              <button type="button" className="admin-link">
                더보기
              </button>
            </header>
            <ul className="admin-notice-list">
              {mockNotices.map((notice) => (
                <li key={notice.id}>
                  <div className="admin-notice-title">{notice.title}</div>
                  <div className="admin-notice-meta">
                    <span>{notice.author}</span>
                    <span>{notice.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="admin-products-preview">
          <header className="admin-panel-header">
            <h2>상품 요약</h2>
            <button
              type="button"
              className="admin-link"
              onClick={() => navigate('/admin/products')}
            >
              상품 관리 바로가기
            </button>
          </header>

          {productLoading ? (
            <div className="admin-list-placeholder">상품 정보를 불러오는 중입니다...</div>
          ) : productError ? (
            <div className="admin-form-feedback error">{productError}</div>
          ) : products.length === 0 ? (
            <div className="admin-list-empty">
              <p>등록된 상품이 없습니다. 첫 상품을 등록해보세요.</p>
              <button
                type="button"
                className="admin-action-button"
                onClick={() => navigate('/admin/products/new')}
              >
                + 새 상품 등록
              </button>
            </div>
          ) : (
            <div className="admin-products-preview-grid">
              {products.map((product) => (
                <article key={product._id} className="admin-products-preview-card">
                  <div className="admin-products-preview-thumb">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span className="admin-product-placeholder">이미지 없음</span>
                    )}
                  </div>
                  <div className="admin-products-preview-body">
                    <span className="admin-product-sku">{product.sku}</span>
                    <h3>{product.name}</h3>
                    <span className="admin-product-category">{product.category}</span>
                    <span className="admin-product-price">
                      {Number(product.price).toLocaleString()}원
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;


