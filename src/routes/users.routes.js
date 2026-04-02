import express from 'express';
import {
  fetchUsers,
  fetchUser,
  updateUserHandler,
  changePasswordHandler,
  deleteUserHandler,
} from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', fetchUsers);
router.get('/:id', fetchUser);
router.patch('/:id', updateUserHandler);
router.patch('/:id/password', changePasswordHandler);
router.delete('/:id', requireRole('admin'), deleteUserHandler);

export default router;
