-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-02-2025 a las 21:50:55
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_pedidos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido`
--

CREATE TABLE `detalles_pedido` (
  `idDetalle` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido_ingredientes`
--

CREATE TABLE `detalles_pedido_ingredientes` (
  `idDetalle` int(11) NOT NULL,
  `idIngrediente` int(11) NOT NULL,
  `modificacion` enum('agregado','removido','extra') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingredientes`
--

CREATE TABLE `ingredientes` (
  `idIngrediente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `unidad_medida` varchar(50) NOT NULL DEFAULT 'unidad',
  `precio_por_unidad` decimal(10,2) NOT NULL DEFAULT 0.00,
  `proveedor` varchar(255) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `fecha_caducidad` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ingredientes`
--

INSERT INTO `ingredientes` (`idIngrediente`, `nombre`, `unidad_medida`, `precio_por_unidad`, `proveedor`, `fecha_compra`, `fecha_caducidad`) VALUES
(1, 'Tomate', 'Unidad', 500.00, 'Proveedor 1', '2025-02-25', '2025-03-04'),
(2, 'Cebolla', 'Unidad', 500.00, 'Proveedor 2', '2025-02-26', '2025-03-05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `idInventario` int(11) NOT NULL,
  `idIngrediente` int(11) NOT NULL,
  `cantidadDisponible` int(11) NOT NULL DEFAULT 0,
  `estado` enum('disponible','bajo','agotado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `idPago` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `metodo` enum('tarjeta','efectivo','paypal','apple_pay','google_pay') NOT NULL,
  `monto` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `idPedido` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  `fechaEntregaProgramada` datetime DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','preparando','en camino','entregado','cancelado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `idProducto` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precioVenta` decimal(10,2) NOT NULL,
  `precioProduccion` decimal(10,2) NOT NULL,
  `oferta` tinyint(1) DEFAULT 0,
  `precioOferta` decimal(10,2) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  `fechaCreat` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`idProducto`, `titulo`, `descripcion`, `precioVenta`, `precioProduccion`, `oferta`, `precioOferta`, `img`, `estado`, `fechaCreat`) VALUES
(10, 'Hamburguesa con papas', 'Hamburguesa con papas, especial y para la familia.', 20000.00, 10000.00, 1, 18000.00, 'static/img/productos/card-1.jpg', 'Activo', '2025-02-25 01:45:32'),
(11, 'Papas especiales', 'Papas especiales para una persona', 10000.00, 5000.00, 1, 8000.00, 'static/img/productos/card-2.jpg', 'Activo', '2025-02-25 01:53:56'),
(17, 'Malteada Especial Mediana', 'Malteada de vainilla mediana compuesta de 250ml', 22000.00, 12000.00, 1, 20000.00, 'static/img/productos/malteada-1.jpg', 'Activo', '2025-02-26 00:30:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_ingredientes`
--

CREATE TABLE `productos_ingredientes` (
  `idProducto` int(11) NOT NULL,
  `idIngrediente` int(11) NOT NULL,
  `cantidadNecesaria` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repartidores`
--

CREATE TABLE `repartidores` (
  `idRepartidor` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `estado` enum('disponible','ocupado','fuera de servicio') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_pedidos`
--

CREATE TABLE `seguimiento_pedidos` (
  `idSeguimiento` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `idRepartidor` int(11) NOT NULL,
  `estado` enum('pendiente','en camino','entregado') NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('cliente','repartidor','admin') NOT NULL,
  `create_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `nombre`, `email`, `password`, `rol`, `create_at`) VALUES
(2, 'Alejandro Cossi', 'yavl100220@gmail.com', 'scrypt:32768:8:1$HeQYxOg7rFF1Exmj$3133706c2c3787988be7258019f27603ad5d00e5379dfa0a7e714a5ab1f716fe9978865532f739742409b0de45f6e38c5bda273589b76d2947ca0af925918763', 'cliente', '2025-02-25 01:15:21');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD PRIMARY KEY (`idDetalle`),
  ADD KEY `idPedido` (`idPedido`),
  ADD KEY `idProducto` (`idProducto`);

--
-- Indices de la tabla `detalles_pedido_ingredientes`
--
ALTER TABLE `detalles_pedido_ingredientes`
  ADD PRIMARY KEY (`idDetalle`,`idIngrediente`),
  ADD KEY `idIngrediente` (`idIngrediente`);

--
-- Indices de la tabla `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD PRIMARY KEY (`idIngrediente`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`idInventario`),
  ADD KEY `idIngrediente` (`idIngrediente`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`idPago`),
  ADD KEY `idPedido` (`idPedido`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`idPedido`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`idProducto`);

--
-- Indices de la tabla `productos_ingredientes`
--
ALTER TABLE `productos_ingredientes`
  ADD PRIMARY KEY (`idProducto`,`idIngrediente`),
  ADD KEY `idIngrediente` (`idIngrediente`);

--
-- Indices de la tabla `repartidores`
--
ALTER TABLE `repartidores`
  ADD PRIMARY KEY (`idRepartidor`);

--
-- Indices de la tabla `seguimiento_pedidos`
--
ALTER TABLE `seguimiento_pedidos`
  ADD PRIMARY KEY (`idSeguimiento`),
  ADD KEY `idPedido` (`idPedido`),
  ADD KEY `idRepartidor` (`idRepartidor`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `correo` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  MODIFY `idDetalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `idIngrediente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `idInventario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `idPago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `idPedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `repartidores`
--
ALTER TABLE `repartidores`
  MODIFY `idRepartidor` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `seguimiento_pedidos`
--
ALTER TABLE `seguimiento_pedidos`
  MODIFY `idSeguimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedidos` (`idPedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalles_pedido_ingredientes`
--
ALTER TABLE `detalles_pedido_ingredientes`
  ADD CONSTRAINT `detalles_pedido_ingredientes_ibfk_1` FOREIGN KEY (`idDetalle`) REFERENCES `detalles_pedido` (`idDetalle`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalles_pedido_ingredientes_ibfk_2` FOREIGN KEY (`idIngrediente`) REFERENCES `ingredientes` (`idIngrediente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`idIngrediente`) REFERENCES `ingredientes` (`idIngrediente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD CONSTRAINT `metodos_pago_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedidos` (`idPedido`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos_ingredientes`
--
ALTER TABLE `productos_ingredientes`
  ADD CONSTRAINT `productos_ingredientes_ibfk_1` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON DELETE CASCADE,
  ADD CONSTRAINT `productos_ingredientes_ibfk_2` FOREIGN KEY (`idIngrediente`) REFERENCES `ingredientes` (`idIngrediente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `seguimiento_pedidos`
--
ALTER TABLE `seguimiento_pedidos`
  ADD CONSTRAINT `seguimiento_pedidos_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedidos` (`idPedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `seguimiento_pedidos_ibfk_2` FOREIGN KEY (`idRepartidor`) REFERENCES `repartidores` (`idRepartidor`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
