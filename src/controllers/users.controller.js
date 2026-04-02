import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import {
  userParamsSchema,
  updateUserSchema,
  changePasswordSchema,
} from '#validations/user.validation.js';
import { getUsers, getUser, updateUser, deleteUser, changePassword } from '#services/users.services.js';

export const fetchUsers = async (req, res, next) => {
  try {
    logger.info('Fetching users...');
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

export const fetchUser = async (req, res, next) => {
  try {
    const params = userParamsSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(params.error),
      });
    }

    const user = await getUser(params.data.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

export const updateUserHandler = async (req, res, next) => {
  try {
    const params = userParamsSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(params.error),
      });
    }

    const body = updateUserSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(body.error),
      });
    }

    const user = await updateUser(params.data.id, body.data);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    logger.error('Error updating user:', error);

    if (error.message === 'Email already in use') {
      return res.status(409).json({ error: error.message });
    }

    next(error);
  }
};

export const changePasswordHandler = async (req, res, next) => {
  try {
    const params = userParamsSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(params.error),
      });
    }

    const body = changePasswordSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(body.error),
      });
    }

    const { currentPassword, newPassword } = body.data;
    const result = await changePassword(params.data.id, currentPassword, newPassword);
    if (!result) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Error changing password:', error);

    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({ error: error.message });
    }

    next(error);
  }
};

export const deleteUserHandler = async (req, res, next) => {
  try {
    const params = userParamsSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(params.error),
      });
    }

    const deleted = await deleteUser(params.data.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};
