CREATE DATABASE IF NOT EXISTS agendamento;
USE agendamento;
-- Remove as tabelas se já existirem (ordem importa por causa das FKs)
DROP TABLE IF EXISTS inst_user;
DROP TABLE IF EXISTS Agendamentos;
DROP TABLE IF EXISTS Salas;
DROP TABLE IF EXISTS Instituicoes;
DROP TABLE IF EXISTS Usuarios;

-- Criação da tabela de instituições
CREATE TABLE Instituicoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organizador BIGINT,
    nome VARCHAR(250) NOT NULL,
    descricao VARCHAR(250),    
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Criação da tabela de salas
CREATE TABLE Salas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fk_instituicao_id BIGINT NOT NULL,
    nome VARCHAR(250) NOT NULL,
    capacidade INT,
    horario JSON,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP     
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Criação da tabela de usuários
CREATE TABLE Usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50),
    avatar VARCHAR(50),
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Relação muitos-para-muitos entre usuários e instituições
CREATE TABLE inst_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fk_instituicao_id BIGINT NOT NULL,
    fk_usuario_id BIGINT NOT NULL,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Criação da tabela de agendamentos
CREATE TABLE Agendamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario_id BIGINT NOT NULL,
    fk_salas_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    horarios JSON,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



ALTER TABLE Instituicoes ADD CONSTRAINT fk_organizador
    FOREIGN KEY (organizador)
    REFERENCES Usuarios (id) ON DELETE SET NULL;

ALTER TABLE Salas ADD CONSTRAINT FK_Salas_Instituicoes
    FOREIGN KEY (fk_instituicao_id)
    REFERENCES Instituicoes (id) ON DELETE CASCADE;

ALTER TABLE inst_user ADD CONSTRAINT FK_inst_user_Instituicoes
    FOREIGN KEY (fk_instituicao_id)
    REFERENCES Instituicoes (id) ON DELETE CASCADE;

ALTER TABLE inst_user ADD CONSTRAINT FK_inst_user_Usuarios
    FOREIGN KEY (fk_usuario_id)
    REFERENCES Usuarios (id) ON DELETE CASCADE;

ALTER TABLE Agendamentos ADD CONSTRAINT FK_Agendamentos_Usuarios
    FOREIGN KEY (fk_usuario_id)
    REFERENCES Usuarios (id) ON DELETE CASCADE;

ALTER TABLE Agendamentos ADD CONSTRAINT FK_Agendamentos_Salas
    FOREIGN KEY (fk_salas_id)
    REFERENCES Salas (id) ON DELETE CASCADE;