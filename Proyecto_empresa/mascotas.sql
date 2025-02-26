CREATE DATABASE CasaDeLaMascota;
USE CasaDeLaMascota;

CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol_id INT
);

CREATE TABLE Clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100) UNIQUE
);

CREATE TABLE Mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie ENUM('Perro', 'Gato', 'Ave', 'Reptil', 'Otro') NOT NULL,
    raza VARCHAR(100),
    edad INT,
    historial_medico TEXT,
    cliente_id INT
);

CREATE TABLE Citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT,
    veterinario_id INT,
    fecha DATETIME NOT NULL,
    motivo TEXT,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'atendida') DEFAULT 'pendiente'
);

CREATE TABLE Recordatorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT,
    metodo ENUM('SMS', 'Correo') NOT NULL,
    enviado TEXT
);

CREATE TABLE HistorialClinico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT,
    fecha DATE NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    veterinario_id INT
);

CREATE TABLE Vacunas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT,
    nombre VARCHAR(100) NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    proxima_dosis DATE,
    veterinario_id INT
);

CREATE TABLE Facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    fecha_emision DATE NOT NULL,
    total DECIMAL(10,2),
    estado ENUM('pendiente', 'pagado') DEFAULT 'pendiente'
);

CREATE TABLE Pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') NOT NULL,
    fecha_pago DATE NOT NULL
);

CREATE TABLE Adopciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT,
    adoptante_id INT,
    fecha_adopcion DATE NOT NULL
);

CREATE TABLE Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INT
);

CREATE TABLE Ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    fecha DATE NOT NULL,
    total DECIMAL(10,2)
);

CREATE TABLE DetallesVenta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    producto_id INT,
    cantidad INT,
    subtotal DECIMAL(10,2)
);

ALTER TABLE Usuarios ADD CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES Roles(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Mascotas ADD CONSTRAINT fk_mascotas_clientes FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Citas ADD CONSTRAINT fk_citas_mascotas FOREIGN KEY (mascota_id) REFERENCES Mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Citas ADD CONSTRAINT fk_citas_veterinarios FOREIGN KEY (veterinario_id) REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Recordatorios ADD CONSTRAINT fk_recordatorios_citas FOREIGN KEY (cita_id) REFERENCES Citas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE HistorialClinico ADD CONSTRAINT fk_historial_mascotas FOREIGN KEY (mascota_id) REFERENCES Mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE HistorialClinico ADD CONSTRAINT fk_historial_veterinarios FOREIGN KEY (veterinario_id) REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Vacunas ADD CONSTRAINT fk_vacunas_mascotas FOREIGN KEY (mascota_id) REFERENCES Mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Vacunas ADD CONSTRAINT fk_vacunas_veterinarios FOREIGN KEY (veterinario_id) REFERENCES Usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Facturas ADD CONSTRAINT fk_facturas_clientes FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Pagos ADD CONSTRAINT fk_pagos_facturas FOREIGN KEY (factura_id) REFERENCES Facturas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Adopciones ADD CONSTRAINT fk_adopciones_mascotas FOREIGN KEY (mascota_id) REFERENCES Mascotas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Adopciones ADD CONSTRAINT fk_adopciones_adoptantes FOREIGN KEY (adoptante_id) REFERENCES Clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Ventas ADD CONSTRAINT fk_ventas_clientes FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE DetallesVenta ADD CONSTRAINT fk_detallesventa_ventas FOREIGN KEY (venta_id) REFERENCES Ventas(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE DetallesVenta ADD CONSTRAINT fk_detallesventa_productos FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE ON UPDATE CASCADE;
