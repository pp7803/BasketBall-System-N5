-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th12 07, 2025 lúc 08:59 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `basketball_simple_system`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `athletes`
--

CREATE TABLE `athletes` (
  `athlete_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `jersey_number` int(11) DEFAULT NULL,
  `position` enum('PG','SG','SF','PF','C') DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `athletes`
--

INSERT INTO `athletes` (`athlete_id`, `user_id`, `team_id`, `jersey_number`, `position`, `height`, `weight`, `date_of_birth`, `created_at`, `updated_at`) VALUES
(1, 11, 6, 27, 'PG', 170.09, 107.96, '1991-02-26', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(2, 12, 6, 92, 'C', 170.07, 97.46, '1995-08-01', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(3, 13, 6, 31, 'PF', 174.22, 92.20, '1991-05-15', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(4, 14, 6, 33, 'PG', 202.64, 65.47, '1992-01-05', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(5, 15, 6, 2, 'PF', 173.15, 108.41, '2005-12-19', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(6, 16, 6, 32, 'SF', 198.88, 87.97, '1998-03-16', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(7, 17, 6, 24, 'SG', 202.29, 90.46, '2008-07-11', '2025-11-29 10:15:03', '2025-12-02 16:18:07'),
(8, 18, 7, 77, 'SF', 176.04, 102.74, '1992-12-15', '2025-11-29 10:15:03', '2025-11-30 05:33:37'),
(9, 19, 7, 11, 'PG', 172.00, 80.00, '2000-01-29', '2025-11-29 10:15:03', '2025-11-30 05:33:37'),
(10, 20, 7, 53, 'SG', 197.00, 62.00, '1997-02-05', '2025-11-29 10:15:03', '2025-11-30 05:33:37'),
(11, 21, 7, 3, 'SF', 190.00, 70.00, '2000-11-19', '2025-11-29 10:15:03', '2025-12-02 17:22:24'),
(12, 22, 7, 1, 'PF', 197.00, 71.00, '2008-09-28', '2025-11-29 10:15:03', '2025-11-30 05:33:37'),
(13, 23, 7, 79, 'C', 183.00, 93.00, '2005-01-21', '2025-11-29 10:15:03', '2025-11-30 05:33:37'),
(14, 24, 7, 7, 'C', 175.79, 94.76, '1997-06-30', '2025-11-29 10:15:03', '2025-12-02 17:22:24'),
(15, 25, 8, 40, 'PG', 176.94, 98.15, '1990-05-07', '2025-11-29 10:15:03', '2025-11-30 05:40:07'),
(16, 26, 8, 15, 'C', 175.50, 102.75, '2003-04-20', '2025-11-29 10:15:03', '2025-11-30 05:40:07'),
(17, 27, 8, 54, 'PF', 182.09, 85.75, '1998-06-08', '2025-11-29 10:15:03', '2025-11-30 05:40:07'),
(18, 28, 8, 44, 'SF', 178.56, 95.84, '1998-11-03', '2025-11-29 10:15:03', '2025-11-30 05:40:07'),
(19, 29, 8, 45, 'SG', 172.77, 80.93, '1998-08-04', '2025-11-29 10:15:03', '2025-11-30 05:40:07'),
(20, 30, 8, 85, 'C', 202.67, 69.79, '2005-10-28', '2025-11-29 10:15:03', '2025-11-30 05:39:44'),
(21, 31, 8, 7, 'PG', 198.77, 105.64, '1998-05-19', '2025-11-29 10:15:03', '2025-11-30 05:39:44'),
(22, 32, 9, 20, 'PG', 176.93, 81.76, '1998-06-20', '2025-11-29 10:15:03', '2025-11-30 05:41:14'),
(23, 33, 9, 38, 'C', 183.79, 74.02, '2005-03-29', '2025-11-29 10:15:03', '2025-11-30 05:40:22'),
(24, 34, 9, 98, 'SF', 171.38, 105.31, '2008-08-18', '2025-11-29 10:15:03', '2025-11-30 05:41:14'),
(25, 35, 9, 1, 'SG', 184.94, 78.59, '1990-03-14', '2025-11-29 10:15:03', '2025-11-30 05:41:14'),
(26, 36, 9, 31, 'SF', 177.43, 64.54, '1993-07-17', '2025-11-29 10:15:03', '2025-11-30 05:41:14'),
(27, 37, 9, 17, 'PF', 193.69, 78.41, '1994-09-21', '2025-11-29 10:15:03', '2025-11-30 05:41:14'),
(28, 38, 9, 32, 'C', 180.20, 104.55, '2005-03-11', '2025-11-29 10:15:03', '2025-11-30 05:41:14'),
(29, 39, 10, 95, 'PG', 202.50, 66.81, '2002-08-24', '2025-11-29 10:15:03', '2025-11-30 05:41:44'),
(30, 40, 10, 50, 'SG', 186.71, 73.80, '1999-03-10', '2025-11-29 10:15:03', '2025-11-30 05:41:44'),
(31, 41, 10, 6, 'SF', 181.09, 99.16, '1997-08-27', '2025-11-29 10:15:03', '2025-11-30 05:41:44'),
(32, 42, 10, 82, 'C', 192.14, 82.52, '1992-02-01', '2025-11-29 10:15:03', '2025-11-30 05:41:33'),
(33, 43, 10, 40, 'C', 205.47, 69.67, '2007-05-29', '2025-11-29 10:15:03', '2025-11-30 05:41:44'),
(34, 44, 10, 69, 'C', 188.47, 102.67, '2007-03-28', '2025-11-29 10:15:03', '2025-11-30 05:41:33'),
(35, 45, 10, 80, 'PF', 193.47, 74.73, '2004-04-17', '2025-11-29 10:15:03', '2025-11-30 05:41:44'),
(36, 46, 11, 51, 'PG', 171.97, 73.53, '1990-09-13', '2025-11-29 10:15:03', '2025-11-30 05:43:06'),
(37, 47, 11, 52, 'C', 206.43, 108.39, '2007-10-28', '2025-11-29 10:15:03', '2025-11-30 05:43:06'),
(38, 48, 11, 7, 'SF', 202.28, 69.50, '2008-08-25', '2025-11-29 10:15:03', '2025-11-30 05:43:06'),
(39, 49, 11, 53, 'PF', 192.83, 66.89, '1994-07-25', '2025-11-29 10:15:03', '2025-11-30 05:43:06'),
(40, 50, 11, 12, 'PG', 174.90, 62.70, '2002-01-30', '2025-11-29 10:15:03', '2025-11-30 05:42:01'),
(41, 51, 11, 27, 'SG', 191.83, 80.69, '2000-06-12', '2025-11-29 10:15:03', '2025-11-30 05:43:06'),
(42, 52, 11, 94, 'SG', 186.17, 102.92, '2005-08-17', '2025-11-29 10:15:03', '2025-11-30 05:42:01'),
(43, 53, 12, 41, 'SF', 189.47, 74.77, '1993-12-10', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(44, 54, 12, 65, 'SG', 191.88, 75.71, '1996-12-07', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(45, 55, 12, 64, 'PF', 176.09, 109.84, '1993-07-20', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(46, 56, 12, 3, 'PF', 198.93, 84.99, '1997-07-14', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(47, 57, 12, 77, 'C', 193.39, 77.91, '1998-06-29', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(48, 58, 12, 19, 'PG', 204.67, 69.64, '2000-03-27', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(49, 59, 12, 69, 'PF', 186.72, 94.92, '2004-07-14', '2025-11-29 10:15:03', '2025-11-30 05:44:22'),
(50, 60, 13, 95, 'C', 183.34, 60.65, '1992-08-05', '2025-11-29 10:15:03', '2025-11-30 05:45:01'),
(51, 61, 13, 53, 'SG', 194.36, 73.15, '2003-05-22', '2025-11-29 10:15:03', '2025-11-30 05:45:01'),
(52, 62, 13, 12, 'PG', 200.10, 79.35, '1995-11-27', '2025-11-29 10:15:03', '2025-11-30 05:45:01'),
(53, 63, 13, 40, 'PF', 185.19, 103.67, '1996-07-14', '2025-11-29 10:15:03', '2025-11-30 05:45:01'),
(54, 64, 13, 58, 'PG', 179.70, 108.25, '2000-03-20', '2025-11-29 10:15:03', '2025-11-30 05:44:42'),
(55, 65, 13, 50, 'SF', 176.30, 106.69, '2000-03-18', '2025-11-29 10:15:03', '2025-11-30 05:45:01'),
(56, 66, 13, 86, 'SF', 179.40, 84.59, '2003-02-25', '2025-11-29 10:15:03', '2025-11-30 05:44:42'),
(57, 67, NULL, NULL, 'PG', 176.13, 63.13, '1994-03-03', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(58, 68, NULL, NULL, 'PG', 192.16, 80.41, '2005-06-03', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(59, 69, NULL, NULL, 'SF', 188.73, 104.53, '1994-01-31', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(60, 70, NULL, NULL, 'PF', 206.93, 73.71, '1997-01-29', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(61, 71, NULL, NULL, 'PG', 189.15, 63.57, '2004-08-30', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(62, 72, NULL, NULL, 'PG', 192.79, 68.36, '1998-04-25', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(63, 73, NULL, NULL, 'SF', 204.71, 89.80, '2000-02-10', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(64, 74, NULL, NULL, 'C', 183.79, 77.59, '1992-08-30', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(65, 75, NULL, NULL, 'PG', 173.70, 107.11, '2003-06-07', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(66, 76, NULL, NULL, 'PG', 172.83, 62.65, '2007-11-25', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(67, 77, NULL, NULL, 'PF', 205.56, 78.63, '2001-03-19', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(68, 78, NULL, NULL, 'C', 185.22, 78.77, '1995-09-24', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(69, 79, NULL, NULL, 'SG', 191.85, 91.16, '2007-02-27', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(70, 80, NULL, NULL, 'PF', 176.35, 79.04, '2003-11-27', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(71, 81, NULL, NULL, 'PF', 187.87, 104.67, '1992-05-01', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(72, 82, NULL, NULL, 'PF', 174.06, 85.47, '1991-02-26', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(73, 83, NULL, NULL, 'SG', 175.65, 72.75, '1993-06-02', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(74, 84, NULL, NULL, 'PF', 186.13, 104.33, '2000-10-08', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(75, 85, NULL, NULL, 'SF', 207.63, 66.00, '1995-01-17', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(76, 86, NULL, NULL, 'SF', 188.73, 89.07, '1993-01-18', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(77, 87, NULL, NULL, 'C', 176.96, 100.08, '1999-11-29', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(78, 88, NULL, NULL, 'SG', 209.66, 65.80, '1999-08-31', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(79, 89, NULL, NULL, 'PG', 187.51, 103.68, '2002-01-20', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(80, 90, NULL, NULL, 'SF', 206.88, 91.04, '2004-04-19', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(81, 91, NULL, NULL, 'PG', 193.02, 68.51, '2002-02-23', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(82, 92, NULL, NULL, 'C', 174.58, 83.85, '2008-04-09', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(83, 93, NULL, NULL, 'PF', 203.17, 105.68, '1997-08-23', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(84, 94, NULL, NULL, 'PG', 170.78, 70.20, '1997-01-19', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(85, 95, NULL, NULL, 'PF', 206.40, 70.33, '2001-09-28', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(86, 96, NULL, NULL, 'SG', 189.28, 79.48, '2003-08-18', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(87, 97, NULL, NULL, 'PF', 187.29, 101.29, '2007-10-01', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(88, 98, NULL, NULL, 'PF', 172.19, 72.26, '1993-12-27', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(89, 99, 14, NULL, 'PG', 175.59, 105.67, '2007-06-15', '2025-11-29 10:15:03', '2025-12-04 16:11:01'),
(90, 100, 14, NULL, 'SG', 196.53, 66.95, '2006-10-22', '2025-11-29 10:15:03', '2025-12-04 16:11:05'),
(91, 101, 14, NULL, 'PG', 179.00, 81.00, '1990-02-23', '2025-11-29 10:15:03', '2025-12-04 16:11:08'),
(92, 102, 14, NULL, 'SF', 199.58, 76.76, '1997-03-06', '2025-11-29 10:15:03', '2025-12-04 16:11:11'),
(93, 103, 14, NULL, 'SG', 205.00, 90.00, '1990-07-30', '2025-11-29 10:15:03', '2025-12-04 16:06:03'),
(94, 104, 14, NULL, 'PF', 195.01, 93.61, '1990-05-20', '2025-11-29 10:15:03', '2025-12-04 16:09:08'),
(95, 105, 14, 92, 'C', 172.52, 86.96, '1993-06-14', '2025-11-29 10:15:03', '2025-12-04 15:59:55'),
(96, 106, 6, NULL, 'SG', 208.55, 87.08, '2001-11-15', '2025-11-29 10:15:03', '2025-12-04 15:28:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coaches`
--

CREATE TABLE `coaches` (
  `coach_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `coaching_license` varchar(50) DEFAULT NULL,
  `years_of_experience` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `coaches`
--

INSERT INTO `coaches` (`coach_id`, `user_id`, `coaching_license`, `years_of_experience`, `created_at`, `updated_at`) VALUES
(1, 2, 'COACH-LIC-001', 4, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(2, 3, 'COACH-LIC-002', 12, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(3, 4, 'COACH-LIC-003', 5, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(4, 5, 'COACH-LIC-004', 1, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(5, 6, 'COACH-LIC-005', 1, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(6, 7, 'COACH-LIC-006', 12, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(7, 8, 'COACH-LIC-007', 11, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(8, 9, 'COACH-LIC-008', 2, '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(9, 108, 'COACH-9', 5, '2025-11-30 05:51:48', '2025-11-30 05:51:48'),
(10, 120, 'COACH10-COACH10', 1, '2025-12-02 10:52:32', '2025-12-02 10:52:32');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `financial_categories`
--

CREATE TABLE `financial_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `category_type` enum('income','expense') NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `financial_categories`
--

INSERT INTO `financial_categories` (`category_id`, `category_name`, `category_type`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Lệ phí đăng ký giải đấu', 'income', 'Thu từ lệ phí đăng ký tham gia giải đấu', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(2, 'Lệ phí tạo đội', 'income', 'Thu từ lệ phí tạo đội bóng', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(3, 'Phí quản lý hệ thống', 'income', 'Thu phí quản lý và vận hành hệ thống', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(4, 'Chi phí vận hành', 'expense', 'Chi phí vận hành hệ thống, server, bảo trì', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(5, 'Chi phí marketing', 'expense', 'Chi phí quảng cáo, marketing', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(6, 'Lương nhân viên', 'expense', 'Chi phí lương, thưởng nhân viên', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(7, 'Chi phí khác', 'expense', 'Các khoản chi khác', 1, '2025-12-04 14:24:56', '2025-12-04 14:24:56'),
(8, 'Lệ phí gia nhập đội', 'income', 'Thu từ lệ phí vận động viên gia nhập đội bóng', 1, '2025-12-04 14:25:33', '2025-12-04 14:25:33'),
(9, 'Hoàn tiền vận động viên', 'expense', 'Chi phí hoàn tiền cho vận động viên khi bị xóa khỏi đội', 1, '2025-12-04 14:25:33', '2025-12-04 14:25:33'),
(10, 'Hoàn tiền huấn luyện viên', 'expense', 'Chi phí hoàn tiền cho huấn luyện viên khi xóa đội, từ chối giải đấu', 1, '2025-12-04 14:25:33', '2025-12-04 14:25:33'),
(11, 'Hoàn tiền nhà tài trợ', 'expense', 'Chi phí hoàn tiền cho nhà tài trợ khi hủy giải đấu', 1, '2025-12-04 14:25:33', '2025-12-04 14:25:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `financial_summary`
--

CREATE TABLE `financial_summary` (
  `summary_id` int(11) NOT NULL,
  `summary_date` date NOT NULL COMMENT 'Ngày tổng kết (theo tháng hoặc năm)',
  `summary_type` enum('daily','monthly','yearly') NOT NULL DEFAULT 'monthly',
  `total_income` bigint(20) DEFAULT 0 COMMENT 'Tổng thu trong kỳ',
  `total_expense` bigint(20) DEFAULT 0 COMMENT 'Tổng chi trong kỳ',
  `net_income` bigint(20) DEFAULT 0 COMMENT 'Thu nhập ròng (thu - chi)',
  `transaction_count_income` int(11) DEFAULT 0 COMMENT 'Số giao dịch thu',
  `transaction_count_expense` int(11) DEFAULT 0 COMMENT 'Số giao dịch chi',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `financial_transactions`
--

CREATE TABLE `financial_transactions` (
  `transaction_id` int(11) NOT NULL,
  `transaction_type` enum('income','expense') NOT NULL,
  `category_id` int(11) NOT NULL,
  `amount` bigint(20) NOT NULL COMMENT 'Số tiền (VND)',
  `description` text NOT NULL,
  `reference_type` enum('tournament','team','user','manual','other') DEFAULT NULL COMMENT 'Loại tham chiếu',
  `reference_id` int(11) DEFAULT NULL COMMENT 'ID tham chiếu (tournament_id, team_id, user_id)',
  `payment_method` enum('cash','bank_transfer','online_payment','system_auto') DEFAULT 'cash' COMMENT 'Phương thức thanh toán',
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `receipt_number` varchar(50) DEFAULT NULL COMMENT 'Số hóa đơn/phiếu thu chi',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú thêm',
  `created_by` int(11) NOT NULL COMMENT 'Admin tạo giao dịch',
  `approved_by` int(11) DEFAULT NULL COMMENT 'Admin duyệt giao dịch',
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `financial_transactions`
--

INSERT INTO `financial_transactions` (`transaction_id`, `transaction_type`, `category_id`, `amount`, `description`, `reference_type`, `reference_id`, `payment_method`, `transaction_date`, `receipt_number`, `notes`, `created_by`, `approved_by`, `approved_at`, `status`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(2, 'income', 8, 100000, 'Team joining fee from athlete 105', 'team', 14, 'system_auto', '2025-12-04 15:34:09', 'THU1764862449703893', NULL, 105, 1, '2025-12-04 15:34:09', 'approved', NULL, '2025-12-04 15:34:09', '2025-12-04 15:34:09'),
(3, 'expense', 9, 100000, 'Athlete removal refund to athlete 105', 'team', 14, 'system_auto', '2025-12-04 15:34:41', 'THU1764862481175845', NULL, 108, 1, '2025-12-04 15:34:41', 'approved', NULL, '2025-12-04 15:34:41', '2025-12-04 15:34:41'),
(4, 'income', 8, 100000, 'Team joining fee from athlete 105', 'team', 14, 'system_auto', '2025-12-04 15:37:12', 'THU1764862632102479', NULL, 105, 1, '2025-12-04 15:37:12', 'approved', NULL, '2025-12-04 15:37:12', '2025-12-04 15:37:12'),
(5, 'expense', 9, 100000, 'Athlete removal refund to athlete 105', 'team', 14, 'system_auto', '2025-12-04 15:44:26', 'THU1764863066933637', NULL, 108, 1, '2025-12-04 15:44:26', 'approved', NULL, '2025-12-04 15:44:26', '2025-12-04 15:44:26'),
(6, 'income', 8, 100000, 'Team joining fee from athlete 105', 'team', 14, 'system_auto', '2025-12-04 15:50:01', 'THU1764863401356203', NULL, 105, 1, '2025-12-04 15:50:01', 'approved', NULL, '2025-12-04 15:50:01', '2025-12-04 15:50:01'),
(7, 'income', 8, 100000, 'Team joining fee from athlete 104', 'team', 14, 'system_auto', '2025-12-04 16:09:08', 'THU1764864548937652', NULL, 104, 1, '2025-12-04 16:09:08', 'approved', NULL, '2025-12-04 16:09:08', '2025-12-04 16:09:08'),
(8, 'income', 8, 100000, 'Team joining fee from athlete 99', 'team', 14, 'system_auto', '2025-12-04 16:11:01', 'THU17648646617777725', NULL, 99, 1, '2025-12-04 16:11:01', 'approved', NULL, '2025-12-04 16:11:01', '2025-12-04 16:11:01'),
(9, 'income', 8, 100000, 'Team joining fee from athlete 100', 'team', 14, 'system_auto', '2025-12-04 16:11:05', 'THU17648646652278597', NULL, 100, 1, '2025-12-04 16:11:05', 'approved', NULL, '2025-12-04 16:11:05', '2025-12-04 16:11:05'),
(10, 'income', 8, 100000, 'Team joining fee from athlete 101', 'team', 14, 'system_auto', '2025-12-04 16:11:08', 'THU1764864668202937', NULL, 101, 1, '2025-12-04 16:11:08', 'approved', NULL, '2025-12-04 16:11:08', '2025-12-04 16:11:08'),
(11, 'income', 8, 100000, 'Team joining fee from athlete 102', 'team', 14, 'system_auto', '2025-12-04 16:11:11', 'THU17648646715766325', NULL, 102, 1, '2025-12-04 16:11:11', 'approved', NULL, '2025-12-04 16:11:11', '2025-12-04 16:11:11'),
(12, 'income', 1, 500000, 'Lệ phí đăng ký giải đấu \"Giải Cỏ Mới\" - Đội: COACH9', 'tournament', 4, 'system_auto', '2025-12-04 16:17:16', 'THU17648650361477092', NULL, 108, 1, '2025-12-04 16:17:16', 'approved', NULL, '2025-12-04 16:17:16', '2025-12-04 16:17:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `forum_comments`
--

CREATE TABLE `forum_comments` (
  `comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `visibility` enum('visible','hidden') NOT NULL DEFAULT 'visible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `forum_comments`
--

INSERT INTO `forum_comments` (`comment_id`, `post_id`, `user_id`, `content`, `rejection_reason`, `created_at`, `updated_at`, `visibility`) VALUES
(1, 1, 10, 'Hello', NULL, '2025-12-01 15:44:53', '2025-12-01 15:44:53', 'visible'),
(2, 3, 1, 'Ồ tôi thấy nó rất tốt', NULL, '2025-12-01 15:48:08', '2025-12-01 15:48:08', 'visible'),
(3, 3, 11, 'sdsd', NULL, '2025-12-01 16:47:34', '2025-12-01 16:51:55', 'hidden'),
(4, 3, 11, 'sdsdsdsdsd', NULL, '2025-12-01 16:57:48', '2025-12-01 16:57:48', 'visible'),
(5, 4, 10, 'iiii', NULL, '2025-12-04 13:59:26', '2025-12-04 13:59:26', 'visible');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `forum_comment_bans`
--

CREATE TABLE `forum_comment_bans` (
  `ban_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Người bị cấm bình luận',
  `reason` text NOT NULL,
  `banned_by` int(11) NOT NULL COMMENT 'Admin thực hiện lệnh cấm',
  `start_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm hết hạn (NULL = vô thời hạn)',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `forum_posts`
--

CREATE TABLE `forum_posts` (
  `post_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Người đăng bài (coach, athlete, referee, sponsor, admin...)',
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `status` enum('pending','approved','rejected','hidden') NOT NULL DEFAULT 'pending' COMMENT 'pending = chờ duyệt, approved = đã duyệt, rejected = từ chối, hidden = ẩn',
  `rejection_reason` text DEFAULT NULL COMMENT 'Lý do từ chối (nếu rejected)',
  `edit_request_note` text DEFAULT NULL COMMENT 'Yêu cầu chỉnh sửa bài đăng',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `forum_posts`
--

INSERT INTO `forum_posts` (`post_id`, `topic_id`, `user_id`, `title`, `content`, `status`, `rejection_reason`, `edit_request_note`, `created_at`, `updated_at`) VALUES
(1, 1, 10, 'Hmm', 'OK', 'approved', NULL, NULL, '2025-12-01 15:44:07', '2025-12-01 15:44:07'),
(2, 1, 10, 'Nhma', 'TÔi', 'approved', NULL, NULL, '2025-12-01 15:45:15', '2025-12-01 15:45:15'),
(3, 1, 10, 'Nêu cảm nhận của bạn sau giải đấu', 'Nêu cảm nhận của bạn sau giải đấuNêu cảm nhận của bạn sau giải đấuNêu cảm nhận của bạn sau giải đấuNêu cảm nhận của bạn sau giải đấuNêu cảm nhận của bạn sau giải đấuNêu cảm nhận của bạn sau giải đấu', 'approved', NULL, NULL, '2025-12-01 15:47:33', '2025-12-01 15:47:33'),
(4, 1, 10, 'Hello', '111111', 'approved', NULL, NULL, '2025-12-01 15:49:12', '2025-12-01 16:27:35'),
(5, 1, 10, 'sds', 'sd', 'approved', NULL, NULL, '2025-12-01 15:51:24', '2025-12-01 15:51:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `forum_reports`
--

CREATE TABLE `forum_reports` (
  `report_id` int(11) NOT NULL,
  `target_type` enum('post','comment') NOT NULL COMMENT 'Đối tượng bị báo cáo: bài viết hay bình luận',
  `target_id` int(11) NOT NULL COMMENT 'ID của post hoặc comment',
  `report_type` enum('violation','injury','unsportsmanlike','other') NOT NULL DEFAULT 'violation' COMMENT 'Báo cáo vi phạm, chấn thương, hành vi phi thể thao...',
  `description` text DEFAULT NULL,
  `status` enum('pending','reviewed','dismissed','resolved') NOT NULL DEFAULT 'pending',
  `created_by` int(11) NOT NULL COMMENT 'user_id người báo cáo',
  `processed_by` int(11) DEFAULT NULL COMMENT 'admin xử lý',
  `processed_at` timestamp NULL DEFAULT NULL,
  `resolution_note` text DEFAULT NULL COMMENT 'Ghi chú xử lý',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `forum_reports`
--

INSERT INTO `forum_reports` (`report_id`, `target_type`, `target_id`, `report_type`, `description`, `status`, `created_by`, `processed_by`, `processed_at`, `resolution_note`, `created_at`) VALUES
(6, 'comment', 4, 'violation', 'Nội dung không phù hợp / xúc phạm / spam...', 'dismissed', 10, 1, '2025-12-02 10:14:24', 'df', '2025-12-01 16:58:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `forum_topics`
--

CREATE TABLE `forum_topics` (
  `topic_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL COMMENT 'user_id tạo chủ đề (thường là admin hoặc sponsor)',
  `is_pinned` tinyint(1) DEFAULT 0 COMMENT '1 = ghim chủ đề',
  `is_locked` tinyint(1) DEFAULT 0 COMMENT '1 = khóa không cho bình luận mới',
  `status` enum('active','hidden','archived') NOT NULL DEFAULT 'active' COMMENT 'active = hiển thị, hidden = ẩn tạm thời, archived = đã lưu trữ/xóa',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `visibility` enum('public','moderated') NOT NULL DEFAULT 'public' COMMENT 'public = bài viết tự động duyệt, moderated = bài viết phải duyệt bởi admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `forum_topics`
--

INSERT INTO `forum_topics` (`topic_id`, `title`, `description`, `created_by`, `is_pinned`, `is_locked`, `status`, `created_at`, `updated_at`, `visibility`) VALUES
(1, 'Giải cỏ', 'sdsdsd', 1, 0, 0, 'active', '2025-12-01 15:34:52', '2025-12-01 16:59:45', 'public');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `groups`
--

CREATE TABLE `groups` (
  `group_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `group_name` varchar(10) NOT NULL COMMENT 'A, B, etc.',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `group_teams`
--

CREATE TABLE `group_teams` (
  `group_team_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `position` int(11) DEFAULT NULL COMMENT 'Vị trí trong bảng (1, 2, 3, 4...)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `matches`
--

CREATE TABLE `matches` (
  `match_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `venue_id` int(11) NOT NULL,
  `match_date` date NOT NULL,
  `match_time` time NOT NULL,
  `round_type` enum('home','away') NOT NULL,
  `match_round` int(11) NOT NULL,
  `stage` enum('group_stage','quarterfinal','semifinal','final') DEFAULT 'group_stage' COMMENT 'Giai đoạn thi đấu',
  `group_id` int(11) DEFAULT NULL COMMENT 'Bảng đấu (chỉ cho group_stage)',
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `home_score` int(11) DEFAULT NULL,
  `away_score` int(11) DEFAULT NULL,
  `quarter_1_home` int(11) DEFAULT 0,
  `quarter_1_away` int(11) DEFAULT 0,
  `quarter_2_home` int(11) DEFAULT 0,
  `quarter_2_away` int(11) DEFAULT 0,
  `quarter_3_home` int(11) DEFAULT 0,
  `quarter_3_away` int(11) DEFAULT 0,
  `quarter_4_home` int(11) DEFAULT 0,
  `quarter_4_away` int(11) DEFAULT 0,
  `main_referee_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `result_confirmed` tinyint(1) DEFAULT 0,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `match_lineups`
--

CREATE TABLE `match_lineups` (
  `lineup_id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL COMMENT 'Đội thi đấu',
  `athlete_id` int(11) NOT NULL COMMENT 'Cầu thủ trong đội hình (5 cầu thủ cho mỗi đội)',
  `position` enum('PG','SG','SF','PF','C') NOT NULL COMMENT 'Vị trí của cầu thủ trong đội hình',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đội hình chính thức cho từng trận đấu';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `match_notes`
--

CREATE TABLE `match_notes` (
  `note_id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `referee_user_id` int(11) NOT NULL COMMENT 'user_id của trọng tài ghi chú',
  `minute` int(11) DEFAULT NULL COMMENT 'Phút xảy ra sự kiện (nếu có)',
  `note_type` enum('incident','injury','substitution','other') NOT NULL DEFAULT 'other' COMMENT 'Loại ghi chú: sự cố, chấn thương, thay người, ...',
  `content` text NOT NULL COMMENT 'Nội dung ghi chú chi tiết',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ghi chú của trọng tài trong trận đấu';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` enum('tournament_creation_approved','tournament_creation_pending','tournament_created','admin_announcement','team_deleted','join_request','join_request_approved','join_request_rejected','leave_request','leave_request_approved','leave_request_rejected','player_removed','jersey_updated','admin_action','tournament_update_request','tournament_update_approved','tournament_update_rejected','tournament_registration_pending','tournament_registration_approved','tournament_registration_rejected','tournament_leave_approved','tournament_leave_rejected','team_creation_pending','team_creation_approved','forum_topic_created','forum_post_submitted','forum_post_pending','forum_comment_created','forum_comment_reported','lineup_auto_set','tournament_postponed') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `title`, `message`, `metadata`, `is_read`, `created_by`, `created_at`) VALUES
(1, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 1 (PG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":1,\"athlete_id\":11,\"athlete_name\":\"ATHLETE 1\"}', 1, 11, '2025-11-29 10:21:31'),
(2, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 2 (C) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":2,\"athlete_id\":12,\"athlete_name\":\"ATHLETE 2\"}', 1, 12, '2025-11-29 10:21:43'),
(3, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 3 (PF) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":3,\"athlete_id\":13,\"athlete_name\":\"ATHLETE 3\"}', 1, 13, '2025-11-29 10:22:05'),
(4, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 4 (PG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":4,\"athlete_id\":14,\"athlete_name\":\"ATHLETE 4\"}', 1, 14, '2025-11-29 10:22:28'),
(5, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 5 (PF) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":5,\"athlete_id\":15,\"athlete_name\":\"ATHLETE 5\"}', 1, 15, '2025-11-29 10:22:42'),
(6, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 6 (SF) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":6,\"athlete_id\":16,\"athlete_name\":\"ATHLETE 6\"}', 1, 16, '2025-11-29 10:22:57'),
(7, 16, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"6\"}', 0, 2, '2025-11-29 10:23:15'),
(8, 15, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"5\"}', 0, 2, '2025-11-29 10:23:22'),
(9, 14, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"4\"}', 0, 2, '2025-11-29 10:23:27'),
(10, 11, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"1\"}', 0, 2, '2025-11-29 10:23:34'),
(11, 12, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"2\"}', 1, 2, '2025-11-29 10:23:40'),
(12, 13, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"3\"}', 0, 2, '2025-11-29 10:23:44'),
(13, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 7 (SG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":1,\"request_id\":7,\"athlete_id\":17,\"athlete_name\":\"ATHLETE 7\"}', 1, 17, '2025-11-29 10:24:20'),
(14, 17, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":1,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"7\"}', 0, 2, '2025-11-29 10:24:36'),
(15, 11, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 0, 2, '2025-11-29 11:19:15'),
(16, 12, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 1, 2, '2025-11-29 11:19:15'),
(17, 13, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 0, 2, '2025-11-29 11:19:15'),
(18, 16, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 0, 2, '2025-11-29 11:19:15'),
(19, 14, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 0, 2, '2025-11-29 11:19:15'),
(20, 15, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 0, 2, '2025-11-29 11:19:15'),
(21, 2, 'team_deleted', '⚠️ Đội đã được giải tán', 'Bạn đã giải tán đội \"COACH1\". 7 thành viên đã được thông báo.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\",\"members_notified\":7}', 1, 2, '2025-11-29 11:19:15'),
(22, 17, 'team_deleted', '⚠️ Đội đã bị xóa', 'Đội \"COACH1\" đã bị giải tán bởi huấn luyện viên. Bạn hiện không còn thuộc đội nào.', '{\"team_id\":\"1\",\"team_name\":\"COACH1\"}', 0, 2, '2025-11-29 11:19:15'),
(23, 2, 'team_deleted', '⚠️ Đội đã được giải tán', 'Bạn đã giải tán đội \"COACH1\". 0 thành viên đã được thông báo.', '{\"team_id\":\"2\",\"team_name\":\"COACH1\",\"members_notified\":0}', 1, 2, '2025-11-29 11:27:59'),
(24, 2, 'team_deleted', '⚠️ Đội đã được giải tán', 'Bạn đã giải tán đội \"COACH1\". 0 thành viên đã được thông báo.', '{\"team_id\":\"3\",\"team_name\":\"COACH1\",\"members_notified\":0}', 1, 2, '2025-11-29 11:30:34'),
(25, 2, 'team_deleted', '⚠️ Đội đã được giải tán', 'Bạn đã giải tán đội \"COACH1\". 0 thành viên đã được thông báo.', '{\"team_id\":\"4\",\"team_name\":\"COACH1\",\"members_notified\":0}', 1, 2, '2025-11-29 11:32:14'),
(26, 2, 'team_deleted', '⚠️ Đội đã được giải tán', 'Bạn đã giải tán đội \"COACH1\". 0 thành viên đã được thông báo.', '{\"team_id\":\"5\",\"team_name\":\"COACH1\",\"members_notified\":0,\"total_refunded\":0}', 1, 2, '2025-11-29 11:38:48'),
(27, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 1 (PG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":8,\"athlete_id\":11,\"athlete_name\":\"ATHLETE 1\"}', 1, 11, '2025-11-29 11:39:57'),
(28, 11, 'join_request_rejected', '❌ Yêu cầu bị từ chối', 'Yêu cầu gia nhập đội \"COACH1\" của bạn đã bị từ chối.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"8\"}', 0, 2, '2025-11-29 11:51:32'),
(29, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 1 (PG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":9,\"athlete_id\":11,\"athlete_name\":\"ATHLETE 1\"}', 1, 11, '2025-11-29 11:54:38'),
(30, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 1 (PG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":10,\"athlete_id\":11,\"athlete_name\":\"ATHLETE 1\"}', 1, 11, '2025-11-29 12:26:04'),
(31, 11, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\".', '{\"team_id\":6,\"team_name\":\"COACH1\",\"jersey_number\":null,\"request_id\":\"10\"}', 0, 2, '2025-11-29 12:26:22'),
(32, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 2 (C) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":11,\"athlete_id\":12,\"athlete_name\":\"ATHLETE 2\"}', 1, 12, '2025-11-29 12:43:20'),
(33, 12, 'join_request_rejected', '❌ Yêu cầu bị từ chối', 'Yêu cầu gia nhập đội \"COACH1\" của bạn đã bị từ chối.\n\n📝 Lý do: Gà', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"11\",\"rejection_reason\":\"Gà\"}', 1, 2, '2025-11-29 12:43:40'),
(34, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 2 (C) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":12,\"athlete_id\":12,\"athlete_name\":\"ATHLETE 2\"}', 1, 12, '2025-11-29 12:47:01'),
(35, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 2 (C) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":13,\"athlete_id\":12,\"athlete_name\":\"ATHLETE 2\"}', 1, 12, '2025-11-29 12:59:56'),
(36, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 3 (PF) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":14,\"athlete_id\":13,\"athlete_name\":\"ATHLETE 3\"}', 1, 13, '2025-11-29 13:00:10'),
(37, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 4 (PG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":15,\"athlete_id\":14,\"athlete_name\":\"ATHLETE 4\"}', 1, 14, '2025-11-29 13:00:42'),
(38, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 5 (PF) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":16,\"athlete_id\":15,\"athlete_name\":\"ATHLETE 5\"}', 1, 15, '2025-11-29 13:01:01'),
(39, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 6 (SF) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":17,\"athlete_id\":16,\"athlete_name\":\"ATHLETE 6\"}', 1, 16, '2025-11-29 13:01:13'),
(40, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 7 (SG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":18,\"athlete_id\":17,\"athlete_name\":\"ATHLETE 7\"}', 1, 17, '2025-11-29 13:01:25'),
(41, 17, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"18\",\"rejection_reason\":null}', 0, 2, '2025-11-29 13:01:41'),
(42, 16, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"17\",\"rejection_reason\":null}', 0, 2, '2025-11-29 13:01:43'),
(43, 15, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"16\",\"rejection_reason\":null}', 0, 2, '2025-11-29 13:01:46'),
(44, 14, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"15\",\"rejection_reason\":null}', 0, 2, '2025-11-29 13:01:49'),
(45, 13, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"14\",\"rejection_reason\":null}', 0, 2, '2025-11-29 13:01:51'),
(46, 12, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"13\",\"rejection_reason\":null}', 0, 2, '2025-11-29 13:01:55'),
(47, 10, 'tournament_update_approved', '✅ Giải đấu đã được cập nhật', 'Giải đấu \"Giải Vinamilk 2025\" đã được cập nhật thành công. Lệ phí admin bổ sung 90.000.000 VND đã được thanh toán.', '{\"tournament_id\":\"2\",\"tournament_name\":\"Giải Vinamilk 2025\",\"admin_fee_diff\":90000000}', 1, 10, '2025-11-29 16:20:05'),
(48, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":1}', 1, 2, '2025-11-29 17:49:42'),
(49, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu (lần 2)', 'Đội \"COACH1\" đã gửi lại yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\" sau khi bị từ chối trước đó. Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":1,\"is_re_registration\":true}', 1, 2, '2025-11-29 17:56:40'),
(50, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu (lần 2)', 'Đội \"COACH1\" đã gửi lại yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\" sau khi bị từ chối trước đó. Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":1,\"is_re_registration\":true}', 1, 2, '2025-11-29 17:57:08'),
(51, 10, 'tournament_registration_pending', '📤 Yêu cầu rời giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu rời giải \"Giải Vinamilk 2025\". Lý do: gà', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":1,\"reason\":\"gà\"}', 1, 2, '2025-11-29 18:03:42'),
(52, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":2}', 1, 2, '2025-11-29 18:06:34'),
(53, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu (lần 2)', 'Đội \"COACH1\" đã gửi lại yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\" sau khi bị từ chối trước đó. Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":2,\"is_re_registration\":true}', 1, 2, '2025-11-29 18:06:51'),
(54, 10, 'tournament_registration_pending', '📤 Yêu cầu rời giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu rời giải \"Giải Vinamilk 2025\". Lý do: 1', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":2,\"reason\":\"1\"}', 1, 2, '2025-11-29 18:07:10'),
(55, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":3}', 1, 2, '2025-11-29 18:13:05'),
(56, 2, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH1\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":\"3\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 1, 10, '2025-11-29 18:13:14'),
(57, 10, 'tournament_registration_pending', '📤 Yêu cầu rời giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu rời giải \"Giải Vinamilk 2025\". Lý do: sd', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":3,\"reason\":\"sd\"}', 1, 2, '2025-11-29 18:13:27'),
(58, 2, 'tournament_leave_approved', '✅ Yêu cầu rời giải được chấp nhận', 'Yêu cầu rời giải \"Giải Vinamilk 2025\" của đội \"COACH1\" đã được chấp nhận.\n\n⚠️ Lưu ý: Lệ phí đăng ký KHÔNG được hoàn trả.', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"3\",\"rejection_reason\":null}', 1, 10, '2025-11-29 18:13:35'),
(59, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":4}', 1, 2, '2025-11-29 19:05:46'),
(60, 2, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH1\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"tournament_team_id\":\"4\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 1, 10, '2025-11-29 19:05:56'),
(61, 1, 'team_creation_pending', '📝 Yêu cầu tạo đội mới (gửi lại)', 'Huấn luyện viên đã gửi lại yêu cầu duyệt đội \"COACH2\" sau khi bị từ chối. Lệ phí 500.000 VND sẽ được thu khi duyệt. Vui lòng kiểm tra.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"coach_id\":2,\"admin_fee_to_collect\":500000,\"is_resubmission\":true}', 1, 3, '2025-11-29 20:01:03'),
(62, 3, 'team_creation_pending', '✅ Đã gửi lại yêu cầu duyệt đội', 'Yêu cầu duyệt đội \"COACH2\" đã được gửi lại thành công. Lệ phí 500.000 VND sẽ được trừ khi admin duyệt đội.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"admin_fee_pending\":500000}', 1, 3, '2025-11-29 20:01:03'),
(63, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 8 (SF) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":19,\"athlete_id\":18,\"athlete_name\":\"ATHLETE 8\"}', 1, 18, '2025-11-29 20:03:50'),
(64, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 9 (PG) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":20,\"athlete_id\":19,\"athlete_name\":\"ATHLETE 9\"}', 1, 19, '2025-11-29 20:04:46'),
(65, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 10 (SG) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":21,\"athlete_id\":20,\"athlete_name\":\"ATHLETE 10\"}', 1, 20, '2025-11-29 20:05:53'),
(66, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 11 (SF) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":22,\"athlete_id\":21,\"athlete_name\":\"ATHLETE 11\"}', 1, 21, '2025-11-29 20:06:15'),
(67, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 12 (PF) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":23,\"athlete_id\":22,\"athlete_name\":\"ATHLETE 12\"}', 1, 22, '2025-11-29 20:06:37'),
(68, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 13 (C) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":24,\"athlete_id\":23,\"athlete_name\":\"ATHLETE 13\"}', 1, 23, '2025-11-29 20:07:09'),
(69, 3, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 14 (C) đã gửi yêu cầu gia nhập đội \"COACH2\".', '{\"team_id\":7,\"request_id\":25,\"athlete_id\":24,\"athlete_name\":\"ATHLETE 14\"}', 1, 24, '2025-11-29 20:07:23'),
(70, 24, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"25\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:07:47'),
(71, 23, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"24\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:15:14'),
(72, 22, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"23\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:19:46'),
(73, 21, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"22\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:19:49'),
(74, 20, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"21\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:19:52'),
(75, 19, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"20\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:20:02'),
(76, 18, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH2\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":7,\"team_name\":\"COACH2\",\"request_id\":\"19\",\"rejection_reason\":null}', 0, 3, '2025-11-29 20:20:04'),
(77, 18, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 77.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"8\",\"jersey_number\":77}', 0, 3, '2025-11-29 20:36:57'),
(78, 19, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 11.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"9\",\"jersey_number\":11}', 0, 3, '2025-11-29 20:39:52'),
(79, 20, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành chưa phân.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"10\",\"jersey_number\":0}', 0, 3, '2025-11-29 20:40:01'),
(80, 22, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 1.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"12\",\"jersey_number\":1}', 0, 3, '2025-11-29 20:40:05'),
(81, 23, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 79.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"13\",\"jersey_number\":79}', 0, 3, '2025-11-29 20:40:09'),
(82, 20, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 53.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"10\",\"jersey_number\":53}', 0, 3, '2025-11-29 20:40:13'),
(83, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH2\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":7,\"team_name\":\"COACH2\",\"tournament_team_id\":5}', 1, 3, '2025-11-29 20:48:07'),
(84, 1, 'team_creation_pending', '📝 Yêu cầu tạo đội mới', 'Huấn luyện viên đã tạo đội \"COACH3\" và yêu cầu duyệt. Lệ phí 500.000 VND sẽ được thu khi duyệt. Vui lòng kiểm tra.', '{\"team_id\":8,\"team_name\":\"COACH3\",\"coach_id\":3,\"admin_fee_to_collect\":500000}', 1, 4, '2025-11-30 05:17:47'),
(85, 4, 'team_creation_pending', '✅ Đội đã được tạo', 'Đội \"COACH3\" đã được tạo thành công và đang chờ admin duyệt. Lệ phí 500.000 VND sẽ được trừ khi admin duyệt đội.', '{\"team_id\":8,\"team_name\":\"COACH3\",\"admin_fee_pending\":500000}', 1, 4, '2025-11-30 05:17:47'),
(86, 4, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 15 (PG) đã gửi yêu cầu gia nhập đội \"COACH3\".', '{\"team_id\":8,\"request_id\":26,\"athlete_id\":25,\"athlete_name\":\"ATHLETE 15\"}', 1, 25, '2025-11-30 05:18:22'),
(87, 4, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 16 (C) đã gửi yêu cầu gia nhập đội \"COACH3\".', '{\"team_id\":8,\"request_id\":27,\"athlete_id\":26,\"athlete_name\":\"ATHLETE 16\"}', 1, 26, '2025-11-30 05:18:41'),
(88, 4, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 17 (PF) đã gửi yêu cầu gia nhập đội \"COACH3\".', '{\"team_id\":8,\"request_id\":28,\"athlete_id\":27,\"athlete_name\":\"ATHLETE 17\"}', 1, 27, '2025-11-30 05:19:04'),
(89, 4, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 18 (SF) đã gửi yêu cầu gia nhập đội \"COACH3\".', '{\"team_id\":8,\"request_id\":29,\"athlete_id\":28,\"athlete_name\":\"ATHLETE 18\"}', 1, 28, '2025-11-30 05:19:20'),
(90, 5, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH4\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 0, 1, '2025-11-30 05:34:22'),
(91, 6, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH5\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 0, 1, '2025-11-30 05:34:26'),
(92, 7, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH6\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 0, 1, '2025-11-30 05:34:29'),
(93, 8, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH7\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 0, 1, '2025-11-30 05:34:33'),
(94, 9, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH8\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 1, 1, '2025-11-30 05:34:36'),
(95, 4, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH3\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 1, 1, '2025-11-30 05:34:42'),
(96, 25, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 40.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"15\",\"jersey_number\":40}', 0, 4, '2025-11-30 05:37:47'),
(97, 26, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 15.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"16\",\"jersey_number\":15}', 0, 4, '2025-11-30 05:39:44'),
(98, 27, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 54.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"17\",\"jersey_number\":54}', 0, 4, '2025-11-30 05:39:44'),
(99, 28, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 44.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"18\",\"jersey_number\":44}', 0, 4, '2025-11-30 05:39:44'),
(100, 29, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 45.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"19\",\"jersey_number\":45}', 0, 4, '2025-11-30 05:39:44'),
(101, 30, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 85.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"20\",\"jersey_number\":85}', 0, 4, '2025-11-30 05:39:44'),
(102, 31, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH3\" đã được cập nhật thành 7.', '{\"team_id\":\"8\",\"team_name\":\"COACH3\",\"athlete_id\":\"21\",\"jersey_number\":7}', 0, 4, '2025-11-30 05:39:44'),
(103, 34, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 98.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"24\",\"jersey_number\":98}', 0, 5, '2025-11-30 05:40:22'),
(104, 35, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 1.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"25\",\"jersey_number\":1}', 0, 5, '2025-11-30 05:40:22'),
(105, 36, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 31.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"26\",\"jersey_number\":31}', 0, 5, '2025-11-30 05:40:22'),
(106, 38, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 32.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"28\",\"jersey_number\":32}', 0, 5, '2025-11-30 05:40:22'),
(107, 32, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành chưa phân.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"22\",\"jersey_number\":0}', 0, 5, '2025-11-30 05:40:22'),
(108, 33, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 38.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"23\",\"jersey_number\":38}', 0, 5, '2025-11-30 05:40:22'),
(109, 37, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 17.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"27\",\"jersey_number\":17}', 0, 5, '2025-11-30 05:40:22'),
(110, 32, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH4\" đã được cập nhật thành 20.', '{\"team_id\":\"9\",\"team_name\":\"COACH4\",\"athlete_id\":\"22\",\"jersey_number\":20}', 0, 5, '2025-11-30 05:41:01'),
(111, 39, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 95.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"29\",\"jersey_number\":95}', 0, 6, '2025-11-30 05:41:33'),
(112, 40, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 50.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"30\",\"jersey_number\":50}', 0, 6, '2025-11-30 05:41:33'),
(113, 41, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 6.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"31\",\"jersey_number\":6}', 0, 6, '2025-11-30 05:41:33'),
(114, 43, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 40.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"33\",\"jersey_number\":40}', 0, 6, '2025-11-30 05:41:33'),
(115, 42, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 82.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"32\",\"jersey_number\":82}', 0, 6, '2025-11-30 05:41:33'),
(116, 44, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 69.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"34\",\"jersey_number\":69}', 0, 6, '2025-11-30 05:41:33'),
(117, 45, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH5\" đã được cập nhật thành 80.', '{\"team_id\":\"10\",\"team_name\":\"COACH5\",\"athlete_id\":\"35\",\"jersey_number\":80}', 0, 6, '2025-11-30 05:41:33'),
(118, 46, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 51.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"36\",\"jersey_number\":51}', 0, 7, '2025-11-30 05:42:01'),
(119, 47, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành chưa phân.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"37\",\"jersey_number\":0}', 0, 7, '2025-11-30 05:42:01'),
(120, 51, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 27.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"41\",\"jersey_number\":27}', 0, 7, '2025-11-30 05:42:01'),
(121, 48, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 7.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"38\",\"jersey_number\":7}', 0, 7, '2025-11-30 05:42:01'),
(122, 49, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 53.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"39\",\"jersey_number\":53}', 0, 7, '2025-11-30 05:42:01'),
(123, 50, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 12.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"40\",\"jersey_number\":12}', 0, 7, '2025-11-30 05:42:01'),
(124, 52, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 94.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"42\",\"jersey_number\":94}', 0, 7, '2025-11-30 05:42:01'),
(125, 47, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH6\" đã được cập nhật thành 52.', '{\"team_id\":\"11\",\"team_name\":\"COACH6\",\"athlete_id\":\"37\",\"jersey_number\":52}', 0, 7, '2025-11-30 05:42:57'),
(126, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH6\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":11,\"team_name\":\"COACH6\",\"tournament_team_id\":6}', 1, 7, '2025-11-30 05:43:11'),
(127, 56, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 3.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"46\",\"jersey_number\":3}', 0, 8, '2025-11-30 05:43:24'),
(128, 59, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 69.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"49\",\"jersey_number\":69}', 0, 8, '2025-11-30 05:43:24'),
(129, 53, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 41.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"43\",\"jersey_number\":41}', 0, 8, '2025-11-30 05:43:24'),
(130, 54, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 65.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"44\",\"jersey_number\":65}', 0, 8, '2025-11-30 05:43:24'),
(131, 55, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 64.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"45\",\"jersey_number\":64}', 0, 8, '2025-11-30 05:43:24'),
(132, 57, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 77.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"47\",\"jersey_number\":77}', 0, 8, '2025-11-30 05:43:24'),
(133, 58, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH7\" đã được cập nhật thành 19.', '{\"team_id\":\"12\",\"team_name\":\"COACH7\",\"athlete_id\":\"48\",\"jersey_number\":19}', 0, 8, '2025-11-30 05:43:24'),
(134, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH7\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":12,\"team_name\":\"COACH7\",\"tournament_team_id\":7}', 1, 8, '2025-11-30 05:44:28'),
(135, 62, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 12.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"52\",\"jersey_number\":12}', 0, 9, '2025-11-30 05:44:42'),
(136, 65, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 50.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"55\",\"jersey_number\":50}', 0, 9, '2025-11-30 05:44:42'),
(137, 60, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 95.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"50\",\"jersey_number\":95}', 0, 9, '2025-11-30 05:44:42'),
(138, 61, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 53.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"51\",\"jersey_number\":53}', 0, 9, '2025-11-30 05:44:42'),
(139, 63, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 40.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"53\",\"jersey_number\":40}', 0, 9, '2025-11-30 05:44:42'),
(140, 64, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 58.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"54\",\"jersey_number\":58}', 0, 9, '2025-11-30 05:44:42'),
(141, 66, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH8\" đã được cập nhật thành 86.', '{\"team_id\":\"13\",\"team_name\":\"COACH8\",\"athlete_id\":\"56\",\"jersey_number\":86}', 0, 9, '2025-11-30 05:44:42'),
(142, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH8\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":13,\"team_name\":\"COACH8\",\"tournament_team_id\":8}', 1, 9, '2025-11-30 05:45:06'),
(143, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH5\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":10,\"team_name\":\"COACH5\",\"tournament_team_id\":9}', 1, 6, '2025-11-30 05:45:26'),
(144, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH4\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":9,\"team_name\":\"COACH4\",\"tournament_team_id\":10}', 1, 5, '2025-11-30 05:45:36'),
(145, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH3\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Vinamilk 2025\". Vui lòng duyệt.', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":8,\"team_name\":\"COACH3\",\"tournament_team_id\":11}', 1, 4, '2025-11-30 05:45:47'),
(146, 1, 'team_creation_pending', '📝 Yêu cầu tạo đội mới', 'Huấn luyện viên đã tạo đội \"COACH9\" và yêu cầu duyệt. Lệ phí 500.000 VND sẽ được thu khi duyệt. Vui lòng kiểm tra.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"coach_id\":9,\"admin_fee_to_collect\":500000}', 1, 108, '2025-11-30 05:52:38'),
(147, 108, 'team_creation_pending', '✅ Đội đã được tạo', 'Đội \"COACH9\" đã được tạo thành công và đang chờ admin duyệt. Lệ phí 500.000 VND sẽ được trừ khi admin duyệt đội.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"admin_fee_pending\":500000}', 1, 108, '2025-11-30 05:52:38'),
(148, 108, 'team_creation_approved', '✅ Đội được duyệt', 'Đội \"COACH9\" của bạn đã được admin duyệt. Bạn có thể bắt đầu quản lý đội. Lệ phí 500.000 VND đã được thanh toán.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"rejection_reason\":null,\"admin_fee_paid\":500000}', 1, 1, '2025-11-30 05:57:03'),
(149, 4, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH3\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":8,\"team_name\":\"COACH3\",\"tournament_team_id\":\"11\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 0, 10, '2025-11-30 06:00:22'),
(150, 5, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH4\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":9,\"team_name\":\"COACH4\",\"tournament_team_id\":\"10\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 0, 10, '2025-11-30 06:00:25'),
(151, 6, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH5\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":10,\"team_name\":\"COACH5\",\"tournament_team_id\":\"9\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 0, 10, '2025-11-30 06:00:29'),
(152, 9, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH8\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":13,\"team_name\":\"COACH8\",\"tournament_team_id\":\"8\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 1, 10, '2025-11-30 06:00:32'),
(153, 8, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH7\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":12,\"team_name\":\"COACH7\",\"tournament_team_id\":\"7\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 0, 10, '2025-11-30 06:00:36'),
(154, 7, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH6\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":11,\"team_name\":\"COACH6\",\"tournament_team_id\":\"6\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 0, 10, '2025-11-30 06:00:40'),
(155, 3, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH2\" đã được chấp nhận tham gia giải \"Giải Vinamilk 2025\".', '{\"tournament_id\":3,\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":7,\"team_name\":\"COACH2\",\"tournament_team_id\":\"5\",\"entry_fee_paid\":0,\"rejection_reason\":null}', 1, 10, '2025-11-30 06:00:43'),
(156, 1, 'forum_comment_reported', '🚩 Báo cáo bình luận mới', 'Có một bình luận trên diễn đàn bị báo cáo vi phạm.', '{\"comment_id\":\"1\",\"report_type\":\"violation\",\"topic_id\":1,\"reported_by\":10}', 1, 10, '2025-12-01 16:06:54'),
(157, 10, 'forum_post_submitted', '✏️ Bài viết cần được chỉnh sửa', 'Vui lòng chỉnh sửa lại nội dung theo quy định của diễn đàn.', '{\"post_id\":4,\"topic_id\":1,\"action\":\"request_edit\",\"rejection_reason\":null,\"edit_request_note\":\"Vui lòng chỉnh sửa lại nội dung theo quy định của diễn đàn.\"}', 1, 1, '2025-12-01 16:27:19'),
(158, 10, 'forum_comment_created', '💬 Có bình luận mới trong bài viết của bạn', 'Bài viết của bạn trên diễn đàn vừa có bình luận mới.', '{\"post_id\":\"3\",\"comment_id\":3,\"topic_id\":1,\"commenter_id\":11}', 1, 11, '2025-12-01 16:47:34'),
(159, 1, 'forum_comment_reported', '🚩 Báo cáo bình luận mới', 'Có một bình luận trên diễn đàn bị báo cáo vi phạm.', '{\"comment_id\":\"3\",\"report_type\":\"violation\",\"topic_id\":1,\"reported_by\":10}', 1, 10, '2025-12-01 16:47:56'),
(160, 1, 'forum_comment_reported', '🚩 Báo cáo bình luận mới', 'Có một bình luận trên diễn đàn bị báo cáo vi phạm.', '{\"comment_id\":\"3\",\"report_type\":\"violation\",\"topic_id\":1,\"reported_by\":10}', 1, 10, '2025-12-01 16:48:29'),
(161, 1, 'forum_comment_reported', '🚩 Báo cáo bình luận mới', 'Có một bình luận trên diễn đàn bị báo cáo vi phạm.', '{\"comment_id\":\"3\",\"report_type\":\"violation\",\"topic_id\":1,\"reported_by\":10}', 1, 10, '2025-12-01 16:51:36'),
(162, 10, 'forum_comment_created', '💬 Có bình luận mới trong bài viết của bạn', 'Bài viết của bạn trên diễn đàn vừa có bình luận mới.', '{\"post_id\":\"3\",\"comment_id\":4,\"topic_id\":1,\"commenter_id\":11}', 1, 11, '2025-12-01 16:57:48'),
(163, 1, 'forum_comment_reported', '🚩 Báo cáo bình luận mới', 'Có một bình luận trên diễn đàn bị báo cáo vi phạm.', '{\"comment_id\":\"4\",\"report_type\":\"violation\",\"topic_id\":1,\"reported_by\":10}', 1, 10, '2025-12-01 16:58:01'),
(164, 11, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 27.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"1\",\"jersey_number\":27}', 0, 2, '2025-12-02 16:18:07'),
(165, 12, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 92.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"2\",\"jersey_number\":92}', 0, 2, '2025-12-02 16:18:07'),
(166, 13, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 31.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"3\",\"jersey_number\":31}', 0, 2, '2025-12-02 16:18:07'),
(167, 14, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 33.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"4\",\"jersey_number\":33}', 0, 2, '2025-12-02 16:18:07'),
(168, 15, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 2.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"5\",\"jersey_number\":2}', 0, 2, '2025-12-02 16:18:07'),
(169, 16, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 32.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"6\",\"jersey_number\":32}', 0, 2, '2025-12-02 16:18:07'),
(170, 17, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH1\" đã được cập nhật thành 24.', '{\"team_id\":\"6\",\"team_name\":\"COACH1\",\"athlete_id\":\"7\",\"jersey_number\":24}', 0, 2, '2025-12-02 16:18:07'),
(171, 10, 'tournament_registration_pending', '📤 Yêu cầu rời giải đấu', 'Đội \"COACH1\" đã gửi yêu cầu rời giải \"Giải Vinamilk 2025\". Lý do: sdsd', '{\"tournament_id\":\"3\",\"tournament_name\":\"Giải Vinamilk 2025\",\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":4,\"reason\":\"sdsd\"}', 1, 2, '2025-12-02 16:26:57'),
(172, 21, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 3.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"11\",\"jersey_number\":3}', 0, 3, '2025-12-02 17:22:24'),
(173, 24, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH2\" đã được cập nhật thành 7.', '{\"team_id\":\"7\",\"team_name\":\"COACH2\",\"athlete_id\":\"14\",\"jersey_number\":7}', 0, 3, '2025-12-02 17:22:24'),
(174, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":2,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-03 05:13:45'),
(175, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":2,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(176, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":4,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-03 05:13:45'),
(177, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":4,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(178, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":5,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":7,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-03 05:13:45'),
(179, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":5,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(180, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":6,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-03 05:13:45'),
(181, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":6,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45');
INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `title`, `message`, `metadata`, `is_read`, `created_by`, `created_at`) VALUES
(182, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":7,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(183, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":8,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(184, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":8,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(185, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":9,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(186, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":10,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(187, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":10,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(188, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":11,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(189, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":11,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(190, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":12,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(191, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":12,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-03 05:13:45'),
(192, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":5,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":7,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-04 04:09:43'),
(193, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":5,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(194, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":6,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(195, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":6,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(196, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":7,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":7,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-04 04:09:43'),
(197, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":7,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(198, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":8,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(199, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":8,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(200, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":9,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":7,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-04 04:09:43'),
(201, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":9,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(202, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":10,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(203, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":10,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(204, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":11,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(205, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":11,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(206, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":12,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(207, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":12,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(208, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":13,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(209, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":13,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(210, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":14,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(211, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":14,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(212, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":15,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(213, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":15,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(214, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":16,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(215, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":16,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-04 04:09:43'),
(216, 2, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 96 (SG) đã gửi yêu cầu gia nhập đội \"COACH1\".', '{\"team_id\":6,\"request_id\":86,\"athlete_id\":106,\"athlete_name\":\"ATHLETE 96\"}', 1, 106, '2025-12-04 15:28:00'),
(217, 106, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH1\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":6,\"team_name\":\"COACH1\",\"request_id\":\"86\",\"rejection_reason\":null}', 0, 2, '2025-12-04 15:28:18'),
(218, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 95 (C) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":87,\"athlete_id\":105,\"athlete_name\":\"ATHLETE 95\"}', 1, 105, '2025-12-04 15:28:57'),
(219, 105, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"87\",\"rejection_reason\":null}', 1, 108, '2025-12-04 15:29:14'),
(220, 105, 'player_removed', '⚠️ Bạn đã bị xóa khỏi đội', 'Bạn đã bị xóa khỏi đội \"COACH9\" bởi huấn luyện viên. Lệ phí gia nhập 100.000 VND đã được hoàn trả.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"refund_amount\":100000}', 1, 108, '2025-12-04 15:31:14'),
(221, 108, 'player_removed', '⚠️ Đã xóa cầu thủ khỏi đội', 'Bạn đã xóa \"ATHLETE 95\" khỏi đội \"COACH9\". Lệ phí gia nhập 100.000 VND đã được hoàn trả.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"athlete_name\":\"ATHLETE 95\",\"refund_amount\":100000}', 1, 108, '2025-12-04 15:31:14'),
(222, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 95 (C) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":88,\"athlete_id\":105,\"athlete_name\":\"ATHLETE 95\"}', 1, 105, '2025-12-04 15:31:42'),
(223, 105, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"88\",\"rejection_reason\":null}', 0, 108, '2025-12-04 15:34:09'),
(224, 105, 'player_removed', '⚠️ Bạn đã bị xóa khỏi đội', 'Bạn đã bị xóa khỏi đội \"COACH9\" bởi huấn luyện viên. Lệ phí gia nhập 100.000 VND đã được hoàn trả.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"refund_amount\":100000}', 0, 108, '2025-12-04 15:34:41'),
(225, 108, 'player_removed', '⚠️ Đã xóa cầu thủ khỏi đội', 'Bạn đã xóa \"ATHLETE 95\" khỏi đội \"COACH9\". Lệ phí gia nhập 100.000 VND đã được hoàn trả.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"athlete_name\":\"ATHLETE 95\",\"refund_amount\":100000}', 1, 108, '2025-12-04 15:34:41'),
(226, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 95 (C) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":89,\"athlete_id\":105,\"athlete_name\":\"ATHLETE 95\"}', 1, 105, '2025-12-04 15:37:05'),
(227, 105, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"89\",\"rejection_reason\":null}', 0, 108, '2025-12-04 15:37:12'),
(228, 105, 'player_removed', '⚠️ Bạn đã bị xóa khỏi đội', 'Bạn đã bị xóa khỏi đội \"COACH9\" bởi huấn luyện viên. Lệ phí gia nhập 100.000 VND đã được hoàn trả.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"refund_amount\":100000}', 0, 108, '2025-12-04 15:44:26'),
(229, 108, 'player_removed', '⚠️ Đã xóa cầu thủ khỏi đội', 'Bạn đã xóa \"ATHLETE 95\" khỏi đội \"COACH9\". Lệ phí gia nhập 100.000 VND đã được hoàn trả.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"athlete_name\":\"ATHLETE 95\",\"refund_amount\":100000}', 1, 108, '2025-12-04 15:44:26'),
(230, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 95 (C) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":90,\"athlete_id\":105,\"athlete_name\":\"ATHLETE 95\"}', 1, 105, '2025-12-04 15:49:53'),
(231, 105, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"90\",\"rejection_reason\":null}', 0, 108, '2025-12-04 15:50:01'),
(232, 105, 'jersey_updated', '👕 Số áo đã được cập nhật', 'Số áo của bạn tại đội \"COACH9\" đã được cập nhật thành 92.', '{\"team_id\":\"14\",\"team_name\":\"COACH9\",\"athlete_id\":\"95\",\"jersey_number\":92}', 0, 108, '2025-12-04 15:59:55'),
(233, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 94 (PF) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":91,\"athlete_id\":104,\"athlete_name\":\"ATHLETE 94\"}', 1, 104, '2025-12-04 16:00:29'),
(234, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 93 (PF) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":92,\"athlete_id\":103,\"athlete_name\":\"ATHLETE 93\"}', 1, 103, '2025-12-04 16:00:44'),
(235, 104, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"91\",\"rejection_reason\":null}', 0, 108, '2025-12-04 16:09:08'),
(236, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 92 (SF) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":93,\"athlete_id\":102,\"athlete_name\":\"ATHLETE 92\"}', 1, 102, '2025-12-04 16:09:42'),
(237, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 91 (PG) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":94,\"athlete_id\":101,\"athlete_name\":\"ATHLETE 91\"}', 1, 101, '2025-12-04 16:10:21'),
(238, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 90 (SG) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":95,\"athlete_id\":100,\"athlete_name\":\"ATHLETE 90\"}', 1, 100, '2025-12-04 16:10:40'),
(239, 108, 'join_request', '📥 Yêu cầu gia nhập đội', 'ATHLETE 89 (PG) đã gửi yêu cầu gia nhập đội \"COACH9\".', '{\"team_id\":14,\"request_id\":96,\"athlete_id\":99,\"athlete_name\":\"ATHLETE 89\"}', 1, 99, '2025-12-04 16:10:55'),
(240, 99, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"96\",\"rejection_reason\":null}', 0, 108, '2025-12-04 16:11:01'),
(241, 100, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"95\",\"rejection_reason\":null}', 0, 108, '2025-12-04 16:11:05'),
(242, 101, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"94\",\"rejection_reason\":null}', 0, 108, '2025-12-04 16:11:08'),
(243, 102, 'join_request_approved', '✅ Yêu cầu được chấp nhận!', 'Chúc mừng! Bạn đã được chấp nhận vào đội \"COACH9\". Số áo sẽ do huấn luyện viên phân công sau.', '{\"team_id\":14,\"team_name\":\"COACH9\",\"request_id\":\"93\",\"rejection_reason\":null}', 0, 108, '2025-12-04 16:11:11'),
(244, 10, 'tournament_registration_pending', '📥 Yêu cầu đăng ký giải đấu', 'Đội \"COACH9\" đã gửi yêu cầu đăng ký tham gia giải \"Giải Cỏ Mới\". Vui lòng duyệt.', '{\"tournament_id\":\"4\",\"tournament_name\":\"Giải Cỏ Mới\",\"team_id\":14,\"team_name\":\"COACH9\",\"tournament_team_id\":12}', 1, 108, '2025-12-04 16:11:45'),
(245, 108, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH9\" đã được chấp nhận tham gia giải \"Giải Cỏ Mới\".\n\n💰 Lệ phí 500.000 VND đã được thanh toán.', '{\"tournament_id\":4,\"tournament_name\":\"Giải Cỏ Mới\",\"team_id\":14,\"team_name\":\"COACH9\",\"tournament_team_id\":\"12\",\"entry_fee_paid\":500000,\"rejection_reason\":null}', 0, 10, '2025-12-04 16:12:04'),
(246, 108, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH9\" đã được chấp nhận tham gia giải \"Giải Cỏ Mới\".\n\n💰 Lệ phí 500.000 VND đã được thanh toán.', '{\"tournament_id\":4,\"tournament_name\":\"Giải Cỏ Mới\",\"team_id\":14,\"team_name\":\"COACH9\",\"tournament_team_id\":\"12\",\"entry_fee_paid\":500000,\"rejection_reason\":null}', 0, 10, '2025-12-04 16:14:53'),
(247, 108, 'tournament_registration_approved', '✅ Đăng ký giải đấu được duyệt', 'Đội \"COACH9\" đã được chấp nhận tham gia giải \"Giải Cỏ Mới\".\n\n💰 Lệ phí 500.000 VND đã được thanh toán.', '{\"tournament_id\":4,\"tournament_name\":\"Giải Cỏ Mới\",\"team_id\":14,\"team_name\":\"COACH9\",\"tournament_team_id\":\"12\",\"entry_fee_paid\":500000,\"rejection_reason\":null}', 0, 10, '2025-12-04 16:17:16'),
(248, 10, 'tournament_registration_approved', '💰 Đã nhận lệ phí đăng ký giải', 'Đội \"COACH9\" đã thanh toán lệ phí 500.000 VND cho giải \"Giải Cỏ Mới\".', '{\"tournament_id\":4,\"tournament_name\":\"Giải Cỏ Mới\",\"team_id\":14,\"team_name\":\"COACH9\",\"entry_fee_received\":500000}', 1, 10, '2025-12-04 16:17:16'),
(250, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":1,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":96,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-05 13:01:20'),
(251, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":1,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(252, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":2,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(253, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":2,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(254, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":3,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":96,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-05 13:01:20'),
(255, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":3,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(256, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":4,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(257, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":4,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(258, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":5,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":96,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-05 13:01:20'),
(259, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":5,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(260, 9, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":6,\"team_id\":13,\"lineup\":[{\"athlete_id\":52,\"position\":\"PG\"},{\"athlete_id\":51,\"position\":\"SG\"},{\"athlete_id\":55,\"position\":\"SF\"},{\"athlete_id\":53,\"position\":\"PF\"},{\"athlete_id\":50,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(261, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":6,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(262, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":7,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(263, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":7,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(264, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":8,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(265, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":8,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(266, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":9,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(267, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":9,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(268, 6, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":10,\"team_id\":10,\"lineup\":[{\"athlete_id\":29,\"position\":\"PG\"},{\"athlete_id\":30,\"position\":\"SG\"},{\"athlete_id\":31,\"position\":\"SF\"},{\"athlete_id\":35,\"position\":\"PF\"},{\"athlete_id\":33,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(269, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":10,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(270, 7, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":11,\"team_id\":11,\"lineup\":[{\"athlete_id\":40,\"position\":\"PG\"},{\"athlete_id\":41,\"position\":\"SG\"},{\"athlete_id\":38,\"position\":\"SF\"},{\"athlete_id\":39,\"position\":\"PF\"},{\"athlete_id\":37,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(271, 8, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":11,\"team_id\":12,\"lineup\":[{\"athlete_id\":48,\"position\":\"PG\"},{\"athlete_id\":44,\"position\":\"SG\"},{\"athlete_id\":43,\"position\":\"SF\"},{\"athlete_id\":46,\"position\":\"PF\"},{\"athlete_id\":47,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(272, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":12,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(273, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":12,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:01:20'),
(274, 2, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":13,\"team_id\":6,\"lineup\":[{\"athlete_id\":1,\"position\":\"PG\"},{\"athlete_id\":96,\"position\":\"SG\"},{\"athlete_id\":6,\"position\":\"SF\"},{\"athlete_id\":5,\"position\":\"PF\"},{\"athlete_id\":2,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 1, NULL, '2025-12-05 13:47:09'),
(275, 4, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":13,\"team_id\":8,\"lineup\":[{\"athlete_id\":21,\"position\":\"PG\"},{\"athlete_id\":19,\"position\":\"SG\"},{\"athlete_id\":18,\"position\":\"SF\"},{\"athlete_id\":17,\"position\":\"PF\"},{\"athlete_id\":16,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:47:09'),
(276, 3, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":14,\"team_id\":7,\"lineup\":[{\"athlete_id\":9,\"position\":\"PG\"},{\"athlete_id\":10,\"position\":\"SG\"},{\"athlete_id\":11,\"position\":\"SF\"},{\"athlete_id\":12,\"position\":\"PF\"},{\"athlete_id\":14,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:47:09'),
(277, 5, 'lineup_auto_set', '📅 Đội hình đã được tự động sắp xếp', 'Hệ thống đã tự động sắp xếp đội hình mặc định cho trận đấu sắp tới. Bạn có thể điều chỉnh đội hình này bất cứ lúc nào trước 2 giờ trước khi trận đấu bắt đầu.', '{\"match_id\":14,\"team_id\":9,\"lineup\":[{\"athlete_id\":22,\"position\":\"PG\"},{\"athlete_id\":25,\"position\":\"SG\"},{\"athlete_id\":26,\"position\":\"SF\"},{\"athlete_id\":27,\"position\":\"PF\"},{\"athlete_id\":28,\"position\":\"C\"}],\"auto_set\":true,\"is_urgent\":false}', 0, NULL, '2025-12-05 13:47:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Người đánh giá',
  `target_type` enum('coach','athlete','tournament') NOT NULL COMMENT 'Loại đối tượng được đánh giá',
  `target_id` int(11) NOT NULL COMMENT 'ID của đối tượng (coach_id, athlete_id, hoặc tournament_id)',
  `rating` tinyint(4) NOT NULL COMMENT 'Số sao từ 1-5',
  `comment` text DEFAULT NULL COMMENT 'Bình luận đánh giá (optional)',
  `is_anonymous` tinyint(1) DEFAULT 0 COMMENT 'Đánh giá ẩn danh hay không',
  `status` enum('active','hidden','deleted') DEFAULT 'active' COMMENT 'Trạng thái đánh giá',
  `hidden_reason` text DEFAULT NULL COMMENT 'Lý do ẩn (nếu admin ẩn)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `ratings`
--

INSERT INTO `ratings` (`rating_id`, `user_id`, `target_type`, `target_id`, `rating`, `comment`, `is_anonymous`, `status`, `hidden_reason`, `created_at`, `updated_at`) VALUES
(1, 10, 'athlete', 10, 5, NULL, 1, 'active', NULL, '2025-12-04 14:04:15', '2025-12-04 14:04:15'),
(2, 10, 'athlete', 1, 5, NULL, 1, 'active', NULL, '2025-12-04 14:05:11', '2025-12-04 14:05:11'),
(3, 10, 'tournament', 3, 5, NULL, 0, 'active', NULL, '2025-12-04 14:11:17', '2025-12-04 14:11:23'),
(4, 10, 'tournament', 4, 5, NULL, 0, 'active', NULL, '2025-12-04 16:25:38', '2025-12-04 16:25:38'),
(5, 10, 'athlete', 21, 5, NULL, 1, 'active', NULL, '2025-12-05 14:27:34', '2025-12-05 14:27:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rating_stats`
--

CREATE TABLE `rating_stats` (
  `stat_id` int(11) NOT NULL,
  `target_type` enum('coach','athlete','tournament') NOT NULL,
  `target_id` int(11) NOT NULL,
  `total_ratings` int(11) DEFAULT 0 COMMENT 'Tổng số lượt đánh giá',
  `average_rating` decimal(3,2) DEFAULT 0.00 COMMENT 'Điểm trung bình (0.00 - 5.00)',
  `rating_5_count` int(11) DEFAULT 0 COMMENT 'Số lượng đánh giá 5 sao',
  `rating_4_count` int(11) DEFAULT 0,
  `rating_3_count` int(11) DEFAULT 0,
  `rating_2_count` int(11) DEFAULT 0,
  `rating_1_count` int(11) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thống kê đánh giá cho hiển thị nhanh';

--
-- Đang đổ dữ liệu cho bảng `rating_stats`
--

INSERT INTO `rating_stats` (`stat_id`, `target_type`, `target_id`, `total_ratings`, `average_rating`, `rating_5_count`, `rating_4_count`, `rating_3_count`, `rating_2_count`, `rating_1_count`, `last_updated`) VALUES
(1, 'athlete', 10, 1, 5.00, 1, 0, 0, 0, 0, '2025-12-04 14:04:15'),
(2, 'athlete', 1, 1, 5.00, 1, 0, 0, 0, 0, '2025-12-04 14:05:11'),
(3, 'tournament', 3, 1, 5.00, 1, 0, 0, 0, 0, '2025-12-04 14:11:23'),
(5, 'tournament', 4, 1, 5.00, 1, 0, 0, 0, 0, '2025-12-04 16:25:38'),
(6, 'athlete', 21, 1, 5.00, 1, 0, 0, 0, 0, '2025-12-05 14:27:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `referees`
--

CREATE TABLE `referees` (
  `referee_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `certification_level` enum('Level 1','Level 2','Level 3','International') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `referees`
--

INSERT INTO `referees` (`referee_id`, `user_id`, `license_number`, `certification_level`, `created_at`, `updated_at`) VALUES
(1, 107, 'REF-0001', 'Level 1', '2025-11-29 10:15:03', '2025-11-29 10:15:03'),
(2, 109, 'REF-0002', 'Level 1', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(3, 110, 'REF-0003', 'Level 1', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(4, 111, 'REF-0004', 'Level 2', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(5, 112, 'REF-0005', 'Level 1', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(6, 113, 'REF-0006', 'Level 2', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(7, 114, 'REF-0007', 'Level 1', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(8, 115, 'REF-0008', 'Level 3', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(9, 116, 'REF-0009', 'Level 1', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(10, 117, 'REF-0010', 'Level 2', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(11, 118, 'REF-0011', 'Level 1', '2025-11-30 08:48:45', '2025-11-30 08:48:45'),
(12, 119, 'REF-0012', 'Level 2', '2025-11-30 08:48:45', '2025-11-30 08:48:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `referee_availability`
--

CREATE TABLE `referee_availability` (
  `availability_id` int(11) NOT NULL,
  `referee_id` int(11) NOT NULL COMMENT 'referee_id from referees table',
  `user_id` int(11) NOT NULL COMMENT 'user_id of referee (for easier querying)',
  `date` date NOT NULL COMMENT 'Ngày rảnh',
  `start_time` time NOT NULL COMMENT 'Giờ bắt đầu rảnh',
  `end_time` time NOT NULL COMMENT 'Giờ kết thúc rảnh',
  `is_available` tinyint(1) DEFAULT 1 COMMENT '1 = rảnh, 0 = không rảnh (blocked time)',
  `notes` text DEFAULT NULL COMMENT 'Ghi chú (ví dụ: "Chỉ rảnh buổi sáng")',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thời gian rảnh của trọng tài';

--
-- Đang đổ dữ liệu cho bảng `referee_availability`
--

INSERT INTO `referee_availability` (`availability_id`, `referee_id`, `user_id`, `date`, `start_time`, `end_time`, `is_available`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 107, '2025-11-30', '02:30:00', '23:30:00', 1, NULL, '2025-11-29 19:30:35', '2025-11-29 19:30:35'),
(2, 1, 107, '2025-11-29', '03:30:00', '15:30:00', 1, NULL, '2025-11-29 19:30:48', '2025-11-29 19:30:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sponsors`
--

CREATE TABLE `sponsors` (
  `sponsor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `company_address` text DEFAULT NULL,
  `tax_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sponsors`
--

INSERT INTO `sponsors` (`sponsor_id`, `user_id`, `company_name`, `company_address`, `tax_code`, `created_at`, `updated_at`) VALUES
(1, 10, 'Sponsor Company 1', 'Hồ Chí Minh, Việt Nam', 'TAX251059', '2025-11-29 10:15:03', '2025-11-29 10:15:03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `standings`
--

CREATE TABLE `standings` (
  `standing_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `matches_played` int(11) DEFAULT 0,
  `wins` int(11) DEFAULT 0,
  `draws` int(11) DEFAULT 0,
  `losses` int(11) DEFAULT 0,
  `points` int(11) DEFAULT 0,
  `goals_for` int(11) DEFAULT 0,
  `goals_against` int(11) DEFAULT 0,
  `goal_difference` int(11) DEFAULT 0,
  `position` int(11) DEFAULT 0,
  `final_position` int(11) DEFAULT NULL COMMENT 'Vị trí chung cuộc sau khi giải đấu kết thúc (1=Vô địch, 2=Á quân, 3-4=Hạng 3, etc.)',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `standings`
--

INSERT INTO `standings` (`standing_id`, `tournament_id`, `team_id`, `matches_played`, `wins`, `draws`, `losses`, `points`, `goals_for`, `goals_against`, `goal_difference`, `position`, `updated_at`) VALUES
(1, 3, 6, 3, 2, 0, 1, 2, 20, 6, 14, 2, '2025-12-05 13:05:38'),
(2, 3, 7, 3, 2, 0, 1, 2, 35, 26, 9, 3, '2025-12-05 13:05:38'),
(4, 3, 12, 3, 2, 0, 1, 2, 35, 35, 0, 5, '2025-12-05 13:05:38'),
(5, 3, 13, 2, 1, 0, 1, 1, 13, 8, 5, 6, '2025-12-05 13:05:38'),
(6, 3, 10, 3, 0, 0, 3, 0, 22, 44, -22, 7, '2025-12-05 13:05:38'),
(7, 3, 8, 3, 2, 0, 1, 2, 18, 16, 2, 4, '2025-12-05 13:05:38'),
(10, 3, 11, 3, 0, 0, 3, 0, 17, 40, -23, 8, '2025-12-05 13:05:22'),
(13, 3, 9, 2, 2, 0, 0, 2, 29, 14, 15, 1, '2025-12-05 13:05:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `teams`
--

CREATE TABLE `teams` (
  `team_id` int(11) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `short_name` varchar(20) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `entry_fee` int(11) DEFAULT 0 COMMENT 'Lệ phí gia nhập đội (VND)',
  `coach_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `status` enum('pending','approved','rejected') DEFAULT 'pending' COMMENT 'Trạng thái duyệt đội (pending = chờ duyệt, approved = đã duyệt, rejected = bị từ chối)',
  `approved_by` int(11) DEFAULT NULL COMMENT 'Admin user_id who approved/rejected the team',
  `approved_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian duyệt/từ chối',
  `rejection_reason` text DEFAULT NULL COMMENT 'Lý do từ chối (nếu bị từ chối)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `teams`
--

INSERT INTO `teams` (`team_id`, `team_name`, `short_name`, `logo_url`, `entry_fee`, `coach_id`, `is_active`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`) VALUES
(6, 'COACH1', 'COACH1', '', 0, 1, 1, 'approved', NULL, NULL, NULL, '2025-11-29 11:38:57'),
(7, 'COACH2', 'COACH2', '', 10000, 2, 1, 'approved', 1, '2025-11-29 20:01:11', NULL, '2025-11-29 19:32:37'),
(8, 'COACH3', 'COACH3', '', 0, 3, 1, 'approved', 1, '2025-11-30 05:34:42', NULL, '2025-11-30 05:17:47'),
(9, 'COACH4', 'COACH4', '', 0, 4, 1, 'approved', 1, '2025-11-30 05:34:22', NULL, '2025-11-30 05:27:40'),
(10, 'COACH5', 'COACH5', '', 0, 5, 1, 'approved', 1, '2025-11-30 05:34:26', NULL, '2025-11-30 05:27:40'),
(11, 'COACH6', 'COACH6', '', 0, 6, 1, 'approved', 1, '2025-11-30 05:34:29', NULL, '2025-11-30 05:27:40'),
(12, 'COACH7', 'COACH7', '', 0, 7, 1, 'approved', 1, '2025-11-30 05:34:33', NULL, '2025-11-30 05:27:40'),
(13, 'COACH8', 'COACH8', '', 0, 8, 1, 'approved', 1, '2025-11-30 05:34:36', NULL, '2025-11-30 05:27:40'),
(14, 'COACH9', 'COACH9', '', 100000, 9, 1, 'approved', 1, '2025-11-30 05:57:03', NULL, '2025-11-30 05:52:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `team_join_requests`
--

CREATE TABLE `team_join_requests` (
  `request_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL COMMENT 'Lý do từ chối yêu cầu gia nhập'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `team_join_requests`
--

INSERT INTO `team_join_requests` (`request_id`, `team_id`, `user_id`, `status`, `message`, `requested_at`, `processed_at`, `processed_by`, `rejection_reason`) VALUES
(8, 6, 11, 'rejected', NULL, '2025-11-29 11:39:57', '2025-11-29 11:51:32', 1, NULL),
(10, 6, 11, 'approved', NULL, '2025-11-29 12:26:04', '2025-11-29 12:26:22', 1, NULL),
(11, 6, 12, 'rejected', NULL, '2025-11-29 12:43:20', '2025-11-29 12:43:40', 1, 'Gà'),
(13, 6, 12, 'approved', NULL, '2025-11-29 12:59:56', '2025-11-29 13:01:55', 1, NULL),
(14, 6, 13, 'approved', NULL, '2025-11-29 13:00:10', '2025-11-29 13:01:51', 1, NULL),
(15, 6, 14, 'approved', NULL, '2025-11-29 13:00:42', '2025-11-29 13:01:49', 1, NULL),
(16, 6, 15, 'approved', NULL, '2025-11-29 13:01:01', '2025-11-29 13:01:46', 1, NULL),
(17, 6, 16, 'approved', NULL, '2025-11-29 13:01:13', '2025-11-29 13:01:43', 1, NULL),
(18, 6, 17, 'approved', NULL, '2025-11-29 13:01:25', '2025-11-29 13:01:40', 1, NULL),
(19, 7, 18, 'approved', NULL, '2025-11-29 20:03:50', '2025-11-29 20:20:04', 2, NULL),
(20, 7, 19, 'approved', NULL, '2025-11-29 20:04:46', '2025-11-29 20:20:02', 2, NULL),
(21, 7, 20, 'approved', NULL, '2025-11-29 20:05:53', '2025-11-29 20:19:52', 2, NULL),
(22, 7, 21, 'approved', NULL, '2025-11-29 20:06:15', '2025-11-29 20:19:49', 2, NULL),
(23, 7, 22, 'approved', NULL, '2025-11-29 20:06:37', '2025-11-29 20:19:46', 2, NULL),
(24, 7, 23, 'approved', NULL, '2025-11-29 20:07:09', '2025-11-29 20:15:14', 2, NULL),
(25, 7, 24, 'approved', NULL, '2025-11-29 20:07:23', '2025-11-29 20:07:47', 2, NULL),
(30, 6, 11, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(31, 6, 12, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(32, 6, 13, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(33, 6, 14, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(34, 6, 15, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(35, 6, 16, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(36, 6, 17, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 2, NULL),
(37, 7, 18, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(38, 7, 19, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(39, 7, 20, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(40, 7, 21, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(41, 7, 22, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(42, 7, 23, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(43, 7, 24, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 3, NULL),
(44, 8, 25, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(45, 8, 26, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(46, 8, 27, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(47, 8, 28, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(48, 8, 29, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(49, 8, 30, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(50, 8, 31, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 4, NULL),
(51, 9, 32, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 5, NULL),
(52, 9, 33, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 5, NULL),
(53, 9, 34, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 5, NULL),
(54, 9, 35, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 5, NULL),
(55, 9, 36, 'approved', NULL, '2025-11-30 05:33:37', '2025-11-30 05:33:37', 5, NULL),
(56, 9, 37, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 5, NULL),
(57, 9, 38, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 5, NULL),
(58, 10, 39, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(59, 10, 40, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(60, 10, 41, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(61, 10, 42, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(62, 10, 43, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(63, 10, 44, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(64, 10, 45, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 6, NULL),
(65, 11, 46, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(66, 11, 47, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(67, 11, 48, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(68, 11, 49, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(69, 11, 50, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(70, 11, 51, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(71, 11, 52, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 7, NULL),
(72, 12, 53, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(73, 12, 54, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(74, 12, 55, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(75, 12, 56, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(76, 12, 57, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(77, 12, 58, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(78, 12, 59, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 8, NULL),
(79, 13, 60, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(80, 13, 61, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(81, 13, 62, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(82, 13, 63, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(83, 13, 64, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(84, 13, 65, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(85, 13, 66, 'approved', NULL, '2025-11-30 05:33:38', '2025-11-30 05:33:38', 9, NULL),
(86, 6, 106, 'approved', NULL, '2025-12-04 15:28:00', '2025-12-04 15:28:18', 1, NULL),
(87, 14, 105, 'approved', NULL, '2025-12-04 15:28:57', '2025-12-04 15:29:14', 9, NULL),
(88, 14, 105, 'approved', NULL, '2025-12-04 15:31:42', '2025-12-04 15:34:09', 9, NULL),
(89, 14, 105, 'approved', NULL, '2025-12-04 15:37:05', '2025-12-04 15:37:12', 9, NULL),
(90, 14, 105, 'approved', NULL, '2025-12-04 15:49:53', '2025-12-04 15:50:01', 9, NULL),
(91, 14, 104, 'approved', NULL, '2025-12-04 16:00:29', '2025-12-04 16:09:08', 9, NULL),
(92, 14, 103, 'approved', NULL, '2025-12-04 16:00:44', '2025-12-04 16:06:03', 9, NULL),
(93, 14, 102, 'approved', NULL, '2025-12-04 16:09:42', '2025-12-04 16:11:11', 9, NULL),
(94, 14, 101, 'approved', NULL, '2025-12-04 16:10:21', '2025-12-04 16:11:08', 9, NULL),
(95, 14, 100, 'approved', NULL, '2025-12-04 16:10:40', '2025-12-04 16:11:05', 9, NULL),
(96, 14, 99, 'approved', NULL, '2025-12-04 16:10:55', '2025-12-04 16:11:01', 9, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `team_leave_requests`
--

CREATE TABLE `team_leave_requests` (
  `request_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reason` text NOT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tournaments`
--

CREATE TABLE `tournaments` (
  `tournament_id` int(11) NOT NULL,
  `sponsor_id` int(11) NOT NULL,
  `tournament_name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `registration_deadline` date NOT NULL,
  `max_teams` int(11) NOT NULL DEFAULT 16,
  `entry_fee` int(11) DEFAULT 0 COMMENT 'Lệ phí đăng ký giải đấu (VND)',
  `update_count` int(11) DEFAULT 0 COMMENT 'Number of times tournament has been updated (max 1)',
  `current_teams` int(11) DEFAULT 0,
  `status` enum('draft','registration','ongoing','completed','postponed') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_prize_money` bigint(20) DEFAULT 0,
  `prize_1st` bigint(20) DEFAULT 0,
  `prize_2nd` bigint(20) DEFAULT 0,
  `prize_3rd` bigint(20) DEFAULT 0,
  `prize_4th` bigint(20) DEFAULT 0 COMMENT 'Giải tư',
  `prize_5th_to_8th` bigint(20) DEFAULT 0 COMMENT 'Giải 5-8 (mỗi đội)',
  `prize_9th_to_16th` bigint(20) DEFAULT 0 COMMENT 'Giải 9-16 (mỗi đội, chỉ cho 16 đội)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tournaments`
--

INSERT INTO `tournaments` (`tournament_id`, `sponsor_id`, `tournament_name`, `description`, `start_date`, `end_date`, `registration_deadline`, `max_teams`, `entry_fee`, `update_count`, `current_teams`, `status`, `created_at`, `updated_at`, `total_prize_money`, `prize_1st`, `prize_2nd`, `prize_3rd`, `prize_4th`, `prize_5th_to_8th`, `prize_9th_to_16th`) VALUES
(3, 1, 'Giải Vinamilk 2025', 'Hello', '2025-12-03', '2025-12-23', '2025-12-01', 8, 0, 0, 0, 'ongoing', '2025-11-29 17:01:04', '2025-12-03 04:21:20', 1000000000, 350000000, 300000000, 250000000, 80000000, 5000000, 0),
(4, 1, 'Giải Cỏ Mới', '', '2025-12-06', '2025-12-29', '2025-12-05', 8, 500000, 0, 0, 'postponed', '2025-12-04 15:55:36', '2025-12-05 13:00:29', 2000000000, 700000000, 600000000, 500000000, 160000000, 10000000, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tournament_leave_requests`
--

CREATE TABLE `tournament_leave_requests` (
  `request_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `coach_id` int(11) NOT NULL COMMENT 'Coach who submitted the request',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reason` text NOT NULL COMMENT 'Reason for leaving tournament',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL COMMENT 'Sponsor user_id who reviewed',
  `rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Requests from teams to leave tournaments';

--
-- Đang đổ dữ liệu cho bảng `tournament_leave_requests`
--

INSERT INTO `tournament_leave_requests` (`request_id`, `tournament_id`, `team_id`, `coach_id`, `status`, `reason`, `requested_at`, `processed_at`, `processed_by`, `rejection_reason`) VALUES
(1, 3, 6, 1, 'approved', 'gà', '2025-11-29 18:03:42', '2025-11-29 18:04:21', 10, NULL),
(2, 3, 6, 1, 'approved', '1', '2025-11-29 18:07:10', '2025-11-29 18:09:39', 10, NULL),
(3, 3, 6, 1, 'approved', 'sd', '2025-11-29 18:13:27', '2025-11-29 18:13:35', 10, NULL),
(4, 3, 6, 1, 'pending', 'sdsd', '2025-12-02 16:26:57', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tournament_teams`
--

CREATE TABLE `tournament_teams` (
  `tournament_team_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tournament_teams`
--

INSERT INTO `tournament_teams` (`tournament_team_id`, `tournament_id`, `team_id`, `registration_date`, `status`, `approved_by`, `approved_at`, `rejection_reason`) VALUES
(4, 3, 6, '2025-11-29 19:05:45', 'approved', 10, '2025-11-29 19:05:56', NULL),
(5, 3, 7, '2025-11-29 20:48:07', 'approved', 10, '2025-11-30 06:00:43', NULL),
(6, 3, 11, '2025-11-30 05:43:11', 'approved', 10, '2025-11-30 06:00:40', NULL),
(7, 3, 12, '2025-11-30 05:44:28', 'approved', 10, '2025-11-30 06:00:36', NULL),
(8, 3, 13, '2025-11-30 05:45:06', 'approved', 10, '2025-11-30 06:00:32', NULL),
(9, 3, 10, '2025-11-30 05:45:26', 'approved', 10, '2025-11-30 06:00:29', NULL),
(10, 3, 9, '2025-11-30 05:45:36', 'approved', 10, '2025-11-30 06:00:25', NULL),
(11, 3, 8, '2025-11-30 05:45:47', 'approved', 10, '2025-11-30 06:00:22', NULL),
(12, 4, 14, '2025-12-04 16:11:45', 'approved', 10, '2025-12-04 16:17:16', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tournament_update_requests`
--

CREATE TABLE `tournament_update_requests` (
  `request_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `sponsor_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `request_type` enum('update','delete') DEFAULT 'update',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `proposed_changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`proposed_changes`)),
  `rejection_reason` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','sponsor','coach','athlete','referee','viewer') NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `money` int(11) DEFAULT 0 COMMENT 'Số dư tài khoản (VND)',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `full_name`, `phone`, `role`, `avatar_url`, `money`, `is_active`, `last_login`, `reset_otp`, `reset_otp_expires`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'admin@system.local', 'System Admin', '0457074882', 'admin', NULL, 194000000, 1, '2025-12-05 12:57:17', NULL, NULL, '2025-11-29 10:15:03', '2025-12-05 13:00:29'),
(2, 'coach1', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach1@gmail.com', 'COACH 1', '0665306647', 'coach', NULL, 90000000, 1, '2025-12-05 14:21:46', NULL, NULL, '2025-11-29 10:15:03', '2025-12-05 14:21:46'),
(3, 'coach2', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach2@gmail.com', 'COACH 2', '0737101350', 'coach', NULL, 89570000, 1, '2025-12-02 16:29:35', NULL, NULL, '2025-11-29 10:15:03', '2025-12-02 16:29:35'),
(4, 'coach3', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach3@gmail.com', 'COACH 3', '0293213096', 'coach', NULL, 89500000, 1, '2025-11-30 05:45:42', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:45:42'),
(5, 'coach4', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach4@gmail.com', 'COACH 4', '0912904713', 'coach', NULL, 89500000, 1, '2025-11-30 05:45:32', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:45:32'),
(6, 'coach5', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach5@gmail.com', 'COACH 5', '0606230065', 'coach', NULL, 89500000, 1, '2025-11-30 05:45:21', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:45:21'),
(7, 'coach6', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach6@gmail.com', 'COACH 6', '0550387876', 'coach', NULL, 89500000, 1, '2025-11-30 05:45:12', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:45:12'),
(8, 'coach7', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach7@gmail.com', 'COACH 7', '0849886385', 'coach', NULL, 89500000, 1, '2025-11-30 05:43:18', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:43:18'),
(9, 'coach8', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'coach8@gmail.com', 'COACH 8', '0099690368', 'coach', NULL, 89500000, 1, '2025-12-03 05:14:08', NULL, NULL, '2025-11-29 10:15:03', '2025-12-03 05:14:08'),
(10, 'sponsor1', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'sponsor1@gmail.com', 'SPONSOR 1', '0668274856', 'sponsor', NULL, 80500000, 1, '2025-12-05 14:24:32', NULL, NULL, '2025-11-29 10:15:03', '2025-12-05 14:24:32'),
(11, 'athlete1', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete1@gmail.com', 'ATHLETE 1', '0575277858', 'athlete', NULL, 90000000, 1, '2025-12-01 16:57:42', NULL, NULL, '2025-11-29 10:15:03', '2025-12-01 16:57:42'),
(12, 'athlete2', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete2@gmail.com', 'ATHLETE 2', '0109437426', 'athlete', NULL, 90000000, 1, '2025-11-29 12:59:52', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(13, 'athlete3', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete3@gmail.com', 'ATHLETE 3', '0903337122', 'athlete', NULL, 90000000, 1, '2025-11-29 13:00:06', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(14, 'athlete4', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete4@gmail.com', 'ATHLETE 4', '0250647489', 'athlete', NULL, 90000000, 1, '2025-11-29 13:00:23', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(15, 'athlete5', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete5@gmail.com', 'ATHLETE 5', '0060862909', 'athlete', NULL, 90000000, 1, '2025-11-29 13:00:57', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(16, 'athlete6', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete6@gmail.com', 'ATHLETE 6', '0662501815', 'athlete', NULL, 90000000, 1, '2025-11-29 13:01:09', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(17, 'athlete7', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete7@gmail.com', 'ATHLETE 7', '0610936148', 'athlete', NULL, 90000000, 1, '2025-11-29 13:01:20', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(18, 'athlete8', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete8@gmail.com', 'ATHLETE 8', '0493958534', 'athlete', NULL, 89990000, 1, '2025-11-29 20:03:44', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:20:04'),
(19, 'athlete9', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete9@gmail.com', 'ATHLETE 9', '0836691592', 'athlete', NULL, 89990000, 1, '2025-11-29 20:04:01', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:20:02'),
(20, 'athlete10', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete10@gmail.com', 'ATHLETE 10', '0922119102', 'athlete', NULL, 89990000, 1, '2025-11-29 20:05:00', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:19:52'),
(21, 'athlete11', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete11@gmail.com', 'ATHLETE 11', '0734341892', 'athlete', NULL, 89990000, 1, '2025-11-29 20:06:02', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:19:49'),
(22, 'athlete12', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete12@gmail.com', 'ATHLETE 12', '0967620635', 'athlete', NULL, 89990000, 1, '2025-11-29 20:06:22', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:19:46'),
(23, 'athlete13', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete13@gmail.com', 'ATHLETE 13', '0020246584', 'athlete', NULL, 89990000, 1, '2025-11-29 20:06:52', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:15:14'),
(24, 'athlete14', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete14@gmail.com', 'ATHLETE 14', '0957197653', 'athlete', NULL, 89990000, 1, '2025-11-29 20:07:19', NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 20:07:47'),
(25, 'athlete15', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete15@gmail.com', 'ATHLETE 15', '0771575727', 'athlete', NULL, 90000000, 1, '2025-11-30 05:18:14', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:18:14'),
(26, 'athlete16', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete16@gmail.com', 'ATHLETE 16', '0382266651', 'athlete', NULL, 90000000, 1, '2025-11-30 05:18:35', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:18:35'),
(27, 'athlete17', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete17@gmail.com', 'ATHLETE 17', '0978114847', 'athlete', NULL, 90000000, 1, '2025-11-30 05:18:59', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:18:59'),
(28, 'athlete18', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete18@gmail.com', 'ATHLETE 18', '0004425885', 'athlete', NULL, 90000000, 1, '2025-11-30 05:19:15', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:19:15'),
(29, 'athlete19', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete19@gmail.com', 'ATHLETE 19', '0572479247', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(30, 'athlete20', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete20@gmail.com', 'ATHLETE 20', '0938119101', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(31, 'athlete21', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete21@gmail.com', 'ATHLETE 21', '0256105356', 'athlete', NULL, 90000000, 1, '2025-11-30 05:36:51', NULL, NULL, '2025-11-29 10:15:03', '2025-11-30 05:36:51'),
(32, 'athlete22', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete22@gmail.com', 'ATHLETE 22', '0124607064', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(33, 'athlete23', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete23@gmail.com', 'ATHLETE 23', '0208858711', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(34, 'athlete24', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete24@gmail.com', 'ATHLETE 24', '0743587265', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(35, 'athlete25', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete25@gmail.com', 'ATHLETE 25', '0957133552', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(36, 'athlete26', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete26@gmail.com', 'ATHLETE 26', '0638357507', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(37, 'athlete27', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete27@gmail.com', 'ATHLETE 27', '0980939140', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(38, 'athlete28', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete28@gmail.com', 'ATHLETE 28', '0654320104', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(39, 'athlete29', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete29@gmail.com', 'ATHLETE 29', '0118829399', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(40, 'athlete30', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete30@gmail.com', 'ATHLETE 30', '0776886868', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(41, 'athlete31', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete31@gmail.com', 'ATHLETE 31', '0670934262', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(42, 'athlete32', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete32@gmail.com', 'ATHLETE 32', '0609142420', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(43, 'athlete33', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete33@gmail.com', 'ATHLETE 33', '0703942380', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(44, 'athlete34', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete34@gmail.com', 'ATHLETE 34', '0577316965', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(45, 'athlete35', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete35@gmail.com', 'ATHLETE 35', '0850341647', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(46, 'athlete36', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete36@gmail.com', 'ATHLETE 36', '0580475346', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(47, 'athlete37', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete37@gmail.com', 'ATHLETE 37', '0881375161', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(48, 'athlete38', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete38@gmail.com', 'ATHLETE 38', '0187220000', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(49, 'athlete39', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete39@gmail.com', 'ATHLETE 39', '0392114854', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(50, 'athlete40', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete40@gmail.com', 'ATHLETE 40', '0953768858', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(51, 'athlete41', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete41@gmail.com', 'ATHLETE 41', '0755010252', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(52, 'athlete42', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete42@gmail.com', 'ATHLETE 42', '0536615271', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(53, 'athlete43', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete43@gmail.com', 'ATHLETE 43', '0569424489', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(54, 'athlete44', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete44@gmail.com', 'ATHLETE 44', '0622936756', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(55, 'athlete45', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete45@gmail.com', 'ATHLETE 45', '0551362708', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(56, 'athlete46', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete46@gmail.com', 'ATHLETE 46', '0558931698', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(57, 'athlete47', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete47@gmail.com', 'ATHLETE 47', '0403528826', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(58, 'athlete48', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete48@gmail.com', 'ATHLETE 48', '0510636965', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(59, 'athlete49', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete49@gmail.com', 'ATHLETE 49', '0992014944', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(60, 'athlete50', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete50@gmail.com', 'ATHLETE 50', '0546848533', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(61, 'athlete51', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete51@gmail.com', 'ATHLETE 51', '0433486903', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(62, 'athlete52', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete52@gmail.com', 'ATHLETE 52', '0265424149', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(63, 'athlete53', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete53@gmail.com', 'ATHLETE 53', '0951896965', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(64, 'athlete54', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete54@gmail.com', 'ATHLETE 54', '0955208448', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(65, 'athlete55', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete55@gmail.com', 'ATHLETE 55', '0043744708', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(66, 'athlete56', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete56@gmail.com', 'ATHLETE 56', '0985820369', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(67, 'athlete57', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete57@gmail.com', 'ATHLETE 57', '0944551213', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(68, 'athlete58', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete58@gmail.com', 'ATHLETE 58', '0779868536', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(69, 'athlete59', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete59@gmail.com', 'ATHLETE 59', '0877969043', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(70, 'athlete60', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete60@gmail.com', 'ATHLETE 60', '0073116772', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(71, 'athlete61', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete61@gmail.com', 'ATHLETE 61', '0933237195', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(72, 'athlete62', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete62@gmail.com', 'ATHLETE 62', '0718779997', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(73, 'athlete63', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete63@gmail.com', 'ATHLETE 63', '0860760697', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(74, 'athlete64', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete64@gmail.com', 'ATHLETE 64', '0454818485', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(75, 'athlete65', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete65@gmail.com', 'ATHLETE 65', '0042469232', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(76, 'athlete66', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete66@gmail.com', 'ATHLETE 66', '0147569963', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(77, 'athlete67', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete67@gmail.com', 'ATHLETE 67', '0913638005', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(78, 'athlete68', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete68@gmail.com', 'ATHLETE 68', '0836327137', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(79, 'athlete69', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete69@gmail.com', 'ATHLETE 69', '0660156246', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(80, 'athlete70', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete70@gmail.com', 'ATHLETE 70', '0372142669', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(81, 'athlete71', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete71@gmail.com', 'ATHLETE 71', '0368784867', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(82, 'athlete72', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete72@gmail.com', 'ATHLETE 72', '0142223589', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(83, 'athlete73', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete73@gmail.com', 'ATHLETE 73', '0225877238', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(84, 'athlete74', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete74@gmail.com', 'ATHLETE 74', '0956007708', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(85, 'athlete75', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete75@gmail.com', 'ATHLETE 75', '0165366833', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(86, 'athlete76', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete76@gmail.com', 'ATHLETE 76', '0288658156', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(87, 'athlete77', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete77@gmail.com', 'ATHLETE 77', '0248130489', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(88, 'athlete78', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete78@gmail.com', 'ATHLETE 78', '0895604398', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(89, 'athlete79', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete79@gmail.com', 'ATHLETE 79', '0555467018', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(90, 'athlete80', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete80@gmail.com', 'ATHLETE 80', '0144523116', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(91, 'athlete81', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete81@gmail.com', 'ATHLETE 81', '0982703557', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(92, 'athlete82', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete82@gmail.com', 'ATHLETE 82', '0355265694', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(93, 'athlete83', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete83@gmail.com', 'ATHLETE 83', '0654810689', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(94, 'athlete84', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete84@gmail.com', 'ATHLETE 84', '0464621087', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(95, 'athlete85', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete85@gmail.com', 'ATHLETE 85', '0326753711', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(96, 'athlete86', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete86@gmail.com', 'ATHLETE 86', '0272058456', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(97, 'athlete87', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete87@gmail.com', 'ATHLETE 87', '0946989984', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(98, 'athlete88', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete88@gmail.com', 'ATHLETE 88', '0269011055', 'athlete', NULL, 90000000, 1, NULL, NULL, NULL, '2025-11-29 10:15:03', '2025-11-29 16:09:26'),
(99, 'athlete89', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete89@gmail.com', 'ATHLETE 89', '0762155588', 'athlete', NULL, 89900000, 1, '2025-12-04 16:10:50', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:11:01'),
(100, 'athlete90', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete90@gmail.com', 'ATHLETE 90', '0229941052', 'athlete', NULL, 89900000, 1, '2025-12-04 16:10:34', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:11:05'),
(101, 'athlete91', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete91@gmail.com', 'ATHLETE 91', '0116058003', 'athlete', NULL, 89900000, 1, '2025-12-04 16:09:51', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:11:08'),
(102, 'athlete92', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete92@gmail.com', 'ATHLETE 92', '0828805281', 'athlete', NULL, 89900000, 1, '2025-12-04 16:09:36', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:11:11'),
(103, 'athlete93', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete93@gmail.com', 'ATHLETE 93', '0318025791', 'athlete', NULL, 89900000, 1, '2025-12-04 16:00:39', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:06:03'),
(104, 'athlete94', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete94@gmail.com', 'ATHLETE 94', '0682628797', 'athlete', NULL, 89900000, 1, '2025-12-04 16:00:24', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:09:08'),
(105, 'athlete95', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete95@gmail.com', 'ATHLETE 95', '0488050801', 'athlete', NULL, 89900000, 1, '2025-12-04 15:36:47', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 15:50:01'),
(106, 'athlete96', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'athlete96@gmail.com', 'ATHLETE 96', '0311833641', 'athlete', NULL, 90000000, 1, '2025-12-04 16:00:09', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 16:00:09'),
(107, 'referee1', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee1@gmail.com', 'REFEREE 1', '0186794504', 'referee', NULL, 90000000, 1, '2025-12-04 08:40:58', NULL, NULL, '2025-11-29 10:15:03', '2025-12-04 08:40:58'),
(108, 'coach9', '$2a$10$Upl5CRDJHy.ZVSCd4dw7Ze6Ot9MV3TKT6TwwP1ZFiShsuahkmaLxi', 'coach9@gmail.com', 'COACH 9', '0375617993', 'coach', NULL, 89700000, 1, '2025-12-04 15:59:30', NULL, NULL, '2025-11-30 05:51:48', '2025-12-04 16:17:16'),
(109, 'referee2', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee2@gmail.com', 'REFEREE 2', '0987654321', 'referee', NULL, 90000000, 1, '2025-12-05 13:05:16', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:05:16'),
(110, 'referee3', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee3@gmail.com', 'REFEREE 3', '0987654322', 'referee', NULL, 90000000, 1, '2025-12-04 08:52:51', NULL, NULL, '2025-11-30 08:48:44', '2025-12-04 08:52:51'),
(111, 'referee4', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee4@gmail.com', 'REFEREE 4', '0987654323', 'referee', NULL, 90000000, 1, '2025-12-05 13:02:18', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:02:18'),
(112, 'referee5', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee5@gmail.com', 'REFEREE 5', '0987654324', 'referee', NULL, 90000000, 1, '2025-12-05 13:04:59', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:04:59'),
(113, 'referee6', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee6@gmail.com', 'REFEREE 6', '0987654325', 'referee', NULL, 90000000, 1, '2025-12-04 08:41:36', NULL, NULL, '2025-11-30 08:48:44', '2025-12-04 08:41:36'),
(114, 'referee7', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee7@gmail.com', 'REFEREE 7', '0987654326', 'referee', NULL, 90000000, 1, '2025-12-05 13:03:48', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:03:48'),
(115, 'referee8', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee8@gmail.com', 'REFEREE 8', '0987654327', 'referee', NULL, 90000000, 1, '2025-12-05 14:15:29', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 14:15:29'),
(116, 'referee9', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee9@gmail.com', 'REFEREE 9', '0987654328', 'referee', NULL, 90000000, 1, '2025-12-05 13:04:46', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:04:46'),
(117, 'referee10', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee10@gmail.com', 'REFEREE 10', '0987654329', 'referee', NULL, 90000000, 1, '2025-12-05 13:05:32', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:05:32'),
(118, 'referee11', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee11@gmail.com', 'REFEREE 11', '0987654330', 'referee', NULL, 90000000, 1, '2025-12-05 13:03:01', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:03:01'),
(119, 'referee12', '$2a$10$EjcmEeBSTYZmeDk7nqilsuQ0A/B5xtFaUUD2Pvxf/MQR7wvEocneO', 'referee12@gmail.com', 'REFEREE 12', '0987654331', 'referee', NULL, 90000000, 1, '2025-12-05 13:03:24', NULL, NULL, '2025-11-30 08:48:44', '2025-12-05 13:03:24'),
(120, 'coach10', '$2a$10$DWTnAHxOYXuxaVPDjTiChu7sQBUWWgYuHDIRjuv0KEF/1tmrEhHOu', 'coach10@gmailc.om', 'COACH 10', '092392839', 'coach', NULL, 0, 1, NULL, NULL, NULL, '2025-12-02 10:52:32', '2025-12-02 10:52:32');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `venues`
--

CREATE TABLE `venues` (
  `venue_id` int(11) NOT NULL,
  `venue_name` varchar(200) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `venues`
--

INSERT INTO `venues` (`venue_id`, `venue_name`, `address`, `city`, `capacity`, `is_available`, `created_at`) VALUES
(1, 'Sân Điền Kinh', '10 Đan Phượng', 'Hà Nội', 5000, 1, '2025-11-30 08:10:02'),
(2, 'Sân Cỏ', '100 Blabla', 'Hà Nội', 3000, 1, '2025-12-04 04:11:51'),
(3, 'Sân New', '100 Bla Blu', 'Hà Nội', 2000, 1, '2025-12-04 04:12:14'),
(4, 'Sân 6h50', '100 Phố Hàng Bún', 'Hà Nội', 2000, 1, '2025-12-05 12:57:50'),
(5, 'Sân 2', '222 Bla', 'Hà Nội', 4000, 1, '2025-12-05 12:58:10');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `athletes`
--
ALTER TABLE `athletes`
  ADD PRIMARY KEY (`athlete_id`),
  ADD UNIQUE KEY `uniq_athlete_user` (`user_id`),
  ADD UNIQUE KEY `uniq_team_jersey` (`team_id`,`jersey_number`),
  ADD KEY `idx_team_id` (`team_id`);

--
-- Chỉ mục cho bảng `coaches`
--
ALTER TABLE `coaches`
  ADD PRIMARY KEY (`coach_id`),
  ADD UNIQUE KEY `uniq_coach_user` (`user_id`);

--
-- Chỉ mục cho bảng `financial_categories`
--
ALTER TABLE `financial_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `idx_category_type` (`category_type`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Chỉ mục cho bảng `financial_summary`
--
ALTER TABLE `financial_summary`
  ADD PRIMARY KEY (`summary_id`),
  ADD UNIQUE KEY `unique_summary_period` (`summary_date`,`summary_type`),
  ADD KEY `idx_summary_date` (`summary_date`),
  ADD KEY `idx_summary_type` (`summary_type`);

--
-- Chỉ mục cho bảng `financial_transactions`
--
ALTER TABLE `financial_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `fk_financial_category` (`category_id`),
  ADD KEY `fk_created_by` (`created_by`),
  ADD KEY `fk_approved_by` (`approved_by`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_reference` (`reference_type`,`reference_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_receipt_number` (`receipt_number`);

--
-- Chỉ mục cho bảng `forum_comments`
--
ALTER TABLE `forum_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `fk_forum_comments_user` (`user_id`),
  ADD KEY `idx_forum_comments_post` (`post_id`);

--
-- Chỉ mục cho bảng `forum_comment_bans`
--
ALTER TABLE `forum_comment_bans`
  ADD PRIMARY KEY (`ban_id`),
  ADD KEY `idx_forum_comment_bans_user_active` (`user_id`,`is_active`),
  ADD KEY `fk_forum_comment_bans_banned_by` (`banned_by`);

--
-- Chỉ mục cho bảng `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `idx_forum_posts_topic_status` (`topic_id`,`status`),
  ADD KEY `fk_forum_posts_user` (`user_id`);

--
-- Chỉ mục cho bảng `forum_reports`
--
ALTER TABLE `forum_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `idx_forum_reports_target_status` (`target_type`,`target_id`,`status`),
  ADD KEY `fk_forum_reports_created_by` (`created_by`),
  ADD KEY `fk_forum_reports_processed_by` (`processed_by`);

--
-- Chỉ mục cho bảng `forum_topics`
--
ALTER TABLE `forum_topics`
  ADD PRIMARY KEY (`topic_id`),
  ADD KEY `idx_forum_topics_status_pinned` (`status`,`is_pinned`),
  ADD KEY `fk_forum_topics_created_by` (`created_by`);

--
-- Chỉ mục cho bảng `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`group_id`),
  ADD UNIQUE KEY `uniq_tournament_group` (`tournament_id`,`group_name`),
  ADD KEY `fk_group_tournament` (`tournament_id`);

--
-- Chỉ mục cho bảng `group_teams`
--
ALTER TABLE `group_teams`
  ADD PRIMARY KEY (`group_team_id`),
  ADD UNIQUE KEY `uniq_group_team` (`group_id`,`team_id`),
  ADD KEY `fk_gt_group` (`group_id`),
  ADD KEY `fk_gt_team` (`team_id`);

--
-- Chỉ mục cho bảng `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`match_id`),
  ADD KEY `idx_match_tournament` (`tournament_id`,`match_date`,`status`),
  ADD KEY `fk_match_home_team` (`home_team_id`),
  ADD KEY `fk_match_away_team` (`away_team_id`),
  ADD KEY `fk_match_referee` (`main_referee_id`),
  ADD KEY `fk_match_creator` (`created_by`),
  ADD KEY `fk_match_group` (`group_id`);

--
-- Chỉ mục cho bảng `match_lineups`
--
ALTER TABLE `match_lineups`
  ADD PRIMARY KEY (`lineup_id`),
  ADD UNIQUE KEY `uniq_match_team_athlete` (`match_id`,`team_id`,`athlete_id`),
  ADD KEY `idx_match_lineups_match` (`match_id`),
  ADD KEY `idx_match_lineups_team` (`team_id`),
  ADD KEY `idx_match_lineups_athlete` (`athlete_id`);

--
-- Chỉ mục cho bảng `match_notes`
--
ALTER TABLE `match_notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `idx_match_notes_match` (`match_id`),
  ADD KEY `idx_match_notes_referee` (`referee_user_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `fk_notif_creator` (`created_by`);

--
-- Chỉ mục cho bảng `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `unique_user_rating` (`user_id`,`target_type`,`target_id`),
  ADD KEY `idx_target` (`target_type`,`target_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `rating_stats`
--
ALTER TABLE `rating_stats`
  ADD PRIMARY KEY (`stat_id`),
  ADD UNIQUE KEY `unique_target` (`target_type`,`target_id`),
  ADD KEY `idx_average` (`average_rating`);

--
-- Chỉ mục cho bảng `referees`
--
ALTER TABLE `referees`
  ADD PRIMARY KEY (`referee_id`),
  ADD UNIQUE KEY `uniq_ref_user` (`user_id`);

--
-- Chỉ mục cho bảng `referee_availability`
--
ALTER TABLE `referee_availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `idx_referee_date` (`user_id`,`date`),
  ADD KEY `idx_referee_id` (`referee_id`);

--
-- Chỉ mục cho bảng `sponsors`
--
ALTER TABLE `sponsors`
  ADD PRIMARY KEY (`sponsor_id`),
  ADD UNIQUE KEY `uniq_sponsor_user` (`user_id`);

--
-- Chỉ mục cho bảng `standings`
--
ALTER TABLE `standings`
  ADD PRIMARY KEY (`standing_id`),
  ADD UNIQUE KEY `uniq_standing` (`tournament_id`,`team_id`),
  ADD KEY `fk_standing_team` (`team_id`);

--
-- Chỉ mục cho bảng `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`team_id`),
  ADD UNIQUE KEY `uniq_coach_team` (`coach_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_approved_by` (`approved_by`);

--
-- Chỉ mục cho bảng `team_join_requests`
--
ALTER TABLE `team_join_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_join_team_status` (`team_id`,`status`),
  ADD KEY `idx_join_user_status` (`user_id`,`status`),
  ADD KEY `fk_join_processed` (`processed_by`);

--
-- Chỉ mục cho bảng `team_leave_requests`
--
ALTER TABLE `team_leave_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_leave_team_status` (`team_id`,`status`),
  ADD KEY `fk_leave_athlete` (`athlete_id`),
  ADD KEY `fk_leave_user` (`user_id`),
  ADD KEY `fk_leave_processed` (`processed_by`);

--
-- Chỉ mục cho bảng `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`tournament_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `fk_tournament_sponsor` (`sponsor_id`);

--
-- Chỉ mục cho bảng `tournament_leave_requests`
--
ALTER TABLE `tournament_leave_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_tournament_status` (`tournament_id`,`status`),
  ADD KEY `idx_team_status` (`team_id`,`status`),
  ADD KEY `fk_tlr_coach` (`coach_id`),
  ADD KEY `fk_tlr_processed_by` (`processed_by`);

--
-- Chỉ mục cho bảng `tournament_teams`
--
ALTER TABLE `tournament_teams`
  ADD PRIMARY KEY (`tournament_team_id`),
  ADD UNIQUE KEY `uniq_tournament_team` (`tournament_id`,`team_id`),
  ADD KEY `fk_tt_team` (`team_id`),
  ADD KEY `fk_tt_admin` (`approved_by`);

--
-- Chỉ mục cho bảng `tournament_update_requests`
--
ALTER TABLE `tournament_update_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `fk_tur_tournament` (`tournament_id`),
  ADD KEY `fk_tur_sponsor` (`sponsor_id`),
  ADD KEY `fk_tur_requested_by` (`requested_by`),
  ADD KEY `fk_tur_reviewed_by` (`reviewed_by`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uniq_username` (`username`),
  ADD UNIQUE KEY `uniq_email` (`email`);

--
-- Chỉ mục cho bảng `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`venue_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `athletes`
--
ALTER TABLE `athletes`
  MODIFY `athlete_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT cho bảng `coaches`
--
ALTER TABLE `coaches`
  MODIFY `coach_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `financial_categories`
--
ALTER TABLE `financial_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `financial_summary`
--
ALTER TABLE `financial_summary`
  MODIFY `summary_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `financial_transactions`
--
ALTER TABLE `financial_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `forum_comments`
--
ALTER TABLE `forum_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `forum_comment_bans`
--
ALTER TABLE `forum_comment_bans`
  MODIFY `ban_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `forum_posts`
--
ALTER TABLE `forum_posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `forum_reports`
--
ALTER TABLE `forum_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `forum_topics`
--
ALTER TABLE `forum_topics`
  MODIFY `topic_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `groups`
--
ALTER TABLE `groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `group_teams`
--
ALTER TABLE `group_teams`
  MODIFY `group_team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `matches`
--
ALTER TABLE `matches`
  MODIFY `match_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `match_lineups`
--
ALTER TABLE `match_lineups`
  MODIFY `lineup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `match_notes`
--
ALTER TABLE `match_notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=278;

--
-- AUTO_INCREMENT cho bảng `ratings`
--
ALTER TABLE `ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `rating_stats`
--
ALTER TABLE `rating_stats`
  MODIFY `stat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `referees`
--
ALTER TABLE `referees`
  MODIFY `referee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `referee_availability`
--
ALTER TABLE `referee_availability`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `sponsors`
--
ALTER TABLE `sponsors`
  MODIFY `sponsor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `standings`
--
ALTER TABLE `standings`
  MODIFY `standing_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `teams`
--
ALTER TABLE `teams`
  MODIFY `team_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `team_join_requests`
--
ALTER TABLE `team_join_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT cho bảng `team_leave_requests`
--
ALTER TABLE `team_leave_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tournaments`
--
ALTER TABLE `tournaments`
  MODIFY `tournament_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tournament_leave_requests`
--
ALTER TABLE `tournament_leave_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tournament_teams`
--
ALTER TABLE `tournament_teams`
  MODIFY `tournament_team_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `tournament_update_requests`
--
ALTER TABLE `tournament_update_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT cho bảng `venues`
--
ALTER TABLE `venues`
  MODIFY `venue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `athletes`
--
ALTER TABLE `athletes`
  ADD CONSTRAINT `fk_athlete_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_athlete_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `coaches`
--
ALTER TABLE `coaches`
  ADD CONSTRAINT `fk_coach_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `financial_transactions`
--
ALTER TABLE `financial_transactions`
  ADD CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_financial_category` FOREIGN KEY (`category_id`) REFERENCES `financial_categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `forum_comments`
--
ALTER TABLE `forum_comments`
  ADD CONSTRAINT `fk_forum_comments_post` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `forum_comment_bans`
--
ALTER TABLE `forum_comment_bans`
  ADD CONSTRAINT `fk_forum_comment_bans_banned_by` FOREIGN KEY (`banned_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_comment_bans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD CONSTRAINT `fk_forum_posts_topic` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`topic_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `forum_reports`
--
ALTER TABLE `forum_reports`
  ADD CONSTRAINT `fk_forum_reports_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forum_reports_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `forum_topics`
--
ALTER TABLE `forum_topics`
  ADD CONSTRAINT `fk_forum_topics_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `fk_group_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `group_teams`
--
ALTER TABLE `group_teams`
  ADD CONSTRAINT `fk_gt_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_gt_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `fk_match_away_team` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_match_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_match_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_match_home_team` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_match_referee` FOREIGN KEY (`main_referee_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_match_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `match_lineups`
--
ALTER TABLE `match_lineups`
  ADD CONSTRAINT `fk_match_lineups_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`athlete_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_match_lineups_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`match_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_match_lineups_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `match_notes`
--
ALTER TABLE `match_notes`
  ADD CONSTRAINT `fk_match_notes_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`match_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_match_notes_referee_user` FOREIGN KEY (`referee_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `referees`
--
ALTER TABLE `referees`
  ADD CONSTRAINT `fk_ref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `referee_availability`
--
ALTER TABLE `referee_availability`
  ADD CONSTRAINT `fk_ra_referee` FOREIGN KEY (`referee_id`) REFERENCES `referees` (`referee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ra_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `sponsors`
--
ALTER TABLE `sponsors`
  ADD CONSTRAINT `fk_sponsor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `standings`
--
ALTER TABLE `standings`
  ADD CONSTRAINT `fk_standing_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_standing_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `fk_team_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`coach_id`),
  ADD CONSTRAINT `fk_teams_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `team_join_requests`
--
ALTER TABLE `team_join_requests`
  ADD CONSTRAINT `fk_join_processed` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_join_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_join_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `team_leave_requests`
--
ALTER TABLE `team_leave_requests`
  ADD CONSTRAINT `fk_leave_athlete` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`athlete_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leave_processed` FOREIGN KEY (`processed_by`) REFERENCES `coaches` (`coach_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leave_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leave_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tournaments`
--
ALTER TABLE `tournaments`
  ADD CONSTRAINT `fk_tournament_sponsor` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors` (`sponsor_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tournament_leave_requests`
--
ALTER TABLE `tournament_leave_requests`
  ADD CONSTRAINT `fk_tlr_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`coach_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tlr_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tlr_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tlr_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tournament_teams`
--
ALTER TABLE `tournament_teams`
  ADD CONSTRAINT `fk_tt_admin` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tt_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tt_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tournament_update_requests`
--
ALTER TABLE `tournament_update_requests`
  ADD CONSTRAINT `fk_tur_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tur_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tur_sponsor` FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors` (`sponsor_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tur_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
