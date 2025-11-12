const Cart = require('../models/Cart');
const Product = require('../models/Product');

const recalcTotals = (items = []) => {
  const totals = items.reduce(
    (acc, item) => {
      acc.quantity += item.quantity;
      acc.price += item.price * item.quantity;
      return acc;
    },
    { quantity: 0, price: 0 }
  );

  return {
    totalQuantity: totals.quantity,
    totalPrice: totals.price,
  };
};

// 장바구니 조회 (사용자별)
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 장바구니에 상품 추가
exports.addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1, selectedOptions = {} } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID는 필수입니다.',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedOptions?.color === (selectedOptions.color || '') &&
        item.selectedOptions?.size === (selectedOptions.size || '')
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        selectedOptions,
      });
    }

    const { totalQuantity, totalPrice } = recalcTotals(cart.items);
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;

    await cart.save();

    const populatedCart = await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: '장바구니에 상품이 추가되었습니다.',
      data: populatedCart,
    });
  } catch (error) {
    console.error('❌ 장바구니 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니에 상품을 추가하는 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 장바구니 항목 업데이트 (수량 변경)
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: '변경할 수량이 필요합니다.',
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.',
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '장바구니 항목을 찾을 수 없습니다.',
      });
    }

    item.quantity = quantity;

    const { totalQuantity, totalPrice } = recalcTotals(cart.items);
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;

    await cart.save();
    const populatedCart = await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: '장바구니 항목이 업데이트되었습니다.',
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 항목 업데이트 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 장바구니 항목 삭제
exports.removeCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.',
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '장바구니 항목을 찾을 수 없습니다.',
      });
    }

    item.remove();

    const { totalQuantity, totalPrice } = recalcTotals(cart.items);
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;

    await cart.save();
    const populatedCart = await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: '장바구니에서 항목이 삭제되었습니다.',
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 항목 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 장바구니 전체 비우기
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.',
      });
    }

    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: '장바구니가 비워졌습니다.',
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니를 비우는 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};




