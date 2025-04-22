-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-04-2025 a las 05:34:36
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `if0_37122347_orders`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_ordenes`
--

CREATE TABLE `imagenes_ordenes` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `tipo_archivo` varchar(100) NOT NULL,
  `ruta_imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `id` int(11) NOT NULL,
  `NombreMarca` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `marcas`
--

INSERT INTO `marcas` (`id`, `NombreMarca`) VALUES
(1, 'ADATA'),
(2, 'Acer'),
(3, 'AMD'),
(4, 'Apple'),
(5, 'Asus'),
(6, 'Beats'),
(7, 'Bose'),
(8, 'Brother'),
(9, 'Canon'),
(10, 'Corsair'),
(11, 'DJI'),
(12, 'Dell'),
(13, 'Epson'),
(14, 'Fitbit'),
(15, 'Fujifilm'),
(16, 'Garmin'),
(17, 'Gigabyte'),
(18, 'HP'),
(19, 'Huawei'),
(20, 'Intel'),
(21, 'JBL'),
(22, 'Kingston'),
(23, 'LG'),
(24, 'Lenovo'),
(25, 'Logitech'),
(26, 'Microsoft'),
(27, 'Motorola'),
(28, 'MSI'),
(29, 'Nikon'),
(30, 'Nokia'),
(31, 'NVIDIA'),
(32, 'OnePlus'),
(33, 'Olympus'),
(34, 'Oppo'),
(35, 'Panasonic'),
(36, 'Philips'),
(37, 'Razer'),
(38, 'Realme'),
(39, 'Samsung'),
(40, 'SanDisk'),
(41, 'Seagate'),
(42, 'Sennheiser'),
(43, 'Sony'),
(44, 'TP-Link'),
(45, 'Toshiba'),
(46, 'Ubiquiti'),
(47, 'Vivo'),
(48, 'Western Digital'),
(49, 'Xiaomi'),
(50, 'Marvo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenesdetrabajo`
--

CREATE TABLE `ordenesdetrabajo` (
  `Id` int(11) NOT NULL,
  `NombreCliente` varchar(100) NOT NULL,
  `Identidad` varchar(20) NOT NULL,
  `TelefonoPrincipal` varchar(15) DEFAULT NULL,
  `TelefonoSecundario` varchar(15) DEFAULT NULL,
  `Modelo` varchar(50) DEFAULT NULL,
  `Marca` varchar(50) DEFAULT NULL,
  `TipoEquipo` varchar(50) DEFAULT NULL,
  `NumeroSerie` varchar(50) DEFAULT NULL,
  `Diagnostico` text DEFAULT NULL,
  `Reparacion` text DEFAULT NULL,
  `FechaEntrada` date DEFAULT current_timestamp(),
  `FechaCreacion_Orden` date DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `remember_tokens`
--

CREATE TABLE `remember_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` text DEFAULT NULL,
  `last_activity` int(10) UNSIGNED NOT NULL,
  `expires_at` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiposdeequipo`
--

CREATE TABLE `tiposdeequipo` (
  `id` int(11) NOT NULL,
  `NombreTipo` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tiposdeequipo`
--

INSERT INTO `tiposdeequipo` (`id`, `NombreTipo`) VALUES
(1, 'Adaptador Wi-Fi'),
(2, 'Altavoces'),
(3, 'Auriculares'),
(4, 'Cámara digital'),
(5, 'Consola de videojuegos'),
(6, 'Control remoto'),
(7, 'Desktop'),
(8, 'Disco duro externo'),
(9, 'Drone'),
(10, 'Escáner'),
(11, 'Impresora'),
(12, 'Laptop'),
(13, 'Memoria USB'),
(14, 'Micrófono'),
(15, 'Monitor'),
(16, 'Mouse'),
(17, 'Proyector'),
(18, 'Reproductor Blu-ray'),
(19, 'Reproductor multimedia'),
(20, 'Router'),
(21, 'SSD'),
(22, 'Sistema de sonido'),
(23, 'Smartphone'),
(24, 'Smartwatch'),
(25, 'Tablet'),
(26, 'Tarjeta gráfica'),
(27, 'Teclado'),
(28, 'Televisión'),
(29, 'UPS'),
(30, 'Videocámara');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `updated_at`) VALUES
(1, 'test', 'test', '2024-10-28 07:25:33', '2025-04-04 01:19:43');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `imagenes_ordenes`
--
ALTER TABLE `imagenes_ordenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_id` (`orden_id`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ordenesdetrabajo`
--
ALTER TABLE `ordenesdetrabajo`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `tiposdeequipo`
--
ALTER TABLE `tiposdeequipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `imagenes_ordenes`
--
ALTER TABLE `imagenes_ordenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `ordenesdetrabajo`
--
ALTER TABLE `ordenesdetrabajo`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `remember_tokens`
--
ALTER TABLE `remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiposdeequipo`
--
ALTER TABLE `tiposdeequipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `imagenes_ordenes`
--
ALTER TABLE `imagenes_ordenes`
  ADD CONSTRAINT `imagenes_ordenes_ibfk_1` FOREIGN KEY (`orden_id`) REFERENCES `ordenesdetrabajo` (`Id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD CONSTRAINT `remember_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
