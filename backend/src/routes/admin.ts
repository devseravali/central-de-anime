import { Router } from 'express';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminController } from '../controllers/adminController';

const AdminRouter = Router();

AdminRouter.get('/users', 
    authMiddleware, 
    adminMiddleware, 
    adminController.listUsers);

AdminRouter.post('/users/:id/ban', 
    authMiddleware, 
    adminMiddleware, 
    adminController.banUser);
    
AdminRouter.post('/users/:id/unban', 
    authMiddleware, 
    adminMiddleware, 
    adminController.unbanUser);

AdminRouter.post('/users/:id/promote', 
    authMiddleware, 
    adminMiddleware, 
    adminController.promoteUser);

export default AdminRouter;