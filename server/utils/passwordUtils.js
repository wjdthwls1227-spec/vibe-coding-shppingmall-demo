const bcrypt = require('bcryptjs');

// 비밀번호 해싱
const hashPassword = async (password) => {
  const saltRounds = 10; // 해싱 강도 (높을수록 안전하지만 느림)
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 검증
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};










