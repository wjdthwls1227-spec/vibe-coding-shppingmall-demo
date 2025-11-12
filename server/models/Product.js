const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU는 필수입니다.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, '상품 이름은 필수입니다.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, '상품 가격은 필수입니다.'],
      min: [0, '상품 가격은 0 이상이어야 합니다.'],
    },
    category: {
      type: String,
      required: [true, '카테고리는 필수입니다.'],
      enum: {
        values: ['상의', '하의', '악세사리'],
        message: '카테고리는 상의, 하의, 악세사리 중 하나여야 합니다.',
      },
    },
    image: {
      type: String,
      required: [true, '상품 이미지는 필수입니다.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;


