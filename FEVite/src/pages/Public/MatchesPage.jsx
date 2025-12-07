import { useState, useEffect } from "react";
import { publicAPI, tournamentAPI } from "../../services/api";
import TournamentBracket from "../../components/TournamentBracket";

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tournament_id: "",
    status: "",
    date_from: "",
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [matchLineups, setMatchLineups] = useState({});
  const [loadingLineups, setLoadingLineups] = useState({});
  const [tournamentStandings, setTournamentStandings] = useState({});

  useEffect(() => {
    fetchTournaments();
    // Don't fetch matches on initial load - wait for tournament selection
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAll();
      const tournaments = response.data.data || [];
      // Sắp xếp theo ngày bắt đầu (sớm nhất trước)
      tournaments.sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date) - new Date(b.start_date);
      });
      setTournaments(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    }
  };

  const fetchStandings = async (tournamentId) => {
    try {
      const response = await publicAPI.getStandings({ tournament_id: tournamentId });
      console.log('Standings API response:', response.data);
      
      if (response.data.success && response.data.grouped && typeof response.data.grouped === 'object') {
        setTournamentStandings(response.data.grouped);
      } else {
        console.warn('No grouped standings data available');
        setTournamentStandings({});
      }
    } catch (error) {
      console.error("Error fetching standings:", error);
      setTournamentStandings({});
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Fetch standings if tournament selected
      if (filters.tournament_id) {
        await fetchStandings(filters.tournament_id);
      }
      
      const response = await publicAPI.getMatches(filters);
      const matches = response.data.data || [];
      // Sắp xếp theo ngày và giờ (sớm nhất trước)
      matches.sort((a, b) => {
        const dateA = a.match_date ? new Date(a.match_date) : new Date(0);
        const dateB = b.match_date ? new Date(b.match_date) : new Date(0);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        // Nếu cùng ngày, sắp xếp theo giờ
        const timeA = a.match_time || "00:00:00";
        const timeB = b.match_time || "00:00:00";
        return timeA.localeCompare(timeB);
      });
      setMatches(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatches([]);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Require tournament selection for search
    if (!filters.tournament_id) {
      alert("Vui lòng chọn giải đấu trước khi tìm kiếm");
      return;
    }
    setLoading(true);
    try {
      const response = await publicAPI.searchMatches({
        keyword: searchKeyword,
        ...filters,
      });
      const matches = response.data.data || [];
      // Sắp xếp theo ngày và giờ (sớm nhất trước)
      matches.sort((a, b) => {
        const dateA = a.match_date ? new Date(a.match_date) : new Date(0);
        const dateB = b.match_date ? new Date(b.match_date) : new Date(0);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        // Nếu cùng ngày, sắp xếp theo giờ
        const timeA = a.match_time || "00:00:00";
        const timeB = b.match_time || "00:00:00";
        return timeA.localeCompare(timeB);
      });
      setMatches(matches);
    } catch (error) {
      console.error("Error searching matches:", error);
      setMatches([]);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Only fetch matches if a tournament is selected
    if (filters.tournament_id) {
      fetchMatches();
    } else {
      setMatches([]);
      setLoading(false);
    }
  }, [filters]);

  // Check if match is currently ongoing (based on date, time, and status)
  // Helper function to display playoff team name based on standings
  const getPlayoffTeamDisplay = (teamName, stage, matchRound, isHome) => {
    if (teamName) return teamName;
    
    // Get team from standings if available
    if (stage === 'semifinal' && tournamentStandings) {
      const groupA = tournamentStandings['A'];
      const groupB = tournamentStandings['B'];
      
      console.log('DEBUG playoff display:', {
        stage,
        matchRound,
        isHome,
        groupA,
        groupB,
        tournamentStandings
      });
      
      if (groupA && groupB) {
        if (matchRound === 1) {
          // SF1: A1 vs B2
          const team = isHome ? groupA[0] : groupB[1];
          console.log(`SF1 ${isHome ? 'home' : 'away'}:`, team);
          return team?.team_name || 'Chưa xác định';
        } else {
          // SF2: A2 vs B1
          const team = isHome ? groupA[1] : groupB[0];
          console.log(`SF2 ${isHome ? 'home' : 'away'}:`, team);
          return team?.team_name || 'Chưa xác định';
        }
      }
    } else if (stage === 'final') {
      return 'Đang chờ kết quả bán kết';
    }
    
    return 'Chưa xác định';
  };

  const isMatchOngoing = (match) => {
    if (!match.match_date || !match.match_time) {
      console.log(`[DEBUG] Match ${match.match_id}: Missing date or time`, {
        match_date: match.match_date,
        match_time: match.match_time,
      });
      return false;
    }
    
    // If match is already completed, it's not ongoing
    if (match.status === 'completed') {
      console.log(`[DEBUG] Match ${match.match_id}: Already completed`);
      return false;
    }
    
    try {
      // Parse match date and time
      // match_date from API can be:
      // 1. UTC string: "2025-12-03T17:00:00.000Z" (needs conversion to GMT+7)
      // 2. Date object
      // 3. Plain string: "2025-12-03"
      // match_time from MySQL is "HH:MM:SS" (local time in GMT+7)
      
      let matchDateStr;
      if (match.match_date instanceof Date) {
        // Convert Date to GMT+7 local date string
        // Use toLocaleDateString with timezone to get correct local date
        const year = match.match_date.getUTCFullYear();
        const month = String(match.match_date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(match.match_date.getUTCDate()).padStart(2, '0');
        // But we need GMT+7, so add 7 hours first
        const dateGMT7 = new Date(match.match_date.getTime() + 7 * 60 * 60 * 1000);
        matchDateStr = dateGMT7.toISOString().split('T')[0];
      } else {
        const dateStr = String(match.match_date);
        // Check if it's a UTC string (ends with Z or has T with time and Z/+)
        if (dateStr.includes('T') && (dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-'))) {
          // It's a UTC/ISO string, parse and convert to GMT+7
          const dateUTC = new Date(dateStr);
          // Add 7 hours to get GMT+7 time, then extract date part
          const dateGMT7 = new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);
          matchDateStr = dateGMT7.toISOString().split('T')[0];
        } else {
          // Plain date string (YYYY-MM-DD), use as is
          matchDateStr = dateStr.split('T')[0].split(' ')[0];
        }
      }
      
      // Extract time part (handle both "HH:MM:SS" and "HH:MM" formats)
      let matchTimeStr = String(match.match_time);
      if (matchTimeStr.includes('.')) {
        matchTimeStr = matchTimeStr.split('.')[0];
      }
      // Ensure HH:MM:SS format
      const timeParts = matchTimeStr.split(':');
      if (timeParts.length === 2) {
        matchTimeStr = `${timeParts[0]}:${timeParts[1]}:00`;
      } else {
        matchTimeStr = matchTimeStr.substring(0, 8);
      }
      
      // Create date object: treat as Vietnam time (GMT+7)
      // Format: "YYYY-MM-DDTHH:MM:SS+07:00"
      const matchDateTimeStr = `${matchDateStr}T${matchTimeStr}+07:00`;
      const matchDateTime = new Date(matchDateTimeStr);
      
      // Get current time (UTC)
      const now = new Date();
      const nowUTC = now.getTime();
      const matchDateTimeUTC = matchDateTime.getTime();
      
      // A basketball match typically lasts about 2 hours (4 quarters + breaks)
      const matchDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const matchEndTimeUTC = matchDateTimeUTC + matchDuration;
      
      // Match is ongoing if:
      // 1. Current time >= match start time (match has started)
      // 2. Current time < match end time (match hasn't finished yet, typically 2 hours after start)
      // 3. Status is not 'completed'
      const hasStarted = nowUTC >= matchDateTimeUTC;
      const hasNotEnded = nowUTC < matchEndTimeUTC;
      const isNotCompleted = match.status !== 'completed';
      const isOngoing = hasStarted && hasNotEnded && isNotCompleted;
      
      // DEBUG: Log for debugging
      console.log(`[DEBUG Match ${match.match_id}]`, {
        raw: {
          match_date: match.match_date,
          match_time: match.match_time,
          status: match.status,
        },
        parsed: {
          matchDateStr,
          matchTimeStr,
          matchDateTimeStr,
        },
        timestamps: {
          matchDateTimeUTC: new Date(matchDateTimeUTC).toISOString(),
          nowUTC: new Date(nowUTC).toISOString(),
          matchEndTimeUTC: new Date(matchEndTimeUTC).toISOString(),
        },
        localTime: {
          matchDateTimeLocal: matchDateTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          nowLocal: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        },
        checks: {
          hasStarted,
          hasNotEnded,
          isNotCompleted,
          isOngoing,
        },
        timeDiff: {
          milliseconds: nowUTC - matchDateTimeUTC,
          minutes: Math.round((nowUTC - matchDateTimeUTC) / 60000),
          hours: ((nowUTC - matchDateTimeUTC) / (60 * 60 * 1000)).toFixed(2),
        },
      });
      
      return isOngoing;
    } catch (error) {
      console.error('Error checking if match is ongoing:', error, match);
      return false;
    }
  };

  const getStatusBadge = (match) => {
    // Check if match is currently ongoing
    if (isMatchOngoing(match)) {
      return {
        label: "Đang diễn ra",
        className: "badge-info",
      };
    }
    
    const badges = {
      scheduled: { label: "Sắp diễn ra", className: "badge-warning" },
      ongoing: { label: "Đang diễn ra", className: "badge-info" },
      completed: { label: "Đã kết thúc", className: "badge-success" },
      postponed: { label: "Hoãn", className: "badge-error" },
    };
    
    const badge = badges[match.status] || { label: match.status, className: "badge-info" };
    return badge;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const time = timeString.split(":");
    return `${time[0]}:${time[1]}`;
  };

  const formatDateTime = (dateString, timeString) => {
    const date = formatDate(dateString);
    const time = formatTime(timeString);
    return time ? `${time} ${date}` : date;
  };

  const getStageLabel = (stage, groupName) => {
    if (stage === "group_stage") {
      return groupName ? `Vòng bảng - ${groupName}` : "Vòng bảng";
    } else if (stage === "playoff") {
      return "Playoff";
    } else if (stage) {
      return stage;
    }
    return "";
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

  const handleToggleMatch = (matchId) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📅 Lịch thi đấu</h1>

      {/* Search & Filters */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm (UC17)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Tìm theo tên đội, sân vận động..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                🔍 Tìm kiếm
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giải đấu <span className="text-red-500">*</span>
              </label>
              <select
                name="tournament_id"
                value={filters.tournament_id}
                onChange={handleFilterChange}
                className="input-field"
                required
              >
                <option value="">-- Chọn giải đấu --</option>
                {tournaments.map((t) => (
                  <option key={t.tournament_id} value={t.tournament_id}>
                    {t.tournament_name}
                  </option>
                ))}
              </select>
              {!filters.tournament_id && (
                <p className="text-sm text-gray-500 mt-1">
                  Vui lòng chọn giải đấu để xem lịch thi đấu
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="scheduled">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
                <option value="postponed">Hoãn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="input-field"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Tournament Format & Rules Section */}
      {filters.tournament_id && (
        <div className="card mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              📋 Thể lệ & Quy trình giải đấu
            </h2>
            <p className="text-gray-600 text-sm">
              Thông tin chi tiết về thể lệ, quy tắc và sơ đồ thi đấu của giải đấu
            </p>
          </div>
          <TournamentBracket tournamentId={parseInt(filters.tournament_id)} />
        </div>
      )}

      {/* Playoff Matches Section */}
      {filters.tournament_id && matches.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🏅 Vòng Playoff
          </h2>
          
          {(() => {
            // Separate playoff matches from group stage
            const playoffMatches = matches.filter(m => 
              m.stage === "quarterfinal" || m.stage === "semifinal" || m.stage === "final"
            );
            
            if (playoffMatches.length === 0) {
              // Show placeholder playoff structure
              const selectedTournament = tournaments.find(t => t.tournament_id === parseInt(filters.tournament_id));
              const is16Teams = selectedTournament?.max_teams === 16;
              
              return (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-1">
                        Vòng Playoff chưa bắt đầu
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Các đội tham gia playoff sẽ được xác định sau khi vòng bảng kết thúc
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Cấu trúc Playoff dự kiến:
                    </h4>
                    {is16Teams ? (
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-600 mb-2">Tứ kết (4 trận)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">QF1:</span> A1 vs B4
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">QF2:</span> A2 vs B3
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">QF3:</span> A3 vs B2
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">QF4:</span> A4 vs B1
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-600 mb-2">Bán kết (2 trận)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">SF1:</span> Winner QF1 vs Winner QF2
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">SF2:</span> Winner QF3 vs Winner QF4
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-600 mb-2">Chung kết (1 trận)</h5>
                          <div className="bg-white p-3 rounded border border-yellow-200 text-sm">
                            <span className="font-medium">Final:</span> Winner SF1 vs Winner SF2
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-600 mb-2">Bán kết (2 trận)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">SF1:</span> A1 vs B2
                            </div>
                            <div className="bg-white p-3 rounded border border-yellow-200">
                              <span className="font-medium">SF2:</span> A2 vs B1
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-600 mb-2">Chung kết (1 trận)</h5>
                          <div className="bg-white p-3 rounded border border-yellow-200 text-sm">
                            <span className="font-medium">Final:</span> Winner SF1 vs Winner SF2
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // If playoff matches exist, display them
            const quarterfinals = playoffMatches.filter(m => m.stage === "quarterfinal");
            const semifinals = playoffMatches.filter(m => m.stage === "semifinal");
            const finals = playoffMatches.filter(m => m.stage === "final");

            // Collect unique teams that have advanced to playoff (after group stage completed)
            const playoffTeams = [];
            const addTeamIfAny = (teamId, teamName) => {
              if (!teamId || !teamName) return; // Only add teams that have names (assigned)
              if (!playoffTeams.some((t) => t.team_id === teamId)) {
                playoffTeams.push({ team_id: teamId, team_name: teamName });
              }
            };
            playoffMatches.forEach((m) => {
              addTeamIfAny(m.home_team_id, m.home_team_name);
              addTeamIfAny(m.away_team_id, m.away_team_name);
            });
            
            return (
              <div className="space-y-6">
                {playoffTeams.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Đội đã vào playoff</h3>
                    <div className="flex flex-wrap gap-2">
                      {playoffTeams.map((team) => (
                        <span
                          key={team.team_id}
                          className="px-3 py-1 bg-white border border-blue-200 text-blue-800 rounded-full text-sm shadow-sm"
                        >
                          {team.team_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {quarterfinals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Tứ kết</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quarterfinals.map(match => (
                        <div key={match.match_id} className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {getPlayoffTeamDisplay(match.home_team_name, match.stage, match.match_round, true)} vs{" "}
                                {getPlayoffTeamDisplay(match.away_team_name, match.stage, match.match_round, false)}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {formatDateTime(match.match_date, match.match_time)}
                              </div>
                            </div>
                            {match.home_score !== null && match.away_score !== null && (
                              <div className="text-xl font-bold text-primary-600">
                                {match.home_score} - {match.away_score}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {semifinals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Bán kết</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {semifinals.map(match => (
                        <div key={match.match_id} className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-800 mb-2">
                                {getPlayoffTeamDisplay(match.home_team_name, match.stage, match.match_round, true)} vs{" "}
                                {getPlayoffTeamDisplay(match.away_team_name, match.stage, match.match_round, false)}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{formatDateTime(match.match_date, match.match_time)}</span>
                                </div>
                                {match.venue_name && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{match.venue_name}</span>
                                  </div>
                                )}
                                {match.referee_name && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Trọng tài: {match.referee_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {match.home_score !== null && match.away_score !== null && (
                              <div className="text-2xl font-bold text-blue-600">
                                {match.home_score} - {match.away_score}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {finals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">🏆 Chung kết</h3>
                    <div className="max-w-3xl mx-auto">
                      {finals.map(match => (
                        <div key={match.match_id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border-2 border-yellow-400 shadow-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-bold text-2xl text-gray-800 mb-3">
                                {getPlayoffTeamDisplay(match.home_team_name, match.stage, match.match_round, true)} vs{" "}
                                {getPlayoffTeamDisplay(match.away_team_name, match.stage, match.match_round, false)}
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">{formatDateTime(match.match_date, match.match_time)}</span>
                                </div>
                                {match.venue_name && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium">{match.venue_name}</span>
                                  </div>
                                )}
                                {match.referee_name && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">Trọng tài: {match.referee_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {match.home_score !== null && match.away_score !== null && (
                              <div className="text-4xl font-bold text-yellow-600">
                                {match.home_score} - {match.away_score}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Matches List */}
      {!filters.tournament_id ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-600 text-lg mb-2">
            Vui lòng chọn giải đấu để xem lịch thi đấu
          </p>
          <p className="text-gray-500 text-sm">
            Chọn giải đấu từ danh sách ở trên để xem các trận đấu
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600">Không có trận đấu nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group Stage Matches Section */}
          {(() => {
            const groupStageMatches = matches.filter(m => m.stage === "group_stage");
            if (groupStageMatches.length === 0) return null;
            
            return (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  ⚽ Vòng Bảng
                </h2>
                <div className="space-y-4">
                  {groupStageMatches.map((match) => (
                    <div
                      key={match.match_id}
                      className="card hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2 flex-wrap">
                            <span className={`badge ${getStatusBadge(match).className}`}>
                              {getStatusBadge(match).label}
                            </span>
                            {(match.stage || match.group_name) && (
                              <span className="badge badge-info">
                                {getStageLabel(match.stage, match.group_name)}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">
                              {formatDateTime(match.match_date, match.match_time)}
                            </span>
                          </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      {match.home_team ||
                        match.home_team_name ||
                        match.home_team_placeholder ||
                        "Chưa xác định"}
                      {match.home_team_placeholder && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Placeholder)
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary-600 px-8">
                      {match.home_score !== null && match.away_score !== null
                        ? `${match.home_score} - ${match.away_score}`
                        : isMatchOngoing(match)
                        ? "Đang diễn ra"
                        : "VS"}
                    </div>
                    <div className="text-lg font-semibold">
                      {match.away_team ||
                        match.away_team_name ||
                        match.away_team_placeholder ||
                        "Chưa xác định"}
                      {match.away_team_placeholder && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Placeholder)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {/* Venue Info */}
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-lg">📍</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">
                          {match.venue_name || "Chưa xác định sân"}
                        </div>
                        {match.address && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {match.address}
                            {match.city && `, ${match.city}`}
                          </div>
                        )}
                        {match.capacity && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Sức chứa: {match.capacity.toLocaleString("vi-VN")}{" "}
                            chỗ
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Referee Info */}
                    {match.referee_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">👨‍⚖️</span>
                        <div>
                          <span className="font-medium text-gray-700">
                            {match.referee_name}
                          </span>
                          {match.referee_certification_level && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({match.referee_certification_level})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Expand button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => handleToggleMatch(match.match_id)}
                      className="btn-secondary text-sm"
                    >
                      {expandedMatchId === match.match_id
                        ? "📋 Ẩn đội hình"
                        : "👥 Xem đội hình"}
                    </button>
                  </div>
                  {/* Expanded Lineups Section */}
                  {expandedMatchId === match.match_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {loadingLineups[match.match_id] ? (
                        <div className="text-center py-4">
                          <div className="text-2xl mb-2">⏳</div>
                          <p className="text-gray-600 text-sm">
                            Đang tải đội hình...
                          </p>
                        </div>
                      ) : matchLineups[match.match_id] ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Home Team Lineup */}
                          <div>
                            <h4 className="font-semibold text-lg mb-3 text-primary-600">
                              {match.home_team || match.home_team_name}
                            </h4>
                            {matchLineups[match.match_id].home_team_lineup
                              .length > 0 ? (
                              <div className="space-y-2">
                                {["PG", "SG", "SF", "PF", "C"].map((pos) => {
                                  const player = matchLineups[
                                    match.match_id
                                  ].home_team_lineup.find(
                                    (p) => p.position === pos
                                  );
                                  return (
                                    <div
                                      key={pos}
                                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                    >
                                      <span className="font-medium text-xs w-32 flex-shrink-0">
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
                                        <span className="text-gray-400 text-sm">
                                          Chưa có
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Chưa có đội hình
                              </p>
                            )}
                          </div>
                          {/* Away Team Lineup */}
                          <div>
                            <h4 className="font-semibold text-lg mb-3 text-primary-600">
                              {match.away_team || match.away_team_name}
                            </h4>
                            {matchLineups[match.match_id].away_team_lineup
                              .length > 0 ? (
                              <div className="space-y-2">
                                {["PG", "SG", "SF", "PF", "C"].map((pos) => {
                                  const player = matchLineups[
                                    match.match_id
                                  ].away_team_lineup.find(
                                    (p) => p.position === pos
                                  );
                                  return (
                                    <div
                                      key={pos}
                                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                    >
                                      <span className="font-medium text-xs w-32 flex-shrink-0">
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
                                        <span className="text-gray-400 text-sm">
                                          Chưa có
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Chưa có đội hình
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center">
                          Không thể tải đội hình
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
