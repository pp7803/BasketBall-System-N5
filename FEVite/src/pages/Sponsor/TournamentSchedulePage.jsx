import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sponsorAPI } from "../../services/api";
import { format } from "date-fns";
import TournamentBracket from "../../components/TournamentBracket";
import {
  FaTrophy,
  FaCalendarAlt,
  FaUsers,
  FaPlayCircle,
  FaPauseCircle,
  FaSpinner,
  FaInfoCircle,
  FaCalendarCheck,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaUserTie,
  FaEye,
} from "react-icons/fa";

const TournamentSchedulePage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleMatches, setScheduleMatches] = useState([]);
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [matchesPerDay, setMatchesPerDay] = useState(2);
  const [timeSlots, setTimeSlots] = useState([
    "09:00",
    "11:00",
    "14:00",
    "16:00",
  ]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  
  // Playoff matches state (2 semifinal + 1 final)
  const [playoffMatches, setPlayoffMatches] = useState([
    { stage: 'semifinal', match_round: 1, venue_id: '', referee_id: '', match_date: '', match_time: '14:00' },
    { stage: 'semifinal', match_round: 2, venue_id: '', referee_id: '', match_date: '', match_time: '16:00' },
    { stage: 'final', match_round: 1, venue_id: '', referee_id: '', match_date: '', match_time: '15:00' },
  ]);

  // Helper function to format date string for input (convert from UTC to GMT+7)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Parse the UTC date string (with Z)
    const utcDate = new Date(dateString);

    // Convert to GMT+7 (Vietnam timezone) by adding 7 hours
    const gmt7Date = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

    // Format as YYYY-MM-DD for input
    const year = gmt7Date.getUTCFullYear();
    const month = String(gmt7Date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(gmt7Date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchTournaments();
    fetchVenues();
    fetchReferees();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await sponsorAPI.getMyTournaments();
      console.log("🔍 fetchTournaments response:", response);
      console.log("🔍 response.data:", response.data);
      if (response.data.success) {
        // Filter tournaments that have teams and are in registration/ongoing status
        const eligibleTournaments = response.data.data.filter(
          (t) =>
            (t.status === "registration" || t.status === "ongoing") &&
            t.current_teams > 0
        );
        console.log("🔍 eligibleTournaments:", eligibleTournaments);
        eligibleTournaments.forEach((t) => {
          console.log(`🔍 Tournament ${t.tournament_id}:`, {
            name: t.tournament_name,
            start_date: t.start_date,
            end_date: t.end_date,
            start_date_type: typeof t.start_date,
            end_date_type: typeof t.end_date,
          });
        });

        // Check which tournaments have schedules
        const tournamentsWithSchedule = await Promise.all(
          eligibleTournaments.map(async (tournament) => {
            try {
              const scheduleResponse = await sponsorAPI.getTournamentSchedule(
                tournament.tournament_id
              );
              if (scheduleResponse.data.success) {
                const schedule = scheduleResponse.data.data;
                // Check if there are groups or matches
                const hasSchedule =
                  (schedule.groups && schedule.groups.length > 0) ||
                  (schedule.schedule &&
                    Object.values(schedule.schedule).some(
                      (matches) => matches && matches.length > 0
                    ));
                return { ...tournament, hasSchedule };
              }
              return { ...tournament, hasSchedule: false };
            } catch (err) {
              // If error (e.g., 404), tournament has no schedule
              return { ...tournament, hasSchedule: false };
            }
          })
        );

        setTournaments(tournamentsWithSchedule);
      }
    } catch (err) {
      console.error("Fetch tournaments error:", err);
      setError("Lỗi khi tải danh sách giải đấu");
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

  // Open schedule modal and load data
  const handleOpenScheduleModal = async (tournament) => {
    console.log("🔍 handleOpenScheduleModal - tournament:", tournament);
    console.log("🔍 tournament.start_date:", tournament.start_date);
    console.log("🔍 tournament.end_date:", tournament.end_date);
    console.log(
      "🔍 formatDateForInput(start_date):",
      formatDateForInput(tournament.start_date)
    );
    console.log(
      "🔍 formatDateForInput(end_date):",
      formatDateForInput(tournament.end_date)
    );

    setSelectedTournament(tournament);
    setShowScheduleModal(true);
    setLoadingSchedule(true);
    setError("");

    try {
      // Load teams
      const teamsResponse = await sponsorAPI.getTournamentTeams(
        tournament.tournament_id
      );
      console.log("🔍 teamsResponse:", teamsResponse);
      console.log("🔍 teamsResponse.data:", teamsResponse.data);
      if (teamsResponse.data.success) {
        const loadedTeams = teamsResponse.data.data.teams || [];
        console.log("🔍 loadedTeams:", loadedTeams);
        setTeams(loadedTeams);

        // Validate team count
        if (loadedTeams.length !== 8 && loadedTeams.length !== 16) {
          setError(
            `Giải đấu phải có đúng 8 hoặc 16 đội. Hiện tại có ${loadedTeams.length} đội.`
          );
          setLoadingSchedule(false);
          return;
        }

        // Use tournament's start_date and end_date (convert from UTC to GMT+7)
        const tournamentStartDate = tournament.start_date
          ? formatDateForInput(tournament.start_date)
          : new Date().toISOString().split("T")[0];
        const tournamentEndDate = tournament.end_date
          ? formatDateForInput(tournament.end_date)
          : new Date().toISOString().split("T")[0];
        console.log("🔍 tournamentStartDate:", tournamentStartDate);
        setScheduleStartDate(tournamentStartDate);
        
        // Set playoff matches dates (semifinals on day before final, final on end_date)
        const finalDate = new Date(tournamentEndDate);
        const semifinalDate = new Date(finalDate);
        semifinalDate.setDate(semifinalDate.getDate() - 1);
        const semifinalDateStr = semifinalDate.toISOString().split('T')[0];
        
        setPlayoffMatches([
          { stage: 'semifinal', match_round: 1, venue_id: '', referee_id: '', match_date: semifinalDateStr, match_time: '14:00' },
          { stage: 'semifinal', match_round: 2, venue_id: '', referee_id: '', match_date: semifinalDateStr, match_time: '16:00' },
          { stage: 'final', match_round: 1, venue_id: '', referee_id: '', match_date: tournamentEndDate, match_time: '15:00' },
        ]);

        // Generate matches with tournament's start_date
        generateGroupStageMatches(
          loadedTeams,
          tournamentStartDate,
          matchesPerDay,
          timeSlots
        );
      }
    } catch (err) {
      console.error("Error loading schedule data:", err);
      setError("Lỗi khi tải dữ liệu lập lịch");
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Generate group stage matches automatically (interleaved: A, B, A, B, ...)
  const generateGroupStageMatches = (
    loadedTeams,
    startDate = null,
    perDay = null,
    slots = null
  ) => {
    const teamsPerGroup = loadedTeams.length / 2; // 4 for 8 teams, 8 for 16 teams
    const groupA = loadedTeams.slice(0, teamsPerGroup);
    const groupB = loadedTeams.slice(teamsPerGroup);

    const useStartDate =
      startDate || scheduleStartDate || new Date().toISOString().split("T")[0];
    const usePerDay = perDay !== null ? perDay : matchesPerDay;
    const useSlots = slots || timeSlots;

    // Generate Group A matches first (don't push to final array yet)
    const groupAMatches = [];
    for (let i = 0; i < groupA.length; i++) {
      for (let j = i + 1; j < groupA.length; j++) {
        groupAMatches.push({
          home_team_id: groupA[i].team_id,
          home_team_name: groupA[i].team_name,
          away_team_id: groupA[j].team_id,
          away_team_name: groupA[j].team_name,
          group: "A",
          venue_id: "",
          referee_id: "",
        });
      }
    }

    // Generate Group B matches
    const groupBMatches = [];
    for (let i = 0; i < groupB.length; i++) {
      for (let j = i + 1; j < groupB.length; j++) {
        groupBMatches.push({
          home_team_id: groupB[i].team_id,
          home_team_name: groupB[i].team_name,
          away_team_id: groupB[j].team_id,
          away_team_name: groupB[j].team_name,
          group: "B",
          venue_id: "",
          referee_id: "",
        });
      }
    }

    // Interleave matches: A, B, A, B, ... with proper time assignment
    const matches = [];
    let groupAIndex = 0;
    let groupBIndex = 0;
    let matchIndex = 0;
    
    // Calculate time slots sequentially
    let currentDayOffset = 0;
    let currentSlotIndex = 0;
    
    console.log("🔍 Starting match generation:", {
      groupAMatches: groupAMatches.length,
      groupBMatches: groupBMatches.length,
      startDate: useStartDate,
      matchesPerDay: usePerDay,
      timeSlots: useSlots
    });
    
    // Strictly interleave: A, B, A, B, ...
    while (groupAIndex < groupAMatches.length || groupBIndex < groupBMatches.length) {
      // Determine which group to use: strict alternation
      const shouldUseGroupA = 
        groupAIndex < groupAMatches.length && 
        (groupBIndex >= groupBMatches.length || matchIndex % 2 === 0);
      
      const match = shouldUseGroupA 
        ? groupAMatches[groupAIndex++] 
        : groupBMatches[groupBIndex++];
      
      // Calculate date and time for this match
      const matchDate = new Date(useStartDate);
      matchDate.setDate(matchDate.getDate() + currentDayOffset);
      const dateStr = matchDate.toISOString().split("T")[0];
      const timeStr = useSlots[currentSlotIndex] || "09:00";
      
      matches.push({
        match_id: `temp_${matchIndex}`,
        ...match,
        match_date: dateStr,
        match_time: timeStr,
      });
      
      console.log(`🔍 Match ${matchIndex}: Group ${match.group} - ${match.home_team_name} vs ${match.away_team_name} on ${dateStr} at ${timeStr}`);
      
      // Move to next time slot
      currentSlotIndex++;
      
      // Check if we need to move to next day
      if (currentSlotIndex >= useSlots.length) {
        currentSlotIndex = 0;
        currentDayOffset++;
      }
      
      // Alternative: check if we've reached matches_per_day limit
      // Count matches on current date
      const matchesToday = matches.filter(m => m.match_date === dateStr).length;
      if (matchesToday >= usePerDay && currentSlotIndex !== 0) {
        currentSlotIndex = 0;
        currentDayOffset++;
      }
      
      matchIndex++;
    }

    console.log("🔍 Generated matches:", matches);
    setScheduleMatches(matches);
  };

  // Update match in schedule
  const updateScheduleMatch = (matchId, field, value) => {
    setScheduleMatches((prev) =>
      prev.map((match) =>
        match.match_id === matchId ? { ...match, [field]: value } : match
      )
    );
  };

  // Phân bổ tự động sân cho các trận đấu
  const autoAssignVenues = () => {
    const availableVenues = venues.filter((v) => v.is_available === 1);
    if (availableVenues.length === 0) {
      setError("Không có sân nào khả dụng");
      return;
    }

    // Nhóm các trận theo ngày
    const matchesByDate = {};
    scheduleMatches.forEach((match) => {
      if (match.match_date) {
        if (!matchesByDate[match.match_date]) {
          matchesByDate[match.match_date] = [];
        }
        matchesByDate[match.match_date].push(match);
      }
    });

    // Phân bổ sân cho từng ngày
    const updatedMatches = [...scheduleMatches];
    Object.keys(matchesByDate).forEach((date) => {
      const dayMatches = matchesByDate[date];
      // Shuffle venues để phân bổ đều
      const shuffledVenues = [...availableVenues].sort(
        () => Math.random() - 0.5
      );

      dayMatches.forEach((match, idx) => {
        const venueIndex = idx % shuffledVenues.length;
        const venue = shuffledVenues[venueIndex];
        const matchIndex = updatedMatches.findIndex(
          (m) => m.match_id === match.match_id
        );
        if (matchIndex !== -1) {
          updatedMatches[matchIndex] = {
            ...updatedMatches[matchIndex],
            venue_id: venue.venue_id,
          };
        }
      });
    });

    setScheduleMatches(updatedMatches);
  };

  // Phân bổ tự động trọng tài cho các trận đấu
  const autoAssignReferees = () => {
    if (referees.length === 0) {
      setError("Không có trọng tài nào");
      return;
    }

    // Nhóm các trận theo ngày và sắp xếp theo ngày
    const matchesByDate = {};
    scheduleMatches.forEach((match) => {
      if (match.match_date) {
        if (!matchesByDate[match.match_date]) {
          matchesByDate[match.match_date] = [];
        }
        matchesByDate[match.match_date].push(match);
      }
    });

    const sortedDates = Object.keys(matchesByDate).sort();
    const updatedMatches = [...scheduleMatches];
    const refereeUsageByDate = {}; // Track referee usage by date: { date: [referee_id, ...] }
    const shuffledReferees = [...referees].sort(() => Math.random() - 0.5);

    sortedDates.forEach((date) => {
      const dayMatches = matchesByDate[date];
      if (!refereeUsageByDate[date]) {
        refereeUsageByDate[date] = [];
      }

      // Lấy danh sách trọng tài đã được phân công trong ngày này (từ updatedMatches)
      const usedTodayReferees = new Set();
      dayMatches.forEach((match) => {
        const matchInUpdated = updatedMatches.find(
          (m) => m.match_id === match.match_id
        );
        if (matchInUpdated?.referee_id) {
          usedTodayReferees.add(matchInUpdated.referee_id);
        }
      });

      dayMatches.forEach((match) => {
        // Bỏ qua nếu trận đã có trọng tài
        const matchIndex = updatedMatches.findIndex(
          (m) => m.match_id === match.match_id
        );
        if (matchIndex === -1 || updatedMatches[matchIndex].referee_id) {
          return;
        }

        // Tìm trọng tài có thể bắt trận này
        let assignedReferee = null;

        for (const referee of shuffledReferees) {
          const refereeId = referee.user_id;

          // Kiểm tra trọng tài đã được phân công trong ngày này chưa
          if (
            usedTodayReferees.has(refereeId) ||
            refereeUsageByDate[date].includes(refereeId)
          ) {
            continue;
          }

          // Kiểm tra trọng tài đã bắt trận ngày hôm trước chưa (cần nghỉ 1 ngày)
          const prevDate = new Date(date);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split("T")[0];
          if (refereeUsageByDate[prevDateStr]?.includes(refereeId)) {
            continue;
          }

          // Kiểm tra trọng tài đã bắt trận ngày hôm sau chưa (cần nghỉ 1 ngày)
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          const nextDateStr = nextDate.toISOString().split("T")[0];
          if (refereeUsageByDate[nextDateStr]?.includes(refereeId)) {
            continue;
          }

          // Trọng tài này có thể được phân công
          assignedReferee = referee;
          break;
        }

        if (assignedReferee) {
          updatedMatches[matchIndex] = {
            ...updatedMatches[matchIndex],
            referee_id: assignedReferee.user_id,
          };
          refereeUsageByDate[date].push(assignedReferee.user_id);
          usedTodayReferees.add(assignedReferee.user_id);
        }
      });
    });

    setScheduleMatches(updatedMatches);
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    if (!selectedTournament) return;

    try {
      setSavingSchedule(true);
      setError("");

      // Validate all matches have venue
      const invalidMatches = scheduleMatches.filter((m) => !m.venue_id);
      if (invalidMatches.length > 0) {
        setError(
          `Vui lòng chọn sân cho tất cả các trận đấu vòng bảng. Còn ${invalidMatches.length} trận chưa chọn sân.`
        );
        setSavingSchedule(false);
        return;
      }
      
      // Validate playoff matches have venue, date, time
      const invalidPlayoffMatches = playoffMatches.filter(
        (m) => !m.venue_id || !m.match_date || !m.match_time
      );
      if (invalidPlayoffMatches.length > 0) {
        setError(
          `Vui lòng điền đầy đủ thông tin (sân, ngày, giờ) cho tất cả các trận playoff. Còn ${invalidPlayoffMatches.length} trận chưa điền đủ.`
        );
        setSavingSchedule(false);
        return;
      }

      // Prepare matches data - IMPORTANT: Include team IDs to maintain order
      const matchesData = scheduleMatches.map((match, index) => ({
        home_team_id: parseInt(match.home_team_id),
        away_team_id: parseInt(match.away_team_id),
        venue_id: parseInt(match.venue_id),
        referee_id: match.referee_id ? parseInt(match.referee_id) : null,
        match_date: match.match_date,
        match_time: match.match_time + ":00", // Add seconds
        order: index, // Explicit order to maintain interleaving
      }));

      console.log("🔍 Creating schedule with data:", {
        tournament_id: selectedTournament.tournament_id,
        matches_per_day: matchesPerDay,
        time_slots: timeSlots.map((t) => t + ":00"),
        matches_count: matchesData.length,
        matches: matchesData,
      });

      // Prepare playoff matches data
      const playoffMatchesData = playoffMatches.map((match) => ({
        stage: match.stage,
        match_round: match.match_round,
        venue_id: parseInt(match.venue_id),
        referee_id: match.referee_id ? parseInt(match.referee_id) : null,
        match_date: match.match_date,
        match_time: match.match_time + ":00",
      }));

      const response = await sponsorAPI.createGroupStageSchedule(
        selectedTournament.tournament_id,
        {
          matches_per_day: matchesPerDay,
          time_slots: timeSlots.map((t) => t + ":00"),
          matches: matchesData,
          playoff_matches: playoffMatchesData,
        }
      );

      console.log("🔍 createGroupStageSchedule response:", response);
      console.log("🔍 response.data:", response.data);

      if (response.data.success) {
        // Removed alert to avoid reload for debugging
        console.log("✅ Lập lịch thi đấu thành công!");
        setShowScheduleModal(false);
        setSelectedTournament(null);
        // Navigate to schedule management page
        navigate(
          `/sponsor/tournaments/${selectedTournament.tournament_id}/schedule`
        );
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(err.response?.data?.message || "Lỗi khi lưu lịch thi đấu");
    } finally {
      setSavingSchedule(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: "Chờ duyệt", color: "bg-gray-500" },
      registration: { label: "Đang mở đăng ký", color: "bg-blue-500" },
      ongoing: { label: "Đang diễn ra", color: "bg-green-500" },
      completed: { label: "Đã kết thúc", color: "bg-gray-400" },
    };

    const badge = badges[status] || badges.draft;

    return (
      <span
        className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-medium`}
      >
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-6xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaCalendarCheck className="text-purple-600" />
          Quản lý lịch thi đấu
        </h1>
        <p className="text-gray-600 mt-2">
          Chọn giải đấu để lập lịch thi đấu vòng bảng
        </p>
      </div>

      {error && !showScheduleModal && (
        <div className="alert alert-error mb-4">
          <FaInfoCircle /> {error}
        </div>
      )}

      {/* Tournament Format Info - Show for first tournament as example */}
      {tournaments.length > 0 && !showScheduleModal && (
        <div className="mb-6">
          <TournamentBracket tournamentId={tournaments[0].tournament_id} />
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="card text-center py-12">
          <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có giải đấu nào để lập lịch
          </h3>
          <p className="text-gray-600 mb-6">
            Chỉ các giải đấu đang mở đăng ký hoặc đang diễn ra và có đội tham
            gia mới có thể lập lịch.
          </p>
          <button
            onClick={() => navigate("/sponsor/tournaments")}
            className="btn-primary"
          >
            Xem tất cả giải đấu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div
              key={tournament.tournament_id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {tournament.tournament_name}
                  </h3>
                  {getStatusBadge(tournament.status)}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaUsers />
                  <span>
                    {tournament.current_teams}/{tournament.max_teams} đội
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarAlt />
                  <span>
                    Bắt đầu:{" "}
                    {format(new Date(tournament.start_date), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/sponsor/tournaments/${tournament.tournament_id}/schedule`
                    )
                  }
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <FaEye /> Xem lịch
                </button>
                <button
                  onClick={() => handleOpenScheduleModal(tournament)}
                  disabled={tournament.hasSchedule}
                  className={`flex-1 flex items-center justify-center gap-2 ${
                    tournament.hasSchedule
                      ? "btn-disabled opacity-50 cursor-not-allowed"
                      : "btn-primary"
                  }`}
                  title={
                    tournament.hasSchedule
                      ? "Giải đấu đã có lịch thi đấu"
                      : "Lập lịch thi đấu vòng bảng"
                  }
                >
                  <FaCalendarCheck /> Lập lịch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Creation Modal */}
      {showScheduleModal && selectedTournament && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!loadingSchedule && !savingSchedule) {
              setShowScheduleModal(false);
              setSelectedTournament(null);
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    Lập lịch thi đấu vòng bảng
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedTournament.tournament_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedTournament(null);
                  }}
                  disabled={loadingSchedule || savingSchedule}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingSchedule ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="alert alert-error mb-4">
                      <FaInfoCircle /> {error}
                    </div>
                  )}

                  {/* Schedule Settings */}
                  <div className="card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Cài đặt lịch
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Ngày bắt đầu giải
                        </label>
                        <input
                          type="date"
                          value={scheduleStartDate}
                          readOnly
                          className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-not-allowed shadow-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Từ thông tin giải đấu
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Ngày kết thúc giải
                        </label>
                        <input
                          type="date"
                          value={
                            selectedTournament?.end_date
                              ? formatDateForInput(selectedTournament.end_date)
                              : ""
                          }
                          readOnly
                          className="w-full px-4 py-2.5 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-not-allowed shadow-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Trận chung kết diễn ra vào ngày này
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Số trận/ngày
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={matchesPerDay}
                          onChange={(e) => {
                            const newPerDay = parseInt(e.target.value) || 2;
                            setMatchesPerDay(newPerDay);
                            if (teams.length > 0) {
                              generateGroupStageMatches(
                                teams,
                                scheduleStartDate,
                                newPerDay,
                                timeSlots
                              );
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Khung giờ (phân cách bằng dấu phẩy)
                        </label>
                        <input
                          type="text"
                          value={timeSlots.join(", ")}
                          onChange={(e) => {
                            const slots = e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s);
                            setTimeSlots(slots);
                            if (teams.length > 0) {
                              generateGroupStageMatches(
                                teams,
                                scheduleStartDate,
                                matchesPerDay,
                                slots
                              );
                            }
                          }}
                          placeholder="09:00, 11:00, 14:00, 16:00"
                          className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teams Distribution */}
                  <div className="card mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Phân bảng ({teams.length} đội)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">
                          Bảng A ({teams.length / 2} đội)
                        </h4>
                        <div className="space-y-1">
                          {teams.slice(0, teams.length / 2).map((team, idx) => (
                            <div
                              key={team.team_id}
                              className="p-2 bg-blue-50 rounded text-sm"
                            >
                              {idx + 1}. {team.team_name}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2">
                          Bảng B ({teams.length / 2} đội)
                        </h4>
                        <div className="space-y-1">
                          {teams.slice(teams.length / 2).map((team, idx) => (
                            <div
                              key={team.team_id}
                              className="p-2 bg-green-50 rounded text-sm"
                            >
                              {idx + 1}. {team.team_name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="card mb-4">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">
                      Phân bổ tự động
                    </h3>
                    <div className="space-y-3">
                      {/* Auto Venue Assignment */}
                      <div>
                        <label className="block text-xs font-medium mb-2 text-gray-600">
                          <FaMapMarkerAlt className="inline mr-1" />
                          Phân bổ sân tự động
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Hệ thống sẽ tự động phân bổ sân cho từng trận, đảm bảo
                          mỗi sân chỉ dùng 1 trận/ngày
                        </p>
                        <button
                          onClick={autoAssignVenues}
                          className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium shadow-sm"
                        >
                          <FaMapMarkerAlt className="inline mr-1" />
                          Phân bổ sân tự động
                        </button>
                      </div>

                      {/* Auto Referee Assignment */}
                      <div>
                        <label className="block text-xs font-medium mb-2 text-gray-600">
                          <FaUserTie className="inline mr-1" />
                          Phân bổ trọng tài tự động
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Hệ thống sẽ tự động phân bổ trọng tài, đảm bảo mỗi
                          trọng tài chỉ bắt 1 trận/ngày và nghỉ 1 ngày giữa các
                          trận
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={autoAssignReferees}
                            className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium shadow-sm"
                          >
                            <FaUserTie className="inline mr-1" />
                            Phân bổ trọng tài tự động
                          </button>
                          <button
                            onClick={() => {
                              scheduleMatches.forEach((match) => {
                                updateScheduleMatch(
                                  match.match_id,
                                  "referee_id",
                                  ""
                                );
                              });
                            }}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium shadow-sm"
                          >
                            Xóa tất cả trọng tài
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Playoff Matches Section */}
                  <div className="card mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                      <FaTrophy className="text-yellow-600" />
                      Lịch playoff (3 trận: 2 bán kết + 1 chung kết)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Các đội sẽ được tự động cập nhật khi vòng bảng kết thúc. Bạn chỉ cần chọn sân, trọng tài, ngày và giờ thi đấu.
                    </p>
                    <div className="space-y-4">
                      {playoffMatches.map((match, idx) => (
                        <div
                          key={idx}
                          className="p-4 border-2 border-orange-300 rounded-lg bg-white"
                        >
                          <h4 className="font-semibold mb-3 text-orange-700">
                            {match.stage === 'semifinal' 
                              ? `Bán kết ${match.match_round}: ${match.match_round === 1 ? 'A1 vs B2' : 'A2 vs B1'}`
                              : 'Chung kết: Winner SF1 vs Winner SF2'
                            }
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Sân <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={match.venue_id}
                                onChange={(e) => {
                                  const newPlayoffMatches = [...playoffMatches];
                                  newPlayoffMatches[idx].venue_id = e.target.value;
                                  setPlayoffMatches(newPlayoffMatches);
                                }}
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all shadow-sm text-sm"
                                required
                              >
                                <option value="">Chọn sân</option>
                                {venues
                                  .filter((v) => v.is_available === 1)
                                  .map((venue) => (
                                    <option
                                      key={venue.venue_id}
                                      value={venue.venue_id}
                                    >
                                      {venue.venue_name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Trọng tài
                              </label>
                              <select
                                value={match.referee_id}
                                onChange={(e) => {
                                  const newPlayoffMatches = [...playoffMatches];
                                  newPlayoffMatches[idx].referee_id = e.target.value;
                                  setPlayoffMatches(newPlayoffMatches);
                                }}
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all shadow-sm text-sm"
                              >
                                <option value="">Chưa phân công</option>
                                {referees.map((referee) => (
                                  <option
                                    key={referee.user_id}
                                    value={referee.user_id}
                                  >
                                    {referee.full_name} ({referee.certification_level})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Ngày <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={match.match_date}
                                onChange={(e) => {
                                  const newPlayoffMatches = [...playoffMatches];
                                  newPlayoffMatches[idx].match_date = e.target.value;
                                  setPlayoffMatches(newPlayoffMatches);
                                }}
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all shadow-sm text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Giờ <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                value={match.match_time}
                                onChange={(e) => {
                                  const newPlayoffMatches = [...playoffMatches];
                                  newPlayoffMatches[idx].match_time = e.target.value;
                                  setPlayoffMatches(newPlayoffMatches);
                                }}
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all shadow-sm text-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matches List */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                      Danh sách trận đấu vòng bảng ({scheduleMatches.length} trận)
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {scheduleMatches.map((match, idx) => (
                        <div
                          key={match.match_id}
                          className="p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">
                                Trận {idx + 1}: {match.home_team_name} vs{" "}
                                {match.away_team_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Bảng {match.group}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Sân <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={match.venue_id}
                                onChange={(e) =>
                                  updateScheduleMatch(
                                    match.match_id,
                                    "venue_id",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm text-sm"
                                required
                              >
                                <option value="">Chọn sân</option>
                                {venues
                                  .filter((v) => v.is_available === 1)
                                  .map((venue) => (
                                    <option
                                      key={venue.venue_id}
                                      value={venue.venue_id}
                                    >
                                      {venue.venue_name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Trọng tài
                              </label>
                              <select
                                value={match.referee_id}
                                onChange={(e) =>
                                  updateScheduleMatch(
                                    match.match_id,
                                    "referee_id",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm text-sm"
                              >
                                <option value="">Chưa phân công</option>
                                {referees.map((referee) => (
                                  <option
                                    key={referee.user_id}
                                    value={referee.user_id}
                                  >
                                    {referee.full_name} (
                                    {referee.certification_level})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Ngày
                              </label>
                              <input
                                type="date"
                                value={match.match_date}
                                onChange={(e) =>
                                  updateScheduleMatch(
                                    match.match_id,
                                    "match_date",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                Giờ
                              </label>
                              <input
                                type="time"
                                value={match.match_time}
                                onChange={(e) =>
                                  updateScheduleMatch(
                                    match.match_id,
                                    "match_time",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowScheduleModal(false);
                        setSelectedTournament(null);
                      }}
                      disabled={savingSchedule}
                      className="btn-secondary"
                    >
                      <FaTimes /> Hủy
                    </button>
                    <button
                      onClick={handleSaveSchedule}
                      disabled={savingSchedule}
                      className="btn-primary"
                    >
                      {savingSchedule ? (
                        <>
                          <FaSpinner className="animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <FaCheck /> Lưu lịch thi đấu
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentSchedulePage;
