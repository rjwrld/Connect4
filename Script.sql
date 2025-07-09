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
