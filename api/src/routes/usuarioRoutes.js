import * as usuarioController from "../controllers/usuarioController.js";
import autentica from "../middlewares/autenticacaoMiddlewares.js";
import express from "express";

const router = express.Router();

router.post("/usuario",                        usuarioController.cadastrar);
router.post("/usuario/login",                  usuarioController.login);
router.get("/usuarios",             autentica, usuarioController.listar);
router.get("/usuario/:id",          autentica, usuarioController.buscarPorId);
router.get("/usuario/email/:email", autentica, usuarioController.buscarPorEmail);
router.patch("/usuario/:id",        autentica, usuarioController.atualizar);
router.put("/usuario/:id",          autentica, usuarioController.atualizarTudo);
router.delete("/usuario/:id",       autentica, usuarioController.deletar);

export default router;