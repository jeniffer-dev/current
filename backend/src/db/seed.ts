import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

// ============================================================
// GUARD
// ============================================================

const SEED_USER_ID = process.env.SEED_USER_ID;

if (!SEED_USER_ID) {
  console.error('\n❌  SEED_USER_ID is not set in your .env file.');
  console.error('    Create a user in Supabase Auth, copy their UUID, and add:');
  console.error('    SEED_USER_ID=your-user-uuid\n');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('\n❌  DATABASE_URL is not set in your .env file.\n');
  process.exit(1);
}

// ============================================================
// CLIENT
// ============================================================

const connection = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(connection, { schema });

// ============================================================
// HELPERS
// ============================================================

function log(label: string, count: number) {
  console.log(`  ✓  ${label}: ${count} row(s)`);
}

// ============================================================
// SEED
// ============================================================

async function seed() {
  console.log('\n🌊  CURRENT — Running seed script...\n');

  // ----------------------------------------------------------
  // PROFILE
  // ----------------------------------------------------------

  await db
    .insert(schema.profiles)
    .values({ id: SEED_USER_ID! })
    .onConflictDoNothing();

  log('profiles', 1);

  // ----------------------------------------------------------
  // MACROCYCLE
  // ----------------------------------------------------------

  const [macrocycle] = await db
    .insert(schema.macrocycles)
    .values({
      userId:    SEED_USER_ID!,
      name:      'Road to Berlin',
      goalEvent: 'Berlin Champions Cup',
      startDate: '2026-06-09',
      endDate:   '2026-11-29',
    })
    .onConflictDoNothing()
    .returning();

  // If macrocycle already exists, fetch it
  const mc = macrocycle ?? (
    await db.query.macrocycles.findFirst({
      where: eq(schema.macrocycles.name, 'Road to Berlin'),
    })
  )!;

  log('macrocycles', 1);

  // ----------------------------------------------------------
  // PHASES
  // ----------------------------------------------------------

  const phasesData = [
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      name:         'Adaptation',
      phaseType:    'adaptation',
      startDate:    '2026-06-09',
      endDate:      '2026-07-06',
      volume:       'moderate',
      intensity:    'low-moderate',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      name:         'Accumulation',
      phaseType:    'accumulation',
      startDate:    '2026-07-07',
      endDate:      '2026-09-13',
      volume:       'high',
      intensity:    'moderate-high',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      name:         'Transmutation',
      phaseType:    'transmutation',
      startDate:    '2026-09-14',
      endDate:      '2026-10-18',
      volume:       'moderate',
      intensity:    'high',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      name:         'Realization',
      phaseType:    'realization',
      startDate:    '2026-10-19',
      endDate:      '2026-11-26',
      volume:       'low-moderate',
      intensity:    'moderate-high',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      name:         'Competition',
      phaseType:    'competition',
      startDate:    '2026-11-27',
      endDate:      '2026-11-29',
      volume:       'low',
      intensity:    'competition',
    },
  ];

  const insertedPhases = await db
    .insert(schema.phases)
    .values(phasesData)
    .onConflictDoNothing()
    .returning();

  log('phases', insertedPhases.length);

  // Resolve Adaptation phase (may already exist)
  const adaptationPhase = insertedPhases.find(p => p.phaseType === 'adaptation') ?? (
    await db.query.phases.findFirst({
      where: (p, { and }) => and(
        eq(p.macrocycleId, mc.id),
        eq(p.phaseType, 'adaptation'),
      ),
    })
  )!;

  // ----------------------------------------------------------
  // TRAINING DAYS — Week 1, Adaptation
  // ----------------------------------------------------------

  const trainingDaysData = [
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-09',
      sessionType:  'Gym ADP – Day 1 / Swim Endurance',
      status:       'planned',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-10',
      sessionType:  'Gym ADP – Day 2',
      status:       'planned',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-11',
      sessionType:  'Recovery',
      status:       'planned',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-12',
      sessionType:  'Gym ADP – Day 3 / Swim Anaerobic',
      status:       'planned',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-13',
      sessionType:  'Recovery',
      status:       'planned',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-14',
      sessionType:  'Swim Endurance / Rugby',
      status:       'planned',
    },
    {
      userId:       SEED_USER_ID!,
      macrocycleId: mc.id,
      phaseId:      adaptationPhase.id,
      date:         '2026-06-15',
      sessionType:  'Recovery',
      status:       'planned',
    },
  ];

  const insertedTrainingDays = await db
    .insert(schema.trainingDays)
    .values(trainingDaysData)
    .onConflictDoNothing()
    .returning();

  log('training_days', insertedTrainingDays.length);

  // ----------------------------------------------------------
  // EXERCISES
  // ----------------------------------------------------------

  const exercisesData = [
    {
      userId:              SEED_USER_ID!,
      name:                'Back Squat',
      movementPattern:     'squat',
      category:            'strength',
      mainMuscle:          'quadriceps',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Front Squat',
      movementPattern:     'squat',
      category:            'strength',
      mainMuscle:          'quadriceps',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Deadlift',
      movementPattern:     'hinge',
      category:            'strength',
      mainMuscle:          'hamstrings',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Bench Press',
      movementPattern:     'push',
      category:            'strength',
      mainMuscle:          'chest',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'BB Hip Thrust',
      movementPattern:     'hinge',
      category:            'strength',
      mainMuscle:          'glutes',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Pronated Pull Up',
      movementPattern:     'pull',
      category:            'strength',
      mainMuscle:          'lats',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Supinated Pull Up',
      movementPattern:     'pull',
      category:            'strength',
      mainMuscle:          'lats',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'DB Bulgarian Split Squat',
      movementPattern:     'squat',
      category:            'strength',
      mainMuscle:          'quadriceps',
      bilateralUnilateral: 'unilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Cable Row',
      movementPattern:     'pull',
      category:            'strength',
      mainMuscle:          'upper back',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Lat Pull Down',
      movementPattern:     'pull',
      category:            'strength',
      mainMuscle:          'lats',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Leg Curl',
      movementPattern:     'hinge',
      category:            'strength',
      mainMuscle:          'hamstrings',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'RDL',
      movementPattern:     'hinge',
      category:            'strength',
      mainMuscle:          'hamstrings',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Push Press w/ BB',
      movementPattern:     'push',
      category:            'strength',
      mainMuscle:          'shoulders',
      bilateralUnilateral: 'bilateral',
      trackLoad:           true,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Med Ball Fwd Throw',
      movementPattern:     'throw',
      category:            'power',
      mainMuscle:          'full body',
      bilateralUnilateral: 'bilateral',
      trackLoad:           false,
    },
    {
      userId:              SEED_USER_ID!,
      name:                'Max Height Box Jumps',
      movementPattern:     'jump',
      category:            'power',
      mainMuscle:          'full body',
      bilateralUnilateral: 'bilateral',
      trackLoad:           false,
    },
  ];

  const insertedExercises = await db
    .insert(schema.exercises)
    .values(exercisesData)
    .onConflictDoNothing()
    .returning();

  log('exercises', insertedExercises.length);

  // ----------------------------------------------------------
  // GYM SESSION TEMPLATES
  // ----------------------------------------------------------

  const gymTemplatesData = [
    { userId: SEED_USER_ID!, name: 'ADP – Day 1', phaseType: 'adaptation' },
    { userId: SEED_USER_ID!, name: 'ADP – Day 2', phaseType: 'adaptation' },
    { userId: SEED_USER_ID!, name: 'ADP – Day 3', phaseType: 'adaptation' },
    { userId: SEED_USER_ID!, name: 'ACC – Day 1', phaseType: 'accumulation' },
    { userId: SEED_USER_ID!, name: 'ACC – Day 2', phaseType: 'accumulation' },
    { userId: SEED_USER_ID!, name: 'ACC – Day 3', phaseType: 'accumulation' },
    { userId: SEED_USER_ID!, name: 'ACC – Day 4 Glutes', phaseType: 'accumulation' },
    { userId: SEED_USER_ID!, name: 'TRN – Day 1', phaseType: 'transmutation' },
    { userId: SEED_USER_ID!, name: 'TRN – Day 2', phaseType: 'transmutation' },
    { userId: SEED_USER_ID!, name: 'TRN – Day 3', phaseType: 'transmutation' },
    { userId: SEED_USER_ID!, name: 'RLZ – Day 1', phaseType: 'realization' },
    { userId: SEED_USER_ID!, name: 'RLZ – Day 2', phaseType: 'realization' },
  ];

  const insertedGymTemplates = await db
    .insert(schema.gymSessionTemplates)
    .values(gymTemplatesData)
    .onConflictDoNothing()
    .returning();

  log('gym_session_templates', insertedGymTemplates.length);

  // ----------------------------------------------------------
  // SWIM SESSION TEMPLATES
  // ----------------------------------------------------------

  const swimTemplatesData = [
    // Endurance: END – Swim 1 to 9
    ...Array.from({ length: 9 }, (_, i) => ({
      userId:         SEED_USER_ID!,
      name:           `END – Swim ${i + 1}`,
      swimType:       'endurance',
      distanceMeters: 2000,
    })),
    // Anaerobic: ANA – Swim 1 to 11
    ...Array.from({ length: 11 }, (_, i) => ({
      userId:         SEED_USER_ID!,
      name:           `ANA – Swim ${i + 1}`,
      swimType:       'anaerobic',
      distanceMeters: 2200,
    })),
    // Alactic: ALA – Swim 1 to 6
    ...Array.from({ length: 6 }, (_, i) => ({
      userId:         SEED_USER_ID!,
      name:           `ALA – Swim ${i + 1}`,
      swimType:       'alactic',
      distanceMeters: 2000,
    })),
  ];

  const insertedSwimTemplates = await db
    .insert(schema.swimSessionTemplates)
    .values(swimTemplatesData)
    .onConflictDoNothing()
    .returning();

  log('swim_session_templates', insertedSwimTemplates.length);

  // ----------------------------------------------------------
  // GYM SESSION EXERCISES — Adaptation
  // ----------------------------------------------------------

  // New exercises needed for Adaptation templates
  const adpExercisesData = [
    { userId: SEED_USER_ID!, name: 'Body Weight Squat 3-2-0', movementPattern: 'squat',      category: 'strength', mainMuscle: 'quadriceps',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Weighted Step Ups',        movementPattern: 'squat',      category: 'strength', mainMuscle: 'quadriceps',  bilateralUnilateral: 'unilateral', trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Banded Good Mornings',     movementPattern: 'hinge',      category: 'strength', mainMuscle: 'hamstrings',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Scapular Pull Ups',        movementPattern: 'pull',       category: 'strength', mainMuscle: 'upper back',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Eccentric Push Up',        movementPattern: 'push',       category: 'strength', mainMuscle: 'chest',       bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Inverted Rows',            movementPattern: 'pull',       category: 'strength', mainMuscle: 'upper back',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Hollow Body Hold',         movementPattern: 'core',       category: 'strength', mainMuscle: 'core',        bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Supermans',                movementPattern: 'core',       category: 'strength', mainMuscle: 'lower back',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Rotator cuff Row, Rotate, Press', movementPattern: 'prehab', category: 'prehab', mainMuscle: 'shoulders', bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Banded Deadlift',          movementPattern: 'hinge',      category: 'strength', mainMuscle: 'hamstrings',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Russian Deadlifts',        movementPattern: 'hinge',      category: 'strength', mainMuscle: 'hamstrings',  bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Calf Raise',               movementPattern: 'isolation',  category: 'strength', mainMuscle: 'calves',      bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Half Hindu Push Up',       movementPattern: 'push',       category: 'strength', mainMuscle: 'chest',       bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Incline Bench Press w/ DB', movementPattern: 'push',      category: 'strength', mainMuscle: 'chest',       bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Bent Over Row w/ DB',      movementPattern: 'pull',       category: 'strength', mainMuscle: 'upper back',  bilateralUnilateral: 'unilateral', trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Rear Delt Flys',           movementPattern: 'pull',       category: 'strength', mainMuscle: 'shoulders',   bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Weighted Sit Up',          movementPattern: 'core',       category: 'strength', mainMuscle: 'core',        bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Superman Hold',            movementPattern: 'core',       category: 'strength', mainMuscle: 'lower back',  bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Dorsiflexion against wall', movementPattern: 'prehab',    category: 'prehab',   mainMuscle: 'ankles',      bilateralUnilateral: 'bilateral',  trackLoad: false },
    { userId: SEED_USER_ID!, name: 'Sumo Squat',               movementPattern: 'squat',      category: 'strength', mainMuscle: 'glutes',      bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Cable Kickbacks',          movementPattern: 'isolation',  category: 'strength', mainMuscle: 'glutes',      bilateralUnilateral: 'unilateral', trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Cable Pull Through',       movementPattern: 'hinge',      category: 'strength', mainMuscle: 'glutes',      bilateralUnilateral: 'bilateral',  trackLoad: true  },
    { userId: SEED_USER_ID!, name: 'Banded Side Steps',        movementPattern: 'activation', category: 'strength', mainMuscle: 'glutes',      bilateralUnilateral: 'bilateral',  trackLoad: false },
  ];

  await db.insert(schema.exercises).values(adpExercisesData).onConflictDoNothing();

  // Build name → id maps
  const allExercises = await db.query.exercises.findMany({
    where: eq(schema.exercises.userId, SEED_USER_ID!),
  });
  const exId = new Map(allExercises.map(e => [e.name, e.id]));

  const allGymTemplates = await db.query.gymSessionTemplates.findMany({
    where: eq(schema.gymSessionTemplates.userId, SEED_USER_ID!),
  });
  const tmplId = new Map(allGymTemplates.map(t => [t.name, t.id]));

  function ex(name: string): string {
    const id = exId.get(name);
    if (!id) throw new Error(`Exercise not found in DB: "${name}"`);
    return id;
  }

  let gymExercisesInserted = 0;

  // ── ADP – Day 1 (11 exercises) ────────────────────────────

  const adp1Id = tmplId.get('ADP – Day 1')!;
  const adp1Exists = await db.query.gymSessionExercises.findFirst({
    where: eq(schema.gymSessionExercises.gymSessionTemplateId, adp1Id),
  });

  if (!adp1Exists) {
    await db.insert(schema.gymSessionExercises).values([
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Body Weight Squat 3-2-0'),        orderIndex: 1,  sets: 3,    reps: '5',             intensityType: 'none', notes: 'Lower Prep' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Back Squat'),                    orderIndex: 2,  sets: null, reps: 'x8',            intensityType: 'rpe',  rpe: 'RPE 7-8', notes: 'Lower Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Weighted Step Ups'),             orderIndex: 3,  sets: null, reps: 'x16 alternating', intensityType: 'rpe', rpe: 'RPE 7',   notes: 'Lower Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Banded Good Mornings'),          orderIndex: 4,  sets: null, reps: 'x10',           intensityType: 'none', notes: 'Lower Circuit x3 · Light band' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Scapular Pull Ups'),             orderIndex: 5,  sets: 3,    reps: '8',             intensityType: 'none', notes: 'Upper Prep' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Pronated Pull Up'),              orderIndex: 6,  sets: null, reps: 'x6',            intensityType: 'rpe',  rpe: 'RPE 7-8', notes: 'Upper Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Eccentric Push Up'),             orderIndex: 7,  sets: null, reps: 'x6',            intensityType: 'none', notes: 'Upper Circuit x3 · 5 sec descent' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Inverted Rows'),                 orderIndex: 8,  sets: null, reps: 'x12',           intensityType: 'rpe',  rpe: 'RPE 7',   notes: 'Upper Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Hollow Body Hold'),              orderIndex: 9,  sets: null, reps: '30 sec',        intensityType: 'none', notes: 'Core Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Supermans'),                     orderIndex: 10, sets: null, reps: 'x20',           intensityType: 'none', notes: 'Core Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp1Id, exerciseId: ex('Rotator cuff Row, Rotate, Press'), orderIndex: 11, sets: 3,  reps: '6',             intensityType: 'none', notes: 'Prehab · Slow tempo' },
    ]);
    gymExercisesInserted += 11;
  }

  // ── ADP – Day 2 (11 exercises) ────────────────────────────

  const adp2Id = tmplId.get('ADP – Day 2')!;
  const adp2Exists = await db.query.gymSessionExercises.findFirst({
    where: eq(schema.gymSessionExercises.gymSessionTemplateId, adp2Id),
  });

  if (!adp2Exists) {
    await db.insert(schema.gymSessionExercises).values([
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Banded Deadlift'),             orderIndex: 1,  sets: 2,    reps: '8',         intensityType: 'none', notes: 'Lower Prep · w/ stick or empty BB' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Russian Deadlifts'),           orderIndex: 2,  sets: null, reps: 'x8',        intensityType: 'rpe',  rpe: 'RPE 7-8', notes: 'Lower Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('BB Hip Thrust'),               orderIndex: 3,  sets: null, reps: 'x10',       intensityType: 'rpe',  rpe: 'RPE 7',   notes: 'Lower Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Calf Raise'),                  orderIndex: 4,  sets: null, reps: 'x15 e.s.',  intensityType: 'none', notes: 'Lower Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Half Hindu Push Up'),          orderIndex: 5,  sets: 3,    reps: '6',         intensityType: 'none', notes: 'Upper Prep' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Incline Bench Press w/ DB'),   orderIndex: 6,  sets: null, reps: 'x8',        intensityType: 'rpe',  rpe: 'RPE 7-8', notes: 'Upper Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Bent Over Row w/ DB'),         orderIndex: 7,  sets: null, reps: 'x10 e.s.',  intensityType: 'rpe',  rpe: 'RPE 7',   notes: 'Upper Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Rear Delt Flys'),              orderIndex: 8,  sets: null, reps: 'x10',       intensityType: 'none', notes: 'Upper Circuit x3 · 2.5kg' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Weighted Sit Up'),             orderIndex: 9,  sets: null, reps: 'x12',       intensityType: 'none', notes: 'Core Circuit x3 · 5kg' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Superman Hold'),               orderIndex: 10, sets: null, reps: '40 sec',    intensityType: 'none', notes: 'Core Circuit x3' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp2Id, exerciseId: ex('Dorsiflexion against wall'),   orderIndex: 11, sets: 3,    reps: '15',        intensityType: 'none', notes: 'Prehab' },
    ]);
    gymExercisesInserted += 11;
  }

  // ── ADP – Day 3 (8 exercises) ─────────────────────────────

  const adp3Id = tmplId.get('ADP – Day 3')!;
  const adp3Exists = await db.query.gymSessionExercises.findFirst({
    where: eq(schema.gymSessionExercises.gymSessionTemplateId, adp3Id),
  });

  if (!adp3Exists) {
    await db.insert(schema.gymSessionExercises).values([
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('BB Hip Thrust'),              orderIndex: 1, sets: 4, reps: '8-10',          intensityType: 'rpe',  rpe: 'RPE 7', notes: 'Main glute strength' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('Sumo Squat'),                 orderIndex: 2, sets: 3, reps: '10-12',         intensityType: 'rpe',  rpe: 'RPE 7', notes: 'Glute hypertrophy' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('Cable Kickbacks'),            orderIndex: 3, sets: 3, reps: '12 e.s.',       intensityType: 'rpe',  rpe: 'RPE 8', notes: 'Glute isolation' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('Cable Pull Through'),         orderIndex: 4, sets: 3, reps: '12',            intensityType: 'rpe',  rpe: 'RPE 7', notes: 'Hip hinge accessory' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('DB Bulgarian Split Squat'),  orderIndex: 5, sets: 3, reps: '10 e.s.',       intensityType: 'rpe',  rpe: 'RPE 7', notes: 'Unilateral glute work' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('Banded Side Steps'),         orderIndex: 6, sets: 3, reps: '8 out / 8 back', intensityType: 'none',              notes: 'Glute med activation' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('Hollow Body Hold'),          orderIndex: 7, sets: 3, reps: '30 sec',        intensityType: 'none',              notes: 'Core' },
      { userId: SEED_USER_ID!, gymSessionTemplateId: adp3Id, exerciseId: ex('Rotator cuff Row, Rotate, Press'), orderIndex: 8, sets: 3, reps: '6',       intensityType: 'none',              notes: 'Prehab' },
    ]);
    gymExercisesInserted += 8;
  }

  log('gym_session_exercises', gymExercisesInserted);

  // ----------------------------------------------------------
  // TEST TEMPLATES
  // ----------------------------------------------------------

  const testTemplatesData = [
    {
      userId:                 SEED_USER_ID!,
      name:                   'Back Squat 3RM',
      category:               'strength',
      metricType:             'weight',
      unit:                   'kg',
      calculatesEstimated1rm: true,
      protocol:               '3RM test for estimated 1RM calculation',
      linkedExerciseId:       exId.get('Back Squat') ?? null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   'Deadlift 3RM',
      category:               'strength',
      metricType:             'weight',
      unit:                   'kg',
      calculatesEstimated1rm: true,
      protocol:               '3RM test for estimated 1RM calculation',
      linkedExerciseId:       exId.get('Deadlift') ?? null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   'Bench Press 3RM',
      category:               'strength',
      metricType:             'weight',
      unit:                   'kg',
      calculatesEstimated1rm: true,
      protocol:               '3RM test for estimated 1RM calculation',
      linkedExerciseId:       exId.get('Bench Press') ?? null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   'Pull Up 1RM',
      category:               'strength',
      metricType:             'weight',
      unit:                   'kg',
      calculatesEstimated1rm: false,
      protocol:               'Supinated pull-up 1RM, bodyweight plus external load if applicable',
      linkedExerciseId:       exId.get('Supinated Pull Up') ?? null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   '400m Swim',
      category:               'in_water',
      metricType:             'time',
      unit:                   'seconds',
      calculatesEstimated1rm: false,
      protocol:               '400m swim time trial',
      linkedExerciseId:       null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   'Beep Test',
      category:               'in_water',
      metricType:             'level',
      unit:                   'level',
      calculatesEstimated1rm: false,
      protocol:               'Underwater rugby beep test',
      linkedExerciseId:       null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   '8x25 UW',
      category:               'in_water',
      metricType:             'time',
      unit:                   'seconds',
      calculatesEstimated1rm: false,
      protocol:               '8 x 25m underwater test',
      linkedExerciseId:       null,
    },
    {
      userId:                 SEED_USER_ID!,
      name:                   '25UW / 25FS',
      category:               'in_water',
      metricType:             'time',
      unit:                   'seconds',
      calculatesEstimated1rm: false,
      protocol:               '25m underwater + 25m freestyle test',
      linkedExerciseId:       null,
    },
  ];

  const insertedTestTemplates = await db
    .insert(schema.testTemplates)
    .values(testTemplatesData)
    .onConflictDoNothing()
    .returning();

  log('test_templates', insertedTestTemplates.length);

  // ----------------------------------------------------------
  // TESTING BLOCK — Week 2 (Adaptation Exit Assessment)
  // ----------------------------------------------------------

  const [testingBlock] = await db
    .insert(schema.testingBlocks)
    .values({
      userId:        SEED_USER_ID!,
      macrocycleId:  mc.id,
      weekNumber:    2,
      scheduledDate: '2026-06-23',
      purpose:       'Adaptation Exit Assessment',
      status:        'pending',
    })
    .onConflictDoNothing()
    .returning();

  const tb = testingBlock ?? (
    await db.query.testingBlocks.findFirst({
      where: (b, { and }) => and(
        eq(b.userId, SEED_USER_ID!),
        eq(b.macrocycleId, mc.id),
        eq(b.weekNumber, 2),
      ),
    })
  )!;

  log('testing_blocks', 1);

  // ----------------------------------------------------------
  // TESTING SESSIONS — Week 2
  // ----------------------------------------------------------

  const week2Sessions = [
    { sessionLabel: 'Strength Session 1', sessionType: 'strength', date: '2026-06-23' },
    { sessionLabel: 'Strength Session 2', sessionType: 'strength', date: '2026-06-25' },
    { sessionLabel: 'In-Water Session 1', sessionType: 'in_water', date: '2026-06-27' },
    { sessionLabel: 'In-Water Session 2', sessionType: 'in_water', date: '2026-06-29' },
  ];

  const insertedSessions = await db
    .insert(schema.testingSessions)
    .values(week2Sessions.map(s => ({
      userId:         SEED_USER_ID!,
      testingBlockId: tb.id,
      date:           s.date,
      sessionType:    s.sessionType,
      sessionLabel:   s.sessionLabel,
      status:         'planned',
    })))
    .onConflictDoNothing()
    .returning();

  log('testing_sessions', insertedSessions.length);

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------

  console.log('\n✅  Seed complete.\n');
  console.log('    Macrocycle         : Road to Berlin (2026-06-09 → 2026-11-29)');
  console.log('    Phases             : Adaptation · Accumulation · Transmutation · Realization · Competition');
  console.log('    Training days      : 7 (Week 1, Adaptation — Jun 9–15 2026)');
  console.log('    Exercises          : 15 base + 23 ADP = 38 total');
  console.log('    Gym templates      : 12 (ADP × 3, ACC × 4, TRN × 3, RLZ × 2)');
  console.log('    Gym exercises      : 30 (ADP Day 1 × 11, Day 2 × 11, Day 3 × 8)');
  console.log('    Swim templates     : 26 (END × 9, ANA × 11, ALA × 6)');
  console.log('    Test templates     : 8 (4 Strength · 4 In-Water)');
  console.log('    Testing blocks     : 1 (Week 2)');
  console.log('    Testing sessions   : 4 (Strength × 2, In-Water × 2)\n');

  await connection.end();
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
