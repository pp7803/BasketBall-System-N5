import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    phone: "",
    role: "athlete", // default role
    // Role-specific fields (athlete)
    position: "PG",
    height: "",
    weight: "",
    date_of_birth: "",
    // Role-specific fields (sponsor)
    company_name: "",
    company_address: "",
    tax_code: "",
    // Role-specific fields (coach)
    coaching_license: "",
    years_of_experience: "",
    // Role-specific fields (referee)
    license_number: "",
    certification_level: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated, userRole } = useAuth();
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
    setLoading(true);

    // Prepare data based on role
    const submitData = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      full_name: formData.full_name,
      phone: formData.phone,
      role: formData.role,
    };

    // Add role-specific fields
    if (formData.role === "sponsor") {
      submitData.company_name = formData.company_name;
      submitData.company_address = formData.company_address;
      submitData.tax_code = formData.tax_code;
    } else if (formData.role === "coach") {
      submitData.coaching_license = formData.coaching_license;
      submitData.years_of_experience = formData.years_of_experience;
    } else if (formData.role === "referee") {
      submitData.license_number = formData.license_number;
      submitData.certification_level = formData.certification_level;
    } else if (formData.role === "athlete") {
      submitData.position = formData.position;
      submitData.height = formData.height;
      submitData.weight = formData.weight;
      submitData.date_of_birth = formData.date_of_birth;
    }

    const result = await register(submitData);

    if (result.success) {
      // Redirect based on role
      switch (formData.role) {
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
      setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <span className="text-6xl">🏀</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Đăng ký tài khoản
          </h2>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="athlete">Vận động viên</option>
                <option value="coach">Huấn luyện viên (Coach)</option>
                <option value="sponsor">Nhà tài trợ</option>
                <option value="referee">Trọng tài</option>
              </select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập *
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  className="input-field"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  name="full_name"
                  type="text"
                  required
                  className="input-field"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                name="phone"
                type="tel"
                required
                className="input-field"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Role-specific fields */}
            {formData.role === "athlete" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">
                  Thông tin vận động viên
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vị trí thi đấu *
                    </label>
                    <select
                      name="position"
                      required
                      className="input-field"
                      value={formData.position}
                      onChange={handleChange}
                    >
                      <option value="PG">Point Guard (PG)</option>
                      <option value="SG">Shooting Guard (SG)</option>
                      <option value="SF">Small Forward (SF)</option>
                      <option value="PF">Power Forward (PF)</option>
                      <option value="C">Center (C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh *
                    </label>
                    <input
                      name="date_of_birth"
                      type="date"
                      required
                      className="input-field"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chiều cao (cm) *
                    </label>
                    <input
                      name="height"
                      type="number"
                      step="0.01"
                      min="150"
                      max="250"
                      required
                      className="input-field"
                      placeholder="Ví dụ: 180"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cân nặng (kg) *
                    </label>
                    <input
                      name="weight"
                      type="number"
                      step="0.01"
                      min="40"
                      max="200"
                      required
                      className="input-field"
                      placeholder="Ví dụ: 75"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === "sponsor" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">
                  Thông tin công ty
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên công ty
                  </label>
                  <input
                    name="company_name"
                    type="text"
                    className="input-field"
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ công ty
                  </label>
                  <input
                    name="company_address"
                    type="text"
                    className="input-field"
                    value={formData.company_address}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã số thuế
                  </label>
                  <input
                    name="tax_code"
                    type="text"
                    className="input-field"
                    value={formData.tax_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {formData.role === "coach" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">
                  Thông tin huấn luyện viên
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giấy phép HLV
                  </label>
                  <input
                    name="coaching_license"
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: COACH-001"
                    value={formData.coaching_license}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    name="years_of_experience"
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="Ví dụ: 5"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {formData.role === "referee" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">
                  Thông tin trọng tài
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số giấy phép
                  </label>
                  <input
                    name="license_number"
                    type="text"
                    className="input-field"
                    value={formData.license_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ chứng chỉ
                  </label>
                  <input
                    name="certification_level"
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: Level 1, Level 2..."
                    value={formData.certification_level}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
