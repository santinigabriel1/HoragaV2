import * as usuarioController from "../controllers/usuarioController.js";
import express from "express";

const router = express.Router();

router.post("/usuario", usuarioController.cadastrar);
router.post("/usuario/login", usuarioController.login);
router.get("/usuarios", usuarioController.listar);
router.get("/usuario/:id", usuarioController.buscarPorId);
router.get("/usuario/email/:email", usuarioController.buscarPorEmail);
router.patch("/usuario/:id", usuarioController.atualizar);
router.put("/usuario/:id", usuarioController.atualizarTudo);
router.delete("/usuario/:id", usuarioController.deletar);

export default router;