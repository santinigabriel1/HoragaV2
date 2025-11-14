USE agendamento;

-- 1. Instituições (Não depende de nada)
INSERT INTO Instituicoes (nome, descricao) VALUES
('Etec Tietê', 'Instituição de ensino técnico'),
('Fatec Tatuí', 'Instituição de ensino superior');

-- 2. Usuários (Não depende de nada)
INSERT INTO Usuarios (nome, email, senha, cargo) VALUES
('Admin', 'admin@gmail.com', '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Administrador'),
('Maria Silva', 'maria@gmail.com', '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Professor'),
('Joao Souza', 'joao@gmail.com', '$2b$10$afbzMqlv1VvmDhsq.rKa0OgGu8H.BCM30iBE2uKD40Vn4iYSn8ydO', 'Aluno');

-- 3. Relacionamento usuário-instituição (Depende de Instituicoes e Usuarios)
INSERT INTO InstituicaoUsuario (fk_instituicao_id, fk_usuario_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- 4. Salas (Depende de Instituicoes)
INSERT INTO Salas (fk_instituicao_id, nome, descricao) VALUES
(1, 'Laboratório 1', 'Laboratório de informática'),
(1, 'Auditório', 'Auditório principal da instituição'),
(2, 'Sala 201', 'Sala de reuniões da instituição');

-- 5. Horarios (Depende de Instituicoes) 
-- (MOVIDO PARA CIMA)
INSERT INTO Horarios (fk_instituicao_id, descricao, horario) VALUES
(
    1,
    'horário padrão',
    '[
            {
                "dia": "domingo",
                "horarios": []
            },
            {
                "dia": "segunda-feira",
                "horarios": [
                    {"inicio":"08:00", "fim":"09:00", "disponivel": true},
                    {"inicio":"09:00", "fim":"10:00", "disponivel": true},
                    {"inicio":"10:15", "fim":"12:15", "disponivel": true},
                    {"inicio":"14:00", "fim":"16:00", "disponivel": true},
                    {"inicio":"18:00", "fim":"20:00", "disponivel": true},
                    {"inicio":"19:00", "fim":"21:00", "disponivel": true},
                    {"inicio":"20:00", "fim":"22:00", "disponivel": true}
                ]       
            },
            {
                "dia": "terça-feira",
                "horarios": [
                    {"inicio":"08:00", "fim":"09:00", "disponivel": true},
                    {"inicio":"09:00", "fim":"10:00", "disponivel": true},
                    {"inicio":"10:15", "fim":"12:15", "disponivel": true},
                    {"inicio":"14:00", "fim":"16:00", "disponivel": true},
                    {"inicio":"18:00", "fim":"20:00", "disponivel": true},
                    {"inicio":"19:00", "fim":"21:00", "disponivel": true},
                    {"inicio":"20:00", "fim":"22:00", "disponivel": true}
                ]       
            },
            {
                "dia": "quarta-feira",
                "horarios": [
                    {"inicio":"08:00", "fim":"09:00", "disponivel": true},
                    {"inicio":"09:00", "fim":"10:00", "disponivel": true},
                    {"inicio":"10:15", "fim":"12:15", "disponivel": true},
                    {"inicio":"14:00", "fim":"16:00", "disponivel": true},
                    {"inicio":"18:00", "fim":"20:00", "disponivel": true},
                    {"inicio":"19:00", "fim":"21:00", "disponivel": true},
                    {"inicio":"20:00", "fim":"22:00", "disponivel": true}
                ]       
            },
            {
                "dia": "quinta-feira",
                "horarios": [
                    {"inicio":"08:00", "fim":"09:00", "disponivel": true},
                    {"inicio":"09:00", "fim":"10:00", "disponivel": true},
                    {"inicio":"10:15", "fim":"12:15", "disponivel": true},
                    {"inicio":"14:00", "fim":"16:00", "disponivel": true},
                    {"inicio":"18:00", "fim":"20:00", "disponivel": true},
                    {"inicio":"19:00", "fim":"21:00", "disponivel": true},
                    {"inicio":"20:00", "fim":"22:00", "disponivel": true}
                ]       
            },
            {
                "dia": "sexta-feira",
                "horarios": [
                    {"inicio":"08:00", "fim":"09:00", "disponivel": true},
                    {"inicio":"09:00", "fim":"10:00", "disponivel": true},
                    {"inicio":"10:15", "fim":"12:15", "disponivel": true},
                    {"inicio":"14:00", "fim":"16:00", "disponivel": true},
                    {"inicio":"18:00", "fim":"20:00", "disponivel": true},
                    {"inicio":"19:00", "fim":"21:00", "disponivel": true},
                    {"inicio":"20:00", "fim":"22:00", "disponivel": true}
                ]       
            },
            {
                "dia": "sábado",
                "horarios": []
            }
            
        ]'
);

INSERT INTO Agendamentos (fk_usuario_id, fk_salas_id, data_agendamento, horarios, proposito) VALUES 
(
    1, -- fk_usuario_id (Admin)
    1, -- fk_salas_id (Laboratório 1)
    '2025-11-10', -- data_agendamento
    '[
        {"inicio": "08:00", "fim": "09:00"},
        {"inicio": "09:00", "fim": "10:00"}
    ]', -- horarios (JSON)
    'Aula de Banco de Dados'
),
(
    2, -- fk_usuario_id (Maria Silva)
    1, -- fk_salas_id (Laboratório 1)
    '2025-11-10', -- data_agendamento
    '[
        {"inicio":"14:00", "fim":"16:00"}
    ]', -- horarios (JSON)
    'Aula de TCC'
),
(
    3, -- fk_usuario_id (Maria Silva)
    1, -- fk_salas_id (Laboratório 1)
    '2025-11-10', -- data_agendamento
    '[
        {"inicio":"18:00", "fim":"20:00"}
    ]', -- horarios (JSON)
    'Aula de Pw3'
),
(
    2, -- fk_usuario_id (Maria Silva)
    2, -- fk_salas_id (Auditório)
    '2025-11-12', -- data_agendamento
    '[{"inicio": "10:15:00", "fim": "12:15:00"}]', -- horarios (JSON)
    'Palestra de Boas-vindas'
);


UPDATE Salas
JOIN Horarios ON Horarios.id = 1
SET Salas.horario_funcionamento = Horarios.horario
WHERE Salas.id in (1,2,3);