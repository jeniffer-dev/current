// Server-side input validation. Every server action should parse its
// input through one of these schemas before touching Supabase — RLS
// protects *ownership*, this protects *shape*.
import { z } from 'zod';
import { activities, type ActivityKey } from '@/lib/session-catalog';

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

// Derived from the catalog rather than re-typed, so an activity added
// there cannot be silently rejected here.
const activityKeys = activities.map(a => a.key) as [ActivityKey, ...ActivityKey[]];
const activityKey  = z.enum(activityKeys);

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
    // The phase's typical week.
    sessions: z.array(z.object({
      key:             activityKey,
      label:           z.string().trim().max(120).nullable(),
      sessionsPerWeek: z.number().int().min(1).max(14),
    })).max(activityKeys.length),
    // Only the weeks that step away from the typical one.
    weekOverrides: z.array(z.object({
      weekIndex: z.number().int().min(0).max(51),
      counts:    z.array(z.object({
        key:           activityKey,
        sessionsCount: z.number().int().min(0).max(14),
      })).max(activityKeys.length),
    })).max(52),
  })).min(1, 'A macrocycle needs at least one phase.').max(40),
  // Testing is optional: a plan with no batteries is a valid plan.
  batteries: z.array(z.object({
    name:        z.string().trim().min(1).max(120),
    kind:        z.enum(['in_water', 'strength', 'mixed']),
    templateIds: z.array(uuid).min(1).max(40),
    anchors: z.array(z.object({
      kind:       z.enum(['phase', 'date']),
      // Index into the submitted phases, since they have no ids yet.
      phaseIndex: z.number().int().min(0).max(39).nullable(),
      position:   z.enum(['start', 'end']).nullable(),
      date:       isoDate.nullable(),
    }).refine(
      a => a.kind === 'phase'
        ? a.phaseIndex !== null && a.position !== null && a.date === null
        : a.date !== null && a.phaseIndex === null && a.position === null,
      { message: 'A testing date is either anchored to a phase or set by hand, not both.' },
    )).min(1).max(60),
  })).max(20),
}).refine(
  v => v.targetDate > v.startDate,
  { message: 'The event has to come after the start date.', path: ['targetDate'] },
);

export type CreateMacrocycleInput = z.infer<typeof createMacrocycleSchema>;

/** Formats the first Zod issue as a single user-facing message. */
export function firstIssueMessage(result: z.SafeParseError<unknown>): string {
  return result.error.issues[0]?.message ?? 'Invalid input.';
}
