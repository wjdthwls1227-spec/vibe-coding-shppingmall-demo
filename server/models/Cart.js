const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, '최소 수량은 1개입니다.'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, '가격은 0 이상이어야 합니다.'],
    },
    selectedOptions: {
      color: { type: String, trim: true },
      size: { type: String, trim: true },
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: [0, '총 수량은 0 이상이어야 합니다.'],
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, '총 금액은 0 이상이어야 합니다.'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'ordered'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;








