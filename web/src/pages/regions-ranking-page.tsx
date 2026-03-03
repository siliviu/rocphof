import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags } from '../common/components';
import { getRegionRankings } from '../api/rest';

export const RegionsRankingPage = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState<any[]>([]);
    const [sortKey, setSortKey] = useState<string>('gold');
    const [loading, setLoading] = useState(true);
    const [startYear, setStartYear] = useState<number>(2010);
    const [endYear, setEndYear] = useState<number>(2030);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const dragging = useRef<'start'|'end'|null>(null);

    const MIN = 2010;
    const MAX = 2030;

    const clamp = (v: number) => Math.min(MAX, Math.max(MIN, Math.round(v)));

    const clientXToValue = (clientX: number) => {
        const track = trackRef.current;
        if (!track) return MIN;
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.min(1, Math.max(0, x / rect.width));
        return clamp(MIN + pct * (MAX - MIN));
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!dragging.current) return;
        const value = clientXToValue(e.clientX);
        if (dragging.current === 'start') setStartYear(Math.min(value, endYear));
        else setEndYear(Math.max(value, startYear));
    };

    const startRef = useRef<number>(startYear);
    const endRef = useRef<number>(endYear);

    useEffect(() => {
        const sFinal = Math.min(startYear, endYear);
        const eFinal = Math.max(startYear, endYear);
        setStartYear(sFinal);
        setEndYear(eFinal);
        startRef.current = sFinal;
        endRef.current = eFinal;
        setLoading(true);
        getRegionRankings(sFinal, eFinal).then(res => setResults(res)).finally(() => setLoading(false));
    }, []);

    const sortedResults = useMemo(() => {
        const copy = [...results];
        const key = sortKey;
        copy.sort((a: any, b: any) => {
            const va = (a as any)[key] ?? 0;
            const vb = (b as any)[key] ?? 0;
            if (va !== vb) return vb - va;
            const olympic = ['gold', 'silver', 'bronze', 'participations'];
            for (const k of olympic) {
                if (k === key) continue;
                const ka = (a as any)[k] ?? 0;
                const kb = (b as any)[k] ?? 0;
                if (ka !== kb) return kb - ka;
            }
            const nameA = a.region ?? '';
            const nameB = b.region ?? '';
            return nameA.localeCompare(nameB);
        });
        return copy;
    }, [results, sortKey]);

    useEffect(() => { startRef.current = startYear; }, [startYear]);
    useEffect(() => { endRef.current = endYear; }, [endYear]);

    const onPointerUp = () => {
        dragging.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        const s = Math.min(startRef.current, endRef.current);
        const e = Math.max(startRef.current, endRef.current);
        setLoading(true);
        getRegionRankings(s, e).then(res => setResults(res)).finally(() => setLoading(false));
    };

    const onThumbPointerDown = (which: 'start'|'end', e: any) => {
        e.preventDefault();
        dragging.current = which;
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    

    return <>
        <MetaTags title={t('AllRegionsRanking')} description={t('meta.ranking', { title: t('AllRegionsRanking') })} />
        <div className='panel'>
            <p className='title'>{t('AllRegionsRanking')}</p>
            <div className='range-container'>
                <div className='range-values'>{startYear} — {endYear}</div>
                <div className='range-track' ref={el => trackRef.current = el}>
                    <div className='range-background' />
                    {(() => {
                        const MIN = 2010;
                        const MAX = 2030;
                        const left = ((Math.min(startYear, endYear) - MIN) / (MAX - MIN)) * 100;
                        const right = ((Math.max(startYear, endYear) - MIN) / (MAX - MIN)) * 100;
                        const width = Math.max(0, right - left);
                        return <div className='range-fill' style={{ left: `${left}%`, width: `${width}%` }} />;
                    })()}
                    {(() => {
                        const left = ((startYear - MIN) / (MAX - MIN)) * 100;
                        const right = ((endYear - MIN) / (MAX - MIN)) * 100;
                        return (
                            <>
                                <div className='thumb' style={{ left: `${left}%` }} onPointerDown={e => onThumbPointerDown('start', e)} />
                                <div className='thumb' style={{ left: `${right}%` }} onPointerDown={e => onThumbPointerDown('end', e)} />
                            </>
                        );
                    })()}
                </div>
                <div />
            </div>
        </div>
        {loading ? <Loading /> : (
            <table>
                <tbody>
                    <tr>
                        <th>{t('Region')}</th>
                        <th className='gold' style={{ cursor: 'pointer' }} onClick={() => setSortKey('gold')}>{t('Gold')}</th>
                        <th className='silver' style={{ cursor: 'pointer' }} onClick={() => setSortKey('silver')}>{t('Silver')}</th>
                        <th className='bronze' style={{ cursor: 'pointer' }} onClick={() => setSortKey('bronze')}>{t('Bronze')}</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => setSortKey('medals')}>{t('Medals')}</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => setSortKey('participations')}>{t('Participations')}</th>
                    </tr>
                    {sortedResults.map((r: any) => (
                        <tr key={r.region}>
                            <td><Link to={`/region/${r.region}`}>{r.region}</Link></td>
                            <td className='gold'>{r.gold}</td>
                            <td className='silver'>{r.silver}</td>
                            <td className='bronze'>{r.bronze}</td>
                            <td>{r.medals}</td>
                            <td>{r.participations}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </>;
}
