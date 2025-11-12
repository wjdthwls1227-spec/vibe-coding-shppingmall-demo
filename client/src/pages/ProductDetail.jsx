import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import HomeNavbar from './HomeNavbar.jsx';
import { useCartDispatch } from '../context/CartContext.jsx';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const cartDispatch = useCartDispatch();

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data?.success) {
          const data = response.data.data;
          setProduct(data);
          setSelectedImage(data.image);
        } else {
          setError(response.data?.message || '상품 정보를 불러오지 못했습니다.');
        }
      } catch (err) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.request) {
          setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    navigate('/login');
  }, [navigate]);

  const handleAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  const handleAddToCart = useCallback(async () => {
    if (!currentUser) {
      alert('로그인 후 이용 가능합니다.');
      navigate('/login');
      return;
    }

    const userId = currentUser.id || currentUser._id;
    if (!userId) {
      alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/carts/${userId}/items`, {
        productId: product._id,
        quantity: 1,
        selectedOptions: {
          color: selectedColor,
          size: selectedSize,
        },
      });

      if (response.data?.success && response.data.data) {
        cartDispatch({ type: 'SET_CART', payload: response.data.data });
        alert('장바구니에 담았습니다.');
      } else {
        alert(response.data?.message || '장바구니에 담지 못했습니다.');
      }
    } catch (error) {
      console.error('❌ 장바구니 추가 오류:', error);
      alert('장바구니에 담는 중 오류가 발생했습니다.');
    }
  }, [cartDispatch, currentUser, navigate, product, selectedColor, selectedSize]);

  const thumbnails = useMemo(() => {
    if (!product?.image) return [];
    return [product.image, product.image, product.image, product.image];
  }, [product]);

  return (
    <div className="product-detail-page">
      <HomeNavbar user={currentUser} onLogout={handleLogout} onAdmin={handleAdmin} />
      <main className="product-detail-main">
        <button type="button" className="product-detail-back" onClick={() => navigate(-1)}>
          ← Back to shop
        </button>

        {loading ? (
          <div className="product-detail-placeholder">상품 정보를 불러오는 중입니다...</div>
        ) : error ? (
          <div className="product-detail-error">{error}</div>
        ) : product ? (
          <section className="product-detail-content">
            <div className="product-detail-gallery">
              <div className="product-detail-image">
                <img src={selectedImage || product.image} alt={product.name} />
              </div>
              <div className="product-detail-thumbnails">
                {thumbnails.map((thumb, index) => (
                  <button
                    key={`${thumb}-${index}`}
                    type="button"
                    className={`product-detail-thumb ${thumb === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(thumb)}
                  >
                    <img src={thumb} alt={`${product.name} thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-detail-info">
              <span className="product-detail-category">{product.category || '상품'}</span>
              <h1>{product.name}</h1>
              <span className="product-detail-price">
                {product.price !== undefined ? `${Number(product.price).toLocaleString()}원` : '-'}
              </span>
              <p className="product-detail-description">
                {product.description ||
                  '선택된 상품의 상세 설명이 준비 중입니다. 곧 더욱 자세한 정보를 제공해드릴게요.'}
              </p>

              <div className="product-detail-options">
                <div className="product-detail-option">
                  <span>Color</span>
                  <div className="product-detail-color-list">
                    {['Black', 'Navy', 'Beige'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`product-detail-pill ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="product-detail-option">
                  <span>Size</span>
                  <div className="product-detail-size-list">
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`product-detail-pill ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                    <button type="button" className="product-detail-size-guide">
                      Size guide
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-detail-actions">
                <button type="button" className="product-detail-cart">
                  ADD TO BAG
                </button>
                <button type="button" className="product-detail-wishlist" onClick={handleAddToCart}>
                  ADD TO WISHLIST
                </button>
              </div>

              <div className="product-detail-extra">
                <div>
                  <h3>Details</h3>
                  <ul>
                    <li>100% Wool</li>
                    <li>Dry clean only</li>
                    <li>Made in Italy</li>
                    <li>Model is 175cm and wears size S</li>
                  </ul>
                </div>
                <div>
                  <h3>Delivery & Returns</h3>
                  <p>전 상품 무료 배송 & 무료 반품 정책을 제공하고 있습니다.</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default ProductDetail;






