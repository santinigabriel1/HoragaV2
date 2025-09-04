import bcrypt from 'bcryptjs';
import pool from "../database/data.js";

/**
 * Cadastra um novo usuário no banco de dados.
 * - Criptografa a senha antes de salvar
 * - Verifica se o e-mail já está cadastrado
 *
 * @param {Object} usuario - Objeto contendo os dados do usuário
 * @param {string} usuario.nome - Nome do usuário
 * @param {string} usuario.email - E-mail do usuário
 * @param {string} usuario.senha - Senha em texto puro (será criptografada)
 * @param {string} usuario.cargo - Cargo/função do usuário
 * @returns {Promise<Object>} Retorna o usuário recém-cadastrado
 * @throws {Error} Caso o e-mail já exista ou ocorra erro no insert
 */
export const cadastrar = async (usuario) => {   // Função para cadastrar um usuário no banco de dados (Create)
    // Obtém uma conexão do pool
    const cx = await pool.getConnection(); 
    try {
        // Desestrutura os dados recebidos do objeto usuário
        const { nome, email, senha, cargo } = usuario;
        // Query SQL para inserir um novo usuário
        const query = "INSERT INTO usuario (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";

        // Criptografa a senha antes de salvar no banco
        const hashSenha = await bcrypt.hash(senha, 10);

        // Monta o array de valores para substituir os placeholders da query
        const values = [nome, email, hashSenha, cargo];

        // Verifica se já existe um usuário com o mesmo e-mail
        const usuarioExistente = await buscarUsuarioPorEmail(email);
        if (usuarioExistente) {
            throw new Error("Email já cadastrado");
        }

        // Executa a query de inserção com os valores
        const [result] = await cx.execute(query, values);

        // Verifica se alguma linha foi afetada (se o insert funcionou)
        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar usuário");
        } 

        // Pega o ID do último usuário inserido
        const lastIdUser = result.insertId;
        // Retorna o usuário cadastrado, buscando por ID
        return buscarUsuarioPorId(lastIdUser);

    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao cadastrar usuário: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (cx) {
            cx.release(); // Liberar a conexão de volta ao pool
        }
    }
};



/**
 * Busca um usuário pelo seu ID.
 *
 * @param {number} id - ID do usuário
 * @returns {Promise<Object|null>} Retorna o usuário encontrado ou null se não existir
 * @throws {Error} Caso ocorra erro na consulta
 */
export const buscarUsuarioPorId = async (id) => { // Função para buscar um usuário pelo ID (Read)
    // Obtém uma conexão do pool
    const cx = await pool.getConnection(); 
    try {
        // Query SQL para buscar um usuário pelo ID
        const query = "SELECT * FROM usuario WHERE id = ?";
        // Executa a query passando o ID como parâmetro
        const [rows] = await cx.execute(query, [id]);
        // Retorna apenas o primeiro resultado (usuário encontrado)
        return rows[0];
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao buscar usuário por ID: " + error.message);
    }finally{
        // Libera a conexão
        if (cx) {
            cx.release();
        }
    }
}


/**
 * Busca um usuário pelo e-mail.
 *
 * @param {string} email - E-mail do usuário
 * @returns {Promise<Object|null>} Retorna o usuário encontrado ou null se não existir
 * @throws {Error} Caso ocorra erro na consulta
 */
export const buscarUsuarioPorEmail = async (email) => { // Função para buscar um usuário pelo e-mail (Read)
    // Obtém uma conexão do pool
    const cx = await pool.getConnection(); 
    try {
        // Query SQL para buscar usuário pelo e-mail
        const query = "SELECT * FROM usuario WHERE email = ?";
        // Executa a query passando o e-mail como parâmetro
        const [rows] = await cx.execute(query, [email]);
        // Retorna apenas o primeiro resultado
        return rows[0];
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao buscar usuário por email: " + error.message);
    }finally{
        // Libera a conexão
        if (cx) {
            cx.release();
        }
    }
}

/**
 * Lista todos os usuários cadastrados no banco de dados.
 *
 * @returns {Promise<Array>} Array de usuários
 * @throws {Error} Caso ocorra erro na consulta
 */
export const listarUsuario = async () => { // Função para listar todos os usuários (Read)
    const cx = await pool.getConnection();
    try {
        // Query SQL para selecionar todos os usuários
        const query = "SELECT * FROM usuario";
        // Executa a query sem parâmetros
        const [rows] = await cx.execute(query);
        // Retorna todos os usuários encontrados
        return rows;
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao listar usuários: " + error.message);
    }
    finally{
        if (cx) {
            cx.release();
        }
    }
};

/**
 * Atualiza os dados de um usuário existente.
 *
 * @param {number} id - ID do usuário a ser atualizado
 * @param {Object} usuario - Objeto contendo os novos dados
 * @param {string} usuario.nome - Nome do usuário
 * @param {string} usuario.email - E-mail do usuário
 * @param {string} usuario.senha - Senha em texto puro (não está criptografada aqui)
 * @param {string} usuario.cargo - Cargo/função do usuário
 * @returns {Promise<void>}
 * @throws {Error} Caso ocorra erro na atualização
 */
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

/**
 * Deleta um usuário do banco de dados.
 *
 * @param {number} id - ID do usuário a ser removido
 * @returns {Promise<void>}
 * @throws {Error} Caso ocorra erro na exclusão
 */
export const deletarUsuario = async (id) => { // D
    try {
        const query = "DELETE FROM usuario WHERE id = ?";
        await pool.execute(query, [id]);
    } catch (error) {
        throw new Error("Erro ao deletar usuário: " + error.message);
    }
};
