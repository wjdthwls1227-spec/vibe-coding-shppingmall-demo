import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import HomeNavbar from '../HomeNavbar.jsx';
import './Admin.css';
import './AdminProductList.css';

function AdminProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [limit] = useState(2);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products', {
        params: { page, limit },
      });
      if (response.data?.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setHasPrev(response.data.hasPrev || false);
        setHasNext(response.data.hasNext || false);
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
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm('정말로 이 상품을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.');
    if (!confirmed) return;

    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('상품 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const goPrev = () => {
    if (hasPrev) {
      setPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const goNext = () => {
    if (hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="admin-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />

      <main className="admin-main admin-main--list">
        <header className="admin-list-header">
          <div>
            <p className="admin-greeting">총 {products.length}개의 상품이 등록되어 있습니다.</p>
            <h1>상품 관리</h1>
            <p className="admin-description">상품 정보를 확인하고 필요한 경우 수정 또는 삭제할 수 있습니다.</p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-action-button admin-action-button--light"
              onClick={fetchProducts}
            >
              새로고침
            </button>
            <button
              type="button"
              className="admin-action-button"
              onClick={() => navigate('/admin/products/new')}
            >
              + 새 상품 등록
            </button>
            <button type="button" className="admin-link" onClick={() => navigate('/admin')}>
              ← 대시보드로 돌아가기
            </button>
          </div>
        </header>

        {loading ? (
          <div className="admin-list-placeholder">상품 목록을 불러오는 중입니다...</div>
        ) : error ? (
          <div className="admin-form-feedback error">{error}</div>
        ) : products.length === 0 ? (
          <div className="admin-list-empty">
            <p>아직 등록된 상품이 없습니다.</p>
            <button
              type="button"
              className="admin-action-button"
              onClick={() => navigate('/admin/products/new')}
            >
              첫 상품 등록하기
            </button>
          </div>
        ) : (
          <section className="admin-products-table-wrapper">
            <div className="admin-products-table-info">
              <span>
                페이지 {page} / {totalPages}
              </span>
              <div className="admin-pagination-controls">
                <button
                  type="button"
                  className="admin-pagination-button"
                  onClick={goPrev}
                  disabled={!hasPrev}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="admin-pagination-button"
                  onClick={goNext}
                  disabled={!hasNext}
                >
                  다음
                </button>
              </div>
            </div>
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>이미지</th>
                  <th>SKU</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>등록일</th>
                  <th>설명</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="admin-products-table-thumb" />
                      ) : (
                        <span className="admin-product-placeholder">이미지 없음</span>
                      )}
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{Number(product.price).toLocaleString()}원</td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td className="admin-products-table-description">
                      {product.description || '-'}
                    </td>
                    <td>
                      <div className="admin-product-actions">
                        <button
                          type="button"
                          className="admin-form-button admin-form-button--ghost"
                          onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="admin-form-button admin-form-button--danger"
                          onClick={() => handleDelete(product._id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminProductList;


