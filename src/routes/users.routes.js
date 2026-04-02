import express from 'express';
import {
  fetchUsers,
  fetchUser,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';

const router = express.Router();

// Example route: GET /users
router.get('/', fetchUsers);
router.get('/:id', fetchUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
