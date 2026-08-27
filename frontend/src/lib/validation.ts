// Server-side input validation. Every server action should parse its
// input through one of these schemas before touching Supabase — RLS
// protects *ownership*, this protects *shape*.
import { z } from 'zod';

const email = z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.');

// Login only checks that a password was typed — the strength requirement
// below applies to *new* passwords, not to accounts created before it
// existed. Supabase itself is the source of truth on whether it's correct.
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
});

export const signupSchema = z.object({
  email,
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  fullName: z.string().trim().min(1, 'Full name is required.').max(120),
});

const uuid = z.string().uuid();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date.');

export const planSessionSchema = z.object({
  sessionName:  z.string().trim().min(1).max(120),
  date:         isoDate,
  macrocycleId: uuid,
  phaseId:      uuid.nullable(),
  sessionType:  z.enum(['gym', 'swim', 'conditioning', 'other', 'recovery', 'test']),
  templateId:   uuid.nullable(),
  weekDates:    z.array(isoDate).min(1),
});

export const unscheduleSessionSchema = z.object({
  sessionId:     uuid,
  trainingDayId: uuid,
});

export const exerciseLogSchema = z.object({
  sessionId:     uuid,
  exerciseId:    uuid,
  weight:        z.number().min(0).max(500).nullable(),
  reps:          z.number().int().min(0).max(100).nullable(),
  trainingDayId: uuid,
  existingLogId: uuid.optional(),
});

export const sessionNotesSchema = z.object({
  sessionId:     uuid,
  notes:         z.string().max(2000),
  trainingDayId: uuid,
});

export const sessionStatusSchema = z.object({
  sessionId:     uuid,
  status:        z.enum(['planned', 'completed', 'skipped']),
  trainingDayId: uuid,
});

export const createMacrocycleSchema = z.object({
  name:       z.string().trim().min(1, 'Give your plan a name.').max(120),
  goalEvent:  z.string().trim().max(160).nullable(),
  startDate:  isoDate,
  targetDate: isoDate,
  phases: z.array(z.object({
    type:        z.enum(['adaptation', 'accumulation', 'transmutation', 'realization', 'competition', 'reset', 'custom']),
    name:        z.string().trim().min(1, 'Every phase needs a name.').max(120),
    description: z.string().trim().max(2000).nullable(),
    weeks:       z.number().int().min(1).max(52),
  })).min(1, 'A macrocycle needs at least one phase.').max(40),
}).refine(
  v => v.targetDate > v.startDate,
  { message: 'The event has to come after the start date.', path: ['targetDate'] },
);

export type CreateMacrocycleInput = z.infer<typeof createMacrocycleSchema>;

/** Formats the first Zod issue as a single user-facing message. */
export function firstIssueMessage(result: z.SafeParseError<unknown>): string {
  return result.error.issues[0]?.message ?? 'Invalid input.';
}
