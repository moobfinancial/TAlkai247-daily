import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { openRouter } from '../lib/llm/openrouter';
import { validateAssistant } from '../lib/validation';

const router = Router();

// Get all assistants
router.get('/', authenticate, async (req, res) => {
  try {
    const assistants = await prisma.assistant.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        items: assistants,
        total: assistants.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ASSISTANTS_ERROR',
        message: 'Failed to fetch assistants',
      },
    });
  }
});

// Get available LLM models
router.get('/models', authenticate, async (req, res) => {
  try {
    const models = await openRouter.getModels();
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_MODELS_ERROR',
        message: 'Failed to fetch available models',
      },
    });
  }
});

// Create assistant
router.post('/', authenticate, async (req, res) => {
  try {
    const validation = validateAssistant(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid assistant data',
          details: validation.error.issues,
        },
      });
    }

    const assistant = await prisma.assistant.create({
      data: {
        ...validation.data,
        userId: req.user.id,
      },
    });

    res.status(201).json({ success: true, data: assistant });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ASSISTANT_ERROR',
        message: 'Failed to create assistant',
      },
    });
  }
});

// Delete assistant
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const assistant = await prisma.assistant.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!assistant) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSISTANT_NOT_FOUND',
          message: 'Assistant not found',
        },
      });
    }

    await prisma.assistant.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ASSISTANT_ERROR',
        message: 'Failed to delete assistant',
      },
    });
  }
});

// Test assistant
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const assistant = await prisma.assistant.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!assistant) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ASSISTANT_NOT_FOUND',
          message: 'Assistant not found',
        },
      });
    }

    const response = await openRouter.chat({
      model: assistant.model,
      messages: [
        { role: 'system', content: assistant.systemPrompt },
        { role: 'user', content: message },
      ],
    });

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_ASSISTANT_ERROR',
        message: 'Failed to test assistant',
      },
    });
  }
});

export default router;