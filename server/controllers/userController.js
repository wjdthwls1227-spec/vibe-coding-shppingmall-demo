const User = require('../models/User');
const { hashPassword } = require('../utils/passwordUtils');

// 모든 사용자 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // 비밀번호 제외
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 특정 사용자 조회 (ID로)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 이메일로 사용자 조회
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 새 사용자 생성
exports.createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 필수 필드 검증
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일, 이름, 비밀번호는 필수입니다.',
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.',
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await User.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword, // 암호화된 비밀번호 저장
      user_type: user_type || 'customer',
      address: address ? address.trim() : '',
    });

    // 비밀번호 제외하고 응답
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log(`✅ 새 사용자 생성: ${user.email} (${user.user_type})`);

    res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: userResponse,
    });
  } catch (error) {
    console.error('❌ 사용자 생성 오류:', error);

    // MongoDB 중복 키 오류 처리
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다.',
      });
    }

    // Mongoose 검증 오류 처리
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: '사용자 생성 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 사용자 정보 수정
exports.updateUser = async (req, res) => {
  try {
    const { name, password, user_type, address } = req.body;
    
    // 수정 가능한 필드만 추출
    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      // 비밀번호가 제공된 경우 해싱
      updateData.password = await hashPassword(password);
    }
    if (user_type) updateData.user_type = user_type;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // 업데이트된 문서 반환
        runValidators: true, // 스키마 검증 실행
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: '사용자 수정 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 삭제 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

