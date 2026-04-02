import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '#config/db.js';
import { users } from '#models/user.model.js';

const safeFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const getUsers = async () => {
  return await db.select(safeFields).from(users);
};

export const getUser = async id => {
  const [user] = await db
    .select(safeFields)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
};

export const updateUser = async (id, data) => {
  if (data.email) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing && existing.id !== id) {
      throw new Error('Email already in use');
    }
  }

  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning(safeFields);

  return updated ?? null;
};

export const changePassword = async (id, currentPassword, newPassword) => {
  const [user] = await db
    .select({ id: users.id, password: users.password })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) return null;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 10);
  await db
    .update(users)
    .set({ password: hashed, updatedAt: new Date() })
    .where(eq(users.id, id));

  logger.info(`Password changed for user ${id}`);
  return true;
};

export const deleteUser = async id => {
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  return deleted ?? null;
};
