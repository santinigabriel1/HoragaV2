import * as salasController from '../controllers/salasController.js';
import autenticar from '../middlewares/autenticacao.js';
import express from 'express';

const router = express.Router();

router.post('/sala',                            autenticar, salasController.cadastrar);
router.get('/sala/:id',                         autenticar, salasController.buscarPorId);
router.get('/salas',                            autenticar, salasController.listar);
router.get('/salas/instituicao/:instituicaoId', autenticar, salasController.listarPorInstituicao);
router.patch('/sala/:id',                       autenticar, salasController.atualizar);
router.delete('/sala/:id',                      autenticar, salasController.deletar);

export default router;