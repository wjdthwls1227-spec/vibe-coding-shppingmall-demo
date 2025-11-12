const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { verifyPayment } = require('../utils/paymentUtils');

// 주문 생성
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      items,
      shippingInfo,
      paymentInfo,
      subtotal,
      shippingFee = 0,
      discount = 0,
      totalAmount,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '주문 항목은 최소 1개 이상이어야 합니다.',
      });
    }

    // 주문 중복 체크: transactionId(imp_uid)로 이미 주문이 존재하는지 확인
    if (paymentInfo?.transactionId) {
      const existingOrder = await Order.findOne({
        'paymentInfo.transactionId': paymentInfo.transactionId,
      });

      if (existingOrder) {
        return res.status(409).json({
          success: false,
          message: '이미 처리된 결제입니다. 중복 주문을 방지했습니다.',
          data: existingOrder,
        });
      }
    }

    // 결제 검증: PortOne API를 통해 결제 정보 검증
    if (paymentInfo?.transactionId && paymentInfo?.status === 'paid') {
      const verificationResult = await verifyPayment(
        paymentInfo.transactionId,
        totalAmount
      );

      if (!verificationResult.success && !verificationResult.skipped) {
        return res.status(400).json({
          success: false,
          message: `결제 검증 실패: ${verificationResult.error}`,
        });
      }

      // 검증된 결제 정보로 paymentInfo 업데이트 (검증이 건너뛰어진 경우 기존 값 유지)
      if (verificationResult.payment) {
        paymentInfo.paidAt = verificationResult.payment.paid_at
          ? new Date(verificationResult.payment.paid_at * 1000)
          : paymentInfo.paidAt || new Date();
      }
    }

    const order = await Order.create({
      user: userId,
      items,
      shippingInfo,
      paymentInfo,
      subtotal,
      shippingFee,
      discount,
      totalAmount,
    });

    // 주문 후 장바구니 비우기
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalQuantity: 0, totalPrice: 0 },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다.',
      data: order,
    });
  } catch (error) {
    console.error('❌ 주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 생성 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 주문 목록 조회 (사용자별)
exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 목록 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 모든 주문 조회 (관리자용)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 목록 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 특정 주문 조회
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 주문 상태 업데이트 (관리자)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveredAt } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        deliveredAt,
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 상태 업데이트 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 주문 삭제 (관리자)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '주문이 삭제되었습니다.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};




