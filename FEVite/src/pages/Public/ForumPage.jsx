import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicAPI } from "../../services/api";
import { FaComments, FaSearch, FaThumbtack } from "react-icons/fa";

const ForumPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await publicAPI.getForumTopics(params);
      if (res.data.success) {
        setTopics(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching forum topics:", err);
      alert("Không thể tải danh sách chủ đề diễn đàn");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTopics();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaComments className="text-primary-600" />
          Diễn đàn giải đấu
        </h1>
        <p className="text-gray-600 mt-1">
          Nơi thảo luận về các trận đấu, đội bóng, thông báo từ ban tổ chức.
        </p>
      </div>

      <div className="card mb-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3 items-stretch md:items-center"
        >
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm chủ đề theo tiêu đề, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white"
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FaSearch /> Tìm kiếm
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải chủ đề...</p>
      ) : topics.length === 0 ? (
        <p className="text-gray-500">
          Chưa có chủ đề nào. Vui lòng quay lại sau.
        </p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Link
              to={`/forum/topics/${topic.topic_id}`}
              key={topic.topic_id}
              className="block border rounded-lg px-4 py-3 bg-white hover:border-primary-400 hover:shadow-sm transition"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">{topic.title}</h2>
                    {topic.is_pinned ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        <FaThumbtack className="text-xs" /> Ghim
                      </span>
                    ) : null}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Tạo bởi{" "}
                    <span className="font-medium">
                      {topic.created_by_name || "Người dùng"}
                    </span>{" "}
                    vào {new Date(topic.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPage;
