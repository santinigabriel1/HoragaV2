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