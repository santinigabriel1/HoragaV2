CREATE DATABASE IF NOT EXISTS agendamento;
USE agendamento;
-- Remove as tabelas se já existirem (ordem importa por causa das FKs)
DROP TABLE IF EXISTS inst_user; -- IGNORE
DROP TABLE IF EXISTS InstituicaoUsuario;
DROP TABLE IF EXISTS Agendamentos;
DROP TABLE IF EXISTS Salas;
DROP TABLE IF EXISTS Instituicoes;
DROP TABLE IF EXISTS Sessoes;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Usuarios;

-- Criação da tabela de instituições
CREATE TABLE Instituicoes (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    organizador BIGINT UNSIGNED,
    nome VARCHAR(250) NOT NULL,
    descricao VARCHAR(250),    
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Criação da tabela de salas
CREATE TABLE Salas (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    fk_instituicao_id BIGINT unsigned NOT NULL,
    nome VARCHAR(250) NOT NULL,
    capacidade INT,
    horario JSON,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP     
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Criação da tabela de usuários
CREATE TABLE Usuarios (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50),
    avatar VARCHAR(50),
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Relação muitos-para-muitos entre usuários e instituições
CREATE TABLE InstituicaoUsuario (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    fk_instituicao_id BIGINT unsigned NOT NULL,
    fk_usuario_id BIGINT unsigned NOT NULL,
    aceito BOOLEAN DEFAULT FALSE, -- indica se o convite foi aceito
    bloqueado BOOLEAN DEFAULT FALSE, -- indica se o usuário está bloqueado na instituição
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_instituicao_usuario (fk_instituicao_id, fk_usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Criação da tabela de agendamentos
CREATE TABLE Agendamentos (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    fk_usuario_id BIGINT unsigned NOT NULL,
    fk_salas_id BIGINT unsigned NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    horarios JSON,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Criação da tabela de Sessoes
CREATE TABLE Sessoes (
  usuario BIGINT unsigned NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  validade datetime DEFAULT NULL,
  PRIMARY KEY (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE Instituicoes ADD CONSTRAINT fk_organizador
    FOREIGN KEY (organizador)
    REFERENCES Usuarios (id) ON DELETE SET NULL;

ALTER TABLE Salas ADD CONSTRAINT FK_Salas_Instituicoes
    FOREIGN KEY (fk_instituicao_id)
    REFERENCES Instituicoes (id) ON DELETE CASCADE;

ALTER TABLE InstituicaoUsuario ADD CONSTRAINT FK_InstituicaoUsuario_Instituicoes
    FOREIGN KEY (fk_instituicao_id)
    REFERENCES Instituicoes (id) ON DELETE CASCADE;

ALTER TABLE InstituicaoUsuario ADD CONSTRAINT FK_InstituicaoUsuario_Usuarios
    FOREIGN KEY (fk_usuario_id)
    REFERENCES Usuarios (id) ON DELETE CASCADE;

ALTER TABLE Agendamentos ADD CONSTRAINT FK_Agendamentos_Usuarios
    FOREIGN KEY (fk_usuario_id)
    REFERENCES Usuarios (id) ON DELETE CASCADE;

ALTER TABLE Agendamentos ADD CONSTRAINT FK_Agendamentos_Salas
    FOREIGN KEY (fk_salas_id)
    REFERENCES Salas (id) ON DELETE CASCADE;
ALTER TABLE Sessoes ADD CONSTRAINT FK_Sessoes_Usuarios
    FOREIGN KEY (usuario)
    REFERENCES Usuarios (id) ON DELETE CASCADE; 
