import pool from "../database/data.js";

export const cadastrar = async (instituicao, cx = null) => { 
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const { organizador, nome, descricao } = instituicao;
        const query = "INSERT INTO Instituicoes (organizador, nome, descricao) VALUES (?, ?, ?)";
        const values = [organizador, nome, descricao];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar Instituição.");
        } 

        const lastId = result.insertId;

        const newInstituicao = await buscarPorId(lastId, localCx);       
        return newInstituicao;

    } catch (error) {
        throw new Error("Erro ao cadastrar Instituição: " + error.message);
    } finally{
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
        
        const query = "SELECT * FROM Instituicoes WHERE id = ?";
        const [rows] = await localCx.execute(query, [id]);

        let Instituicao = rows[0];
        return Instituicao;
    } catch (error) {
        throw new Error("Erro ao buscar Instituicao por ID: " + error.message);
    }finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
}

export const buscarPorNome = async (nome, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes WHERE nome = ?";
        const [rows] = await localCx.execute(query, [nome]);

        let Instituicao = rows[0];
        return Instituicao;
    } catch (error) {
        throw new Error("Erro ao buscar Instituicao por Nome: " + error.message);
    }finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const listarPorOrganizador = async (organizadorId, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes WHERE organizador = ?";
        const [rows] = await localCx.execute(query, [organizadorId]);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar Instituições por Organizador: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
}

export const listar = async (cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {            
            localCx = await pool.getConnection();
        }
        
        const query = "SELECT * FROM Instituicoes";
        const [rows] = await localCx.execute(query);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar todas as Instituições: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
}

export const atualizarTudo = async (id, instituicao, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const { organizador, nome, descricao } = instituicao;
        const query = "UPDATE Instituicoes SET organizador = ?, nome = ?, descricao = ? WHERE id = ?";
        const values = [organizador, nome, descricao, id];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao atualizar Instituição ou Instituição não encontrada.");
        }

        const updatedInstituicao = await buscarPorId(id, localCx);
        return updatedInstituicao;

    } catch (error) {
        throw new Error("Erro ao atualizar Instituição: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const atualizar = async (id, instituicao, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(instituicao)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            throw new Error("Nenhum campo fornecido para atualização.");
        }

        values.push(id); // Adiciona o ID ao final dos valores

        const query = `UPDATE Instituicoes SET ${fields.join(", ")} WHERE id = ?`;

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao atualizar Instituição ou Instituição não encontrada.");
        }

        const updatedInstituicao = await buscarPorId(id, localCx);
        return updatedInstituicao;

    } catch (error) {
        throw new Error("Erro ao atualizar Instituição: " + error.message);
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

        const query = "DELETE FROM Instituicoes WHERE id = ?";
        const [result] = await localCx.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao deletar Instituição ou Instituição não encontrada.");
        }

        return true;

    } catch (error) {
        throw new Error("Erro ao deletar Instituição: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};