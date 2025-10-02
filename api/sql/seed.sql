USE agendamento;

-- Instituições
INSERT INTO Instituicoes (nome, descricao) VALUES
('Escola Técnica', 'Instituição de ensino técnico'),
('Universidade XPTO', 'Instituição de ensino superior');

-- Usuários
INSERT INTO Usuarios (nome, email, senha, cargo) VALUES
('Admin', 'admin@gmail.com', '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Administrador'),
('Maria Silva', 'maria@gmail.com', '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Professor'),
('Joao Souza', 'joao@gmail.com', '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Aluno');

-- Relacionamento usuário-instituição
INSERT INTO InstituicaoUsuario (fk_instituicao_id, fk_usuario_id) VALUES
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

INSERT INTO Horarios (fk_instituicao_id, descricao, horario) VALUES
(
    1,
    'horário padrão',
    '{
        "segunda": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ],
        "terca": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ],
        "quarta": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ],
        "quinta": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ],
        "sexta": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ],
        "sabado": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ],
        "domingo": [
            {"inicio":"08:00", "fim":"09:00", "disponivel": true},
            {"inicio":"09:00", "fim":"10:00", "disponivel": true},
            {"inicio":"10:15", "fim":"12:15", "disponivel": true},
            {"inicio":"14:00", "fim":"16:00", "disponivel": true},
            {"inicio":"18:00", "fim":"20:00", "disponivel": true},
            {"inicio":"19:00", "fim":"21:00", "disponivel": true},
            {"inicio":"20:00", "fim":"22:00", "disponivel": true}
        ]
    }'
);