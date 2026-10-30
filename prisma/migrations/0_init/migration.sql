-- CreateTable
CREATE TABLE `administradores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_completo` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `cargo` INTEGER NOT NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('pendente', 'ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `email`(`email`),
    INDEX `fk_administradores_cargo`(`cargo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especie` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `idade` INTEGER NULL,
    `porte` VARCHAR(20) NULL,
    `temperamento` TEXT NULL,
    `sobre` TEXT NULL,
    `disparar_newsletter` BOOLEAN NOT NULL DEFAULT false,
    `criado_por` INTEGER NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `raca` VARCHAR(255) NULL,
    `peso` DECIMAL(6, 2) NULL,
    `castracao` VARCHAR(50) NULL,
    `vacinacao_em_dia` BOOLEAN NOT NULL DEFAULT false,
    `imagem` VARCHAR(500) NULL,

    INDEX `fk_animais_criado_por`(`criado_por`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_cargo` VARCHAR(50) NOT NULL,
    `pode_gerenciar_animais` BOOLEAN NOT NULL DEFAULT false,
    `pode_gerenciar_conteudo` BOOLEAN NOT NULL DEFAULT false,
    `pode_gerenciar_newsletter` BOOLEAN NOT NULL DEFAULT false,
    `pode_gerenciar_admins` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `nome_cargo`(`nome_cargo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conteudo_newsletter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conteudo_id` INTEGER NULL,
    `animal_id` INTEGER NULL,
    `status` ENUM('pendente', 'enviado') NOT NULL DEFAULT 'pendente',
    `adicionado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `enviado_em` DATETIME(0) NULL,

    INDEX `fk_cn_animal`(`animal_id`),
    INDEX `fk_cn_conteudo`(`conteudo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conteudos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` VARCHAR(50) NOT NULL,
    `status` ENUM('rascunho', 'publicado', 'agendado', 'arquivado') NOT NULL DEFAULT 'rascunho',
    `titulo` VARCHAR(255) NOT NULL,
    `descricao_conteudo` TEXT NOT NULL,
    `imagem` VARCHAR(500) NULL,
    `data_evento_campanha` DATETIME(0) NULL,
    `local_evento_campanha` VARCHAR(255) NULL,
    `url_arrecadacao` VARCHAR(500) NULL,
    `url_video` VARCHAR(500) NULL,
    `disparar_newsletter` BOOLEAN NOT NULL DEFAULT false,
    `criado_por` INTEGER NULL,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fixado` BOOLEAN NULL DEFAULT false,
    `autor` VARCHAR(255) NULL,
    `resumo` VARCHAR(500) NULL,
    `destaque` BOOLEAN NOT NULL DEFAULT false,
    `urgente` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_conteudos_criado_por`(`criado_por`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fotos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_solicitacoes_admin` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `solicitante_id` INTEGER UNSIGNED NOT NULL,
    `solicitante_nome` VARCHAR(255) NOT NULL,
    `solicitante_email` VARCHAR(255) NOT NULL,
    `cargo_solicitado` VARCHAR(255) NOT NULL,
    `decisao` ENUM('aprovado', 'rejeitado') NOT NULL,
    `administrador_id` INTEGER UNSIGNED NOT NULL,
    `administrador_nome` VARCHAR(255) NOT NULL,
    `decidido_em` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imagem_perfil` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_administradores` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,

    UNIQUE INDEX `id_administradores`(`id_administradores`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscritos_newsletter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens_recuperacao` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `usado` BOOLEAN NOT NULL DEFAULT false,
    `expira_em` DATETIME(0) NOT NULL,
    `criado_em` DATETIME(0) NOT NULL,

    INDEX `admin_id`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `administradores` ADD CONSTRAINT `fk_administradores_cargo` FOREIGN KEY (`cargo`) REFERENCES `cargos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `animais` ADD CONSTRAINT `fk_animais_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `administradores`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conteudo_newsletter` ADD CONSTRAINT `fk_cn_animal` FOREIGN KEY (`animal_id`) REFERENCES `animais`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conteudo_newsletter` ADD CONSTRAINT `fk_cn_conteudo` FOREIGN KEY (`conteudo_id`) REFERENCES `conteudos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conteudos` ADD CONSTRAINT `fk_conteudos_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `administradores`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `imagem_perfil` ADD CONSTRAINT `fk_imagem_perfil_admin` FOREIGN KEY (`id_administradores`) REFERENCES `administradores`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tokens_recuperacao` ADD CONSTRAINT `tokens_recuperacao_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `administradores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

