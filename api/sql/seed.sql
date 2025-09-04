USE agendamento;

-- Instituições
INSERT INTO Instituicoes (nome, descricao) VALUES
('Escola Técnica', 'Instituição de ensino técnico'),
('Universidade XPTO', 'Instituição de ensino superior');

-- Usuários
INSERT INTO Usuarios (nome, email, senha, cargo) VALUES
('Admin', 'admin@teste.com', '$2a$10$HASHDAQUI', 'Administrador'),
('Maria Silva', 'maria@teste.com', '$2a$10$HASHDAQUI', 'Professor'),
('João Souza', 'joao@teste.com', '$2a$10$HASHDAQUI', 'Aluno');

-- Relacionamento usuário-instituição
INSERT INTO inst_user (fk_instituicao_id, fk_usuario_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- Salas
INSERT INTO Salas (fk_instituicao_id, nome, capacidade, horario) VALUES
(1, 'Laboratório 1', 30, JSON_ARRAY('08:00-10:00', '09:00-10:00', '10:15-12:15')),
(1, 'Auditório', 100, JSON_ARRAY('14:00-16:00')),
(2, 'Sala 201', 40, JSON_ARRAY('09:00-11:00'));

-- Agendamentos
INSERT INTO Agendamentos (fk_usuario_id, fk_salas_id, titulo, descricao, data, horarios) VALUES
(2, 1, 'Aula de Banco de Dados', 'Introdução ao MySQL', '2025-09-10', JSON_ARRAY('08:00-10:00','09:00-10:00')),
(3, 3, 'Estudo em grupo', 'Preparação para prova', '2025-09-11', JSON_ARRAY('09:00-11:00'));
