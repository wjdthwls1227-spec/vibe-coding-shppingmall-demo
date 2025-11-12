const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// @route   POST /api/products
// @desc    상품 등록
// @access  관리자 (추후 인증 미들웨어 추가 가능)
router.post('/', createProduct);

// @route   GET /api/products
// @desc    상품 목록 조회
// @access  공개
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    특정 상품 조회
// @access  공개
router.get('/:id', getProductById);

// @route   PUT /api/products/:id
// @desc    상품 전체 수정
// @access  관리자
router.put('/:id', updateProduct);

// @route   PATCH /api/products/:id
// @desc    상품 부분 수정
// @access  관리자
router.patch('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    상품 삭제
// @access  관리자
router.delete('/:id', deleteProduct);

module.exports = router;


