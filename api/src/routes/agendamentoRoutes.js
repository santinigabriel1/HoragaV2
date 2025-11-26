import * as agendamentoController from '../controllers/agendamentoController.js';
import autenticar from '../middlewares/autenticacao.js';
import express from 'express';

const router = express.Router();

router.post('/agendamento',                             autenticar, agendamentoController.cadastrar);
router.get('/agendamento/:salas_id/:data_agendamento',  autenticar, agendamentoController.verificarDisponibilidade);
router.get('/agendamento/:id',                          autenticar, agendamentoController.buscarPorId);
router.get('/agendamentos/:salas_id/:data_agendamento', autenticar, agendamentoController.listarPorData);
router.get('/agendamentos',                             autenticar, agendamentoController.listar);
router.delete('/agendamento/:id',                       autenticar, agendamentoController.deletar); 

export default router;