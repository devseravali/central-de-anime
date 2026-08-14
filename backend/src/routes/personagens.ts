import { Router } from 'express';
import { personagemController } from '../controllers/personagemController';

const PersonagensRouter = Router();

PersonagensRouter.get('/', personagemController.list);

export default PersonagensRouter;
