const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, '이메일은 필수입니다.'],
      unique: true, // unique: true가 자동으로 인덱스를 생성하므로 별도 인덱스 불필요
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, '올바른 이메일 형식이 아닙니다.'],
    },
    name: {
      type: String,
      required: [true, '이름은 필수입니다.'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, '비밀번호는 필수입니다.'],
      minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.'],
    },
    user_type: {
      type: String,
      required: [true, '사용자 타입은 필수입니다.'],
      enum: {
        values: ['customer', 'admin'],
        message: '사용자 타입은 customer 또는 admin이어야 합니다.',
      },
      default: 'customer',
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt과 updatedAt 자동 생성
  }
);

// unique: true가 이미 인덱스를 생성하므로 별도 인덱스 설정 불필요
// userSchema.index({ email: 1 }); // 중복 인덱스 경고 방지를 위해 제거

const User = mongoose.model('User', userSchema);

module.exports = User;

