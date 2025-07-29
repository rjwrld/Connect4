CREATE DATABASE CuatroEnLinea;
GO

USE CuatroEnLinea;
GO

CREATE TABLE Jugador (
    idJugador INT PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    marcador INT NOT NULL DEFAULT 0
);


CREATE TABLE Partida (
    idPartida INT PRIMARY KEY IDENTITY(1,1),
    idJugador1 INT NOT NULL,
    idJugador2 INT NOT NULL,
    estadoTablero NVARCHAR(MAX) NOT NULL, -- JSON del tablero
    historialMovimientos NVARCHAR(MAX) NULL, -- JSON con movimientos opcional
    resultado NVARCHAR(50), -- 'Jugador 1', 'Jugador 2', 'Empate'
    fechaInicio DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (idJugador1) REFERENCES Jugador(idJugador),
    FOREIGN KEY (idJugador2) REFERENCES Jugador(idJugador),
    CHECK (idJugador1 <> idJugador2)
);

-- SCRIPT PARA MIGRAR TU BASE DE DATOS ACTUAL AL ESQUEMA DE PRISMA
-- Ejecuta este script en SQL Server Management Studio
-- Cambia por el nombre real de tu base de datos si es diferente
USE [CuatroEnLinea];
GO

-- PASO 1: Renombrar tu tabla actual para hacer backup
IF OBJECT_ID('Jugador', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'Jugador', 'Jugador_backup';
    PRINT '✅ Tabla actual respaldada como Jugador_backup';
END
GO

-- PASO 2: Crear la nueva tabla con el esquema que espera Prisma
CREATE TABLE jugador (
    id int IDENTITY(1,1) NOT NULL,
    identificacion bigint NOT NULL,
    nombre nvarchar(255) NOT NULL,
    partidas_ganadas int NOT NULL DEFAULT 0,
    partidas_perdidas int NOT NULL DEFAULT 0,
    partidas_empatadas int NOT NULL DEFAULT 0,
    marcador int NOT NULL DEFAULT 0,
    fecha_creacion datetime2 NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_jugador PRIMARY KEY (id),
    CONSTRAINT UQ_jugador_identificacion UNIQUE (identificacion)
);
PRINT '✅ Nueva tabla jugador creada con esquema de Prisma';
GO

-- PASO 3: Migrar datos de la tabla anterior (si existe el backup)
IF OBJECT_ID('Jugador_backup', 'U') IS NOT NULL
BEGIN
    INSERT INTO jugador (identificacion, nombre, marcador)
    SELECT 
        idJugador,  -- Tu idJugador se convierte en identificacion
        nombre,
        ISNULL(marcador, 0)
    FROM Jugador_backup;
    
    PRINT '✅ Datos migrados de Jugador_backup a nueva tabla';
    
    DECLARE @rowCount int = @@ROWCOUNT;
    PRINT CONCAT('📊 Se migraron ', @rowCount, ' registros');
END
GO

-- PASO 4: Renombrar/migrar tabla Partida si existe
IF OBJECT_ID('Partida', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'Partida', 'Partida_backup';
    PRINT '✅ Tabla Partida respaldada como Partida_backup';
END
GO

-- PASO 5: Crear tabla partidas con esquema de Prisma
CREATE TABLE partidas (
    id int IDENTITY(1,1) NOT NULL,
    jugador1_id int NOT NULL,
    jugador2_id int NOT NULL,
    estado nvarchar(20) NOT NULL DEFAULT 'en_curso',
    ganador_id int NULL,
    resultado nvarchar(10) NULL,
    tablero nvarchar(MAX) NOT NULL DEFAULT '[]',
    turno_actual int NOT NULL DEFAULT 1,
    fecha_creacion datetime2 NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_partidas PRIMARY KEY (id),
    CONSTRAINT FK_partidas_jugador1 FOREIGN KEY (jugador1_id) REFERENCES jugador(id),
    CONSTRAINT FK_partidas_jugador2 FOREIGN KEY (jugador2_id) REFERENCES jugador(id),
    CONSTRAINT FK_partidas_ganador FOREIGN KEY (ganador_id) REFERENCES jugador(id)
);
PRINT '✅ Tabla partidas creada';
GO

-- PASO 6: Migrar datos de partidas si existen
IF OBJECT_ID('Partida_backup', 'U') IS NOT NULL
BEGIN
    -- Migrar partidas existentes
    INSERT INTO partidas (jugador1_id, jugador2_id, tablero, resultado, fecha_creacion)
    SELECT 
        (SELECT TOP 1 id FROM jugador WHERE identificacion = p.idJugador1),
        (SELECT TOP 1 id FROM jugador WHERE identificacion = p.idJugador2),
        ISNULL(p.estadoTablero, '[]'),
        p.resultado,
        ISNULL(p.fechaInicio, GETDATE())
    FROM Partida_backup p
    WHERE EXISTS (SELECT 1 FROM jugador WHERE identificacion = p.idJugador1)
      AND EXISTS (SELECT 1 FROM jugador WHERE identificacion = p.idJugador2);
    
    DECLARE @partidasCount int = @@ROWCOUNT;
    PRINT CONCAT('✅ Se migraron ', @partidasCount, ' partidas');
END
GO

-- PASO 7: Crear tabla movimientos
CREATE TABLE movimientos (
    id int IDENTITY(1,1) NOT NULL,
    partida_id int NOT NULL,
    jugador_id int NOT NULL,
    columna_letra nchar(1) NOT NULL,
    fila_posicion int NOT NULL,
    numero_movimiento int NOT NULL,
    fecha_creacion datetime2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_movimientos PRIMARY KEY (id),
    CONSTRAINT FK_movimientos_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON DELETE CASCADE,
    CONSTRAINT FK_movimientos_jugador FOREIGN KEY (jugador_id) REFERENCES jugador(id)
);
PRINT '✅ Tabla movimientos creada';
GO
