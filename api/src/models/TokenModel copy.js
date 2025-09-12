import crypto from "crypto";
import pool from "../database/data.js";

/**
 * Consulta um token no banco de dados pelo ID do usuário.
 * 
 * @param {int} usuario_id - Id unico do usuário".
 * @param {object} cx - Objeto de pool de conexão com o banco de dados.
 * @returns {Promise<Object|null>} Retorna o objeto do token se válido, ou null se inválido ou não encontrado.
 * @throws {Error} Lança erro caso ocorra algum problema na consulta ao banco de dados.
 *
 */
const consultarPorUsuario = async (usuario_id, cx) => {
    try { 
        const cmdSql = 'SELECT * FROM `Token` WHERE usuario = ?;';        
        const [rows] = await cx.query(cmdSql, [usuario_id]);
        return rows[0];
    } 
    catch (error) {
        throw error;
    }     
};

/**
 * Consulta um token no banco de dados e valida se corresponde ao token fornecido.
 * 
 * @param {int} usuario_id - Id unico do usuário".
 * @param {string} token - Token no formato "{usuario_id}.{chave_token}".
 * @returns {Promise<Object|null>} Retorna o objeto do token se válido, ou null se inválido ou não encontrado.
 * @throws {Error} Lança erro caso ocorra algum problema na consulta ao banco de dados.
 *
 */

export const consultarEValidar = async (usuario_id,token) => {
    let cx;
    try {        
        const db_token = await consultarPorUsuario(usuario_id, cx);

        if(!db_token || db_token.chave_token != token){
            return null
        }
        
        return db_token;
    } 
    catch (error) {
        throw error;
    } 
    finally {
        if (cx) cx.release(); // Libere a conexão após o uso
    }
};

/**
 * Cadastrar um token proprietário para o usuário no banco de dados.
 *
 * @param {int} usuario_id - O ID único do usuário.
 * @param {int} validade - O ID único do usuário.
 * @returns {Promise<Object|null>} Retorna o objeto do token recem cadastrado, ou null se não encontrado.
 * @throws {Error} Lança erro caso ocorra algum problema na consulta ao banco de dados.
 */

export const criar = async (usuario_id,validade) => { // validade em horas
    let cx;
    let cmdSql;
    try {        
        const chave_token = crypto.randomBytes(64).toString('hex'); // 128 caracteres

        cx = await pool.getConnection();        

        cmdSql = 'INSERT INTO `Token`(usuario, chave_token, validade) VALUES(?,?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? HOUR)) ';
        cmdSql += 'ON DUPLICATE KEY UPDATE chave_token = VALUES(chave_token), validade = VALUES(validade);';

        const [rows] = await cx.query(cmdSql, [usuario_id,chave_token,validade]);

        // Verifica se alguma linha foi afetada (se o insert funcionou)
        if (rows.affectedRows === 0) {
            throw new Error("Erro ao construir um token");
        } 

        return await consultarPorUsuario(usuario_id, cx);       
    } 
    catch (error) {
        throw error;
    } 
    finally {
        if (cx) cx.release();
    }
};

export const extender = async (usuario_id,tempo_em_horas) => { 
    let cx;
    try {        
        const cmdSql = 'UPDATE Token SET validade = DATE_ADD(validade, INTERVAL ? HOUR) WHERE usuario = ?;';
        cx = await pool.getConnection();        
        const [rows] = await cx.query(cmdSql, [tempo_em_horas, usuario_id]);
        return rows.affectedRows > 0;
    } 
    catch (error) {
        throw error;
    } 
    finally {
        if (cx) cx.release();
    }
};
