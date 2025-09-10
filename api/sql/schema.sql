CREATE DATABASE IF NOT EXISTS agendamento;
USE agendamento;
-- Remove as tabelas se já existirem (ordem importa por causa das FKs)
DROP TABLE IF EXISTS inst_user;
DROP TABLE IF EXISTS Agendamentos;
DROP TABLE IF EXISTS Salas;
DROP TABLE IF EXISTS Instituicoes;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Usuarios;

DROP PROCEDURE IF EXISTS token_consultar;
DROP PROCEDURE IF EXISTS token_criar;
DROP PROCEDURE IF EXISTS token_extender;


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
CREATE TABLE inst_user (
    id BIGINT unsigned AUTO_INCREMENT PRIMARY KEY,
    fk_instituicao_id BIGINT unsigned NOT NULL,
    fk_usuario_id BIGINT unsigned NOT NULL,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Criação da tabela de tokens
CREATE TABLE Token (
  usuario BIGINT unsigned NOT NULL,
  chave_token varchar(255) DEFAULT NULL,
  validade datetime DEFAULT NULL,
  PRIMARY KEY (usuario)
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
ALTER TABLE Token ADD CONSTRAINT FK_Token_Usuarios
    FOREIGN KEY (usuario)
    REFERENCES Usuarios (id) ON DELETE CASCADE; 

DELIMITER ;;
CREATE PROCEDURE `token_consultar`(IN `_chave_token` VARCHAR(255))
BEGIN
	SET @usuario = SUBSTRING_INDEX(_chave_token, '.', 1);
	SELECT * FROM token WHERE token.usuario = @usuario AND token.chave_token LIKE _chave_token;
END ;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE `token_criar`(IN `_usuario` INT, IN `_validade` INT, IN `_chave_token` VARCHAR(255))
BEGIN
    SET @token = CONCAT(_usuario, '.', _chave_token);
    SET @vaidade = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL _validade HOUR);
    INSERT INTO token(usuario, chave_token, validade) VALUES(_usuario, @token, @vaidade) ON DUPLICATE KEY UPDATE chave_token = VALUES(chave_token), validade = VALUES(validade);
    SELECT * FROM token WHERE token.usuario = _usuario;
END ;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE `token_extender`(IN `_usuario` INT, IN `_horas` INT)
    NO SQL
UPDATE token
SET 
	validade = DATE_ADD(validade, INTERVAL _horas HOUR)
WHERE 
	token.usuario = _usuario ;;
DELIMITER ;