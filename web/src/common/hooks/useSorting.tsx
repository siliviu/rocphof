import { useMemo, useState } from 'react';

export const useSorting = <T extends Record<string, any>>(items: T[], defaultKey = 'gold', nameGetter?: (item: T) => string) => {
    const [sortKey, setSortKey] = useState<string>(defaultKey);

    const sortedItems = useMemo(() => {
        const copy = [...items];
        const key = sortKey;
        copy.sort((a: T, b: T) => {
            const va = (a as any)[key] ?? 0;
            const vb = (b as any)[key] ?? 0;
            if (va !== vb) return vb - va; // primary desc
            const olympic = ['gold', 'silver', 'bronze', 'participations'];
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
    }, [items, sortKey, nameGetter]);

    return { sortedItems, sortKey, setSortKey } as const;
};
