import * as HorarioModel from '../models/HorarioModel.js';
import * as responses from '../utils/responses.js';

export const cadastrar = async (req, res) => {
    try {
        const { fk_instituicao_id, descricao, horario } = req.body;

        // Validações básicas
        if (!fk_instituicao_id || !descricao || !horario) {
            return responses.error(res, { statusCode: 400, message: "Todos os campos (fk_instituicao_id, descricao, horario) são obrigatórios" });
        }

        if (!Array.isArray(horario)) {
            return responses.error(res, { statusCode: 400, message: "O campo 'horario' deve ser um array" });
        }

        const novoHorario = await HorarioModel.cadastrar({ fk_instituicao_id, descricao, horario });
        return responses.success(res, { statusCode: 201, message: "Horário cadastrado com sucesso", data: novoHorario });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID do horário é obrigatório" });
        }

        if (!Number(id)) {
            return responses.error(res, { statusCode: 400, message: "ID do horário deve ser um número válido" });
        }

        const horario = await HorarioModel.buscarPorId(id);
        if (!horario) {
            return responses.notFound(res, { message: "Horário não encontrado" });
        }

        return responses.success(res, { data: horario });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
}; 

export const listar = async (req, res) => {
    try {
        const search = req.query.search || "";
        const horarios = await HorarioModel.listar(search);

        if (!horarios || horarios.length === 0) {
            return responses.error(res, { statusCode: 404, message: "Nenhum horário encontrado." });
        }

        return responses.success(res, { message: "Horários listados com sucesso.", data: horarios });
    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};

// Assumindo que 'responses' e 'HorarioModel' foram importados corretamente

export const atualizar = async (req, res) => {
    try {
        const id = req.params.id;
        const horarioAtualizado = req.body;
        
        // Objeto que conterá APENAS os campos válidos para o PATCH
        const dadosParaAtualizar = {}; 

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID do horário é obrigatório" });
        }

        if (isNaN(Number(id))) { // Usando isNaN(Number(id)) para uma verificação robusta de número
            return responses.error(res, { statusCode: 400, message: "ID do horário deve ser um número válido" });
        }

        // Extrai os campos que são colunas do banco de dados
        const { descricao, horario } = horarioAtualizado;

        // Lógica do PATCH: Adiciona o campo SOMENTE SE ele foi enviado (não for undefined)
        if (descricao !== undefined) {
            dadosParaAtualizar.descricao = descricao;
        }
        
        // Verifica se o campo JSON 'horario' foi enviado
        if (horario !== undefined) {
            dadosParaAtualizar.horario = horario;
        }

        // Garante que pelo menos um campo para atualização foi fornecido
        if (Object.keys(dadosParaAtualizar).length === 0) {
            return responses.error(res, { statusCode: 400, message: "Pelo menos um campo (descricao, horario) deve ser fornecido para atualização" });
        }

        const horarioExistente = await HorarioModel.buscarPorId(id);
        if (!horarioExistente) {
            return responses.notFound(res, { message: "Horário não encontrado" });
        }

        // Chama a model, passando APENAS os dados filtrados
        const resultado = await HorarioModel.atualizar(id, dadosParaAtualizar); 
        
        // Nota: A model é responsável por lançar um erro se não atualizar nada.
        // Se 'resultado' vier null/falsy, pode ser tratado como notFound
        // mas o erro de SQL original não deve ocorrer mais.
        if (!resultado) { 
             return responses.notFound(res, { message: "Horário não encontrado após tentativa de atualização." });
        }

        return responses.success(res, { message: "Horário atualizado com sucesso", data: resultado });

    } catch (error) {
        // O erro de SQL que você tinha será capturado aqui (com uma mensagem melhorada pela model)
        const errorMessage = error.message || "Erro interno do servidor.";
        return responses.error(res, { message: errorMessage });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return responses.error(res, { statusCode: 400, message: "ID do horário é obrigatório" });
        }

        if (!Number(id)) {
            return responses.error(res, { statusCode: 400, message: "ID do horário deve ser um número válido" });
        }

        const horarioExistente = await HorarioModel.buscarPorId(id);
        if (!horarioExistente) {
            return responses.notFound(res, { message: "Horário não encontrado" });
        }

        const resultado = await HorarioModel.deletar(id);
        if (!resultado) {
            return responses.notFound(res, { message: "Horário não encontrado" });
        }

        return responses.success(res, { message: "Horário deletado com sucesso" });

    } catch (error) {
        return responses.error(res, { message: error.message });
    }
};