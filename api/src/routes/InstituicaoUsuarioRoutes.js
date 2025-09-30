import * as instituicaoUsuarioController from "../controllers/InstituicaoUsuarioController.js";
import autenticar from "../middlewares/autenticacao.js";
import express from "express";

const router = express.Router();

// Usuário solicita vínculo em uma instituição
router.post("/instituicao-usuario/solicitar",autenticar,instituicaoUsuarioController.solicitarCadastro);

// Organizador cadastra diretamente um usuário na instituição
router.post("/instituicao-usuario",autenticar,instituicaoUsuarioController.cadastrar);

// Buscar vínculo por ID
router.get("/instituicao-usuario/:id",autenticar,instituicaoUsuarioController.buscarPorId);

// Atualizar vínculo (parcial)
router.patch("/instituicao-usuario/:id",autenticar,instituicaoUsuarioController.atualizar);

// Deletar vínculo
router.delete("/instituicao-usuario/:id",autenticar,instituicaoUsuarioController.deletar);

// Listar todas as instituições de um usuário
router.get("/instituicoes-usuario/:usuario_id",autenticar,instituicaoUsuarioController.listarInstituicoesPorUsuario);

// Listar todos os usuários de uma instituição
router.get("/usuarios-instituicao/:instituicao_id",autenticar,instituicaoUsuarioController.listarUsuariosPorInstituicao);

export default router;
