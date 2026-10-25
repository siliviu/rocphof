import { useEffect, useState } from 'react';
import { getAllContests } from '../../api/rest';
import { Contest, isNational, matchesSubject } from '../../model/contest';
import { useSubject } from '../subject';

export interface YearBounds {
    minYear: number;
    maxYear: number;
    loading: boolean;
}

/* Year ranges are derived from the archived contests rather than hardcoded, so
   they extend automatically as new editions are imported. Only contests of the
   selected subject are considered; nationalOnly narrows that to the national
   olympiads (ONI, ONM, or both). */
export const useContestYearBounds = (nationalOnly = false): YearBounds => {
    const { subject } = useSubject();
    const [bounds, setBounds] = useState<{ minYear: number; maxYear: number } | null>(null);
    /* Which request the bounds belong to, so a subject switch reads as loading
       from its first render rather than one render later: otherwise a page
       fetches once with the old subject's range before the new one arrives. */
    const key = `${subject}|${nationalOnly}`;
    const [loadedKey, setLoadedKey] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        getAllContests()
            .then((contests: Contest[]) => {
                if (!active) return;
                const years = contests
                    .filter(contest => matchesSubject(contest, subject) && (!nationalOnly || isNational(contest)))
                    .map(contest => contest.year);
                setBounds(years.length ? { minYear: Math.min(...years), maxYear: Math.max(...years) } : null);
            })
            .catch(() => { /* falls back to the current year below */ })
            .finally(() => { if (active) setLoadedKey(key); });
        return () => { active = false; };
    }, [nationalOnly, subject, key]);

    const currentYear = new Date().getFullYear();
    return {
        minYear: bounds?.minYear ?? currentYear,
        maxYear: bounds?.maxYear ?? currentYear,
        loading: loadedKey !== key,
    };
};

/* Bounds for the people ranking, which filters by the year a generation
   started school rather than by contest year. */
export const useGenerationBounds = (minGrade: number, maxGrade: number) => {
    const { minYear, maxYear, loading } = useContestYearBounds(true);
    return {
        minGeneration: minYear - maxGrade,
        maxGeneration: maxYear - minGrade,
        loading,
    };
};
