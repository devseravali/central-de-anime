import { Router, Request, Response } from 'express';
import { animeController } from '../controllers/animeController';
import { temporadaController } from '../controllers/temporadaController';
import { personagemController } from '../controllers/personagemController';
import { episodioController } from '../controllers/episodioController';

const AnimesRouter = Router();

AnimesRouter.get('/', animeController.list);
AnimesRouter.get('/search', animeController.search);
AnimesRouter.get('/:id', animeController.getById);

AnimesRouter.get('/:id/temporadas', (req, res) => {
    const animeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    req.query.animeId = animeId;

    return temporadaController.list(req, res);
});

AnimesRouter.get('/:id/personagens', (req, res) => {
    const animeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    req.query.animeId = animeId;

    return personagemController.list(req, res);
});

AnimesRouter.get(
    '/:id/temporadas/:temporadaId/episodios',
    (req, res) => {
        const temporadaId = Array.isArray(req.params.temporadaId) ? req.params.temporadaId[0] : req.params.temporadaId;
        req.query.temporadaId = temporadaId;

        return episodioController.list(req, res);
    }
);

AnimesRouter.put('/:id', animeController.update);
AnimesRouter.delete('/:id', animeController.remove);

AnimesRouter.get('/:id/capas', async (req: Request, res: Response) => {
    try {
        const { prisma } = await import('../config/prisma');
        const capas = await prisma.capas.findMany();

        res.status(200).json(capas);
    } catch (error) {
        console.error('Erro ao buscar capas:', error);
        res.status(500).json({ message: 'Erro ao buscar capas' });
    }
});

AnimesRouter.post('/:id/capa', async (req: Request, res: Response) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const animeId = Number.parseInt(idParam, 10);

        if (Number.isNaN(animeId)) {
            res.status(400).json({ message: 'ID de anime inválido' });
            return;
        }
        const { nome_original, nome_salvo, caminho, mime_type } = req.body ?? {};

        if (!nome_original || !nome_salvo || !caminho || !mime_type) {
            res.status(400).json({ message: 'nome_original, nome_salvo, caminho e mime_type são obrigatórios' });
            return;
        }

        const { prisma } = await import('../config/prisma');

        const capa = await prisma.capas.create({ data: { nome_original, nome_salvo, caminho, mime_type } });

        res.status(201).json({ capa, animeId });
    } catch (error) {
        console.error('Erro ao criar capa:', error);
        res.status(500).json({ message: 'Erro ao criar capa' });
    }
});

export default AnimesRouter;