import * as usuarioController from "../controllers/usuarioController.js";
import { middlewareAutenticacao }  from "../middlewares/autenticacaoMiddlewares.js";
import express from "express";

const router = express.Router();

router.post("/usuario",                                         usuarioController.cadastrar);
router.post("/usuario/login",                                   usuarioController.login);
router.get("/usuarios",             middlewareAutenticacao,     usuarioController.listar);
router.get("/usuario/:id",          middlewareAutenticacao,     usuarioController.buscarPorId);
router.get("/usuario/email/:email", middlewareAutenticacao,     usuarioController.buscarPorEmail);
router.patch("/usuario/:id",        middlewareAutenticacao,     usuarioController.atualizar);
router.put("/usuario/:id",          middlewareAutenticacao,     usuarioController.atualizarTudo);
router.delete("/usuario/:id",       middlewareAutenticacao ,    usuarioController.deletar);

export default router;