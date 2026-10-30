-- AlterTable
ALTER TABLE `animais`
  ADD COLUMN `sexo` VARCHAR(20) NULL,
  ADD COLUMN `situacao_saude` TEXT NULL,
  ADD COLUMN `prioridade_apadrinhamento` BOOLEAN NOT NULL DEFAULT false;