import * as AgendamentoModel from '../models/AgendamentoModel.js';
import * as responses from '../utils/responses.js';

export const verificarDisponibilidade = async (req, res) => {
    try {
        const {salas_id, data_agendamento} = req.params;
        const disponibilidade = await AgendamentoModel.verificarDisponibilidade(salas_id,data_agendamento);
        return responses.success(res, { statusCode: 200, message: "Disponibilidade de laboratórios", data: disponibilidade });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const cadastrar = async (req, res) => {
    try {

        const {fk_usuario_id,fk_salas_id,data_agendamento,horarios,proposito} = req.body;

        //Fazer o controle para verificar se os dados são válidos

        const agendamento = await AgendamentoModel.cadastrar(req.body);

        return responses.created(res, {message:"Horário agendado", data:agendamento});
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const agendamento = await AgendamentoModel.buscarPorId(id);
        if (!agendamento) {
            return responses.notFound(res, { message: "Agendamento não encontrado" });
        }
        return responses.success(res, { statusCode: 200, message: "Agendamento encontrado", data: agendamento });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const listarPorData = async (req, res) => {
    try {
        const { salas_id, data_agendamento } = req.params;
        const agendamentos = await AgendamentoModel.listarPorData(salas_id, data_agendamento);
        return responses.success(res, { statusCode: 200, message: "Agendamentos para a data especificada", data: agendamentos });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const listar = async (req, res) => {
    try {
        const agendamentos = await AgendamentoModel.listar();
        return responses.success(res, { statusCode: 200, message: "Lista de todos os agendamentos", data: agendamentos });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        await AgendamentoModel.deletar(id);
        return responses.success(res, { statusCode: 200, message: "Agendamento deletado com sucesso" });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

