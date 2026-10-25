import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ranking.css';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags, ScopeSelector } from '../common/components';
import { getInstitutionRankings } from '../api/rest';
import { useRangeSlider } from '../common/hooks/useRangeSlider';
import { useSorting } from '../common/hooks/useSorting';
import { useYearRangeParams } from '../common/hooks/useYearRangeParams';
import { useContestYearBounds } from '../common/hooks/useContestYearBounds';
import { useScopeParam } from '../common/hooks/useScopeParam';
import { useSubject } from '../common/subject';
import { SCOPE_ONI } from '../constants';
import { RangeSelector } from '../common/components/RangeSelector';

export const InstitutionsRankingPage = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

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

    /* The fetched ranking already names every institution's region, so the
       filter is applied client side and needs no extra request. */
    const region = searchParams.get('region') ?? '';

    const regions = useMemo(() => [...new Set(
        results.map(result => result.institution?.region).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b)), [results]);

    const filteredResults = useMemo(() => region
        ? results.filter(result => result.institution?.region === region)
        : results, [results, region]);

    /* Kept in the URL like the year range, so a filtered ranking is shareable. */
    const setRegion = (next: string) => {
        const params = new URLSearchParams(searchParams);
        if (next) params.set('region', next);
        else params.delete('region');
        setSearchParams(params);
    };

    const { sortedItems: sortedResults, setSortKey, positions } = useSorting(filteredResults, 'gold', (item: any) => item.institution?.name ?? '');

    useEffect(() => {
        if (boundsLoading) return;
        /* Switching subject or scope can leave an older request in flight;
           only the latest one may set the table. */
        let active = true;
        setLoading(true);
        getInstitutionRankings(paramStart, paramEnd, scope, subject)
            .then(res => { if (active) setResults(res); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [paramStart, paramEnd, scope, subject, boundsLoading]);

    return <>
        <MetaTags title={t('AllInstitutionsRanking')} description={t('meta.ranking', { title: t('AllInstitutionsRanking') })} />
        <div className='panel'>
            <p className='title'>{t('AllInstitutionsRanking')}</p>
            <RangeSelector
                startYear={startYear}
                endYear={endYear}
                min={min}
                max={max}
                trackRef={trackRef}
                onThumbPointerDown={onThumbPointerDown}
            />
            <ScopeSelector scope={scope} scopes={scopes} scopeLink={scopeLink} />
            <div className='ranking-filter'>
                <label htmlFor='region-filter'>{t('Region')}</label>
                <select
                    id='region-filter'
                    value={region}
                    onChange={event => setRegion(event.target.value)}
                >
                    <option value=''>{t('AllRegions')}</option>
                    {regions.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
        </div>
        {loading || boundsLoading ? <Loading /> : (
            <table>
                <tbody>
                    <tr>
                        <th>{t('Position')}</th>
                        <th>{t('Institution')}</th>
                        <th>{region ? t('City') : t('Region')}</th>
                        <th className='gold' onClick={() => setSortKey('gold')}>{t('Gold')}</th>
                        <th className='silver' onClick={() => setSortKey('silver')}>{t('Silver')}</th>
                        <th className='bronze' onClick={() => setSortKey('bronze')}>{t('Bronze')}</th>
                        <th onClick={() => setSortKey('medals')}>{t('Medals')}</th>
                        <th onClick={() => setSortKey('participations')}>{t('Participations')}</th>
                    </tr>
                    {sortedResults.map((r: any, index: number) => (
                        <tr key={r.institution.id}>
                            <td>{positions[index]}</td>
                            <td><Link to={`/institution/${r.institution.id}`}>{r.institution.name}</Link></td>
                            {region
                                ? <td>{r.institution.city}</td>
                                : <td><Link to={`/region/${r.institution.region}`}>{r.institution.region}</Link></td>}
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

