const axios = require('axios');

/**
 * PortOne(Iamport) 결제 검증
 * @param {string} impUid - PortOne 결제 고유번호
 * @param {number} expectedAmount - 예상 결제 금액
 * @returns {Promise<Object>} 결제 정보
 */
async function verifyPayment(impUid, expectedAmount) {
  try {
    // 환경 변수 확인
    if (!process.env.PORTONE_REST_API_KEY || !process.env.PORTONE_REST_API_SECRET) {
      console.warn('⚠️ PortOne REST API 키가 설정되지 않았습니다. 결제 검증을 건너뜁니다.');
      return {
        success: true, // 환경 변수가 없어도 주문은 진행 (개발 환경 대응)
        payment: null,
        skipped: true,
      };
    }

    // PortOne REST API 엔드포인트
    const tokenResponse = await axios.post(
      'https://api.iamport.kr/users/getToken',
      {
        imp_key: process.env.PORTONE_REST_API_KEY,
        imp_secret: process.env.PORTONE_REST_API_SECRET,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!tokenResponse.data.response || !tokenResponse.data.response.access_token) {
      throw new Error('PortOne 토큰 발급 실패');
    }

    const { access_token } = tokenResponse.data.response;

    // 결제 정보 조회
    const paymentResponse = await axios.get(
      `https://api.iamport.kr/payments/${impUid}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!paymentResponse.data.response) {
      throw new Error('결제 정보를 찾을 수 없습니다.');
    }

    const payment = paymentResponse.data.response;

    // 결제 상태 확인
    if (payment.status !== 'paid') {
      throw new Error(`결제가 완료되지 않았습니다. 상태: ${payment.status}`);
    }

    // 결제 금액 확인
    if (payment.amount !== expectedAmount) {
      throw new Error(
        `결제 금액이 일치하지 않습니다. 예상: ${expectedAmount}, 실제: ${payment.amount}`
      );
    }

    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error('❌ 결제 검증 오류:', error.message);
    if (error.response) {
      console.error('API 응답:', error.response.data);
    }
    return {
      success: false,
      error: error.message || '결제 검증 중 오류가 발생했습니다.',
    };
  }
}

module.exports = {
  verifyPayment,
};

