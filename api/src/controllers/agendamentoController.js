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