import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sponsorAPI } from "../../services/api";
import {
  FaUsers,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTrophy,
  FaCalendarAlt,
  FaClock,
  FaInfoCircle,
  FaUserTie,
  FaPhone,
  FaShieldAlt,
  FaExclamationTriangle,
  FaFilter,
  FaArrowLeft,
} from "react-icons/fa";

const ApproveTeamRegistrationsPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchTournamentInfo();
    fetchRegistrations();
  }, [tournamentId, filterStatus]);

  const fetchTournamentInfo = async () => {
    try {
      const response = await sponsorAPI.getTournamentDetail(tournamentId);
      if (response.data.success) {
        setTournamentInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tournament info:", error);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) {
        params.status = filterStatus;
      }
      const response = await sponsorAPI.getTeamRegistrations(
        tournamentId,
        params
      );
      if (response.data.success) {
        setRegistrations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching team registrations:", error);
      alert("Không thể tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registration) => {
    if (
      !window.confirm(
        `Xác nhận duyệt đội "${registration.team_name}" tham gia giải đấu?`
      )
    ) {
      return;
    }

    setProcessing(registration.tournament_team_id);
    try {
      const response = await sponsorAPI.approveTeamRegistration(
        registration.tournament_team_id,
        { status: "approved" }
      );

      if (response.data.success) {
        alert("Đã duyệt đội tham gia giải đấu!");
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error approving team:", error);
      alert(
        error.response?.data?.message || "Lỗi khi duyệt đội. Vui lòng thử lại."
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(selectedRegistration.tournament_team_id);
    try {
      const response = await sponsorAPI.approveTeamRegistration(
        selectedRegistration.tournament_team_id,
        {
          status: "rejected",
          rejection_reason: rejectionReason,
        }
      );

      if (response.data.success) {
        alert("Đã từ chối đội tham gia giải đấu!");
        setShowDetailModal(false);
        setRejectionReason("");
        setSelectedRegistration(null);
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error rejecting team:", error);
      alert(
        error.response?.data?.message ||
          "Lỗi khi từ chối đội. Vui lòng thử lại."
      );
    } finally {
      setProcessing(null);
    }
  };

  const openDetailModal = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
    setRejectionReason("");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: "Chờ duyệt",
        color: "bg-yellow-500",
        icon: <FaClock />,
      },
      approved: {
        label: "Đã duyệt",
        color: "bg-green-500",
        icon: <FaCheckCircle />,
      },
      rejected: {
        label: "Đã từ chối",
        color: "bg-red-500",
        icon: <FaTimesCircle />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/sponsor/tournaments")}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <FaArrowLeft /> Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
            <FaUsers className="text-blue-500" /> Duyệt Đội Tham Gia
          </h2>
          {tournamentInfo && (
            <div className="text-gray-600">
              <p className="text-xl font-semibold flex items-center gap-2">
                <FaTrophy className="text-yellow-500" />
                {tournamentInfo.tournament_name}
              </p>
              <p className="text-sm mt-1">
                Số đội hiện tại: {tournamentInfo.current_teams}/
                {tournamentInfo.max_teams}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <FaFilter className="text-gray-600" />
          <label className="font-medium text-gray-700">
            Lọc theo trạng thái:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaInfoCircle className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Không có đăng ký nào
          </h3>
          <p className="text-gray-600">
            {filterStatus === "pending"
              ? "Chưa có đội nào gửi yêu cầu đăng ký"
              : `Không có đăng ký nào ở trạng thái "${filterStatus}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div
              key={registration.tournament_team_id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Team Name & Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {registration.team_name}
                    </h3>
                    {getStatusBadge(registration.status)}
                  </div>

                  {/* Team Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaUserTie className="text-blue-500" />
                      <span>
                        <strong>HLV:</strong> {registration.coach_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-green-500" />
                      <span>
                        <strong>Số thành viên:</strong>{" "}
                        {registration.member_count}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-orange-500" />
                      <span>
                        <strong>SĐT:</strong> {registration.coach_phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-500" />
                      <span>
                        <strong>Đăng ký lúc:</strong>{" "}
                        {new Date(
                          registration.registration_date
                        ).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {registration.status === "rejected" &&
                    registration.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Lý do từ chối:</strong>{" "}
                          {registration.rejection_reason}
                        </p>
                      </div>
                    )}

                  {/* Approved Info */}
                  {registration.status === "approved" &&
                    registration.approved_at && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <FaCheckCircle className="inline mr-2" />
                          Đã duyệt lúc:{" "}
                          {new Date(registration.approved_at).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    )}
                </div>

                {/* Actions */}
                {registration.status === "pending" && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(registration)}
                      disabled={processing === registration.tournament_team_id}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processing === registration.tournament_team_id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheckCircle />
                      )}
                      Duyệt
                    </button>
                    <button
                      onClick={() => openDetailModal(registration)}
                      disabled={processing === registration.tournament_team_id}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FaTimesCircle />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              Từ chối đội tham gia
            </h3>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Đội: <strong>{selectedRegistration.team_name}</strong>
              </p>
              <p className="text-gray-700 mb-2">
                HLV: <strong>{selectedRegistration.coach_name}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={
                  processing === selectedRegistration.tournament_team_id
                }
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing === selectedRegistration.tournament_team_id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTimesCircle />
                )}
                Xác nhận từ chối
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setRejectionReason("");
                  setSelectedRegistration(null);
                }}
                disabled={
                  processing === selectedRegistration.tournament_team_id
                }
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveTeamRegistrationsPage;
