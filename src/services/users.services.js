import logger from '#utils/logger.js';
import db from '#config/db.js';
import { users } from '#config/db.schema.js';

export const getUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

export const getUser = async id => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where({ id });
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    return await db.update(userData).from(users).where({ id });
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    return await db.delete().from(users).where({ id });
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
};
