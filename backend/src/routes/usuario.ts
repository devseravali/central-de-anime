import { Router, Request, Response } from 'express';
import { usuarioController } from '../controllers/usuarioController';
import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const UsuarioRouter = Router();

function parseId(value: unknown): number | undefined {
	if (typeof value !== 'string') return undefined;
	const n = Number.parseInt(value, 10);
	return Number.isNaN(n) ? undefined : n;
}

UsuarioRouter.get('/', async (_req: Request, res: Response) => {
	try {
		const users = await prisma.usuario.findMany({
			select: {
				id: true,
				nome: true,
				email: true,
				avatar: true,
				status: true,
				criadoEm: true,
			},
			take: 200,
		});

		res.status(200).json({ message: 'Bem sucedidos', users });
	} catch (error) {
		console.error('Erro ao listar usuários', error);
		res.status(500).json({ message: 'Erro ao listar usuários' });
	}
});

UsuarioRouter.get('/me', authMiddleware, usuarioController.getProfile);
UsuarioRouter.put('/me', authMiddleware, usuarioController.updateProfile);
UsuarioRouter.get('/ranking', authMiddleware, usuarioController.ranking);
UsuarioRouter.post('/promote', authMiddleware, adminMiddleware, usuarioController.promoteToAdmin);

UsuarioRouter.get('/:id', async (req: Request, res: Response) => {
	try {
		const id = parseId(req.params.id);

		if (id === undefined) {
			res.status(400).json({ message: 'ID inválido' });
			return;
		}

		const user = await prisma.usuario.findUnique({
			where: { id },
			select: { id: true, nome: true, email: true, avatar: true, status: true, criadoEm: true },
		});

		if (!user) {
			res.status(404).json({ message: 'Usuário não encontrado' });
			return;
		}

		res.status(200).json({ message: 'OK', user });
	} catch (error) {
		console.error('Erro ao buscar usuário', error);
		res.status(500).json({ message: 'Erro ao buscar usuário' });
	}
});

UsuarioRouter.put('/:id', async (req: Request, res: Response) => {
	try {
		const id = parseId(req.params.id);

		if (id === undefined) {
			res.status(400).json({ message: 'ID inválido' });
			return;
		}

		const { nome, email, senha, avatar, status } = req.body ?? {};

		const { usuarioService } = await import('../services/usuarioService');

		const updated = await usuarioService.updateProfile(id, { nome, email, senha, avatar, status });

		res.status(200).json({ message: 'OK', user: updated });
	} catch (error) {
		console.error('Erro ao atualizar usuário', error);
		const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
		if (message === 'Usuário não encontrado') {
			res.status(404).json({ message });
			return;
		}
		if (message === 'Email já em uso') {
			res.status(409).json({ message });
			return;
		}
		res.status(400).json({ message });
	}
});

UsuarioRouter.delete('/:id', async (req: Request, res: Response) => {
	try {
		const id = parseId(req.params.id);

		if (id === undefined) {
			res.status(400).json({ message: 'ID inválido' });
			return;
		}

		await prisma.usuario.delete({ where: { id } });

		res.status(204).send();
	} catch (error) {
		console.error('Erro ao deletar usuário', error);
		res.status(500).json({ message: 'Erro ao deletar usuário' });
	}
});

export default UsuarioRouter;
