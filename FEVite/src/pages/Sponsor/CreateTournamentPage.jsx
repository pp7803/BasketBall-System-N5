import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sponsorAPI } from "../../services/api";
import { FaTrophy, FaDollarSign, FaMedal, FaWallet } from "react-icons/fa";

const CreateTournamentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to format number with dots
  const formatMoney = (amount) => {
    if (!amount && amount !== 0) return "0";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse formatted money string to number (remove dots)
  const parseMoney = (value) => {
    if (!value) return 0;
    const cleaned = value.toString().replace(/\./g, "");
    return parseInt(cleaned) || 0;
  };

  // Format money input value (for display in input)
  const formatMoneyInput = (value) => {
    if (!value && value !== 0) return "";
    const numValue = typeof value === "string" ? parseMoney(value) : value;
    return formatMoney(numValue);
  };

  const [formData, setFormData] = useState({
    tournament_name: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    max_teams: 8,
    entry_fee: 0,
    total_prize_money: 0,
    prize_1st: 0,
    prize_2nd: 0,
    prize_3rd: 0,
    prize_4th: 0,
    prize_5th_to_8th: 0,
    prize_9th_to_16th: 0,
  });

  // Quick percentage presets
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

  // Reset prize_9th_to_16th when switching from 16 to 8 teams
  useEffect(() => {
    if (formData.max_teams === 8 && formData.prize_9th_to_16th > 0) {
      setFormData((prev) => ({
        ...prev,
        prize_9th_to_16th: 0,
      }));
    }
  }, [formData.max_teams]);

  // Auto-calculate prize distribution when total_prize_money or max_teams changes
  useEffect(() => {
    const total = formData.total_prize_money;
    if (total > 0 && formData.prize_1st === 0 && formData.prize_2nd === 0) {
      // Only auto-calculate if prizes are not set yet (initial state)
      if (formData.max_teams === 8) {
        setFormData((prev) => ({
          ...prev,
          prize_1st: Math.floor((total * 40) / 100),
          prize_2nd: Math.floor((total * 30) / 100),
          prize_3rd: Math.floor((total * 20) / 100),
          prize_4th: Math.floor((total * 10) / 100),
          prize_5th_to_8th: 0,
          prize_9th_to_16th: 0,
        }));
      } else {
        // 16 teams
        setFormData((prev) => ({
          ...prev,
          prize_1st: Math.floor((total * 35) / 100),
          prize_2nd: Math.floor((total * 25) / 100),
          prize_3rd: Math.floor((total * 20) / 100),
          prize_4th: Math.floor((total * 10) / 100),
          prize_5th_to_8th: Math.floor((total * 5) / 100 / 4),
          prize_9th_to_16th: Math.floor((total * 5) / 100 / 8),
        }));
      }
    }
  }, [formData.total_prize_money, formData.max_teams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate dates
      const regDeadline = new Date(formData.registration_deadline);
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const now = new Date();

      if (regDeadline <= now) {
        setError("Hạn đăng ký phải sau ngày hiện tại");
        setLoading(false);
        return;
      }

      if (startDate <= regDeadline) {
        setError("Ngày bắt đầu phải sau hạn đăng ký");
        setLoading(false);
        return;
      }

      if (endDate <= startDate) {
        setError("Ngày kết thúc phải sau ngày bắt đầu");
        setLoading(false);
        return;
      }

      const response = await sponsorAPI.createTournament(formData);

      if (response.data.success) {
        alert("Tạo giải đấu thành công!");
        navigate("/sponsor/tournaments");
      }
    } catch (err) {
      console.error("Create tournament error:", err);
      setError(err.response?.data?.message || "Lỗi khi tạo giải đấu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" /> Tạo Giải Đấu Mới
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="VD: Giải Bóng Rổ Vinamilk 2025"
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
                  placeholder="Mô tả chi tiết về giải đấu..."
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
                <p className="text-sm text-gray-500 mt-1">
                  Chọn quy mô giải đấu
                </p>
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
                <p className="text-sm text-gray-500 mt-1">
                  {formData.total_prize_money > 0
                    ? `${formatMoney(formData.total_prize_money)} VND`
                    : "Chưa có giải thưởng"}
                </p>
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

              {/* Tổng giải thưởng phân phối */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Tổng giải thưởng phân phối:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatMoney(
                      formData.prize_1st +
                        formData.prize_2nd +
                        formData.prize_3rd +
                        formData.prize_4th +
                        formData.prize_5th_to_8th * 4 +
                        (formData.max_teams === 16
                          ? formData.prize_9th_to_16th * 8
                          : 0)
                    )}{" "}
                    VND
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Giải 1 ({formatMoney(formData.prize_1st)}) + Giải 2 (
                  {formatMoney(formData.prize_2nd)}) + Giải 3 (
                  {formatMoney(formData.prize_3rd)}) + Giải 4 (
                  {formatMoney(formData.prize_4th)}) + Giải 5-8 (
                  {formatMoney(formData.prize_5th_to_8th * 4)})
                  {formData.max_teams === 16 && (
                    <>
                      {" "}
                      + Giải 9-16 ({formatMoney(formData.prize_9th_to_16th * 8)}
                      )
                    </>
                  )}
                </p>
              </div>

              {/* Admin Fee - 1% of total prize money */}
              {formData.total_prize_money > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-orange-900">
                        💼 Lệ phí tạo giải (1% tổng giải thưởng):
                      </span>
                      <p className="text-xs text-orange-700 mt-1">
                        Phí này sẽ được trừ khi <strong>admin duyệt</strong>{" "}
                        giải đấu
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
              onClick={() => navigate("/sponsor/tournaments")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo..." : "Tạo Giải Đấu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournamentPage;
