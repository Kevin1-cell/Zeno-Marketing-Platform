-- CreateEnum
CREATE TYPE "TipoParticipante" AS ENUM ('EMPLEADO', 'INVITADO');

-- AlterTable
ALTER TABLE "participantes" ADD COLUMN     "recompensa" TEXT,
ADD COLUMN     "se_unio" BOOLEAN,
ADD COLUMN     "tipo" "TipoParticipante" NOT NULL DEFAULT 'EMPLEADO',
ALTER COLUMN "nivel" DROP NOT NULL;
