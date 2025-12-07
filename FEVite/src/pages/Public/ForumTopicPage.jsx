import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicAPI, forumAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { FaArrowLeft, FaComments } from "react-icons/fa";

const ForumTopicPage = () => {
  const { topicId } = useParams();
  const { isAuthenticated } = useAuth();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postError, setPostError] = useState("");
  const [postForm, setPostForm] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await publicAPI.getForumPostsByTopic(topicId);
      if (res.data.success) {
        setTopic(res.data.data.topic);
        setPosts(res.data.data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching topic posts:", err);
      alert("Không thể tải chủ đề/bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.content.trim()) {
      setPostError("Nội dung bài viết không được để trống");
      return;
    }

    setCreatingPost(true);
    setPostError("");
    try {
      await forumAPI.createPost(topicId, {
        title: postForm.title || null,
        content: postForm.content,
      });
      setPostForm({ title: "", content: "" });
      fetchData();
      alert(
        topic?.visibility === "moderated"
          ? "Đã gửi bài viết, chờ admin duyệt."
          : "Đã đăng bài viết."
      );
    } catch (err) {
      console.error("Error creating forum post:", err);
      setPostError(
        err.response?.data?.message ||
          "Không thể tạo bài viết. Vui lòng thử lại."
      );
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Link
          to="/forum"
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <FaArrowLeft /> Quay lại danh sách chủ đề
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : !topic ? (
        <p className="text-gray-500">Không tìm thấy chủ đề.</p>
      ) : (
        <>
          <div className="card">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <FaComments className="text-primary-600" />
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-gray-700 mb-2">{topic.description}</p>
            )}
            <p className="text-xs text-gray-500">
              Tạo bởi{" "}
              <span className="font-medium">
                {topic.created_by_name || "Người dùng"}
              </span>{" "}
              vào {new Date(topic.created_at).toLocaleString("vi-VN")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Chế độ chủ đề:{" "}
              <span className="font-medium">
                {topic.visibility === "moderated"
                  ? "Riêng tư - bài viết phải được admin duyệt"
                  : "Công khai - bài viết tự động hiển thị"}
              </span>
            </p>
            {topic.is_locked ? (
              <p className="text-xs text-red-600 mt-1">
                Chủ đề đã khóa, không thể thêm bình luận mới.
              </p>
            ) : null}
          </div>

          {isAuthenticated && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-2">
                Tạo bài viết mới trong chủ đề này
              </h2>
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tiêu đề (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) =>
                      setPostForm({ ...postForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    placeholder="Ví dụ: Cảm nhận sau trận mở màn..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nội dung
                  </label>
                  <textarea
                    rows={4}
                    value={postForm.content}
                    onChange={(e) =>
                      setPostForm({ ...postForm, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-y"
                    placeholder="Chia sẻ ý kiến của bạn về trận đấu, đội bóng..."
                  />
                </div>
                {postError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                    {postError}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={creatingPost}
                  >
                    {creatingPost ? "Đang gửi..." : "Đăng bài viết"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Ghi chú:{" "}
                  {topic.visibility === "moderated"
                    ? "Bài viết của bạn sẽ hiển thị sau khi được admin duyệt."
                    : "Bài viết sẽ hiển thị ngay sau khi gửi."}
                </p>
              </form>
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">
              Bài viết trong chủ đề ({posts.length})
            </h2>
            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có bài viết nào.</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Link
                    to={`/forum/posts/${post.post_id}`}
                    state={{ post }}
                    key={post.post_id}
                    className="block border rounded-lg px-3 py-2 bg-gray-50 hover:bg-white hover:border-primary-300 transition"
                  >
                    <h3 className="font-semibold text-sm">
                      {post.title || "(Không tiêu đề)"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tác giả: {post.author_name} •{" "}
                      {new Date(post.created_at).toLocaleString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ForumTopicPage;
