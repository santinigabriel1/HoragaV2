import bcrypt from 'bcryptjs';
import pool from "../database/data.js";
 
export const cadastrar = async (usuario) => {    // C
    const cx = await pool.getConnection(); 
    try {
        const { nome, email, senha, cargo } = usuario;
        const query = "INSERT INTO usuario (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";

        const hashSenha = await bcrypt.hash(senha, 10);

        const values = [nome, email, hashSenha, cargo];

        const usuarioExistente = await buscarUsuarioPorEmail(email);
        if (usuarioExistente) {
            throw new Error("Email já cadastrado");
        }

        const [result] = await cx.execute(query, values);

        if (result.affectedRows === 0) {
            
            throw new Error("Erro ao cadastrar usuário");
        } 

        const lastIdUser = result.insertId;
        return buscarUsuarioPorId(lastIdUser);

    } catch (error) {
        throw new Error("Erro ao cadastrar usuário: " + error.message);
    } finally{
        if (cx) {
            cx.release(); // Liberar a conexão de volta ao pool
        }
    }
};

export const buscarUsuarioPorId = async (id) => { 
    const cx = await pool.getConnection(); 
    try {
        const query = "SELECT * FROM usuario WHERE id = ?";
        const [rows] = await cx.execute(query, [id]);
        return rows[0];
    } catch (error) {
        throw new Error("Erro ao buscar usuário por ID: " + error.message);
    }finally{
        if (cx) {
            cx.release();
        }
    }
}

export const buscarUsuarioPorEmail = async (email) => { 
    const cx = await pool.getConnection(); 
    try {
        const query = "SELECT * FROM usuario WHERE email = ?";
        const [rows] = await cx.execute(query, [email]);
        return rows[0];
    } catch (error) {
        throw new Error("Erro ao buscar usuário por email: " + error.message);
    }finally{
        if (cx) {
            cx.release();
        }
    }
}

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