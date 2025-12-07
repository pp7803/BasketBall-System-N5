import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "../Notifications/NotificationBell";
import { useState } from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaTrophy,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaChartLine,
  FaBuilding,
  FaUserCheck,
  FaPlusCircle,
  FaMedal,
  FaClipboardList,
  FaFutbol,
  FaBasketballBall,
  FaUsers,
  FaBullhorn,
  FaBars,
  FaTimes,
  FaEdit,
  FaWallet,
  FaClock,
  FaComments,
} from "react-icons/fa";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // Role-based navigation links
  const getRoleBasedLinks = () => {
    if (!user) return null;

    const links = {
      admin: [
        { to: "/admin/dashboard", label: "Dashboard", icon: FaChartLine },
        { to: "/admin/members", label: "Quản lý thành viên", icon: FaUsers },
        { to: "/admin/venues", label: "Sân thi đấu", icon: FaBuilding },
        {
          to: "/admin/tournaments/approve",
          label: "Duyệt giải đấu",
          icon: FaTrophy,
        },
        {
          to: "/admin/teams/approve",
          label: "Duyệt đội bóng",
          icon: FaUsers,
        },
        {
          to: "/admin/forum",
          label: "Diễn đàn",
          icon: FaComments,
        },
        {
          to: "/admin/notifications/create",
          label: "Gửi thông báo",
          icon: FaBullhorn,
        },
      ],
      sponsor: [
        {
          to: "/sponsor/tournaments",
          label: "Giải đấu của tôi",
          icon: FaTrophy,
        },
        {
          to: "/sponsor/schedule",
          label: "Lập lịch thi đấu",
          icon: FaCalendarAlt,
        },
      ],
      coach: [
        { to: "/coach/teams", label: "Quản lý đội", icon: FaUsers },
        { to: "/coach/tournaments", label: "Giải đấu", icon: FaTrophy },
      ],
      athlete: [
        { to: "/athlete/find-teams", label: "Tìm đội", icon: FaUsers },
        { to: "/athlete/schedule", label: "Lịch thi", icon: FaClipboardList },
      ],
      referee: [
        { to: "/referee/matches", label: "Trận đấu", icon: FaFutbol },
        { to: "/referee/availability", label: "Thời gian rảnh", icon: FaClock },
      ],
    };

    const roleLinks = links[user.role] || [];
    return roleLinks.map((link) => {
      const IconComponent = link.icon;
      return (
        <Link
          key={link.to}
          to={link.to}
          className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-2 transition-colors"
        >
          <IconComponent className="text-lg" />
          <span>{link.label}</span>
        </Link>
      );
    });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-3">
            {/* Sidebar Toggle Button - Left side, close to logo */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none text-2xl p-2 hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
            <FaBasketballBall className="text-3xl text-primary-600 group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors hidden sm:inline">
              Basketball Tournament
            </span>
            <span className="text-xl font-bold text-gray-800 group-hover:text-primary-600 transition-colors sm:hidden">
              BBall
            </span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notification Bell - Only for authenticated users */}
                <NotificationBell />

                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center space-x-3 bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <FaUserCircle className="text-2xl text-gray-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.full_name || user?.username || "User"}
                    </span>
                    <span className="badge badge-info text-xs mb-1">
                      {user?.role || "user"}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <FaWallet className="text-green-600" />
                      <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat("vi-VN").format(
                          user?.money || 0
                        )}{" "}
                        VND
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info - Mobile */}
                <div className="md:hidden flex items-center space-x-2">
                  <FaUserCircle className="text-2xl text-gray-600" />
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  <FaSignInAlt />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm flex items-center space-x-2"
                >
                  <FaUserPlus />
                  <span className="hidden sm:inline">Đăng ký</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
              <div className="flex items-center space-x-3">
                <FaBasketballBall className="text-3xl text-white" />
                <span className="text-lg font-bold text-white">Menu</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none text-2xl p-1 hover:bg-white hover:bg-opacity-20 rounded transition-all"
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>

            {/* User Info Section */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <FaUserCircle className="text-4xl text-gray-600" />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-gray-900">
                      {user?.full_name || user?.username || "User"}
                    </span>
                    <span className="badge badge-info text-xs">
                      {user?.role || "user"}
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-green-600 text-lg" />
                      <span className="text-sm font-medium text-gray-700">
                        Số dư:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {new Intl.NumberFormat("vi-VN").format(user?.money || 0)}{" "}
                      VND
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col space-y-1 p-4">
                {/* Public Links Section */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    Trang chính
                  </h3>
                  <Link
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaHome className="text-lg" />
                    <span>Trang chủ</span>
                  </Link>
                  <Link
                    to="/matches"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaCalendarAlt className="text-lg" />
                    <span>Lịch thi đấu</span>
                  </Link>
                  <Link
                    to="/standings"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaTrophy className="text-lg" />
                    <span>Bảng xếp hạng</span>
                  </Link>
                  <Link
                    to="/forum"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaComments className="text-lg" />
                    <span>Diễn đàn</span>
                  </Link>
                </div>

                {/* Rating Links Section */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    Đánh giá
                  </h3>
                  <Link
                    to="/coaches"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaUserCheck className="text-lg" />
                    <span>Huấn luyện viên</span>
                  </Link>
                  <Link
                    to="/athletes"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaMedal className="text-lg" />
                    <span>Vận động viên</span>
                  </Link>
                  <Link
                    to="/tournaments-public"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <FaTrophy className="text-lg" />
                    <span>Giải đấu</span>
                  </Link>
                  {isAuthenticated && user && (
                    <Link
                      to="/my-ratings"
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                    >
                      <FaEdit className="text-lg" />
                      <span>Đánh giá của tôi</span>
                    </Link>
                  )}
                </div>

                {/* Role-based Links */}
                {user && (() => {
                  const links = {
                    admin: [
                      { to: "/admin/dashboard", label: "Dashboard", icon: FaChartLine },
                      { to: "/admin/members", label: "Quản lý thành viên", icon: FaUsers },
                      { to: "/admin/venues", label: "Sân thi đấu", icon: FaBuilding },
                      { to: "/admin/tournaments/approve", label: "Duyệt giải đấu", icon: FaTrophy },
                      { to: "/admin/teams/approve", label: "Duyệt đội bóng", icon: FaUsers },
                      { to: "/admin/forum", label: "Diễn đàn", icon: FaComments },
                      { to: "/admin/notifications/create", label: "Gửi thông báo", icon: FaBullhorn },
                      { to: "/admin/ratings", label: "Quản lý đánh giá", icon: FaEdit },
                    ],
                    sponsor: [
                      { to: "/sponsor/tournaments", label: "Giải đấu của tôi", icon: FaTrophy },
                      { to: "/sponsor/schedule", label: "Lập lịch thi đấu", icon: FaCalendarAlt },
                    ],
                    coach: [
                      { to: "/coach/teams", label: "Quản lý đội", icon: FaUsers },
                      { to: "/coach/tournaments", label: "Giải đấu", icon: FaTrophy },
                    ],
                    athlete: [
                      { to: "/athlete/find-teams", label: "Tìm đội", icon: FaUsers },
                      { to: "/athlete/schedule", label: "Lịch thi", icon: FaClipboardList },
                    ],
                    referee: [
                      { to: "/referee/matches", label: "Trận đấu", icon: FaFutbol },
                      { to: "/referee/availability", label: "Thời gian bận", icon: FaClock },
                    ],
                  };

                  const roleLinks = links[user.role] || [];
                  if (roleLinks.length === 0) return null;

                  return (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                        {user.role === "admin" ? "Quản trị" :
                         user.role === "sponsor" ? "Nhà tài trợ" :
                         user.role === "coach" ? "Huấn luyện viên" :
                         user.role === "athlete" ? "Vận động viên" :
                         user.role === "referee" ? "Trọng tài" : "Chức năng"}
                      </h3>
                      {roleLinks.map((link) => {
                        const IconComponent = link.icon;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all"
                          >
                            <IconComponent className="text-lg" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Sidebar Footer - User Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <Link
                    to={
                      user.role === "athlete" ? "/athlete/profile" :
                      user.role === "coach" ? "/coach/profile" :
                      user.role === "sponsor" ? "/sponsor/profile" :
                      user.role === "admin" ? "/admin/profile" :
                      user.role === "referee" ? "/referee/profile" :
                      "/profile"
                    }
                    onClick={() => setSidebarOpen(false)}
                    className="w-full text-gray-700 hover:text-primary-600 hover:bg-white font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all border border-gray-200"
                  >
                    <FaUserCircle className="text-lg" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-medium flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all border border-red-200"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full text-gray-700 hover:text-primary-600 hover:bg-white font-medium flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all border border-gray-300"
                  >
                    <FaSignInAlt className="text-lg" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all"
                  >
                    <FaUserPlus className="text-lg" />
                    <span>Đăng ký</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
