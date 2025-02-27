import { Router } from 'express';
import { wrapAsync, AssistantParams } from '../types/route-handlers';
import { assistantSchema, GetAssistantsQuery, AssistantInput } from '../schemas/assistant.schema';
import { PrismaClient, Prisma } from '@prisma/client';
import { ParamsDictionary } from 'express-serve-static-core';

const prisma = new PrismaClient();
const router = Router();

// Get all assistants
router.get('/', wrapAsync<ParamsDictionary, any, any, GetAssistantsQuery>(async (req, res) => {
  const search = req.query.search;
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const skip = (page - 1) * limit;

  const where: Prisma.AssistantWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search } },
        { systemPrompt: { contains: search } }
      ]
    })
  };

  const [items, total] = await Promise.all([
    prisma.assistant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.assistant.count({ where })
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get single assistant
router.get('/:id', wrapAsync<AssistantParams>(async (req, res) => {
  const assistant = await prisma.assistant.findFirst({
    where: {
      id: req.params.id,
    }
  });

  if (!assistant) {
    return res.status(404).json({ message: 'Assistant not found' });
  }

  res.status(200).json(assistant);
}));

// Create assistant
router.post('/', wrapAsync<ParamsDictionary, any, AssistantInput>(async (req, res) => {
  const data = assistantSchema.parse(req.body);
  if (!req.user) {
    throw new Error('User is not authenticated');
  }
  const userId = req.user.id;

  const assistant = await prisma.assistant.create({
    data: {
      ...data,
      isActive: true,
      user: { connect: { id: userId } },
      voice: data.voice || Prisma.JsonNull,
    }
  });

  res.status(201).json(assistant);
}));

// Update assistant
router.put('/:id', wrapAsync<AssistantParams, any, AssistantInput>(async (req, res) => {
  const data = assistantSchema.parse(req.body);

  const assistant = await prisma.assistant.findFirst({
    where: {
      id: req.params.id,
    }
  });

  if (!assistant) {
    return res.status(404).json({ message: 'Assistant not found' });
  }

  const updated = await prisma.assistant.update({
    where: { id: req.params.id },
    data: {
      ...data,
      voice: data.voice || Prisma.JsonNull,
    }
  });

  res.status(200).json(updated);
}));

// Delete assistant
router.delete('/:id', wrapAsync<AssistantParams>(async (req, res) => {
  const assistant = await prisma.assistant.findFirst({
    where: {
      id: req.params.id,
    }
  });

  if (!assistant) {
    return res.status(404).json({ message: 'Assistant not found' });
  }

  await prisma.assistant.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({ message: 'Assistant deleted successfully' });
}));

export default router;