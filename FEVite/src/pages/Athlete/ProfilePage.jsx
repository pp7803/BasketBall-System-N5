import { useState, useEffect } from "react";
import { athleteAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTshirt,
  FaRunning,
  FaRulerVertical,
  FaWeight,
  FaBirthdayCake,
  FaSave,
  FaUsers,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaShieldAlt,
  FaUserCircle,
  FaHistory,
  FaClock,
  FaTimesCircle,
  FaSignOutAlt,
} from "react-icons/fa";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    jersey_number: "",
    position: "",
    height: "",
    weight: "",
    date_of_birth: "",
    team_name: "",
    team_id: null,
    team_player_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Leave team modal states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchRequests();
    fetchLeaveRequests();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await athleteAPI.getProfile();
      const data = response.data.data;
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        jersey_number: data.jersey_number || "",
        position: data.position || "",
        height: data.height || "",
        weight: data.weight || "",
        date_of_birth: data.date_of_birth
          ? data.date_of_birth.split("T")[0]
          : "",
        team_name: data.team_name || "",
        team_id: data.team_id || null,
        team_player_count: data.team_player_count || 0,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Không thể tải thông tin hồ sơ" });
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      console.log("🔍 Fetching join requests...");
      const response = await athleteAPI.getMyRequests();
      console.log("📋 Join requests response:", response.data);
      setRequests(response.data.data || []);
      console.log("✅ Loaded", response.data.data?.length || 0, "requests");
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await athleteAPI.getMyLeaveRequests();
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleLeaveTeam = () => {
    // Check if there's already a pending leave request
    const pendingLeave = leaveRequests.find((req) => req.status === "pending");
    if (pendingLeave) {
      setMessage({
        type: "error",
        text: "Bạn đã gửi yêu cầu rời đội. Vui lòng đợi coach xử lý.",
      });
      return;
    }

    setShowLeaveModal(true);
    setLeaveReason("");
  };

  const handleSubmitLeaveRequest = async () => {
    if (!leaveReason.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập lý do rời đội" });
      return;
    }

    setSubmittingLeave(true);
    try {
      const response = await athleteAPI.requestLeaveTeam({
        reason: leaveReason,
      });
      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Yêu cầu rời đội đã được gửi. Vui lòng đợi coach phê duyệt.",
        });
        setShowLeaveModal(false);
        setLeaveReason("");
        fetchLeaveRequests();
      }
    } catch (error) {
      console.error("Leave team error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Không thể gửi yêu cầu rời đội",
      });
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCancelLeaveRequest = async (requestId) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu rời đội không?")) {
      return;
    }

    try {
      const response = await athleteAPI.cancelLeaveRequest(requestId);
      if (response.data.success) {
        setMessage({ type: "success", text: "Đã hủy yêu cầu rời đội" });
        fetchLeaveRequests();
      }
    } catch (error) {
      console.error("Cancel leave request error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Không thể hủy yêu cầu",
      });
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này không?")) {
      return;
    }

    try {
      const response = await athleteAPI.cancelJoinRequest(requestId);
      if (response.data.success) {
        setMessage({ type: "success", text: "Đã hủy yêu cầu thành công!" });
        fetchRequests(); // Reload requests
      }
    } catch (error) {
      console.error("Cancel request error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Không thể hủy yêu cầu",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await athleteAPI.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        position: profile.position || null,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        date_of_birth: profile.date_of_birth || null,
      });

      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });

      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.full_name = profile.full_name;
      localStorage.setItem("user", JSON.stringify(storedUser));

      // Scroll to top to see message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-primary-100 p-4 rounded-full">
            <FaUserCircle className="text-4xl text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hồ sơ vận động viên
            </h1>
            <p className="text-gray-600 mt-1">
              UC12: Cập nhật thông tin cá nhân
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <FaCheckCircle className="text-xl flex-shrink-0" />
          ) : (
            <FaExclamationCircle className="text-xl flex-shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div>
            <div className="flex items-center space-x-2 mb-6 pb-3 border-b-2 border-gray-200">
              <FaUser className="text-primary-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin cơ bản
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-gray-500" />
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-gray-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <FaShieldAlt className="inline mr-1" />
                  Email không thể thay đổi
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2 text-gray-500" />
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="0901234567"
              />
            </div>
          </div>

          {/* Player Info Section */}
          <div>
            <div className="flex items-center space-x-2 mb-6 pb-3 border-b-2 border-gray-200">
              <FaRunning className="text-primary-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin cầu thủ
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaTshirt className="inline mr-2 text-gray-500" />
                  Số áo
                </label>
                <input
                  type="text"
                  name="jersey_number"
                  value={profile.jersey_number || "Chưa được phân"}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <FaShieldAlt className="inline mr-1" />
                  Số áo do admin/coach phân công
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaRunning className="inline mr-2 text-gray-500" />
                  Vị trí
                </label>
                <select
                  name="position"
                  value={profile.position}
                  onChange={handleChange}
                  className="input-field"
                  disabled={profile.team_id !== null}
                >
                  <option value="">-- Chọn vị trí --</option>
                  <option value="PG">Point Guard (PG)</option>
                  <option value="SG">Shooting Guard (SG)</option>
                  <option value="SF">Small Forward (SF)</option>
                  <option value="PF">Power Forward (PF)</option>
                  <option value="C">Center (C)</option>
                </select>
                {profile.team_id !== null && (
                  <p className="text-xs text-orange-600 mt-1">
                    <FaShieldAlt className="inline mr-1" />
                    Không thể thay đổi vị trí khi đã gia nhập đội
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaRulerVertical className="inline mr-2 text-gray-500" />
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleChange}
                  step="0.1"
                  min="150"
                  max="250"
                  className="input-field"
                  placeholder="185.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaWeight className="inline mr-2 text-gray-500" />
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={profile.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="40"
                  max="150"
                  className="input-field"
                  placeholder="75.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBirthdayCake className="inline mr-2 text-gray-500" />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={profile.date_of_birth}
                  onChange={handleChange}
                  className="input-field"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Team Info Display */}
          {profile.team_name && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <FaUsers className="text-2xl text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Thông tin đội
                  </h3>
                  <div className="space-y-1">
                    <p className="text-blue-700">
                      <strong>Đội:</strong> {profile.team_name}
                    </p>
                    {profile.jersey_number && (
                      <p className="text-blue-700">
                        <FaTshirt className="inline mr-2" />
                        <strong>Số áo:</strong> #{profile.jersey_number}
                      </p>
                    )}
                    {profile.position && (
                      <p className="text-blue-700">
                        <FaRunning className="inline mr-2" />
                        <strong>Vị trí:</strong> {profile.position}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Info Display */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <FaShieldAlt className="mr-2" />
              Thông tin tài khoản
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Username:</span>
                <p className="font-medium text-gray-900 mt-1">
                  {user?.username}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <p className="mt-1">
                  <span className="badge badge-info">{user?.role}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <p className="text-sm text-gray-600">* Các trường bắt buộc</p>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2 px-6"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Join Requests History */}
      <div className="card mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaHistory className="mr-3 text-primary-600" />
            Lịch sử yêu cầu gia nhập
          </h2>
          {loadingRequests && (
            <FaSpinner className="animate-spin text-primary-600" />
          )}
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có yêu cầu gia nhập nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.request_id}
                className={`p-4 rounded-lg border-2 ${
                  request.status === "pending"
                    ? "border-orange-200 bg-orange-50"
                    : request.status === "approved"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaUsers
                        className={`text-xl ${
                          request.status === "pending"
                            ? "text-orange-600"
                            : request.status === "approved"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {request.team_name}
                        </h3>
                        {request.short_name && (
                          <p className="text-sm text-gray-600">
                            {request.short_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {request.message && (
                      <div className="mb-2 p-2 bg-white rounded">
                        <p className="text-sm text-gray-700 italic">
                          &quot;{request.message}&quot;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-500">
                      <FaClock className="mr-2" />
                      Gửi lúc:{" "}
                      {new Date(request.requested_at).toLocaleString("vi-VN")}
                    </div>

                    {request.processed_at && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FaCheckCircle className="mr-2" />
                        Xử lý lúc:{" "}
                        {new Date(request.processed_at).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    {request.status === "pending" ? (
                      <>
                        <span className="badge badge-warning">
                          <FaClock className="inline mr-1" />
                          Chờ duyệt
                        </span>
                        <button
                          onClick={() =>
                            handleCancelRequest(request.request_id)
                          }
                          className="text-xs text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FaTimesCircle className="mr-1" />
                          Hủy
                        </button>
                      </>
                    ) : request.status === "approved" ? (
                      <span className="badge badge-success">
                        <FaCheckCircle className="inline mr-1" />
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="badge badge-error">
                        <FaTimesCircle className="inline mr-1" />
                        Đã từ chối
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Requests Section */}
      {leaveRequests.length > 0 && (
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaSignOutAlt className="mr-3 text-red-600" />
              Yêu cầu rời đội
            </h2>
          </div>

          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div
                key={request.request_id}
                className={`p-4 rounded-lg border-2 ${
                  request.status === "pending"
                    ? "bg-orange-50 border-orange-300"
                    : request.status === "approved"
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaUsers
                        className={`text-xl ${
                          request.status === "pending"
                            ? "text-orange-600"
                            : request.status === "approved"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {request.team_name}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-2 p-3 bg-white rounded border">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Lý do rời đội:
                      </p>
                      <p className="text-sm text-gray-700 italic">
                        &quot;{request.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <FaClock className="mr-2" />
                      Gửi lúc:{" "}
                      {new Date(request.requested_at).toLocaleString("vi-VN")}
                    </div>

                    {request.processed_at && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FaCheckCircle className="mr-2" />
                        Xử lý lúc:{" "}
                        {new Date(request.processed_at).toLocaleString("vi-VN")}
                      </div>
                    )}

                    {request.processed_by_name && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <FaUserCircle className="mr-2" />
                        Xử lý bởi: {request.processed_by_name}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    {request.status === "pending" ? (
                      <>
                        <span className="badge badge-warning">
                          <FaClock className="inline mr-1" />
                          Chờ duyệt
                        </span>
                        <button
                          onClick={() =>
                            handleCancelLeaveRequest(request.request_id)
                          }
                          className="text-xs text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FaTimesCircle className="mr-1" />
                          Hủy
                        </button>
                      </>
                    ) : request.status === "approved" ? (
                      <span className="badge badge-success">
                        <FaCheckCircle className="inline mr-1" />
                        Đã chấp nhận
                      </span>
                    ) : (
                      <span className="badge badge-error">
                        <FaTimesCircle className="inline mr-1" />
                        Đã từ chối
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Team Button */}
      {profile.team_id && (
        <div className="card mt-8 bg-red-50 border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Yêu cầu rời khỏi đội
              </h3>
              <p className="text-sm text-red-700">
                Gửi yêu cầu rời đội đến coach. Yêu cầu cần được coach phê duyệt
                trước khi bạn có thể rời đội và tham gia đội khác.
              </p>
              {profile.team_player_count >= 12 && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ Đội đã đủ 12 thành viên. Không thể rời đội trong lúc này
                    để đảm bảo đội luôn đủ số lượng thành viên tham gia giải
                    đấu.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLeaveTeam}
              disabled={profile.team_player_count >= 12}
              className={`flex items-center space-x-2 ${
                profile.team_player_count >= 12
                  ? "btn-disabled opacity-50 cursor-not-allowed"
                  : "btn-error"
              }`}
            >
              <FaSignOutAlt />
              <span>Yêu cầu rời đội</span>
            </button>
          </div>
        </div>
      )}

      {/* Leave Team Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FaSignOutAlt className="mr-3 text-red-600" />
                Yêu cầu rời đội
              </h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>

            <div className="modal-body">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Yêu cầu của bạn cần được coach phê
                  duyệt. Vui lòng nêu rõ lý do để coach có thể xem xét.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do rời đội <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Ví dụ: Tôi muốn chuyển đến đội khác phù hợp hơn với lịch tập luyện của mình..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {leaveReason.length} / 500 ký tự
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="btn-secondary"
                disabled={submittingLeave}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitLeaveRequest}
                className="btn-primary bg-red-600 hover:bg-red-700"
                disabled={submittingLeave || !leaveReason.trim()}
              >
                {submittingLeave ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaSignOutAlt className="mr-2" />
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
