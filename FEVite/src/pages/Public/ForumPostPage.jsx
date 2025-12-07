import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { publicAPI, forumAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { FaArrowLeft, FaCommentDots } from "react-icons/fa";

const ForumPostPage = () => {
  const { postId } = useParams();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(location.state?.post || null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState("");
  const [commentError, setCommentError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reportingId, setReportingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [postId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resComments = await publicAPI.getForumCommentsByPost(postId);
      if (resComments.data.success) {
        setComments(resComments.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching post/comments:", err);
      alert("Không thể tải bình luận cho bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.trim()) {
      setCommentError("Nội dung bình luận không được để trống");
      return;
    }
    setSubmittingComment(true);
    setCommentError("");
    try {
      await forumAPI.createComment(postId, { content: commentForm });
      setCommentForm("");
      fetchData();
    } catch (err) {
      console.error("Error creating comment:", err);
      setCommentError(
        err.response?.data?.message ||
          "Không thể tạo bình luận. Có thể bạn đang bị cấm bình luận."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Link
          to={post?.topic_id ? `/forum/topics/${post.topic_id}` : "/forum"}
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <FaArrowLeft /> Quay lại chủ đề
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : !post ? (
        <p className="text-gray-500">Không tìm thấy bài viết.</p>
      ) : (
        <>
          <div className="card">
            <h1 className="text-xl font-bold flex items-center gap-2 mb-1">
              <FaCommentDots className="text-primary-600" />
              {post.title || `Bài viết #${post.post_id}`}
            </h1>
            <p className="text-xs text-gray-500 mb-2">
              {post.author_name && (
                <>
                  Tác giả:{" "}
                  <span className="font-medium">{post.author_name}</span> •{" "}
                </>
              )}
              {post.created_at &&
                new Date(post.created_at).toLocaleString("vi-VN")}
            </p>
            {post.content && (
              <p className="text-base text-gray-800 whitespace-pre-wrap">
                {post.content}
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">
              Bình luận ({comments.length})
            </h2>
            {comments.filter((c) => c.visibility !== "hidden").length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
            ) : (
              <div className="space-y-3">
                {comments
                  .filter((c) => c.visibility !== "hidden")
                  .map((c) => (
                    <div
                      key={c.comment_id}
                      className="border rounded-lg px-3 py-2 bg-gray-50"
                    >
                      <p className="text-xs text-gray-500">
                        {c.author_name} •{" "}
                        {new Date(c.created_at).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-sm text-gray-800 mt-1">{c.content}</p>
                      {isAuthenticated &&
                        user &&
                        c.user_id !== user.user_id &&
                        c.author_role !== "admin" && (
                          <div className="flex justify-end mt-1">
                            <button
                              type="button"
                              onClick={async () => {
                                const description =
                                  window.prompt(
                                    "Mô tả lý do báo cáo bình luận này:",
                                    "Nội dung không phù hợp / xúc phạm / spam..."
                                  ) || "";
                                if (!description.trim()) return;
                                try {
                                  setReportingId(c.comment_id);
                                  await forumAPI.reportComment(c.comment_id, {
                                    report_type: "violation",
                                    description,
                                  });
                                  alert(
                                    "Đã gửi báo cáo. Cảm ơn bạn đã đóng góp cho cộng đồng."
                                  );
                                } catch (err) {
                                  console.error(
                                    "Error reporting comment:",
                                    err
                                  );
                                  alert(
                                    err.response?.data?.message ||
                                      "Không thể gửi báo cáo. Vui lòng thử lại."
                                  );
                                } finally {
                                  setReportingId(null);
                                }
                              }}
                              className="text-[11px] text-red-600 hover:text-red-700 underline"
                              disabled={reportingId === c.comment_id}
                            >
                              {reportingId === c.comment_id
                                ? "Đang gửi báo cáo..."
                                : "Báo cáo bình luận"}
                            </button>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            )}

            {isAuthenticated && (
              <form onSubmit={handleSubmitComment} className="mt-4 space-y-2">
                <label className="block text-sm font-medium">
                  Thêm bình luận
                </label>
                <textarea
                  rows={3}
                  value={commentForm}
                  onChange={(e) => setCommentForm(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-y"
                  placeholder="Viết bình luận của bạn..."
                />
                {commentError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                    {commentError}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submittingComment}
                  >
                    {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Bình luận được đăng ngay. Hãy tôn trọng nội quy diễn đàn.
                </p>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ForumPostPage;
