// controller/usuarioController.js
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
}