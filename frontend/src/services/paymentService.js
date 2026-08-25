import api from '../api/axiosConfig';

const BASE_PATH = '/api/payments';

export const paymentService = {
  /**
   * Yêu cầu backend tạo link thanh toán VIP.
   * @returns {Promise}
   */
  createVipPayment: (packageId) => {
    return api.post(`${BASE_PATH}/create`, packageId ? { packageId } : {});
  },

  /**
   * Yêu cầu nạp xu với số lượng bất kỳ (1.000 VNĐ / xu).
   * @param {number} coins
   * @returns {Promise}
   */
  createCoinPayment: (coins) => {
    return api.post(`${BASE_PATH}/create-coin`, { coins });
  },

  /**
   * Lấy lịch sử thanh toán của người dùng.
   * @returns {Promise}
   */
  getPaymentHistory: () => {
    return api.get(`${BASE_PATH}/history`);
  },
};
