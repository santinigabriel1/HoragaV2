import * as InstituicaoModel from "../models/InstituicoesModel.js";
import * as responses from '../utils/responses.js';
import * as InstituicaoUsuarioModel from "../models/InstituicaoUsuarioModel.js";

/**
 * Cadastra uma nova instituição vinculada ao organizador logado.
 */
export const cadastrar = async (req, res) => {
    try {
        const organizador = req.loginId;
        const { nome, descricao } = req.body;

        if (!organizador || !nome || !descricao) {
            return responses.error(res, { statusCode: 400, message: "Dados incompletos." });
        }

        const instituicao = { organizador, nome, descricao };

        // 1. Cria a Instituição
        const instituicaoCriada = await InstituicaoModel.cadastrar(instituicao);
        
        // 2. Cria o Vínculo automático
        await InstituicaoUsuarioModel.cadastrar({
            instituicao: instituicaoCriada.id, 
            usuario: organizador, 
            aceito: true
        });

        return responses.created(res, {message: "Instituição cadastrada com sucesso", data: instituicaoCriada});
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Busca uma instituição pelo seu ID.
 */
export const buscarPorId = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return responses.error(res, { statusCode: 400, message: "ID obrigatório." });
        
        const instituicao = await InstituicaoModel.buscarPorId(id);
        if (!instituicao) return responses.error(res, { statusCode: 404, message: "Instituição não encontrada." });
        
        return responses.success(res, { message: "Sucesso", data: instituicao });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Busca uma instituição pelo nome.
 */
export const buscarPorNome = async (req, res) => {
    try {
        const nome = req.params.nome;
        if (!nome) return responses.error(res, { statusCode: 400, message: "Nome obrigatório." });

        const instituicao = await InstituicaoModel.buscarPorNome(nome);
        if (!instituicao) return responses.error(res, { statusCode: 404, message: "Não encontrada." });

        return responses.success(res, { message: "Sucesso", data: instituicao });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Lista todas as instituições de um organizador.
 */
export const listarPorOrganizador = async (req, res) => {
    try {
        const organizadorId = req.loginId;
        if (!organizadorId) return responses.error(res, { statusCode: 400, message: "ID do organizador obrigatório." });

        const instituicoes = await InstituicaoModel.listarPorOrganizador(organizadorId);
        return responses.success(res, { message: "Sucesso", data: instituicoes });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Lista todas as instituições (busca).
 */
export const listar = async (req, res) => {
    try {
        const search = req.query.search || "";
        const instituicoes = await InstituicaoModel.listar(search);
        
        if (!instituicoes || instituicoes.length === 0) {
            // Retorna array vazio com sucesso em vez de erro 404 para listagens, é melhor para o front
            return responses.success(res, { message: "Nenhuma instituição encontrada.", data: [] });
        }

        return responses.success(res, { message: "Sucesso", data: instituicoes });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

/**
 * Atualiza TODOS os campos (PUT).
 */
export const atualizarTudo = async (req, res) => {
  try {
    const organizador = req.loginId;
    const id = req.params.id;
    const instituicoes = req.body;

    if (!id) return responses.error(res, { statusCode: 400, message: "ID obrigatório" });
    const { nome, descricao } = instituicoes;
    if (!nome || !descricao) return responses.error(res, { statusCode: 400, message: "Campos obrigatórios faltando" });

    const instituicaoExistente = await InstituicaoModel.buscarPorId(id);
    if (!instituicaoExistente) return responses.notFound(res, { message: "Instituição não encontrada" });

    // Validação de Permissão (Int vs Int)
    if (parseInt(instituicaoExistente.organizador) !== parseInt(organizador)) {
      return responses.error(res, { statusCode: 403, message: "Sem permissão." });
    }

    // Nota: seu model deve ter o método atualizarTudo ou atualizar
    const resultado = await InstituicaoModel.atualizarTudo(id, instituicoes);
    return responses.success(res, { message: "Atualizado com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Atualiza PARCIALMENTE (PATCH).
 */
export const atualizar = async (req, res) => {
  try {
    const organizador = req.loginId;
    const id = req.params.id;
    const instituicoes = req.body;

    if (!id) return responses.error(res, { statusCode: 400, message: "ID obrigatório" });

    const instituicaoExistente = await InstituicaoModel.buscarPorId(id);
    if (!instituicaoExistente) return responses.notFound(res, { message: "Instituição não encontrada" });

    // Validação de Permissão (Int vs Int)
    if (parseInt(instituicaoExistente.organizador) !== parseInt(organizador)) {
      return responses.error(res, { statusCode: 403, message: "Sem permissão." });
    }

    const resultado = await InstituicaoModel.atualizar(id, instituicoes);
    return responses.success(res, { message: "Atualizado com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

/**
 * Deleta com Cascata.
 */
export const deletar = async (req, res) => {
    try {
        const organizador = req.loginId;
        const id = req.params.id;

        if (!id) return responses.error(res, { statusCode: 400, message: "ID obrigatório" });

        const instituicaoExistente = await InstituicaoModel.buscarPorId(id);
        if (!instituicaoExistente) return responses.notFound(res, { message: "Instituição não encontrada" });

        if (parseInt(instituicaoExistente.organizador) !== parseInt(organizador)) {
            return responses.error(res, { statusCode: 403, message: "Sem permissão." });
        }

        // 1. Limpar vínculos (precisa ter criado o método no model InstituicaoUsuarioModel)
        // Se não criou o método lá, comente essa linha e o delete vai falhar se tiver usuário vinculado
        if (InstituicaoUsuarioModel.deletarPorInstituicao) {
             await InstituicaoUsuarioModel.deletarPorInstituicao(id);
        } else {
             // Fallback ou log de aviso se não implementou no model
             console.warn("Método deletarPorInstituicao não encontrado no model.");
        }

        // 2. Deletar Instituição (O model deve tratar a cascata de salas se configurado no banco, ou fazer manual)
        const resultado = await InstituicaoModel.deletar(id);

        return responses.success(res, { message: "Deletado com sucesso", data: resultado });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};