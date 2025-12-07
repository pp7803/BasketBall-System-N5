import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import {
  FaComments,
  FaEdit,
  FaExclamationTriangle,
  FaLock,
  FaPlus,
  FaSearch,
  FaThumbsDown,
  FaThumbsUp,
  FaTrash,
  FaUnlock,
} from "react-icons/fa";

const ForumManagementPage = () => {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicSearch, setTopicSearch] = useState("");
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    visibility: "public",
  });
  const [topicError, setTopicError] = useState("");
  const [savingTopic, setSavingTopic] = useState(false);

  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchTopics();
    fetchPendingPosts();
    fetchReports();
  };

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const params = {};
      if (topicSearch) params.search = topicSearch;
      const res = await adminAPI.getForumTopics(params);
      if (res.data.success) {
        setTopics(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching forum topics:", err);
      alert("Không thể tải danh sách chủ đề diễn đàn");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleOpenCreateTopic = () => {
    setEditingTopic(null);
    setTopicForm({ title: "", description: "", visibility: "public" });
    setTopicError("");
    setShowTopicModal(true);
  };

  const handleOpenEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title || "",
      description: topic.description || "",
      visibility: topic.visibility || "public",
    });
    setTopicError("");
    setShowTopicModal(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.title.trim()) {
      setTopicError("Tiêu đề không được để trống");
      return;
    }

    setSavingTopic(true);
    setTopicError("");
    try {
      if (editingTopic) {
        await adminAPI.updateForumTopic(editingTopic.topic_id, {
          title: topicForm.title.trim(),
          description: topicForm.description || null,
          visibility: topicForm.visibility || "public",
        });
        alert("✅ Cập nhật chủ đề thành công");
      } else {
        await adminAPI.createForumTopic({
          title: topicForm.title.trim(),
          description: topicForm.description || null,
          visibility: topicForm.visibility || "public",
        });
        alert("✅ Tạo chủ đề mới thành công");
      }
      setShowTopicModal(false);
      setEditingTopic(null);
      fetchTopics();
    } catch (err) {
      console.error("Error saving topic:", err);
      setTopicError(
        err.response?.data?.message || "Không thể lưu chủ đề. Vui lòng thử lại."
      );
    } finally {
      setSavingTopic(false);
    }
  };

  const handleTogglePinned = async (topic) => {
    try {
      await adminAPI.updateForumTopic(topic.topic_id, {
        is_pinned: topic.is_pinned ? 0 : 1,
      });
      fetchTopics();
    } catch (err) {
      console.error("Error updating pinned:", err);
      alert("Không thể cập nhật trạng thái ghim chủ đề");
    }
  };

  const handleToggleLocked = async (topic) => {
    try {
      await adminAPI.updateForumTopic(topic.topic_id, {
        is_locked: topic.is_locked ? 0 : 1,
      });
      fetchTopics();
    } catch (err) {
      console.error("Error updating lock:", err);
      alert("Không thể cập nhật trạng thái khóa chủ đề");
    }
  };

  const handleHideTopic = async (topic) => {
    if (
      !window.confirm(
        `Ẩn chủ đề "${topic.title}"? Chủ đề sẽ không hiển thị với người dùng public.`
      )
    ) {
      return;
    }
    try {
      await adminAPI.updateForumTopic(topic.topic_id, { status: "hidden" });
      fetchTopics();
    } catch (err) {
      console.error("Error hiding topic:", err);
      alert("Không thể ẩn chủ đề");
    }
  };

  const handleShowTopic = async (topic) => {
    try {
      await adminAPI.updateForumTopic(topic.topic_id, { status: "active" });
      fetchTopics();
    } catch (err) {
      console.error("Error showing topic:", err);
      alert("Không thể bật lại chủ đề");
    }
  };

  const handleDeleteTopic = async (topic) => {
    if (
      !window.confirm(
        `Xóa vĩnh viễn chủ đề "${topic.title}" cùng toàn bộ bài viết, bình luận?`
      )
    ) {
      return;
    }
    try {
      await adminAPI.deleteForumTopic(topic.topic_id);
      fetchTopics();
    } catch (err) {
      console.error("Error deleting topic:", err);
      alert("Không thể xóa chủ đề");
    }
  };

  const fetchPendingPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await adminAPI.getPendingForumPosts();
      if (res.data.success) {
        setPendingPosts(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching pending posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleModeratePost = async (postId, action) => {
    let rejection_reason;
    let edit_request_note;
    if (action === "reject") {
      rejection_reason =
        window.prompt(
          "Nhập lý do từ chối bài viết:",
          "Nội dung không phù hợp"
        ) || "";
    }
    if (action === "request_edit") {
      edit_request_note =
        window.prompt(
          "Nhập yêu cầu chỉnh sửa gửi cho tác giả:",
          "Vui lòng chỉnh sửa lại nội dung theo quy định của diễn đàn."
        ) || "";
    }
    try {
      await adminAPI.moderateForumPost(postId, {
        action,
        rejection_reason,
        edit_request_note,
      });
      fetchPendingPosts();
    } catch (err) {
      console.error("Error moderating post:", err);
      alert("Không thể cập nhật trạng thái bài viết");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Xóa vĩnh viễn bài viết này?")) return;
    try {
      await adminAPI.deleteForumPost(postId);
      fetchPendingPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Không thể xóa bài viết");
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await adminAPI.getForumReports({ status: "pending" });
      if (res.data.success) {
        setReports(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    const resolution_note =
      status === "resolved" || status === "dismissed"
        ? window.prompt("Ghi chú xử lý (tùy chọn):", "") || ""
        : "";
    try {
      await adminAPI.reviewForumReport(reportId, { status, resolution_note });
      fetchReports();
    } catch (err) {
      console.error("Error reviewing report:", err);
      alert("Không thể cập nhật báo cáo");
    }
  };

  const handleBanUser = async (userId) => {
    const reason =
      window.prompt(
        "Nhập lý do cấm bình luận:",
        "Vi phạm nội quy diễn đàn / hành vi phi thể thao"
      ) || "";
    if (!reason.trim()) return;
    const durationStr = window.prompt(
      "Thời hạn cấm (số ngày, để trống nếu vô thời hạn):",
      "7"
    );
    const duration_days = durationStr ? parseInt(durationStr, 10) || 0 : null;
    try {
      await adminAPI.banUserFromCommenting(userId, { reason, duration_days });
      alert("✅ Đã cấm người dùng bình luận");
    } catch (err) {
      console.error("Error banning user:", err);
      alert("Không thể cấm người dùng");
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm("Gỡ cấm bình luận cho người dùng này?")) return;
    try {
      await adminAPI.unbanUserFromCommenting(userId);
      alert("✅ Đã gỡ cấm bình luận");
    } catch (err) {
      console.error("Error unbanning user:", err);
      alert("Không thể gỡ cấm người dùng");
    }
  };

  const renderStatusBadge = (status) => {
    const base = "px-2 py-0.5 text-xs rounded-full font-semibold";
    switch (status) {
      case "active":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Đang hiển thị
          </span>
        );
      case "hidden":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            Đang ẩn
          </span>
        );
      case "archived":
        return (
          <span className={`${base} bg-gray-200 text-gray-700`}>
            Đã lưu trữ
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-600`}>{status}</span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FaComments className="text-blue-600" />
          Quản lý diễn đàn
        </h1>
        <p className="text-gray-600">
          Admin kiểm duyệt nội dung bài viết, bình luận và xử lý báo cáo vi
          phạm.
        </p>
      </div>

      {/* Topics management */}
      <div className="card border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Chủ đề diễn đàn
            </h2>
            <p className="text-sm text-gray-600">
              Tạo, ghim, khóa, ẩn hoặc xóa các chủ đề thảo luận. Có thể đặt chế
              độ chủ đề:
              <span className="font-semibold"> công khai</span> (mọi người đăng
              bài tự động hiển thị) hoặc
              <span className="font-semibold"> riêng tư</span> (bài viết phải
              được admin duyệt).
            </p>
          </div>
          <div className="flex gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchTopics();
              }}
              className="flex gap-2"
            >
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề, mô tả..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <FaSearch /> Lọc
              </button>
            </form>
            <button
              onClick={handleOpenCreateTopic}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <FaPlus /> Tạo chủ đề
            </button>
          </div>
        </div>

        {loadingTopics ? (
          <p className="text-gray-500 text-sm">Đang tải chủ đề...</p>
        ) : topics.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có chủ đề nào.</p>
        ) : (
          <div className="divide-y">
            {topics.map((topic) => (
              <div
                key={topic.topic_id}
                className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {topic.title}{" "}
                      {topic.is_pinned ? (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          Ghim
                        </span>
                      ) : null}
                      {topic.is_locked ? (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full ml-1">
                          Khóa bình luận
                        </span>
                      ) : null}
                    </h3>
                  </div>
                  {topic.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    {renderStatusBadge(topic.status)}
                    <span>
                      Chế độ:{" "}
                      <span className="font-medium">
                        {topic.visibility === "moderated"
                          ? "Riêng tư (duyệt bài viết)"
                          : "Công khai"}
                      </span>
                    </span>
                    <span>
                      Tạo bởi:{" "}
                      <span className="font-medium">
                        {topic.created_by_name}
                      </span>
                    </span>
                    <span>
                      Ngày tạo:{" "}
                      {new Date(topic.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenEditTopic(topic)}
                    className="btn-secondary btn-xs flex items-center gap-1"
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    onClick={() => handleTogglePinned(topic)}
                    className="btn-secondary btn-xs flex items-center gap-1"
                  >
                    {topic.is_pinned ? "Bỏ ghim" : "Ghim"}
                  </button>
                  <button
                    onClick={() => handleToggleLocked(topic)}
                    className="btn-secondary btn-xs flex items-center gap-1"
                  >
                    {topic.is_locked ? (
                      <>
                        <FaUnlock /> Mở khóa
                      </>
                    ) : (
                      <>
                        <FaLock /> Khóa
                      </>
                    )}
                  </button>
                  {topic.status === "hidden" ? (
                    <button
                      onClick={() => handleShowTopic(topic)}
                      className="btn-secondary btn-xs"
                    >
                      Hiện lại
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHideTopic(topic)}
                      className="btn-secondary btn-xs"
                    >
                      Ẩn
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTopic(topic)}
                    className="btn-danger btn-xs flex items-center gap-1"
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending posts */}
      <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaComments /> Bài viết chờ duyệt
            </h2>
            <button
              onClick={fetchPendingPosts}
              className="btn-secondary btn-xs flex items-center gap-1"
            >
              Làm mới
            </button>
          </div>
          {loadingPosts ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : pendingPosts.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có bài viết chờ duyệt.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pendingPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="border rounded-lg px-3 py-2 bg-gray-50"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {post.title || "(Không tiêu đề)"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Chủ đề: {post.topic_title} • Tác giả: {post.author_name}{" "}
                        • {new Date(post.created_at).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <button
                        onClick={() =>
                          handleModeratePost(post.post_id, "approve")
                        }
                        className="btn-primary btn-xs flex items-center gap-1"
                      >
                        <FaThumbsUp /> Duyệt
                      </button>
                      <button
                        onClick={() =>
                          handleModeratePost(post.post_id, "request_edit")
                        }
                        className="btn-secondary btn-xs"
                      >
                        Yêu cầu sửa
                      </button>
                      <button
                        onClick={() =>
                          handleModeratePost(post.post_id, "reject")
                        }
                        className="btn-secondary btn-xs text-red-600 border-red-300"
                      >
                        <FaThumbsDown /> Từ chối
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.post_id)}
                        className="btn-danger btn-xs"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Reports */}
      <div className="card border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            <div>
              <h2 className="text-lg font-semibold">Báo cáo vi phạm</h2>
              <p className="text-xs text-gray-600">
                Xem và xử lý các báo cáo về bài viết/bình luận vi phạm, chấn
                thương, hành vi phi thể thao.
              </p>
            </div>
          </div>
          <button
            onClick={fetchReports}
            className="btn-secondary btn-xs flex items-center gap-1"
          >
            Làm mới
          </button>
        </div>
        {loadingReports ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-gray-500">Không có báo cáo chờ xử lý.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-red-50">
                  <th className="px-3 py-2 text-left">Đối tượng</th>
                  <th className="px-3 py-2 text-left">Loại báo cáo</th>
                  <th className="px-3 py-2 text-left">Mô tả / Nội dung</th>
                  <th className="px-3 py-2 text-left">Người báo cáo</th>
                  <th className="px-3 py-2 text-left">Người bị báo cáo</th>
                  <th className="px-3 py-2 text-left">Thời gian</th>
                  <th className="px-3 py-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.report_id} className="border-b">
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {r.target_type === "post" ? "Bài viết" : "Bình luận"} #
                        {r.target_id}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                        {r.report_type}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="space-y-1">
                        <p className="line-clamp-2">
                          {r.description || "(Không có mô tả)"}
                        </p>
                        {r.target_type === "comment" && r.comment_content && (
                          <p className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            <span className="font-semibold">Bình luận:</span>{" "}
                            <span className="whitespace-pre-wrap">
                              {r.comment_content}
                            </span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        <div className="font-medium">{r.reporter_name}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {r.reported_user_id ? (
                        <div className="text-xs">
                          <div className="font-medium">
                            {r.reported_user_name || r.reported_user_id}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Không rõ</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        <button
                          onClick={() =>
                            handleReviewReport(r.report_id, "dismissed")
                          }
                          className="btn-secondary btn-xs"
                        >
                          Bỏ qua
                        </button>
                        {r.reported_user_id && (
                          <button
                            onClick={() =>
                              r.is_banned
                                ? handleUnbanUser(r.reported_user_id)
                                : handleBanUser(r.reported_user_id)
                            }
                            className={`btn-secondary btn-xs ${
                              r.is_banned
                                ? ""
                                : "text-red-600 border-red-300"
                            }`}
                          >
                            {r.is_banned ? "Gỡ cấm bình luận" : "Cấm bình luận"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Topic modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTopic ? "Chỉnh sửa chủ đề" : "Tạo chủ đề mới"}
            </h2>
            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu đề chủ đề
                </label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  placeholder="Mô tả ngắn về chủ đề, ví dụ: Thảo luận chung về giải đấu..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chế độ chủ đề
                </label>
                <select
                  value={topicForm.visibility}
                  onChange={(e) =>
                    setTopicForm({
                      ...topicForm,
                      visibility: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm bg-white"
                >
                  <option value="public">
                    Công khai - bài viết tự động hiển thị
                  </option>
                  <option value="moderated">
                    Riêng tư - bài viết phải được admin duyệt
                  </option>
                </select>
              </div>
              {topicError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {topicError}
                </p>
              )}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTopicModal(false);
                    setEditingTopic(null);
                  }}
                  className="btn-secondary"
                  disabled={savingTopic}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingTopic}
                >
                  {savingTopic ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumManagementPage;
