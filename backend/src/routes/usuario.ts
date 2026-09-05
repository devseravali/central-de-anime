import { Router, Request, Response } from 'express';

import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { usuarioController } from '../controllers/usuarioController';
import { usuarioService } from '../services/usuarioService';

const UsuarioRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;

  const n = Number.parseInt(value, 10);

  return Number.isNaN(n) ? undefined : n;
}

function hasOnlyAllowedFields(
  payload: Record<string, unknown>,
  allowedFields: string[]
): boolean {
  const payloadKeys = Object.keys(payload);

  return payloadKeys.every((key) => allowedFields.includes(key));
}

async function handleUpdateProfile(
  req: Request,
  res: Response,
  usuarioId: number
): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const allowedFields = ['nome', 'email', 'senha', 'avatar'];

  if (!hasOnlyAllowedFields(body, allowedFields)) {
    res.status(400).json({ message: 'Dados de entrada inválidos' });
    return;
  }

  const usuario = await usuarioService.updateProfile(usuarioId, {
    nome: body.nome as string | undefined,
    email: body.email as string | undefined,
    senha: body.senha as string | undefined,
    avatar: (body.avatar as string | null | undefined),
  });

  res.status(200).json({ message: 'OK', usuario });
}

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Lista as sessões de um usuário
 *     description: >
 *       Retorna as sessões autenticadas de um usuário.
 *       O próprio usuário pode consultar suas sessões e administradores
 *       podem consultar as sessões de qualquer usuário.
 *     tags:
 *       - Sessões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário cujas sessões serão consultadas
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sessões listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Dados da sessão
 *       400:
 *         description: usuarioId não informado ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: usuarioId é obrigatório como query param
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */

// Protected routes for profile and updates
UsuarioRouter.get('/me', authMiddleware, usuarioController.getProfile);

UsuarioRouter.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const anyReq = req as any;
    const usuarioId = anyReq.user?.id;

    if (typeof usuarioId !== 'number') {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    await handleUpdateProfile(req, res, usuarioId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';

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

// List users (safe select)
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

    res.status(200).json({ users });
  } catch (error) {
    console.error('Erro ao listar usuários', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Promote to admin (route may be used by admin flows)
UsuarioRouter.post('/promote', authMiddleware, adminMiddleware, usuarioController.promoteToAdmin);

// Ranking by user
UsuarioRouter.get('/:id/ranking', usuarioController.ranking);

UsuarioRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);

    if (id === undefined) {
      res.status(400).json({ message: 'Dados de entrada inválidos' });
      return;
    }

    const anyReq = req as any;

    if (anyReq.user?.id !== id && anyReq.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body ?? {}, 'status') &&
      anyReq.user?.role !== 'ADMIN'
    ) {
      res.status(403).json({ message: 'Alteração de status não permitida neste endpoint' });
      return;
    }

    await handleUpdateProfile(req, res, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';

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

// Get user by id
UsuarioRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);

    if (id === undefined) {
      res.status(400).json({ message: 'Dados de entrada inválidos' });
      return;
    }

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
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json({ message: 'OK', user });
  } catch (error) {
    console.error('Erro ao buscar usuário', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

// Delete user
UsuarioRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);

    if (id === undefined) {
      res.status(400).json({ message: 'Dados de entrada inválidos' });
      return;
    }

    const anyReq = req as any;

    if (anyReq.user?.id !== id && anyReq.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }

    try {
      await prisma.usuario.delete({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      if (err && err.code === 'P2025') {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      if (err && err.code === 'P2003') {
        res.status(409).json({ message: 'Não é possível deletar usuário devido a dependências externas' });
        return;
      }

      console.error('Erro ao deletar usuário', err);
      res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
  } catch (error) {
    console.error('Erro na rota de excluir usuário', error);
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
});

export default UsuarioRouter;