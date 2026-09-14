import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RankingByColumn } from '../../model/result';
import '../styles/column-ranking.css';

export interface ColumnLayout {
    order: string[];
    participationOnly: string[];
}

interface ColumnRankingTableProps {
    results: RankingByColumn[];
    layout: ColumnLayout;
}

const FULL_KEYS = ['gold', 'silver', 'bronze', 'participations'] as const;
type CellKey = typeof FULL_KEYS[number];

/* Short headers; the full medal names are far too long to sit above four
   numbers repeated across every contest. */
const SHORT_KEYS: Record<CellKey, string> = {
    gold: 'Short.Gold',
    silver: 'Short.Silver',
    bronze: 'Short.Bronze',
    participations: 'Short.Participations',
};

const CELL_CLASS: Record<CellKey, string> = {
    gold: 'gold',
    silver: 'silver',
    bronze: 'bronze',
    participations: '',
};

/* A person's row for a contest they never entered is left blank rather than
   filled with zeroes, so the columns they did enter stand out. */
const tallyOf = (result: RankingByColumn, key: string) => result.columns?.[key];

export const ColumnRankingTable = ({ results, layout }: ColumnRankingTableProps) => {
    const { t } = useTranslation();

    /* Which cells a column shows: the LOT selections award no medals, so only
       their attendance is worth a number. Memoised so the position signature can
       depend on it without rebuilding every render. */
    const keysFor = useCallback(
        (column: string): readonly CellKey[] =>
            layout.participationOnly.includes(column) ? (['participations'] as const) : FULL_KEYS,
        [layout]
    );

    /* Null sorts by the ranking's own order, which walks the medal-awarding
       columns in display order. Clicking a header sorts by that cell instead. */
    const [sort, setSort] = useState<{ column: string; key: CellKey } | null>(null);

    const sorted = useMemo(() => {
        if (!sort) return results;
        const valueOf = (result: RankingByColumn) =>
            sort.column === '' ? (result[sort.key] ?? 0) : (tallyOf(result, sort.column)?.[sort.key] ?? 0);

        return [...results].sort((a, b) => {
            if (valueOf(b) !== valueOf(a)) return valueOf(b) - valueOf(a);
            /* Falls back to the default order, so a tie is not shuffled. */
            return results.indexOf(a) - results.indexOf(b);
        });
    }, [results, sort]);

    /* Positions follow the ranking's order, so they only renumber when the
       ranking itself is reordered, not on an ad-hoc column sort. Participations
       are part of the signature because most people hold no medals at all, and
       ignoring attendance would collapse them into one shared position. */
    const positions = useMemo(() => {
        const signature = (result: RankingByColumn) => layout.order
            .map(name => {
                const tally = tallyOf(result, name);
                return keysFor(name).map(key => tally?.[key] ?? 0).join('-');
            })
            .join('|');

        const result: number[] = [];
        let rank = 1;
        let previous = '';
        sorted.forEach(entry => {
            const key = signature(entry);
            if (key !== previous) {
                rank = result.length + 1;
                previous = key;
            }
            result.push(rank);
        });
        return result;
    }, [sorted, layout, keysFor]);

    /* Clicking the active cell returns to the ranking's own order. */
    const toggleSort = (column: string, key: CellKey) =>
        setSort(sort && sort.column === column && sort.key === key ? null : { column, key });

    const header = (column: string, key: CellKey, label: string) => (
        <th
            key={`${column}-${key}`}
            className={`short ${CELL_CLASS[key]}`}
            title={label}
            onClick={() => toggleSort(column, key)}
        >
            {t(SHORT_KEYS[key])}
        </th>
    );

    return (
        <div className='column-ranking-scroll'>
        <table className='column-ranking'>
            <tbody>
                <tr>
                    <th className='position' rowSpan={2}>{t('Position')}</th>
                    <th className='name' rowSpan={2}>{t('Name')}</th>
                    {layout.order.map(name => (
                        <th key={name} colSpan={keysFor(name).length}>{name}</th>
                    ))}
                    <th colSpan={FULL_KEYS.length}>{t('Total')}</th>
                </tr>
                <tr>
                    {layout.order.map(name =>
                        keysFor(name).map(key => header(name, key, `${name} — ${t(`Sort.${key}`)}`))
                    )}
                    {FULL_KEYS.map(key => header('', key, t(`Sort.${key}`)))}
                </tr>
                {sorted.map((result, index) => (
                    <tr key={result.person.id}>
                        <td>{positions[index]}</td>
                        <td className='name'><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        {layout.order.map(name => {
                            const tally = tallyOf(result, name);
                            return keysFor(name).map(key => (
                                <td key={`${name}-${key}`} className={CELL_CLASS[key]}>
                                    {tally ? tally[key] : ''}
                                </td>
                            ));
                        })}
                        {FULL_KEYS.map(key => (
                            <td key={`total-${key}`} className={CELL_CLASS[key]}>{result[key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
};
