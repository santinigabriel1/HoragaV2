import crypto from "crypto";
import pool from "../database/data.js";

export const consultar = async (token) => {
    let cx;
    try {
        cx = await pool.getConnection();
        const cmdSql = 'CALL token_consultar(?)';
        const [rows] = await cx.query(cmdSql, token);
        return rows[0][0];
    } 
    catch (error) {
        throw error;
    } 
    finally {
        if (cx) cx.release(); // Libere a conexão após o uso
    }
};

export const criar = async (usuario,validade) => { 
    let cx;
    try {        
        const token = crypto.randomBytes(64).toString('hex'); // 128 caracteres
        const cmdSql = 'CALL token_criar(?,?,?);';
        cx = await pool.getConnection();        
        const [rows] = await cx.query(cmdSql, [usuario,validade,token]);
        return rows[0][0];        
    } 
    catch (error) {
        throw error;
    } 
    finally {
        if (cx) cx.release();
    }
};

export const extender = async (usuario,tempo_horas) => { 
    let cx;
    try {        
        const cmdSql = 'CALL token_extender(?,?);';
        cx = await pool.getConnection();        
        const [rows] = await cx.query(cmdSql, [usuario,tempo_horas]);
        return rows.affectedRows > 0;
    } 
    catch (error) {
        throw error;
    } 
    finally {
        if (cx) cx.release();
    }
};
