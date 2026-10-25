import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ranking.css';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags, ScopeSelector } from '../common/components';
import { getRegionRankings } from '../api/rest';
import { useRangeSlider } from '../common/hooks/useRangeSlider';
import { useSorting } from '../common/hooks/useSorting';
import { useYearRangeParams } from '../common/hooks/useYearRangeParams';
import { useContestYearBounds } from '../common/hooks/useContestYearBounds';
import { useScopeParam } from '../common/hooks/useScopeParam';
import { useSubject } from '../common/subject';
import { SCOPE_ONI } from '../constants';
import { RangeSelector } from '../common/components/RangeSelector';

export const RegionsRankingPage = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { scope, scopeLink, scopes } = useScopeParam();
    const { subject } = useSubject();

    /* The range follows the editions of whichever contests are being counted. */
    const { minYear, maxYear, loading: boundsLoading } = useContestYearBounds(scope === SCOPE_ONI);

    /* The URL is the source of truth for the range, so it stays shareable. */
    const { startYear: paramStart, endYear: paramEnd, setRange, min, max } = useYearRangeParams(minYear, maxYear);

    const range = useRangeSlider({
        min,
        max,
        initialStart: paramStart,
        initialEnd: paramEnd,
        onChange: setRange
    });

    const { startYear, endYear, trackRef, onThumbPointerDown } = range;

    const { sortedItems: sortedResults, setSortKey, positions } = useSorting(results, 'gold', (item: any) => item.region ?? '');

    useEffect(() => {
        if (boundsLoading) return;
        /* Switching subject or scope can leave an older request in flight;
           only the latest one may set the table. */
        let active = true;
        setLoading(true);
        getRegionRankings(paramStart, paramEnd, scope, subject)
            .then(res => { if (active) setResults(res); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [paramStart, paramEnd, scope, subject, boundsLoading]);

    return <>
        <MetaTags title={t('AllRegionsRanking')} description={t('meta.ranking', { title: t('AllRegionsRanking') })} />
        <div className='panel'>
            <p className='title'>{t('AllRegionsRanking')}</p>
            <RangeSelector
                startYear={startYear}
                endYear={endYear}
                min={min}
                max={max}
                trackRef={trackRef}
                onThumbPointerDown={onThumbPointerDown}
            />
            {/* Below the range, so the filters read top to bottom in one group. */}
            <ScopeSelector scope={scope} scopes={scopes} scopeLink={scopeLink} />
        </div>
        {loading || boundsLoading ? <Loading /> : (
            <table>
                <tbody>
                    <tr>
                        <th>{t('Position')}</th>
                        <th>{t('Region')}</th>
                        <th className='gold' onClick={() => setSortKey('gold')}>{t('Gold')}</th>
                        <th className='silver' onClick={() => setSortKey('silver')}>{t('Silver')}</th>
                        <th className='bronze' onClick={() => setSortKey('bronze')}>{t('Bronze')}</th>
                        <th onClick={() => setSortKey('medals')}>{t('Medals')}</th>
                        <th onClick={() => setSortKey('participations')}>{t('Participations')}</th>
                    </tr>
                    {sortedResults.map((r: any, index: number) => (
                        <tr key={r.region}>
                            <td>{positions[index]}</td>
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
