import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './components/Loading';
import './App.css';

// Lazy loading으로 페이지 컴포넌트 로드 (코드 스플리팅)
// 초기 번들 크기를 줄이고 필요할 때만 로드하여 성능 최적화
const Home = lazy(() => import('./pages/Home'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const AdminProductCreate = lazy(() => import('./pages/admin/AdminProductCreate'));
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'));
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'));
const AdminOrderList = lazy(() => import('./pages/admin/AdminOrderList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderList = lazy(() => import('./pages/OrderList'));

function App({ user }) {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/orders" element={<AdminOrderList />} />
          <Route path="/admin/products/new" element={<AdminProductCreate />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/success" element={<OrderSuccess />} />
          <Route path="/orders/:userId" element={<OrderList />} />
          <Route path="/orders" element={<OrderList />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

