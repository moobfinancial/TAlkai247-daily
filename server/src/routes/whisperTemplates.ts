import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { wrapAsync } from '../types/route-handlers';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { ParamsDictionary } from 'express-serve-static-core';

const prisma = new PrismaClient();
const router = Router();

interface TemplateParams extends ParamsDictionary {
  id: string;
}

interface GetTemplatesQuery {
  search?: string;
  page?: string;
  limit?: string;
}

const templateSchema = z.object({
  name: z.string(),
  type: z.enum(['PERSONAL', 'BUSINESS']),
  systemPrompt: z.string(),
  editablePrompt: z.string(),
  tags: z.array(z.string()),
  isSystem: z.boolean(),
  isHidden: z.boolean()
});

// Get all templates
router.get('/', authenticate, wrapAsync<ParamsDictionary, any, any, GetTemplatesQuery>(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const skip = (page - 1) * limit;

  const where: Prisma.WhisperTemplateWhereInput = {
    userId: req.user?.id,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { systemPrompt: { contains: search } }
      ]
    })
  };

  const [items, total] = await Promise.all([
    prisma.whisperTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.whisperTemplate.count({ where })
  ]);

  res.status(200).json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));

// Get single template
router.get('/:id', authenticate, wrapAsync<TemplateParams>(async (req, res) => {
  const template = await prisma.whisperTemplate.findFirst({
    where: {
      id: req.params.id,
      userId: req.user?.id
    }
  });

  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  res.status(200).json(template);
}));

// Create template
router.post('/', authenticate, wrapAsync<ParamsDictionary, any, z.infer<typeof templateSchema>>(async (req, res) => {
  const data = templateSchema.parse(req.body);

  const template = await prisma.whisperTemplate.create({
    data: {
      ...data,
      user: { connect: { id: req.user?.id } }
    }
  });

  res.status(201).json(template);
}));

// Update template
router.put('/:id', authenticate, wrapAsync<TemplateParams, any, z.infer<typeof templateSchema>>(async (req, res) => {
  const data = templateSchema.parse(req.body);

  const template = await prisma.whisperTemplate.findFirst({
    where: {
      id: req.params.id,
      userId: req.user?.id
    }
  });

  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  const updated = await prisma.whisperTemplate.update({
    where: { id: req.params.id },
    data
  });

  res.status(200).json(updated);
}));

// Delete template
router.delete('/:id', authenticate, wrapAsync<TemplateParams>(async (req, res) => {
  const template = await prisma.whisperTemplate.findFirst({
    where: {
      id: req.params.id,
      userId: req.user?.id
    }
  });

  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  await prisma.whisperTemplate.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({ message: 'Template deleted successfully' });
}));

export default router;
