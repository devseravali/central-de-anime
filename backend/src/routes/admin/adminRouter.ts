import { Router } from 'express';
import { adminService } from '../../controllers/adminControlador';
import { estatisticasRouter } from '../estatisticasRouter';

export const adminRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Operações administrativas
 *
 * /admin/health:
 *   get:
 *     tags: [Admin]
 *     summary: Verifica saúde das rotas administrativas
 *     responses:
 *       200:
 *         description: Admin API OK
 *
 * /admin/admins:
 *   get:
 *     tags: [Admin]
 *     summary: Lista administradores
 *     responses:
 *       200:
 *         description: Lista de admins
 *
 *   post:
 *     tags: [Admin]
 *     summary: Cria administrador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin criado
 *
 * /admin/admins/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Busca admin por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin encontrado
 *
 *   put:
 *     tags: [Admin]
 *     summary: Atualiza admin por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin atualizado
 *
 *   delete:
 *     tags: [Admin]
 *     summary: Remove admin por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Admin removido
 *
 * /admin/usuarios/{id}/promover-admin:
 *   post:
 *     tags: [Admin]
 *     summary: Promove usuário para administrador
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário promovido
 *
 * /admin/usuarios/{id}/suspender:
 *   post:
 *     tags: [Admin]
 *     summary: Suspende usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário suspenso
 *
 * /admin/usuarios/{id}/banir:
 *   post:
 *     tags: [Admin]
 *     summary: Bane usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário banido
 *
 * /admin/usuarios/{id}/reativar:
 *   post:
 *     tags: [Admin]
 *     summary: Reativa usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário reativado
 */

adminRouter.post('/usuarios/:id/promover-admin', async (req, res, next) => {
  try {
    const usuario = await adminService.promoverAdmin(Number(req.params.id));
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/health', (_req, res) => {
  return res.status(200).json({ sucesso: true, mensagem: 'Admin API OK' });
});

adminRouter.get('/admins', async (req, res, next) => {
  try {
    const admins = await adminService.listarAdmins();
    res.json(admins);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/admins/:id', async (req, res, next) => {
  try {
    const admin = await adminService.obterAdminPorId(Number(req.params.id));
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/admins', async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    const novoAdmin = await adminService.adicionarAdmin(nome, email, senha);
    res.status(201).json(novoAdmin);
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/admins/:id', async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    const adminAtualizado = await adminService.atualizarAdmin(
      Number(req.params.id),
      nome,
      email,
      senha,
    );
    res.json(adminAtualizado);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/admins/:id', async (req, res, next) => {
  try {
    await adminService.removerAdmin(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/usuarios/:id/suspender', async (req, res, next) => {
  try {
    const usuario = await adminService.suspenderUsuario(Number(req.params.id));
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/usuarios/:id/banir', async (req, res, next) => {
  try {
    const usuario = await adminService.banirUsuario(Number(req.params.id));
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/usuarios/:id/reativar', async (req, res, next) => {
  try {
    const usuario = await adminService.reativarUsuario(Number(req.params.id));
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

adminRouter.use('/stats', estatisticasRouter);