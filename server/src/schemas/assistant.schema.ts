import { z } from 'zod';

export const voiceSettingsSchema = z.object({
  speed: z.number(),
  pitch: z.number(),
  stability: z.number(),
  volume: z.number(),
});

export const voiceSchema = z.object({
  provider: z.string(),
  settings: voiceSettingsSchema,
  voiceId: z.string(),
});

export const assistantSchema = z.object({
  name: z.string(),
  systemPrompt: z.string(),
  firstMessage: z.string(),
  provider: z.string(),
  model: z.string(),
  tools: z.array(z.any()),
  modes: z.array(z.string()),
  voice: voiceSchema.optional(),
});

export interface GetAssistantsQuery {
  search?: string;
  page?: string;
  limit?: string;
}

export type AssistantInput = z.infer<typeof assistantSchema>;
