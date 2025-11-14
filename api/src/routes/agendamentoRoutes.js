import * as agendamentoController from '../controllers/agendamentoController.js';
import autenticar from '../middlewares/autenticacao.js';
import express from 'express';

const router = express.Router();

router.post('/agendamento', agendamentoController.cadastrar);
router.get('/agendamento/:salas_id/:data_agendamento', agendamentoController.verificarDisponibilidade);

export default router;