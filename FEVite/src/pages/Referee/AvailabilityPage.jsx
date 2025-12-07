import { useState, useEffect } from "react";
import { refereeAPI } from "../../services/api";
import {
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { format } from "date-fns";

const AvailabilityPage = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, [filterStartDate, filterEndDate]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStartDate) params.start_date = filterStartDate;
      if (filterEndDate) params.end_date = filterEndDate;

      const response = await refereeAPI.getMyAvailability(params);
      if (response.data.success) {
        setAvailability(response.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Lỗi khi tải danh sách lịch bận"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      if (editingId) {
        // Update
        const response = await refereeAPI.updateAvailability(editingId, formData);
        if (response.data.success) {
          await fetchAvailability();
          setShowAddModal(false);
          resetForm();
        }
      } else {
        // Add
        const response = await refereeAPI.addAvailability(formData);
        if (response.data.success) {
          await fetchAvailability();
          setShowAddModal(false);
          resetForm();
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Lỗi khi lưu lịch bận"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch bận này?")) {
      return;
    }

    try {
      const response = await refereeAPI.deleteAvailability(id);
      if (response.data.success) {
        await fetchAvailability();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Lỗi khi xóa lịch bận"
      );
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.availability_id);
    setFormData({
      date: item.date,
      start_time: item.start_time,
      end_time: item.end_time,
      notes: item.notes || "",
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      notes: "",
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  // Group availability by date
  const groupedByDate = availability.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Quản lý lịch bận
          </h1>
          <p className="text-gray-600 mt-2">
            Mặc định bạn luôn rảnh. Chỉ thêm các khoảng thời gian BẬN để sponsor biết khi nào bạn không thể làm trọng tài
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Thêm lịch bận
        </button>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Lọc theo ngày</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
        {(filterStartDate || filterEndDate) && (
          <button
            onClick={() => {
              setFilterStartDate("");
              setFilterEndDate("");
            }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <FaInfoCircle /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : availability.length === 0 ? (
        <div className="card text-center py-8">
          <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Bạn chưa có lịch bận nào. Mặc định bạn luôn rảnh. Chỉ thêm lịch bận khi bạn không thể làm trọng tài.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, items]) => (
              <div key={date} className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  {format(new Date(date), "dd/MM/yyyy")}
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.availability_id}
                      className="p-4 rounded-lg border-2 border-red-200 bg-red-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-gray-600" />
                            <span className="font-medium">
                              {item.start_time} - {item.end_time}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              Bận
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              📝 {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn-secondary text-sm"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.availability_id)}
                            className="btn-danger text-sm"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingId ? "Sửa lịch bận" : "Thêm lịch bận"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <FaInfoCircle className="inline mr-1" />
                    <strong>Lưu ý:</strong> Tất cả các khoảng thời gian bạn thêm vào đây đều là lịch BẬN. 
                    Mặc định bạn luôn rảnh nếu không có trong danh sách này.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="input"
                    rows={3}
                    placeholder="Ví dụ: Chỉ rảnh buổi sáng"
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <FaInfoCircle /> {error}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary"
                  >
                    <FaTimes /> Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    <FaCheck /> {editingId ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPage;

