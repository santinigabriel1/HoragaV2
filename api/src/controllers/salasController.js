import * as SalasModel from "../models/SalasModel.js";
import * as HorarioModel from "../models/HorarioModel.js";
import * as responses from "../utils/responses.js";

export const cadastrar = async (req, res) => {
    try {
        const { fk_instituicao_id, nome, descricao } = req.body;
    
        // Validações básicas
        if (!fk_instituicao_id || !nome || !descricao) {
            return responses.error(res, { statusCode: 400, message: "Todos os campos (fk_instituicao_id, nome, descricao) são obrigatórios" });
        }

        const novaSala = await SalasModel.cadastrar({ fk_instituicao_id, nome, descricao });
        return responses.success(res, { statusCode: 201, message: "Sala cadastrada com sucesso", data: novaSala });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID da sala é obrigatório" });
        }

        if (!Number(id)) {
            return responses.error(res, { statusCode: 400, message: "ID da sala deve ser um número válido" });
        }

        const sala = await SalasModel.buscarPorId(id);
        if (!sala) {
            return responses.notFound(res, { message: "Sala não encontrada" });
        }

        return responses.success(res, { data: sala });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const listar = async (req, res) => {
    try {
        const search = req.query.search || "";
        const salas = await SalasModel.listar(search);
        if (salas.length === 0) {
            return responses.notFound(res, { message: "Nenhuma sala encontrada" });
        }
        return responses.success(res, { data: salas });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const listarPorInstituicao = async (req, res) => {
    try {
        const instituicaoId = req.params.instituicaoId;

        if (!instituicaoId) {
            return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
        }

        if (!Number(instituicaoId)) {
            return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
        }

        const search = req.query.search || "";
        const salas = await SalasModel.listarPorInstituicao(instituicaoId, search);
        if (salas.length === 0) {
            return responses.notFound(res, { message: "Nenhuma sala encontrada para esta instituição" });
        }
        return responses.success(res, { data: salas });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const atualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const salas = req.body;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
    }

    const { nome, descricao } = salas;
    if (!nome && !descricao) {
      return responses.error(res, { statusCode: 400, message: "Pelo menos um campo (nome ou descricao) deve ser fornecido para atualização" });
    }

    const salaExistente = await SalasModel.buscarPorId(id);
    if (!salaExistente) {
      return responses.notFound(res, { message: "Sala não encontrada" });
    }

    const resultado = await SalasModel.atualizar(id, salas);
    if (!resultado) {
      return responses.notFound(res, { message: "Sala não encontrada" });
    }

    return responses.success(res, { message: "Sala atualizada com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};


export const copiarHorario = async (req, res) => {
  try {
    const id_sala = req.body.id_sala;
    const id_horario = req.body.id_horario;
    

    if (!id_horario) {
      return responses.error(res, { statusCode: 400, message: "ID do horário é obrigatório" });
    }

    if (!Number(id_horario)) {
      return responses.error(res, { statusCode: 400, message: "ID do horátio deve ser um número válido" });
    }
   
    const hosrio = await HorarioModel.buscarPorId(id_horario);

    const resultado = await SalasModel.manipularHorarios(id_sala, hosrio.horario);

    if (!resultado) {
      return responses.notFound(res, { message: "Sala não encontrada" });
    }

    return responses.success(res, { message: "Horário da sala atualizada com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const deletar = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID da sala é obrigatório" });
        }

        if (!Number(id)) {
            return responses.error(res, { statusCode: 400, message: "ID da sala deve ser um número válido" });
        }

        const salaExistente = await SalasModel.buscarPorId(id);
        if (!salaExistente) {
            return responses.notFound(res, { message: "Sala não encontrada" });
        }

        await SalasModel.deletar(id);
        return responses.success(res, { message: "Sala deletada com sucesso" });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};