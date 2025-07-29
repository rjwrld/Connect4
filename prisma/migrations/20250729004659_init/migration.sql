BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[jugador] (
    [id] INT NOT NULL IDENTITY(1,1),
    [identificacion] BIGINT NOT NULL,
    [nombre] NVARCHAR(255) NOT NULL,
    [partidas_ganadas] INT NOT NULL CONSTRAINT [DF__jugador__partida__5DCAEF64] DEFAULT 0,
    [partidas_perdidas] INT NOT NULL CONSTRAINT [DF__jugador__partida__5EBF139D] DEFAULT 0,
    [partidas_empatadas] INT NOT NULL CONSTRAINT [DF__jugador__partida__5FB337D6] DEFAULT 0,
    [marcador] INT NOT NULL CONSTRAINT [DF__jugador__marcado__60A75C0F] DEFAULT 0,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [DF__jugador__fecha_c__619B8048] DEFAULT CURRENT_TIMESTAMP,
    [fecha_actualizacion] DATETIME2 NOT NULL CONSTRAINT [DF__jugador__fecha_a__628FA481] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_jugador] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_jugador_identificacion] UNIQUE NONCLUSTERED ([identificacion])
);

-- CreateTable
CREATE TABLE [dbo].[partidas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [jugador1_id] INT NOT NULL,
    [jugador2_id] INT NOT NULL,
    [estado] NVARCHAR(20) NOT NULL CONSTRAINT [DF__partidas__estado__656C112C] DEFAULT 'en_curso',
    [ganador_id] INT,
    [resultado] NVARCHAR(10),
    [tablero] NVARCHAR(max) NOT NULL CONSTRAINT [DF__partidas__tabler__66603565] DEFAULT '[]',
    [turno_actual] INT NOT NULL CONSTRAINT [DF__partidas__turno___6754599E] DEFAULT 1,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [DF__partidas__fecha___68487DD7] DEFAULT CURRENT_TIMESTAMP,
    [fecha_actualizacion] DATETIME2 NOT NULL CONSTRAINT [DF__partidas__fecha___693CA210] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_partidas] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[movimientos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [partida_id] INT NOT NULL,
    [jugador_id] INT NOT NULL,
    [columna_letra] NCHAR(1) NOT NULL,
    [fila_posicion] INT NOT NULL,
    [numero_movimiento] INT NOT NULL,
    [fecha_creacion] DATETIME2 NOT NULL CONSTRAINT [DF__movimient__fecha__6EF57B66] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK_movimientos] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Jugador_backup] (
    [idJugador] INT NOT NULL,
    [nombre] NVARCHAR(100) NOT NULL,
    [marcador] INT NOT NULL CONSTRAINT [DF__Jugador__marcado__49C3F6B7] DEFAULT 0,
    CONSTRAINT [PK__Jugador__73F34C02CE489A7D] PRIMARY KEY CLUSTERED ([idJugador])
);

-- CreateTable
CREATE TABLE [dbo].[Partida_backup] (
    [idPartida] INT NOT NULL IDENTITY(1,1),
    [idJugador1] INT NOT NULL,
    [idJugador2] INT NOT NULL,
    [estadoTablero] NVARCHAR(max) NOT NULL,
    [historialMovimientos] NVARCHAR(max),
    [resultado] NVARCHAR(50),
    [fechaInicio] DATETIME CONSTRAINT [DF__Partida__fechaIn__571DF1D5] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__Partida__552192F6EC042774] PRIMARY KEY CLUSTERED ([idPartida])
);

-- AddForeignKey
ALTER TABLE [dbo].[partidas] ADD CONSTRAINT [FK_partidas_ganador] FOREIGN KEY ([ganador_id]) REFERENCES [dbo].[jugador]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[partidas] ADD CONSTRAINT [FK_partidas_jugador1] FOREIGN KEY ([jugador1_id]) REFERENCES [dbo].[jugador]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[partidas] ADD CONSTRAINT [FK_partidas_jugador2] FOREIGN KEY ([jugador2_id]) REFERENCES [dbo].[jugador]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[movimientos] ADD CONSTRAINT [FK_movimientos_jugador] FOREIGN KEY ([jugador_id]) REFERENCES [dbo].[jugador]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[movimientos] ADD CONSTRAINT [FK_movimientos_partida] FOREIGN KEY ([partida_id]) REFERENCES [dbo].[partidas]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Partida_backup] ADD CONSTRAINT [FK__Partida__idJugad__5812160E] FOREIGN KEY ([idJugador1]) REFERENCES [dbo].[Jugador_backup]([idJugador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Partida_backup] ADD CONSTRAINT [FK__Partida__idJugad__59063A47] FOREIGN KEY ([idJugador2]) REFERENCES [dbo].[Jugador_backup]([idJugador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
