export type RecurringActivity = {
  key:         string;
  label:       string;
  sessionName: string;
  sessionType: 'other' | 'recovery';
};

// Recurring activities are not template-backed and may be scheduled
// any number of times per week. They are config-only (no DB rows of
// their own) and are always available in the planner.
export const recurringActivities: RecurringActivity[] = [
  { key: 'uwr',      label: 'UWR Training', sessionName: 'UWR Training', sessionType: 'other' },
  { key: 'recovery', label: 'Recovery',     sessionName: 'Recovery',     sessionType: 'recovery' },
];
