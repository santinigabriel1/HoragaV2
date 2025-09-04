import pool from "../database/data.js";

export const cadastrarInstituicao = async (instituicao) => {
    try {
        const { organizador, nome, descricao } = instituicao;
        const query = "INSERT INTO instituicao (organizador, nome, descricao) VALUES (?, ?, ?)";
        const values = [organizador, nome, descricao];
        const [result] = await pool.execute(query, values);
        const lastIdInstituicao = result.insertId;
        return lastIdInstituicao;
    } catch (error) {
        throw new Error("Erro ao cadastrar instituição: " + error.message);
    }
};

export const listarInstituicao = async () => {
    try {
        const query = "SELECT * FROM instituicao";
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar instituições: " + error.message);
    }
};

export const atualizarInstituicao = async (id, instituicao) => {
    try {
        const { organizador, nome, descricao } = instituicao;
        const query = "UPDATE instituicao SET organizador = ?, nome = ?, descricao = ? WHERE id = ?";
        const values = [organizador, nome, descricao, id];
        await pool.execute(query, values);
    } catch (error) {
        throw new Error("Erro ao atualizar instituição: " + error.message);
    }
};

export const deletarInstituicao = async (id) => {
    try {
        const query = "DELETE FROM instituicao WHERE id = ?";
        await pool.execute(query, [id]);
    } catch (error) {
        throw new Error("Erro ao deletar instituição: " + error.message);
    }
};
