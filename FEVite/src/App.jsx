import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import HomePage from "./pages/Public/HomePage";
import MatchesPage from "./pages/Public/MatchesPage";
import StandingsPage from "./pages/Public/StandingsPage";
import ForumPage from "./pages/Public/ForumPage";
import ForumTopicPage from "./pages/Public/ForumTopicPage";
import ForumPostPage from "./pages/Public/ForumPostPage";
import AthleteProfilePage from "./pages/Athlete/ProfilePage";
import FindTeamsPage from "./pages/Athlete/FindTeamsPage";
import CreateTournamentPage from "./pages/Sponsor/CreateTournamentPage";
import ManageTournamentsPage from "./pages/Sponsor/ManageTournamentsPage";
import TournamentDetailPage from "./pages/Sponsor/TournamentDetailPage";
import SponsorApproveTeamRegistrationsPage from "./pages/Sponsor/ApproveTeamRegistrationsPage";
import CoachManageTeamsPage from "./pages/Coach/ManageTeamsPage";
import CoachTournamentsPage from "./pages/Coach/TournamentsPage";
import CreateTeamPage from "./pages/Coach/CreateTeamPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminNotificationsPage from "./pages/Admin/AdminNotificationsPage";
import ManageMembersPage from "./pages/Admin/ManageMembersPage";
import ApproveTournamentsPage from "./pages/Admin/ApproveTournamentsPage";
import ApproveTeamsPage from "./pages/Admin/ApproveTeamsPage";
import ManageVenuesPage from "./pages/Admin/ManageVenuesPage";
import ForumManagementPage from "./pages/Admin/ForumManagementPage";
import ProfilePage from "./pages/ProfilePage";
import RefereeAvailabilityPage from "./pages/Referee/AvailabilityPage";
import SponsorScheduleManagementPage from "./pages/Sponsor/ScheduleManagementPage";
import TournamentSchedulePage from "./pages/Sponsor/TournamentSchedulePage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Placeholder components for role-specific pages
const AdminDashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">👑 Admin Dashboard</h1>
    <div className="card">
      <p>Quản lý hệ thống - Coming soon</p>
      <p className="text-sm text-gray-600 mt-2">
        UC05-UC10: Duyệt đội, xếp lịch, phân công trọng tài, quản lý sân, cập
        nhật BXH
      </p>
    </div>
  </div>
);

const SponsorDashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">👨‍💼 Sponsor Dashboard</h1>
    <div className="card">
      <p>Quản lý giải đấu - Coming soon</p>
      <p className="text-sm text-gray-600 mt-2">
        UC03: Tạo giải đấu, UC04: Xem thống kê
      </p>
    </div>
  </div>
);

const AthleteSchedule = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">📅 Lịch thi của tôi</h1>
    <div className="card">
      <p>Lịch thi cá nhân - Coming soon</p>
      <p className="text-sm text-gray-600 mt-2">UC11: Xem lịch thi cá nhân</p>
    </div>
  </div>
);

import RefereeMatchesPage from "./pages/Referee/MatchesPage";
import CoachesPage from "./pages/Public/CoachesPage";
import CoachDetailPage from "./pages/Public/CoachDetailPage";
import AthletesPage from "./pages/Public/AthletesPage";
import AthleteDetailPage from "./pages/Public/AthleteDetailPage";
import TournamentsPublicPage from "./pages/Public/TournamentsPublicPage";
import TournamentDetailPublicPage from "./pages/Public/TournamentDetailPage";
import MyRatingsPage from "./pages/MyRatingsPage";
import ManageRatingsPage from "./pages/Admin/ManageRatingsPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes with Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/standings" element={<StandingsPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route
                path="/forum/topics/:topicId"
                element={<ForumTopicPage />}
              />
              <Route path="/forum/posts/:postId" element={<ForumPostPage />} />
              <Route path="/coaches" element={<CoachesPage />} />
              <Route path="/coaches/:id" element={<CoachDetailPage />} />
              <Route path="/athletes" element={<AthletesPage />} />
              <Route path="/athletes/:id" element={<AthleteDetailPage />} />
              <Route path="/tournaments-public" element={<TournamentsPublicPage />} />
              <Route path="/tournaments/:id" element={<TournamentDetailPublicPage />} />
            </Route>

            {/* Auth Routes (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Notifications - All authenticated users */}
            <Route element={<Layout />}>
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-ratings"
                element={
                  <ProtectedRoute>
                    <MyRatingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Routes - Admin */}
            <Route element={<Layout />}>
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageMembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tournaments/approve"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ApproveTournamentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teams/approve"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ApproveTeamsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications/create"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/venues"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageVenuesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/forum"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ForumManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ratings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageRatingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Routes - Sponsor */}
            <Route element={<Layout />}>
              <Route
                path="/sponsor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <SponsorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/tournaments"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <ManageTournamentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/tournaments/create"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <CreateTournamentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/tournaments/:id"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <TournamentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/tournaments/:tournamentId/team-registrations"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <SponsorApproveTeamRegistrationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/tournaments/:tournamentId/schedule"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <SponsorScheduleManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/schedule"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <TournamentSchedulePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Routes - Coach */}
            <Route element={<Layout />}>
              <Route
                path="/coach/teams"
                element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachManageTeamsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach/teams/create"
                element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CreateTeamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach/teams/:teamId/edit"
                element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CreateTeamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach/tournaments"
                element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachTournamentsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Routes - Athlete */}
            <Route element={<Layout />}>
              <Route
                path="/athlete/schedule"
                element={
                  <ProtectedRoute allowedRoles={["athlete"]}>
                    <AthleteSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/athlete/profile"
                element={
                  <ProtectedRoute allowedRoles={["athlete"]}>
                    <AthleteProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/athlete/find-teams"
                element={
                  <ProtectedRoute allowedRoles={["athlete"]}>
                    <FindTeamsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Profile Routes - Role specific */}
            <Route element={<Layout />}>
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach/profile"
                element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sponsor/profile"
                element={
                  <ProtectedRoute allowedRoles={["sponsor"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/referee/profile"
                element={
                  <ProtectedRoute allowedRoles={["referee"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected Routes - Referee */}
            <Route element={<Layout />}>
              <Route
                path="/referee/matches"
                element={
                  <ProtectedRoute allowedRoles={["referee"]}>
                    <RefereeMatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/referee/availability"
                element={
                  <ProtectedRoute allowedRoles={["referee"]}>
                    <RefereeAvailabilityPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
