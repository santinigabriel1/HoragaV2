import * as usuarioController from "../controllers/usuarioController.js";
import express from "express";

const router = express.Router();

router.post("/usuarios", usuarioController.cadastrarUsuario);

export default router;