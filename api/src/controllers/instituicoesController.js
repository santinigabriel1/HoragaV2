import * as InstituicaoModel from "../models/InstituicoesModel.js";
import * as responses from '../utils/responses.js';


export const cadastrar = async (req, res) => {
    try {

        const organizador =   req.loginId;

        const { nome, descricao } = req.body;


        if (!organizador || !nome || !descricao) {
            return responses.error(res, { 
                statusCode: 400, 
                message: "Dados incompletos. 'organizador', 'nome' e 'descricao' são obrigatórios." 
            });
        }

        const newInstituicao = { organizador, nome, descricao };

        const createdInstituicao = await InstituicaoModel.cadastrar(newInstituicao);
        return responses.created(res, {message: "Instituição cadastrada com sucesso", data: createdInstituicao});
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID da Instituição é obrigatório." });
        }

        const instituicao = await InstituicaoModel.buscarPorId(id);

        if (!instituicao) {
            return responses.error(res, { statusCode: 404, message: "Instituição não encontrada." });
        }

        return responses.success(res, { message: "Instituição encontrada com sucesso.", data: instituicao });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const buscarPorNome = async (req, res) => {
    try {
        const nome = req.params.nome;

        if (!nome) {
            return responses.error(res, { statusCode: 400, message: "Nome da Instituição é obrigatório." });
        }

        const instituicao = await InstituicaoModel.buscarPorNome(nome);

        if (!instituicao) {
            return responses.error(res, { statusCode: 404, message: "Instituição não encontrada." });
        }

        return responses.success(res, { message: "Instituição encontrada com sucesso.", data: instituicao });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const listarPorOrganizador = async (req, res) => {
    try {
        const organizadorId = req.loginId;

        if (!organizadorId) {
            return responses.error(res, { statusCode: 400, message: "ID do Organizador é obrigatório." });
        }

        const instituicoes = await InstituicaoModel.listarPorOrganizador(organizadorId);
        return responses.success(res, { message: "Instituições listadas com sucesso.", data: instituicoes });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const listar = async (req, res) => {
    try {
        const search = req.query.search || "";
        const instituicoes = await InstituicaoModel.listar(search);

        if (!instituicoes || instituicoes.length === 0) {
            return responses.error(res, { statusCode: 404, message: "Nenhuma Instituição encontrada." });
        }

        return responses.success(res, { message: "Instituições listadas com sucesso.", data: instituicoes });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const atualizarTudo = async (req, res) => {
      try {
        const id = req.params.id;
        const instituicoes = req.body;
    
        if (!id) {
          return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
        }
    
        if (!Number(id)) {
          return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
        }

        const { nome, descricao } = instituicoes;
        if (!nome || !descricao) {
          return responses.error(res, { statusCode: 400, message: "Todos os campos (nome, descricao) são obrigatórios" });
        }

        const resultado = await InstituicaoModel.atualizar(id, instituicoes);
        if (!resultado) {
          return responses.notFound(res, { message: "Instituição não encontrada" });
        }

        return responses.success(res, { message: "Instituição atualizada com sucesso", data: resultado });
    
      } catch (error) {
        return responses.error(res, { message: error.message });
      }
    };

    export const atualizar = async (req, res) => {
      try {
        const id = req.params.id;
        const instituicoes = req.body;
    
        if (!id) {
          return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
        }
    
        if (!Number(id)) {
          return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
        }

        const { nome, descricao } = instituicoes;
        if (!nome && !descricao) {
          return responses.error(res, { statusCode: 400, message: "Pelo menos um campo (nome ou descricao) deve ser fornecido para atualização" });
        }

        const resultado = await InstituicaoModel.atualizar(id, instituicoes);
        if (!resultado) {
          return responses.notFound(res, { message: "Instituição não encontrada" });
        }

        return responses.success(res, { message: "Instituição atualizada com sucesso", data: resultado });
    
      } catch (error) {
        return responses.error(res, { message: error.message });
      }
    };
    
export const deletar = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID da instituição é obrigatório" });
        }

        if (!Number(id)) {
            return responses.error(res, { statusCode: 400, message: "ID da instituição deve ser um número válido" });
        }

        const resultado = await InstituicaoModel.deletar(id);
        if (!resultado) {
            return responses.notFound(res, { message: "Instituição não encontrada" });
        }

        return responses.success(res, { message: "Instituição deletada com sucesso", data: resultado });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
}; 