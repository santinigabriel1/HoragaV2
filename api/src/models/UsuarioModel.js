import pool from "../database/data.js";
 
export const cadastrar = async (usuario) => {    
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
