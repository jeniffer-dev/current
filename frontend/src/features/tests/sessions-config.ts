export type SessionConfig = {
  label:        string;
  session_type: 'strength' | 'in_water' | 'mixed';
  date:         string;   // ISO date YYYY-MM-DD
  templates:    string[]; // test_template names in display order
};

// Session definitions per testing block week.
// V1: hardcoded config. Future: move to DB junction table.
export const SESSIONS_BY_WEEK: Record<number, SessionConfig[]> = {
  2: [
    {
      label:        'Strength Session 1',
      session_type: 'strength',
      date:         '2026-06-23',
      templates:    ['Back Squat 3RM', 'Bench Press 3RM'],
    },
    {
      label:        'Strength Session 2',
      session_type: 'strength',
      date:         '2026-06-25',
      templates:    ['Deadlift 3RM', 'Pull Up 1RM'],
    },
    {
      label:        'In-Water Session 1',
      session_type: 'in_water',
      date:         '2026-06-27',
      templates:    ['400m Swim', 'Beep Test'],
    },
    {
      label:        'In-Water Session 2',
      session_type: 'in_water',
      date:         '2026-06-29',
      templates:    ['8x25 UW', '25UW / 25FS'],
    },
  ],
};
