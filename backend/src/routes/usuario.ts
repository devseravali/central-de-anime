import { Router, Request, Response } from 'express';
import { usuarioController } from '../controllers/usuarioController';
import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { idParamSchema } from '../schemas/common/idParm.schema';
import { updateProfileSchema } from '../schemas/usuario/updateProfile.schema';
import { promoteSchema } from '../schemas/usuario/promote.schema';

const UsuarioRouter = Router();

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

		res.status(200).json({
			message: 'Bem sucedidos',
			users,
		});
	} catch (error) {
		console.error('Erro ao listar usuários', error);

		res.status(500).json({
			message: 'Erro ao listar usuários',
		});
	}
});

UsuarioRouter.get(
	'/me',
	authMiddleware,
	usuarioController.getProfile
);

UsuarioRouter.put(
	'/me',
	authMiddleware,
	validationMiddleware({ body: updateProfileSchema }),
	usuarioController.updateProfile
);

UsuarioRouter.get(
	'/ranking',
	authMiddleware,
	usuarioController.ranking
);

UsuarioRouter.post(
	'/promote',
	authMiddleware,
	adminMiddleware,
	validationMiddleware({ body: promoteSchema }),
	usuarioController.promoteToAdmin
);

UsuarioRouter.get(
	'/:id',
	validationMiddleware({
		params: idParamSchema,
	}),
	async (req: Request, res: Response) => {
		try {
			const id = Number(req.params.id);

			const user = await prisma.usuario.findUnique({
				where: { id },
				select: {
					id: true,
					nome: true,
					email: true,
					avatar: true,
					status: true,
					criadoEm: true,
				},
			});

			if (!user) {
				res.status(404).json({
					message: 'Usuário não encontrado',
				});
				return;
			}

			res.status(200).json({
				message: 'OK',
				user,
			});
		} catch (error) {
			console.error('Erro ao buscar usuário', error);

			res.status(500).json({
				message: 'Erro ao buscar usuário',
			});
		}
	}
);

UsuarioRouter.put(
	'/:id',
	authMiddleware,
	validationMiddleware({
		params: idParamSchema,
	}),
	async (req: Request, res: Response) => {
		try {
			const id = Number(req.params.id);

			const requesterId = req.user?.id;
			const requesterRole = req.user?.role;

			if (typeof requesterId !== 'number') {
				res.status(401).json({
					message: 'Usuário não autenticado',
				});
				return;
			}

			if (
				requesterId !== id &&
				requesterRole !== 'ADMIN'
			) {
				res.status(403).json({
					message: 'Acesso negado',
				});
				return;
			}

			const {
				nome,
				email,
				senha,
				avatar,
				status,
			} = req.body ?? {};

			if (
				status !== undefined &&
				requesterRole !== 'ADMIN'
			) {
				res.status(403).json({
					message:
						'Alteração de status não permitida neste endpoint',
				});
				return;
			}

			const updateData: {
				nome?: string;
				email?: string;
				senha?: string;
				avatar?: string | null;
			} = {};

			if (typeof nome === 'string') {
				updateData.nome = nome;
			}

			if (typeof email === 'string') {
				updateData.email = email;
			}

			if (typeof senha === 'string') {
				updateData.senha = senha;
			}

			if (avatar !== undefined) {
				updateData.avatar = avatar;
			}

			const { usuarioService } = await import(
				'../services/usuarioService'
			);

			const updated =
				await usuarioService.updateProfile(
					id,
					updateData
				);

			res.status(200).json({
				message: 'OK',
				user: updated,
			});
		} catch (error) {
			console.error(
				'Erro ao atualizar usuário',
				error
			);

			const message =
				error instanceof Error
					? error.message
					: 'Erro ao atualizar usuário';

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
	}
);

UsuarioRouter.delete(
	'/:id',
	authMiddleware,
	validationMiddleware({
		params: idParamSchema,
	}),
	async (req: Request, res: Response) => {
		try {
			const id = Number(req.params.id);

			const requesterId = req.user?.id;
			const requesterRole = req.user?.role;

			if (typeof requesterId !== 'number') {
				res.status(401).json({
					message: 'Usuário não autenticado',
				});
				return;
			}

			if (
				requesterId !== id &&
				requesterRole !== 'ADMIN'
			) {
				res.status(403).json({
					message: 'Acesso negado',
				});
				return;
			}

			try {
				await prisma.usuario.delete({
					where: { id },
				});

				res.status(204).send();
				return;
			} catch (err: any) {
				console.error(
					'Erro Prisma ao deletar usuário',
					err
				);

				if (err && err.code === 'P2025') {
					res.status(404).json({
						message: 'Usuário não encontrado',
					});
					return;
				}

				if (err && err.code === 'P2003') {
					res.status(409).json({
						message:
							'Não é possível deletar usuário devido a dependências externas',
					});
					return;
				}

				res.status(500).json({
					message: 'Erro ao deletar usuário',
				});
				return;
			}
		} catch (error) {
			console.error(
				'Erro ao deletar usuário',
				error
			);

			res.status(500).json({
				message: 'Erro ao deletar usuário',
			});
		}
	}
);

export default UsuarioRouter;