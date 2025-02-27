import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { hashPassword, comparePasswords } from '../lib/auth';
import { validateLoginInput, validateRegisterInput } from '../lib/validation';
import { UserRole } from '@prisma/client';

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email already exists',
        },
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER' as UserRole,
        settings: {
          voiceEnabled: true,
          textEnabled: true,
          imageEnabled: true,
        },
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          settings: user.settings,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Request received at ${new Date().toISOString()}`);
  
  // Emergency timeout
  const emergencyKiller = setTimeout(() => {
    console.error(`[${requestId}] EMERGENCY SHUTDOWN - Request took too long`);
    process.exit(1);
  }, 10000);

  // Event loop diagnostic
  const eventLoopStart = Date.now();
  await new Promise(resolve => setTimeout(resolve, 0));
  console.log(`[${requestId}] Event loop delay: ${Date.now() - eventLoopStart}ms`);

  try {
    console.log(`[${requestId}] Headers:`, req.headers);
    console.log(`[${requestId}] Body:`, req.body);
    
    if (!req.body) {
      console.log(`[${requestId}] No request body`);
      clearTimeout(emergencyKiller);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request body is missing'
        }
      });
    }

    console.log(`[${requestId}] Validating input`);
    const validation = validateLoginInput(req.body);
    if (!validation.success) {
      console.log(`[${requestId}] Validation failed:`, validation.error.issues);
      clearTimeout(emergencyKiller);
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
    console.log(`[${requestId}] Input validated for email:`, email);

    try {
      console.log(`[${requestId}] Finding user in database at ${new Date().toISOString()}`);
      const dbStart = Date.now();
      const user = await prisma.user.findUnique({ where: { email } });
      console.log(`[${requestId}] Database query took ${Date.now() - dbStart}ms`);
      console.log(`[${requestId}] Database query completed at ${new Date().toISOString()}. User found:`, !!user);

      if (!user) {
        console.log(`[${requestId}] User not found:`, email);
        clearTimeout(emergencyKiller);
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      console.log(`[${requestId}] Starting password comparison at ${new Date().toISOString()}`);
      const bcryptStart = Date.now();
      const isValidPassword = await comparePasswords(password, user.password);
      console.log(`[${requestId}] Password comparison took ${Date.now() - bcryptStart}ms`);
      console.log(`[${requestId}] Password comparison completed at ${new Date().toISOString()}, result:`, isValidPassword);

      if (!isValidPassword) {
        console.log(`[${requestId}] Invalid password for user:`, email);
        clearTimeout(emergencyKiller);
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      console.log(`[${requestId}] Generating token at ${new Date().toISOString()}`);
      const tokenStart = Date.now();
      const token = generateToken(user);
      console.log(`[${requestId}] Token generation took ${Date.now() - tokenStart}ms`);

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        settings: user.settings,
      };

      console.log(`[${requestId}] Sending successful response at ${new Date().toISOString()}`);
      clearTimeout(emergencyKiller);
      return res.json({
        success: true,
        data: {
          token,
          user: userData
        },
      });
    } catch (dbError) {
      console.error(`[${requestId}] Database error at ${new Date().toISOString()}:`, dbError);
      clearTimeout(emergencyKiller);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to process login request',
        },
      });
    }
  } catch (error) {
    console.error(`[${requestId}] Unexpected error at ${new Date().toISOString()}:`, error);
    clearTimeout(emergencyKiller);
    next(error);
  }
});

// Test route
router.get('/test', (_req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Auth service is working' });
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

export default router;