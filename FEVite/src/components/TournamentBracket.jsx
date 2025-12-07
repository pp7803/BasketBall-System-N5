import { useState, useEffect } from "react";
import { publicAPI } from "../services/api";
import { FaTrophy, FaUsers, FaInfoCircle } from "react-icons/fa";

const TournamentBracket = ({ tournamentId }) => {
  const [format, setFormat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tournamentId) {
      fetchFormat();
    }
  }, [tournamentId]);

  const fetchFormat = async () => {
    try {
      setLoading(true);
      const response = await publicAPI.getTournamentFormat(tournamentId);
      if (response.data.success) {
        setFormat(response.data.data);
      }
    } catch (err) {
      setError("Lỗi khi tải format giải đấu");
      console.error("Fetch tournament format error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error || !format) {
    return null;
  }

  const is8Teams = format.max_teams === 8;

  return (
    <div className="card mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaTrophy className="text-yellow-500" />
        <h3 className="text-xl font-bold">Thể lệ và quy trình giải đấu</h3>
      </div>

      {/* Format Overview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <FaUsers className="text-blue-600" />
          <span className="font-semibold text-lg">
            {format.format} - {format.max_teams} đội tham gia
          </span>
        </div>
        <p className="text-sm text-gray-700">
          Giải đấu được tổ chức theo thể thức vòng bảng + loại trực tiếp
        </p>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {format.stages.map((stage, idx) => (
          <div
            key={stage.stage}
            className="p-4 border-2 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">{stage.name}</h4>
                <p className="text-gray-700 mb-2">{stage.description}</p>
                {stage.matches && (
                  <div className="text-sm text-gray-600">
                    <FaInfoCircle className="inline mr-1" />
                    {stage.matches} trận đấu
                  </div>
                )}
                {stage.matches_per_group && (
                  <div className="text-sm text-gray-600">
                    <FaInfoCircle className="inline mr-1" />
                    {stage.matches_per_group} trận/bảng × 2 bảng ={" "}
                    {stage.matches_per_group * 2} trận
                  </div>
                )}
                {stage.advancing_teams && (
                  <div className="text-sm text-blue-600 font-medium mt-1">
                    Top {stage.advancing_teams} đội mỗi bảng vào vòng tiếp theo
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          Quy tắc tính điểm và xếp hạng
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Vòng bảng:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 text-gray-700">
              <li>{format.rules.group_stage.points}</li>
              <li>Xếp hạng: {format.rules.group_stage.tiebreaker}</li>
            </ul>
          </div>
          <div>
            <strong>Vòng loại trực tiếp:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 text-gray-700">
              <li>{format.rules.playoff.format}</li>
              <li>{format.rules.playoff.advancing}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bracket Visualization */}
      <div className="mt-6">
        <h4 className="font-bold mb-3">Sơ đồ giải đấu</h4>
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 overflow-x-auto">
          {is8Teams ? (
            // 8 teams bracket
            <div className="flex flex-col items-center space-y-4 min-w-max">
              {/* Group Stage */}
              <div className="text-center mb-4">
                <div className="font-semibold text-blue-600 mb-2">Vòng bảng</div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="font-medium">Bảng A (4 đội)</div>
                    <div className="text-xs text-gray-600">6 trận</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Bảng B (4 đội)</div>
                    <div className="text-xs text-gray-600">6 trận</div>
                  </div>
                </div>
              </div>

              {/* Semifinal */}
              <div className="flex gap-8 items-center">
                <div className="text-center border-2 border-green-500 rounded p-2 bg-green-50">
                  <div className="font-semibold text-green-700">Bán kết 1</div>
                  <div className="text-xs">A1 vs B2</div>
                </div>
                <div className="text-center border-2 border-green-500 rounded p-2 bg-green-50">
                  <div className="font-semibold text-green-700">Bán kết 2</div>
                  <div className="text-xs">A2 vs B1</div>
                </div>
              </div>

              {/* Final */}
              <div className="text-center border-2 border-yellow-500 rounded p-3 bg-yellow-50">
                <div className="font-bold text-yellow-700 text-lg">Chung kết</div>
                <div className="text-sm">Winner SF1 vs Winner SF2</div>
              </div>
            </div>
          ) : (
            // 16 teams bracket
            <div className="flex flex-col items-center space-y-4 min-w-max">
              {/* Group Stage */}
              <div className="text-center mb-4">
                <div className="font-semibold text-blue-600 mb-2">Vòng bảng</div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="font-medium">Bảng A (8 đội)</div>
                    <div className="text-xs text-gray-600">28 trận</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Bảng B (8 đội)</div>
                    <div className="text-xs text-gray-600">28 trận</div>
                  </div>
                </div>
              </div>

              {/* Quarterfinal */}
              <div className="flex gap-4 items-center">
                <div className="text-center border-2 border-purple-500 rounded p-2 bg-purple-50">
                  <div className="font-semibold text-purple-700 text-xs">Tứ kết 1</div>
                  <div className="text-xs">A1 vs B4</div>
                </div>
                <div className="text-center border-2 border-purple-500 rounded p-2 bg-purple-50">
                  <div className="font-semibold text-purple-700 text-xs">Tứ kết 2</div>
                  <div className="text-xs">A2 vs B3</div>
                </div>
                <div className="text-center border-2 border-purple-500 rounded p-2 bg-purple-50">
                  <div className="font-semibold text-purple-700 text-xs">Tứ kết 3</div>
                  <div className="text-xs">A3 vs B2</div>
                </div>
                <div className="text-center border-2 border-purple-500 rounded p-2 bg-purple-50">
                  <div className="font-semibold text-purple-700 text-xs">Tứ kết 4</div>
                  <div className="text-xs">A4 vs B1</div>
                </div>
              </div>

              {/* Semifinal */}
              <div className="flex gap-8 items-center">
                <div className="text-center border-2 border-green-500 rounded p-2 bg-green-50">
                  <div className="font-semibold text-green-700">Bán kết 1</div>
                  <div className="text-xs">Winner QF1 vs Winner QF2</div>
                </div>
                <div className="text-center border-2 border-green-500 rounded p-2 bg-green-50">
                  <div className="font-semibold text-green-700">Bán kết 2</div>
                  <div className="text-xs">Winner QF3 vs Winner QF4</div>
                </div>
              </div>

              {/* Final */}
              <div className="text-center border-2 border-yellow-500 rounded p-3 bg-yellow-50">
                <div className="font-bold text-yellow-700 text-lg">Chung kết</div>
                <div className="text-sm">Winner SF1 vs Winner SF2</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;

