-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('ACTIVO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('C1', 'C2', 'C3');

-- CreateEnum
CREATE TYPE "NivelFilter" AS ENUM ('C1', 'C2', 'C3', 'TODOS');

-- CreateEnum
CREATE TYPE "ModoPremio" AS ENUM ('PRE_CARGA', 'MANUAL');

-- CreateEnum
CREATE TYPE "EstadoSorteo" AS ENUM ('PENDIENTE', 'EN_CURSO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "MotivoExclusion" AS ENUM ('GANADOR', 'REPETICION');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "lugar" TEXT,
    "hora" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'ACTIVO',
    "whatsapp_link" TEXT,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "nivel" "Nivel" NOT NULL,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "numero_asignado" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorteos" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel_filtro" "NivelFilter" NOT NULL DEFAULT 'TODOS',
    "modo_premios" "ModoPremio" NOT NULL DEFAULT 'MANUAL',
    "estado" "EstadoSorteo" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sorteos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premios" (
    "id" TEXT NOT NULL,
    "sorteo_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "asignado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "premios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ganadores" (
    "id" TEXT NOT NULL,
    "sorteo_id" TEXT NOT NULL,
    "participante_id" TEXT NOT NULL,
    "premio_id" TEXT,
    "premio_descripcion" TEXT,
    "numero_ganador" INTEGER NOT NULL,
    "confirmado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ganadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numeros_excluidos_sesion" (
    "id" TEXT NOT NULL,
    "sorteo_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "motivo" "MotivoExclusion" NOT NULL,

    CONSTRAINT "numeros_excluidos_sesion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_telefon_evento_id_key" ON "participantes"("telefon", "evento_id");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_evento_id_numero_asignado_key" ON "participantes"("evento_id", "numero_asignado");

-- AddForeignKey
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteos" ADD CONSTRAINT "sorteos_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premios" ADD CONSTRAINT "premios_sorteo_id_fkey" FOREIGN KEY ("sorteo_id") REFERENCES "sorteos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganadores" ADD CONSTRAINT "ganadores_sorteo_id_fkey" FOREIGN KEY ("sorteo_id") REFERENCES "sorteos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganadores" ADD CONSTRAINT "ganadores_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ganadores" ADD CONSTRAINT "ganadores_premio_id_fkey" FOREIGN KEY ("premio_id") REFERENCES "premios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numeros_excluidos_sesion" ADD CONSTRAINT "numeros_excluidos_sesion_sorteo_id_fkey" FOREIGN KEY ("sorteo_id") REFERENCES "sorteos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
