-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Počítač: 127.0.0.1
-- Vytvořeno: Ned 12. říj 2025, 23:36
-- Verze serveru: 11.7.1-MariaDB
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
(24, 1, 0, NULL, NULL, NULL),
(24, 4, 0, NULL, NULL, NULL),
(24, 6, 0, NULL, NULL, NULL),
(24, 21, 0, NULL, NULL, NULL),
(24, 27, 0, NULL, NULL, NULL),
(24, 46, 0, NULL, NULL, NULL),
(24, 108, 4, 5, 'connection', ''),
(24, 113, 0, 0, '', ''),
(25, 7, 1, NULL, NULL, NULL),
(25, 14, 0, NULL, NULL, NULL),
(25, 16, 0, NULL, NULL, NULL),
(25, 21, 0, NULL, NULL, NULL),
(25, 27, 0, NULL, NULL, NULL),
(25, 46, 0, NULL, NULL, NULL),
(25, 108, 1, 0, 'family', ''),
(25, 113, 0, 0, '', ''),
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
  `admin` int(11) DEFAULT NULL,
  `type` enum('') NOT NULL,
  `message` text NOT NULL,
  `created` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(113, '2025-04-28', 2, 35, 2, 10, NULL, NULL, NULL, NULL);

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
(1, 1, '2024-01-08', '2024-01-12'),
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
-- Struktura tabulky `emails`
--

