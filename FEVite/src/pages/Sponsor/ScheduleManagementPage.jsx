import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sponsorAPI, publicAPI } from "../../services/api";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaClock,
  FaEdit,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { format } from "date-fns";

const ScheduleManagementPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("schedule"); // "schedule", "venues", "referees"
  const [venues, setVenues] = useState([]);
  const [referees, setReferees] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editForm, setEditForm] = useState({
    venue_id: "",
    referee_id: "",
    match_date: "",
    match_time: "",
  });
  const [saving, setSaving] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [matchLineups, setMatchLineups] = useState({});
  const [loadingLineups, setLoadingLineups] = useState({});

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentDetail();
      fetchSchedule();
      fetchVenues();
      fetchReferees();
    }
  }, [tournamentId]);

  const fetchTournamentDetail = async () => {
    try {
      const response = await sponsorAPI.getTournamentDetail(tournamentId);
      if (response.data.success) {
        setTournament(response.data.data);
      }
    } catch (err) {
      setError("Lỗi khi tải thông tin giải đấu");
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await sponsorAPI.getTournamentSchedule(tournamentId);
      if (response.data.success) {
        setSchedule(response.data.data);
      }
    } catch (err) {
      setError("Lỗi khi tải lịch thi đấu");
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await sponsorAPI.getVenues();
      if (response.data.success) {
        setVenues(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
    }
  };

  const fetchReferees = async () => {
    try {
      const response = await sponsorAPI.getReferees();
      if (response.data.success) {
        setReferees(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching referees:", err);
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setEditForm({
      venue_id: match.venue_id || "",
      referee_id: match.main_referee_id || "",
      match_date: match.match_date || "",
      match_time: match.match_time || "",
    });
  };

  const handleSaveMatch = async () => {
    try {
      setSaving(true);
      setError("");

      const updateData = {};
      if (editForm.venue_id) updateData.venue_id = parseInt(editForm.venue_id);
      if (editForm.referee_id !== undefined) {
        updateData.referee_id = editForm.referee_id
          ? parseInt(editForm.referee_id)
          : null;
      }
      if (editForm.match_date) updateData.match_date = editForm.match_date;
      if (editForm.match_time) updateData.match_time = editForm.match_time;

      const response = await sponsorAPI.updateMatch(
        editingMatch.match_id,
        updateData
      );
      if (response.data.success) {
        await fetchSchedule();
        setEditingMatch(null);
        setEditForm({
          venue_id: "",
          referee_id: "",
          match_date: "",
          match_time: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật trận đấu");
    } finally {
      setSaving(false);
    }
  };

  const getVenueName = (venueId) => {
    const venue = venues.find((v) => v.venue_id === venueId);
    return venue ? venue.venue_name : "Chưa chọn";
  };

  const getRefereeName = (refereeId) => {
    if (!refereeId) return "Chưa phân công";
    const referee = referees.find((r) => r.user_id === refereeId);
    return referee ? referee.full_name : "Không tìm thấy";
  };

  const fetchMatchLineups = async (matchId) => {
    if (matchLineups[matchId]) {
      // Already loaded
      return;
    }

    try {
      setLoadingLineups((prev) => ({ ...prev, [matchId]: true }));
      const response = await publicAPI.getMatchLineups(matchId);
      if (response.data.success) {
        setMatchLineups((prev) => ({
          ...prev,
          [matchId]: response.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching match lineups:", error);
    } finally {
      setLoadingLineups((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const handleToggleMatchDetail = (matchId) => {
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
    } else {
      setExpandedMatchId(matchId);
      fetchMatchLineups(matchId);
    }
  };

  const getPositionLabel = (position) => {
    const labels = {
      PG: "Hậu vệ dẫn bóng",
      SG: "Hậu vệ ghi điểm",
      SF: "Tiền phong phụ",
      PF: "Tiền phong chính",
      C: "Trung phong",
    };
    const label = labels[position] || position;
    return `${label} (${position})`;
  };

  const renderMatchCard = (match) => {
    const isEditing = editingMatch?.match_id === match.match_id;
    const isExpanded = expandedMatchId === match.match_id;
    
    // Check if this is a placeholder match (playoff with no teams assigned yet)
    const isPlaceholder = !match.home_team_id || !match.away_team_id;
    const homeTeamDisplay = match.home_team_name || match.home_team_placeholder || "TBD";
    const awayTeamDisplay = match.away_team_name || match.away_team_placeholder || "TBD";

    return (
      <div
        key={match.match_id}
        className={`p-4 rounded-lg border-2 ${
          isEditing ? "border-blue-500 bg-blue-50" : 
          isPlaceholder ? "border-yellow-300 bg-yellow-50" : "border-gray-200"
        }`}
      >
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">
                {homeTeamDisplay} vs {awayTeamDisplay}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMatch}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheck />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingMatch(null);
                    setEditForm({
                      venue_id: "",
                      referee_id: "",
                      match_date: "",
                      match_time: "",
                    });
                  }}
                  className="btn-secondary text-sm"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="mb-3 space-y-2">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-600">
                  <FaMapMarkerAlt className="inline mr-1" />
                  Chọn nhanh sân
                </label>
                <div className="flex flex-wrap gap-2">
                  {venues
                    .filter((v) => v.is_available === 1)
                    .slice(0, 4)
                    .map((v) => (
                      <button
                        key={v.venue_id}
                        onClick={() =>
                          setEditForm({ ...editForm, venue_id: v.venue_id })
                        }
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          editForm.venue_id === String(v.venue_id)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                        }`}
                      >
                        {v.venue_name}
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-600">
                  <FaUserTie className="inline mr-1" />
                  Chọn nhanh trọng tài
                </label>
                <div className="flex flex-wrap gap-2">
                  {referees.slice(0, 4).map((r) => (
                    <button
                      key={r.user_id}
                      onClick={() =>
                        setEditForm({ ...editForm, referee_id: r.user_id })
                      }
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        editForm.referee_id === String(r.user_id)
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                      }`}
                    >
                      {r.full_name}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setEditForm({ ...editForm, referee_id: "" })
                    }
                    className="px-2 py-1 text-xs rounded border bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Sân</label>
                <select
                  value={editForm.venue_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, venue_id: e.target.value })
                  }
                  className="input text-sm"
                >
                  <option value="">Chọn sân</option>
                  {venues.map((v) => (
                    <option key={v.venue_id} value={v.venue_id}>
                      {v.venue_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Trọng tài
                </label>
                <select
                  value={editForm.referee_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, referee_id: e.target.value })
                  }
                  className="input text-sm"
                >
                  <option value="">Chưa phân công</option>
                  {referees.map((r) => (
                    <option key={r.user_id} value={r.user_id}>
                      {r.full_name} ({r.certification_level})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Ngày</label>
                <input
                  type="date"
                  value={editForm.match_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, match_date: e.target.value })
                  }
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Giờ</label>
                <input
                  type="time"
                  value={editForm.match_time}
                  onChange={(e) =>
                    setEditForm({ ...editForm, match_time: e.target.value })
                  }
                  className="input text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {homeTeamDisplay} vs {awayTeamDisplay}
                  </h4>
                  {isPlaceholder && (
                    <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                      Chưa xác định
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {match.group_name && `Bảng ${match.group_name}`}
                  {match.group_name && " - "}
                  {match.stage === "group_stage"
                    ? "Vòng bảng"
                    : match.stage === "quarterfinal"
                    ? "Tứ kết"
                    : match.stage === "semifinal"
                    ? "Bán kết"
                    : "Chung kết"}
                  {match.match_round && ` - Trận ${match.match_round}`}
                </p>
              </div>
              <button
                onClick={() => handleEditMatch(match)}
                className="btn-secondary text-sm"
              >
                <FaEdit />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-500" />
                <span>
                  {match.venue_name || getVenueName(match.venue_id) || "Chưa chọn"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserTie className="text-gray-500" />
                <span>
                  {match.referee_name ||
                    getRefereeName(match.main_referee_id) ||
                    "Chưa phân công"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <span>
                  {match.match_date
                    ? format(new Date(match.match_date), "dd/MM/yyyy")
                    : "Chưa có"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-500" />
                <span>{match.match_time || "Chưa có"}</span>
              </div>
            </div>

            {/* Placeholder Info for Playoff Matches */}
            {isPlaceholder && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="flex items-start gap-2 text-sm">
                  <FaInfoCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-600">
                    <p className="font-medium text-yellow-800">Đội hình chưa xác định</p>
                    <p className="text-xs mt-1">
                      Các đội tham gia trận này sẽ được xác định sau khi vòng{" "}
                      {match.stage === "semifinal" ? "tứ kết" : 
                       match.stage === "final" ? "bán kết" : "bảng"} kết thúc.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Score and Detail Button - Only for non-placeholder matches */}
            {!isPlaceholder && match.home_score !== null && match.away_score !== null && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">
                    {match.home_score} - {match.away_score}
                  </div>
                  <button
                    onClick={() => handleToggleMatchDetail(match.match_id)}
                    className="btn-secondary text-xs"
                  >
                    {isExpanded ? "📋 Ẩn đội hình" : "👥 Xem đội hình"}
                  </button>
                </div>
              </div>
            )}

            {/* Expanded Lineups Section - Only for non-placeholder matches */}
            {!isPlaceholder && isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {loadingLineups[match.match_id] ? (
                  <div className="text-center py-4">
                    <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600 text-sm">Đang tải đội hình...</p>
                  </div>
                ) : matchLineups[match.match_id] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home Team Lineup */}
                    <div>
                      <h5 className="font-semibold text-base mb-3 text-blue-600">
                        {homeTeamDisplay}
                      </h5>
                      {matchLineups[match.match_id].home_team_lineup.length > 0 ? (
                        <div className="space-y-2">
                          {["PG", "SG", "SF", "PF", "C"].map((pos) => {
                            const player = matchLineups[match.match_id].home_team_lineup.find(
                              (p) => p.position === pos
                            );
                            return (
                              <div
                                key={pos}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm"
                              >
                                <span className="font-medium w-32 text-xs flex-shrink-0">
                                  {getPositionLabel(pos)}
                                </span>
                                {player ? (
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="font-semibold text-sm flex-shrink-0">
                                      #{player.jersey_number}
                                    </span>
                                    <span className="text-sm truncate">
                                      {player.full_name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Chưa có</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có đội hình</p>
                      )}
                    </div>
                    {/* Away Team Lineup */}
                    <div>
                      <h5 className="font-semibold text-base mb-3 text-blue-600">
                        {awayTeamDisplay}
                      </h5>
                      {matchLineups[match.match_id].away_team_lineup.length > 0 ? (
                        <div className="space-y-2">
                          {["PG", "SG", "SF", "PF", "C"].map((pos) => {
                            const player = matchLineups[match.match_id].away_team_lineup.find(
                              (p) => p.position === pos
                            );
                            return (
                              <div
                                key={pos}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm"
                              >
                                <span className="font-medium w-32 text-xs flex-shrink-0">
                                  {getPositionLabel(pos)}
                                </span>
                                {player ? (
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="font-semibold text-sm flex-shrink-0">
                                      #{player.jersey_number}
                                    </span>
                                    <span className="text-sm truncate">
                                      {player.full_name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Chưa có</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có đội hình</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">Không thể tải đội hình</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/sponsor/tournaments/${tournamentId}`)}
          className="btn-secondary mb-4 flex items-center gap-2"
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" />
          Quản lý lịch thi đấu
        </h1>
        {tournament && (
          <p className="text-gray-600 mt-2">{tournament.tournament_name}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 font-medium ${
            activeTab === "schedule"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Lịch thi đấu
        </button>
        <button
          onClick={() => setActiveTab("venues")}
          className={`px-4 py-2 font-medium ${
            activeTab === "venues"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Sân thi đấu
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <FaInfoCircle /> {error}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div>
          {loading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-6xl mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Đang tải lịch thi đấu...</p>
            </div>
          ) : !schedule ? (
            <div className="card text-center py-8">
              <FaInfoCircle className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Chưa có lịch thi đấu. Hãy tạo lịch thi đấu từ trang chi tiết
                giải.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group Stage */}
              {schedule.schedule?.group_stage?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Vòng bảng</h2>
                  <div className="space-y-3">
                    {schedule.schedule.group_stage.map((match) =>
                      renderMatchCard(match)
                    )}
                  </div>
                </div>
              )}

              {/* Quarterfinal */}
              {schedule.schedule?.quarterfinal?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Tứ kết</h2>
                  <div className="space-y-3">
                    {schedule.schedule.quarterfinal.map((match) =>
                      renderMatchCard(match)
                    )}
                  </div>
                </div>
              )}

              {/* Semifinal */}
              {schedule.schedule?.semifinal?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Bán kết</h2>
                  <div className="space-y-3">
                    {schedule.schedule.semifinal.map((match) =>
                      renderMatchCard(match)
                    )}
                  </div>
                </div>
              )}

              {/* Final */}
              {schedule.schedule?.final?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Chung kết</h2>
                  <div className="space-y-3">
                    {schedule.schedule.final.map((match) =>
                      renderMatchCard(match)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Venues Tab */}
      {activeTab === "venues" && (
        <VenuesTab venues={venues} tournamentId={tournamentId} />
      )}
    </div>
  );
};

// Venues Tab Component
const VenuesTab = ({ venues, tournamentId }) => {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueSchedule, setVenueSchedule] = useState([]);
  const [venueAvailability, setVenueAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchVenueSchedule = async (venueId) => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await sponsorAPI.getVenueSchedule(venueId, params);
      if (response.data.success) {
        setVenueSchedule(response.data.data.matches || []);
      }
    } catch (err) {
      console.error("Error fetching venue schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueAvailability = async (venueId) => {
    try {
      setLoading(true);
      if (!startDate || !endDate) {
        alert("Vui lòng chọn khoảng thời gian");
        return;
      }

      const response = await sponsorAPI.getVenueAvailability(venueId, {
        start_date: startDate,
        end_date: endDate,
      });
      if (response.data.success) {
        setVenueAvailability(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching venue availability:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Chọn sân thi đấu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.venue_id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedVenue?.venue_id === venue.venue_id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => {
                setSelectedVenue(venue);
                fetchVenueSchedule(venue.venue_id);
              }}
            >
              <h4 className="font-semibold">{venue.venue_name}</h4>
              <p className="text-sm text-gray-600">{venue.address}</p>
              <p className="text-sm text-gray-600">
                Sức chứa: {venue.capacity?.toLocaleString()} người
              </p>
              <span
                className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  venue.is_available === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {venue.is_available === 1 ? "Sẵn sàng" : "Không sẵn sàng"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedVenue && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Thông tin sân: {selectedVenue.venue_name}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => fetchVenueSchedule(selectedVenue.venue_id)}
              className="btn-primary"
            >
              Xem lịch
            </button>
          </div>

          {venueSchedule.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Lịch thi đấu</h4>
              <div className="space-y-2">
                {venueSchedule.map((match) => (
                  <div
                    key={match.match_id}
                    className="p-3 bg-gray-50 rounded text-sm"
                  >
                    <p className="font-medium">
                      {match.home_team_name} vs {match.away_team_name}
                    </p>
                    <p className="text-gray-600">
                      {format(new Date(match.match_date), "dd/MM/yyyy")} -{" "}
                      {match.match_time}
                    </p>
                    <p className="text-gray-600">
                      {match.tournament_name} - {match.stage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



export default ScheduleManagementPage;
