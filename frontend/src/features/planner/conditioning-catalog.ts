export type ConditioningType = 'aerobic' | 'anaerobic' | 'alactic';

export type ConditioningSession = {
  name:        string;
  type:        ConditioningType;
  description: string;
};

export const conditioningSessions: ConditioningSession[] = [
  { name: 'Aerobic Session 1',   type: 'aerobic',   description: '5 rounds — 1min at 60%, 3min at 80%, 1min at 90%' },
  { name: 'Aerobic Session 2',   type: 'aerobic',   description: '2 rounds — 1min at 90%, 2min at 80%, 3min at 70%, 30sec rest, 3min at 70%, 2min at 80%, 1min at 90%, 1min rest' },
  { name: 'Aerobic Session 3',   type: 'aerobic',   description: '3 rounds — 1min at 60%, 3min at 80%, 1min at 70%, 2min at 80%, 1min at 70%, 1min at 90%' },
  { name: 'Aerobic Session 4',   type: 'aerobic',   description: '4 rounds — 1min at 60%, 2min at 70%, 3min at 80%, 1min at 90%' },
  { name: 'Aerobic Session 5',   type: 'aerobic',   description: '4 rounds — 3min at 70%, 2min at 80%, 1min at 90%, 1min rest' },
  { name: 'Aerobic Session 6',   type: 'aerobic',   description: '5 rounds — 3min at 80%, 1min at 90%, 1min rest' },
  { name: 'Aerobic Session 7',   type: 'aerobic',   description: '3 rounds — 3min at 70%, 4min at 80%, 1min at 90%, 1min rest' },
  { name: 'Anaerobic Session 1', type: 'anaerobic', description: '10 rounds — 1min at 95%, 1min rest' },
  { name: 'Anaerobic Session 2', type: 'anaerobic', description: '5 rounds — 30sec at 95%, 30sec at 60%, 30sec at 95%, 90sec rest' },
  { name: 'Anaerobic Session 3', type: 'anaerobic', description: '4 rounds — 2min at 95%, 2min at 60%, 1min rest' },
  { name: 'Anaerobic Session 4', type: 'anaerobic', description: '8 rounds — 20sec at 95%, 100sec at 60%' },
  { name: 'Anaerobic Session 5', type: 'anaerobic', description: '4 rounds — 1min at 95%, 2min at 60%, 1min rest' },
  { name: 'Anaerobic Session 6', type: 'anaerobic', description: '8 rounds — 30sec at 95%, 90sec at 60%' },
  { name: 'Anaerobic Session 7', type: 'anaerobic', description: '4 rounds — 3× 20sec at 95%, 20sec at 60%, 2min rest' },
  { name: 'Alactic Session 1',   type: 'alactic',   description: '6 rounds — 10sec at 100%, 1min rest, 3min rest, 10sec at 100%, 1min rest' },
  { name: 'Alactic Session 2',   type: 'alactic',   description: '4 rounds — 10sec at 100%, 30sec at 60%, 10sec at 100%, 30sec at 60%, 2min rest' },
  { name: 'Alactic Session 3',   type: 'alactic',   description: '5 rounds — 10sec at 100%, 10sec rest, 10sec at 100%, 20sec rest, 10sec at 100%, 2min rest, repeat' },
  { name: 'Alactic Session 4',   type: 'alactic',   description: '3 rounds — 10sec at 100%, 60sec at 60%, 10sec at 100%, 60sec at 60%, 3min rest' },
  { name: 'Alactic Session 5',   type: 'alactic',   description: '6 rounds — 10sec at 100%, 110sec at 60%' },
  { name: 'Alactic Session 6',   type: 'alactic',   description: '3 rounds — 3× 10sec at 100%, 90sec at 60%, 2min rest' },
  { name: 'Alactic Session 7',   type: 'alactic',   description: '5 rounds — 10sec at 100%, 20sec rest, 10sec at 100%, 10sec rest, 10sec at 100%, 2min rest' },
];

export function conditioningTypeForPhase(phaseType: string | null): ConditioningType {
  if (phaseType === 'transmutation')                          return 'anaerobic';
  if (phaseType === 'realization' || phaseType === 'competition') return 'alactic';
  return 'aerobic';
}

export function conditioningLabel(type: ConditioningType): string {
  if (type === 'anaerobic') return 'Anaerobic';
  if (type === 'alactic')   return 'Alactic';
  return 'Aerobic';
}
