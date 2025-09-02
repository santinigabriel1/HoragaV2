import * as UsuarioModel from "../models/UsuarioModel.js";

export const cadastrarUsuario = async (req, res) => {
    try {
        const usuario = req.body;
        
        const {nome, email, senha, cargo} = usuario
        if(!nome || !email || !senha || !cargo){
            const resposta  = {
                "success": false,
                "status": "erro",
                "statusCode": 400,
                "mensagem": "Todos os campos são obrigatórios"
            }
            return res.status(400).json(resposta);
        }
        
        const usuarioId = await UsuarioModel.cadastrar(usuario);
        console.log(usuario);

        const resposta = {
                "success": true,
                "status": "sucesso",
                "statusCode": 201,
                "mensagem": "Usuário cadastrado com sucesso",
                "data": usuarioId
        }
        return res.status(201).json(resposta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
