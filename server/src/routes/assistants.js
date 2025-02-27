import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all assistants
router.get('/', authenticate, async (req, res) => {
  try {
    const assistants = await prisma.assistant.findMany({
      where: {
        userId: req.user?.id // Use the authenticated user's ID
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: assistants
    });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch assistants'
      }
    });
  }
});

// Get single assistant
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assistant = await prisma.assistant.findUnique({
      where: {
        id: req.params.id,
        userId: req.user?.id
      }
    });

    if (!assistant) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assistant not found'
        }
      });
    }

    res.json({
      success: true,
      data: assistant
    });
  } catch (error) {
    console.error('Error fetching assistant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch assistant'
      }
    });
  }
});

// Create assistant
router.post('/', authenticate, async (req, res) => {
  try {
    const assistant = await prisma.assistant.create({
      data: {
        ...req.body,
        userId: req.user?.id,
        tools: req.body.tools || {},
        voice: req.body.voice || {},
        modes: req.body.modes || []
      }
    });

    res.status(201).json({
      success: true,
      data: assistant
    });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create assistant'
      }
    });
  }
});

// Update assistant
router.put('/:id', authenticate, async (req, res) => {
  try {
    const assistant = await prisma.assistant.update({
      where: {
        id: req.params.id,
        userId: req.user?.id
      },
      data: {
        ...req.body,
        tools: req.body.tools || {},
        voice: req.body.voice || {},
        modes: req.body.modes || []
      }
    });

    res.json({
      success: true,
      data: assistant
    });
  } catch (error) {
    console.error('Error updating assistant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update assistant'
      }
    });
  }
});

// Delete assistant
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.assistant.delete({
      where: {
        id: req.params.id,
        userId: req.user?.id
      }
    });

    res.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete assistant'
      }
    });
  }
});

export default router;
