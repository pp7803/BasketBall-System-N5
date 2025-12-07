import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { coachAPI } from "../../services/api";
import {
  FaUsers,
  FaSave,
  FaTimes,
  FaImage,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaWallet,
  FaEdit,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const isEditMode = !!teamId;
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [teamStatus, setTeamStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    team_name: "",
    short_name: "",
    logo_url: "",
    entry_fee: 0,
  });

  // Load team data if editing
  useEffect(() => {
    if (isEditMode && teamId) {
      loadTeamData();
    }
  }, [teamId, isEditMode]);

  const loadTeamData = async () => {
    setLoadingTeam(true);
    try {
      const response = await coachAPI.getTeamDetail(teamId);
      if (response.data.success) {
        const team = response.data.data.team;
        setFormData({
          team_name: team.team_name || "",
          short_name: team.short_name || "",
          logo_url: team.logo_url || "",
          entry_fee: team.entry_fee || 0,
        });
        setTeamStatus(team.status);
        setRejectionReason(team.rejection_reason || "");
      }
    } catch (error) {
      console.error("Load team error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Không thể tải thông tin đội",
      });
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await coachAPI.createTeam(formData);

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Tạo đội bóng thành công! Đội đang chờ admin duyệt. Lệ phí 500.000 VND sẽ được trừ khi admin duyệt.",
        });

        // Redirect to manage teams page after 2s
        setTimeout(() => {
          navigate("/coach/teams");
        }, 2000);
      }
    } catch (error) {
      console.error("Create team error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Có lỗi xảy ra khi tạo đội",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await coachAPI.updateTeam(teamId, formData);

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Cập nhật thông tin đội thành công!",
        });

        // Reload team data to get updated status
        await loadTeamData();
      }
    } catch (error) {
      console.error("Update team error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật đội",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi lại yêu cầu duyệt đội?")) {
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await coachAPI.resubmitTeam(teamId);

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Đã gửi lại yêu cầu duyệt đội thành công! Lệ phí 500.000 VND sẽ được trừ khi admin duyệt.",
        });

        // Reload team data
        await loadTeamData();
      }
    } catch (error) {
      console.error("Resubmit team error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Có lỗi xảy ra khi gửi lại yêu cầu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/coach/teams");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-full">
            <FaUsers className="text-4xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa đội bóng" : "Tạo đội bóng mới"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Cập nhật thông tin đội bóng của bạn"
                : "Điền thông tin để tạo đội bóng của bạn"}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Lưu ý khi tạo đội:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Tên đội phải là duy nhất trong hệ thống</li>
              <li>Bạn sẽ tự động được gán làm huấn luyện viên của đội</li>
              <li>
                Sau khi tạo đội, bạn có thể quản lý cầu thủ và duyệt yêu cầu gia
                nhập
              </li>
              <li>Bạn có thể cập nhật thông tin đội sau khi tạo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Status Notice for Rejected Teams */}
      {isEditMode && teamStatus === "rejected" && (
        <div className="card bg-red-50 border-red-200 mb-6">
          <div className="flex items-start space-x-3">
            <FaExclamationCircle className="text-red-600 text-xl mt-1 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">❌ Đội bị từ chối:</p>
              {rejectionReason && (
                <p className="text-red-700 mb-2">
                  <strong>Lý do:</strong> {rejectionReason}
                </p>
              )}
              <p className="text-red-600 text-xs">
                Bạn có thể chỉnh sửa thông tin đội và gửi lại yêu cầu duyệt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Fee Notice */}
      {(!isEditMode || teamStatus === "rejected") && (
        <div className="card bg-orange-50 border-orange-200 mb-6">
          <div className="flex items-start space-x-3">
            <FaWallet className="text-orange-600 text-xl mt-1 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">💼 Lệ phí tạo đội:</p>
              <p className="text-orange-700 mb-2">
                <strong>500.000 VND</strong> - Phí này sẽ được trừ khi{" "}
                <strong>admin duyệt</strong> đội của bạn.
              </p>
              <p className="text-orange-600 text-xs">
                ⚠️ Vui lòng đảm bảo số dư tài khoản của bạn đủ 500.000 VND.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message.text && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-error"
          } mb-6`}
        >
          {message.type === "success" ? (
            <FaCheckCircle className="flex-shrink-0" />
          ) : (
            <FaExclamationCircle className="flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Loading State */}
      {loadingTeam && (
        <div className="card max-w-2xl mx-auto text-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đội...</p>
        </div>
      )}

      {/* Form */}
      {!loadingTeam && (
        <div className="card max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUsers className="mr-2 text-primary-600" />
                Thông tin đội
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đội <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="VD: Saigon Heat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên viết tắt
                  </label>
                  <input
                    type="text"
                    name="short_name"
                    value={formData.short_name}
                    onChange={handleChange}
                    maxLength="10"
                    className="input-field"
                    placeholder="VD: SGH"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImage className="inline mr-2 text-gray-400" />
                    URL Logo
                  </label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Tùy chọn: Link đến logo đội của bạn
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaWallet className="inline mr-2 text-green-600" />
                    Lệ phí gia nhập (VND)
                  </label>
                  <input
                    type="number"
                    name="entry_fee"
                    value={formData.entry_fee}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Số tiền cầu thủ phải trả để gia nhập đội. Để 0 nếu miễn phí.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                disabled={loading || submitting}
              >
                <FaTimes />
                <span>Hủy</span>
              </button>
              {isEditMode && teamStatus === "rejected" && (
                <button
                  type="button"
                  onClick={handleResubmit}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors font-medium"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Gửi lại yêu cầu</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 btn-primary flex items-center justify-center space-x-2 ${
                  isEditMode && teamStatus === "rejected" ? "flex-1" : "flex-1"
                }`}
                disabled={loading || submitting}
              >
                {loading || submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>
                      {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                    </span>
                  </>
                ) : (
                  <>
                    {isEditMode ? <FaEdit /> : <FaSave />}
                    <span>{isEditMode ? "Cập nhật" : "Tạo đội"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateTeamPage;
