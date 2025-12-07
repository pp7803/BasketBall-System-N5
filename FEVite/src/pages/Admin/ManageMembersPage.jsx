import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";

const ManageMembersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
  });

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // Delete confirmation state
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Money adjustment modal state
  const [adjustMoneyUser, setAdjustMoneyUser] = useState(null);
  const [moneyFormData, setMoneyFormData] = useState({
    amount: "",
    type: "add",
    reason: "",
  });
  const [moneyLoading, setMoneyLoading] = useState(false);
  const [moneyMessage, setMoneyMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterActive, pagination.offset]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterRole) params.role = filterRole;
      if (filterActive !== "") params.is_active = filterActive;

      const response = await userAPI.getAllUsers(params);
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openEditModal = async (user) => {
    setEditingUser(user);
    setEditLoading(true);
    try {
      // Fetch full user detail including role-specific data
      const response = await userAPI.getUserDetail(user.user_id);
      if (response.data.success) {
        const fullUser = response.data.data;
        setEditFormData({
          email: fullUser.email || "",
          full_name: fullUser.full_name || "",
          phone: fullUser.phone || "",
          is_active: fullUser.is_active === 1,
          roleData: fullUser.roleData || {},
        });
      }
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditFormData({});
    setEditMessage(null);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleDataChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      roleData: {
        ...prev.roleData,
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    setEditMessage(null);
    try {
      const response = await userAPI.updateUser(
        editingUser.user_id,
        editFormData
      );
      if (response.data.success) {
        setEditMessage({ type: "success", text: "Cập nhật thành công!" });
        setTimeout(() => {
          closeEditModal();
          fetchUsers();
        }, 1500);
      }
    } catch (error) {
      setEditMessage({
        type: "error",
        text: error.response?.data?.message || "Cập nhật thất bại",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteConfirm = (user) => {
    setDeletingUser(user);
  };

  const closeDeleteConfirm = () => {
    setDeletingUser(null);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await userAPI.deleteUser(deletingUser.user_id);
      if (response.data.success) {
        closeDeleteConfirm();
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert(error.response?.data?.message || "Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      coach: "bg-blue-100 text-blue-800",
      athlete: "bg-green-100 text-green-800",
      sponsor: "bg-purple-100 text-purple-800",
      referee: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const openMoneyAdjustModal = (user) => {
    setAdjustMoneyUser(user);
    setMoneyFormData({
      amount: "",
      type: "add",
      reason: "",
    });
    setMoneyMessage(null);
  };

  const closeMoneyAdjustModal = () => {
    setAdjustMoneyUser(null);
    setMoneyFormData({
      amount: "",
      type: "add",
      reason: "",
    });
    setMoneyMessage(null);
  };

  const handleMoneyAdjust = async () => {
    if (!moneyFormData.amount || moneyFormData.amount <= 0) {
      setMoneyMessage({
        type: "error",
        text: "Vui lòng nhập số tiền hợp lệ",
      });
      return;
    }

    if (!moneyFormData.reason || moneyFormData.reason.trim().length === 0) {
      setMoneyMessage({
        type: "error",
        text: "Vui lòng nhập lý do điều chỉnh",
      });
      return;
    }

    setMoneyLoading(true);
    setMoneyMessage(null);
    try {
      const response = await userAPI.adjustUserMoney(
        adjustMoneyUser.user_id,
        moneyFormData
      );
      if (response.data.success) {
        setMoneyMessage({
          type: "success",
          text: `Đã ${moneyFormData.type === "add" ? "cộng" : "trừ"} ${parseInt(
            moneyFormData.amount
          ).toLocaleString()} VND thành công!`,
        });
        setTimeout(() => {
          closeMoneyAdjustModal();
          fetchUsers();
        }, 2000);
      }
    } catch (error) {
      setMoneyMessage({
        type: "error",
        text: error.response?.data?.message || "Điều chỉnh tiền thất bại",
      });
    } finally {
      setMoneyLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý thành viên</h1>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          {/* Search input */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role filter */}
          <div className="w-40">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="athlete">Athlete</option>
              <option value="sponsor">Sponsor</option>
              <option value="referee">Referee</option>
            </select>
          </div>

          {/* Active filter */}
          <div className="w-40">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Ngưng hoạt động</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaFilter className="inline mr-2" />
            Lọc
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FaUserCircle className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-600">Không tìm thấy thành viên nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đăng nhập lần cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active === 1 ? (
                        <span className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <FaTimesCircle className="mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString("vi-VN")
                        : "Chưa đăng nhập"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Sửa thông tin"
                      >
                        <FaEdit className="inline mr-1" />
                        Sửa
                      </button>
                      <button
                        onClick={() => openMoneyAdjustModal(user)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Điều chỉnh số dư"
                      >
                        <FaMoneyBillWave className="inline mr-1" />
                        Tiền
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Vô hiệu hóa tài khoản"
                      >
                        <FaTrash className="inline mr-1" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {pagination.offset + 1} -{" "}
              {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
              / {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: Math.max(0, prev.offset - prev.limit),
                  }))
                }
                disabled={pagination.offset === 0}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    offset: Math.min(
                      prev.total - prev.limit,
                      prev.offset + prev.limit
                    ),
                  }))
                }
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Chỉnh sửa thành viên</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {editLoading && !editFormData.email ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              ) : (
                <>
                  {editMessage && (
                    <div
                      className={`mb-4 p-4 rounded-lg ${
                        editMessage.type === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {editMessage.text}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Basic info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editingUser.username}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Vai trò
                        </label>
                        <input
                          type="text"
                          value={editingUser.role}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        value={editFormData.full_name}
                        onChange={(e) =>
                          handleEditFormChange("full_name", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email (không thể thay đổi)
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) =>
                          handleEditFormChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editFormData.is_active}
                          onChange={(e) =>
                            handleEditFormChange("is_active", e.target.checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">
                          Tài khoản hoạt động
                        </span>
                      </label>
                    </div>

                    {/* Role-specific fields */}
                    {editingUser.role === "athlete" &&
                      editFormData.roleData && (
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-semibold mb-3">
                            Thông tin vận động viên
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Vị trí
                              </label>
                              <select
                                value={editFormData.roleData.position || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "position",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              >
                                <option value="">Chưa chọn</option>
                                <option value="PG">Point Guard (PG)</option>
                                <option value="SG">Shooting Guard (SG)</option>
                                <option value="SF">Small Forward (SF)</option>
                                <option value="PF">Power Forward (PF)</option>
                                <option value="C">Center (C)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Ngày sinh
                              </label>
                              <input
                                type="date"
                                value={
                                  editFormData.roleData.date_of_birth || ""
                                }
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "date_of_birth",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Chiều cao (cm)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={editFormData.roleData.height || ""}
                                onChange={(e) =>
                                  handleRoleDataChange("height", e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Cân nặng (kg)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={editFormData.roleData.weight || ""}
                                onChange={(e) =>
                                  handleRoleDataChange("weight", e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    {editingUser.role === "coach" && editFormData.roleData && (
                      <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold mb-3">
                          Thông tin huấn luyện viên
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Giấy phép HLV (không thể thay đổi)
                            </label>
                            <input
                              type="text"
                              value={
                                editFormData.roleData.coaching_license || ""
                              }
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Số năm kinh nghiệm (không thể thay đổi)
                            </label>
                            <input
                              type="number"
                              value={
                                editFormData.roleData.years_of_experience || ""
                              }
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {editingUser.role === "sponsor" &&
                      editFormData.roleData && (
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-semibold mb-3">
                            Thông tin nhà tài trợ
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Tên công ty
                              </label>
                              <input
                                type="text"
                                value={editFormData.roleData.company_name || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "company_name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Địa chỉ công ty
                              </label>
                              <input
                                type="text"
                                value={
                                  editFormData.roleData.company_address || ""
                                }
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "company_address",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Mã số thuế
                              </label>
                              <input
                                type="text"
                                value={editFormData.roleData.tax_code || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "tax_code",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    {editingUser.role === "referee" &&
                      editFormData.roleData && (
                        <div className="border-t pt-4 mt-4">
                          <h3 className="font-semibold mb-3">
                            Thông tin trọng tài
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Số giấy phép
                              </label>
                              <input
                                type="text"
                                value={
                                  editFormData.roleData.license_number || ""
                                }
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "license_number",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Cấp chứng chỉ
                              </label>
                              <input
                                type="text"
                                value={
                                  editFormData.roleData.certification_level ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "certification_level",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={closeEditModal}
                      disabled={editLoading}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={editLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn vô hiệu hóa tài khoản của{" "}
              <strong>{deletingUser.full_name}</strong>?
              <br />
              <span className="text-sm text-gray-500">
                (Tài khoản sẽ bị vô hiệu hóa, không thể đăng nhập)
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleteLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Money Adjustment Modal */}
      {adjustMoneyUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FaMoneyBillWave className="text-green-600 mr-2" />
                Điều chỉnh số dư
              </h2>
              <button
                onClick={closeMoneyAdjustModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {moneyMessage && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  moneyMessage.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {moneyMessage.text}
              </div>
            )}

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Người dùng:</p>
              <p className="font-semibold">{adjustMoneyUser.full_name}</p>
              <p className="text-sm text-gray-600">
                Username: {adjustMoneyUser.username}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Loại điều chỉnh
                </label>
                <select
                  value={moneyFormData.type}
                  onChange={(e) =>
                    setMoneyFormData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">Cộng tiền</option>
                  <option value="deduct">Trừ tiền</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Nhập số tiền"
                  value={moneyFormData.amount}
                  onChange={(e) =>
                    setMoneyFormData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {moneyFormData.amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    = {parseInt(moneyFormData.amount).toLocaleString()} VND
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Lý do điều chỉnh <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Nhập lý do điều chỉnh số dư..."
                  value={moneyFormData.reason}
                  onChange={(e) =>
                    setMoneyFormData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeMoneyAdjustModal}
                disabled={moneyLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleMoneyAdjust}
                disabled={moneyLoading}
                className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
                  moneyFormData.type === "add"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {moneyLoading
                  ? "Đang xử lý..."
                  : moneyFormData.type === "add"
                  ? "Cộng tiền"
                  : "Trừ tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembersPage;
