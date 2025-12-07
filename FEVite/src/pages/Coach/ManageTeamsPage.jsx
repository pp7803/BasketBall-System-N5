import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useNotifications } from "../../contexts/NotificationContext";

const { coach: coachAPI } = api;
import {
  FaUsers,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUser,
  FaPhone,
  FaRunning,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaTshirt,
  FaInfoCircle,
  FaImage,
  FaWallet,
  FaPaperPlane,
  FaCalendarAlt,
  FaFutbol,
} from "react-icons/fa";

const ManageTeamsPage = () => {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [processing, setProcessing] = useState(null);

  // Leave requests state
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveRequestsModal, setShowLeaveRequestsModal] = useState(false);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  const [processingLeave, setProcessingLeave] = useState(null);

  // Edit team state
  const [editingTeam, setEditingTeam] = useState(null);
  const [editForm, setEditForm] = useState({
    team_name: "",
    short_name: "",
    logo_url: "",
    entry_fee: 0,
  });

  // Team detail state
  const [showTeamDetail, setShowTeamDetail] = useState(false);
  const [teamDetail, setTeamDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Jersey number edit state
  const [editingJersey, setEditingJersey] = useState(null);
  const [jerseyInput, setJerseyInput] = useState("");
  const [bulkAssigning, setBulkAssigning] = useState(false);


  // Create team state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    team_name: "",
    short_name: "",
    logo_url: "",
    entry_fee: 0,
  });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createMessage, setCreateMessage] = useState({ type: "", text: "" });

  // Matches state
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [matchLineup, setMatchLineup] = useState([]);
  const [loadingLineup, setLoadingLineup] = useState(false);
  const [selectedLineupPlayers, setSelectedLineupPlayers] = useState([]);
  const [savingLineup, setSavingLineup] = useState(false);

  // Financial state
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [financialTransactions, setFinancialTransactions] = useState([]);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [selectedTeamForFinancial, setSelectedTeamForFinancial] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  // Helper function to generate random available jersey number
  const getRandomAvailableJersey = (existingPlayers) => {
    const usedNumbers = new Set(
      existingPlayers.filter((p) => p.jersey_number).map((p) => p.jersey_number)
    );

    // Generate available numbers from 0-99
    const availableNumbers = [];
    for (let i = 0; i <= 99; i++) {
      if (!usedNumbers.has(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      return null; // No available numbers
    }

    // Return random number from available list
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  };

  const fetchTeams = async () => {
    try {
      const response = await coachAPI.getMyTeams();
      if (response.data.success) {
        setTeams(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRequests = async (teamId) => {
    setLoadingRequests(true);
    try {
      const response = await coachAPI.getTeamRequests(teamId);
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchTeamDetail = async (teamId) => {
    setLoadingDetail(true);
    try {
      const response = await coachAPI.getTeamDetail(teamId);
      if (response.data.success) {
        setTeamDetail(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching team detail:", error);
      alert("Không thể tải chi tiết đội");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewRequests = (team) => {
    setSelectedTeam(team);
    setShowRequestsModal(true);
    fetchTeamRequests(team.team_id);
    // Refresh notifications to update unread count
    refreshNotifications();
  };

  const handleViewTeamDetail = async (team) => {
    setSelectedTeam(team);
    setShowTeamDetail(true);
    await fetchTeamDetail(team.team_id);
  };

  const handleProcessRequest = async (requestId, status) => {
    setProcessing(requestId);

    try {
      let rejectionReason = null;

      // If rejecting, ask for reason
      if (status === "rejected") {
        rejectionReason = prompt(
          "📝 Vui lòng nhập lý do từ chối yêu cầu này:\n\n(Lý do sẽ được gửi đến cầu thủ qua thông báo)"
        );

        if (rejectionReason === null) {
          // User cancelled
          setProcessing(null);
          return;
        }

        if (!rejectionReason.trim()) {
          alert("❌ Vui lòng nhập lý do từ chối!");
          setProcessing(null);
          return;
        }
      } else {
        // If approving, just confirm
        if (!window.confirm("Bạn có chắc muốn duyệt yêu cầu này?")) {
          setProcessing(null);
          return;
        }
      }

      await coachAPI.processJoinRequest(requestId, status, rejectionReason);

      alert(
        status === "approved"
          ? "✅ Yêu cầu đã được duyệt!\n\nCầu thủ đã được thêm vào đội. Bạn có thể phân số áo sau trong phần Chi tiết đội."
          : "✅ Yêu cầu đã bị từ chối!\n\nLý do đã được gửi đến cầu thủ qua thông báo."
      );

      await fetchTeamRequests(selectedTeam.team_id);
      await fetchTeams();
      refreshNotifications();
    } catch (error) {
      console.error("Error processing request:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      const errorCode = error.response?.data?.code;

      if (errorCode === "REQUEST_NOT_FOUND") {
        alert(`❌ ${errorMessage}\n\nDanh sách sẽ được làm mới.`);
        await fetchTeamRequests(selectedTeam.team_id);
      } else {
        alert(`❌ Lỗi: ${errorMessage}`);
      }
    } finally {
      setProcessing(null);
    }
  };

  // Leave request functions
  const fetchTeamLeaveRequests = async (teamId) => {
    setLoadingLeaveRequests(true);
    try {
      const response = await coachAPI.getTeamLeaveRequests(teamId);
      if (response.data.success) {
        setLeaveRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoadingLeaveRequests(false);
    }
  };

  const handleViewLeaveRequests = (team) => {
    setSelectedTeam(team);
    setShowLeaveRequestsModal(true);
    fetchTeamLeaveRequests(team.team_id);
    // Refresh notifications to update unread count
    refreshNotifications();
  };

  const handleProcessLeaveRequest = async (requestId, status) => {
    const statusText = status === "approved" ? "chấp nhận" : "từ chối";
    if (
      !window.confirm(
        `Bạn có chắc muốn ${statusText} yêu cầu rời đội này không?`
      )
    ) {
      return;
    }

    setProcessingLeave(requestId);
    try {
      await coachAPI.processLeaveRequest(requestId, status);
      alert(
        `✅ Đã ${statusText} yêu cầu rời đội!${
          status === "approved" ? "\n\nCầu thủ đã được xóa khỏi đội." : ""
        }`
      );
      // Refresh both leave requests and team list
      await fetchTeamLeaveRequests(selectedTeam.team_id);
      await fetchTeams();
      // Refresh notifications after processing leave request
      refreshNotifications();
      // If approved, also refresh team detail if open
      if (showTeamDetail && status === "approved") {
        await fetchTeamDetail(selectedTeam.team_id);
      }
    } catch (error) {
      console.error("Error processing leave request:", error);
      alert(`❌ Lỗi: ${error.response?.data?.message || "Có lỗi xảy ra"}`);
    } finally {
      setProcessingLeave(null);
    }
  };

  // Edit team functions
  const handleStartEdit = (team) => {
    // Allow edit if status is 'rejected' or 'pending', or if approved and has no members
    if (team.status === "rejected" || team.status === "pending") {
      // Navigate to CreateTeamPage with teamId for editing
      navigate(`/coach/teams/${team.team_id}/edit`);
      return;
    }

    if (team.status !== "approved") {
      alert("Chỉ có thể chỉnh sửa đội khi đã được duyệt hoặc bị từ chối.");
      return;
    }

    if (team.player_count >= 12) {
      alert(
        "❌ Không thể sửa tên đội khi đã đủ 12 thành viên!\nVui lòng xóa bớt thành viên trước."
      );
      return;
    }
    setEditingTeam(team.team_id);
    setEditForm({
      team_name: team.team_name,
      short_name: team.short_name || "",
      logo_url: team.logo_url || "",
      entry_fee: team.entry_fee || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditForm({
      team_name: "",
      short_name: "",
      logo_url: "",
      entry_fee: 0,
    });
  };

  const handleSaveEdit = async (teamId) => {
    if (!editForm.team_name.trim()) {
      alert("Tên đội không được để trống");
      return;
    }

    try {
      await coachAPI.updateTeam(teamId, editForm);
      alert("✅ Cập nhật đội thành công!");
      setEditingTeam(null);
      await fetchTeams();
    } catch (error) {
      console.error("Error updating team:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      alert(`❌ Lỗi: ${errorMessage}`);
    }
  };

  const handleDeleteTeam = async (team) => {
    if (team.player_count >= 12) {
      alert(
        "❌ Không thể xóa đội đã đủ 12 thành viên!\nVui lòng xóa hết thành viên trước."
      );
      return;
    }

    if (
      !window.confirm(
        `⚠️ Bạn có chắc chắn muốn xóa đội "${team.team_name}"?\nHành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    try {
      await coachAPI.deleteTeam(team.team_id);
      alert("✅ Đã xóa đội thành công!");
      await fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      alert(`❌ Lỗi: ${errorMessage}`);
    }
  };

  const handleRemovePlayer = async (athleteId, playerName) => {
    if (!window.confirm(`⚠️ Bạn có chắc muốn xóa ${playerName} khỏi đội?`)) {
      return;
    }

    try {
      await coachAPI.removePlayer(selectedTeam.team_id, athleteId);
      alert("✅ Đã xóa cầu thủ khỏi đội!");
      await fetchTeamDetail(selectedTeam.team_id);
      await fetchTeams();
    } catch (error) {
      console.error("Error removing player:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      alert(`❌ Lỗi: ${errorMessage}`);
    }
  };

  const handleStartEditJersey = (athleteId, currentJersey) => {
    setEditingJersey(athleteId);
    setJerseyInput(currentJersey || "");
  };

  const handleCancelEditJersey = () => {
    setEditingJersey(null);
    setJerseyInput("");
  };

  const handleSaveJersey = async (athleteId) => {
    const jerseyNumber = jerseyInput.trim() ? parseInt(jerseyInput) : null;

    if (
      jerseyInput.trim() &&
      (isNaN(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99)
    ) {
      alert("❌ Số áo phải từ 0-99");
      return;
    }

    try {
      await coachAPI.updatePlayerJersey(
        selectedTeam.team_id,
        athleteId,
        jerseyNumber
      );
      alert("✅ Đã cập nhật số áo!");
      setEditingJersey(null);
      setJerseyInput("");
      await fetchTeamDetail(selectedTeam.team_id);
      await fetchTeams();
    } catch (error) {
      console.error("Error updating jersey:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      alert(`❌ Lỗi: ${errorMessage}`);
    }
  };

  // Bulk assign jersey numbers
  const handleBulkAssignJerseys = async () => {
    if (!teamDetail || !teamDetail.players) {
      return;
    }

    // Lọc các cầu thủ chưa có số áo
    const playersWithoutJersey = teamDetail.players.filter(
      (p) => !p.jersey_number || p.jersey_number === null
    );

    if (playersWithoutJersey.length === 0) {
      alert("✅ Tất cả cầu thủ đã có số áo!");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn phân số áo tự động cho ${playersWithoutJersey.length} cầu thủ chưa có số áo?\n\nHệ thống sẽ tự động gán số áo ngẫu nhiên từ 0-99 (tránh trùng lặp).`
      )
    ) {
      return;
    }

    setBulkAssigning(true);
    let successCount = 0;
    let errorCount = 0;
    const usedNumbers = new Set(
      teamDetail.players
        .filter((p) => p.jersey_number)
        .map((p) => p.jersey_number)
    );

    try {
      // Tạo danh sách số áo khả dụng
      const availableNumbers = [];
      for (let i = 0; i <= 99; i++) {
        if (!usedNumbers.has(i)) {
          availableNumbers.push(i);
        }
      }

      if (availableNumbers.length < playersWithoutJersey.length) {
        alert(
          `❌ Không đủ số áo khả dụng!\n\nCòn ${availableNumbers.length} số áo trống nhưng có ${playersWithoutJersey.length} cầu thủ cần phân số áo.`
        );
        setBulkAssigning(false);
        return;
      }

      // Xáo trộn danh sách số áo
      const shuffledNumbers = [...availableNumbers].sort(
        () => Math.random() - 0.5
      );

      // Phân số áo cho từng cầu thủ
      for (let i = 0; i < playersWithoutJersey.length; i++) {
        const player = playersWithoutJersey[i];
        const jerseyNumber = shuffledNumbers[i];

        try {
          await coachAPI.updatePlayerJersey(
            selectedTeam.team_id,
            player.athlete_id,
            jerseyNumber
          );
          successCount++;
        } catch (error) {
          console.error(
            `Error assigning jersey to ${player.full_name}:`,
            error
          );
          errorCount++;
        }
      }

      // Refresh data
      await fetchTeamDetail(selectedTeam.team_id);
      await fetchTeams();

      if (errorCount === 0) {
        alert(`✅ Đã phân số áo thành công cho ${successCount} cầu thủ!`);
      } else {
        alert(
          `⚠️ Đã phân số áo cho ${successCount} cầu thủ.\n\nCó ${errorCount} cầu thủ gặp lỗi. Vui lòng kiểm tra lại.`
        );
      }
    } catch (error) {
      console.error("Error in bulk assign:", error);
      alert(`❌ Lỗi khi phân số áo hàng loạt: ${error.message}`);
    } finally {
      setBulkAssigning(false);
    }
  };

  // Matches functions
  const fetchTeamMatches = async (teamId) => {
    setLoadingMatches(true);
    try {
      const response = await coachAPI.getTeamMatches(teamId);
      if (response.data.success) {
        setMatches(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      alert("Lỗi khi tải danh sách trận đấu");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleViewMatches = (team) => {
    setSelectedTeam(team);
    setShowMatchesModal(true);
    fetchTeamMatches(team.team_id);
  };

  // Financial functions
  const fetchTeamFinancials = async (teamId) => {
    try {
      setLoadingFinancial(true);
      const response = await coachAPI.getTeamFinancials(teamId);
      setFinancialTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching financial transactions:", error);
      setFinancialTransactions([]);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const handleViewFinancials = (team) => {
    setSelectedTeamForFinancial(team);
    fetchTeamFinancials(team.team_id);
    setShowFinancialModal(true);
  };

  const handleViewLineup = async (match) => {
    setSelectedMatch(match);
    setShowLineupModal(true);
    setLoadingLineup(true);
    
    // Ensure teamDetail is loaded
    if (!teamDetail || teamDetail.team.team_id !== selectedTeam.team_id) {
      await fetchTeamDetail(selectedTeam.team_id);
    }

    try {
      const response = await coachAPI.getMatchLineup(match.match_id);
      if (response.data.success) {
        const lineup = response.data.data.lineup || [];
        setMatchLineup(lineup);
        // Initialize selected players from existing lineup, or empty array if no lineup
        if (lineup.length > 0) {
          setSelectedLineupPlayers(
            lineup.map((p) => ({
              athlete_id: p.athlete_id,
              position: p.position,
            }))
          );
        } else {
          setSelectedLineupPlayers([]);
        }
      }
    } catch (error) {
      console.error("Error fetching lineup:", error);
      alert("Lỗi khi tải đội hình");
      setMatchLineup([]);
      setSelectedLineupPlayers([]);
    } finally {
      setLoadingLineup(false);
    }
  };

  const handleToggleLineupPlayer = (athleteId, position) => {
    setSelectedLineupPlayers((prev) => {
      const existing = prev.find((p) => p.athlete_id === athleteId);
      if (existing) {
        // Remove from lineup
        return prev.filter((p) => p.athlete_id !== athleteId);
      } else {
        // Add to lineup (only if less than 5)
        if (prev.length >= 5) {
          alert("❌ Đội hình chỉ có tối đa 5 cầu thủ!");
          return prev;
        }
        // Check if position already exists
        const positionExists = prev.some((p) => p.position === position);
        if (positionExists) {
          alert(`❌ Vị trí ${position} đã được chọn!`);
          return prev;
        }
        return [...prev, { athlete_id: athleteId, position }];
      }
    });
  };

  const handleSaveLineup = async () => {
    if (selectedLineupPlayers.length !== 5) {
      alert("❌ Đội hình phải có đúng 5 cầu thủ!");
      return;
    }

    // Check if all 5 positions are covered
    const positions = new Set(selectedLineupPlayers.map((p) => p.position));
    const requiredPositions = ["PG", "SG", "SF", "PF", "C"];
    const missingPositions = requiredPositions.filter(
      (pos) => !positions.has(pos)
    );

    if (missingPositions.length > 0) {
      alert(
        `❌ Đội hình phải có đầy đủ 5 vị trí (PG, SG, SF, PF, C). Đang thiếu: ${missingPositions.join(
          ", "
        )}!`
      );
      return;
    }

    setSavingLineup(true);
    try {
      await coachAPI.updateMatchLineup(
        selectedMatch.match_id,
        selectedLineupPlayers
      );
      alert("✅ Đã cập nhật đội hình thành công!");
      await handleViewLineup(selectedMatch);
    } catch (error) {
      console.error("Error updating lineup:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra";
      alert(`❌ Lỗi: ${errorMessage}`);
    } finally {
      setSavingLineup(false);
    }
  };

  // Create team functions
  const handleCreateFormChange = (e) => {
    const { name, value, type } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreatingTeam(true);
    setCreateMessage({ type: "", text: "" });

    try {
      const response = await coachAPI.createTeam(createFormData);

      if (response.data.success) {
        setCreateMessage({
          type: "success",
          text: "✅ Tạo đội bóng thành công!",
        });
        setCreateFormData({
          team_name: "",
          short_name: "",
          logo_url: "",
          entry_fee: 0,
        });
        setShowCreateForm(false);
        await fetchTeams();
      }
    } catch (error) {
      console.error("Create team error:", error);
      setCreateMessage({
        type: "error",
        text: error.response?.data?.message || "Có lỗi xảy ra khi tạo đội",
      });
    } finally {
      setCreatingTeam(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải danh sách đội...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-full">
              <FaUsers className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý đội bóng
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý đội bóng và duyệt yêu cầu gia nhập
              </p>
            </div>
          </div>
          {teams.length === 0 && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <FaPlus />
              <span>Tạo đội</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Team Form */}
      {teams.length === 0 && showCreateForm && (
        <div className="mb-8">
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
                    Sau khi tạo đội, bạn có thể quản lý cầu thủ và duyệt yêu cầu
                    gia nhập
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Message */}
          {createMessage.text && (
            <div
              className={`alert ${
                createMessage.type === "success"
                  ? "alert-success"
                  : "alert-error"
              } mb-6`}
            >
              {createMessage.type === "success" ? (
                <FaCheckCircle className="flex-shrink-0" />
              ) : (
                <FaExclamationTriangle className="flex-shrink-0" />
              )}
              <span>{createMessage.text}</span>
            </div>
          )}

          {/* Form */}
          <div className="card">
            <form onSubmit={handleCreateTeam} className="space-y-6">
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
                    value={createFormData.team_name}
                    onChange={handleCreateFormChange}
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
                    value={createFormData.short_name}
                    onChange={handleCreateFormChange}
                    maxLength="10"
                    className="input-field"
                    placeholder="VD: SGH"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImage className="inline mr-1" />
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo_url"
                    value={createFormData.logo_url}
                    onChange={handleCreateFormChange}
                    className="input-field"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaWallet className="inline mr-2 text-green-600" />
                    Lệ phí gia nhập (VND)
                  </label>
                  <input
                    type="number"
                    name="entry_fee"
                    value={createFormData.entry_fee}
                    onChange={handleCreateFormChange}
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

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateMessage({ type: "", text: "" });
                    setCreateFormData({
                      team_name: "",
                      short_name: "",
                      logo_url: "",
                      entry_fee: 0,
                    });
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <FaTimes />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  disabled={creatingTeam}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {creatingTeam ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>Tạo đội</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams List */}
      {teams.length === 0 && !showCreateForm ? (
        <div className="card text-center py-12">
          <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Bạn chưa có đội bóng nào</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FaPlus />
            <span>Tạo đội</span>
          </button>
        </div>
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {teams.map((team) => (
            <div
              key={team.team_id}
              className="card hover:shadow-xl transition-all duration-300"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                {editingTeam === team.team_id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editForm.team_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, team_name: e.target.value })
                      }
                      className="input-field w-full"
                      placeholder="Tên đội"
                    />
                    <input
                      type="text"
                      value={editForm.short_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, short_name: e.target.value })
                      }
                      className="input-field w-full text-sm"
                      placeholder="Tên viết tắt"
                    />
                    <div className="flex items-center space-x-2">
                      <FaImage className="text-gray-400" />
                      <input
                        type="url"
                        value={editForm.logo_url}
                        onChange={(e) =>
                          setEditForm({ ...editForm, logo_url: e.target.value })
                        }
                        className="input-field w-full text-sm"
                        placeholder="URL Logo"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaWallet className="text-green-600" />
                      <input
                        type="number"
                        value={editForm.entry_fee}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            entry_fee: Number(e.target.value),
                          })
                        }
                        min="0"
                        step="1000"
                        disabled={team.player_count > 0}
                        className={`input-field w-full text-sm ${
                          team.player_count > 0
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder="Lệ phí (VND)"
                      />
                    </div>
                    {team.player_count > 0 && (
                      <p className="text-xs text-orange-600 flex items-center">
                        <FaExclamationTriangle className="mr-1" />
                        Không thể sửa lệ phí khi đội đã có thành viên
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-lg">
                      <FaUsers className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">
                          {team.team_name}
                        </h3>
                        {/* Status Badge */}
                        {team.status === "pending" && (
                          <span className="badge badge-warning">
                            <FaClock className="inline mr-1" />
                            Chờ duyệt
                          </span>
                        )}
                        {team.status === "approved" && (
                          <span className="badge badge-success">
                            <FaCheckCircle className="inline mr-1" />
                            Đã duyệt
                          </span>
                        )}
                        {team.status === "rejected" && (
                          <span className="badge badge-error">
                            <FaTimesCircle className="inline mr-1" />
                            Bị từ chối
                          </span>
                        )}
                      </div>
                      {team.short_name && (
                        <p className="text-sm text-gray-500">
                          {team.short_name}
                        </p>
                      )}
                      {team.status === "pending" && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⏳ Đội đang chờ admin duyệt. Lệ phí 500.000 VND sẽ
                          được trừ khi duyệt.
                        </p>
                      )}
                      {team.status === "rejected" && team.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          ❌ Lý do: {team.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {team.is_active && team.status === "approved" ? (
                  <span className="badge badge-success">
                    <FaCheckCircle className="inline mr-1" />
                    Active
                  </span>
                ) : team.status === "approved" ? (
                  <span className="badge badge-error">Inactive</span>
                ) : null}
              </div>

              {/* Stats - Improved Layout for Full Width */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div
                  className={`p-4 rounded-lg ${
                    team.player_count >= 12 ? "bg-green-50" : "bg-blue-50"
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      team.player_count >= 12
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    Cầu thủ
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      team.player_count >= 12
                        ? "text-green-900"
                        : "text-blue-900"
                    }`}
                  >
                    {team.player_count || 0}/12
                  </p>
                  {team.player_count >= 12 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Đủ thành viên
                    </p>
                  )}
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    team.pending_requests > 0 ? "bg-orange-50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      team.pending_requests > 0
                        ? "text-orange-600"
                        : "text-gray-600"
                    }`}
                  >
                    Yêu cầu
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      team.pending_requests > 0
                        ? "text-orange-900"
                        : "text-gray-900"
                    }`}
                  >
                    {team.pending_requests || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50">
                  <p className="text-xs font-medium text-green-600 flex items-center">
                    <FaWallet className="mr-1" />
                    Lệ phí
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {team.entry_fee > 0
                      ? new Intl.NumberFormat("vi-VN").format(team.entry_fee)
                      : "Miễn phí"}
                  </p>
                  {team.entry_fee > 0 && (
                    <p className="text-xs text-green-600 mt-1">VND</p>
                  )}
                </div>
              </div>

              {/* Warning if >= 12 players */}
              {team.player_count >= 12 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-400 mt-0.5 mr-2" />
                    <p className="text-xs text-yellow-700">
                      <strong>Đội đã đủ 12 thành viên!</strong>
                      <br />
                      Không thể sửa/xóa đội. Xóa thành viên nếu cần.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {editingTeam === team.team_id ? (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleSaveEdit(team.team_id)}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <FaSave />
                    <span>Lưu</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                  >
                    <FaTimes />
                    <span>Hủy</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  {/* Status Warning */}
                  {team.status !== "approved" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                      <div className="flex items-start">
                        <FaExclamationTriangle className="text-yellow-400 mt-0.5 mr-2" />
                        <p className="text-xs text-yellow-700">
                          {team.status === "pending" && (
                            <>
                              <strong>Đội đang chờ admin duyệt.</strong>
                              <br />
                              Bạn chỉ có thể xem thông tin cơ bản. Các chức năng
                              quản lý sẽ được mở khóa sau khi admin duyệt.
                            </>
                          )}
                          {team.status === "rejected" && (
                            <>
                              <strong>Đội đã bị từ chối.</strong>
                              <br />
                              {team.rejection_reason &&
                                `Lý do: ${team.rejection_reason}`}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons in a Better Layout */}
                  <div
                    className={`grid grid-cols-2 gap-3 ${
                      team.status === "rejected"
                        ? "md:grid-cols-8"
                        : "md:grid-cols-7"
                    }`}
                  >
                    <button
                      onClick={() => handleViewRequests(team)}
                      disabled={team.status !== "approved"}
                      className={`btn-primary flex items-center justify-center space-x-2 py-3 ${
                        team.status !== "approved"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title={
                        team.status !== "approved"
                          ? "Chức năng chỉ khả dụng khi đội được duyệt"
                          : ""
                      }
                    >
                      <FaClock />
                      <span>
                        Yêu cầu Gia nhập ({team.pending_requests || 0})
                      </span>
                    </button>
                    <button
                      onClick={() => handleViewLeaveRequests(team)}
                      disabled={team.status !== "approved"}
                      className={`bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors font-medium ${
                        team.status !== "approved"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title={
                        team.status !== "approved"
                          ? "Chức năng chỉ khả dụng khi đội được duyệt"
                          : ""
                      }
                    >
                      <FaUsers />
                      <span>Yêu cầu Rời đội</span>
                    </button>
                    <button
                      onClick={() => handleViewTeamDetail(team)}
                      className="btn-secondary flex items-center justify-center space-x-2 py-3"
                    >
                      <FaEye />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      onClick={() => handleViewMatches(team)}
                      disabled={team.status !== "approved"}
                      className={`bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors font-medium ${
                        team.status !== "approved"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title={
                        team.status !== "approved"
                          ? "Chức năng chỉ khả dụng khi đội được duyệt"
                          : ""
                      }
                    >
                      <FaFutbol />
                      <span>Trận đấu</span>
                    </button>
                    <button
                      onClick={() => handleViewFinancials(team)}
                      className="bg-green-600 text-white hover:bg-green-700 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors font-medium"
                      title="Xem các giao dịch tài chính liên quan đến đội này"
                    >
                      <FaWallet />
                      <span>Xem Chi tiêu</span>
                    </button>
                    {/* Edit button - show for rejected/pending or approved teams */}
                    {(team.status === "rejected" ||
                      team.status === "pending" ||
                      team.status === "approved") && (
                      <button
                        onClick={() => handleStartEdit(team)}
                        disabled={
                          (team.status === "approved" &&
                            team.player_count >= 12) ||
                          (team.status !== "rejected" &&
                            team.status !== "pending" &&
                            team.status !== "approved")
                        }
                        className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                          (team.status === "approved" &&
                            team.player_count >= 12) ||
                          (team.status !== "rejected" &&
                            team.status !== "pending" &&
                            team.status !== "approved")
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                        title={
                          team.status === "rejected" ||
                          team.status === "pending"
                            ? "Chỉnh sửa thông tin đội"
                            : team.player_count >= 12
                            ? "Không thể sửa khi đã đủ 12 thành viên"
                            : "Chỉnh sửa thông tin đội"
                        }
                      >
                        <FaEdit />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                    {/* Resubmit button - only for rejected teams */}
                    {team.status === "rejected" && (
                      <button
                        onClick={async () => {
                          if (
                            !window.confirm(
                              "Bạn có chắc chắn muốn gửi lại yêu cầu duyệt đội? Lệ phí 500.000 VND sẽ được trừ khi admin duyệt."
                            )
                          ) {
                            return;
                          }
                          try {
                            const response = await coachAPI.resubmitTeam(
                              team.team_id
                            );
                            if (response.data.success) {
                              alert("Đã gửi lại yêu cầu duyệt đội thành công!");
                              fetchTeams();
                            }
                          } catch (error) {
                            alert(
                              error.response?.data?.message ||
                                "Có lỗi xảy ra khi gửi lại yêu cầu"
                            );
                          }
                        }}
                        className="bg-green-600 text-white hover:bg-green-700 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium"
                      >
                        <FaPaperPlane />
                        <span>Gửi lại</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      disabled={
                        team.player_count >= 12 || team.status !== "approved"
                      }
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                        team.player_count >= 12 || team.status !== "approved"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <FaTrash />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Requests Modal */}
      {showRequestsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRequestsModal(false)}
        >
          <div
            className="modal-content max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="text-2xl font-bold flex items-center">
                <FaClock className="mr-3 text-primary-600" />
                Yêu cầu gia nhập - {selectedTeam?.team_name}
              </h2>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="modal-body">
              {loadingRequests ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Không có yêu cầu nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.request_id}
                      className={`card ${
                        request.status === "pending"
                          ? "border-l-4 border-orange-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaUser className="text-gray-400" />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {request.full_name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {request.email}
                              </p>
                            </div>
                          </div>
                          {request.position && (
                            <p className="text-sm text-gray-600 flex items-center mb-1">
                              <FaRunning className="mr-2 text-primary-600" />
                              Vị trí:{" "}
                              <span className="font-medium ml-1">
                                {request.position}
                              </span>
                            </p>
                          )}
                          {request.height && (
                            <p className="text-sm text-gray-600">
                              Chiều cao: {request.height}cm | Cân nặng:{" "}
                              {request.weight}kg
                            </p>
                          )}
                          {request.message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700 italic">
                                "{request.message}"
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Gửi lúc:{" "}
                            {new Date(request.requested_at).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {request.status === "pending" ? (
                            <>
                              <button
                                onClick={() =>
                                  handleProcessRequest(
                                    request.request_id,
                                    "approved"
                                  )
                                }
                                disabled={processing === request.request_id}
                                className="btn-primary flex items-center space-x-2 min-w-[100px]"
                              >
                                {processing === request.request_id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleProcessRequest(
                                    request.request_id,
                                    "rejected"
                                  )
                                }
                                disabled={processing === request.request_id}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 min-w-[100px]"
                              >
                                <FaTimesCircle />
                                <span>Từ chối</span>
                              </button>
                            </>
                          ) : request.status === "approved" ? (
                            <span className="badge badge-success">
                              Đã duyệt
                            </span>
                          ) : (
                            <span className="badge badge-error">
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
          </div>
        </div>
      )}

      {/* Team Detail Modal - Modern Design */}
      {showTeamDetail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowTeamDetail(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Gradient Background */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                    <FaUsers className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedTeam?.team_name}
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">
                      {selectedTeam?.short_name || "Quản lý thành viên"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeamDetail(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingDetail ? (
                <div className="text-center py-16">
                  <FaSpinner className="animate-spin text-5xl text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
                </div>
              ) : teamDetail ? (
                <div className="space-y-6">
                  {/* Stats Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium mb-1">
                            Tổng cầu thủ
                          </p>
                          <p className="text-3xl font-bold text-blue-900">
                            {teamDetail.players?.length || 0}
                            <span className="text-lg text-blue-600">/12</span>
                          </p>
                        </div>
                        <FaUsers className="text-4xl text-blue-300" />
                      </div>
                      <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{
                            width: `${
                              ((teamDetail.players?.length || 0) / 12) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium mb-1">
                            Trạng thái
                          </p>
                          <p className="text-lg font-bold text-green-900">
                            {teamDetail.team.player_count >= 12 ? (
                              <span className="flex items-center">
                                <FaCheckCircle className="mr-2" />
                                Đủ thành viên
                              </span>
                            ) : (
                              <span>
                                Còn thiếu{" "}
                                {12 - (teamDetail.players?.length || 0)}
                              </span>
                            )}
                          </p>
                        </div>
                        <FaCheckCircle className="text-4xl text-green-300" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium mb-1">
                            Đã phân số áo
                          </p>
                          <p className="text-3xl font-bold text-purple-900">
                            {teamDetail.players?.filter((p) => p.jersey_number)
                              .length || 0}
                          </p>
                        </div>
                        <FaTshirt className="text-4xl text-purple-300" />
                      </div>
                    </div>
                  </div>

                  {/* Position Statistics */}
                  {teamDetail.positionStats && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaRunning className="mr-2 text-gray-600" />
                        Thống kê theo vị trí
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-blue-400 transition-colors">
                          <div className="text-2xl font-bold text-blue-600">
                            {teamDetail.positionStats.PG || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Point Guard
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            PG
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-green-400 transition-colors">
                          <div className="text-2xl font-bold text-green-600">
                            {teamDetail.positionStats.SG || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Shooting Guard
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            SG
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-yellow-400 transition-colors">
                          <div className="text-2xl font-bold text-yellow-600">
                            {teamDetail.positionStats.SF || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Small Forward
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            SF
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-purple-400 transition-colors">
                          <div className="text-2xl font-bold text-purple-600">
                            {teamDetail.positionStats.PF || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Power Forward
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            PF
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-red-400 transition-colors">
                          <div className="text-2xl font-bold text-red-600">
                            {teamDetail.positionStats.C || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Center
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            C
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Players List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FaUsers className="mr-2 text-primary-600" />
                        Danh sách cầu thủ
                      </h3>
                      {teamDetail.players &&
                        teamDetail.players.some(
                          (p) => !p.jersey_number || p.jersey_number === null
                        ) && (
                          <button
                            onClick={handleBulkAssignJerseys}
                            disabled={bulkAssigning}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {bulkAssigning ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                <span>Đang phân số áo...</span>
                              </>
                            ) : (
                              <>
                                <FaTshirt />
                                <span>Phân số áo hàng loạt</span>
                              </>
                            )}
                          </button>
                        )}
                    </div>

                    {!teamDetail.players || teamDetail.players.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <FaUser className="text-7xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">
                          Chưa có cầu thủ nào
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Duyệt yêu cầu gia nhập để thêm thành viên
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {teamDetail.players.map((player, index) => {
                          return (
                            <div
                              key={player.athlete_id}
                              className="group bg-white border-2 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-primary-300"
                            >
                              <div className="flex items-start justify-between">
                                {/* Player Info */}
                                <div className="flex items-start space-x-4 flex-1">
                                  {/* Avatar with Number */}
                                  <div className="relative">
                                    <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-xl text-white">
                                      <FaUser className="text-2xl" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                      {index + 1}
                                    </div>
                                  </div>

                                  {/* Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="text-lg font-bold text-gray-900">
                                        {player.full_name}
                                      </h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <div className="flex items-center text-gray-600">
                                        <FaPhone className="mr-2 text-primary-500" />
                                        <span>
                                          {player.phone || "Chưa có SĐT"}
                                        </span>
                                      </div>

                                      {player.position && (
                                        <div className="flex items-center text-gray-600">
                                          <FaRunning className="mr-2 text-primary-500" />
                                          <span className="font-medium">
                                            {player.position}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Jersey Number Edit */}
                                    <div className="mt-3">
                                      {editingJersey === player.athlete_id ? (
                                        <div className="flex flex-wrap items-center gap-2 bg-primary-50 p-3 rounded-lg border border-primary-200">
                                          <FaTshirt className="text-primary-600 text-lg" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Số áo:
                                          </span>
                                          <input
                                            type="number"
                                            min="0"
                                            max="99"
                                            value={jerseyInput}
                                            onChange={(e) =>
                                              setJerseyInput(e.target.value)
                                            }
                                            className="w-20 px-3 py-2 border-2 border-primary-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="0-99"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => {
                                              const randomNum =
                                                getRandomAvailableJersey(
                                                  teamDetail.players
                                                );
                                              if (randomNum === null) {
                                                alert(
                                                  "⚠️ Không còn số áo khả dụng!"
                                                );
                                              } else {
                                                setJerseyInput(
                                                  randomNum.toString()
                                                );
                                              }
                                            }}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                            title="Random số áo ngẫu nhiên"
                                          >
                                            <span className="text-lg">🎲</span>
                                            <span className="text-sm font-medium">
                                              Random
                                            </span>
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleSaveJersey(
                                                player.athlete_id
                                              )
                                            }
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                                          >
                                            <FaCheckCircle />
                                            <span className="text-sm font-medium">
                                              Lưu
                                            </span>
                                          </button>
                                          <button
                                            onClick={handleCancelEditJersey}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                                          >
                                            <FaTimes />
                                            <span className="text-sm font-medium">
                                              Hủy
                                            </span>
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleStartEditJersey(
                                              player.athlete_id,
                                              player.jersey_number
                                            )
                                          }
                                          className="inline-flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-all group/jersey border border-primary-200"
                                        >
                                          <FaTshirt className="text-primary-600" />
                                          <span className="text-sm font-medium text-gray-700">
                                            Số áo:
                                          </span>
                                          <span className="bg-primary-600 text-white px-3 py-1 rounded-md font-bold min-w-[3rem] text-center">
                                            {player.jersey_number || "?"}
                                          </span>
                                          <FaEdit className="text-primary-600 text-xs opacity-0 group-hover/jersey:opacity-100 transition-opacity" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() =>
                                    handleRemovePlayer(
                                      player.athlete_id,
                                      player.full_name
                                    )
                                  }
                                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2 ml-4"
                                >
                                  <FaTrash />
                                  <span className="font-medium">Xóa</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    Không thể tải dữ liệu đội
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests Modal */}
      {showLeaveRequestsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLeaveRequestsModal(false)}
        >
          <div
            className="modal-content max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-xl font-bold text-gray-900">
                📤 Yêu cầu rời đội - {selectedTeam?.team_name}
              </h3>
              <button
                onClick={() => setShowLeaveRequestsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
            </div>

            <div className="modal-body">
              {loadingLeaveRequests ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải yêu cầu...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    Chưa có yêu cầu rời đội nào
                  </p>
                </div>
              ) : (
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
                          {/* Athlete Info */}
                          <div className="flex items-center space-x-3 mb-3">
                            <FaUser className="text-xl text-gray-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {request.full_name}
                              </h4>
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <FaRunning className="mr-1" />
                                  {request.position}
                                </span>
                                {request.jersey_number && (
                                  <span className="flex items-center">
                                    <FaTshirt className="mr-1" />#
                                    {request.jersey_number}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <FaPhone className="mr-1" />
                                  {request.phone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Reason Box */}
                          <div className="mb-3 p-3 bg-white rounded-lg border">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Lý do rời đội:
                            </p>
                            <p className="text-sm text-gray-700 italic">
                              &quot;{request.reason}&quot;
                            </p>
                          </div>

                          {/* Timestamps */}
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <FaClock className="mr-2" />
                              Gửi lúc:{" "}
                              {new Date(request.requested_at).toLocaleString(
                                "vi-VN"
                              )}
                            </div>
                            {request.processed_at && (
                              <div className="flex items-center">
                                <FaCheckCircle className="mr-2" />
                                Xử lý lúc:{" "}
                                {new Date(request.processed_at).toLocaleString(
                                  "vi-VN"
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-4 flex flex-col items-end gap-2">
                          {request.status === "pending" ? (
                            <>
                              <span className="badge badge-warning mb-2">
                                <FaClock className="inline mr-1" />
                                Chờ xử lý
                              </span>
                              <button
                                onClick={() =>
                                  handleProcessLeaveRequest(
                                    request.request_id,
                                    "approved"
                                  )
                                }
                                disabled={
                                  processingLeave === request.request_id
                                }
                                className="btn-success text-sm px-4 py-2 flex items-center space-x-2"
                              >
                                {processingLeave === request.request_id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                <span>Chấp nhận</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleProcessLeaveRequest(
                                    request.request_id,
                                    "rejected"
                                  )
                                }
                                disabled={
                                  processingLeave === request.request_id
                                }
                                className="btn-error text-sm px-4 py-2 flex items-center space-x-2"
                              >
                                {processingLeave === request.request_id ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaTimesCircle />
                                )}
                                <span>Từ chối</span>
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
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowLeaveRequestsModal(false)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matches Modal */}
      {showMatchesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowMatchesModal(false)}
        >
          <div
            className="modal-content max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="text-2xl font-bold flex items-center">
                <FaFutbol className="mr-3 text-primary-600" />
                Danh sách trận đấu - {selectedTeam?.team_name}
              </h2>
              <button
                onClick={() => setShowMatchesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="modal-body">
              {loadingMatches ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-8">
                  <FaFutbol className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có trận đấu nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => {
                    // Parse date and time as GMT+7 (Vietnam timezone)
                    // match_date might be ISO string (2025-12-06T17:00:00.000Z) or date string (2025-12-06)
                    // If it's ISO string with timezone, parse it first to get the actual date in GMT+7
                    let matchDateStr = '';
                    if (match.match_date) {
                      if (match.match_date.includes('T') && match.match_date.includes('Z')) {
                        // It's an ISO string with Z (UTC), parse it and convert to GMT+7
                        const dateUTC = new Date(match.match_date);
                        // Convert UTC to GMT+7 by adding 7 hours
                        const dateGMT7 = new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);
                        // Extract date part (YYYY-MM-DD)
                        const year = dateGMT7.getUTCFullYear();
                        const month = String(dateGMT7.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(dateGMT7.getUTCDate()).padStart(2, '0');
                        matchDateStr = `${year}-${month}-${day}`;
                      } else if (match.match_date.includes('T')) {
                        // ISO string without Z, extract date part
                        matchDateStr = match.match_date.split('T')[0];
                      } else {
                        // Plain date string
                        matchDateStr = match.match_date.replace(/\.Z$/, '').split(' ')[0];
                      }
                    }
                    
                    // Extract time part from match_time (HH:MM:SS or HH:MM)
                    const matchTimeStr = match.match_time ? match.match_time.split('.')[0].substring(0, 8) : '00:00:00';
                    
                    // Parse match time as GMT+7
                    // When we parse with +07:00, JavaScript converts it to UTC internally
                    // So "2025-12-03T09:00+07:00" becomes UTC 02:00 (9am GMT+7 = 2am UTC)
                    const matchDateTimeUTC = new Date(`${matchDateStr}T${matchTimeStr}+07:00`);
                    
                    // Get current UTC time
                    const nowUTC = Date.now();
                    
                    // Check if date is valid first
                    const isValidDate = !isNaN(matchDateTimeUTC.getTime());
                    
                    // When we parse with +07:00, JavaScript converts it to UTC internally
                    // So matchDateTimeUTC.getTime() is already UTC milliseconds
                    // To compare in GMT+7, we need to compare UTC times directly
                    // because both are in the same reference (UTC)
                    let matchTimeUTC = 0;
                    let nowUTCms = 0;
                    let twoHoursBeforeUTC = 0;
                    let canEdit = false;
                    
                    if (isValidDate) {
                        // Match time UTC (already converted from GMT+7)
                        matchTimeUTC = matchDateTimeUTC.getTime();
                        // Current UTC time
                        nowUTCms = nowUTC;
                        // Calculate 2 hours before match time (in UTC)
                        // 2 hours = 2 * 60 * 60 * 1000 milliseconds
                        twoHoursBeforeUTC = matchTimeUTC - (2 * 60 * 60 * 1000);
                        // Compare: current UTC < (match UTC - 2 hours)
                        canEdit = match.status !== 'completed' && nowUTCms < twoHoursBeforeUTC;
                    }
                    
                    // Debug logging
                    console.log('=== FRONTEND LINEUP TIME CHECK DEBUG ===');
                    console.log('Match ID:', match.match_id);
                    console.log('Match date:', match.match_date);
                    console.log('Match time:', match.match_time);
                    console.log('Match date string:', matchDateStr);
                    console.log('Match time string:', matchTimeStr);
                    console.log('Match DateTime UTC object:', matchDateTimeUTC);
                    console.log('Match DateTime UTC milliseconds:', matchDateTimeUTC.getTime());
                    console.log('Is valid date?', isValidDate);
                    
                    if (isValidDate) {
                        console.log('Match time UTC milliseconds:', matchTimeUTC);
                        console.log('Match time UTC date:', new Date(matchTimeUTC).toISOString());
                        console.log('Match time GMT+7 (display):', new Date(matchTimeUTC).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
                        console.log('Current UTC milliseconds:', nowUTCms);
                        console.log('Current UTC date:', new Date(nowUTCms).toISOString());
                        console.log('Current GMT+7 (display):', new Date(nowUTCms).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
                        console.log('Two hours before match UTC milliseconds:', twoHoursBeforeUTC);
                        console.log('Two hours before match UTC date:', new Date(twoHoursBeforeUTC).toISOString());
                        console.log('Two hours before match GMT+7 (display):', new Date(twoHoursBeforeUTC).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
                        console.log('Time difference (ms):', nowUTCms - twoHoursBeforeUTC);
                        console.log('Time difference (hours):', (nowUTCms - twoHoursBeforeUTC) / (60 * 60 * 1000));
                    } else {
                        console.log('ERROR: Invalid match date/time!');
                    }
                    
                    console.log('Match status:', match.status);
                    console.log('Can edit?', canEdit);
                    console.log('==========================================');
                    
                    const canEditLineup = canEdit;
                    const isHome = match.team_role === "home";
                    const opponentTeam = isHome
                      ? match.away_team_name
                      : match.home_team_name;

                    return (
                      <div
                        key={match.match_id}
                        className="card border-l-4 border-blue-400"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="badge badge-info">
                                {match.tournament_name}
                              </span>
                              {match.stage && (
                                <span className="badge badge-warning">
                                  {match.stage === "group_stage"
                                    ? match.group_name
                                      ? `Vòng bảng - ${match.group_name}`
                                      : "Vòng bảng"
                                    : match.stage}
                                </span>
                              )}
                              <span className="badge badge-success">
                                {match.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-lg font-bold">
                                {isHome ? (
                                  <>
                                    <span className="text-primary-600">
                                      {match.home_team_name}
                                    </span>{" "}
                                    VS {match.away_team_name}
                                  </>
                                ) : (
                                  <>
                                    {match.home_team_name} VS{" "}
                                    <span className="text-primary-600">
                                      {match.away_team_name}
                                    </span>
                                  </>
                                )}
                              </div>
                              {match.home_score !== null &&
                                match.away_score !== null && (
                                  <div className="text-2xl font-bold text-primary-600">
                                    {match.home_score} - {match.away_score}
                                  </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaCalendarAlt />
                                <span>
                                  {new Date(match.match_date).toLocaleDateString(
                                    "vi-VN"
                                  )}{" "}
                                  {match.match_time.substring(0, 5)}
                                </span>
                              </div>
                              {match.venue_name && (
                                <div className="flex items-center gap-2">
                                  <span>📍</span>
                                  <span>{match.venue_name}</span>
                                </div>
                              )}
                            </div>
                            {!canEditLineup && (
                              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <FaExclamationTriangle />
                                <span>
                                  Không thể thay đổi đội hình (còn ít hơn 2
                                  tiếng trước trận đấu)
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleViewLineup(match)}
                            disabled={!canEditLineup || match.status === "completed"}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                              !canEditLineup || match.status === "completed"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                            title={
                              !canEditLineup
                                ? "Không thể thay đổi đội hình (còn ít hơn 2 tiếng trước trận đấu)"
                                : match.status === "completed"
                                ? "Trận đấu đã kết thúc"
                                : "Xem/Chỉnh sửa đội hình"
                            }
                          >
                            <FaFutbol />
                            <span>Đội hình</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowMatchesModal(false)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lineup Modal */}
      {showLineupModal && selectedMatch && teamDetail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setShowLineupModal(false);
            setSelectedMatch(null);
            setMatchLineup([]);
            setSelectedLineupPlayers([]);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Đội hình trận đấu
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {selectedMatch.tournament_name} -{" "}
                    {new Date(selectedMatch.match_date).toLocaleDateString(
                      "vi-VN"
                    )}{" "}
                    {selectedMatch.match_time.substring(0, 5)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLineupModal(false);
                    setSelectedMatch(null);
                    setMatchLineup([]);
                    setSelectedLineupPlayers([]);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
              {loadingLineup ? (
                <div className="text-center py-16">
                  <FaSpinner className="animate-spin text-5xl text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Đang tải đội hình...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Lineup Display */}
                  {matchLineup.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FaCheckCircle className="mr-2 text-green-600" />
                        Đội hình hiện tại
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {matchLineup.map((player) => (
                          <div
                            key={player.lineup_id}
                            className="bg-white p-3 rounded-lg border border-green-300"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                                {player.position}
                              </span>
                              <span className="text-xs font-medium text-gray-600">
                                #{player.jersey_number || "?"}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {player.full_name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lineup Selection */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FaFutbol className="mr-2 text-purple-600" />
                        Chọn đội hình (5 cầu thủ)
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          Đã chọn:
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            selectedLineupPlayers.length === 5
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {selectedLineupPlayers.length}/5
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg mb-4">
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                        <FaInfoCircle className="inline mr-2 text-blue-600" />
                        Chọn đúng 5 cầu thủ cho đội hình (phải có đủ 5 vị trí:
                        PG, SG, SF, PF, C)
                      </div>

                      {/* Players by Position */}
                      {["PG", "SG", "SF", "PF", "C"].map((position) => {
                        const positionPlayers =
                          teamDetail.players?.filter(
                            (p) => p.position === position
                          ) || [];
                        const selectedForPosition = selectedLineupPlayers.find(
                          (p) => p.position === position
                        );

                        return (
                          <div key={position} className="mb-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">
                              {position} -{" "}
                              {position === "PG"
                                ? "Point Guard"
                                : position === "SG"
                                ? "Shooting Guard"
                                : position === "SF"
                                ? "Small Forward"
                                : position === "PF"
                                ? "Power Forward"
                                : "Center"}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {positionPlayers.map((player) => {
                                const isSelected =
                                  selectedLineupPlayers.some(
                                    (p) => p.athlete_id === player.athlete_id
                                  );
                                const isSelectedForThisPosition =
                                  selectedForPosition?.athlete_id ===
                                  player.athlete_id;

                                return (
                                  <button
                                    key={player.athlete_id}
                                    onClick={() =>
                                      handleToggleLineupPlayer(
                                        player.athlete_id,
                                        position
                                      )
                                    }
                                    disabled={
                                      isSelected && !isSelectedForThisPosition
                                    }
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                      isSelectedForThisPosition
                                        ? "border-purple-500 bg-purple-100"
                                        : isSelected
                                        ? "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
                                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                          {player.full_name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          #{player.jersey_number || "?"}
                                        </p>
                                      </div>
                                      {isSelectedForThisPosition && (
                                        <FaCheckCircle className="text-purple-600 flex-shrink-0 ml-2" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowLineupModal(false);
                          setSelectedMatch(null);
                          setMatchLineup([]);
                          setSelectedLineupPlayers([]);
                        }}
                        className="btn-secondary"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveLineup}
                        disabled={
                          selectedLineupPlayers.length !== 5 || savingLineup
                        }
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                          selectedLineupPlayers.length === 5 && !savingLineup
                            ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {savingLineup ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <FaSave />
                            <span>Lưu đội hình</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Financial Modal */}
      {showFinancialModal && selectedTeamForFinancial && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  💰 Chi tiêu tài chính - Đội "{selectedTeamForFinancial.team_name}"
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
                      <p className="text-gray-600">Chưa có giao dịch tài chính nào cho đội này.</p>
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
    </div>
  );
};

export default ManageTeamsPage;
