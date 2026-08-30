import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Medal, Result } from '../../model/result';
import '../styles/medal-chart.css';

export interface MedalChartEntry {
    year: number;
    gold: number;
    silver: number;
    bronze: number;
    none: number;
}

/* Shared by every page that charts a flat list of results by contest year. */
export const toMedalChartEntries = (results: Result[]): MedalChartEntry[] => {
    const byYear = new Map<number, MedalChartEntry>();
    results.forEach(result => {
        const year = result.contest.year;
        const entry = byYear.get(year) ?? { year, gold: 0, silver: 0, bronze: 0, none: 0 };
        if (result.medal === Medal.GOLD) entry.gold += 1;
        else if (result.medal === Medal.SILVER) entry.silver += 1;
        else if (result.medal === Medal.BRONZE) entry.bronze += 1;
        else entry.none += 1;
        byYear.set(year, entry);
    });
    return [...byYear.values()].sort((a, b) => a.year - b.year);
};

interface MedalChartProps {
    entries: MedalChartEntry[];
}

/* Rendered top to bottom, so medals sit above the medal-less participations. */
const SEGMENTS = ['gold', 'silver', 'bronze', 'none'] as const;
type SegmentKey = typeof SEGMENTS[number];

/* Plot height in em, mirrored from the stylesheet so label sizes can be
   derived from a segment's actual rendered height. */
const PLOT_HEIGHT_EM = 16;

/* Smallest share a segment may take. Kept low so heights stay close to
   proportional, but high enough that its count still fits inside. */
const MIN_SEGMENT_SHARE = 5;

/* Counts shrink with their segment rather than disappearing, down to this
   floor; anything smaller is dropped and left to the hover readout. */
const LABEL_MAX_EM = 0.85;
const LABEL_MIN_EM = 0.55;

const LABEL_KEYS: Record<SegmentKey, string> = {
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
    none: 'NoMedal',
};

const totalOf = (entry: MedalChartEntry) => entry.gold + entry.silver + entry.bronze + entry.none;

/* Raising slivers to the floor is paid for by the segments with room above it,
   so bars where nothing is tiny keep exactly proportional heights. */
const segmentShares = (entry: MedalChartEntry, maxTotal: number): Map<SegmentKey, number> => {
    const present = SEGMENTS.filter(segment => entry[segment] > 0);
    const shares = new Map<SegmentKey, number>(
        present.map(segment => [segment, (entry[segment] / maxTotal) * 100])
    );

    const deficit = present.reduce(
        (sum, segment) => sum + Math.max(0, MIN_SEGMENT_SHARE - shares.get(segment)!),
        0
    );
    if (deficit === 0) return shares;

    present.forEach(segment => {
        if (shares.get(segment)! < MIN_SEGMENT_SHARE) shares.set(segment, MIN_SEGMENT_SHARE);
    });

    const donors = present.filter(segment => shares.get(segment)! > MIN_SEGMENT_SHARE);
    const spare = donors.reduce((sum, segment) => sum + shares.get(segment)! - MIN_SEGMENT_SHARE, 0);
    if (spare > 0) {
        donors.forEach(segment => {
            const share = shares.get(segment)!;
            shares.set(segment, share - deficit * ((share - MIN_SEGMENT_SHARE) / spare));
        });
    }

    return shares;
};

/* Scales the count to the space available, so small segments keep a readable
   number instead of an empty block. */
const labelSize = (share: number): number | null => {
    const heightEm = (share / 100) * PLOT_HEIGHT_EM;
    const size = Math.min(LABEL_MAX_EM, heightEm * 0.75);
    return size >= LABEL_MIN_EM ? size : null;
};

export const MedalChart = ({ entries }: MedalChartProps) => {
    const { t } = useTranslation();
    const [hoveredYear, setHoveredYear] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    /* Years without an edition still get a slot, so the gap stays visible. */
    const slots = useMemo(() => {
        if (!entries.length) return [];
        const byYear = new Map(entries.map(entry => [entry.year, entry]));
        const years = entries.map(entry => entry.year);
        const from = Math.min(...years);
        const to = Math.max(...years);
        return Array.from({ length: to - from + 1 }, (_, offset) => {
            const year = from + offset;
            return { year, entry: byYear.get(year) ?? null };
        });
    }, [entries]);

    /* Bars are scaled against the largest delegation, never a fixed team size. */
    const maxTotal = useMemo(() => Math.max(1, ...entries.map(totalOf)), [entries]);

    /* The most recent years are the interesting ones, so an overflowing plot
       starts scrolled to its end rather than at the oldest edition. */
    useLayoutEffect(() => {
        const scroll = scrollRef.current;
        if (scroll) scroll.scrollLeft = scroll.scrollWidth;
    }, [slots]);

    const hovered = hoveredYear === null
        ? null
        : slots.find(slot => slot.year === hoveredYear)?.entry ?? null;

    if (!slots.length) return null;

    return (
        <div className='medal-chart'>
            <div className='medal-chart-scroll' ref={scrollRef}>
                <div className='medal-chart-plot'>
                    {slots.map(({ year, entry }) => {
                    const shares = entry ? segmentShares(entry, maxTotal) : null;
                    return (
                        <div
                            className={`medal-chart-slot ${hoveredYear === year ? 'hovered' : ''}`}
                            key={year}
                            onMouseEnter={() => setHoveredYear(year)}
                            onMouseLeave={() => setHoveredYear(null)}
                        >
                            <div className='medal-chart-bar'>
                                {entry && shares && SEGMENTS.filter(segment => entry[segment] > 0).map(segment => {
                                    const share = shares.get(segment)!;
                                    const size = labelSize(share);
                                    return (
                                        <div
                                            key={segment}
                                            className={`medal-chart-segment ${segment}`}
                                            style={{ height: `${share}%` }}
                                            title={`${year} — ${t(LABEL_KEYS[segment])}: ${entry[segment]}`}
                                        >
                                            {size !== null && (
                                                <span style={{ fontSize: `${size}em` }}>{entry[segment]}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className='medal-chart-year'>{year}</div>
                        </div>
                    );
                    })}
                </div>
            </div>
            <div className='medal-chart-readout' aria-live='polite'>
                {hovered ? (
                    <>
                        <span className='medal-chart-readout-year'>{hoveredYear}</span>
                        {SEGMENTS.filter(segment => hovered[segment] > 0).map(segment => (
                            <span key={segment}>
                                <i className={`medal-chart-key ${segment}`} />
                                {t(LABEL_KEYS[segment])}: {hovered[segment]}
                            </span>
                        ))}
                        <span className='medal-chart-readout-total'>
                            {t('Participations')}: {totalOf(hovered)}
                        </span>
                    </>
                ) : (
                    <>
                        {SEGMENTS.map(segment => (
                            <span key={segment}>
                                <i className={`medal-chart-key ${segment}`} />
                                {t(LABEL_KEYS[segment])}
                            </span>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
