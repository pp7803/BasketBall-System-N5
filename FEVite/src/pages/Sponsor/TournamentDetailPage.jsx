import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const { sponsor: sponsorAPI } = api;
import { format } from "date-fns";
import {
  FaTrophy,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaMedal,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaWallet,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClock,
  FaClipboardList,
  FaCalendarCheck,
  FaTimes,
} from "react-icons/fa";

const TournamentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // "info" or "leave-requests"
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  const [processingLeave, setProcessingLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [showLeaveDetailModal, setShowLeaveDetailModal] = useState(false);

  // Financial state
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [financialTransactions, setFinancialTransactions] = useState([]);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  // Team financial state
  const [showTeamFinancialModal, setShowTeamFinancialModal] = useState(false);
  const [teamFinancialData, setTeamFinancialData] = useState([]);
  const [loadingTeamFinancial, setLoadingTeamFinancial] = useState(false);

  // Helper function to format number with dots
  const formatMoney = (amount) => {
    if (!amount && amount !== 0) return "0";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse formatted money string to number (remove dots)
  const parseMoney = (value) => {
    if (!value) return 0;
    // Remove all dots and parse to number
    const cleaned = value.toString().replace(/\./g, "");
    return parseInt(cleaned) || 0;
  };

  // Format money input value (for display in input)
  const formatMoneyInput = (value) => {
    if (!value && value !== 0) return "";
    const numValue = typeof value === "string" ? parseMoney(value) : value;
    return formatMoney(numValue);
  };

  useEffect(() => {
    fetchTournamentDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === "leave-requests" && tournament) {
      fetchLeaveRequests();
    }
  }, [activeTab, tournament]);

  // Reset prize_9th_to_16th when switching from 16 to 8 teams
  useEffect(() => {
    if (
      isEditing &&
      formData.max_teams === 8 &&
      formData.prize_9th_to_16th > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        prize_9th_to_16th: 0,
      }));
    }
  }, [formData.max_teams, isEditing]);

  const fetchTournamentDetail = async () => {
    try {
      const response = await sponsorAPI.getTournamentDetail(id);
      if (response.data.success) {
        const data = response.data.data;
        setTournament(data);

        // Set pending request status
        if (data.has_pending_request) {
          setHasPendingRequest(true);
          setPendingRequestId(data.pending_request_id);
        } else {
          setHasPendingRequest(false);
          setPendingRequestId(null);
        }

        // Format dates to YYYY-MM-DD for input[type="date"]
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        setFormData({
          tournament_name: data.tournament_name,
          description: data.description || "",
          start_date: formatDateForInput(data.start_date),
          end_date: formatDateForInput(data.end_date),
          registration_deadline: formatDateForInput(data.registration_deadline),
          max_teams: data.max_teams,
          entry_fee: data.entry_fee || 0,
          total_prize_money: data.total_prize_money,
          prize_1st: data.prize_1st,
          prize_2nd: data.prize_2nd,
          prize_3rd: data.prize_3rd,
          prize_4th: data.prize_4th || 0,
          prize_5th_to_8th: data.prize_5th_to_8th || 0,
          prize_9th_to_16th: data.prize_9th_to_16th || 0,
          update_count: data.update_count || 0,
        });
      }
    } catch (err) {
      console.error("Fetch tournament detail error:", err);
      setError("Lỗi khi tải chi tiết giải đấu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Money fields that need formatting
    const moneyFields = [
      "total_prize_money",
      "prize_1st",
      "prize_2nd",
      "prize_3rd",
      "prize_4th",
      "prize_5th_to_8th",
      "prize_9th_to_16th",
      "entry_fee",
    ];

    if (moneyFields.includes(name)) {
      // For money fields: store as number, but allow formatted input
      const parsedValue = parseMoney(value);
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    } else if (type === "number") {
      const newValue = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else if (name === "max_teams") {
      // Parse max_teams to number for proper comparison
      const newValue = parseInt(value) || 8;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Quick percentage presets for edit mode
  const applyQuickPercent = (
    percent1st,
    percent2nd,
    percent3rd,
    percent4th,
    percent5thTo8th,
    percent9thTo16th = 0
  ) => {
    const total = formData.total_prize_money;
    if (total <= 0) {
      alert("Vui lòng nhập tổng quỹ giải thưởng trước!");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      prize_1st: Math.floor((total * percent1st) / 100),
      prize_2nd: Math.floor((total * percent2nd) / 100),
      prize_3rd: Math.floor((total * percent3rd) / 100),
      prize_4th: Math.floor((total * percent4th) / 100),
      prize_5th_to_8th: Math.floor((total * percent5thTo8th) / 100 / 4), // Tổng % chia 4 đội
      prize_9th_to_16th:
        formData.max_teams === 16
          ? Math.floor((total * percent9thTo16th) / 100 / 8)
          : 0, // Tổng % chia 8 đội (chỉ cho 16 đội)
    }));
  };

  // Calculate current percentages
  const getPercentages = () => {
    const total = formData.total_prize_money;
    if (total <= 0) return { p1: 0, p2: 0, p3: 0, p4: 0, p5to8: 0, p9to16: 0 };

    return {
      p1: ((formData.prize_1st / total) * 100).toFixed(1),
      p2: ((formData.prize_2nd / total) * 100).toFixed(1),
      p3: ((formData.prize_3rd / total) * 100).toFixed(1),
      p4: ((formData.prize_4th / total) * 100).toFixed(1),
      p5to8: (((formData.prize_5th_to_8th * 4) / total) * 100).toFixed(1),
      p9to16:
        formData.max_teams === 16
          ? (((formData.prize_9th_to_16th * 8) / total) * 100).toFixed(1)
          : 0,
    };
  };

  const percentages = getPercentages();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await sponsorAPI.updateTournament(id, formData);

      if (response.data.success) {
        // Check if tournament is draft (direct update) or approved (request sent)
        const isDraft = tournament.status === "draft";
        let successMessage = "";

        if (isDraft) {
          // Direct update - no admin approval needed
          successMessage = "Cập nhật giải đấu thành công!";
        } else {
          // Request sent - waiting for admin approval
          const adminFeeDiff = response.data.data?.admin_fee_diff || 0;
          successMessage =
            "Yêu cầu cập nhật giải đấu đã được gửi và đang chờ admin duyệt!";

          if (adminFeeDiff !== 0) {
            if (adminFeeDiff > 0) {
              successMessage += `\n\nLệ phí admin bổ sung ${Math.abs(
                adminFeeDiff
              ).toLocaleString("vi-VN")} VND sẽ được trừ khi admin duyệt.`;
            } else {
              successMessage += `\n\nLệ phí admin ${Math.abs(
                adminFeeDiff
              ).toLocaleString("vi-VN")} VND sẽ được hoàn trả khi admin duyệt.`;
            }
          }
        }

        alert(successMessage);
        setIsEditing(false);
        fetchTournamentDetail();
      }
    } catch (err) {
      console.error("Update tournament error:", err);
      const errorMessage =
        err.response?.data?.message || "Lỗi khi cập nhật giải đấu";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if tournament can be edited
  const canEditTournament = () => {
    if (!tournament) return false;

    // If tournament is draft, can edit freely
    if (tournament.status === "draft") {
      return true;
    }

    // For approved tournaments, check restrictions
    // Check update_count (only 1 update allowed)
    if (tournament.update_count >= 1) {
      return false;
    }

    // Check days before deadline (must be at least 7 days)
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

    if (daysBeforeDeadline < 7) {
      return false;
    }

    return true;
  };

  const getEditRestrictionMessage = () => {
    if (!tournament) return "";

    // If tournament is draft, no restrictions
    if (tournament.status === "draft") {
      return "";
    }

    const restrictions = [];

    if (tournament.update_count >= 1) {
      restrictions.push("Đã sửa 1 lần (chỉ được sửa 1 lần)");
    }

    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

    if (daysBeforeDeadline < 7) {
      restrictions.push(
        `Còn ${Math.floor(
          daysBeforeDeadline
        )} ngày trước hạn đăng ký (cần ít nhất 7 ngày)`
      );
    }

    return restrictions.join(", ");
  };

  const canDeleteTournament = () => {
    if (!tournament) return false;
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
    return daysBeforeDeadline >= 7;
  };

  const getDeleteRestrictionMessage = () => {
    if (!tournament) return "";
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
    if (daysBeforeDeadline < 7) {
      return `Không thể xóa. Còn ${Math.floor(
        daysBeforeDeadline
      )} ngày trước hạn đăng ký (cần ít nhất 7 ngày)`;
    }
    return "Xóa giải đấu";
  };

  // Financial functions
  const fetchTournamentFinancials = async (tournamentId) => {
    try {
      setLoadingFinancial(true);
      const response = await sponsorAPI.getTournamentFinancials(tournamentId);
      setFinancialTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      setFinancialTransactions([]);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const handleViewFinancials = () => {
    fetchTournamentFinancials(tournament.tournament_id);
    setShowFinancialModal(true);
  };

  // Team financial functions
  const fetchTeamFinancials = async (tournamentId) => {
    try {
      setLoadingTeamFinancial(true);
      // Get all teams in the tournament first
      const teamsResponse = await sponsorAPI.getTournamentTeams(tournamentId);
      const teams = teamsResponse.data.teams || [];
      
      // Fetch financial data for each team
      const teamFinancialPromises = teams.map(async (team) => {
        try {
          const response = await api.coach.getTeamFinancials(team.team_id);
          return {
            team_id: team.team_id,
            team_name: team.team_name,
            transactions: response.data.data || []
          };
        } catch (error) {
          console.error(`Error fetching financials for team ${team.team_id}:`, error);
          return {
            team_id: team.team_id,
            team_name: team.team_name,
            transactions: []
          };
        }
      });

      const results = await Promise.all(teamFinancialPromises);
      setTeamFinancialData(results);
    } catch (error) {
      console.error("Error fetching team financial data:", error);
      setTeamFinancialData([]);
    } finally {
      setLoadingTeamFinancial(false);
    }
  };

  const handleViewTeamFinancials = () => {
    fetchTeamFinancials(tournament.tournament_id);
    setShowTeamFinancialModal(true);
  };

  const handleDelete = async () => {
    // Check if deletion is allowed (must be at least 7 days before registration deadline)
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    const daysBeforeDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

    if (daysBeforeDeadline < 7) {
      alert(
        `Không thể xóa giải đấu. Còn ${Math.floor(
          daysBeforeDeadline
        )} ngày trước hạn đăng ký. Chỉ có thể xóa giải đấu trước ít nhất 7 ngày so với hạn đăng ký.`
      );
      return;
    }

    // Check if there are approved teams that need refund
    const hasApprovedTeams = tournament.current_teams > 0;
    const entryFee = tournament.entry_fee || 0;
    const totalRefund = entryFee * tournament.current_teams;

    let confirmMessage = `Bạn có chắc chắn muốn xóa giải đấu "${tournament.tournament_name}"?`;

    if (hasApprovedTeams && entryFee > 0) {
      confirmMessage += `\n\n⚠️ CẢNH BÁO:\n- Giải đấu có ${
        tournament.current_teams
      } đội đã được duyệt\n- Bạn cần hoàn lại lệ phí ${totalRefund.toLocaleString(
        "vi-VN"
      )} VND cho các đội\n- Nếu không đủ tiền, không thể xóa giải đấu`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await sponsorAPI.deleteTournament(id);

      if (response.data.success) {
        const refundInfo =
          hasApprovedTeams && entryFee > 0
            ? `\n\nĐã hoàn lại ${totalRefund.toLocaleString("vi-VN")} VND cho ${
                tournament.current_teams
              } đội.`
            : "";
        alert(`Xóa giải đấu thành công!${refundInfo}`);
        navigate("/sponsor/tournaments");
      }
    } catch (err) {
      console.error("Delete tournament error:", err);
      alert(err.response?.data?.message || "Lỗi khi xóa giải đấu");
    }
  };

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    setLoadingLeaveRequests(true);
    try {
      const response = await sponsorAPI.getTournamentLeaveRequests(id);
      if (response.data.success) {
        setLeaveRequests(response.data.data || []);
      }
    } catch (err) {
      console.error("Fetch leave requests error:", err);
      alert("Lỗi khi tải yêu cầu rời giải");
    } finally {
      setLoadingLeaveRequests(false);
    }
  };

  // Process leave request (approve/reject)
  const handleProcessLeaveRequest = async (requestId, status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    const confirmMessage =
      status === "approved"
        ? "Bạn có chắc muốn chấp nhận yêu cầu rời giải này?\n\nLưu ý: Lệ phí đăng ký KHÔNG được hoàn trả."
        : `Bạn có chắc muốn từ chối yêu cầu rời giải này?\n\nLý do: ${rejectionReason}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setProcessingLeave(requestId);
    try {
      const response = await sponsorAPI.processTournamentLeaveRequest(
        requestId,
        {
          status,
          rejection_reason: status === "rejected" ? rejectionReason : null,
        }
      );

      if (response.data.success) {
        alert(
          `Đã ${
            status === "approved" ? "chấp nhận" : "từ chối"
          } yêu cầu rời giải thành công!`
        );
        setShowLeaveDetailModal(false);
        setRejectionReason("");
        setSelectedLeaveRequest(null);
        await fetchLeaveRequests();
        await fetchTournamentDetail(); // Refresh tournament info
      }
    } catch (err) {
      console.error("Process leave request error:", err);
      alert(err.response?.data?.message || "Lỗi khi xử lý yêu cầu rời giải");
    } finally {
      setProcessingLeave(null);
    }
  };

  const getStatusBadge = (tournament) => {
    const now = new Date();
    const regDeadline = new Date(tournament.registration_deadline);
    const startDate = new Date(tournament.start_date);
    const endDate = new Date(tournament.end_date);

    let label = "";
    let color = "";

    if (tournament.status === "draft") {
      label = "Chờ duyệt";
      color = "bg-gray-500";
    } else if (tournament.status === "postponed") {
      label = "Hoãn";
      color = "bg-yellow-500";
    } else if (now > endDate) {
      // Sau ngày kết thúc
      label = "Đã kết thúc";
      color = "bg-gray-400";
    } else if (now >= startDate && now <= endDate) {
      // Trong khoảng thời gian giải diễn ra
      label = "Đang diễn ra";
      color = "bg-green-500";
    } else if (now > regDeadline && now < startDate) {
      // Qua hạn đăng ký nhưng chưa đến ngày bắt đầu
      label = "Hết hạn đăng ký";
      color = "bg-orange-500";
    } else if (tournament.status === "registration") {
      // Mặc định đang mở đăng ký
      label = "Đang mở đăng ký";
      color = "bg-blue-500";
    } else if (tournament.status === "ongoing") {
      label = "Đang diễn ra";
      color = "bg-green-500";
    } else if (tournament.status === "completed") {
      label = "Đã kết thúc";
      color = "bg-gray-400";
    } else {
      label = "Không xác định";
      color = "bg-gray-500";
    }

    return (
      <span
        className={`${color} text-white text-sm px-4 py-2 rounded-full font-medium`}
      >
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Không tìm thấy giải đấu</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate("/sponsor/tournaments")}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
          >
            <FaArrowLeft /> Quay lại
          </button>
          <h2 className="text-3xl font-bold text-gray-800">
            {isEditing ? "Chỉnh sửa giải đấu" : "Chi tiết giải đấu"}
          </h2>
        </div>
        <div className="flex gap-3">
          {!isEditing && (
            <>
              {/* Duyệt đội đăng ký - Chỉ hiển thị khi giải đấu đang mở đăng ký hoặc đang diễn ra */}
              {(tournament?.status === "registration" ||
                tournament?.status === "ongoing") && (
                <button
                  onClick={() =>
                    navigate(
                      `/sponsor/tournaments/${tournament?.tournament_id}/team-registrations`
                    )
                  }
                  className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                  title="Duyệt đội đăng ký tham gia giải đấu"
                >
                  <FaClipboardList /> Duyệt Đội Đăng Ký
                </button>
              )}
              {/* Yêu cầu rời giải - Chỉ hiển thị khi giải đấu đang mở đăng ký hoặc đang diễn ra */}
              {(tournament?.status === "registration" ||
                tournament?.status === "ongoing") && (
                <button
                  onClick={() => setActiveTab("leave-requests")}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 relative ${
                    activeTab === "leave-requests"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                  title="Xem yêu cầu rời giải"
                >
                  <FaSignOutAlt /> Yêu Cầu Rời Giải
                  {leaveRequests.filter((r) => r.status === "pending").length >
                    0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {
                        leaveRequests.filter((r) => r.status === "pending")
                          .length
                      }
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={handleViewFinancials}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                title="Xem các giao dịch tài chính liên quan đến giải đấu này"
              >
                <FaWallet /> Chi tiêu Giải
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={!canEditTournament()}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  !canEditTournament()
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                title={
                  !canEditTournament()
                    ? getEditRestrictionMessage()
                    : "Chỉnh sửa giải đấu"
                }
              >
                <FaEdit /> Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDeleteTournament()}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  !canDeleteTournament()
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={getDeleteRestrictionMessage()}
              >
                <FaTrash /> Xóa
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Info: Draft tournament can be edited freely */}
      {!isEditing && tournament.status === "draft" && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 text-xl mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-semibold">
                ℹ️ Giải đấu chưa được duyệt
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Bạn có thể chỉnh sửa giải đấu tự do mà không cần admin duyệt và
                không bị tính phí.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning: Cannot update when restrictions apply (for approved tournaments) */}
      {!isEditing && tournament.status !== "draft" && !canEditTournament() && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-500 text-xl mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️ Không thể cập nhật giải đấu
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {getEditRestrictionMessage()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info: Approved tournament needs admin approval */}
      {!isEditing && tournament.status !== "draft" && canEditTournament() && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
          <div className="flex items-start">
            <FaInfoCircle className="text-orange-500 text-xl mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-orange-800 font-semibold">
                ℹ️ Giải đấu đã được duyệt
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Yêu cầu cập nhật sẽ được gửi cho admin duyệt. Nếu thay đổi tổng
                giải thưởng, lệ phí tạo giải chênh lệch sẽ được tính khi admin
                duyệt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Chỉ hiển thị tab "Thông tin giải đấu" vì "Yêu cầu rời giải" đã chuyển lên header */}
      {!isEditing && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "info"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaTrophy className="inline mr-2" />
              Thông tin giải đấu
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {isEditing ? (
        // EDIT MODE
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-lg shadow-md p-8 space-y-6"
        >
          {/* Thông tin cơ bản */}
          <div className="border-b pb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Thông tin cơ bản
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên giải đấu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tournament_name"
                  value={formData.tournament_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số đội tối đa <span className="text-red-500">*</span>
                </label>
                <select
                  name="max_teams"
                  value={formData.max_teams}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={8}>8 đội</option>
                  <option value={16}>16 đội</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaWallet className="text-green-600" />
                  Lệ phí đăng ký (VND)
                </label>
                <input
                  type="text"
                  name="entry_fee"
                  value={formatMoneyInput(formData.entry_fee)}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.entry_fee > 0
                    ? `${formatMoney(
                        formData.entry_fee
                      )} VND - Mỗi đội phải trả khi đăng ký`
                    : "Để 0 nếu miễn phí"}
                </p>
              </div>
            </div>
          </div>

          {/* Thời gian */}
          <div className="border-b pb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Thời gian tổ chức
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hạn đăng ký <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Giải thưởng */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <FaDollarSign className="text-green-600" /> Giải thưởng
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng quỹ giải thưởng (VND)
                </label>
                <input
                  type="text"
                  name="total_prize_money"
                  value={formatMoneyInput(formData.total_prize_money)}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Quick Percentage Buttons */}
              {formData.total_prize_money > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    ⚡ Tính nhanh theo phần trăm:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.max_teams === 8 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => applyQuickPercent(40, 30, 20, 8, 2)}
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 40% | Giải 2: 30% | Giải 3: 20% | Giải 4: 8% | Giải 5-8: 2% (0.5%/đội)"
                        >
                          40-30-20-8-2%
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickPercent(35, 30, 25, 8, 2)}
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 35% | Giải 2: 30% | Giải 3: 25% | Giải 4: 8% | Giải 5-8: 2% (0.5%/đội)"
                        >
                          35-30-25-8-2%
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickPercent(45, 25, 20, 8, 2)}
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 45% | Giải 2: 25% | Giải 3: 20% | Giải 4: 8% | Giải 5-8: 2% (0.5%/đội)"
                        >
                          45-25-20-8-2%
                        </button>
                        <button
                          type="button"
                          onClick={() => applyQuickPercent(50, 25, 15, 8, 2)}
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 50% | Giải 2: 25% | Giải 3: 15% | Giải 4: 8% | Giải 5-8: 2% (0.5%/đội)"
                        >
                          50-25-15-8-2%
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            applyQuickPercent(35, 25, 20, 10, 5, 5)
                          }
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 35% | Giải 2: 25% | Giải 3: 20% | Giải 4: 10% | Giải 5-8: 5% (1.25%/đội) | Giải 9-16: 5% (0.625%/đội)"
                        >
                          35-25-20-10-5-5%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyQuickPercent(30, 25, 20, 15, 5, 5)
                          }
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 30% | Giải 2: 25% | Giải 3: 20% | Giải 4: 15% | Giải 5-8: 5% (1.25%/đội) | Giải 9-16: 5% (0.625%/đội)"
                        >
                          30-25-20-15-5-5%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyQuickPercent(40, 25, 15, 10, 5, 5)
                          }
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 40% | Giải 2: 25% | Giải 3: 15% | Giải 4: 10% | Giải 5-8: 5% (1.25%/đội) | Giải 9-16: 5% (0.625%/đội)"
                        >
                          40-25-15-10-5-5%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyQuickPercent(32, 24, 18, 12, 7, 7)
                          }
                          className="bg-white border border-blue-300 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          title="Giải 1: 32% | Giải 2: 24% | Giải 3: 18% | Giải 4: 12% | Giải 5-8: 7% (1.75%/đội) | Giải 9-16: 7% (0.875%/đội)"
                        >
                          32-24-18-12-7-7%
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.max_teams === 8
                      ? "Thứ tự: Giải 1 - Giải 2 - Giải 3 - Giải 4 - Giải 5-8 (4 đội, mỗi đội)"
                      : "Thứ tự: Giải 1 - Giải 2 - Giải 3 - Giải 4 - Giải 5-8 (4 đội, mỗi đội) - Giải 9-16 (8 đội, mỗi đội)"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMedal className="text-yellow-500" /> Giải Nhất (VND)
                    {formData.total_prize_money > 0 && (
                      <span className="text-xs text-gray-500">
                        ({percentages.p1}%)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="prize_1st"
                    value={formatMoneyInput(formData.prize_1st)}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMedal className="text-gray-400" /> Giải Nhì (VND)
                    {formData.total_prize_money > 0 && (
                      <span className="text-xs text-gray-500">
                        ({percentages.p2}%)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="prize_2nd"
                    value={formatMoneyInput(formData.prize_2nd)}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMedal className="text-orange-600" /> Giải Ba (VND)
                    {formData.total_prize_money > 0 && (
                      <span className="text-xs text-gray-500">
                        ({percentages.p3}%)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="prize_3rd"
                    value={formatMoneyInput(formData.prize_3rd)}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMedal className="text-purple-500" /> Giải Tư (VND)
                    {formData.total_prize_money > 0 && (
                      <span className="text-xs text-gray-500">
                        ({percentages.p4}%)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="prize_4th"
                    value={formatMoneyInput(formData.prize_4th)}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMedal className="text-blue-500" /> Giải 5-8 (VND/đội)
                    {formData.total_prize_money > 0 && (
                      <span className="text-xs text-gray-500">
                        ({percentages.p5to8}% tổng)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="prize_5th_to_8th"
                    value={formatMoneyInput(formData.prize_5th_to_8th)}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Mỗi đội từ hạng 5-8 sẽ nhận{" "}
                    {formatMoney(formData.prize_5th_to_8th)} VND
                  </p>
                </div>

                {/* Giải 9-16 - Chỉ hiển thị khi chọn 16 đội */}
                {formData.max_teams === 16 && (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMedal className="text-green-500" />
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        Giải 9-16 (VND/đội)
                        {formData.total_prize_money > 0 && (
                          <span className="text-xs text-gray-500">
                            ({percentages.p9to16}% tổng)
                          </span>
                        )}
                      </label>
                    </div>
                    <input
                      type="text"
                      name="prize_9th_to_16th"
                      value={formatMoneyInput(formData.prize_9th_to_16th)}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      placeholder="0"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Mỗi đội từ hạng 9-16 sẽ nhận{" "}
                      <span className="font-semibold text-green-700">
                        {formatMoney(formData.prize_9th_to_16th)} VND
                      </span>
                    </p>
                    <p className="text-xs text-green-700 mt-1 font-medium">
                      💡 Tổng cho 8 đội:{" "}
                      {formatMoney(formData.prize_9th_to_16th * 8)} VND
                    </p>
                  </div>
                )}
              </div>

              {/* Admin Fee - 1% of total prize money */}
              {formData.total_prize_money > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-orange-900">
                        💼 Lệ phí tạo giải (1% tổng giải thưởng):
                      </span>
                      <p className="text-xs text-orange-700 mt-1">
                        {tournament.status === "draft"
                          ? "⏳ Phí sẽ được trừ khi admin duyệt giải"
                          : "✅ Phí đã được trừ khi admin duyệt giải"}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-orange-600">
                      {formatMoney(
                        Math.floor(formData.total_prize_money * 0.01)
                      )}{" "}
                      VND
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError("");
              }}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      ) : activeTab === "leave-requests" ? (
        // LEAVE REQUESTS TAB
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaSignOutAlt className="text-blue-600" />
              Yêu cầu rời giải đấu
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý các yêu cầu rời giải của các đội bóng
            </p>
          </div>

          <div className="p-6">
            {loadingLeaveRequests ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-12">
                <FaSignOutAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Chưa có yêu cầu rời giải
                </h4>
                <p className="text-gray-500">
                  Tất cả các đội đều đang tham gia giải đấu
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div
                    key={request.request_id}
                    className={`border rounded-lg p-4 ${
                      request.status === "pending"
                        ? "border-orange-300 bg-orange-50"
                        : request.status === "approved"
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {request.team_name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          HLV: {request.coach_name}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Lý do:</strong> {request.reason}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {request.status === "pending" && (
                          <span className="badge badge-warning">
                            <FaClock className="inline mr-1" />
                            Chờ xử lý
                          </span>
                        )}
                        {request.status === "approved" && (
                          <span className="badge badge-success">
                            <FaCheckCircle className="inline mr-1" />
                            Đã chấp nhận
                          </span>
                        )}
                        {request.status === "rejected" && (
                          <span className="badge badge-error">
                            <FaTimesCircle className="inline mr-1" />
                            Đã từ chối
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {format(
                            new Date(request.requested_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setSelectedLeaveRequest(request);
                            setRejectionReason("");
                            setShowLeaveDetailModal(true);
                          }}
                          className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                          <FaInfoCircle />
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() =>
                            handleProcessLeaveRequest(
                              request.request_id,
                              "approved"
                            )
                          }
                          disabled={processingLeave === request.request_id}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          {processingLeave === request.request_id ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle />
                              Chấp nhận
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {request.status === "rejected" &&
                      request.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-100 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Lý do từ chối:</strong>{" "}
                            {request.rejection_reason}
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // VIEW MODE - INFO TAB
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-2">
                  {tournament.tournament_name}
                </h3>
                <p className="text-blue-100">
                  {tournament.description || "Chưa có mô tả"}
                </p>
              </div>
              {getStatusBadge(tournament)}
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaCalendarAlt /> Thời gian
                </h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Hạn đăng ký:</span>
                    <span>
                      {format(
                        new Date(tournament.registration_deadline),
                        "dd/MM/yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Bắt đầu:</span>
                    <span>
                      {format(new Date(tournament.start_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Kết thúc:</span>
                    <span>
                      {format(new Date(tournament.end_date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaUsers /> Đội tham gia
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {tournament.current_teams}/{tournament.max_teams}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Đội đã đăng ký
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaWallet /> Lệ phí đăng ký
                </h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {tournament.entry_fee > 0
                        ? formatMoney(tournament.entry_fee)
                        : "Miễn phí"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {tournament.entry_fee > 0 ? "VND/đội" : "Không thu phí"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Giải thưởng */}
            {tournament.total_prize_money > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaDollarSign /> Cơ cấu giải thưởng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tournament.prize_1st > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold flex items-center gap-2">
                          <FaMedal className="text-yellow-500" /> Giải Nhất
                        </span>
                        <span className="text-xl font-bold text-yellow-600">
                          {formatMoney(tournament.prize_1st)} VND
                        </span>
                      </div>
                    </div>
                  )}
                  {tournament.prize_2nd > 0 && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold flex items-center gap-2">
                          <FaMedal className="text-gray-400" /> Giải Nhì
                        </span>
                        <span className="text-xl font-bold text-gray-600">
                          {formatMoney(tournament.prize_2nd)} VND
                        </span>
                      </div>
                    </div>
                  )}
                  {tournament.prize_3rd > 0 && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold flex items-center gap-2">
                          <FaMedal className="text-orange-600" /> Giải Ba
                        </span>
                        <span className="text-xl font-bold text-orange-600">
                          {formatMoney(tournament.prize_3rd)} VND
                        </span>
                      </div>
                    </div>
                  )}
                  {tournament.prize_4th > 0 && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold flex items-center gap-2">
                          <FaMedal className="text-purple-500" /> Giải Tư
                        </span>
                        <span className="text-xl font-bold text-purple-600">
                          {formatMoney(tournament.prize_4th)} VND
                        </span>
                      </div>
                    </div>
                  )}
                  {tournament.prize_5th_to_8th > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold flex items-center gap-2">
                          <FaMedal className="text-blue-500" /> Giải 5-8
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatMoney(tournament.prize_5th_to_8th)} VND/đội
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        (4 đội, tổng:{" "}
                        {formatMoney(tournament.prize_5th_to_8th * 4)} VND)
                      </p>
                    </div>
                  )}
                  {tournament.max_teams === 16 &&
                    tournament.prize_9th_to_16th > 0 && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold flex items-center gap-2">
                            <FaMedal className="text-green-500" /> Giải 9-16
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {formatMoney(tournament.prize_9th_to_16th)} VND/đội
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          (8 đội, tổng:{" "}
                          {formatMoney(tournament.prize_9th_to_16th * 8)} VND)
                        </p>
                      </div>
                    )}
                </div>

                <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Tổng quỹ giải thưởng:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatMoney(tournament.total_prize_money)} VND
                    </span>
                  </div>
                </div>

                {/* Admin Fee Display */}
                <div className="mt-4 bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-semibold text-orange-900">
                        💼 Lệ phí tạo giải (1%):
                      </span>
                      <p className="text-xs text-orange-700 mt-1">
                        {tournament.status === "draft"
                          ? "⏳ Chưa thanh toán - Sẽ được trừ khi admin duyệt"
                          : "✅ Đã thanh toán khi admin duyệt giải"}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatMoney(
                        Math.floor(tournament.total_prize_money * 0.01)
                      )}{" "}
                      VND
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-6 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>
                  Ngày tạo:{" "}
                  {format(new Date(tournament.created_at), "dd/MM/yyyy HH:mm")}
                </span>
                <span>
                  Cập nhật:{" "}
                  {format(new Date(tournament.updated_at), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Detail Modal */}
      {showLeaveDetailModal && selectedLeaveRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowLeaveDetailModal(false);
            setRejectionReason("");
            setSelectedLeaveRequest(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Chi tiết yêu cầu rời giải
                </h3>
                <button
                  onClick={() => {
                    setShowLeaveDetailModal(false);
                    setRejectionReason("");
                    setSelectedLeaveRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đội bóng
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedLeaveRequest.team_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Huấn luyện viên
                </label>
                <p className="text-gray-900">
                  {selectedLeaveRequest.coach_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedLeaveRequest.coach_email}
                </p>
                {selectedLeaveRequest.coach_phone && (
                  <p className="text-sm text-gray-600">
                    {selectedLeaveRequest.coach_phone}
                  </p>
                )}
              </div>

              {selectedLeaveRequest.reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do rời giải
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedLeaveRequest.reason}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày yêu cầu
                </label>
                <p className="text-gray-900">
                  {format(
                    new Date(selectedLeaveRequest.requested_at),
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mt-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-orange-400 mt-0.5 mr-2" />
                  <div className="text-sm text-orange-800">
                    <p className="font-semibold mb-1">⚠️ Lưu ý quan trọng</p>
                    <p>
                      Khi chấp nhận yêu cầu rời giải, đội sẽ bị xóa khỏi giải
                      đấu.
                      <strong className="block mt-1">
                        Lệ phí đăng ký KHÔNG được hoàn trả.
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {selectedLeaveRequest.status === "pending" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối (nếu từ chối):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Nhập lý do từ chối yêu cầu rời giải..."
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowLeaveDetailModal(false);
                  setRejectionReason("");
                  setSelectedLeaveRequest(null);
                }}
                className="flex-1 btn-secondary"
              >
                Đóng
              </button>
              {selectedLeaveRequest.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleProcessLeaveRequest(
                        selectedLeaveRequest.request_id,
                        "rejected"
                      )
                    }
                    disabled={
                      processingLeave === selectedLeaveRequest.request_id ||
                      !rejectionReason.trim()
                    }
                    className="flex-1 btn-error flex items-center justify-center gap-2"
                  >
                    <FaTimesCircle />
                    Từ chối
                  </button>
                  <button
                    onClick={() =>
                      handleProcessLeaveRequest(
                        selectedLeaveRequest.request_id,
                        "approved"
                      )
                    }
                    disabled={
                      processingLeave === selectedLeaveRequest.request_id
                    }
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {processingLeave === selectedLeaveRequest.request_id ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Chấp nhận
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Financial Modal */}
      {showFinancialModal && tournament && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  💰 Chi tiêu tài chính - Giải "{tournament.tournament_name}"
                </h3>
                <button
                  onClick={() => setShowFinancialModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {loadingFinancial ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin mx-auto mb-4 text-blue-600" size={24} />
                  <p className="text-gray-600">Đang tải dữ liệu tài chính...</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {financialTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <FaWallet className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-gray-600">Chưa có giao dịch tài chính nào cho giải đấu này.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Tổng quan tài chính</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-600">Tổng Thu</p>
                            <p className="font-semibold text-green-600">
                              +{financialTransactions
                                .filter(t => t.transaction_type === 'income')
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Tổng Chi</p>
                            <p className="font-semibold text-red-600">
                              -{financialTransactions
                                .filter(t => t.transaction_type === 'expense')
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Số giao dịch</p>
                            <p className="font-semibold text-blue-600">
                              {financialTransactions.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {financialTransactions.map((transaction) => (
                              <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(transaction.transaction_date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.transaction_type === 'income' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {transaction.transaction_type === 'income' ? 'Thu' : 'Chi'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {transaction.category_name || 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                  <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                    {transaction.transaction_type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('vi-VN')} VND
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                  {transaction.description}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {transaction.status === 'approved' ? 'Đã duyệt' :
                                     transaction.status === 'pending' ? 'Chờ duyệt' :
                                     transaction.status === 'rejected' ? 'Từ chối' :
                                     transaction.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowFinancialModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Financial Modal */}
      {showTeamFinancialModal && tournament && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-11/12 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaUsers className="text-purple-600" />
                  Chi tiêu tài chính các đội - Giải "{tournament.tournament_name}"
                </h3>
                <button
                  onClick={() => setShowTeamFinancialModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              {loadingTeamFinancial ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin h-8 w-8 text-purple-500 mr-3" />
                  <span>Đang tải dữ liệu chi tiêu các đội...</span>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {teamFinancialData.length === 0 ? (
                    <div className="text-center py-8">
                      <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Chưa có dữ liệu tài chính
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Chưa có đội nào có giao dịch tài chính trong giải này.
                      </p>
                    </div>
                  ) : (
                    teamFinancialData.map((teamData) => (
                      <div key={teamData.team_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaUsers className="text-blue-500" />
                            {teamData.team_name}
                          </h4>
                          <div className="text-sm text-gray-600">
                            {teamData.transactions.length > 0 ? (
                              <>
                                <div className="flex gap-4">
                                  <span className="text-green-600 font-medium">
                                    +{teamData.transactions
                                      .filter(t => t.transaction_type === 'income')
                                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                                      .toLocaleString('vi-VN')} VND
                                  </span>
                                  <span className="text-red-600 font-medium">
                                    -{teamData.transactions
                                      .filter(t => t.transaction_type === 'expense')
                                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                                      .toLocaleString('vi-VN')} VND
                                  </span>
                                  <span className="text-gray-800 font-bold">
                                    {teamData.transactions.length} giao dịch
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-500">Chưa có giao dịch</span>
                            )}
                          </div>
                        </div>

                        {teamData.transactions.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Ngày
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Loại
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Số tiền
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Mô tả
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Trạng thái
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {teamData.transactions.map((transaction, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                                        transaction.transaction_type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {transaction.transaction_type === 'income' ? 'Thu' : 'Chi'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                      <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                        {transaction.transaction_type === 'income' ? '+' : '-'}
                                        {Number(transaction.amount || 0).toLocaleString('vi-VN')} VND
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                                      {transaction.description}
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {transaction.status === 'approved' ? 'Đã duyệt' :
                                         transaction.status === 'pending' ? 'Chờ duyệt' :
                                         transaction.status === 'rejected' ? 'Từ chối' :
                                         transaction.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <FaInfoCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                            <p>Đội này chưa có giao dịch tài chính nào.</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTeamFinancialModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetailPage;
