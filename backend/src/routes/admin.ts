import { Router } from 'express';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminController } from '../controllers/adminController';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { idParamSchema } from '../schemas/common/idParm.schema';

const AdminRouter = Router();

AdminRouter.get('/users', 
    authMiddleware, 
    adminMiddleware, 
    adminController.listUsers);

AdminRouter.post('/users/:id/ban', 
    authMiddleware, 
    validationMiddleware({ params: idParamSchema }),
    adminMiddleware, 
    adminController.banUser);
    
AdminRouter.post('/users/:id/unban', 
    authMiddleware, 
    validationMiddleware({ params: idParamSchema }),
    adminMiddleware, 
    adminController.unbanUser);

AdminRouter.post('/users/:id/promote', 
    authMiddleware, 
    validationMiddleware({ params: idParamSchema }),
    adminMiddleware, 
    adminController.promoteUser);

export default AdminRouter;