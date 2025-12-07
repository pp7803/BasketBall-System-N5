import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import {
  FaBuilding,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

const ManageVenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [formData, setFormData] = useState({
    venue_name: "",
    address: "",
    city: "",
    capacity: "",
    is_available: true,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm || filterCity || filterAvailable !== "") {
        // Use search API if filters are applied
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterCity) params.city = filterCity;
        if (filterAvailable !== "") params.is_available = filterAvailable;
        response = await adminAPI.searchVenues(params);
      } else {
        // Use regular get API
        response = await adminAPI.getVenues();
      }

      if (response.data.success) {
        setVenues(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
      alert("Không thể tải danh sách sân thi đấu");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVenues();
  };

  const handleCreate = () => {
    setFormData({
      venue_name: "",
      address: "",
      city: "",
      capacity: "",
      is_available: true,
    });
    setError("");
    setShowCreateModal(true);
  };

  const handleEdit = (venue) => {
    setSelectedVenue(venue);
    setFormData({
      venue_name: venue.venue_name || "",
      address: venue.address || "",
      city: venue.city || "",
      capacity: venue.capacity || "",
      is_available: venue.is_available === 1,
    });
    setError("");
    setShowEditModal(true);
  };

  const handleDelete = (venue) => {
    setSelectedVenue(venue);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      const data = {
        venue_name: formData.venue_name,
        address: formData.address,
        city: formData.city || null,
        capacity: parseInt(formData.capacity) || 0,
      };

      const response = await adminAPI.createVenue(data);
      if (response.data.success) {
        alert("✅ Tạo sân thi đấu thành công!");
        setShowCreateModal(false);
        fetchVenues();
      }
    } catch (err) {
      console.error("Error creating venue:", err);
      setError(err.response?.data?.message || "Không thể tạo sân thi đấu");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;

    setProcessing(true);
    setError("");

    try {
      const data = {
        venue_name: formData.venue_name,
        address: formData.address,
        city: formData.city || null,
        capacity: parseInt(formData.capacity) || 0,
        is_available: formData.is_available ? 1 : 0,
      };

      const response = await adminAPI.updateVenue(selectedVenue.venue_id, data);
      if (response.data.success) {
        alert("✅ Cập nhật sân thi đấu thành công!");
        setShowEditModal(false);
        setSelectedVenue(null);
        fetchVenues();
      }
    } catch (err) {
      console.error("Error updating venue:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể cập nhật sân thi đấu";
      const activeMatches = err.response?.data?.data?.active_matches;

      if (activeMatches && activeMatches.length > 0) {
        // Hiển thị thông báo chi tiết về các trận đấu đang diễn ra
        const matchesList = activeMatches
          .map(
            (m) =>
              `- Trận ${m.match_id} (${new Date(
                m.match_date
              ).toLocaleDateString("vi-VN")} ${m.match_time || ""})`
          )
          .join("\n");
        setError(
          `${errorMessage}\n\nCác trận đấu đang diễn ra:\n${matchesList}\n\nVui lòng cập nhật sau khi các trận đấu hoàn thành.`
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedVenue) return;

    setProcessing(true);
    try {
      const response = await adminAPI.deleteVenue(selectedVenue.venue_id);
      if (response.data.success) {
        alert("✅ Xóa sân thi đấu thành công!");
        setShowDeleteModal(false);
        setSelectedVenue(null);
        fetchVenues();
      }
    } catch (err) {
      console.error("Error deleting venue:", err);
      alert(
        err.response?.data?.message ||
          "Không thể xóa sân thi đấu. Sân có thể đang được sử dụng trong các trận đấu."
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaBuilding className="text-blue-600" />
          Quản lý sân thi đấu
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin các sân thi đấu trong hệ thống
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Tìm kiếm
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sân, địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* City filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Thành phố
              </label>
              <input
                type="text"
                placeholder="Tất cả thành phố"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Available filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Trạng thái
              </label>
              <select
                value={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
              >
                <option value="">Tất cả</option>
                <option value="1">Sẵn sàng</option>
                <option value="0">Không sẵn sàng</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <FaSearch /> Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFilterCity("");
                setFilterAvailable("");
                fetchVenues();
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <FaTimes /> Xóa bộ lọc
            </button>
          </div>
        </form>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          Tổng số sân: <strong>{venues.length}</strong>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Thêm sân mới
        </button>
      </div>

      {/* Venues List */}
      {loading ? (
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-6xl mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Đang tải danh sách sân thi đấu...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="card text-center py-12">
          <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Chưa có sân thi đấu nào</p>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Thêm sân đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.venue_id}
              className="card hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
            >
              {/* Venue Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg">
                      <FaBuilding className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {venue.venue_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {venue.is_available === 1 ? (
                          <span className="badge badge-success flex items-center gap-1">
                            <FaCheckCircle /> Sẵn sàng
                          </span>
                        ) : (
                          <span className="badge badge-error flex items-center gap-1">
                            <FaTimesCircle /> Không sẵn sàng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <FaMapMarkerAlt className="mt-1 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {venue.address || "Chưa có"}
                  </div>
                </div>
                {venue.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaBuilding className="text-blue-600" />
                    <span>
                      <span className="font-medium">Thành phố:</span>{" "}
                      {venue.city}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FaUsers className="text-blue-600" />
                  <span>
                    <span className="font-medium">Sức chứa:</span>{" "}
                    {formatNumber(venue.capacity)} người
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(venue)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(venue)}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Thêm sân thi đấu mới</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={processing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-6">
              {error && (
                <div className="alert alert-error mb-4">
                  <FaTimesCircle /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tên sân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue_name}
                    onChange={(e) =>
                      setFormData({ ...formData, venue_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Sức chứa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={processing}
                  className="btn-secondary"
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin" /> Đang tạo...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Tạo sân
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cập nhật sân thi đấu</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVenue(null);
                  }}
                  disabled={processing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6">
              {error && (
                <div className="alert alert-error mb-4 whitespace-pre-line">
                  <FaTimesCircle /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tên sân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue_name}
                    onChange={(e) =>
                      setFormData({ ...formData, venue_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Sức chứa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_available: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Sân sẵn sàng sử dụng
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVenue(null);
                  }}
                  disabled={processing}
                  className="btn-secondary"
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin" /> Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <FaEdit /> Cập nhật
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaTrash className="text-2xl text-red-600" />
                </div>
                <h2 className="text-xl font-bold">Xác nhận xóa sân</h2>
              </div>

              <p className="text-gray-700 mb-6">
                Bạn có chắc muốn xóa sân{" "}
                <strong>{selectedVenue.venue_name}</strong>?
                <br />
                <span className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác. Sân sẽ không thể xóa nếu
                  đang được sử dụng trong các trận đấu.
                </span>
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedVenue(null);
                  }}
                  disabled={processing}
                  className="btn-secondary"
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={processing}
                  className="btn-danger"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin" /> Đang xóa...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Xóa
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

export default ManageVenuesPage;
