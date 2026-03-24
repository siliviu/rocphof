import { useMemo, useState } from 'react';

export const useSorting = <T extends Record<string, any>>(items: T[], defaultKey = 'gold', nameGetter?: (item: T) => string, olympic: string[] = ['gold', 'silver', 'bronze', 'participations']) => {
    const [sortKey, setSortKey] = useState<string>(defaultKey);

    const sortedItems = useMemo(() => {
        const copy = [...items];
        const key = sortKey;
        copy.sort((a: T, b: T) => {
            const va = (a as any)[key] ?? 0;
            const vb = (b as any)[key] ?? 0;
            if (va !== vb) return vb - va; // primary desc
            for (const k of olympic) {
                if (k === key) continue;
                const ka = (a as any)[k] ?? 0;
                const kb = (b as any)[k] ?? 0;
                if (ka !== kb) return kb - ka;
            }
            const nameA = nameGetter ? nameGetter(a) : (a as any).institution?.name ?? (a as any).region ?? '';
            const nameB = nameGetter ? nameGetter(b) : (b as any).institution?.name ?? (b as any).region ?? '';
            return nameA.localeCompare(nameB);
        });
        return copy;
    }, [items, sortKey, nameGetter, olympic]);

    const positions = useMemo(() => {
        const pos: number[] = [];
        let currentRank = 1;
        let prevKey = '';
        for (const item of sortedItems) {
            const key = `${olympic.map(k => (item as any)[k] ?? 0).join('-')}`;
            if (key !== prevKey) {
                currentRank = pos.length + 1;
                prevKey = key;
            }
            pos.push(currentRank);
        }
        return pos;
    }, [sortedItems, nameGetter, olympic]);

    return { sortedItems, setSortKey, positions } as const;
};
