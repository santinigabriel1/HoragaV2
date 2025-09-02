DROP TABLE IF EXISTS inst_user;
DROP TABLE IF EXISTS agenda;
DROP TABLE IF EXISTS salas;
DROP TABLE IF EXISTS instituicao;
DROP TABLE IF EXISTS usuario;

CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL -- 'aluno', 'professor', 'admin' etc.
);

CREATE TABLE IF NOT EXISTS instituicao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organizador INT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    FOREIGN KEY (organizador) REFERENCES usuario(id)
);

-- Criação da tabela salas
CREATE TABLE IF NOT EXISTS salas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_instituicao_id INT,
    nome VARCHAR(100) NOT NULL,
    capacidade INT,
    horario JSON,
    FOREIGN KEY (fk_instituicao_id) REFERENCES instituicao(id)
);

-- Criação da tabela usuario

-- Criação da tabela inst_user (relação entre instituicao e usuario)
CREATE TABLE IF NOT EXISTS inst_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_instituicao_id INT,
    fk_usuario_id INT,
    FOREIGN KEY (fk_instituicao_id) REFERENCES instituicao(id),
    FOREIGN KEY (fk_usuario_id) REFERENCES usuario(id)
);

-- Criação da tabela Agenda
CREATE TABLE IF NOT EXISTS agenda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_usuario_id INT,
    fk_salas_id INT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_hora_inicio DATETIME NOT NULL,
    data_hora_fim DATETIME NOT NULL,
    FOREIGN KEY (fk_usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (fk_salas_id) REFERENCES salas(id)
);
