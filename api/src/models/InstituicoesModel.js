import pool from "../database/data.js";

export const cadastrar = async (instituicao, cx = null) => { 
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        
        const { organizador, nome, descricao } = instituicao;
        const query = "INSERT INTO Instituicoes (organizador, nome, descricao) VALUES (?, ?, ?)";
        const values = [organizador, nome, descricao];

        const [result] = await localCx.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Erro ao cadastrar Instituição.");
        } 

        const lastId = result.insertId;

        const newInstituicao = await buscarPorId(lastId, localCx);       
        return newInstituicao;

    } catch (error) {
        throw new Error("Erro ao cadastrar Instituição: " + error.message);
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
        
        const query = "SELECT * FROM Instituicoes WHERE id = ?";
        const [rows] = await localCx.execute(query, [id]);

        let Instituicao = rows[0];
        return Instituicao;
    } catch (error) {
        throw new Error("Erro ao buscar Instituicao por ID: " + error.message);
    }finally{
        if (!cx && localCx) {
            localCx.release();
        }
    }
}
