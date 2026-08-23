import { useSearchParams } from 'react-router-dom';

/* Keeps the ranking year range in the URL, so a filtered ranking is shareable
   and browser history steps through previous ranges. Bounds come from the
   archived contests rather than being hardcoded. */
export const useYearRangeParams = (min: number, max: number) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const parse = (key: string, fallback: number) => {
        const raw = Number(searchParams.get(key));
        return Number.isFinite(raw) && raw !== 0
            ? Math.min(max, Math.max(min, raw))
            : fallback;
    };

    const startYear = parse('startYear', min);
    const endYear = parse('endYear', max);

    const setRange = (start: number, end: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('startYear', String(Math.min(start, end)));
        params.set('endYear', String(Math.max(start, end)));
        setSearchParams(params);
    };

    return {
        startYear: Math.min(startYear, endYear),
        endYear: Math.max(startYear, endYear),
        setRange,
        min,
        max,
    };
};
