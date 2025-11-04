import pool from "../database/data.js";

/**
 * Cadastra um novo agendamento no banco de dados.
 *
 * @param {object} dadosAgendamento - O objeto com os dados a serem cadastrados.
 * @param {number} dadosAgendamento.fk_usuario_id - ID do usuário que está agendando.
 * @param {number} dadosAgendamento.fk_horario_id - ID do esquema de horário (molde).
 * @param {number} dadosAgendamento.fk_salas_id - ID da sala que está sendo agendada.
 * @param {string} dadosAgendamento.data_agendamento - Data no formato 'YYYY-MM-DD'.
 * @param {string} dadosAgendamento.hora_inicio - Horário de início no formato 'HH:MM:SS'.
 * @param {string} dadosAgendamento.hora_fim - Horário de fim no formato 'HH:MM:SS'.
 * @param {string} [dadosAgendamento.proposito] - (Opcional) Descrição/propósito do agendamento.
 * @param {string} [dadosAgendamento.status] - (Opcional) Status inicial (ex: 'PENDENTE'). Default 'PENDENTE'.
 * @param {number|null} [dadosAgendamento.fk_organizador_id] - (Opcional) ID do organizador que aprovou. Default NULL.
 * @param {object} [cx=null] - Conexão de banco de dados opcional para transações.
 * @returns {object} O novo agendamento cadastrado.
 * @throws {Error} Se houver erro na conexão, inserção ou se nenhum registro for afetado.
 */
export const cadastrar = async (dadosAgendamento, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            // Obtém uma nova conexão se nenhuma for fornecida
            localCx = await pool.getConnection();
        }

        const {
            fk_usuario_id,
            fk_horario_id,
            fk_salas_id,
            data_agendamento,
            hora_inicio,
            hora_fim,
            proposito,
            status, // Pode ser undefined
            fk_organizador_id // Pode ser undefined
        } = dadosAgendamento;

        // 1. **Prepara os valores com defaults** (Garante a lógica do DB)
        // Se o status não for enviado, assume 'PENDENTE'
        const statusFinal = status || 'PENDENTE';
        // Se o organizador não for enviado, assume NULL
        const organizadorIdFinal = fk_organizador_id || null;

        // 2. **Ajusta a query e os valores** para a tabela Agendamentos
        const query = `
            INSERT INTO Agendamentos 
            (fk_usuario_id, fk_horario_id, fk_salas_id, data_agendamento, hora_inicio, hora_fim, proposito, status, fk_organizador_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            fk_usuario_id,
            fk_horario_id,
            fk_salas_id,
            data_agendamento,
            hora_inicio,
            hora_fim,
            proposito,
            statusFinal,
            organizadorIdFinal
        ];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Nenhum registro inserido ao cadastrar Agendamento.");
        }
        
        const lastId = result.insertId;

        // 3. **Busca o registro recém-criado**
        // A função buscarPorId deve retornar o registro completo.
        const newAgendamento = await buscarPorId(lastId, localCx);       
        return newAgendamento;

    } catch (error) {
        // Re-lança o erro com uma mensagem mais específica
        throw new Error("Erro ao cadastrar Agendamento: " + error.message);
    } finally {
        // Libera a conexão APENAS se ela foi criada dentro deste método
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const buscarPorId = async (id, cx) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos WHERE id = ?
        `;
        const [rows] = await localCx.execute(query, [id]);

        if (rows.length === 0) {
            throw new Error(`Agendamento com ID ${id} não encontrado.`);
        }

        return rows[0];

    } catch (error) {
        throw new Error("Erro ao buscar Agendamento por ID: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const listar = async (cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos
        `;
        const [rows] = await localCx.execute(query);
        return rows;

    } catch (error) {
        throw new Error("Erro ao listar Agendamentos: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const listarPorSala = async (salaId, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos WHERE fk_salas_id = ?
        `;
        const [rows] = await localCx.execute(query, [salaId]);
        return rows;

    } catch (error) {
        throw new Error("Erro ao listar Agendamentos por Sala: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const listarPorUsuario = async (usuarioId, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos WHERE fk_usuario_id = ?
        `;
        const [rows] = await localCx.execute(query, [usuarioId]);
        return rows;

    } catch (error) {
        throw new Error("Erro ao listar Agendamentos por Usuário: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const atualizar = async (id, dadosAtualizados, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const campos = [];
        const valores = [];

        for (const [chave, valor] of Object.entries(dadosAtualizados)) {
            campos.push(`${chave} = ?`);
            valores.push(valor);
        }

        if (campos.length === 0) {
            throw new Error("Nenhum dado fornecido para atualização.");
        }

        const query = `
            UPDATE Agendamentos SET ${campos.join(", ")} WHERE id = ?
        `;
        valores.push(id);

        const [result] = await localCx.execute(query, valores);

        if (result.affectedRows === 0) {
            throw new Error(`Nenhum registro atualizado para o Agendamento com ID ${id}.`);
        }

        return await buscarPorId(id, localCx);

    } catch (error) {
        throw new Error("Erro ao atualizar Agendamento: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const deletar = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            DELETE FROM Agendamentos WHERE id = ?
        `;
        const [result] = await localCx.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error(`Nenhum registro deletado para o Agendamento com ID ${id}.`);
        }

        return { message: `Agendamento com ID ${id} deletado com sucesso.` };

    } catch (error) {
        throw new Error("Erro ao deletar Agendamento: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};