import { useState, useEffect } from "react";
import { notificationAPI, publicAPI } from "../../services/api";
import { FaPaperPlane, FaBullhorn, FaUsers, FaUser } from "react-icons/fa";

const AdminNotificationsPage = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    type: "admin_announcement",
    title: "",
    message: "",
    metadata: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const notificationTypes = [
    { value: "admin_announcement", label: "Thông báo chung", icon: "📢" },
    { value: "team_approved", label: "Đội được duyệt", icon: "✅" },
    { value: "team_rejected", label: "Đội bị từ chối", icon: "❌" },
    { value: "match_scheduled", label: "Lịch thi đấu", icon: "📅" },
    { value: "referee_assigned", label: "Phân công trọng tài", icon: "👨‍⚖️" },
    { value: "match_result", label: "Kết quả trận đấu", icon: "🏀" },
    { value: "standings_updated", label: "Cập nhật BXH", icon: "📊" },
    { value: "tournament_created", label: "Giải đấu mới", icon: "🏆" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        user_id: formData.user_id || null, // null = public notification
        type: formData.type,
        title: formData.title,
        message: formData.message,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
      };

      const response = await notificationAPI.adminCreateNotification(payload);

      if (response.data.success) {
        setSuccess(
          payload.user_id
            ? "Thông báo cá nhân đã được gửi thành công!"
            : "Thông báo công khai đã được gửi thành công!"
        );

        // Reset form
        setFormData({
          user_id: "",
          type: "admin_announcement",
          title: "",
          message: "",
          metadata: "",
        });
      }
    } catch (err) {
      console.error("Error creating notification:", err);
      setError(err.response?.data?.message || "Không thể tạo thông báo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <FaBullhorn className="text-primary-600" />
            <span>Tạo thông báo</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Gửi thông báo cho người dùng cụ thể hoặc tất cả mọi người
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-6 space-y-6"
        >
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại thông báo *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: type.value }))
                  }
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    formData.type === type.value
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl mr-2">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người nhận
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, user_id: "" }))
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  !formData.user_id
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FaUsers className="text-2xl text-primary-600 mb-2" />
                <div className="font-medium">Tất cả người dùng</div>
                <div className="text-xs text-gray-600">Thông báo công khai</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, user_id: "select" }))
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.user_id
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FaUser className="text-2xl text-primary-600 mb-2" />
                <div className="font-medium">Người dùng cụ thể</div>
                <div className="text-xs text-gray-600">Thông báo riêng tư</div>
              </button>
            </div>
          </div>

          {/* User ID Input (if specific user selected) */}
          {formData.user_id && (
            <div>
              <label
                htmlFor="user_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                User ID *
              </label>
              <input
                type="number"
                id="user_id"
                name="user_id"
                value={formData.user_id === "select" ? "" : formData.user_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập User ID (ví dụ: 1, 2, 3...)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập ID của người dùng bạn muốn gửi thông báo riêng
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tiêu đề *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ví dụ: Thông báo lịch thi đấu mới"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nội dung *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nhập nội dung thông báo..."
              required
            />
          </div>

          {/* Metadata (Optional) */}
          <div>
            <label
              htmlFor="metadata"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Metadata (JSON - Tùy chọn)
            </label>
            <textarea
              id="metadata"
              name="metadata"
              value={formData.metadata}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder='{"match_id": 1, "tournament_id": 2}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập dữ liệu bổ sung dưới dạng JSON (tùy chọn)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  user_id: "",
                  type: "admin_announcement",
                  title: "",
                  message: "",
                  metadata: "",
                });
                setError("");
                setSuccess("");
              }}
              className="btn-secondary"
            >
              Xóa form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <FaPaperPlane />
              <span>{loading ? "Đang gửi..." : "Gửi thông báo"}</span>
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Gợi ý sử dụng</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Thông báo công khai:</strong> Không chọn user_id, tất cả
              người dùng sẽ nhận được
            </li>
            <li>
              • <strong>Thông báo riêng:</strong> Nhập user_id để gửi cho người
              dùng cụ thể
            </li>
            <li>
              • <strong>Metadata:</strong> Dùng để lưu thông tin bổ sung như
              match_id, tournament_id...
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
