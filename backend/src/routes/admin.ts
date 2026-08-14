import { Router } from 'express';

import { adminController } from '../controllers/adminController';

const AdminRouter = Router();

AdminRouter.get('/users', adminController.listUsers);
AdminRouter.post('/users/:id/ban', adminController.banUser);
AdminRouter.post('/users/:id/unban', adminController.unbanUser);
AdminRouter.post('/users/:id/promote', adminController.promoteUser);

export default AdminRouter;