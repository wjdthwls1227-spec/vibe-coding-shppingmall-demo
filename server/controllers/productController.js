const Product = require('../models/Product');

// 상품 생성
exports.createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description } = req.body;

    if (!sku || !name || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'SKU, 상품 이름, 가격, 카테고리, 이미지는 필수입니다.',
      });
    }

    const product = await Product.create({
      sku,
      name,
      price,
      category,
      image,
      description,
    });

    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 SKU입니다.',
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors,
      });
    }

    console.error('❌ 상품 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 생성 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 상품 전체 목록 조회
exports.getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 2;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 특정 상품 조회
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 상품 수정
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 수정되었습니다.',
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 SKU입니다.',
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors,
      });
    }

    console.error('❌ 상품 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 수정 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 상품 삭제
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};


