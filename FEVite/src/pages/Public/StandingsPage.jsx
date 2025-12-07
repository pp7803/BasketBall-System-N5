import { useState, useEffect } from 'react';
import { publicAPI, tournamentAPI } from '../../services/api';

const StandingsPage = () => {
  const [standings, setStandings] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchStandings();
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAll({ status: 'ongoing' });
      const data = response.data.data || [];
      // Sắp xếp theo ngày bắt đầu (sớm nhất trước)
      data.sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date) - new Date(b.start_date);
      });
      setTournaments(data);
      if (data.length > 0) {
        setSelectedTournament(data[0].tournament_id);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.getStandings({
        tournament_id: selectedTournament,
      });
      // Use grouped data if available, otherwise use flat data
      setStandings(response.data.grouped || { 'Overall': response.data.data || [] });
    } catch (error) {
      console.error('Error fetching standings:', error);
      setStandings({});
    }
    setLoading(false);
  };

  // Get tournament info to determine max_teams
  const currentTournament = tournaments.find(t => t.tournament_id === parseInt(selectedTournament));
  const maxTeams = currentTournament?.max_teams || 16;
  const playoffQualifyCount = maxTeams === 8 ? 2 : 4;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🏆 Bảng xếp hạng</h1>

      {/* Tournament Selector */}
      <div className="card mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn giải đấu
        </label>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          className="input-field max-w-md"
        >
          {tournaments.map((t) => (
            <option key={t.tournament_id} value={t.tournament_id}>
              {t.tournament_name}
            </option>
          ))}
        </select>
      </div>

      {/* Standings Tables */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải bảng xếp hạng...</p>
        </div>
      ) : Object.keys(standings).length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600">Chưa có dữ liệu bảng xếp hạng</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(standings).sort().map((groupName) => (
            <div key={groupName} className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {groupName === 'Overall' ? '🏆 Tổng sắp' : `📊 Bảng ${groupName}`}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Đội
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Trận
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Thắng
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Thua
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Điểm
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        BT
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        BB
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        HS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {standings[groupName].map((team, index) => {
                      // Highlight top teams for playoff qualification
                      // 8 teams: top 2, 16 teams: top 4
                      const isQualified = groupName !== 'Overall' && index < playoffQualifyCount;
                      
                      return (
                        <tr
                          key={team.standing_id}
                          className={`hover:bg-gray-50 transition ${
                            isQualified ? 'bg-green-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isQualified ? 'text-green-600' : ''}`}>
                                {team.group_position || index + 1}
                              </span>
                              {isQualified && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Playoff
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              {team.logo_url && (
                                <img 
                                  src={team.logo_url} 
                                  alt={team.team_name} 
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                              <div>
                                <div>{team.team_name}</div>
                                {team.short_name && (
                                  <div className="text-xs text-gray-500">{team.short_name}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {team.matches_played}
                          </td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">
                            {team.wins}
                          </td>
                          <td className="px-4 py-3 text-center text-red-600">
                            {team.losses}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-100 text-primary-800">
                              {team.points}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {team.goals_for}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {team.goals_against}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            <span className={team.goal_difference > 0 ? 'text-green-600' : team.goal_difference < 0 ? 'text-red-600' : ''}>
                              {team.goal_difference > 0 ? '+' : ''}
                              {team.goal_difference}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Playoff Qualification Legend */}
              {groupName !== 'Overall' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-3 h-3 bg-green-100 rounded"></span>
                    <span>
                      Top {playoffQualifyCount} đội tiến vào vòng Playoff
                      {maxTeams === 8 && ' (giải 8 đội)'}
                      {maxTeams === 16 && ' (giải 16 đội)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Calculation Legend */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3">📖 Cách tính điểm (Bóng rổ)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-medium">Thắng:</span> +1 điểm
              </div>
              <div>
                <span className="font-medium">Thua:</span> +0 điểm
              </div>
              <div>
                <span className="font-medium">BT:</span> Bàn thắng (Điểm ghi được)
              </div>
              <div>
                <span className="font-medium">BB:</span> Bàn bại (Điểm thủng lưới)
              </div>
              <div>
                <span className="font-medium">HS:</span> Hiệu số (BT - BB)
              </div>
              <div>
                <span className="font-medium text-green-600">✓ Playoff:</span> 
                {maxTeams === 8 ? ' Top 2 mỗi bảng' : ' Top 4 mỗi bảng'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Thứ tự xếp hạng:</span> Điểm → Hiệu số → Bàn thắng
              </p>
              <p className="text-xs text-gray-500 mt-1">
                💡 Trong bóng rổ không có hòa. Chỉ đội thắng mới được điểm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandingsPage;

