const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">🏀 Basketball Tournament</h3>
            <p className="text-gray-400 text-sm">
              Hệ thống quản lý giải đấu bóng rổ chuyên nghiệp
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white">Trang chủ</a></li>
              <li><a href="/matches" className="hover:text-white">Lịch thi đấu</a></li>
              <li><a href="/standings" className="hover:text-white">Bảng xếp hạng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@basketball.com</li>
              <li>Phone: 1900 xxx xxx</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Basketball Tournament System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

