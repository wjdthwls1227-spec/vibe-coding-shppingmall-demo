const express = require('express');
const {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const authorizeCartAccess = require('../middleware/authorizeCartAccess');

const router = express.Router();

// 주문 생성
router.post('/:userId', authenticate, authorizeCartAccess, createOrder);

// 모든 주문 조회 (관리자용)
router.get('/', authenticate, getAllOrders);

// 사용자 주문 목록 조회
router.get('/:userId', authenticate, authorizeCartAccess, getOrders);

// 특정 주문 조회
router.get('/detail/:orderId', authenticate, getOrderById);

// 주문 상태 업데이트 (관리자)
router.put('/detail/:orderId/status', authenticate, updateOrderStatus);
router.patch('/detail/:orderId/status', authenticate, updateOrderStatus);

// 주문 삭제 (관리자)
router.delete('/detail/:orderId', authenticate, deleteOrder);

module.exports = router;




