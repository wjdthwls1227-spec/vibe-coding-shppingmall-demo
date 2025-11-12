const User = require('../models/User');
const { comparePassword } = require('../utils/passwordUtils');
const { generateAccessToken } = require('../utils/tokenUtils');

// 사용자 로그인 처리
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      user_type: user.user_type,
    };

    const token = generateAccessToken(payload);

    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log(`✅ 로그인 성공: ${user.email} (${user.user_type})`);

    return res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      token,
      data: userResponse,
    });
  } catch (error) {
    console.error('❌ 로그인 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 인증된 사용자 정보 반환
exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 사용자입니다.',
    });
  }

  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

