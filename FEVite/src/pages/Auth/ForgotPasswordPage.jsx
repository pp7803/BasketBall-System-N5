import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import {
  FaEnvelope,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
  FaKey,
} from "react-icons/fa";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Handle send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });

      console.log("📧 Forgot password response:", response.data);

      if (response.data.success) {
        // Chỉ chuyển sang step 2 nếu có data.email (user thực sự tồn tại)
        if (response.data.data?.email) {
          console.log("✅ Email found, moving to OTP step");

          if (response.data.data?.expires_in_minutes) {
            setExpiresInMinutes(response.data.data.expires_in_minutes);
          }

          setStep(2);
          startCountdown();
        } else {
          // User không tồn tại, hiển thị message chung
          console.log("⚠️  Email not found in system");
          setError(
            "Email này không tồn tại trong hệ thống. Vui lòng kiểm tra lại địa chỉ email."
          );
        }
      } else {
        setError(response.data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("❌ Forgot password error:", err);
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Verifying OTP:", { email, otp });
      const response = await authAPI.verifyOTP({ email, otp });

      console.log("✅ Verify OTP response:", response.data);

      if (response.data.success) {
        // Navigate to reset password page with verified email and OTP
        navigate("/reset-password", {
          state: { email, otp, verified: true },
        });
      }
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "OTP không hợp lệ. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    setOtp("");

    try {
      console.log("🔄 Resending OTP to:", email);
      const response = await authAPI.forgotPassword({ email });

      console.log("📧 Resend OTP response:", response.data);

      if (response.data.success && response.data.data?.email) {
        console.log("✅ OTP resent successfully");
        setCanResend(false);
        setCountdown(60);
        startCountdown();
      }
    } catch (err) {
      console.error("❌ Resend OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Không thể gửi lại OTP. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for resend
  const startCountdown = () => {
    setCanResend(false);
    let timeLeft = 60;
    setCountdown(timeLeft);

    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        setCanResend(true);
      }
    }, 1000);
  };

  // Step 1: Email input
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
        <div className="max-w-md w-full">
          <Link
            to="/login"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Quay lại đăng nhập</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-3xl text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quên mật khẩu?
              </h1>
              <p className="text-gray-600">Nhập email của bạn để nhận mã OTP</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Gửi mã OTP</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                💡 Lưu ý:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Mã OTP sẽ được gửi đến email của bạn</li>
                <li>• Mã OTP có hiệu lực trong 10 phút</li>
                <li>• Kiểm tra cả hộp thư spam nếu không thấy email</li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Nhớ mật khẩu?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: OTP verification
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => {
            setStep(1);
            setOtp("");
            setError("");
          }}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Thay đổi email</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nhập mã OTP
            </h1>
            <p className="text-gray-600">
              Mã OTP đã được gửi đến <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Mã có hiệu lực trong {expiresInMinutes} phút
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mã OTP <span className="text-red-500">*</span>
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Nhập mã OTP 6 số từ email của bạn
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <FaKey />
                  <span>Xác nhận OTP</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50"
              >
                Gửi lại mã OTP
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Gửi lại mã sau {countdown} giây
              </p>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">📧 Không nhận được email?</p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1">
              <li>• Kiểm tra hộp thư spam/junk</li>
              <li>• Đợi vài phút trước khi gửi lại</li>
              <li>• Đảm bảo email chính xác</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
