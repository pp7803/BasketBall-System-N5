import { useState, useEffect } from "react";
import { refereeAPI } from "../../services/api";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTrophy,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";
import { format } from "date-fns";

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [quarterScores, setQuarterScores] = useState({
    quarter_1_home: 0,
    quarter_1_away: 0,
    quarter_2_home: 0,
    quarter_2_away: 0,
    quarter_3_home: 0,
    quarter_3_away: 0,
    quarter_4_home: 0,
    quarter_4_away: 0,
  });
  const [matchNotes, setMatchNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    note_type: "other",
    minute: "",
    content: "",
  });
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await refereeAPI.getMyMatches();
      if (response.data.success) {
        setMatches(response.data.data);
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách trận đấu");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchNotes = async (matchId) => {
    try {
      setLoadingNotes(true);
      const response = await refereeAPI.getMyMatchNotes(matchId);
      if (response.data.success) {
        setMatchNotes(response.data.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải ghi chú trận đấu:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSubmitResult = async (matchId) => {
    try {
      setSubmitting(true);
      setError("");

      // Validate all scores are non-negative integers
      const scores = Object.values(quarterScores);
      if (scores.some((score) => score < 0 || !Number.isInteger(score))) {
        setError("Tất cả điểm số phải là số nguyên không âm");
        return;
      }

      const response = await refereeAPI.submitResult(matchId, quarterScores);
      if (response.data.success) {
        await fetchMatches();
        setSelectedMatch(null);
        setQuarterScores({
          quarter_1_home: 0,
          quarter_1_away: 0,
          quarter_2_home: 0,
          quarter_2_away: 0,
          quarter_3_home: 0,
          quarter_3_away: 0,
          quarter_4_home: 0,
          quarter_4_away: 0,
        });
        alert("✅ Đã gửi kết quả thành công. Vui lòng xác nhận kết quả để hoàn tất.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi khi gửi kết quả trận đấu";
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmResult = async (matchId) => {
    const match = matches.find((m) => m.match_id === matchId);
    if (!match) return;

    if (
      !window.confirm(
        `Bạn có chắc muốn xác nhận kết quả trận đấu?\n\n${match.home_team} vs ${match.away_team}\nKết quả: ${match.home_score} - ${match.away_score}\n\nSau khi xác nhận, kết quả sẽ được cập nhật vào bảng xếp hạng và không thể thay đổi.`
      )
    ) {
      return;
    }

    try {
      setConfirming(true);
      setError("");

      const response = await refereeAPI.confirmResult(matchId);
      if (response.data.success) {
        await fetchMatches();
        alert("✅ Đã xác nhận kết quả thành công. Bảng xếp hạng đã được cập nhật tự động.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi khi xác nhận kết quả";
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
    } finally {
      setConfirming(false);
    }
  };

  const openSubmitModal = (match) => {
    setSelectedMatch(match);
    // Load existing quarter scores if available, otherwise reset
    if (
      match.quarter_1_home !== undefined &&
      match.quarter_1_away !== undefined &&
      match.quarter_2_home !== undefined &&
      match.quarter_2_away !== undefined &&
      match.quarter_3_home !== undefined &&
      match.quarter_3_away !== undefined &&
      match.quarter_4_home !== undefined &&
      match.quarter_4_away !== undefined
    ) {
      setQuarterScores({
        quarter_1_home: match.quarter_1_home ?? 0,
        quarter_1_away: match.quarter_1_away ?? 0,
        quarter_2_home: match.quarter_2_home ?? 0,
        quarter_2_away: match.quarter_2_away ?? 0,
        quarter_3_home: match.quarter_3_home ?? 0,
        quarter_3_away: match.quarter_3_away ?? 0,
        quarter_4_home: match.quarter_4_home ?? 0,
        quarter_4_away: match.quarter_4_away ?? 0,
      });
    } else {
      setQuarterScores({
        quarter_1_home: 0,
        quarter_1_away: 0,
        quarter_2_home: 0,
        quarter_2_away: 0,
        quarter_3_home: 0,
        quarter_3_away: 0,
        quarter_4_home: 0,
        quarter_4_away: 0,
      });
    }

    setMatchNotes([]);
    setNoteForm({
      note_type: "other",
      minute: "",
      content: "",
    });
    fetchMatchNotes(match.match_id);
  };

  const calculateTotal = () => {
    const homeTotal =
      quarterScores.quarter_1_home +
      quarterScores.quarter_2_home +
      quarterScores.quarter_3_home +
      quarterScores.quarter_4_home;
    const awayTotal =
      quarterScores.quarter_1_away +
      quarterScores.quarter_2_away +
      quarterScores.quarter_3_away +
      quarterScores.quarter_4_away;
    return { homeTotal, awayTotal };
  };

  const { homeTotal, awayTotal } = calculateTotal();

  const handleAddNote = async () => {
    if (!selectedMatch) return;
    if (!noteForm.content.trim()) {
      setError("Nội dung ghi chú không được để trống");
      return;
    }

    try {
      setAddingNote(true);
      setError("");
      const payload = {
        note_type: noteForm.note_type,
        content: noteForm.content.trim(),
      };
      if (noteForm.minute !== "" && !Number.isNaN(parseInt(noteForm.minute))) {
        payload.minute = parseInt(noteForm.minute, 10);
      }

      const response = await refereeAPI.addMatchNote(
        selectedMatch.match_id,
        payload
      );
      if (response.data.success) {
        setNoteForm({
          note_type: "other",
          minute: "",
          content: "",
        });
        await fetchMatchNotes(selectedMatch.match_id);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Lỗi khi thêm ghi chú trận đấu";
      setError(errorMessage);
      alert(`❌ ${errorMessage}`);
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaTrophy className="text-blue-600" />
          Trận được phân công
        </h1>
        <p className="text-gray-600 mt-2">
          Danh sách các trận đấu bạn được phân công làm trọng tài
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <FaInfoCircle /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-6xl mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-8">
          <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Bạn chưa được phân công trận đấu nào.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div
              key={match.match_id}
              className={`card ${
                match.status === "completed"
                  ? "border-green-500"
                  : match.status === "scheduled"
                  ? "border-blue-500"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {match.home_team} vs {match.away_team}
                  </h3>
                  <p className="text-sm text-gray-600">{match.tournament_name}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    match.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : match.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {match.status === "completed"
                    ? "Hoàn thành"
                    : match.status === "scheduled"
                    ? "Đã lên lịch"
                    : "Đã hủy"}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
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
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-500" />
                  <span>{match.venue_name}</span>
                </div>
                {match.home_score !== null && 
                 match.home_score !== undefined &&
                 match.away_score !== null && 
                 match.away_score !== undefined && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <p className="text-xs text-gray-600 text-center mb-1">Kết quả</p>
                    <p className="font-bold text-2xl text-center text-blue-700">
                      {match.home_score} - {match.away_score}
                    </p>
                    {match.result_confirmed ? (
                      <p className="text-xs text-green-600 text-center mt-1 font-medium">
                        ✓ Đã xác nhận
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600 text-center mt-1 font-medium">
                        ⚠ Chờ xác nhận
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {match.status === "scheduled" && !match.result_confirmed && (
                  (match.home_score === null || match.home_score === undefined) ? (
                    <button
                      onClick={() => openSubmitModal(match)}
                      className="btn-primary flex-1 text-sm"
                    >
                      <FaEdit /> Nhập kết quả
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => openSubmitModal(match)}
                        className="btn-secondary flex-1 text-sm"
                      >
                        <FaEdit /> Sửa kết quả
                      </button>
                      <button
                        onClick={() => handleConfirmResult(match.match_id)}
                        disabled={confirming}
                        className="btn-primary flex-1 text-sm"
                      >
                        {confirming ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaCheck /> Xác nhận
                          </>
                        )}
                      </button>
                    </>
                  )
                )}
                {match.result_confirmed && (
                  <div className="flex-1 text-center text-sm text-green-600 font-medium">
                    <FaCheck /> Đã xác nhận
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Result Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Nhập kết quả trận đấu</h2>
                <button
                  onClick={() => {
                    setSelectedMatch(null);
                    setQuarterScores({
                      quarter_1_home: 0,
                      quarter_1_away: 0,
                      quarter_2_home: 0,
                      quarter_2_away: 0,
                      quarter_3_home: 0,
                      quarter_3_away: 0,
                      quarter_4_home: 0,
                      quarter_4_away: 0,
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  {selectedMatch.home_team} vs {selectedMatch.away_team}
                </h3>
                <p className="text-gray-600">{selectedMatch.tournament_name}</p>
              </div>

                  <div className="space-y-4">
                {[1, 2, 3, 4].map((quarter) => (
                  <div key={quarter} className="border-2 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Hiệp {quarter}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {selectedMatch.home_team}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={quarterScores[`quarter_${quarter}_home`]}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value || 0);
                            if (value >= 0 && Number.isInteger(value)) {
                              setQuarterScores({
                                ...quarterScores,
                                [`quarter_${quarter}_home`]: value,
                              });
                            }
                          }}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {selectedMatch.away_team}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={quarterScores[`quarter_${quarter}_away`]}
                          onChange={(e) => {
                            const value = e.target.value === "" ? 0 : parseInt(e.target.value || 0);
                            if (value >= 0 && Number.isInteger(value)) {
                              setQuarterScores({
                                ...quarterScores,
                                [`quarter_${quarter}_away`]: value,
                              });
                            }
                          }}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Tổng điểm</p>
                    <p className="text-2xl font-bold">
                      {homeTotal} - {awayTotal}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {selectedMatch.home_team}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedMatch.away_team}
                    </p>
                  </div>
                </div>
              </div>

              {/* Match notes */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  Ghi chú trận đấu
                  <span className="text-xs font-normal text-gray-500">
                    (Sự cố, chấn thương, thay người, ...)
                  </span>
                </h4>

                {/* Add note form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Loại ghi chú
                    </label>
                    <select
                      value={noteForm.note_type}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, note_type: e.target.value })
                      }
                      className="input"
                    >
                      <option value="incident">Sự cố</option>
                      <option value="injury">Chấn thương</option>
                      <option value="substitution">Thay người</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phút
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={noteForm.minute}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, minute: e.target.value })
                      }
                      className="input"
                      placeholder="VD: 15"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Nội dung
                    </label>
                    <textarea
                      rows={2}
                      value={noteForm.content}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, content: e.target.value })
                      }
                      className="input"
                      placeholder="Mô tả chi tiết sự kiện..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={addingNote}
                    className="btn-secondary text-sm"
                  >
                    {addingNote ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaEdit /> Thêm ghi chú
                      </>
                    )}
                  </button>
                </div>

                {/* Notes list */}
                <div className="mt-2">
                  {loadingNotes ? (
                    <p className="text-sm text-gray-500">
                      Đang tải ghi chú...
                    </p>
                  ) : matchNotes.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Chưa có ghi chú nào cho trận đấu này.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {matchNotes.map((note) => (
                        <div
                          key={note.note_id}
                          className="p-2 border rounded text-sm bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700">
                              {note.note_type === "incident"
                                ? "Sự cố"
                                : note.note_type === "injury"
                                ? "Chấn thương"
                                : note.note_type === "substitution"
                                ? "Thay người"
                                : "Khác"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {note.minute !== null
                                ? `${note.minute}'`
                                : ""}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">
                            {note.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {note.created_at
                              ? format(
                                  new Date(note.created_at),
                                  "dd/MM/yyyy HH:mm"
                                )
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="alert alert-error mt-4 whitespace-pre-line">
                  <FaInfoCircle /> {error}
                </div>
              )}

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMatch(null);
                    setQuarterScores({
                      quarter_1_home: 0,
                      quarter_1_away: 0,
                      quarter_2_home: 0,
                      quarter_2_away: 0,
                      quarter_3_home: 0,
                      quarter_3_away: 0,
                      quarter_4_home: 0,
                      quarter_4_away: 0,
                    });
                    setMatchNotes([]);
                    setNoteForm({
                      note_type: "other",
                      minute: "",
                      content: "",
                    });
                  }}
                  className="btn-secondary"
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  onClick={() => handleSubmitResult(selectedMatch.match_id)}
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaCheck /> Gửi kết quả
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchesPage;

