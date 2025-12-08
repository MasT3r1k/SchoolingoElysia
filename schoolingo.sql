-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Počítač: 127.0.0.1
-- Vytvořeno: Pon 08. pro 2025, 14:19
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
  `student` int(11) NOT NULL,
  `lesson` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `minutes` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `absence`
--

INSERT INTO `absence` (`student`, `lesson`, `type`, `minutes`, `reason`, `note`) VALUES
(1, 16, 0, NULL, NULL, NULL),
(1, 50, 0, NULL, NULL, NULL),
(1, 51, 3, NULL, NULL, NULL),
(1, 58, 0, NULL, NULL, NULL),
(1, 59, 1, NULL, NULL, NULL),
(1, 113, 0, 0, '', ''),
(1, 126, 2, 0, 'family', ''),
(24, 1, 0, NULL, NULL, NULL),
(24, 4, 0, NULL, NULL, NULL),
(24, 6, 0, NULL, NULL, NULL),
(24, 21, 0, NULL, NULL, NULL),
(24, 27, 0, NULL, NULL, NULL),
(24, 46, 0, NULL, NULL, NULL),
(24, 108, 4, 5, 'connection', ''),
(24, 113, 0, 0, '', ''),
(24, 126, 1, 0, 'family', ''),
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
  `addressId` int(11) NOT NULL,
  `cityId` int(11) NOT NULL,
  `street` text NOT NULL,
  `houseNumber` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `addresses`
--

INSERT INTO `addresses` (`addressId`, `cityId`, `street`, `houseNumber`) VALUES
(1, 1, 'Újezd', '2169/19');

-- --------------------------------------------------------

--
-- Struktura tabulky `auditlog`
--

CREATE TABLE `auditlog` (
  `auditId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('reset_password','change_password','activated_2FA','deactivated_2FA','added_passkey','removed_passkey','created_group','removed_group','edited_group','refresh_backup_codes') NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}',
  `ip` text DEFAULT NULL,
  `created` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `auditlog`
--

INSERT INTO `auditlog` (`auditId`, `userId`, `type`, `data`, `ip`, `created`) VALUES
(1, 4, 'reset_password', '{}', NULL, '2025-11-22 21:54:37.232317'),
(2, 4, 'reset_password', '{}', NULL, '2025-12-05 18:16:51.909789'),
(3, 4, 'reset_password', '{}', NULL, '2025-12-05 18:16:52.666279'),
(4, 4, 'reset_password', '{}', NULL, '2025-12-05 18:16:52.821404'),
(5, 4, 'reset_password', '{}', NULL, '2025-12-05 18:17:03.428366'),
(6, 4, 'reset_password', '{}', NULL, '2025-12-07 18:00:49.025993'),
(7, 4, 'reset_password', '{}', NULL, '2025-12-07 18:17:55.796988'),
(8, 4, 'reset_password', '{}', NULL, '2025-12-07 18:17:59.635514'),
(9, 4, 'reset_password', '{}', NULL, '2025-12-07 18:18:25.145694'),
(10, 4, 'reset_password', '{}', NULL, '2025-12-07 18:20:29.677143');

-- --------------------------------------------------------

--
-- Struktura tabulky `buildings`
--

CREATE TABLE `buildings` (
  `building_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `type` enum('school','canteen','workshop','other') NOT NULL DEFAULT 'school'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `buildings`
--

INSERT INTO `buildings` (`building_id`, `name`, `type`) VALUES
(1, 'Hlavní budova', 'school');

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
  `br_id` int(11) NOT NULL,
  `floor_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL DEFAULT 'classroom',
  `description` text DEFAULT NULL,
  `manager` int(11) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 1,
  `pos_x` int(11) NOT NULL,
  `pos_y` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `building_rooms`
--

INSERT INTO `building_rooms` (`br_id`, `floor_id`, `name`, `type`, `description`, `manager`, `capacity`, `pos_x`, `pos_y`) VALUES
(1, 1, '107', 'classroom', 'Třída Kouďové', 15, 1, 1, 1);

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
-- Struktura tabulky `cities`
--

CREATE TABLE `cities` (
  `cityId` int(11) NOT NULL,
  `cityName` text NOT NULL,
  `countryId` int(11) NOT NULL,
  `postcode` varchar(12) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `cities`
--

INSERT INTO `cities` (`cityId`, `cityName`, `countryId`, `postcode`) VALUES
(1, 'Prostějov', 60, '796 01');

-- --------------------------------------------------------

--
-- Struktura tabulky `classbook`
--

CREATE TABLE `classbook` (
  `cbId` int(11) NOT NULL,
  `date` date NOT NULL,
  `dayHour` int(11) NOT NULL,
  `subject` int(11) DEFAULT NULL,
  `teacher` int(11) DEFAULT NULL,
  `groupId` int(11) NOT NULL,
  `room` int(11) DEFAULT NULL,
  `topic` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `internalNote` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `classbook`
--

INSERT INTO `classbook` (`cbId`, `date`, `dayHour`, `subject`, `teacher`, `groupId`, `room`, `topic`, `note`, `internalNote`) VALUES
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
(133, '2025-12-02', 3, 31, NULL, 9, NULL, NULL, NULL, NULL);

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
  `classId` int(11) NOT NULL,
  `prefix` text NOT NULL,
  `suffix` text NOT NULL,
  `yearId` int(11) DEFAULT NULL,
  `teacher` int(11) NOT NULL,
  `room` int(11) NOT NULL,
  `scopeId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `classes`
--

INSERT INTO `classes` (`classId`, `prefix`, `suffix`, `yearId`, `teacher`, `room`, `scopeId`) VALUES
(1, 'B', '.I', 3, 2, 1, 2);

-- --------------------------------------------------------

--
-- Struktura tabulky `class_service`
--

CREATE TABLE `class_service` (
  `csId` int(11) NOT NULL,
  `student` int(11) NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `class_service`
--

INSERT INTO `class_service` (`csId`, `student`, `start`, `end`) VALUES
(1, 1, '2025-11-17', '2025-11-21'),
(2, 29, '2024-01-29', '2025-02-06'),
(3, 26, '2024-01-29', '2025-02-06'),
(4, 1, '2024-11-18', '2024-11-24');

-- --------------------------------------------------------

--
-- Struktura tabulky `countries`
--

CREATE TABLE `countries` (
  `countryId` int(11) NOT NULL,
  `nationality` text NOT NULL,
  `code2` varchar(2) NOT NULL,
  `code3` varchar(3) NOT NULL,
  `phoneCode` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `countries`
--

INSERT INTO `countries` (`countryId`, `nationality`, `code2`, `code3`, `phoneCode`) VALUES
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
  `degreeID` int(11) NOT NULL,
  `degree` text NOT NULL,
  `shortcut` text NOT NULL,
  `isBefore` tinyint(1) NOT NULL DEFAULT 1,
  `weight` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `degrees`
--

INSERT INTO `degrees` (`degreeID`, `degree`, `shortcut`, `isBefore`, `weight`) VALUES
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
  `districtId` int(11) NOT NULL,
  `district` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `districts`
--

INSERT INTO `districts` (`districtId`, `district`) VALUES
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
  `file_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `type` enum('file','folder') NOT NULL DEFAULT 'file',
  `name` text NOT NULL,
  `real_file_name` varchar(255) DEFAULT NULL,
  `file_format` varchar(50) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `storage_path` varchar(500) DEFAULT NULL,
  `thumbnail_path` varchar(500) DEFAULT NULL,
  `permissions` text NOT NULL,
  `owner_id` int(11) NOT NULL,
  `checksum` varchar(128) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `documents`
--

INSERT INTO `documents` (`file_id`, `parent_id`, `type`, `name`, `real_file_name`, `file_format`, `mime_type`, `file_size`, `storage_path`, `thumbnail_path`, `permissions`, `owner_id`, `checksum`, `is_deleted`, `deleted_at`, `last_accessed_at`, `modified_at`, `created_at`) VALUES
(2, NULL, 'folder', 'Test', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 08:51:53', '2025-11-24 22:58:08'),
(3, 2, 'folder', 'Test1', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 09:11:26', '2025-11-24 22:58:59'),
(4, 2, 'folder', 'Test2', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 09:11:28', '2025-11-24 22:59:37'),
(5, 2, 'folder', 'Test3', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 09:11:31', '2025-11-24 22:59:46'),
(6, 2, 'folder', 'Test4', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 09:11:33', '2025-11-24 22:59:59'),
(7, NULL, 'folder', 'Testik', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-24 23:02:51', '2025-11-24 23:02:51'),
(9, 1, 'folder', 'a', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-24 23:07:29', '2025-11-24 23:07:29'),
(10, 8, 'folder', 'b', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-24 23:37:56', '2025-11-24 23:07:49'),
(11, 1, 'folder', 'a', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-24 23:08:19', '2025-11-24 23:08:19'),
(12, 7, 'folder', 'Filip', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 09:21:32', '2025-11-26 09:21:32'),
(13, 7, 'folder', 'Kozjura', NULL, NULL, NULL, 0, NULL, NULL, 'no-one', 4, NULL, 0, NULL, NULL, '2025-11-26 09:28:49', '2025-11-26 09:28:49');

-- --------------------------------------------------------

--
-- Struktura tabulky `emails`
--

CREATE TABLE `emails` (
  `email` text NOT NULL,
  `personId` int(11) NOT NULL,
  `type` enum('personal','school','work','other') NOT NULL DEFAULT 'school',
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `emails`
--

INSERT INTO `emails` (`email`, `personId`, `type`, `description`, `is_verified`) VALUES
('jkosik@sps-pi.cz', 1, 'school', NULL, 1),
('jkosik@sps-pi.com', 1, 'school', NULL, 1),
('admin@example.com', 4, 'school', NULL, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `emergency_events`
--

CREATE TABLE `emergency_events` (
  `eev_id` int(11) NOT NULL,
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
-- Struktura tabulky `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `event_name` text NOT NULL,
  `event_description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `events`
--

INSERT INTO `events` (`event_id`, `event_name`, `event_description`, `created_by`, `created_time`) VALUES
(1, 'Letní prázdniny', NULL, NULL, '2025-07-01 19:03:23');

-- --------------------------------------------------------

--
-- Struktura tabulky `family_relations`
--

CREATE TABLE `family_relations` (
  `frId` int(11) NOT NULL,
  `source` int(11) NOT NULL COMMENT 'Parent, uncle, aunt',
  `target` int(11) NOT NULL COMMENT 'student',
  `role` enum('father','mother','uncle','aunt','grandfather','grandmother','stepfather','stepmother') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `family_relations`
--

INSERT INTO `family_relations` (`frId`, `source`, `target`, `role`) VALUES
(1, 33, 1, 'father');

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_expenses`
--

CREATE TABLE `fleetvehicles_expenses` (
  `fvexId` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `expense_date` date NOT NULL DEFAULT current_timestamp(),
  `amount` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `category` enum('Service','Fuel','Insurance','Maintenance','Repairs','Tires','Tolls','Parking Fees','Cleaning','Licenses and Permits','Fines and Penalties','Depreciation','Leasing','Roadside Assistance','Accessories','Administration Fees','Registration Fees','Inspection','Battery Replacement','Other') NOT NULL,
  `createdBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_maintenance`
--

CREATE TABLE `fleetvehicles_maintenance` (
  `fvmaId` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `maintenance_date` date NOT NULL,
  `description` text NOT NULL,
  `cost` decimal(10,0) NOT NULL,
  `mileage_at_service` int(11) DEFAULT NULL,
  `notes` text NOT NULL,
  `createdBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_trips`
--

CREATE TABLE `fleetvehicles_trips` (
  `tripId` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `driverId` int(11) NOT NULL,
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
  `vehicleId` int(11) NOT NULL,
  `vin` varchar(17) DEFAULT NULL,
  `manufacture` text NOT NULL,
  `model` text NOT NULL,
  `countryId_manufacture` int(11) NOT NULL,
  `year_manufacture` year(4) NOT NULL,
  `fuel` enum('petrol','diesel','hybrid(petrol)','hybrid(diesel)','electro','CNG','LNG','LPG','H2') NOT NULL,
  `plate` text NOT NULL,
  `registration_countryId` int(11) NOT NULL,
  `mileage` int(11) NOT NULL DEFAULT 0,
  `last_service_date` date DEFAULT NULL,
  `periodic_maintenance_mileage` int(11) NOT NULL DEFAULT 10000,
  `location` text DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `fleetvehicles_vehicles`
--

INSERT INTO `fleetvehicles_vehicles` (`vehicleId`, `vin`, `manufacture`, `model`, `countryId_manufacture`, `year_manufacture`, `fuel`, `plate`, `registration_countryId`, `mileage`, `last_service_date`, `periodic_maintenance_mileage`, `location`, `notes`) VALUES
(1, 'TMBAG7NE8K0076761', 'Škoda', 'Octavia', 60, '2019', 'diesel', '1AFA386', 60, 98550, '2025-01-06', 15000, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `fleetvehicles_vignette_cache`
--

CREATE TABLE `fleetvehicles_vignette_cache` (
  `fvvcId` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `countryId` int(11) NOT NULL,
  `valid_since` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `cache_last_update` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `grades`
--

CREATE TABLE `grades` (
  `gradeId` int(11) NOT NULL,
  `columnId` int(11) NOT NULL COMMENT 'gcId',
  `mark` int(11) DEFAULT NULL,
  `studentId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `grades`
--

INSERT INTO `grades` (`gradeId`, `columnId`, `mark`, `studentId`, `teacherId`, `created`, `description`) VALUES
(1, 1, 1, 1, 23, '2024-11-16 11:21:54.000000', NULL),
(2, 1, 2, 24, 2, '0000-00-00 00:00:00.000000', NULL),
(3, 1, 4, 25, 2, '0000-00-00 00:00:00.000000', NULL),
(4, 1, 2, 26, 2, '0000-00-00 00:00:00.000000', NULL),
(5, 1, 3, 27, 2, '0000-00-00 00:00:00.000000', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `grades_columns`
--

CREATE TABLE `grades_columns` (
  `gcId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `columnIndex` int(11) NOT NULL,
  `weight` int(11) NOT NULL DEFAULT 1,
  `type` int(11) NOT NULL DEFAULT 0,
  `topic` text NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `status` enum('active','deleted') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `grades_columns`
--

INSERT INTO `grades_columns` (`gcId`, `groupId`, `subjectId`, `columnIndex`, `weight`, `type`, `topic`, `created`, `status`) VALUES
(1, 9, 31, 0, 10, 0, 'Test', '2025-10-20 09:47:38.000000', 'active'),
(2, 9, 31, 1, 10, 0, 'Test', '2025-11-03 08:10:34.657510', 'active'),
(3, 9, 33, 0, 8, 0, 'Test', '2025-11-05 11:10:31.704834', 'active'),
(4, 9, 33, 1, 1, 0, 'AAA', '2025-11-05 11:13:38.244155', 'active');

-- --------------------------------------------------------

--
-- Struktura tabulky `groups`
--

CREATE TABLE `groups` (
  `groupId` int(11) NOT NULL,
  `name` text DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `class` int(11) NOT NULL,
  `year` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `groups`
--

INSERT INTO `groups` (`groupId`, `name`, `num`, `class`, `year`) VALUES
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
-- Struktura tabulky `homework`
--

CREATE TABLE `homework` (
  `homeworkId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` datetime(6) NOT NULL,
  `headline` text DEFAULT NULL,
  `homework` text NOT NULL,
  `note` text DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `homework`
--

INSERT INTO `homework` (`homeworkId`, `subjectId`, `groupId`, `teacherId`, `assigned_at`, `due_date`, `headline`, `homework`, `note`, `type`) VALUES
(1, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', 'Udělejte úkol', 'T', NULL, 0),
(2, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(3, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(4, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(5, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(6, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(7, 1, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', 'Udělejte úkol', 'Vypracujte příklady ze strany 56, cvičení 4–9. Dbejte na postup a přesné výsledky', NULL, 0),
(8, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(9, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(10, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'T', NULL, 0),
(11, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 23:00:00.000000', NULL, 'TAK TOHLE MUSÍ UŽ VYJÍT', NULL, 0),
(12, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 22:00:00.000000', NULL, 'TAK TOHLE MUSÍ UŽ VYJÍT', NULL, 1),
(13, 0, 0, 0, '2025-11-20 13:20:37', '2024-02-01 22:00:00.000000', NULL, 'TAK TOHLE MUSÍ UŽ VYJÍT', NULL, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `insurance_companies`
--

CREATE TABLE `insurance_companies` (
  `insuranceId` int(11) NOT NULL,
  `insurance` text NOT NULL,
  `shortcut` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `insurance_companies`
--

INSERT INTO `insurance_companies` (`insuranceId`, `insurance`, `shortcut`) VALUES
(111, 'Všeobecná zdravotní pojišťovna České republiky', 'VZP'),
(201, 'Vojenská zdravotní pojišťovna České republiky', 'VoZP'),
(205, 'Česká průmyslová zdravotní pojišťovna', 'CPZP'),
(207, 'Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví', 'OZP'),
(209, 'Zaměstnanecká pojišťovna Škoda', 'ZPŠkoda'),
(211, 'Zdravotní pojišťovna ministerstva vnitra České republiky', 'ZPVMCR'),
(213, 'RBP, zdravotní pojišťovna', 'RBP');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_books`
--

CREATE TABLE `library_books` (
  `bookId` int(11) NOT NULL,
  `name` text NOT NULL,
  `subtitle` text NOT NULL,
  `yearPublication` year(4) NOT NULL DEFAULT current_timestamp(),
  `genreId` int(11) NOT NULL,
  `isbn` varchar(22) DEFAULT NULL,
  `publisher` text DEFAULT NULL,
  `editionNumber` int(11) DEFAULT NULL,
  `pages` int(11) NOT NULL,
  `annotation` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `signature` int(11) DEFAULT NULL,
  `language` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_books`
--

INSERT INTO `library_books` (`bookId`, `name`, `subtitle`, `yearPublication`, `genreId`, `isbn`, `publisher`, `editionNumber`, `pages`, `annotation`, `tags`, `keywords`, `signature`, `language`, `description`, `created`) VALUES
(1, 'Filipovo Tajemství', 'Výprava za dobrodružstvím', '2008', 1, '978-80-259-0505-3', 'NapicuVydavatelství', 1, 69, '', '', '', 0, 'Čeština', NULL, '2024-11-26 17:48:16');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_book_authors`
--

CREATE TABLE `library_book_authors` (
  `bookAuthorId` int(11) NOT NULL,
  `bookId` int(11) NOT NULL,
  `authorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_book_authors`
--

INSERT INTO `library_book_authors` (`bookAuthorId`, `bookId`, `authorId`) VALUES
(1, 1, 31);

-- --------------------------------------------------------

--
-- Struktura tabulky `library_copies`
--

CREATE TABLE `library_copies` (
  `copyId` int(11) NOT NULL,
  `bookId` int(11) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `acquisitionDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('new','very_good','good','worn','very_worn','damaged') NOT NULL DEFAULT 'good',
  `location` varchar(255) DEFAULT NULL,
  `notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_copies`
--

INSERT INTO `library_copies` (`copyId`, `bookId`, `barcode`, `acquisitionDate`, `status`, `location`, `notes`) VALUES
(1, 1, '123456789', '2024-11-26 17:51:21', 'good', 'Polička 1A', '');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_genres`
--

CREATE TABLE `library_genres` (
  `genreId` int(11) NOT NULL,
  `genre` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_genres`
--

INSERT INTO `library_genres` (`genreId`, `genre`) VALUES
(1, 'romanismus');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_loans`
--

CREATE TABLE `library_loans` (
  `loanId` int(11) NOT NULL,
  `copyId` int(11) NOT NULL,
  `readerId` int(11) NOT NULL,
  `date_loan` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_has_to_be_returned` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_return` timestamp NULL DEFAULT NULL,
  `status` enum('borrowed','returned','overdue') NOT NULL,
  `notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `library_loans`
--

INSERT INTO `library_loans` (`loanId`, `copyId`, `readerId`, `date_loan`, `date_has_to_be_returned`, `date_return`, `status`, `notes`) VALUES
(1, 1, 1, '2024-11-19 17:52:44', '2024-12-07 17:52:44', NULL, 'borrowed', ''),
(2, 1, 1, '2024-11-26 17:52:44', '2024-12-14 17:52:44', '2024-11-29 20:59:12', 'returned', '');

-- --------------------------------------------------------

--
-- Struktura tabulky `library_reservations`
--

CREATE TABLE `library_reservations` (
  `reservationId` int(11) NOT NULL,
  `bookId` int(11) NOT NULL,
  `copyId` int(11) DEFAULT NULL,
  `personId` int(11) NOT NULL,
  `reservation_date` datetime NOT NULL,
  `status` enum('active','cancelled','completed') NOT NULL DEFAULT 'active',
  `created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `login_history`
--

CREATE TABLE `login_history` (
  `loginId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('password','qrcode','passkey') NOT NULL DEFAULT 'password',
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error` text DEFAULT NULL,
  `ip` text DEFAULT NULL,
  `token_id` int(11) DEFAULT NULL,
  `userAgent` text NOT NULL,
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

INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(1, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 22:32:54.308932', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 22:48:34.487370', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 22:48:46.645996', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:07:50.881523', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:07:54.368177', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:12:48.106765', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:12:49.055992', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:26:36.112875', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:26:36.406375', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 13:51:42.972223', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 13:51:49.174197', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 14:12:46.233339', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 17:56:27.960598', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 17:57:33.936658', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 19:08:19.877599', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 19:26:51.481031', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 22:20:40.882291', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 23:15:34.388347', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 23:15:39.409840', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 23:15:42.309768', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 00:13:56.723080', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 00:14:00.298232', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 00:29:47.587116', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 01:03:57.805987', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 11:01:42.030259', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 11:36:44.720803', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 11:55:04.876251', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 12:13:55.071986', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 12:39:24.154911', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 12:58:50.660646', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 13:18:48.457595', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 13:37:20.240409', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 13:56:53.412710', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:13:52.302677', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:41:53.404041', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:42:06.077285', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:54:31.825213', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:55:34.606933', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:55:46.163488', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:17.421634', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:24.697756', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:37.807490', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:43.095747', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:02.056794', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:08.625199', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:13.072882', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:18.870254', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:59:52.272485', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:59:54.192308', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:00:33.676768', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:01:10.601726', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:04:44.454634', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:04:49.159882', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:05:11.665490', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:26:56.819960', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:26:57.939796', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(57, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 16:06:53.961930', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(58, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 16:44:19.757122', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 16:44:22.918846', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(60, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 17:19:41.241771', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 17:19:50.212876', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 18:26:30.983109', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 18:26:43.076470', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 19:47:04.224654', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 19:47:17.745243', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 21:22:51.001484', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 21:23:08.879303', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(68, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 15:27:15.674399', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 15:27:35.470646', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 20:34:57.315813', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 20:35:12.372651', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:08:50.100514', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:08:53.880046', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:26:20.647863', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(75, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:26:30.608026', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(76, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:04:19.798469', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(77, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:04:34.065422', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(78, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:04:34.360887', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(79, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:15:56.204745', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(80, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-07 16:05:06.362490', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(81, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 12:55:04.638709', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 12:55:22.863969', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 15:02:38.918888', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(84, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 15:02:58.970082', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(85, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 21:42:39.046159', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(86, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 21:59:56.049330', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(87, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-09 19:24:20.338480', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(88, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-09 19:39:31.771790', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(89, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-09 19:57:28.515499', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(90, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 20:09:16.067977', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(91, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 22:52:22.627452', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(92, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:13:43.290543', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:33:49.741734', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(94, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:14.148531', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(95, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:15.552111', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(96, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:16.781593', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(97, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:18.000569', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(98, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:52.787969', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(99, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 00:35:54.768645', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(100, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 00:42:19.492460', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(101, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 08:25:21.720043', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(102, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 09:35:28.498500', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(103, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 10:50:56.615001', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(104, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 11:52:27.840908', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(105, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 12:54:29.402938', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(106, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 13:54:42.913715', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(107, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 14:32:51.283064', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(108, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 14:53:50.201609', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(109, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 14:59:07.379574', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(110, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 17:58:19.937327', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(111, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 19:01:11.386743', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(112, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 19:01:14.861602', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(113, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 20:22:17.744600', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(114, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 21:25:11.042255', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(115, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 08:34:09.860749', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(116, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 15:44:55.148072', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(117, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 21:58:37.297322', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(118, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 23:28:55.266738', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(119, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 23:28:57.421541', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(120, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-13 15:45:18.942451', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(121, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-13 20:03:39.914276', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(122, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-13 22:15:43.003297', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(123, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-14 17:58:06.568944', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(124, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-14 19:17:32.948432', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(125, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-14 20:37:55.910516', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(126, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 15:00:40.289379', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(127, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 19:29:50.191584', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(128, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 20:31:30.503925', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(129, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 21:37:31.628090', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(130, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 18:47:25.933139', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(131, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:00:30.494162', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(132, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:03:34.461913', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(133, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:03:39.258192', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(134, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:20:03.727705', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(135, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 13:57:14.286420', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(136, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 14:21:44.952457', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(137, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 17:32:57.953192', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(138, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 18:33:27.150698', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(139, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 18:33:29.676920', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(140, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 19:16:28.835734', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(141, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 20:36:05.465049', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(142, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-18 11:17:27.548134', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(143, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 09:42:11.490648', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(144, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 14:46:54.214304', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(145, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 19:19:45.438766', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(146, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:03:48.389823', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(147, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:07:17.739141', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(148, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:13:07.392448', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(149, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:13:12.752724', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(150, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:00:37.423304', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(151, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:01:56.248133', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(152, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:03:31.464161', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(153, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:05:04.996169', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(154, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:06:28.099010', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(155, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:07:58.663462', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(156, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:28:44.794222', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(157, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:30:31.352126', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(158, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:32:02.701516', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(159, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:33:04.436495', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(160, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 19:08:38.237226', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(161, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 19:09:58.143497', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(162, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 19:10:08.012498', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(163, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 22:01:59.885341', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(164, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 22:30:44.836991', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(165, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 22:47:02.908783', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(166, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 23:02:28.661767', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(167, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 23:50:10.413421', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(168, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 00:18:12.084080', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(169, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 00:39:07.350067', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(170, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 01:00:59.213690', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(171, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 09:00:41.274024', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(172, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 09:15:46.296221', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(173, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 09:17:17.266010', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(174, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 10:11:16.474719', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(175, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 10:12:59.901486', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(176, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 10:49:02.981485', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(177, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:00:56.042476', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(178, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:07:39.346436', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(179, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:25:36.404876', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(180, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:40:41.854668', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(181, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 12:12:22.648216', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(182, 4, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:35:47.685294', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(183, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:36:01.406183', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(184, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:45:26.963338', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(185, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:54:10.487477', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(186, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 22:16:05.289838', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(187, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 12:00:26.289420', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(188, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 12:15:49.697074', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(189, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 15:00:31.468412', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(190, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 15:15:45.150572', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(191, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 21:17:03.603404', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(192, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 21:42:56.532501', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(193, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 21:59:29.705219', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(194, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 22:34:17.055604', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(195, 3, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 22:43:29.540057', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(196, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-07 18:40:09.643319', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(197, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 21:46:37.086510', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(198, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 22:03:52.999293', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(199, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 22:07:01.805293', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(200, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 22:56:50.006146', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(201, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-09 09:51:15.266176', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(202, 1, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-09 09:51:38.427455', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(203, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-09 09:51:43.497802', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(204, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-09 21:58:43.253922', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(205, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-09 21:59:34.360804', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(206, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-09 22:14:55.461307', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(207, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 12:36:17.831730', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(208, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 18:23:45.938820', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(209, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 18:28:41.976960', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(210, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 20:07:42.855587', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(211, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 20:24:23.481367', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(212, 3, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 20:30:09.247853', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(213, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:03:35.492876', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(214, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:20:39.441553', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(215, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:43:52.062090', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(216, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:43:56.697852', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(217, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:59:25.263450', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(218, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 20:15:24.728487', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(219, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 20:36:11.315599', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(220, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 20:53:45.944337', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(221, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:12:55.125945', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(222, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:24:52.294686', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(223, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:31:16.209936', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(224, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:39:17.452094', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(225, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:45:18.568654', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(226, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:51:24.854860', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(227, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:59:06.368881', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(228, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 22:12:59.931214', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(229, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 22:31:49.757598', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(230, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 22:33:09.017885', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(231, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 06:43:02.042426', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(232, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 06:54:57.561424', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(233, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:02:53.202995', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(234, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:07:54.685230', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(235, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:48:23.190416', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(236, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:58:55.647514', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(237, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 08:17:39.934667', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(238, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 08:46:49.820575', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(239, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 14:01:23.613807', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(240, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:00:26.955431', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(241, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:07:06.462560', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(242, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:26:44.209391', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(243, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:29:32.728645', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(244, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:31:37.220486', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(245, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 21:48:07.041995', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(246, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 22:07:12.461475', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(247, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 22:14:32.397005', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(248, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 23:30:45.034762', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(249, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 23:36:43.124629', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(250, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 10:34:12.697408', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(251, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 16:55:17.166768', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(252, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 18:44:59.117005', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(253, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 18:45:09.057128', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(254, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 19:17:20.969848', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(255, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 19:17:26.792762', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(256, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 19:40:07.975336', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(257, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 20:10:21.460321', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(258, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 20:10:33.154682', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(259, 3, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 20:34:04.509400', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(260, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 22:19:19.435879', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(261, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 22:37:54.108412', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(262, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 22:44:14.166185', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(263, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 23:57:58.897269', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(264, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 09:10:46.437584', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(265, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 09:58:28.304223', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(266, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 11:21:03.700074', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(267, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 12:01:21.135737', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(268, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 12:52:00.896549', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(269, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 13:41:16.135390', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(270, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 14:32:55.761674', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(271, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 16:09:23.077416', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(272, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 18:06:10.726482', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(273, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 18:38:46.990707', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(274, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 19:05:36.570362', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(275, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 19:33:45.192301', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(276, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 21:24:43.337743', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(277, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 22:17:25.145058', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(278, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 15:21:29.074816', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(279, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 16:55:18.333668', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(280, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 18:08:42.942132', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(281, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 18:43:08.420745', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(282, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 19:34:54.889332', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(283, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 20:00:39.959008', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(284, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 21:09:54.586091', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(285, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 21:45:39.050871', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(286, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 22:25:23.450551', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(287, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 16:29:55.486700', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(288, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 16:50:52.400415', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(289, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 17:17:02.308421', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(290, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 17:37:04.718588', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(291, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 17:37:12.842685', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(292, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 18:10:11.290046', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(293, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 18:10:19.087012', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(294, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 19:18:00.716131', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(295, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 19:50:01.840140', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(296, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 22:00:28.028067', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(297, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 15:08:24.790441', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(298, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 19:03:37.902509', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(299, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 20:34:54.021387', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(300, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 21:56:02.178237', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(301, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 22:43:38.351368', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(302, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-20 14:58:18.177328', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(303, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-20 19:14:22.290415', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(304, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-21 17:36:32.723438', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(305, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-21 19:44:27.812142', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(306, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-21 20:17:54.152138', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(307, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 10:03:13.063923', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(308, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 10:26:06.454115', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(309, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 10:49:32.033386', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(310, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 11:42:43.304775', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(311, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 12:11:11.177379', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(312, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 14:07:48.318491', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(313, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 15:15:30.434424', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(314, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 16:26:35.909163', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(315, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 19:43:05.278440', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(316, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 20:32:14.823144', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(317, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 20:34:00.780858', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(318, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 21:07:21.532045', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(319, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 22:01:41.880352', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(320, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 22:46:20.517598', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(321, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 23:57:17.435196', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(322, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 23:57:20.021461', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(323, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 07:59:56.521780', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(324, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 08:18:20.634307', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(325, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 08:52:49.714829', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(326, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 08:52:55.989738', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(327, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 09:09:21.056750', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(328, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 09:49:23.927827', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(329, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 10:53:33.313062', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(330, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 11:44:12.091886', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(331, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 12:10:26.216012', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(332, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 13:16:23.540341', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(333, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 21:38:31.530482', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(334, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 22:15:43.928811', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(335, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-25 13:06:02.632930', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(336, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 14:51:29.342436', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(337, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 15:54:18.157606', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(338, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 18:59:10.213397', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(339, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 19:28:04.850521', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(340, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 19:28:17.938778', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(341, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 20:22:26.232569', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(342, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 20:32:28.406934', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(343, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 20:51:20.535110', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(344, 2, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:12:34.044066', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(345, 2, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:14:55.565951', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(346, 2, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:15:01.510071', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(347, 2, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:15:02.536004', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(348, 2, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:15:07.256098', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(349, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:45:24.543355', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(350, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-03-10 13:07:40.213970', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(351, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-03-10 13:10:02.707448', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(352, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:23:40.484787', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(353, 5, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:26:15.429422', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(354, 5, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:38:59.864998', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(355, 6, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:46:40.639550', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(356, 6, 'password', 0, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 09:29:00.123476', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(357, 6, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 09:29:02.574728', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(358, 7, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 13:07:59.815256', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(359, 7, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 16:36:10.258997', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(360, 7, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-12 15:16:33.306687', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(361, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-12 15:32:39.660755', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(362, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-12 20:07:17.460220', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(363, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 00:06:42.118131', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(364, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 14:49:43.119806', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(365, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 15:24:58.419873', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(366, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 16:40:07.017282', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(367, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 02:13:38.651202', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(368, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 15:30:47.339949', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(369, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 15:59:05.836028', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(370, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 20:05:39.219251', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(371, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 20:52:03.415559', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(372, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:02:10.589880', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(373, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:29:15.792476', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(374, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:29:55.234555', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(375, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:29:58.969203', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(376, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 14:48:48.288165', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(377, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 16:11:43.965450', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(378, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 18:30:06.515067', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(379, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 13:14:28.481991', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(380, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0', '2025-03-16 13:27:49.042833', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(381, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0', '2025-03-16 14:14:35.560522', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(382, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 16:03:02.626371', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(383, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 16:59:09.770250', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(384, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 19:55:57.925854', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(385, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 20:34:41.715312', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(386, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 20:55:53.529505', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(387, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 21:21:49.347447', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(388, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-18 16:15:22.759316', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(389, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-18 17:05:58.386912', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(390, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-20 15:05:07.797504', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(391, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:17:37.130851', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(392, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:49:51.513591', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(393, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:50:52.612261', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(394, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:56:21.762052', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(395, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 17:36:50.867904', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(396, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 18:10:04.573736', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(397, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 18:41:34.682425', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(398, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:24:28.032079', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(399, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:27:16.887486', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(400, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:41:01.043617', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(401, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:41:23.043041', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(402, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 20:44:06.036897', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(403, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 21:00:48.900844', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(404, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 08:36:52.990181', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(405, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 08:49:49.422028', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(406, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 08:50:08.017900', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(407, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 09:37:17.031727', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(408, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 09:39:13.697835', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(409, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 09:44:05.807103', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(410, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 19:02:51.469362', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(411, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 21:44:17.093542', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(412, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-05 07:54:47.203775', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(413, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-05 11:28:23.138071', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(414, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-05 12:19:22.417966', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(415, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-07 17:19:01.264489', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(416, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-07 21:21:24.519803', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(417, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-07 22:17:56.471572', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(418, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 17:18:00.645996', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(419, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 17:30:47.564647', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(420, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 17:50:26.263644', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(421, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 18:17:51.108657', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(422, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 14:02:42.564575', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(423, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 14:22:07.534397', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(424, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 14:47:30.274059', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(425, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 15:26:17.708361', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(426, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 15:52:29.426711', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(427, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 16:22:37.542464', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(428, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 16:32:27.653107', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(429, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 18:56:27.603962', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(430, 1, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 14:09:36.249160', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(431, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 14:09:38.020784', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(432, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 15:27:02.977442', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(433, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 15:47:15.234565', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(434, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:02:07.101974', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(435, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:02:48.488002', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(436, 1, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:05:20.199470', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(437, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:05:21.539934', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(438, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:28:28.831621', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(439, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:29:20.834300', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(440, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:32:12.842912', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(441, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:35:40.819099', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(442, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:43:20.278134', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(443, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:47:14.856435', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(444, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:03:15.990267', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(445, 1, 'password', 0, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:04:25.048404', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(446, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:04:25.942646', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(447, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:06:53.451133', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(448, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:11:31.373346', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(449, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:16:21.237404', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(450, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:21:22.382551', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(451, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:22:31.422850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(452, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:23:26.500661', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(453, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:24:53.364209', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(454, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:21:42.987226', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(455, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:24:41.805201', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(456, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:25:12.878596', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(457, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:34:55.438214', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(458, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:38:02.433849', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(459, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 19:24:04.123848', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(460, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:44:48.823020', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(461, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:44:53.770544', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(462, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:47:43.754302', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(463, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:53:12.516845', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(464, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:05:04.651197', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(465, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:17:14.885998', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(466, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:21:56.426912', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(467, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:26:54.140914', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(468, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:32:39.262144', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(469, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:33:04.840507', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(470, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:33:47.889881', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(471, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:39:17.187054', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(472, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:02:12.182065', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(473, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:09:38.956503', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(474, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:15:11.232706', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(475, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:32:07.689535', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(476, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:35:48.387140', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(477, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:38:00.472825', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(478, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:52:03.357279', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(479, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 10:45:10.114729', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(480, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 11:15:33.411804', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(481, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 11:15:53.692535', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(482, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 11:21:31.905904', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(483, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:13:10.308499', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(484, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:26:20.122220', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(485, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:34:02.160342', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(486, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:35:32.966093', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(487, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:39:49.739133', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(488, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:42:00.198196', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(489, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:00:16.309030', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(490, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:05:06.682258', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(491, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:21:35.670511', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(492, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:27:17.284402', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(493, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:28:36.431139', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(494, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:40:44.110346', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(495, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:41:55.301504', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(496, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:47:21.484351', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(497, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:29:08.371628', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(498, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:32:54.025722', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(499, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:36:59.592893', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(500, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:39:52.692423', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(501, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:13:47.570098', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(502, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:43:13.081917', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(503, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:45:43.427371', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(504, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:47:22.987486', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(505, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:49:41.605790', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(506, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:07:43.902511', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(507, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:21:22.844854', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(508, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:47:53.791542', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(509, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:50:43.832384', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(510, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:51:04.498524', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(511, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:00:01.969104', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(512, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:00:30.359178', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(513, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:00:51.185341', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(514, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:18:27.824675', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(515, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:18:53.260640', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(516, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:20:29.644230', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(517, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-12 07:27:19.359166', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(518, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-12 08:55:37.811110', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(519, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 19:38:40.169882', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(520, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 20:19:10.253740', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(521, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 20:38:27.298056', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(522, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 21:30:07.589798', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(523, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 21:33:58.389568', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(524, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 21:35:56.217633', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(525, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 12:22:18.933939', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(526, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 13:00:07.516154', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(527, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 14:40:33.991225', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(528, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:13:14.400530', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(529, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:34:02.170297', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(530, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:35:55.168007', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(531, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:48:02.719398', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(532, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:51:42.954039', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(533, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:25:10.293462', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(534, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:28:01.764808', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(535, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:30:41.237411', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(536, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:32:35.523572', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(537, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:37:54.788711', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(538, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:39:15.435692', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(539, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:41:56.612286', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(540, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:43:28.444379', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(541, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:44:59.629317', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(542, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 18:12:49.784581', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(543, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-16 13:50:36.184599', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(544, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:53:48.068145', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(545, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:56:45.095708', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(546, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:57:05.084901', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(547, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:57:05.610537', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(548, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:17:39.696644', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(549, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:21:00.501144', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(550, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:33:29.674643', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(551, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:36:44.204485', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(552, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:51:08.016558', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(553, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:52:53.359811', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(554, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:56:08.689472', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(555, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:56:34.439896', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(556, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:57:26.271633', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(557, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:59:15.814646', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(558, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:46:35.564271', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(559, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:51:00.124144', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(560, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:52:49.832234', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(561, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:55:21.317523', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(562, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:57:07.514503', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(563, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:57:28.633546', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(564, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:58:10.602558', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(565, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 13:00:24.377139', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(566, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 13:08:08.553109', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(567, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:27:49.059286', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(568, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:28:32.566300', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(569, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:45:21.823196', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(570, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:47:56.977876', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(571, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:23:17.146768', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(572, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:35:58.367517', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(573, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:40:08.021417', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(574, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:50:10.233938', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(575, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:09:39.211367', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(576, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:12:04.756966', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(577, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:14:17.813904', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(578, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:15:47.684318', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(579, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:16:28.772825', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(580, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:22:14.864735', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(581, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:29:30.528100', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(582, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:30:31.338774', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(583, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:54:27.215453', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(584, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:55:59.198012', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(585, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 20:02:16.866082', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(586, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:19:25.898357', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(587, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:25:01.121565', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(588, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:31:58.335268', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(589, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:48:23.172091', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(590, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 14:15:49.937174', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(591, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 14:16:28.012510', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(592, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:44:01.771849', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(593, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:46:16.267409', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(594, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:48:19.639798', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(595, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:54:34.127710', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(596, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:00:32.767169', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(597, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:17:18.271275', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(598, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:28:47.143807', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(599, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:55:49.986726', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(600, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:56:37.513029', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(601, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:57:44.446282', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(602, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:58:44.988185', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(603, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:59:31.990630', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(604, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 21:39:31.910455', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(605, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 21:40:21.413923', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(606, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 21:46:41.265605', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(607, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 10:05:20.526556', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(608, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 10:33:18.398887', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(609, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 11:29:58.341676', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(610, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 12:06:32.145210', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(611, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 12:10:28.432021', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(612, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 12:17:42.246634', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(613, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 14:10:03.702089', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(614, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:14:15.410677', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(615, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:30:23.823246', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(616, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:49:33.684912', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(617, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:50:48.787083', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(618, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 19:21:38.469996', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(619, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:07:28.377733', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(620, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:29:53.226359', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(621, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:37:04.018297', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(622, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:37:47.989958', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(623, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:39:23.888744', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(624, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:43:08.984330', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(625, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:50:01.661086', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(626, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:16:04.428594', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(627, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:39:47.427705', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(628, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:41:47.348590', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(629, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:45:13.237619', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(630, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:50:34.070365', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(631, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:51:12.262131', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(632, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:53:33.836056', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(633, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 22:01:06.120043', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(634, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 22:10:07.122160', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(635, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-20 18:01:14.415821', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(636, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-20 18:03:02.383177', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(637, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-20 18:39:10.449762', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(638, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 06:56:22.868203', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(639, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 14:52:58.037715', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(640, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 14:57:13.407044', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(641, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 15:12:30.387168', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(642, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 15:13:37.715182', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(643, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 15:33:21.364991', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(644, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 11:57:19.101265', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(645, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:06:25.369443', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(646, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:10:11.783142', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(647, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:11:08.471621', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(648, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:11:55.536008', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(649, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:12:22.961096', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(650, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:14:07.686277', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(651, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:14:58.998684', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(652, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:15:23.767086', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(653, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:18:28.968736', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(654, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:19:22.928299', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(655, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 08:37:08.488402', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(656, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 08:40:42.817533', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(657, 4, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 09:40:13.647077', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(658, 1, 'password', 1, NULL, '195.113.101.227', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 09:45:25.040109', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(659, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 12:50:53.529572', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(660, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 16:05:05.703407', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(661, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 16:06:09.947786', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(662, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:03:09.704221', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(663, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:45:50.283207', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(664, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:50:06.775207', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(665, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:50:51.466968', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(666, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:52:26.134083', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(667, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:56:12.313259', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(668, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:20:24.309712', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(669, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:24:04.024301', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(670, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:26:09.809643', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(671, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:28:04.903487', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(672, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:29:55.217270', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(673, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:50:02.683867', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(674, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-24 14:36:05.751406', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(675, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-24 18:27:38.951471', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(676, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-29 17:54:50.203874', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(677, 4, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-29 20:28:52.468112', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(678, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-29 21:36:36.101013', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(679, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 08:49:29.464903', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(680, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 08:49:45.150644', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(681, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 08:50:13.228502', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(682, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:22:28.566080', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(683, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:23:06.747633', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(684, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:23:26.265510', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(685, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:46:12.279255', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(686, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-14 18:21:39.831588', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(687, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-14 19:12:48.554957', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(688, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 08:13:37.440847', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(689, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 18:59:25.843808', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(690, 1, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 21:16:17.780370', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(691, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 21:16:31.905592', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(692, 2, 'password', 1, NULL, '178.255.168.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-24 08:01:25.209816', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(693, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 14:47:27.565898', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(694, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 15:16:28.499386', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(695, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 15:39:12.868124', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(696, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 18:03:43.242677', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(697, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 10:36:50.861949', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(698, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 10:55:01.981100', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(699, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 11:36:22.684383', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(700, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 11:57:46.721650', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(701, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 15:32:48.584740', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(702, 1, 'passkey', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 15:54:30.325069', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(703, 1, 'qrcode', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 16:11:44.718961', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(704, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 16:28:59.020556', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(705, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 17:06:48.129734', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(706, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 17:36:47.741641', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(707, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 18:07:39.759379', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(708, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:36:58.965786', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(709, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:36:58.968002', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(710, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:53:25.691785', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(711, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 21:11:26.604839', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(712, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 07:51:41.923504', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(713, 2, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 07:58:10.272622', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(714, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 08:28:41.036219', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(715, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 15:02:32.921533', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(716, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 15:36:02.056564', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(717, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 16:51:23.517938', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(718, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 17:26:41.640022', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(719, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 17:47:46.055991', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(720, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 15:51:40.115690', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(721, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 17:24:39.205873', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(722, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 18:07:05.887752', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(723, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 18:52:23.895582', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(724, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 19:22:45.879754', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(725, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 19:47:08.269630', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(726, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 20:22:59.008478', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(727, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 20:38:06.987053', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(728, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 21:46:22.217773', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(729, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:03:54.282078', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(730, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:41:05.383526', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(731, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 07:02:20.410436', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(732, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 19:04:02.751244', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(733, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 19:49:04.398419', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(734, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 20:17:10.742622', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(735, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 20:19:57.074514', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(736, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:11:34.684569', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(737, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:12:49.628206', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(738, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:13:58.345889', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(739, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-14 19:01:15.312567', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(740, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-15 08:07:27.951826', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(741, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-17 12:10:50.174904', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(742, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:22:35.413921', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(743, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:33:23.557123', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(744, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:33:37.623065', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(745, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:53:57.870019', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(746, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 11:07:28.874618', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(747, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 14:10:12.585585', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(748, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 15:51:56.367526', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(749, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 16:10:53.755603', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(750, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 17:33:24.709343', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(751, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 09:55:13.959602', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(752, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 10:14:51.504985', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(753, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 10:30:13.039696', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(754, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 11:18:29.833863', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(755, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-09-01 18:10:10.658396', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(756, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-09-01 18:47:57.890895', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(757, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 16:22:00.727181', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(758, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 18:16:49.287050', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(759, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 18:20:57.166988', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(760, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 06:26:05.171523', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(761, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 06:41:47.384955', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(762, 3, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 06:42:18.423504', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(763, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 06:44:41.332830', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(764, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:21:58.921092', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(765, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:22:03.037533', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(766, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:22:43.221536', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(767, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:24:17.460255', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(768, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:04:54.494443', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(769, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:07:12.249095', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(770, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:19:28.104534', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(771, 4, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:51:30.725220', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(772, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:51:53.493923', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(773, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 11:09:13.486542', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(774, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 11:52:56.451667', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(775, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:08:17.158790', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(776, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:24:28.392330', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(777, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:44:01.326349', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(778, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:04:51.519306', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(779, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:10:46.263156', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(780, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:10:49.837991', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(781, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:10:53.355679', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(782, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:10:56.541759', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(783, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:10:58.023047', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(784, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:16:00.762428', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(785, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:45:16.198604', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(786, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:45:18.019751', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(787, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 06:45:40.697755', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(788, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 09:20:47.329778', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(789, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 07:46:08.947645', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(790, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 08:05:37.552100', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(791, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 08:23:53.890524', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(792, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 08:59:15.639392', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(793, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 09:41:59.495742', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(794, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 10:15:41.861801', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(795, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 11:42:18.423355', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(796, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 12:08:53.261045', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(797, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 12:28:27.804830', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(798, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 12:53:01.706520', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(799, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 10:56:02.071122', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(800, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 10:56:06.540765', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(801, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 11:11:57.914063', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(802, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 11:31:35.210237', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(803, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 11:31:37.633315', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(804, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 11:32:07.884974', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(805, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 11:49:34.141960', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(806, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 12:06:01.751821', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(807, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 12:09:01.813590', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(808, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 17:55:06.775882', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(809, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 19:00:37.221813', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(810, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 20:23:52.858215', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(811, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 20:40:54.846017', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(812, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 06:27:01.011899', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(813, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 06:44:37.965746', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(814, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 07:00:47.356843', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(815, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 07:15:30.880146', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(816, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 07:32:24.034261', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(817, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 07:49:50.329654', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(818, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 08:05:33.667272', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(819, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 08:29:27.304263', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(820, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 08:46:23.614804', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(821, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 09:03:58.889676', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(822, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 09:23:55.266796', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(823, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 07:27:39.752673', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(824, 4, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 07:48:29.279617', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(825, 4, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 07:48:30.482162', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(826, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 07:48:32.504632', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(827, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 08:04:18.075991', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(828, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 08:24:30.370383', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(829, 2, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 08:30:56.625175', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(830, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 08:34:06.531149', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(831, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 09:30:32.760121', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(832, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 06:25:30.230650', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(833, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 06:58:42.581722', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(834, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 06:59:04.469664', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(835, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 07:14:19.321702', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(836, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 07:52:58.332313', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(837, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 08:15:14.721460', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(838, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 08:34:52.589637', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(839, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 08:51:16.289172', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(840, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 08:51:16.290922', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(841, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:08:26.371387', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(842, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:28:55.437648', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(843, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:49:52.667193', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(844, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:49:52.670155', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(845, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 10:05:51.396912', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(846, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 10:30:06.809960', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(847, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:31:26.962724', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(848, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:46:49.583963', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(849, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:46:49.963251', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(850, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:03:27.118565', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(851, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:23:23.287454', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(852, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:51:28.795838', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(853, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 08:34:15.995759', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(854, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 08:34:15.988682', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(855, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:42:50.596723', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(856, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:42:50.611852', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(857, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:31:31.443712', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(858, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:51:18.201508', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(859, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:51:18.587013', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(860, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:11:57.184614', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(861, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:35:11.099735', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(862, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:35:11.102071', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(863, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:50:55.458549', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(864, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 12:17:37.676298', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(865, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 12:17:37.678769', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(866, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 12:34:06.928816', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(867, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 12:34:06.933767', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(868, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 07:10:49.532752', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(869, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 07:32:15.319721', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(870, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 07:32:15.321742', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(871, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 07:59:51.189169', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(872, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 07:59:51.497157', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(873, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 08:23:55.295970', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(874, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 08:47:30.774977', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(875, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:04:47.888754', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(876, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:28:24.857917', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(877, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:28:24.859163', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(878, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:45:26.720855', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(879, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 11:18:36.270256', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(880, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 11:18:36.635104', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(881, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 11:36:25.716139', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(882, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 11:53:08.701238', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(883, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 12:09:35.900379', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(884, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 20:09:29.092005', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(885, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 21:25:48.133208', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(886, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 21:25:48.139713', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(887, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 21:25:48.186982', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(888, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 21:30:42.808813', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(889, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:25:11.852352', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(890, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:25:11.853545', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(891, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:25:11.856857', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(892, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:26:42.853767', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(893, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:27:26.894030', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(894, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 12:19:20.169689', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(895, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 12:19:20.764681', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(896, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:17:23.136272', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(897, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:17:23.149005', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(898, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:17:23.113468', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(899, 1, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:17:36.412922', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(900, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:17:39.465541', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(901, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:32:57.186032', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(902, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:49:12.734685', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(903, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:49:12.754576', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(904, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 19:49:13.704247', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(905, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:04:35.401169', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(906, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:23:48.300459', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(907, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:23:48.301659', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(908, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:41:55.135857', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(909, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:41:55.149028', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(910, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:02:36.013943', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(911, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:19:51.887690', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(912, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 07:24:19.179175', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(913, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 07:40:00.829691', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(914, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:09:12.653003', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(915, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:24:45.171806', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(916, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:40:25.318917', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(917, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:59:53.710481', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(918, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:15:18.783052', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(919, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:32:58.197135', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(920, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:32:58.347118', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(921, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:49:20.596715', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(922, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 10:30:05.239531', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(923, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 10:30:05.555799', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(924, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:04:41.138247', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(925, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:31:15.139043', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(926, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:31:15.140860', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(927, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 12:51:57.003350', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(928, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 13:09:56.558205', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(929, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 13:26:00.928221', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(930, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 15:27:13.182767', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(931, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 15:47:29.705443', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(932, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 15:47:29.707212', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(933, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 16:43:24.356283', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(934, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 16:43:24.357047', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(935, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:36:58.346655', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(936, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:58:38.885932', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(937, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:58:38.929189', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(938, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:58:38.944187', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(939, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 18:58:40.079084', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(940, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 18:58:40.080649', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(941, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 19:24:27.638719', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(942, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 19:55:08.796883', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(943, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 20:50:55.919772', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(944, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 21:08:03.025331', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(945, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 21:43:24.574550', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(946, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 22:01:36.834032', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(947, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 22:16:59.824175', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(948, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 08:22:12.787302', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(949, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 08:40:06.110206', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(950, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 09:08:05.047973', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(951, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 09:26:27.630450', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(952, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 10:43:59.865848', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(953, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 11:05:30.675836', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(954, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 11:09:31.982596', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(955, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 12:01:41.231965', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(956, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 12:27:50.094117', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(957, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 12:27:50.100969', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(958, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 12:27:50.107962', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(959, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 13:20:51.697466', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(960, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 15:09:40.180068', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(961, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 21:22:47.369070', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(962, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 21:22:47.371584', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(963, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 22:54:15.705217', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(964, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 23:10:36.450730', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(965, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 23:32:04.141948', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(966, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 23:48:14.016201', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(967, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 07:16:04.154407', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(968, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 07:31:43.922544', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(969, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 07:47:29.629992', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(970, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 08:04:24.906972', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(971, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 08:25:33.655510', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(972, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 08:25:33.662042', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(973, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 08:43:09.090703', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(974, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:04:41.910860', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(975, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:25:06.669309', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(976, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:40:48.894691', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(977, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 10:01:13.064949', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(978, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 10:23:14.037035', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(979, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 15:56:05.446703', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(980, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 16:15:50.008021', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(981, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 19:49:49.857709', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(982, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 19:49:50.287940', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(983, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 13:27:40.578075', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(984, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 16:00:00.493344', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(985, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 16:00:00.498094', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(986, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 17:25:05.133805', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(987, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 18:02:17.067165', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(988, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 18:02:17.068208', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(989, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 18:30:37.931704', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(990, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 19:03:40.203722', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(991, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 20:07:11.769869', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(992, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 20:23:17.142383', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(993, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 20:59:27.746883', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(994, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 21:15:52.686203', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(995, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 21:31:03.534571', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(996, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 22:09:02.112696', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(997, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 22:25:06.907159', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(998, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 11:46:23.060185', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(999, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 12:15:32.828338', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1000, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 12:43:13.793498', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1001, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 12:59:09.429192', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1002, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 17:09:38.688098', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1003, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 18:15:34.160939', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1004, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 18:38:09.946594', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1005, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 18:55:03.006383', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1006, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 20:27:00.306021', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1007, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 20:43:40.370012', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1008, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 21:22:17.488058', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1009, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 21:38:27.415426', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1010, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 21:55:54.007022', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1011, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:14:20.034619', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1012, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:23:53.339092', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1013, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:25:32.573363', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1014, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:25:49.405652', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1015, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 07:18:42.544330', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1016, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 07:38:10.693337', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1017, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 07:54:20.003066', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1018, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:12:38.326144', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1019, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:18:58.489728', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1020, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:19:17.447666', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1021, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 10:26:48.919377', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1022, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 10:49:55.082585', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1023, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:09:43.852381', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1024, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:09:43.855505', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1025, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:14:08.674372', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1026, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:20:47.281670', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1027, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:21:17.221520', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1028, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:21:37.485728', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1029, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:39:07.721543', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1030, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 20:57:01.243076', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1031, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 07:03:23.976230', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1032, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 07:23:20.016133', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1033, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 12:58:28.338883', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1034, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 13:15:31.435044', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1035, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:02:25.242714', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1036, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:02:25.248063', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1037, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 12:13:36.868655', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1038, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 12:52:33.136040', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1039, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 21:04:59.581468', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1040, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 21:24:31.492762', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1041, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 21:43:27.835132', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1042, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:22:08.014875', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1043, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:25:41.280119', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1044, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:26:38.913074', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1045, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:47:59.481601', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1046, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:47:59.483777', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1047, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:06:10.360530', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1048, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:23:53.163216', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1049, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:52:52.521248', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1050, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:09:13.393517', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1051, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:07:28.008495', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1052, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:23:16.118141', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1053, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:42:21.496425', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1054, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 07:42:21.497827', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1055, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:19:30.564439', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1056, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:35:16.846279', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1057, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:50:22.461131', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1058, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:08:02.458047', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1059, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:24:02.996866', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1060, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:24:02.998740', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1061, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:42:59.921184', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1062, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:40:55.220740', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1063, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 11:00:03.501584', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1064, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 11:20:53.719346', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1065, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 11:43:36.674902', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1066, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 12:48:51.028964', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1067, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 13:04:21.239782', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1068, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 13:04:21.248429', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1069, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 13:20:43.213676', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1070, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 13:49:15.108633', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1071, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 16:21:24.387363', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1072, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 16:37:28.815107', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1073, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 17:06:20.797981', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1074, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 17:10:56.370583', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1075, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 04:03:21.507563', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1076, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 04:09:01.505732', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1077, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 22:44:31.174506', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1078, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 23:12:02.802342', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1079, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 10:18:26.322830', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1080, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 08:44:40.365158', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1081, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 09:00:22.883650', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1082, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 09:18:41.618453', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1083, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 09:34:30.693963', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1084, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 10:32:12.874425', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1085, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 10:57:54.489321', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1086, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 11:14:08.696343', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1087, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 12:47:32.474240', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1089, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 12:55:39.346056', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1090, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 13:35:28.227971', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1091, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 08:29:45.209846', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1092, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 09:38:03.757766', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1093, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 10:41:08.332611', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1094, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 10:41:11.000645', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1095, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 10:57:15.019719', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1096, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 11:14:10.857659', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1097, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 11:55:03.014934', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1098, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 12:12:24.883662', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1099, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 12:59:26.037876', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1100, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 13:29:47.455655', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1101, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 20:26:19.487483', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1102, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 20:45:02.751856', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1103, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 21:47:38.948831', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1104, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 22:11:48.050374', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1105, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 22:28:20.113460', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1106, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 22:45:25.837848', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1107, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 23:02:06.050171', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1108, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 23:38:31.508650', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1109, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 19:04:27.076292', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1110, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 20:16:41.286852', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1111, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 20:50:10.107362', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1112, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 21:26:06.934009', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1113, 1, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 21:28:25.491062', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1114, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 21:34:07.348569', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1115, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 21:49:11.677532', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1116, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:14:08.832450', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1117, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:32:57.492487', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1118, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:58:29.196351', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1119, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 23:26:18.275889', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1120, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 23:54:08.517580', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1121, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 00:13:07.489705', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1122, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 10:16:51.791198', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1123, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 10:42:34.442875', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1124, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:21:58.702325', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1125, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:21:58.702675', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1126, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:41:20.342948', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1127, 4, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:56:51.200748', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1128, 4, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:57:08.926657', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1129, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:57:11.488795', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1130, 4, 'password', 0, 'invalid_password', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 12:13:47.020223', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1131, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 12:13:50.462011', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1132, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 12:57:08.155326', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1133, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 13:12:12.385507', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1134, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 13:46:43.650509', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1135, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 14:53:06.778225', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1136, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 15:41:06.084621', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1137, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 16:08:18.392043', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1138, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 16:45:06.660024', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1139, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 17:02:16.787190', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1140, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 17:20:26.636236', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1141, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 17:35:52.755640', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1142, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 17:50:55.640433', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1143, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 18:14:26.320160', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1144, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 18:37:00.212535', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1145, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:12:52.394946', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1146, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:44:43.842495', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1147, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:46:17.435709', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1148, 4, 'password', 1, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:46:32.068874', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1149, 4, 'password', 1, NULL, '109.164.51.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:48:11.463354', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1150, 4, 'password', 1, NULL, '109.164.51.14', 1113, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:04:29.793671', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1151, 4, 'password', 1, NULL, '109.164.51.14', 1114, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:12:50.533929', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1152, 4, 'password', 1, NULL, '109.164.51.14', 1115, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:12:53.920521', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1153, 4, 'password', 1, NULL, '109.164.51.14', 1116, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 20:19:38.046764', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1154, 4, 'password', 1, NULL, '109.164.51.14', 1117, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 20:19:39.001922', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL);
INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(1155, 4, 'password', 1, NULL, '109.164.51.14', 1118, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 20:19:42.052863', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1156, 4, 'password', 0, 'invalid_password', '109.164.51.14', NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 20:19:56.015176', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1157, 4, 'password', 0, 'invalid_password', '109.164.51.14', NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 20:19:56.775272', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1158, 4, 'password', 1, NULL, '109.164.51.14', 1119, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:43:22.595474', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1159, 4, 'password', 1, NULL, '109.164.51.14', 1120, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:45:41.131963', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1160, 4, 'password', 1, NULL, '109.164.51.14', 1121, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 20:52:11.641525', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1161, 4, 'password', 1, NULL, '109.164.51.14', 1122, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:58:34.619794', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1162, 4, 'password', 1, NULL, '109.164.51.14', 1123, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:31:16.315534', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1163, 4, 'password', 1, NULL, '109.164.51.14', 1124, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:51:46.128091', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1164, 4, 'password', 1, NULL, '109.164.51.14', 1125, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 22:20:43.252182', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1165, 4, 'password', 1, NULL, '109.164.51.14', 1126, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 22:48:19.249279', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1166, 4, 'password', 1, NULL, '109.164.51.14', 1127, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 23:07:00.133988', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1167, 4, 'password', 1, NULL, '109.164.51.14', 1128, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 23:59:40.103176', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1168, 4, 'password', 1, NULL, '109.164.51.14', 1129, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 00:15:08.956272', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1169, 4, 'password', 1, NULL, '109.164.51.14', 1130, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 00:35:04.284123', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1170, 4, 'password', 1, NULL, '109.164.51.14', 1131, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 07:33:29.165022', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1171, 4, 'password', 1, NULL, '46.135.4.3', 1132, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 08:45:09.171083', 'Prague', '100 00', 'Prague', 'Czechia', 'CZ', NULL, NULL),
(1172, 4, 'password', 1, NULL, '109.164.51.14', 1133, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 12:04:25.708550', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1173, 4, 'password', 1, NULL, '109.164.51.14', 1134, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 12:25:54.628858', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1174, 4, 'password', 1, NULL, '109.164.51.14', 1135, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 12:42:12.478690', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1175, 4, 'password', 1, NULL, '109.164.51.14', 1136, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 12:58:15.180563', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1176, 4, 'password', 1, NULL, '109.164.51.14', 1137, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 13:16:58.070601', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1177, 4, 'password', 1, NULL, '109.164.51.14', 1138, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 15:52:37.284507', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1178, 4, 'password', 1, NULL, '109.164.51.14', 1139, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 16:50:21.554053', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1179, 4, 'password', 1, NULL, '109.164.51.14', 1140, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 17:07:29.959529', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1180, 4, 'password', 1, NULL, '109.164.51.14', 1141, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 17:07:41.221014', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1181, 4, 'password', 1, NULL, '109.164.51.14', 1142, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 17:25:44.229432', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1182, 4, 'password', 1, NULL, '109.164.51.14', 1143, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 17:41:01.737128', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1183, 4, 'password', 1, NULL, '109.164.51.14', 1144, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 18:14:32.833795', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1184, 4, 'password', 1, NULL, '109.164.51.14', 1145, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 19:05:42.869789', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1185, 4, 'password', 1, NULL, '109.164.51.14', 1146, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 19:42:44.482096', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1186, 4, 'password', 1, NULL, '109.164.51.14', 1147, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 13:13:41.321114', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1187, 4, 'password', 1, NULL, '109.164.51.14', 1148, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 14:37:28.113155', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1188, 4, 'password', 1, NULL, '109.164.51.14', 1149, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 15:21:38.008105', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1189, 4, 'password', 1, NULL, '109.164.51.14', 1150, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 15:40:26.196379', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1190, 4, 'password', 1, NULL, '109.164.51.14', 1151, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 16:00:28.682448', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1191, 4, 'password', 1, NULL, '109.164.51.14', 1152, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 16:32:01.730128', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1192, 4, 'password', 1, NULL, '109.164.51.14', 1153, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 16:50:55.000249', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1193, 4, 'password', 1, NULL, '109.164.51.14', 1154, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 17:07:08.562895', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1194, 4, 'password', 1, NULL, '109.164.51.14', 1155, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 17:22:29.878402', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1195, 4, 'password', 1, NULL, '109.164.51.14', 1156, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 17:46:27.255125', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1196, 4, 'password', 1, NULL, '109.164.51.14', 1157, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 18:06:55.247140', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1197, 4, 'password', 1, NULL, '109.164.51.14', 1158, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 18:39:05.687279', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1198, 4, 'password', 1, NULL, '109.164.51.14', 1159, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:19:45.476473', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1199, 4, 'password', 1, NULL, '109.164.51.14', 1160, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:19:46.569527', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1200, 4, 'password', 1, NULL, '109.164.51.14', 1161, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:40:59.783561', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1201, 4, 'password', 1, NULL, '109.164.51.14', 1162, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:57:53.704960', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1202, 4, 'password', 1, NULL, '109.164.51.14', 1163, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 20:13:48.650943', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1203, 4, 'password', 1, NULL, '109.164.51.14', 1164, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 20:30:30.762030', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1204, 4, 'password', 1, NULL, '109.164.51.14', 1165, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 20:57:31.878301', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1205, 4, 'password', 1, NULL, '109.164.51.14', 1166, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 22:26:48.758937', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1206, 4, 'password', 1, NULL, '109.164.51.14', 1167, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 22:54:38.588239', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1207, 4, 'password', 1, NULL, '109.164.51.14', 1168, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 23:14:48.830800', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1208, 4, 'password', 1, NULL, '109.164.51.14', 1169, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 23:31:20.935380', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1209, 4, 'password', 1, NULL, '109.164.51.14', 1170, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 20:54:47.962170', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1210, 1, 'password', 0, 'invalid_password', '109.164.51.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 21:16:16.827310', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1211, 1, 'password', 0, 'invalid_password', '109.164.51.14', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 21:16:20.509016', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1212, 1, 'password', 1, NULL, '109.164.51.14', 1171, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 21:16:42.610596', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1213, 4, 'password', 1, NULL, '109.164.51.14', 1172, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 21:52:10.997319', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1214, 1, 'password', 1, NULL, '109.164.51.14', 1173, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 21:52:17.366514', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1215, 1, 'password', 1, NULL, '109.164.51.14', 1174, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 22:13:52.345773', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1216, 1, 'password', 1, NULL, '109.164.51.14', 1175, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 22:29:58.816968', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1217, 1, 'password', 1, NULL, '195.113.101.227', 1176, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 08:48:38.382823', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1218, 1, 'password', 1, NULL, '195.113.101.227', 1177, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 09:04:21.029998', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1219, 1, 'password', 1, NULL, '195.113.101.227', 1178, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 09:19:28.722055', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1220, 4, 'password', 1, NULL, '195.113.101.227', 1179, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 09:20:06.482059', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1221, 4, 'password', 1, NULL, '195.113.101.227', 1180, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 09:41:19.915973', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1222, 4, 'password', 1, NULL, '195.113.101.227', 1181, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 09:56:29.903263', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1223, 4, 'password', 1, NULL, '195.113.101.227', 1182, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:18:13.167151', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1224, 4, 'password', 1, NULL, '195.113.101.227', 1183, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:33:54.624716', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1225, 4, 'password', 1, NULL, '195.113.101.227', 1184, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:59:00.958221', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1226, 4, 'password', 1, NULL, '195.113.101.227', 1185, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 11:14:33.743394', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1227, 4, 'password', 1, NULL, '195.113.101.227', 1186, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 12:25:34.885168', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1228, 4, 'password', 1, NULL, '195.113.101.227', 1187, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 12:41:49.821967', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1229, 1, 'password', 1, NULL, '195.113.101.227', 1188, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 12:59:29.095082', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1230, 1, 'password', 1, NULL, '195.113.101.227', 1189, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 13:18:10.013272', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1231, 1, 'password', 1, NULL, '195.113.101.227', 1190, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 13:38:34.684521', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1232, 4, 'password', 1, NULL, '109.164.51.14', 1191, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 21:53:30.418414', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1233, 1, 'password', 1, NULL, '109.164.51.14', 1192, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:01:55.526247', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1234, 4, 'password', 1, NULL, '109.164.51.14', 1193, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:03:20.199289', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1235, 1, 'password', 1, NULL, '109.164.51.14', 1194, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:08:20.687893', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1236, 1, 'password', 1, NULL, '109.164.51.14', 1195, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:24:29.155707', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1237, 1, 'password', 1, NULL, '109.164.51.14', 1196, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:40:37.519911', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1238, 1, 'password', 1, NULL, '109.164.51.14', 1197, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:40:44.282874', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1239, 1, 'password', 1, NULL, '109.164.51.14', 1198, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 22:40:49.032828', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1240, 1, 'password', 1, NULL, '109.164.51.14', 1199, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 15:00:03.567325', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1241, 1, 'password', 1, NULL, '109.164.51.14', 1200, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 15:38:50.321712', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1242, 1, 'password', 1, NULL, '109.164.51.14', 1201, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 15:55:31.123162', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1243, 1, 'password', 1, NULL, '109.164.51.14', 1202, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 16:13:51.101395', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1244, 1, 'password', 1, NULL, '109.164.51.14', 1203, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 16:26:56.325049', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1245, 1, 'password', 1, NULL, '109.164.51.14', 1204, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 16:43:55.769124', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1246, 1, 'password', 1, NULL, '109.164.51.14', 1205, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 16:44:00.850524', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1247, 1, 'password', 1, NULL, '109.164.51.14', 1206, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:37:39.885699', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1248, 1, 'password', 1, NULL, '109.164.51.14', 1207, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:59:49.074409', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1249, 4, 'password', 1, NULL, '109.164.51.14', 1208, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:59:54.657620', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1250, 1, 'password', 1, NULL, '109.164.51.14', 1209, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 18:00:29.622981', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1251, 1, 'password', 1, NULL, '109.164.51.14', 1210, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 18:04:24.221474', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1252, 1, 'password', 1, NULL, '109.164.51.14', 1211, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 18:45:35.014915', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1253, 4, 'password', 1, NULL, '109.164.51.14', 1212, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-28 05:28:07.860236', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1254, 4, 'password', 1, NULL, '109.164.51.14', 1213, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 21:21:22.229815', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1255, 1, 'password', 1, NULL, '109.164.51.14', 1214, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 21:21:32.495296', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1256, 4, 'password', 1, NULL, '109.164.51.14', 1215, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 21:55:51.618813', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1257, 4, 'password', 1, NULL, '109.164.51.14', 1216, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 21:55:51.619809', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1258, 4, 'password', 1, NULL, '109.164.51.14', 1217, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 22:18:42.711888', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1259, 4, 'password', 1, NULL, '109.164.51.14', 1218, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 22:34:22.723905', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1260, 4, 'password', 1, NULL, '109.164.51.14', 1219, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 22:52:49.553378', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1261, 4, 'password', 1, NULL, '109.164.51.14', 1220, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:12:23.939464', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1262, 4, 'password', 1, NULL, '109.164.51.14', 1221, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:27:29.357358', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1263, 4, 'password', 1, NULL, '109.164.51.14', 1222, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:43:08.340262', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1264, 4, 'password', 1, NULL, '109.164.51.14', 1223, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 09:38:34.827268', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1265, 4, 'password', 1, NULL, '109.164.51.14', 1224, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 10:03:14.661103', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1266, 4, 'password', 1, NULL, '109.164.51.14', 1225, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 10:26:07.434912', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1267, 4, 'password', 1, NULL, '109.164.51.14', 1226, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 10:50:57.097779', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1268, 4, 'password', 1, NULL, '109.164.51.14', 1227, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 11:19:12.432789', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1269, 4, 'password', 1, NULL, '109.164.51.14', 1228, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 12:09:52.602949', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1270, 4, 'password', 1, NULL, '109.164.51.14', 1229, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 12:36:01.268688', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1271, 4, 'password', 1, NULL, '109.164.51.14', 1230, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 13:12:30.873085', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1272, 4, 'password', 1, NULL, '109.164.51.14', 1231, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 13:34:40.129021', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1273, 4, 'password', 1, NULL, '109.164.51.14', 1232, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 14:44:02.743991', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1274, 4, 'password', 1, NULL, '109.164.51.14', 1233, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 15:12:22.948402', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1275, 4, 'password', 1, NULL, '109.164.51.14', 1234, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 15:28:29.742252', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1276, 4, 'password', 1, NULL, '109.164.51.14', 1235, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 15:51:37.890957', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1277, 4, 'password', 1, NULL, '109.164.51.14', 1236, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 16:10:11.029177', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1278, 4, 'password', 1, NULL, '109.164.51.14', 1237, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 16:31:13.584360', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1279, 4, 'password', 1, NULL, '109.164.51.14', 1238, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 16:49:05.147254', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1280, 4, 'password', 1, NULL, '109.164.51.14', 1239, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 17:06:34.845251', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1281, 4, 'password', 1, NULL, '109.164.51.14', 1240, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 20:04:28.888251', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1282, 4, 'password', 1, NULL, '109.164.51.14', 1241, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 20:21:57.515902', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1283, 4, 'password', 1, NULL, '109.164.51.14', 1242, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 20:37:38.669080', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1284, 4, 'password', 1, NULL, '109.164.51.14', 1243, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 20:53:51.280145', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1285, 4, 'password', 1, NULL, '109.164.51.14', 1244, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 21:44:13.101063', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1286, 4, 'password', 1, NULL, '109.164.51.14', 1245, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 21:59:24.955814', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1287, 4, 'password', 1, NULL, '109.164.51.14', 1246, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 22:18:27.670547', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1288, 4, 'password', 1, NULL, '109.164.51.14', 1247, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 22:35:08.623151', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1289, 4, 'password', 1, NULL, '109.164.51.14', 1248, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 23:10:35.240973', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1290, 4, 'password', 1, NULL, '109.164.51.14', 1249, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 13:41:47.082869', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1291, 4, 'password', 1, NULL, '109.164.51.14', 1250, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 13:41:50.833141', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1292, 4, 'password', 1, NULL, '109.164.51.14', 1251, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 13:42:12.877429', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1293, 4, 'password', 1, NULL, '109.164.51.14', 1252, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 14:35:01.507147', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1294, 4, 'password', 1, NULL, '109.164.51.14', 1253, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 14:51:16.500944', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1295, 4, 'password', 1, NULL, '109.164.51.14', 1254, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 20:31:44.092815', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1296, 4, 'password', 1, NULL, '109.164.51.14', 1255, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 21:38:19.338823', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1297, 2, 'password', 1, NULL, '109.164.51.14', 1256, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 21:55:11.350965', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1298, 4, 'password', 1, NULL, '109.164.51.14', 1257, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 22:01:13.363005', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1299, 2, 'password', 1, NULL, '109.164.51.14', 1258, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 22:02:22.335429', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1300, 4, 'password', 1, NULL, '109.164.51.14', 1259, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 22:14:36.292228', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1301, 1, 'password', 1, NULL, '109.164.51.14', 1260, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 23:17:11.693498', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1302, 3, 'password', 1, NULL, '109.164.51.14', 1261, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 23:17:27.074815', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1303, 4, 'password', 1, NULL, '109.164.51.14', 1262, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-02 00:10:01.478977', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1304, 4, 'password', 1, NULL, '195.113.101.227', 1263, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 07:07:19.772648', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1305, 1, 'password', 1, NULL, '195.113.101.227', 1264, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 07:46:31.186370', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1306, 4, 'password', 1, NULL, '195.113.101.227', 1265, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 08:11:42.933950', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1307, 4, 'password', 1, NULL, '195.113.101.227', 1266, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 10:02:38.392278', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1308, 4, 'password', 1, NULL, '195.113.101.227', 1267, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 10:50:03.742308', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1309, 4, 'password', 1, NULL, '195.113.101.227', 1268, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 12:27:53.930299', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1310, 4, 'password', 1, NULL, '195.113.101.227', 1269, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 08:10:07.049945', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1311, 4, 'password', 1, NULL, '195.113.101.227', 1270, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 09:10:24.388902', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1312, 4, 'password', 1, NULL, '195.113.101.227', 1271, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:00:46.228039', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1313, 1, 'password', 1, NULL, '195.113.101.227', 1272, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:08:42.210696', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1314, 4, 'password', 1, NULL, '195.113.101.227', 1273, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:34:02.943858', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1315, 3, 'password', 1, NULL, '195.113.101.227', 1274, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:34:33.356547', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1316, 4, 'password', 1, NULL, '195.113.101.227', 1275, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:34:58.155372', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1317, 4, 'password', 1, NULL, '185.184.192.200', 1276, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 11:11:44.208924', 'Naaldwijk', '2671', 'South Holland', 'The Netherlands', 'NL', NULL, NULL),
(1318, 4, 'password', 1, NULL, '185.184.192.200', 1277, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 11:20:10.509186', 'Naaldwijk', '2671', 'South Holland', 'The Netherlands', 'NL', NULL, NULL),
(1319, 4, 'password', 1, NULL, '195.113.101.227', 1278, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 13:15:45.859065', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1320, 4, 'password', 1, NULL, '195.113.101.227', 1279, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 13:40:59.321382', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1321, 4, 'password', 1, NULL, '109.164.51.14', 1280, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 19:11:31.270476', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1322, 1, 'password', 1, NULL, '109.164.51.14', 1281, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 20:31:29.552643', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1323, 1, 'password', 1, NULL, '109.164.51.14', 1282, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 20:32:07.749536', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1324, 4, 'password', 1, NULL, '109.164.51.14', 1283, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 22:31:48.567748', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1325, 4, 'password', 1, NULL, '109.164.51.14', 1284, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 22:41:19.102631', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1326, 4, 'password', 1, NULL, '109.164.51.14', 1285, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 15:01:18.241350', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1327, 4, 'password', 1, NULL, '109.164.51.14', 1286, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 15:46:35.896983', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1328, 4, 'password', 1, NULL, '109.164.51.14', 1287, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 18:13:44.011202', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1329, 4, 'password', 1, NULL, '109.164.51.14', 1288, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 18:29:53.136422', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1330, 4, 'password', 1, NULL, '109.164.51.14', 1289, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 19:12:49.224570', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1331, 4, 'password', 1, NULL, '109.164.51.14', 1290, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 19:45:00.114538', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1332, 4, 'password', 1, NULL, '109.164.51.14', 1291, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 19:46:36.746059', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1333, 4, 'password', 1, NULL, '109.164.51.14', 1292, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 20:00:20.601097', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1334, 1, 'password', 1, NULL, '109.164.51.14', 1293, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 20:49:44.014914', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1335, 1, 'password', 1, NULL, '109.164.51.14', 1294, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:03:55.983808', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1336, 4, 'password', 1, NULL, '109.164.51.14', 1295, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:04:03.221150', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1337, 3, 'password', 1, NULL, '109.164.51.14', 1296, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:06:31.162665', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1338, 1, 'password', 1, NULL, '109.164.51.14', 1297, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:07:00.776840', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1339, 4, 'password', 1, NULL, '109.164.51.14', 1298, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:08:25.500577', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1340, 4, 'password', 1, NULL, '109.164.51.14', 1299, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 22:25:25.269483', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1341, 4, 'password', 1, NULL, '109.164.51.14', 1300, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 23:36:13.350704', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1342, 4, 'password', 1, NULL, '109.164.51.14', 1301, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 13:57:38.430804', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1343, 1, 'password', 1, NULL, '109.164.51.14', 1302, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 14:17:49.800957', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1344, 4, 'password', 1, NULL, '109.164.51.14', 1303, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 15:04:40.450007', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1345, 1, 'password', 1, NULL, '109.164.51.14', 1304, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 17:12:53.102922', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1346, 4, 'password', 1, NULL, '109.164.51.14', 1305, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 17:15:28.615362', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1347, 4, 'password', 1, NULL, '109.164.51.14', 1306, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 17:17:43.079680', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1348, 4, 'password', 1, NULL, '109.164.51.14', 1307, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 17:48:55.705814', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1349, 1, 'password', 1, NULL, '109.164.51.14', 1308, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 17:49:08.121040', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1350, 4, 'password', 1, NULL, '109.164.51.14', 1309, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 19:00:25.989645', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1351, 4, 'password', 1, NULL, '109.164.51.14', 1310, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 19:36:19.202762', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1352, 4, 'password', 1, NULL, '109.164.51.14', 1311, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 20:39:26.440464', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1353, 4, 'password', 1, NULL, NULL, 1312, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 09:40:06.376656', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `login_history` (`loginId`, `userId`, `type`, `success`, `error`, `ip`, `token_id`, `userAgent`, `created`, `city`, `zip_code`, `region_name`, `country`, `country_code`, `continent`, `continent_code`) VALUES
(1354, 4, 'password', 1, NULL, '109.164.51.14', 1313, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 17:51:50.292397', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1355, 4, 'password', 1, NULL, '109.164.51.14', 1314, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 18:50:42.880115', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1356, 4, 'password', 1, NULL, '109.164.51.14', 1315, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 21:08:17.860937', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1357, 4, 'password', 1, NULL, '109.164.51.14', 1316, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 21:10:07.934568', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1358, 4, 'password', 1, NULL, '109.164.51.14', 1317, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 21:10:48.721779', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1359, 4, 'password', 1, NULL, '109.164.51.14', 1318, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 21:41:27.474387', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1360, 1, 'password', 1, NULL, '109.164.51.14', 1319, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 22:30:21.182561', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1361, 4, 'password', 1, NULL, '109.164.51.14', 1320, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 22:39:10.357887', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1362, 1, 'password', 1, NULL, '109.164.51.14', 1321, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 22:43:47.069252', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1363, 1, 'password', 1, NULL, '109.164.51.14', 1322, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 23:06:13.780757', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1364, 4, 'password', 1, NULL, '109.164.51.14', 1323, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 10:24:35.071137', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1365, 4, 'password', 1, NULL, '109.164.51.14', 1324, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 17:13:21.812516', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1366, 4, 'password', 1, NULL, '109.164.51.14', 1325, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 17:46:45.202752', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1367, 4, 'password', 1, NULL, '109.164.51.14', 1326, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:03:36.347196', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1368, 4, 'password', 1, NULL, '109.164.51.14', 1327, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:07:48.707850', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1369, 4, 'password', 1, NULL, '109.164.51.14', 1328, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:07:54.997542', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1370, 1, 'password', 1, NULL, '109.164.51.14', 1329, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:08:00.836455', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1371, 4, 'password', 1, NULL, '109.164.51.14', 1330, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:18:23.255299', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1372, 4, 'password', 1, NULL, '109.164.51.14', 1331, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 19:11:27.652444', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1373, 4, 'password', 1, NULL, '109.164.51.14', 1332, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 19:59:07.778957', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1374, 4, 'password', 1, NULL, '109.164.51.14', 1333, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 22:05:45.403941', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1375, 4, 'password', 1, NULL, '109.164.51.14', 1334, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 22:45:54.162042', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1376, 4, 'password', 1, NULL, '109.164.51.14', 1335, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 22:48:15.318819', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1377, 4, 'password', 1, NULL, '109.164.51.14', 1336, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', '2025-12-07 22:48:41.506919', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1378, 4, 'password', 1, NULL, '109.164.51.14', 1337, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', '2025-12-07 22:49:04.969624', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1379, 4, 'password', 1, NULL, '109.164.51.14', 1338, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', '2025-12-07 22:55:53.012648', 'České Budějovice', '370 01', 'Jihočeský kraj', 'Czechia', 'CZ', NULL, NULL),
(1380, 4, 'password', 1, NULL, '195.113.101.227', 1339, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 07:10:12.847914', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1381, 4, 'password', 1, NULL, '195.113.101.227', 1340, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 08:23:41.382060', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1382, 1, 'password', 1, NULL, '195.113.101.227', 1341, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 08:23:55.298960', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1383, 4, 'password', 1, NULL, '195.113.101.227', 1342, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 08:24:53.338961', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1384, 2, 'password', 1, NULL, '195.113.101.227', 1343, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 08:31:17.138079', 'Ostrava', '702 00', 'Moravskoslezský kraj', 'Czechia', 'CZ', NULL, NULL),
(1385, 4, 'password', 1, NULL, '185.100.234.183', 1344, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 09:07:38.966500', 'Amsterdam', '1012', 'North Holland', 'The Netherlands', 'NL', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `login_qrcodes`
--

CREATE TABLE `login_qrcodes` (
  `qrcode` varchar(255) NOT NULL,
  `socket` text NOT NULL,
  `userAgent` text NOT NULL,
  `ip` text DEFAULT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `login_qrcodes`
--

INSERT INTO `login_qrcodes` (`qrcode`, `socket`, `userAgent`, `ip`, `created`) VALUES
('5wFwhJU5AIf5AfN3lwYFVKtnDmRdQ9cl', '80225c6b27aaf69f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-08 08:55:52.903230'),
('BhVIcC40TQjN2zOMoljE4EjmospD1XBG', 'b6750ff167eefd77', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-08 09:07:42.548402'),
('usTPaD0DZrMsyr071uLaXUfGGfh5MEQV', '80225c6b27aaf69f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-08 08:55:58.154782');

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
  `require_confirm` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `messages`
--

INSERT INTO `messages` (`message_id`, `type`, `topic`, `message`, `author_id`, `sent_at`, `deleted`, `require_confirm`) VALUES
(1, 0, NULL, 'Zkouškaa :¨)', 1, '2025-11-22 17:21:27', 0, 0),
(2, 0, NULL, 'Zkouškaa :¨)', 1, '2025-11-22 17:21:27', 0, 0),
(3, 0, NULL, 'Dobrý den,\n\nzasílám Vám tuto zkušební zprávu :)\n\nxxx', 1, '2025-11-22 17:21:27', 0, 0),
(4, 0, NULL, 'asdasdasdasddas', 2, '2025-11-22 17:21:27', 0, 0),
(5, 0, NULL, 'asdasd', 2, '2025-11-22 17:21:27', 0, 0),
(6, 1, 'Seminární práce', 'Vážení studenti, připomínám zítřejší termín odevzdání seminárních prací. Prosím nahrajte je do systému do 23:59.', 4, '2025-11-30 23:40:34', 0, 0),
(7, 1, 'Změna výuky', 'Z důvodu havárie vody bude zítra 24.11. zkrácené vyučování. Konec výuky ve 12:35.', 4, '2025-11-30 23:40:56', 0, 0),
(8, 1, 'Vánoční jarmark', 'Vánoční jarmark se blíží! Přijďte nás podpořit a nakoupit drobné dárky. Výtěžek půjde na charitu.', 13, '2025-11-30 23:41:22', 0, 0);

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
(5, 2, '2025-11-25 22:31:25', NULL),
(5, 4, '2025-11-23 13:05:18', NULL),
(5, 25, NULL, NULL),
(5, 31, NULL, NULL),
(6, 4, '2025-11-30 23:51:21', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`data`)),
  `action` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`action`)),
  `read_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `notification_rules`
--

CREATE TABLE `notification_rules` (
  `rule_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`conditions`)),
  `enabled` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `notification_rules`
--

INSERT INTO `notification_rules` (`rule_id`, `user_id`, `type`, `conditions`, `enabled`) VALUES
(2, 4, 'grade_new', '{}', 0),
(3, 4, 'substitution_new', '{}', 1),
(4, 4, 'reward_new', '{}', 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `passwords`
--

CREATE TABLE `passwords` (
  `passwordId` int(11) NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `passwords`
--

INSERT INTO `passwords` (`passwordId`, `password`) VALUES
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
(15, '$2b$12$FeG1w68AHvjyWquvZfKBK.1BU6X4WxafZFjIJWSrvTtwtsvdH8qja');

-- --------------------------------------------------------

--
-- Struktura tabulky `payments_classes`
--

CREATE TABLE `payments_classes` (
  `pClassId` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `balance` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `payments_columns`
--

CREATE TABLE `payments_columns` (
  `paymentColumnId` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `description` text NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `createdBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `payments_payments`
--

CREATE TABLE `payments_payments` (
  `paymentId` int(11) NOT NULL,
  `personId` int(11) NOT NULL,
  `paymentColumnId` int(11) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `persons`
--

CREATE TABLE `persons` (
  `personId` int(11) NOT NULL,
  `lastName` text NOT NULL,
  `firstName` text NOT NULL,
  `gender` int(11) NOT NULL,
  `birthday` date DEFAULT NULL,
  `birthnum` varchar(16) DEFAULT NULL,
  `birthplace` int(11) DEFAULT NULL,
  `address` int(11) DEFAULT NULL,
  `GDPR` tinyint(1) NOT NULL DEFAULT 0,
  `insuranceId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `persons`
--

INSERT INTO `persons` (`personId`, `lastName`, `firstName`, `gender`, `birthday`, `birthnum`, `birthplace`, `address`, `GDPR`, `insuranceId`) VALUES
(1, 'Kosík', 'Josef', 0, '2006-08-14', '', 0, 1, 0, 201),
(2, 'Pizinger', 'Jakub', 0, '1995-01-19', '', 0, 1, 0, NULL),
(3, 'Bakala', 'Břetislav', 0, '1994-01-21', '', 0, 1, 0, NULL),
(4, 'Bartuška', 'Martin', 0, '1994-01-21', '', 0, 1, 0, NULL),
(5, 'Benedikt', 'Miloš', 0, '1994-01-21', '', 0, 1, 0, NULL),
(6, 'Brůžek', 'Petr', 0, '1994-01-21', '', 0, 1, 0, NULL),
(7, 'Burger', 'Michal', 0, '1998-01-14', '', 0, 1, 0, NULL),
(8, 'Englický', 'Pavel', 0, '1998-01-14', '', 0, 1, 0, NULL),
(9, 'Havlan', 'Josef', 0, '1998-01-14', '', 0, 1, 0, NULL),
(10, 'Habartová', 'Jindřiška', 1, '1998-01-14', '', 0, 1, 0, NULL),
(11, 'Janoušek', 'Milan', 0, '1998-01-14', '', 0, 1, 0, NULL),
(12, 'Kašpar', 'Miroslav', 0, '1998-01-14', '', 0, 1, 0, NULL),
(13, 'Klavíková', 'Ludmila', 1, '1998-01-14', '', 0, 1, 0, NULL),
(14, 'Kotková', 'Hana', 1, '1998-01-14', '', 0, 1, 0, NULL),
(15, 'Kouďová', 'Milena', 1, '1998-01-14', '', 0, 1, 0, NULL),
(16, 'Krásová', 'Petra', 1, '1998-01-14', '', 0, 1, 0, NULL),
(17, 'Novotná', 'Václava', 1, '1998-01-14', '', 0, 1, 0, NULL),
(18, 'Pecková', 'Radka', 1, '1998-01-14', '', 0, 1, 0, NULL),
(19, 'Procházková', 'Olga', 1, '1998-01-14', '', 0, 1, 0, NULL),
(20, 'Průdek', 'Milan', 0, '2003-08-27', '', 0, 1, 0, NULL),
(21, 'Štěpán', 'Luděk', 0, '1998-01-14', '', 0, 1, 0, NULL),
(22, 'Třeštíková', 'Kornelie', 1, '1998-01-14', '', 0, 1, 0, NULL),
(23, 'Vejvoda', 'Luboš', 0, '1998-01-14', '', 0, 1, 0, NULL),
(24, 'Bezpalec', 'Kryštof', 0, '2007-04-07', '', 0, 1, 0, NULL),
(25, 'Bayer', 'Josef', 0, '2004-01-24', '', 0, 1, 0, NULL),
(26, 'Pikl', 'Adam', 0, '2007-02-16', '', 0, 1, 0, NULL),
(27, 'Rataj', 'Adam', 0, '2007-02-17', '', 0, 1, 0, NULL),
(28, 'Hercig', 'Alex', 0, '2006-05-19', '', 0, 1, 0, NULL),
(29, 'Jakl', 'Daniel', 0, '2006-01-21', '', 0, 1, 0, NULL),
(30, 'Břicháček', 'David', 0, '2006-12-15', '', 0, 1, 0, NULL),
(31, 'Kozjura', 'Filip', 0, '2006-10-18', '', 0, 1, 0, NULL),
(32, 'Bouček', 'Filip', 0, '2006-01-28', '', 0, 1, 0, NULL),
(33, 'Bartínek', 'Adam', 0, NULL, NULL, NULL, 1, 0, NULL),
(34, 'Špirhanzlová', 'Vladimíra', 1, NULL, NULL, NULL, 1, 0, NULL),
(35, 'Kinkor', 'Jiří', 0, NULL, NULL, NULL, 1, 0, NULL),
(36, 'Dušek', 'Jiří', 0, NULL, NULL, NULL, 1, 0, NULL),
(37, 'Němec', 'Lukáš', 0, NULL, NULL, NULL, 1, 0, NULL),
(38, 'Obecný', 'Numax', 0, NULL, NULL, NULL, 1, 0, NULL),
(39, 'Vyroubal', 'Pavel', 0, NULL, NULL, NULL, 1, 0, NULL),
(40, 'Němec', 'Lukáš', 0, '2007-05-11', NULL, NULL, NULL, 0, 201),
(41, 'Mácha', 'Michal', 0, '2006-08-02', NULL, NULL, NULL, 0, 111);

-- --------------------------------------------------------

--
-- Struktura tabulky `persons_degree`
--

CREATE TABLE `persons_degree` (
  `person` int(11) NOT NULL,
  `degree` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `persons_degree`
--

INSERT INTO `persons_degree` (`person`, `degree`) VALUES
(4, 1),
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
(16, 15),
(4, 16);

-- --------------------------------------------------------

--
-- Struktura tabulky `phone_numbers`
--

CREATE TABLE `phone_numbers` (
  `code` int(11) NOT NULL,
  `number` text NOT NULL,
  `personId` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
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
  `active_from` timestamp NULL DEFAULT NULL,
  `active_to` timestamp NULL DEFAULT NULL,
  `time_limit` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `is_manually_graded` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Struktura tabulky `poll_responses`
--

CREATE TABLE `poll_responses` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `total_score` int(11) DEFAULT NULL,
  `total_max_score` int(11) DEFAULT NULL,
  `percentage` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `rooms`
--

CREATE TABLE `rooms` (
  `roomId` int(11) NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `description` text NOT NULL,
  `manager` int(11) NOT NULL,
  `capacity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `rooms`
--

INSERT INTO `rooms` (`roomId`, `name`, `type`, `description`, `manager`, `capacity`) VALUES
(1, '107', 'class', '', 2, 30);

-- --------------------------------------------------------

--
-- Struktura tabulky `schools`
--

CREATE TABLE `schools` (
  `schoolId` int(11) NOT NULL,
  `name` text NOT NULL,
  `shortName` text DEFAULT NULL,
  `district` int(11) NOT NULL,
  `code` text NOT NULL,
  `owner` int(11) NOT NULL,
  `apiToken` text NOT NULL,
  `license_type` enum('FREE','BASIC','PRO','DEV') NOT NULL DEFAULT 'FREE',
  `license_until` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `startHour` int(11) NOT NULL DEFAULT 8,
  `startMinute` int(11) NOT NULL DEFAULT 0,
  `lessonHour` int(11) NOT NULL DEFAULT 45,
  `breakTime` int(11) NOT NULL DEFAULT 5,
  `resetPasswordWithEmail` int(11) NOT NULL DEFAULT 1,
  `warningAbsencePercent` int(11) NOT NULL DEFAULT 20,
  `fastLogin` tinyint(1) NOT NULL DEFAULT 1,
  `modules` text NOT NULL DEFAULT '0',
  `studentsLimit` int(11) NOT NULL DEFAULT 250,
  `gdpr_firstname` text DEFAULT NULL,
  `gdpr_lastname` text DEFAULT NULL,
  `gdpr_phone` text DEFAULT NULL,
  `gdpr_email` text DEFAULT NULL,
  `gdpr_mobile` text DEFAULT NULL,
  `gdpr_databox` text DEFAULT NULL,
  `gdpr_web` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `schools`
--

INSERT INTO `schools` (`schoolId`, `name`, `shortName`, `district`, `code`, `owner`, `apiToken`, `license_type`, `license_until`, `created`, `startHour`, `startMinute`, `lessonHour`, `breakTime`, `resetPasswordWithEmail`, `warningAbsencePercent`, `fastLogin`, `modules`, `studentsLimit`, `gdpr_firstname`, `gdpr_lastname`, `gdpr_phone`, `gdpr_email`, `gdpr_mobile`, `gdpr_databox`, `gdpr_web`) VALUES
(1, 'Střední průmyslová a Vyšší odborná škola v Písku', 'SPŠ Písek', 63, 'SPS-PI', 1, '24Q7TZDGAEYGUN1H0DMJDHLZROCA76UF77UY1DK5R01VQ120Q4RS45LVU5JIGBV4', 'DEV', NULL, '2024-09-29 17:39:02', 8, 0, 45, 5, 1, 20, 1, '1', -1, 'GDPR', 'ZVAS', '389822501', NULL, '608057836', '3cdj5ts', 'zvas.cz');

-- --------------------------------------------------------

--
-- Struktura tabulky `school_breaks`
--

CREATE TABLE `school_breaks` (
  `school` int(11) NOT NULL,
  `hour` int(11) NOT NULL,
  `minutes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `school_breaks`
--

INSERT INTO `school_breaks` (`school`, `hour`, `minutes`) VALUES
(1, 3, 10),
(1, 4, 20);

-- --------------------------------------------------------

--
-- Struktura tabulky `school_domains`
--

CREATE TABLE `school_domains` (
  `sdId` int(11) NOT NULL,
  `school` int(11) NOT NULL,
  `domain` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `school_domains`
--

INSERT INTO `school_domains` (`sdId`, `school`, `domain`) VALUES
(1, 1, 'localhost:4200');

-- --------------------------------------------------------

--
-- Struktura tabulky `school_years`
--

CREATE TABLE `school_years` (
  `syId` int(11) NOT NULL,
  `start` date NOT NULL DEFAULT current_timestamp(),
  `end` date NOT NULL DEFAULT current_timestamp(),
  `midterm` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `school_years`
--

INSERT INTO `school_years` (`syId`, `start`, `end`, `midterm`) VALUES
(1, '2023-09-04', '2024-08-31', '2024-01-31'),
(2, '2025-09-02', '2026-08-31', '2026-01-30'),
(3, '2022-09-05', '2023-08-31', '2023-01-30'),
(4, '2025-09-01', '2026-06-30', '2026-02-13');

-- --------------------------------------------------------

--
-- Struktura tabulky `scopes`
--

CREATE TABLE `scopes` (
  `scopeId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `shortcut` text NOT NULL,
  `code` varchar(255) NOT NULL,
  `years` int(11) NOT NULL,
  `students_per_class` int(11) NOT NULL,
  `number_of_classes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `scopes`
--

INSERT INTO `scopes` (`scopeId`, `name`, `shortcut`, `code`, `years`, `students_per_class`, `number_of_classes`) VALUES
(1, 'Elektrotechnika', 'ELE', '26-41-M/01 Elektrotechnika', 4, 30, 2),
(2, 'Informační technologie', 'IT', '18-20-M/01', 4, 30, 1),
(3, 'Počítačové projektování', 'PP', '26-41-M/01 Elektrotechnika', 4, 30, 1);

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
(967, 2, 4, 37, 0, 0, 1, NULL, NULL),
(968, 2, 0, 38, 0, 0, 1, NULL, NULL),
(969, 2, 1, 38, 0, 0, 1, NULL, NULL),
(970, 2, 2, 38, 0, 0, 1, NULL, NULL),
(971, 2, 3, 38, 0, 0, 1, NULL, NULL),
(972, 2, 4, 38, 0, 0, 1, NULL, NULL),
(973, 2, 0, 39, 0, 0, 1, NULL, NULL),
(974, 2, 1, 39, 0, 0, 1, NULL, NULL),
(975, 2, 2, 39, 0, 0, 1, NULL, NULL),
(976, 2, 3, 39, 0, 0, 1, NULL, NULL),
(977, 2, 4, 39, 0, 0, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `semester_grades`
--

CREATE TABLE `semester_grades` (
  `s_g_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `semester` smallint(6) NOT NULL CHECK (`semester` in (1,2)),
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
(1, 24, 31, 2025, 2, '1', NULL, 4, 0, '2025-12-07 20:36:23', '2025-12-07 20:42:29');

-- --------------------------------------------------------

--
-- Struktura tabulky `students`
--

CREATE TABLE `students` (
  `personId` int(11) NOT NULL,
  `class` int(11) NOT NULL,
  `status` enum('active','archive') NOT NULL DEFAULT 'active',
  `startStudy` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `students`
--

INSERT INTO `students` (`personId`, `class`, `status`, `startStudy`) VALUES
(1, 1, 'active', '2021-09-06'),
(24, 1, 'active', '2021-09-06'),
(25, 1, 'active', '2021-09-06'),
(26, 1, 'active', '2021-09-06'),
(27, 1, 'active', '2021-09-06'),
(28, 1, 'active', '2021-09-06'),
(29, 1, 'active', '2021-09-06'),
(30, 1, 'active', '2021-09-06'),
(31, 1, 'active', '2021-09-06'),
(32, 1, 'active', '2021-09-06'),
(40, 1, 'active', '2021-09-06'),
(41, 1, 'archive', '2021-09-06');

-- --------------------------------------------------------

--
-- Struktura tabulky `student_groups`
--

CREATE TABLE `student_groups` (
  `student` int(11) NOT NULL,
  `groupId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `student_groups`
--

INSERT INTO `student_groups` (`student`, `groupId`) VALUES
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
-- Struktura tabulky `student_homework`
--

CREATE TABLE `student_homework` (
  `student` int(11) NOT NULL,
  `homework` int(11) NOT NULL,
  `submitted` tinyint(1) NOT NULL DEFAULT 0,
  `finished` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `student_homework`
--

INSERT INTO `student_homework` (`student`, `homework`, `submitted`, `finished`) VALUES
(1, 7, 0, 0),
(1, 8, 0, 0),
(1, 9, 0, 0),
(1, 10, 0, 0),
(1, 11, 0, 0),
(1, 12, 0, 0),
(1, 13, 0, 0),
(24, 7, 0, 0),
(24, 8, 0, 0),
(24, 9, 0, 0),
(24, 10, 0, 0),
(24, 11, 0, 0),
(24, 12, 0, 0),
(24, 13, 0, 0),
(25, 7, 0, 0),
(25, 8, 0, 0),
(25, 9, 0, 0),
(25, 10, 0, 0),
(25, 11, 0, 0),
(25, 12, 0, 0),
(25, 13, 0, 0),
(26, 7, 0, 0),
(26, 8, 0, 0),
(26, 9, 0, 0),
(26, 10, 0, 0),
(26, 11, 0, 0),
(26, 12, 0, 0),
(26, 13, 0, 0),
(27, 7, 0, 0),
(27, 8, 0, 0),
(27, 9, 0, 0),
(27, 10, 0, 0),
(27, 11, 0, 0),
(27, 12, 0, 0),
(27, 13, 0, 0),
(28, 7, 0, 0),
(28, 8, 0, 0),
(28, 9, 0, 0),
(28, 10, 0, 0),
(28, 11, 0, 0),
(28, 12, 0, 0),
(28, 13, 0, 0),
(29, 7, 0, 0),
(29, 8, 0, 0),
(29, 9, 0, 0),
(29, 10, 0, 0),
(29, 11, 0, 0),
(29, 12, 0, 0),
(29, 13, 0, 0),
(30, 7, 0, 0),
(30, 8, 0, 0),
(30, 9, 0, 0),
(30, 10, 0, 0),
(30, 11, 0, 0),
(30, 12, 0, 0),
(30, 13, 0, 0),
(31, 7, 0, 0),
(31, 8, 0, 0),
(31, 9, 0, 0),
(31, 10, 0, 0),
(31, 11, 0, 0),
(31, 12, 0, 0),
(31, 13, 0, 0),
(32, 7, 0, 0),
(32, 8, 0, 0),
(32, 9, 0, 0),
(32, 10, 0, 0),
(32, 11, 0, 0),
(32, 12, 0, 0),
(32, 13, 0, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `student_rewards`
--

CREATE TABLE `student_rewards` (
  `rewardId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `reward` text NOT NULL,
  `amount` int(11) DEFAULT NULL,
  `teacherId` int(11) NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `isReceived` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `subjects`
--

CREATE TABLE `subjects` (
  `subjectId` int(11) NOT NULL,
  `label` text NOT NULL,
  `shortcut` varchar(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `subjects`
--

INSERT INTO `subjects` (`subjectId`, `label`, `shortcut`) VALUES
(1, 'Anglický jazyk', 'AJ1'),
(2, 'Český jazyk a literatura', 'CJL'),
(3, 'Něměcký jazyk', 'NJ2'),
(4, 'Občanská nauka', 'OBN'),
(5, 'Dějepis', 'DEJ'),
(6, 'Matematika', 'MAT'),
(7, 'Fyzika', 'FYZI'),
(8, 'Chemie', 'CHE'),
(9, 'Základy ekologie', 'ZEK'),
(10, 'Ekonomika', 'EKOI'),
(11, 'Informační a komunikační technologie', 'ICT'),
(12, 'Tělesná výchova', 'TEV'),
(13, 'Základy elektrotechniky', 'ZAE'),
(14, 'Elektrotechnická zařízení', 'EZ'),
(15, 'Elektronika', 'ELT'),
(16, 'Mikroprocesorová technika', 'MIT'),
(17, 'Praktická cvičení ', 'PRAE'),
(18, 'Přenosové a automatické systémy', 'PAS'),
(19, 'Elektrotechnická měření', 'ELM'),
(20, 'Technické kreslení ', 'TEK'),
(21, 'Strojní systémy', 'STS'),
(22, 'Elektronické řídící systémy', 'ERS'),
(23, 'Automatizační cvičení', 'AUC'),
(24, 'Komerční elektronické systémy', 'KES'),
(25, 'Obnovitelné zdroje', 'OBZ'),
(26, 'Elektronické systémy budov', 'ESB'),
(27, 'Anglická konverzace', 'AJK'),
(28, 'Německá konverzace', 'NJK'),
(29, 'Hardware', 'HW'),
(30, 'Počítačové sítě', 'PS'),
(31, 'Programování a vývoj aplikací ', 'PVA'),
(32, 'Aplikační software', 'APS'),
(33, 'Operační systémy', 'OSY'),
(34, 'Praktická cvičení', 'PRAI'),
(35, 'Kybernetická bezpečnost systémů', 'KBS'),
(36, 'Anglický jazyk odborný', 'AJO'),
(37, 'Třídnícká hodina', 'TH'),
(38, 'Michalovo povídání', 'MP'),
(39, 'Michalovo povídání', 'MP');

-- --------------------------------------------------------

--
-- Struktura tabulky `substitution`
--

CREATE TABLE `substitution` (
  `substitutionId` int(11) NOT NULL,
  `groupId` int(11) DEFAULT NULL,
  `start_date` date NOT NULL DEFAULT current_timestamp(),
  `start_hour` int(11) NOT NULL,
  `end_date` date NOT NULL DEFAULT current_timestamp(),
  `end_hour` int(11) NOT NULL,
  `type` text DEFAULT NULL,
  `subjectId` int(11) DEFAULT NULL,
  `teacherId` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `event_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `substitution`
--

INSERT INTO `substitution` (`substitutionId`, `groupId`, `start_date`, `start_hour`, `end_date`, `end_hour`, `type`, `subjectId`, `teacherId`, `created`, `event_id`) VALUES
(1, 10, '2024-11-20', -1, '2024-11-20', 0, NULL, NULL, 2, '2024-11-18 18:47:32', NULL),
(2, 10, '2024-11-21', 2, '2024-11-21', 0, NULL, 33, NULL, '2024-11-18 20:41:11', NULL),
(3, 9, '2024-11-19', -1, '2024-11-19', 0, NULL, NULL, NULL, '2024-11-18 20:41:11', NULL),
(4, NULL, '2026-06-28', -1, '2026-08-31', -1, 'holiday', NULL, NULL, '2025-06-30 16:56:09', 1),
(6, 9, '2025-12-01', 1, '2025-12-01', 1, NULL, 1, 15, '2025-12-03 13:53:00', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `teachers`
--

CREATE TABLE `teachers` (
  `personId` int(11) NOT NULL,
  `cabinet` int(11) NOT NULL,
  `rank` varchar(255) NOT NULL DEFAULT '''teacher'''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `teachers`
--

INSERT INTO `teachers` (`personId`, `cabinet`, `rank`) VALUES
(2, 1, 'teacher'),
(3, 1, 'teacher'),
(4, 1, 'teacher'),
(5, 1, 'teacher'),
(6, 1, 'teacher'),
(7, 1, 'teacher'),
(8, 1, 'teacher'),
(9, 1, 'teacher'),
(10, 1, 'teacher'),
(11, 1, 'teacher'),
(12, 1, 'teacher'),
(13, 1, 'teacher'),
(14, 1, 'teacher'),
(15, 1, 'teacher'),
(16, 1, 'teacher'),
(17, 1, 'teacher'),
(18, 1, 'teacher'),
(19, 1, 'teacher'),
(20, 1, 'teacher'),
(21, 1, 'teacher'),
(22, 1, 'teacher'),
(23, 1, 'teacher'),
(34, 1, 'teacher'),
(35, 1, 'teacher'),
(36, 1, 'teacher');

-- --------------------------------------------------------

--
-- Struktura tabulky `teachers_salary`
--

CREATE TABLE `teachers_salary` (
  `rank` varchar(255) NOT NULL,
  `salary` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `teachers_salary`
--

INSERT INTO `teachers_salary` (`rank`, `salary`) VALUES
('teacher', 30000);

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
(8, 2);

-- --------------------------------------------------------

--
-- Struktura tabulky `timetable`
--

CREATE TABLE `timetable` (
  `lessonId` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `hour` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `subject` int(11) NOT NULL,
  `teacher` int(11) NOT NULL,
  `room` int(11) NOT NULL,
  `groupId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `timetable`
--

INSERT INTO `timetable` (`lessonId`, `day`, `hour`, `type`, `subject`, `teacher`, `room`, `groupId`) VALUES
(1, 0, 1, 0, 33, 20, 1, 2),
(2, 0, 2, 0, 29, 11, 1, 2),
(3, 0, 3, 0, 6, 19, 1, 2),
(4, 0, 4, 0, 7, 23, 1, 2),
(5, 0, 5, 1, 32, 2, 1, 2),
(6, 0, 6, 1, 32, 2, 1, 2),
(7, 1, 1, 0, 4, 13, 1, 2),
(8, 1, 2, 0, 30, 18, 1, 2),
(11, 1, 3, 0, 2, 8, 1, 2),
(12, 1, 4, 0, 1, 15, 1, 4),
(13, 1, 5, 0, 6, 19, 1, 2),
(14, 1, 6, 0, 3, 22, 1, 4),
(15, 1, 8, 0, 8, 17, 1, 2),
(16, 2, 1, 0, 6, 19, 1, 2),
(17, 2, 2, 0, 2, 8, 1, 2),
(18, 2, 3, 0, 33, 20, 1, 2),
(19, 2, 4, 0, 31, 18, 1, 2),
(20, 2, 5, 0, 29, 11, 1, 2),
(21, 2, 6, 0, 7, 23, 1, 2),
(22, 2, 8, 0, 3, 22, 1, 4),
(23, 3, 3, 0, 11, 2, 1, 4),
(24, 3, 4, 0, 11, 2, 1, 4),
(25, 3, 5, 0, 1, 15, 1, 4),
(26, 3, 6, 0, 1, 15, 1, 4),
(27, 3, 8, 0, 2, 8, 1, 2),
(28, 4, 1, 0, 31, 2, 1, 4),
(29, 4, 2, 0, 31, 2, 1, 4),
(30, 4, 3, 0, 30, 18, 1, 4),
(31, 4, 4, 0, 30, 18, 1, 4),
(32, 4, 5, 0, 12, 21, 1, 4),
(33, 4, 6, 0, 12, 21, 1, 4),
(34, 3, 1, 0, 34, 20, 1, 5),
(35, 3, 2, 0, 34, 20, 1, 5),
(36, 0, 1, 0, 30, 18, 1, 9),
(37, 0, 2, 0, 30, 18, 1, 9),
(38, 0, 3, 0, 35, 2, 1, 10),
(39, 0, 4, 1, 32, 36, 1, 9),
(40, 0, 5, 1, 32, 36, 1, 9),
(41, 0, 6, 0, 29, 11, 1, 10),
(42, 0, 8, 0, 4, 13, 1, 10),
(43, 1, 1, 0, 33, 4, 1, 9),
(44, 1, 2, 0, 33, 4, 1, 9),
(45, 1, 3, 0, 31, 4, 1, 9),
(46, 1, 4, 0, 31, 4, 1, 9),
(47, 1, 5, 0, 7, 23, 1, 10),
(48, 1, 6, 0, 2, 8, 1, 10),
(49, 1, 8, 0, 1, 15, 1, 9),
(50, 2, 1, 0, 6, 19, 1, 10),
(51, 2, 2, 0, 35, 2, 1, 10),
(52, 2, 3, 0, 7, 23, 1, 10),
(53, 2, 4, 0, 2, 8, 1, 10),
(56, 2, 5, 0, 1, 15, 1, 9),
(57, 2, 6, 0, 36, 15, 1, 9),
(58, 3, 1, 0, 6, 19, 1, 10),
(59, 3, 2, 0, 10, 34, 1, 10),
(60, 3, 3, 2, 32, 35, 1, 9),
(61, 3, 4, 2, 32, 35, 1, 9),
(62, 3, 3, 1, 29, 11, 1, 9),
(63, 3, 4, 1, 29, 11, 1, 9),
(64, 3, 5, 0, 30, 18, 1, 10),
(65, 3, 7, 0, 12, 21, 1, 9),
(66, 3, 8, 0, 12, 21, 1, 9),
(67, 4, 1, 0, 10, 34, 1, 10),
(68, 4, 2, 0, 2, 8, 1, 10),
(69, 4, 3, 0, 6, 19, 1, 10),
(70, 4, 4, 0, 32, 35, 1, 10),
(71, 4, 5, 0, 34, 11, 1, 11),
(72, 4, 6, 0, 32, 11, 1, 11);

-- --------------------------------------------------------

--
-- Struktura tabulky `tokens`
--

CREATE TABLE `tokens` (
  `tokenId` int(11) NOT NULL,
  `token` text NOT NULL,
  `password` int(11) NOT NULL,
  `userAgent` text NOT NULL,
  `expires` datetime(6) NOT NULL,
  `created` datetime(6) NOT NULL,
  `userId` int(11) NOT NULL,
  `socket` text DEFAULT NULL,
  `ip` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `tokens`
--

INSERT INTO `tokens` (`tokenId`, `token`, `password`, `userAgent`, `expires`, `created`, `userId`, `socket`, `ip`) VALUES
(673, '$2b$04$0Sz3XqrVGObuQimX2LN3p.8T8oj0entfk/EpJ1zDX3wy8TUn30SmC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 17:02:27.549000', '2025-06-27 16:47:27.551000', 1, NULL, NULL),
(674, '$2b$04$/nc4ggmgjWiPoDGOfGcIPeu4CO5waJzhLdxVOVaXlYx80BvI11t0.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 17:31:28.479000', '2025-06-27 17:16:28.480000', 1, NULL, NULL),
(675, '$2b$04$XZxGduAtouBHzgTBUfKAGurEkrlT.WzW3DLen9l3C6ii5t6TIUwVi', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 17:54:12.858000', '2025-06-27 17:39:12.859000', 1, NULL, NULL),
(676, '$2b$04$dFrgPoT/yK2LvkV4o9rQyel3gXSMxmUK2xtHYN93th4ijAiA466sG', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 20:18:43.221000', '2025-06-27 20:03:43.222000', 1, NULL, NULL),
(677, '$2b$04$RpWE54Y0.5iv0r9Ey8ZYBevI2MTQvDopqBRiA6oJttHPAitv3N07a', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 12:51:50.845000', '2025-06-29 12:36:50.847000', 1, NULL, NULL),
(678, '$2b$04$.Aw29XorTX9xF.UjUygEtubroOHlSkfy9vyVeElU2FM/IpuXCuvyq', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 13:10:01.970000', '2025-06-29 12:55:01.971000', 1, NULL, NULL),
(679, '$2b$04$r6ujS7u1/8qjlqp.7cR3F.WH0j8Z4/wQu0i27Lg6WAkeCXz1u3a3q', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 13:51:22.612000', '2025-06-29 13:36:22.634000', 1, NULL, NULL),
(680, '$2b$04$yJLEAOWF.q1nXNQHxuFysOF7cjH.ASwdaqdvtLb4m31zJx9VlYcZC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 14:12:46.686000', '2025-06-29 13:57:46.693000', 1, NULL, NULL),
(681, '$2b$04$AntA8akw22QBDTPWCzzWEuCo2pQjhQFG1qwqNG4BM1R2wvTM5Tm8a', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 17:47:48.581000', '2025-06-29 17:32:48.583000', 1, NULL, NULL),
(682, '$2b$04$n4sKW.3253siBxmRzsilE.IiVbBeGt0q0m9Nx2QCjIFAWulrYmRE6', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 18:09:30.312000', '2025-06-29 17:54:30.313000', 1, NULL, NULL),
(683, '$2b$04$AT.4clBZ8Y23MJlNUVxl9OhdvJ.j.D6BJXv4i.rztcgCueFWNYfv6', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 18:26:44.700000', '2025-06-29 18:11:44.703000', 1, NULL, NULL),
(684, '$2b$04$0rJqDrwoJYyiw92929PM4ut53J4wWc3EfzOA.iBWNrYIDRYaXJBjC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 18:43:59.005000', '2025-06-29 18:28:59.007000', 1, NULL, NULL),
(685, '$2b$04$JAvhRvbKYq86dzJ9l9.Ec.2ntSbisEmUwjXNHd7BAkAIrKeTVJoCO', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 19:21:48.120000', '2025-06-29 19:06:48.121000', 1, NULL, NULL),
(686, '$2b$04$vVjzFDWxgN1WCOkJwGfV7uMexW2xCkjx2xzrawbAILpYDqcIAvB.6', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 19:51:47.734000', '2025-06-29 19:36:47.735000', 1, NULL, NULL),
(687, '$2b$04$2E4bYvWIeDLb.uwRA0U82O9WwyOhdhPvL2GG5F5Pj0c6gAi4HzB02', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:22:39.754000', '2025-06-29 20:07:39.759000', 1, NULL, NULL),
(688, '$2b$04$hYUHaq4xIcQW/9kXb/VoduPn6hKRDioKbYGRaKtwI6QhjVh.M/oGy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 22:51:58.957000', '2025-06-29 22:36:58.959000', 4, NULL, NULL),
(689, '$2b$04$XT6w16S0DkA4DnSIuzZZQ.ogLsy9IvGXRSXxnn9.Lhsuri6kqNL7G', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 22:51:58.965000', '2025-06-29 22:36:58.965000', 4, NULL, NULL),
(690, '$2b$04$vnOZUOgrhuBEd6oD52ucoO7Nj4lMca18fEMpz7CzdhbCMCgDMjJMW', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 23:08:25.693000', '2025-06-29 22:53:25.693000', 1, NULL, NULL),
(691, '$2b$04$FKPVJnyUDzTA4zwq5DupjOKtimGVe97Nbgy27nNayfdBtjz0DdIhO', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 23:26:26.601000', '2025-06-29 23:11:26.603000', 1, NULL, NULL),
(692, '$2b$04$VMdtC2qXVanGH2TgDOAv/eKtDJYrYC6jtGn5B.a4ck2RIEs2vjPYS', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 10:06:41.915000', '2025-06-30 09:51:41.916000', 1, NULL, NULL),
(693, '$2b$04$VQXIo/UZOazud2ES8.t0/Oqy7Act8XXJe6B2jTr0fTycUy.qc2yYC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 10:13:10.256000', '2025-06-30 09:58:10.257000', 2, NULL, NULL),
(694, '$2b$04$nWuTfewbJ84Vt7gzHF5mrOTDDzmHnudf.2DKH2OXaKMXIDUdUGr7C', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 10:43:41.030000', '2025-06-30 10:28:41.031000', 1, NULL, NULL),
(695, '$2b$04$G4via0NJ9oQcxwcjxfUHM.XlG0cuq3wnyDazFfYL8EebuVZs5A/b.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 17:17:32.882000', '2025-06-30 17:02:32.884000', 1, NULL, NULL),
(696, '$2b$04$4O1H1wdpDUgyYOs6AkwsMe8zlpplpFXFvZAl2Q3w0VWk9TwWg2qAO', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 17:51:02.048000', '2025-06-30 17:36:02.049000', 1, NULL, NULL),
(697, '$2b$04$ySupufwYlYJ3E0tFDWrmiOFa0ek4OcH8edQCy/GWorOP0dk..QnMi', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 19:06:23.501000', '2025-06-30 18:51:23.504000', 1, NULL, NULL),
(698, '$2b$04$RuhXF2x8qQQmmAUTY8S8qeIWd43/5dY7ZE7S4.MIvR/79T0URmlYO', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 19:41:41.618000', '2025-06-30 19:26:41.620000', 1, NULL, NULL),
(699, '$2b$04$6f0k1m9M2Y8HpkwoO2CHoe0ddgAFDo6AAD0yBXWGcju5bzPKMXuQa', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 20:02:46.040000', '2025-06-30 19:47:46.045000', 1, NULL, NULL),
(700, '$2b$04$NHwTlALBydNxroY9kcCvTuxeg2sQxki5op6oc./WH/jw190v3QGtC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 18:06:40.101000', '2025-07-01 17:51:40.102000', 1, NULL, NULL),
(701, '$2b$04$SLEjfWVHgo3uQfbme0NJQOlUlusKIKefQMxrbUGygVO5Fwv.A7sHK', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 19:39:39.199000', '2025-07-01 19:24:39.200000', 1, NULL, NULL),
(702, '$2b$04$HucOkj9glxddCrnzC.Un6uJDVekgBkHAgRE.qTZU/E4F21ardwqli', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 20:22:05.868000', '2025-07-01 20:07:05.871000', 1, NULL, NULL),
(703, '$2b$04$tfPmis67U3KekWZhMIJ44.WoYJv7b15/8hDYGosLpNrOLl2ZQ0cES', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 21:07:23.840000', '2025-07-01 20:52:23.843000', 1, NULL, NULL),
(704, '$2b$04$0rNgO7Fb5vXTkTgu3rCM2eUmpzMrYSN6TB.7VutMlh6roikfhYOEu', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 21:37:45.851000', '2025-07-01 21:22:45.853000', 1, NULL, NULL),
(705, '$2b$04$AISdtypTkShLstAWAAH85.AESi0nBJpuP9LmkJ7TEdepslF2Yuc5e', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:02:08.238000', '2025-07-01 21:47:08.243000', 1, NULL, NULL),
(706, '$2b$04$0xrsDa5tf0oMsHL9pGtMd.5S6p9uz/H7CiOuqHsRvrjxqSPfZQjb2', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:37:58.980000', '2025-07-01 22:22:58.982000', 1, NULL, NULL),
(707, '$2b$04$aduJMylIKFFsqJLUpMy2suZPQQfDyyrpdFKoM.bOLkucwkwBTGRPu', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:53:06.967000', '2025-07-01 22:38:06.969000', 1, NULL, NULL),
(708, '$2b$04$6bbB0yquBfQf6RkysEKAFOdD2KCoE4rnEkuF2hc3Fe4QcUxBpXp2a', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 00:01:22.184000', '2025-07-01 23:46:22.187000', 1, NULL, NULL),
(709, '$2b$04$088jnK7j0SODSBKdgpVZtu5oRSW9L0CCu2RGFHzfRILnguxZrAot6', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 00:18:54.252000', '2025-07-02 00:03:54.255000', 1, NULL, NULL),
(710, '$2b$04$Tpwh381FwRsPCYuXawVKAe6L4D150Si2Re53Q.1uS/kRCewkbffqW', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 00:56:05.359000', '2025-07-02 00:41:05.365000', 1, NULL, NULL),
(711, '$2b$04$nUq2GfuCMX7dZ8jlpdXj4.V7C3t8Slsh13ICp4bHS2lGvv3DOUOiG', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 09:17:20.380000', '2025-07-02 09:02:20.381000', 1, NULL, NULL),
(712, '$2b$04$djo1BnCKkohetp241/gxLO82W7Twp0hoKjAR0kDYSmMjvn9TmhdkC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:19:02.745000', '2025-07-02 21:04:02.748000', 1, NULL, NULL),
(713, '$2b$04$qYQBwScwbATBgcZ8yZjuMeGjEtzfP7wLmtSS4Vs0lY.E5vWVL1U.G', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 22:04:04.384000', '2025-07-02 21:49:04.384000', 4, NULL, NULL),
(714, '$2b$04$SnH.fbg1sAe8k3XCsePx7.diJHGCwyAvHz30SG5gmVkpppmYF7tQG', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 22:32:10.707000', '2025-07-02 22:17:10.710000', 1, NULL, NULL),
(715, '$2b$04$VGlOkX/iq0jnZwvRiGJR7.43KqsGdYL4l7eS6jtlnnKwCcjFKWjOO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 22:34:57.066000', '2025-07-02 22:19:57.067000', 4, NULL, NULL),
(716, '$2b$04$LhGF.WTEQx4YxLyKjYLkeu68bUwO4E3DRcMI4MlYIP7Lq7rDWn45W', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 23:26:34.679000', '2025-07-02 23:11:34.679000', 1, NULL, NULL),
(717, '$2b$04$/RKmWoHOmKYbXEb12w6YG.nR8adSrpuiaUP90ViA8QawoAVETIai.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 23:27:49.622000', '2025-07-02 23:12:49.622000', 1, NULL, NULL),
(718, '$2b$04$zM9H9g8/ysxhvQSyziHN6OCG6OV99lXXHJc.l6LP4Rg13k9u/j1p2', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 23:28:58.338000', '2025-07-02 23:13:58.339000', 1, NULL, NULL),
(719, '$2b$04$DvE76gO4jGhxZY6KEXLGbuR7AUhfp09WKHhDdm1EjeTFt5XKIDRnu', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-14 21:16:15.300000', '2025-08-14 21:01:15.301000', 1, NULL, NULL),
(720, '$2b$04$NUwJKcnYu/30uQIxvBZKd.kDgX4JN7wEfPSk5F8eKjhBp2MzLDVaa', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-15 10:22:27.939000', '2025-08-15 10:07:27.941000', 1, NULL, NULL),
(721, '$2b$04$AUd964QTJEFRD8gTz8U2n.FR7OH0fbr9htRCSMci54FXE0CEzZ5K.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-17 14:25:50.002000', '2025-08-17 14:10:50.003000', 1, NULL, NULL),
(722, '$2b$04$UwVkOmgvwGK5l9E4e.JMPOf8l8JfmfeCjky9V9z0Qufdym9f.NZLG', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 19:37:35.340000', '2025-08-18 19:22:35.342000', 1, NULL, NULL),
(723, '$2b$04$jj0IQX13DIAm7UI7Z4lk9.JGsThxENBsx794qhBjWBf9FynS7UBmu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 19:48:23.553000', '2025-08-18 19:33:23.553000', 4, NULL, NULL),
(724, '$2b$04$vromjRpwgNZTpWm.EbKw7elVZsoz89.2XKhpN2eUXjbAB7dPIWZ5C', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 19:48:37.617000', '2025-08-18 19:33:37.617000', 1, NULL, NULL),
(725, '$2b$04$9pFP/oaEYdDZhyuMXTtIjOqJH/uHAYCitusNugGAxdMsSZC4bbwB.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 20:08:57.865000', '2025-08-18 19:53:57.865000', 1, NULL, NULL),
(726, '$2b$04$xoLBFyZ94n/3xF5NNU4G.eV1PED/58Of8crniKKiWemG2RbCSNuHG', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 13:22:28.861000', '2025-08-19 13:07:28.863000', 1, NULL, NULL),
(727, '$2b$04$2ug0nVD8T.42T7LvNjws6.bC.Spx1i8WsK0annjhW7DmZX/aRWXBC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 16:25:12.550000', '2025-08-19 16:10:12.551000', 1, NULL, NULL),
(728, '$2b$04$bUl0IazMgt4qKmSjiu4Z/OExXh91Qfmz6bqYDc13kiRp/xUyQwBvO', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 18:06:56.360000', '2025-08-19 17:51:56.361000', 1, NULL, NULL),
(729, '$2b$04$MWdglUJNlK.bxUErpeg0AO8LBqiikI6yx4u.N0DMRrJd/D20rEZvC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 18:25:53.750000', '2025-08-19 18:10:53.751000', 1, NULL, NULL),
(730, '$2b$04$uFR0bGOHszih/DXos6LHM.GV2HTlwqXO6IgA4QpzBolkRPhYsXUqW', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 19:48:24.700000', '2025-08-19 19:33:24.700000', 1, NULL, NULL),
(731, '$2b$04$sC.nd8D6Myp12cVGvqHXpOE7jA9U5YBu8LceuQsH7T51r02AeekaK', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 12:10:13.950000', '2025-08-30 11:55:13.951000', 1, NULL, NULL),
(732, '$2b$04$34fDydV.9T009TuiYufvQOAzwRJ2ZhM6OkOSUIo83NIZteEdVqeEm', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 12:29:51.500000', '2025-08-30 12:14:51.500000', 1, NULL, NULL),
(733, '$2b$04$eQmXWYv1SnnjqPWjTvhOLubOa3GIiEnZmmicN0/uwiozhwN1QDNHW', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 12:45:13.034000', '2025-08-30 12:30:13.034000', 1, NULL, NULL),
(734, '$2b$04$E4OMcZytXrDMVvWieKez5.weNoS8mT2W9jPTslrlZBLgIw./Iyxmi', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 13:33:29.816000', '2025-08-30 13:18:29.817000', 1, NULL, NULL),
(735, '$2b$04$NCy.8XWYHE8Shu9EgEvueOgMA/ZeLQNM9RujyS59.538QsiaLshYe', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-09-01 20:25:10.650000', '2025-09-01 20:10:10.651000', 1, NULL, NULL),
(736, '$2b$04$/FLjvRxPu7Geof/YqfDm5OQL6aQ.goObShFHs/uj8NX/Uw2PQVHOy', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-09-01 21:02:57.883000', '2025-09-01 20:47:57.884000', 1, NULL, NULL),
(737, '$2b$04$PWfLqmCEed5G4gje8cmk7.31T6DNCs4GtRqybr5hEEG9.tWieQYg6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 18:37:00.721000', '2025-10-12 18:22:00.722000', 4, NULL, NULL),
(738, '$2b$04$3dZOwoFHAwhqgwtXYdU/u.pt6NXNVR0zIKkLNcyvQvb5wRqwXx0Qq', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 20:31:49.279000', '2025-10-12 20:16:49.280000', 1, NULL, NULL),
(739, '$2b$04$A0OH39YvlMHDgv88l44p1.OtPtMC9FtOYeWjlIB6S2YIyXCSh9xA.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 20:35:57.162000', '2025-10-12 20:20:57.162000', 1, NULL, NULL),
(740, '$2b$04$VMWgBFTJceGo43arJ/t4pOltPxxO8sjGJ3e53J7M0hAhK67LCCYii', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:41:05.160000', '2025-10-13 08:26:05.161000', 1, NULL, NULL),
(741, '$2b$04$qX50cUp.y8sD/37dCCx.e.I9KnsECvXrKEq71A5Qk2a5IKSLq5UnC', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:56:47.350000', '2025-10-13 08:41:47.353000', 1, NULL, NULL),
(742, '$2b$04$.D3eJriYoSI1LCz6WDIEeOv92ddzCxLyPul23cuzMumH2VdKDa1Ve', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:57:18.348000', '2025-10-13 08:42:18.357000', 3, NULL, NULL),
(743, '$2b$04$Z.p9fYUiW/a9CeAKcSI9c.LjfNslpGG6ampvy8Ilh3SfVVbLxR8ZW', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 08:59:41.320000', '2025-10-13 08:44:41.320000', 1, NULL, NULL),
(744, '$2b$04$WFPB8Hc/U.Ux2y7q/.QQJOvKxUw7mt6HmFvt7S7pyG9Dgi3ohdshS', 11, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:37:03.027000', '2025-10-13 10:22:03.029000', 1, NULL, NULL),
(745, '$2b$04$MBILCyivIX/hzvZAhlAxk.mzfGqrPp2DvS9Dv0y2wICR.RFWsrDxG', 11, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:37:43.214000', '2025-10-13 10:22:43.215000', 1, NULL, NULL),
(746, '$2b$04$y5Z04oLRKPbNjE1gRdhfge56iZtYJrjYIc4eOR8k/Ss0IqfPUJmfm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 10:39:17.452000', '2025-10-13 10:24:17.452000', 4, NULL, NULL),
(747, '$2b$04$i3VnHeE1ZP9zMFJIhrNz/.DMnnBsCLtuIi.axB9ctnY0CAZa41Puu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:19:54.473000', '2025-10-13 12:04:54.474000', 4, NULL, NULL),
(748, '$2b$04$MZNCHBJgts7U.tBSUEvPwuzwdJrDKLlT8Ajoy1Fp.Ist8MUsQ290W', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:22:12.233000', '2025-10-13 12:07:12.234000', 4, NULL, NULL),
(749, '$2b$04$3Jvol3AsNSkIqm9UIk2NSelYZXLXZ2qroCjX6BIKD6ksWZL7QLza6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:34:28.077000', '2025-10-13 12:19:28.080000', 4, NULL, NULL),
(750, '$2b$04$yDV6TaHtWNUqRBvwwJUZmeTvfI0ljElO4wwh4zRtcCETvbJJBKGqi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 13:06:53.485000', '2025-10-13 12:51:53.489000', 4, NULL, NULL),
(751, '$2b$04$QQecuF15TuCNy9yhSqS/huxD3meLdHU9m3igeHRhTu5TnCWOANWLG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 13:24:13.419000', '2025-10-13 13:09:13.430000', 4, NULL, NULL),
(752, '$2b$04$7qGQZTyn/BlzRayENRpPk.6la7xnh0pQgNupc1siikUf0fBi6LZEq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 14:07:56.419000', '2025-10-13 13:52:56.423000', 4, NULL, NULL),
(753, '$2b$04$rDE.Wh3BYBLidlT6LpCKHOpUho2VUsRmuK.xFewJcw2yxsskhoGRG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 14:23:17.130000', '2025-10-13 14:08:17.133000', 4, NULL, NULL),
(754, '$2b$04$kzCRD8FhHnmlsfOZJjHlEOEpeh6u.eqju4pINWyGoITPkzrP7TD0G', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 14:39:28.368000', '2025-10-13 14:24:28.372000', 4, NULL, NULL),
(755, '$2b$04$PuM6K416rpa6taTM1J26Qu34/dqRmmu7Yya2v6n1MW29jhmlqc80i', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 14:59:01.310000', '2025-10-13 14:44:01.311000', 4, NULL, NULL),
(756, '$2b$04$8NQogqfS.AWFzbcuFNrLFulcQn9DlcNRwZvihGuRQf8WNkhL77LW.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 08:19:51.484000', '2025-10-14 08:04:51.491000', 4, NULL, NULL),
(757, '$2b$04$ssPm.BbAZZgSQqq21EVQd.SBROdgdCIbt2TjpFnJnqZ1FjCrTqVSa', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 08:31:00.760000', '2025-10-14 08:16:00.760000', 1, NULL, NULL),
(758, '$2b$04$/pq4xBHWxV.NFYCPSJgAqugGbphowAhoujidg/adzPVsYm5kRRp5a', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 09:00:40.689000', '2025-10-14 08:45:40.691000', 1, NULL, NULL),
(759, '$2b$04$LVykhVx7WCeJkn7GnElo9erDlyqx1zI0eNm.3.7Ar8xp3vfbvd2xy', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-14 11:35:47.295000', '2025-10-14 11:20:47.297000', 1, NULL, NULL),
(760, '$2b$04$0G47t/wbQWdI3LryQ180KOwN3X67X.NUfdV2y3NSGMOBQQ4TGthWK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 10:01:08.913000', '2025-10-15 09:46:08.922000', 4, NULL, NULL),
(761, '$2b$04$OlfjuhFp5Jql.oYhpm1jDecYa8c1aQbxOwUXXKYP8ALQkEF.x6B1S', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 10:20:37.490000', '2025-10-15 10:05:37.502000', 4, NULL, NULL),
(762, '$2b$04$PTUTIv413wC.Fim4SDPzkesiuiLzQ3Aby4sZvGOoXe/UvCRs2nwbu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 10:38:53.828000', '2025-10-15 10:23:53.834000', 4, NULL, NULL),
(763, '$2b$04$T1bH/Js0bfV3hEkrtsvYxeIjKhNr.GBRbGI/HcWcl0savZPOt8gFy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 11:14:15.547000', '2025-10-15 10:59:15.558000', 4, NULL, NULL),
(764, '$2b$04$LjF7uw10bSoDZpgQ4pTJuOf6LlvC6VBAc4W9bg5NulzYPZxY/zxke', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 11:56:59.434000', '2025-10-15 11:41:59.444000', 4, NULL, NULL),
(765, '$2b$04$0cWPZHP7iO3EFCYK6jE5ue0LABJ42Lns92uvv0kIjPeq24P89s7Zy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 12:30:41.841000', '2025-10-15 12:15:41.846000', 4, NULL, NULL),
(766, '$2b$04$.CGT3FUBLg/1vP.upEvJ5u68NjWL.l/o2ejGwcjpu/hmQv2Qfn1pu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 13:57:18.396000', '2025-10-15 13:42:18.399000', 4, NULL, NULL),
(767, '$2b$04$jnIfHXltmLcu5OTsIO9creJ04.1CJExggHEj3E3bfmkICK9Yh06Su', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 14:23:53.224000', '2025-10-15 14:08:53.232000', 4, NULL, NULL),
(768, '$2b$04$6mEydnWzd.7K5wfYtLPwMORUXDJopa/0VJSJuJFCtxcCOH/vvC9em', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 14:43:27.783000', '2025-10-15 14:28:27.786000', 4, NULL, NULL),
(769, '$2b$04$DPSIxLaOSDy.J2UASUmW7.OQ5vTCAAKrS3aa3PDvK6ZLhZCI17V4a', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-15 15:08:01.653000', '2025-10-15 14:53:01.658000', 4, NULL, NULL),
(770, '$2b$04$FzsHxFvbWBEuyqF/EfTPz.9F85gn8jUDBcpiZUK8zoVixVP6WzdWi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 13:11:06.534000', '2025-10-16 12:56:06.537000', 4, NULL, NULL),
(771, '$2b$04$ghzjxa5EIoz6FvnjD8AHZuMkQQUG6rHP0ABzaOdUZSYAkrD94Hwf2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 13:26:57.909000', '2025-10-16 13:11:57.911000', 4, NULL, NULL),
(772, '$2b$04$cm7wNQ79gENjwN1WsfWxmeVAfunGSYIWasG1tjoZ1TTmy5lzANqEu', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 13:47:07.853000', '2025-10-16 13:32:07.871000', 1, NULL, NULL),
(773, '$2b$04$9j7tkANkYdAyzoyo4QVQyOoZmWQ.sbFsw048qvIaO8k/7el0Z2m6e', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 14:04:34.083000', '2025-10-16 13:49:34.096000', 1, NULL, NULL),
(774, '$2b$04$M6415NNGGsli6TzKCgv7q.o/LuXJC6vBaFfYpWKKpesr30lxx3ucy', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 14:21:01.711000', '2025-10-16 14:06:01.712000', 1, NULL, NULL),
(775, '$2b$04$tnzywf1Z5JVnUb/Zoq/nw.h5kZbbc3uVQmadxNszRn6G0pZes6tJu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 14:24:01.803000', '2025-10-16 14:09:01.805000', 4, NULL, NULL),
(776, '$2b$04$8sol/i3DsFd/El7C8dg1n.aNCDfrfP/jHRHpe2c1zoBf2x8LzFcym', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 20:10:06.708000', '2025-10-16 19:55:06.712000', 4, NULL, NULL),
(777, '$2b$04$5NJJGUCOjfZNjQmHgXKmPeMAlP3KxRXoqxUOafhoV/broT9Shx3RK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 21:15:37.199000', '2025-10-16 21:00:37.201000', 4, NULL, NULL),
(778, '$2b$04$FGIoWo.w/Ll9P.OJGyGyUOqJkfDcDTjgBPJJb0N7ESUbbL7iTomGS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 22:38:52.809000', '2025-10-16 22:23:52.816000', 4, NULL, NULL),
(779, '$2b$04$5N.rZW9CKOdP/epd1mQy1uJYL1BF9q51YKjb72CPdY4JnedTouMEu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-16 22:55:54.803000', '2025-10-16 22:40:54.819000', 4, NULL, NULL),
(780, '$2b$04$NyX7eRMTpHG293u9.2hbcOWXe399F52tUaYSGBvEf3LT069R80G92', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 08:42:00.970000', '2025-10-17 08:27:00.976000', 4, NULL, NULL),
(781, '$2b$04$QiX3baPnOUvW.unUu/PvkOOK9Qb9.CiZiOI6l5LM6aGl8pZDNfqIW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 08:59:37.959000', '2025-10-17 08:44:37.959000', 4, NULL, NULL),
(782, '$2b$04$QYEcpQED/M9.DR0E720Rq.2yFNo/ZmnCQ2/8qhAz56obplpnNEJ/u', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 09:15:47.361000', '2025-10-17 09:00:47.361000', 4, NULL, NULL),
(783, '$2b$04$Q1QuYJ83Q10eXG47pG4RGe25MZT5vxAPOejhhh48HJyWM28JeiYEW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 09:30:30.791000', '2025-10-17 09:15:30.810000', 1, NULL, NULL),
(784, '$2b$04$Z5uHadOUyihxBQKWcsKw4.Fqzkstp85YGo8wXQ9MdV1IkLuhHwlSK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 09:47:23.987000', '2025-10-17 09:32:23.990000', 4, NULL, NULL),
(785, '$2b$04$B1RncZUqEJv18TMwr8H22ervzDQ9QbEWtKgTBijrLbZ98mOkWxoeC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 10:04:50.294000', '2025-10-17 09:49:50.300000', 4, NULL, NULL),
(786, '$2b$04$0giIGjwbbH11Cs1LBZ2WXuWIeJdJmOKyGH4TMS6JTnyzt2PpMmRHy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 10:20:33.645000', '2025-10-17 10:05:33.646000', 4, NULL, NULL),
(787, '$2b$04$i/cq/Ba8gDYD7I.HmacSku6/Xwrd2OO2Xhxk8F54EsGECO32H5auq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 10:44:27.283000', '2025-10-17 10:29:27.285000', 4, NULL, NULL),
(788, '$2b$04$VJu2zGsQeY50M6lld7o84eUM17F2J9mHtKuxn5APNKDc0yrCliDUq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 11:01:23.596000', '2025-10-17 10:46:23.599000', 4, NULL, NULL),
(789, '$2b$04$3oSZs.FGl/2MvT5bCwWycuP/h4xkJAwIMufWYkQZtILJyzfFWbbri', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 11:18:58.858000', '2025-10-17 11:03:58.866000', 4, NULL, NULL),
(790, '$2b$04$jvr4OboedHh8szlXs0Zah.HSv5MnY0l6PCHL5/oXbfnD7GLEU1B0q', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-17 11:38:55.236000', '2025-10-17 11:23:55.241000', 4, NULL, NULL),
(791, '$2b$04$hgeK0NQeulPOHxa0VV4UuuzEitznVfJrgnjLo6Ahux/0t/Q0h.PBu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 09:42:39.677000', '2025-10-19 09:27:39.691000', 4, NULL, NULL),
(792, '$2b$04$ygBVcE1voDKnSnd8iOMIS.5DEDU4.OhTJSW4Au8YsugdnqMOGkDR.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 10:03:32.494000', '2025-10-19 09:48:32.496000', 4, NULL, NULL),
(793, '$2b$04$gx8fVeyJ50/RSyn5pI3M6OTCa0MqQ2takUO9zwh0x5lRpXe0/2Y2a', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 10:19:18.053000', '2025-10-19 10:04:18.054000', 4, NULL, NULL),
(794, '$2b$04$0R7kxAla3OsfCjAj7I8DqeMTWxtnt9h7IqL3.mBSM5IhkNXqoEJzW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 10:39:30.338000', '2025-10-19 10:24:30.343000', 4, NULL, NULL),
(795, '$2b$04$2G8wghWbFzNfUwWMz2LCE.VxATZjWZ0Tw5wKYIgvnWsFsIPFzidme', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 10:45:56.599000', '2025-10-19 10:30:56.606000', 2, NULL, NULL),
(796, '$2b$04$A7kYzfE96IxWEZUmBtD//enqIq4uwffnaH0MsjQmTt2TGJI7pAkya', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 10:49:06.478000', '2025-10-19 10:34:06.482000', 4, NULL, NULL),
(797, '$2b$04$rCN6tpwXhzin0PbpNVPdyevnrcNiZWQrcrdi38tHlp0AcmP83bE6u', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-19 11:45:32.737000', '2025-10-19 11:30:32.739000', 4, NULL, NULL),
(798, '$2b$04$FdQceOpTCzArx5LyDxMRXOh6nQ5l1J91paVw0FDkpLo9wIWvVV34S', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-21 08:40:30.187000', '2025-10-21 08:25:30.194000', 4, NULL, NULL),
(799, '$2b$04$4PB2Tcy0FsLa3tSP3LzpiekJpTxnrO49gbkhyHxp5T9IpevGOvw66', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:13:42.546000', '2025-10-22 08:58:42.551000', 1, NULL, NULL),
(800, '$2b$04$Ps8TXCpcY8vc1UQG2Bij0.UAsEtMQbYXs2iv7xXoud6GRVyxLA0ga', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:14:04.466000', '2025-10-22 08:59:04.466000', 4, NULL, NULL),
(801, '$2b$04$WjNlRqWbXEOF92LbO8HU8u7PKaJjuiCjzTrGkKy288aN3GmM1r9.e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 09:29:19.294000', '2025-10-22 09:14:19.299000', 4, NULL, NULL),
(802, '$2b$04$zjzEwCeqW0yG78lckNAdo.K6TxPjrQXWJEWxGXNBwY42Ex8DHIgXW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 10:07:58.310000', '2025-10-22 09:52:58.312000', 4, NULL, NULL),
(803, '$2b$04$MxWGi1R69ql72.UQ1ALFjunP5ta7dKsl/IrB2cBxwJhAZqf7JydKO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 10:30:14.712000', '2025-10-22 10:15:14.714000', 4, NULL, NULL),
(804, '$2b$04$sIrj1VgVTtszNVylqLwOquyXXLNe5mpIB003AVQ9kPJjIErabWfre', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 10:49:52.550000', '2025-10-22 10:34:52.558000', 4, NULL, NULL),
(805, '$2b$04$W86qCl5iDDBXbRm9XZUnaORTGeI0ckiYVuDn/it33Mab66X49g7PO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:06:16.273000', '2025-10-22 10:51:16.278000', 4, NULL, NULL),
(806, '$2b$04$T8F1pn2erJ2daTNQRdeYHOVebjTJQlZfiZM4Y9S6j2CrHKx/CbZra', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:06:16.285000', '2025-10-22 10:51:16.285000', 4, NULL, NULL),
(807, '$2b$04$BHFpUXs/zUZKZO0mhj1Yzua6NJNVMM2z1JXj43ZAqdERWrILkDN36', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:23:26.337000', '2025-10-22 11:08:26.341000', 4, NULL, NULL),
(808, '$2b$04$oQWkUT/1iwcrc3qsmzF7iuCEFmlesh7y9G3fsljtwhsdY/eUC2opO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 11:43:55.415000', '2025-10-22 11:28:55.417000', 4, NULL, NULL),
(809, '$2b$04$erw3c6dye1kwRZoh0l5LPuEUDABJhjNbaLkG66hjWTVa2A/wNwd8e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:04:52.654000', '2025-10-22 11:49:52.655000', 4, NULL, NULL),
(810, '$2b$04$20qy03Ah4z1s/xqsV8P7m.91nceCwn.Hq3htS4Vc08zjT6mFORFhO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:04:52.659000', '2025-10-22 11:49:52.659000', 4, NULL, NULL),
(811, '$2b$04$s.qmdJU4mPkhwIYFG.dXi.WW6Dk86zLz6gFqEwWQsXRblVrCansb2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:20:51.367000', '2025-10-22 12:05:51.372000', 4, NULL, NULL),
(812, '$2b$04$0aKZOC3uJZkAR/aiG1rL2OI8h0PlfKBDXPYwX/LZWA6i.Zi1LYQSW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 12:45:06.779000', '2025-10-22 12:30:06.785000', 4, NULL, NULL),
(813, '$2b$04$dStzTOZRoLgYwqXydWJc6O0kq9I26qKqRYW0g3mhGdkIxSZtQbYhq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 13:46:26.880000', '2025-10-22 13:31:26.884000', 4, NULL, NULL),
(814, '$2b$04$mPGHmaigetfw2RHWJkgFwO.j/bXimQ9oaffE6Cjm2STwqcWJKi1lW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 14:01:49.547000', '2025-10-22 13:46:49.551000', 4, NULL, NULL),
(815, '$2b$04$ULRScpovwOGXwkg7TjoBcucLzEWrZTUz9QnqFja2DzrrIwLfSQexe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 14:01:49.954000', '2025-10-22 13:46:49.954000', 4, NULL, NULL),
(816, '$2b$04$vPStSLLOpxBnN1dMeTdUM.Kz5hj.Jd5chxyrrs90L8v6eLVjFFMNK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 14:18:27.090000', '2025-10-22 14:03:27.093000', 4, NULL, NULL),
(817, '$2b$04$BkKRFrYXpjdS27FAteYFd.uw7ymveUEpVnqA8L7NlCbMP/c8uSZd.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 14:38:23.259000', '2025-10-22 14:23:23.263000', 4, NULL, NULL),
(818, '$2b$04$YzOJX19JQosuqSr6goncGOxLCOyBcqpaQ9vNYs28gHP91YFCs8VZu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-22 15:06:28.773000', '2025-10-22 14:51:28.777000', 4, NULL, NULL),
(819, '$2b$04$UC0RVjkcDrMX9622mcjuZOYKkwlTzwbhc7OlO3R4EduG2MJNKmhiC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:49:15.942000', '2025-10-23 10:34:15.946000', 4, NULL, NULL),
(820, '$2b$04$wAZg0eHr61iao7CoKT6DzeQg8KlJVQdF5QtStKTvAPxE7i/YTqFjO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:49:15.960000', '2025-10-23 10:34:15.961000', 4, NULL, NULL),
(821, '$2b$04$S3QtqxnJI40jY/zfrb/JPuqI42GrF9Upflt05vJQQB1qenTpVGv/O', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:57:50.191000', '2025-10-23 11:42:50.194000', 4, NULL, NULL),
(822, '$2b$04$HUupw7yOWnKCEgqOWycfwOltYkNwhEG15ngK7j7rAyFexVnBjnUCG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:57:50.602000', '2025-10-23 11:42:50.602000', 4, NULL, NULL),
(823, '$2b$04$VTK1zcICssbHR3qnyR8O.egk.emuO8v.O4TQ5tfY6O6oR4LZ8j2AK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 12:46:31.417000', '2025-10-23 12:31:31.419000', 4, NULL, NULL),
(824, '$2b$04$ua7QLTMdkIx9A/qCOcDR8.kAefixLZX2GorVU94iMLkiePk6KLsD2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 13:06:18.152000', '2025-10-23 12:51:18.157000', 4, NULL, NULL),
(825, '$2b$04$GstOKAYNmUWbY6nTuAzCTep7lJe0Mne5ShWXa5vla49sZqp9Vv.z2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 13:06:18.564000', '2025-10-23 12:51:18.564000', 4, NULL, NULL),
(826, '$2b$04$qAeFjuzrg.1opKV6zoccUu9FCripdGP7BSLurR7Cl6VqAL6eXUhdu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 13:26:57.154000', '2025-10-23 13:11:57.159000', 4, NULL, NULL),
(827, '$2b$04$K9bBnMk1xFzdCAXdW1UnI.UHAy7sdJksvj2EKxpXCE/YDkq6RbuPi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 13:50:11.084000', '2025-10-23 13:35:11.084000', 4, NULL, NULL),
(828, '$2b$04$8fVOMTi0pysFjy5fKMEpLe1zMwkoniJt23j4vFFIN0pCtNTZrLyWK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 13:50:11.076000', '2025-10-23 13:35:11.080000', 4, NULL, NULL),
(829, '$2b$04$2fOJn3jkkBQ9/aYxYIKsme03TcHExXjmonNAu4g3e4YlUVHDOPIt6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 14:05:55.428000', '2025-10-23 13:50:55.432000', 4, NULL, NULL),
(830, '$2b$04$NCDzY25Vee9JqvYwGntEtOLUOIFrNKVJyPXqXmrTzxh6OiKR6hFc2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 14:32:37.641000', '2025-10-23 14:17:37.644000', 4, NULL, NULL),
(831, '$2b$04$/m7LN82lLypA7sQKoilMru4JmD9gUgGqvi2BUQ8weRu3Rm53vomx2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 14:32:37.653000', '2025-10-23 14:17:37.653000', 4, NULL, NULL),
(832, '$2b$04$5uhdTnHC5Xq1xYbyOhXz2ursBiWE6xU.qKQ6Jmms9TlLY6PZ7h.Iy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 14:49:06.915000', '2025-10-23 14:34:06.915000', 4, NULL, NULL),
(833, '$2b$04$o5kwVFZRf3M5llgovy5rNOUqrl.5cNs7rfazM2GxhSIp0PIS/advq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 14:49:06.909000', '2025-10-23 14:34:06.911000', 4, NULL, NULL),
(834, '$2b$04$M2HJ.OGPSSt5Ql0DnEpJxOcTzG83GgXoGvrtUv/uMayp/R5oNEEp.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 08:25:49.479000', '2025-11-03 08:10:49.482000', 4, NULL, NULL),
(835, '$2b$04$PbrKdia7BFJwAb2vy8XXjuigDJR.Pe9MVk.M68a8z0ddfBrC8HpRy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 08:47:15.280000', '2025-11-03 08:32:15.282000', 4, NULL, NULL),
(836, '$2b$04$NE9l/K9GfgVs11682ZzC2e6O0LyHpTiePpq926BotoVsstBxOQNhu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 08:47:15.308000', '2025-11-03 08:32:15.308000', 4, NULL, NULL),
(837, '$2b$04$GtMrswVtW/te3OXp/IxNtuyJZ1ZDtszFb3AQS9..KBCsGbqejkrz2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:14:51.167000', '2025-11-03 08:59:51.168000', 4, NULL, NULL),
(838, '$2b$04$51c1KoJvoF02W9HSiQS.nu1mg5muDw6Q4AdogN2Dt6lG9FtK.zQW6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:14:51.487000', '2025-11-03 08:59:51.487000', 4, NULL, NULL),
(839, '$2b$04$zaU17kXu6GQCqrNlAh9k..riPa3EifVDZWyuC/b0KDtF.4nOuf3Qa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 09:38:55.249000', '2025-11-03 09:23:55.254000', 4, NULL, NULL),
(840, '$2b$04$q/xMhCvw2iNTUUmArJ/VjOIZms.cm84aTilLTbYLgfqBP6hEc5sCK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:02:30.695000', '2025-11-03 09:47:30.705000', 4, NULL, NULL),
(841, '$2b$04$MMoFYe07nZW2CoCKnzvHjOgmQ147JNrQalmJfZhmyEp8KBfP8ZytG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:19:47.849000', '2025-11-03 10:04:47.853000', 4, NULL, NULL),
(842, '$2b$04$bYE2fzyI8ZvV6N.QScRft.BMPlbLBhbTqujB9gx.nu4coieY6Cjgq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:43:24.843000', '2025-11-03 10:28:24.843000', 4, NULL, NULL),
(843, '$2b$04$vEqyhLgvLsTAy9VWit3j7eWS9lCr4GD88f2HXleSitEmjqkPGZYTG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 10:43:24.836000', '2025-11-03 10:28:24.839000', 4, NULL, NULL),
(844, '$2b$04$M0TSD315jQBv691IxiVHv.iPUV90LqoF2fbKUbPeeT0rjUz.GbqJ2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 11:00:26.670000', '2025-11-03 10:45:26.679000', 4, NULL, NULL),
(845, '$2b$04$3lLQzc50wBVy3RcZNtigNOQxxhK.MXabWZpb9JH8Evt5CUxonX0cy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 12:33:36.230000', '2025-11-03 12:18:36.236000', 4, NULL, NULL),
(846, '$2b$04$HHdrMoaVSt7iiKvUgbiTZeM2II/qObzvlq.0.x1Fa6jFJ8vNXyQqy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 12:33:36.630000', '2025-11-03 12:18:36.631000', 4, NULL, NULL),
(847, '$2b$04$6Ii157cWhJnUtUmuCpOEwuVIjwKSOruVR9QYzZzCQT2UnJ7P97bBi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 12:51:25.681000', '2025-11-03 12:36:25.683000', 4, NULL, NULL),
(848, '$2b$04$F2xi/t70IfSU161kg/LmkeLUAvNDa361lqTgzp4WrKdGFjXgD28Z.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 13:08:08.673000', '2025-11-03 12:53:08.675000', 4, NULL, NULL),
(849, '$2b$04$PEUNuppn.y0mGasYFFZbleWMCzYPGaRjToWlpYP4oIBb6i7OzYH5e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 13:24:35.881000', '2025-11-03 13:09:35.888000', 4, NULL, NULL),
(850, '$2b$04$K6AIMKrrCHpwe1BFnweRketgF8qJ7l29THLe66Co00rM4oZ2EPO36', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 21:24:29.038000', '2025-11-03 21:09:29.044000', 4, NULL, NULL),
(851, '$2b$04$Eb14lkyGuXX6.tHRQIAz9e0lPBR0bYsxz8bMaGDws6U9N4CqYAPPe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:40:47.112000', '2025-11-03 22:25:47.117000', 4, NULL, NULL),
(852, '$2b$04$4BRODM0GTwFLBn1S8NRV2u3zXKqmdhwiEnPVDXxeDy4x091Pk50B6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:40:48.120000', '2025-11-03 22:25:48.121000', 4, NULL, NULL),
(853, '$2b$04$Yql25fif6ui1acbItw1ggelOJ3VbcSYu6h09cuMbTvp3sdBXCouoS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:40:48.158000', '2025-11-03 22:25:48.158000', 4, NULL, NULL),
(854, '$2b$04$If.T1TCw2rvDHhgmQXN5C.rGYl4JneIOhDEQ922kVRK5fyP.5HpUC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 22:45:42.803000', '2025-11-03 22:30:42.803000', 4, NULL, NULL),
(855, '$2b$04$5.oSExmerOSdQOqMS200AOfY56MNBPr1/N35L/WFTMjRqqQ3MXYcK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 23:40:11.844000', '2025-11-03 23:25:11.845000', 4, NULL, NULL),
(856, '$2b$04$aJCjD9iDHn7w/Exc0dQqy.EJ8P1nx4RShdb2vlY8cMRW9YdIdEmVC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 23:40:11.847000', '2025-11-03 23:25:11.847000', 4, NULL, NULL),
(857, '$2b$04$RGoSTyGlJUpGi5bD46RpKuM2x.S3oHqgN9bZnCdIbIRDVNFTEaZfu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 23:40:11.848000', '2025-11-03 23:25:11.848000', 4, NULL, NULL),
(858, '$2b$04$mUVgqeSYMFal19GNBdKOS.dOLYV79BMP9wqSWb0rDzEAgWN9mW6lu', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 23:41:42.834000', '2025-11-03 23:26:42.835000', 1, NULL, NULL),
(859, '$2b$04$Uw6tv4TzUhd0P9q1P7LLReQHwS/uOjRC7hh/U3bVlsWiifPmZfoJW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-03 23:42:26.884000', '2025-11-03 23:27:26.885000', 4, NULL, NULL),
(860, '$2b$04$/pNwLWkw344A2fdCK/cJ1.N8nJETX1cnkFVu9Amkvsq/LSrCAJiGe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 13:34:20.141000', '2025-11-04 13:19:20.147000', 4, NULL, NULL),
(861, '$2b$04$r2C//RizSODSBMixmIgiSu1tZ/X50g5a2.k3Dg.a0qalqod3UVv9K', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 13:34:20.752000', '2025-11-04 13:19:20.752000', 4, NULL, NULL),
(862, '$2b$04$9J4kb40NWwaeQZOeeQpRv.vnuZ1k602WuS7Bkmg1MNatGjfa56mx2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:32:23.019000', '2025-11-04 20:17:23.025000', 4, NULL, NULL),
(863, '$2b$04$OItcsq1VfD9nAsdp1sPR6OSodpVpAul6YzHpPwYIUUi4Gn3ui6OGS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:32:23.037000', '2025-11-04 20:17:23.039000', 4, NULL, NULL),
(864, '$2b$04$v0A4EQLgyU4SynDXt7m6uOa.e18b/qcDoGRuzSWqHCYvW7V9S7NsK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:32:23.073000', '2025-11-04 20:17:23.075000', 4, NULL, NULL),
(865, '$2b$04$7l3zeHsct771ktdHv4lxOuKnJlxGY6BfjVo9SS89znsrje4G6pmoe', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:32:39.458000', '2025-11-04 20:17:39.458000', 1, NULL, NULL),
(866, '$2b$04$LVNHUgVgvz4c8lOrNHnJLOikV6aEBSbA5oLLCxTWy2F7kJkbwbHX2', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 20:47:57.146000', '2025-11-04 20:32:57.150000', 1, NULL, NULL),
(867, '$2b$04$Rda3VCQXuISqq3xRbn5xq.oQk3ERlZiqWl0NkrwIhscYfDk1f/jiW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:04:12.691000', '2025-11-04 20:49:12.697000', 1, NULL, NULL),
(868, '$2b$04$qWPEE1m13ECgFzW.MthWVOMEKA76tf/hOrr1XU1Z5XkvdIL.GiCH.', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:04:12.707000', '2025-11-04 20:49:12.707000', 1, NULL, NULL),
(869, '$2b$04$jWlsYw7fv.o7xzHHLFKkou9IyKP5tS9iIyPtobqqeLHyJQB/MxF1G', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:04:13.698000', '2025-11-04 20:49:13.698000', 1, NULL, NULL);
INSERT INTO `tokens` (`tokenId`, `token`, `password`, `userAgent`, `expires`, `created`, `userId`, `socket`, `ip`) VALUES
(870, '$2b$04$GTE8AMOODO9WvSy2Og5H.eKQ4j4XgnJQrP1jujC8Mz5nBk1AFTm6y', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:19:35.364000', '2025-11-04 21:04:35.367000', 1, NULL, NULL),
(871, '$2b$04$8cX5AXv7/fkW.hxjIbHDueI/75H6onCrFcQ12dwynO2nQeljbetI2', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:38:48.269000', '2025-11-04 21:23:48.272000', 1, NULL, NULL),
(872, '$2b$04$BrDFZBay4saJxPb9/Fy.Hu58kSsc23EAe1UsA69xCAHzhYTxVhdGa', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:38:48.277000', '2025-11-04 21:23:48.277000', 1, NULL, NULL),
(873, '$2b$04$i5SQcX7bwnMiZgZ/mTD7kOqsawO2dp1n2jadx73ds3PjUc5Njrq4G', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:56:54.789000', '2025-11-04 21:41:54.800000', 1, NULL, NULL),
(874, '$2b$04$FwBNfWJnvQUl5vxSY2asm.bOhXHNRJTPDuv7g1k3e0EFyhFvzn8s2', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 21:56:55.142000', '2025-11-04 21:41:55.142000', 1, NULL, NULL),
(875, '$2b$04$dWN4Ma/xHARZ.SyaLMrO1.n64uRF1qQDiArHTRVRt5o5jHKKlb6lW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 22:17:35.993000', '2025-11-04 22:02:35.999000', 4, NULL, NULL),
(876, '$2b$04$kSwTmO2LfiiDRVrecEynKusHn0DXytlNvSr9gZuh2N66ChRk8MWwq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 22:34:51.865000', '2025-11-04 22:19:51.868000', 4, NULL, NULL),
(877, '$2b$04$gxeL6sCsgbqrOapUEINuB.lkIh4CPREuAUnkjcyqQDIczRMQJhy12', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:39:19.146000', '2025-11-05 08:24:19.152000', 4, NULL, NULL),
(878, '$2b$04$OvAX/lM4O.M9AS6afl9kCu2PW34sSb2sDFF9sQNcioaXaVhtTZKj6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:55:00.799000', '2025-11-05 08:40:00.805000', 4, NULL, NULL),
(879, '$2b$04$lTpLc5sXShioBc.iJwQg0eqVbDsu7XnMEOxtYQXU7dy8lLGyyQ0mS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:24:12.612000', '2025-11-05 09:09:12.622000', 4, NULL, NULL),
(880, '$2b$04$bYvH49/xTjYvqe59hC9rRu1LW9tP.J1fm.uv04dY1KI/kS29mHucS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:39:45.118000', '2025-11-05 09:24:45.134000', 4, NULL, NULL),
(881, '$2b$04$p8hYmMV.//E/bwEtwla96.GU4RPVp26s.V1D3oeAqmlT96L6g4S3e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:55:25.271000', '2025-11-05 09:40:25.274000', 4, NULL, NULL),
(882, '$2b$04$.k.0RPCMztjm4EbCDtJi4eN.XgRxwoRHDJrmQmihFgL/cceaI4WCi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 10:14:53.664000', '2025-11-05 09:59:53.666000', 4, NULL, NULL),
(883, '$2b$04$N.qKIJOXlbUxYIqz/BZnpe2LwgDMg7CVkmnnUKQTCkrTBIU8lNOG2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 10:30:18.699000', '2025-11-05 10:15:18.705000', 4, NULL, NULL),
(884, '$2b$04$XuPhz4yIRt9jD0TIOomP/ORo6slCSSzqOPKsYd1TJ0JI14gCZELXO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 10:47:58.162000', '2025-11-05 10:32:58.168000', 4, NULL, NULL),
(885, '$2b$04$XjeaM5GBhZNz/nzgcHEbWupMRVJs/ysuksycoJl5/CTcwAux4BepC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 10:47:58.178000', '2025-11-05 10:32:58.178000', 4, NULL, NULL),
(886, '$2b$04$xY6Dag5ayU0ZNDKtzj/sE.QGROm2YPE7xLAmnp3CJZxAKduDt9Yae', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:04:20.577000', '2025-11-05 10:49:20.578000', 4, NULL, NULL),
(887, '$2b$04$PeGvvo9ZsKMJJ3nyk7ZkBOSjo7CRb3eq4GnhtjlaOUPi0dtDHTUV2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:45:05.219000', '2025-11-05 11:30:05.221000', 4, NULL, NULL),
(888, '$2b$04$qbztphhkIe4MyKuTv1iaBODZYpl.RDr1l.g8vB/tp5aLxDkO8EN9S', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:45:05.552000', '2025-11-05 11:30:05.553000', 4, NULL, NULL),
(889, '$2b$04$tqedv/EsUqs.tYyYR1qx8uV4DZZWID8dMSKUU4KZIGjI.vVPeEogK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 12:19:41.083000', '2025-11-05 12:04:41.104000', 4, NULL, NULL),
(890, '$2b$04$p6cRDCa6gPiHYdsTQLUFVOFE7nU6OupscB4g5egO15.KHKCiVPkKa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 12:46:15.106000', '2025-11-05 12:31:15.113000', 4, NULL, NULL),
(891, '$2b$04$.Xxf2pRziRVWQUG2Xorb2eGsnY1OjCt3yVTXER22pCRnh7o./QEAe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 12:46:15.117000', '2025-11-05 12:31:15.118000', 4, NULL, NULL),
(892, '$2b$04$IBjVMr2oPr1KpoCV3EHAS.9ucAW1XJV4DruTb1sxyalyWohCf6D.K', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:06:56.967000', '2025-11-05 13:51:56.972000', 4, NULL, NULL),
(893, '$2b$04$L4nvlmuFF.izM21ttqemhu1SByVZV0Ntig0BO.OWJ5mpkcNOV4IuG', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:24:56.552000', '2025-11-05 14:09:56.553000', 1, NULL, NULL),
(894, '$2b$04$WDVguwc.ysO8NUF/SS9xbeT4nx9W0MWPhXunHSxVk6.3b0JTKlLhu', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:41:00.888000', '2025-11-05 14:26:00.892000', 1, NULL, NULL),
(895, '$2b$04$I35tSY1qDIxfuaQc1SgneuU490mK2X4v.cvQ2GAWNv/WPvFbWhM4q', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 16:42:13.169000', '2025-11-05 16:27:13.171000', 1, NULL, NULL),
(896, '$2b$04$Jts7qA4DHrEV3v.eJQ6MB.mZ5uSiG0f/CZAroy4nw9k9M4nA6X4mK', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:02:29.697000', '2025-11-05 16:47:29.697000', 1, NULL, NULL),
(897, '$2b$04$N1r3kiNGhfRRA0gWC3SGlOpDl7Eo.YPilRmLLJaoaSNSjPr9ll9w6', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:02:29.701000', '2025-11-05 16:47:29.701000', 1, NULL, NULL),
(898, '$2b$04$Bww2MieAXGP1fByF8KlRtO9luIUNO5/I6vj3xPw5cYjNhcsGSllSK', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:58:24.306000', '2025-11-05 17:43:24.316000', 1, NULL, NULL),
(899, '$2b$04$9xcAsyIMDbpFBUNjgZvetOo5fy7pZ4P1XaMK0DtK6yKk5xLO6XWc6', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 17:58:24.326000', '2025-11-05 17:43:24.327000', 1, NULL, NULL),
(900, '$2b$04$AlZZbv/qA7C2ztDMaGb74OvInoNVZtuMgN9f43CBtwnyeSi.bUB3C', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 18:51:58.296000', '2025-11-05 18:36:58.313000', 1, NULL, NULL),
(901, '$2b$04$2UDN1t1Tw1t3JjSQ6ECFWOOyQTRfxsqraRYzmd10Fa6MLRdNd1akW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 19:13:37.903000', '2025-11-05 18:58:37.946000', 1, NULL, NULL),
(902, '$2b$04$gOwpVRLxYmNh5uYba93dUeOO/MWXowMWNLHDAeXGQbGEXMKCNBhyS', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 19:13:38.890000', '2025-11-05 18:58:38.890000', 1, NULL, NULL),
(903, '$2b$04$TXXQAK48vZxst6QqlOvmXOi8IBmBlcY6hY97N5qK.K9zWCna89liq', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 19:13:38.935000', '2025-11-05 18:58:38.935000', 1, NULL, NULL),
(904, '$2b$04$tonP7ddGQgK/9e1x6LRtG.rAaUWljTqpUh/aSv.UX.cqDBPdaOnAi', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 20:13:40.055000', '2025-11-05 19:58:40.055000', 1, NULL, NULL),
(905, '$2b$04$hdEpKNQpABqrjr4FjyjZMOre4uUn1hDV2dUlLf.VVQiadl9TB8MK2', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 20:13:40.052000', '2025-11-05 19:58:40.053000', 1, NULL, NULL),
(906, '$2b$04$T2zRw6buExEKzPSGBwGkDuXufUEGnOtIMlHCUyNIGRkd5hWjag8IW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 20:39:27.599000', '2025-11-05 20:24:27.606000', 1, NULL, NULL),
(907, '$2b$04$lP4FF0kDdEirBNwHoEQ50eflhoDUt4s3Qi7b0gg0XUJ4NHboHxfta', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 21:10:08.759000', '2025-11-05 20:55:08.768000', 1, NULL, NULL),
(908, '$2b$04$ih8jM00pTo7WpkoJonhrSOQlhjZYd9nuS6oNCgdHGfUsuxH5KCZ6W', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 22:05:55.908000', '2025-11-05 21:50:55.909000', 1, NULL, NULL),
(909, '$2b$04$gsONptjuo0qt5ryMRST/H.H2zPwphWl6kt1LUGow6x2OaBtYSJxba', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 22:23:02.981000', '2025-11-05 22:08:02.990000', 1, NULL, NULL),
(910, '$2b$04$LuzMYDYGK/a5LeAg12UlteJANZJuScPxGxRZDEsg1MjQiOGPvnTwy', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 22:58:24.549000', '2025-11-05 22:43:24.551000', 1, NULL, NULL),
(911, '$2b$04$zBFMFwSPDE1ocR4WlZzqmOgMAEJsEUMQUD3xv4fuecSKPMPC5TxqC', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 23:16:36.802000', '2025-11-05 23:01:36.807000', 1, NULL, NULL),
(912, '$2b$04$jYwZbTusgR0tyEpzg.Wzl.ieOz89jLu0LlYfV2CHg1HIq9.J2Ybqa', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 23:31:59.799000', '2025-11-05 23:16:59.801000', 1, NULL, NULL),
(913, '$2b$04$nwKdKcy/HEA2.K5BV1OXoePhkNbayrrrk/2FVTG6xoRmNcFE1ciuO', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 09:37:12.760000', '2025-11-06 09:22:12.761000', 1, NULL, NULL),
(914, '$2b$04$IJEiX10tH7z975c7VOmUv.jHLanlisoo7Q0tGdDHOD1wBidulYqpm', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 09:55:06.061000', '2025-11-06 09:40:06.075000', 1, NULL, NULL),
(915, '$2b$04$HFWhaicQI0Cwxe8WaMTrT.V.Qp.zuy4BPneCVpZ83nxRR/LZ0TzxO', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 10:23:04.984000', '2025-11-06 10:08:05.009000', 1, NULL, NULL),
(916, '$2b$04$5MlHQWA/CN5/xMNxQC0PWe2lXRuhm3YNIYvpuNE0Uk6BQ3L0sIzqK', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 10:41:27.572000', '2025-11-06 10:26:27.578000', 1, NULL, NULL),
(917, '$2b$04$jCAaWBVNQY9DDBuGlpmBo.iI1Pbc/Hs7XysuhVrnZv1eAKVlh1rJ6', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 11:58:59.818000', '2025-11-06 11:43:59.824000', 1, NULL, NULL),
(918, '$2b$04$kB2Kp9f7suSMM8boSUdE/uDfPY/wq0OVAPxWMZpHBI9PGCqsv5GLa', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 12:20:30.646000', '2025-11-06 12:05:30.652000', 1, NULL, NULL),
(919, '$2b$04$szEkTZb4AvkbNHNcAfZsf.44iaIvl0pqt7R.f4PI0ElIWpsNwk6E6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 12:24:31.954000', '2025-11-06 12:09:31.955000', 4, NULL, NULL),
(920, '$2b$04$Rd0bEtC0d8S90MrYWzH/ouQjC1y47PeXX34.hulfzmtxRJ54aFYG6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 13:16:41.161000', '2025-11-06 13:01:41.171000', 4, NULL, NULL),
(921, '$2b$04$rJ2M1G2hReo8GjclPAVVXOwryQttYNJOXIYNUH/fbnYYpqkF0LgRu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 13:42:50.031000', '2025-11-06 13:27:50.034000', 4, NULL, NULL),
(922, '$2b$04$7KTdGwbJABi4TuKX1C8AfOYa/l9e3s3pe3cnpvoRUu.se8QfDRKoe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 13:42:50.045000', '2025-11-06 13:27:50.046000', 4, NULL, NULL),
(923, '$2b$04$I0gonkgHfZAKzatrjnHvc.cGsGDwlpHx8NfbNbQB1A2Xq1r5EQD.K', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 13:42:50.072000', '2025-11-06 13:27:50.072000', 4, NULL, NULL),
(924, '$2b$04$821tWbacLbpMp10Esftqwe5ZZtkMMAevzZducZl8x5d8wQloQc39K', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 14:35:51.640000', '2025-11-06 14:20:51.648000', 4, NULL, NULL),
(925, '$2b$04$CLVcwamgPhjX59x59H8uHO6TOsSrJTZscn3AxgVoYAboEQqXTo9t6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 16:24:40.108000', '2025-11-06 16:09:40.113000', 4, NULL, NULL),
(926, '$2b$04$HZhliDX2enTHNWoQ4YyTJ.ttJWgFnNiDj9NN3Hzce9c6thoGXXpQS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 22:37:47.335000', '2025-11-06 22:22:47.339000', 4, NULL, NULL),
(927, '$2b$04$utf8dZnMtTS0uW98TKQtoecxqvsiEmU/lN8a.oPi18nhvmMgDrSyq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 22:37:47.349000', '2025-11-06 22:22:47.350000', 4, NULL, NULL),
(928, '$2b$04$ZmS66ZPd7bU5hgphuCNtkeuIup0KfTiOMLbR.5MqPiTmbaHfbjF/e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 00:09:15.667000', '2025-11-06 23:54:15.673000', 4, NULL, NULL),
(929, '$2b$04$qz5iqrx7fTxUtE6sqbs04.UzNJBvGLpJghlYj3UWcG41eHj5/NDg2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 00:25:36.402000', '2025-11-07 00:10:36.413000', 4, NULL, NULL),
(930, '$2b$04$QQeh2.CFjk17ViWJCghbOucmcbiIFQ/0pLhCFFpfU6ve3nyb03QRa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 00:47:04.076000', '2025-11-07 00:32:04.078000', 4, NULL, NULL),
(931, '$2b$04$IvngdTIJaif6QayMx9WvTekiju6txF9/5OROVVGfF59zQkB6PUyEO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 01:03:14.001000', '2025-11-07 00:48:14.003000', 4, NULL, NULL),
(932, '$2b$04$oP.nto8My7dwFiFU.Ytipe5FHuh.peCYx5FwL71yq1hWzZi5oPZk6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 08:31:04.103000', '2025-11-07 08:16:04.117000', 4, NULL, NULL),
(933, '$2b$04$Y/.soJVNCTZr1RISzNYUYO7U5XSR1HRs2F4w2uLMfXfWOW3/jRnmG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 08:46:43.867000', '2025-11-07 08:31:43.882000', 4, NULL, NULL),
(934, '$2b$04$nCmwY.OdrcSztknuwQuXr.I3svIKTQPIyKUYKgy1NYrEFSqFMPx12', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:02:29.618000', '2025-11-07 08:47:29.620000', 4, NULL, NULL),
(935, '$2b$04$ehG3mLDVisOo89YQ5QIaq.BPDG5ou3/v5Dsr2icPWEIcnzrBPWg2W', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:19:24.876000', '2025-11-07 09:04:24.884000', 4, NULL, NULL),
(936, '$2b$04$LvMeryF8TVwYnkH3FQpD3O57LYbeTlrxU2LcpHmyw3zMwOyvxAGS6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:40:33.603000', '2025-11-07 09:25:33.614000', 4, NULL, NULL),
(937, '$2b$04$RDKjy8kNR7XgS.zOkdUXM.cOBMswffmT/7DYGHbVg2C9fBLPou2x.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:40:33.640000', '2025-11-07 09:25:33.641000', 4, NULL, NULL),
(938, '$2b$04$i.MD2.7Vo1gCc1dLffW0dus6BXkcqL5k1Qtokd0PJUeP1bUmOx9Ru', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 09:58:09.055000', '2025-11-07 09:43:09.059000', 4, NULL, NULL),
(939, '$2b$04$bpAybxt/eGq.C3hqbSiRX.LKr2DjShiPZJIwudqjZ77TWdva/1uei', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 10:19:41.889000', '2025-11-07 10:04:41.893000', 4, NULL, NULL),
(940, '$2b$04$qg33UDRlb0U4VYezGkOlBO15V7B0Uw3cuX0CoaoCa5LyFBc0r5nxm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 10:40:06.615000', '2025-11-07 10:25:06.624000', 4, NULL, NULL),
(941, '$2b$04$.Bb7tTJ8AqbriGTX8HyeluIgRs08N1bDSMESohk4QVN9C57iVgc5i', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 10:55:48.819000', '2025-11-07 10:40:48.825000', 4, NULL, NULL),
(942, '$2b$04$ULPdqlE4rCzwtBYf4rRW2.SpXSV7XGNTQyA10puE2xjH5vKyoNIZO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 11:16:13.037000', '2025-11-07 11:01:13.040000', 4, NULL, NULL),
(943, '$2b$04$5FEb4hxS.VgAFP8873Qyo.oZlzPWfg3Ald7uWwxho8hIBaknyz3OO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 11:38:13.973000', '2025-11-07 11:23:13.988000', 4, NULL, NULL),
(944, '$2b$04$j7gjw8xgS.0tNwLcW0tbCeQQYTKxYOwv0xy/Gb/06Y8Y6lL7S4aEa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 17:11:05.388000', '2025-11-07 16:56:05.404000', 4, NULL, NULL),
(945, '$2b$04$4Aibg2J6YyQK0Dv14dmFoOZnEoOSoecrowPFWZUWuAUdnRUl5/WG2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 17:30:49.959000', '2025-11-07 17:15:49.967000', 4, NULL, NULL),
(946, '$2b$04$txu98flu7uNpLYIiQaRIn.nM9J60BNhzrePBRCRIF.eVTiZmUBWFS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 21:04:49.769000', '2025-11-07 20:49:49.777000', 4, NULL, NULL),
(947, '$2b$04$.NuvEgOFcjOa/3K92akyv.wkh9ZLPx8Jq4F80wLMe1zhib2TAE3Wy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-07 21:04:50.267000', '2025-11-07 20:49:50.267000', 4, NULL, NULL),
(948, '$2b$04$EtC/Ls7mJZYWw0ltZtSlruGUIalSRx30IlsVkOPW31FmoV0jSK83G', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 14:42:40.549000', '2025-11-08 14:27:40.556000', 4, NULL, NULL),
(949, '$2b$04$zNtNkovxA3lpIMWFh77q0eHPp5Y.RuPq.k3L6MXtJ6sR.Gq5pFHby', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 17:15:00.475000', '2025-11-08 17:00:00.476000', 4, NULL, NULL),
(950, '$2b$04$1cF20CL3tdovz6s4N9eS0OmE3nJkIGzCThZ.Eekkw4FvUiHpdgjju', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 17:15:00.469000', '2025-11-08 17:00:00.472000', 4, NULL, NULL),
(951, '$2b$04$HGYJrkMWcuxXkS7hny0SdemoDsb.Gj.qyd6WORuwZvz0Is/ogwZLC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 18:40:05.054000', '2025-11-08 18:25:05.076000', 4, NULL, NULL),
(952, '$2b$04$muX7ZETHNmDnuIvdIqBAbexAuDogfwm0uVKzdggfMz/wO7Lq63c0q', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 19:17:17.013000', '2025-11-08 19:02:17.017000', 4, NULL, NULL),
(953, '$2b$04$h6ooUiEA.xtOpDQlv2BJ8.2Hx2pjmQ6EZbIdXAMjzkffYK4kiEtau', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 19:17:17.023000', '2025-11-08 19:02:17.024000', 4, NULL, NULL),
(954, '$2b$04$fzEZ8JSDH/IfMPLQxOtZ3eFZaD1Lm21oFQkTsGAasanG4kYk6VcO6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 19:45:37.897000', '2025-11-08 19:30:37.899000', 4, NULL, NULL),
(955, '$2b$04$fr9WNUkY4bjAh9rxEEB/PepFRS/RW8Y2Zdw9UwCFbp3tyfy3Q.P6m', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 20:18:40.133000', '2025-11-08 20:03:40.138000', 4, NULL, NULL),
(956, '$2b$04$b2pHL.HO7KWBOEdqWoLaM.VKlgYq9Aeq0GN7h6gfDT.FPD8Mv5FGm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 21:22:11.720000', '2025-11-08 21:07:11.728000', 4, NULL, NULL),
(957, '$2b$04$WdtENxQrnZcYuQhhAiAgHOQOfcHVMw1o64tJ2qutvXXqt4e3lVGWy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 21:38:17.059000', '2025-11-08 21:23:17.079000', 4, NULL, NULL),
(958, '$2b$04$VLjq3sKgYq1yDGgQFCiQmO0Yjl9.MJ7CnYzzUByPJFb2O30Aan.Qu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 22:14:27.671000', '2025-11-08 21:59:27.681000', 4, NULL, NULL),
(959, '$2b$04$.0wyk6bhaG3XNO3sAAZUCu0tB.cGVIG3xmRLXePjqxtX5l1VHS.Gm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 22:30:52.619000', '2025-11-08 22:15:52.629000', 4, NULL, NULL),
(960, '$2b$04$Jb9G14XfYQWOfm/Rvd00M.c/I0BMUfbMAIjONUftkL0CFVZpvIpoe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 22:46:03.516000', '2025-11-08 22:31:03.519000', 4, NULL, NULL),
(961, '$2b$04$xQhhBch3HJpdZz73OucZV.NXUie0qd2et4OtfeMIT81NL2xjHo1wO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 23:24:02.065000', '2025-11-08 23:09:02.076000', 4, NULL, NULL),
(962, '$2b$04$A78.Tm4gpPGYeCSD5jhXe.oXzw40eAzmibryZ/j/OuFvJm9qBFCnS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 23:40:06.841000', '2025-11-08 23:25:06.858000', 4, NULL, NULL),
(963, '$2b$04$jM.c6KCtXIrgaafP8eu/WuwTcvR/27gBJUYIFtk5q67WrJp4Q64tG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 13:01:23.045000', '2025-11-09 12:46:23.047000', 4, NULL, NULL),
(964, '$2b$04$yUw4igl6/JXwywnFjDarAu5yc4OSX/ZPldjLAn9UB/Iurbqz//792', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 13:30:32.773000', '2025-11-09 13:15:32.786000', 4, NULL, NULL),
(965, '$2b$04$RG6HlB6jk7V0Ji//Jwcjw.3Jk0MiXigKqvsr0iCvv5raWu6LIH.Cq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 13:58:13.738000', '2025-11-09 13:43:13.744000', 4, NULL, NULL),
(966, '$2b$04$w6FP.hM5E3haA76nMhnP3OscZdcvp/o.0vOOYHc.oQELT8nXuPTWe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 14:14:09.400000', '2025-11-09 13:59:09.406000', 4, NULL, NULL),
(967, '$2b$04$T7arNa0vlhSjLLAdMSredeyuzQ7F.CWdTCDH8zEKWMF7wLXvzfSQ6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 18:24:38.659000', '2025-11-09 18:09:38.664000', 4, NULL, NULL),
(968, '$2b$04$t9ahR9T4vpaxUtAey7ryy.jOU6flR3nROmmmXp8Xh2BEyxZ7wqcJu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 19:30:34.089000', '2025-11-09 19:15:34.094000', 4, NULL, NULL),
(969, '$2b$04$MbJhKetF26lEosbOjOp8dO6CPCJ8Mq87Ie6y/H2X6q0CExkW97U7e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 19:53:09.871000', '2025-11-09 19:38:09.887000', 4, NULL, NULL),
(970, '$2b$04$QwNAhfqoTvrPNUP1OmDov.Mn16DPw0tjn8R1NzqWjNvEpuY2EV6D.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 20:10:02.944000', '2025-11-09 19:55:02.956000', 4, NULL, NULL),
(971, '$2b$04$ZQO4KLLUrchQ1GUu9qJXmeTx3ZQZf4ri/vAIRU03zpukFwz5EklkG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 21:42:00.226000', '2025-11-09 21:27:00.238000', 4, NULL, NULL),
(972, '$2b$04$JvniyeO3OJJuqnPYgjMxw.VHdptDiwZydtpU4ouyhSRz3NtqPJ8iW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 21:58:40.301000', '2025-11-09 21:43:40.312000', 4, NULL, NULL),
(973, '$2b$04$DGUCi3xLf5mwoBVOr/tqc.blsCG4TyKLpKTC65oZOzlErfle9.TSy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:37:17.450000', '2025-11-09 22:22:17.453000', 4, NULL, NULL),
(974, '$2b$04$bQcMbp5rX5G7PxA9HAm9geM3xmtN3QjCveYkyODkVlNXkRE53FCnK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 22:53:27.301000', '2025-11-09 22:38:27.323000', 4, NULL, NULL),
(975, '$2b$04$ZFleJjkFdg630DR7aRZfKer0NrQVMojIDWXZO5sJcBlN/OXUM.4B6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 23:10:53.961000', '2025-11-09 22:55:53.967000', 4, NULL, NULL),
(976, '$2b$04$B4OyfwXUOqI3LgO0a9aC3ez.ABp0cler.pr4DXlt3f3ubytSq6EW.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 23:29:20.014000', '2025-11-09 23:14:20.016000', 4, NULL, NULL),
(977, '$2b$04$eqwM3MUyl8qp2Y8xj07f6OltC1oUTwWmTgFsekZlBobX6COKHLRBS', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 23:38:53.332000', '2025-11-09 23:23:53.332000', 1, NULL, NULL),
(978, '$2b$04$fjM1p2oORzU411AeVgm1lu9n1Ni9yhvkwbG5IS/69T4Q89Rl8hZwu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 23:40:32.558000', '2025-11-09 23:25:32.560000', 4, NULL, NULL),
(979, '$2b$04$VLvEaDhEAN9Y3mcuytw3t.ub4RR/FfH9WZpv/HyR4veXa0g1Igvgi', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-09 23:40:49.401000', '2025-11-09 23:25:49.401000', 1, NULL, NULL),
(980, '$2b$04$ZiomUmHJ54T0Y306fHq6gOuPna1JSBwmO/YI54UZqy3GD7CZzudka', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:33:42.507000', '2025-11-10 08:18:42.516000', 1, NULL, NULL),
(981, '$2b$04$u/mU8A97YSt.dyuuvYAqQeDGDvedWkdqjqZLxIk8I9SA/oMZQvsGi', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 08:53:10.621000', '2025-11-10 08:38:10.637000', 1, NULL, NULL),
(982, '$2b$04$2gZA7D/htxsiFX4Atjig9eGCWpgSH9V3JG2wjYWH/.yKyLyTfTHqW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:09:19.983000', '2025-11-10 08:54:19.988000', 1, NULL, NULL),
(983, '$2b$04$ngfNhKUKG/NZigyjJ6BhwuafUmCLcQGfoDZvRMyxu2SGrEGaOxLSO', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:27:38.280000', '2025-11-10 09:12:38.289000', 1, NULL, NULL),
(984, '$2b$04$fG3m4mgl8wI8Rabdj1Yan.btZbBgvN5CWsO4iwLlg.QZ8dZwl9MVK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:33:58.462000', '2025-11-10 09:18:58.468000', 4, NULL, NULL),
(985, '$2b$04$5.L138T3EX1x2XVod8vxXeZ6XAwFDsT5VP4N63MwDlvzDnYn5DZ46', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:34:17.442000', '2025-11-10 09:19:17.443000', 1, NULL, NULL),
(986, '$2b$04$fd7rm/klLFaEdKtqChF5tuejVKRsd3c3GxOhfAwfX3j/U33PosixS', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 11:41:48.879000', '2025-11-10 11:26:48.883000', 1, NULL, NULL),
(987, '$2b$04$jmxtH7i1OnZZXUujhpXYJucbdPbePKqZWTx2x2tWI/Wg0i99o74oe', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:04:55.066000', '2025-11-10 11:49:55.068000', 1, NULL, NULL),
(988, '$2b$04$Iw2JSPpOJoBksHw1DizedutnmJTUR8ulATqUkUYe0QMo1kiLPrmqy', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:24:43.826000', '2025-11-10 12:09:43.828000', 1, NULL, NULL),
(989, '$2b$04$vDffHSkafpK1LCXnzRp1WeUr2NXT2uSESkZ4vFPbvqJbx3FkSCH0y', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:24:43.833000', '2025-11-10 12:09:43.833000', 1, NULL, NULL),
(990, '$2b$04$wvfE4V5XFzvBKYLwL3eogu/MAJ2bJ7slnxlaIkQh9JsL6w4/8WTmu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:29:08.660000', '2025-11-10 12:14:08.662000', 4, NULL, NULL),
(991, '$2b$04$pqKxRTRb2EBk3R6Ew1ABNu909NG4DEIuCOT/ag2BRWktoHQyrvUqO', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:35:47.276000', '2025-11-10 12:20:47.277000', 1, NULL, NULL),
(992, '$2b$04$UeP1uFz0HuX0/sWditWt8.cD.9U2l/VFyB9DB85CM3QCHJHCPR9Q2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:36:17.221000', '2025-11-10 12:21:17.222000', 4, NULL, NULL),
(993, '$2b$04$zhdaSM4tfBs153rLyw24CeNX11OOOZo9IGsx2Wn09CX90PTMZLWbC', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:36:37.485000', '2025-11-10 12:21:37.485000', 1, NULL, NULL),
(994, '$2b$04$yfD97BTw1bSmh/025t1bB.AtHA.C/e8rr7hT2QpAlU/H5Vk668afK', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 12:54:07.653000', '2025-11-10 12:39:07.675000', 1, NULL, NULL),
(995, '$2b$04$dU4K0KFRtCLctNXyrveFPOOmnn5snkaIBSMG1b7asAPXOo6RId4HK', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 22:12:01.192000', '2025-11-10 21:57:01.209000', 1, NULL, NULL),
(996, '$2b$04$2gI.6CG2bVZ3TOk1gH9Kf.8Sf8Fh.XjNDyRPWA61a5t5A39UtQ8qm', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:18:23.810000', '2025-11-11 08:03:23.909000', 1, NULL, NULL),
(997, '$2b$04$uL968ekmi1uvguXcrvc9HedFhUX20TWe/LtyOjVfYMEmHE6PiLa4G', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 08:38:19.969000', '2025-11-11 08:23:19.972000', 1, NULL, NULL),
(998, '$2b$04$N9XsFzwQoGinSVFJFqrou.rfAdFBcwn7onoHdkK3XtpG42hGy7WRW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:13:28.309000', '2025-11-11 13:58:28.315000', 1, NULL, NULL),
(999, '$2b$04$XsBKk.wgjXDBn5.TgHTcSeAPFBeExjMrb5P.LEBv5WvzHFSkvCh5u', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 14:30:31.373000', '2025-11-11 14:15:31.377000', 1, NULL, NULL),
(1000, '$2b$04$9O.mYiFt5LUmaNNyhDvro.WZ50eXUKpVDu.YHF36YE44q8P.Np39y', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 11:17:25.214000', '2025-11-12 11:02:25.218000', 1, NULL, NULL),
(1001, '$2b$04$K19W/jCGpAZbxqYoTMqMH.Q5vjTN2fkmgcrtPzxOfewpgdgHfsGza', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 11:17:25.224000', '2025-11-12 11:02:25.224000', 1, NULL, NULL),
(1002, '$2b$04$rwlOrmEmG8f8XZI0kL.jg./cutdOqBQ03J.CDNWcEuZR6LdseHUv.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 13:28:36.838000', '2025-11-12 13:13:36.844000', 4, NULL, NULL),
(1003, '$2b$04$QgwvrlL1giD5afpueCCDr.LzrwHHewlGt3PPiVyzIY1/EnIEB.X.y', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 14:07:33.091000', '2025-11-12 13:52:33.093000', 4, NULL, NULL),
(1004, '$2b$04$/3naIjF5oPM/O1G2UuAckuqZmIkBaZ9xY49c8NTqgthvHuhK6lj2u', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:19:59.506000', '2025-11-12 22:04:59.517000', 4, NULL, NULL),
(1005, '$2b$04$kN.8u0VJqHAxptj16RDRv.mvxbj248Va9MsxUx2UjkDR1z8hfgQKK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:39:31.444000', '2025-11-12 22:24:31.457000', 4, NULL, NULL),
(1006, '$2b$04$zCtGppJhGO/lQN2hVvWj4er3cDi4dCk6Izz6hIjRSIYOS8eeBv9wK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 22:58:27.782000', '2025-11-12 22:43:27.798000', 4, NULL, NULL),
(1007, '$2b$04$4VorBDU.wVd1m0m8148Ebu22ew0ecHJGC2WrznBJj2z4rVi95Kwj.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:37:07.934000', '2025-11-12 23:22:07.964000', 4, NULL, NULL),
(1008, '$2b$04$ujQ..i18wD3A61JyOgxD1.qiXyAHbUyfK5ZibJYBqeXyW2shlQUHe', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:40:41.260000', '2025-11-12 23:25:41.263000', 1, NULL, NULL),
(1009, '$2b$04$OqK.M9tE.HjEgUDavH/bBOgWU5bW5kr6RGiKvyqQT54p3xAvu5rsq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 23:41:38.910000', '2025-11-12 23:26:38.911000', 4, NULL, NULL),
(1010, '$2b$04$4pEiOnl.ENqDSfDJhHDtROoldYNBKzdu69aEEWkVVnOgfABxbg.P6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:02:59.449000', '2025-11-12 23:47:59.453000', 4, NULL, NULL),
(1011, '$2b$04$M86miTrlLC9H9UqzKDS3x.e5YsjaaQsG0FhAgN.SOawyJxNV.LJ4G', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:02:59.461000', '2025-11-12 23:47:59.461000', 4, NULL, NULL),
(1012, '$2b$04$D4FdDff9MlKlAHmOuzKYUuNZxFUT88hGlm7vy4./iTsYOHRdmYuma', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:21:10.238000', '2025-11-13 00:06:10.265000', 4, NULL, NULL),
(1013, '$2b$04$Th3KCe6KfYEmbbvSVNWuf.FMUhIHe1k1prPuKjuSw6p2iE8xnm6Te', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 00:38:53.072000', '2025-11-13 00:23:53.093000', 4, NULL, NULL),
(1014, '$2b$04$mWuCpBvCC.7JUBf4wMFYPeCUFek1d6VcUYk4NEJZhjBbsGjllaKJO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:07:52.475000', '2025-11-13 00:52:52.486000', 4, NULL, NULL),
(1015, '$2b$04$IKqK5UXh2DvDG2wTYJxf..e639UlBRbRGVhAGx.mmcEc0q5/rI89q', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 01:24:13.334000', '2025-11-13 01:09:13.344000', 4, NULL, NULL),
(1016, '$2b$04$PnFzEO.FC2O2BzI8T9WO8.1GsnlHEzOmO0k4gxLP9/y7iaHkiT3xa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:22:27.964000', '2025-11-13 08:07:27.969000', 4, NULL, NULL),
(1017, '$2b$04$4hk7gAvYR2RK01iSyJpe8uElPp7nlxNq3T90VfJh7i5qnvqhBV2Dm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:38:16.082000', '2025-11-13 08:23:16.090000', 4, NULL, NULL),
(1018, '$2b$04$5PUkqBkq2RbvRnbUsVJScu89u.3GCk6PdbccVwt.su1FVqEVl5pyi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:57:21.464000', '2025-11-13 08:42:21.471000', 4, NULL, NULL),
(1019, '$2b$04$ZEPJEa4yaBGOOQJIxfUCcOnJHRHpYw.KuBI5JlB2rd1LMMZHFnoMa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 08:57:21.478000', '2025-11-13 08:42:21.478000', 4, NULL, NULL),
(1020, '$2b$04$z2KqD/F1/JiWlyffHmeCIudKxUtOdRaoUDsAN7Zm7vETNQq2GhZwe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:34:30.526000', '2025-11-13 09:19:30.531000', 4, NULL, NULL),
(1021, '$2b$04$e7dpCklwOAQ88zFNOymQLOPtK.W1yIjdq.aJ5Qw0rzj2yh9fRi3Aa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 09:50:16.820000', '2025-11-13 09:35:16.823000', 4, NULL, NULL),
(1022, '$2b$04$FLf.gwx6UebjR.MKwIckY.P.mZIiFXtnkcIKcYfeZki658jJoWYzm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:05:22.433000', '2025-11-13 09:50:22.444000', 4, NULL, NULL),
(1023, '$2b$04$Mu4S1Ihj2RcWnmmX8x9NeutVa24ytPiyeNB5XrGgZUJOb7uPDcn6m', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:23:02.436000', '2025-11-13 10:08:02.439000', 4, NULL, NULL),
(1024, '$2b$04$G1A3kiIBCeyQbGqZjVp5Te9f285PNkkF7f2YkVThthAp72k5QNLcO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:39:02.978000', '2025-11-13 10:24:02.979000', 4, NULL, NULL),
(1025, '$2b$04$5FPa8lXku9ArpuhJ/TITeOyWRjTtDTIrZ0ApySgunxe6m8SJqdiUG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:39:02.945000', '2025-11-13 10:24:02.962000', 4, NULL, NULL),
(1026, '$2b$04$XuKfggiOPz3axx4hUxweduYJFlRQm0H//qpArPY1qoYwD1xzSyLai', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 10:57:59.889000', '2025-11-13 10:42:59.895000', 4, NULL, NULL),
(1027, '$2b$04$hzGvVVfeEf/s5A7hGMo8aeVKwXL9Ee8lEG3RRT1DIag6c2HeFXTfK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 11:55:55.167000', '2025-11-13 11:40:55.174000', 4, NULL, NULL),
(1028, '$2b$04$xYBhKURlWAOR8zdKDLySx.n1Vq2Sr4YDN5K2Dh9QPJ.gOiQfA9wwK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 12:15:03.263000', '2025-11-13 12:00:03.287000', 4, NULL, NULL),
(1029, '$2b$04$ZiCA5qbT404gZa6yrHqbhu8eLIREuJ2b7rs0Nsi5w.kKZ7jcdBvOa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 12:35:53.611000', '2025-11-13 12:20:53.626000', 4, NULL, NULL),
(1030, '$2b$04$4af7XOSukRHKAGHRLtUGzeS6G105RSNOacOzzUL1cz6RGNJ1WcpRK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 12:58:36.628000', '2025-11-13 12:43:36.635000', 4, NULL, NULL),
(1031, '$2b$04$Kv6feV9BDZJpTqdXpGApiecsHBd/n5ZYMN13jAueuBRDSzU1Nz1.C', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 14:03:50.930000', '2025-11-13 13:48:50.943000', 4, NULL, NULL),
(1032, '$2b$04$u74A8NBbVmAPrIN2PkXw2OhBBtU9BVHESjiNc4GImn4gX1xeWESK6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 14:19:21.217000', '2025-11-13 14:04:21.219000', 4, NULL, NULL),
(1033, '$2b$04$UsWBLv8xSyQecC5XrWFNqeeP7rvy89CxL1rjjF4XRJoCqRWd2DIpa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 14:19:21.227000', '2025-11-13 14:04:21.228000', 4, NULL, NULL),
(1034, '$2b$04$TBMpjrpTTee7WNI2DyrupuOAKQG5.AyuZIkGn5ZUbdEM0nKJu1ffu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 14:35:43.158000', '2025-11-13 14:20:43.163000', 4, NULL, NULL),
(1035, '$2b$04$dI8kUD7Yml/SyC93bYLC1uYcNTjkDZN1GBTG4zOSlsE0NnYtXErke', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 15:04:15.012000', '2025-11-13 14:49:15.031000', 4, NULL, NULL),
(1036, '$2b$04$IrjZU9SvYncVZkyFdf8RRO4HrA2linzn2V6vwkhLHVmP5tQkjSG3O', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 17:36:24.316000', '2025-11-13 17:21:24.320000', 4, NULL, NULL),
(1037, '$2b$04$AlVyd9eY6TxoM1Hhm/ZM7.Vm5751QbzPr7j25Pti4pCw6nlp7ydV6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 17:52:28.778000', '2025-11-13 17:37:28.788000', 4, NULL, NULL),
(1038, '$2b$04$z4yZ.d9KgOjkIUQ.uUWho.Rgh10nT15c/cSHv5.3Sp6OqcIXwXQ6m', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 18:21:20.761000', '2025-11-13 18:06:20.766000', 4, NULL, NULL),
(1039, '$2b$04$sdcPSZOf8u8es1imgglX3exjOGmTlJVkipOKg4ALDBXGma.dqqUAi', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 18:25:56.372000', '2025-11-13 18:10:56.373000', 1, NULL, NULL),
(1040, '$2b$04$K/kUZR5DpOx7v.C.dR3lTemlzHvB9DEJzrxJrX5KsKZ3x9uYs2h7e', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 05:18:21.489000', '2025-11-14 05:03:21.492000', 1, NULL, NULL),
(1041, '$2b$04$E/DuH2hNjUrCYKtPNdbHZeZE3OEYcGYxfKegpO4TpeSlYbfFGGEKm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 05:24:01.497000', '2025-11-14 05:09:01.497000', 4, NULL, NULL),
(1042, '$2b$04$ZZoKh1W6DrRet5mZONfRh.H5jEPBl.8TpNSDBCTdXank4rcvlXyqC', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 23:59:31.132000', '2025-11-15 23:44:31.148000', 4, NULL, NULL),
(1043, '$2b$04$USiBtOMM8kXHta/M28d3wuQbZ4otgdSPnbP3CuMMcDFUYHlmh7ILe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 00:27:02.778000', '2025-11-16 00:12:02.782000', 4, NULL, NULL),
(1044, '$2b$04$yEYiPkG0c1t5y./MENhdveV5yz2a1gdl/PtbCzkOnEoTJP2M0U2jG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-18 11:33:26.277000', '2025-11-18 11:18:26.284000', 4, NULL, NULL),
(1045, '$2b$04$HxaslwyqOaW3NUCYSoBkqeRaj8mI.GFuXKUaDubkjV8yu8cVVF6qO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 09:59:40.331000', '2025-11-19 09:44:40.335000', 4, NULL, NULL),
(1046, '$2b$04$uSU/4xRVpfmUwf3bbuA2OOhR8qRu4qNZ0T8XhAFMmaHG9/FUm.6Gi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 10:15:22.840000', '2025-11-19 10:00:22.846000', 4, NULL, NULL),
(1047, '$2b$04$N7WEkOdVcaFJKq2RiD0rb.0i75kvFm7xQ8Qbag/k/RM5oDyrWEYQq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 10:33:41.545000', '2025-11-19 10:18:41.555000', 4, NULL, NULL),
(1048, '$2b$04$ITPaXEAUpoktdomBucRvZuWoVzQmpDKyMngtcASJTuoDTPYHAP7B.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 10:49:30.655000', '2025-11-19 10:34:30.662000', 4, NULL, NULL),
(1049, '$2b$04$K8/j7AJdUfrno4k5ZbpuTuHABuzOH3a/oXM/gxPAAnU8yOmWrOODe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 11:47:12.822000', '2025-11-19 11:32:12.827000', 4, NULL, NULL),
(1050, '$2b$04$TUZsz9wozVNT.kUzyX9gZOJNs0BK7f4XIUQQ1LPWbUslyfjFwFpsq', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 12:12:54.445000', '2025-11-19 11:57:54.450000', 4, NULL, NULL),
(1051, '$2b$04$746yEcyE/3Bb0qsoRo5vYOv/HdNmzzT.hl69QQXPS6HlSXAcHGG7.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 12:29:08.638000', '2025-11-19 12:14:08.649000', 4, NULL, NULL),
(1052, '$2b$04$fCPeiXezjBXgFWAIPli4Duxwd7m9MPVrl37orNRGyErYUAMHn2ih6', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 14:02:32.388000', '2025-11-19 13:47:32.416000', 4, NULL, NULL),
(1053, '$2b$04$NHaLkksWx2VVJeFliVu71eozNS21OAXLSOwyXkWcdDR2PtFxY0v8u', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 14:10:39.316000', '2025-11-19 13:55:39.326000', 4, NULL, NULL),
(1054, '$2b$04$hsVkeuSHCWum4A/C/WkxyeO6F3SUJd6z/et5sFRgQRF/cOJf83d.S', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-19 14:50:28.164000', '2025-11-19 14:35:28.175000', 4, NULL, NULL),
(1055, '$2b$04$ALrqy57zfFO9OIU60zCTEOaGJgw0cKo8eN5FL3QtVtSL93IvzrOnG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 09:44:45.127000', '2025-11-20 09:29:45.158000', 4, NULL, NULL),
(1056, '$2b$04$4G.NnUxTWT768R/IPs61e.6E1GKimgvVSxep3BDwwy6RkxloBUeca', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 10:53:03.715000', '2025-11-20 10:38:03.724000', 4, NULL, NULL),
(1057, '$2b$04$QGj2z7NggXgJPzefcrs/7eLxphdPYPGOO1Q/sVzYyj.JFNQwGwtqG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 11:56:08.252000', '2025-11-20 11:41:08.284000', 4, NULL, NULL),
(1058, '$2b$04$dLi7iMrwpCfRQRWTGLgUze16fJPblXN0/BM8pUxq0cmcFaMWAoJ.y', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 11:56:10.956000', '2025-11-20 11:41:10.957000', 4, NULL, NULL);
INSERT INTO `tokens` (`tokenId`, `token`, `password`, `userAgent`, `expires`, `created`, `userId`, `socket`, `ip`) VALUES
(1059, '$2b$04$UTEB25xsQG9t.Wo.wzOMh.4V4mViUiqwbEFMatAJUqXgmq05Qy4Yy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 12:12:14.997000', '2025-11-20 11:57:15.002000', 4, NULL, NULL),
(1060, '$2b$04$VNuNHDnRuJ1u7u35DQTKDOn4s9aZ7aCzmM9zQvSBPTsurz4P4WVGa', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 12:29:10.832000', '2025-11-20 12:14:10.836000', 4, NULL, NULL),
(1061, '$2b$04$pBklT4.BQL2XI49zslzzy.cmYNqQVnx7.UXzuC4rgea6/a38CXCAK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 13:10:03.004000', '2025-11-20 12:55:03.007000', 4, NULL, NULL),
(1062, '$2b$04$Fwf0O2ON3VUa7JWJsRZFtOWxLe0LPLrk4be19NOo5CxZ.hRgQaIQu', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 13:27:24.840000', '2025-11-20 13:12:24.849000', 4, NULL, NULL),
(1063, '$2b$04$2wOjOVA3LdXiQRIelkZZEuRZJRsZLAzFbtL7WPdD/o8Jv5yKf8z7W', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 14:14:26.010000', '2025-11-20 13:59:26.015000', 4, NULL, NULL),
(1064, '$2b$04$At9XDO99Am6pDRLbMlFAUedKmt3/ZDxzMOzpf3zr0Gqn8YFV3yh3W', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 14:44:47.385000', '2025-11-20 14:29:47.403000', 4, NULL, NULL),
(1065, '$2b$04$BXjygfUIdbq2.6E6jVISIuo6mOLfWwfnCA5sQWHDPGxTpFip3HSpO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 21:41:19.482000', '2025-11-20 21:26:19.482000', 4, NULL, NULL),
(1066, '$2b$04$Jy7eDzjzy92vhxwB69/ZZOIRzwyuJGh3GN7EnNiCebIQsTmwbFN2e', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 22:00:02.747000', '2025-11-20 21:45:02.748000', 4, NULL, NULL),
(1067, '$2b$04$5amGObT1mmTvloB2sDekHeVzGRrXfYNuiECNXau9rVnTlflzzpRd.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 23:02:38.944000', '2025-11-20 22:47:38.945000', 4, NULL, NULL),
(1068, '$2b$04$MRX7mnVp7U9mPBL5WVoOnuzRDy7wuex5zgm8MnmeOC1buXNjprTBi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 23:26:48.045000', '2025-11-20 23:11:48.045000', 4, NULL, NULL),
(1069, '$2b$04$lX.XafeQss63mVUMqhUC9ue3jqHZ6miFDm1WM1k0ZiNCOp5pJvIbS', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-20 23:43:20.108000', '2025-11-20 23:28:20.109000', 4, NULL, NULL),
(1070, '$2b$04$sBeXRwUHXBg3uL6QP1zIruVPHMh1dMOZFbq/XMcpiXQm1LsSyM6F.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 00:00:25.834000', '2025-11-20 23:45:25.834000', 4, NULL, NULL),
(1071, '$2b$04$ICkVHVZ3P2sF.LntXXUzd.J7xitmOukmU2YpX0/DqoadFnWjyYURy', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 00:17:06.045000', '2025-11-21 00:02:06.046000', 4, NULL, NULL),
(1072, '$2b$04$hSuQek4r5mXIZ/WoTDyvfOmMG10PEkJ2/ljjFC3jb7y9acWjRuzF2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 00:53:31.505000', '2025-11-21 00:38:31.505000', 4, NULL, NULL),
(1073, '$2b$04$N1hSigCIt0SjP4iJQSiWpOnLmf92.whOaoGO3C0MrIFiQN4Om8ZKi', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 20:19:27.073000', '2025-11-21 20:04:27.074000', 4, NULL, NULL),
(1074, '$2b$04$pHn2Yq5mCU8wVj0ef7WWB.SRwq9K1n7ioFQDExytFQD1kyfU5BkDm', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 21:31:41.284000', '2025-11-21 21:16:41.284000', 4, NULL, NULL),
(1075, '$2b$04$wMtMCLhSf4wzSnc3W/YE0.0.CzNzwsQnU1Bo5xei.ZR9Lp1sOFx.u', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:05:10.104000', '2025-11-21 21:50:10.105000', 4, NULL, NULL),
(1076, '$2b$04$CJ3JbhnWX/eYkbJ78fzeT.YwWDH.MOD8InA7MWobK9drXgcMjUVOW', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:41:06.930000', '2025-11-21 22:26:06.930000', 4, NULL, NULL),
(1077, '$2b$04$KZuPvYg5bJ/z8qewDKwPdeS54Otd/Mj3ITEgN1KWLKyGaJYWalxPW', 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:43:25.489000', '2025-11-21 22:28:25.489000', 1, NULL, NULL),
(1078, '$2b$04$q1u/c2R3diQ1B7pY0rUpseg9GTY5iucNubalmnAEbe5PiIaiVv5PG', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 22:49:07.346000', '2025-11-21 22:34:07.346000', 4, NULL, NULL),
(1079, '$2b$04$9vT.O1h7YGCJpdjlNsP7NeJ46cMYbV.LCy9CE2gqDv3SarVf5idKO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 23:04:11.674000', '2025-11-21 22:49:11.674000', 4, NULL, NULL),
(1080, '$2b$04$6re8.X.QdgZZHeqLnSNDSOZN7cUi4RdN5jJ0S.lmYmlevGORss21u', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 23:29:08.828000', '2025-11-21 23:14:08.828000', 4, NULL, NULL),
(1081, '$2b$04$MQbqQgdiI12HJjgBOliaBOcUfCz8Sch6d1OGbmfSv7de.bgsLmA6i', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-21 23:47:57.486000', '2025-11-21 23:32:57.487000', 4, NULL, NULL),
(1082, '$2b$04$RvmS2xew6nut2FELKLh6lu.qpi5lVfgwBeKAPH.M.LJLxhU3kVVnK', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 00:13:29.192000', '2025-11-21 23:58:29.192000', 4, NULL, NULL),
(1083, '$2b$04$TJ1vOL7vH3OHZkSB4hW0XOiTtV4a6FMmxRDxNNkVIMbGhnV23M/WO', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 00:41:18.273000', '2025-11-22 00:26:18.273000', 4, NULL, NULL),
(1084, '$2b$04$5NThXeENDArUG5TqCkM46OmNKd8BGu5NjRq248BL8K/f1LJvwOS6m', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 01:09:08.513000', '2025-11-22 00:54:08.513000', 4, NULL, NULL),
(1085, '$2b$04$RZy0JGdAY9epLsA5lvTbP.q2xZ1z7Ut0a2Mr.kkUWtJm/1y.Zuh9W', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 01:28:07.486000', '2025-11-22 01:13:07.486000', 4, NULL, NULL),
(1086, '$2b$04$vr22KtAKE5Hmt9q/HL6hxutLYq/Ec12BxaonBEe.wFVeJYoCAmLX.', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:31:51.779000', '2025-11-22 11:16:51.783000', 4, NULL, NULL),
(1087, '$2b$04$CIc2/iXAfc5uCnpvNXEV/ueLzGZdhBphdFzuyGw3YDezXJ1qzkEau', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 11:57:34.439000', '2025-11-22 11:42:34.441000', 4, NULL, NULL),
(1088, '$2b$04$rIj4DCofcY8TkZo0VaEkRea7/LqR1iKvkKAYXNS.sQ4I4InnGurAe', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 12:36:58.698000', '2025-11-22 12:21:58.698000', 4, NULL, NULL),
(1089, '$2b$04$/mZ86O6MebzfEb9eUlH5jOZUvLg7sSwW.4QiY2j9ttl2X47dVJQU2', 13, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 12:36:58.699000', '2025-11-22 12:21:58.699000', 4, NULL, NULL),
(1090, '$2b$04$FByVf9hzVM/6xR1yWI9hn.YUvS9JBenq9E2PdZNSSY2BmeuzT4sue', 15, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 12:56:20.340000', '2025-11-22 12:41:20.340000', 4, NULL, NULL),
(1091, '$2b$04$wxNsGzIXYrqW8jCI9aTkfe4QlKrOax04DT7.px9F7v5/JlvHeLzR2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 13:12:11.485000', '2025-11-22 12:57:11.485000', 4, NULL, NULL),
(1092, '$2b$04$SesmqdSrFhDFloIocI49cuNaDX6O72lyQ5/fVZYgmXoAfCCRsv6Q.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 13:28:50.458000', '2025-11-22 13:13:50.458000', 4, NULL, NULL),
(1093, '$2b$04$WV33/8CuNgEI0aYea06iOec5WqOJ4hw/KWmKviUJjoUqtXMUdTkHi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 14:12:08.150000', '2025-11-22 13:57:08.150000', 4, NULL, NULL),
(1094, '$2b$04$X77iak.ePJiEsirx3sHadun/lxXfFaRozf6I/4gYeAQFiE2Z9.HX.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 14:27:12.382000', '2025-11-22 14:12:12.382000', 4, NULL, NULL),
(1095, '$2b$04$1Ag5HUF7e./T/Z4.h5E76OkkuIbJT8uWnZpMH4SuABXzoGzEySnI2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 15:01:43.646000', '2025-11-22 14:46:43.646000', 4, NULL, NULL),
(1096, '$2b$04$cboXj1raIpdSWG2E4hU8b.WlvNIKnu3vx71qE9V9paQKEnCQeEUXm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 16:08:06.774000', '2025-11-22 15:53:06.775000', 4, NULL, NULL),
(1097, '$2b$04$BACeAEKzaCH0xmGPuE3CVu5kRzBC0apVugxlp64R/pH8ZzNwcVuU.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 16:56:06.082000', '2025-11-22 16:41:06.082000', 4, NULL, NULL),
(1098, '$2b$04$xTu0VFcMBwaLJNSQfEKCUefDUk8l0P6C2KiLxrrdxP/taz2bHLmvC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 17:23:18.388000', '2025-11-22 17:08:18.388000', 4, NULL, NULL),
(1099, '$2b$04$GdXJ8QFGaHVWL4bBed8YHuW8B1IkV20XLOqEAER3irnF3uS9/IlDi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 18:00:06.655000', '2025-11-22 17:45:06.656000', 4, NULL, NULL),
(1100, '$2b$04$NKjV/UCzAQ.n06Y2m728tuv2rUtIVnOoeQqi4WkUCjZ64OKMhUvyu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 18:17:16.784000', '2025-11-22 18:02:16.785000', 4, NULL, NULL),
(1101, '$2b$04$x.30dYJO/pW3E0VOm7ZUw.8kbjPbpz/OagD82iWwS2IqtMwvlanrG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 18:35:26.625000', '2025-11-22 18:20:26.626000', 4, NULL, NULL),
(1102, '$2b$04$4XOtX0x6CScQL.iogRkomuEhZO2Pkna3eWgXiM0rGbRG9PGaNRdXi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 18:50:52.751000', '2025-11-22 18:35:52.751000', 4, NULL, NULL),
(1103, '$2b$04$zgPYxPGtwZZjlXllz6chuuixW3paABRJ9x1.3m/FcL94Jc69giY/G', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:05:55.635000', '2025-11-22 18:50:55.635000', 4, NULL, NULL),
(1104, '$2b$04$zZgP0Po0i8zNC/wzGMXYw.wZFkE36TcjaZcAy48Ys6NOP17PMhEya', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:29:26.313000', '2025-11-22 19:14:26.313000', 4, NULL, NULL),
(1105, '$2b$04$cRzNW/pRNoide4tnkOxpKOw2e.E8nRxlFSDLFrwO3ZWeDSAlEdyAq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 19:52:00.207000', '2025-11-22 19:37:00.208000', 4, NULL, NULL),
(1106, '$2b$04$xsDsVc/3Tvs0URxQ8h8BmuMQE3Z1/S3vHFlgVkgmrs5IspYhcokku', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:27:52.389000', '2025-11-22 20:12:52.391000', 4, NULL, NULL),
(1107, '$2b$04$Rsb1FV12eALgO6sqTlXTUO./nD5BDHZuObwMmiQpbRzG3q693piyu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:55:02.811000', '2025-11-22 20:40:02.812000', 4, NULL, NULL),
(1108, '$2b$04$B.bB6kEqHzjAYAKZOEeTAOdpotHqLXNVd06udjMiTtWCesXghkBBG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:57:27.012000', '2025-11-22 20:42:27.012000', 4, NULL, NULL),
(1109, '$2b$04$UREDAwJOJHnJfL.fByUsuuzoAoNiBE7bVLYXCocoltonh6.HlcZ.i', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 20:59:43.836000', '2025-11-22 20:44:43.837000', 4, NULL, NULL),
(1110, '$2b$04$MZnDHY8ODXvk60N0Yq1q/umaqUssobzKFDa8dx2KYvE9XA.NKviNi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:01:17.432000', '2025-11-22 20:46:17.432000', 4, NULL, NULL),
(1111, '$2b$04$sjKWz/20TdR0ssFaJfUUm.z3ADhTNnMeZWZTEQbdhx7j4WoBaZ1Jm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:01:32.064000', '2025-11-22 20:46:32.065000', 4, NULL, NULL),
(1112, '$2b$04$U9fcjU5iLvLC1RfMr9xbUu0lMqhS8P2Znj6qTB3G1jioNQSENoBi6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:03:11.459000', '2025-11-22 20:48:11.459000', 4, NULL, NULL),
(1113, '$2b$04$TK0hgaxiJ.PcPKFw8xtvdutvUs0gEqV9V5rbqE/wMGiX5T4evVMdi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:12:42.470000', '2025-11-22 21:04:29.790000', 4, NULL, NULL),
(1114, '$2b$04$U5k70LMpobJvY.o1qtt.8eNf0kIt8sy23JSqmNplHit1yEZFu2YE2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:27:50.529000', '2025-11-22 21:12:50.530000', 4, NULL, '109.164.51.14'),
(1115, '$2b$04$MyXYhkK3qcsRV/q4ys0FpOCvXL2Wckpom/nZrgdROg.4OgLW.aQb2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:27:53.917000', '2025-11-22 21:12:53.917000', 4, NULL, '109.164.51.14'),
(1116, '$2b$04$yI0DxblX8MwpcPrVQZiEMuuhEDIVNY3XTKuNcziu37au3zFEARCaq', 1, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 21:34:38.041000', '2025-11-22 21:19:38.042000', 4, NULL, '109.164.51.14'),
(1117, '$2b$04$NuNrGM/mvDN3JHWnZlKiZeoD.FYi4FXsL6DHxSv7N485rLjW9Jfoa', 1, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 21:34:38.998000', '2025-11-22 21:19:38.998000', 4, NULL, '109.164.51.14'),
(1118, '$2b$04$j4BROuarAF5KGkIgzAR.e.FhXwTn6Gqu/qEdNMuvGzducOkFWv8hy', 1, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 21:34:42.049000', '2025-11-22 21:19:42.049000', 4, NULL, '109.164.51.14'),
(1119, '$2b$04$Tjo64hyoCuc7iiYW58A6dOZTVWJgoDRhuwrT9.S.R0MYjqKPEWtwG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:58:22.592000', '2025-11-22 21:43:22.592000', 4, NULL, '109.164.51.14'),
(1120, '$2b$04$UM4b1B/K9J00wFuzbbmtI.Wj7dZ1KbmDANqeGBuE35VwaC6ohTYby', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 21:48:46.715000', '2025-11-22 21:45:41.127000', 4, NULL, '109.164.51.14'),
(1121, '$2b$04$fpLZi5fjqEtNscN5jPkUIuIeYsE0L79mKQHqjx2YMQmLhj07.Ke7C', 1, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-11-22 22:07:11.636000', '2025-11-22 21:52:11.636000', 4, NULL, '109.164.51.14'),
(1122, '$2b$04$jkCUgnjaNgNZPkVPqlJ/y.cfkYgYkpgjgnBOtU1xLefj76UB81lAK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 22:13:34.614000', '2025-11-22 21:58:34.614000', 4, NULL, '109.164.51.14'),
(1123, '$2b$04$wegOyRwB23TUMo9/wycLgOtsu91NxnfXpUP.OE6KJtc/2WBTKQ0sO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 22:46:16.311000', '2025-11-22 22:31:16.311000', 4, NULL, '109.164.51.14'),
(1124, '$2b$04$S0YCVyBlCce8CTTAKjj/q.u/Nuiva8PnTCqyt37GUvMCxx0wKATe.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 23:06:46.125000', '2025-11-22 22:51:46.125000', 4, NULL, '109.164.51.14'),
(1125, '$2b$04$MgEdBhQhrtPB7oQEmRv0HeR.Vh68tcuoU0LKjn5b3.t8lwUqga8MW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-22 23:35:43.248000', '2025-11-22 23:20:43.248000', 4, NULL, '109.164.51.14'),
(1126, '$2b$04$qdS2.bxUQ0lwXfhw21xsCOLQNPh42qVohP2QntD6rd1Gh99MTudeq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 00:03:19.235000', '2025-11-22 23:48:19.240000', 4, NULL, '109.164.51.14'),
(1127, '$2b$04$MK6aVBwhfY9mBKcAt9gYmO6vsICxNnQ5qdGkm2dHKSd9SMG.zoqWG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 00:22:00.130000', '2025-11-23 00:07:00.130000', 4, NULL, '109.164.51.14'),
(1128, '$2b$04$fYyU3yHZiNnLGTUakAJed.kPj513Ccp9M7GH94UiFlTb0onkrdVvK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 01:14:40.100000', '2025-11-23 00:59:40.101000', 4, NULL, '109.164.51.14'),
(1129, '$2b$04$s.jAwVCLP/ZWnuN3Mp.wi.BWehvX/a58z6X8lDomQBJYvXImsDuku', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 01:30:08.951000', '2025-11-23 01:15:08.952000', 4, NULL, '109.164.51.14'),
(1130, '$2b$04$apJUbHHmDLhPFjT9FEmlBOPPnmQ9RqK3zKR1nT.AxxcOAXl/tczkq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 01:50:04.280000', '2025-11-23 01:35:04.280000', 4, NULL, '109.164.51.14'),
(1131, '$2b$04$yGOAH9saWFQdGAe8qcqOYeV6hKt9r0/Zsjknu.CIFN3VdGt5juAWK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 08:48:29.162000', '2025-11-23 08:33:29.162000', 4, NULL, '109.164.51.14'),
(1132, '$2b$04$4svJFQnRcsEvoExFHlwKIeD93HFXApC8e3VMx3xJ9INvPvTJsdPIW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 10:00:09.169000', '2025-11-23 09:45:09.169000', 4, NULL, '46.135.4.3'),
(1133, '$2b$04$TFTBI/v9c5UNrqGGFEKxEew4igBDPq/yGluBhK1ugPhvnpRZRu0M.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 13:19:25.703000', '2025-11-23 13:04:25.704000', 4, NULL, '109.164.51.14'),
(1134, '$2b$04$7FwP8.xWiqPLCfjifEqw6ecyreBgaaNu1k3kZcvA5bxJexd9A/3ku', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 13:40:54.624000', '2025-11-23 13:25:54.624000', 4, NULL, '109.164.51.14'),
(1135, '$2b$04$QeNJRnPi6WUiUI1JFGZAjOALbQjef5OGNr8xqaOzJPtTagxmL.Fhm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 13:57:12.473000', '2025-11-23 13:42:12.474000', 4, NULL, '109.164.51.14'),
(1136, '$2b$04$7mUKHVhxm4JWO8SaFSO9iOwB7ouXt5FAqevrwnHCO.kqpbsO9b11e', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 14:13:15.175000', '2025-11-23 13:58:15.176000', 4, NULL, '109.164.51.14'),
(1137, '$2b$04$2ZXHCe04pwIOA9qaOAEtAu3O3g3oteL7K33gxW/oe.HM5vf2Ud3pm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 14:31:58.064000', '2025-11-23 14:16:58.065000', 4, NULL, '109.164.51.14'),
(1138, '$2b$04$lIZ3FHE0d0g3ml7qY6k1ZeV3oJoW6Z.h9myXkEkQ2UJJSQ8Q2sZKi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 17:07:37.280000', '2025-11-23 16:52:37.280000', 4, NULL, '109.164.51.14'),
(1139, '$2b$04$tpguajIidWOx8yp.NDw4RedVGSE9AryjtG/FYOCBdwpjbIaHWyFGG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 18:05:21.550000', '2025-11-23 17:50:21.550000', 4, NULL, '109.164.51.14'),
(1140, '$2b$04$HrzR3uc3lkvAg5HEatYK7epr9Uwwq/mzZ9D8a1VUyqa0PxaIjpSXa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 18:22:29.955000', '2025-11-23 18:07:29.955000', 4, NULL, '109.164.51.14'),
(1141, '$2b$04$4A30FW/4d2k/LidyLA2rO.lJvTQmsxRQbw01yiQUgpOwb2UBOQDC6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 18:22:41.217000', '2025-11-23 18:07:41.218000', 4, NULL, '109.164.51.14'),
(1142, '$2b$04$4QdSlf0LvIsEUN.FLOs12.qozmESdP5DR1ZhaaFKayMnhuYQ5qnh2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 18:40:44.224000', '2025-11-23 18:25:44.224000', 4, NULL, '109.164.51.14'),
(1143, '$2b$04$7lXm.KPkWtDYltLFkxaOee3Lu5W3pZFgtDEtXk2pT8aRbATO7XQka', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 18:56:01.731000', '2025-11-23 18:41:01.732000', 4, NULL, '109.164.51.14'),
(1144, '$2b$04$j8zNaMX4okr59LhT1BACwOVFNrJVPWKfj/KUQu1Gf62xK0Ypz3OVy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 19:29:32.827000', '2025-11-23 19:14:32.828000', 4, NULL, '109.164.51.14'),
(1145, '$2b$04$qWhxhLLG53ROLda6P9Wrr.5rn8ldAZqHvIjG3qQue5eTx10N8s3Qa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 20:20:42.868000', '2025-11-23 20:05:42.868000', 4, NULL, '109.164.51.14'),
(1146, '$2b$04$k5pSe279TUsWGFtJsmhzTuu37DqipWhp9zy8mcyKsHQ/UzBwIe7NK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-23 20:57:44.478000', '2025-11-23 20:42:44.478000', 4, NULL, '109.164.51.14'),
(1147, '$2b$04$CS1GXc/OO1o1vu9SZAHx/eAfDTVNlg5cOew..h3/vWxyWQnLJRWgW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 14:28:41.315000', '2025-11-24 14:13:41.316000', 4, NULL, '109.164.51.14'),
(1148, '$2b$04$zXTAAR0KqCDFa6xcVPV6Ue3xrYV/ORqXsKZFCBwoleLgMWufKWlvy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 15:52:28.107000', '2025-11-24 15:37:28.107000', 4, NULL, '109.164.51.14'),
(1149, '$2b$04$np5cF/v4Ps.uFm9F4ZzGpek9/eIX1QADqthXlus1eEbPWOuhJP.Vm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 16:36:38.001000', '2025-11-24 16:21:38.003000', 4, NULL, '109.164.51.14'),
(1150, '$2b$04$..mAvBkPMA.m5CgC5HH5H.IGCGUgEN8958jL7ZsyvWJ5AYsIqGLSC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 16:55:26.191000', '2025-11-24 16:40:26.191000', 4, NULL, '109.164.51.14'),
(1151, '$2b$04$meAPRXmltgKfafNxJmibeetPV4lkpk9BhrJsreP151U/emLXlicsi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 17:15:28.678000', '2025-11-24 17:00:28.679000', 4, NULL, '109.164.51.14'),
(1152, '$2b$04$0O6U2DAzqSBcIjRKhC/NH.WUyDoXUark/tB.RIPbIVKyUcVkOMsNa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 17:47:01.727000', '2025-11-24 17:32:01.727000', 4, NULL, '109.164.51.14'),
(1153, '$2b$04$uijYRpTMMmkF8PTcTMrVueUI23XofCprglZqLN9/1IRX9ZWpBvtpq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 18:05:54.996000', '2025-11-24 17:50:54.998000', 4, NULL, '109.164.51.14'),
(1154, '$2b$04$BVEn8X0xb731Gu/BLQBlRee2LPwEzqOUxIp.G2z.mvO0GvysjzYF2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 18:22:08.559000', '2025-11-24 18:07:08.559000', 4, NULL, '109.164.51.14'),
(1155, '$2b$04$W.BFAVz/erGxvg5lYXzuk.QiKfywMJ9eKDvyOHE8ZIH7e9pxYUN7S', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 18:37:29.871000', '2025-11-24 18:22:29.871000', 4, NULL, '109.164.51.14'),
(1156, '$2b$04$cbTI3i837/5YdXpjBL4D7epjoemhdFddUAH9/DVjtL2/.5rHuZUPe', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:01:27.249000', '2025-11-24 18:46:27.249000', 4, NULL, '109.164.51.14'),
(1157, '$2b$04$EX9RJ.iSIhp1AJbOla7xiOCs6k6jlfDZG2djqpE7ICMgcEOWCbzP2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:21:55.244000', '2025-11-24 19:06:55.245000', 4, NULL, '109.164.51.14'),
(1158, '$2b$04$2d.JTv//vxZ3LWfIJaK01eKBHvblYJ0kdwRiZkX4LcjVEenCYH05C', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 19:54:05.683000', '2025-11-24 19:39:05.684000', 4, NULL, '109.164.51.14'),
(1159, '$2b$04$oXROUv2/OXXwfCWWhbLHy.54ZmdMGIer5MM37MIsjiszHIDu4xVYa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 20:34:45.474000', '2025-11-24 20:19:45.474000', 4, NULL, '109.164.51.14'),
(1160, '$2b$04$I6wbB.fGjgCXz049h0HTluMhBLqlPEpEX9Kk/jTx/WcKjC7rHa38u', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 20:34:46.568000', '2025-11-24 20:19:46.568000', 4, NULL, '109.164.51.14'),
(1161, '$2b$04$SUXi7LJeTpYj/Yo7fTawsOlhcdfrcYMHUWVJlJyxu56LWraSJQGFm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 20:55:59.781000', '2025-11-24 20:40:59.781000', 4, NULL, '109.164.51.14'),
(1162, '$2b$04$1X/H0Hq51OOMeJ86d076ZeCgqWPyeInhoF.IVKhh14.R/57pNYc12', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 21:12:53.700000', '2025-11-24 20:57:53.700000', 4, NULL, '109.164.51.14'),
(1163, '$2b$04$UNrtQ13l8HqW6P4t1DaPTueMb48w7HWE00LQsjRKQN4.NDvXbC6k6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 21:28:48.647000', '2025-11-24 21:13:48.647000', 4, NULL, '109.164.51.14'),
(1164, '$2b$04$51Mg/BiSBn4ewbpi1mNyQeIP3sPGsWxkqIK2L4Zv689xeYW/oozSK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 21:45:30.759000', '2025-11-24 21:30:30.759000', 4, NULL, '109.164.51.14'),
(1165, '$2b$04$9uSAG1Zo93EO5/6w7A9SweAxT7U3bQ3T9FkTzYo3kJrIZjk0vEzKy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 22:12:31.874000', '2025-11-24 21:57:31.875000', 4, NULL, '109.164.51.14'),
(1166, '$2b$04$8CC7fmvQecQrPa9znAVBBu7TRN7aAe4LDhO1iEF847NslhB/DOK4C', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-24 23:41:48.754000', '2025-11-24 23:26:48.755000', 4, NULL, '109.164.51.14'),
(1167, '$2b$04$bezQFtYPseEvu1XuSksTyuq1g6f8UBRGvDIxnVxK/fkdCMipN.53O', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 00:09:38.582000', '2025-11-24 23:54:38.585000', 4, NULL, '109.164.51.14'),
(1168, '$2b$04$cAP2RFxUcBOL8HqMlVLKrOscOCOipUoYLcBSTFhqWdn2I3USqS2LK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 00:29:48.828000', '2025-11-25 00:14:48.829000', 4, NULL, '109.164.51.14'),
(1169, '$2b$04$rg8qHP05DALofU7kAo5xgeVvzo/xRTjDEAlM1tZ4bYR.b0KReWpQ6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 00:46:20.932000', '2025-11-25 00:31:20.933000', 4, NULL, '109.164.51.14'),
(1170, '$2b$04$Cw1OI.TMjuzT1T2ZpjvbJO2VoQFtDeggsgwbANTxu1PkR7fPQkzC6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 22:16:11.940000', '2025-11-25 21:54:47.955000', 4, NULL, '109.164.51.14'),
(1171, '$2b$04$Cak1S42wUQszn1sH4kd9POVnCLjofVP3nkDsi3IGo5/8y2EmDKwG2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 22:31:42.606000', '2025-11-25 22:16:42.606000', 1, NULL, '109.164.51.14'),
(1172, '$2b$04$/SD8XUeCjVYxdfR/Ke1M1emEOcHGnu4/sylPOmTYXZlSi3bDOxPrO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 22:52:14.299000', '2025-11-25 22:52:10.993000', 4, NULL, '109.164.51.14'),
(1173, '$2b$04$XTbl7bHZy/63iwyiA5oY/Or8LcVPm/x6JQetcgLwQ4lUAu19tfgFu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 23:07:17.365000', '2025-11-25 22:52:17.365000', 1, NULL, '109.164.51.14'),
(1174, '$2b$04$53KT1voV5rcbSh7FLj1Ll.n/rLKOjrFLD4egz79CUH1dDIHkkiBMK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 23:28:52.341000', '2025-11-25 23:13:52.341000', 1, NULL, '109.164.51.14'),
(1175, '$2b$04$FkUsdP8jJcWqm.YF5mqVZu.OjoJ2tR9FiyDHJS12Sc9NZzhNLQkxy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-25 23:44:58.811000', '2025-11-25 23:29:58.811000', 1, NULL, '109.164.51.14'),
(1176, '$2b$04$nEFlp7xJFdNhOYLWPsgRweO275Y9WV7SpJl8HpJVvtNkR6bRLau.O', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:03:38.325000', '2025-11-26 09:48:38.330000', 1, NULL, '195.113.101.227'),
(1177, '$2b$04$s/mzh0ktfsjOJXvtC2PXruRp.CrXikVDMhMrAL6xacFv7DSmKBKmK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:19:20.959000', '2025-11-26 10:04:20.973000', 1, NULL, '195.113.101.227'),
(1178, '$2b$04$enwuYzQ.wbjsv9s5Aq79/O22Pz00prRPM/ZvcLPl5RVFGniW9Cm9C', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:20:02.800000', '2025-11-26 10:19:28.691000', 1, NULL, '195.113.101.227'),
(1179, '$2b$04$k78zPxqS5BHh7Yb7EH1a.ullj/pKKkjzKWjwpCOJWSbhFGmsELozm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:35:06.474000', '2025-11-26 10:20:06.474000', 4, NULL, '195.113.101.227'),
(1180, '$2b$04$KOT9OMgEQazsy8CFTphGd.CGtFCpfOIu2yXuxpQX8UMpRYXArIKjW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 10:56:19.855000', '2025-11-26 10:41:19.870000', 4, NULL, '195.113.101.227'),
(1181, '$2b$04$wvzNyQpyYG21Ece/AwolJ.50sktphYeFdn5C26Inbm/X7ypzfJUNm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 11:11:29.823000', '2025-11-26 10:56:29.836000', 4, NULL, '195.113.101.227'),
(1182, '$2b$04$UOtgoEBtWbMmYFMxVjWh3O7JhH/o7ohU5vQOD7nMWFSZpsRKQQvfa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 11:33:13.059000', '2025-11-26 11:18:13.079000', 4, NULL, '195.113.101.227'),
(1183, '$2b$04$oCscyD8JIHWM4FDaZ.MBnedsb2XwkR6Nw/Zd4eEUdkdeW9OPletZC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 11:48:54.559000', '2025-11-26 11:33:54.564000', 4, NULL, '195.113.101.227'),
(1184, '$2b$04$.mcvW2JJzI881kAw4vMgi.YpvWQP6m.jnfKSR9FHIi1o4Ko7u5Hee', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 12:14:00.843000', '2025-11-26 11:59:00.864000', 4, NULL, '195.113.101.227'),
(1185, '$2b$04$5dQxX/ESaJO0NVLxrzyyY.g9vHRafaVeiRkODICO50vBOXqA4fB.W', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 12:29:33.717000', '2025-11-26 12:14:33.720000', 4, NULL, '195.113.101.227'),
(1186, '$2b$04$PdAlFPngaZNN8icndpRGQOL0dtu8Kva96eo7YUYj5KU5yQuclSTNi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 13:40:34.781000', '2025-11-26 13:25:34.801000', 4, NULL, '195.113.101.227'),
(1187, '$2b$04$wbMbKXmqicP2sa8GxPVGWutijM.cBUBOLwRRu62L0N.tDwvBfS6j6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 13:59:25.359000', '2025-11-26 13:41:49.710000', 4, NULL, '195.113.101.227'),
(1188, '$2b$04$VTksslOIfRTujCiKvlG2puEtvDTHF5S.DGx7O3Z9SkpXGfiVKiPrK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 14:14:29.051000', '2025-11-26 13:59:29.054000', 1, NULL, '195.113.101.227'),
(1189, '$2b$04$1JWuftvEOTCowaKnjrSTEerpK6VWOFsb5LgYGcn.p.Wi79uMC99Pa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 14:33:09.946000', '2025-11-26 14:18:09.957000', 1, NULL, '195.113.101.227'),
(1190, '$2b$04$5q7k4iP/RTKhKS0ws3RH4OAXwoCmY0XGrFPLg3/xv7RX7KzaZQJc6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-26 14:53:34.632000', '2025-11-26 14:38:34.646000', 1, NULL, '195.113.101.227'),
(1191, '$2b$04$kxpDYAWyXd05arbsNyzPKeVPNGKLy8VRcUD8FjNSJct3yYRnleplS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:01:52.290000', '2025-11-26 22:53:30.417000', 4, NULL, '109.164.51.14'),
(1192, '$2b$04$KBRrdV4fRlfKE6m2D1DKJutD/gnV2n2/LUjgfTLueian4mwFA0WRO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:03:17.723000', '2025-11-26 23:01:55.524000', 1, NULL, '109.164.51.14'),
(1193, '$2b$04$9OChI.ptrLloQH7RPOw6wO8IxLWicjKS0JpvuZJu.y3yPO1yhPMb6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:08:17.121000', '2025-11-26 23:03:20.198000', 4, NULL, '109.164.51.14'),
(1194, '$2b$04$iluLprUVrrJYMwCjLKVXK.KI5a1AMWADA3GmT6Z7766JCEiTeRfS6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:23:20.686000', '2025-11-26 23:08:20.689000', 1, NULL, '109.164.51.14'),
(1195, '$2b$04$XapCW231Ku4Q0cQB/9T71uuLU4Fe2508kN.Z7J7v3O04fJNeJQzL.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:39:29.151000', '2025-11-26 23:24:29.151000', 1, NULL, '109.164.51.14'),
(1196, '$2b$04$fbTOmOr4/bSV6tBjmIeJcO6yHjYfUFUFc0FPeKTp6UvSsxEbegEt6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:55:37.516000', '2025-11-26 23:40:37.517000', 1, NULL, '109.164.51.14'),
(1197, '$2b$04$/3rORq5BXNZU1TQKYANwR.tfd3k0LoIroHKucYevo1jf/ZRIwoDCa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:55:44.281000', '2025-11-26 23:40:44.281000', 1, NULL, '109.164.51.14'),
(1198, '$2b$04$QKEEfGrstzClV17b3pDf1.PFdGT.n3Yk7qwvqcjXwlTTb3XDe.3Wq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-26 23:55:49.029000', '2025-11-26 23:40:49.030000', 1, NULL, '109.164.51.14'),
(1199, '$2b$04$x3N/fUUv13o2JdV6YhWFLetGPMnjxLcqskzGtAY9NDOYjRFHX5jz2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 16:15:03.562000', '2025-11-27 16:00:03.562000', 1, NULL, '109.164.51.14'),
(1200, '$2b$04$KNE2Umnbeyap3Pye.h/n1.edxMthAzWHTXSuVZ8SPFXUGpidBDn1u', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 16:53:50.318000', '2025-11-27 16:38:50.318000', 1, NULL, '109.164.51.14'),
(1201, '$2b$04$YJu0WRCaVc5/B4IOjEecm.Pm0XM3/34SPNWn33sXOdAGqkfkF3n92', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:10:31.121000', '2025-11-27 16:55:31.121000', 1, NULL, '109.164.51.14'),
(1202, '$2b$04$lw8OBjz5q887yMCbY.8tduXPjJ1sVRbuxoCFWAbIBYgyRKcUcRH.S', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:28:51.098000', '2025-11-27 17:13:51.098000', 1, NULL, '109.164.51.14'),
(1203, '$2b$04$ynDZcfe6ox/wrHDoPPHdMekosEQ2yOl5kcx9m96FWZWJd4EHGj2hG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:41:56.321000', '2025-11-27 17:26:56.322000', 1, NULL, '109.164.51.14'),
(1204, '$2b$04$utERYfBTjctM7XGUwfU0W.C88ILcBrC4R2qLV5bnADA0H4scPelGC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:58:55.765000', '2025-11-27 17:43:55.765000', 1, NULL, '109.164.51.14'),
(1205, '$2b$04$m0W6EGJax0Xa/yC/zXYDgu4Qi6WaxOl8v0iJcbIiblTfQArsbEp..', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 17:59:00.847000', '2025-11-27 17:44:00.847000', 1, NULL, '109.164.51.14'),
(1206, '$2b$04$7HfNSz/X3R7kLINs2vKDeusxaMMmC.qYBHLtQN509FLkoZiJm30g.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 18:52:39.881000', '2025-11-27 18:37:39.881000', 1, NULL, '109.164.51.14'),
(1207, '$2b$04$qOXx1ZGnah.xRf9LcdQWGOqwqSUKBGeLiWj2YNQ6Ny1h92JDtEtpW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 18:59:51.606000', '2025-11-27 18:59:49.071000', 1, NULL, '109.164.51.14'),
(1208, '$2b$04$5sWRSwzHQSZmFELxn8xg3.6E.9dgORNCtH1oEsjFa1HWIC5tuMxA.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 19:00:27.755000', '2025-11-27 18:59:54.653000', 4, NULL, '109.164.51.14'),
(1209, '$2b$04$7iCh69U711EbEou8dkP1weCZIQBbapYTjsBH1YKNTTTVl9DmBh9im', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 19:15:29.616000', '2025-11-27 19:00:29.616000', 1, NULL, '109.164.51.14'),
(1210, '$2b$04$WTMtdeeWlI8Nbp//1Qz/6u4qpjMC.xJXStJlmMWeaBz83AY8jZ1oK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 19:19:24.217000', '2025-11-27 19:04:24.218000', 1, NULL, '109.164.51.14'),
(1211, '$2b$04$u73y8cPVE69DE7TMu.e5oOq8iyRv1/Hg9MkatYIXXT/Wsh.4/aQpy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-27 20:00:35.011000', '2025-11-27 19:45:35.011000', 1, NULL, '109.164.51.14'),
(1212, '$2b$04$bSYlhs8ZZGSUiyvNDgHJ4OgjMU/UPiMF/cfH9pTLh5pxdjlaCK5yW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-28 06:43:07.861000', '2025-11-28 06:28:07.862000', 4, NULL, '109.164.51.14'),
(1213, '$2b$04$rWNuNm0z/CYlTPMWPOIL9eG/1nzAGV8F2y6oss87gXqDr6Qm6Hadu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 22:21:26.207000', '2025-11-29 22:21:22.216000', 4, NULL, '109.164.51.14'),
(1214, '$2b$04$30i64H5hIh6SoDZTJ8tr5ufKfhnZC2lB/npTH3pglf8RwhhrTOk1O', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 22:55:43.868000', '2025-11-29 22:21:32.493000', 1, NULL, '109.164.51.14'),
(1215, '$2b$04$cbR.xPBTNXT1iIFHY/mRBub7HZ3NwdhdC/EYBL5w28LXPtL6cXzZq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:10:51.615000', '2025-11-29 22:55:51.615000', 4, NULL, '109.164.51.14'),
(1216, '$2b$04$WnWVC7MSWniez4MLrc/Y6Oj85xaV0NbuRWvE9yAp.vJWVkqfTVI/O', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:10:51.616000', '2025-11-29 22:55:51.616000', 4, NULL, '109.164.51.14'),
(1217, '$2b$04$.PfCus6H61COfNj1sJZ7keiYUYgjWs9RIZhZe/U0SMr.qYtNcYNjS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:33:42.709000', '2025-11-29 23:18:42.709000', 4, NULL, '109.164.51.14'),
(1218, '$2b$04$XNToSJd6ti2RkdgfwCroseYeAVebi9asoyWOC.ta5xPPzNG7SzL5i', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-29 23:49:22.719000', '2025-11-29 23:34:22.719000', 4, NULL, '109.164.51.14'),
(1219, '$2b$04$MARiNY5NgAOSAWacI3.Jce3urX6JBUFLzOuWSnSSPY77qBivDWyVi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 00:07:49.551000', '2025-11-29 23:52:49.551000', 4, NULL, '109.164.51.14'),
(1220, '$2b$04$Dm5UPhweIeN7NO.1uWf6nuLE6vLISMdHhqzaFkBP01EwIdGf979fG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 00:27:23.936000', '2025-11-30 00:12:23.936000', 4, NULL, '109.164.51.14'),
(1221, '$2b$04$VeW5Cmzijsb0vXW1gkhHEun.SMKgHFMQ5d5xWr32E98KxqIJGKzlu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 00:42:29.353000', '2025-11-30 00:27:29.353000', 4, NULL, '109.164.51.14'),
(1222, '$2b$04$aUJ.LuWL1xiV0lFO1cilA.wZVcgdUQoT7e7GFlJroxYkv0YWfStGi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 00:58:08.338000', '2025-11-30 00:43:08.338000', 4, NULL, '109.164.51.14'),
(1223, '$2b$04$7foQEKyWPNR4udWR5.Siq.tzrRfBbbTlT.Lzout2Gyt4NlTUnbtES', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 10:53:34.826000', '2025-11-30 10:38:34.826000', 4, NULL, '109.164.51.14'),
(1224, '$2b$04$0a9/ySfo6HiOJR.hrSAmeuYav5b4Wiwwr0NJ3klHpyIPiPiMEqu0e', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 11:18:14.661000', '2025-11-30 11:03:14.663000', 4, NULL, '109.164.51.14'),
(1225, '$2b$04$mB8X/gUX6DJMZHUZbuHWqe4jU1kS38EzWgkGfg/mMh9xnJrezQOue', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 11:50:54.655000', '2025-11-30 11:26:07.437000', 4, NULL, '109.164.51.14'),
(1226, '$2b$04$Kg17vLQqk2GGM98gCTYvAOQH2eYofUsGBLdNzNXYHtU8XWfR/qc8S', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 12:05:57.100000', '2025-11-30 11:50:57.100000', 4, NULL, '109.164.51.14'),
(1227, '$2b$04$.vu9GC1/KY.D41GLTmMNZeq90hGYX0EwN0Lq/1L0WIwwbNlAIZPbG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 12:34:12.435000', '2025-11-30 12:19:12.435000', 4, NULL, '109.164.51.14'),
(1228, '$2b$04$PWNuDTIDFkakm5QjB3TxZOqS2VbQESDd/AG7dtASx5WfOY4RyfRAS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 13:24:52.597000', '2025-11-30 13:09:52.598000', 4, NULL, '109.164.51.14'),
(1229, '$2b$04$WUAWHp7G3JQOwsVJN0zGyucbUOAmJ1ViYhU9PFrgwQ3KfHL4Eerxe', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 13:51:01.262000', '2025-11-30 13:36:01.263000', 4, NULL, '109.164.51.14'),
(1230, '$2b$04$gGBv1V/T6lpmV0Zu2sRxY.gzjgunMxeh3/rxNU/X4i1jskDrw6/7W', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 14:27:30.870000', '2025-11-30 14:12:30.870000', 4, NULL, '109.164.51.14'),
(1231, '$2b$04$hgSzEbhZBCX9hVt5vp/Mt.RG9RGiXrKIinMTXtwekbOFUj9L0Lizq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 14:49:40.123000', '2025-11-30 14:34:40.123000', 4, NULL, '109.164.51.14'),
(1232, '$2b$04$ubjbxtLtCWrq9ci.otnq8ezj4iP3cP1R9qpI4PbN9n/bDND2FRoXK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 15:59:02.739000', '2025-11-30 15:44:02.739000', 4, NULL, '109.164.51.14'),
(1233, '$2b$04$VGw/t.c3H/TzBUMYtb08bO4LQS1RfhQ7ZnJwOfKi34zsgIEQ7zchO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 16:27:22.944000', '2025-11-30 16:12:22.944000', 4, NULL, '109.164.51.14'),
(1234, '$2b$04$8d/6tN.oe0p3tUePgKZth.Zfl.PB7pj7aJ2tTiEh3D3dMGQrH6Avi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 16:43:29.743000', '2025-11-30 16:28:29.744000', 4, NULL, '109.164.51.14'),
(1235, '$2b$04$kjSNEqk.vwE1veF.NmXlKOB3b2L7gdklrkA12BGZr1y/lwTpaEbB2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 17:06:37.887000', '2025-11-30 16:51:37.888000', 4, NULL, '109.164.51.14'),
(1236, '$2b$04$ZtLAxww3e.9HNgLtXS6y3ebflzqSzoTQWUHhYi0sko/X9Db1/TQ6W', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 17:25:11.025000', '2025-11-30 17:10:11.025000', 4, NULL, '109.164.51.14'),
(1237, '$2b$04$j8sgWWZ8mJT0e8U8MCz3Uu/sb84oXXnaUoSDT6aJeMi35dqlcigEK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 17:46:13.581000', '2025-11-30 17:31:13.581000', 4, NULL, '109.164.51.14'),
(1238, '$2b$04$X8cjxoz3MThb4mdhwWU6YOoJR.uab9O72S1GBTe4Bjhzk8zIonIle', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 18:06:32.017000', '2025-11-30 17:49:05.143000', 4, NULL, '109.164.51.14'),
(1239, '$2b$04$AxKCpq/rKT0OJ8XVvVefuuTVcufjl9b9qnEYTarp.pfT5tFJvya5m', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 18:25:20.905000', '2025-11-30 18:06:34.841000', 4, NULL, '109.164.51.14'),
(1240, '$2b$04$Qr9tS8F8Bcb.3jvK5tazc.eH/.w8czG26XlVBVlZ1zrA..uSNyaxO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 21:19:28.885000', '2025-11-30 21:04:28.885000', 4, NULL, '109.164.51.14'),
(1241, '$2b$04$mv5xRqgS6ADA5jIt38aUy.it.I1hz3EVMp/t6sqH9Cp28PvgScHka', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 21:36:57.513000', '2025-11-30 21:21:57.514000', 4, NULL, '109.164.51.14'),
(1242, '$2b$04$ak0tTRte6dAqAo2Qb7d.P.6Ouj0tt/osPtGu0P1fS1/JKlHz6mT4G', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 21:52:38.668000', '2025-11-30 21:37:38.668000', 4, NULL, '109.164.51.14'),
(1243, '$2b$04$.J6LM1jW1WrUH540yyGJqeyzDGDruagm3eoK.V3qsNDVdUlEQSm5K', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 22:08:51.280000', '2025-11-30 21:53:51.280000', 4, NULL, '109.164.51.14'),
(1244, '$2b$04$TYuEUCNekco3tECyBPcYk.ZZpIPDVujWuUO7kegSqVSFsYo6VTkCq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 22:59:22.638000', '2025-11-30 22:44:13.100000', 4, NULL, '109.164.51.14'),
(1245, '$2b$04$k.mJtizHxo8YA8Iea7YRkO5xtMpc3.SMrTtFMScuvvkxWnWfZF4gq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 23:14:24.950000', '2025-11-30 22:59:24.951000', 4, NULL, '109.164.51.14'),
(1246, '$2b$04$6KnlMdkcNsPn6XM30EUXhO7EgQ9.JrWRCg.dV6lgshVxPrVb6ZUXi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-11-30 23:33:27.665000', '2025-11-30 23:18:27.666000', 4, NULL, '109.164.51.14'),
(1247, '$2b$04$qIFX.Qu7qj/PMuMDiWVNPeYDvI6w154vZ/xe8vdJWtoyhkCvWT/5y', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 00:01:22.059000', '2025-11-30 23:35:08.617000', 4, NULL, '109.164.51.14'),
(1248, '$2b$04$YRZ0wsLhikRDAo75ktpKPe9v8RUF7KytvS7UBBpxqpiB4ajsb9z5q', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 14:39:09.306000', '2025-12-01 00:10:35.238000', 4, NULL, '109.164.51.14'),
(1249, '$2b$04$lnA.53B.ekAnfksn1UAOmekc28tvvGcZqL9YnOqaftqkUCsQXUO7e', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 14:56:47.079000', '2025-12-01 14:41:47.080000', 4, NULL, '109.164.51.14'),
(1250, '$2b$04$cuA8ejsJsgeiwMwsi1Ka6uFqpWC9Wz07RI1UmE2lemP1Oa1T6EOpC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 14:56:50.830000', '2025-12-01 14:41:50.830000', 4, NULL, '109.164.51.14'),
(1251, '$2b$04$Im.6Y30eJpGNgEt9ZMWrn.Fja28Vid1qT/LA9jbsEfszF6y7/FZgq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 15:13:37.553000', '2025-12-01 14:42:12.876000', 4, NULL, '109.164.51.14'),
(1252, '$2b$04$8Lv9SYYKjH3i4ydjBzEMwu3CrMVNmiFen2pLR1futRzefC8O9bAym', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 15:51:09.930000', '2025-12-01 15:35:01.505000', 4, NULL, '109.164.51.14'),
(1253, '$2b$04$4UPkHmHTc9xsGZ3kYye0leIuq.SvSUyzwyQAFbIED3UqnSrnrXFeG', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 16:12:32.734000', '2025-12-01 15:51:16.499000', 4, NULL, '109.164.51.14'),
(1254, '$2b$04$HkuNzP8v5oBZvkQY.U8xnuqcEkkrMohEbuFLHzy60dTHYIQxI0xRa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 22:37:17.034000', '2025-12-01 21:31:44.083000', 4, NULL, '109.164.51.14'),
(1255, '$2b$04$Cn6RM0InMtzOLc2x4Wir3./ScyChNIivS52v81.41UrI0TLAaXNIW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 22:55:06.279000', '2025-12-01 22:38:19.335000', 4, NULL, '109.164.51.14'),
(1256, '$2b$04$PKss.D95bOz4HI4MBQKbDe/Qa0tdI0FfIWQ/GL3MU.hrpJr1S/11O', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 23:01:09.657000', '2025-12-01 22:55:11.348000', 2, NULL, '109.164.51.14'),
(1257, '$2b$04$kqpalya8sOqTYfGUDnEETexjjgMKXVZpYfFzItp4s2rUqfoMGrD..', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 23:02:18.576000', '2025-12-01 23:01:13.358000', 4, NULL, '109.164.51.14'),
(1258, '$2b$04$mHQ3qgRG8CsYaUkjHmBbxOWr4RYMn6oDZXPkRN8Oz3qhUbTUXQQR.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-01 23:14:32.969000', '2025-12-01 23:02:22.332000', 2, NULL, '109.164.51.14'),
(1259, '$2b$04$IqTQ/O7TD4iPAnRlS6B4o.IFObXTFB29li7CVueGeGOAs9PxZMcQ.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-02 00:17:09.086000', '2025-12-01 23:14:36.291000', 4, NULL, '109.164.51.14'),
(1260, '$2b$04$uPl2ZRwDlodZowjphBO9POeQ/AXyLGEA.71V6wIoujAUw0Sec47wS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-02 00:17:23.008000', '2025-12-02 00:17:11.690000', 1, NULL, '109.164.51.14'),
(1261, '$2b$04$Wxc4SeSTcGF1TKQ1eZNvmOVIhLLVNHzYokOzOxJ/A8Werv.I8Gp7C', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-02 00:32:31.284000', '2025-12-02 00:17:27.071000', 3, NULL, '109.164.51.14'),
(1262, '$2b$04$PUXu9aOUYSJVyEfYbrH.OezsZMu.3FBrrgbSEwR5R7VZEGTxHi0aa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-02 01:25:06.558000', '2025-12-02 01:10:01.476000', 4, NULL, '109.164.51.14');
INSERT INTO `tokens` (`tokenId`, `token`, `password`, `userAgent`, `expires`, `created`, `userId`, `socket`, `ip`) VALUES
(1263, '$2b$04$HfSYs.CaBfPhp/6pJOSZhes/uMxm6/GFnxxZLf7LqiEFaXumYTPW2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 08:46:28.104000', '2025-12-02 08:07:19.760000', 4, NULL, '195.113.101.227'),
(1264, '$2b$04$jdHb10YKALl1K7q/MyBLmOKKkj8xAZj8K2qVuACuC6jEwiGlkXQpe', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 09:11:40.403000', '2025-12-02 08:46:31.171000', 1, NULL, '195.113.101.227'),
(1265, '$2b$04$PhDnKewpD3iP9chYlzKiguc9hxvb5Js29jWRBQV8Croh8xd3Eze.K', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 10:40:59.555000', '2025-12-02 09:11:42.893000', 4, NULL, '195.113.101.227'),
(1266, '$2b$04$djFwY7boaPU9rhOk3GxDv.fIir/aTKsClKK6YBdFbwaHKsEjzXpDm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 11:33:30.966000', '2025-12-02 11:02:38.332000', 4, NULL, '195.113.101.227'),
(1267, '$2b$04$OG2k85OmnojsLiD7P3J1VOv1qTDose3eW4h2.oj7kDHmxMDkFGwQO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 12:35:09.683000', '2025-12-02 11:50:03.694000', 4, NULL, '195.113.101.227'),
(1268, '$2b$04$T4hUF1Uup4Q95.oQdyg0W.iR3FTDzirEy8PLNx8cEuM.OLQp7Ypsy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-02 14:23:38.319000', '2025-12-02 13:27:53.874000', 4, NULL, '195.113.101.227'),
(1269, '$2b$04$SM7jKLtrIT7EOSf3j/nIFujeb.jTW43XjD00TcuXDO9..Rq5ebX2e', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:10:18.275000', '2025-12-03 09:10:07.005000', 4, NULL, '195.113.101.227'),
(1270, '$2b$04$I3EOu6eschYONmlmfuHjgeQkiEAW4wkg/G03c2u0.zuGFRs1LaMSC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 10:43:27.451000', '2025-12-03 10:10:24.357000', 4, NULL, '195.113.101.227'),
(1271, '$2b$04$UaDyOt1F9eDFyweLbVoe8.B9OuVaqsjsAsueZupVsa1hmTf1Fgg1K', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 11:08:38.211000', '2025-12-03 11:00:46.201000', 4, NULL, '195.113.101.227'),
(1272, '$2b$04$Zf1KOqj/m.C53iDSdWbdf.m2IenMRJ4GATR.ZULNULmpO/fZKgQ1O', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 11:33:59.018000', '2025-12-03 11:08:42.161000', 1, NULL, '195.113.101.227'),
(1273, '$2b$04$1CMZpMEAwFvCx7rb/kcMZuvqrzsbBaLWe2XiMzxblsw1/q2oBsWji', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 11:34:07.301000', '2025-12-03 11:34:02.922000', 4, NULL, '195.113.101.227'),
(1274, '$2b$04$JZ4XoGjlVf/aPhgWmv0oO.m2vrjGHWCFl.fduX090lO.ku8W/iT3i', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 11:34:54.495000', '2025-12-03 11:34:33.331000', 3, NULL, '195.113.101.227'),
(1275, '$2b$04$BZQ0y1WTKYvZ3CZuoztsOeH6zHWC9AosbS07aYuvO7TSpDsD0knDS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 12:03:27.767000', '2025-12-03 11:34:58.146000', 4, NULL, '195.113.101.227'),
(1276, '$2b$04$EPlbph782tdlegbd7oNTJu3O2kKSN/hCFskqDCVBvi/5C/mdbqSLq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 12:20:07.881000', '2025-12-03 12:11:44.147000', 4, NULL, '185.184.192.200'),
(1277, '$2b$04$635s8o/6dOprhbKbuOiFyuX4LV3twh/ygh3B38AUkRkYAsTs1upF2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 12:44:55.851000', '2025-12-03 12:20:10.475000', 4, NULL, '185.184.192.200'),
(1278, '$2b$04$ZYJ7EByP68I8SiUO/ctO.eOVLsFtcsvEwXOxRmdeAByp5T681o8Rm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 14:38:32.281000', '2025-12-03 14:15:45.838000', 4, NULL, '195.113.101.227'),
(1279, '$2b$04$whFNKeFN59aMGPohbbgPKOCN.qe5txxZZ0LXoNK1OEr1UPXky8P3a', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 15:09:29.473000', '2025-12-03 14:40:59.274000', 4, NULL, '195.113.101.227'),
(1280, '$2b$04$ztc5N0ddKM.CdSQS2T/5eO.Z7tFpaeXEErKsAy2I2CsHxEd92BJ8m', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 21:31:25.299000', '2025-12-03 20:11:31.266000', 4, NULL, '109.164.51.14'),
(1281, '$2b$04$N4aXrcNjLSc9fr6DAkrPeetUlcdVEh16ePxpVGbD9vDzYpDaaK7K.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 21:32:03.285000', '2025-12-03 21:31:29.545000', 1, NULL, '109.164.51.14'),
(1282, '$2b$04$mHhi0vN3iPUeO2loGjdANOYY9bC2P773ZaD97q7iOsCoU5aK3hf5K', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 23:30:28.637000', '2025-12-03 21:32:07.749000', 1, NULL, '109.164.51.14'),
(1283, '$2b$04$rRHeoNBQV0wAKJfJ3ZVNiOickUSibtcgEMlksfEOD9qBet1TSeqWi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-03 23:37:53.998000', '2025-12-03 23:31:48.566000', 4, NULL, '109.164.51.14'),
(1284, '$2b$04$pLC2FRUf4pKhlukO4RXAheAgt0CGx9PHk0yGHeuKnVl.yfgDIQSya', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 01:41:27.206000', '2025-12-03 23:41:19.096000', 4, NULL, '109.164.51.14'),
(1285, '$2b$04$4CyLsEznQ9TfwtZaIla.lOK1eEYYnD61BU/rxTcH5D0eaVfrFdmY.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 16:29:54.145000', '2025-12-04 16:01:18.236000', 4, NULL, '109.164.51.14'),
(1286, '$2b$04$a8j13vs3VN7vn0Re3pp9KeEoHcuINNpOgQtPyx/lNTMk4cArg0vAK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 19:13:09.691000', '2025-12-04 16:46:35.891000', 4, NULL, '109.164.51.14'),
(1287, '$2b$04$EP39nDicXRxFwTc0AqMcTuaY/JYenhH2Qu2CBI4x5nm6ERhmjiob2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 19:29:49.900000', '2025-12-04 19:13:44.005000', 4, NULL, '109.164.51.14'),
(1288, '$2b$04$gc7LzdTRogBIh0rdsq2zuO2aWXKmBRQik/yXFSzmtJJJb7MHYN4r6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 20:12:43.849000', '2025-12-04 19:29:53.131000', 4, NULL, '109.164.51.14'),
(1289, '$2b$04$iMFLilVTkC.V49xD/ISeLeU30JorixtBM9199.DZ/IskBYyhQfwSS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 20:42:47.752000', '2025-12-04 20:12:49.221000', 4, NULL, '109.164.51.14'),
(1290, '$2b$04$0sF5hNmF5z8gKU8lkue7T.gPSljyBu3mUmGXrEewb2zGdQimL0vg6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 20:45:49.216000', '2025-12-04 20:45:00.105000', 4, NULL, '109.164.51.14'),
(1291, '$2b$04$YU4dWJ3hzFIjePI5DHJ0V.tnVUWTiOmG7SMT40H/oo1MMCnuVwgi6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:00:08.216000', '2025-12-04 20:46:36.740000', 4, NULL, '109.164.51.14'),
(1292, '$2b$04$CSbUhZygzN2GewMusB1/TOuTZMTu4VSNDoBssgFETvMbAE5SYlJzu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 21:49:41.340000', '2025-12-04 21:00:20.598000', 4, NULL, '109.164.51.14'),
(1293, '$2b$04$S494J6g1FoXmceHm0UnJk.Ng5ExTC.krI2z88u.k07CsVPsNHaN3q', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 22:03:51.977000', '2025-12-04 21:49:44.011000', 1, NULL, '109.164.51.14'),
(1294, '$2b$04$jvmRDdfpEm460TahPGY9Q.F1GDZdQ0O.Xdsui9O/5tA4OKU2X6ZRe', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 22:04:01.368000', '2025-12-04 22:03:55.982000', 1, NULL, '109.164.51.14'),
(1295, '$2b$04$CemskGjvpYvwFKkA3gDnXuxs0WmUAsS.GEMkc.S5m2sfEI2QbPVKC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 22:06:26.826000', '2025-12-04 22:04:03.217000', 4, NULL, '109.164.51.14'),
(1296, '$2b$04$.npVdQ.KLWmkHOhEZpOOeujWyAj3hJc7YYlhVRUdUFrn.h3oxlvWS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 22:06:56.623000', '2025-12-04 22:06:31.161000', 3, NULL, '109.164.51.14'),
(1297, '$2b$04$ucUqmU4vRWIsLGVlsWVYYeyROs5cWplLGeAQ5eoKA0k.mdsKWNmfu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 22:08:22.906000', '2025-12-04 22:07:00.775000', 1, NULL, '109.164.51.14'),
(1298, '$2b$04$MQRDQ6jepS1x3Tfft.KVeeA13JkJW9hk553MehsIF0iV7eX5wFrkW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-04 23:19:04.115000', '2025-12-04 22:08:25.498000', 4, NULL, '109.164.51.14'),
(1299, '$2b$04$Fa2ErjiXiEi5ZXVAUcFhzezegYSlSnxfgQr8GnXsmQ8CZ7uklmbZy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 00:36:10.571000', '2025-12-04 23:25:25.265000', 4, NULL, '109.164.51.14'),
(1300, '$2b$04$UDhGSfd5yXsV7at9bKTguO/fSrcythNHY0P73NhcCPAp/.hR7.sHe', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 00:51:16.581000', '2025-12-05 00:36:13.345000', 4, NULL, '109.164.51.14'),
(1301, '$2b$04$7gAcadk/wlszl1mWvMaYH.37NK5hdqUJnqmBs130urYLo/fcc2hu6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 15:12:38.626000', '2025-12-05 14:57:38.425000', 4, NULL, '109.164.51.14'),
(1302, '$2b$04$z6RuB95wFjLgDb2rRVb5fuEXboruZ4jg8dX6hOZ.lRMk9ukHr2NPe', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 15:19:19.195000', '2025-12-05 15:17:49.798000', 1, NULL, '109.164.51.14'),
(1303, '$2b$04$R6zJo85mEl7h90CN0ZL18OGP3OLFyuYiPF5w.J/7tNrBFFJbqW8F.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 18:02:33.986000', '2025-12-05 16:04:40.445000', 4, NULL, '109.164.51.14'),
(1304, '$2b$04$kk37tbG8qCFwi4zr9FoByu9klvMtMlhFLgox/Qg5zO3v2eT78g9uO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 18:12:59.094000', '2025-12-05 18:12:53.096000', 1, NULL, '109.164.51.14'),
(1305, '$2b$04$qJsogXKMhz0XCXj0v9TkY.uBc.BTnqcwpPzN4bj2ZU0RzoeOqFbxa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 18:16:04.047000', '2025-12-05 18:15:28.613000', 4, NULL, '109.164.51.14'),
(1306, '$2b$04$0bkvN8pnU.Q0yMewsXCH.uSFziv6GK6YyiWVWHGF6gHHdKn.5TMwS', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 18:38:12.167000', '2025-12-05 18:17:43.075000', 4, NULL, '109.164.51.14'),
(1307, '$2b$04$eaRpnjxyLvKHWbtOps6CZe2E9qjzDAaswZSqbqyQrczCDiXpMIi9u', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 18:49:05.588000', '2025-12-05 18:48:55.701000', 4, NULL, '109.164.51.14'),
(1308, '$2b$04$OfhDlthurMYnWBrPMqqsGORQxLCTHedvewRdHYBMFyfvkkJUYTiEm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 20:00:22.769000', '2025-12-05 18:49:08.119000', 1, NULL, '109.164.51.14'),
(1309, '$2b$04$5D7eKq.1TRERe.bgggv8gOoWUvWXFZf5MQ14D34NSe47s6vsIbjAm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 20:18:49.476000', '2025-12-05 20:00:25.989000', 4, NULL, '109.164.51.14'),
(1310, '$2b$04$A/msr9UMir7Ll3pO62eHY.tNXIkoPFDkMhPLhkuKM8fc2V99E2F2q', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-05 21:29:43.322000', '2025-12-05 20:36:19.201000', 4, NULL, '109.164.51.14'),
(1311, '$2b$04$8QEN8YS6eBMlblIHZP1hUePyClGmokqX4LgbpgfYDgOAEiakTZPy6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 00:36:04.524000', '2025-12-05 21:39:26.439000', 4, NULL, '109.164.51.14'),
(1312, '$2b$04$Fvh5hwcpSGNxvmE77G0gZOPKZa5z8/fHI9VCdnFfDaf5vlKIf0Mf6', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 11:30:47.426000', '2025-12-06 10:40:06.373000', 4, NULL, NULL),
(1313, '$2b$04$viKCM2OTMbdg/WskKfK5bO9DyNyXf3hUglV5YSS.QRts8M7fZg9Ka', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 19:06:58.320000', '2025-12-06 18:51:50.285000', 4, NULL, '109.164.51.14'),
(1314, '$2b$04$WTFrod2IHxy3SFlswMDj/.UqnSmPkIEshitU2uH4i1TAx.xEie2zm', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 21:39:31.735000', '2025-12-06 19:50:42.877000', 4, NULL, '109.164.51.14'),
(1315, '$2b$04$NVk7wN/Ori5iJgVTxlJoFut7.1356RjXsIPx5kxlk3iMiK.9fjT1y', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 22:08:19.751000', '2025-12-06 22:08:17.854000', 4, NULL, '109.164.51.14'),
(1316, '$2b$04$4e2Bov3AMaaPlE6A9tfIV.IFOlTPV/Ep6rus8RGghbQSvcm7DJ3Re', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 22:10:09.941000', '2025-12-06 22:10:07.930000', 4, NULL, '109.164.51.14'),
(1317, '$2b$04$6O./4kZHrAG/y0mveiX1OuPNCYXTpDZcaQhFi8KKaolJCcselKdRO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 22:28:35.775000', '2025-12-06 22:10:48.718000', 4, NULL, '109.164.51.14'),
(1318, '$2b$04$sC5SlFeyIB5wnA8W51gBYuvdemMkoeIoCwFE5GFzqHG34j5mFbun.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 23:30:18.160000', '2025-12-06 22:41:27.472000', 4, NULL, '109.164.51.14'),
(1319, '$2b$04$gjFqK3Ur5KYIDaAGDnFU6exvgPQihYT5hdNpG.rWqvoW22XO5BOVi', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 23:39:04.849000', '2025-12-06 23:30:21.178000', 1, NULL, '109.164.51.14'),
(1320, '$2b$04$/1KL2JeQWP8maVhfTfai0e3gzreTOPFvdAhEsmOeXspVPqcDVF2Aa', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-06 23:58:46.419000', '2025-12-06 23:39:10.353000', 4, NULL, '109.164.51.14'),
(1321, '$2b$04$0BEMgpP19NI3pl9hGOPMguz/5lWZRBEhtTiDqjVY62WmqoihroVAO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 00:03:28.988000', '2025-12-06 23:43:47.066000', 1, NULL, '109.164.51.14'),
(1322, '$2b$04$WItH4I2ovw3siJXNpzy/ju5r4GCsrC12J5r6OkOiBnYuhfx1FDCd2', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 00:23:39.577000', '2025-12-07 00:06:13.775000', 1, NULL, '109.164.51.14'),
(1323, '$2b$04$.AqNyLBHOmyDeWoPCQYyPe54Qgr8iP8IrBNCQDae8oFpNdv2XEhLC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 13:28:39.454000', '2025-12-07 11:24:35.067000', 4, NULL, '109.164.51.14'),
(1324, '$2b$04$YrWNAiz.NOJ9edA4KnZ1kupj1Ywl.f4QKQVIEb7j7cR6/8IC.ACGq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:13:25.137000', '2025-12-07 18:13:21.807000', 4, NULL, '109.164.51.14'),
(1325, '$2b$04$NANE2qNzIxl71UEqNLBwF.WGXlcHPVwVwPlXSerF6vLmNrjaaNbsu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 18:58:21.029000', '2025-12-07 18:46:45.197000', 4, NULL, '109.164.51.14'),
(1326, '$2b$04$8e.y/ibgqngMBJm2HGIxDejZvw5FvneM1MvbrlpIouZWa6l.d8wxW', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 19:18:36.349000', '2025-12-07 19:03:36.349000', 4, NULL, '109.164.51.14'),
(1327, '$2b$04$oA03gP.OWFiD073cWgI3Yesjgb62t6SOH6ulx69jzy11osCgofbVC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 19:07:50.703000', '2025-12-07 19:07:48.708000', 4, NULL, '109.164.51.14'),
(1328, '$2b$04$3V9hQap7DAz1U18dJGWBEuzcNpYR34e6Tjdwxa5L5EA6uzbBJDSeC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 19:07:56.843000', '2025-12-07 19:07:54.999000', 4, NULL, '109.164.51.14'),
(1329, '$2b$04$qhJqJxYSub8C67vJD64/7u4tVsbjgZLXRQFUMKciDW9golyMl.W76', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 19:13:11.839000', '2025-12-07 19:08:00.837000', 1, NULL, '109.164.51.14'),
(1330, '$2b$04$cmevmVxjoAy1MQdSHkTOheIr.P2.gYj4BrmJogKcqNmdYSsXKAsdK', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 20:09:21.874000', '2025-12-07 19:18:23.255000', 4, NULL, '109.164.51.14'),
(1331, '$2b$04$KovlFdFBgordi7758wtpJuqgauol8V1vv5nPLv9zqFVdieE0ACq6G', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 20:57:52.900000', '2025-12-07 20:11:27.654000', 4, NULL, '109.164.51.14'),
(1332, '$2b$04$shOatBbdsBAZtZW3oZQbfuTEzTWt46ioIMNERgrzZW64lBUvTbnzu', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 21:59:58.409000', '2025-12-07 20:59:07.775000', 4, NULL, '109.164.51.14'),
(1333, '$2b$04$RdW9at2iJL8sRxNyTUa91OOu4XvDqA/PJN9yXl5yZbdne.2.BSenq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-07 23:24:20.413000', '2025-12-07 23:05:45.399000', 4, NULL, '109.164.51.14'),
(1334, '$2b$04$V6wTOTb26mEuZUjIzpfZDeeRUebUHJOMp9KxaT8pZ61XZKV//lhuq', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-08 00:03:14.608000', '2025-12-07 23:45:54.149000', 4, NULL, '109.164.51.14'),
(1335, '$2b$04$oOAVnnNN7ScKunCUhPZSDelMYULzHTI5ByKjZYc9vJZXvFyGz7XGC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', '2025-12-08 00:03:41.103000', '2025-12-07 23:48:15.314000', 4, NULL, '109.164.51.14'),
(1336, '$2b$04$SD.9M1AXNmXUEq2Re3CWL.mznaTKOkmRO74PiKu7B2tF3j8RVhNhm', 1, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', '2025-12-08 00:04:04.557000', '2025-12-07 23:48:41.502000', 4, NULL, '109.164.51.14'),
(1337, '$2b$04$yOLPZLCEiatunULeCRt3pugWwoVw2jwQSKcu9VXjg.LjhYwxfr0ke', 1, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', '2025-12-08 00:10:52.343000', '2025-12-07 23:49:04.966000', 4, NULL, '109.164.51.14'),
(1338, '$2b$04$X3gPjH7t9MzJrYcpeDXoj.R.ZvokjKZhXyT5L3yZKPjAeXn5eale2', 1, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1', '2025-12-08 00:22:13.170000', '2025-12-07 23:55:53.008000', 4, NULL, '109.164.51.14'),
(1339, '$2b$04$HlCrqrauGecNvqho7DICEu8EzczXBMBvmFlGPhoKj1SSYbveyu7n.', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 08:10:23.847000', '2025-12-08 08:10:12.650000', 4, NULL, '195.113.101.227'),
(1340, '$2b$04$H1vXaDJKWpd.J7/9tC.ZQewiTBvukxL6IFnvhVeB/RsRvweOEVgVy', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 09:23:51.945000', '2025-12-08 09:23:41.332000', 4, NULL, '195.113.101.227'),
(1341, '$2b$04$rFWZjobYMr9AZVfdxKAUsexEUFc5R4Gcqw5ue2jGeKeKuAWKkrl5i', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 09:24:50.392000', '2025-12-08 09:23:55.281000', 1, NULL, '195.113.101.227'),
(1342, '$2b$04$Twc7IJQKOubnJYBAU6P72.E2S1Rx3tthGCExCjvS9A64pxrng3ToC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 09:31:13.432000', '2025-12-08 09:24:53.325000', 4, NULL, '195.113.101.227'),
(1343, '$2b$04$Tf9QjDZHUqShB0UbwuemcOcHj/8hJ5AnLiQ5i2EPMjNX8dMClTjwC', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 09:40:42.768000', '2025-12-08 09:31:17.120000', 2, NULL, '195.113.101.227'),
(1344, '$2b$04$gTRhvQNZso3n4Y5ZEOyA4O8GqB8vAAoKZY/uVflaEkI5qtWSGthbO', 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 10:42:44.993000', '2025-12-08 10:07:38.934000', 4, NULL, '185.100.234.183');

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_companies`
--

CREATE TABLE `traineeship_companies` (
  `companyId` int(11) NOT NULL,
  `name` text NOT NULL,
  `addressOffice` int(11) NOT NULL,
  `addressTrainee` int(11) NOT NULL,
  `countryCode` varchar(2) NOT NULL,
  `ico` text NOT NULL,
  `dic` text NOT NULL,
  `vatId` text NOT NULL,
  `web` text DEFAULT NULL,
  `rp_firstName` text DEFAULT NULL,
  `rp_lastName` text DEFAULT NULL,
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

INSERT INTO `traineeship_companies` (`companyId`, `name`, `addressOffice`, `addressTrainee`, `countryCode`, `ico`, `dic`, `vatId`, `web`, `rp_firstName`, `rp_lastName`, `phone`, `email`, `status`, `requested`, `created`, `contact`, `description`, `activity`, `equipment`) VALUES
(1, 'Napicu.eu', 1, 1, 'CZ', '69696969', 'CZ69696969', '', 'napicu.eu', 'Napicu', 'Člověk', '+37457812331', 'admin@napicu.eu', 'approved', '2025-01-01 22:49:42.000000', '2024-10-01 16:35:00.000000', NULL, 'KOMPENY DESKRIPŠON', 'Aktivitaaaaa', NULL),
(2, 'Lupták s.r.o.', 1, 1, 'CZ', '77777777', 'CZ77777777', '', 'luptak.cz', 'Lukáš', 'Němec', '', '', 'approved', '2024-08-02 20:21:09.125251', '2024-08-11 16:35:06.000000', NULL, NULL, NULL, 'FILIPA POTŘEBUJETE'),
(3, 'Zatka s.r.o.', 1, 1, 'CZ', '11111111', 'CZ11111111', '', 'zatka.cz', 'Pan', 'Zatka', '', '', 'approved', '2024-11-20 21:21:09.125251', '2024-12-08 17:35:10.000000', NULL, NULL, NULL, NULL),
(6, 'WEDOS Internet, a.s.', 1, 1, 'CZ', '28115708', 'CZ28115708', '', 'vedos.cz', 'Josef', 'Grill', '777222543', 'hosting@wedos.com', 'approved', '2025-04-05 08:30:31.000000', '2025-04-05 08:30:31.000000', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_company_rating`
--

CREATE TABLE `traineeship_company_rating` (
  `reviewId` int(11) UNSIGNED NOT NULL,
  `companyId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `rating` decimal(10,1) NOT NULL,
  `experience` text DEFAULT NULL,
  `would_recommend` tinyint(1) NOT NULL DEFAULT 1,
  `is_anon` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_company_rating`
--

INSERT INTO `traineeship_company_rating` (`reviewId`, `companyId`, `studentId`, `rating`, `experience`, `would_recommend`, `is_anon`, `created_at`) VALUES
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
  `tscsId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `scopeId` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_company_scopes`
--

INSERT INTO `traineeship_company_scopes` (`tscsId`, `companyId`, `scopeId`, `status`) VALUES
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
  `trConfig` int(11) NOT NULL,
  `isActivated` tinyint(1) NOT NULL DEFAULT 1,
  `manager` int(11) DEFAULT NULL,
  `defaultIgnoreDays` text DEFAULT NULL,
  `allowMap` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_config`
--

INSERT INTO `traineeship_config` (`trConfig`, `isActivated`, `manager`, `defaultIgnoreDays`, `allowMap`) VALUES
(1, 1, 3, NULL, 1);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_diary`
--

CREATE TABLE `traineeship_diary` (
  `diaryId` int(11) NOT NULL,
  `trWeekId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
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
  `instructorId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `firstname` text NOT NULL,
  `lastname` text NOT NULL,
  `email` text DEFAULT NULL,
  `phone` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `status` enum('active','deleted') NOT NULL DEFAULT 'active',
  `addedBy` int(11) DEFAULT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_instructors`
--

INSERT INTO `traineeship_instructors` (`instructorId`, `companyId`, `firstname`, `lastname`, `email`, `phone`, `role`, `status`, `addedBy`, `created`, `last_updated`) VALUES
(1, 2, 'Lukáš', 'Němec', NULL, NULL, NULL, 'active', 11, '2025-03-16 18:30:31.804432', '2025-11-09 21:46:44'),
(2, 1, 'Pavel', 'Vyroubal', 'pa.vyroubal@napicu.eu', '607444222', 'Vývojář', 'active', 11, '2025-03-16 18:30:31.804432', '2025-11-09 22:25:42'),
(3, 1, 'Kokot', 'Leo', 'kokot.leo@napicu.eu', '772362488', 'Vedoucí směny', 'active', 4, '2025-11-09 22:18:02.883000', '2025-11-09 22:23:14'),
(4, 1, 'KOKOTINEC', 'babinec', 'kokot@napicu.eu', '+421444666222', 'Kokot na recepci', 'deleted', 4, '2025-11-09 22:19:30.848000', '2025-11-10 11:21:31'),
(5, 1, 'Michal', 'Mácha', 'mmacha@kokot.sps-pi.cz', '123456489', 'Spáč', 'active', 4, '2025-11-13 11:05:15.318000', '2025-11-13 11:05:35');

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_students`
--

CREATE TABLE `traineeship_students` (
  `studentId` int(11) NOT NULL,
  `traineeship` int(11) NOT NULL,
  `company` int(11) NOT NULL,
  `instructor` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_students`
--

INSERT INTO `traineeship_students` (`studentId`, `traineeship`, `company`, `instructor`) VALUES
(1, 1, 1, 4),
(1, 2, 1, 3);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_weeks`
--

CREATE TABLE `traineeship_weeks` (
  `trWeekId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `name` text NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `ignoredDays` text DEFAULT NULL,
  `state` enum('active','canceled') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_weeks`
--

INSERT INTO `traineeship_weeks` (`trWeekId`, `groupId`, `name`, `start`, `end`, `ignoredDays`, `state`) VALUES
(1, 10, '1. Praxe sk. 10', '2025-12-22', '2026-01-02', '6,7', 'active'),
(2, 10, '', '2025-01-13', '2025-01-24', '6,7', 'active');

-- --------------------------------------------------------

--
-- Struktura tabulky `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `person` int(11) NOT NULL,
  `username` text NOT NULL,
  `password` int(11) NOT NULL,
  `manager` int(11) NOT NULL DEFAULT 0,
  `principal` tinyint(1) NOT NULL DEFAULT 0,
  `theme` int(11) NOT NULL,
  `locale` text NOT NULL,
  `passwordChanged` date DEFAULT NULL,
  `recommendChangePassword` tinyint(1) NOT NULL DEFAULT 0,
  `cookies` tinyint(1) NOT NULL DEFAULT 0,
  `school` int(11) NOT NULL,
  `autoSelectNextWeek` tinyint(1) NOT NULL DEFAULT 1,
  `fastlogin` tinyint(1) NOT NULL DEFAULT 1,
  `levels_exp` int(11) NOT NULL DEFAULT 0,
  `2fa` tinyint(1) NOT NULL DEFAULT 0,
  `2fa_secret` text DEFAULT NULL,
  `2fa_activated` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '\'{}\''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `users`
--

INSERT INTO `users` (`userId`, `person`, `username`, `password`, `manager`, `principal`, `theme`, `locale`, `passwordChanged`, `recommendChangePassword`, `cookies`, `school`, `autoSelectNextWeek`, `fastlogin`, `levels_exp`, `2fa`, `2fa_secret`, `2fa_activated`, `avatar`) VALUES
(1, 1, 'kosik', 1, 0, 0, 1, 'cs', '2025-10-14', 0, 1, 1, 1, 1, 745, 0, 'NZPHEHZSNRUROPQX', '2025-10-14 09:35:04', '{\"seed\":\"iyGs1BUjIryJVZDk\",\"type\":\"avataaarsNeutral\",\"eyebrows\":\"default\",\"eyes\":\"default\",\"mouth\":\"default\"}'),
(2, 2, 'pizinger', 1, 0, 0, 0, 'cs', NULL, 0, 1, 1, 1, 1, 0, 0, 'HEGBKGSXDNISYF3B', '2025-06-27 14:33:48', '{\"seed\":\"A7jrlqXppJ5pO0u7\",\"type\":\"avataaarsNeutral\",\"eyebrows\":\"default\",\"eyes\":\"default\",\"mouth\":\"default\"}'),
(3, 33, 'testrodic', 1, 0, 0, 1, 'cs', NULL, 0, 2, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}'),
(4, 4, 'admin', 1, -1, 1, 2, 'cs', '2025-11-22', 0, 1, 1, 1, 1, 0, 0, 'CE3XAJJTLNEBMFQE', '2025-10-17 06:45:31', '{}'),
(5, 24, 'student1', 1, 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}'),
(6, 25, 'student2', 1, 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}'),
(7, 26, 'student3', 1, 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}');

-- --------------------------------------------------------

--
-- Struktura tabulky `users_backup_codes`
--

CREATE TABLE `users_backup_codes` (
  `ubcId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `code` varchar(9) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `used_at` timestamp NULL DEFAULT NULL,
  `used_ip` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `users_credentials`
--

CREATE TABLE `users_credentials` (
  `id` int(11) NOT NULL,
  `credential_id` text NOT NULL,
  `userId` int(11) NOT NULL,
  `public_key` text NOT NULL,
  `counter` int(11) NOT NULL,
  `device_name` text NOT NULL,
  `device_type` enum('singleDevice','multiDevice') NOT NULL DEFAULT 'multiDevice',
  `transports` text NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used` timestamp NULL DEFAULT NULL,
  `backed_up` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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

--
-- Vypisuji data pro tabulku `users_resetpassword`
--

INSERT INTO `users_resetpassword` (`user_resetpassword_id`, `email_token`, `user_id`, `email`, `created_at`, `expires_at`, `otp_code`, `ip`, `user_agent`) VALUES
(1, '631f37c0-4d32-4a98-b5e8-e45f1d35021e', 1, NULL, '2025-10-12 19:23:00', '2025-10-12 19:38:00', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(2, '7f995015-6f19-4950-8dbc-0edc49ce8852', 1, NULL, '2025-10-12 19:25:43', '2025-10-12 19:40:43', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(3, '9e8d8a22-2783-482c-a8e3-0415e9781f84', 1, NULL, '2025-10-12 19:32:56', '2025-10-12 19:47:56', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(4, '396bcb2f-0b75-46f7-ae19-d8f4b4be3e8d', 1, NULL, '2025-10-12 19:35:31', '2025-10-12 19:50:31', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(5, '212d6f24-b769-4a2f-a39f-66c120bb4f58', 1, NULL, '2025-10-12 19:36:10', '2025-10-12 19:51:10', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(6, '2a759c26-ab72-417e-80f2-f6ac28d43e15', 1, NULL, '2025-10-12 19:36:13', '2025-10-12 19:51:13', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(7, 'debab124-43b2-4c6f-9cdf-a255543719f3', 1, NULL, '2025-10-12 19:37:53', '2025-10-12 19:52:53', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(8, 'fbf7bd6d-0711-4145-b623-fad8e57cc650', 1, NULL, '2025-10-12 19:37:54', '2025-10-12 19:52:54', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(9, '6ad3626b-39f2-4646-a8bc-9d8091b25c1c', 1, NULL, '2025-10-12 19:37:55', '2025-10-12 19:52:55', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(10, 'f9d0c971-c2b3-4342-8ad2-f1ee27185d03', 1, 'jkosik@sps-pi.com', '2025-10-12 20:27:23', '2025-10-12 20:42:23', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(11, 'ee02bcdc-ccfe-40dc-a10e-e089247860eb', 1, NULL, '2025-10-12 20:54:43', '2025-10-12 21:09:43', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(12, '3bb84135-dc6e-4f43-95aa-83588c234066', 1, NULL, '2025-10-12 21:12:30', '2025-10-12 21:27:30', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'),
(13, 'af894565-a699-458c-83ce-b17c44b0dae3', 1, 'jkosik@sps-pi.com', '2025-10-13 06:09:40', '2025-10-13 06:24:40', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(14, '38cbb072-f3c4-46a7-876d-0d201baf6b0a', 1, 'jkosik@sps-pi.com', '2025-10-13 06:14:50', '2025-10-13 06:29:50', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(15, 'f79cfc59-8438-4aeb-b94b-d82c9cb3beb7', 1, 'jkosik@sps-pi.com', '2025-10-13 06:16:13', '2025-10-13 06:31:13', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(16, '25c00e0d-c042-4c38-b254-bced9863a207', 1, 'jkosik@sps-pi.com', '2025-10-13 06:17:48', '2025-10-13 06:32:48', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(17, '7967cdbc-e8b4-491f-8b23-edb8b3e23a7b', 1, 'jkosik@sps-pi.com', '2025-10-13 06:20:17', '2025-10-13 06:35:17', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(18, 'bde769ff-c118-458b-bcac-7c4c42521299', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:01:30', '2025-10-13 07:16:30', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(19, 'c4ecc73f-3100-42de-a526-ad25a2e6b37b', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:12:37', '2025-10-13 07:27:37', 'B0TNLV2F', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(20, '4d2d9e91-9e74-492c-b49d-534bc5f01a12', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:29:03', '2025-10-13 07:44:03', 'V7PCHTEM', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(21, '82221e29-6509-4be7-931d-9a933a036ecd', 1, 'jkosik@sps-pi.com', '2025-10-13 07:33:06', '2025-10-13 07:48:06', '0Z62GXS8', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(22, '1ef1fb43-6a93-447d-bb65-269b81a03724', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:33:52', '2025-10-13 07:48:52', 'H12VJVS7', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(23, 'd9844afe-f8d9-459d-867f-6098ccce79a6', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:41:54', '2025-10-13 07:56:54', 'R9YLK8YY', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(24, 'bd29c42f-1a31-4b7a-88f5-a51610421f7f', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:43:00', '2025-10-13 07:58:00', 'KS4DTNJ6', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(25, 'fb7df663-37a5-4afe-a553-100878f8fba8', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:46:22', '2025-10-13 08:01:22', 'PCHJZBQW', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(26, 'd251f8de-eb21-4b75-8af2-757d6bdaa98b', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:53:01', '2025-10-13 08:08:01', '56AW29EB', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(27, 'b4f84d2b-0c8a-48dc-bfb2-bd900094f51c', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:53:26', '2025-10-13 08:08:26', '5DQ05KJR', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(28, '61281c34-4bd2-4a7d-b8b8-f887ead9efab', 1, 'jkosik@sps-pi.cz', '2025-10-13 07:55:33', '2025-10-13 08:10:33', 'SS9148OA', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(29, '3b619839-16aa-4859-97c9-ebce1a02be7e', 1, 'jkosik@sps-pi.cz', '2025-10-13 08:01:52', '2025-10-13 08:16:52', 'LJOR8LF9', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(30, '3e480133-594e-4746-9bd5-1d983824f5f4', 1, 'jkosik@sps-pi.cz', '2025-10-13 08:09:29', '2025-10-13 08:24:29', 'FVDZI5V8', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(31, '320eb0ac-dc59-4dcc-b1d2-9096d127d705', 1, 'jkosik@sps-pi.cz', '2025-10-13 08:16:14', '2025-10-13 08:31:14', 'JUPFLGZ8', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(33, '857ef990-ddd5-4cff-87fd-49b4abb3252b', 4, 'admin@example.com', '2025-10-13 08:27:02', '2025-10-13 08:42:02', 'VB025219', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(34, 'd8136f3e-5d9a-4f39-b463-062654e16b75', 4, 'admin@example.com', '2025-10-13 08:28:03', '2025-10-13 08:43:03', 'PU21MGXM', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(35, '1d369df7-d8c9-48ef-9a50-b15a8a7a4e8a', 4, 'admin@example.com', '2025-10-13 08:31:15', '2025-10-13 08:46:15', 'ALNSGYIK', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(36, '9cd37215-7ac3-47f5-9d49-c8577c72336c', 4, 'admin@example.com', '2025-10-13 08:33:24', '2025-10-13 08:48:24', 'Y2LKDTAQ', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(37, '0fefc4f7-102e-4e0d-9bb4-658242876d90', 4, 'admin@example.com', '2025-10-13 08:38:26', '2025-10-13 08:53:26', '8PDTA4L7', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(38, '72e8a618-d1f2-48da-ad14-28edfcf04b82', 4, 'admin@example.com', '2025-10-13 08:39:20', '2025-10-13 08:54:20', '7AI1DYEI', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(39, 'd143186d-ae1d-4ac0-ac35-1361876ee057', 4, 'admin@example.com', '2025-10-13 08:40:07', '2025-10-13 08:55:07', '4TKVZO9C', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(40, '5a53ca5d-69d5-4c05-96a1-fe4dffa44ed5', 4, 'admin@example.com', '2025-10-13 09:56:56', '2025-10-13 10:11:56', '2PBQA58B', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(42, '9857e4e1-c08f-4483-bc6d-37811f290259', 4, 'admin@example.com', '2025-10-13 10:07:25', '2025-10-13 10:22:25', 'TFEPKH1L', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(44, 'e2680fec-869e-404e-85e9-d969f70e242a', 4, 'admin@example.com', '2025-11-22 20:54:37', '2025-11-22 21:09:37', 'XB99GMBN', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(45, 'e729b32f-0647-4d75-af7d-efbf905e6976', 4, 'admin@example.com', '2025-12-05 17:16:51', '2025-12-05 17:31:51', '2MAYZ2XY', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(46, 'ef557aa9-33d5-41dd-b612-f7973fae297c', 4, 'admin@example.com', '2025-12-05 17:16:52', '2025-12-05 17:31:52', 'D9BQ21MF', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(47, '1be872ac-b431-4775-9816-f6f8518b180f', 4, 'admin@example.com', '2025-12-05 17:16:52', '2025-12-05 17:31:52', 'XEAFS8MQ', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(48, '703a334e-9049-4691-be1f-b04cab6e50f0', 4, 'admin@example.com', '2025-12-05 17:17:03', '2025-12-05 17:32:03', 'KST6IOP0', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(49, '85c53965-27c6-4f29-8c4a-c827e1120a1e', 4, 'admin@example.com', '2025-12-07 17:00:49', '2025-12-07 17:15:49', 'JA8G0SBU', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(50, 'adba4f35-d110-4d3a-9a22-ab0881142a65', 4, 'admin@example.com', '2025-12-07 17:17:55', '2025-12-07 17:32:55', 'X1OHWT7Y', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(51, '0d1c4a4d-0996-4b01-93a7-fb16ff40d2df', 4, 'admin@example.com', '2025-12-07 17:17:59', '2025-12-07 17:32:59', 'JIFPF4C7', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(52, 'a62cf68f-0bed-4fdd-bf6b-322be0860eb6', 4, 'admin@example.com', '2025-12-07 17:18:25', '2025-12-07 17:33:25', 'YJEBHZC2', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'),
(53, '2312117d-8787-4caa-a4c4-3b500e2601bc', 4, 'admin@example.com', '2025-12-07 17:20:29', '2025-12-07 17:35:29', 'GOKM7DQG', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0');

-- --------------------------------------------------------

--
-- Struktura tabulky `webauthn_challenges`
--

CREATE TABLE `webauthn_challenges` (
  `userId` int(11) NOT NULL,
  `challenge` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `expiresAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Vypisuji data pro tabulku `webauthn_challenges`
--

INSERT INTO `webauthn_challenges` (`userId`, `challenge`, `createdAt`, `expiresAt`) VALUES
(1, 'UI8a2w2v5OOUqjYSgDE8P8sMD3LFygb_l0plYLh62ro', '2025-06-27 14:48:11', '2025-06-27 14:53:11'),
(1, 'Muh3nO2PlunUQImDVo0XIZbgJ7ngiqaTOjgJZaB8pLk', '2025-08-17 12:17:25', '2025-08-17 12:22:25');

--
-- Indexy pro exportované tabulky
--

--
-- Indexy pro tabulku `absence`
--
ALTER TABLE `absence`
  ADD UNIQUE KEY `student` (`student`,`lesson`),
  ADD KEY `absence_ibfk_1` (`lesson`);

--
-- Indexy pro tabulku `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`addressId`),
  ADD KEY `cityId` (`cityId`);

--
-- Indexy pro tabulku `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`auditId`),
  ADD KEY `admin` (`userId`);

--
-- Indexy pro tabulku `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`building_id`);

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
  ADD PRIMARY KEY (`br_id`),
  ADD KEY `floor_id` (`floor_id`),
  ADD KEY `manager` (`manager`);

--
-- Indexy pro tabulku `building_rooms_occupancy`
--
ALTER TABLE `building_rooms_occupancy`
  ADD PRIMARY KEY (`bro_id`),
  ADD UNIQUE KEY `event_id` (`event_id`,`room_id`,`person_id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexy pro tabulku `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`cityId`),
  ADD KEY `countryId` (`countryId`);

--
-- Indexy pro tabulku `classbook`
--
ALTER TABLE `classbook`
  ADD PRIMARY KEY (`cbId`),
  ADD UNIQUE KEY `date` (`date`,`dayHour`,`groupId`),
  ADD KEY `subject` (`subject`),
  ADD KEY `teacher` (`teacher`),
  ADD KEY `room` (`room`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexy pro tabulku `classbook_notes`
--
ALTER TABLE `classbook_notes`
  ADD PRIMARY KEY (`classbook_note_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexy pro tabulku `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`classId`),
  ADD KEY `room` (`room`),
  ADD KEY `teacher` (`teacher`),
  ADD KEY `scopeId` (`scopeId`),
  ADD KEY `yearId` (`yearId`);

--
-- Indexy pro tabulku `class_service`
--
ALTER TABLE `class_service`
  ADD PRIMARY KEY (`csId`),
  ADD KEY `student` (`student`);

--
-- Indexy pro tabulku `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`countryId`);

--
-- Indexy pro tabulku `degrees`
--
ALTER TABLE `degrees`
  ADD PRIMARY KEY (`degreeID`);

--
-- Indexy pro tabulku `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`districtId`),
  ADD UNIQUE KEY `district` (`district`) USING HASH;

--
-- Indexy pro tabulku `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexy pro tabulku `emails`
--
ALTER TABLE `emails`
  ADD UNIQUE KEY `email` (`email`) USING HASH,
  ADD KEY `personId` (`personId`);

--
-- Indexy pro tabulku `emergency_events`
--
ALTER TABLE `emergency_events`
  ADD PRIMARY KEY (`eev_id`),
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
-- Indexy pro tabulku `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexy pro tabulku `family_relations`
--
ALTER TABLE `family_relations`
  ADD PRIMARY KEY (`frId`),
  ADD UNIQUE KEY `source` (`source`,`target`),
  ADD KEY `target` (`target`),
  ADD KEY `role` (`role`);

--
-- Indexy pro tabulku `fleetvehicles_expenses`
--
ALTER TABLE `fleetvehicles_expenses`
  ADD PRIMARY KEY (`fvexId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexy pro tabulku `fleetvehicles_maintenance`
--
ALTER TABLE `fleetvehicles_maintenance`
  ADD PRIMARY KEY (`fvmaId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `vehicleId` (`vehicleId`);

--
-- Indexy pro tabulku `fleetvehicles_trips`
--
ALTER TABLE `fleetvehicles_trips`
  ADD PRIMARY KEY (`tripId`),
  ADD KEY `vehicleId` (`vehicleId`),
  ADD KEY `driverId` (`driverId`);

--
-- Indexy pro tabulku `fleetvehicles_vehicles`
--
ALTER TABLE `fleetvehicles_vehicles`
  ADD PRIMARY KEY (`vehicleId`),
  ADD UNIQUE KEY `vin` (`vin`),
  ADD UNIQUE KEY `plate` (`plate`) USING HASH,
  ADD KEY `countryId_manufacture` (`countryId_manufacture`),
  ADD KEY `registration_countryId` (`registration_countryId`);

--
-- Indexy pro tabulku `fleetvehicles_vignette_cache`
--
ALTER TABLE `fleetvehicles_vignette_cache`
  ADD PRIMARY KEY (`fvvcId`);

--
-- Indexy pro tabulku `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`gradeId`),
  ADD KEY `columnId` (`columnId`),
  ADD KEY `student` (`studentId`),
  ADD KEY `teacher` (`teacherId`);

--
-- Indexy pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  ADD PRIMARY KEY (`gcId`),
  ADD UNIQUE KEY `groupId_2` (`groupId`,`subjectId`,`columnIndex`),
  ADD KEY `groupId` (`groupId`),
  ADD KEY `subject` (`subjectId`);

--
-- Indexy pro tabulku `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`groupId`),
  ADD UNIQUE KEY `name` (`name`,`num`,`class`,`year`) USING HASH,
  ADD KEY `year` (`year`),
  ADD KEY `class` (`class`);

--
-- Indexy pro tabulku `homework`
--
ALTER TABLE `homework`
  ADD PRIMARY KEY (`homeworkId`);

--
-- Indexy pro tabulku `insurance_companies`
--
ALTER TABLE `insurance_companies`
  ADD UNIQUE KEY `insuranceId` (`insuranceId`);

--
-- Indexy pro tabulku `library_books`
--
ALTER TABLE `library_books`
  ADD PRIMARY KEY (`bookId`),
  ADD KEY `genreId` (`genreId`);

--
-- Indexy pro tabulku `library_book_authors`
--
ALTER TABLE `library_book_authors`
  ADD PRIMARY KEY (`bookAuthorId`),
  ADD UNIQUE KEY `bookId` (`bookId`,`authorId`),
  ADD KEY `authorId` (`authorId`);

--
-- Indexy pro tabulku `library_copies`
--
ALTER TABLE `library_copies`
  ADD PRIMARY KEY (`copyId`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `bookId` (`bookId`);

--
-- Indexy pro tabulku `library_genres`
--
ALTER TABLE `library_genres`
  ADD PRIMARY KEY (`genreId`);

--
-- Indexy pro tabulku `library_loans`
--
ALTER TABLE `library_loans`
  ADD PRIMARY KEY (`loanId`),
  ADD KEY `copyId` (`copyId`),
  ADD KEY `readerId` (`readerId`);

--
-- Indexy pro tabulku `library_reservations`
--
ALTER TABLE `library_reservations`
  ADD PRIMARY KEY (`reservationId`),
  ADD KEY `bookId` (`bookId`),
  ADD KEY `copyId` (`copyId`),
  ADD KEY `personId` (`personId`);

--
-- Indexy pro tabulku `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`loginId`),
  ADD KEY `userId` (`userId`),
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
-- Indexy pro tabulku `messages_receivers`
--
ALTER TABLE `messages_receivers`
  ADD UNIQUE KEY `message` (`message_id`,`receiver_id`),
  ADD KEY `receiver` (`receiver_id`);

--
-- Indexy pro tabulku `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexy pro tabulku `notification_rules`
--
ALTER TABLE `notification_rules`
  ADD PRIMARY KEY (`rule_id`),
  ADD KEY `idx_user_enabled` (`user_id`,`enabled`);

--
-- Indexy pro tabulku `passwords`
--
ALTER TABLE `passwords`
  ADD PRIMARY KEY (`passwordId`);

--
-- Indexy pro tabulku `payments_classes`
--
ALTER TABLE `payments_classes`
  ADD PRIMARY KEY (`pClassId`),
  ADD KEY `classId` (`classId`);

--
-- Indexy pro tabulku `payments_columns`
--
ALTER TABLE `payments_columns`
  ADD PRIMARY KEY (`paymentColumnId`),
  ADD KEY `createdBy` (`createdBy`);

--
-- Indexy pro tabulku `payments_payments`
--
ALTER TABLE `payments_payments`
  ADD PRIMARY KEY (`paymentId`),
  ADD KEY `personId` (`personId`),
  ADD KEY `paymentColumnId` (`paymentColumnId`);

--
-- Indexy pro tabulku `persons`
--
ALTER TABLE `persons`
  ADD PRIMARY KEY (`personId`),
  ADD KEY `persons_ibfk_1` (`insuranceId`),
  ADD KEY `address` (`address`);

--
-- Indexy pro tabulku `persons_degree`
--
ALTER TABLE `persons_degree`
  ADD UNIQUE KEY `person` (`person`,`degree`),
  ADD KEY `degree` (`degree`);

--
-- Indexy pro tabulku `phone_numbers`
--
ALTER TABLE `phone_numbers`
  ADD UNIQUE KEY `code` (`code`,`number`) USING HASH,
  ADD KEY `personId` (`personId`);

--
-- Indexy pro tabulku `polls`
--
ALTER TABLE `polls`
  ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `poll_answers`
--
ALTER TABLE `poll_answers`
  ADD PRIMARY KEY (`id`);

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
-- Indexy pro tabulku `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexy pro tabulku `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`roomId`),
  ADD KEY `manager` (`manager`);

--
-- Indexy pro tabulku `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`schoolId`),
  ADD UNIQUE KEY `code` (`code`) USING HASH,
  ADD UNIQUE KEY `apiToken` (`apiToken`) USING HASH,
  ADD KEY `district` (`district`),
  ADD KEY `owner` (`owner`);

--
-- Indexy pro tabulku `school_breaks`
--
ALTER TABLE `school_breaks`
  ADD UNIQUE KEY `hour` (`hour`,`school`) USING BTREE,
  ADD KEY `school` (`school`);

--
-- Indexy pro tabulku `school_domains`
--
ALTER TABLE `school_domains`
  ADD PRIMARY KEY (`sdId`),
  ADD UNIQUE KEY `domain` (`domain`) USING HASH,
  ADD KEY `school` (`school`);

--
-- Indexy pro tabulku `school_years`
--
ALTER TABLE `school_years`
  ADD PRIMARY KEY (`syId`);

--
-- Indexy pro tabulku `scopes`
--
ALTER TABLE `scopes`
  ADD PRIMARY KEY (`scopeId`);

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
  ADD UNIQUE KEY `personID` (`personId`),
  ADD KEY `class` (`class`);

--
-- Indexy pro tabulku `student_groups`
--
ALTER TABLE `student_groups`
  ADD UNIQUE KEY `student` (`student`,`groupId`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexy pro tabulku `student_homework`
--
ALTER TABLE `student_homework`
  ADD UNIQUE KEY `student-homework` (`student`,`homework`) USING BTREE,
  ADD KEY `homework` (`homework`);

--
-- Indexy pro tabulku `student_rewards`
--
ALTER TABLE `student_rewards`
  ADD PRIMARY KEY (`rewardId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `teacherId` (`teacherId`);

--
-- Indexy pro tabulku `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subjectId`);

--
-- Indexy pro tabulku `substitution`
--
ALTER TABLE `substitution`
  ADD PRIMARY KEY (`substitutionId`),
  ADD KEY `groupId` (`groupId`),
  ADD KEY `subjectId` (`subjectId`),
  ADD KEY `teacherId` (`teacherId`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexy pro tabulku `teachers`
--
ALTER TABLE `teachers`
  ADD UNIQUE KEY `personID` (`personId`),
  ADD KEY `cabinet` (`cabinet`),
  ADD KEY `rank` (`rank`);

--
-- Indexy pro tabulku `teachers_salary`
--
ALTER TABLE `teachers_salary`
  ADD PRIMARY KEY (`rank`),
  ADD UNIQUE KEY `rank` (`rank`);

--
-- Indexy pro tabulku `teachers_subject`
--
ALTER TABLE `teachers_subject`
  ADD KEY `subject` (`subject_id`),
  ADD KEY `teacher` (`teacher_id`);

--
-- Indexy pro tabulku `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`lessonId`),
  ADD KEY `groupId` (`groupId`),
  ADD KEY `room` (`room`),
  ADD KEY `subject` (`subject`),
  ADD KEY `teacher` (`teacher`);

--
-- Indexy pro tabulku `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`tokenId`),
  ADD UNIQUE KEY `token` (`token`) USING HASH,
  ADD UNIQUE KEY `socketId` (`socket`) USING HASH,
  ADD KEY `password` (`password`),
  ADD KEY `userId` (`userId`);

--
-- Indexy pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  ADD PRIMARY KEY (`companyId`),
  ADD UNIQUE KEY `CIN` (`ico`) USING HASH,
  ADD KEY `addressOffice` (`addressOffice`);

--
-- Indexy pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  ADD PRIMARY KEY (`reviewId`),
  ADD KEY `companyId` (`companyId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexy pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  ADD PRIMARY KEY (`tscsId`),
  ADD UNIQUE KEY `companyId` (`companyId`,`scopeId`),
  ADD KEY `scopeId` (`scopeId`);

--
-- Indexy pro tabulku `traineeship_config`
--
ALTER TABLE `traineeship_config`
  ADD PRIMARY KEY (`trConfig`),
  ADD KEY `manager` (`manager`);

--
-- Indexy pro tabulku `traineeship_diary`
--
ALTER TABLE `traineeship_diary`
  ADD PRIMARY KEY (`diaryId`),
  ADD KEY `trWeekId` (`trWeekId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexy pro tabulku `traineeship_instructors`
--
ALTER TABLE `traineeship_instructors`
  ADD UNIQUE KEY `personId` (`instructorId`,`companyId`),
  ADD KEY `company` (`companyId`);

--
-- Indexy pro tabulku `traineeship_students`
--
ALTER TABLE `traineeship_students`
  ADD UNIQUE KEY `studentId` (`studentId`,`traineeship`),
  ADD KEY `company` (`company`),
  ADD KEY `instructor` (`instructor`),
  ADD KEY `traineeship` (`traineeship`);

--
-- Indexy pro tabulku `traineeship_weeks`
--
ALTER TABLE `traineeship_weeks`
  ADD PRIMARY KEY (`trWeekId`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexy pro tabulku `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `person_2` (`person`,`school`),
  ADD UNIQUE KEY `username` (`username`,`school`) USING HASH,
  ADD KEY `password` (`password`),
  ADD KEY `school` (`school`),
  ADD KEY `person` (`person`) USING BTREE;

--
-- Indexy pro tabulku `users_backup_codes`
--
ALTER TABLE `users_backup_codes`
  ADD PRIMARY KEY (`ubcId`),
  ADD UNIQUE KEY `userId` (`userId`,`code`);

--
-- Indexy pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexy pro tabulku `users_resetpassword`
--
ALTER TABLE `users_resetpassword`
  ADD PRIMARY KEY (`user_resetpassword_id`);

--
-- Indexy pro tabulku `webauthn_challenges`
--
ALTER TABLE `webauthn_challenges`
  ADD UNIQUE KEY `a` (`challenge`) USING HASH,
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT pro tabulky
--

--
-- AUTO_INCREMENT pro tabulku `addresses`
--
ALTER TABLE `addresses`
  MODIFY `addressId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `auditId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `br_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `building_rooms_occupancy`
--
ALTER TABLE `building_rooms_occupancy`
  MODIFY `bro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `cities`
--
ALTER TABLE `cities`
  MODIFY `cityId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `classbook`
--
ALTER TABLE `classbook`
  MODIFY `cbId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT pro tabulku `classbook_notes`
--
ALTER TABLE `classbook_notes`
  MODIFY `classbook_note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pro tabulku `classes`
--
ALTER TABLE `classes`
  MODIFY `classId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `class_service`
--
ALTER TABLE `class_service`
  MODIFY `csId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `countries`
--
ALTER TABLE `countries`
  MODIFY `countryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=250;

--
-- AUTO_INCREMENT pro tabulku `degrees`
--
ALTER TABLE `degrees`
  MODIFY `degreeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pro tabulku `districts`
--
ALTER TABLE `districts`
  MODIFY `districtId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT pro tabulku `documents`
--
ALTER TABLE `documents`
  MODIFY `file_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pro tabulku `emergency_events`
--
ALTER TABLE `emergency_events`
  MODIFY `eev_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT pro tabulku `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `family_relations`
--
ALTER TABLE `family_relations`
  MODIFY `frId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_expenses`
--
ALTER TABLE `fleetvehicles_expenses`
  MODIFY `fvexId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_maintenance`
--
ALTER TABLE `fleetvehicles_maintenance`
  MODIFY `fvmaId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_trips`
--
ALTER TABLE `fleetvehicles_trips`
  MODIFY `tripId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_vehicles`
--
ALTER TABLE `fleetvehicles_vehicles`
  MODIFY `vehicleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `fleetvehicles_vignette_cache`
--
ALTER TABLE `fleetvehicles_vignette_cache`
  MODIFY `fvvcId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `grades`
--
ALTER TABLE `grades`
  MODIFY `gradeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  MODIFY `gcId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `groups`
--
ALTER TABLE `groups`
  MODIFY `groupId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pro tabulku `homework`
--
ALTER TABLE `homework`
  MODIFY `homeworkId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pro tabulku `library_books`
--
ALTER TABLE `library_books`
  MODIFY `bookId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_book_authors`
--
ALTER TABLE `library_book_authors`
  MODIFY `bookAuthorId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_copies`
--
ALTER TABLE `library_copies`
  MODIFY `copyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_genres`
--
ALTER TABLE `library_genres`
  MODIFY `genreId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `library_loans`
--
ALTER TABLE `library_loans`
  MODIFY `loanId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `library_reservations`
--
ALTER TABLE `library_reservations`
  MODIFY `reservationId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `login_history`
--
ALTER TABLE `login_history`
  MODIFY `loginId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1386;

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
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pro tabulku `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `notification_rules`
--
ALTER TABLE `notification_rules`
  MODIFY `rule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `passwords`
--
ALTER TABLE `passwords`
  MODIFY `passwordId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pro tabulku `payments_classes`
--
ALTER TABLE `payments_classes`
  MODIFY `pClassId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `payments_columns`
--
ALTER TABLE `payments_columns`
  MODIFY `paymentColumnId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `payments_payments`
--
ALTER TABLE `payments_payments`
  MODIFY `paymentId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `persons`
--
ALTER TABLE `persons`
  MODIFY `personId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT pro tabulku `polls`
--
ALTER TABLE `polls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `poll_answers`
--
ALTER TABLE `poll_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `poll_options`
--
ALTER TABLE `poll_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `poll_questions`
--
ALTER TABLE `poll_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `poll_responses`
--
ALTER TABLE `poll_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `rooms`
--
ALTER TABLE `rooms`
  MODIFY `roomId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `schools`
--
ALTER TABLE `schools`
  MODIFY `schoolId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `school_domains`
--
ALTER TABLE `school_domains`
  MODIFY `sdId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `school_years`
--
ALTER TABLE `school_years`
  MODIFY `syId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `scopes`
--
ALTER TABLE `scopes`
  MODIFY `scopeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `scopes_subjects`
--
ALTER TABLE `scopes_subjects`
  MODIFY `ss_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=978;

--
-- AUTO_INCREMENT pro tabulku `semester_grades`
--
ALTER TABLE `semester_grades`
  MODIFY `s_g_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subjectId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pro tabulku `substitution`
--
ALTER TABLE `substitution`
  MODIFY `substitutionId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pro tabulku `timetable`
--
ALTER TABLE `timetable`
  MODIFY `lessonId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT pro tabulku `tokens`
--
ALTER TABLE `tokens`
  MODIFY `tokenId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1345;

--
-- AUTO_INCREMENT pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  MODIFY `companyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  MODIFY `reviewId` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  MODIFY `tscsId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_config`
--
ALTER TABLE `traineeship_config`
  MODIFY `trConfig` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `traineeship_diary`
--
ALTER TABLE `traineeship_diary`
  MODIFY `diaryId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `traineeship_instructors`
--
ALTER TABLE `traineeship_instructors`
  MODIFY `instructorId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_weeks`
--
ALTER TABLE `traineeship_weeks`
  MODIFY `trWeekId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pro tabulku `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pro tabulku `users_backup_codes`
--
ALTER TABLE `users_backup_codes`
  MODIFY `ubcId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `users_resetpassword`
--
ALTER TABLE `users_resetpassword`
  MODIFY `user_resetpassword_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- Omezení pro exportované tabulky
--

--
-- Omezení pro tabulku `absence`
--
ALTER TABLE `absence`
  ADD CONSTRAINT `absence_ibfk_1` FOREIGN KEY (`lesson`) REFERENCES `classbook` (`cbId`),
  ADD CONSTRAINT `absence_ibfk_2` FOREIGN KEY (`student`) REFERENCES `students` (`personId`);

--
-- Omezení pro tabulku `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`cityId`) REFERENCES `cities` (`cityId`);

--
-- Omezení pro tabulku `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `auditlog_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

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
  ADD CONSTRAINT `building_rooms_ibfk_1` FOREIGN KEY (`floor_id`) REFERENCES `building_floors` (`bf_id`),
  ADD CONSTRAINT `building_rooms_ibfk_2` FOREIGN KEY (`manager`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `building_rooms_occupancy`
--
ALTER TABLE `building_rooms_occupancy`
  ADD CONSTRAINT `building_rooms_occupancy_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `emergency_events` (`eev_id`),
  ADD CONSTRAINT `building_rooms_occupancy_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `building_rooms_occupancy_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `building_rooms` (`br_id`);

--
-- Omezení pro tabulku `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`countryId`) REFERENCES `countries` (`countryId`);

--
-- Omezení pro tabulku `classbook`
--
ALTER TABLE `classbook`
  ADD CONSTRAINT `classbook_ibfk_1` FOREIGN KEY (`subject`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `classbook_ibfk_2` FOREIGN KEY (`teacher`) REFERENCES `teachers` (`personId`),
  ADD CONSTRAINT `classbook_ibfk_3` FOREIGN KEY (`room`) REFERENCES `rooms` (`roomId`),
  ADD CONSTRAINT `classbook_ibfk_4` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`);

--
-- Omezení pro tabulku `classbook_notes`
--
ALTER TABLE `classbook_notes`
  ADD CONSTRAINT `classbook_notes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`room`) REFERENCES `rooms` (`roomId`),
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`teacher`) REFERENCES `teachers` (`personId`),
  ADD CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`scopeId`) REFERENCES `scopes` (`scopeId`),
  ADD CONSTRAINT `classes_ibfk_4` FOREIGN KEY (`yearId`) REFERENCES `school_years` (`syId`);

--
-- Omezení pro tabulku `class_service`
--
ALTER TABLE `class_service`
  ADD CONSTRAINT `class_service_ibfk_1` FOREIGN KEY (`student`) REFERENCES `students` (`personId`);

--
-- Omezení pro tabulku `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `users` (`userId`);

--
-- Omezení pro tabulku `emails`
--
ALTER TABLE `emails`
  ADD CONSTRAINT `emails_ibfk_1` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `emergency_events`
--
ALTER TABLE `emergency_events`
  ADD CONSTRAINT `emergency_events_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `emergency_event_types` (`eet_id`),
  ADD CONSTRAINT `emergency_events_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `emergency_event_users`
--
ALTER TABLE `emergency_event_users`
  ADD CONSTRAINT `emergency_event_users_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `emergency_events` (`eev_id`),
  ADD CONSTRAINT `emergency_event_users_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `emergency_notifications`
--
ALTER TABLE `emergency_notifications`
  ADD CONSTRAINT `emergency_notifications_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `emergency_events` (`eev_id`),
  ADD CONSTRAINT `emergency_notifications_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `family_relations`
--
ALTER TABLE `family_relations`
  ADD CONSTRAINT `family_relations_ibfk_1` FOREIGN KEY (`source`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `family_relations_ibfk_2` FOREIGN KEY (`target`) REFERENCES `students` (`personId`);

--
-- Omezení pro tabulku `fleetvehicles_expenses`
--
ALTER TABLE `fleetvehicles_expenses`
  ADD CONSTRAINT `fleetvehicles_expenses_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `fleetvehicles_expenses_ibfk_2` FOREIGN KEY (`vehicleId`) REFERENCES `fleetvehicles_vehicles` (`vehicleId`);

--
-- Omezení pro tabulku `fleetvehicles_maintenance`
--
ALTER TABLE `fleetvehicles_maintenance`
  ADD CONSTRAINT `fleetvehicles_maintenance_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `fleetvehicles_maintenance_ibfk_2` FOREIGN KEY (`vehicleId`) REFERENCES `fleetvehicles_vehicles` (`vehicleId`);

--
-- Omezení pro tabulku `fleetvehicles_trips`
--
ALTER TABLE `fleetvehicles_trips`
  ADD CONSTRAINT `fleetvehicles_trips_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `fleetvehicles_vehicles` (`vehicleId`),
  ADD CONSTRAINT `fleetvehicles_trips_ibfk_2` FOREIGN KEY (`driverId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `fleetvehicles_vehicles`
--
ALTER TABLE `fleetvehicles_vehicles`
  ADD CONSTRAINT `fleetvehicles_vehicles_ibfk_1` FOREIGN KEY (`countryId_manufacture`) REFERENCES `countries` (`countryId`),
  ADD CONSTRAINT `fleetvehicles_vehicles_ibfk_2` FOREIGN KEY (`registration_countryId`) REFERENCES `countries` (`countryId`);

--
-- Omezení pro tabulku `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`columnId`) REFERENCES `grades_columns` (`gcId`),
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  ADD CONSTRAINT `grades_columns_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`),
  ADD CONSTRAINT `grades_columns_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`subjectId`);

--
-- Omezení pro tabulku `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`year`) REFERENCES `school_years` (`syId`),
  ADD CONSTRAINT `groups_ibfk_2` FOREIGN KEY (`class`) REFERENCES `classes` (`classId`);

--
-- Omezení pro tabulku `library_books`
--
ALTER TABLE `library_books`
  ADD CONSTRAINT `library_books_ibfk_1` FOREIGN KEY (`genreId`) REFERENCES `library_genres` (`genreId`);

--
-- Omezení pro tabulku `library_book_authors`
--
ALTER TABLE `library_book_authors`
  ADD CONSTRAINT `library_book_authors_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `library_book_authors_ibfk_2` FOREIGN KEY (`bookId`) REFERENCES `library_books` (`bookId`);

--
-- Omezení pro tabulku `library_copies`
--
ALTER TABLE `library_copies`
  ADD CONSTRAINT `library_copies_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `library_books` (`bookId`);

--
-- Omezení pro tabulku `library_loans`
--
ALTER TABLE `library_loans`
  ADD CONSTRAINT `library_loans_ibfk_1` FOREIGN KEY (`copyId`) REFERENCES `library_copies` (`copyId`),
  ADD CONSTRAINT `library_loans_ibfk_2` FOREIGN KEY (`readerId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `library_reservations`
--
ALTER TABLE `library_reservations`
  ADD CONSTRAINT `library_reservations_ibfk_1` FOREIGN KEY (`bookId`) REFERENCES `library_books` (`bookId`),
  ADD CONSTRAINT `library_reservations_ibfk_2` FOREIGN KEY (`copyId`) REFERENCES `library_copies` (`copyId`),
  ADD CONSTRAINT `library_reservations_ibfk_3` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `login_history_ibfk_2` FOREIGN KEY (`token_id`) REFERENCES `tokens` (`tokenId`);

--
-- Omezení pro tabulku `marking_scales`
--
ALTER TABLE `marking_scales`
  ADD CONSTRAINT `marking_scales_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `marking_scales_groups`
--
ALTER TABLE `marking_scales_groups`
  ADD CONSTRAINT `marking_scales_groups_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `marking_scales_groups_ibfk_2` FOREIGN KEY (`ms_id`) REFERENCES `marking_scales` (`ms_id`),
  ADD CONSTRAINT `marking_scales_groups_ibfk_3` FOREIGN KEY (`group_id`) REFERENCES `groups` (`groupId`);

--
-- Omezení pro tabulku `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `messages_receivers`
--
ALTER TABLE `messages_receivers`
  ADD CONSTRAINT `messages_receivers_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`),
  ADD CONSTRAINT `messages_receivers_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `notification_rules`
--
ALTER TABLE `notification_rules`
  ADD CONSTRAINT `notification_rules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `payments_classes`
--
ALTER TABLE `payments_classes`
  ADD CONSTRAINT `payments_classes_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `classes` (`classId`);

--
-- Omezení pro tabulku `payments_columns`
--
ALTER TABLE `payments_columns`
  ADD CONSTRAINT `payments_columns_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `payments_payments`
--
ALTER TABLE `payments_payments`
  ADD CONSTRAINT `payments_payments_ibfk_1` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `payments_payments_ibfk_2` FOREIGN KEY (`paymentColumnId`) REFERENCES `payments_columns` (`paymentColumnId`);

--
-- Omezení pro tabulku `persons`
--
ALTER TABLE `persons`
  ADD CONSTRAINT `persons_ibfk_1` FOREIGN KEY (`insuranceId`) REFERENCES `insurance_companies` (`insuranceId`),
  ADD CONSTRAINT `persons_ibfk_2` FOREIGN KEY (`address`) REFERENCES `addresses` (`addressId`);

--
-- Omezení pro tabulku `persons_degree`
--
ALTER TABLE `persons_degree`
  ADD CONSTRAINT `persons_degree_ibfk_1` FOREIGN KEY (`degree`) REFERENCES `degrees` (`degreeID`),
  ADD CONSTRAINT `persons_degree_ibfk_2` FOREIGN KEY (`person`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `phone_numbers`
--
ALTER TABLE `phone_numbers`
  ADD CONSTRAINT `phone_numbers_ibfk_1` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD CONSTRAINT `push_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`manager`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `schools`
--
ALTER TABLE `schools`
  ADD CONSTRAINT `schools_ibfk_1` FOREIGN KEY (`district`) REFERENCES `districts` (`districtId`),
  ADD CONSTRAINT `schools_ibfk_2` FOREIGN KEY (`owner`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `school_breaks`
--
ALTER TABLE `school_breaks`
  ADD CONSTRAINT `school_breaks_ibfk_1` FOREIGN KEY (`school`) REFERENCES `schools` (`schoolId`);

--
-- Omezení pro tabulku `school_domains`
--
ALTER TABLE `school_domains`
  ADD CONSTRAINT `school_domains_ibfk_1` FOREIGN KEY (`school`) REFERENCES `schools` (`schoolId`);

--
-- Omezení pro tabulku `scopes_subjects`
--
ALTER TABLE `scopes_subjects`
  ADD CONSTRAINT `scopes_subjects_ibfk_1` FOREIGN KEY (`scope_id`) REFERENCES `scopes` (`scopeId`),
  ADD CONSTRAINT `scopes_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subjectId`);

--
-- Omezení pro tabulku `semester_grades`
--
ALTER TABLE `semester_grades`
  ADD CONSTRAINT `semester_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `semester_grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `semester_grades_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`class`) REFERENCES `classes` (`classId`);

--
-- Omezení pro tabulku `student_groups`
--
ALTER TABLE `student_groups`
  ADD CONSTRAINT `student_groups_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`),
  ADD CONSTRAINT `student_groups_ibfk_2` FOREIGN KEY (`student`) REFERENCES `students` (`personId`);

--
-- Omezení pro tabulku `student_homework`
--
ALTER TABLE `student_homework`
  ADD CONSTRAINT `student_homework_ibfk_1` FOREIGN KEY (`student`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `student_homework_ibfk_2` FOREIGN KEY (`homework`) REFERENCES `homework` (`homeworkId`);

--
-- Omezení pro tabulku `student_rewards`
--
ALTER TABLE `student_rewards`
  ADD CONSTRAINT `student_rewards_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `student_rewards_ibfk_2` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `substitution`
--
ALTER TABLE `substitution`
  ADD CONSTRAINT `substitution_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `substitution_ibfk_3` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`personId`),
  ADD CONSTRAINT `substitution_ibfk_4` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`),
  ADD CONSTRAINT `substitution_ibfk_5` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`);

--
-- Omezení pro tabulku `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`cabinet`) REFERENCES `rooms` (`roomId`),
  ADD CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`rank`) REFERENCES `teachers_salary` (`rank`),
  ADD CONSTRAINT `teachers_ibfk_3` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `teachers_subject`
--
ALTER TABLE `teachers_subject`
  ADD CONSTRAINT `teachers_subject_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `teachers_subject_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `timetable`
--
ALTER TABLE `timetable`
  ADD CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`),
  ADD CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`room`) REFERENCES `building_rooms` (`br_id`),
  ADD CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`subject`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `timetable_ibfk_4` FOREIGN KEY (`teacher`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `tokens`
--
ALTER TABLE `tokens`
  ADD CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`password`) REFERENCES `passwords` (`passwordId`),
  ADD CONSTRAINT `tokens_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Omezení pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  ADD CONSTRAINT `traineeship_companies_ibfk_1` FOREIGN KEY (`addressOffice`) REFERENCES `addresses` (`addressId`);

--
-- Omezení pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  ADD CONSTRAINT `traineeship_company_rating_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `traineeship_companies` (`companyId`),
  ADD CONSTRAINT `traineeship_company_rating_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `students` (`personId`);

--
-- Omezení pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  ADD CONSTRAINT `traineeship_company_scopes_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `traineeship_companies` (`companyId`),
  ADD CONSTRAINT `traineeship_company_scopes_ibfk_2` FOREIGN KEY (`scopeId`) REFERENCES `scopes` (`scopeId`);

--
-- Omezení pro tabulku `traineeship_config`
--
ALTER TABLE `traineeship_config`
  ADD CONSTRAINT `traineeship_config_ibfk_1` FOREIGN KEY (`manager`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `traineeship_diary`
--
ALTER TABLE `traineeship_diary`
  ADD CONSTRAINT `traineeship_diary_ibfk_1` FOREIGN KEY (`trWeekId`) REFERENCES `traineeship_weeks` (`trWeekId`),
  ADD CONSTRAINT `traineeship_diary_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `students` (`personId`);

--
-- Omezení pro tabulku `traineeship_instructors`
--
ALTER TABLE `traineeship_instructors`
  ADD CONSTRAINT `traineeship_instructors_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `traineeship_companies` (`companyId`);

--
-- Omezení pro tabulku `traineeship_students`
--
ALTER TABLE `traineeship_students`
  ADD CONSTRAINT `traineeship_students_ibfk_1` FOREIGN KEY (`company`) REFERENCES `traineeship_companies` (`companyId`),
  ADD CONSTRAINT `traineeship_students_ibfk_2` FOREIGN KEY (`instructor`) REFERENCES `traineeship_instructors` (`instructorId`),
  ADD CONSTRAINT `traineeship_students_ibfk_3` FOREIGN KEY (`studentId`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `traineeship_students_ibfk_4` FOREIGN KEY (`traineeship`) REFERENCES `traineeship_weeks` (`trWeekId`);

--
-- Omezení pro tabulku `traineeship_weeks`
--
ALTER TABLE `traineeship_weeks`
  ADD CONSTRAINT `traineeship_weeks_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`);

--
-- Omezení pro tabulku `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`password`) REFERENCES `passwords` (`passwordId`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`person`) REFERENCES `persons` (`personId`),
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`school`) REFERENCES `schools` (`schoolId`);

--
-- Omezení pro tabulku `users_backup_codes`
--
ALTER TABLE `users_backup_codes`
  ADD CONSTRAINT `users_backup_codes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Omezení pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  ADD CONSTRAINT `users_credentials_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Omezení pro tabulku `webauthn_challenges`
--
ALTER TABLE `webauthn_challenges`
  ADD CONSTRAINT `webauthn_challenges_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
