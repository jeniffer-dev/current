import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  numeric,
  boolean,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// PROFILES
// ============================================================

export const profiles = pgTable('profiles', {
  id:         uuid('id').primaryKey(),
  fullName:   text('full_name'),
  avatarUrl:  text('avatar_url'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// MACROCYCLES
// ============================================================

export const macrocycles = pgTable('macrocycles', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  goalEvent:  text('goal_event'),
  startDate:  date('start_date').notNull(),
  endDate:    date('end_date').notNull(),
  notes:      text('notes'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// PHASES
// ============================================================

export const phases = pgTable('phases', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  macrocycleId:   uuid('macrocycle_id').notNull().references(() => macrocycles.id, { onDelete: 'cascade' }),
  name:           text('name').notNull(),
  phaseType:      text('phase_type').notNull(),
  startDate:      date('start_date').notNull(),
  endDate:        date('end_date').notNull(),
  volume:         text('volume'),
  intensity:      text('intensity'),
  notes:          text('notes'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TRAINING DAYS
// ============================================================

export const trainingDays = pgTable('training_days', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  macrocycleId:     uuid('macrocycle_id').notNull().references(() => macrocycles.id, { onDelete: 'cascade' }),
  phaseId:          uuid('phase_id').references(() => phases.id, { onDelete: 'set null' }),
  date:             date('date').notNull(),
  sessionType:      text('session_type'),
  status:           text('status').notNull().default('planned'),
  readinessScore:   numeric('readiness_score'),
  reflection:       text('reflection'),
  notes:            text('notes'),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('training_days_unique_user_date').on(t.userId, t.date),
]);

// ============================================================
// EXERCISES
// ============================================================

export const exercises = pgTable('exercises', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  userId:               uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name:                 text('name').notNull(),
  movementPattern:      text('movement_pattern'),
  category:             text('category'),
  mainMuscle:           text('main_muscle'),
  bilateralUnilateral:  text('bilateral_unilateral'),
  trackLoad:            boolean('track_load').notNull().default(true),
  isLoggable:           boolean('is_loggable').notNull().default(false),
  notes:                text('notes'),
  createdAt:            timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('exercises_unique_name_per_user').on(t.userId, t.name),
]);

// ============================================================
// GYM SESSION TEMPLATES
// ============================================================

export const gymSessionTemplates = pgTable('gym_session_templates', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  focus:      text('focus'),
  phaseType:  text('phase_type'),
  notes:      text('notes'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('gym_session_templates_unique_name_per_user').on(t.userId, t.name),
]);

// ============================================================
// GYM SESSION EXERCISES
// ============================================================

export const gymSessionExercises = pgTable('gym_session_exercises', {
  id:                     uuid('id').primaryKey().defaultRandom(),
  userId:                 uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  gymSessionTemplateId:   uuid('gym_session_template_id').notNull().references(() => gymSessionTemplates.id, { onDelete: 'cascade' }),
  exerciseId:             uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
  orderIndex:             integer('order_index').notNull().default(0),
  sets:                   integer('sets'),
  reps:                   text('reps'),
  tempo:                  text('tempo'),
  rpe:                    text('rpe'),
  intensityType:          text('intensity_type').notNull().default('none'),
  intensityValue:         numeric('intensity_value'),
  notes:                  text('notes'),
  createdAt:              timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:              timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// SWIM SESSION TEMPLATES
// ============================================================

export const swimSessionTemplates = pgTable('swim_session_templates', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name:            text('name').notNull(),
  swimType:        text('swim_type').notNull(),
  distanceMeters:  integer('distance_meters'),
  focus:           text('focus'),
  notes:           text('notes'),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('swim_session_templates_unique_name_per_user').on(t.userId, t.name),
]);

// ============================================================
// TRAINING DAY SESSIONS
// ============================================================

export const trainingDaySessions = pgTable('training_day_sessions', {
  id:             uuid('id').primaryKey().defaultRandom(),
  trainingDayId:  uuid('training_day_id').notNull().references(() => trainingDays.id, { onDelete: 'cascade' }),
  userId:         uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  sessionType:    text('session_type').notNull(),
  sessionName:    text('session_name').notNull(),
  templateId:     uuid('template_id'),
  status:         text('status').notNull().default('planned'),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
  notes:          text('notes'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// STRENGTH LOGS
// ============================================================

export const strengthLogs = pgTable('strength_logs', {
  id:                     uuid('id').primaryKey().defaultRandom(),
  userId:                 uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  trainingDayId:          uuid('training_day_id').notNull().references(() => trainingDays.id, { onDelete: 'cascade' }),
  exerciseId:             uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
  gymSessionExerciseId:   uuid('gym_session_exercise_id').references(() => gymSessionExercises.id, { onDelete: 'set null' }),
  setNumber:              integer('set_number'),
  prescribedWeightKg:     numeric('prescribed_weight_kg'),
  actualWeightKg:         numeric('actual_weight_kg'),
  reps:                   integer('reps'),
  rpe:                    numeric('rpe'),
  status:                 text('status').notNull().default('completed'),
  notes:                  text('notes'),
  createdAt:              timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:              timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TEST TEMPLATES
// ============================================================

export const testTemplates = pgTable('test_templates', {
  id:                     uuid('id').primaryKey().defaultRandom(),
  userId:                 uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name:                   text('name').notNull(),
  category:               text('category').notNull(),
  metricType:             text('metric_type').notNull(),
  unit:                   text('unit').notNull(),
  protocol:               text('protocol'),
  linkedExerciseId:       uuid('linked_exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
  calculatesEstimated1rm: boolean('calculates_estimated_1rm').notNull().default(false),
  notes:                  text('notes'),
  createdAt:              timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:              timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('test_templates_unique_name_per_user').on(t.userId, t.name),
]);

// ============================================================
// TESTING BLOCKS  (created in migration 003)
// ============================================================

export const testingBlocks = pgTable('testing_blocks', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  macrocycleId:   uuid('macrocycle_id').notNull().references(() => macrocycles.id, { onDelete: 'cascade' }),
  weekNumber:     integer('week_number').notNull(),
  scheduledDate:  date('scheduled_date'),
  status:         text('status').notNull().default('pending'),
  purpose:        text('purpose'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('testing_blocks_unique_per_week').on(t.userId, t.macrocycleId, t.weekNumber),
]);

// ============================================================
// TESTING SESSIONS  (created in migration 004)
// ============================================================

export const testingSessions = pgTable('testing_sessions', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  testingBlockId:  uuid('testing_block_id').notNull().references(() => testingBlocks.id, { onDelete: 'cascade' }),
  date:            date('date').notNull(),
  sessionType:     text('session_type').notNull(),
  sessionLabel:    text('session_label'),
  status:          text('status').notNull().default('planned'),
  notes:           text('notes'),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('testing_sessions_unique_label_per_block').on(t.testingBlockId, t.sessionLabel),
]);

// ============================================================
// TEST RESULTS
// ============================================================

export const testResults = pgTable('test_results', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  testTemplateId:   uuid('test_template_id').notNull().references(() => testTemplates.id, { onDelete: 'cascade' }),
  trainingDayId:    uuid('training_day_id').references(() => trainingDays.id, { onDelete: 'set null' }),
  phaseId:          uuid('phase_id').references(() => phases.id, { onDelete: 'set null' }),
  macrocycleId:     uuid('macrocycle_id').references(() => macrocycles.id, { onDelete: 'set null' }),
  testingBlockId:   uuid('testing_block_id').references(() => testingBlocks.id, { onDelete: 'set null' }),
  testingSessionId: uuid('testing_session_id').references(() => testingSessions.id, { onDelete: 'set null' }),
  resultValue:      numeric('result_value').notNull(),
  estimated1rmKg:   numeric('estimated_1rm_kg'),
  notes:            text('notes'),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// LESSONS LEARNED
// ============================================================

export const lessonsLearned = pgTable('lessons_learned', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  macrocycleId:   uuid('macrocycle_id').notNull().references(() => macrocycles.id, { onDelete: 'cascade' }),
  phaseId:        uuid('phase_id').references(() => phases.id, { onDelete: 'set null' }),
  trainingDayId:  uuid('training_day_id').references(() => trainingDays.id, { onDelete: 'set null' }),
  title:          text('title').notNull(),
  body:           text('body'),
  lessonType:     text('lesson_type'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================

export const profilesRelations = relations(profiles, ({ many }) => ({
  macrocycles:           many(macrocycles),
  phases:                many(phases),
  trainingDays:          many(trainingDays),
  trainingDaySessions:   many(trainingDaySessions),
  exercises:             many(exercises),
  gymSessionTemplates:   many(gymSessionTemplates),
  gymSessionExercises:   many(gymSessionExercises),
  swimSessionTemplates:  many(swimSessionTemplates),
  strengthLogs:          many(strengthLogs),
  testTemplates:         many(testTemplates),
  testingBlocks:         many(testingBlocks),
  testingSessions:       many(testingSessions),
  testResults:           many(testResults),
  lessonsLearned:        many(lessonsLearned),
}));

export const macrocyclesRelations = relations(macrocycles, ({ one, many }) => ({
  user:           one(profiles, { fields: [macrocycles.userId], references: [profiles.id] }),
  phases:         many(phases),
  trainingDays:   many(trainingDays),
  testingBlocks:  many(testingBlocks),
  testResults:    many(testResults),
  lessonsLearned: many(lessonsLearned),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  user:          one(profiles, { fields: [phases.userId], references: [profiles.id] }),
  macrocycle:    one(macrocycles, { fields: [phases.macrocycleId], references: [macrocycles.id] }),
  trainingDays:  many(trainingDays),
  testResults:   many(testResults),
  lessonsLearned: many(lessonsLearned),
}));

export const trainingDaysRelations = relations(trainingDays, ({ one, many }) => ({
  user:                 one(profiles, { fields: [trainingDays.userId], references: [profiles.id] }),
  macrocycle:           one(macrocycles, { fields: [trainingDays.macrocycleId], references: [macrocycles.id] }),
  phase:                one(phases, { fields: [trainingDays.phaseId], references: [phases.id] }),
  trainingDaySessions:  many(trainingDaySessions),
  strengthLogs:         many(strengthLogs),
  testResults:          many(testResults),
  lessonsLearned:       many(lessonsLearned),
}));

export const trainingDaySessionsRelations = relations(trainingDaySessions, ({ one }) => ({
  user:        one(profiles,     { fields: [trainingDaySessions.userId],        references: [profiles.id] }),
  trainingDay: one(trainingDays, { fields: [trainingDaySessions.trainingDayId], references: [trainingDays.id] }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user:                 one(profiles, { fields: [exercises.userId], references: [profiles.id] }),
  gymSessionExercises:  many(gymSessionExercises),
  strengthLogs:         many(strengthLogs),
}));

export const gymSessionTemplatesRelations = relations(gymSessionTemplates, ({ one, many }) => ({
  user:                 one(profiles, { fields: [gymSessionTemplates.userId], references: [profiles.id] }),
  gymSessionExercises:  many(gymSessionExercises),
}));

export const gymSessionExercisesRelations = relations(gymSessionExercises, ({ one, many }) => ({
  user:               one(profiles, { fields: [gymSessionExercises.userId], references: [profiles.id] }),
  gymSessionTemplate: one(gymSessionTemplates, { fields: [gymSessionExercises.gymSessionTemplateId], references: [gymSessionTemplates.id] }),
  exercise:           one(exercises, { fields: [gymSessionExercises.exerciseId], references: [exercises.id] }),
  strengthLogs:       many(strengthLogs),
}));

export const swimSessionTemplatesRelations = relations(swimSessionTemplates, ({ one }) => ({
  user: one(profiles, { fields: [swimSessionTemplates.userId], references: [profiles.id] }),
}));

export const strengthLogsRelations = relations(strengthLogs, ({ one }) => ({
  user:               one(profiles, { fields: [strengthLogs.userId], references: [profiles.id] }),
  trainingDay:        one(trainingDays, { fields: [strengthLogs.trainingDayId], references: [trainingDays.id] }),
  exercise:           one(exercises, { fields: [strengthLogs.exerciseId], references: [exercises.id] }),
  gymSessionExercise: one(gymSessionExercises, { fields: [strengthLogs.gymSessionExerciseId], references: [gymSessionExercises.id] }),
}));

export const testTemplatesRelations = relations(testTemplates, ({ one, many }) => ({
  user:           one(profiles, { fields: [testTemplates.userId], references: [profiles.id] }),
  linkedExercise: one(exercises, { fields: [testTemplates.linkedExerciseId], references: [exercises.id] }),
  testResults:    many(testResults),
}));

export const testingBlocksRelations = relations(testingBlocks, ({ one, many }) => ({
  user:            one(profiles,   { fields: [testingBlocks.userId],       references: [profiles.id] }),
  macrocycle:      one(macrocycles, { fields: [testingBlocks.macrocycleId], references: [macrocycles.id] }),
  testingSessions: many(testingSessions),
  testResults:     many(testResults),
}));

export const testingSessionsRelations = relations(testingSessions, ({ one, many }) => ({
  user:         one(profiles,      { fields: [testingSessions.userId],         references: [profiles.id] }),
  testingBlock: one(testingBlocks, { fields: [testingSessions.testingBlockId], references: [testingBlocks.id] }),
  testResults:  many(testResults),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  user:           one(profiles,       { fields: [testResults.userId],           references: [profiles.id] }),
  testTemplate:   one(testTemplates,  { fields: [testResults.testTemplateId],   references: [testTemplates.id] }),
  trainingDay:    one(trainingDays,   { fields: [testResults.trainingDayId],    references: [trainingDays.id] }),
  phase:          one(phases,         { fields: [testResults.phaseId],          references: [phases.id] }),
  macrocycle:     one(macrocycles,    { fields: [testResults.macrocycleId],     references: [macrocycles.id] }),
  testingBlock:   one(testingBlocks,  { fields: [testResults.testingBlockId],   references: [testingBlocks.id] }),
  testingSession: one(testingSessions,{ fields: [testResults.testingSessionId], references: [testingSessions.id] }),
}));

export const lessonsLearnedRelations = relations(lessonsLearned, ({ one }) => ({
  user:        one(profiles, { fields: [lessonsLearned.userId], references: [profiles.id] }),
  macrocycle:  one(macrocycles, { fields: [lessonsLearned.macrocycleId], references: [macrocycles.id] }),
  phase:       one(phases, { fields: [lessonsLearned.phaseId], references: [phases.id] }),
  trainingDay: one(trainingDays, { fields: [lessonsLearned.trainingDayId], references: [trainingDays.id] }),
}));
