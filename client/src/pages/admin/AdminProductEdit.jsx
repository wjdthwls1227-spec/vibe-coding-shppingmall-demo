import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import HomeNavbar from '../HomeNavbar.jsx';
import './Admin.css';
import './AdminProductCreate.css';

const initialState = {
  sku: '',
  name: '',
  price: '',
  category: '상의',
  image: '',
  description: '',
};

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const widgetRef = useRef(null);

  useEffect(() => {
    setImagePreview(formData.image.trim());
  }, [formData.image]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data?.success) {
          const product = response.data.data;
          setFormData({
            sku: product.sku || '',
            name: product.name || '',
            price: product.price !== undefined ? String(product.price) : '',
            category: product.category || '상의',
            image: product.image || '',
            description: product.description || '',
          });
        } else {
          setFeedback({
            type: 'error',
            message: response.data?.message || '상품 정보를 불러오지 못했습니다.',
          });
        }
      } catch (error) {
        if (error.response?.data?.message) {
          setFeedback({ type: 'error', message: error.response.data.message });
        } else if (error.request) {
          setFeedback({
            type: 'error',
            message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
          });
        } else {
          setFeedback({ type: 'error', message: '상품 정보를 불러오는 중 오류가 발생했습니다.' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!cloudName || !uploadPreset || widgetRef.current) {
      return undefined;
    }

    const initWidget = () => {
      if (widgetRef.current || !window.cloudinary) return;
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          cropping: false,
          folder: 'products',
          resourceType: 'image',
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const secureUrl = result.info.secure_url;
            setFormData((prev) => ({
              ...prev,
              image: secureUrl,
            }));
            setFeedback({ type: 'success', message: '이미지가 업로드되었습니다.' });
          } else if (error) {
            setFeedback({ type: 'error', message: '이미지 업로드 중 오류가 발생했습니다.' });
          }
        }
      );
    };

    if (window.cloudinary) {
      initWidget();
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (window.cloudinary) {
        initWidget();
        window.clearInterval(intervalId);
      }
    }, 300);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? value.replace(/[^0-9.]/g, '') : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.sku.trim()) {
      nextErrors.sku = 'SKU는 필수입니다.';
    }

    if (!formData.name.trim()) {
      nextErrors.name = '상품 이름은 필수입니다.';
    }

    if (formData.price === '') {
      nextErrors.price = '상품 가격은 필수입니다.';
    } else if (Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      nextErrors.price = '상품 가격은 0 이상의 숫자여야 합니다.';
    }

    if (!formData.image.trim()) {
      nextErrors.image = '상품 이미지는 필수입니다.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category,
        image: formData.image.trim(),
        description: formData.description.trim(),
      };

      const response = await api.put(`/products/${id}`, payload);
      if (response.data?.success) {
        setFeedback({ type: 'success', message: '상품이 성공적으로 수정되었습니다.' });
        setTimeout(() => {
          navigate('/admin/products');
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          message: response.data?.message || '상품 수정에 실패했습니다. 다시 시도해주세요.',
        });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setFeedback({ type: 'error', message: error.response.data.message });
      } else if (error.request) {
        setFeedback({
          type: 'error',
          message: '서버에 연결할 수 없습니다. 관리자에게 문의해주세요.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: '상품 수정 중 알 수 없는 오류가 발생했습니다.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('정말로 이 상품을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.');
    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);
      alert('상품이 삭제되었습니다.');
      navigate('/admin/products');
    } catch (error) {
      if (error.response?.data?.message) {
        setFeedback({ type: 'error', message: error.response.data.message });
      } else if (error.request) {
        setFeedback({
          type: 'error',
          message: '서버에 연결할 수 없습니다. 관리자에게 문의해주세요.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: '상품 삭제 중 오류가 발생했습니다.',
        });
      }
    }
  };

  const handleOpenWidget = useCallback(() => {
    if (!cloudName || !uploadPreset) {
      setFeedback({ type: 'error', message: 'Cloudinary 설정이 존재하지 않습니다. 환경 변수를 확인해주세요.' });
      return;
    }
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      setFeedback({ type: 'error', message: 'Cloudinary 위젯을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' });
    }
  }, []);

  const handleCancel = useCallback(() => {
    navigate('/admin/products');
  }, [navigate]);

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="admin-page">
      <HomeNavbar
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
          navigate('/login');
        }}
        onAdmin={() => navigate('/admin')}
      />

      <main className="admin-main admin-main--form">
        <header className="admin-form-header">
          <div>
            <p className="admin-greeting">상품 정보를 수정하고 저장하세요.</p>
            <h1>상품 수정</h1>
            <p className="admin-description">필요한 내용을 변경한 뒤 저장 버튼을 눌러주세요.</p>
          </div>
          <div className="admin-form-header-actions">
            <button type="button" className="admin-link" onClick={handleCancel}>
              ← 상품 관리로 돌아가기
            </button>
          </div>
        </header>

        {loading ? (
          <div className="admin-list-placeholder">상품 정보를 불러오는 중입니다...</div>
        ) : (
          <form className="admin-form-card" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="sku">SKU *</label>
                <input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="예: TOP-2025-001"
                />
                {errors.sku && <span className="admin-form-error">{errors.sku}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="name">상품 이름 *</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 모던 테일러드 블레이저"
                />
                {errors.name && <span className="admin-form-error">{errors.name}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="price">상품 가격 (₩) *</label>
                <input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="예: 189000"
                />
                {errors.price && <span className="admin-form-error">{errors.price}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="category">카테고리 *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange}>
                  <option value="상의">상의</option>
                  <option value="하의">하의</option>
                  <option value="악세사리">악세사리</option>
                </select>
              </div>

              <div className="admin-form-field admin-form-field--full">
                <label htmlFor="image">상품 이미지 URL *</label>
                <input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="예: https://example.com/images/product.jpg"
                />
                {errors.image && <span className="admin-form-error">{errors.image}</span>}
                <div className="admin-image-actions">
                  <button type="button" className="admin-form-button admin-form-button--secondary" onClick={handleOpenWidget}>
                    Cloudinary로 이미지 업로드
                  </button>
                  <span className="admin-image-hint">업로드 시 자동으로 URL이 입력됩니다.</span>
                </div>
                {imagePreview && (
                  <div className="admin-image-preview">
                    <img src={imagePreview} alt="상품 미리보기" />
                  </div>
                )}
              </div>

              <div className="admin-form-field admin-form-field--full">
                <label htmlFor="description">설명 (선택)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="상품의 특징, 소재, 관리 방법 등을 간단히 작성하세요."
                />
              </div>
            </div>

            {feedback && (
              <div className={`admin-form-feedback ${feedback.type === 'success' ? 'success' : 'error'}`}>
                {feedback.message}
              </div>
            )}

            <div className="admin-form-actions admin-form-actions--split">
              <button
                type="button"
                className="admin-form-button admin-form-button--danger"
                onClick={handleDelete}
              >
                상품 삭제
              </button>
              <div className="admin-form-actions-group">
                <button type="button" className="admin-form-button admin-form-button--ghost" onClick={handleCancel}>
                  취소
                </button>
                <button type="submit" className="admin-form-button" disabled={saving}>
                  {saving ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default AdminProductEdit;








