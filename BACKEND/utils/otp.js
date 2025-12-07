/**
 * Tạo mã OTP 6 chữ số ngẫu nhiên
 * @returns {string} - Mã OTP 6 chữ số
 */
const generateOTP = () => {
  // Tạo số ngẫu nhiên từ 100000 đến 999999
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

/**
 * Tính thời gian hết hạn OTP
 * @param {number} minutes - Số phút hết hạn (default: 10)
 * @returns {Date} - Thời gian hết hạn
 */
const getOTPExpiry = (minutes = 10) => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

/**
 * Kiểm tra OTP có hợp lệ không
 * @param {string} inputOTP - OTP người dùng nhập
 * @param {string} storedOTP - OTP được lưu trong database
 * @param {Date} expiryTime - Thời gian hết hạn
 * @returns {object} - { valid: boolean, message: string }
 */
const verifyOTP = (inputOTP, storedOTP, expiryTime) => {
  // Kiểm tra OTP có tồn tại không
  if (!storedOTP || !expiryTime) {
    return {
      valid: false,
      message: "Không tìm thấy OTP. Vui lòng yêu cầu mã mới.",
    };
  }

  // Kiểm tra OTP có hết hạn không
  if (new Date() > new Date(expiryTime)) {
    return {
      valid: false,
      message: "OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
    };
  }

  // Kiểm tra OTP có khớp không
  if (inputOTP !== storedOTP) {
    return {
      valid: false,
      message: "OTP không chính xác. Vui lòng thử lại.",
    };
  }

  return {
    valid: true,
    message: "OTP hợp lệ.",
  };
};

/**
 * Format OTP thành dạng hiển thị (xxx-xxx)
 * @param {string} otp - Mã OTP 6 chữ số
 * @returns {string} - OTP đã format
 */
const formatOTP = (otp) => {
  if (!otp || otp.length !== 6) return otp;
  return `${otp.slice(0, 3)}-${otp.slice(3)}`;
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  verifyOTP,
  formatOTP,
};

