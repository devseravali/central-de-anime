import { Router } from 'express';
import { usuariosServico } from '../../services/usuariosServico';
import {
  registrarUsuario,
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  removerUsuario,
  enviarVerificacaoEmail,
  verificarEmail,
  logoutUsuario,
  loginUsuario,
  solicitarRecuperacaoSenha,
  redefinirSenha,
} from '../../controllers/usuariosControlador';
import { autenticacaoJWT } from '../../middleware/autenticacaoJWT';
import { avatarRouter } from './avatarRouter';

export const usuariosRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: Cadastro, autenticação e gerenciamento de usuários
 *
 * /usuarios/recuperar-senha:
 *   post:
 *     tags: [Usuários]
 *     summary: Solicita recuperação de senha por e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: E-mail de recuperação enviado
 *
 * /usuarios/redefinir-senha:
 *   put:
 *     tags: [Usuários]
 *     summary: Redefine a senha usando token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               novaSenha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 * /usuarios/register:
 *   post:
 *     tags: [Usuários]
 *     summary: Registra um novo usuário
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
 *         description: Usuário registrado
 *
 * /usuarios/login:
 *   post:
 *     tags: [Usuários]
 *     summary: Realiza login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado
 *       401:
 *         description: Credenciais inválidas
 *
 * /usuarios/{id}/enviar-verificacao:
 *   post:
 *     tags: [Usuários]
 *     summary: Envia e-mail de verificação para o usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: E-mail de verificação enviado
 *
 * /usuarios/verificar-email:
 *   put:
 *     tags: [Usuários]
 *     summary: Verifica e-mail do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: E-mail verificado
 *
 * /usuarios/logout:
 *   post:
 *     tags: [Usuários]
 *     summary: Encerra sessão do usuário autenticado
 *     responses:
 *       200:
 *         description: Logout realizado
 *       401:
 *         description: Não autenticado
 *
 * /usuarios/me:
 *   get:
 *     tags: [Usuários]
 *     summary: Lista usuários
 *     responses:
 *       200:
 *         description: Lista retornada
 *
 *   put:
 *     tags: [Usuários]
 *     summary: Atualiza usuário autenticado
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
 *         description: Usuário atualizado
 *       401:
 *         description: Não autenticado
 *
 * /usuarios/me/{id}:
 *   get:
 *     tags: [Usuários]
 *     summary: Obtém usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *
 *   delete:
 *     tags: [Usuários]
 *     summary: Remove usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuário removido
 */

usuariosRouter.post('/register', registrarUsuario);
usuariosRouter.post('/login', loginUsuario);
usuariosRouter.post('/:id/enviar-verificacao', enviarVerificacaoEmail);
usuariosRouter.put('/verificar-email', verificarEmail);
usuariosRouter.post('/logout', autenticacaoJWT, logoutUsuario);
usuariosRouter.get('/me', async (req, res, next) => {
  try {
    const usuarioId = req.session?.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }
    const usuario =
      await require('../../services/usuariosServico').usuariosServico.buscarPorId(
        usuarioId,
      );
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json({ dados: usuario });
  } catch (err) {
    next(err);
  }
});
usuariosRouter.get('/me/:id', obterUsuario);
usuariosRouter.put('/me', autenticacaoJWT, atualizarUsuario);
usuariosRouter.delete('/me/:id', removerUsuario);
usuariosRouter.post('/recuperar-senha', solicitarRecuperacaoSenha);
usuariosRouter.put('/redefinir-senha', redefinirSenha);

// Retorna o id do usuário a partir do email
usuariosRouter.get('/id', async (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ erro: 'Email obrigatório.' });
  }
  try {
    console.log('Email recebido:', email);
    const usuario = await usuariosServico.buscarPorEmail(email);
    console.log('Usuário retornado:', usuario);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.json({ id: usuario.id });
  } catch (err) {
    console.log('Erro ao buscar usuário:', err);
    return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
  }
});

// Adiciona o endpoint de avatar diretamente em /usuarios/avatar
usuariosRouter.use('/avatar', autenticacaoJWT, avatarRouter);
