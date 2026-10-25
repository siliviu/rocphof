import { CONTEST_LOT, NATIONAL_CONTESTS, SUBJECT_ALL, SUBJECT_DEFAULT, Subject } from "../constants";

export interface Contest {
    id: number,
    name: string,
    subject: string | null,
    year: number,
    desc: string | null,
    country: string | null,
    city: string | null,
    participants: number | null,
    start: string | null,
    end: string | null,
    site: string | null
}

export const subjectOf = (contest: Contest): string =>
    contest.subject ?? SUBJECT_DEFAULT;

/* Whether a contest belongs to the selected subject; SUBJECT_ALL takes every one. */
export const matchesSubject = (contest: Contest | null | undefined, subject: Subject): boolean =>
    !!contest && (subject === SUBJECT_ALL || subjectOf(contest) === subject);

export const isNational = (contest: Contest | null | undefined): boolean =>
    !!contest && contest.name in NATIONAL_CONTESTS;

export const isLOT = (contest: Contest | null | undefined): boolean =>
    !!contest && contest.name === CONTEST_LOT;

export const isInternational = (contest: Contest | null | undefined): boolean =>
    !!contest && !isNational(contest) && !isLOT(contest);

/* National olympiad names of the selected subject, in declaration order. */
export const nationalContestsFor = (subject: Subject): string[] =>
    Object.entries(NATIONAL_CONTESTS)
        .filter(([, contestSubject]) => subject === SUBJECT_ALL || contestSubject === subject)
        .map(([name]) => name);
