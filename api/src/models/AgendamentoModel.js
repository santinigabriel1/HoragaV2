import pool from "../database/data.js";
import * as salaModel from "./SalasModel.js";

export const cadastrar = async (dadosAgendamento, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            // Obtém uma nova conexão se nenhuma for fornecida
            localCx = await pool.getConnection();
        }

        const {
            fk_usuario_id,
            fk_salas_id,
            data_agendamento,
            horarios,
            proposito
        } = dadosAgendamento;

        const query = `
            INSERT INTO Agendamentos 
            (fk_usuario_id, fk_salas_id, data_agendamento, horarios, proposito) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await localCx.execute(query, [
            fk_usuario_id,
            fk_salas_id,
            data_agendamento,
            horarios,
            proposito
        ]);

        return { id: result.insertId, ...dadosAgendamento };

    } catch (error) {
        throw new Error("Erro ao cadastrar Agendamento: " + error.message);
    } finally {
        if (!cx && localCx) {
            // Libera a conexão se foi criada localmente
            localCx.release();
        }
    }
};

export const buscarPorId = async (id, cx) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos WHERE id = ?
        `;
        const [rows] = await localCx.execute(query, [id]);

        if (rows.length === 0) {
            throw new Error(`Agendamento com ID ${id} não encontrado.`);
        }

        return rows[0];

    } catch (error) {
        throw new Error("Erro ao buscar Agendamento por ID: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const listarPorData = async (fk_salas_id, data_agendamento, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos WHERE fk_salas_id = ? AND data_agendamento = ?
        `;
        const [rows] = await localCx.execute(query, [fk_salas_id, data_agendamento]);
        return rows;

    } catch (error) {
        throw new Error("Erro ao listar Agendamentos por data: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const listar = async (cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            SELECT * FROM Agendamentos
        `;
        const [rows] = await localCx.execute(query);
        return rows;

    } catch (error) {
        throw new Error("Erro ao listar Agendamentos: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const deletar = async (id, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }

        const query = `
            DELETE FROM Agendamentos WHERE id = ?
        `;
        const [result] = await localCx.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error(`Nenhum registro deletado para o Agendamento com ID ${id}.`);
        }

        return { message: `Agendamento com ID ${id} deletado com sucesso.` };

    } catch (error) {
        throw new Error("Erro ao deletar Agendamento: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

export const verificarDisponibilidade = async (fk_salas_id, data_agendamento, cx = null) => {
    let localCx = cx;
    try {
        if (!localCx) {
            localCx = await pool.getConnection();
        }
        if (!isDateValida(data_agendamento)) {
            throw new Error("Data de agendamento inválida.");
        }

        // Obtem o index do dia da semana, exemplo: 0 => Domingo
        const index_day = data_agendamento.getDay();

        const sala = await salaModel.buscarPorId(fk_salas_id);
        // Verifica se a sala existe
        if(!sala){
            throw new Error("Sala não encontrada.");
        }
        // Pega os horários de funcionamento de todos os dias;
        // --> Uma array json de 0 a 6 que representa dotos os dias da semana;
        const horarios = sala.horario_funcionamento;
        //Obtem o horario do dia escolhido, pelo index_day
        const horario_do_dia = horarios[index_day].horarios;

        const agendamento_do_dia = await listarPorData(fk_salas_id,data_agendamento);

        if(!agendamento_do_dia){
            return horario_do_dia;
        }

        
        
        

    } catch (error) {
        throw new Error("Erro ao verificar disponibilidade: " + error.message);
    } finally {
        if (!cx && localCx) {
            localCx.release();
        }
    }
};

const isDateValida = (valor) => {
  return valor instanceof Date && !isNaN(valor.getTime());
}