import { useEffect, useState } from 'react';
import { getAllContests } from '../../api/rest';
import { Contest } from '../../model/contest';
import { CONTEST_ONI } from '../../constants';

export interface YearBounds {
    minYear: number;
    maxYear: number;
    loading: boolean;
}

/* Year ranges are derived from the archived contests rather than hardcoded, so
   they extend automatically as new editions are imported. */
export const useContestYearBounds = (contestName?: string): YearBounds => {
    const [bounds, setBounds] = useState<{ minYear: number; maxYear: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getAllContests()
            .then((contests: Contest[]) => {
                if (!active) return;
                const years = contests
                    .filter(contest => !contestName || contest.name === contestName)
                    .map(contest => contest.year);
                if (years.length) {
                    setBounds({ minYear: Math.min(...years), maxYear: Math.max(...years) });
                }
            })
            .catch(() => { /* falls back to the current year below */ })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [contestName]);

    const currentYear = new Date().getFullYear();
    return {
        minYear: bounds?.minYear ?? currentYear,
        maxYear: bounds?.maxYear ?? currentYear,
        loading,
    };
};

/* Bounds for the people ranking, which filters by the year a generation
   started school rather than by contest year. */
export const useGenerationBounds = (minGrade: number, maxGrade: number) => {
    const { minYear, maxYear, loading } = useContestYearBounds(CONTEST_ONI);
    return {
        minGeneration: minYear - maxGrade,
        maxGeneration: maxYear - minGrade,
        loading,
    };
};
