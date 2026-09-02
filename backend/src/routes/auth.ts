import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import {
	registerSchema,
	loginSchema,
	refreshSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	logoutSchema,
} from '../schemas/auth/auth.schemas';

const AuthRouter = Router();

AuthRouter.post('/register', validationMiddleware({ body: registerSchema }), authController.register);
AuthRouter.post('/login', validationMiddleware({ body: loginSchema }), authController.login);
AuthRouter.post('/refresh', validationMiddleware({ body: refreshSchema }), authController.refresh);
AuthRouter.post('/forgot-password', validationMiddleware({ body: forgotPasswordSchema }), authController.forgotPassword);
AuthRouter.post('/reset-password', validationMiddleware({ body: resetPasswordSchema }), authController.resetPassword);
AuthRouter.post('/logout', validationMiddleware({ body: logoutSchema }), authController.logout);

export default AuthRouter;
