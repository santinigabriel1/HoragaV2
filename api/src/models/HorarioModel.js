import pool from "../database/data.js";

// Assumindo que 'pool' é o seu pool de conexões MySQL
// e 'buscarPorId' é uma função existente na sua model

/**
 * Cadastra um novo esquema de horários (completamente definido em JSON)
 * para uma instituição.
 *
 * @param {object} esquemaHorario - O objeto com os dados a serem cadastrados.
 * @param {number} esquemaHorario.fk_instituicao_id - ID da instituição.
 * @param {string} esquemaHorario.descricao - Descrição do esquema de horário (ex: 'Padrão', 'Verão', 'Finais de Semana').
 * @param {object} esquemaHorario.horario - O objeto JSON contendo a estrutura de horários por dia da semana.
 * @param {object} [cx=null] - Conexão de banco de dados opcional para transações.
 * @returns {object} O novo esquema de horário cadastrado.
 * @throws {Error} Se houver erro na conexão, inserção ou se nenhum registro for afetado.
 */
export const cadastrar = async (esquemaHorario, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            // Obtém uma nova conexão se nenhuma for fornecida
            localCx = await pool.getConnection();
        }

        const { fk_instituicao_id, descricao, horario } = esquemaHorario;

        // 1. **Serializa o objeto 'horario' para uma string JSON**
        // O MySQL espera o valor como uma string JSON válida.
        const horarioJsonString = JSON.stringify(horario);

        // 2. **Ajusta a query e os valores** para os campos da sua tabela
        // Colunas: fk_instituicao_id, descricao, horario
        const query = `
            INSERT INTO Horarios (fk_instituicao_id, descricao, horario)
            VALUES (?, ?, ?)
        `;
        const values = [fk_instituicao_id, descricao, horarioJsonString];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Nenhum registro inserido ao cadastrar Horário.");
        }
        
        const lastId = result.insertId;

        // 3. **Busca o registro recém-criado**
        // A função buscarPorId deve retornar o registro completo.
        const newHorario = await buscarPorId(lastId, localCx);      
        return newHorario;

    } catch (error) {
        // Re-lança o erro com uma mensagem mais específica
        throw new Error("Erro ao cadastrar Esquema de Horário: " + error.message);
    } finally {
        // Libera a conexão APENAS se ela foi criada dentro deste método
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const buscarPorId = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }

        const query = "SELECT * FROM Horarios WHERE id = ?";
        const [rows] = await localCx.execute(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];

    } catch (error) {
        throw new Error("Erro ao buscar Horário por ID: " + error.message);
    } finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }   
};

export const listar = async (id, cx = null) => { 
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Horarios" + (id ? " WHERE id = ?" : "");
        const values = id ? [id] : [];

        const [rows] = await localCx.execute(query, values);
        return rows;

    } catch (error) {
        throw new Error("Erro ao listar Horários: " + error.message);
    } finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }   
};

// Assumindo que 'pool' e 'buscarPorId' estão importados/definidos corretamente

export const atualizar = async (id, dados, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            // Se não houver transação, obtém uma nova conexão
            localCx = await pool.getConnection(); 
        }

        const fields = [];
        const values = [];

        // Itera sobre o objeto 'dados' (que contém apenas as colunas a serem atualizadas)
        for (const [key, value] of Object.entries(dados)) {
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

        // Monta a query: UPDATE Horarios SET campo1 = ?, campo2 = ? WHERE id = ?
        const query = `UPDATE Horarios SET ${fields.join(", ")} WHERE id = ?`;

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            // Indica que a linha não foi encontrada ou não houve alteração
            return null; 
        }

        // Retorna o horário atualizado buscando-o no banco de dados
        const updatedHorario = await buscarPorId(id, localCx);
        return updatedHorario;

    } catch (error) {
        // Lança o erro com uma mensagem útil, que será capturada pela controller
        throw new Error("Erro ao atualizar Horário: " + error.message);
    } finally {
        if (!cx && localCx) {
            // Libera a conexão se ela foi obtida dentro desta função
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
        
        const query = "DELETE FROM Horarios WHERE id = ?";
        const [result] = await localCx.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao deletar Horário.");
        }

        return true;

    } catch (error) {
        throw new Error("Erro ao deletar Horário: " + error.message);
    } finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
};