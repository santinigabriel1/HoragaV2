import crypto from "crypto";
import pool from "../database/data.js";

/**
 * Consulta um token no banco de dados pelo ID do usuário.
 * 
 * @param {number} usuario_id - ID único do usuário.
 * @param {import("mysql2").Pool} cx - Pool de conexão MySql2.
 * @returns {Promise<Object|null>} Retorna o token se encontrado, ou null se não existir.
 * @throws {Error} Caso haja falha na consulta ao banco.
 */
const consultarPorUsuario = async (usuario_id, cx = null) => {
    let localCx = cx; // controle para saber se a conexão foi criada aqui ou recebida de fora
    try {
        if (!localCx) {
            // Obtém uma conexão do pool se não foi passada uma conexão
            localCx = await pool.getConnection();
        }
        const cmdSql = 'SELECT * FROM Token WHERE usuario = ?;';
        const [rows] = await localCx.query(cmdSql, [usuario_id]);
        return rows.length > 0 ? rows[0] : null;
        
    } catch (error) {
        // Lança erro em caso de falha
        throw new Error("Erro ao buscar usuário por ID: " + error.message);
    }finally{
        // Libera a conexão
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

/**
 * Consulta e valida um token do banco de dados.
 * 
 * @param {number} usuario_id - ID único do usuário.
 * @param {string} token - Token a ser validado.
 * @returns {Promise<Object|null>} Retorna o token se válido, ou null se inválido/não encontrado.
 * @throws {Error} Caso haja falha no processo de consulta.
 */
export const consultarEValidar = async (usuario_id, token) => {
    try {
        const db_token = await consultarPorUsuario(usuario_id);

        if (!db_token || db_token.chave_token !== token) {
            return null;
        }
        
        return db_token;
    } 
    catch (error) {
        throw error;
    }
};

/**
 * Cria ou atualiza um token de autenticação para o usuário.
 *
 * - Se já existir um token, ele será sobrescrito.
 * - A validade é calculada em horas a partir do momento da criação.
 *
 * @param {number} usuario_id - ID único do usuário.
 * @param {number} validade - Tempo de validade em horas.
 * @returns {Promise<Object>} Retorna o token recém-criado.
 * @throws {Error} Caso não seja possível criar o token.
 */
export const criar = async (usuario_id, validade) => {
    const cx = await pool.getConnection();        
    try {        
        const chave_token = crypto.randomBytes(64).toString('hex'); // 128 caracteres

        const cmdSql = `
            INSERT INTO Token (usuario, chave_token, validade)
            VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? HOUR))
            ON DUPLICATE KEY UPDATE 
                chave_token = VALUES(chave_token), 
                validade = VALUES(validade);
        `;

        const [rows] = await cx.query(cmdSql, [usuario_id, chave_token, validade]);

        if (rows.affectedRows === 0) {
            throw new Error("Erro ao criar o token");
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

/**
 * Estende a validade de um token existente.
 *
 * @param {number} usuario_id - ID único do usuário.
 * @param {number} tempo_em_horas - Quantidade de horas a acrescentar à validade atual.
 * @returns {Promise<boolean>} Retorna true se a validade foi estendida, false caso contrário.
 * @throws {Error} Caso haja falha ao atualizar o token.
 */
export const extender = async (usuario_id, tempo_em_horas) => { 
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
