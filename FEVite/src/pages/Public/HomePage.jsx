import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            🏀 Hệ thống quản lý giải đấu bóng rổ
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Nền tảng hiện đại cho tổ chức và quản lý giải đấu chuyên nghiệp
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Đăng ký ngay
            </Link>
            <Link to="/matches" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition border border-white">
              Xem lịch thi đấu
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Lịch thi đấu</h3>
              <p className="text-gray-600">
                Xem lịch thi đấu chi tiết, cập nhật realtime
              </p>
              <Link to="/matches" className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-block">
                Xem ngay →
              </Link>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Bảng xếp hạng</h3>
              <p className="text-gray-600">
                Theo dõi bảng xếp hạng các đội tham gia
              </p>
              <Link to="/standings" className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-block">
                Xem ngay →
              </Link>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Tìm kiếm</h3>
              <p className="text-gray-600">
                Tìm kiếm trận đấu, đội bóng nhanh chóng
              </p>
              <Link to="/matches" className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-block">
                Tìm kiếm →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Dành cho mọi đối tượng</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="text-3xl mb-3">👨‍💼</div>
              <h3 className="font-semibold mb-2">Nhà tài trợ</h3>
              <p className="text-sm text-gray-600">Tạo và quản lý giải đấu, xem thống kê</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-3">🏃</div>
              <h3 className="font-semibold mb-2">Vận động viên</h3>
              <p className="text-sm text-gray-600">Xem lịch thi, cập nhật hồ sơ</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-3">👨‍⚖️</div>
              <h3 className="font-semibold mb-2">Trọng tài</h3>
              <p className="text-sm text-gray-600">Nhập kết quả, xác nhận biên bản</p>
            </div>
            <div className="card">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="font-semibold mb-2">Quản trị viên</h3>
              <p className="text-sm text-gray-600">Quản lý toàn bộ hệ thống</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

