module.exports = (req, res, next) => {
  if (!req.user || (req.user.sub && req.user.sub !== req.params.userId)) {
    return res.status(403).json({
      success: false,
      message: '해당 장바구니에 접근할 권한이 없습니다.',
    });
  }
  next();
};




