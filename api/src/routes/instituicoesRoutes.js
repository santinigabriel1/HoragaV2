import * as instituicoesController from "../controllers/instituicoesController.js";
import autenticar from "../middlewares/autenticacao.js";
import express from "express";

const router = express.Router();

router.post("/instituicao",     autenticar,     instituicoesController.cadastrar);


export default router;