CREATE TABLE `emails` (
  `email` text NOT NULL,
  `personId` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `emails`
--

INSERT INTO `emails` (`email`, `personId`, `description`, `is_verified`) VALUES
('jkosik@sps-pi.cz', 1, NULL, 1),
('jkosik@sps-pi.com', 1, NULL, 1);

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
  `student` int(11) NOT NULL,
  `teacher` int(11) NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `grades`
--

INSERT INTO `grades` (`gradeId`, `columnId`, `mark`, `student`, `teacher`, `created`, `description`) VALUES
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
  `subject` int(11) NOT NULL,
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

INSERT INTO `grades_columns` (`gcId`, `groupId`, `subject`, `columnIndex`, `weight`, `type`, `topic`, `created`, `status`) VALUES
(1, 10, 7, 0, 10, 0, 'Test', '0000-00-00 00:00:00.000000', 'active');

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
-- Struktura tabulky `homeworks`
--

CREATE TABLE `homeworks` (
  `homeworkID` int(11) NOT NULL,
  `lesson` int(11) NOT NULL,
  `start` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `end` datetime(6) NOT NULL,
  `homework` text NOT NULL,
  `note` text NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `homeworks`
--

INSERT INTO `homeworks` (`homeworkID`, `lesson`, `start`, `end`, `homework`, `note`, `type`) VALUES
(1, 26, '2024-01-31 19:19:14.827959', '2024-02-01 23:00:00.000000', 'T', '', 0),
(2, 26, '2024-01-31 19:26:02.373937', '2024-02-01 23:00:00.000000', 'T', '', 0),
(3, 26, '2024-01-31 19:27:17.950604', '2024-02-01 23:00:00.000000', 'T', '', 0),
(4, 26, '2024-01-31 19:28:03.528329', '2024-02-01 23:00:00.000000', 'T', '', 0),
(5, 26, '2024-01-31 19:29:22.822094', '2024-02-01 23:00:00.000000', 'T', '', 0),
(6, 26, '2024-01-31 19:30:01.055454', '2024-02-01 23:00:00.000000', 'T', '', 0),
(7, 26, '2024-01-31 19:30:49.785489', '2024-02-01 23:00:00.000000', 'T', '', 0),
(8, 26, '2024-01-31 19:32:01.515768', '2024-02-01 23:00:00.000000', 'T', '', 0),
(9, 26, '2024-01-31 19:36:37.718070', '2024-02-01 23:00:00.000000', 'T', '', 0),
(10, 24, '2024-01-31 19:43:04.935934', '2024-02-01 23:00:00.000000', 'T', '', 0),
(11, 27, '2024-01-31 20:51:30.424639', '2024-02-01 23:00:00.000000', 'TAK TOHLE MUSÍ UŽ VYJÍT', '', 0),
(12, 47, '2024-03-11 12:58:00.358523', '2024-02-01 22:00:00.000000', 'TAK TOHLE MUSÍ UŽ VYJÍT', '', 1),
(13, 47, '2024-03-14 10:29:46.780158', '2024-02-01 22:00:00.000000', 'TAK TOHLE MUSÍ UŽ VYJÍT', '', 0);

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
  `lhId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('password','qrcode','passkey') NOT NULL DEFAULT 'password',
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error` text DEFAULT NULL,
  `ip` text DEFAULT NULL,
  `userAgent` text NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `login_history`
--

INSERT INTO `login_history` (`lhId`, `userId`, `type`, `success`, `error`, `ip`, `userAgent`, `created`) VALUES
(1, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 22:32:54.308932'),
(2, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 22:48:34.487370'),
(3, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 22:48:46.645996'),
(4, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:07:50.881523'),
(5, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:07:54.368177'),
(6, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:12:48.106765'),
(7, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:12:49.055992'),
(8, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:26:36.112875'),
(9, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-03 23:26:36.406375'),
(10, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 13:51:42.972223'),
(11, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 13:51:49.174197'),
(12, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 14:12:46.233339'),
(13, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 17:56:27.960598'),
(14, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 17:57:33.936658'),
(15, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 19:08:19.877599'),
(16, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 19:26:51.481031'),
(17, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 22:20:40.882291'),
(18, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 23:15:34.388347'),
(19, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 23:15:39.409840'),
(20, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-04 23:15:42.309768'),
(21, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 00:13:56.723080'),
(22, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 00:14:00.298232'),
(23, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 00:29:47.587116'),
(24, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 01:03:57.805987'),
(25, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 11:01:42.030259'),
(26, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 11:36:44.720803'),
(27, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 11:55:04.876251'),
(28, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 12:13:55.071986'),
(29, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 12:39:24.154911'),
(30, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 12:58:50.660646'),
(31, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 13:18:48.457595'),
(32, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 13:37:20.240409'),
(33, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 13:56:53.412710'),
(34, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:13:52.302677'),
(35, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:41:53.404041'),
(36, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:42:06.077285'),
(37, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:54:31.825213'),
(38, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:55:34.606933'),
(39, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:55:46.163488'),
(40, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:17.421634'),
(41, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:24.697756'),
(42, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:37.807490'),
(43, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:56:43.095747'),
(44, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:02.056794'),
(45, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:08.625199'),
(46, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:13.072882'),
(47, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:57:18.870254'),
(48, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:59:52.272485'),
(49, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 14:59:54.192308'),
(50, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:00:33.676768'),
(51, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:01:10.601726'),
(52, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:04:44.454634'),
(53, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:04:49.159882'),
(54, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:05:11.665490'),
(55, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:26:56.819960'),
(56, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 15:26:57.939796'),
(57, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 16:06:53.961930'),
(58, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 16:44:19.757122'),
(59, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 16:44:22.918846'),
(60, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 17:19:41.241771'),
(61, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 17:19:50.212876'),
(62, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 18:26:30.983109'),
(63, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 18:26:43.076470'),
(64, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 19:47:04.224654'),
(65, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 19:47:17.745243'),
(66, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 21:22:51.001484'),
(67, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-05 21:23:08.879303'),
(68, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 15:27:15.674399'),
(69, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 15:27:35.470646'),
(70, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 20:34:57.315813'),
(71, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 20:35:12.372651'),
(72, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:08:50.100514'),
(73, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:08:53.880046'),
(74, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:26:20.647863'),
(75, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 21:26:30.608026'),
(76, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:04:19.798469'),
(77, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:04:34.065422'),
(78, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:04:34.360887'),
(79, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-06 23:15:56.204745'),
(80, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-07 16:05:06.362490'),
(81, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 12:55:04.638709'),
(82, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 12:55:22.863969'),
(83, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 15:02:38.918888'),
(84, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 15:02:58.970082'),
(85, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 21:42:39.046159'),
(86, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-08 21:59:56.049330'),
(87, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-09 19:24:20.338480'),
(88, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-09 19:39:31.771790'),
(89, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0', '2025-01-09 19:57:28.515499'),
(90, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 20:09:16.067977'),
(91, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 22:52:22.627452'),
(92, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:13:43.290543'),
(93, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:33:49.741734'),
(94, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:14.148531'),
(95, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:15.552111'),
(96, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:16.781593'),
(97, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:18.000569'),
(98, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-10 23:34:52.787969'),
(99, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 00:35:54.768645'),
(100, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 00:42:19.492460'),
(101, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 08:25:21.720043'),
(102, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 09:35:28.498500'),
(103, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 10:50:56.615001'),
(104, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 11:52:27.840908'),
(105, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 12:54:29.402938'),
(106, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 13:54:42.913715'),
(107, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 14:32:51.283064'),
(108, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 14:53:50.201609'),
(109, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 14:59:07.379574'),
(110, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 17:58:19.937327'),
(111, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 19:01:11.386743'),
(112, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 19:01:14.861602'),
(113, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 20:22:17.744600'),
(114, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-11 21:25:11.042255'),
(115, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 08:34:09.860749'),
(116, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 15:44:55.148072'),
(117, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 21:58:37.297322'),
(118, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 23:28:55.266738'),
(119, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-12 23:28:57.421541'),
(120, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-13 15:45:18.942451'),
(121, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-13 20:03:39.914276'),
(122, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-13 22:15:43.003297'),
(123, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-14 17:58:06.568944'),
(124, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-14 19:17:32.948432'),
(125, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-14 20:37:55.910516'),
(126, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 15:00:40.289379'),
(127, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 19:29:50.191584'),
(128, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 20:31:30.503925'),
(129, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-15 21:37:31.628090'),
(130, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 18:47:25.933139'),
(131, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:00:30.494162'),
(132, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:03:34.461913'),
(133, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:03:39.258192'),
(134, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-16 22:20:03.727705'),
(135, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 13:57:14.286420'),
(136, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 14:21:44.952457'),
(137, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 17:32:57.953192'),
(138, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 18:33:27.150698'),
(139, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 18:33:29.676920'),
(140, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 19:16:28.835734'),
(141, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-17 20:36:05.465049'),
(142, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-01-18 11:17:27.548134'),
(143, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 09:42:11.490648'),
(144, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 14:46:54.214304'),
(145, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 19:19:45.438766'),
(146, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:03:48.389823'),
(147, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:07:17.739141'),
(148, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:13:07.392448'),
(149, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-01 20:13:12.752724'),
(150, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:00:37.423304'),
(151, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:01:56.248133'),
(152, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:03:31.464161'),
(153, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:05:04.996169'),
(154, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:06:28.099010'),
(155, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:07:58.663462'),
(156, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:28:44.794222'),
(157, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:30:31.352126'),
(158, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:32:02.701516'),
(159, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 18:33:04.436495'),
(160, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 19:08:38.237226'),
(161, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 19:09:58.143497'),
(162, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 19:10:08.012498'),
(163, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 22:01:59.885341'),
(164, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 22:30:44.836991'),
(165, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 22:47:02.908783'),
(166, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 23:02:28.661767'),
(167, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-04 23:50:10.413421'),
(168, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 00:18:12.084080'),
(169, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 00:39:07.350067'),
(170, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 01:00:59.213690'),
(171, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 09:00:41.274024'),
(172, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 09:15:46.296221'),
(173, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 09:17:17.266010'),
(174, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 10:11:16.474719'),
(175, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 10:12:59.901486'),
(176, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 10:49:02.981485'),
(177, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:00:56.042476'),
(178, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:07:39.346436'),
(179, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:25:36.404876'),
(180, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 11:40:41.854668'),
(181, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 12:12:22.648216'),
(182, 4, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:35:47.685294'),
(183, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:36:01.406183'),
(184, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:45:26.963338'),
(185, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 21:54:10.487477'),
(186, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-05 22:16:05.289838'),
(187, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 12:00:26.289420'),
(188, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 12:15:49.697074'),
(189, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 15:00:31.468412'),
(190, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 15:15:45.150572'),
(191, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 21:17:03.603404'),
(192, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 21:42:56.532501'),
(193, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 21:59:29.705219'),
(194, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 22:34:17.055604'),
(195, 3, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-06 22:43:29.540057'),
(196, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-07 18:40:09.643319'),
(197, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 21:46:37.086510'),
(198, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 22:03:52.999293'),
(199, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 22:07:01.805293'),
(200, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-08 22:56:50.006146'),
(201, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-09 09:51:15.266176'),
(202, 1, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-09 09:51:38.427455'),
(203, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0', '2025-02-09 09:51:43.497802'),
(204, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-09 21:58:43.253922'),
(205, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-09 21:59:34.360804'),
(206, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-09 22:14:55.461307'),
(207, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 12:36:17.831730'),
(208, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 18:23:45.938820'),
(209, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 18:28:41.976960'),
(210, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 20:07:42.855587'),
(211, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 20:24:23.481367'),
(212, 3, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-11 20:30:09.247853'),
(213, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:03:35.492876'),
(214, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:20:39.441553'),
(215, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:43:52.062090'),
(216, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:43:56.697852'),
(217, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 19:59:25.263450'),
(218, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 20:15:24.728487'),
(219, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 20:36:11.315599'),
(220, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 20:53:45.944337'),
(221, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:12:55.125945'),
(222, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:24:52.294686'),
(223, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:31:16.209936'),
(224, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:39:17.452094'),
(225, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:45:18.568654'),
(226, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:51:24.854860'),
(227, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 21:59:06.368881'),
(228, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 22:12:59.931214'),
(229, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 22:31:49.757598'),
(230, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-13 22:33:09.017885'),
(231, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 06:43:02.042426'),
(232, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 06:54:57.561424'),
(233, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:02:53.202995'),
(234, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:07:54.685230'),
(235, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:48:23.190416'),
(236, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 07:58:55.647514'),
(237, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 08:17:39.934667'),
(238, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 08:46:49.820575'),
(239, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 14:01:23.613807'),
(240, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:00:26.955431'),
(241, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:07:06.462560'),
(242, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:26:44.209391'),
(243, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:29:32.728645'),
(244, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 17:31:37.220486'),
(245, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 21:48:07.041995'),
(246, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 22:07:12.461475'),
(247, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 22:14:32.397005'),
(248, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 23:30:45.034762'),
(249, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-14 23:36:43.124629'),
(250, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 10:34:12.697408'),
(251, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 16:55:17.166768'),
(252, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 18:44:59.117005'),
(253, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 18:45:09.057128'),
(254, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 19:17:20.969848'),
(255, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 19:17:26.792762'),
(256, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 19:40:07.975336'),
(257, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 20:10:21.460321'),
(258, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 20:10:33.154682'),
(259, 3, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 20:34:04.509400'),
(260, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 22:19:19.435879'),
(261, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 22:37:54.108412'),
(262, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 22:44:14.166185'),
(263, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-15 23:57:58.897269'),
(264, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 09:10:46.437584'),
(265, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 09:58:28.304223'),
(266, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 11:21:03.700074'),
(267, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 12:01:21.135737'),
(268, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 12:52:00.896549'),
(269, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 13:41:16.135390'),
(270, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 14:32:55.761674'),
(271, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 16:09:23.077416'),
(272, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 18:06:10.726482'),
(273, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 18:38:46.990707'),
(274, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 19:05:36.570362'),
(275, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 19:33:45.192301'),
(276, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 21:24:43.337743'),
(277, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-16 22:17:25.145058'),
(278, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 15:21:29.074816'),
(279, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 16:55:18.333668'),
(280, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 18:08:42.942132'),
(281, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 18:43:08.420745'),
(282, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 19:34:54.889332'),
(283, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 20:00:39.959008'),
(284, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 21:09:54.586091'),
(285, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 21:45:39.050871'),
(286, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-17 22:25:23.450551'),
(287, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 16:29:55.486700'),
(288, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 16:50:52.400415'),
(289, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 17:17:02.308421'),
(290, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 17:37:04.718588'),
(291, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 17:37:12.842685'),
(292, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 18:10:11.290046'),
(293, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 18:10:19.087012'),
(294, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 19:18:00.716131'),
(295, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 19:50:01.840140'),
(296, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-18 22:00:28.028067'),
(297, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 15:08:24.790441'),
(298, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 19:03:37.902509'),
(299, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 20:34:54.021387'),
(300, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 21:56:02.178237'),
(301, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-19 22:43:38.351368'),
(302, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-20 14:58:18.177328'),
(303, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-20 19:14:22.290415'),
(304, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-21 17:36:32.723438'),
(305, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-21 19:44:27.812142'),
(306, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-21 20:17:54.152138'),
(307, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 10:03:13.063923'),
(308, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 10:26:06.454115'),
(309, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 10:49:32.033386'),
(310, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 11:42:43.304775');
INSERT INTO `login_history` (`lhId`, `userId`, `type`, `success`, `error`, `ip`, `userAgent`, `created`) VALUES
(311, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 12:11:11.177379'),
(312, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 14:07:48.318491'),
(313, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 15:15:30.434424'),
(314, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 16:26:35.909163'),
(315, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 19:43:05.278440'),
(316, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 20:32:14.823144'),
(317, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 20:34:00.780858'),
(318, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 21:07:21.532045'),
(319, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 22:01:41.880352'),
(320, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 22:46:20.517598'),
(321, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 23:57:17.435196'),
(322, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-22 23:57:20.021461'),
(323, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 07:59:56.521780'),
(324, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 08:18:20.634307'),
(325, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 08:52:49.714829'),
(326, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 08:52:55.989738'),
(327, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 09:09:21.056750'),
(328, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 09:49:23.927827'),
(329, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 10:53:33.313062'),
(330, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 11:44:12.091886'),
(331, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 12:10:26.216012'),
(332, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 13:16:23.540341'),
(333, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 21:38:31.530482'),
(334, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0', '2025-02-23 22:15:43.928811'),
(335, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-25 13:06:02.632930'),
(336, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 14:51:29.342436'),
(337, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 15:54:18.157606'),
(338, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 18:59:10.213397'),
(339, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 19:28:04.850521'),
(340, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 19:28:17.938778'),
(341, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 20:22:26.232569'),
(342, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 20:32:28.406934'),
(343, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-26 20:51:20.535110'),
(344, 2, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:12:34.044066'),
(345, 2, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:14:55.565951'),
(346, 2, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:15:01.510071'),
(347, 2, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:15:02.536004'),
(348, 2, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:15:07.256098'),
(349, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-02-28 07:45:24.543355'),
(350, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-03-10 13:07:40.213970'),
(351, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '2025-03-10 13:10:02.707448'),
(352, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:23:40.484787'),
(353, 5, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:26:15.429422'),
(354, 5, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:38:59.864998'),
(355, 6, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 07:46:40.639550'),
(356, 6, 'password', 0, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 09:29:00.123476'),
(357, 6, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 09:29:02.574728'),
(358, 7, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 13:07:59.815256'),
(359, 7, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-03-11 16:36:10.258997'),
(360, 7, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-12 15:16:33.306687'),
(361, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-12 15:32:39.660755'),
(362, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-12 20:07:17.460220'),
(363, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 00:06:42.118131'),
(364, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 14:49:43.119806'),
(365, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 15:24:58.419873'),
(366, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-13 16:40:07.017282'),
(367, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 02:13:38.651202'),
(368, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 15:30:47.339949'),
(369, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 15:59:05.836028'),
(370, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 20:05:39.219251'),
(371, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-14 20:52:03.415559'),
(372, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:02:10.589880'),
(373, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:29:15.792476'),
(374, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:29:55.234555'),
(375, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 09:29:58.969203'),
(376, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 14:48:48.288165'),
(377, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 16:11:43.965450'),
(378, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-15 18:30:06.515067'),
(379, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 13:14:28.481991'),
(380, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0', '2025-03-16 13:27:49.042833'),
(381, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0', '2025-03-16 14:14:35.560522'),
(382, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 16:03:02.626371'),
(383, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 16:59:09.770250'),
(384, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 19:55:57.925854'),
(385, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 20:34:41.715312'),
(386, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 20:55:53.529505'),
(387, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-16 21:21:49.347447'),
(388, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-18 16:15:22.759316'),
(389, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-18 17:05:58.386912'),
(390, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-03-20 15:05:07.797504'),
(391, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:17:37.130851'),
(392, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:49:51.513591'),
(393, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:50:52.612261'),
(394, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 16:56:21.762052'),
(395, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 17:36:50.867904'),
(396, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 18:10:04.573736'),
(397, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 18:41:34.682425'),
(398, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:24:28.032079'),
(399, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:27:16.887486'),
(400, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:41:01.043617'),
(401, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 19:41:23.043041'),
(402, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 20:44:06.036897'),
(403, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-02 21:00:48.900844'),
(404, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 08:36:52.990181'),
(405, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 08:49:49.422028'),
(406, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 08:50:08.017900'),
(407, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 09:37:17.031727'),
(408, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 09:39:13.697835'),
(409, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 09:44:05.807103'),
(410, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 19:02:51.469362'),
(411, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 21:44:17.093542'),
(412, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-05 07:54:47.203775'),
(413, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-05 11:28:23.138071'),
(414, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0', '2025-04-05 12:19:22.417966'),
(415, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-07 17:19:01.264489'),
(416, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-07 21:21:24.519803'),
(417, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-07 22:17:56.471572'),
(418, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 17:18:00.645996'),
(419, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 17:30:47.564647'),
(420, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 17:50:26.263644'),
(421, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-08 18:17:51.108657'),
(422, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 14:02:42.564575'),
(423, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 14:22:07.534397'),
(424, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 14:47:30.274059'),
(425, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 15:26:17.708361'),
(426, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 15:52:29.426711'),
(427, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 16:22:37.542464'),
(428, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 16:32:27.653107'),
(429, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-09 18:56:27.603962'),
(430, 1, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 14:09:36.249160'),
(431, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 14:09:38.020784'),
(432, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 15:27:02.977442'),
(433, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 15:47:15.234565'),
(434, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:02:07.101974'),
(435, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:02:48.488002'),
(436, 1, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:05:20.199470'),
(437, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:05:21.539934'),
(438, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:28:28.831621'),
(439, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:29:20.834300'),
(440, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:32:12.842912'),
(441, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:35:40.819099'),
(442, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:43:20.278134'),
(443, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 16:47:14.856435'),
(444, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:03:15.990267'),
(445, 1, 'password', 0, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:04:25.048404'),
(446, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:04:25.942646'),
(447, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:06:53.451133'),
(448, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:11:31.373346'),
(449, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:16:21.237404'),
(450, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:21:22.382551'),
(451, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:22:31.422850'),
(452, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:23:26.500661'),
(453, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 17:24:53.364209'),
(454, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:21:42.987226'),
(455, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:24:41.805201'),
(456, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:25:12.878596'),
(457, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:34:55.438214'),
(458, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 18:38:02.433849'),
(459, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 19:24:04.123848'),
(460, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:44:48.823020'),
(461, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:44:53.770544'),
(462, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:47:43.754302'),
(463, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-10 20:53:12.516845'),
(464, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:05:04.651197'),
(465, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:17:14.885998'),
(466, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:21:56.426912'),
(467, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:26:54.140914'),
(468, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:32:39.262144'),
(469, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:33:04.840507'),
(470, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:33:47.889881'),
(471, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 08:39:17.187054'),
(472, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:02:12.182065'),
(473, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:09:38.956503'),
(474, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:15:11.232706'),
(475, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:32:07.689535'),
(476, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:35:48.387140'),
(477, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:38:00.472825'),
(478, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 09:52:03.357279'),
(479, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 10:45:10.114729'),
(480, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 11:15:33.411804'),
(481, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 11:15:53.692535'),
(482, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 11:21:31.905904'),
(483, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:13:10.308499'),
(484, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:26:20.122220'),
(485, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:34:02.160342'),
(486, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:35:32.966093'),
(487, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:39:49.739133'),
(488, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 15:42:00.198196'),
(489, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:00:16.309030'),
(490, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:05:06.682258'),
(491, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:21:35.670511'),
(492, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:27:17.284402'),
(493, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:28:36.431139'),
(494, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:40:44.110346'),
(495, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:41:55.301504'),
(496, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 16:47:21.484351'),
(497, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:29:08.371628'),
(498, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:32:54.025722'),
(499, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:36:59.592893'),
(500, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 18:39:52.692423'),
(501, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:13:47.570098'),
(502, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:43:13.081917'),
(503, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:45:43.427371'),
(504, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:47:22.987486'),
(505, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 20:49:41.605790'),
(506, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:07:43.902511'),
(507, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:21:22.844854'),
(508, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:47:53.791542'),
(509, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:50:43.832384'),
(510, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 21:51:04.498524'),
(511, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:00:01.969104'),
(512, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:00:30.359178'),
(513, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:00:51.185341'),
(514, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:18:27.824675'),
(515, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:18:53.260640'),
(516, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-11 22:20:29.644230'),
(517, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-12 07:27:19.359166'),
(518, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-12 08:55:37.811110'),
(519, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 19:38:40.169882'),
(520, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 20:19:10.253740'),
(521, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 20:38:27.298056'),
(522, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 21:30:07.589798'),
(523, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 21:33:58.389568'),
(524, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-13 21:35:56.217633'),
(525, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 12:22:18.933939'),
(526, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 13:00:07.516154'),
(527, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 14:40:33.991225'),
(528, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:13:14.400530'),
(529, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:34:02.170297'),
(530, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:35:55.168007'),
(531, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:48:02.719398'),
(532, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 16:51:42.954039'),
(533, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:25:10.293462'),
(534, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:28:01.764808'),
(535, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:30:41.237411'),
(536, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:32:35.523572'),
(537, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:37:54.788711'),
(538, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:39:15.435692'),
(539, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:41:56.612286'),
(540, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:43:28.444379'),
(541, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 17:44:59.629317'),
(542, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-14 18:12:49.784581'),
(543, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-16 13:50:36.184599'),
(544, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:53:48.068145'),
(545, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:56:45.095708'),
(546, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:57:05.084901'),
(547, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 06:57:05.610537'),
(548, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:17:39.696644'),
(549, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:21:00.501144'),
(550, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:33:29.674643'),
(551, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:36:44.204485'),
(552, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:51:08.016558'),
(553, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:52:53.359811'),
(554, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:56:08.689472'),
(555, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:56:34.439896'),
(556, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:57:26.271633'),
(557, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 07:59:15.814646'),
(558, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:46:35.564271'),
(559, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:51:00.124144'),
(560, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:52:49.832234'),
(561, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:55:21.317523'),
(562, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:57:07.514503'),
(563, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:57:28.633546'),
(564, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 12:58:10.602558'),
(565, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 13:00:24.377139'),
(566, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 13:08:08.553109'),
(567, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:27:49.059286'),
(568, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:28:32.566300'),
(569, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:45:21.823196'),
(570, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 14:47:56.977876'),
(571, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:23:17.146768'),
(572, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:35:58.367517'),
(573, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:40:08.021417'),
(574, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 17:50:10.233938'),
(575, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:09:39.211367'),
(576, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:12:04.756966'),
(577, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:14:17.813904'),
(578, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:15:47.684318'),
(579, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 18:16:28.772825'),
(580, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:22:14.864735'),
(581, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:29:30.528100'),
(582, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:30:31.338774'),
(583, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:54:27.215453'),
(584, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 19:55:59.198012'),
(585, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-17 20:02:16.866082'),
(586, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:19:25.898357'),
(587, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:25:01.121565'),
(588, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:31:58.335268'),
(589, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 12:48:23.172091'),
(590, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 14:15:49.937174'),
(591, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 14:16:28.012510'),
(592, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:44:01.771849'),
(593, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:46:16.267409'),
(594, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:48:19.639798'),
(595, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 19:54:34.127710'),
(596, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:00:32.767169'),
(597, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:17:18.271275'),
(598, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:28:47.143807'),
(599, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:55:49.986726'),
(600, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:56:37.513029'),
(601, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:57:44.446282'),
(602, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:58:44.988185'),
(603, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 20:59:31.990630'),
(604, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 21:39:31.910455'),
(605, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 21:40:21.413923'),
(606, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-18 21:46:41.265605'),
(607, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 10:05:20.526556'),
(608, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 10:33:18.398887'),
(609, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 11:29:58.341676'),
(610, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 12:06:32.145210'),
(611, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 12:10:28.432021'),
(612, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 12:17:42.246634');
INSERT INTO `login_history` (`lhId`, `userId`, `type`, `success`, `error`, `ip`, `userAgent`, `created`) VALUES
(613, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 14:10:03.702089'),
(614, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:14:15.410677'),
(615, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:30:23.823246'),
(616, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:49:33.684912'),
(617, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 15:50:48.787083'),
(618, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 19:21:38.469996'),
(619, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:07:28.377733'),
(620, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:29:53.226359'),
(621, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:37:04.018297'),
(622, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:37:47.989958'),
(623, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:39:23.888744'),
(624, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:43:08.984330'),
(625, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 20:50:01.661086'),
(626, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:16:04.428594'),
(627, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:39:47.427705'),
(628, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:41:47.348590'),
(629, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:45:13.237619'),
(630, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:50:34.070365'),
(631, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:51:12.262131'),
(632, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 21:53:33.836056'),
(633, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 22:01:06.120043'),
(634, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-19 22:10:07.122160'),
(635, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-20 18:01:14.415821'),
(636, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-20 18:03:02.383177'),
(637, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-20 18:39:10.449762'),
(638, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 06:56:22.868203'),
(639, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 14:52:58.037715'),
(640, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 14:57:13.407044'),
(641, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 15:12:30.387168'),
(642, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 15:13:37.715182'),
(643, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-21 15:33:21.364991'),
(644, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 11:57:19.101265'),
(645, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:06:25.369443'),
(646, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:10:11.783142'),
(647, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:11:08.471621'),
(648, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:11:55.536008'),
(649, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:12:22.961096'),
(650, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:14:07.686277'),
(651, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:14:58.998684'),
(652, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:15:23.767086'),
(653, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:18:28.968736'),
(654, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-22 12:19:22.928299'),
(655, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 08:37:08.488402'),
(656, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 08:40:42.817533'),
(657, 4, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 09:40:13.647077'),
(658, 1, 'password', 1, NULL, '195.113.101.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-23 09:45:25.040109'),
(659, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 12:50:53.529572'),
(660, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 16:05:05.703407'),
(661, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 16:06:09.947786'),
(662, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:03:09.704221'),
(663, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:45:50.283207'),
(664, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:50:06.775207'),
(665, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:50:51.466968'),
(666, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:52:26.134083'),
(667, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 17:56:12.313259'),
(668, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:20:24.309712'),
(669, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:24:04.024301'),
(670, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:26:09.809643'),
(671, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:28:04.903487'),
(672, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:29:55.217270'),
(673, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-23 18:50:02.683867'),
(674, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-24 14:36:05.751406'),
(675, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-24 18:27:38.951471'),
(676, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-29 17:54:50.203874'),
(677, 4, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-29 20:28:52.468112'),
(678, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0', '2025-04-29 21:36:36.101013'),
(679, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 08:49:29.464903'),
(680, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 08:49:45.150644'),
(681, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 08:50:13.228502'),
(682, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:22:28.566080'),
(683, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:23:06.747633'),
(684, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:23:26.265510'),
(685, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-11 09:46:12.279255'),
(686, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-14 18:21:39.831588'),
(687, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-14 19:12:48.554957'),
(688, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 08:13:37.440847'),
(689, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 18:59:25.843808'),
(690, 1, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 21:16:17.780370'),
(691, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-18 21:16:31.905592'),
(692, 2, 'password', 1, NULL, '178.255.168.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0', '2025-05-24 08:01:25.209816'),
(693, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 14:47:27.565898'),
(694, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 15:16:28.499386'),
(695, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 15:39:12.868124'),
(696, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-27 18:03:43.242677'),
(697, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 10:36:50.861949'),
(698, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 10:55:01.981100'),
(699, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 11:36:22.684383'),
(700, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 11:57:46.721650'),
(701, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 15:32:48.584740'),
(702, 1, 'passkey', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 15:54:30.325069'),
(703, 1, 'qrcode', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 16:11:44.718961'),
(704, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 16:28:59.020556'),
(705, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 17:06:48.129734'),
(706, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 17:36:47.741641'),
(707, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 18:07:39.759379'),
(708, 4, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:36:58.965786'),
(709, 4, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:36:58.968002'),
(710, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 20:53:25.691785'),
(711, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-29 21:11:26.604839'),
(712, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 07:51:41.923504'),
(713, 2, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 07:58:10.272622'),
(714, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 08:28:41.036219'),
(715, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 15:02:32.921533'),
(716, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 15:36:02.056564'),
(717, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 16:51:23.517938'),
(718, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 17:26:41.640022'),
(719, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-06-30 17:47:46.055991'),
(720, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 15:51:40.115690'),
(721, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 17:24:39.205873'),
(722, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 18:07:05.887752'),
(723, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 18:52:23.895582'),
(724, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 19:22:45.879754'),
(725, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 19:47:08.269630'),
(726, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 20:22:59.008478'),
(727, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 20:38:06.987053'),
(728, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 21:46:22.217773'),
(729, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:03:54.282078'),
(730, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-01 22:41:05.383526'),
(731, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 07:02:20.410436'),
(732, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 19:04:02.751244'),
(733, 4, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 19:49:04.398419'),
(734, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 20:17:10.742622'),
(735, 4, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 20:19:57.074514'),
(736, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:11:34.684569'),
(737, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:12:49.628206'),
(738, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '2025-07-02 21:13:58.345889'),
(739, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-14 19:01:15.312567'),
(740, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-15 08:07:27.951826'),
(741, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-17 12:10:50.174904'),
(742, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:22:35.413921'),
(743, 4, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:33:23.557123'),
(744, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:33:37.623065'),
(745, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-18 17:53:57.870019'),
(746, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 11:07:28.874618'),
(747, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 14:10:12.585585'),
(748, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 15:51:56.367526'),
(749, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 16:10:53.755603'),
(750, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0', '2025-08-19 17:33:24.709343'),
(751, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 09:55:13.959602'),
(752, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 10:14:51.504985'),
(753, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 10:30:13.039696'),
(754, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-08-30 11:18:29.833863'),
(755, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-09-01 18:10:10.658396'),
(756, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', '2025-09-01 18:47:57.890895'),
(757, 4, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 16:22:00.727181'),
(758, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 18:16:49.287050'),
(759, 1, 'password', 1, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 18:20:57.166988');

-- --------------------------------------------------------

--
-- Struktura tabulky `messages`
--

CREATE TABLE `messages` (
  `messageId` int(11) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `message` text NOT NULL,
  `author` int(11) NOT NULL,
  `sent` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `requireConfirm` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `messages`
--

INSERT INTO `messages` (`messageId`, `type`, `message`, `author`, `sent`, `deleted`, `requireConfirm`) VALUES
(1, 0, 'Zkouškaa :¨)', 1, '2024-02-19 14:28:02.801261', 0, 0),
(2, 0, 'Zkouškaa :¨)', 1, '2024-02-19 14:28:28.364949', 0, 0),
(3, 0, 'Dobrý den,\n\nzasílám Vám tuto zkušební zprávu :)\n\nxxx', 1, '2024-03-13 07:22:35.376658', 0, 0),
(4, 0, 'asdasdasdasddas', 2, '2024-04-01 06:33:37.960110', 0, 0),
(5, 0, 'asdasd', 2, '2024-04-01 07:01:02.287917', 0, 0);

-- --------------------------------------------------------

--
-- Struktura tabulky `messages_receivers`
--

CREATE TABLE `messages_receivers` (
  `message` int(11) NOT NULL,
  `receiver` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `isConfirmed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `messages_receivers`
--

INSERT INTO `messages_receivers` (`message`, `receiver`, `isRead`, `isConfirmed`) VALUES
(2, 11, 0, 0),
(2, 19, 0, 0),
(2, 23, 0, 0),
(3, 2, 1, 0),
(5, 1, 1, 0),
(5, 25, 0, 0),
(5, 31, 0, 0);

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
(8, '$2b$12$fum0BboY2xESq9TF3FlpRORtfoIvCNStckKtxEv.zkjRjuGavPUy.');

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
(4, 'Bartuška', 'Martin\n', 0, '1994-01-21', '', 0, 1, 0, NULL),
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
(1, 1),
(4, 1),
(1, 3),
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
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabulky `qrlogin`
--

CREATE TABLE `qrlogin` (
  `qrcode` varchar(255) NOT NULL,
  `socket` text NOT NULL,
  `userAgent` text NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
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
  `license` text NOT NULL,
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

INSERT INTO `schools` (`schoolId`, `name`, `shortName`, `district`, `code`, `owner`, `apiToken`, `license`, `created`, `startHour`, `startMinute`, `lessonHour`, `breakTime`, `resetPasswordWithEmail`, `warningAbsencePercent`, `fastLogin`, `modules`, `studentsLimit`, `gdpr_firstname`, `gdpr_lastname`, `gdpr_phone`, `gdpr_email`, `gdpr_mobile`, `gdpr_databox`, `gdpr_web`) VALUES
(1, 'Střední průmyslová a Vyšší odborná škola v Písku', 'SPŠ Písek', 63, 'SPS-PI', 1, '24Q7TZDGAEYGUN1H0DMJDHLZROCA76UF77UY1DK5R01VQ120Q4RS45LVU5JIGBV4', '8COVTPDXLTLVEQ744IICNJMK4GYGDDZUM6SBA2QD493GKQ7PVOOBNIYVWR594AZU', '2024-09-29 17:39:02', 8, 0, 45, 5, 1, 20, 0, '-1', -1, 'GDPR', 'ZVAS', '389822501', NULL, '608057836', '3cdj5ts', 'zvas.cz');

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
(2, '2024-09-02', '2025-08-31', '2025-01-30'),
(3, '2022-09-05', '2023-08-31', '2023-01-30');

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
  `studentsPerClass` int(11) NOT NULL,
  `numOfClass` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `scopes`
--

INSERT INTO `scopes` (`scopeId`, `name`, `shortcut`, `code`, `years`, `studentsPerClass`, `numOfClass`) VALUES
(1, 'Elektrotechnika', 'ELE', '26-41-M/01 Elektrotechnika', 4, 30, 2),
(2, 'Informační technologie', 'IT', '18-20-M/01', 4, 30, 1),
(3, 'Počítačové projektování', 'PP', '26-41-M/01 Elektrotechnika', 4, 30, 1);

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
-- Struktura tabulky `student_homeworks`
--

CREATE TABLE `student_homeworks` (
  `student` int(11) NOT NULL,
  `homework` int(11) NOT NULL,
  `submitted` tinyint(1) NOT NULL DEFAULT 0,
  `finished` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `student_homeworks`
--

INSERT INTO `student_homeworks` (`student`, `homework`, `submitted`, `finished`) VALUES
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
(36, 'Anglický jazyk odborný', 'AJO');

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
(4, NULL, '2025-06-28', -1, '2025-08-31', -1, 'holiday', NULL, NULL, '2025-06-30 16:56:09', 1);

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
  `teacher` int(11) NOT NULL,
  `subject` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(72, 4, 6, 0, 34, 11, 1, 11);

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
(739, '$2b$04$A0OH39YvlMHDgv88l44p1.OtPtMC9FtOYeWjlIB6S2YIyXCSh9xA.', 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', '2025-10-12 20:35:57.162000', '2025-10-12 20:20:57.162000', 1, NULL, NULL);

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
(1, 'Napicu.eu', 1, 1, 'CZ', '69696969', 'CZ69696969', '', 'napicu.eu', 'Napicu', 'Člověk', '457812331', 'admin@napicu.eu', 'approved', '2025-01-01 22:49:42.000000', '2024-10-01 16:35:00.000000', NULL, NULL, NULL, NULL),
(2, 'Lupták s.r.o.', 1, 1, 'CZ', '77777777', 'CZ77777777', '', 'luptak.cz', 'Lukáš', 'Němec', '', '', 'approved', '2024-08-02 20:21:09.125251', '2024-08-11 16:35:06.000000', NULL, NULL, NULL, NULL),
(3, 'Zatka s.r.o.', 1, 1, 'CZ', '11111111', 'CZ11111111', '', 'zatka.cz', 'Pan', 'Zatka', '', '', 'approved', '2024-11-20 21:21:09.125251', '2024-12-08 17:35:10.000000', NULL, NULL, NULL, NULL),
(6, 'WEDOS Internet, a.s.', 1, 1, 'CZ', '28115708', 'CZ28115708', '', 'vedos.cz', 'Josef', 'Grill', '777222543', 'hosting@wedos.com', 'approved', '2025-04-05 08:30:31.000000', '2025-04-05 08:30:31.000000', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_company_rating`
--

CREATE TABLE `traineeship_company_rating` (
  `trcrId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `rating` decimal(10,1) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_company_rating`
--

INSERT INTO `traineeship_company_rating` (`trcrId`, `companyId`, `studentId`, `rating`, `description`) VALUES
(1, 1, 1, 5.0, ''),
(2, 1, 27, 2.5, ''),
(3, 1, 30, 4.5, ''),
(4, 1, 32, 4.5, ''),
(5, 1, 25, 5.0, '');

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
(2, 1, 1, 0),
(3, 2, 3, 1),
(4, 2, 1, 1);

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
  `personId` int(11) NOT NULL,
  `companyId` int(11) NOT NULL,
  `created` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `addedBy` int(11) DEFAULT NULL,
  `status` enum('active','deleted') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_instructors`
--

INSERT INTO `traineeship_instructors` (`personId`, `companyId`, `created`, `addedBy`, `status`) VALUES
(37, 2, '2025-03-16 18:30:31.804432', 11, 'active'),
(39, 1, '2025-03-16 18:30:31.804432', 11, 'active');

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
(1, 1, 1, 39),
(1, 2, 6, NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `traineeship_weeks`
--

CREATE TABLE `traineeship_weeks` (
  `trWeekId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `ignoredDays` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Vypisuji data pro tabulku `traineeship_weeks`
--

INSERT INTO `traineeship_weeks` (`trWeekId`, `groupId`, `start`, `end`, `ignoredDays`) VALUES
(1, 10, '2024-12-23', '2025-01-03', '6,7'),
(2, 10, '2025-01-13', '2025-01-24', '6,7');

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
(1, 1, 'kosik', 8, 0, 0, 1, 'cs', NULL, 0, 1, 1, 1, 1, 745, 0, 'C5XFQVK3NZVBWP3E', '2025-06-27 14:33:48', '{\"seed\":\"iyGs1BUjIryJVZDk\",\"type\":\"avataaarsNeutral\",\"eyebrows\":\"default\",\"eyes\":\"default\",\"mouth\":\"default\"}'),
(2, 2, 'pizinger', 1, 0, 0, 0, 'cs', NULL, 0, 1, 1, 1, 1, 0, 0, 'HEGBKGSXDNISYF3B', '2025-06-27 14:33:48', '{\"seed\":\"A7jrlqXppJ5pO0u7\",\"type\":\"avataaarsNeutral\",\"eyebrows\":\"default\",\"eyes\":\"default\",\"mouth\":\"default\"}'),
(3, 33, 'testrodic', 1, 0, 0, 0, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, NULL, '2025-06-27 14:33:48', '{}'),
(4, 4, 'admin', 1, -1, 1, 1, 'cs', NULL, 0, 0, 1, 1, 1, 0, 0, 'FJ3XKHKNJYBHIIIQ', '2025-06-27 14:33:48', '{}'),
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
  `used` tinyint(1) NOT NULL DEFAULT 0
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
(12, '3bb84135-dc6e-4f43-95aa-83588c234066', 1, NULL, '2025-10-12 21:12:30', '2025-10-12 21:27:30', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0');

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
  ADD KEY `admin` (`admin`);

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
  ADD KEY `student` (`student`),
  ADD KEY `teacher` (`teacher`);

--
-- Indexy pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  ADD PRIMARY KEY (`gcId`),
  ADD UNIQUE KEY `groupId_2` (`groupId`,`subject`,`columnIndex`),
  ADD KEY `groupId` (`groupId`),
  ADD KEY `subject` (`subject`);

--
-- Indexy pro tabulku `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`groupId`),
  ADD UNIQUE KEY `name` (`name`,`num`,`class`,`year`) USING HASH,
  ADD KEY `year` (`year`),
  ADD KEY `class` (`class`);

--
-- Indexy pro tabulku `homeworks`
--
ALTER TABLE `homeworks`
  ADD PRIMARY KEY (`homeworkID`),
  ADD KEY `lesson` (`lesson`);

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
  ADD PRIMARY KEY (`lhId`),
  ADD KEY `userId` (`userId`);

--
-- Indexy pro tabulku `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageId`),
  ADD KEY `author` (`author`);

--
-- Indexy pro tabulku `messages_receivers`
--
ALTER TABLE `messages_receivers`
  ADD UNIQUE KEY `message` (`message`,`receiver`),
  ADD KEY `receiver` (`receiver`);

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
-- Indexy pro tabulku `qrlogin`
--
ALTER TABLE `qrlogin`
  ADD UNIQUE KEY `qrcode` (`qrcode`);

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
  ADD UNIQUE KEY `license` (`license`) USING HASH,
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
-- Indexy pro tabulku `student_homeworks`
--
ALTER TABLE `student_homeworks`
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
  ADD KEY `subject` (`subject`),
  ADD KEY `teacher` (`teacher`);

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
  ADD PRIMARY KEY (`trcrId`),
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
  ADD UNIQUE KEY `personId` (`personId`,`companyId`),
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
  MODIFY `auditId` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `cbId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

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
  MODIFY `gcId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pro tabulku `groups`
--
ALTER TABLE `groups`
  MODIFY `groupId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pro tabulku `homeworks`
--
ALTER TABLE `homeworks`
  MODIFY `homeworkID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  MODIFY `lhId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=760;

--
-- AUTO_INCREMENT pro tabulku `messages`
--
ALTER TABLE `messages`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `passwords`
--
ALTER TABLE `passwords`
  MODIFY `passwordId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `syId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `scopes`
--
ALTER TABLE `scopes`
  MODIFY `scopeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pro tabulku `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subjectId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT pro tabulku `substitution`
--
ALTER TABLE `substitution`
  MODIFY `substitutionId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pro tabulku `timetable`
--
ALTER TABLE `timetable`
  MODIFY `lessonId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT pro tabulku `tokens`
--
ALTER TABLE `tokens`
  MODIFY `tokenId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=740;

--
-- AUTO_INCREMENT pro tabulku `traineeship_companies`
--
ALTER TABLE `traineeship_companies`
  MODIFY `companyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pro tabulku `traineeship_company_rating`
--
ALTER TABLE `traineeship_company_rating`
  MODIFY `trcrId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pro tabulku `traineeship_company_scopes`
--
ALTER TABLE `traineeship_company_scopes`
  MODIFY `tscsId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `ubcId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `users_credentials`
--
ALTER TABLE `users_credentials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pro tabulku `users_resetpassword`
--
ALTER TABLE `users_resetpassword`
  MODIFY `user_resetpassword_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  ADD CONSTRAINT `auditlog_ibfk_1` FOREIGN KEY (`admin`) REFERENCES `persons` (`personId`);

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
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`student`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`teacher`) REFERENCES `teachers` (`personId`);

--
-- Omezení pro tabulku `grades_columns`
--
ALTER TABLE `grades_columns`
  ADD CONSTRAINT `grades_columns_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groups` (`groupId`),
  ADD CONSTRAINT `grades_columns_ibfk_2` FOREIGN KEY (`subject`) REFERENCES `subjects` (`subjectId`);

--
-- Omezení pro tabulku `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`year`) REFERENCES `school_years` (`syId`),
  ADD CONSTRAINT `groups_ibfk_2` FOREIGN KEY (`class`) REFERENCES `classes` (`classId`);

--
-- Omezení pro tabulku `homeworks`
--
ALTER TABLE `homeworks`
  ADD CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`lesson`) REFERENCES `classbook` (`cbId`);

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
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Omezení pro tabulku `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`author`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `messages_receivers`
--
ALTER TABLE `messages_receivers`
  ADD CONSTRAINT `messages_receivers_ibfk_1` FOREIGN KEY (`message`) REFERENCES `messages` (`messageId`),
  ADD CONSTRAINT `messages_receivers_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `persons` (`personId`);

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
-- Omezení pro tabulku `student_homeworks`
--
ALTER TABLE `student_homeworks`
  ADD CONSTRAINT `student_homeworks_ibfk_1` FOREIGN KEY (`student`) REFERENCES `students` (`personId`),
  ADD CONSTRAINT `student_homeworks_ibfk_2` FOREIGN KEY (`homework`) REFERENCES `homeworks` (`homeworkID`);

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
  ADD CONSTRAINT `teachers_subject_ibfk_1` FOREIGN KEY (`subject`) REFERENCES `subjects` (`subjectId`),
  ADD CONSTRAINT `teachers_subject_ibfk_2` FOREIGN KEY (`teacher`) REFERENCES `teachers` (`personId`);

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
  ADD CONSTRAINT `traineeship_instructors_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `traineeship_companies` (`companyId`),
  ADD CONSTRAINT `traineeship_instructors_ibfk_2` FOREIGN KEY (`personId`) REFERENCES `persons` (`personId`);

--
-- Omezení pro tabulku `traineeship_students`
--
ALTER TABLE `traineeship_students`
  ADD CONSTRAINT `traineeship_students_ibfk_1` FOREIGN KEY (`company`) REFERENCES `traineeship_companies` (`companyId`),
  ADD CONSTRAINT `traineeship_students_ibfk_2` FOREIGN KEY (`instructor`) REFERENCES `traineeship_instructors` (`personId`),
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
