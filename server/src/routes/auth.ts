import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { hashPassword, comparePasswords } from '../lib/auth';
import { validateLoginInput, validateRegisterInput } from '../lib/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validation.error.issues,
        },
      });
    }

    const { email, password, name } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        settings: {
          defaultTransparencyLevel: 'FULL',
          recordingEnabled: true,
          webSearchEnabled: false,
          preferredVoice: 'male',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validation.error.issues,
        },
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !await comparePasswords(password, user.password)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        user,
        token: req.token,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;