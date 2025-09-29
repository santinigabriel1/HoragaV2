import pool from "../database/data.js";


export const verificarVinculo = async (usuario,instituicao, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }        
        const query = "SELECT * FROM InstituicaoUsuario WHERE fk_instituicao_id = ? AND fk_usuario_id = ?";
        const values = [instituicao, usuario];
  
        const [rows] = await localCx.execute(query, values);

        return rows.length > 0;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
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

        const query = "SELECT * FROM InstituicaoUsuario WHERE id = ?";
  
        const [rows] = await localCx.execute(query, [id]);

        return rows[0];

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
};

export const solicitarVinculo = async (usuario,instituicao, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "INSERT INTO InstituicaoUsuario (fk_instituicao_id, fk_usuario_id) VALUES (?, ?)";
        const values = [instituicao, usuario];
  
        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao vincular usuário a instituição.");
        } 
       
        const lastIdUser = result.insertId;       
        const novoVinculo = await buscarPorId(lastIdUser, localCx);       
        return novoVinculo;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{        
        if (!cx && localCx) {
            localCx.release();
        }
    }
};


export const vincular = async (organizador,usuario,instituicao, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = "INSERT INTO InstituicaoUsuario (fk_instituicao_id, fk_usuario_id, aceito) VALUES (?, ?, true)";
        const values = [instituicao, usuario];
  
        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao vincular usuário a instituição.");
        } 
       
        const lastIdUser = result.insertId;       
        const novoVinculo = await buscarPorId(lastIdUser, localCx);       
        return novoVinculo;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{        
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const desvincular = async (usuario,instituicao, cx = null) => {
    let localCx = cx;
    try {

        if (!localCx) {
            localCx = await pool.getConnection();
        }
        const query = "DELETE FROM InstituicaoUsuario WHERE fk_instituicao_id = ? AND fk_usuario_id = ?";
        const values = [instituicao, usuario];
  
        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao desvincular usuário da instituição.");
        } 

        return true;

    } catch (error) {
        throw new Error("Erro: " + error.message);
    } finally{
        // Garante que a conexão será liberada de volta ao pool
        if (!cx && localCx) { // só libera se a conexão foi criada aqui
            localCx.release();
        }
    }
}