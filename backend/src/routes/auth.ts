import { Router } from 'express';
import { authController } from '../controllers/authController';

const AuthRouter = Router();

AuthRouter.post('/register', authController.register);
AuthRouter.post('/login', authController.login);
AuthRouter.post('/refresh', authController.refresh);
AuthRouter.post('/logout', authController.logout);

export default AuthRouter;
