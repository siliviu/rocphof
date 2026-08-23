import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ranking.css';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags } from '../common/components';
import { getInstitutionRankings } from '../api/rest';
import { useRangeSlider } from '../common/hooks/useRangeSlider';
import { useSorting } from '../common/hooks/useSorting';
import { useYearRangeParams } from '../common/hooks/useYearRangeParams';
import { useContestYearBounds } from '../common/hooks/useContestYearBounds';
import { CONTEST_ONI } from '../constants';
import { RangeSelector } from '../common/components/RangeSelector';

export const InstitutionsRankingPage = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    /* Institutions are only recorded for ONI, so the range follows its editions. */
    const { minYear, maxYear, loading: boundsLoading } = useContestYearBounds(CONTEST_ONI);

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

    const { sortedItems: sortedResults, setSortKey, positions } = useSorting(results, 'gold', (item: any) => item.institution?.name ?? '');

    useEffect(() => {
        if (boundsLoading) return;
        setLoading(true);
        getInstitutionRankings(paramStart, paramEnd)
            .then(res => setResults(res))
            .finally(() => setLoading(false));
    }, [paramStart, paramEnd, boundsLoading]);

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
        </div>
        {loading || boundsLoading ? <Loading /> : (
            <table>
                <tbody>
                    <tr>
                        <th>{t('Position')}</th>
                        <th>{t('Institution')}</th>
                        <th>{t('Region')}</th>
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
                            <td><Link to={`/region/${r.institution.region}`}>{r.institution.region}</Link></td>
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
