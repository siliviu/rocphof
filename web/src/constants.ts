// Shared frontend constants. Mirrors domain.Constants on the backend, so the two
// sides agree on contest names, subjects and grade bounds.
export const CONTEST_ONI = 'ONI';
export const CONTEST_LOT = 'LOT';
export const COUNTRY_ROMANIA = 'Romania';
export const GRADE_INTERNATIONAL = 1;
export const CONTEST_DEFAULT_HISTORY = 'IOI';

export const MIN_GRADE = 5;
export const MAX_GRADE = 12;

/* Every archived contest is an informatics contest. The backend accepts a
   subject filter, but there is only one subject to ask for, so it is fixed here
   rather than exposed in the UI. */
export const SUBJECT_INFORMATICS = 'Informatics';
export const SUBJECT_DEFAULT = SUBJECT_INFORMATICS;

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
  CONTEST_LOT,
  COUNTRY_ROMANIA,
  GRADE_INTERNATIONAL,
  CONTEST_DEFAULT_HISTORY,
  MIN_GRADE,
  MAX_GRADE,
  SUBJECT_INFORMATICS,
  SUBJECT_DEFAULT,
  LOT_LEVEL_KEYS,
  SCOPE_ONI,
  SCOPE_INTERNATIONAL,
  SCOPE_DEFAULT,
  SCOPES,
};
