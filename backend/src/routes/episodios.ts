import { Router } from 'express';
import { episodioController } from '../controllers/episodioController';

const EpisodiosRouter = Router();

EpisodiosRouter.get('/', episodioController.list);
EpisodiosRouter.get('/:id', episodioController.getById);

export default EpisodiosRouter;
