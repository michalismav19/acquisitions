import { signUpSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    // Auth service
    const user = await createUser({ name, email, password, role });

    logger.info(`User registered successgully: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error during user registration', { error });

    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Handle other errors
    next(error);
  }
};
