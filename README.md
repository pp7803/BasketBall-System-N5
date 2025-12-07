# Hệ Thống Quản Lý Giải Bóng Rổ (Basketball Tournament System)

## 👥 Thông Tin Nhóm 5

| Thành viên | MSSV | Vai trò |
|------------|------|---------|
| Phạm Duy Phát | 52100985 | Developer |
| Nguyễn Nhật Huy | 52200282 | Thành viên |
| Trần Thái Hào | 52200311 | Thành viên |
| Huỳnh Duy Khánh | 52300036 | Thành viên |
| Lê Thị Vân Anh | 52200265 | Thành viên |

## 📋 Giới Thiệu Dự Án

Hệ thống quản lý giải bóng rổ là một ứng dụng web toàn diện được xây dựng để quản lý các giải đấu bóng rổ, bao gồm quản lý đội bóng, vận động viên, huấn luyện viên, trọng tài, nhà tài trợ và lịch thi đấu.

### ✨ Tính Năng Chính

- 🔐 **Xác thực và Phân quyền**: Hệ thống đăng nhập/đăng ký với JWT
- 👤 **Quản lý Người dùng**: Admin, Athlete (Vận động viên), Coach (Huấn luyện viên), Referee (Trọng tài), Sponsor (Nhà tài trợ)
- 🏆 **Quản lý Giải đấu**: Tạo, cập nhật và theo dõi các giải đấu
- 🏀 **Quản lý Đội bóng**: Tạo đội, quản lý thành viên
- 📅 **Lịch thi đấu**: Xếp lịch và quản lý các trận đấu
- 📊 **Bảng xếp hạng**: Theo dõi thứ hạng của các đội
- ⭐ **Hệ thống Đánh giá**: Đánh giá vận động viên và huấn luyện viên
- 💰 **Quản lý Tài chính**: Theo dõi thu chi, phí tham gia
- 🔔 **Thông báo**: Hệ thống thông báo theo thời gian thực
- 💬 **Diễn đàn**: Trao đổi và thảo luận cộng đồng

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js** + **Express.js**: Framework server
- **MySQL**: Cơ sở dữ liệu
- **JWT**: Xác thực và phân quyền
- **Bcrypt**: Mã hóa mật khẩu
- **Nodemailer**: Gửi email
- **CORS**: Xử lý cross-origin requests

### Frontend
- **React 19**: Thư viện UI
- **Vite**: Build tool và dev server
- **React Router**: Điều hướng
- **Axios**: HTTP client
- **Tailwind CSS**: Styling framework
- **React Icons**: Biểu tượng
- **Date-fns**: Xử lý ngày tháng

## 📦 Yêu Cầu Hệ Thống

- **Node.js**: v18.x hoặc cao hơn
- **npm**: v9.x hoặc cao hơn
- **MySQL**: v8.0 hoặc cao hơn

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/pp7803/BasketBall-System-N5.git
cd BasketBall-System-N5
```

### 2. Cài Đặt và Chạy Backend

#### Bước 1: Di chuyển vào thư mục Backend

```bash
cd BACKEND
```

#### Bước 2: Cài đặt dependencies

```bash
npm install
```

#### Bước 3: Cấu hình biến môi trường

Tạo file `.env` trong thư mục `BACKEND` với nội dung:

```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=basketsystem_admin
DB_PASSWORD=PassW0rd@123
DB_NAME=basketball_simple_system
DB_PORT=3306

# JWT Configuration
JWT_SECRET=PassW0rd@123
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Basketball System <noreply@basketballsystem.com>
```

#### Bước 4: Cấu hình Database

1. Tạo database MySQL:
```sql
CREATE DATABASE basketball_simple_system;
```

2. Tạo user và cấp quyền:
```sql
CREATE USER 'basketsystem_admin'@'localhost' IDENTIFIED BY 'PassW0rd@123';
GRANT ALL PRIVILEGES ON basketball_simple_system.* TO 'basketsystem_admin'@'localhost';
FLUSH PRIVILEGES;
```

3. Import schema database (nếu có file SQL)

#### Bước 5: Chạy Backend Server

**Development mode** (với nodemon - tự động reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Backend sẽ chạy tại: `http://localhost:3002`

### 3. Cài Đặt và Chạy Frontend

#### Bước 1: Mở terminal mới và di chuyển vào thư mục Frontend

```bash
cd FEVite
```

