import pool from "../database/data.js";
 
export const cadastrarUsuario = async (usuario) => {    // C
    try {
        const { nome, email, senha, cargo } = usuario;
        const query = "INSERT INTO usuario (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";
        const values = [nome, email, senha, cargo];
        const [result] = await pool.execute(query, values);
        const lastIdUser = result.insertId;
        return lastIdUser;
    } catch (error) {
        throw new Error("Erro ao cadastrar usuário: " + error.message);
    }
};

export const listarUsuario = async () => {
    try {
        const query = "SELECT * FROM usuario";
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        throw new Error("Erro ao listar usuários: " + error.message);
    }
};

export const atualizarUsuario = async (id, usuario) => {  // U
    try {
        const { nome, email, senha, cargo } = usuario;
        const query = "UPDATE usuario SET nome = ?, email = ?, senha = ?, cargo = ? WHERE id = ?";
        const values = [nome, email, senha, cargo, id];
        await pool.execute(query, values);
    } catch (error) {
        throw new Error("Erro ao atualizar usuário: " + error.message);
    }
};

export const deletarUsuario = async (id) => { // D
    try {
        const query = "DELETE FROM usuario WHERE id = ?";
        await pool.execute(query, [id]);
    } catch (error) {
        throw new Error("Erro ao deletar usuário: " + error.message);
    }
};