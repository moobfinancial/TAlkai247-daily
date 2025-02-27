import { Prisma } from '@prisma/client';

export type AssistantMode = 'web' | 'voice';

export interface AssistantWhereInput extends Prisma.AssistantWhereInput {
  userId?: string;
  modes?: AssistantMode[];
}

export interface WhisperTemplateWhereInput extends Prisma.WhisperTemplateWhereInput {
  tags?: Prisma.StringNullableListFilter;
  userId?: string;
}

export interface CampaignWhereInput extends Prisma.CampaignWhereInput {
  userId?: string;
}

export interface ContactWhereInput extends Prisma.ContactWhereInput {
  userId?: string;
}

export interface UserWhereInput extends Prisma.UserWhereInput {
  id?: string;
}

// Add Prisma model types
export type Assistant = Prisma.Assistant;
export type Campaign = Prisma.Campaign;
export type Contact = Prisma.Contact;
export type User = Prisma.User;
export type WhisperTemplate = Prisma.WhisperTemplate;
