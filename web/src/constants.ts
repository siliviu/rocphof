// Shared frontend constants. Mirrors domain.Constants on the backend, so the two
// sides agree on contest names, subjects and grade bounds.
export const CONTEST_ONI = 'ONI';
export const CONTEST_ONM = 'ONM';
export const CONTEST_LOT = 'LOT';
export const COUNTRY_ROMANIA = 'Romania';
export const GRADE_INTERNATIONAL = 1;
export const CONTEST_DEFAULT_HISTORY = 'IOI';

export const MIN_GRADE = 5;
export const MAX_GRADE = 12;

/* Subject a contest belongs to. Editions archived before the column existed
   have no value stored and count as SUBJECT_DEFAULT. */
export const SUBJECT_INFORMATICS = 'Informatics';
export const SUBJECT_MATHS = 'Maths';
export const SUBJECT_DEFAULT = SUBJECT_INFORMATICS;

/* Which subjects a page shows, chosen in the UI (see common/subject-context).
   SUBJECT_ALL is not a stored subject: it shows every subject together, and the
   backend accepts it to count every subject in a ranking. Mirrors
   domain.Constants.SUBJECT_ALL. */
export const SUBJECT_ALL = 'All';
export const STORED_SUBJECTS = [SUBJECT_INFORMATICS, SUBJECT_MATHS] as const;
export const SUBJECTS = [SUBJECT_INFORMATICS, SUBJECT_MATHS, SUBJECT_ALL] as const;
export type Subject = typeof SUBJECTS[number];
export const SUBJECT_SELECTED_DEFAULT: Subject = SUBJECT_ALL;

/* National olympiads: one sheet per grade, results carry an institution. */
export const NATIONAL_CONTESTS: Record<string, string> = {
  [CONTEST_ONI]: SUBJECT_INFORMATICS,
  [CONTEST_ONM]: SUBJECT_MATHS,
};

/* LOT has no grades; the result's year column holds one of these levels. */
export const LOT_LEVEL_KEYS = ['Girl', 'Junior', 'Senior'] as const;

/* Which contests a ranking covers. ONI is the national olympiad on its own;
   INTERNATIONAL covers LOT together with the international contests. */
export const SCOPE_ONI = 'ONI';
export const SCOPE_INTERNATIONAL = 'INTERNATIONAL';
export const SCOPE_DEFAULT = SCOPE_ONI;
export const SCOPES = [SCOPE_ONI, SCOPE_INTERNATIONAL] as const;
export type RankingScope = typeof SCOPES[number];

export default {
  CONTEST_ONI,
  CONTEST_ONM,
  CONTEST_LOT,
  COUNTRY_ROMANIA,
  GRADE_INTERNATIONAL,
  CONTEST_DEFAULT_HISTORY,
  MIN_GRADE,
  MAX_GRADE,
  SUBJECT_INFORMATICS,
  SUBJECT_MATHS,
  SUBJECT_DEFAULT,
  SUBJECT_ALL,
  SUBJECTS,
  NATIONAL_CONTESTS,
  LOT_LEVEL_KEYS,
  SCOPE_ONI,
  SCOPE_INTERNATIONAL,
  SCOPE_DEFAULT,
  SCOPES,
};