#### Bước 2: Cài đặt dependencies

```bash
npm install
```

#### Bước 3: Cấu hình biến môi trường

Tạo file `.env` trong thư mục `FEVite` với nội dung:

```env
VITE_API_URL=http://localhost:3002
```

#### Bước 4: Chạy Frontend Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

#### Bước 5: Build cho Production (tùy chọn)

```bash
npm run build
```

Xem bản build:
```bash
npm run preview
```

## 📂 Cấu Trúc Dự Án

```
BasketBall-System-N5/
├── BACKEND/                    # Backend API Server
│   ├── controllers/           # Controllers xử lý logic
│   ├── middleware/            # Middleware (authentication, etc.)
│   ├── routes/               # API routes
│   ├── utils/                # Utilities (db, email, jwt, otp)
│   ├── scripts/              # Scripts (update tournament status)
│   ├── server.js             # Entry point
│   ├── package.json          # Dependencies
│   └── .env                  # Environment variables
│
└── FEVite/                    # Frontend React Application
    ├── src/
    │   ├── components/       # React components
    │   │   ├── Auth/         # Login, Register
    │   │   ├── Common/       # Shared components
    │   │   ├── Layout/       # Layout components
    │   │   └── Notifications/
    │   ├── contexts/         # React contexts (Auth, Notification)
    │   ├── pages/            # Page components
    │   │   ├── Admin/        # Admin pages
    │   │   ├── Athlete/      # Athlete pages
    │   │   ├── Coach/        # Coach pages
    │   │   ├── Public/       # Public pages
    │   │   ├── Referee/      # Referee pages
    │   │   └── Sponsor/      # Sponsor pages
    │   ├── services/         # API services
    │   ├── utils/            # Utilities
    │   ├── App.jsx           # Main App component
    │   └── main.jsx          # Entry point
    ├── package.json          # Dependencies
    └── .env                  # Environment variables
```

## 🔑 API Endpoints (Tóm tắt)

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Tournaments
- `GET /api/tournaments` - Lấy danh sách giải đấu
- `POST /api/tournaments` - Tạo giải đấu mới
- `GET /api/tournaments/:id` - Chi tiết giải đấu
- `PUT /api/tournaments/:id` - Cập nhật giải đấu

### Teams
- `GET /api/coach/teams` - Lấy danh sách đội
- `POST /api/coach/teams` - Tạo đội mới
- `GET /api/coach/teams/:id` - Chi tiết đội

### Athletes
- `GET /api/public/athletes` - Danh sách vận động viên
- `GET /api/athletes/:id` - Chi tiết vận động viên

### Admin
- `GET /api/admin/pending-tournaments` - Giải đấu chờ duyệt
- `POST /api/admin/approve-tournament/:id` - Duyệt giải đấu
- `GET /api/admin/pending-teams` - Đội chờ duyệt

## 🔐 Các Vai Trò Người Dùng

1. **Admin**: Quản lý toàn bộ hệ thống
2. **Athlete**: Tìm đội, tham gia giải đấu
3. **Coach**: Tạo và quản lý đội, đăng ký giải đấu
4. **Referee**: Quản lý trận đấu, cập nhật kết quả
5. **Sponsor**: Tạo giải đấu, quản lý tài trợ

## 🐛 Troubleshooting

### Backend không kết nối được Database
- Kiểm tra MySQL đã chạy: `mysql -u root -p`
- Kiểm tra thông tin trong `.env` file
- Kiểm tra user và quyền trong MySQL

### Frontend không gọi được API
- Kiểm tra Backend đã chạy tại port 3002
- Kiểm tra `VITE_API_URL` trong `.env` của Frontend
- Kiểm tra CORS configuration trong Backend

### Port đã được sử dụng
- Backend: Thay đổi `PORT` trong `BACKEND/.env`
- Frontend: Thay đổi port trong `vite.config.js` hoặc dùng `--port` flag:
  ```bash
  npm run dev -- --port 3000
  ```

## 📝 Scripts Hữu Ích

### Backend
```bash
npm start                    # Chạy production
npm run dev                  # Chạy development với nodemon
npm run update-tournament-status  # Cập nhật trạng thái giải đấu
```

### Frontend
```bash
npm run dev                  # Chạy development server
npm run build                # Build cho production
npm run preview              # Preview production build
npm run lint                 # Chạy ESLint
```

## 📄 License

ISC License