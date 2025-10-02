import pool from "../database/data.js";

export const cadastrar = async (horario, cx = null) => { 
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const { instituicao, diaSemana, horaAbertura, horaFechamento } = horario;
        const query = "INSERT INTO Horarios (instituicao, diaSemana, horaAbertura, horaFechamento) VALUES (?, ?, ?, ?)";
        const values = [instituicao, diaSemana, horaAbertura, horaFechamento];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar Horário.");
        }
        
        const lastId = result.insertId;

        const newHorario = await buscarPorId(lastId, localCx);       
        return newHorario;

    } catch (error) {
        throw new Error("Erro ao cadastrar Horário: " + error.message);
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

export const atualizar = async (id, horario, cx = null) => { 
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const { instituicao, diaSemana, horaAbertura, horaFechamento } = horario;
        const query = "UPDATE Horarios SET instituicao = ?, diaSemana = ?, horaAbertura = ?, horaFechamento = ? WHERE id = ?";
        const values = [instituicao, diaSemana, horaAbertura, horaFechamento, id];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao atualizar Horário.");
        } 

        const updatedHorario = await buscarPorId(id, localCx);       
        return updatedHorario;

    } catch (error) {
        throw new Error("Erro ao atualizar Horário: " + error.message);
    } finally{
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