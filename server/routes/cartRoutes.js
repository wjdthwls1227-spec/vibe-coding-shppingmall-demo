const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');
const authorizeCartAccess = require('../middleware/authorizeCartAccess');

const router = express.Router();

// 사용자 장바구니 조회
router.get('/:userId', authenticate, authorizeCartAccess, getCart);

// 장바구니에 상품 추가
router.post('/:userId/items', authenticate, authorizeCartAccess, addToCart);

// 장바구니 항목 업데이트
router.put('/:userId/items/:itemId', authenticate, authorizeCartAccess, updateCartItem);
router.patch('/:userId/items/:itemId', authenticate, authorizeCartAccess, updateCartItem);

// 장바구니 항목 삭제
router.delete('/:userId/items/:itemId', authenticate, authorizeCartAccess, removeCartItem);

// 장바구니 전체 비우기
router.delete('/:userId', authenticate, authorizeCartAccess, clearCart);

module.exports = router;


