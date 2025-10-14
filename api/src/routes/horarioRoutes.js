import * as horarioController from '../controllers/horarioController.js';
import autenticar from '../middlewares/autenticacao.js';
import express from 'express';

const router = express.Router();

router.post('/horario',       autenticar, horarioController.cadastrar);
router.get('/horario/:id',    autenticar, horarioController.buscarPorId);
router.get('/horarios',       autenticar, horarioController.listar);
router.patch('/horario/:id',  autenticar, horarioController.atualizar);
router.delete('/horario/:id', autenticar, horarioController.deletar);

export default router;