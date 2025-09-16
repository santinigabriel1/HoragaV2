// controller/usuarioController.js
import * as UsuarioModel from "../models/UsuarioModel.js";
import * as Sessoes from '../models/SessoesModel.js';
import * as responses from '../utils/responses.js';

export const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha || !cargo) {
      return responses.error(res, { statusCode: 400, message: "Todos os campos são obrigatórios" });
    }

    const newUsuario = await UsuarioModel.cadastrar(req.body);
    delete newUsuario.senha;

    return responses.created(res, { message: "Usuário cadastrado com sucesso", data: newUsuario });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return responses.error(res, { statusCode: 400, message: "Email e senha são obrigatórios" });
    }

    const usuario = await UsuarioModel.login(email, senha);
    if (!usuario) {
      return responses.error(res, { statusCode: 401, message: "Credenciais inválidas" });
    }
    //Efetuou login com sucesso
    const horas_validade = 36;
    const sessao = await Sessoes.criar(usuario.id, horas_validade);
    
    const data = {
      token: usuario.id + "." + sessao.token,
      expiracao: sessao.validade,
      usuario
    };

    return responses.success(res, { message: "Login realizado com sucesso", data });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const search = req.query.search || "";
    const usuarios = await UsuarioModel.listar(search);

    if (!usuarios || usuarios.length === 0) {
      return responses.notFound(res, { message: "Nenhum usuário encontrado" });
    }

    return responses.success(res, {message: "Lista de usuários",data: usuarios});
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const usuario = await UsuarioModel.buscarPorId(id);
    if (!usuario) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário encontrado", data: usuario });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const buscarUsuarioLogado = async (req, res) => {
  try {
    if (!req.loginId) {
      return responses.notFound(res, { message: "ID de sessão não encontrado" });
    }

    const usuario = await UsuarioModel.buscarPorId(req.loginId);

    if (!usuario) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, {message: "Usuário encontrado", data: usuario });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const buscarPorEmail = async (req, res) => {
  try {
    const usuario = await UsuarioModel.buscarPorEmail(req.params.email);
    if (!usuario) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário encontrado", data: usuario });
    
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const atualizarTudo = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = req.body;

    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }

    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const { nome, email, senha, cargo } = usuario;
    if (!nome || !email || !senha || !cargo) {
      return responses.error(res, { statusCode: 400, message: "Todos os campos (nome, email, senha, cargo) são obrigatórios" });
    }

    const resultado = await UsuarioModel.atualizar(id, usuario);
    if (!resultado) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário atualizado com sucesso", data: resultado });

  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }
    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const resultado = await UsuarioModel.atualizar(id, req.body);

    if (!resultado) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.success(res, { message: "Usuário atualizado com sucesso", data: resultado });
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário é obrigatório" });
    }
    if (!Number(id)) {
      return responses.error(res, { statusCode: 400, message: "ID do usuário deve ser um número válido" });
    }

    const resultado = await UsuarioModel.deletar(id);
    if (!resultado) {
      return responses.notFound(res, { message: "Usuário não encontrado" });
    }

    return responses.noContent(res, {message: "Usuário deletado com sucesso"});
  } catch (error) {
    return responses.error(res, { message: error.message });
  }
};
