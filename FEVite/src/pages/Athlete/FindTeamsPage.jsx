import { useState, useEffect } from "react";
import { publicAPI, athleteAPI, authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaSearch,
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaSpinner,
  FaFilter,
  FaTrophy,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaInfoCircle,
  FaEye,
  FaTshirt,
  FaRunning,
  FaTimes,
  FaRulerVertical,
  FaWeight,
  FaWallet,
} from "react-icons/fa";

const FindTeamsPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [myTeamId, setMyTeamId] = useState(null); // Team ID của user hiện tại

  // Team detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [teamDetail, setTeamDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchMyProfile();
    fetchTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [searchTerm, teams]);

  const fetchMyProfile = async () => {
    try {
      const response = await authAPI.getInfo();
      if (response.data.success) {
        setMyTeamId(response.data.data.team_id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await publicAPI.getTeams();
      setTeams(response.data.data || []);
      setFilteredTeams(response.data.data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);
    }
    setLoading(false);
  };

  const filterTeams = () => {
    if (!searchTerm) {
      setFilteredTeams(teams);
      return;
    }

    const filtered = teams.filter(
      (team) =>
        team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.coach_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filtered);
  };

  const handleViewDetails = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleViewTeamDetail = async (team) => {
    setSelectedTeam(team);
    setShowDetailModal(true);
    setLoadingDetail(true);

    try {
      // Refresh profile trước để đảm bảo có team_id mới nhất
      await fetchMyProfile();

      console.log("🔍 Fetching team detail:", team.team_id);
      console.log("👤 My team_id:", myTeamId);

      const response = await publicAPI.getTeamDetail(team.team_id);
      console.log("📋 Team detail response:", response.data);

      if (response.data.success) {
        setTeamDetail(response.data.data);
        console.log("✅ Team detail set:", {
          members_count: response.data.data.members?.length,
          isMember: response.data.data.isMember,
          player_count: response.data.data.team?.player_count,
        });
      }
    } catch (error) {
      console.error("Error fetching team detail:", error);
      alert("Không thể tải thông tin đội");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRequestJoin = async (team) => {
    // Show entry fee info if applicable
    const entryFeeText =
      team.entry_fee > 0
        ? `\n💰 Lệ phí gia nhập: ${new Intl.NumberFormat("vi-VN").format(
            team.entry_fee
          )} VND\n(Tiền sẽ bị trừ khi huấn luyện viên duyệt yêu cầu của bạn)\n`
        : "\n🆓 Đội này miễn phí gia nhập\n";

    // Prompt for message
    const message = prompt(
      `Gửi yêu cầu gia nhập đội ${team.team_name}${entryFeeText}\nBạn có muốn để lại lời nhắn cho đội không? (Có thể bỏ trống):`
    );

    if (message === null) return; // User cancelled

    try {
      const response = await athleteAPI.sendJoinRequest(team.team_id, message);

      if (response.data.success) {
        alert(
          `✅ ${response.data.message}\n\nBạn có thể xem trạng thái yêu cầu trong trang Hồ sơ.`
        );
        // Could refresh teams or update UI here
      }
    } catch (error) {
      console.error("Join request error:", error);

      const errorData = error.response?.data;

      // Check if error is about insufficient balance
      if (errorData?.required && errorData?.available !== undefined) {
        // Format numbers
        const required = new Intl.NumberFormat("vi-VN").format(
          errorData.required
        );
        const available = new Intl.NumberFormat("vi-VN").format(
          errorData.available
        );
        const shortage = new Intl.NumberFormat("vi-VN").format(
          errorData.shortage
        );

        alert(
          `❌ KHÔNG ĐỦ TIỀN\n\n` +
            `Lệ phí gia nhập: ${required} VND\n` +
            `Số dư của bạn: ${available} VND\n` +
            `Bạn còn thiếu: ${shortage} VND\n\n` +
            `Vui lòng nạp thêm tiền để có thể gia nhập đội này.`
        );
      } else {
        alert(errorData?.message || "Có lỗi xảy ra khi gửi yêu cầu");
      }
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
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-primary-100 p-4 rounded-full">
            <FaUsers className="text-4xl text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tìm kiếm đội bóng
            </h1>
            <p className="text-gray-600 mt-1">
              Tìm và gia nhập đội bóng phù hợp với bạn
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <FaSearch className="text-primary-600 text-xl" />
          <h2 className="text-lg font-semibold text-gray-900">Tìm kiếm</h2>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên đội, tên viết tắt, huấn luyện viên..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <FaFilter />
            <span>Bộ lọc</span>
          </button>
        </div>

        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            Tìm thấy <strong>{filteredTeams.length}</strong> đội
          </div>
        )}
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="card text-center py-12">
          <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm
              ? "Không tìm thấy đội nào phù hợp"
              : "Chưa có đội bóng nào"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.team_id}
              className="card hover:shadow-xl transition-all duration-300 group"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-lg">
                    <FaUsers className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {team.team_name}
                    </h3>
                    {team.short_name && (
                      <p className="text-sm text-gray-500">{team.short_name}</p>
                    )}
                  </div>
                </div>
                {team.is_active ? (
                  <span className="badge badge-success">
                    <FaCheckCircle className="inline mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="badge badge-error">Inactive</span>
                )}
              </div>

              {/* Team Info */}
              <div className="space-y-2 mb-4 text-sm">
                {team.coach_name && (
                  <div className="flex items-center text-gray-600">
                    <FaUser className="mr-2 text-gray-400" />
                    <span>HLV: {team.coach_name}</span>
                  </div>
                )}
                {team.coach_phone && (
                  <div className="flex items-center text-gray-600">
                    <FaPhone className="mr-2 text-gray-400" />
                    <span>{team.coach_phone}</span>
                  </div>
                )}
                {team.coach_email && (
                  <div className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <span className="truncate">{team.coach_email}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2 text-gray-400" />
                  <span>
                    Thành viên: {team.player_count}/12
                    {team.player_count >= 12 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Đã đủ
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaWallet className="mr-2 text-green-600" />
                  <span className="font-semibold">
                    Lệ phí:{" "}
                    {team.entry_fee > 0
                      ? new Intl.NumberFormat("vi-VN").format(team.entry_fee) +
                        " VND"
                      : "Miễn phí"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {myTeamId ? (
                  // User đã có đội → Chỉ hiển thị nút "Xem"
                  <button
                    onClick={() => handleViewTeamDetail(team)}
                    className="flex-1 btn-primary text-sm flex items-center justify-center space-x-2"
                  >
                    <FaEye />
                    <span>Xem chi tiết</span>
                  </button>
                ) : (
                  // User chưa có đội → Hiển thị "Chi tiết" + "Gia nhập"
                  <>
                    <button
                      onClick={() => handleViewDetails(team)}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-2"
                    >
                      <FaInfoCircle />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      onClick={() => handleRequestJoin(team)}
                      className={`flex-1 text-sm flex items-center justify-center space-x-2 ${
                        !team.is_active || team.player_count >= 12
                          ? "btn-disabled opacity-50 cursor-not-allowed"
                          : "btn-primary"
                      }`}
                      disabled={!team.is_active || team.player_count >= 12}
                      title={
                        team.player_count >= 12
                          ? "Đội đã đủ 12 thành viên"
                          : !team.is_active
                          ? "Đội không hoạt động"
                          : ""
                      }
                    >
                      <FaUserPlus />
                      <span>
                        {team.player_count >= 12 ? "Đã đủ" : "Gia nhập"}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Card */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-3">
            <FaUsers className="text-3xl text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng số đội</p>
              <p className="text-2xl font-bold text-blue-900">{teams.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center space-x-3">
            <FaCheckCircle className="text-3xl text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">
                Đội đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-900">
                {teams.filter((t) => t.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center space-x-3">
            <FaTrophy className="text-3xl text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Kết quả tìm kiếm
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {filteredTeams.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Detail Modal (for users without team) */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaUsers className="text-3xl" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedTeam.team_name}
                    </h2>
                    {selectedTeam.short_name && (
                      <p className="text-primary-100">
                        {selectedTeam.short_name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái
                </h3>
                {selectedTeam.is_active ? (
                  <span className="badge badge-success">
                    <FaCheckCircle className="inline mr-1" />
                    Đang hoạt động
                  </span>
                ) : (
                  <span className="badge badge-error">Không hoạt động</span>
                )}
              </div>

              {/* Coach Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Thông tin huấn luyện viên
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {selectedTeam.coach_name && (
                    <div className="flex items-center">
                      <FaUser className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Họ và tên</p>
                        <p className="font-medium">{selectedTeam.coach_name}</p>
                      </div>
                    </div>
                  )}
                  {selectedTeam.coach_phone && (
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="font-medium">
                          {selectedTeam.coach_phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTeam.coach_email && (
                    <div className="flex items-center">
                      <FaEnvelope className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">
                          {selectedTeam.coach_email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleRequestJoin(selectedTeam);
                    setShowModal(false);
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 ${
                    !selectedTeam.is_active || selectedTeam.player_count >= 12
                      ? "btn-disabled opacity-50 cursor-not-allowed"
                      : "btn-primary"
                  }`}
                  disabled={
                    !selectedTeam.is_active || selectedTeam.player_count >= 12
                  }
                  title={
                    selectedTeam.player_count >= 12
                      ? "Đội đã đủ 12 thành viên"
                      : !selectedTeam.is_active
                      ? "Đội không hoạt động"
                      : ""
                  }
                >
                  <FaUserPlus />
                  <span>
                    {selectedTeam.player_count >= 12
                      ? "Đội đã đủ thành viên"
                      : "Gửi yêu cầu gia nhập"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Team Detail Modal (for users with team) */}
      {showDetailModal && selectedTeam && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                    <FaUsers className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedTeam.team_name}
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">
                      {selectedTeam.short_name || "Chi tiết đội"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {loadingDetail ? (
                <div className="text-center py-16">
                  <FaSpinner className="animate-spin text-5xl text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
                </div>
              ) : teamDetail ? (
                <div className="space-y-6">
                  {/* Coach Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <FaUser className="mr-2" />
                      Thông tin huấn luyện viên
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                        <FaUser className="text-blue-500 text-xl" />
                        <div>
                          <p className="text-xs text-gray-500">Họ và tên</p>
                          <p className="font-semibold text-gray-900">
                            {teamDetail.team.coach_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                        <FaPhone className="text-blue-500 text-xl" />
                        <div>
                          <p className="text-xs text-gray-500">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">
                            {teamDetail.team.coach_phone || "Chưa có"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                        <FaEnvelope className="text-blue-500 text-xl" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900 truncate">
                            {teamDetail.team.coach_email}
                          </p>
                        </div>
                      </div>
                      {teamDetail.team.years_of_experience && (
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                          <FaTrophy className="text-blue-500 text-xl" />
                          <div>
                            <p className="text-xs text-gray-500">Kinh nghiệm</p>
                            <p className="font-semibold text-gray-900">
                              {teamDetail.team.years_of_experience} năm
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Members List - Only visible if user is member of this team */}
                  {teamDetail.isMember ? (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <FaUsers className="mr-2 text-primary-600" />
                        Danh sách thành viên ({teamDetail.members?.length || 0}
                        /12)
                      </h3>

                      {!teamDetail.members ||
                      teamDetail.members.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <FaUser className="text-7xl text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-medium">
                            Chưa có thành viên nào
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teamDetail.members.map((member, index) => (
                            <div
                              key={member.athlete_id}
                              className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="relative">
                                  <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-lg text-white">
                                    <FaUser className="text-xl" />
                                  </div>
                                  {member.jersey_number && (
                                    <div className="absolute -top-1 -right-1 bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                      #{member.jersey_number}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">
                                    {member.full_name}
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    {member.position && (
                                      <div className="flex items-center">
                                        <FaRunning className="mr-2 text-primary-500" />
                                        <span>{member.position}</span>
                                      </div>
                                    )}
                                    {member.height && (
                                      <div className="flex items-center">
                                        <FaRulerVertical className="mr-2 text-primary-500" />
                                        <span>{member.height}cm</span>
                                      </div>
                                    )}
                                    {member.weight && (
                                      <div className="flex items-center">
                                        <FaWeight className="mr-2 text-primary-500" />
                                        <span>{member.weight}kg</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Not a member of this team - Show privacy notice
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                      <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="text-4xl text-gray-400" />
                      </div>
                      <p className="text-gray-700 text-lg font-semibold mb-2">
                        Danh sách thành viên không công khai
                      </p>
                      <p className="text-gray-500 text-sm">
                        Chỉ thành viên của đội mới có thể xem danh sách này
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-600 text-lg">
                    Không thể tải dữ liệu đội
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTeamsPage;
