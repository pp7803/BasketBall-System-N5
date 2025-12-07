import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaBasketballBall,
  FaUser,
  FaLock,
  FaSignInAlt,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

const Login = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: location.state?.username || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "sponsor":
          navigate("/sponsor/dashboard", { replace: true });
          break;
        case "coach":
          navigate("/coach/teams", { replace: true });
          break;
        case "athlete":
          navigate("/athlete/profile", { replace: true });
          break;
        case "referee":
          navigate("/referee/matches", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Clear success message when trying to login
    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success && result.user) {
        // Redirect based on user role
        const role = result.user.role;
        switch (role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "sponsor":
            navigate("/sponsor/dashboard");
            break;
          case "coach":
            navigate("/coach/teams");
            break;
          case "athlete":
            navigate("/athlete/schedule");
            break;
          case "referee":
            navigate("/referee/matches");
            break;
          default:
            navigate("/");
        }
      } else {
        setError(result.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        setLoading(false); // Reset loading state on error
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false); // Reset loading state on error
    }
    // Don't set loading to false here if login successful (page will redirect)
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-full shadow-lg mb-4">
            <FaBasketballBall className="text-6xl text-primary-600 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hệ thống quản lý giải đấu bóng rổ
          </p>
        </div>

        <div className="card shadow-xl">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center space-x-2">
              <FaCheckCircle className="flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center space-x-2">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
              >
                <FaUser className="mr-2 text-gray-500" />
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
              >
                <FaLock className="mr-2 text-gray-500" />
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <FaSignInAlt />
              <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
