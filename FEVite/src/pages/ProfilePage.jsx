import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaWallet,
} from "react-icons/fa";

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getMyProfile();
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          email: response.data.data.email || "",
          full_name: response.data.data.full_name || "",
          phone: response.data.data.phone || "",
          avatar_url: response.data.data.avatar_url || "",
          roleData: response.data.data.roleData || {},
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleDataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      roleData: {
        ...prev.roleData,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setMessage(null);
    try {
      const response = await userAPI.updateMyProfile(formData);
      if (response.data.success) {
        setMessage({ type: "success", text: "Cập nhật thành công!" });
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Cập nhật thất bại",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      email: profile.email || "",
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      avatar_url: profile.avatar_url || "",
      roleData: profile.roleData || {},
    });
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Không thể tải thông tin profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaEdit />
            Chỉnh sửa
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUserCircle className="text-6xl text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <p className="text-gray-600">@{profile.username}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {profile.role.toUpperCase()}
            </span>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl px-6 py-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaWallet className="text-green-600 text-xl" />
              <span className="text-sm font-medium text-gray-600">Số dư</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("vi-VN").format(profile.money || 0)} VND
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Họ và tên
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.full_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email (không thể thay đổi)
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Số điện thoại
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.phone || "Chưa cập nhật"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đăng nhập lần cuối
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">
                {profile.last_login
                  ? new Date(profile.last_login).toLocaleString("vi-VN")
                  : "Chưa đăng nhập"}
              </p>
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {profile.role === "athlete" && profile.roleData && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Thông tin vận động viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí
                </label>
                {editing ? (
                  <select
                    value={formData.roleData.position || ""}
                    onChange={(e) =>
                      handleRoleDataChange("position", e.target.value)
                    }
                    disabled={profile.roleData.team_id} // Cannot change position if in team
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Chưa chọn</option>
                    <option value="PG">Point Guard (PG)</option>
                    <option value="SG">Shooting Guard (SG)</option>
                    <option value="SF">Small Forward (SF)</option>
                    <option value="PF">Power Forward (PF)</option>
                    <option value="C">Center (C)</option>
                  </select>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.position || "Chưa cập nhật"}
                  </p>
                )}
                {editing && profile.roleData.team_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Không thể thay đổi vị trí khi đã có đội
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.roleData.date_of_birth || ""}
                    onChange={(e) =>
                      handleRoleDataChange("date_of_birth", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.date_of_birth || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều cao (cm)
                </label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={formData.roleData.height || ""}
                    onChange={(e) =>
                      handleRoleDataChange("height", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.height || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cân nặng (kg)
                </label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={formData.roleData.weight || ""}
                    onChange={(e) =>
                      handleRoleDataChange("weight", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.weight || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số áo
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.roleData.jersey_number || "Chưa có"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.roleData.team_id ? "Có đội" : "Chưa có đội"}
                </p>
              </div>
            </div>
          </div>
        )}

        {profile.role === "coach" && profile.roleData && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Thông tin huấn luyện viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giấy phép HLV (không thể thay đổi)
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.roleData.coaching_license || "Chưa cập nhật"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số năm kinh nghiệm (không thể thay đổi)
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.roleData.years_of_experience || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>
        )}

        {profile.role === "sponsor" && profile.roleData && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Thông tin nhà tài trợ
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên công ty
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.roleData.company_name || ""}
                    onChange={(e) =>
                      handleRoleDataChange("company_name", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.company_name || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ công ty
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.roleData.company_address || ""}
                    onChange={(e) =>
                      handleRoleDataChange("company_address", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.company_address || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã số thuế
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.roleData.tax_code || ""}
                    onChange={(e) =>
                      handleRoleDataChange("tax_code", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.tax_code || "Chưa cập nhật"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {profile.role === "referee" && profile.roleData && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin trọng tài</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số giấy phép
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.roleData.license_number || ""}
                    onChange={(e) =>
                      handleRoleDataChange("license_number", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.license_number || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp chứng chỉ
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.roleData.certification_level || ""}
                    onChange={(e) =>
                      handleRoleDataChange(
                        "certification_level",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.roleData.certification_level || "Chưa cập nhật"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {editing && (
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={handleCancel}
              disabled={saveLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <FaTimes />
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave />
              {saveLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
