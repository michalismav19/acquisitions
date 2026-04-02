import logger from '#config/logger.js';
import { getUsers, getUser } from '#services/users.services.js';

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
    logger.info('Fetching user...');
    const users = await getUser(req.id);
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    logger.info('Updating user...');
    const users = await getUser(req.id);
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    logger.info('Deleting user...');
    const users = await getUser(req.id);
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};
