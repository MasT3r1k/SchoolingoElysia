-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Počítač: 127.0.0.1
-- Vytvořeno: Úte 24. bře 2026, 23:58
-- Verze serveru: 12.0.2-MariaDB
-- Verze PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databáze: `schoolingo_old`
--

-- --------------------------------------------------------

--
-- Struktura tabulky `absence`
--

CREATE TABLE `absence` (
  `student_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `minutes` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `absence`
--

INSERT INTO `absence` (`student_id`, `lesson_id`, `type`, `minutes`, `reason`, `note`) VALUES
(1, 16, 0, NULL, NULL, NULL),
(1, 50, 0, NULL, NULL, NULL),
(1, 51, 3, NULL, NULL, NULL),
(1, 58, 0, NULL, NULL, NULL),
(1, 59, 1, NULL, NULL, NULL),
(1, 113, 0, 0, '', ''),
(1, 126, 2, 0, 'family', ''),
(1, 141, 0, 0, '', ''),
(1, 152, 0, 0, '', ''),
(1, 155, 1, 0, 'family', ''),
(1, 160, 1, 0, 'family', NULL),
(1, 161, 1, 0, 'family', NULL),
(1, 162, 1, 0, 'family', NULL),
(1, 163, 1, NULL, 'family', NULL),
(1, 196, 1, NULL, 'family', NULL),
(1, 197, 1, NULL, 'family', NULL),
(1, 198, 1, NULL, 'family', NULL),
(1, 199, 1, NULL, 'family', NULL),
(1, 200, 1, NULL, 'family', NULL),
(1, 201, 1, NULL, 'family', NULL),
(1, 224, 1, NULL, 'family', NULL),
(1, 225, 1, NULL, 'family', NULL),
(1, 226, 1, NULL, 'family', NULL),
(1, 227, 1, NULL, 'family', NULL),
(24, 1, 0, NULL, NULL, NULL),
(24, 4, 0, NULL, NULL, NULL),
(24, 6, 0, NULL, NULL, NULL),
(24, 21, 0, NULL, NULL, NULL),
(24, 27, 0, NULL, NULL, NULL),
(24, 46, 0, NULL, NULL, NULL),
(24, 108, 4, 5, 'connection', ''),
(24, 113, 0, 0, '', ''),
(24, 126, 1, 0, 'family', ''),
(24, 141, 0, 0, '', ''),
(24, 158, 0, 0, '', ''),
(24, 164, 5, 6, 'connection', ''),
(24, 165, 0, 6, 'connection', ''),
(25, 7, 1, NULL, NULL, NULL),
(25, 14, 0, NULL, NULL, NULL),
(25, 16, 0, NULL, NULL, NULL),
(25, 21, 0, NULL, NULL, NULL),
(25, 27, 0, NULL, NULL, NULL),
(25, 46, 0, NULL, NULL, NULL),
(25, 108, 1, 0, 'family', ''),
(25, 113, 0, 0, '', ''),
(25, 114, 1, 0, 'doctor', ''),
(26, 2, 0, NULL, NULL, NULL),
(26, 113, 0, 0, '', ''),
(28, 1, 0, NULL, NULL, NULL),
(28, 46, 2, NULL, NULL, NULL),
(29, 14, 0, NULL, NULL, NULL),
(29, 16, 0, NULL, NULL, NULL),
(29, 46, 2, NULL, NULL, NULL),
(30, 4, 0, NULL, NULL, NULL),
(30, 6, 0, NULL, NULL, NULL),
(30, 46, 3, NULL, NULL, NULL),
(31, 2, 0, NULL, NULL, NULL),
(31, 7, 0, NULL, NULL, NULL),
(31, 8, 0, NULL, NULL, NULL),
(32, 21, 0, NULL, NULL, NULL),
(32, 27, 0, NULL, NULL, NULL),
(32, 46, 3, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `addresses`
--

CREATE TABLE `addresses` (
  `address_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `street` text NOT NULL,
  `house_number` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `addresses`
--

INSERT INTO `addresses` (`address_id`, `city_id`, `street`, `house_number`) VALUES
(1, 4, 'Újezd', ''),
(2, 4, 'Pražská', '155');

-- --------------------------------------------------------

--
-- Struktura tabulky `analytics_visits`
--

CREATE TABLE `analytics_visits` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `visitor_id` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `path` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `duration` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `auditlog`
--

CREATE TABLE `auditlog` (
  `audit_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}',
  `ip` text DEFAULT NULL,
  `created` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `auditlog`
--

INSERT INTO `auditlog` (`audit_id`, `user_id`, `type`, `data`, `ip`, `created`) VALUES
(1, 4, 'reset_password', '{}', NULL, '2025-11-22 21:54:37.232317'),
(2, 4, 'reset_password', '{}', NULL, '2025-12-05 18:16:51.909789'),
(3, 4, 'reset_password', '{}', NULL, '2025-12-05 18:16:52.666279'),
(4, 4, 'reset_password', '{}', NULL, '2025-12-05 18:16:52.821404'),
(5, 4, 'reset_password', '{}', NULL, '2025-12-05 18:17:03.428366'),
(6, 4, 'reset_password', '{}', NULL, '2025-12-07 18:00:49.025993'),
(7, 4, 'reset_password', '{}', NULL, '2025-12-07 18:17:55.796988'),
(8, 4, 'reset_password', '{}', NULL, '2025-12-07 18:17:59.635514'),
(9, 4, 'reset_password', '{}', NULL, '2025-12-07 18:18:25.145694'),
(10, 4, 'reset_password', '{}', NULL, '2025-12-07 18:20:29.677143'),
(14, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-18_14-41-45.sql\",\"size\":1898932,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"936662093027668945e9edc8034ead6d16f53739\"}', NULL, '2026-02-18 15:41:46.846161'),
(15, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-20_14-04-54.sql\",\"size\":2124957,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"33bd79f671d2dcfa9999632864de10f168cbbb9f\"}', NULL, '2026-02-20 15:04:55.778269'),
(16, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-21_17-35-23.sql\",\"size\":2442133,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"33bd79f671d2dcfa9999632864de10f168cbbb9f\"}', NULL, '2026-02-21 18:35:23.870364'),
(17, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-22_17-40-48.sql\",\"size\":2706598,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"4a264d158cfacc8a6f806389108a57934453b241\"}', NULL, '2026-02-22 18:40:49.257016'),
(18, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-23_18-35-28.sql\",\"size\":2811494,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"931059f623c07e239406f404941a069fc738ff4a\"}', NULL, '2026-02-23 19:35:30.199516'),
(19, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_18-42-00.sql\",\"size\":2861904,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 19:42:01.023015'),
(20, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-02.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:06.666361'),
(21, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-02.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:06.669572'),
(22, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-02.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.501827'),
(23, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-02.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.502740'),
(24, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-02.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.503844'),
(25, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-02.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.522339'),
(26, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.595109'),
(27, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.609167'),
(28, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.614008'),
(29, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.617999'),
(30, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.620093'),
(31, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.620672'),
(32, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.621210'),
(33, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.621680'),
(34, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.622098'),
(35, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.623708'),
(36, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.627675'),
(37, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.636727'),
(38, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.639025'),
(39, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-24_21-07-03.sql\",\"size\":2922308,\"description\":\"Scheduled automatic backup\",\"commitHash\":\"fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf\"}', NULL, '2026-02-24 22:07:07.653430'),
(40, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-25_23-53-01.sql\",\"size\":3056784,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"68bc5cba9bd366134389523f74100d9be1e59726\"}', NULL, '2026-02-26 00:53:02.194890'),
(41, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-27_00-08-42.sql\",\"size\":3234685,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"3d2a5b502bfd2c78c619f33aca88beaf133aaad6\"}', NULL, '2026-02-27 01:08:43.873138'),
(42, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-02-28_06-06-33.sql\",\"size\":3284551,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"2e3df885e266b6a05d39983bb5140689ad534f49\"}', NULL, '2026-02-28 07:06:34.602634'),
(43, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-01_07-20-41.sql\",\"size\":3557022,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"c62138f938220987a502b8b66643b5cc96bba714\"}', NULL, '2026-03-01 08:20:42.886939'),
(44, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-02_18-33-31.sql\",\"size\":3854477,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"abb062ba5b6e9424dcfedf04f2cd2d1c352a00d7\"}', NULL, '2026-03-02 19:33:32.465758'),
(45, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-04_15-41-33.sql\",\"size\":4466258,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"22c0b0c6b568259aa05977547fb6ee39f2f9acfd\"}', NULL, '2026-03-04 16:41:34.555714'),
(46, 4, 'activated_2FA', '{}', NULL, '2026-03-04 21:48:37.914911'),
(47, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-05_21-57-02.sql\",\"size\":4705548,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"3fc02fe8402844acc87b61daf111e49625781968\"}', NULL, '2026-03-05 22:57:03.560656'),
(48, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-07_09-29-10.sql\",\"size\":4817785,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"aac2070b08e2ef94a5d80d3d96a69b365c1e1d7e\"}', NULL, '2026-03-07 10:29:11.590510'),
(49, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-08_14-52-11.sql\",\"size\":4989741,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"c705c40f4a8f8080566c24d08d2ce8763f314bb0\"}', NULL, '2026-03-08 15:52:13.338607'),
(50, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-09_19-05-37.sql\",\"size\":5086556,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"c705c40f4a8f8080566c24d08d2ce8763f314bb0\"}', NULL, '2026-03-09 20:05:38.304124'),
(51, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-10_20-27-11.sql\",\"size\":5201303,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"2c3c8c4b428b4fe612bddf648f63e70e8eec262e\"}', NULL, '2026-03-10 21:27:12.657841'),
(52, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-11_20-27-32.sql\",\"size\":5378251,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"2c3c8c4b428b4fe612bddf648f63e70e8eec262e\"}', NULL, '2026-03-11 21:27:33.705665'),
(53, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-12_20-29-14.sql\",\"size\":5465342,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"2c3c8c4b428b4fe612bddf648f63e70e8eec262e\"}', NULL, '2026-03-12 21:29:16.020763'),
(54, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-13_22-08-35.sql\",\"size\":5576373,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"2c3c8c4b428b4fe612bddf648f63e70e8eec262e\"}', NULL, '2026-03-13 23:08:36.718864'),
(55, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-15_08-43-57.sql\",\"size\":5704524,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"834cb899f375fbbe6029a1fd23df65e003a467d8\"}', NULL, '2026-03-15 09:43:58.983761'),
(56, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-17_18-09-34.sql\",\"size\":6171364,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"d6fecd6f3dc082e846757919f5981a43a4fd41d8\"}', NULL, '2026-03-17 19:09:35.419319'),
(57, 1, 'reset_password', '{}', NULL, '2026-03-17 22:19:07.886001'),
(58, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-18_22-09-29.sql\",\"size\":6318753,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"d6fecd6f3dc082e846757919f5981a43a4fd41d8\"}', NULL, '2026-03-18 23:09:32.528657'),
(59, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-22_09-08-50.sql\",\"size\":298471,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"46c1d44f9c605e96488573cadad590dde62b4e22\"}', NULL, '2026-03-22 10:08:52.216952'),
(60, NULL, 'backup_created', '{\"action\":\"database_backup\",\"filename\":\"schoolingo_backup_2026-03-24_19-10-27.sql\",\"size\":379661,\"description\":\"Scheduled automatic backup (Startup check)\",\"commitHash\":\"46c1d44f9c605e96488573cadad590dde62b4e22\"}', NULL, '2026-03-24 20:10:28.618355');

-- --------------------------------------------------------

--
-- Struktura tabulky `avatar_history`
--

CREATE TABLE `avatar_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `avatar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`avatar`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `avatar_history`
--

INSERT INTO `avatar_history` (`id`, `user_id`, `avatar`, `created_at`) VALUES
(1, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"gs0lz\",\"rotate\":275,\"eyes\":\"variant9W12\",\"eyesColor\":\"3c2005\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:15:15'),
(2, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"gs0lz\",\"rotate\":275,\"eyes\":\"variant9W12\",\"eyesColor\":\"3c2005\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:17:49'),
(3, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"gs0lz\",\"rotate\":275,\"eyes\":\"variant9W12\",\"eyesColor\":\"3c2005\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant4\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:17:49'),
(4, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"3rabi\",\"rotate\":99,\"eyes\":\"variant2W16\",\"eyesColor\":\"22c55e\",\"face\":\"variant4\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"0a5b83\"}', '2026-03-13 23:20:50'),
(9, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9gvmdm\",\"rotate\":58,\"eyes\":\"variant7W12\",\"eyesColor\":\"243c5a\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"f88c49\"}', '2026-03-13 23:20:53'),
(10, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"w7je3o\",\"rotate\":254,\"eyes\":\"variant8W10\",\"eyesColor\":\"243c5a\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant4\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:20:55'),
(12, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"s9w7ym\",\"rotate\":115,\"eyes\":\"variant8W14\",\"eyesColor\":\"ffffff\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:20:56'),
(13, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"rnr4i\",\"rotate\":19,\"eyes\":\"variant6W10\",\"eyesColor\":\"243c5a\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant4\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:20:57'),
(14, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"fegoxm\",\"rotate\":105,\"eyes\":\"variant3W14\",\"eyesColor\":\"22c55e\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"69d2e7\"}', '2026-03-13 23:20:58'),
(15, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"rxto56\",\"rotate\":129,\"eyes\":\"variant3W14\",\"eyesColor\":\"ffffff\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant4\",\"mouthColor\":\"000000\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:20:58'),
(16, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"szywad\",\"rotate\":262,\"eyes\":\"variant9W10\",\"eyesColor\":\"243c5a\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"0a5b83\"}', '2026-03-13 23:20:59'),
(17, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"x0sjn3\",\"rotate\":262,\"eyes\":\"variant1W12\",\"eyesColor\":\"000000\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant5\",\"mouthColor\":\"000000\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"f88c49\"}', '2026-03-13 23:21:00'),
(18, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"kc4658\",\"rotate\":70,\"eyes\":\"variant7W16\",\"eyesColor\":\"243c5a\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"000000\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:21:00'),
(19, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9y7zt\",\"rotate\":72,\"eyes\":\"variant1W16\",\"eyesColor\":\"243c5a\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:21:01'),
(20, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9o35qb\",\"rotate\":283,\"eyes\":\"variant5W16\",\"eyesColor\":\"000000\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:21:02'),
(22, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"3iw0gf\",\"rotate\":246,\"eyes\":\"variant9W10\",\"eyesColor\":\"22c55e\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"69d2e7\"}', '2026-03-13 23:21:03'),
(23, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"j5xry8\",\"rotate\":214,\"eyes\":\"variant8W10\",\"eyesColor\":\"3c2005\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant5\",\"mouthColor\":\"000000\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:21:05'),
(24, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"sz3hel\",\"rotate\":171,\"eyes\":\"variant6W16\",\"eyesColor\":\"000000\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"000000\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"f1f4dc\"}', '2026-03-13 23:21:07'),
(25, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"bk5bw\",\"rotate\":60,\"eyes\":\"variant2W16\",\"eyesColor\":\"eab308\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"1c799f\"}', '2026-03-13 23:21:08'),
(26, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"o595h\",\"rotate\":141,\"eyes\":\"variant6W14\",\"eyesColor\":\"22c55e\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant5\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:21:09'),
(27, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"zrypo\",\"rotate\":173,\"eyes\":\"variant5W12\",\"eyesColor\":\"ef4444\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"69d2e7\"}', '2026-03-13 23:21:09'),
(28, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"l07uro\",\"rotate\":44,\"eyes\":\"variant3W14\",\"eyesColor\":\"3c2005\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"69d2e7\"}', '2026-03-13 23:21:10'),
(29, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"us8rt\",\"rotate\":359,\"eyes\":\"variant3W14\",\"eyesColor\":\"ef4444\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"000000\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"0a5b83\"}', '2026-03-13 23:21:12'),
(30, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"rtcjjq\",\"rotate\":234,\"eyes\":\"variant5W12\",\"eyesColor\":\"ffffff\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"f88c49\"}', '2026-03-13 23:21:13'),
(31, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"i6n5fi\",\"rotate\":173,\"eyes\":\"variant4W16\",\"eyesColor\":\"243c5a\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"1c799f\"}', '2026-03-13 23:21:14'),
(32, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"os1urw\",\"rotate\":266,\"eyes\":\"variant3W16\",\"eyesColor\":\"000000\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"000000\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"0a5b83\"}', '2026-03-13 23:21:14'),
(33, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"7ulqdo\",\"rotate\":109,\"eyes\":\"variant1W16\",\"eyesColor\":\"243c5a\",\"face\":\"variant2\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"000000\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"0a5b83\"}', '2026-03-13 23:21:15'),
(34, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"w1co6n\",\"rotate\":30,\"eyes\":\"variant3W10\",\"eyesColor\":\"000000\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant1\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:21:19'),
(35, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"jzfqv4\",\"rotate\":252,\"eyes\":\"variant3W14\",\"eyesColor\":\"000000\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:21:21'),
(36, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"w4yosb\",\"rotate\":298,\"eyes\":\"variant5W12\",\"eyesColor\":\"3c2005\",\"face\":\"variant4\",\"shapeOffsetX\":15,\"mouth\":\"variant1\",\"mouthColor\":\"ef4444\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"transparent\"}', '2026-03-13 23:21:22'),
(37, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"svxzxw\",\"rotate\":286,\"eyes\":\"variant5W12\",\"eyesColor\":\"ffffff\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant4\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"0a5b83\"}', '2026-03-13 23:21:24'),
(38, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"0umrmd\",\"rotate\":355,\"eyes\":\"variant6W10\",\"eyesColor\":\"eab308\",\"face\":\"variant3\",\"shapeOffsetX\":15,\"mouth\":\"variant1\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"d8b08d\",\"backgroundColor\":\"1c799f\"}', '2026-03-13 23:21:24'),
(39, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"yyvrh\",\"rotate\":332,\"eyes\":\"variant5W10\",\"eyesColor\":\"22c55e\",\"face\":\"variant4\",\"shapeOffsetX\":15,\"mouth\":\"variant3\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"f88c49\"}', '2026-03-13 23:21:25'),
(40, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"uu9v2\",\"rotate\":226,\"eyes\":\"variant7W12\",\"eyesColor\":\"eab308\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"000000\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"f88c49\"}', '2026-03-13 23:21:26'),
(41, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"79j2kc\",\"rotate\":251,\"eyes\":\"variant2W10\",\"eyesColor\":\"ef4444\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant4\",\"mouthColor\":\"000000\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"1c799f\"}', '2026-03-13 23:21:26'),
(42, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"l1h2um\",\"rotate\":291,\"eyes\":\"variant6W12\",\"eyesColor\":\"ef4444\",\"face\":\"variant1\",\"shapeOffsetX\":15,\"mouth\":\"variant2\",\"mouthColor\":\"000000\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"1c799f\"}', '2026-03-13 23:21:29'),
(43, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"21vjyk\",\"rotate\":253,\"eyes\":\"variant2W14\",\"eyesColor\":\"000000\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant5\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"69d2e7\"}', '2026-03-13 23:21:35'),
(45, 1, '{\"type\":\"thumbs\",\"seed\":\"26yt70\",\"radius\":50,\"rotate\":247,\"eyes\":\"variant5W14\",\"eyesColor\":\"eab308\",\"face\":\"variant3\",\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"f3cfbb\",\"backgroundColor\":\"0a5b83\",\"faceOffsetX\":-14}', '2026-03-14 21:06:05'),
(46, 1, '{\"type\":\"thumbs\",\"seed\":\"26yt70\",\"radius\":50,\"rotate\":341,\"eyes\":\"variant6W14\",\"eyesColor\":\"3c2005\",\"face\":\"variant5\",\"faceOffsetX\":0,\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"1c799f\"}', '2026-03-14 21:18:24'),
(47, 1, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"26yt70\",\"rotate\":341,\"eyes\":\"variant6W14\",\"eyesColor\":\"3c2005\",\"face\":\"variant5\",\"faceOffsetX\":0,\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"1c799f\"}', '2026-03-15 09:46:32'),
(48, 4, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"21vjyk\",\"rotate\":358,\"eyes\":\"variant2W14\",\"eyesColor\":\"000000\",\"face\":\"variant5\",\"shapeOffsetX\":15,\"mouth\":\"variant5\",\"mouthColor\":\"f472b6\",\"shapeColor\":\"8d5524\",\"backgroundColor\":\"69d2e7\"}', '2026-03-15 10:00:04'),
(49, 4, '{\"type\":\"thumbs\",\"seed\":\"jszgw3\",\"radius\":50,\"rotate\":37,\"eyes\":\"variant4W10\",\"eyesColor\":\"000000\",\"face\":\"variant2\",\"mouth\":\"variant2\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"transparent\",\"faceOffsetX\":-13}', '2026-03-15 10:00:45'),
(51, 2, '{\"type\":\"avataaarsNeutral\",\"seed\":\"fvaw30\",\"radius\":50,\"rotate\":146,\"faceOffsetX\":11}', '2026-03-18 15:20:08'),
(52, 2, '{\"type\":\"avataaarsNeutral\",\"seed\":\"9jjrig\",\"radius\":50,\"rotate\":99,\"faceOffsetX\":11}', '2026-03-18 15:20:09'),
(53, 2, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9jjrig\",\"rotate\":99,\"faceOffsetX\":11,\"eyes\":\"variant1W12\"}', '2026-03-18 15:24:51'),
(54, 2, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9jjrig\",\"rotate\":37,\"faceOffsetX\":15,\"eyes\":\"variant1W12\",\"eyesColor\":\"000000\",\"backgroundColor\":\"transparent\"}', '2026-03-18 15:25:16');

-- --------------------------------------------------------

--
-- Struktura tabulky `backups`
--

CREATE TABLE `backups` (
  `backup_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `size` bigint(20) NOT NULL,
  `type` enum('auto','manual') NOT NULL,
  `status` enum('success','failed') NOT NULL,
  `created` timestamp NULL DEFAULT current_timestamp(),
  `commit_hash` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `backups`
--

INSERT INTO `backups` (`backup_id`, `filename`, `size`, `type`, `status`, `created`, `commit_hash`) VALUES
(1, 'schoolingo_backup_2026-02-14_16-36-28.sql', 1696070, 'auto', 'success', '2026-02-14 16:36:29', NULL),
(2, 'schoolingo_backup_2026-02-14_17-04-33.sql', 1697045, 'manual', 'success', '2026-02-14 17:04:34', NULL),
(3, 'schoolingo_backup_2026-02-16_17-34-16.sql', 1841613, 'auto', 'success', '2026-02-16 17:34:17', 'c5f358fa398629cb82a994ff3eed7a10504eb442'),
(4, 'schoolingo_backup_2026-02-18_14-41-45.sql', 1898932, 'auto', 'success', '2026-02-18 14:41:46', '936662093027668945e9edc8034ead6d16f53739'),
(10, 'schoolingo_backup_2026-02-20_14-04-54.sql', 2124957, 'auto', 'success', '2026-02-20 14:04:55', '33bd79f671d2dcfa9999632864de10f168cbbb9f'),
(11, 'schoolingo_backup_2026-02-21_17-35-23.sql', 2442133, 'auto', 'success', '2026-02-21 17:35:23', '33bd79f671d2dcfa9999632864de10f168cbbb9f'),
(12, 'schoolingo_backup_2026-02-22_17-40-48.sql', 2706598, 'auto', 'success', '2026-02-22 17:40:49', '4a264d158cfacc8a6f806389108a57934453b241'),
(13, 'schoolingo_backup_2026-02-23_18-35-28.sql', 2811494, 'auto', 'success', '2026-02-23 18:35:30', '931059f623c07e239406f404941a069fc738ff4a'),
(14, 'schoolingo_backup_2026-02-24_18-42-00.sql', 2861904, 'auto', 'success', '2026-02-24 18:42:01', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(15, 'schoolingo_backup_2026-02-24_21-07-02.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:06', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(16, 'schoolingo_backup_2026-02-24_21-07-02.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:06', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(17, 'schoolingo_backup_2026-02-24_21-07-02.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(18, 'schoolingo_backup_2026-02-24_21-07-02.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(19, 'schoolingo_backup_2026-02-24_21-07-02.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(20, 'schoolingo_backup_2026-02-24_21-07-02.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(21, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(22, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(23, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(24, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(25, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(26, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(27, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(28, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(29, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(30, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(31, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(32, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(33, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(34, 'schoolingo_backup_2026-02-24_21-07-03.sql', 2922308, 'auto', 'success', '2026-02-24 21:07:07', 'fcc0bf9bc5ea82d9fbce175bcf8ff330bbe384cf'),
(35, 'schoolingo_backup_2026-02-25_23-53-01.sql', 3056784, 'auto', 'success', '2026-02-25 23:53:02', '68bc5cba9bd366134389523f74100d9be1e59726'),
(36, 'schoolingo_backup_2026-02-27_00-08-42.sql', 3234685, 'auto', 'success', '2026-02-27 00:08:43', '3d2a5b502bfd2c78c619f33aca88beaf133aaad6'),
(37, 'schoolingo_backup_2026-02-28_06-06-33.sql', 3284551, 'auto', 'success', '2026-02-28 06:06:34', '2e3df885e266b6a05d39983bb5140689ad534f49'),
(38, 'schoolingo_backup_2026-03-01_07-20-41.sql', 3557022, 'auto', 'success', '2026-03-01 07:20:42', 'c62138f938220987a502b8b66643b5cc96bba714'),
(39, 'schoolingo_backup_2026-03-02_18-33-31.sql', 3854477, 'auto', 'success', '2026-03-02 18:33:32', 'abb062ba5b6e9424dcfedf04f2cd2d1c352a00d7'),
(40, 'schoolingo_backup_2026-03-04_15-41-33.sql', 4466258, 'auto', 'success', '2026-03-04 15:41:34', '22c0b0c6b568259aa05977547fb6ee39f2f9acfd'),
(41, 'schoolingo_backup_2026-03-05_21-57-02.sql', 4705548, 'auto', 'success', '2026-03-05 21:57:03', '3fc02fe8402844acc87b61daf111e49625781968'),
(42, 'schoolingo_backup_2026-03-07_09-29-10.sql', 4817785, 'auto', 'success', '2026-03-07 09:29:11', 'aac2070b08e2ef94a5d80d3d96a69b365c1e1d7e'),
(43, 'schoolingo_backup_2026-03-08_14-52-11.sql', 4989741, 'auto', 'success', '2026-03-08 14:52:13', 'c705c40f4a8f8080566c24d08d2ce8763f314bb0'),
(44, 'schoolingo_backup_2026-03-09_19-05-37.sql', 5086556, 'auto', 'success', '2026-03-09 19:05:38', 'c705c40f4a8f8080566c24d08d2ce8763f314bb0'),
(45, 'schoolingo_backup_2026-03-10_20-27-11.sql', 5201303, 'auto', 'success', '2026-03-10 20:27:12', '2c3c8c4b428b4fe612bddf648f63e70e8eec262e'),
(46, 'schoolingo_backup_2026-03-11_20-27-32.sql', 5378251, 'auto', 'success', '2026-03-11 20:27:33', '2c3c8c4b428b4fe612bddf648f63e70e8eec262e'),
(47, 'schoolingo_backup_2026-03-12_20-29-14.sql', 5465342, 'auto', 'success', '2026-03-12 20:29:16', '2c3c8c4b428b4fe612bddf648f63e70e8eec262e'),
(48, 'schoolingo_backup_2026-03-13_22-08-35.sql', 5576373, 'auto', 'success', '2026-03-13 22:08:36', '2c3c8c4b428b4fe612bddf648f63e70e8eec262e'),
(49, 'schoolingo_backup_2026-03-15_08-43-57.sql', 5704524, 'auto', 'success', '2026-03-15 08:43:58', '834cb899f375fbbe6029a1fd23df65e003a467d8'),
(50, 'schoolingo_backup_2026-03-17_18-09-34.sql', 6171364, 'auto', 'success', '2026-03-17 18:09:35', 'd6fecd6f3dc082e846757919f5981a43a4fd41d8'),
(51, 'schoolingo_backup_2026-03-18_22-09-29.sql', 6318753, 'auto', 'success', '2026-03-18 22:09:32', 'd6fecd6f3dc082e846757919f5981a43a4fd41d8'),
(52, 'schoolingo_backup_2026-03-22_09-08-50.sql', 298471, 'auto', 'success', '2026-03-22 09:08:52', '46c1d44f9c605e96488573cadad590dde62b4e22'),
(53, 'schoolingo_backup_2026-03-24_19-10-27.sql', 379661, 'auto', 'success', '2026-03-24 19:10:28', '46c1d44f9c605e96488573cadad590dde62b4e22');

-- --------------------------------------------------------

--
-- Struktura tabulky `buildings`
--

CREATE TABLE `buildings` (
  `building_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `type` enum('school','canteen','workshop','other') NOT NULL DEFAULT 'school',
  `school_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `buildings`
--

INSERT INTO `buildings` (`building_id`, `name`, `type`, `school_id`) VALUES
(1, 'Hlavní budova', 'school', 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `building_exits`
--

CREATE TABLE `building_exits` (
  `be_id` int(11) NOT NULL,
  `floor_id` int(11) NOT NULL,
  `type` enum('main','emergency') NOT NULL DEFAULT 'main',
  `pos_x` int(11) NOT NULL,
  `pos_y` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `building_floors`
--

CREATE TABLE `building_floors` (
  `bf_id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `floor_plan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `building_floors`
--

INSERT INTO `building_floors` (`bf_id`, `building_id`, `level`, `floor_plan`) VALUES
(1, 1, 1, NULL),
(2, 1, 2, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `building_rooms`
--

CREATE TABLE `building_rooms` (
  `room_id` int(11) NOT NULL,
  `floor_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL DEFAULT 'classroom',
  `description` text DEFAULT NULL,
  `manager_id` int(11) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 1,
  `pos_x` int(11) NOT NULL,
  `pos_y` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `building_rooms`
--

INSERT INTO `building_rooms` (`room_id`, `floor_id`, `name`, `type`, `description`, `manager_id`, `capacity`, `pos_x`, `pos_y`) VALUES
(1, 1, '107', 'classroom', 'Třída Kouďové', 15, 30, 1, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `building_rooms_occupancy`
--

CREATE TABLE `building_rooms_occupancy` (
  `bro_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `channel_messages`
--

CREATE TABLE `channel_messages` (
  `message_id` int(11) NOT NULL,
  `channel_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `type` enum('text','homework','poll','file','document') DEFAULT 'text',
  `reply_to` int(11) DEFAULT NULL,
  `edited` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `cities`
--

CREATE TABLE `cities` (
  `city_id` int(11) NOT NULL,
  `city_name` text NOT NULL,
  `country_id` int(11) NOT NULL,
  `postcode` varchar(12) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `cities`
--

INSERT INTO `cities` (`city_id`, `city_name`, `country_id`, `postcode`) VALUES
(1, 'Prostějov', 60, '796 01'),
(2, '', 1, '796 01'),
(3, 'Praha', 1, '796 01'),
(4, 'Praha', 60, '796 01');

-- --------------------------------------------------------

--
-- Struktura tabulky `classbook`
--

CREATE TABLE `classbook` (
  `classbook_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `day_hour` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `group_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `topic` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `internal_note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `classbook`
--

INSERT INTO `classbook` (`classbook_id`, `date`, `day_hour`, `subject_id`, `teacher_id`, `group_id`, `room_id`, `topic`, `note`, `internal_note`) VALUES
(1, '2024-10-18', 2, 11, 2, 4, NULL, 'Zkouška systému', 'Ahoj, já jsem poznámka', 'A já jsem zase interní poznámka'),
(2, '2024-10-22', 3, 11, 2, 4, 1, 'Druhá zkušební hodina', 'Jsem poznámka druhé zkušební hodiny\n\nA co ty?', ''),
(3, '2024-01-12', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(4, '2024-01-18', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(5, '2024-01-12', 1, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(6, '2024-01-18', 3, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(7, '2024-01-04', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(8, '2024-01-04', 3, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(9, '2024-01-19', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(10, '2024-01-15', 4, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(11, '2024-01-15', 5, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(12, '2024-01-19', 1, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(13, '2024-01-25', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(14, '2024-01-26', 0, 31, 2, 4, 1, NULL, NULL, NULL),
(15, '2024-01-25', 3, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(16, '2024-01-26', 1, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(17, '2024-01-29', 4, 32, 2, 2, 1, NULL, NULL, NULL),
(18, '2024-01-22', 4, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(19, '2023-12-01', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(20, '2023-11-30', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(21, '2024-02-02', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(22, '2024-01-05', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(23, '2024-05-03', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(24, '2024-02-01', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(25, '2024-01-29', 5, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(26, '2024-02-29', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(27, '2024-02-02', 1, 31, 2, 4, 1, 'HELLO!', NULL, NULL),
(28, '2024-02-19', 4, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(29, '2024-02-23', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(30, '2024-02-16', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(31, '2024-03-04', 4, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(32, '2024-03-01', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(33, '2024-02-05', 4, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(34, '2024-02-12', 4, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(35, '2024-02-15', 2, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(36, '2024-02-16', 1, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(37, '2024-02-09', 0, NULL, NULL, 4, NULL, NULL, NULL, NULL),
(38, '2024-02-05', 5, NULL, NULL, 2, NULL, NULL, NULL, NULL),
(39, '2024-02-08', 2, 11, 2, 4, NULL, NULL, NULL, NULL),
(40, '2024-02-08', 3, 11, 2, 4, NULL, NULL, NULL, NULL),
(41, '2024-02-09', 1, 31, 2, 4, NULL, NULL, NULL, NULL),
(42, '2024-02-23', 1, 31, 2, 4, NULL, NULL, NULL, NULL),
(43, '2024-02-12', 5, 32, 2, 2, NULL, NULL, NULL, NULL),
(44, '2024-02-22', 2, 11, 2, 4, NULL, NULL, NULL, NULL),
(45, '2024-02-19', 5, 32, 2, 2, NULL, NULL, NULL, NULL),
(46, '2024-03-11', 4, 32, 2, 2, NULL, NULL, NULL, NULL),
(47, '2024-03-15', 0, 31, 2, 4, NULL, NULL, NULL, NULL),
(48, '2024-03-15', 1, 31, 2, 4, 1, NULL, NULL, NULL),
(49, '2024-03-11', 5, 32, 2, 2, NULL, NULL, NULL, NULL),
(50, '2024-03-14', 2, 11, 2, 4, 1, 'Další hodina', NULL, NULL),
(51, '2024-11-12', 2, 31, 2, 10, 1, '2. Další hoidna', NULL, NULL),
(52, '2024-04-04', 2, 11, 2, 4, NULL, NULL, NULL, NULL),
(53, '2024-04-05', 0, 31, 2, 4, NULL, NULL, NULL, NULL),
(54, '2025-02-11', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(55, '2025-02-11', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(56, '2025-02-11', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(57, '2025-02-11', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(58, '2025-02-18', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(59, '2025-02-18', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(60, '2025-02-18', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(61, '2025-02-18', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(62, '2025-02-04', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(63, '2024-09-03', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(64, '2024-09-03', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(65, '2024-09-10', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(66, '2024-09-10', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(67, '2024-09-17', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(68, '2024-09-17', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(69, '2024-09-03', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(70, '2024-09-03', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(71, '2025-01-21', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(72, '2025-01-21', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(73, '2025-01-28', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(74, '2025-02-17', 2, 35, 2, 10, NULL, NULL, NULL, NULL),
(75, '2025-02-19', 1, 35, 2, 10, NULL, NULL, NULL, NULL),
(76, '2025-02-04', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(77, '2025-05-20', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(78, '2025-02-25', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(79, '2025-06-17', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(80, '2025-02-25', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(81, '2025-02-25', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(82, '2025-02-25', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(83, '2025-07-22', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(84, '2025-07-22', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(85, '2025-07-22', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(86, '2025-10-14', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(87, '2025-10-14', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(88, '2025-05-27', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(89, '2025-05-27', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(90, '2025-02-18', 4, 31, 4, 9, NULL, NULL, NULL, NULL),
(91, '2025-02-26', 2, 35, 2, 10, NULL, NULL, NULL, NULL),
(92, '2025-02-24', 3, 35, 2, 10, NULL, NULL, NULL, NULL),
(93, '2025-02-19', 2, 35, 2, 10, NULL, NULL, NULL, NULL),
(94, '2025-02-17', 3, 35, 2, 10, NULL, NULL, NULL, NULL),
(95, '2025-03-11', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(96, '2025-03-04', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(97, '2025-03-04', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(98, '2025-03-18', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(99, '2025-03-18', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(100, '2025-03-18', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(101, '2025-03-18', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(102, '2025-04-15', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(103, '2025-04-02', 1, 35, 2, 10, NULL, NULL, NULL, NULL),
(104, '2025-04-29', 0, 33, 4, 9, NULL, NULL, NULL, NULL),
(105, '2025-04-29', 1, 33, 4, 9, NULL, NULL, NULL, NULL),
(106, '2025-04-29', 2, 31, 4, 9, NULL, NULL, NULL, NULL),
(107, '2025-04-29', 3, 31, 4, 9, NULL, NULL, NULL, NULL),
(108, '2025-05-14', 1, 35, 2, 10, NULL, NULL, NULL, NULL),
(109, '2025-05-12', 2, 35, 2, 10, NULL, NULL, NULL, NULL),
(110, '2025-05-07', 1, 35, 2, 10, NULL, NULL, NULL, NULL),
(111, '2025-05-05', 2, 35, 2, 10, NULL, NULL, NULL, NULL),
(112, '2025-04-30', 1, 35, 2, 10, NULL, NULL, NULL, NULL),
(113, '2025-04-28', 2, 35, 2, 10, NULL, NULL, NULL, NULL),
(114, '2025-11-18', 2, 32, NULL, 10, NULL, '', '', ''),
(122, '2025-11-18', 0, 6, NULL, 10, NULL, NULL, NULL, NULL),
(123, '2025-11-18', 1, 6, NULL, 10, NULL, NULL, NULL, NULL),
(124, '2025-11-18', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(125, '2025-11-18', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(126, '2025-11-18', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(127, '2025-11-18', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(128, '2025-11-25', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(129, '2025-11-25', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(130, '2025-12-02', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(131, '2025-12-02', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(132, '2025-12-02', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(133, '2025-12-02', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(134, '2025-12-16', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(135, '2026-01-20', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(136, '2026-01-20', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(137, '2026-01-20', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(138, '2026-01-20', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(139, '2026-01-27', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(140, '2026-01-27', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(141, '2026-01-27', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(142, '2026-01-27', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(143, '2026-02-10', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(144, '2026-01-06', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(145, '2026-01-06', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(146, '2026-01-06', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(147, '2026-01-06', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(148, '2026-02-03', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(149, '2026-02-03', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(150, '2026-02-03', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(151, '2026-02-03', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(152, '2026-02-17', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(153, '2026-02-17', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(154, '2026-02-17', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(155, '2026-02-17', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(156, '2026-02-24', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(157, '2026-02-24', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(158, '2026-02-24', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(159, '2026-02-24', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(160, '2026-03-10', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(161, '2026-03-10', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(162, '2026-03-10', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(163, '2026-03-10', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(164, '2026-03-03', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(165, '2026-03-03', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(166, '2026-03-03', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(167, '2026-03-03', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(168, '2026-03-04', 1, 35, NULL, 10, NULL, NULL, NULL, NULL),
(169, '2026-03-02', 3, 6, NULL, 2, NULL, NULL, NULL, NULL),
(170, '2026-03-02', 1, 33, NULL, 2, NULL, NULL, NULL, NULL),
(171, '2026-03-02', 2, 29, NULL, 2, NULL, NULL, NULL, NULL),
(172, '2026-03-02', 4, 7, NULL, 2, NULL, NULL, NULL, NULL),
(173, '2026-03-02', 1, 30, NULL, 9, NULL, NULL, NULL, NULL),
(174, '2026-03-02', 2, 30, NULL, 9, NULL, NULL, NULL, NULL),
(175, '2026-03-02', 6, 29, NULL, 10, NULL, NULL, NULL, NULL),
(176, '2026-03-02', 8, 4, NULL, 10, NULL, NULL, NULL, NULL),
(177, '2026-03-05', 2, 11, NULL, 4, NULL, NULL, NULL, NULL),
(178, '2026-03-05', 3, 11, NULL, 4, NULL, NULL, NULL, NULL),
(179, '2026-03-05', 4, 1, NULL, 4, NULL, NULL, NULL, NULL),
(180, '2026-03-05', 5, 1, NULL, 4, NULL, NULL, NULL, NULL),
(181, '2026-03-05', 7, 2, NULL, 2, NULL, NULL, NULL, NULL),
(182, '2026-03-05', 0, 34, NULL, 5, NULL, NULL, NULL, NULL),
(183, '2026-03-05', 1, 34, NULL, 5, NULL, NULL, NULL, NULL),
(184, '2026-03-05', 0, 6, NULL, 10, NULL, NULL, NULL, NULL),
(185, '2026-03-05', 1, 10, NULL, 10, NULL, NULL, NULL, NULL),
(186, '2026-03-05', 3, 32, NULL, 9, NULL, NULL, NULL, NULL),
(187, '2026-03-05', 4, 30, NULL, 10, NULL, NULL, NULL, NULL),
(188, '2026-03-05', 6, 12, NULL, 9, NULL, NULL, NULL, NULL),
(189, '2026-03-05', 7, 12, NULL, 9, NULL, NULL, NULL, NULL),
(190, '2026-03-06', 0, 31, NULL, 4, NULL, NULL, NULL, NULL),
(191, '2026-03-06', 1, 31, NULL, 4, NULL, NULL, NULL, NULL),
(192, '2026-03-06', 2, 30, NULL, 4, NULL, NULL, NULL, NULL),
(193, '2026-03-06', 3, 30, NULL, 4, NULL, NULL, NULL, NULL),
(194, '2026-03-06', 4, 12, NULL, 4, NULL, NULL, NULL, NULL),
(195, '2026-03-06', 5, 12, NULL, 4, NULL, NULL, NULL, NULL),
(196, '2026-03-06', 0, 10, NULL, 10, NULL, NULL, NULL, NULL),
(197, '2026-03-06', 1, 2, NULL, 10, NULL, NULL, NULL, NULL),
(198, '2026-03-06', 2, 6, NULL, 10, NULL, NULL, NULL, NULL),
(199, '2026-03-06', 3, 32, NULL, 10, NULL, NULL, NULL, NULL),
(200, '2026-03-06', 4, 34, NULL, 11, NULL, NULL, NULL, NULL),
(201, '2026-03-06', 5, 32, NULL, 11, NULL, NULL, NULL, NULL),
(202, '2026-03-02', 0, 33, NULL, 2, NULL, NULL, NULL, NULL),
(203, '2026-03-02', 5, 29, NULL, 10, NULL, NULL, NULL, NULL),
(204, '2026-03-02', 7, 4, NULL, 10, NULL, NULL, NULL, NULL),
(205, '2026-03-03', 0, 4, NULL, 2, NULL, NULL, NULL, NULL),
(206, '2026-03-03', 1, 30, NULL, 2, NULL, NULL, NULL, NULL),
(207, '2026-03-03', 2, 2, NULL, 2, NULL, NULL, NULL, NULL),
(208, '2026-03-03', 3, 1, NULL, 4, NULL, NULL, NULL, NULL),
(209, '2026-03-03', 4, 6, NULL, 2, NULL, NULL, NULL, NULL),
(210, '2026-03-03', 5, 3, NULL, 4, NULL, NULL, NULL, NULL),
(211, '2026-03-03', 7, 8, NULL, 2, NULL, NULL, NULL, NULL),
(212, '2026-03-03', 4, 7, NULL, 10, NULL, NULL, NULL, NULL),
(213, '2026-03-03', 5, 2, NULL, 10, NULL, NULL, NULL, NULL),
(214, '2026-03-03', 7, 1, NULL, 9, NULL, NULL, NULL, NULL),
(215, '2026-03-03', -1, 30, NULL, 9, NULL, NULL, NULL, NULL),
(216, '2026-03-04', 4, 1, NULL, 9, NULL, NULL, NULL, NULL),
(217, '2026-03-04', 5, 36, NULL, 9, NULL, NULL, NULL, NULL),
(218, '2026-03-04', 0, 6, NULL, 10, NULL, NULL, NULL, NULL),
(219, '2026-03-04', 2, 7, NULL, 10, NULL, NULL, NULL, NULL),
(220, '2026-03-04', 3, 2, NULL, 10, NULL, NULL, NULL, NULL),
(221, '2026-03-11', 1, 35, NULL, 10, NULL, NULL, NULL, NULL),
(222, '2026-02-25', 1, 35, NULL, 10, NULL, NULL, NULL, NULL),
(223, '2026-03-09', 3, 10, NULL, 10, NULL, NULL, NULL, NULL),
(224, '2026-03-10', 7, 1, NULL, 9, NULL, NULL, NULL, NULL),
(225, '2026-03-10', -1, 30, NULL, 9, NULL, NULL, NULL, NULL),
(226, '2026-03-10', 4, 7, NULL, 10, NULL, NULL, NULL, NULL),
(227, '2026-03-10', 5, 2, NULL, 10, NULL, NULL, NULL, NULL),
(228, '2026-03-17', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(229, '2026-03-17', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(230, '2026-03-17', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(231, '2026-03-17', 3, 31, NULL, 9, NULL, NULL, NULL, NULL),
(232, '2026-03-18', 1, 35, NULL, 10, NULL, NULL, NULL, NULL),
(233, '2026-03-24', 0, 33, NULL, 9, NULL, NULL, NULL, NULL),
(234, '2026-03-24', 1, 33, NULL, 9, NULL, NULL, NULL, NULL),
(235, '2026-03-24', 2, 31, NULL, 9, NULL, NULL, NULL, NULL),
(236, '2026-03-24', 3, 31, NULL, 9, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `classbook_notes`
--

CREATE TABLE `classbook_notes` (
  `classbook_note_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `title` text DEFAULT NULL,
  `note` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `classbook_notes`
--

INSERT INTO `classbook_notes` (`classbook_note_id`, `subject_id`, `group_id`, `title`, `note`, `created_at`, `created_by`) VALUES
(1, 33, 9, 'Poznámky pro hodinu 22.11.2025', 'Tuto hodinu si zopakujeme dnešní látku', '2025-11-22 00:00:03', 4),
(2, 33, 9, '', 'A co takhle dát si špenát?', '2025-11-22 00:13:17', 4),
(3, 33, 9, '', 'Test', '2025-11-22 00:15:50', 4),
(4, 33, 9, '', 'Test', '2025-11-22 00:16:46', 4),
(5, 33, 9, '', 'Test', '2025-11-22 00:17:22', 4),
(6, 33, 9, '', 'Test', '2025-11-22 00:18:04', 4),
(7, 33, 9, '', 'Test', '2025-11-22 00:19:06', 4),
(8, 33, 9, '', 'Být stále mlád', '2025-11-22 00:20:29', 4),
(9, 33, 9, '', 'Kokot leo', '2025-11-22 00:20:59', 4);

-- --------------------------------------------------------

--
-- Struktura tabulky `classes`
--

CREATE TABLE `classes` (
  `class_id` int(11) NOT NULL,
  `prefix` text NOT NULL,
  `suffix` text NOT NULL,
  `year_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `classes`
--

INSERT INTO `classes` (`class_id`, `prefix`, `suffix`, `year_id`, `teacher_id`, `room_id`, `scope_id`) VALUES
(1, 'B', '.I', 3, 2, 1, 2);

-- --------------------------------------------------------

--
-- Struktura tabulky `class_service`
--

CREATE TABLE `class_service` (
  `cs_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `class_service`
--

INSERT INTO `class_service` (`cs_id`, `student_id`, `start`, `end`) VALUES
(1, 1, '2025-11-17', '2025-11-21'),
(2, 29, '2024-01-29', '2025-02-06'),
(3, 26, '2024-01-29', '2025-02-06'),
(4, 1, '2024-11-18', '2024-11-24'),
(8, 24, '2026-02-16', '2026-02-22'),
(9, 25, '2026-02-23', '2026-03-01'),
(10, 24, '2026-02-23', '2026-03-01'),
(11, 32, '2026-02-09', '2026-02-15'),
(12, 30, '2026-02-09', '2026-02-15'),
(15, 1, '2026-03-16', '2026-03-22'),
(16, 29, '2026-03-16', '2026-03-22'),
(17, 26, '2026-03-09', '2026-03-15'),
(18, 29, '2026-03-09', '2026-03-15'),
(19, 40, '2026-03-02', '2026-03-08');

-- --------------------------------------------------------

--
-- Struktura tabulky `countries`
--

CREATE TABLE `countries` (
  `country_id` int(11) NOT NULL,
  `nationality` text NOT NULL,
  `code2` varchar(2) NOT NULL,
  `code3` varchar(3) NOT NULL,
  `phone_code` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `countries`
--

INSERT INTO `countries` (`country_id`, `nationality`, `code2`, `code3`, `phone_code`) VALUES
(1, 'Afghánistán', 'AF', 'AFG', 93),
(2, 'Ålandské ostrovy', 'AX', 'ALA', 358),
(3, 'Albánie', 'AL', 'ALB', 355),
(4, 'Alžírsko', 'DZ', 'DZA', 213),
(5, 'Americká Samoa', 'AS', 'ASM', 1),
(6, 'Andorra', 'AD', 'AND', 376),
(7, 'Angola', 'AO', 'AGO', 244),
(8, 'Anguilla', 'AI', 'AIA', 1),
(9, 'Antarktida', 'AQ', 'ATA', 672),
(10, 'Antigua a Barbuda', 'AG', 'ATG', 1),
(11, 'Argentina', 'AR', 'ARG', 54),
(12, 'Arménie', 'AM', 'ARM', 374),
(13, 'Aruba', 'AW', 'ABW', 297),
(14, 'Austrálie', 'AU', 'AUS', 61),
(15, 'Rakousko', 'AT', 'AUT', 43),
(16, 'Ázerbájdžán', 'AZ', 'AZE', 994),
(17, 'Bahamy', 'BS', 'BHS', 1),
(18, 'Bahrajn', 'BH', 'BHR', 973),
(19, 'Bangladéš', 'BD', 'BGD', 880),
(20, 'Barbados', 'BB', 'BRB', 1),
(21, 'Bělorusko', 'BY', 'BLR', 375),
(22, 'Belgie', 'BE', 'BEL', 32),
(23, 'Belize', 'BZ', 'BLZ', 501),
(24, 'Benin', 'BJ', 'BEN', 229),
(25, 'Bermudy', 'BM', 'BMU', 1),
(26, 'Bhútán', 'BT', 'BTN', 975),
(27, 'Bolívie (Mnohonárodnostní stát)', 'BO', 'BOL', 591),
(28, 'Bonaire, Sint Eustatius a Saba', 'BQ', 'BES', 599),
(29, 'Bosna a Hercegovina', 'BA', 'BIH', 387),
(30, 'Botswana', 'BW', 'BWA', 267),
(31, 'Bouvetův ostrov', 'BV', 'BVT', 0),
(32, 'Brazílie', 'BR', 'BRA', 55),
(33, 'Britské území v Indickém oceánu', 'IO', 'IOT', 246),
(34, 'Brunej Darussalam', 'BN', 'BRN', 673),
(35, 'Bulharsko', 'BG', 'BGR', 359),
(36, 'Burkina Faso', 'BF', 'BFA', 226),
(37, 'Burundi', 'BI', 'BDI', 257),
(38, 'Cabo Verde', 'CV', 'CPV', 238),
(39, 'Kambodža', 'KH', 'KHM', 855),
(40, 'Kamerun', 'CM', 'CMR', 237),
(41, 'Kanada', 'CA', 'CAN', 1),
(42, 'Kajmanské ostrovy', 'KY', 'CYM', 1),
(43, 'Středoafrická republika', 'CF', 'CAF', 236),
(44, 'Chad', 'TD', 'TCD', 235),
(45, 'Chile', 'CL', 'CHL', 56),
(46, 'Čína', 'CN', 'CHN', 86),
(47, 'Vánoční ostrov', 'CX', 'CXR', 61),
(48, 'Kokosové ostrovy', 'CC', 'CCK', 61),
(49, 'Kolumbie', 'CO', 'COL', 57),
(50, 'Komory', 'KM', 'COM', 269),
(51, 'Kongo (Republika)', 'CG', 'COG', 242),
(52, 'Kongo (Demokratická republika)', 'CD', 'COD', 242),
(53, 'Cookovy ostrovy', 'CK', 'COK', 682),
(54, 'Kostarika', 'CR', 'CRI', 506),
(55, 'Pobřeží slonoviny', 'CI', 'CIV', 225),
(56, 'Chorvatsko', 'HR', 'HRV', 385),
(57, 'Kuba', 'CU', 'CUB', 53),
(58, 'Curaçao', 'CW', 'CUW', 599),
(59, 'Kypr', 'CY', 'CYP', 357),
(60, 'Česká republika', 'CZ', 'CZE', 420),
(61, 'Dánsko', 'DK', 'DNK', 45),
(62, 'Džibutsko', 'DJ', 'DJI', 253),
(63, 'Dominika', 'DM', 'DMA', 1),
(64, 'Dominikánská republika', 'DO', 'DOM', 1),
(65, 'Ekvádor', 'EC', 'ECU', 593),
(66, 'Egypt', 'EG', 'EGY', 20),
(67, 'Salvador', 'SV', 'SLV', 503),
(68, 'Rovníková Guinea', 'GQ', 'GNQ', 240),
(69, 'Eritrea', 'ER', 'ERI', 291),
(70, 'Estonsko', 'EE', 'EST', 372),
(71, 'Etiopie', 'ET', 'ETH', 251),
(72, 'Falklandy (Malvíny)', 'FK', 'FLK', 500),
(73, 'Faerské ostrovy', 'FO', 'FRO', 298),
(74, 'Fidži', 'FJ', 'FJI', 679),
(75, 'Finsko', 'FI', 'FIN', 358),
(76, 'Francie', 'FR', 'FRA', 33),
(77, 'Francouzská Guyana', 'GF', 'GUF', 594),
(78, 'Francouzská Polynésie', 'PF', 'PYF', 689),
(79, 'Francouzská jižní a antarktická území', 'TF', 'ATF', 260),
(80, 'Gabon', 'GA', 'GAB', 241),
(81, 'Gambie', 'GM', 'GMB', 220),
(82, 'Gruzie', 'GE', 'GEO', 995),
(83, 'Německo', 'DE', 'DEU', 49),
(84, 'Ghana', 'GH', 'GHA', 233),
(85, 'Gibraltar', 'GI', 'GIB', 350),
(86, 'Řecko', 'GR', 'GRC', 30),
(87, 'Grónsko', 'GL', 'GRL', 299),
(88, 'Grenada', 'GD', 'GRD', 1),
(89, 'Guadeloupe', 'GP', 'GLP', 0),
(90, 'Guam', 'GU', 'GUM', 0),
(91, 'Guatemala', 'GT', 'GTM', 0),
(92, 'Guernsey', 'GG', 'GGY', 0),
(93, 'Guinea', 'GN', 'GIN', 0),
(94, 'Guinea-Bissau', 'GW', 'GNB', 0),
(95, 'Guyana', 'GY', 'GUY', 0),
(96, 'Haiti', 'HT', 'HTI', 0),
(97, 'Heardův ostrov a McDonaldovy ostrovy', 'HM', 'HMD', 0),
(98, 'Vatikán', 'VA', 'VAT', 0),
(99, 'Honduras', 'HN', 'HND', 0),
(100, 'Hongkong', 'HK', 'HKG', 0),
(101, 'Maďarsko', 'HU', 'HUN', 0),
(102, 'Island', 'IS', 'ISL', 0),
(103, 'Indie', 'IN', 'IND', 0),
(104, 'Indonésie', 'ID', 'IDN', 0),
(105, 'Írán', 'IR', 'IRN', 0),
(106, 'Irák', 'IQ', 'IRQ', 0),
(107, 'Irsko', 'IE', 'IRL', 0),
(108, 'Ostrov Man', 'IM', 'IMN', 0),
(109, 'Izrael', 'IL', 'ISR', 0),
(110, 'Itálie', 'IT', 'ITA', 0),
(111, 'Jamajka', 'JM', 'JAM', 0),
(112, 'Japonsko', 'JP', 'JPN', 0),
(113, 'Jersey', 'JE', 'JEY', 0),
(114, 'Jordánsko', 'JO', 'JOR', 0),
(115, 'Kazachstán', 'KZ', 'KAZ', 0),
(116, 'Keňa', 'KE', 'KEN', 0),
(117, 'Kiribati', 'KI', 'KIR', 0),
(118, 'Korejská lidově demokratická republika', 'KP', 'PRK', 0),
(119, 'Korejská republika', 'KR', 'KOR', 0),
(120, 'Kuvajt', 'KW', 'KWT', 0),
(121, 'Kyrgyzstán', 'KG', 'KGZ', 0),
(122, 'Laos', 'LA', 'LAO', 0),
(123, 'Lotyšsko', 'LV', 'LVA', 0),
(124, 'Libanon', 'LB', 'LBN', 0),
(125, 'Lesotho', 'LS', 'LSO', 0),
(126, 'Libérie', 'LR', 'LBR', 0),
(127, 'Libye', 'LY', 'LBY', 0),
(128, 'Lichtenštejnsko', 'LI', 'LIE', 0),
(129, 'Litva', 'LT', 'LTU', 0),
(130, 'Lucembursko', 'LU', 'LUX', 0),
(131, 'Macao', 'MO', 'MAC', 0),
(132, 'Severní Makedonie', 'MK', 'MKD', 0),
(133, 'Madagaskar', 'MG', 'MDG', 0),
(134, 'Malawi', 'MW', 'MWI', 0),
(135, 'Malajsie', 'MY', 'MYS', 0),
(136, 'Maledivy', 'MV', 'MDV', 0),
(137, 'Mali', 'ML', 'MLI', 0),
(138, 'Malta', 'MT', 'MLT', 0),
(139, 'Marshallovy ostrovy', 'MH', 'MHL', 0),
(140, 'Martinik', 'MQ', 'MTQ', 0),
(141, 'Mauritánie', 'MR', 'MRT', 0),
(142, 'Mauricius', 'MU', 'MUS', 0),
(143, 'Mayotte', 'YT', 'MYT', 0),
(144, 'Mexiko', 'MX', 'MEX', 0),
(145, 'Mikronésie', 'FM', 'FSM', 0),
(146, 'Moldavsko', 'MD', 'MDA', 0),
(147, 'Monako', 'MC', 'MCO', 0),
(148, 'Mongolsko', 'MN', 'MNG', 0),
(149, 'Černá Hora', 'ME', 'MNE', 382),
(150, 'Montserrat', 'MS', 'MSR', 0),
(151, 'Maroko', 'MA', 'MAR', 0),
(152, 'Mosambik', 'MZ', 'MOZ', 0),
(153, 'Myanmar (Barma)', 'MM', 'MMR', 0),
(154, 'Namibie', 'NA', 'NAM', 0),
(155, 'Nauru', 'NR', 'NRU', 0),
(156, 'Nepál', 'NP', 'NPL', 0),
(157, 'Nizozemsko', 'NL', 'NLD', 0),
(158, 'Nová Kaledonie', 'NC', 'NCL', 0),
(159, 'Nový Zéland', 'NZ', 'NZL', 0),
(160, 'Nikaragua', 'NI', 'NIC', 0),
(161, 'Niger', 'NE', 'NER', 0),
(162, 'Nigérie', 'NG', 'NGA', 0),
(163, 'Niue', 'NU', 'NIU', 0),
(164, 'Norfolk', 'NF', 'NFK', 0),
(165, 'Severní Mariany', 'MP', 'MNP', 0),
(166, 'Norsko', 'NO', 'NOR', 0),
(167, 'Omán', 'OM', 'OMN', 0),
(168, 'Pákistán', 'PK', 'PAK', 0),
(169, 'Palau', 'PW', 'PLW', 0),
(170, 'Stát Palestina', 'PS', 'PSE', 0),
(171, 'Panama', 'PA', 'PAN', 0),
(172, 'Papua Nová Guinea', 'PG', 'PNG', 0),
(173, 'Paraguay', 'PY', 'PRY', 0),
(174, 'Peru', 'PE', 'PER', 0),
(175, 'Filipíny', 'PH', 'PHL', 0),
(176, 'Pitcairnovy ostrovy', 'PN', 'PCN', 0),
(177, 'Polsko', 'PL', 'POL', 0),
(178, 'Portugalsko', 'PT', 'PRT', 0),
(179, 'Portoriko', 'PR', 'PRI', 0),
(180, 'Katar', 'QA', 'QAT', 0),
(181, 'Réunion', 'RE', 'REU', 0),
(182, 'Rumunsko', 'RO', 'ROU', 0),
(183, 'Ruská federace', 'RU', 'RUS', 0),
(184, 'Rwanda', 'RW', 'RWA', 0),
(185, 'Svatý Bartoloměj', 'BL', 'BLM', 0),
(186, 'Svatá Helena, Ascension a Tristan da Cunha', 'SH', 'SHN', 247),
(187, 'Svatý Kryštof a Nevis', 'KN', 'KNA', 0),
(188, 'Svatá Lucie', 'LC', 'LCA', 0),
(189, 'Svatý Martin (francouzská část)', 'MF', 'MAF', 0),
(190, 'Svatý Pierre a Miquelon', 'PM', 'SPM', 0),
(191, 'Svatý Vincenc a Grenadiny', 'VC', 'VCT', 0),
(192, 'Samoa', 'WS', 'WSM', 0),
(193, 'San Marino', 'SM', 'SMR', 0),
(194, 'Svatý Tomáš a Princův ostrov', 'ST', 'STP', 0),
(195, 'Saúdská Arábie', 'SA', 'SAU', 0),
(196, 'Senegal', 'SN', 'SEN', 0),
(197, 'Srbsko', 'RS', 'SRB', 0),
(198, 'Seychely', 'SC', 'SYC', 0),
(199, 'Sierra Leone', 'SL', 'SLE', 0),
(200, 'Singapur', 'SG', 'SGP', 0),
(201, 'Svatý Martin (nizozemská část)', 'SX', 'SXM', 0),
(202, 'Slovensko', 'SK', 'SVK', 0),
(203, 'Slovinsko', 'SI', 'SVN', 0),
(204, 'Šalamounovy ostrovy', 'SB', 'SLB', 0),
(205, 'Somálsko', 'SO', 'SOM', 0),
(206, 'Jihoafrická republika', 'ZA', 'ZAF', 0),
(207, 'Jižní Georgie a Jižní Sandwichovy ostrovy', 'GS', 'SGS', 0),
(208, 'Jižní Súdán', 'SS', 'SSD', 0),
(209, 'Španělsko', 'ES', 'ESP', 0),
(210, 'Srí Lanka', 'LK', 'LKA', 0),
(211, 'Súdán', 'SD', 'SDN', 0),
(212, 'Surinam', 'SR', 'SUR', 0),
(213, 'Špicberky a Jan Mayen', 'SJ', 'SJM', 0),
(214, 'Svazijsko', 'SZ', 'SWZ', 0),
(215, 'Švédsko', 'SE', 'SWE', 0),
(216, 'Švýcarsko', 'CH', 'CHE', 0),
(217, 'Syrská arabská republika', 'SY', 'SYR', 0),
(218, 'Tchaj-wan', 'TW', 'TWN', 0),
(219, 'Tádžikistán', 'TJ', 'TJK', 0),
(220, 'Tanzanie, sjednocená republika', 'TZ', 'TZA', 0),
(221, 'Thajsko', 'TH', 'THA', 0),
(222, 'Východní Timor', 'TL', 'TLS', 0),
(223, 'Togo', 'TG', 'TGO', 0),
(224, 'Tokelau', 'TK', 'TKL', 0),
(225, 'Tonga', 'TO', 'TON', 0),
(226, 'Trinidad a Tobago', 'TT', 'TTO', 0),
(227, 'Tunisko', 'TN', 'TUN', 0),
(228, 'Turecko', 'TR', 'TUR', 0),
(229, 'Turkmenistán', 'TM', 'TKM', 0),
(230, 'Turks a Caicos', 'TC', 'TCA', 0),
(231, 'Tuvalu', 'TV', 'TUV', 0),
(232, 'Uganda', 'UG', 'UGA', 0),
(233, 'Ukrajina', 'UA', 'UKR', 0),
(234, 'Spojené arabské emiráty', 'AE', 'ARE', 0),
(235, 'Spojené království Velké Británie a Severního Irska', 'GB', 'GBR', 0),
(236, 'Menší odlehlé ostrovy Spojených států', 'UM', 'UMI', 0),
(237, 'Spojené státy americké', 'US', 'USA', 0),
(238, 'Uruguay', 'UY', 'URY', 0),
(239, 'Uzbekistán', 'UZ', 'UZB', 0),
(240, 'Vanuatu', 'VU', 'VUT', 0),
(241, 'Venezuela (Bolívarovská republika)', 'VE', 'VEN', 0),
(242, 'Vietnam', 'VN', 'VNM', 0),
(243, 'Britské Panenské ostrovy', 'VG', 'VGB', 1),
(244, 'Americké Panenské ostrovy', 'VI', 'VIR', 1),
(245, 'Wallis a Futuna', 'WF', 'WLF', 0),
(246, 'Západní Sahara', 'EH', 'ESH', 0),
(247, 'Jemen', 'YE', 'YEM', 0),
(248, 'Zambie', 'ZM', 'ZMB', 0),
(249, 'Zimbabwe', 'ZW', 'ZWE', 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `degrees`
--

CREATE TABLE `degrees` (
  `degree_id` int(11) NOT NULL,
  `degree` text NOT NULL,
  `shortcut` text NOT NULL,
  `is_before` tinyint(1) NOT NULL DEFAULT 1,
  `weight` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `degrees`
--

INSERT INTO `degrees` (`degree_id`, `degree`, `shortcut`, `is_before`, `weight`) VALUES
(1, 'Bakalář', 'Bc.', 1, 6),
(2, 'Bakalář umění', 'BcA.', 1, 6),
(3, 'Inženýr', 'Ing.', 1, 5),
(4, 'Inženýr architekt', 'Ing. arch.', 1, 5),
(5, 'Magistr', 'Mgr.', 1, 5),
(6, 'Magistr umění', 'MgA.', 1, 5),
(7, 'Doktor všeobecného lékařství', 'MUDr.', 1, 3),
(8, 'Doktor zubního lékařství', 'MDDr.', 1, 3),
(9, 'Doktor veterinárního lékařství', 'MVDr.', 1, 3),
(10, 'Doktor práv', 'JUDr.', 1, 3),
(11, 'Doktor přírodních věd', 'RNDr.', 1, 3),
(12, 'Doktor farmacie', 'PharmDr.', 1, 3),
(13, 'Doktor teologie', 'ThDr.', 1, 3),
(14, 'Licenciát teologie', 'ThLic.', 1, 5),
(15, 'Doktor filosofie', 'PhDr.', 1, 3),
(16, 'Diplomovaný specialista', 'DiS.', 0, 7),
(17, 'Doktor', 'Ph.D.', 0, 4),
(18, 'Doktor teologie', 'Th.D.', 0, 4),
(19, 'Doktor věd', 'DrSc.', 0, 7),
(20, 'Octor honoris causa', 'dr. h. c.', 0, 7),
(21, 'Docent', 'doc.', 1, 2),
(22, 'Profesor', 'prof.', 1, 1),
(23, 'Magistr farmacie', 'PhMr.', 1, 5);

-- --------------------------------------------------------

--
-- Struktura tabulky `districts`
--

CREATE TABLE `districts` (
  `district_id` int(11) NOT NULL,
  `district` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `districts`
--

INSERT INTO `districts` (`district_id`, `district`) VALUES
(1, 'Benešov'),
(2, 'Beroun'),
(3, 'Blansko'),
(4, 'Brno-město'),
(5, 'Brno-venkov'),
(6, 'Bruntál'),
(7, 'Břeclav'),
(8, 'Cheb'),
(9, 'Chomutov'),
(10, 'Chrudim'),
(11, 'České Budějovice'),
(12, 'Český Krumlov'),
(13, 'Česká Lípa'),
(14, 'Domažlice'),
(15, 'Děčin'),
(16, 'Frýdek-Místek'),
(17, 'Havlíčkův Brod'),
(18, 'Hodonín'),
(19, 'Hradec Králové'),
(20, 'Jablonec nad Nisou'),
(21, 'Jeseník'),
(22, 'Jihlava'),
(23, 'Jindřichův Hradec'),
(24, 'Jičín'),
(25, 'Karlovy Vary'),
(26, 'Karviná'),
(27, 'Kladno'),
(28, 'Klatovy'),
(29, 'Kolín'),
(30, 'Kroměříž'),
(31, 'Kutná Hora'),
(32, 'Liberec'),
(33, 'Litoměřice'),
(34, 'Louny'),
(35, 'Mladá Boleslav'),
(36, 'Most'),
(37, 'Mělník'),
(38, 'Nový Jičín'),
(39, 'Nymburk'),
(40, 'Náchod'),
(41, 'Olomouc'),
(42, 'Opava'),
(43, 'Ostrava-město'),
(44, 'Pardubice'),
(45, 'Pelhřimov'),
(46, 'Plzeň-jih'),
(47, 'Plzeň-město'),
(48, 'Plzeň-sever'),
(49, 'Prachatice'),
(50, 'Praha 1'),
(51, 'Praha 2'),
(52, 'Praha 3'),
(53, 'Praha 4'),
(54, 'Praha 5'),
(55, 'Praha 6'),
(56, 'Praha 7'),
(57, 'Praha 8'),
(58, 'Praha 9'),
(59, 'Praha 10'),
(60, 'Praha-východ'),
(61, 'Praha-západ'),
(62, 'Prostějov'),
(63, 'Písek'),
(64, 'Přerov'),
(65, 'Příbram'),
(66, 'Rakovník'),
(67, 'Rokycany'),
(68, 'Rychnov nad Kněžnou'),
(69, 'Semily'),
(70, 'Sokolov'),
(71, 'Strakonice'),
(72, 'Svitavy'),
(73, 'Šumperk'),
(74, 'Tachov'),
(75, 'Teplice'),
(76, 'Trutnov'),
(77, 'Tábor'),
(78, 'Třebíč'),
(79, 'Uherské Hradiště'),
(80, 'Ústí nad Labem'),
(81, 'Ústí nad Orlicí'),
(82, 'Vsetín'),
(83, 'Vyškov'),
(84, 'Zlín'),
(85, 'Znojmo'),
(86, 'Ždár nad Sázavou');

-- --------------------------------------------------------

--
-- Struktura tabulky `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `type` enum('file','folder') NOT NULL DEFAULT 'file',
  `name` text DEFAULT NULL,
  `file_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `owner_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `documents`
--

INSERT INTO `documents` (`document_id`, `parent_id`, `type`, `name`, `file_id`, `created_at`, `owner_id`) VALUES
(2, NULL, 'folder', 'Test', NULL, '2026-03-07 10:26:08', NULL),
(3, 2, 'folder', 'Test1', NULL, '2026-03-07 10:26:08', NULL),
(4, 2, 'folder', 'Test2', NULL, '2026-03-07 10:26:08', NULL),
(5, 2, 'folder', 'Test3', NULL, '2026-03-07 10:26:08', NULL),
(6, 2, 'folder', 'Test4', NULL, '2026-03-07 10:26:08', NULL),
(7, NULL, 'folder', 'Testik', NULL, '2026-03-07 10:26:08', NULL),
(9, 1, 'folder', 'a', NULL, '2026-03-07 10:26:08', NULL),
(10, 8, 'folder', 'b', NULL, '2026-03-07 10:26:08', NULL),
(11, 1, 'folder', 'a', NULL, '2026-03-07 10:26:08', NULL),
(12, 7, 'folder', 'Filip', NULL, '2026-03-07 10:26:08', NULL),
(13, 7, 'folder', 'Kozjura', NULL, '2026-03-07 10:26:08', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `document_permissions`
--

CREATE TABLE `document_permissions` (
  `document_permission_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `permission_type` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `education_measures`
--

CREATE TABLE `education_measures` (
  `em_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `type` enum('praise','reprimand_classteacher','reprimand_principal','warning','reduced_behavior','other') NOT NULL DEFAULT 'praise',
  `category` enum('positive','negative') NOT NULL DEFAULT 'positive',
  `severity` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `reason` text NOT NULL,
  `description` text DEFAULT NULL,
  `issued_by` int(11) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `informed_parents` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('draft','approved','cancelled') NOT NULL DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `education_measures`
--

INSERT INTO `education_measures` (`em_id`, `student_id`, `type`, `category`, `severity`, `reason`, `description`, `issued_by`, `issued_at`, `informed_parents`, `status`) VALUES
(1, 1, 'praise', 'positive', 'low', 'Aktivní v hodinách', NULL, 4, '2026-02-15 20:10:28', 0, 'draft');

-- --------------------------------------------------------

--
-- Struktura tabulky `emails`
--

CREATE TABLE `emails` (
  `email` text NOT NULL,
  `person_id` int(11) NOT NULL,
  `type` enum('personal','school','work','other') NOT NULL DEFAULT 'school',
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `email_code` text DEFAULT NULL,
  `code_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `emails`
--

INSERT INTO `emails` (`email`, `person_id`, `type`, `description`, `is_verified`, `email_code`, `code_until`) VALUES
('jkosik@sps-pi.cz', 1, 'school', NULL, 1, NULL, NULL),
('masterikcz74@gmail.com', 4, 'personal', NULL, 1, NULL, NULL),
('kosikj.work@gmail.com', 4, 'personal', NULL, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `email_config`
--

CREATE TABLE `email_config` (
  `config_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `provider` varchar(50) DEFAULT 'basic_smtp',
  `host` varchar(255) NOT NULL,
  `port` int(11) DEFAULT 587,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `encryption` enum('none','ssl','tls') DEFAULT 'tls',
  `from_email` varchar(255) NOT NULL,
  `from_name` varchar(255) DEFAULT 'Schoolingo',
  `enabled` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `emergency_events`
--

CREATE TABLE `emergency_events` (
  `event_id` int(11) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `reported_by` int(11) NOT NULL,
  `status` enum('active','resolved','false_alarm') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `emergency_event_types`
--

CREATE TABLE `emergency_event_types` (
  `eet_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `color` varchar(10) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `emergency_event_users`
--

CREATE TABLE `emergency_event_users` (
  `event_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `emergency_notifications`
--

CREATE TABLE `emergency_notifications` (
  `en_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `channel` set('email','sms','push','call') NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `employee_attendance`
--

CREATE TABLE `employee_attendance` (
  `attendance_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` varchar(5) DEFAULT NULL,
  `check_out` varchar(5) DEFAULT NULL,
  `break_minutes` int(11) DEFAULT 0,
  `worked_minutes` int(11) DEFAULT 0,
  `type` varchar(20) DEFAULT 'regular',
  `notes` text DEFAULT NULL,
  `approved` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `employee_attendance`
--

INSERT INTO `employee_attendance` (`attendance_id`, `teacher_id`, `date`, `check_in`, `check_out`, `break_minutes`, `worked_minutes`, `type`, `notes`, `approved`, `approved_by`) VALUES
(1, 4, '2025-12-18', '23:07', '23:07', 30, 0, 'regular', NULL, 0, NULL),
(2, 4, '2025-12-18', '00:02', '00:03', 30, 0, 'regular', NULL, 0, NULL),
(3, 4, '2025-12-18', '00:21', NULL, 0, 0, 'regular', NULL, 0, NULL),
(4, 4, '2025-12-19', '01:03', '01:03', 30, 0, 'regular', NULL, 0, NULL),
(5, 4, '2026-01-24', '17:22', '17:22', 30, 0, 'regular', NULL, 0, NULL),
(7, 4, '2026-02-10', '08:00', '16:30', 30, 480, 'regular', '', 0, NULL),
(8, 4, '2026-02-12', '19:36', NULL, 0, 0, 'regular', NULL, 0, NULL),
(9, 4, '2026-02-13', '20:56', '21:02', 0, 6, 'regular', NULL, 0, NULL),
(10, 4, '2026-02-13', '21:03', NULL, 0, 0, 'regular', NULL, 0, NULL),
(11, 4, '2026-02-14', '11:20', '19:53', 0, 513, 'regular', NULL, 0, NULL),
(12, 4, '2026-02-14', '20:18', '21:41', 0, 83, 'regular', NULL, 0, NULL),
(13, 4, '2026-02-19', '11:08', '20:08', 30, 510, 'regular', '', 0, NULL),
(14, 4, '2026-02-21', '10:51', '18:52', 0, 481, 'regular', '', 0, NULL),
(15, 4, '2026-02-28', '22:02', '22:02', 30, 0, 'regular', NULL, 0, NULL),
(16, 4, '2026-03-01', '15:03', '18:03', 30, 150, 'regular', NULL, 0, NULL),
(17, 2, '2026-03-02', '10:43', '23:55', 0, 792, 'regular', '', 0, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `employee_bonuses`
--

CREATE TABLE `employee_bonuses` (
  `bonus_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` varchar(20) NOT NULL,
  `reason` text DEFAULT NULL,
  `approved_by` int(11) NOT NULL,
  `paid` tinyint(1) DEFAULT 0,
  `paid_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `employee_vacation_balance`
--

CREATE TABLE `employee_vacation_balance` (
  `balance_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `entitlement` int(11) DEFAULT 20,
  `used` int(11) DEFAULT 0,
  `remaining` int(11) DEFAULT 20
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `employee_vacation_balance`
--

INSERT INTO `employee_vacation_balance` (`balance_id`, `teacher_id`, `year`, `entitlement`, `used`, `remaining`) VALUES
(1, 4, 2026, 25, 24, 1),
(2, 3, 2026, 25, 0, 25),
(3, 7, 2026, 25, 0, 25),
(4, 10, 2026, 25, 0, 25),
(5, 5, 2026, 25, 0, 25),
(6, 20, 2026, 25, 0, 25),
(7, 36, 2026, 25, 0, 25),
(8, 17, 2026, 25, 0, 25),
(9, 2, 2026, 25, 0, 25),
(10, 6, 2026, 25, 0, 25),
(11, 8, 2026, 25, 0, 25),
(12, 34, 2026, 25, 0, 25),
(13, 21, 2026, 25, 0, 25),
(14, 13, 2026, 25, 0, 25),
(15, 15, 2026, 25, 0, 25),
(16, 19, 2026, 25, 0, 25),
(17, 22, 2026, 25, 0, 25),
(18, 23, 2026, 25, 0, 25),
(19, 11, 2026, 25, 0, 25),
(20, 14, 2026, 25, 0, 25),
(21, 35, 2026, 25, 0, 25),
(22, 16, 2026, 25, 0, 25),
(23, 18, 2026, 25, 0, 25);

-- --------------------------------------------------------

--
-- Struktura tabulky `employee_vacation_requests`
--

CREATE TABLE `employee_vacation_requests` (
  `request_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `employee_vacation_requests`
--

INSERT INTO `employee_vacation_requests` (`request_id`, `teacher_id`, `start_date`, `end_date`, `days`, `type`, `status`, `reason`, `approved_by`, `approved_at`, `created_at`) VALUES
(1, 4, '2026-02-17', '2026-02-17', 1, 'education', 'approved', NULL, 4, '2026-02-21 21:13:22', '2026-02-21 21:10:25'),
(2, 4, '2026-02-23', '2026-02-05', 19, 'vacation', 'approved', NULL, 4, '2026-02-23 19:38:13', '2026-02-23 18:45:56'),
(3, 4, '2026-02-23', '2026-02-27', 5, 'vacation', 'approved', NULL, 4, '2026-03-06 11:40:43', '2026-02-23 19:59:17'),
(4, 4, '2026-03-06', '2026-03-06', 1, 'vacation', 'rejected', 'kokog', 4, '2026-03-06 11:41:04', '2026-03-06 11:40:57');

-- --------------------------------------------------------

--
-- Struktura tabulky `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `event_name` text NOT NULL,
  `event_description` text DEFAULT NULL,
  `event_type` text NOT NULL DEFAULT 'event',
  `created_by` int(11) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `event_date` date NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `event_end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `events`
--

INSERT INTO `events` (`event_id`, `event_name`, `event_description`, `event_type`, `created_by`, `created_time`, `event_date`, `class_id`, `event_end_date`) VALUES
(1, 'Letní prázdniny', NULL, 'event', NULL, '2025-07-01 19:03:23', '0000-00-00', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `family_relations`
--

CREATE TABLE `family_relations` (
  `family_relation_id` int(11) NOT NULL,
  `source_id` int(11) NOT NULL COMMENT 'student_id',
  `target_id` int(11) NOT NULL COMMENT 'Parent, uncle, aunt',
  `role` enum('father','mother','uncle','aunt','grandfather','grandmother','stepfather','stepmother') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `family_relations`
--

INSERT INTO `family_relations` (`family_relation_id`, `source_id`, `target_id`, `role`) VALUES
(1, 1, 33, 'father'),
(2, 32, 33, 'father'),
(3, 25, 33, 'father');

-- --------------------------------------------------------

--
-- Struktura tabulky `files`
--

CREATE TABLE `files` (
  `file_id` int(11) NOT NULL,
  `file_uuid` text NOT NULL,
  `name` text NOT NULL,
  `real_file_name` text DEFAULT NULL,
  `origin` text DEFAULT NULL,
  `file_format` text DEFAULT NULL,
  `mime_type` text DEFAULT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `storage_path` text DEFAULT NULL,
  `thumbnail_path` text DEFAULT NULL,
  `permissions` text NOT NULL DEFAULT '{}',
  `owner_id` int(11) DEFAULT NULL,
  `checksum` text DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `files_tokens`
--

CREATE TABLE `files_tokens` (
  `token_id` int(11) NOT NULL,
  `file_id` int(11) NOT NULL,
  `access_token` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expire_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `token_owner` int(11) NOT NULL,
  `used_count` int(11) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `files_tokens`
--

INSERT INTO `files_tokens` (`token_id`, `file_id`, `access_token`, `created_at`, `expire_at`, `token_owner`, `used_count`) VALUES
(1, 15, '8d89f38d-3e08-4c2d-a9d9-42246a33b410', '2026-01-23 17:24:27', '2026-01-23 17:39:27', 4, 0),
(2, 15, 'fcbae10a-6551-43b5-8b14-c966ac087806', '2026-01-23 17:27:52', '2026-01-23 17:42:52', 4, 2),
(3, 14, '04e85fc9-5a6e-4b47-90c0-e5e2bb3af4a6', '2026-01-23 18:35:36', '2026-01-23 18:50:36', 4, 1),
(4, 15, '692066a4-d26f-4c01-8f0b-2f944c4079a4', '2026-01-23 18:44:15', '2026-01-23 18:59:15', 4, 0),
(5, 15, '92ced443-312b-4a7a-8b39-f0645e607aa7', '2026-01-23 18:46:09', '2026-01-23 19:01:09', 4, 0),
(6, 15, '3510613e-53f9-40a8-a5f6-087d1bafb536', '2026-01-23 18:47:53', '2026-01-23 19:02:53', 4, 0),
(7, 15, '6f80e983-f5f0-43fd-8348-549973aeb6cf', '2026-01-23 18:48:21', '2026-01-23 19:03:21', 4, 0),
(8, 15, '61e99762-cb66-440c-ae67-d8ce5f7b8d59', '2026-01-23 18:48:47', '2026-01-23 19:03:47', 4, 0),
(9, 15, '77d3a87f-1858-477c-a482-8501b622fa2a', '2026-01-23 18:50:17', '2026-01-23 19:05:17', 4, 0),
(10, 15, 'd76c4f1f-e3fe-4d6a-ba21-31e63232a494', '2026-01-23 18:50:40', '2026-01-23 19:05:40', 4, 0),
(11, 15, '818854cb-d1b0-4545-9b6a-534a921a987b', '2026-01-23 18:53:10', '2026-01-23 19:08:10', 4, 0),
(12, 15, 'bdf2e51c-2e59-4ac6-a409-d78447348204', '2026-01-23 18:59:08', '2026-01-23 19:14:08', 4, 1),
(13, 15, '3ab0e491-438f-45d9-9432-c3fa0dff56f0', '2026-01-23 19:03:24', '2026-01-23 19:18:24', 4, 0),
(14, 16, '70216cef-e491-4d6e-a8e9-095c72ea9742', '2026-01-23 19:11:09', '2026-01-23 19:26:09', 4, 0),
(15, 16, 'ff2ca9b1-9775-418f-ad15-0b6669548b9c', '2026-01-23 19:16:24', '2026-01-23 19:31:24', 4, 0),
(16, 16, 'e865ee88-e695-4af0-b2f0-c269c34cd58b', '2026-01-23 19:17:17', '2026-01-23 19:32:17', 4, 0),
(17, 16, '5f0422ab-84cd-4193-95c5-4cfe446d6437', '2026-01-23 19:37:10', '2026-01-23 19:52:10', 4, 0),
(18, 16, '0b9fdfa8-45d3-4b70-adc3-f8b1088e1cf2', '2026-01-23 19:43:34', '2026-01-23 19:58:34', 4, 0),
(19, 16, '867a296d-c1be-4e15-b215-8ef3fa3c11f9', '2026-01-23 19:45:14', '2026-01-23 20:00:14', 4, 0),
(20, 16, 'fd37ecb3-e1d4-47f7-8627-439bcc884364', '2026-01-23 19:50:14', '2026-01-23 20:05:14', 4, 0),
(21, 16, 'e91cc0b9-2dbc-4abe-aea3-aead7747a82f', '2026-01-23 19:51:03', '2026-01-23 20:06:03', 4, 1),
(22, 16, '64f09618-007d-4914-8abd-4dbaac0cf0b2', '2026-01-23 19:53:42', '2026-01-23 20:08:42', 4, 1),
(23, 16, 'f66eb4ad-4b20-4114-98e9-f8750c42f479', '2026-01-23 19:54:04', '2026-01-23 20:09:04', 4, 2),
(24, 16, '290f5cef-b47f-449a-81a9-07cbde539edd', '2026-01-23 19:59:47', '2026-01-23 20:14:47', 4, 1),
(25, 16, '35399192-9dcc-4960-9a5a-9955d8f00177', '2026-01-23 20:02:36', '2026-01-23 20:17:36', 4, 0),
(26, 16, '44e2d9f5-b43d-46e6-aa0d-1e54ad954920', '2026-01-23 20:05:27', '2026-01-23 20:20:27', 4, 0),
(27, 16, '104cd054-9334-4448-adea-a45adec49336', '2026-01-23 20:05:43', '2026-01-23 20:20:43', 4, 0),
(28, 16, '165d3a06-db09-4e5e-a56c-1e0b86da1638', '2026-01-23 20:09:51', '2026-01-23 20:24:51', 4, 0),
(29, 16, 'de18b22e-c1f0-4746-83f8-d5d9facec4d7', '2026-01-23 20:10:05', '2026-01-23 20:25:05', 4, 0),
(30, 16, 'df2c563a-2996-418b-b69b-7b32340e1614', '2026-01-23 20:10:54', '2026-01-23 20:25:54', 4, 0),
(31, 16, '4a6a9dc2-d161-4558-bdd6-bb2a7dc5e3cb', '2026-01-23 20:12:15', '2026-01-23 20:27:15', 4, 0),
(32, 16, '1a5478d3-93a2-48f1-a4a4-6e5582974acb', '2026-01-23 20:13:06', '2026-01-23 20:28:06', 4, 0),
(33, 16, 'ee7b032f-ed3a-4e65-b6c2-56e06880c540', '2026-01-23 20:13:49', '2026-01-23 20:28:49', 4, 0),
(34, 16, '264f471e-da32-489c-93ff-25a071dd344f', '2026-01-23 20:14:02', '2026-01-23 20:29:02', 4, 0),
(35, 16, 'ba737394-ee31-48ca-bef9-ad752d5d539c', '2026-01-23 20:14:52', '2026-01-23 20:29:52', 4, 0),
(36, 16, 'c8955b2a-768e-40c5-af5e-19c9248d5432', '2026-01-23 20:16:14', '2026-01-23 20:31:14', 4, 0),
(37, 16, '38ac0685-6601-4a71-bb1d-8164a0c1b713', '2026-01-23 20:19:10', '2026-01-23 20:34:10', 4, 0),
(38, 16, '2222ab83-cd6e-4a9f-b62e-409f1dfadafc', '2026-01-23 20:21:03', '2026-01-23 20:36:03', 4, 2),
(39, 16, '4488f8ca-21c9-4026-ad11-3142f2db7870', '2026-01-23 20:22:39', '2026-01-23 20:37:39', 4, 0),
(40, 16, '4b5da3ff-06e5-427d-8873-9f74d937a187', '2026-01-23 20:22:39', '2026-01-23 20:37:39', 4, 0),
(41, 16, '5716d644-f733-497b-bb78-93935293a556', '2026-01-23 20:22:59', '2026-01-23 20:37:59', 4, 3),
(42, 16, '1fea5eaa-31f0-4c08-924b-d73057d7df48', '2026-01-23 20:24:18', '2026-01-23 20:39:18', 4, 1),
(43, 14, '455486f7-3d1e-4af4-8980-bbd62205959c', '2026-01-23 20:24:18', '2026-01-23 20:39:18', 4, 0),
(44, 15, 'c784a37e-106d-4553-b65a-4cf4445c8b71', '2026-01-23 20:24:19', '2026-01-23 20:39:19', 4, 0),
(45, 14, 'f19b4b70-9522-4b84-9839-92d644782485', '2026-01-23 20:24:21', '2026-01-23 20:39:21', 4, 0),
(46, 16, '94ddd378-bf6e-495a-9df8-cbfc00655749', '2026-01-23 20:24:22', '2026-01-23 20:39:22', 4, 1),
(47, 16, 'c0c8939d-ddb0-4655-90f3-cad004ff5836', '2026-01-23 20:30:25', '2026-01-23 20:45:25', 4, 0),
(48, 16, '78bac8f5-bb54-40ef-9135-4d948d6c80a9', '2026-01-23 20:31:01', '2026-01-23 20:46:01', 4, 0),
(49, 16, 'be9dca09-8ab5-4711-8805-d940a1d9478f', '2026-01-23 20:32:13', '2026-01-23 20:47:13', 4, 0),
(50, 16, 'dacd3e08-fdc3-400b-b34c-95b44dc79bb7', '2026-01-23 20:35:39', '2026-01-23 20:50:39', 4, 0),
(51, 15, 'b8c2353d-4de4-4f30-aaa8-a9df37be3d64', '2026-01-23 20:44:45', '2026-01-23 20:59:45', 4, 0),
(52, 15, '990c736a-632e-4683-8255-2ab3282d9b26', '2026-01-23 20:44:51', '2026-01-23 20:59:51', 4, 0),
(53, 16, '15258b07-2854-4b6a-8591-732ea6132628', '2026-01-23 20:44:54', '2026-01-23 20:59:54', 4, 0),
(54, 14, 'd2f66110-1d09-4620-b790-bb0463031b45', '2026-01-23 20:44:55', '2026-01-23 20:59:55', 4, 0),
(55, 15, 'b621a327-2ed1-4357-a2bb-12cca8c0cfef', '2026-01-23 20:44:57', '2026-01-23 20:59:57', 4, 0),
(56, 14, '9fe8ccc7-8c59-4ba7-8701-af11628291f4', '2026-01-23 20:44:58', '2026-01-23 20:59:58', 4, 0),
(57, 15, '5f0a329f-a92e-4c17-97b7-ac50bf2da05a', '2026-01-23 20:44:58', '2026-01-23 20:59:58', 4, 0),
(58, 16, 'a42049b2-e624-462b-8b6c-d322047bfb29', '2026-01-23 20:45:02', '2026-01-23 21:00:02', 4, 0),
(59, 14, '9d9d2048-2909-4bd5-8fd8-e059ab228ebf', '2026-01-23 20:45:03', '2026-01-23 21:00:03', 4, 0),
(60, 15, '5cf6ab63-3c7f-4a9e-be14-e7c3fd686ff2', '2026-01-23 20:45:03', '2026-01-23 21:00:03', 4, 0),
(61, 14, '0fa4ae23-ae88-4e47-b0ab-78f41519df8c', '2026-01-23 20:46:31', '2026-01-23 21:01:31', 4, 0),
(62, 15, '945d5173-cab0-48d9-8d7f-fc60b6f62f34', '2026-01-23 20:46:32', '2026-01-23 21:01:32', 4, 0),
(63, 16, '93944fc0-c69d-4366-a39c-56fd7b964a89', '2026-01-23 20:46:33', '2026-01-23 21:01:33', 4, 0),
(64, 16, '86c3bff9-8f65-4746-a5e7-72cf3d7d6c55', '2026-01-23 20:46:35', '2026-01-23 21:01:35', 4, 0),
(65, 16, '6662763b-39bf-4378-acbe-f3cc7518831e', '2026-01-23 20:47:16', '2026-01-23 21:02:16', 4, 0),
(66, 16, '0e956187-371a-4499-8e51-69fc92cbf031', '2026-01-23 20:47:18', '2026-01-23 21:02:18', 4, 0),
(67, 16, 'a94abe05-db61-4564-80c9-5681cfc368d9', '2026-01-23 20:47:59', '2026-01-23 21:02:59', 4, 0),
(68, 16, 'a14af59e-a1f8-4334-94be-8f491f8620c6', '2026-01-23 20:48:44', '2026-01-23 21:03:44', 4, 0),
(69, 14, '5ea3ff73-e9ac-48cd-932c-9da4ab246061', '2026-01-23 20:48:44', '2026-01-23 21:03:44', 4, 0),
(70, 15, 'b02c2980-8c1a-4240-8444-9357f15ea5c0', '2026-01-23 20:48:45', '2026-01-23 21:03:45', 4, 0),
(71, 14, 'e94c9577-cadf-49d4-9d8d-ec9146da52e1', '2026-01-23 20:49:14', '2026-01-23 21:04:14', 4, 0),
(72, 16, '6cd26049-3149-464c-87b5-22e40ff1956d', '2026-01-23 20:49:14', '2026-01-23 21:04:14', 4, 0),
(73, 16, '39dd8f7c-9196-42a4-8c99-8112e1360857', '2026-01-23 20:49:16', '2026-01-23 21:04:16', 4, 0),
(74, 14, 'd9bd488f-229a-40c2-b1ca-9371eab29b66', '2026-01-23 20:49:17', '2026-01-23 21:04:17', 4, 0),
(75, 14, '1231b2a6-e159-4181-8c54-6238f487535e', '2026-01-23 20:49:17', '2026-01-23 21:04:17', 4, 0),
(76, 15, 'b89950ab-9e25-44f0-9d24-f2c9785db359', '2026-01-23 20:49:17', '2026-01-23 21:04:17', 4, 0),
(77, 14, '6218bb61-4e48-44aa-8255-83b5f8cb00ed', '2026-01-23 20:49:23', '2026-01-23 21:04:23', 4, 0),
(78, 16, 'e0d2b846-a343-4569-a995-ecfaa7411cf7', '2026-01-25 19:20:16', '2026-01-25 19:35:16', 4, 0),
(79, 14, 'dbd494e7-d0ce-471d-9210-73ae62127e17', '2026-01-25 19:20:25', '2026-01-25 19:35:25', 4, 0),
(80, 15, '78d038f3-1743-4ef4-89ad-9341ba5393b6', '2026-01-25 19:20:27', '2026-01-25 19:35:27', 4, 0),
(81, 16, 'a08023b0-b93f-4a4f-8e56-922ce327cb19', '2026-02-06 21:02:44', '2026-02-06 21:17:44', 1, 0),
(82, 14, '13562e58-7817-4db0-abad-0aff0fc53ae6', '2026-02-06 21:02:46', '2026-02-06 21:17:46', 1, 0),
(83, 15, '6430088b-e774-4acb-8138-f82a067d2460', '2026-02-06 21:02:47', '2026-02-06 21:17:47', 1, 0),
(84, 14, '3aa390f6-32bd-46cc-9398-dad6b13e867d', '2026-02-06 21:02:48', '2026-02-06 21:17:48', 1, 0),
(85, 16, '002c0a29-f460-47db-8ded-bc6898abfd18', '2026-02-06 21:02:49', '2026-02-06 21:17:49', 1, 0),
(86, 15, 'a275b42b-c9b0-4d10-b7fa-204cc0cc9b5f', '2026-02-06 21:02:49', '2026-02-06 21:17:49', 1, 0),
(87, 16, 'a36025b2-f2ac-4e1f-be09-29e3203fa971', '2026-02-06 21:02:50', '2026-02-06 21:17:50', 1, 0),
(88, 16, '4529aa18-a6f6-49e3-8903-0031a1cbc7b4', '2026-02-06 21:02:52', '2026-02-06 21:17:52', 1, 0),
(89, 14, '0dc7132e-3b4b-475c-b916-665a14871165', '2026-02-07 13:32:29', '2026-02-07 13:47:29', 4, 0),
(90, 14, '0881f8b2-ce5e-42d2-bc25-4afc421df8f9', '2026-02-08 21:09:11', '2026-02-08 21:24:11', 4, 0),
(91, 16, 'e312d63e-2684-4c4e-9605-e1bdeda40d81', '2026-02-08 21:09:12', '2026-02-08 21:24:12', 4, 0),
(92, 15, '59c31ab0-250f-447e-8435-e1164d0ad5d9', '2026-02-08 21:09:13', '2026-02-08 21:24:13', 4, 0),
(93, 16, '8b4699ec-7993-4525-9c20-41421473f857', '2026-02-08 21:09:20', '2026-02-08 21:24:20', 4, 0),
(94, 14, '53568071-517d-440d-a71f-719d5f6e787f', '2026-02-08 21:09:22', '2026-02-08 21:24:22', 4, 0),
(95, 16, '26db98ac-fe02-4fe9-a1b3-8bc1475bfdc9', '2026-02-08 21:09:23', '2026-02-08 21:24:23', 4, 0),
(96, 14, '7bd02666-7381-45e7-b6c1-038b1d268910', '2026-02-08 21:09:23', '2026-02-08 21:24:23', 4, 0),
(97, 15, 'a74dc8a9-17b6-4a68-8d5a-7ad2a9b606a3', '2026-02-08 21:09:24', '2026-02-08 21:24:24', 4, 0),
(98, 14, '1a8d7b46-3963-4640-851e-249ab7d1ad29', '2026-02-08 21:09:24', '2026-02-08 21:24:24', 4, 0),
(99, 16, 'bab94480-9514-4220-b61d-03650d93bd9b', '2026-02-08 21:09:25', '2026-02-08 21:24:25', 4, 0),
(100, 14, 'e9df8d98-4804-4229-96c8-b541b0c9270e', '2026-02-08 21:09:26', '2026-02-08 21:24:26', 4, 0),
(101, 15, '32d4cd83-d6ce-4ddc-92db-7060ddc7c03d', '2026-02-08 21:09:26', '2026-02-08 21:24:26', 4, 0),
(102, 16, 'f77e1c26-c565-4cd9-92bf-71821dcfd353', '2026-02-14 11:06:48', '2026-02-14 11:21:48', 4, 0),
(103, 16, '9e52acd5-dbb0-48b1-a7c3-4bd1466abebc', '2026-02-14 15:23:38', '2026-02-14 15:38:38', 4, 0),
(104, 14, 'f98389b5-c4e4-41fb-9eae-08864bfabb3d', '2026-02-14 15:23:39', '2026-02-14 15:38:39', 4, 0),
(105, 15, 'e8ba799a-1e7a-4f30-a867-f79ffa08b60f', '2026-02-14 15:23:47', '2026-02-14 15:38:47', 4, 0),
(106, 16, 'cd78a7f0-0dfe-4826-a2a1-bc587c99cbf5', '2026-02-15 18:38:16', '2026-02-15 18:53:16', 1, 0),
(107, 16, '60ca0db8-f75d-40ac-9230-bf8fe5df5e6a', '2026-02-15 18:38:26', '2026-02-15 18:53:26', 1, 0),
(108, 16, '0c318954-718a-4d8a-bc73-a091b05e2acb', '2026-02-15 18:38:27', '2026-02-15 18:53:27', 1, 0),
(109, 14, '2c335fcb-5481-44d7-807b-2ab6fb9663ab', '2026-02-15 18:38:32', '2026-02-15 18:53:32', 1, 0),
(110, 15, 'f2441694-eecc-41c2-8545-21dd6594ecb7', '2026-02-15 18:38:41', '2026-02-15 18:53:41', 1, 0),
(111, 16, 'c426e8de-587a-4ce5-8457-7a4c9f407921', '2026-02-26 00:30:29', '2026-02-26 00:45:29', 3, 0),
(112, 14, '7a303147-e941-4ce7-aacc-ea3725243212', '2026-02-26 00:30:30', '2026-02-26 00:45:30', 3, 0),
(113, 15, 'a6f61625-949c-4b23-bdb4-6383c1b225f9', '2026-02-26 00:30:32', '2026-02-26 00:45:32', 3, 0),
(114, 16, '8245a6c8-df72-4d1d-b881-b99bf4be7244', '2026-02-26 00:30:33', '2026-02-26 00:45:33', 3, 0),
(115, 16, '135ac846-8ad5-48db-95cb-fe547e9d3f9b', '2026-03-02 21:27:43', '2026-03-02 21:42:43', 1, 0),
(116, 14, '1fae3ebb-b84f-4832-b545-ce0bfa94fb92', '2026-03-02 21:27:44', '2026-03-02 21:42:44', 1, 0),
(117, 15, 'c6905c99-7669-4907-94d0-3a72f874f9d3', '2026-03-02 21:27:44', '2026-03-02 21:42:44', 1, 0),
(118, 14, '8d0af63e-94ce-46d0-9d28-1136900a83a5', '2026-03-02 21:27:45', '2026-03-02 21:42:45', 1, 0),
(119, 15, 'cac59b6a-1239-4fc1-ac9a-e15b806a57d3', '2026-03-02 21:27:45', '2026-03-02 21:42:45', 1, 0),
(120, 16, 'ae0f5a6e-0bcc-4208-8605-a074dc6e70a8', '2026-03-07 09:42:43', '2026-03-07 09:57:43', 4, 0),
(121, 14, '6b8d241e-de65-4043-865e-6bf4138de873', '2026-03-07 09:42:44', '2026-03-07 09:57:44', 4, 0),
(122, 15, 'a10c9aea-a1ea-468a-9a0a-69249075de89', '2026-03-07 09:42:45', '2026-03-07 09:57:45', 4, 0),
(123, 14, '43a31678-4894-45bf-8f82-cbecfbed41cc', '2026-03-07 09:42:46', '2026-03-07 09:57:46', 4, 0),
(124, 16, 'f60acf7a-9075-4dc3-8080-003af4b308a8', '2026-03-07 09:58:20', '2026-03-07 10:13:20', 4, 0),
(125, 15, 'dc48cba6-7b0e-427f-897f-5a79d557fa82', '2026-03-07 10:01:06', '2026-03-07 10:16:06', 4, 0),
(126, 15, 'd6dcdac0-3284-4604-93f3-deedee10bfd5', '2026-03-07 10:02:00', '2026-03-07 10:17:00', 4, 0),
(127, 16, '7658f96e-8354-4799-a364-9e565ea7f1a7', '2026-03-07 10:02:04', '2026-03-07 10:17:04', 4, 0),
(128, 16, 'afc5642a-1aa5-44b9-83d1-0f3460ccf63b', '2026-03-07 10:07:17', '2026-03-07 10:22:17', 4, 0),
(129, 16, '50a2de62-2eb4-4c21-b647-3045b755130b', '2026-03-07 10:10:02', '2026-03-07 10:25:02', 4, 0),
(130, 14, 'a6c18c0d-149e-4f04-be8b-32571e53cf4d', '2026-03-07 10:10:03', '2026-03-07 10:25:03', 4, 0),
(131, 15, '59ff62c9-df35-4615-bd24-1f6fab2d2969', '2026-03-07 10:10:03', '2026-03-07 10:25:03', 4, 0),
(132, 14, 'cf9734db-0c3a-4c43-8eb3-cb01b42b015e', '2026-03-07 10:16:00', '2026-03-07 10:31:00', 4, 0),
(133, 16, '3efd0225-93ac-4c39-b645-e2169faa47d9', '2026-03-07 10:16:01', '2026-03-07 10:31:01', 4, 0),
(134, 16, '8ccea1f1-2d57-41a8-991a-1ae755e2a74b', '2026-03-07 10:16:02', '2026-03-07 10:31:02', 4, 0),
(135, 14, 'be392a94-284a-406e-9163-62923046a44e', '2026-03-07 10:16:03', '2026-03-07 10:31:03', 4, 0),
(136, 15, 'd46066d4-27d9-4f8d-8059-d2b01044f3b4', '2026-03-07 10:16:03', '2026-03-07 10:31:03', 4, 0),
(137, 16, '1eb654d8-a0c9-4e66-8f4b-a89a01765fad', '2026-03-07 10:16:04', '2026-03-07 10:31:04', 4, 0),
(138, 16, '07930857-a7ad-445d-8491-8f48bd385dc0', '2026-03-07 10:29:46', '2026-03-07 10:44:46', 4, 0),
(139, 15, 'f1f71621-2da0-4256-a55e-e510a79c25b7', '2026-03-07 10:30:40', '2026-03-07 10:45:40', 4, 0),
(140, 14, '9e1aaccc-e178-4909-9d96-74453daa5c2a', '2026-03-07 10:30:41', '2026-03-07 10:45:41', 4, 0),
(141, 16, '48cfe836-6301-464e-84e3-7527634ab4d1', '2026-03-07 11:12:11', '2026-03-07 11:27:11', 4, 0),
(142, 70, 'f3549d70-6ecd-475e-adeb-52c3722757fa', '2026-03-07 11:23:34', '2026-03-07 11:38:34', 4, 0),
(143, 70, '89e1c93d-0411-4350-84b8-5a9e35e92dc7', '2026-03-07 13:33:58', '2026-03-07 13:48:58', 4, 0),
(144, 16, '34678852-cd01-4cb0-b03a-190670043617', '2026-03-07 15:59:55', '2026-03-07 16:14:55', 2, 0),
(145, 73, 'db461b81-0ad2-425b-8560-f3bac3655d8f', '2026-03-08 07:44:59', '2026-03-08 07:59:59', 4, 0),
(146, 73, '944691c4-8219-4dd6-9f4d-c932ad834941', '2026-03-08 07:45:08', '2026-03-08 08:00:08', 4, 0),
(147, 72, 'bd773ff9-0a38-4d9f-9a87-1ebeeefa46bd', '2026-03-08 07:45:09', '2026-03-08 08:00:09', 4, 0),
(148, 70, 'dfe27dfa-beb0-4844-a68d-611b73cf8c46', '2026-03-08 07:45:09', '2026-03-08 08:00:09', 4, 0),
(149, 73, 'ca05e970-2614-4261-b13f-6de4c231046a', '2026-03-08 07:45:09', '2026-03-08 08:00:09', 4, 0),
(150, 16, '3f766948-89e2-43d4-95f5-ed1fd3049878', '2026-03-08 07:45:11', '2026-03-08 08:00:11', 4, 0),
(151, 14, '1ce1d9ba-26f2-4624-819e-826c911ec5f0', '2026-03-08 07:45:12', '2026-03-08 08:00:12', 4, 0),
(152, 14, '929edd24-961f-4305-8dc6-0d6448861da8', '2026-03-08 07:45:12', '2026-03-08 08:00:12', 4, 0),
(153, 15, 'dcd69206-eff8-40ce-ba6a-5f2466c66476', '2026-03-08 07:45:13', '2026-03-08 08:00:13', 4, 0),
(154, 14, '81272ad5-c72c-47a6-a816-74f6de1304ea', '2026-03-08 07:45:13', '2026-03-08 08:00:13', 4, 0),
(155, 15, '4628e3b4-ae74-4282-a6cc-875a2a090f54', '2026-03-08 07:45:14', '2026-03-08 08:00:14', 4, 0),
(156, 16, 'cc9fa71e-cd1d-49e8-bdf3-dea45809a95f', '2026-03-08 07:45:15', '2026-03-08 08:00:15', 4, 0),
(157, 73, '7e541013-49ff-485d-b414-558606c92d33', '2026-03-08 07:45:17', '2026-03-08 08:00:17', 4, 0),
(158, 72, 'd6572459-e0a4-4bf7-a2d3-3b71fb118dcf', '2026-03-08 07:45:17', '2026-03-08 08:00:17', 4, 0),
(159, 70, 'b5bca9bb-0392-4418-9f45-bc6fe7dd820b', '2026-03-08 07:49:15', '2026-03-08 08:04:15', 4, 0),
(160, 73, '55138948-f1f1-4b66-bd1c-07b83f6da93f', '2026-03-08 07:49:15', '2026-03-08 08:04:15', 4, 0),
(161, 70, '9b1e8b91-0843-4d71-bacf-3c33b0d50d29', '2026-03-11 15:10:08', '2026-03-11 15:25:08', 4, 0),
(162, 16, 'd7329d4d-3481-4b26-94da-f01dec454ad9', '2026-03-11 15:10:21', '2026-03-11 15:25:21', 4, 0),
(163, 14, '79e0be2f-94a3-4bd2-87d1-d551063c7f8a', '2026-03-11 15:10:21', '2026-03-11 15:25:21', 4, 0),
(164, 15, 'fdee627c-2c2a-477a-8a9a-d1db0079cad4', '2026-03-11 15:10:22', '2026-03-11 15:25:22', 4, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_expenses`
--

CREATE TABLE `fleetvehicles_expenses` (
  `fv_ex_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `expense_date` date NOT NULL DEFAULT current_timestamp(),
  `amount` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `category` enum('Service','Fuel','Insurance','Maintenance','Repairs','Tires','Tolls','Parking Fees','Cleaning','Licenses and Permits','Fines and Penalties','Depreciation','Leasing','Roadside Assistance','Accessories','Administration Fees','Registration Fees','Inspection','Battery Replacement','Other') NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_maintenance`
--

CREATE TABLE `fleetvehicles_maintenance` (
  `fv_ma_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `maintenance_date` date NOT NULL,
  `description` text NOT NULL,
  `cost` decimal(10,0) NOT NULL,
  `mileage_at_service` int(11) DEFAULT NULL,
  `notes` text NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_trips`
--

CREATE TABLE `fleetvehicles_trips` (
  `trip_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_date` timestamp NULL DEFAULT NULL,
  `purpose` text NOT NULL,
  `start_location` text NOT NULL,
  `end_location` text NOT NULL,
  `distance` int(11) NOT NULL,
  `notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_vehicles`
--

CREATE TABLE `fleetvehicles_vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `vin` varchar(17) DEFAULT NULL,
  `manufacture` text NOT NULL,
  `model` text NOT NULL,
  `manufacture_country_id` int(11) NOT NULL,
  `year_manufacture` year(4) NOT NULL,
  `fuel` enum('petrol','diesel','hybrid(petrol)','hybrid(diesel)','electro','CNG','LNG','LPG','H2') NOT NULL,
  `plate` text NOT NULL,
  `registration_country_id` int(11) NOT NULL,
  `mileage` int(11) NOT NULL DEFAULT 0,
  `last_service_date` date DEFAULT NULL,
  `periodic_maintenance_mileage` int(11) NOT NULL DEFAULT 10000,
  `location` text DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `fleetvehicles_vehicles`
--

INSERT INTO `fleetvehicles_vehicles` (`vehicle_id`, `vin`, `manufacture`, `model`, `manufacture_country_id`, `year_manufacture`, `fuel`, `plate`, `registration_country_id`, `mileage`, `last_service_date`, `periodic_maintenance_mileage`, `location`, `notes`) VALUES
(1, 'TMBAG7NE8K0076761', 'Škoda', 'Octavia', 60, '2019', 'diesel', '1AFA386', 60, 98550, '2025-01-06', 15000, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_vignette_cache`
--

CREATE TABLE `fleetvehicles_vignette_cache` (
  `fv_vc_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `country_id` int(11) NOT NULL,
  `valid_since` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `cache_last_update` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_consents`
--

CREATE TABLE `gdpr_consents` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `target_group` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `gdpr_consents`
--

INSERT INTO `gdpr_consents` (`id`, `title`, `type`, `description`, `purpose`, `instructions`, `required`, `active`, `target_group`, `created_at`, `updated_at`) VALUES
(1, 'Zpracování osobních údajů pro školní účely', 'essential', 'Nezbytné údaje pro provoz informačního systému.', 'Zajištění výuky a správa studentů.', 'Tento souhlas je vyžadován zákonem.', 1, 1, 'all', '2026-03-05 10:53:43', '2026-03-05 10:53:43'),
(2, 'Zasílání newsletteru a novinek', 'marketing', 'Informace o dění ve škole, akcích a kroužcích.', 'Informovanost rodičů a studentů.', 'Můžete kdykoliv odvolat.', 0, 1, 'parents', '2026-03-05 10:53:43', '2026-03-05 10:53:43'),
(3, 'Sdílení fotografií z akcí', 'third_party', 'Zveřejňování fotografií na webu školy a sociálních sítích.', 'Prezentace školy.', 'Souhlas se vztahuje na hromadné fotografie.', 0, 1, 'all', '2026-03-05 10:53:43', '2026-03-05 10:53:43');

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_reports`
--

CREATE TABLE `gdpr_reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_requests`
--

CREATE TABLE `gdpr_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `requested_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `download_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `gdpr_requests`
--

INSERT INTO `gdpr_requests` (`id`, `user_id`, `type`, `status`, `requested_at`, `completed_at`, `download_url`) VALUES
(1, 4, 'export', 'pending', '2026-03-08 15:17:30', NULL, NULL),
(2, 4, 'export', 'pending', '2026-03-08 15:17:31', NULL, NULL),
(3, 4, 'export', 'pending', '2026-03-11 15:31:49', NULL, NULL),
(4, 4, 'export', 'pending', '2026-03-11 15:31:50', NULL, NULL),
(5, 4, 'export', 'pending', '2026-03-24 19:24:58', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_reviews`
--

CREATE TABLE `gdpr_reviews` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'planned',
  `result` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_training`
--

CREATE TABLE `gdpr_training` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `valid_days` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `target_group` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `gdpr_training`
--

INSERT INTO `gdpr_training` (`id`, `name`, `description`, `valid_days`, `active`, `target_group`, `created_at`) VALUES
(1, 'Základy GDPR pro zaměstnance', 'Povinné školení ohledně nakládání s osobními údaji.', 365, 1, 'teachers', '2026-03-05 10:53:43'),
(2, 'Bezpečnost dat v IS Schoolingo', 'Jak bezpečně pracovat s informačním systémem.', 180, 1, 'all', '2026-03-05 10:53:43');

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_user_consents`
--

CREATE TABLE `gdpr_user_consents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `consent_id` int(11) NOT NULL,
  `granted` tinyint(1) DEFAULT NULL,
  `granted_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `person_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `gdpr_user_consents`
--

INSERT INTO `gdpr_user_consents` (`id`, `user_id`, `consent_id`, `granted`, `granted_at`, `expires_at`, `person_id`) VALUES
(1, 4, 2, 0, '2026-03-24 19:24:51', NULL, NULL),
(2, 4, 3, 1, '2026-03-24 19:24:50', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `gdpr_user_training`
--

CREATE TABLE `gdpr_user_training` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `training_id` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'not_started',
  `score` int(11) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `grades`
--

CREATE TABLE `grades` (
  `grade_id` int(11) NOT NULL,
  `column_id` int(11) NOT NULL COMMENT 'gcId',
  `mark` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `grades`
--

INSERT INTO `grades` (`grade_id`, `column_id`, `mark`, `student_id`, `teacher_id`, `created`, `description`) VALUES
(1, 1, 1, 1, 23, '2024-11-16 11:21:54.000000', NULL),
(2, 1, 1, 24, 2, '0000-00-00 00:00:00.000000', NULL),
(3, 1, 1, 25, 2, '0000-00-00 00:00:00.000000', NULL),
(4, 1, 1, 26, 2, '0000-00-00 00:00:00.000000', NULL),
(5, 1, 1, 27, 2, '0000-00-00 00:00:00.000000', NULL),
(7, 2, 2, 24, 4, '2026-02-06 21:34:57.390243', NULL),
(8, 2, 4, 1, 4, '2026-02-06 21:42:27.539118', NULL),
(10, 5, 3, 24, 4, '2026-02-06 21:43:30.385002', NULL),
(14, 3, 1, 24, 4, '2026-02-06 21:44:43.321378', NULL),
(15, 3, 1, 1, 4, '2026-02-06 21:44:53.308644', NULL),
(18, 4, 2, 24, 4, '2026-02-06 21:54:34.622906', NULL),
(19, 4, 3, 1, 4, '2026-02-06 21:54:42.024678', NULL),
(20, 5, 2, 1, 4, '2026-02-12 18:24:14.426776', NULL),
(21, 8, 10, 24, 4, '2026-02-22 12:24:54.384985', NULL),
(22, 8, 9, 1, 4, '2026-02-22 12:28:44.904826', NULL),
(23, 7, 5, 1, 4, '2026-02-22 12:59:02.950534', NULL),
(24, 7, 1, 24, 4, '2026-02-26 11:11:38.131873', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `grades_columns`
--

CREATE TABLE `grades_columns` (
  `column_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `column_index` int(11) NOT NULL,
  `weight` int(11) NOT NULL DEFAULT 1,
  `max_points` int(11) DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `topic` text NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `status` enum('active','deleted') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `grades_columns`
--

INSERT INTO `grades_columns` (`column_id`, `group_id`, `subject_id`, `column_index`, `weight`, `max_points`, `type`, `topic`, `created`, `status`) VALUES
(1, 9, 31, 0, 10, NULL, 0, 'Test', '2025-10-20 09:47:38.000000', 'active'),
(2, 9, 31, 1, 10, NULL, 0, 'Test', '2025-11-03 08:10:34.657510', 'active'),
(3, 9, 33, 0, 8, NULL, 0, 'Test', '2025-11-05 11:10:31.704834', 'active'),
(4, 9, 33, 1, 8, NULL, 0, 'AAA', '2025-11-05 11:13:38.244155', 'active'),
(5, 9, 31, 2, 8, NULL, 0, 'Zkoušení', '2026-02-06 21:37:41.875604', 'active'),
(6, 9, 33, 2, 9, NULL, 0, 'Testicek', '2026-02-06 22:20:23.418477', 'active'),
(7, 9, 31, 3, 10, NULL, 0, 'Test', '2026-02-19 10:01:29.483772', 'active'),
(8, 9, 31, 4, 10, 10, 1, 'Test na body', '2026-02-22 12:15:08.142921', 'active');

-- --------------------------------------------------------

--
-- Struktura tabulky `groups`
--

CREATE TABLE `groups` (
  `group_id` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `year_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `groups`
--

INSERT INTO `groups` (`group_id`, `name`, `num`, `class_id`, `year_id`) VALUES
(2, NULL, NULL, 1, 1),
(3, NULL, 1, 1, 1),
(4, NULL, 2, 1, 1),
(5, 'PRA', 1, 1, 1),
(6, 'PRA', 2, 1, 1),
(7, 'PRA', 3, 1, 1),
(8, NULL, 1, 1, 2),
(9, NULL, 2, 1, 2),
(10, NULL, NULL, 1, 2),
(11, 'PRA', 1, 1, 2),
(12, 'PRA', 2, 1, 2);

-- --------------------------------------------------------

--
-- Struktura tabulky `group_channels`
--

CREATE TABLE `group_channels` (
  `channel_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('text','voice') DEFAULT 'text',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `group_members`
--

CREATE TABLE `group_members` (
  `member_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('admin','moderator','member') DEFAULT 'member',
  `joined_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `homework`
--

CREATE TABLE `homework` (
  `homework_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` datetime(6) NOT NULL,
  `headline` text DEFAULT NULL,
  `homework` text NOT NULL,
  `note` text DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT 0 COMMENT '1 = info, 2 = interactive, 3 = doučování\r\n'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `homework`
--

INSERT INTO `homework` (`homework_id`, `subject_id`, `group_id`, `teacher_id`, `assigned_at`, `due_date`, `headline`, `homework`, `note`, `type`) VALUES
(1, 1, 2, 2, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', 'Udělejte úkol', 'T', NULL, 0),
(7, 1, 2, 2, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', 'Udělejte úkol', 'Vypracujte příklady ze strany 56, cvičení 4–9. Dbejte na postup a přesné výsledky', NULL, 0),
(13, 1, 2, 2, '2025-11-20 13:20:37', '2024-02-01 22:00:00.000000', NULL, 'TAK TOHLE MUSÍ UŽ VYJÍT', NULL, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `insurance_companies`
--

CREATE TABLE `insurance_companies` (
  `insurance_id` int(11) NOT NULL,
  `insurance` text NOT NULL,
  `shortcut` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `insurance_companies`
--

INSERT INTO `insurance_companies` (`insurance_id`, `insurance`, `shortcut`) VALUES
(111, 'Všeobecná zdravotní pojišťovna České republiky', 'VZP'),
(201, 'Vojenská zdravotní pojišťovna České republiky', 'VoZP'),
(205, 'Česká průmyslová zdravotní pojišťovna', 'CPZP'),
(207, 'Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví', 'OZP'),
(209, 'Zaměstnanecká pojišťovna Škoda', 'ZPŠkoda'),
(211, 'Zdravotní pojišťovna ministerstva vnitra České republiky', 'ZPVMCR'),
(213, 'RBP, zdravotní pojišťovna', 'RBP');

-- --------------------------------------------------------

--
-- Struktura tabulky `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT NULL,
  `serial_number` text DEFAULT NULL,
  `category` text DEFAULT NULL,
  `status` enum('active','broken','discarded','maintenance') NOT NULL DEFAULT 'active',
  `acquisition_date` date DEFAULT NULL,
  `purchase_price` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `log_id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `from_room_id` int(11) DEFAULT NULL,
  `to_room_id` int(11) DEFAULT NULL,
  `action` enum('create','move','update_status','delete') NOT NULL DEFAULT 'create',
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `ip_cache`
--

CREATE TABLE `ip_cache` (
  `ip` text NOT NULL,
  `city` text DEFAULT NULL,
  `zip_code` text DEFAULT NULL,
  `region_name` text DEFAULT NULL,
  `country` text DEFAULT NULL,
  `country_code` text DEFAULT NULL,
  `continent` text DEFAULT NULL,
  `continent_code` text DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `ip_cache`
--

INSERT INTO `ip_cache` (`ip`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`, `created`) VALUES
('109.164.51.14', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL, '2026-03-24 21:01:03');

-- --------------------------------------------------------

--
-- Struktura tabulky `ldap_config`
--

CREATE TABLE `ldap_config` (
  `config_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `server_url` varchar(255) NOT NULL,
  `bind_dn` varchar(255) DEFAULT NULL,
  `bind_password` varchar(255) DEFAULT NULL,
  `search_base` varchar(255) NOT NULL,
  `user_filter` varchar(255) DEFAULT '(uid=%u)',
  `mapping_username` varchar(50) DEFAULT 'uid',
  `mapping_email` varchar(50) DEFAULT 'mail',
  `mapping_name` varchar(50) DEFAULT 'cn',
  `enabled` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `ldap_config`
--

INSERT INTO `ldap_config` (`config_id`, `school_id`, `server_url`, `bind_dn`, `bind_password`, `search_base`, `user_filter`, `mapping_username`, `mapping_email`, `mapping_name`, `enabled`, `created_at`, `updated_at`) VALUES
(1, 1, 'ldap://192.168.137.239:389', 'administrator@school.local', 'Heslo123', 'dc=school,dc=local', '(sAMAccountName=%u)', 'sAMAccountName', 'mail', 'cn', 0, '2026-03-04 23:07:37', '2026-03-05 08:43:53');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_books`
--

CREATE TABLE `library_books` (
  `book_id` int(11) NOT NULL,
  `title` text NOT NULL,
  `genre_id` int(11) NOT NULL,
  `isbn` varchar(22) DEFAULT NULL,
  `publisher` text DEFAULT NULL,
  `published_year` year(4) DEFAULT NULL,
  `edition_number` int(11) DEFAULT NULL,
  `pages` int(11) NOT NULL DEFAULT 0,
  `annotation` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `signature` int(11) DEFAULT NULL,
  `language` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_books`
--

INSERT INTO `library_books` (`book_id`, `title`, `genre_id`, `isbn`, `publisher`, `published_year`, `edition_number`, `pages`, `annotation`, `tags`, `keywords`, `signature`, `language`, `description`, `cover_url`, `created_at`) VALUES
(1, 'Filipovo Tajemství', 1, '978-80-259-0505-3', 'NapicuVydavatelství', NULL, 1, 69, '', '', '', 0, 'Čeština', NULL, NULL, '2025-12-08 21:54:58');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_book_authors`
--

CREATE TABLE `library_book_authors` (
  `book_author_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_book_authors`
--

INSERT INTO `library_book_authors` (`book_author_id`, `book_id`, `author_id`) VALUES
(1, 1, 31);

-- --------------------------------------------------------

--
-- Struktura tabulky `library_copies`
--

CREATE TABLE `library_copies` (
  `copy_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `acquisition_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `condition` enum('new','very_good','good','worn','very_worn','damaged') NOT NULL DEFAULT 'good',
  `status` enum('available','checked_out','reserved','lost','damaged') NOT NULL DEFAULT 'available',
  `copy_number` int(11) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_copies`
--

INSERT INTO `library_copies` (`copy_id`, `book_id`, `barcode`, `acquisition_date`, `condition`, `status`, `copy_number`, `location`, `notes`) VALUES
(1, 1, '123456789', '2024-11-26 17:51:21', 'good', 'available', 0, 'Polička 1A', '');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_genres`
--

CREATE TABLE `library_genres` (
  `genre_id` int(11) NOT NULL,
  `genre` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_genres`
--

INSERT INTO `library_genres` (`genre_id`, `genre`) VALUES
(1, 'romanismus');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_loans`
--

CREATE TABLE `library_loans` (
  `loan_id` int(11) NOT NULL,
  `copy_id` int(11) NOT NULL,
  `reader_id` int(11) NOT NULL,
  `loan_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_return` timestamp NULL DEFAULT NULL,
  `status` enum('ongoing','returned','late','lost') NOT NULL,
  `notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_loans`
--

INSERT INTO `library_loans` (`loan_id`, `copy_id`, `reader_id`, `loan_date`, `due_date`, `date_return`, `status`, `notes`) VALUES
(1, 1, 1, '2024-11-19 17:52:44', '2024-12-07 17:52:44', NULL, 'ongoing', ''),
(2, 1, 1, '2024-11-26 17:52:44', '2024-12-14 17:52:44', '2024-11-29 20:59:12', 'returned', '');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_reservations`
--

CREATE TABLE `library_reservations` (
  `reservation_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `reservation_date` date NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `login_history`
--

CREATE TABLE `login_history` (
  `login_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` enum('password','qrcode','passkey') NOT NULL DEFAULT 'password',
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error` text DEFAULT NULL,
  `ip` text DEFAULT NULL,
  `token_id` int(11) DEFAULT NULL,
  `user_agent` text NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `city` text DEFAULT NULL,
  `zip_code` text DEFAULT NULL,
  `region_name` text DEFAULT NULL,
  `country` text DEFAULT NULL,
  `country_code` text DEFAULT NULL,
  `continent` text DEFAULT NULL,
  `continent_code` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `login_history`
--

INSERT INTO `login_history` (`login_id`, `user_id`, `type`, `success`, `error`, `ip`, `token_id`, `user_agent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(2221, 4, 'password', 1, NULL, NULL, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 11:35:42.412333', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2222, 4, 'password', 1, NULL, NULL, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 17:09:45.540043', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2223, 4, 'password', 1, NULL, NULL, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 17:44:55.241476', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2224, 4, 'password', 1, NULL, NULL, 4, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 18:53:07.314183', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2225, 4, 'password', 1, NULL, NULL, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 19:11:33.466966', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2226, 1, 'password', 1, NULL, NULL, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 19:35:15.828622', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2227, 4, 'password', 1, NULL, '109.164.51.14', 7, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 21:01:03.606568', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(2228, 1, 'password', 1, NULL, '109.164.51.14', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 21:21:35.860766', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(2229, 1, 'password', 1, NULL, '109.164.51.14', 9, 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '2026-03-24 21:34:43.817130', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `login_qrcodes`
--

CREATE TABLE `login_qrcodes` (
  `qrcode` varchar(255) NOT NULL,
  `socket` text NOT NULL,
  `user_agent` text NOT NULL,
  `ip` text DEFAULT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `login_qrcodes`
--

INSERT INTO `login_qrcodes` (`qrcode`, `socket`, `user_agent`, `ip`, `created`) VALUES
('0EDTnByMY9x44fv0gNwr92LDIeKp4QmF', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:11:55.058620'),
('1mHz6YSUvsj6quI4keQEUa42tRc9WI4Q', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:26:01.279814'),
('1TcIQx9OHcr2bLL0TQyFol2UnMGWZWmr', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:19:05.987193'),
('2Cfov4tcwHdaSp8z0yp8czxd9YfqMt3N', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:31:38.678774'),
('2Keja5AjBbSg1k6muwbgl0YQelBDZAmb', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:29:20.447255'),
('2m85YWxUcBOKOJYWSSnPivuMroZExG0r', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:30:06.504767'),
('30swCfTqdks3UgLVZN9TpZOres4py2jW', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:28:34.323856'),
('33eLsxMUulT5HGg1vcj72AYKHcpgCGbh', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:20:22.937566'),
('3P6Acm3jPFJN4r5YulwnHLL0ZirLYYdL', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:24:28.981898'),
('3vtJkiWCKM2fpCFn5atDCPAoE7gUKeCq', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:11:23.553911'),
('4HjFGIYsEsBPWc5Xc498rWfiEBetmock', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:18:04.647725'),
('4HpYYYxW5BLRTn0IaMcB0ZNP8z9vIr11', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:30:37.333542'),
('5at99kQDW17jm8TSMO5T3oofKI2mbnuC', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:14:29.711295'),
('5NbbGlSQEMLmmHFvdXGn1sbko5G5y0H2', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:05:46.582901'),
('6kWjts7u0EAeS2VTlbFcXYVaj74EdZ96', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:17:18.686114'),
('7EGa775rvGKKBKgkIsZy66hRi3jnmijU', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:24:44.443526'),
('83u7OkjeorLoID8yaLpC84qMcC08xAGO', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:25:45.942761'),
('8Cb5kCKOwnod4wyXJ3wPEcF6L8l2MNf6', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:09:36.214501'),
('8Jr9Pz2ZVKo8QeJAMGAzdiQsSVHvFcki', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:21:55.160393'),
('8MpL41ZuVYKUyl26iUzLZHMYgSAkpGZy', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:13:13.055111'),
('90r6JOvbxu5vSLZbiHtcFwQMIMBS3Qnh', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:29:05.044481'),
('9gVvYTwMYSmLAcriB5OQO7quE2LaRDS4', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:16:32.558965'),
('a5BvUX2KYzZ7accJkDJZAeywAcxZRRg6', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:09:05.698088'),
('AN3aiJ6Sm6AQyOeBZGgQByevky0O2oYP', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:18:50.620473'),
('AnEmkZ8L6GePzhMJjzIfz3PXZWYeAIKl', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:17:33.975918'),
('bd2uDLkTDWzb3f9VtB00l5disRm0pwnp', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:11:38.731894'),
('BlRO7YmUFeKutMcRAMYlTC4WOpqpqbec', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:18:35.323793'),
('BMCAPBum1fsNVXHJPkI4qmVKAdh7Dkxf', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:22:26.222719'),
('bvnBIoW77BCO8kpw6rOLSiJRT7O6OOX4', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:12:25.859476'),
('C7GaM2aFTwNki0Sa2lKEwEQs4vbjxwMn', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:18:20.027659'),
('cbjd3Mvcf3f6TkhGHRhHfDS6xjvsRoi9', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:29:35.777154'),
('ccG67QlHrGWQdf6tf1H0jYYr74fcqajQ', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:14:45.088010'),
('cGGNde5ydg1ZmWu5c8ecQapZADLs5OKl', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:30:52.559288'),
('CObi9MWREb3Okec2datP7Xqf5tePZ9Z5', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:32:39.945440'),
('cVvDHTheizZxrNZtpsBN6dg57JJki2wi', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:06:47.890975'),
('DmCBYZOxhbK2H6EGSekEyjnJQ85qHqy5', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:07:33.831554'),
('E4d0nHIE2oVYE03dgpmYn9KqTgZtGMu4', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:10:37.583769'),
('eCEOjbiVWRJJV1UiBsA57W8qfKrTzTkM', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:09:51.552594'),
('eFhIfm0KcAMIIz5DoM8bTMcejL3fSmvh', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:06:02.013719'),
('eJ0qn692phz5IYKX3cMx2GdgJ2IWlUqj', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:28:49.670895'),
('f9EDINSP4XdYqXbe797BIYTeATNacAVf', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:13:43.728214'),
('ffeHlH2Anhjirzghpz6aUUYl76d66rrK', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:21:24.506894'),
('FMFICgY3ez4oqSy1XYRrhfpw2Rc0GQLk', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:21:39.845331'),
('FmxXLRH9GnL6C1ZBf1S8JUsjBY1INwIC', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:10:52.897258'),
('FsA7inTnzCweGqxuCXJY6fH3hIcQH0YK', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:10:06.911377'),
('FUjZqtioDc8wgWtDJKbtBuwkprByBQQr', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:15:46.475425'),
('fv8aJDInPHyYlaqqVrH2xjaoqX0UDbnY', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:05:31.261442'),
('G1DtEXcHmmSDIxlw2osAcjYZcj4BSNjW', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:19:52.181092'),
('g2Im5487rP4ZLrX3GC1PS62vI87avR01', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:16:17.183673'),
('gicTCL96lkIb94lhaB9eY1BwcnixPRUz', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:07:18.459679'),
('Gz4d4qB3QvCRkbtoxvyhDdSXVZZGZfr4', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:29:51.157555'),
('htNVz2qMAVJhtARq7uokPRMbjNL0S3Xc', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:19:21.464425'),
('iFHLb8oNxQoXemTIBHVZlE4Nw1T5AoAc', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:16:47.896034'),
('IjBCtvhwftTkhjhdZnlabrZpGms3G355', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:07:49.147342'),
('IObGCcIf55UqLdVyVSGoJDRhGRsaH4H6', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:06:32.643084'),
('Istgy44vf5QMBAULv7B7jlEfMEiusq00', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:26:16.596396'),
('Jaaxy9JtfE7Kf0C6gaMN4MLHAnDA4tmH', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:31:23.300411'),
('jFf6XvuoPbTgokrl8VkOtY2CqJcCaiH0', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:28:03.670670'),
('klLbnQJRDMzMQiWK4DLDqp0DnBjz5v1E', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:20:07.469263'),
('KqgoV2BSm1YdWKERSNZ9aE3DQ737tCcn', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:16:01.718345'),
('L2pxzdmbgdTxJJA7VF2FkMRFce1Q7wce', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:22:11.206755'),
('lbSykcfMBed4uFqVXi8VpEVgeJAmkPST', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:14:14.316251'),
('LGCznlTr8sDoiTjWfhAmKgn2tIQmQyIV', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:15:15.737304'),
('LIwwSn2e4iORFMDkQwEVUHWZtYf36nl1', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:22:41.222280'),
('LmrosBKIa7qYW8Mtte6STime2rojYXjt', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:06:17.323631'),
('LnqQAz8OXcjXzmQ0IhFkVXBCpao5qQi5', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:13:28.423723'),
('M5N5BJXvGegTAvJhUwCEFK6qrQ8O16MG', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:23:12.514685'),
('MmjQOSdQDOEpzgaevTax6kdTl08e16QW', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:11:08.247870'),
('mTMhiAmiDV3PnHhBUwfmv41UZiMQn2y9', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:32:24.582050'),
('MVFr02jBwkZTVgutb84MakHTPEF41V3O', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:22:56.673511'),
('myCNlCvfAf8QtISyKD8a7HLieV9d8YMK', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:09:21.033951'),
('mzCBcN38KPoOHbKCQkY723mE9PbNFiEy', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:24:59.792304'),
('NDEmCgBGKYWN7CfITqe2Vc9yvqTQ11jm', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:27:17.731866'),
('Nw2kCUbYSaVzjfUSWt0r5slC62pa8RFH', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:26:31.909790'),
('NXW9fTZWcp0NxDlqHu6h9dNLBp4O8Gz0', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:28:18.997425'),
('O5lc7nTYjJZ93F1cyNBHtJNRUjvQSAwA', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:12:41.247560'),
('pbimHJQ8C8X5gZ97oDME5tHPmr21GWgE', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:07:03.163326'),
('pd6kn3xuEW4w7Ma0brvCA6lUprfLNHPv', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:25:15.007662'),
('pG7py2vNkYfzPDX9wNbeGILF7uiwE7oY', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:10:22.253695'),
('PPtqUFSGQhilfvn3vJDtPWAybsKQBrAi', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:26:47.195199'),
('PXWsv3jvPB041Qi8mKPHQoCe17YIdWH6', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:23:58.425780'),
('qwzWoNWMKgWpuAlPYsfG8yhKhpv18yg0', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:30:21.984092'),
('qxPiAPitQc30MSIk2zGX2JLTORx1hZyh', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:17:03.286946'),
('r0t2CBz2lhuBVPa9IBdULtSWLvmjfwer', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:20:53.827544'),
('RmOS3nvqZ8GIJGQT6OJW7oz1rHuiwiUQ', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:23:43.100315'),
('SMpXeoQVn3KXKbj6BUKRhlWPoKjlCFY2', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:15:00.437211'),
('T8hG0chxpvXZK3uWxEtrdoKaQZddNHtV', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:31:54.090776'),
('TBL9bPnQXawVzSZBQWeZl1pWPQYHgn4F', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:08:19.694769'),
('tFp5OCAD0QXs1X5hNA0npagizOyOhmsa', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:08:50.350756'),
('trkgi7X2OLVAossw4UTwCVSFJmdrwRby', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:21:09.207815'),
('u3MXRFj3IORw6MYple1gXzTRRbkI2ckO', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:23:27.725404'),
('ucrvWpOipyXJYjq9319Zvmt1tiTJv9Qp', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:32:09.290898'),
('uK8udmjNinMQFKyYuvJNYqcSFW0M8zeE', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:12:57.646233'),
('vqD5gdTywkjCDYaUlx27aBk5L5E3uy4y', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:12:10.497165'),
('W7RjAj8QDhSKT0R4FDOM7Mr504IUBQSX', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:08:04.392666'),
('wyr9jxTVfLVa6TQidULbzKxb7yImUEZx', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:25:30.264078'),
('XoIbfVQrcXh2NRRGw5hFG2J7wHfdlHnN', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:31:07.892458'),
('xt8qvwm2LoZuwQj89eMGG67cg3vLvqpl', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:20:38.410216'),
('y4DG8BYt37gR795O92TWN9PrCot9YGua', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:27:48.347179'),
('YnlE4y07FlYH5XW9M1gTy5IJhuQu4zLx', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:27:02.470257'),
('yNUa2vmR2B9vztipAH0sG6W2e6eHhoYh', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:15:31.091866'),
('yoHq9PeYZO2LRoZluxkyPDw7IIWMoKpS', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:05:16.011752'),
('yRGgk00fqgeUIIYzqlHCULwTx6OawWBj', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:17:49.285523'),
('YVXD2yaCKaACm1TH6KTUxh3R7Oswv9SX', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:19:36.759360'),
('yxuBBFnxbAMVyT4FZRTJtm3fn0Bv4v0y', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:13:59.079018'),
('zaYM6G8yjWQJixayUP7EYz8hKbYUWlmJ', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:27:33.028898'),
('zbpTRfBwAT2xeP8q2dzVRBuCeZ94mToi', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:08:35.068758'),
('zIzTdzLw1EuysyLhrhaQeVnvkYIaQntS', '9cf26d7671def519', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '::ffff:127.0.0.1', '2026-03-24 22:24:13.678783');

-- --------------------------------------------------------

--
-- Struktura tabulky `marking_scales`
--

CREATE TABLE `marking_scales` (
  `ms_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `grade_1_min` decimal(5,2) NOT NULL DEFAULT 90.00,
  `grade_2_min` decimal(5,2) NOT NULL DEFAULT 75.00,
  `grade_3_min` decimal(5,2) NOT NULL DEFAULT 60.00,
  `grade_4_min` decimal(5,2) NOT NULL DEFAULT 45.00,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Vypisuji data pro tabulku `marking_scales`
--

INSERT INTO `marking_scales` (`ms_id`, `teacher_id`, `is_default`, `name`, `grade_1_min`, `grade_2_min`, `grade_3_min`, `grade_4_min`, `updated_at`) VALUES
(2, 4, 1, 'Nevýchozí tabulka', 95.00, 90.00, 85.00, 70.00, '2025-11-08 22:28:11');

-- --------------------------------------------------------

--
-- Struktura tabulky `marking_scales_groups`
--

CREATE TABLE `marking_scales_groups` (
  `msg_id` int(11) NOT NULL,
  `ms_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `marking_scales_groups`
--

INSERT INTO `marking_scales_groups` (`msg_id`, `ms_id`, `group_id`, `subject_id`, `updated_at`) VALUES
(1, 2, 9, 31, '2025-12-04 16:39:06'),
(2, 2, 9, 33, '2025-11-08 22:27:09'),
(3, 2, 2, 32, '2025-12-01 21:59:27'),
(4, 2, 10, 35, '2025-12-01 21:59:37');

-- --------------------------------------------------------

--
-- Struktura tabulky `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `topic` text DEFAULT NULL,
  `message` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `require_confirm` tinyint(1) NOT NULL DEFAULT 0,
  `excuse_date_from` date DEFAULT NULL,
  `excuse_date_to` date DEFAULT NULL,
  `excuse_hour_from` int(11) DEFAULT NULL,
  `excuse_hour_to` int(11) DEFAULT NULL,
  `excuse_all_day` tinyint(1) DEFAULT NULL,
  `message_rating_type` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `messages`
--

INSERT INTO `messages` (`message_id`, `type`, `topic`, `message`, `author_id`, `sent_at`, `deleted`, `require_confirm`, `excuse_date_from`, `excuse_date_to`, `excuse_hour_from`, `excuse_hour_to`, `excuse_all_day`, `message_rating_type`) VALUES
(1, 0, NULL, 'Zkouškaa :¨)', 1, '2025-11-22 17:21:27', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 0, NULL, 'Zkouškaa :¨)', 1, '2025-11-22 17:21:27', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 0, NULL, 'Dobrý den,\n\nzasílám Vám tuto zkušební zprávu :)\n\nxxx', 1, '2025-11-22 17:21:27', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 0, NULL, 'asdasdasdasddas', 2, '2025-11-22 17:21:27', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 0, NULL, 'asdasd', 2, '2025-11-22 17:21:27', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 1, 'Seminární práce', 'Vážení studenti, připomínám zítřejší termín odevzdání seminárních prací. Prosím nahrajte je do systému do 23:59.', 4, '2025-11-30 23:40:34', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 1, 'Změna výuky', 'Z důvodu havárie vody bude zítra 24.11. zkrácené vyučování. Konec výuky ve 12:35.', 4, '2025-11-30 23:40:56', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 1, 'Vánoční jarmark', 'Vánoční jarmark se blíží! Přijďte nás podpořit a nakoupit drobné dárky. Výtěžek půjde na charitu.', 2, '2025-11-30 23:41:22', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 1, 'Zkouška', 'Nová zpráva na nástěnce, funguje to?', 4, '2025-12-16 22:20:10', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 0, 'Dlouhodobka', 'DlouhodobkaDlouhodobka', 4, '2026-03-10 14:32:47', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 0, 'Nová zpráva - test notifikace', 'Oukej doukej', 4, '2026-03-10 15:32:54', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 0, '123', '3333', 4, '2026-03-10 16:18:24', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 3, NULL, 'Dnes se zapojoval do výuky.', 4, '2026-03-11 21:47:23', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `messages_drafts`
--

CREATE TABLE `messages_drafts` (
  `draft_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `topic` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `receivers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`receivers`)),
  `require_confirm` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `messages_drafts`
--

INSERT INTO `messages_drafts` (`draft_id`, `author_id`, `type`, `topic`, `message`, `receivers`, `require_confirm`, `updated_at`) VALUES
(3, 1, 0, NULL, '', '[6,7]', 0, '2026-03-08 22:13:16');

-- --------------------------------------------------------

--
-- Struktura tabulky `messages_files`
--

CREATE TABLE `messages_files` (
  `ma_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `messages_receivers`
--

CREATE TABLE `messages_receivers` (
  `message_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `messages_receivers`
--

INSERT INTO `messages_receivers` (`message_id`, `receiver_id`, `read_at`, `confirmed_at`) VALUES
(1, 4, '2025-12-07 11:36:03', NULL),
(2, 4, '2025-11-22 17:53:00', NULL),
(2, 11, NULL, NULL),
(2, 19, NULL, NULL),
(2, 23, NULL, NULL),
(3, 2, '2025-12-01 22:00:08', NULL),
(3, 4, '2025-11-23 13:05:17', NULL),
(4, 4, '2025-11-23 13:05:18', NULL),
(5, 2, '2026-01-24 13:29:54', NULL),
(5, 4, '2025-11-23 13:05:18', NULL),
(5, 25, NULL, NULL),
(5, 31, NULL, NULL),
(6, 1, '2026-02-08 21:22:57', NULL),
(6, 2, '2026-02-13 23:03:16', NULL),
(6, 4, '2025-11-30 23:51:21', NULL),
(7, 1, '2026-02-08 21:22:59', NULL),
(7, 4, '2026-02-12 18:24:36', NULL),
(8, 1, '2026-02-08 21:25:20', NULL),
(8, 4, '2026-02-13 22:01:44', NULL),
(9, 1, '2026-02-08 21:24:36', NULL),
(9, 2, '2026-03-10 20:50:36', NULL),
(9, 4, '2026-02-13 22:02:45', NULL),
(10, 2, '2026-03-10 14:33:12', NULL),
(11, 2, NULL, NULL),
(12, 2, NULL, NULL),
(13, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `message_groups`
--

CREATE TABLE `message_groups` (
  `group_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('class','custom','dm') NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `message_reactions`
--

CREATE TABLE `message_reactions` (
  `reaction_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `message_recipient_groups`
--

CREATE TABLE `message_recipient_groups` (
  `group_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `message_recipient_groups`
--

INSERT INTO `message_recipient_groups` (`group_id`, `name`, `author_id`, `created_at`) VALUES
(3, 'a', 4, '2026-03-09 18:55:41');

-- --------------------------------------------------------

--
-- Struktura tabulky `message_recipient_group_members`
--

CREATE TABLE `message_recipient_group_members` (
  `group_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `message_recipient_group_members`
--

INSERT INTO `message_recipient_group_members` (`group_id`, `person_id`) VALUES
(3, 6),
(3, 7),
(3, 8);

-- --------------------------------------------------------

--
-- Struktura tabulky `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `url` varchar(500) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `type`, `data`, `url`, `read_at`, `created_at`) VALUES
(1, 2, 'new_login', '{\"id\":1562,\"city\":\"Singapore\",\"country_code\":\"SG\"}', NULL, '2026-02-10 10:28:22', '2026-01-25 23:24:26'),
(3, 1, 'new_grade', '{\"mark\":3}', NULL, '2026-02-12 15:50:07', '2026-02-06 23:27:09'),
(4, 4, 'new_login', '{\"id\":1641,\"city\":\"Secaucus\",\"ip\":\"155.117.189.23\",\"country\":\"United States\",\"country_code\":\"US\"}', NULL, '2026-02-10 10:39:15', '2026-02-10 11:10:06'),
(6, 2, 'new_login', '{\"id\":1643,\"city\":\"Secaucus\",\"ip\":\"155.117.189.23\",\"country\":\"United States\",\"country_code\":\"US\"}', NULL, '2026-02-13 22:14:05', '2026-02-10 11:25:00'),
(7, 4, 'new_login', '{\"id\":1644,\"city\":\"Secaucus\",\"ip\":\"155.117.189.23\",\"country\":\"United States\",\"country_code\":\"US\"}', NULL, '2026-02-11 11:16:41', '2026-02-10 11:38:32'),
(8, 1, 'new_grade', '{\"mark\":2}', NULL, '2026-02-15 21:00:03', '2026-02-12 19:24:14'),
(9, 4, 'new_login', '{\"id\":1667,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 20:52:04'),
(10, 4, 'new_login', '{\"id\":1668,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 20:52:11'),
(11, 4, 'new_login', '{\"id\":1669,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 20:52:17'),
(12, 4, 'new_login', '{\"id\":1670,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 21:33:28'),
(13, 4, 'new_login', '{\"id\":1671,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 21:33:40'),
(14, 4, 'new_login', '{\"id\":1672,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 21:34:59'),
(15, 4, 'new_login', '{\"id\":1673,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 21:56:40'),
(16, 4, 'new_login', '{\"id\":1674,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 21:56:43'),
(17, 4, 'new_login', '{\"id\":1675,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 21:56:57'),
(18, 4, 'new_login', '{\"id\":1676,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 22:00:01'),
(19, 4, 'new_login', '{\"id\":1677,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 22:02:42'),
(20, 4, 'new_login', '{\"id\":1678,\"city\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-13 21:05:26', '2026-02-13 22:04:10'),
(21, 5, 'new_grade', '{\"mark\":3}', NULL, NULL, '2026-02-15 18:10:16'),
(22, 8, 'new_login', '{\"id\":1748,\"city\":\"České Budějovice\",\"ip\":\"109.164.51.14\",\"country\":\"Czechia\",\"country_code\":\"CZ\"}', NULL, NULL, '2026-02-18 22:16:38'),
(23, 5, 'new_grade', '{\"mark\":5}', NULL, NULL, '2026-02-22 13:24:54'),
(24, 1, 'new_grade', '{\"mark\":2}', NULL, '2026-02-22 13:49:21', '2026-02-22 13:28:44'),
(25, 5, 'new_grade', '{\"mark\":7.5}', NULL, NULL, '2026-02-22 13:28:51'),
(26, 5, 'new_grade', '{\"mark\":8.5}', NULL, NULL, '2026-02-22 13:29:20'),
(27, 5, 'new_grade', '{\"mark\":8.4}', NULL, NULL, '2026-02-22 13:29:25'),
(28, 5, 'new_grade', '{\"mark\":8.9}', NULL, NULL, '2026-02-22 13:29:30'),
(29, 5, 'new_grade', '{\"mark\":9}', NULL, NULL, '2026-02-22 13:29:33'),
(30, 5, 'new_grade', '{\"mark\":9.4}', NULL, NULL, '2026-02-22 13:29:37'),
(31, 5, 'new_grade', '{\"mark\":9.5}', NULL, NULL, '2026-02-22 13:29:40'),
(32, 5, 'new_grade', '{\"mark\":10}', NULL, NULL, '2026-02-22 13:29:43'),
(33, 5, 'new_grade', '{\"mark\":9.5}', NULL, NULL, '2026-02-22 13:31:49'),
(34, 1, 'new_grade', '{\"mark\":0}', NULL, '2026-02-22 13:49:21', '2026-02-22 13:58:54'),
(35, 1, 'new_grade', '{\"mark\":5}', NULL, '2026-02-22 13:49:21', '2026-02-22 13:59:02'),
(36, 1, 'new_grade', '{\"mark\":1}', NULL, '2026-02-22 13:49:21', '2026-02-22 13:59:19'),
(37, 1, 'new_grade', '{\"mark\":10}', NULL, '2026-02-22 13:49:21', '2026-02-22 13:59:25'),
(38, 1, 'new_grade', '{\"mark\":5}', NULL, '2026-02-22 13:49:21', '2026-02-22 13:59:32'),
(39, 1, 'new_grade', '{\"mark\":5}', NULL, '2026-02-22 13:49:21', '2026-02-22 14:07:09'),
(40, 1, 'new_grade', '{\"mark\":9}', NULL, '2026-02-26 10:45:20', '2026-02-26 00:54:16'),
(41, 5, 'new_grade', '{\"mark\":1}', NULL, NULL, '2026-02-26 12:11:38'),
(42, 4, 'new_login', '{\"id\":2035,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-28 19:19:54', '2026-02-28 18:06:10'),
(43, 4, 'new_login', '{\"id\":2036,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-28 19:19:54', '2026-02-28 19:47:18'),
(44, 4, 'new_login', '{\"id\":2037,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, '2026-02-28 19:19:54', '2026-02-28 20:17:22'),
(45, 12, 'new_login', '{\"id\":2099,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, NULL, '2026-03-05 08:44:41'),
(46, 2, 'new_message', '{\"title\":\"Zpráva od Martin Tuška\",\"body\":\"123\",\"senderName\":\"Martin Tuška\",\"subject\":\"123\",\"messageId\":12}', NULL, '2026-03-10 20:47:01', '2026-03-10 17:18:24'),
(47, 13, 'new_login', '{\"id\":2180,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, NULL, '2026-03-12 12:52:36'),
(48, 4, 'new_login', '{\"id\":2221,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, '2026-03-22 18:27:13', '2026-03-22 12:35:42'),
(49, 1, 'new_login', '{\"id\":2226,\"city\":null,\"ip\":null,\"country\":null,\"country_code\":null}', NULL, '2026-03-24 20:16:32', '2026-03-24 20:35:15'),
(50, 4, 'new_login', '{\"id\":2227,\"city\":\"České Budějovice\",\"ip\":\"109.164.51.14\",\"country\":\"Czechia\",\"country_code\":\"CZ\"}', NULL, '2026-03-24 21:01:07', '2026-03-24 22:01:03'),
(51, 1, 'new_login', '{\"id\":2228,\"city\":\"České Budějovice\",\"ip\":\"109.164.51.14\",\"country\":\"Czechia\",\"country_code\":\"CZ\"}', NULL, '2026-03-24 21:21:42', '2026-03-24 22:21:35');

-- --------------------------------------------------------

--
-- Struktura tabulky `notification_rules`
--

CREATE TABLE `notification_rules` (
  `rule_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conditions`)),
  `enabled` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `notification_rules`
--

INSERT INTO `notification_rules` (`rule_id`, `user_id`, `type`, `conditions`, `enabled`, `created_at`, `updated_at`) VALUES
(2, 4, 'absence_new', '{}', 0, '2026-01-25 19:53:38', '2026-01-25 19:55:31'),
(3, 4, 'substitution_new', '{}', 0, '2026-01-25 19:53:39', '2026-01-25 19:55:32'),
(6, 1, 'grade_new', '{}', 1, '2026-02-06 23:11:43', '2026-02-06 23:11:43'),
(7, 1, 'message_new', '{}', 0, '2026-02-06 23:30:55', '2026-02-06 23:30:56');

-- --------------------------------------------------------

--
-- Struktura tabulky `oauth_tokens`
--

CREATE TABLE `oauth_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `access_token` text NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `online_lessons`
--

CREATE TABLE `online_lessons` (
  `lesson_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `platform` varchar(50) NOT NULL,
  `link` text NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `passwords`
--

CREATE TABLE `passwords` (
  `password_id` int(11) NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `passwords`
--

INSERT INTO `passwords` (`password_id`, `password`) VALUES
(1, '$2a$12$PBCmBcxYeZbOlsksszrg.ue6dbN0cYMtbJe2Y77vx./KHCPnTAv7e'),
(2, '$2b$12$VP.Q4Akbht2cEIDFZyy79uYGaFw1ga3K1oRmFBJVnreWKV7J65zKq'),
(3, '$2b$12$J7WCzc6YTBtSq9RddgFnLO2WatmhktxR3RsIUSOstWPFh9cg.R6t2'),
(4, '$2b$12$bdlLXRUevW.HRgoq23DEd.fPXPVr2DhIbsbHziv5EkHT4SY96lIpW'),
(5, '$2b$12$jD.WaPJnHKZN2EU/1rvuwe6aYI31mWBEyfJbQUyFWbiQb1Ie2Y9La'),
(6, '$2b$12$CbR.wKn/shtvNv7IiW1sgOXclHeKaNq6294aXWqb4tUm2pWj.Jtrq'),
(7, '$2b$12$33QMiqADZdT0u5U.2SQQEOO1ckt5R8oONOaitVnrOysQJevCcfUBq'),
(8, '$2b$12$fum0BboY2xESq9TF3FlpRORtfoIvCNStckKtxEv.zkjRjuGavPUy.'),
(9, '6b9bf1373be4be6755043bc1ce4f54176df8fe83e1ffd8cae022d3d51ef121f6'),
(10, '6b9bf1373be4be6755043bc1ce4f54176df8fe83e1ffd8cae022d3d51ef121f6'),
(11, '$2b$12$Yya7/UbyV03mo1q9GR6eP.MAtTVTlwb1MR2NL5RXIAjpHmYSoJTha'),
(12, '$2b$12$8NPimS9l8MiADZ8ixHq72ecpD0crbh0G5oLKGD04q218/Dyk/nkgq'),
(13, '$2b$12$hVyOFEnORxN83KfGVs9X/eiUC7VsnE3LphppDqJ7T2OLxOF6hHqHW'),
(14, '$2b$12$82UHqD5CH8fZy2ZCxVO4W.6/eybuB1ANb1vYgJKER8ZzddoGih0q6'),
(15, '$2b$12$FeG1w68AHvjyWquvZfKBK.1BU6X4WxafZFjIJWSrvTtwtsvdH8qja'),
(18, '$2b$10$1sbsCUBR6xS8qW9ZlexW/uiUTc55iUscZuLrQXGqGDk0mH3KIbg/e'),
(19, '$2b$12$y5s4xNVIOtMTSg089gKVh.26VCHB4CeZC7rubu9eXLQ30JxZ48.OK'),
(20, '$2b$12$T1yfZTA42STXYOQVPRVIielsVXgC3KRSMNZBf5RFJ1mpaBn0M2W6.'),
(21, '$2b$12$vDZnDJLUevsrfW5XrEXgd.Nx5j5VhDdnYYOIQ2Ru4hByfRtbLjt0y'),
(22, '$2b$12$X5uFIQuVqa/C3POYOTLviO8R0M4qyETJnPfj8lWNo7NgSjDGB1BY2'),
(23, '$2b$12$v8TbvVcJPCJB2QA169LFvurm76/Iw2fF3foOg5KZUzxmx2IMX7Qn2'),
(24, '$2b$12$ba3YQgzJM50GUivHgjuDOO90N8qIJkJ84yUsIdWc5BcXPgVWg6JM.'),
(25, '$2b$12$RKM3uNvUM0WE6whHHSh9FeJsSJn0WSGYrDMQoYOhJqWl4G/BX4/cS'),
(26, '$2b$12$MJ5CDk9.2y5UHqH2gApuEuDk3gSh7vpRpqlAYciVIywxDyxIf44Je');

-- --------------------------------------------------------

--
-- Struktura tabulky `payments_classes`
--

CREATE TABLE `payments_classes` (
  `payment_class_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `balance` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `payments_columns`
--

CREATE TABLE `payments_columns` (
  `payment_column_id` int(11) NOT NULL,
  `payment_class_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `due_date` timestamp NULL DEFAULT NULL,
  `description` text NOT NULL,
  `amount` int(11) NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `payments_payments`
--

CREATE TABLE `payments_payments` (
  `payment_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `payment_column_id` int(11) NOT NULL,
  `amount_paid` bigint(20) NOT NULL,
  `paid_at` date NOT NULL DEFAULT current_timestamp(),
  `payment_method` enum('cash','card','bank_transfer','other') NOT NULL DEFAULT 'other',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int(11) NOT NULL,
  `permission_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`, `description`) VALUES
(1, 'users.view', 'Zobrazení seznamu uživatelů'),
(2, 'users.edit', 'Úprava uživatelů'),
(3, 'users.delete', 'Mazání uživatelů'),
(4, 'roles.view', 'Zobrazení rolí'),
(5, 'roles.edit', 'Správa rolí a oprávnění'),
(6, 'grades.view', 'Zobrazení známek'),
(7, 'grades.edit', 'Zapisování známek'),
(8, 'classbook.view', 'Zobrazení třídnice'),
(9, 'classbook.edit', 'Zápis do třídnice'),
(10, 'admin.panel', 'Přístup do administrace'),
(11, 'system.status', NULL),
(12, 'audit.view', NULL),
(13, 'architecture.view', NULL),
(14, 'architecture.edit', NULL),
(15, 'employees.view', NULL),
(16, 'employees.edit', NULL),
(17, 'attendance.view', NULL),
(18, 'attendance.manage', NULL),
(19, 'vacations.view', NULL),
(20, 'vacations.manage', NULL),
(21, 'salaries.view', NULL),
(22, 'salaries.manage', NULL),
(23, 'bonuses.view', NULL),
(24, 'bonuses.manage', NULL),
(25, 'students.edit', NULL),
(26, 'students.view', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `persons`
--

CREATE TABLE `persons` (
  `person_id` int(11) NOT NULL,
  `last_name` text NOT NULL,
  `first_name` text NOT NULL,
  `gender` int(11) NOT NULL,
  `birthday` date DEFAULT NULL,
  `birthnum` varchar(16) DEFAULT NULL,
  `birthplace_id` int(11) DEFAULT NULL,
  `address_id` int(11) DEFAULT NULL,
  `insurance_id` int(11) DEFAULT NULL,
  `nationality_id` int(11) DEFAULT NULL,
  `data_box` varchar(255) DEFAULT NULL,
  `avatar` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `persons`
--

INSERT INTO `persons` (`person_id`, `last_name`, `first_name`, `gender`, `birthday`, `birthnum`, `birthplace_id`, `address_id`, `insurance_id`, `nationality_id`, `data_box`, `avatar`) VALUES
(1, 'Kosik', 'Josef', 0, '2006-08-14', '222222222', 1, 2, 201, 60, NULL, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"26yt70\",\"rotate\":341,\"eyes\":\"variant6W14\",\"eyesColor\":\"3c2005\",\"face\":\"variant5\",\"faceOffsetX\":0,\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"1c799f\"}'),
(2, 'Pizinger', 'Jakub', 0, '1995-01-19', '', 1, 1, NULL, NULL, NULL, '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9jjrig\",\"rotate\":37,\"faceOffsetX\":15,\"eyes\":\"variant1W12\",\"eyesColor\":\"000000\",\"backgroundColor\":\"transparent\"}'),
(3, 'Bakala', 'Břetislav', 0, '1994-01-21', '', 1, 1, NULL, NULL, NULL, NULL),
(4, 'Tuška', 'Pavel', 0, '1994-01-21', '', 1, 1, NULL, NULL, NULL, '{\"type\":\"thumbs\",\"seed\":\"jszgw3\",\"radius\":50,\"rotate\":37,\"eyes\":\"variant4W10\",\"eyesColor\":\"000000\",\"face\":\"variant2\",\"mouth\":\"variant2\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"transparent\",\"faceOffsetX\":-13}'),
(5, 'Benedikt', 'Miloš', 0, '1994-01-21', '', 1, 1, NULL, NULL, NULL, NULL),
(6, 'Brůžek', 'Petr', 0, '1994-01-21', '', 1, 1, NULL, NULL, NULL, NULL),
(7, 'Burger', 'Michal', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(8, 'Englický', 'Pavel', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(9, 'Havlan', 'Josef', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(10, 'Habartová', 'Jindřiška', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(11, 'Janoušek', 'Milan', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(12, 'Kašpar', 'Miroslav', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(13, 'Klavíková', 'Ludmila', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(14, 'Kotková', 'Hana', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(15, 'Kouďová', 'Milena', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(16, 'Krásová', 'Petra', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(17, 'Novotná', 'Václava', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(18, 'Pecková', 'Radka', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(19, 'Procházková', 'Olga', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(20, 'Průdek', 'Milan', 0, '2003-08-27', '', 1, 1, NULL, NULL, NULL, NULL),
(21, 'Štěpán', 'Luděk', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(22, 'Třeštíková', 'Kornelie', 1, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(23, 'Vejvoda', 'Luboš', 0, '1998-01-14', '', 1, 1, NULL, NULL, NULL, NULL),
(24, 'Pinokio', 'Kryštof', 0, '2007-04-07', NULL, 1, 1, NULL, 1, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Kryštof Pinokio\"}}'),
(25, 'Bayer', 'Josef', 0, '2004-01-24', NULL, 1, 1, 205, 60, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Josef Bayer\"}}'),
(26, 'Pikl', 'Adam', 0, '2007-02-16', '', 1, 1, NULL, NULL, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Adam Pikl\"}}'),
(27, 'Novák', 'Adam', 0, '2007-02-17', NULL, 1, 1, NULL, 1, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Adam Rataj\"}}'),
(28, 'Hercig', 'Alex', 0, '2006-05-19', '', 1, 1, NULL, NULL, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Alex Hercig\"}}'),
(29, 'Jára', 'Daniel', 1, '2006-01-21', NULL, 1, 1, NULL, 1, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Daniel Jakl\"}}'),
(30, 'Břicháček', 'David', 0, '2006-12-15', '', 1, 1, NULL, NULL, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"David Břicháček\"}}'),
(31, 'Kozjura', 'Filip', 0, '2006-10-18', '', 1, 1, NULL, NULL, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Filip Kozjura\"}}'),
(32, 'Baček', 'Filip', 0, '2006-01-28', NULL, 1, 1, NULL, 60, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Filip Bouček\"}}'),
(33, 'Bartínek', 'Adam', 0, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(34, 'Špirhanzlová', 'Vladimíra', 1, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(35, 'Kinkor', 'Jiří', 0, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(36, 'Dušek', 'Jiří', 0, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(37, 'Němec', 'Lukáš', 0, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(38, 'Obecný', 'Numax', 0, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(39, 'Vyroubal', 'Pavel', 0, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL),
(40, 'Němec', 'Lukáš', 0, '2007-05-11', NULL, 1, NULL, 201, NULL, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Lukáš Němec\"}}'),
(41, 'Mácha', 'Michal', 0, '2006-08-02', NULL, 1, NULL, 111, NULL, NULL, '{\"collection\":\"thumbs\",\"options\":{\"seed\":\"Michal Mácha\"}}'),
(44, 'Kosík', 'Josef', 0, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL),
(45, 'Kosik', 'Josef', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 'Kosik', 'Josef', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `persons_degree`
--

CREATE TABLE `persons_degree` (
  `person_id` int(11) NOT NULL,
  `degree_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `persons_degree`
--

INSERT INTO `persons_degree` (`person_id`, `degree_id`) VALUES
(4, 3),
(5, 3),
(12, 3),
(34, 3),
(35, 3),
(38, 3),
(6, 5),
(7, 5),
(8, 5),
(10, 5),
(11, 5),
(13, 5),
(14, 5),
(15, 5),
(17, 5),
(18, 5),
(19, 5),
(22, 5),
(23, 5),
(36, 5),
(2, 6),
(9, 15),
(16, 15);

-- --------------------------------------------------------

--
-- Struktura tabulky `phone_numbers`
--

CREATE TABLE `phone_numbers` (
  `code` int(11) NOT NULL,
  `number` text NOT NULL,
  `person_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `phone_code` text DEFAULT NULL,
  `code_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `polls`
--

CREATE TABLE `polls` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('feedback','test') NOT NULL DEFAULT 'feedback',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `time_limit` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `polls`
--

INSERT INTO `polls` (`id`, `title`, `description`, `type`, `created_by`, `created_at`, `time_limit`) VALUES
(1, 'Zkouska', '', 'test', 4, '2026-01-24 22:29:28', 45);

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_answers`
--

CREATE TABLE `poll_answers` (
  `id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` text DEFAULT NULL,
  `option_id` int(11) DEFAULT NULL,
  `option_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`option_ids`)),
  `points_awarded` int(11) DEFAULT NULL,
  `is_manually_graded` tinyint(1) NOT NULL DEFAULT 0,
  `selected_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `poll_answers`
--

INSERT INTO `poll_answers` (`id`, `response_id`, `question_id`, `answer_text`, `option_id`, `option_ids`, `points_awarded`, `is_manually_graded`, `selected_at`) VALUES
(1, 1, 1, 'Jabko', NULL, NULL, 2, 1, '2026-02-14 12:59:49');

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_assigns`
--

CREATE TABLE `poll_assigns` (
  `poll_assign_id` int(11) NOT NULL,
  `poll_id` int(11) NOT NULL,
  `start` timestamp NOT NULL DEFAULT current_timestamp(),
  `end` timestamp NOT NULL DEFAULT current_timestamp(),
  `time_limit` int(11) NOT NULL DEFAULT 0,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT 0,
  `shuffle_options` tinyint(1) NOT NULL DEFAULT 0,
  `show_results` tinyint(1) NOT NULL DEFAULT 0,
  `allow_review` tinyint(1) NOT NULL DEFAULT 0,
  `grade_column` int(11) DEFAULT NULL,
  `assign_by` int(11) NOT NULL,
  `assign_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `poll_assigns`
--

INSERT INTO `poll_assigns` (`poll_assign_id`, `poll_id`, `start`, `end`, `time_limit`, `shuffle_questions`, `shuffle_options`, `show_results`, `allow_review`, `grade_column`, `assign_by`, `assign_at`) VALUES
(1, 1, '2026-02-12 18:51:00', '2026-02-13 11:00:00', 0, 1, 1, 1, 1, NULL, 4, '2026-02-12 19:53:48'),
(2, 1, '2026-02-12 18:57:00', '2026-02-13 11:00:00', 90, 1, 1, 1, 1, NULL, 4, '2026-02-12 20:03:18');

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_assign_recipients`
--

CREATE TABLE `poll_assign_recipients` (
  `poll_assign_recipient_id` int(11) NOT NULL,
  `poll_assign_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `assigned` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `poll_assign_recipients`
--

INSERT INTO `poll_assign_recipients` (`poll_assign_recipient_id`, `poll_assign_id`, `group_id`, `subject_id`, `assigned`) VALUES
(1, 2, 9, 31, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_options`
--

CREATE TABLE `poll_options` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `label` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_questions`
--

CREATE TABLE `poll_questions` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) NOT NULL,
  `title` text NOT NULL,
  `type` enum('text','single','multiple') NOT NULL DEFAULT 'text',
  `points` int(11) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `poll_questions`
--

INSERT INTO `poll_questions` (`id`, `poll_id`, `title`, `type`, `points`, `order`) VALUES
(1, 1, 'Co je těžší?', 'text', 2, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_responses`
--

CREATE TABLE `poll_responses` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) NOT NULL,
  `poll_assign_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `total_score` int(11) DEFAULT NULL,
  `total_max_score` int(11) DEFAULT NULL,
  `percentage` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `poll_responses`
--

INSERT INTO `poll_responses` (`id`, `poll_id`, `poll_assign_id`, `student_id`, `started_at`, `submitted_at`, `total_score`, `total_max_score`, `percentage`, `metadata`) VALUES
(1, 1, NULL, 1, '2026-02-12 20:57:25', '2026-02-14 12:59:49', 2, 2, 100, '{}');

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_response_questions`
--

CREATE TABLE `poll_response_questions` (
  `id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `display_order` int(11) NOT NULL,
  `options_order` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options_order`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `poll_response_questions`
--

INSERT INTO `poll_response_questions` (`id`, `response_id`, `question_id`, `display_order`, `options_order`) VALUES
(1, 1, 1, 0, '[]');

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_shares`
--

CREATE TABLE `poll_shares` (
  `poll_share_id` int(11) NOT NULL,
  `poll_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `is_valid` tinyint(1) NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `poll_shares`
--

INSERT INTO `poll_shares` (`poll_share_id`, `poll_id`, `person_id`, `is_valid`, `added_at`) VALUES
(1, 1, 5, 1, '2026-02-16 17:44:42'),
(2, 1, 2, 1, '2026-02-16 17:44:57');

-- --------------------------------------------------------

--
-- Struktura tabulky `push_subscriptions`
--

CREATE TABLE `push_subscriptions` (
  `subscription_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` varchar(255) NOT NULL,
  `auth` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `report_cards`
--

CREATE TABLE `report_cards` (
  `rc_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `issued_at` datetime NOT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `rewards`
--

CREATE TABLE `rewards` (
  `reward_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `type` enum('financial','certificate','prize','other') NOT NULL,
  `status` enum('pending','collected') DEFAULT 'pending',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `collected_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `role_key` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `role_key`, `description`) VALUES
(1, 'Administrátor', 'admin', 'Plný přístup k systému'),
(2, 'Učitel', 'teacher', 'Přístup k výukovým funkcím'),
(3, 'Student', 'student', 'Základní přístup studenta'),
(4, 'Rodič', 'parent', 'Přístup pro zákonné zástupce');

-- --------------------------------------------------------

--
-- Struktura tabulky `role_communication_permissions`
--

CREATE TABLE `role_communication_permissions` (
  `permission_id` int(11) NOT NULL,
  `role_source` text NOT NULL,
  `role_target` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `role_communication_permissions`
--

INSERT INTO `role_communication_permissions` (`permission_id`, `role_source`, `role_target`) VALUES
(1, 'admin', 'admin'),
(2, 'admin', 'parent'),
(3, 'admin', 'student'),
(4, 'admin', 'teacher'),
(5, 'parent', 'teacher'),
(6, 'student', 'teacher'),
(7, 'teacher', 'parent'),
(8, 'teacher', 'student'),
(9, 'teacher', 'teacher'),
(10, 'teacher', 'admin');

-- --------------------------------------------------------

--
-- Struktura tabulky `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(2, 8),
(2, 9),
(2, 15),
(2, 26);

-- --------------------------------------------------------

--
-- Struktura tabulky `schools`
--

CREATE TABLE `schools` (
  `school_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `short_name` text DEFAULT NULL,
  `district_id` int(11) NOT NULL,
  `red_izo` text DEFAULT NULL,
  `ico` text DEFAULT NULL,
  `school_type` text DEFAULT NULL,
  `country_id` int(11) NOT NULL,
  `izo` text DEFAULT NULL,
  `code` text NOT NULL,
  `owner_id` int(11) NOT NULL,
  `total_storage_limit` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `api_token` text NOT NULL,
  `license_type` enum('FREE','BASIC','PRO','DEV') NOT NULL DEFAULT 'FREE',
  `license_until` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_hour` int(11) NOT NULL DEFAULT 8,
  `start_minute` int(11) NOT NULL DEFAULT 0,
  `lesson_hour` int(11) NOT NULL DEFAULT 45,
  `break_time` int(11) NOT NULL DEFAULT 5,
  `reset_password_with_email` int(11) NOT NULL DEFAULT 1,
  `warning_absence_percent` int(11) NOT NULL DEFAULT 20,
  `fastlogin` tinyint(1) NOT NULL DEFAULT 1,
  `modules` text NOT NULL DEFAULT '0',
  `students_limit` int(11) NOT NULL DEFAULT 250,
  `gdpr_first_name` text DEFAULT NULL,
  `gdpr_last_name` text DEFAULT NULL,
  `gdpr_phone` text DEFAULT NULL,
  `gdpr_email` text DEFAULT NULL,
  `gdpr_mobile` text DEFAULT NULL,
  `gdpr_databox` text DEFAULT NULL,
  `gdpr_web` text DEFAULT NULL,
  `auth_classic` tinyint(1) DEFAULT 1,
  `auth_ldap` tinyint(1) DEFAULT 0,
  `auth_passkeys` tinyint(1) DEFAULT 0,
  `session_lifetime_minutes` int(11) DEFAULT 480,
  `max_login_attempts` int(11) DEFAULT 5,
  `backup_interval` int(11) DEFAULT NULL,
  `auto_update` tinyint(1) NOT NULL DEFAULT 1,
  `auto_update_interval` int(11) NOT NULL DEFAULT 24,
  `online_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `online_default_platform` varchar(20) NOT NULL DEFAULT 'meet',
  `msg_max_length` int(11) NOT NULL,
  `msg_attachments_max_count` int(11) NOT NULL,
  `msg_attachments_max_size` int(11) NOT NULL,
  `msg_type_private_active` tinyint(1) NOT NULL,
  `msg_type_official_active` tinyint(1) NOT NULL,
  `msg_type_noticeboard_active` tinyint(1) NOT NULL,
  `noticeboard_max_length` int(11) NOT NULL,
  `employee_vacation_days_default` int(11) NOT NULL DEFAULT 25,
  `employee_vacation_requests_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `employee_attendance_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `employee_salaries_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `documents_enabled` tinyint(1) DEFAULT 1,
  `traineeship_enabled` tinyint(1) DEFAULT 1,
  `noticeboard_student_enabled` tinyint(1) DEFAULT 1,
  `noticeboard_teacher_enabled` tinyint(1) DEFAULT 1,
  `tests_enabled` tinyint(1) DEFAULT 1,
  `rewards_enabled` tinyint(1) DEFAULT 1,
  `demo_enabled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `schools`
--

INSERT INTO `schools` (`school_id`, `name`, `short_name`, `district_id`, `red_izo`, `ico`, `school_type`, `country_id`, `izo`, `code`, `owner_id`, `total_storage_limit`, `api_token`, `license_type`, `license_until`, `created`, `start_hour`, `start_minute`, `lesson_hour`, `break_time`, `reset_password_with_email`, `warning_absence_percent`, `fastlogin`, `modules`, `students_limit`, `gdpr_first_name`, `gdpr_last_name`, `gdpr_phone`, `gdpr_email`, `gdpr_mobile`, `gdpr_databox`, `gdpr_web`, `auth_classic`, `auth_ldap`, `auth_passkeys`, `session_lifetime_minutes`, `max_login_attempts`, `backup_interval`, `auto_update`, `auto_update_interval`, `online_enabled`, `online_default_platform`, `msg_max_length`, `msg_attachments_max_count`, `msg_attachments_max_size`, `msg_type_private_active`, `msg_type_official_active`, `msg_type_noticeboard_active`, `noticeboard_max_length`, `employee_vacation_days_default`, `employee_vacation_requests_enabled`, `employee_attendance_enabled`, `employee_salaries_enabled`, `documents_enabled`, `traineeship_enabled`, `noticeboard_student_enabled`, `noticeboard_teacher_enabled`, `tests_enabled`, `rewards_enabled`, `demo_enabled`) VALUES
(1, 'Střední průmyslová a Vyšší odborná škola v Písku', 'SPŠ Písek', 63, '600020266', '60869038', 'high_school', 60, '108054080', 'SPS-PI', 1, 2500000, '24Q7TZDGAEYGUN1H0DMJDHLZROCA76UF77UY1DK5R01VQ120Q4RS45LVU5JIGBV4', 'DEV', NULL, '2024-09-29 17:39:02', 8, 0, 45, 5, 1, 20, 1, '0', -1, 'GDPR', 'ZVAS', '389822501', '', '608057836', '3cdj5ts', 'zvas.cz', 1, 0, 1, 15, 5, 0, 1, 24, 0, 'meet', 0, 0, 0, 1, 1, 1, 0, 25, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0),
(3, 'Střední průmyslová a Vyšší odborná škola v Písku', 'SPŠ Písek', 63, '600020266', '60869038', 'high_school', 60, '108054080', 'SETUP-1771449392751', 44, 10737418240, '019c729c-9e6e-7000-888a-f4cc3846a643', 'FREE', NULL, '2026-02-18 21:16:32', 8, 0, 45, 5, 1, 20, 1, '1', 100, 'GDPR', 'ZVAS', '389822501', '', '608057836', '3cdj5ts', 'zvas.cz', 1, 0, 1, 15, 5, 24, 1, 24, 1, 'meet', 0, 0, 0, 0, 0, 0, 0, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `school_breaks`
--

CREATE TABLE `school_breaks` (
  `school_id` int(11) NOT NULL,
  `hour` int(11) NOT NULL,
  `minutes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `school_breaks`
--

INSERT INTO `school_breaks` (`school_id`, `hour`, `minutes`) VALUES
(1, 3, 10),
(1, 4, 20);

-- --------------------------------------------------------

--
-- Struktura tabulky `school_domains`
--

CREATE TABLE `school_domains` (
  `domain_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `domain` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `school_domains`
--

INSERT INTO `school_domains` (`domain_id`, `school_id`, `domain`) VALUES
(1, 1, 'localhost:4200'),
(3, 3, 'localhost:4201');

-- --------------------------------------------------------

--
-- Struktura tabulky `school_evaluation_templates`
--

CREATE TABLE `school_evaluation_templates` (
  `template_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `text` text NOT NULL,
  `value` enum('praise','note') NOT NULL,
  `is_public` tinyint(1) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `school_years`
--

CREATE TABLE `school_years` (
  `sy_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `start` date NOT NULL DEFAULT current_timestamp(),
  `end` date NOT NULL DEFAULT current_timestamp(),
  `midterm` date DEFAULT NULL,
  `current` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `school_years`
--

INSERT INTO `school_years` (`sy_id`, `school_id`, `start`, `end`, `midterm`, `current`) VALUES
(1, 1, '2023-09-04', '2024-08-31', '2024-01-31', 0),
(2, 1, '2025-09-02', '2026-08-31', '2026-01-30', 1),
(3, 1, '2022-09-05', '2023-08-31', '2023-01-30', 0),
(4, 1, '2025-09-01', '2026-06-30', '2026-02-13', 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `scopes`
--

CREATE TABLE `scopes` (
  `scope_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `shortcut` text NOT NULL,
  `code` varchar(255) NOT NULL,
  `years` int(11) NOT NULL,
  `students_per_class` int(11) NOT NULL,
  `number_of_classes` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `school_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `scopes`
--

INSERT INTO `scopes` (`scope_id`, `name`, `shortcut`, `code`, `years`, `students_per_class`, `number_of_classes`, `is_active`, `school_id`) VALUES
(1, 'Elektrotechnika', 'ELE', '26-41-M/01 Elektrotechnika', 4, 30, 2, 1, 1),
(2, 'Informační technologie', 'IT', '18-20-M/01', 4, 30, 1, 1, 1),
(3, 'Počítačové projektování', 'PP', '26-41-M/01 Elektrotechnika', 4, 30, 1, 1, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `scopes_subjects`
--

CREATE TABLE `scopes_subjects` (
  `ss_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `hours_per_week` int(11) NOT NULL,
  `exercise` int(11) NOT NULL DEFAULT 0,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 1,
  `default_room` int(11) DEFAULT NULL,
  `color` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `scopes_subjects`
--

INSERT INTO `scopes_subjects` (`ss_id`, `scope_id`, `year`, `subject_id`, `hours_per_week`, `exercise`, `is_mandatory`, `default_room`, `color`) VALUES
(783, 2, 0, 1, 3, 0, 1, NULL, NULL),
(784, 2, 1, 1, 3, 0, 1, NULL, NULL),
(785, 2, 2, 1, 2, 0, 1, NULL, NULL),
(786, 2, 3, 1, 2, 0, 1, NULL, NULL),
(787, 2, 4, 1, 0, 0, 1, NULL, NULL),
(788, 2, 0, 2, 3, 0, 1, NULL, NULL),
(789, 2, 1, 2, 3, 0, 1, NULL, NULL),
(790, 2, 2, 2, 3, 0, 1, NULL, NULL),
(791, 2, 3, 2, 3, 0, 1, NULL, NULL),
(792, 2, 4, 2, 0, 0, 1, NULL, NULL),
(793, 2, 0, 3, 2, 0, 1, NULL, NULL),
(794, 2, 1, 3, 2, 0, 1, NULL, NULL),
(795, 2, 2, 3, 0, 0, 1, NULL, NULL),
(796, 2, 3, 3, 0, 0, 1, NULL, NULL),
(797, 2, 4, 3, 0, 0, 1, NULL, NULL),
(798, 2, 0, 4, 0, 0, 1, NULL, NULL),
(799, 2, 1, 4, 1, 0, 1, NULL, NULL),
(800, 2, 2, 4, 1, 0, 1, NULL, NULL),
(801, 2, 3, 4, 1, 0, 1, NULL, NULL),
(802, 2, 4, 4, 0, 0, 1, NULL, NULL),
(803, 2, 0, 5, 2, 0, 1, NULL, NULL),
(804, 2, 1, 5, 0, 0, 1, NULL, NULL),
(805, 2, 2, 5, 0, 0, 1, NULL, NULL),
(806, 2, 3, 5, 0, 0, 1, NULL, NULL),
(807, 2, 4, 5, 0, 0, 1, NULL, NULL),
(808, 2, 0, 6, 4, 0, 1, NULL, NULL),
(809, 2, 1, 6, 4, 0, 1, NULL, NULL),
(810, 2, 2, 6, 3, 0, 1, NULL, NULL),
(811, 2, 3, 6, 3, 0, 1, NULL, NULL),
(812, 2, 4, 6, 0, 0, 1, NULL, NULL),
(813, 2, 0, 7, 2, 0, 1, NULL, NULL),
(814, 2, 1, 7, 2, 0, 1, NULL, NULL),
(815, 2, 2, 7, 2, 0, 1, NULL, NULL),
(816, 2, 3, 7, 2, 0, 1, NULL, NULL),
(817, 2, 4, 7, 0, 0, 1, NULL, NULL),
(818, 2, 0, 8, 1, 0, 1, NULL, NULL),
(819, 2, 1, 8, 0, 0, 1, NULL, NULL),
(820, 2, 2, 8, 0, 0, 1, NULL, NULL),
(821, 2, 3, 8, 0, 0, 1, NULL, NULL),
(822, 2, 4, 8, 0, 0, 1, NULL, NULL),
(823, 2, 0, 9, 1, 0, 1, NULL, NULL),
(824, 2, 1, 9, 0, 0, 1, NULL, NULL),
(825, 2, 2, 9, 0, 0, 1, NULL, NULL),
(826, 2, 3, 9, 0, 0, 1, NULL, NULL),
(827, 2, 4, 9, 0, 0, 1, NULL, NULL),
(828, 2, 0, 10, 0, 0, 1, NULL, NULL),
(829, 2, 1, 10, 0, 0, 1, NULL, NULL),
(830, 2, 2, 10, 2, 0, 1, NULL, NULL),
(831, 2, 3, 10, 3, 0, 1, NULL, NULL),
(832, 2, 4, 10, 0, 0, 1, NULL, NULL),
(833, 2, 0, 11, 3, 0, 1, NULL, NULL),
(834, 2, 1, 11, 2, 0, 1, NULL, NULL),
(835, 2, 2, 11, 0, 0, 1, NULL, NULL),
(836, 2, 3, 11, 0, 0, 1, NULL, NULL),
(837, 2, 4, 11, 0, 0, 1, NULL, NULL),
(838, 2, 0, 12, 2, 0, 1, NULL, NULL),
(839, 2, 1, 12, 2, 0, 1, NULL, NULL),
(840, 2, 2, 12, 2, 0, 1, NULL, NULL),
(841, 2, 3, 12, 2, 0, 1, NULL, NULL),
(842, 2, 4, 12, 0, 0, 1, NULL, NULL),
(843, 2, 0, 13, 0, 0, 1, NULL, NULL),
(844, 2, 1, 13, 0, 0, 1, NULL, NULL),
(845, 2, 2, 13, 0, 0, 1, NULL, NULL),
(846, 2, 3, 13, 0, 0, 1, NULL, NULL),
(847, 2, 4, 13, 0, 0, 1, NULL, NULL),
(848, 2, 0, 14, 0, 0, 1, NULL, NULL),
(849, 2, 1, 14, 0, 0, 1, NULL, NULL),
(850, 2, 2, 14, 0, 0, 1, NULL, NULL),
(851, 2, 3, 14, 0, 0, 1, NULL, NULL),
(852, 2, 4, 14, 0, 0, 1, NULL, NULL),
(853, 2, 0, 15, 0, 0, 1, NULL, NULL),
(854, 2, 1, 15, 0, 0, 1, NULL, NULL),
(855, 2, 2, 15, 0, 0, 1, NULL, NULL),
(856, 2, 3, 15, 0, 0, 1, NULL, NULL),
(857, 2, 4, 15, 0, 0, 1, NULL, NULL),
(858, 2, 0, 16, 0, 0, 1, NULL, NULL),
(859, 2, 1, 16, 0, 0, 1, NULL, NULL),
(860, 2, 2, 16, 0, 0, 1, NULL, NULL),
(861, 2, 3, 16, 0, 0, 1, NULL, NULL),
(862, 2, 4, 16, 0, 0, 1, NULL, NULL),
(863, 2, 0, 17, 0, 0, 1, NULL, NULL),
(864, 2, 1, 17, 0, 0, 1, NULL, NULL),
(865, 2, 2, 17, 0, 0, 1, NULL, NULL),
(866, 2, 3, 17, 0, 0, 1, NULL, NULL),
(867, 2, 4, 17, 0, 0, 1, NULL, NULL),
(868, 2, 0, 18, 0, 0, 1, NULL, NULL),
(869, 2, 1, 18, 0, 0, 1, NULL, NULL),
(870, 2, 2, 18, 0, 0, 1, NULL, NULL),
(871, 2, 3, 18, 0, 0, 1, NULL, NULL),
(872, 2, 4, 18, 0, 0, 1, NULL, NULL),
(873, 2, 0, 19, 0, 0, 1, NULL, NULL),
(874, 2, 1, 19, 0, 0, 1, NULL, NULL),
(875, 2, 2, 19, 0, 0, 1, NULL, NULL),
(876, 2, 3, 19, 0, 0, 1, NULL, NULL),
(877, 2, 4, 19, 0, 0, 1, NULL, NULL),
(878, 2, 0, 20, 0, 0, 1, NULL, NULL),
(879, 2, 1, 20, 0, 0, 1, NULL, NULL),
(880, 2, 2, 20, 0, 0, 1, NULL, NULL),
(881, 2, 3, 20, 0, 0, 1, NULL, NULL),
(882, 2, 4, 20, 0, 0, 1, NULL, NULL),
(883, 2, 0, 21, 0, 0, 1, NULL, NULL),
(884, 2, 1, 21, 0, 0, 1, NULL, NULL),
(885, 2, 2, 21, 0, 0, 1, NULL, NULL),
(886, 2, 3, 21, 0, 0, 1, NULL, NULL),
(887, 2, 4, 21, 0, 0, 1, NULL, NULL),
(888, 2, 0, 22, 0, 0, 1, NULL, NULL),
(889, 2, 1, 22, 0, 0, 1, NULL, NULL),
(890, 2, 2, 22, 0, 0, 1, NULL, NULL),
(891, 2, 3, 22, 0, 0, 1, NULL, NULL),
(892, 2, 4, 22, 0, 0, 1, NULL, NULL),
(893, 2, 0, 23, 0, 0, 1, NULL, NULL),
(894, 2, 1, 23, 0, 0, 1, NULL, NULL),
(895, 2, 2, 23, 0, 0, 1, NULL, NULL),
(896, 2, 3, 23, 0, 0, 1, NULL, NULL),
(897, 2, 4, 23, 0, 0, 1, NULL, NULL),
(898, 2, 0, 24, 0, 0, 1, NULL, NULL),
(899, 2, 1, 24, 0, 0, 1, NULL, NULL),
(900, 2, 2, 24, 0, 0, 1, NULL, NULL),
(901, 2, 3, 24, 0, 0, 1, NULL, NULL),
(902, 2, 4, 24, 0, 0, 1, NULL, NULL),
(903, 2, 0, 25, 0, 0, 1, NULL, NULL),
(904, 2, 1, 25, 0, 0, 1, NULL, NULL),
(905, 2, 2, 25, 0, 0, 1, NULL, NULL),
(906, 2, 3, 25, 0, 0, 1, NULL, NULL),
(907, 2, 4, 25, 0, 0, 1, NULL, NULL),
(908, 2, 0, 26, 0, 0, 1, NULL, NULL),
(909, 2, 1, 26, 0, 0, 1, NULL, NULL),
(910, 2, 2, 26, 0, 0, 1, NULL, NULL),
(911, 2, 3, 26, 0, 0, 1, NULL, NULL),
(912, 2, 4, 26, 0, 0, 1, NULL, NULL),
(913, 2, 0, 27, 0, 0, 1, NULL, NULL),
(914, 2, 1, 27, 0, 0, 1, NULL, NULL),
(915, 2, 2, 27, 2, 0, 1, NULL, NULL),
(916, 2, 3, 27, 0, 0, 1, NULL, NULL),
(917, 2, 4, 27, 0, 0, 1, NULL, NULL),
(918, 2, 0, 28, 0, 0, 1, NULL, NULL),
(919, 2, 1, 28, 0, 0, 1, NULL, NULL),
(920, 2, 2, 28, 0, 0, 1, NULL, NULL),
(921, 2, 3, 28, 0, 0, 1, NULL, NULL),
(922, 2, 4, 28, 0, 0, 1, NULL, NULL),
(923, 2, 0, 29, 2, 0, 1, NULL, NULL),
(924, 2, 1, 29, 2, 0, 1, NULL, NULL),
(925, 2, 2, 29, 2, 0, 1, NULL, NULL),
(926, 2, 3, 29, 2, 0, 1, NULL, NULL),
(927, 2, 4, 29, 0, 0, 1, NULL, NULL),
(928, 2, 0, 30, 2, 0, 1, NULL, NULL),
(929, 2, 1, 30, 3, 0, 1, NULL, NULL),
(930, 2, 2, 30, 3, 0, 1, NULL, NULL),
(931, 2, 3, 30, 3, 0, 1, NULL, NULL),
(932, 2, 4, 30, 0, 0, 1, NULL, NULL),
(933, 2, 0, 31, 2, 0, 1, NULL, NULL),
(934, 2, 1, 31, 3, 0, 1, NULL, NULL),
(935, 2, 2, 31, 2, 0, 1, NULL, NULL),
(936, 2, 3, 31, 2, 0, 1, NULL, NULL),
(937, 2, 4, 31, 0, 0, 1, NULL, NULL),
(938, 2, 0, 32, 2, 0, 1, NULL, NULL),
(939, 2, 1, 32, 1, 0, 1, NULL, NULL),
(940, 2, 2, 32, 3, 0, 1, NULL, NULL),
(941, 2, 3, 32, 2, 0, 1, NULL, NULL),
(942, 2, 4, 32, 0, 0, 1, NULL, NULL),
(943, 2, 0, 33, 0, 0, 1, NULL, NULL),
(944, 2, 1, 33, 2, 0, 1, NULL, NULL),
(945, 2, 2, 33, 2, 0, 1, NULL, NULL),
(946, 2, 3, 33, 2, 0, 1, NULL, NULL),
(947, 2, 4, 33, 0, 0, 1, NULL, NULL),
(948, 2, 0, 34, 2, 0, 1, NULL, NULL),
(949, 2, 1, 34, 2, 0, 1, NULL, NULL),
(950, 2, 2, 34, 2, 0, 1, NULL, NULL),
(951, 2, 3, 34, 2, 0, 1, NULL, NULL),
(952, 2, 4, 34, 0, 0, 1, NULL, NULL),
(953, 2, 0, 35, 0, 0, 1, NULL, NULL),
(954, 2, 1, 35, 0, 0, 1, NULL, NULL),
(955, 2, 2, 35, 2, 0, 1, NULL, NULL),
(956, 2, 3, 35, 2, 0, 1, NULL, NULL),
(957, 2, 4, 35, 0, 0, 1, NULL, NULL),
(958, 2, 0, 36, 0, 0, 1, NULL, NULL),
(959, 2, 1, 36, 0, 0, 1, NULL, NULL),
(960, 2, 2, 36, 1, 0, 1, NULL, NULL),
(961, 2, 3, 36, 1, 0, 1, NULL, NULL),
(962, 2, 4, 36, 0, 0, 1, NULL, NULL),
(963, 2, 0, 37, 0, 0, 1, NULL, NULL),
(964, 2, 1, 37, 0, 0, 1, NULL, NULL),
(965, 2, 2, 37, 0, 0, 1, NULL, NULL),
(966, 2, 3, 37, 0, 0, 1, NULL, NULL),
(967, 2, 4, 37, 0, 0, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `semester_grades`
--

CREATE TABLE `semester_grades` (
  `s_g_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `verbal_assessment` text DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `finalized` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `semester_grades`
--

INSERT INTO `semester_grades` (`s_g_id`, `student_id`, `subject_id`, `year`, `semester`, `grade`, `verbal_assessment`, `teacher_id`, `finalized`, `created_at`, `updated_at`) VALUES
(1, 24, 31, 2025, 2, '1', NULL, 4, 0, '2025-12-07 20:36:23', '2025-12-08 21:42:25'),
(2, 24, 31, 2025, 3, '2', NULL, 4, 0, '2026-02-22 11:56:09', '2026-02-22 11:56:09'),
(3, 1, 31, 2025, 2, '1', NULL, 4, 0, '2026-02-22 11:59:11', '2026-03-08 18:22:09'),
(4, 1, 31, 2024, 2, '1', NULL, 4, 0, '2026-02-22 11:59:11', '2026-03-08 18:22:09'),
(5, 1, 31, 2024, 4, '1', NULL, 4, 0, '2026-02-22 11:59:11', '2026-03-08 18:22:09'),
(6, 1, 35, 2024, 4, '3', NULL, 4, 0, '2026-02-22 11:59:11', '2026-03-08 18:22:09');

-- --------------------------------------------------------

--
-- Struktura tabulky `students`
--

CREATE TABLE `students` (
  `person_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `status` enum('active','former','suspended') NOT NULL DEFAULT 'active',
  `start_study` date DEFAULT NULL,
  `abroad` tinyint(1) NOT NULL DEFAULT 0,
  `school_counseling_facility` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `students`
--

INSERT INTO `students` (`person_id`, `class_id`, `status`, `start_study`, `abroad`, `school_counseling_facility`) VALUES
(1, 1, 'active', '2021-09-06', 0, 0),
(24, 1, 'active', '2021-09-06', 0, 0),
(25, 1, 'active', '2021-09-06', 0, 0),
(26, 1, 'active', '2021-09-06', 0, 0),
(27, 1, 'active', '2021-09-06', 0, 0),
(28, 1, 'active', '2021-09-06', 0, 0),
(29, 1, 'active', '2021-09-06', 0, 0),
(30, 1, 'active', '2021-09-06', 0, 0),
(31, 1, 'active', '2021-09-06', 0, 0),
(32, 1, 'active', '2021-09-06', 0, 0),
(40, 1, 'active', '2021-09-06', 0, 0),
(41, 1, 'former', '2021-09-06', 0, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `student_groups`
--

CREATE TABLE `student_groups` (
  `student_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `student_groups`
--

INSERT INTO `student_groups` (`student_id`, `group_id`) VALUES
(1, 2),
(24, 2),
(25, 2),
(26, 2),
(27, 2),
(28, 2),
(29, 2),
(30, 2),
(31, 2),
(32, 2),
(1, 4),
(24, 4),
(25, 4),
(26, 4),
(27, 4),
(28, 4),
(29, 4),
(30, 4),
(31, 4),
(32, 4),
(1, 5),
(24, 5),
(25, 5),
(26, 5),
(27, 5),
(28, 5),
(29, 5),
(30, 5),
(31, 5),
(32, 6),
(1, 8),
(24, 8),
(1, 9),
(24, 9),
(1, 10),
(24, 10),
(25, 10),
(26, 10),
(1, 11),
(24, 11),
(24, 12);

-- --------------------------------------------------------

--
-- Struktura tabulky `student_history`
--

CREATE TABLE `student_history` (
  `student_history_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `data` text NOT NULL DEFAULT '{}',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `student_history`
--

INSERT INTO `student_history` (`student_history_id`, `student_id`, `teacher_id`, `type`, `data`, `created_at`) VALUES
(1, 25, 4, 'added_parent', '{\"type\":\"father\",\"parent_id\":33}', '2026-02-26 08:15:59'),
(2, 24, 4, 'updated_student', '{\"firstName\":\"Kryštof\",\"lastName\":\"Pinokio\",\"classId\":1,\"gender\":0,\"birthNum\":\"\",\"birthday\":\"2007-04-07\",\"birthPlace\":\"Prostějov\",\"nationalityId\":1,\"insuranceId\":null}', '2026-02-27 16:17:51'),
(3, 25, 4, 'updated_student', '{\"firstName\":\"Josef\",\"lastName\":\"Bayer\",\"classId\":1,\"gender\":0,\"birthNum\":\"\",\"birthday\":\"2004-01-24\",\"birthPlace\":\"Prostějov\",\"nationalityId\":60,\"insuranceId\":207}', '2026-03-01 19:56:08'),
(4, 25, 4, 'updated_student', '{\"firstName\":\"Josef\",\"lastName\":\"Bayer\",\"prefixTitle\":\"\",\"suffixTitle\":\"\",\"classId\":1,\"insuranceId\":205,\"gender\":0,\"birthNum\":\"\",\"birthday\":\"2004-01-24\",\"birthPlace\":\"Prostějov\",\"nationalityId\":60,\"saveType\":\"change\",\"changes\":[{\"label\":\"Pojišťovna\",\"oldValue\":\"OZP - 207\",\"newValue\":\"CPZP - 205\"}]}', '2026-03-01 22:31:54'),
(5, 29, 4, 'updated_student', '{\"firstName\":\"Daniel\",\"lastName\":\"Jakl\",\"prefixTitle\":\"\",\"suffixTitle\":\"\",\"classId\":1,\"insuranceId\":null,\"gender\":1,\"birthNum\":\"\",\"birthday\":\"2006-01-21\",\"birthPlace\":\"Prostějov\",\"nationalityId\":1,\"saveType\":\"change\",\"changes\":[{\"label\":\"Pohlaví\",\"oldValue\":\"Muž\",\"newValue\":\"Žena\"},{\"label\":\"Státní občanství\",\"oldValue\":\"Nezadáno\",\"newValue\":\"Afghánistán\"}]}', '2026-03-06 10:37:01'),
(6, 1, 4, 'updated_student', '{\"street\":\"Újezd\",\"houseNumber\":\"\",\"city\":\"\",\"postcode\":\"796 01\",\"saveType\":\"change\",\"changes\":[{\"label\":\"Číslo popisné\",\"oldValue\":\"2169/19\",\"newValue\":\"Nezadáno\"},{\"label\":\"Město\",\"oldValue\":\"Prostějov\",\"newValue\":\"Nezadáno\"}]}', '2026-03-07 20:05:00'),
(7, 1, 4, 'updated_student', '{\"street\":\"Újezd\",\"houseNumber\":\"\",\"city\":\"Praha\",\"postcode\":\"796 01\",\"saveType\":\"change\",\"changes\":[{\"label\":\"Město\",\"oldValue\":\"Nezadáno\",\"newValue\":\"Praha\"}]}', '2026-03-07 20:16:12'),
(8, 1, 4, 'updated_student', '{\"street\":\"Pražská\",\"houseNumber\":\"155\",\"city\":\"Praha\",\"postcode\":\"796 01\",\"countryId\":60,\"saveType\":\"change\",\"changes\":[{\"label\":\"Ulice\",\"oldValue\":\"Újezd\",\"newValue\":\"Pražská\"},{\"label\":\"Číslo popisné\",\"oldValue\":\"Nezadáno\",\"newValue\":\"155\"},{\"label\":\"Země\",\"oldValue\":\"Afghánistán\",\"newValue\":\"Česká republika\"}]}', '2026-03-07 20:21:28'),
(9, 25, 4, 'updated_parent', '{\"parent_id\":33,\"role\":\"father\"}', '2026-03-12 20:35:34'),
(10, 32, 4, 'updated_student', '{\"street\":\"Újezd\",\"houseNumber\":\"\",\"city\":\"Praha\",\"postcode\":\"796 01\",\"countryId\":60,\"saveType\":\"change\",\"changes\":[{\"label\":\"Země\",\"oldValue\":\"Afghánistán\",\"newValue\":\"Česká republika\"}]}', '2026-03-12 23:16:36');

-- --------------------------------------------------------

--
-- Struktura tabulky `student_homework`
--

CREATE TABLE `student_homework` (
  `student_id` int(11) NOT NULL,
  `homework_id` int(11) NOT NULL,
  `submitted` tinyint(1) NOT NULL DEFAULT 0,
  `finished` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `student_homework`
--

INSERT INTO `student_homework` (`student_id`, `homework_id`, `submitted`, `finished`) VALUES
(1, 7, 0, 0),
(1, 13, 0, 0),
(24, 7, 0, 0),
(24, 13, 0, 0),
(25, 7, 0, 0),
(25, 13, 0, 0),
(26, 7, 0, 0),
(26, 13, 0, 0),
(27, 7, 0, 0),
(27, 13, 0, 0),
(28, 7, 0, 0),
(28, 13, 0, 0),
(29, 7, 0, 0),
(29, 13, 0, 0),
(30, 7, 0, 0),
(30, 13, 0, 0),
(31, 7, 0, 0),
(31, 13, 0, 0),
(32, 7, 0, 0),
(32, 13, 0, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `student_matrika`
--

CREATE TABLE `student_matrika` (
  `student_id` int(11) NOT NULL,
  `highest_education_id` int(11) DEFAULT NULL,
  `previous_school_izo` varchar(255) DEFAULT NULL,
  `study_type_code` varchar(10) DEFAULT NULL,
  `financing_code` varchar(10) DEFAULT NULL,
  `start_reason_code` varchar(10) DEFAULT NULL,
  `end_reason_code` varchar(10) DEFAULT NULL,
  `individual_plan_code` varchar(10) DEFAULT NULL,
  `special_needs_code` varchar(10) DEFAULT NULL,
  `language_code` varchar(10) DEFAULT NULL,
  `health_status_code` varchar(10) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `student_matrika`
--

INSERT INTO `student_matrika` (`student_id`, `highest_education_id`, `previous_school_izo`, `study_type_code`, `financing_code`, `start_reason_code`, `end_reason_code`, `individual_plan_code`, `special_needs_code`, `language_code`, `health_status_code`, `updated_at`) VALUES
(24, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 10:56:36');

-- --------------------------------------------------------

--
-- Struktura tabulky `student_matrika_records`
--

CREATE TABLE `student_matrika_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `valid_from` varchar(50) DEFAULT NULL,
  `valid_to` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `student_medical_records`
--

CREATE TABLE `student_medical_records` (
  `record_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `severity` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `is_food_allergy` tinyint(1) NOT NULL DEFAULT 0,
  `allergen_codes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `student_medical_records`
--

INSERT INTO `student_medical_records` (`record_id`, `student_id`, `type`, `title`, `description`, `severity`, `is_food_allergy`, `allergen_codes`, `created_at`) VALUES
(1, 25, 'Chronické onemocnění', 'Astma', NULL, 'high', 0, NULL, '2026-02-22 17:19:29'),
(2, 25, 'Alergie', 'Alergie na obilniny', NULL, 'low', 1, '1,2', '2026-02-22 17:19:41');

-- --------------------------------------------------------

--
-- Struktura tabulky `student_notes`
--

CREATE TABLE `student_notes` (
  `note_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `label` text NOT NULL,
  `shortcut` varchar(6) NOT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `is_class_time` tinyint(1) NOT NULL DEFAULT 0,
  `primary_hours` text NOT NULL,
  `school_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `subjects`
--

INSERT INTO `subjects` (`subject_id`, `label`, `shortcut`, `is_main`, `is_class_time`, `primary_hours`, `school_id`) VALUES
(1, 'Anglický jazyk', 'AJ1', 0, 0, '', 1),
(2, 'Český jazyk a literatura', 'CJL', 0, 0, '', 1),
(3, 'Něměcký jazyk', 'NJ2', 0, 0, '', 1),
(4, 'Občanská nauka', 'OBN', 0, 0, '', 1),
(5, 'Dějepis', 'DEJ', 0, 0, '', 1),
(6, 'Matematika', 'MAT', 0, 0, '', 1),
(7, 'Fyzika', 'FYZI', 0, 0, '', 1),
(8, 'Chemie', 'CHE', 0, 0, '', 1),
(9, 'Základy ekologie', 'ZEK', 0, 0, '', 1),
(10, 'Ekonomika', 'EKOI', 0, 0, '', 1),
(11, 'Informační a komunikační technologie', 'ICT', 0, 0, '', 1),
(12, 'Tělesná výchova', 'TEV', 0, 0, '', 1),
(13, 'Základy elektrotechniky', 'ZAE', 0, 0, '', 1),
(14, 'Elektrotechnická zařízení', 'EZ', 0, 0, '', 1),
(15, 'Elektronika', 'ELT', 0, 0, '', 1),
(16, 'Mikroprocesorová technika', 'MIT', 0, 0, '', 1),
(17, 'Praktická cvičení ', 'PRAE', 0, 0, '', 1),
(18, 'Přenosové a automatické systémy', 'PAS', 0, 0, '', 1),
(19, 'Elektrotechnická měření', 'ELM', 0, 0, '', 1),
(20, 'Technické kreslení ', 'TEK', 0, 0, '', 1),
(21, 'Strojní systémy', 'STS', 0, 0, '', 1),
(22, 'Elektronické řídící systémy', 'ERS', 0, 0, '', 1),
(23, 'Automatizační cvičení', 'AUC', 0, 0, '', 1),
(24, 'Komerční elektronické systémy', 'KES', 0, 0, '', 1),
(25, 'Obnovitelné zdroje', 'OBZ', 0, 0, '', 1),
(26, 'Elektronické systémy budov', 'ESB', 0, 0, '', 1),
(27, 'Anglická konverzace', 'AJK', 0, 0, '', 1),
(28, 'Německá konverzace', 'NJK', 0, 0, '', 1),
(29, 'Hardware', 'HW', 0, 0, '', 1),
(30, 'Počítačové sítě', 'PS', 0, 0, '', 1),
(31, 'Programování a vývoj aplikací ', 'PVA', 0, 0, '', 1),
(32, 'Aplikační software', 'APS', 0, 0, '', 1),
(33, 'Operační systémy', 'OSY', 0, 0, '', 1),
(34, 'Praktická cvičení', 'PRAI', 0, 0, '', 1),
(35, 'Kybernetická bezpečnost systémů', 'KBS', 0, 0, '', 1),
(36, 'Anglický jazyk odborný', 'AJO', 0, 0, '', 1),
(37, 'Třídnícká hodina', 'TH', 0, 1, '', 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `substitution`
--

CREATE TABLE `substitution` (
  `substitution_id` int(11) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL DEFAULT current_timestamp(),
  `start_hour` int(11) NOT NULL,
  `end_date` date NOT NULL DEFAULT current_timestamp(),
  `end_hour` int(11) NOT NULL,
  `type` text DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `event_id` int(11) DEFAULT NULL,
  `teacher2_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `substitution`
--

INSERT INTO `substitution` (`substitution_id`, `group_id`, `start_date`, `start_hour`, `end_date`, `end_hour`, `type`, `subject_id`, `teacher_id`, `room_id`, `created`, `event_id`, `teacher2_id`) VALUES
(1, 10, '2024-11-20', -1, '2024-11-20', 0, 'cancelled', NULL, 2, 1, '2024-11-18 18:47:32', NULL, NULL),
(2, 10, '2024-11-21', 2, '2024-11-21', 0, 'cancelled', 33, NULL, 1, '2024-11-18 20:41:11', NULL, NULL),
(3, 9, '2024-11-19', -1, '2024-11-19', 0, 'cancelled', NULL, NULL, 1, '2024-11-18 20:41:11', NULL, NULL),
(4, NULL, '2026-06-28', -1, '2026-08-31', -1, 'holiday', NULL, NULL, 1, '2025-06-30 16:56:09', 1, NULL),
(6, 9, '2025-12-01', 1, '2025-12-01', 1, 'substitution', 1, 15, 1, '2025-12-03 13:53:00', NULL, NULL),
(7, 9, '2026-02-16', 1, '2026-02-16', 1, 'substitution', 36, 15, 1, '2026-02-16 19:12:23', NULL, NULL),
(15, 10, '2026-02-16', 3, '2026-02-16', 3, 'substitution', 36, 5, 1, '2026-02-21 21:00:56', NULL, NULL),
(16, 10, '2026-02-19', 4, '2026-02-19', 4, 'substitution', 36, 2, 1, '2026-02-21 21:11:03', NULL, NULL),
(17, 10, '2026-02-16', 4, '2026-02-16', 4, 'substitution', 7, 2, 1, '2026-02-21 21:13:55', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `supervisions`
--

CREATE TABLE `supervisions` (
  `supervision_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `place_id` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `hour` int(11) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `supervision_places`
--

CREATE TABLE `supervision_places` (
  `place_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `school_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `system_heartbeats`
--

CREATE TABLE `system_heartbeats` (
  `heartbeat_id` int(10) UNSIGNED NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `version` varchar(32) NOT NULL DEFAULT '',
  `commit_hash` varchar(64) NOT NULL DEFAULT '',
  `is_update` tinyint(1) NOT NULL DEFAULT 0,
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `system_heartbeats`
--

INSERT INTO `system_heartbeats` (`heartbeat_id`, `recorded_at`, `version`, `commit_hash`, `is_update`, `note`) VALUES
(15594, '2026-03-22 09:08:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(15595, '2026-03-22 09:09:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15596, '2026-03-22 09:10:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15597, '2026-03-22 09:11:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15598, '2026-03-22 09:12:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15599, '2026-03-22 09:13:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15600, '2026-03-22 09:14:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15601, '2026-03-22 09:15:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15602, '2026-03-22 09:16:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15603, '2026-03-22 09:17:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15604, '2026-03-22 09:18:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15605, '2026-03-22 09:19:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15606, '2026-03-22 09:20:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15607, '2026-03-22 09:21:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15608, '2026-03-22 09:22:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15609, '2026-03-22 09:23:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15610, '2026-03-22 09:24:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15611, '2026-03-22 09:25:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15612, '2026-03-22 09:26:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15613, '2026-03-22 09:27:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15614, '2026-03-22 09:28:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15615, '2026-03-22 09:29:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15616, '2026-03-22 09:30:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15617, '2026-03-22 09:31:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15618, '2026-03-22 09:32:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15619, '2026-03-22 09:33:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15620, '2026-03-22 09:34:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15621, '2026-03-22 09:35:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15622, '2026-03-22 09:36:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15623, '2026-03-22 09:37:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15624, '2026-03-22 09:38:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15625, '2026-03-22 09:39:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15626, '2026-03-22 09:40:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15627, '2026-03-22 09:41:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15628, '2026-03-22 09:42:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15629, '2026-03-22 09:43:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15630, '2026-03-22 09:44:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15631, '2026-03-22 09:45:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15632, '2026-03-22 09:46:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15633, '2026-03-22 09:47:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15634, '2026-03-22 09:48:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15635, '2026-03-22 09:49:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15636, '2026-03-22 09:50:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15637, '2026-03-22 09:51:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15638, '2026-03-22 09:52:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15639, '2026-03-22 09:53:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15640, '2026-03-22 09:54:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15641, '2026-03-22 09:55:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15642, '2026-03-22 09:56:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15643, '2026-03-22 09:57:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15644, '2026-03-22 09:58:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15645, '2026-03-22 09:59:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15646, '2026-03-22 10:00:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15647, '2026-03-22 10:01:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15648, '2026-03-22 10:02:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15649, '2026-03-22 10:03:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15650, '2026-03-22 10:04:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15651, '2026-03-22 10:05:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15652, '2026-03-22 10:06:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15653, '2026-03-22 10:07:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15654, '2026-03-22 10:08:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15655, '2026-03-22 10:09:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15656, '2026-03-22 10:10:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15657, '2026-03-22 10:11:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15658, '2026-03-22 10:12:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15659, '2026-03-22 10:13:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15660, '2026-03-22 10:14:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15661, '2026-03-22 10:15:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15662, '2026-03-22 10:16:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15663, '2026-03-22 10:17:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15664, '2026-03-22 10:18:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15665, '2026-03-22 10:19:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15666, '2026-03-22 10:20:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15667, '2026-03-22 10:21:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15668, '2026-03-22 10:22:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15669, '2026-03-22 10:23:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15670, '2026-03-22 10:24:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15671, '2026-03-22 10:25:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15672, '2026-03-22 10:26:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15673, '2026-03-22 10:27:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15674, '2026-03-22 10:28:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15675, '2026-03-22 10:29:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15676, '2026-03-22 10:30:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15677, '2026-03-22 10:31:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15678, '2026-03-22 10:32:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15679, '2026-03-22 10:33:52', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15680, '2026-03-22 10:34:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15681, '2026-03-22 10:35:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15682, '2026-03-22 10:36:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15683, '2026-03-22 10:37:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15684, '2026-03-22 10:38:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15685, '2026-03-22 10:39:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15686, '2026-03-22 10:40:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15687, '2026-03-22 10:41:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15688, '2026-03-22 10:42:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15689, '2026-03-22 10:43:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15690, '2026-03-22 10:44:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15691, '2026-03-22 10:45:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15692, '2026-03-22 10:46:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15693, '2026-03-22 10:47:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15694, '2026-03-22 10:48:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15695, '2026-03-22 10:49:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15696, '2026-03-22 10:50:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15697, '2026-03-22 10:51:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15698, '2026-03-22 10:52:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15699, '2026-03-22 10:53:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15700, '2026-03-22 10:54:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15701, '2026-03-22 10:55:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15702, '2026-03-22 10:56:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15703, '2026-03-22 10:57:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15704, '2026-03-22 10:58:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15705, '2026-03-22 10:59:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15706, '2026-03-22 11:00:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15707, '2026-03-22 11:01:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15708, '2026-03-22 11:02:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15709, '2026-03-22 11:03:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15710, '2026-03-22 11:04:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15711, '2026-03-22 11:05:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15712, '2026-03-22 11:06:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15713, '2026-03-22 11:07:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15714, '2026-03-22 11:08:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15715, '2026-03-22 11:09:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15716, '2026-03-22 11:10:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15717, '2026-03-22 11:11:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15718, '2026-03-22 11:12:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15719, '2026-03-22 11:13:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15720, '2026-03-22 11:14:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15721, '2026-03-22 11:15:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15722, '2026-03-22 11:16:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15723, '2026-03-22 11:17:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15724, '2026-03-22 11:18:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15725, '2026-03-22 11:19:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15726, '2026-03-22 11:20:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15727, '2026-03-22 11:21:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15728, '2026-03-22 11:22:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15729, '2026-03-22 11:23:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15730, '2026-03-22 11:24:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15731, '2026-03-22 11:25:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15732, '2026-03-22 11:26:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15733, '2026-03-22 11:27:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15734, '2026-03-22 11:28:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15735, '2026-03-22 11:29:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15736, '2026-03-22 11:30:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15737, '2026-03-22 11:31:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15738, '2026-03-22 11:32:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15739, '2026-03-22 11:33:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15740, '2026-03-22 11:34:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15741, '2026-03-22 11:35:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15742, '2026-03-22 11:36:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15743, '2026-03-22 11:37:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15744, '2026-03-22 11:38:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15745, '2026-03-22 11:39:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15746, '2026-03-22 11:40:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15747, '2026-03-22 11:41:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15748, '2026-03-22 11:42:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15749, '2026-03-22 11:43:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15750, '2026-03-22 11:44:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15751, '2026-03-22 11:45:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15752, '2026-03-22 11:46:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15753, '2026-03-22 11:47:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15754, '2026-03-22 11:48:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15755, '2026-03-22 11:49:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15756, '2026-03-22 11:50:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15757, '2026-03-22 11:51:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15758, '2026-03-22 11:52:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15759, '2026-03-22 11:53:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15760, '2026-03-22 11:54:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15761, '2026-03-22 11:55:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15762, '2026-03-22 11:56:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15763, '2026-03-22 11:57:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15764, '2026-03-22 11:58:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15765, '2026-03-22 11:59:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15766, '2026-03-22 12:00:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15767, '2026-03-22 12:01:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15768, '2026-03-22 12:02:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15769, '2026-03-22 12:03:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15770, '2026-03-22 12:04:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15771, '2026-03-22 12:05:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15772, '2026-03-22 12:06:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15773, '2026-03-22 12:07:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15774, '2026-03-22 12:08:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15775, '2026-03-22 12:09:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15776, '2026-03-22 12:10:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15777, '2026-03-22 12:11:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15778, '2026-03-22 12:12:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15779, '2026-03-22 12:13:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15780, '2026-03-22 12:14:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15781, '2026-03-22 12:15:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15782, '2026-03-22 12:16:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15783, '2026-03-22 12:17:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15784, '2026-03-22 12:18:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15785, '2026-03-22 12:19:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15786, '2026-03-22 12:20:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15787, '2026-03-22 12:21:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15788, '2026-03-22 12:22:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15789, '2026-03-22 12:23:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15790, '2026-03-22 12:24:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15791, '2026-03-22 12:25:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15792, '2026-03-22 12:26:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15793, '2026-03-22 12:27:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15794, '2026-03-22 12:28:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15795, '2026-03-22 12:29:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15796, '2026-03-22 12:30:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15797, '2026-03-22 12:31:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15798, '2026-03-22 12:32:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15799, '2026-03-22 12:33:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15800, '2026-03-22 12:34:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15801, '2026-03-22 12:35:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15802, '2026-03-22 12:36:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15803, '2026-03-22 12:37:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15804, '2026-03-22 12:38:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15805, '2026-03-22 12:39:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15806, '2026-03-22 12:40:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15807, '2026-03-22 12:41:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15808, '2026-03-22 12:42:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15809, '2026-03-22 12:43:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15810, '2026-03-22 12:44:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15811, '2026-03-22 12:45:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15812, '2026-03-22 12:46:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15813, '2026-03-22 12:47:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15814, '2026-03-22 12:48:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15815, '2026-03-22 12:49:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15816, '2026-03-22 12:50:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15817, '2026-03-22 12:51:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15818, '2026-03-22 12:52:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15819, '2026-03-22 12:53:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15820, '2026-03-22 12:54:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15821, '2026-03-22 12:55:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15822, '2026-03-22 12:56:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15823, '2026-03-22 12:57:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15824, '2026-03-22 12:58:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15825, '2026-03-22 12:59:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15826, '2026-03-22 13:00:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15827, '2026-03-22 13:01:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15828, '2026-03-22 13:02:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15829, '2026-03-22 13:03:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15830, '2026-03-22 13:04:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15831, '2026-03-22 13:05:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15832, '2026-03-22 13:06:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15833, '2026-03-22 13:07:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15834, '2026-03-22 13:08:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15835, '2026-03-22 13:09:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15836, '2026-03-22 13:10:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15837, '2026-03-22 13:11:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15838, '2026-03-22 13:12:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15839, '2026-03-22 13:13:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15840, '2026-03-22 13:14:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15841, '2026-03-22 13:15:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15842, '2026-03-22 13:16:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15843, '2026-03-22 13:17:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15844, '2026-03-22 13:18:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15845, '2026-03-22 13:19:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15846, '2026-03-22 13:20:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15847, '2026-03-22 13:21:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15848, '2026-03-22 13:22:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15849, '2026-03-22 13:23:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15850, '2026-03-22 13:24:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15851, '2026-03-22 13:25:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15852, '2026-03-22 13:26:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15853, '2026-03-22 13:27:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15854, '2026-03-22 13:28:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15855, '2026-03-22 13:29:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15856, '2026-03-22 13:30:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15857, '2026-03-22 13:31:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15858, '2026-03-22 13:32:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15859, '2026-03-22 13:33:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15860, '2026-03-22 13:34:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15861, '2026-03-22 13:35:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15862, '2026-03-22 13:36:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15863, '2026-03-22 13:37:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15864, '2026-03-22 13:38:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15865, '2026-03-22 13:39:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15866, '2026-03-22 13:40:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15867, '2026-03-22 13:41:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15868, '2026-03-22 13:42:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15869, '2026-03-22 13:43:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15870, '2026-03-22 13:44:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15871, '2026-03-22 13:45:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15872, '2026-03-22 13:46:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15873, '2026-03-22 13:47:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15874, '2026-03-22 13:48:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15875, '2026-03-22 13:49:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15876, '2026-03-22 13:50:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15877, '2026-03-22 13:51:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15878, '2026-03-22 13:52:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15879, '2026-03-22 13:53:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15880, '2026-03-22 13:54:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15881, '2026-03-22 13:55:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15882, '2026-03-22 13:56:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15883, '2026-03-22 13:57:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15884, '2026-03-22 13:58:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15885, '2026-03-22 13:59:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15886, '2026-03-22 14:00:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15887, '2026-03-22 14:01:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15888, '2026-03-22 14:02:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15889, '2026-03-22 14:03:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15890, '2026-03-22 14:04:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15891, '2026-03-22 14:05:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15892, '2026-03-22 14:06:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15893, '2026-03-22 14:07:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15894, '2026-03-22 14:08:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15895, '2026-03-22 14:09:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15896, '2026-03-22 14:10:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15897, '2026-03-22 14:11:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15898, '2026-03-22 14:12:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15899, '2026-03-22 14:13:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15900, '2026-03-22 14:14:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15901, '2026-03-22 14:15:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15902, '2026-03-22 14:16:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15903, '2026-03-22 14:17:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15904, '2026-03-22 14:18:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15905, '2026-03-22 14:19:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15906, '2026-03-22 14:20:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15907, '2026-03-22 14:21:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15908, '2026-03-22 14:22:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15909, '2026-03-22 14:23:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15910, '2026-03-22 14:24:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15911, '2026-03-22 14:25:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15912, '2026-03-22 14:26:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15913, '2026-03-22 14:27:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15914, '2026-03-22 14:28:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15915, '2026-03-22 14:29:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15916, '2026-03-22 14:30:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15917, '2026-03-22 14:31:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15918, '2026-03-22 14:32:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15919, '2026-03-22 14:33:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15920, '2026-03-22 14:34:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15921, '2026-03-22 14:35:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15922, '2026-03-22 14:36:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15923, '2026-03-22 14:37:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15924, '2026-03-22 14:38:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15925, '2026-03-22 14:39:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15926, '2026-03-22 14:40:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15927, '2026-03-22 14:41:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15928, '2026-03-22 14:42:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15929, '2026-03-22 14:43:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15930, '2026-03-22 14:44:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15931, '2026-03-22 14:45:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15932, '2026-03-22 14:46:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15933, '2026-03-22 14:47:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15934, '2026-03-22 14:48:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15935, '2026-03-22 14:49:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15936, '2026-03-22 14:50:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15937, '2026-03-22 14:51:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15938, '2026-03-22 14:52:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15939, '2026-03-22 14:53:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15940, '2026-03-22 14:54:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15941, '2026-03-22 14:55:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15942, '2026-03-22 14:56:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15943, '2026-03-22 14:57:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15944, '2026-03-22 14:58:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15945, '2026-03-22 14:59:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15946, '2026-03-22 15:00:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15947, '2026-03-22 15:01:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15948, '2026-03-22 15:02:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15949, '2026-03-22 15:03:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15950, '2026-03-22 15:04:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15951, '2026-03-22 15:05:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15952, '2026-03-22 15:06:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15953, '2026-03-22 15:07:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15954, '2026-03-22 15:08:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15955, '2026-03-22 15:09:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15956, '2026-03-22 15:10:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15957, '2026-03-22 15:11:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15958, '2026-03-22 15:12:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15959, '2026-03-22 15:13:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15960, '2026-03-22 15:14:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15961, '2026-03-22 15:15:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15962, '2026-03-22 15:16:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15963, '2026-03-22 15:17:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15964, '2026-03-22 15:18:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15965, '2026-03-22 15:19:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15966, '2026-03-22 15:20:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15967, '2026-03-22 15:21:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15968, '2026-03-22 15:22:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15969, '2026-03-22 15:23:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15970, '2026-03-22 15:24:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15971, '2026-03-22 15:25:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15972, '2026-03-22 15:26:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15973, '2026-03-22 15:27:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15974, '2026-03-22 15:28:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15975, '2026-03-22 15:29:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15976, '2026-03-22 15:30:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15977, '2026-03-22 15:31:54', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15978, '2026-03-22 15:32:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15979, '2026-03-22 15:33:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15980, '2026-03-22 15:34:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15981, '2026-03-22 15:35:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15982, '2026-03-22 15:36:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15983, '2026-03-22 15:37:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15984, '2026-03-22 15:38:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15985, '2026-03-22 15:39:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15986, '2026-03-22 15:40:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15987, '2026-03-22 15:41:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15988, '2026-03-22 15:42:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15989, '2026-03-22 15:43:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15990, '2026-03-22 15:44:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15991, '2026-03-22 15:45:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15992, '2026-03-22 15:46:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15993, '2026-03-22 15:47:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15994, '2026-03-22 15:48:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15995, '2026-03-22 15:49:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15996, '2026-03-22 15:50:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15997, '2026-03-22 15:51:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15998, '2026-03-22 15:52:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(15999, '2026-03-22 15:53:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16000, '2026-03-22 15:54:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16001, '2026-03-22 15:55:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16002, '2026-03-22 15:56:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16003, '2026-03-22 15:57:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16004, '2026-03-22 15:58:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16005, '2026-03-22 15:59:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16006, '2026-03-22 16:00:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16007, '2026-03-22 16:01:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16008, '2026-03-22 16:02:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16009, '2026-03-22 16:03:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16010, '2026-03-22 16:04:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16011, '2026-03-22 16:05:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16012, '2026-03-22 16:06:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16013, '2026-03-22 16:07:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16014, '2026-03-22 16:08:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16015, '2026-03-22 16:09:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16016, '2026-03-22 16:10:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16017, '2026-03-22 16:11:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16018, '2026-03-22 16:12:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16019, '2026-03-22 16:13:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16020, '2026-03-22 16:14:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16021, '2026-03-22 16:15:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16022, '2026-03-22 16:16:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16023, '2026-03-22 16:17:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16024, '2026-03-22 16:18:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16025, '2026-03-22 16:19:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16026, '2026-03-22 16:20:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16027, '2026-03-22 16:21:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16028, '2026-03-22 16:22:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16029, '2026-03-22 16:23:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16030, '2026-03-22 16:24:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16031, '2026-03-22 16:25:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16032, '2026-03-22 16:26:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16033, '2026-03-22 16:27:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16034, '2026-03-22 16:28:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16035, '2026-03-22 16:29:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16036, '2026-03-22 16:30:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16037, '2026-03-22 16:31:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16038, '2026-03-22 16:32:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16039, '2026-03-22 16:33:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16040, '2026-03-22 16:34:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16041, '2026-03-22 16:35:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16042, '2026-03-22 16:36:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16043, '2026-03-22 16:37:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16044, '2026-03-22 16:38:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16045, '2026-03-22 16:39:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16046, '2026-03-22 16:40:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16047, '2026-03-22 16:41:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16048, '2026-03-22 16:42:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16049, '2026-03-22 16:43:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16050, '2026-03-22 16:44:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16051, '2026-03-22 16:45:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16052, '2026-03-22 16:46:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16053, '2026-03-22 16:47:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16054, '2026-03-22 16:48:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16055, '2026-03-22 16:49:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16056, '2026-03-22 16:50:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16057, '2026-03-22 16:51:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16058, '2026-03-22 16:52:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16059, '2026-03-22 16:53:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16060, '2026-03-22 16:54:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16061, '2026-03-22 16:55:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16062, '2026-03-22 16:56:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16063, '2026-03-22 16:57:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16064, '2026-03-22 16:58:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16065, '2026-03-22 16:59:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16066, '2026-03-22 17:00:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16067, '2026-03-22 17:01:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16068, '2026-03-22 17:02:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16069, '2026-03-22 17:03:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16070, '2026-03-22 17:04:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16071, '2026-03-22 17:05:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16072, '2026-03-22 17:06:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16073, '2026-03-22 17:07:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16074, '2026-03-22 17:08:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16075, '2026-03-22 17:09:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16076, '2026-03-22 17:10:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16077, '2026-03-22 17:11:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16078, '2026-03-22 17:12:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16079, '2026-03-22 17:13:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16080, '2026-03-22 17:14:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16081, '2026-03-22 17:15:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16082, '2026-03-22 17:16:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16083, '2026-03-22 17:17:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16084, '2026-03-22 17:18:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16085, '2026-03-22 17:19:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16086, '2026-03-22 17:20:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16087, '2026-03-22 17:21:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16088, '2026-03-22 17:22:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16089, '2026-03-22 17:23:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16090, '2026-03-22 17:24:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16091, '2026-03-22 17:25:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16092, '2026-03-22 17:26:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16093, '2026-03-22 17:27:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16094, '2026-03-22 17:28:55', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16095, '2026-03-22 17:29:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16096, '2026-03-22 17:30:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16097, '2026-03-22 17:31:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16098, '2026-03-22 17:32:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16099, '2026-03-22 17:33:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16100, '2026-03-22 17:34:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16101, '2026-03-22 17:35:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16102, '2026-03-22 17:36:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16103, '2026-03-22 17:37:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16104, '2026-03-22 17:38:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16105, '2026-03-22 17:39:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16106, '2026-03-22 17:40:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16107, '2026-03-22 17:41:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16108, '2026-03-22 17:42:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16109, '2026-03-22 17:43:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16110, '2026-03-22 17:44:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16111, '2026-03-22 17:45:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16112, '2026-03-22 17:46:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16113, '2026-03-22 17:47:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16114, '2026-03-22 17:48:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16115, '2026-03-22 17:49:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16116, '2026-03-22 17:50:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16117, '2026-03-22 17:51:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16118, '2026-03-22 17:52:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16119, '2026-03-22 17:53:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16120, '2026-03-22 17:54:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16121, '2026-03-22 17:55:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16122, '2026-03-22 17:56:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16123, '2026-03-22 17:57:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16124, '2026-03-22 17:58:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16125, '2026-03-22 17:59:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16126, '2026-03-22 18:00:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16127, '2026-03-22 18:01:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16128, '2026-03-22 18:02:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16129, '2026-03-22 18:03:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16130, '2026-03-22 18:04:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16131, '2026-03-22 18:05:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16132, '2026-03-22 18:06:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16133, '2026-03-22 18:07:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16134, '2026-03-22 18:08:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16135, '2026-03-22 18:09:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16136, '2026-03-22 18:10:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16137, '2026-03-22 18:11:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16138, '2026-03-22 18:12:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16139, '2026-03-22 18:13:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16140, '2026-03-22 18:14:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16141, '2026-03-22 18:15:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16142, '2026-03-22 18:16:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16143, '2026-03-22 18:17:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16144, '2026-03-22 18:18:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16145, '2026-03-22 18:19:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16146, '2026-03-22 18:20:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16147, '2026-03-22 18:21:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL);
INSERT INTO `system_heartbeats` (`heartbeat_id`, `recorded_at`, `version`, `commit_hash`, `is_update`, `note`) VALUES
(16148, '2026-03-22 18:22:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16149, '2026-03-22 18:23:56', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16150, '2026-03-22 18:24:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16151, '2026-03-22 18:25:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16152, '2026-03-22 18:26:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16153, '2026-03-22 18:27:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16154, '2026-03-22 18:28:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16155, '2026-03-22 18:29:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16156, '2026-03-22 18:30:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16157, '2026-03-22 18:31:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16158, '2026-03-22 18:32:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16159, '2026-03-22 18:33:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16160, '2026-03-22 18:34:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16161, '2026-03-22 18:35:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16162, '2026-03-22 18:36:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16163, '2026-03-22 18:37:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16164, '2026-03-22 18:38:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16165, '2026-03-22 18:39:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16166, '2026-03-22 18:40:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16167, '2026-03-22 18:41:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16168, '2026-03-22 18:42:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16169, '2026-03-22 18:43:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16170, '2026-03-22 18:44:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16171, '2026-03-22 18:45:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16172, '2026-03-22 18:46:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16173, '2026-03-22 18:47:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16174, '2026-03-22 18:48:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16175, '2026-03-22 18:49:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16176, '2026-03-22 18:50:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16177, '2026-03-22 18:51:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16178, '2026-03-22 18:52:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16179, '2026-03-22 18:53:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16180, '2026-03-22 18:54:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16181, '2026-03-22 18:55:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16182, '2026-03-22 18:56:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16183, '2026-03-22 18:57:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16184, '2026-03-22 18:58:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16185, '2026-03-22 18:59:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16186, '2026-03-22 19:00:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16187, '2026-03-22 19:01:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16188, '2026-03-22 19:02:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16189, '2026-03-22 19:03:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16190, '2026-03-22 19:04:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16191, '2026-03-22 19:05:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16192, '2026-03-22 19:06:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16193, '2026-03-22 19:07:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16194, '2026-03-22 19:08:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16195, '2026-03-22 19:09:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16196, '2026-03-22 19:10:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16197, '2026-03-22 19:11:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16198, '2026-03-22 19:12:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16199, '2026-03-22 19:13:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16200, '2026-03-22 19:14:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16201, '2026-03-22 19:15:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16202, '2026-03-22 19:16:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16203, '2026-03-22 19:17:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16204, '2026-03-22 19:18:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16205, '2026-03-22 19:19:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16206, '2026-03-22 19:20:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16207, '2026-03-22 19:21:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16208, '2026-03-22 19:22:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16209, '2026-03-22 19:23:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16210, '2026-03-22 19:24:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16211, '2026-03-22 19:25:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16212, '2026-03-22 19:26:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16213, '2026-03-22 19:27:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16214, '2026-03-22 19:28:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16215, '2026-03-22 19:29:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16216, '2026-03-22 19:30:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16217, '2026-03-22 19:31:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16218, '2026-03-22 19:32:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16219, '2026-03-22 19:33:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16220, '2026-03-22 19:34:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16221, '2026-03-22 19:35:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16222, '2026-03-22 19:36:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16223, '2026-03-22 19:37:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16224, '2026-03-22 19:38:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16225, '2026-03-22 19:39:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16226, '2026-03-22 19:40:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16227, '2026-03-22 19:41:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16228, '2026-03-22 19:42:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16229, '2026-03-22 19:43:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16230, '2026-03-22 19:44:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16231, '2026-03-22 19:45:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16232, '2026-03-22 19:46:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16233, '2026-03-22 19:47:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16234, '2026-03-22 19:48:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16235, '2026-03-22 19:49:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16236, '2026-03-22 19:50:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16237, '2026-03-22 19:51:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16238, '2026-03-22 19:52:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16239, '2026-03-22 19:53:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16240, '2026-03-22 19:54:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16241, '2026-03-22 19:55:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16242, '2026-03-22 19:56:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16243, '2026-03-22 19:57:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16244, '2026-03-22 19:58:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16245, '2026-03-22 19:59:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16246, '2026-03-22 20:00:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16247, '2026-03-22 20:01:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16248, '2026-03-22 20:02:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16249, '2026-03-22 20:03:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16250, '2026-03-22 20:04:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16251, '2026-03-22 20:05:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16252, '2026-03-22 20:06:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16253, '2026-03-22 20:07:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16254, '2026-03-22 20:08:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16255, '2026-03-22 20:09:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16256, '2026-03-22 20:10:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16257, '2026-03-22 20:11:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16258, '2026-03-22 20:12:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16259, '2026-03-22 20:13:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16260, '2026-03-22 20:14:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16261, '2026-03-22 20:15:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16262, '2026-03-22 20:16:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16263, '2026-03-22 20:17:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16264, '2026-03-22 20:18:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16265, '2026-03-22 20:19:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16266, '2026-03-22 20:20:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16267, '2026-03-22 20:21:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16268, '2026-03-22 20:22:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16269, '2026-03-22 20:23:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16270, '2026-03-22 20:24:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16271, '2026-03-22 20:25:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16272, '2026-03-22 20:26:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16273, '2026-03-22 20:27:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16274, '2026-03-22 20:28:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16275, '2026-03-22 20:29:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16276, '2026-03-22 20:30:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16277, '2026-03-22 20:31:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16278, '2026-03-22 20:32:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16279, '2026-03-22 20:33:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16280, '2026-03-22 20:34:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16281, '2026-03-22 20:35:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16282, '2026-03-22 20:36:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16283, '2026-03-22 20:37:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16284, '2026-03-22 20:38:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16285, '2026-03-22 20:39:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16286, '2026-03-22 20:40:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16287, '2026-03-22 20:41:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16288, '2026-03-22 20:42:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16289, '2026-03-22 20:43:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16290, '2026-03-22 20:44:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16291, '2026-03-22 20:45:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16292, '2026-03-22 20:46:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16293, '2026-03-22 20:47:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16294, '2026-03-22 20:48:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16295, '2026-03-22 20:49:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16296, '2026-03-22 20:50:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16297, '2026-03-22 20:51:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16298, '2026-03-22 20:52:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16299, '2026-03-22 20:53:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16300, '2026-03-22 20:54:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16301, '2026-03-22 20:55:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16302, '2026-03-22 20:56:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16303, '2026-03-22 20:57:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16304, '2026-03-22 20:58:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16305, '2026-03-22 20:59:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16306, '2026-03-22 21:00:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16307, '2026-03-22 21:01:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16308, '2026-03-22 21:02:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16309, '2026-03-22 21:03:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16310, '2026-03-22 21:04:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16311, '2026-03-22 21:05:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16312, '2026-03-22 21:06:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16313, '2026-03-22 21:07:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16314, '2026-03-22 21:08:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16315, '2026-03-22 21:09:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16316, '2026-03-22 21:10:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16317, '2026-03-22 21:11:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16318, '2026-03-22 21:12:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16319, '2026-03-22 21:13:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16320, '2026-03-22 21:14:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16321, '2026-03-22 21:15:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16322, '2026-03-22 21:16:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16323, '2026-03-22 21:17:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16324, '2026-03-22 21:18:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16325, '2026-03-22 21:19:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16326, '2026-03-22 21:20:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16327, '2026-03-22 21:21:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16328, '2026-03-22 21:22:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16329, '2026-03-22 21:23:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16330, '2026-03-22 21:24:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16331, '2026-03-22 21:25:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16332, '2026-03-22 21:26:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16333, '2026-03-22 21:27:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16334, '2026-03-22 21:28:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16335, '2026-03-22 21:29:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16336, '2026-03-22 21:30:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16337, '2026-03-22 21:31:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16338, '2026-03-22 21:32:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16339, '2026-03-22 21:33:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16340, '2026-03-22 21:34:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16341, '2026-03-22 21:35:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16342, '2026-03-22 21:36:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16343, '2026-03-22 21:37:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16344, '2026-03-22 21:38:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16345, '2026-03-22 21:39:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16346, '2026-03-22 21:40:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16347, '2026-03-22 21:41:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16348, '2026-03-22 21:42:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16349, '2026-03-22 21:43:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16350, '2026-03-22 21:44:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16351, '2026-03-22 21:45:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16352, '2026-03-22 21:46:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16353, '2026-03-22 21:47:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16354, '2026-03-22 21:48:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16355, '2026-03-22 21:49:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16356, '2026-03-22 21:50:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16357, '2026-03-22 21:51:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16358, '2026-03-22 21:52:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16359, '2026-03-22 21:53:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16360, '2026-03-22 21:54:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16361, '2026-03-22 21:55:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16362, '2026-03-22 21:56:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16363, '2026-03-22 21:57:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16364, '2026-03-22 21:58:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16365, '2026-03-22 21:59:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16366, '2026-03-22 22:00:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16367, '2026-03-22 22:01:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16368, '2026-03-22 22:02:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16369, '2026-03-22 22:03:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16370, '2026-03-22 22:04:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16371, '2026-03-22 22:05:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16372, '2026-03-22 22:06:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16373, '2026-03-22 22:07:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16374, '2026-03-22 22:08:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16375, '2026-03-22 22:09:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16376, '2026-03-22 22:10:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16377, '2026-03-22 22:11:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16378, '2026-03-22 22:12:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16379, '2026-03-22 22:13:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16380, '2026-03-22 22:14:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16381, '2026-03-22 22:15:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16382, '2026-03-22 22:16:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16383, '2026-03-22 22:17:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16384, '2026-03-22 22:18:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16385, '2026-03-22 22:19:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16386, '2026-03-22 22:20:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16387, '2026-03-22 22:21:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16388, '2026-03-22 22:22:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16389, '2026-03-22 22:23:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16390, '2026-03-22 22:24:26', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16391, '2026-03-22 22:25:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16392, '2026-03-22 22:26:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16393, '2026-03-22 22:27:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16394, '2026-03-22 22:28:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16395, '2026-03-22 22:29:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16396, '2026-03-22 22:30:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16397, '2026-03-22 22:31:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16398, '2026-03-22 22:32:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16399, '2026-03-22 22:33:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16400, '2026-03-22 22:34:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16401, '2026-03-22 22:35:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16402, '2026-03-22 22:36:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16403, '2026-03-22 22:37:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16404, '2026-03-22 22:38:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16405, '2026-03-22 22:39:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16406, '2026-03-22 22:40:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16407, '2026-03-22 22:41:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16408, '2026-03-22 22:42:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16409, '2026-03-22 22:43:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16410, '2026-03-22 22:44:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16411, '2026-03-22 22:45:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16412, '2026-03-22 22:46:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16413, '2026-03-22 22:47:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16414, '2026-03-22 22:48:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16415, '2026-03-22 22:49:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16416, '2026-03-22 22:50:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16417, '2026-03-22 22:51:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16418, '2026-03-22 22:52:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16419, '2026-03-22 22:53:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16420, '2026-03-22 22:54:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16421, '2026-03-22 22:55:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16422, '2026-03-22 22:56:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16423, '2026-03-22 22:57:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16424, '2026-03-22 22:58:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16425, '2026-03-22 22:59:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16426, '2026-03-22 23:00:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16427, '2026-03-22 23:01:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16428, '2026-03-22 23:02:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16429, '2026-03-22 23:03:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16430, '2026-03-22 23:04:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16431, '2026-03-22 23:05:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16432, '2026-03-22 23:06:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16433, '2026-03-22 23:07:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16434, '2026-03-22 23:08:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16435, '2026-03-22 23:09:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16436, '2026-03-22 23:10:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16437, '2026-03-22 23:11:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16438, '2026-03-22 23:12:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16439, '2026-03-22 23:13:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16440, '2026-03-22 23:14:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16441, '2026-03-22 23:15:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16442, '2026-03-22 23:16:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16443, '2026-03-22 23:17:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16444, '2026-03-22 23:18:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16445, '2026-03-22 23:19:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16446, '2026-03-22 23:20:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16447, '2026-03-22 23:21:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16448, '2026-03-22 23:22:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16449, '2026-03-22 23:23:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16450, '2026-03-22 23:24:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16451, '2026-03-22 23:25:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16452, '2026-03-22 23:26:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16453, '2026-03-22 23:27:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16454, '2026-03-22 23:28:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16455, '2026-03-22 23:29:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16456, '2026-03-22 23:30:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16457, '2026-03-22 23:31:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16458, '2026-03-22 23:32:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16459, '2026-03-22 23:33:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16460, '2026-03-22 23:34:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16461, '2026-03-22 23:35:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16462, '2026-03-22 23:36:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16463, '2026-03-22 23:37:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16464, '2026-03-22 23:38:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16465, '2026-03-22 23:39:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16466, '2026-03-22 23:40:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16467, '2026-03-22 23:41:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16468, '2026-03-22 23:42:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16469, '2026-03-22 23:43:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16470, '2026-03-22 23:44:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16471, '2026-03-22 23:45:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16472, '2026-03-22 23:46:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16473, '2026-03-22 23:47:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16474, '2026-03-22 23:48:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16475, '2026-03-22 23:49:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16476, '2026-03-22 23:50:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16477, '2026-03-22 23:51:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16478, '2026-03-22 23:52:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16479, '2026-03-22 23:53:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16480, '2026-03-22 23:54:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16481, '2026-03-22 23:55:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16482, '2026-03-22 23:56:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16483, '2026-03-22 23:57:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16484, '2026-03-22 23:58:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16485, '2026-03-22 23:59:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16486, '2026-03-23 00:00:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16487, '2026-03-23 00:01:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16488, '2026-03-23 00:02:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16489, '2026-03-23 00:03:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16490, '2026-03-23 00:04:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16491, '2026-03-23 00:05:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16492, '2026-03-23 00:06:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16493, '2026-03-23 00:07:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16494, '2026-03-23 00:08:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16495, '2026-03-23 00:09:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16496, '2026-03-23 00:10:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16497, '2026-03-23 00:11:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16498, '2026-03-23 00:12:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16499, '2026-03-23 00:13:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16500, '2026-03-23 00:14:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16501, '2026-03-23 00:15:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16502, '2026-03-23 00:16:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16503, '2026-03-23 00:17:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16504, '2026-03-23 00:18:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16505, '2026-03-23 00:19:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16506, '2026-03-23 00:20:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16507, '2026-03-23 00:21:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16508, '2026-03-23 00:22:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16509, '2026-03-23 00:23:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16510, '2026-03-23 00:24:27', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16511, '2026-03-24 19:10:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16512, '2026-03-24 19:11:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16513, '2026-03-24 19:12:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16514, '2026-03-24 19:13:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16515, '2026-03-24 19:14:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16516, '2026-03-24 19:15:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16517, '2026-03-24 19:16:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16518, '2026-03-24 19:17:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16519, '2026-03-24 19:18:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16520, '2026-03-24 19:19:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16521, '2026-03-24 19:20:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16522, '2026-03-24 19:21:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16523, '2026-03-24 19:22:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16524, '2026-03-24 19:23:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16525, '2026-03-24 19:24:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16526, '2026-03-24 19:25:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16527, '2026-03-24 19:26:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16528, '2026-03-24 19:27:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16529, '2026-03-24 19:28:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16530, '2026-03-24 19:29:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16531, '2026-03-24 19:30:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16532, '2026-03-24 19:31:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16533, '2026-03-24 19:32:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16534, '2026-03-24 19:33:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16535, '2026-03-24 19:34:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16536, '2026-03-24 19:35:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16537, '2026-03-24 19:36:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16538, '2026-03-24 19:37:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16539, '2026-03-24 19:38:28', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16540, '2026-03-24 19:38:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16541, '2026-03-24 19:39:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16542, '2026-03-24 19:40:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16543, '2026-03-24 19:41:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16544, '2026-03-24 19:42:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16545, '2026-03-24 19:43:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16546, '2026-03-24 19:44:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16547, '2026-03-24 19:45:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16548, '2026-03-24 19:46:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16549, '2026-03-24 19:47:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16550, '2026-03-24 19:48:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16551, '2026-03-24 19:49:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16552, '2026-03-24 19:50:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16553, '2026-03-24 19:51:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16554, '2026-03-24 19:52:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16555, '2026-03-24 19:53:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16556, '2026-03-24 19:54:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16557, '2026-03-24 19:55:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16558, '2026-03-24 19:56:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16559, '2026-03-24 19:57:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16560, '2026-03-24 19:58:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16561, '2026-03-24 19:59:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16562, '2026-03-24 20:00:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16563, '2026-03-24 20:01:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16564, '2026-03-24 20:02:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16565, '2026-03-24 20:03:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16566, '2026-03-24 20:04:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16567, '2026-03-24 20:05:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16568, '2026-03-24 20:06:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16569, '2026-03-24 20:07:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16570, '2026-03-24 20:08:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16571, '2026-03-24 20:09:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16572, '2026-03-24 20:10:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16573, '2026-03-24 20:11:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16574, '2026-03-24 20:12:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16575, '2026-03-24 20:13:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16576, '2026-03-24 20:14:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16577, '2026-03-24 20:15:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16578, '2026-03-24 20:16:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16579, '2026-03-24 20:17:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16580, '2026-03-24 20:18:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16581, '2026-03-24 20:19:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16582, '2026-03-24 20:20:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16583, '2026-03-24 20:21:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16584, '2026-03-24 20:22:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16585, '2026-03-24 20:23:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16586, '2026-03-24 20:24:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16587, '2026-03-24 20:25:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16588, '2026-03-24 20:26:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16589, '2026-03-24 20:27:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16590, '2026-03-24 20:28:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16591, '2026-03-24 20:29:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16592, '2026-03-24 20:30:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16593, '2026-03-24 20:31:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16594, '2026-03-24 20:32:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16595, '2026-03-24 20:33:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16596, '2026-03-24 20:34:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16597, '2026-03-24 20:35:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16598, '2026-03-24 20:36:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16599, '2026-03-24 20:37:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16600, '2026-03-24 20:38:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16601, '2026-03-24 20:39:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16602, '2026-03-24 20:40:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16603, '2026-03-24 20:41:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16604, '2026-03-24 20:42:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16605, '2026-03-24 20:43:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16606, '2026-03-24 20:44:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16607, '2026-03-24 20:45:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16608, '2026-03-24 20:46:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16609, '2026-03-24 20:47:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16610, '2026-03-24 20:48:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16611, '2026-03-24 20:49:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16612, '2026-03-24 20:50:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16613, '2026-03-24 20:51:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16614, '2026-03-24 20:52:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16615, '2026-03-24 20:53:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16616, '2026-03-24 20:54:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16617, '2026-03-24 20:55:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16618, '2026-03-24 20:56:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16619, '2026-03-24 20:57:31', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16620, '2026-03-24 20:57:39', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16621, '2026-03-24 20:58:08', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16622, '2026-03-24 20:58:19', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16623, '2026-03-24 20:58:25', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16624, '2026-03-24 20:58:53', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16625, '2026-03-24 20:59:01', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16626, '2026-03-24 20:59:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16627, '2026-03-24 21:00:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16628, '2026-03-24 21:01:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16629, '2026-03-24 21:02:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16630, '2026-03-24 21:03:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16631, '2026-03-24 21:04:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16632, '2026-03-24 21:05:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16633, '2026-03-24 21:06:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16634, '2026-03-24 21:07:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16635, '2026-03-24 21:08:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16636, '2026-03-24 21:09:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16637, '2026-03-24 21:10:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16638, '2026-03-24 21:11:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16639, '2026-03-24 21:12:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16640, '2026-03-24 21:13:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16641, '2026-03-24 21:14:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16642, '2026-03-24 21:15:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16643, '2026-03-24 21:16:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16644, '2026-03-24 21:17:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16645, '2026-03-24 21:18:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16646, '2026-03-24 21:19:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16647, '2026-03-24 21:20:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16648, '2026-03-24 21:21:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16649, '2026-03-24 21:22:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16650, '2026-03-24 21:23:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16651, '2026-03-24 21:24:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16652, '2026-03-24 21:25:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16653, '2026-03-24 21:26:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16654, '2026-03-24 21:27:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16655, '2026-03-24 21:28:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16656, '2026-03-24 21:29:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16657, '2026-03-24 21:30:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16658, '2026-03-24 21:31:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16659, '2026-03-24 21:32:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16660, '2026-03-24 21:33:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16661, '2026-03-24 21:34:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16662, '2026-03-24 21:35:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16663, '2026-03-24 21:36:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16664, '2026-03-24 21:37:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16665, '2026-03-24 21:38:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16666, '2026-03-24 21:39:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16667, '2026-03-24 21:40:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16668, '2026-03-24 21:41:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16669, '2026-03-24 21:42:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16670, '2026-03-24 21:43:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16671, '2026-03-24 21:44:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16672, '2026-03-24 21:45:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16673, '2026-03-24 21:46:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16674, '2026-03-24 21:47:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16675, '2026-03-24 21:48:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16676, '2026-03-24 21:49:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16677, '2026-03-24 21:50:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16678, '2026-03-24 21:51:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16679, '2026-03-24 21:52:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16680, '2026-03-24 21:53:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16681, '2026-03-24 21:54:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16682, '2026-03-24 21:55:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16683, '2026-03-24 21:56:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16684, '2026-03-24 21:57:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16685, '2026-03-24 21:58:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16686, '2026-03-24 21:59:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16687, '2026-03-24 22:00:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16688, '2026-03-24 22:01:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16689, '2026-03-24 22:02:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16690, '2026-03-24 22:03:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16691, '2026-03-24 22:04:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16692, '2026-03-24 22:05:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16693, '2026-03-24 22:06:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16694, '2026-03-24 22:07:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16695, '2026-03-24 22:08:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16696, '2026-03-24 22:09:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16697, '2026-03-24 22:10:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16698, '2026-03-24 22:11:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16699, '2026-03-24 22:12:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16700, '2026-03-24 22:13:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL);
INSERT INTO `system_heartbeats` (`heartbeat_id`, `recorded_at`, `version`, `commit_hash`, `is_update`, `note`) VALUES
(16701, '2026-03-24 22:14:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16702, '2026-03-24 22:15:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16703, '2026-03-24 22:16:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16704, '2026-03-24 22:17:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16705, '2026-03-24 22:18:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16706, '2026-03-24 22:19:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16707, '2026-03-24 22:20:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16708, '2026-03-24 22:21:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16709, '2026-03-24 22:22:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16710, '2026-03-24 22:23:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16711, '2026-03-24 22:24:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16712, '2026-03-24 22:25:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16713, '2026-03-24 22:26:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16714, '2026-03-24 22:27:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16715, '2026-03-24 22:28:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16716, '2026-03-24 22:29:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16717, '2026-03-24 22:30:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16718, '2026-03-24 22:31:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16719, '2026-03-24 22:32:10', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16720, '2026-03-24 22:33:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, 'startup'),
(16721, '2026-03-24 22:34:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16722, '2026-03-24 22:35:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16723, '2026-03-24 22:36:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16724, '2026-03-24 22:37:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16725, '2026-03-24 22:38:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16726, '2026-03-24 22:39:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16727, '2026-03-24 22:40:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16728, '2026-03-24 22:41:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16729, '2026-03-24 22:42:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16730, '2026-03-24 22:43:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16731, '2026-03-24 22:44:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16732, '2026-03-24 22:45:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16733, '2026-03-24 22:46:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16734, '2026-03-24 22:47:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16735, '2026-03-24 22:48:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16736, '2026-03-24 22:49:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16737, '2026-03-24 22:50:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16738, '2026-03-24 22:51:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16739, '2026-03-24 22:52:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16740, '2026-03-24 22:53:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16741, '2026-03-24 22:54:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16742, '2026-03-24 22:55:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL),
(16743, '2026-03-24 22:56:00', '1.0', '46c1d44f9c605e96488573cadad590dde62b4e22', 0, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `teachers`
--

CREATE TABLE `teachers` (
  `person_id` int(11) NOT NULL,
  `cabinet_id` int(11) NOT NULL,
  `role` varchar(20) DEFAULT 'teacher',
  `employee_number` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `contract_type` varchar(20) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','inactive','terminated') DEFAULT 'active',
  `hours_per_week` int(11) DEFAULT 40,
  `school_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `teachers`
--

INSERT INTO `teachers` (`person_id`, `cabinet_id`, `role`, `employee_number`, `department`, `contract_type`, `start_date`, `end_date`, `status`, `hours_per_week`, `school_id`) VALUES
(2, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(3, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(4, 1, 'teacher', NULL, 'IT', 'fulltime', NULL, NULL, 'active', 40, 1),
(5, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(6, 1, 'teacher', NULL, 'IT', 'fulltime', NULL, NULL, 'active', 40, 1),
(7, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(8, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(9, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(10, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(11, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(12, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(13, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(14, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(15, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(16, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(17, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(18, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(19, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(20, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(21, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(22, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(23, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(34, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(35, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1),
(36, 1, 'teacher', NULL, NULL, NULL, NULL, NULL, 'active', 40, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `teachers_salary`
--

CREATE TABLE `teachers_salary` (
  `salary_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `salary` int(11) NOT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'CZK',
  `deductions` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `teachers_salary`
--

INSERT INTO `teachers_salary` (`salary_id`, `teacher_id`, `role`, `salary`, `valid_from`, `valid_to`, `currency`, `deductions`) VALUES
(1, NULL, 'teacher', 30000, NULL, NULL, 'CZK', 0.00),
(2, 2, '', 500, '2026-03-07', '2026-03-28', 'CZK', 0.00);

-- --------------------------------------------------------

--
-- Struktura tabulky `teachers_subject`
--

CREATE TABLE `teachers_subject` (
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `teachers_subject`
--

INSERT INTO `teachers_subject` (`teacher_id`, `subject_id`) VALUES
(15, 1),
(8, 2),
(15, 27),
(3, 36);

-- --------------------------------------------------------

--
-- Struktura tabulky `timetable`
--

CREATE TABLE `timetable` (
  `lesson_id` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `hour` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `teacher2_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `timetable`
--

INSERT INTO `timetable` (`lesson_id`, `day`, `hour`, `type`, `subject_id`, `teacher_id`, `room_id`, `group_id`, `teacher2_id`) VALUES
(1, 0, 1, 0, 33, 20, 1, 2, NULL),
(2, 0, 2, 0, 29, 11, 1, 2, NULL),
(3, 0, 3, 0, 6, 19, 1, 2, NULL),
(4, 0, 4, 0, 7, 23, 1, 2, NULL),
(5, 0, 5, 1, 32, 2, 1, 2, NULL),
(6, 0, 6, 1, 32, 2, 1, 2, NULL),
(7, 1, 1, 0, 4, 13, 1, 2, NULL),
(8, 1, 2, 0, 30, 18, 1, 2, NULL),
(11, 1, 3, 0, 2, 8, 1, 2, NULL),
(12, 1, 4, 0, 1, 15, 1, 4, NULL),
(13, 1, 5, 0, 6, 19, 1, 2, NULL),
(14, 1, 6, 0, 3, 22, 1, 4, NULL),
(15, 1, 8, 0, 8, 17, 1, 2, NULL),
(16, 2, 1, 0, 6, 19, 1, 2, NULL),
(17, 2, 2, 0, 2, 8, 1, 2, NULL),
(18, 2, 3, 0, 33, 20, 1, 2, NULL),
(19, 2, 4, 0, 31, 18, 1, 2, NULL),
(20, 2, 5, 0, 29, 11, 1, 2, NULL),
(21, 2, 6, 0, 7, 23, 1, 2, NULL),
(22, 2, 8, 0, 3, 22, 1, 4, NULL),
(23, 3, 3, 0, 11, 2, 1, 4, NULL),
(24, 3, 4, 0, 11, 2, 1, 4, NULL),
(25, 3, 5, 0, 1, 15, 1, 4, NULL),
(26, 3, 6, 0, 1, 15, 1, 4, NULL),
(27, 3, 8, 0, 2, 8, 1, 2, NULL),
(28, 4, 1, 0, 31, 2, 1, 4, NULL),
(29, 4, 2, 0, 31, 2, 1, 4, NULL),
(30, 4, 3, 0, 30, 18, 1, 4, NULL),
(31, 4, 4, 0, 30, 18, 1, 4, NULL),
(32, 4, 5, 0, 12, 21, 1, 4, NULL),
(33, 4, 6, 0, 12, 21, 1, 4, NULL),
(34, 3, 1, 0, 34, 20, 1, 5, NULL),
(35, 3, 2, 0, 34, 20, 1, 5, NULL),
(36, 0, 1, 0, 30, 5, 1, 9, NULL),
(37, 0, 2, 0, 30, 18, 1, 9, NULL),
(39, 0, 4, 1, 32, 36, 1, 9, NULL),
(40, 0, 5, 1, 32, 36, 1, 9, NULL),
(41, 0, 6, 0, 29, 11, 1, 10, NULL),
(42, 0, 8, 0, 4, 13, 1, 10, NULL),
(43, 1, 1, 0, 33, 4, 1, 9, NULL),
(44, 1, 2, 0, 33, 4, 1, 9, NULL),
(45, 1, 3, 0, 31, 4, 1, 9, NULL),
(46, 1, 4, 0, 31, 4, 1, 9, NULL),
(47, 1, 5, 0, 7, 23, 1, 10, NULL),
(48, 1, 6, 0, 2, 8, 1, 10, NULL),
(49, 1, 8, 0, 1, 15, 1, 9, NULL),
(50, 2, 1, 0, 6, 19, 1, 10, NULL),
(51, 2, 2, 0, 35, 2, 1, 10, NULL),
(52, 2, 3, 0, 7, 23, 1, 10, NULL),
(53, 2, 4, 0, 2, 8, 1, 10, NULL),
(56, 2, 5, 0, 1, 15, 1, 9, NULL),
(57, 2, 6, 0, 36, 15, 1, 9, NULL),
(58, 3, 1, 0, 6, 19, 1, 10, NULL),
(59, 3, 2, 0, 10, 34, 1, 10, NULL),
(61, 3, 4, 2, 32, 35, 1, 9, NULL),
(63, 3, 4, 1, 29, 11, 1, 9, NULL),
(64, 3, 5, 0, 30, 18, 1, 10, NULL),
(65, 3, 7, 0, 12, 21, 1, 9, NULL),
(66, 3, 8, 0, 12, 21, 1, 9, NULL),
(67, 4, 1, 0, 10, 34, 1, 10, NULL),
(68, 4, 2, 0, 2, 8, 1, 10, NULL),
(69, 4, 3, 0, 6, 19, 1, 10, NULL),
(70, 4, 4, 0, 32, 35, 1, 10, NULL),
(71, 4, 5, 0, 34, 11, 1, 11, NULL),
(72, 4, 6, 0, 32, 11, 1, 11, NULL),
(77, 1, 0, 0, 30, 8, 1, 9, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `timetable_schemas`
--

CREATE TABLE `timetable_schemas` (
  `ts_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `hour` int(11) NOT NULL,
  `type` enum('empty','disabled','maybe','lunch','continuous') NOT NULL DEFAULT 'empty',
  `assign_by` int(11) NOT NULL,
  `assign_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `timetable_schemas`
--

INSERT INTO `timetable_schemas` (`ts_id`, `scope_id`, `year`, `day`, `hour`, `type`, `assign_by`, `assign_at`, `updated_at`) VALUES
(151, -1, -1, 0, 0, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(152, -1, -1, 0, 1, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(153, -1, -1, 0, 2, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(154, -1, -1, 0, 3, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(155, -1, -1, 0, 4, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(156, -1, -1, 0, 5, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(157, -1, -1, 0, 6, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(158, -1, -1, 0, 7, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(159, -1, -1, 0, 8, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(160, -1, -1, 0, 9, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(161, -1, -1, 1, 0, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(162, -1, -1, 1, 1, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(163, -1, -1, 1, 2, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(164, -1, -1, 1, 3, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(165, -1, -1, 1, 4, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(166, -1, -1, 1, 5, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(167, -1, -1, 1, 6, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(168, -1, -1, 1, 7, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(169, -1, -1, 1, 8, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(170, -1, -1, 1, 9, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(171, -1, -1, 2, 0, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(172, -1, -1, 2, 1, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(173, -1, -1, 2, 2, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(174, -1, -1, 2, 3, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(175, -1, -1, 2, 4, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(176, -1, -1, 2, 5, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(177, -1, -1, 2, 6, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(178, -1, -1, 2, 7, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(179, -1, -1, 2, 8, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(180, -1, -1, 2, 9, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(181, -1, -1, 3, 0, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(182, -1, -1, 3, 1, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(183, -1, -1, 3, 2, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(184, -1, -1, 3, 3, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(185, -1, -1, 3, 4, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(186, -1, -1, 3, 5, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(187, -1, -1, 3, 6, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(188, -1, -1, 3, 7, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(189, -1, -1, 3, 8, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(190, -1, -1, 3, 9, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(191, -1, -1, 4, 0, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(192, -1, -1, 4, 1, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(193, -1, -1, 4, 2, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(194, -1, -1, 4, 3, 'continuous', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(195, -1, -1, 4, 4, 'lunch', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(196, -1, -1, 4, 5, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(197, -1, -1, 4, 6, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(198, -1, -1, 4, 7, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(199, -1, -1, 4, 8, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36'),
(200, -1, -1, 4, 9, 'disabled', 0, '2026-02-14 11:11:36', '2026-02-14 11:11:36');

-- --------------------------------------------------------

--
-- Struktura tabulky `tokens`
--

CREATE TABLE `tokens` (
  `token_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `password_id` int(11) NOT NULL,
  `user_agent` text NOT NULL,
  `expires` datetime(6) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL,
  `socket` text DEFAULT NULL,
  `ip` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `tokens`
--

INSERT INTO `tokens` (`token_id`, `token`, `password_id`, `user_agent`, `expires`, `created`, `user_id`, `socket`, `ip`) VALUES
(1, '$2b$04$O/CXeLUMdtC5Kiw3BKhnxuSjz/sxpAN/exXTjaCj8uXhfXESnhW.2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 13:17:41.333000', '2026-03-22 12:35:42.408000', 4, NULL, NULL),
(2, '$2b$04$KAP8iPBm4vazQeev4yQTruJLL88CWOO6R0XS9melchpmY7vK0/8hG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 18:10:32.616000', '2026-03-22 18:09:45.536000', 4, NULL, NULL),
(3, '$2b$04$MT446q3hjDJHMdfjcoiKM.kDIB2IrZcC8u66qqizixx4Oe1/BCUba', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 19:42:14.662000', '2026-03-22 18:44:55.230000', 4, NULL, NULL),
(4, '$2b$04$hZUimNbCtDb0LkebiR1boeWSwsu4XZmrUbNsrD2OdniD7L0D7QRgu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-22 21:04:19.568000', '2026-03-22 19:53:07.311000', 4, NULL, NULL),
(5, '$2b$04$8HdhWhPw3CxVp2g45gvWLuveAhd1RztXAcxM3d7DFhchr6K095p46', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 20:35:12.802000', '2026-03-24 20:11:33.464000', 4, NULL, NULL),
(6, '$2b$04$HIJDizs91puxneRdRswWPuLhwJGskdoKqKqmfLDwfMV/IEvmLJeyu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 22:00:58.702000', '2026-03-24 20:35:15.826000', 1, NULL, NULL),
(7, '$2b$04$cC/RTAfL/0vLgAqBoSX59uC7i0OFnPO5BEkL9rhQQiHJutW6fYs.6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 22:21:33.055000', '2026-03-24 22:01:03.603000', 4, NULL, '109.164.51.14'),
(8, '$2b$04$rzEzliPgw1QDkNka/tvTK.t4ffzUm7dwbXWW/0OveMyLeRr2Ut1By', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', '2026-03-24 23:20:14.975000', '2026-03-24 22:21:35.856000', 1, NULL, '109.164.51.14'),
(9, '$2b$04$.bih3JlmxWsiLaYT3nKzPeDIBI4vLn3AU3ONUa5O.XKWHhTNSJ.Ri', 1, 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '2026-03-24 22:49:52.634000', '2026-03-24 22:34:43.813000', 1, NULL, '109.164.51.14');

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_companies`
--

CREATE TABLE `traineeship_companies` (
  `company_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `address_office` int(11) NOT NULL,
  `address_trainee` int(11) NOT NULL,
  `country_code` varchar(2) NOT NULL,
  `ico` text NOT NULL,
  `dic` text NOT NULL,
  `vat_id` text NOT NULL,
  `web` text DEFAULT NULL,
  `rp_first_name` text DEFAULT NULL,
  `rp_last_name` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `status` enum('request','approved','deleted','acceptable') NOT NULL DEFAULT 'request',
  `requested` timestamp(6) NULL DEFAULT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `contact` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `activity` text DEFAULT NULL,
  `equipment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_companies`
--

INSERT INTO `traineeship_companies` (`company_id`, `name`, `address_office`, `address_trainee`, `country_code`, `ico`, `dic`, `vat_id`, `web`, `rp_first_name`, `rp_last_name`, `phone`, `email`, `status`, `requested`, `created`, `contact`, `description`, `activity`, `equipment`) VALUES
(1, 'Napicu.eu', 1, 1, 'CZ', '69696969', 'CZ69696969', '', 'napicu.eu', 'Napicu', 'Člověk', '+37457812331', 'admin@napicu.eu', 'approved', '2025-01-01 22:49:42.000000', '2024-10-01 16:35:00.000000', NULL, 'KOMPENY DESKRIPŠON', 'Aktivitaaaaa', NULL),
(2, 'Lupták s.r.o.', 1, 1, 'CZ', '77777777', 'CZ77777777', '', 'luptak.cz', 'Lukáš', 'Němec', '', '', 'approved', '2024-08-02 20:21:09.125251', '2024-08-11 16:35:06.000000', NULL, NULL, NULL, 'FILIPA POTŘEBUJETE'),
(3, 'Zatka s.r.o.', 1, 1, 'CZ', '11111111', 'CZ11111111', '', 'zatka.cz', 'Pan', 'Zatka', '', '', 'approved', '2024-11-20 21:21:09.125251', '2024-12-08 17:35:10.000000', NULL, NULL, NULL, NULL),
(6, 'WEDOS Internet, a.s.', 1, 1, 'CZ', '28115708', 'CZ28115708', '', 'vedos.cz', 'Josef', 'Grill', '777222543', 'hosting@wedos.com', 'approved', '2025-04-05 08:30:31.000000', '2025-04-05 08:30:31.000000', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_company_rating`
--

CREATE TABLE `traineeship_company_rating` (
  `review_id` int(11) UNSIGNED NOT NULL,
  `company_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `rating` decimal(10,1) NOT NULL,
  `experience` text DEFAULT NULL,
  `would_recommend` tinyint(1) NOT NULL DEFAULT 1,
  `is_anon` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_company_rating`
--

INSERT INTO `traineeship_company_rating` (`review_id`, `company_id`, `student_id`, `rating`, `experience`, `would_recommend`, `is_anon`, `created_at`) VALUES
(1, 1, 1, 5.0, '', 1, 1, '2025-11-05 16:03:43.827048'),
(2, 1, 27, 2.5, '', 0, 1, '2025-11-05 16:03:43.827048'),
(3, 1, 30, 4.5, '', 1, 1, '2025-11-05 16:03:43.827048'),
(4, 1, 32, 4.5, '', 1, 1, '2025-11-05 16:03:43.827048'),
(5, 1, 25, 5.0, '', 1, 1, '2025-11-05 16:03:43.827048');

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_company_scopes`
--

CREATE TABLE `traineeship_company_scopes` (
  `tscs_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `scope_id` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_company_scopes`
--

INSERT INTO `traineeship_company_scopes` (`tscs_id`, `company_id`, `scope_id`, `status`) VALUES
(1, 1, 2, 1),
(2, 1, 1, 1),
(3, 2, 3, 1),
(4, 2, 1, 1),
(5, 1, 3, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_config`
--

CREATE TABLE `traineeship_config` (
  `tr_config` int(11) NOT NULL,
  `is_activated` tinyint(1) NOT NULL DEFAULT 1,
  `manager_id` int(11) DEFAULT NULL,
  `default_ignore_days` text DEFAULT NULL,
  `allow_map` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_config`
--

INSERT INTO `traineeship_config` (`tr_config`, `is_activated`, `manager_id`, `default_ignore_days`, `allow_map`) VALUES
(1, 1, 3, NULL, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_diary`
--

CREATE TABLE `traineeship_diary` (
  `diary_id` int(11) NOT NULL,
  `tr_week_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` enum('unlisted','filed') NOT NULL DEFAULT 'unlisted',
  `date` date NOT NULL,
  `title` text NOT NULL,
  `hours` int(11) NOT NULL,
  `gained` text NOT NULL,
  `description` text NOT NULL,
  `mark` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_instructors`
--

CREATE TABLE `traineeship_instructors` (
  `instructor_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `firstname` text NOT NULL,
  `lastname` text NOT NULL,
  `email` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `status` enum('active','deleted') NOT NULL DEFAULT 'active',
  `added_by` int(11) DEFAULT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_instructors`
--

INSERT INTO `traineeship_instructors` (`instructor_id`, `company_id`, `firstname`, `lastname`, `email`, `phone`, `role`, `status`, `added_by`, `created`, `last_updated`) VALUES
(1, 2, 'Lukáš', 'Němec', NULL, NULL, NULL, 'active', 4, '2025-03-16 18:30:31.804432', '2026-02-20 23:50:04'),
(2, 1, 'Pavel', 'Vyroubal', 'pa.vyroubal@napicu.eu', '607444222', 'Vývojář', 'active', 4, '2025-03-16 18:30:31.804432', '2026-02-20 23:50:02'),
(3, 1, 'Kokot', 'Leo', 'kokot.leo@napicu.eu', '772362488', 'Vedoucí směny', 'active', 4, '2025-11-09 22:18:02.883000', '2025-12-15 19:46:54'),
(4, 1, 'KOKOTINEC', 'babinec', 'kokot@napicu.eu', '+421444666222', 'Kokot na recepci', 'deleted', 4, '2025-11-09 22:19:30.848000', '2026-01-22 21:27:29'),
(5, 1, 'Michal', 'Mácha', 'mmacha@kokot.sps-pi.cz', '123456489', 'Spáč', 'active', 4, '2025-11-13 11:05:15.318000', '2025-11-13 11:05:35');

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_students`
--

CREATE TABLE `traineeship_students` (
  `student_id` int(11) NOT NULL,
  `traineeship_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `instructor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_students`
--

INSERT INTO `traineeship_students` (`student_id`, `traineeship_id`, `company_id`, `instructor_id`) VALUES
(1, 1, 1, 4),
(1, 2, 1, 3);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_weeks`
--

CREATE TABLE `traineeship_weeks` (
  `tr_week_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `ignored_days` text DEFAULT NULL,
  `state` enum('active','canceled') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_weeks`
--

INSERT INTO `traineeship_weeks` (`tr_week_id`, `group_id`, `name`, `start`, `end`, `ignored_days`, `state`) VALUES
(1, 10, '1. Praxe sk. 10', '2025-12-22', '2026-01-02', '6,7', 'active'),
(2, 10, '', '2025-01-13', '2025-01-24', '6,7', 'active');

-- --------------------------------------------------------

--
-- Struktura tabulky `tutoring_sessions`
--

CREATE TABLE `tutoring_sessions` (
  `session_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` datetime NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `max_students` int(11) DEFAULT 10,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `tutoring_sessions`
--

INSERT INTO `tutoring_sessions` (`session_id`, `school_id`, `teacher_id`, `subject_id`, `class_id`, `title`, `description`, `date`, `room_id`, `max_students`, `created_at`) VALUES
(1, 1, 4, NULL, NULL, 'Příprava na maturitu', NULL, '2026-02-27 12:00:00', 1, 30, '2026-02-26 19:28:16');

-- --------------------------------------------------------

--
-- Struktura tabulky `tutoring_signups`
--

CREATE TABLE `tutoring_signups` (
  `signup_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `signed_up_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `tutoring_signups`
--

INSERT INTO `tutoring_signups` (`signup_id`, `session_id`, `student_id`, `signed_up_at`) VALUES
(2, 1, 1, '2026-02-26 19:28:48');

-- --------------------------------------------------------

--
-- Struktura tabulky `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `username` text NOT NULL,
  `password_id` int(11) NOT NULL,
  `login_type` enum('local','ldap') NOT NULL DEFAULT 'local',
  `role` enum('student','teacher','parent','admin_staff','management','personnel','maintenance','other') NOT NULL DEFAULT 'student',
  `manager` int(11) NOT NULL DEFAULT 0,
  `principal` tinyint(1) NOT NULL DEFAULT 0,
  `theme` int(11) NOT NULL,
  `locale` text NOT NULL,
  `password_changed` date DEFAULT NULL,
  `recommend_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `cookies` tinyint(1) NOT NULL DEFAULT 0,
  `school_id` int(11) NOT NULL,
  `auto_select_next_week` tinyint(1) NOT NULL DEFAULT 1,
  `fastlogin` tinyint(1) NOT NULL DEFAULT 1,
  `levels_exp` int(11) NOT NULL DEFAULT 0,
  `2fa` tinyint(1) NOT NULL DEFAULT 0,
  `2fa_secret` text DEFAULT NULL,
  `2fa_activated` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'{}\'',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `users`
--

INSERT INTO `users` (`user_id`, `person_id`, `username`, `password_id`, `login_type`, `role`, `manager`, `principal`, `theme`, `locale`, `password_changed`, `recommend_change_password`, `cookies`, `school_id`, `auto_select_next_week`, `fastlogin`, `levels_exp`, `2fa`, `2fa_secret`, `2fa_activated`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 1, 'kosik', 1, 'local', 'student', 0, 0, 1, 'cs', '2025-10-14', 0, 1, 1, 1, 1, 745, 0, 'KAWWUUIQHNLE64TC', '2025-10-14 09:35:04', '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"26yt70\",\"rotate\":341,\"eyes\":\"variant6W14\",\"eyesColor\":\"3c2005\",\"face\":\"variant5\",\"faceOffsetX\":0,\"mouth\":\"variant1\",\"mouthColor\":\"000000\",\"shapeColor\":\"f0d5be\",\"backgroundColor\":\"1c799f\"}', '2026-02-08 20:20:28', '2026-03-15 09:46:32'),
(2, 2, 'pizinger', 1, 'local', 'teacher', 0, 0, 1, 'cs', NULL, 0, 1, 1, 1, 1, 0, 0, 'IIVUCG3XBA2TGCAI', '2025-06-27 14:33:48', '{\"type\":\"thumbs\",\"radius\":50,\"seed\":\"9jjrig\",\"rotate\":37,\"faceOffsetX\":15,\"eyes\":\"variant1W12\",\"eyesColor\":\"000000\",\"backgroundColor\":\"transparent\"}', '2026-02-08 20:20:28', '2026-03-18 15:25:16'),
(3, 33, 'testrodic', 1, 'local', 'parent', 0, 0, 1, 'cs', NULL, 0, 2, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}', '2026-02-08 20:20:28', '2026-02-08 20:20:28'),
(4, 4, 'admin', 1, 'local', 'teacher', -1, 1, 1, 'cs', '2026-03-08', 0, 1, 1, 1, 1, 0, 0, 'BNISMDCKKE7CYDLX', '2026-03-04 20:48:37', '{\"type\":\"thumbs\",\"seed\":\"jszgw3\",\"radius\":50,\"rotate\":37,\"eyes\":\"variant4W10\",\"eyesColor\":\"000000\",\"face\":\"variant2\",\"mouth\":\"variant2\",\"mouthColor\":\"ffffff\",\"shapeColor\":\"c68642\",\"backgroundColor\":\"transparent\",\"faceOffsetX\":-13}', '2026-02-08 20:20:28', '2026-03-15 10:00:45'),
(5, 24, 'student1', 1, 'local', 'student', 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}', '2026-02-08 20:20:28', '2026-02-08 20:20:28'),
(6, 25, 'student2', 1, 'local', 'student', 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}', '2026-02-08 20:20:28', '2026-02-08 20:20:28'),
(7, 26, 'student3', 1, 'local', 'student', 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}', '2026-02-08 20:20:28', '2026-02-08 20:20:28'),
(8, 44, 'admin', 18, 'local', 'management', -1, 1, 0, 'en', NULL, 0, 1, 3, 1, 0, 0, 0, NULL, '2026-02-18 21:16:32', '', '2026-02-18 21:16:32', '2026-02-18 21:24:16'),
(12, 46, 'jkosik', 23, 'ldap', 'student', 0, 0, 0, 'cs', NULL, 0, 7, 1, 1, 1, 0, 0, NULL, '2026-03-04 22:32:21', '\'{}\'', '2026-03-04 22:32:21', '2026-03-05 07:44:44'),
(13, 28, 'ahercig', 26, 'local', 'student', 0, 0, 0, 'cs', '2026-03-12', 0, 7, 1, 1, 1, 0, 0, NULL, '2026-03-12 11:52:18', '\'{}\'', '2026-03-12 11:52:18', '2026-03-12 11:52:42');

-- --------------------------------------------------------

--
-- Struktura tabulky `users_backup_codes`
--

CREATE TABLE `users_backup_codes` (
  `ubc_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code` varchar(9) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `used_at` timestamp NULL DEFAULT NULL,
  `used_ip` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `users_backup_codes`
--

INSERT INTO `users_backup_codes` (`ubc_id`, `user_id`, `code`, `used`, `used_at`, `used_ip`, `created_at`) VALUES
(67, 4, 'VN54-5DUH', 0, NULL, NULL, '2026-03-04 20:48:37'),
(68, 4, 'PK6K-RWMY', 0, NULL, NULL, '2026-03-04 20:48:37'),
(69, 4, 'YTAK-WJDJ', 0, NULL, NULL, '2026-03-04 20:48:37'),
(70, 4, 'A84D-KT85', 0, NULL, NULL, '2026-03-04 20:48:37'),
(71, 4, '9VDA-3PEM', 0, NULL, NULL, '2026-03-04 20:48:37'),
(72, 4, 'WU4K-8SWF', 0, NULL, NULL, '2026-03-04 20:48:37');

-- --------------------------------------------------------

--
-- Struktura tabulky `users_credentials`
--

CREATE TABLE `users_credentials` (
  `id` int(11) NOT NULL,
  `credential_id` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `public_key` text NOT NULL,
  `counter` int(11) NOT NULL,
  `device_name` text NOT NULL,
  `device_type` enum('singleDevice','multiDevice') NOT NULL DEFAULT 'multiDevice',
  `transports` text NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used` timestamp NULL DEFAULT NULL,
  `backed_up` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `users_credentials`
--

INSERT INTO `users_credentials` (`id`, `credential_id`, `user_id`, `public_key`, `counter`, `device_name`, `device_type`, `transports`, `registered_at`, `last_used`, `backed_up`) VALUES
(1, 'SxKvBok2QgSkL7sZJ6Oc1g', 4, 'pQECAyYgASFYICtqcwc4HlL0kyzYDUcQ7GC2tJgfSyOD2hgrlkLKs1HqIlgg4ezMV1eDoYgFHVa4INILgwI0LdBcHAdF0KfArxcgFwg=', 0, '', 'multiDevice', '[]', '2026-01-19 15:22:17', '2026-01-26 18:57:32', 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `users_resetpassword`
--

CREATE TABLE `users_resetpassword` (
  `user_resetpassword_id` int(11) NOT NULL,
  `email_token` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `otp_code` text DEFAULT NULL,
  `ip` text DEFAULT NULL,
  `user_agent` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `user_permissions`
--

CREATE TABLE `user_permissions` (
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `webauthn_challenges`
--

CREATE TABLE `webauthn_challenges` (
  `user_id` int(11) NOT NULL,
  `challenge` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `webauthn_challenges`
--

INSERT INTO `webauthn_challenges` (`user_id`, `challenge`, `created_at`, `expires_at`) VALUES
(1, 'UI8a2w2v5OOUqjYSgDE8P8sMD3LFygb_l0plYLh62ro', '2025-06-27 14:48:11', '2025-06-27 14:53:11'),
(1, 'Muh3nO2PlunUQImDVo0XIZbgJ7ngiqaTOjgJZaB8pLk', '2025-08-17 12:17:25', '2025-08-17 12:22:25'),
(4, 'o9VHsHDgxJO8I-wymGWs8GvI2MsPO7JVrMzizoBH25Q', '2026-01-19 15:22:14', '2026-01-19 15:27:14'),
(4, '8jr1NjMKWK4q6qAZ-0CuHkUkZ-bHMiSfo4wJk_L0ljQ', '2026-03-06 10:35:15', '2026-03-06 10:40:15');

-- --------------------------------------------------------

--
-- Struktura tabulky `_migrations`
--

CREATE TABLE `_migrations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexy pro exportované tabulky
--

--
-- Indexy pro tabulku `absence`
--
ALTER TABLE `absence`
  ADD UNIQUE KEY `student` (`student_id`,`lesson_id`),
  ADD KEY `absence_ibfk_1` (`lesson_id`);

--
-- Indexy pro tabulku `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `cityId` (`city_id`);

--
-- Indexy pro tabulku `analytics_visits`
--
ALTER TABLE `analytics_visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexy pro tabulku `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `admin` (`user_id`);

--
-- Indexy pro tabulku `avatar_history`
--
ALTER TABLE `avatar_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexy pro tabulku `backups`
--
ALTER TABLE `backups`
  ADD PRIMARY KEY (`backup_id`);

--
-- Indexy pro tabulku `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`building_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `building_exits`
--
ALTER TABLE `building_exits`
  ADD PRIMARY KEY (`be_id`),
  ADD KEY `floor_id` (`floor_id`);

--
-- Indexy pro tabulku `building_floors`
--
ALTER TABLE `building_floors`
  ADD PRIMARY KEY (`bf_id`),
  ADD UNIQUE KEY `building_id` (`building_id`,`level`);

--
-- Indexy pro tabulku `building_rooms`
--
ALTER TABLE `building_rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `floor_id` (`floor_id`),
  ADD KEY `manager` (`manager_id`);

--
-- Indexy pro tabulku `building_rooms_occupancy`
--
ALTER TABLE `building_rooms_occupancy`
  ADD PRIMARY KEY (`bro_id`),
  ADD UNIQUE KEY `event_id` (`event_id`,`room_id`,`person_id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexy pro tabulku `channel_messages`
--
ALTER TABLE `channel_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `reply_to` (`reply_to`),
  ADD KEY `idx_channel_messages_channel` (`channel_id`);

--
-- Indexy pro tabulku `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`city_id`),
  ADD KEY `countryId` (`country_id`);

--
-- Indexy pro tabulku `classbook`
--
ALTER TABLE `classbook`
  ADD PRIMARY KEY (`classbook_id`),
  ADD UNIQUE KEY `date` (`date`,`day_hour`,`group_id`),
  ADD KEY `subject` (`subject_id`),
  ADD KEY `teacher` (`teacher_id`),
  ADD KEY `room` (`room_id`),
  ADD KEY `groupId` (`group_id`);

--
-- Indexy pro tabulku `classbook_notes`
--
ALTER TABLE `classbook_notes`
  ADD PRIMARY KEY (`classbook_note_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexy pro tabulku `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`class_id`),
  ADD KEY `room` (`room_id`),
  ADD KEY `teacher` (`teacher_id`),
  ADD KEY `scopeId` (`scope_id`),
  ADD KEY `yearId` (`year_id`);

--
-- Indexy pro tabulku `class_service`
--
ALTER TABLE `class_service`
  ADD PRIMARY KEY (`cs_id`),
  ADD KEY `student` (`student_id`);

--
-- Indexy pro tabulku `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`country_id`);

--
-- Indexy pro tabulku `degrees`
--
ALTER TABLE `degrees`
  ADD PRIMARY KEY (`degree_id`);

--
-- Indexy pro tabulku `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`district_id`),
  ADD UNIQUE KEY `district` (`district`) USING HASH;

--
-- Indexy pro tabulku `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `file_id` (`file_id`);

--
-- Indexy pro tabulku `document_permissions`
--
ALTER TABLE `document_permissions`
  ADD PRIMARY KEY (`document_permission_id`);

--
-- Indexy pro tabulku `education_measures`
--
ALTER TABLE `education_measures`
  ADD PRIMARY KEY (`em_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `issued_by` (`issued_by`);

--
-- Indexy pro tabulku `emails`
--
ALTER TABLE `emails`
  ADD UNIQUE KEY `email` (`email`) USING HASH,
  ADD KEY `personId` (`person_id`);

--
-- Indexy pro tabulku `email_config`
--
ALTER TABLE `email_config`
  ADD PRIMARY KEY (`config_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `emergency_events`
--
ALTER TABLE `emergency_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `reported_by` (`reported_by`);

--
-- Indexy pro tabulku `emergency_event_types`
--
ALTER TABLE `emergency_event_types`
  ADD PRIMARY KEY (`eet_id`),
  ADD UNIQUE KEY `unique_code` (`code`);

--
-- Indexy pro tabulku `emergency_event_users`
--
ALTER TABLE `emergency_event_users`
  ADD UNIQUE KEY `event_id` (`event_id`,`person_id`),
  ADD KEY `person_id` (`person_id`);

--
-- Indexy pro tabulku `emergency_notifications`
--
ALTER TABLE `emergency_notifications`
  ADD PRIMARY KEY (`en_id`),
  ADD UNIQUE KEY `event_id` (`event_id`,`person_id`),
  ADD KEY `person_id` (`person_id`);

--
-- Indexy pro tabulku `employee_attendance`
--
ALTER TABLE `employee_attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `teacherId` (`teacher_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexy pro tabulku `employee_bonuses`
--
ALTER TABLE `employee_bonuses`
  ADD PRIMARY KEY (`bonus_id`),
  ADD KEY `teacherId` (`teacher_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexy pro tabulku `employee_vacation_balance`
--
ALTER TABLE `employee_vacation_balance`
  ADD PRIMARY KEY (`balance_id`),
  ADD KEY `teacherId` (`teacher_id`);

--
-- Indexy pro tabulku `employee_vacation_requests`
--
ALTER TABLE `employee_vacation_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexy pro tabulku `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexy pro tabulku `family_relations`
--
ALTER TABLE `family_relations`
  ADD PRIMARY KEY (`family_relation_id`),
  ADD UNIQUE KEY `source` (`source_id`,`target_id`),
  ADD KEY `target` (`target_id`),
  ADD KEY `role` (`role`);

--
-- Indexy pro tabulku `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`file_id`),
  ADD UNIQUE KEY `file_uuid` (`file_uuid`) USING HASH;

--
-- Indexy pro tabulku `files_tokens`
--
ALTER TABLE `files_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD KEY `file_id` (`file_id`),
  ADD KEY `token_owner` (`token_owner`);

--
-- Indexy pro tabulku `fleetvehicles_expenses`
--
ALTER TABLE `fleetvehicles_expenses`
  ADD PRIMARY KEY (`fv_ex_id`),
  ADD KEY `createdBy` (`created_by`),
  ADD KEY `vehicleId` (`vehicle_id`);

--
-- Indexy pro tabulku `fleetvehicles_maintenance`
--
ALTER TABLE `fleetvehicles_maintenance`
  ADD PRIMARY KEY (`fv_ma_id`),
  ADD KEY `createdBy` (`created_by`),
  ADD KEY `vehicleId` (`vehicle_id`);

--
-- Indexy pro tabulku `fleetvehicles_trips`
--
ALTER TABLE `fleetvehicles_trips`
  ADD PRIMARY KEY (`trip_id`),
  ADD KEY `vehicleId` (`vehicle_id`),
  ADD KEY `driverId` (`driver_id`);

--
-- Indexy pro tabulku `fleetvehicles_vehicles`
--
ALTER TABLE `fleetvehicles_vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `vin` (`vin`),
  ADD UNIQUE KEY `plate` (`plate`) USING HASH,
  ADD KEY `countryId_manufacture` (`manufacture_country_id`),
  ADD KEY `registration_countryId` (`registration_country_id`);

--
-- Indexy pro tabulku `fleetvehicles_vignette_cache`
--
ALTER TABLE `fleetvehicles_vignette_cache`
  ADD PRIMARY KEY (`fv_vc_id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `country_id` (`country_id`);

--
-- Indexy pro tabulku `gdpr_consents`
--
ALTER TABLE `gdpr_consents`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `gdpr_reports`
--
ALTER TABLE `gdpr_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `gdpr_requests`
--
ALTER TABLE `gdpr_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `gdpr_reviews`
--
ALTER TABLE `gdpr_reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `gdpr_training`
--
ALTER TABLE `gdpr_training`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `gdpr_user_consents`
--
ALTER TABLE `gdpr_user_consents`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `gdpr_user_training`
--
ALTER TABLE `gdpr_user_training`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD KEY `columnId` (`column_id`),
  ADD KEY `student` (`student_id`),
  ADD KEY `teacher` (`teacher_id`);

--
-- Indexy pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  ADD PRIMARY KEY (`column_id`),
  ADD UNIQUE KEY `groupId_2` (`group_id`,`subject_id`,`column_index`),
  ADD KEY `groupId` (`group_id`),
  ADD KEY `subject` (`subject_id`);

--
-- Indexy pro tabulku `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`group_id`),
  ADD UNIQUE KEY `name` (`name`,`num`,`class_id`,`year_id`) USING HASH,
  ADD KEY `year` (`year_id`),
  ADD KEY `class` (`class_id`);

--
-- Indexy pro tabulku `group_channels`
--
ALTER TABLE `group_channels`
  ADD PRIMARY KEY (`channel_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexy pro tabulku `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexy pro tabulku `homework`
--
ALTER TABLE `homework`
  ADD PRIMARY KEY (`homework_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexy pro tabulku `insurance_companies`
--
ALTER TABLE `insurance_companies`
  ADD UNIQUE KEY `insuranceId` (`insurance_id`);

--
-- Indexy pro tabulku `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `from_room_id` (`from_room_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `to_room_id` (`to_room_id`);

--
-- Indexy pro tabulku `ldap_config`
--
ALTER TABLE `ldap_config`
  ADD PRIMARY KEY (`config_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `library_books`
--
ALTER TABLE `library_books`
  ADD PRIMARY KEY (`book_id`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `genreId` (`genre_id`);

--
-- Indexy pro tabulku `library_book_authors`
--
ALTER TABLE `library_book_authors`
  ADD PRIMARY KEY (`book_author_id`),
  ADD UNIQUE KEY `bookId` (`book_id`,`author_id`),
  ADD KEY `authorId` (`author_id`);

--
-- Indexy pro tabulku `library_copies`
--
ALTER TABLE `library_copies`
  ADD PRIMARY KEY (`copy_id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `bookId` (`book_id`);

--
-- Indexy pro tabulku `library_genres`
--
ALTER TABLE `library_genres`
  ADD PRIMARY KEY (`genre_id`);

--
-- Indexy pro tabulku `library_loans`
--
ALTER TABLE `library_loans`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `copyId` (`copy_id`),
  ADD KEY `readerId` (`reader_id`);

--
-- Indexy pro tabulku `library_reservations`
--
ALTER TABLE `library_reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `copyId` (`book_id`),
  ADD KEY `personId` (`person_id`);

--
-- Indexy pro tabulku `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`login_id`),
  ADD KEY `userId` (`user_id`),
  ADD KEY `token_id` (`token_id`);

--
-- Indexy pro tabulku `login_qrcodes`
--
ALTER TABLE `login_qrcodes`
  ADD UNIQUE KEY `qrcode` (`qrcode`);

--
-- Indexy pro tabulku `marking_scales`
--
ALTER TABLE `marking_scales`
  ADD PRIMARY KEY (`ms_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexy pro tabulku `marking_scales_groups`
--
ALTER TABLE `marking_scales_groups`
  ADD PRIMARY KEY (`msg_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `ms_id` (`ms_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexy pro tabulku `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `author` (`author_id`);

--
-- Indexy pro tabulku `messages_drafts`
--
ALTER TABLE `messages_drafts`
  ADD PRIMARY KEY (`draft_id`);

--
-- Indexy pro tabulku `messages_files`
--
ALTER TABLE `messages_files`
  ADD PRIMARY KEY (`ma_id`),
  ADD UNIQUE KEY `message_id` (`message_id`,`file_id`),
  ADD KEY `file_id` (`file_id`);

--
-- Indexy pro tabulku `messages_receivers`
--
ALTER TABLE `messages_receivers`
  ADD UNIQUE KEY `message` (`message_id`,`receiver_id`),
  ADD KEY `receiver` (`receiver_id`);

--
-- Indexy pro tabulku `message_groups`
--
ALTER TABLE `message_groups`
  ADD PRIMARY KEY (`group_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexy pro tabulku `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`reaction_id`),
  ADD UNIQUE KEY `unique_message_user_emoji` (`message_id`,`user_id`,`emoji`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexy pro tabulku `message_recipient_groups`
--
ALTER TABLE `message_recipient_groups`
  ADD PRIMARY KEY (`group_id`);

--
-- Indexy pro tabulku `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_read` (`user_id`,`read_at`);

--
-- Indexy pro tabulku `notification_rules`
--
ALTER TABLE `notification_rules`
  ADD PRIMARY KEY (`rule_id`),
  ADD UNIQUE KEY `unique_user_type` (`user_id`,`type`);

--
-- Indexy pro tabulku `oauth_tokens`
--
ALTER TABLE `oauth_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexy pro tabulku `online_lessons`
--
ALTER TABLE `online_lessons`
  ADD PRIMARY KEY (`lesson_id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexy pro tabulku `passwords`
--
ALTER TABLE `passwords`
  ADD PRIMARY KEY (`password_id`);

--
-- Indexy pro tabulku `payments_classes`
--
ALTER TABLE `payments_classes`
  ADD PRIMARY KEY (`payment_class_id`),
  ADD KEY `classId` (`class_id`);

--
-- Indexy pro tabulku `payments_columns`
--
ALTER TABLE `payments_columns`
  ADD PRIMARY KEY (`payment_column_id`),
  ADD KEY `createdBy` (`created_by`),
  ADD KEY `payment_class_id` (`payment_class_id`);

--
-- Indexy pro tabulku `payments_payments`
--
ALTER TABLE `payments_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `personId` (`person_id`),
  ADD KEY `paymentColumnId` (`payment_column_id`);

--
-- Indexy pro tabulku `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_name` (`permission_name`);

--
-- Indexy pro tabulku `persons`
--
ALTER TABLE `persons`
  ADD PRIMARY KEY (`person_id`),
  ADD KEY `persons_ibfk_1` (`insurance_id`),
  ADD KEY `address` (`address_id`),
  ADD KEY `birthplace` (`birthplace_id`);

--
-- Indexy pro tabulku `persons_degree`
--
ALTER TABLE `persons_degree`
  ADD UNIQUE KEY `person` (`person_id`,`degree_id`),
  ADD KEY `degree` (`degree_id`);

--
-- Indexy pro tabulku `phone_numbers`
--
ALTER TABLE `phone_numbers`
  ADD UNIQUE KEY `code` (`code`,`number`) USING HASH,
  ADD KEY `personId` (`person_id`);

--
-- Indexy pro tabulku `polls`
--
ALTER TABLE `polls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexy pro tabulku `poll_answers`
--
ALTER TABLE `poll_answers`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `poll_assigns`
--
ALTER TABLE `poll_assigns`
  ADD PRIMARY KEY (`poll_assign_id`),
  ADD KEY `assign_by` (`assign_by`),
  ADD KEY `poll_id` (`poll_id`),
  ADD KEY `grade_column` (`grade_column`);

--
-- Indexy pro tabulku `poll_assign_recipients`
--
ALTER TABLE `poll_assign_recipients`
  ADD PRIMARY KEY (`poll_assign_recipient_id`);

--
-- Indexy pro tabulku `poll_options`
--
ALTER TABLE `poll_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `poll_questions`
--
ALTER TABLE `poll_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `poll_responses`
--
ALTER TABLE `poll_responses`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `poll_response_questions`
--
ALTER TABLE `poll_response_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `poll_response_questions_response_id_index` (`response_id`),
  ADD KEY `poll_response_questions_question_id_index` (`question_id`);

--
-- Indexy pro tabulku `poll_shares`
--
ALTER TABLE `poll_shares`
  ADD PRIMARY KEY (`poll_share_id`),
  ADD KEY `poll_id` (`poll_id`),
  ADD KEY `user_id` (`person_id`);

--
-- Indexy pro tabulku `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD KEY `idx_push_subscriptions_user` (`user_id`);

--
-- Indexy pro tabulku `report_cards`
--
ALTER TABLE `report_cards`
  ADD PRIMARY KEY (`rc_id`);

--
-- Indexy pro tabulku `rewards`
--
ALTER TABLE `rewards`
  ADD PRIMARY KEY (`reward_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_rewards_student` (`student_id`),
  ADD KEY `idx_rewards_status` (`status`);

--
-- Indexy pro tabulku `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_key` (`role_key`);

--
-- Indexy pro tabulku `role_communication_permissions`
--
ALTER TABLE `role_communication_permissions`
  ADD PRIMARY KEY (`permission_id`);

--
-- Indexy pro tabulku `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexy pro tabulku `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`school_id`),
  ADD UNIQUE KEY `code` (`code`) USING HASH,
  ADD UNIQUE KEY `apiToken` (`api_token`) USING HASH,
  ADD KEY `district` (`district_id`),
  ADD KEY `owner` (`owner_id`),
  ADD KEY `country_id` (`country_id`);

--
-- Indexy pro tabulku `school_breaks`
--
ALTER TABLE `school_breaks`
  ADD UNIQUE KEY `hour` (`hour`,`school_id`) USING BTREE,
  ADD KEY `school` (`school_id`);

--
-- Indexy pro tabulku `school_domains`
--
ALTER TABLE `school_domains`
  ADD PRIMARY KEY (`domain_id`),
  ADD UNIQUE KEY `domain` (`domain`) USING HASH,
  ADD KEY `school` (`school_id`);

--
-- Indexy pro tabulku `school_evaluation_templates`
--
ALTER TABLE `school_evaluation_templates`
  ADD PRIMARY KEY (`template_id`);

--
-- Indexy pro tabulku `school_years`
--
ALTER TABLE `school_years`
  ADD PRIMARY KEY (`sy_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `scopes`
--
ALTER TABLE `scopes`
  ADD PRIMARY KEY (`scope_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `scopes_subjects`
--
ALTER TABLE `scopes_subjects`
  ADD PRIMARY KEY (`ss_id`),
  ADD KEY `scope_id` (`scope_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexy pro tabulku `semester_grades`
--
ALTER TABLE `semester_grades`
  ADD PRIMARY KEY (`s_g_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexy pro tabulku `students`
--
ALTER TABLE `students`
  ADD UNIQUE KEY `personID` (`person_id`),
  ADD KEY `class` (`class_id`);

--
-- Indexy pro tabulku `student_groups`
--
ALTER TABLE `student_groups`
  ADD UNIQUE KEY `student` (`student_id`,`group_id`),
  ADD KEY `groupId` (`group_id`);

--
-- Indexy pro tabulku `student_history`
--
ALTER TABLE `student_history`
  ADD PRIMARY KEY (`student_history_id`);

--
-- Indexy pro tabulku `student_homework`
--
ALTER TABLE `student_homework`
  ADD UNIQUE KEY `student-homework` (`student_id`,`homework_id`) USING BTREE,
  ADD KEY `homework` (`homework_id`);

--
-- Indexy pro tabulku `student_matrika`
--
ALTER TABLE `student_matrika`
  ADD PRIMARY KEY (`student_id`);

--
-- Indexy pro tabulku `student_matrika_records`
--
ALTER TABLE `student_matrika_records`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `student_medical_records`
--
ALTER TABLE `student_medical_records`
  ADD PRIMARY KEY (`record_id`);

--
-- Indexy pro tabulku `student_notes`
--
ALTER TABLE `student_notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexy pro tabulku `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `substitution`
--
ALTER TABLE `substitution`
  ADD PRIMARY KEY (`substitution_id`),
  ADD KEY `groupId` (`group_id`),
  ADD KEY `subjectId` (`subject_id`),
  ADD KEY `teacherId` (`teacher_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `roomId` (`room_id`);

--
-- Indexy pro tabulku `supervisions`
--
ALTER TABLE `supervisions`
  ADD PRIMARY KEY (`supervision_id`),
  ADD KEY `fk_supervisions_teacher` (`teacher_id`),
  ADD KEY `fk_supervisions_place` (`place_id`);

--
-- Indexy pro tabulku `supervision_places`
--
ALTER TABLE `supervision_places`
  ADD PRIMARY KEY (`place_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `system_heartbeats`
--
ALTER TABLE `system_heartbeats`
  ADD PRIMARY KEY (`heartbeat_id`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexy pro tabulku `teachers`
--
ALTER TABLE `teachers`
  ADD UNIQUE KEY `personID` (`person_id`),
  ADD KEY `cabinet` (`cabinet_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexy pro tabulku `teachers_salary`
--
ALTER TABLE `teachers_salary`
  ADD PRIMARY KEY (`salary_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexy pro tabulku `teachers_subject`
--
ALTER TABLE `teachers_subject`
  ADD UNIQUE KEY `teacher_id` (`teacher_id`,`subject_id`),
  ADD KEY `subject` (`subject_id`),
  ADD KEY `teacher` (`teacher_id`);

--
-- Indexy pro tabulku `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`lesson_id`),
  ADD KEY `groupId` (`group_id`),
  ADD KEY `room` (`room_id`),
  ADD KEY `subject` (`subject_id`),
  ADD KEY `teacher` (`teacher_id`);

--
-- Indexy pro tabulku `timetable_schemas`
--
ALTER TABLE `timetable_schemas`
  ADD PRIMARY KEY (`ts_id`);

--
-- Indexy pro tabulku `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `token` (`token`) USING HASH,
  ADD UNIQUE KEY `socketId` (`socket`) USING HASH,
  ADD KEY `password` (`password_id`),
  ADD KEY `userId` (`user_id`);

--
-- Indexy pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  ADD PRIMARY KEY (`company_id`),
  ADD UNIQUE KEY `CIN` (`ico`) USING HASH,
  ADD KEY `addressOffice` (`address_office`),
  ADD KEY `address_trainee` (`address_trainee`);

--
-- Indexy pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `companyId` (`company_id`),
  ADD KEY `studentId` (`student_id`);

--
-- Indexy pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  ADD PRIMARY KEY (`tscs_id`),
  ADD UNIQUE KEY `companyId` (`company_id`,`scope_id`),
  ADD KEY `scopeId` (`scope_id`);

--
-- Indexy pro tabulku `traineeship_config`
--
ALTER TABLE `traineeship_config`
  ADD PRIMARY KEY (`tr_config`),
  ADD KEY `manager` (`manager_id`);

--
-- Indexy pro tabulku `traineeship_diary`
--
ALTER TABLE `traineeship_diary`
  ADD PRIMARY KEY (`diary_id`),
  ADD KEY `trWeekId` (`tr_week_id`),
  ADD KEY `studentId` (`student_id`);

--
-- Indexy pro tabulku `traineeship_instructors`
--
ALTER TABLE `traineeship_instructors`
  ADD UNIQUE KEY `personId` (`instructor_id`,`company_id`),
  ADD KEY `company` (`company_id`),
  ADD KEY `added_by` (`added_by`);

--
-- Indexy pro tabulku `traineeship_students`
--
ALTER TABLE `traineeship_students`
  ADD UNIQUE KEY `studentId` (`student_id`,`traineeship_id`),
  ADD KEY `company` (`company_id`),
  ADD KEY `instructor` (`instructor_id`),
  ADD KEY `traineeship` (`traineeship_id`);

--
-- Indexy pro tabulku `traineeship_weeks`
--
ALTER TABLE `traineeship_weeks`
  ADD PRIMARY KEY (`tr_week_id`),
  ADD KEY `groupId` (`group_id`);

--
-- Indexy pro tabulku `tutoring_sessions`
--
ALTER TABLE `tutoring_sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexy pro tabulku `tutoring_signups`
--
ALTER TABLE `tutoring_signups`
  ADD PRIMARY KEY (`signup_id`),
  ADD UNIQUE KEY `unique_signup` (`session_id`,`student_id`);

--
-- Indexy pro tabulku `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `person_2` (`person_id`,`school_id`),
  ADD UNIQUE KEY `username` (`username`,`school_id`) USING HASH,
  ADD KEY `password` (`password_id`),
  ADD KEY `school` (`school_id`),
  ADD KEY `person` (`person_id`) USING BTREE;

--
-- Indexy pro tabulku `users_backup_codes`
--
ALTER TABLE `users_backup_codes`
  ADD PRIMARY KEY (`ubc_id`),
  ADD UNIQUE KEY `userId` (`user_id`,`code`);

--
-- Indexy pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`user_id`);

--
-- Indexy pro tabulku `users_resetpassword`
--
ALTER TABLE `users_resetpassword`
  ADD PRIMARY KEY (`user_resetpassword_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexy pro tabulku `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`user_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexy pro tabulku `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexy pro tabulku `webauthn_challenges`
--
ALTER TABLE `webauthn_challenges`
  ADD UNIQUE KEY `a` (`challenge`) USING HASH,
  ADD KEY `userId` (`user_id`);

--
-- Indexy pro tabulku `_migrations`
--
ALTER TABLE `_migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT pro tabulky
--

--
-- AUTO_INCREMENT pro tabulku `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `analytics_visits`
--
ALTER TABLE `analytics_visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8164;

--
-- AUTO_INCREMENT pro tabulku `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT pro tabulku `avatar_history`
--
ALTER TABLE `avatar_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT pro tabulku `backups`
--
ALTER TABLE `backups`
  MODIFY `backup_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT pro tabulku `buildings`
--
ALTER TABLE `buildings`
  MODIFY `building_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `building_exits`
--
ALTER TABLE `building_exits`
  MODIFY `be_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `building_floors`
--
ALTER TABLE `building_floors`
  MODIFY `bf_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `building_rooms`
--
ALTER TABLE `building_rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `building_rooms_occupancy`
--
ALTER TABLE `building_rooms_occupancy`
  MODIFY `bro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `channel_messages`
--
ALTER TABLE `channel_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `cities`
--
ALTER TABLE `cities`
  MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `classbook`
--
ALTER TABLE `classbook`
  MODIFY `classbook_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=237;

--
-- AUTO_INCREMENT pro tabulku `classbook_notes`
--
ALTER TABLE `classbook_notes`
  MODIFY `classbook_note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pro tabulku `classes`
--
ALTER TABLE `classes`
  MODIFY `class_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `class_service`
--
ALTER TABLE `class_service`
  MODIFY `cs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pro tabulku `countries`
--
ALTER TABLE `countries`
  MODIFY `country_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=250;

--
-- AUTO_INCREMENT pro tabulku `degrees`
--
ALTER TABLE `degrees`
  MODIFY `degree_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pro tabulku `districts`
--
ALTER TABLE `districts`
  MODIFY `district_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT pro tabulku `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pro tabulku `document_permissions`
--
ALTER TABLE `document_permissions`
  MODIFY `document_permission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `education_measures`
--
ALTER TABLE `education_measures`
  MODIFY `em_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `email_config`
--
ALTER TABLE `email_config`
  MODIFY `config_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `emergency_events`
--
ALTER TABLE `emergency_events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `emergency_event_types`
--
ALTER TABLE `emergency_event_types`
  MODIFY `eet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `emergency_notifications`
--
ALTER TABLE `emergency_notifications`
  MODIFY `en_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `employee_attendance`
--
ALTER TABLE `employee_attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pro tabulku `employee_bonuses`
--
ALTER TABLE `employee_bonuses`
  MODIFY `bonus_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `employee_vacation_balance`
--
ALTER TABLE `employee_vacation_balance`
  MODIFY `balance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pro tabulku `employee_vacation_requests`
--
ALTER TABLE `employee_vacation_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `family_relations`
--
ALTER TABLE `family_relations`
  MODIFY `family_relation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `files`
--
ALTER TABLE `files`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT pro tabulku `files_tokens`
--
ALTER TABLE `files_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_expenses`
--
ALTER TABLE `fleetvehicles_expenses`
  MODIFY `fv_ex_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_maintenance`
--
ALTER TABLE `fleetvehicles_maintenance`
  MODIFY `fv_ma_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_trips`
--
ALTER TABLE `fleetvehicles_trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_vehicles`
--
ALTER TABLE `fleetvehicles_vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_vignette_cache`
--
ALTER TABLE `fleetvehicles_vignette_cache`
  MODIFY `fv_vc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `gdpr_consents`
--
ALTER TABLE `gdpr_consents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `gdpr_reports`
--
ALTER TABLE `gdpr_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `gdpr_requests`
--
ALTER TABLE `gdpr_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `gdpr_reviews`
--
ALTER TABLE `gdpr_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `gdpr_training`
--
ALTER TABLE `gdpr_training`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `gdpr_user_consents`
--
ALTER TABLE `gdpr_user_consents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `gdpr_user_training`
--
ALTER TABLE `gdpr_user_training`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `grades`
--
ALTER TABLE `grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  MODIFY `column_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pro tabulku `groups`
--
ALTER TABLE `groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pro tabulku `group_channels`
--
ALTER TABLE `group_channels`
  MODIFY `channel_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `group_members`
--
ALTER TABLE `group_members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `homework`
--
ALTER TABLE `homework`
  MODIFY `homework_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pro tabulku `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `inventory_logs`
--
ALTER TABLE `inventory_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `ldap_config`
--
ALTER TABLE `ldap_config`
  MODIFY `config_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_books`
--
ALTER TABLE `library_books`
  MODIFY `book_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_book_authors`
--
ALTER TABLE `library_book_authors`
  MODIFY `book_author_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_copies`
--
ALTER TABLE `library_copies`
  MODIFY `copy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_genres`
--
ALTER TABLE `library_genres`
  MODIFY `genre_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_loans`
--
ALTER TABLE `library_loans`
  MODIFY `loan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `library_reservations`
--
ALTER TABLE `library_reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `login_history`
--
ALTER TABLE `login_history`
  MODIFY `login_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2230;

--
-- AUTO_INCREMENT pro tabulku `marking_scales`
--
ALTER TABLE `marking_scales`
  MODIFY `ms_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `marking_scales_groups`
--
ALTER TABLE `marking_scales_groups`
  MODIFY `msg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pro tabulku `messages_drafts`
--
ALTER TABLE `messages_drafts`
  MODIFY `draft_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `messages_files`
--
ALTER TABLE `messages_files`
  MODIFY `ma_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `message_groups`
--
ALTER TABLE `message_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `message_reactions`
--
ALTER TABLE `message_reactions`
  MODIFY `reaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `message_recipient_groups`
--
ALTER TABLE `message_recipient_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT pro tabulku `notification_rules`
--
ALTER TABLE `notification_rules`
  MODIFY `rule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pro tabulku `oauth_tokens`
--
ALTER TABLE `oauth_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `online_lessons`
--
ALTER TABLE `online_lessons`
  MODIFY `lesson_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `passwords`
--
ALTER TABLE `passwords`
  MODIFY `password_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pro tabulku `payments_classes`
--
ALTER TABLE `payments_classes`
  MODIFY `payment_class_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `payments_columns`
--
ALTER TABLE `payments_columns`
  MODIFY `payment_column_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `payments_payments`
--
ALTER TABLE `payments_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pro tabulku `persons`
--
ALTER TABLE `persons`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT pro tabulku `polls`
--
ALTER TABLE `polls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `poll_answers`
--
ALTER TABLE `poll_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `poll_assigns`
--
ALTER TABLE `poll_assigns`
  MODIFY `poll_assign_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `poll_assign_recipients`
--
ALTER TABLE `poll_assign_recipients`
  MODIFY `poll_assign_recipient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `poll_options`
--
ALTER TABLE `poll_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `poll_questions`
--
ALTER TABLE `poll_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `poll_responses`
--
ALTER TABLE `poll_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `poll_response_questions`
--
ALTER TABLE `poll_response_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `poll_shares`
--
ALTER TABLE `poll_shares`
  MODIFY `poll_share_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `report_cards`
--
ALTER TABLE `report_cards`
  MODIFY `rc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `rewards`
--
ALTER TABLE `rewards`
  MODIFY `reward_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `role_communication_permissions`
--
ALTER TABLE `role_communication_permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pro tabulku `schools`
--
ALTER TABLE `schools`
  MODIFY `school_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `school_domains`
--
ALTER TABLE `school_domains`
  MODIFY `domain_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `school_evaluation_templates`
--
ALTER TABLE `school_evaluation_templates`
  MODIFY `template_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `school_years`
--
ALTER TABLE `school_years`
  MODIFY `sy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `scopes`
--
ALTER TABLE `scopes`
  MODIFY `scope_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `scopes_subjects`
--
ALTER TABLE `scopes_subjects`
  MODIFY `ss_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=978;

--
-- AUTO_INCREMENT pro tabulku `semester_grades`
--
ALTER TABLE `semester_grades`
  MODIFY `s_g_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pro tabulku `student_history`
--
ALTER TABLE `student_history`
  MODIFY `student_history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pro tabulku `student_matrika_records`
--
ALTER TABLE `student_matrika_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `student_medical_records`
--
ALTER TABLE `student_medical_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `student_notes`
--
ALTER TABLE `student_notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT pro tabulku `substitution`
--
ALTER TABLE `substitution`
  MODIFY `substitution_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pro tabulku `supervisions`
--
ALTER TABLE `supervisions`
  MODIFY `supervision_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `supervision_places`
--
ALTER TABLE `supervision_places`
  MODIFY `place_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `system_heartbeats`
--
ALTER TABLE `system_heartbeats`
  MODIFY `heartbeat_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16744;

--
-- AUTO_INCREMENT pro tabulku `teachers_salary`
--
ALTER TABLE `teachers_salary`
  MODIFY `salary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `timetable`
--
ALTER TABLE `timetable`
  MODIFY `lesson_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT pro tabulku `timetable_schemas`
--
ALTER TABLE `timetable_schemas`
  MODIFY `ts_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- AUTO_INCREMENT pro tabulku `tokens`
--
ALTER TABLE `tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  MODIFY `review_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  MODIFY `tscs_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_config`
--
ALTER TABLE `traineeship_config`
  MODIFY `tr_config` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `traineeship_diary`
--
ALTER TABLE `traineeship_diary`
  MODIFY `diary_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `traineeship_instructors`
--
ALTER TABLE `traineeship_instructors`
  MODIFY `instructor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_weeks`
--
ALTER TABLE `traineeship_weeks`
  MODIFY `tr_week_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `tutoring_sessions`
--
ALTER TABLE `tutoring_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `tutoring_signups`
--
ALTER TABLE `tutoring_signups`
  MODIFY `signup_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pro tabulku `users_backup_codes`
--
ALTER TABLE `users_backup_codes`
  MODIFY `ubc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `users_resetpassword`
--
ALTER TABLE `users_resetpassword`
  MODIFY `user_resetpassword_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `_migrations`
--
ALTER TABLE `_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Omezení pro exportované tabulky
--

--
-- Omezení pro tabulku `absence`
--
ALTER TABLE `absence`
  ADD CONSTRAINT `absence_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`),
  ADD CONSTRAINT `absence_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `classbook` (`classbook_id`);

--
-- Omezení pro tabulku `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`);

--
-- Omezení pro tabulku `analytics_visits`
--
ALTER TABLE `analytics_visits`
  ADD CONSTRAINT `analytics_visits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `auditlog_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `avatar_history`
--
ALTER TABLE `avatar_history`
  ADD CONSTRAINT `avatar_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `buildings`
--
ALTER TABLE `buildings`
  ADD CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `building_exits`
--
ALTER TABLE `building_exits`
  ADD CONSTRAINT `building_exits_ibfk_1` FOREIGN KEY (`floor_id`) REFERENCES `building_floors` (`bf_id`);

--
-- Omezení pro tabulku `building_floors`
--
ALTER TABLE `building_floors`
  ADD CONSTRAINT `building_floors_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`building_id`);

--
-- Omezení pro tabulku `building_rooms`
--
ALTER TABLE `building_rooms`
  ADD CONSTRAINT `building_rooms_ibfk_1` FOREIGN KEY (`floor_id`) REFERENCES `building_floors` (`bf_id`);

--
-- Omezení pro tabulku `building_rooms_occupancy`
--
ALTER TABLE `building_rooms_occupancy`
  ADD CONSTRAINT `building_rooms_occupancy_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  ADD CONSTRAINT `building_rooms_occupancy_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `building_rooms_occupancy_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`room_id`);

--
-- Omezení pro tabulku `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`);

--
-- Omezení pro tabulku `classbook`
--
ALTER TABLE `classbook`
  ADD CONSTRAINT `classbook_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `classbook_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`),
  ADD CONSTRAINT `classbook_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `classbook_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `classbook_notes`
--
ALTER TABLE `classbook_notes`
  ADD CONSTRAINT `classbook_notes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `classbook_notes_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`),
  ADD CONSTRAINT `classbook_notes_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Omezení pro tabulku `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`),
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`scope_id`) REFERENCES `scopes` (`scope_id`),
  ADD CONSTRAINT `classes_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`),
  ADD CONSTRAINT `classes_ibfk_5` FOREIGN KEY (`year_id`) REFERENCES `school_years` (`sy_id`);

--
-- Omezení pro tabulku `class_service`
--
ALTER TABLE `class_service`
  ADD CONSTRAINT `class_service_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`);

--
-- Omezení pro tabulku `education_measures`
--
ALTER TABLE `education_measures`
  ADD CONSTRAINT `education_measures_ibfk_1` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `education_measures_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`);

--
-- Omezení pro tabulku `emails`
--
ALTER TABLE `emails`
  ADD CONSTRAINT `emails_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `email_config`
--
ALTER TABLE `email_config`
  ADD CONSTRAINT `email_config_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `emergency_events`
--
ALTER TABLE `emergency_events`
  ADD CONSTRAINT `emergency_events_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `emergency_event_types` (`eet_id`),
  ADD CONSTRAINT `emergency_events_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `emergency_event_users`
--
ALTER TABLE `emergency_event_users`
  ADD CONSTRAINT `emergency_event_users_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `emergency_events` (`event_id`),
  ADD CONSTRAINT `emergency_event_users_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `emergency_notifications`
--
ALTER TABLE `emergency_notifications`
  ADD CONSTRAINT `emergency_notifications_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `emergency_events` (`event_id`),
  ADD CONSTRAINT `emergency_notifications_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `employee_attendance`
--
ALTER TABLE `employee_attendance`
  ADD CONSTRAINT `employee_attendance_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`),
  ADD CONSTRAINT `employee_attendance_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `employee_bonuses`
--
ALTER TABLE `employee_bonuses`
  ADD CONSTRAINT `employee_bonuses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`),
  ADD CONSTRAINT `employee_bonuses_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `employee_vacation_balance`
--
ALTER TABLE `employee_vacation_balance`
  ADD CONSTRAINT `employee_vacation_balance_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `employee_vacation_requests`
--
ALTER TABLE `employee_vacation_requests`
  ADD CONSTRAINT `employee_vacation_requests_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`),
  ADD CONSTRAINT `employee_vacation_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `family_relations`
--
ALTER TABLE `family_relations`
  ADD CONSTRAINT `family_relations_ibfk_1` FOREIGN KEY (`source_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `family_relations_ibfk_2` FOREIGN KEY (`target_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `files_tokens`
--
ALTER TABLE `files_tokens`
  ADD CONSTRAINT `files_tokens_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `files` (`file_id`),
  ADD CONSTRAINT `files_tokens_ibfk_2` FOREIGN KEY (`token_owner`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `fleetvehicles_expenses`
--
ALTER TABLE `fleetvehicles_expenses`
  ADD CONSTRAINT `fleetvehicles_expenses_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `fleetvehicles_vehicles` (`vehicle_id`),
  ADD CONSTRAINT `fleetvehicles_expenses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `fleetvehicles_maintenance`
--
ALTER TABLE `fleetvehicles_maintenance`
  ADD CONSTRAINT `fleetvehicles_maintenance_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `fleetvehicles_vehicles` (`vehicle_id`),
  ADD CONSTRAINT `fleetvehicles_maintenance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `fleetvehicles_trips`
--
ALTER TABLE `fleetvehicles_trips`
  ADD CONSTRAINT `fleetvehicles_trips_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `fleetvehicles_vehicles` (`vehicle_id`),
  ADD CONSTRAINT `fleetvehicles_trips_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `fleetvehicles_vignette_cache`
--
ALTER TABLE `fleetvehicles_vignette_cache`
  ADD CONSTRAINT `fleetvehicles_vignette_cache_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `fleetvehicles_vehicles` (`vehicle_id`),
  ADD CONSTRAINT `fleetvehicles_vignette_cache_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`);

--
-- Omezení pro tabulku `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`column_id`) REFERENCES `grades_columns` (`column_id`),
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`),
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  ADD CONSTRAINT `grades_columns_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`),
  ADD CONSTRAINT `grades_columns_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Omezení pro tabulku `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`),
  ADD CONSTRAINT `groups_ibfk_2` FOREIGN KEY (`year_id`) REFERENCES `school_years` (`sy_id`);

--
-- Omezení pro tabulku `homework`
--
ALTER TABLE `homework`
  ADD CONSTRAINT `homework_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `homework_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`),
  ADD CONSTRAINT `homework_ibfk_3` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`);

--
-- Omezení pro tabulku `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`from_room_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `inventory_logs_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `inventory_logs_ibfk_3` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `inventory_logs_ibfk_4` FOREIGN KEY (`to_room_id`) REFERENCES `building_rooms` (`room_id`);

--
-- Omezení pro tabulku `ldap_config`
--
ALTER TABLE `ldap_config`
  ADD CONSTRAINT `ldap_config_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `library_books`
--
ALTER TABLE `library_books`
  ADD CONSTRAINT `library_books_ibfk_1` FOREIGN KEY (`genre_id`) REFERENCES `library_genres` (`genre_id`);

--
-- Omezení pro tabulku `library_book_authors`
--
ALTER TABLE `library_book_authors`
  ADD CONSTRAINT `library_book_authors_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`book_id`),
  ADD CONSTRAINT `library_book_authors_ibfk_2` FOREIGN KEY (`book_author_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `library_copies`
--
ALTER TABLE `library_copies`
  ADD CONSTRAINT `library_copies_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`book_id`);

--
-- Omezení pro tabulku `library_loans`
--
ALTER TABLE `library_loans`
  ADD CONSTRAINT `library_loans_ibfk_1` FOREIGN KEY (`copy_id`) REFERENCES `library_copies` (`copy_id`),
  ADD CONSTRAINT `library_loans_ibfk_2` FOREIGN KEY (`reader_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `library_reservations`
--
ALTER TABLE `library_reservations`
  ADD CONSTRAINT `library_reservations_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`book_id`),
  ADD CONSTRAINT `library_reservations_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`token_id`) REFERENCES `tokens` (`token_id`),
  ADD CONSTRAINT `login_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `marking_scales`
--
ALTER TABLE `marking_scales`
  ADD CONSTRAINT `marking_scales_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `marking_scales_groups`
--
ALTER TABLE `marking_scales_groups`
  ADD CONSTRAINT `marking_scales_groups_ibfk_1` FOREIGN KEY (`ms_id`) REFERENCES `marking_scales` (`ms_id`),
  ADD CONSTRAINT `marking_scales_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`),
  ADD CONSTRAINT `marking_scales_groups_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Omezení pro tabulku `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `messages_files`
--
ALTER TABLE `messages_files`
  ADD CONSTRAINT `messages_files_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`),
  ADD CONSTRAINT `messages_files_ibfk_2` FOREIGN KEY (`file_id`) REFERENCES `files` (`file_id`);

--
-- Omezení pro tabulku `messages_receivers`
--
ALTER TABLE `messages_receivers`
  ADD CONSTRAINT `messages_receivers_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`),
  ADD CONSTRAINT `messages_receivers_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `message_groups`
--
ALTER TABLE `message_groups`
  ADD CONSTRAINT `message_groups_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`),
  ADD CONSTRAINT `message_groups_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `notification_rules`
--
ALTER TABLE `notification_rules`
  ADD CONSTRAINT `notification_rules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `oauth_tokens`
--
ALTER TABLE `oauth_tokens`
  ADD CONSTRAINT `oauth_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `online_lessons`
--
ALTER TABLE `online_lessons`
  ADD CONSTRAINT `online_lessons_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`),
  ADD CONSTRAINT `online_lessons_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `online_lessons_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `payments_classes`
--
ALTER TABLE `payments_classes`
  ADD CONSTRAINT `payments_classes_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`);

--
-- Omezení pro tabulku `payments_columns`
--
ALTER TABLE `payments_columns`
  ADD CONSTRAINT `payments_columns_ibfk_1` FOREIGN KEY (`payment_class_id`) REFERENCES `payments_classes` (`payment_class_id`);

--
-- Omezení pro tabulku `payments_payments`
--
ALTER TABLE `payments_payments`
  ADD CONSTRAINT `payments_payments_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `payments_payments_ibfk_2` FOREIGN KEY (`payment_column_id`) REFERENCES `payments_columns` (`payment_column_id`);

--
-- Omezení pro tabulku `persons`
--
ALTER TABLE `persons`
  ADD CONSTRAINT `persons_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`),
  ADD CONSTRAINT `persons_ibfk_2` FOREIGN KEY (`insurance_id`) REFERENCES `insurance_companies` (`insurance_id`),
  ADD CONSTRAINT `persons_ibfk_3` FOREIGN KEY (`birthplace_id`) REFERENCES `cities` (`city_id`);

--
-- Omezení pro tabulku `persons_degree`
--
ALTER TABLE `persons_degree`
  ADD CONSTRAINT `persons_degree_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `persons_degree_ibfk_2` FOREIGN KEY (`degree_id`) REFERENCES `degrees` (`degree_id`);

--
-- Omezení pro tabulku `phone_numbers`
--
ALTER TABLE `phone_numbers`
  ADD CONSTRAINT `phone_numbers_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `polls`
--
ALTER TABLE `polls`
  ADD CONSTRAINT `polls_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `rewards`
--
ALTER TABLE `rewards`
  ADD CONSTRAINT `rewards_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `rewards_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`);

--
-- Omezení pro tabulku `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `schools`
--
ALTER TABLE `schools`
  ADD CONSTRAINT `schools_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`),
  ADD CONSTRAINT `schools_ibfk_2` FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`),
  ADD CONSTRAINT `schools_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `school_breaks`
--
ALTER TABLE `school_breaks`
  ADD CONSTRAINT `school_breaks_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `school_domains`
--
ALTER TABLE `school_domains`
  ADD CONSTRAINT `school_domains_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `school_years`
--
ALTER TABLE `school_years`
  ADD CONSTRAINT `school_years_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `scopes`
--
ALTER TABLE `scopes`
  ADD CONSTRAINT `scopes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `scopes_subjects`
--
ALTER TABLE `scopes_subjects`
  ADD CONSTRAINT `scopes_subjects_ibfk_1` FOREIGN KEY (`scope_id`) REFERENCES `scopes` (`scope_id`),
  ADD CONSTRAINT `scopes_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Omezení pro tabulku `semester_grades`
--
ALTER TABLE `semester_grades`
  ADD CONSTRAINT `semester_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`),
  ADD CONSTRAINT `semester_grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `semester_grades_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`);

--
-- Omezení pro tabulku `student_groups`
--
ALTER TABLE `student_groups`
  ADD CONSTRAINT `student_groups_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`),
  ADD CONSTRAINT `student_groups_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`);

--
-- Omezení pro tabulku `student_homework`
--
ALTER TABLE `student_homework`
  ADD CONSTRAINT `student_homework_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`),
  ADD CONSTRAINT `student_homework_ibfk_2` FOREIGN KEY (`homework_id`) REFERENCES `homework` (`homework_id`);

--
-- Omezení pro tabulku `substitution`
--
ALTER TABLE `substitution`
  ADD CONSTRAINT `substitution_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`),
  ADD CONSTRAINT `substitution_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `substitution_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `substitution_ibfk_4` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  ADD CONSTRAINT `substitution_ibfk_5` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `supervisions`
--
ALTER TABLE `supervisions`
  ADD CONSTRAINT `supervisions_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `supervision_places` (`place_id`),
  ADD CONSTRAINT `supervisions_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `supervision_places`
--
ALTER TABLE `supervision_places`
  ADD CONSTRAINT `supervision_places_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`cabinet_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `teachers_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `teachers_salary`
--
ALTER TABLE `teachers_salary`
  ADD CONSTRAINT `teachers_salary_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `teachers_subject`
--
ALTER TABLE `teachers_subject`
  ADD CONSTRAINT `teachers_subject_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`),
  ADD CONSTRAINT `teachers_subject_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Omezení pro tabulku `timetable`
--
ALTER TABLE `timetable`
  ADD CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`),
  ADD CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`room_id`),
  ADD CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `timetable_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`person_id`);

--
-- Omezení pro tabulku `tokens`
--
ALTER TABLE `tokens`
  ADD CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`password_id`) REFERENCES `passwords` (`password_id`),
  ADD CONSTRAINT `tokens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  ADD CONSTRAINT `traineeship_companies_ibfk_1` FOREIGN KEY (`address_office`) REFERENCES `addresses` (`address_id`),
  ADD CONSTRAINT `traineeship_companies_ibfk_2` FOREIGN KEY (`address_trainee`) REFERENCES `addresses` (`address_id`);

--
-- Omezení pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  ADD CONSTRAINT `traineeship_company_rating_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `traineeship_companies` (`company_id`),
  ADD CONSTRAINT `traineeship_company_rating_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`);

--
-- Omezení pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  ADD CONSTRAINT `traineeship_company_scopes_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `traineeship_companies` (`company_id`),
  ADD CONSTRAINT `traineeship_company_scopes_ibfk_2` FOREIGN KEY (`scope_id`) REFERENCES `scopes` (`scope_id`);

--
-- Omezení pro tabulku `traineeship_config`
--
ALTER TABLE `traineeship_config`
  ADD CONSTRAINT `traineeship_config_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `persons` (`person_id`);

--
-- Omezení pro tabulku `traineeship_diary`
--
ALTER TABLE `traineeship_diary`
  ADD CONSTRAINT `traineeship_diary_ibfk_1` FOREIGN KEY (`tr_week_id`) REFERENCES `traineeship_weeks` (`tr_week_id`),
  ADD CONSTRAINT `traineeship_diary_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`);

--
-- Omezení pro tabulku `traineeship_instructors`
--
ALTER TABLE `traineeship_instructors`
  ADD CONSTRAINT `traineeship_instructors_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `traineeship_companies` (`company_id`),
  ADD CONSTRAINT `traineeship_instructors_ibfk_2` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `traineeship_students`
--
ALTER TABLE `traineeship_students`
  ADD CONSTRAINT `traineeship_students_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `traineeship_companies` (`company_id`),
  ADD CONSTRAINT `traineeship_students_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `traineeship_instructors` (`instructor_id`),
  ADD CONSTRAINT `traineeship_students_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`person_id`),
  ADD CONSTRAINT `traineeship_students_ibfk_4` FOREIGN KEY (`traineeship_id`) REFERENCES `traineeship_weeks` (`tr_week_id`);

--
-- Omezení pro tabulku `traineeship_weeks`
--
ALTER TABLE `traineeship_weeks`
  ADD CONSTRAINT `traineeship_weeks_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`);

--
-- Omezení pro tabulku `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`password_id`) REFERENCES `passwords` (`password_id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`person_id`),
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`school_id`);

--
-- Omezení pro tabulku `users_backup_codes`
--
ALTER TABLE `users_backup_codes`
  ADD CONSTRAINT `users_backup_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  ADD CONSTRAINT `users_credentials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `users_resetpassword`
--
ALTER TABLE `users_resetpassword`
  ADD CONSTRAINT `users_resetpassword_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Omezení pro tabulku `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `webauthn_challenges`
--
ALTER TABLE `webauthn_challenges`
  ADD CONSTRAINT `webauthn_challenges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
