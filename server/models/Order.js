const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, '가격은 0 이상이어야 합니다.'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, '최소 수량은 1개입니다.'],
    },
    selectedOptions: {
      color: { type: String, trim: true },
      size: { type: String, trim: true },
    },
  },
  { _id: false }
);

const shippingInfoSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'kakao_pay', 'naver_pay', 'paypal', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [orderItemSchema],
    validate: [
      (items) => items.length > 0,
      '주문 항목은 최소 1개 이상이어야 합니다.',
    ],
  },
  shippingInfo: {
    type: shippingInfoSchema,
    required: true,
  },
  paymentInfo: {
    type: paymentInfoSchema,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, '상품 금액은 0 이상이어야 합니다.'],
  },
  shippingFee: {
    type: Number,
    required: true,
    min: [0, '배송비는 0 이상이어야 합니다.'],
    default: 0,
  },
  discount: {
    type: Number,
    min: [0, '할인 금액은 0 이상이어야 합니다.'],
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, '총 결제 금액은 0 이상이어야 합니다.'],
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveredAt: {
    type: Date,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;


