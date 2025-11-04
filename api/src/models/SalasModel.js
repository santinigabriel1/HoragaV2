import pool from '../database/data.js';

/**
 * Cadastra uma nova sala no banco de dados.
 *
 * @param {Object} salas - Dados da sala.
 * @param {number} salas.fk_instituicao_id - ID da instituição.
 * @param {string} salas.nome - Nome da sala.
 * @param {number} salas.descricao - descrição da sala.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object>} Retorna a instituição recém-cadastrada.
 * @throws {Error} Caso ocorra erro durante o cadastro.
 */

export const cadastrar = async (salas, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const {fk_instituicao_id, nome, descricao} = salas;


        const query = "INSERT INTO Salas (fk_instituicao_id, nome, descricao) VALUES (?, ?, ?)";

        const values = [fk_instituicao_id, nome, descricao];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar sala.");
        }

        const lastId = result.insertId;

        const newSala = await buscarPorId(lastId, localCx);
        return newSala;

    } catch (error) {
        throw new Error("Erro ao cadastrar sala: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Busca uma sala pelo ID.
 *
 * @param {number} id - ID da sala.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object|null>} Retorna a sala encontrada ou null se não existir.
 * @throws {Error} Caso ocorra erro na consulta.
 */
export const buscarPorId = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "SELECT * FROM Salas WHERE id = ?";
        const [rows] = await localCx.execute(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];

    } catch (error) {
        throw new Error("Erro ao buscar sala por ID: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Lista todas as salas filtradas por nome ou descrição.
 *
 * @param {string} search - Texto de busca para nome ou descrição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object[]>} Retorna a lista de salas encontradas.
 * @throws {Error} Caso ocorra erro na consulta.
 */

export const listar = async (search, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "SELECT * FROM Salas WHERE nome LIKE ? OR descricao LIKE ?";
        const searchPattern = `%${search}%`;
        const queryParams = [searchPattern, searchPattern];
        const [rows] = await localCx.execute(query, queryParams);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar salas: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Lista todas as salas de uma instituição específica.
 *
 * @param {number} instituicaoId - ID da instituição.
 * @param {import("mysql2/promise").PoolConnection} [cx=null] - Conexão opcional com o banco.
 * @returns {Promise<Object[]>} Retorna a lista de salas da instituição.
 * @throws {Error} Caso ocorra erro na consulta.
 */

export const listarPorInstituicao = async (instituicaoId, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "SELECT * FROM Salas WHERE fk_instituicao_id = ?";
        const [rows] = await localCx.execute(query, [instituicaoId]);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar salas por Instituição: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

/**
 * Atualiza os dados de uma sala existente.
 *
 * @param {number} id - ID da sala a ser atualizada.
 * @param {Object} salas - Dados atualizados da sala.
 * @param {number} salas.fk_instituicao_id - ID da instituição.
 * @param {string} salas.nome - Nome da sala.
 * @param {number} salas.descricao - descrição da sala.
 * @returns {Promise<void>}
 * @throws {Error} Caso ocorra erro durante a atualização.
 */

export const atualizar = async (id, salas, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            // Se não houver transação, obtém uma nova conexão
            localCx = await pool.getConnection(); 
        }

        const fields = [];
        const values = [];

        // Itera sobre o objeto 'salas' (que contém apenas as colunas a serem atualizadas)
        for (const [key, value] of Object.entries(salas)) {
            // Cria a string 'coluna = ?' para cada campo existente
            fields.push(`${key} = ?`); 
            values.push(value);
        }

        if (fields.length === 0) {
            // Embora a controller já verifique, é um bom fallback
            throw new Error("Nenhum campo fornecido para atualização.");
        }

        // Adiciona o ID ao final da lista de valores para a cláusula WHERE
        values.push(id); 

        // Monta a query: UPDATE Salas SET campo1 = ?, campo2 = ? WHERE id = ?
        const query = `UPDATE Salas SET ${fields.join(", ")} WHERE id = ?`;

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            // Indica que a linha não foi encontrada ou não houve alteração
            return null; 
        }

        // Retorna a sala atualizada buscando-a no banco de dados
        const updatedSala = await buscarPorId(id, localCx);
        return updatedSala;

    } catch (error) {
        // Lança o erro com uma mensagem útil, que será capturada pela controller
        throw new Error("Erro ao atualizar Sala: " + error.message);
    } finally {
        if (!cx && localCx) {
            // Libera a conexão se ela foi obtida dentro desta função
            localCx.release();
        }
    }
};

export const adicionarHorarioFuncionamento = async (id, horarioId, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            // Se não houver transação, obtém uma nova conexão
            localCx = await pool.getConnection(); 
        }

        const sql = `UPDATE Salas SET horario_funcionamento = JSON_ARRAY_APPEND(horario_funcionamento, '$', ?) WHERE id = ?`;

        // Retorna a sala atualizada buscando-a no banco de dados
        const updatedSala = await buscarPorId(id, localCx);
        return updatedSala;

    } catch (error) {
        // Lança o erro com uma mensagem útil, que será capturada pela controller
        throw new Error("Erro ao atualizar Sala: " + error.message);
    } finally {
        if (!cx && localCx) {
            // Libera a conexão se ela foi obtida dentro desta função
            localCx.release();
        }
    }
};

/** * Deleta uma sala pelo ID.
 *
 * @param {number} id - ID da sala a ser deletada.
 * @returns {Promise<void>}
 * @throws {Error} Caso ocorra erro durante a deleção.
 */

export const deletar = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "DELETE FROM Salas WHERE id = ?";
        await localCx.execute(query, [id]);
    } catch (error) {
        throw new Error("Erro ao deletar sala: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }   
};