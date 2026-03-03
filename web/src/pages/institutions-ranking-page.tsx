import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ranking.css';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags } from '../common/components';
import { getInstitutionRankings } from '../api/rest';
import { useRangeSlider } from '../common/hooks/useRangeSlider';
import { useSorting } from '../common/hooks/useSorting';

export const InstitutionsRankingPage = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const range = useRangeSlider({
        min: 2010,
        max: 2030,
        initialStart: 2010,
        initialEnd: 2030,
        onChange: (s, e) => {
            setLoading(true);
            getInstitutionRankings(s, e).then(res => setResults(res)).finally(() => setLoading(false));
        }
    });

    const { startYear, endYear, trackRef, onThumbPointerDown, min, max } = range;

    const { sortedItems: sortedResults, setSortKey } = useSorting(results, 'gold', (item: any) => item.institution?.name ?? '');

    useEffect(() => {
        // initial fetch
        const sFinal = Math.min(startYear, endYear);
        const eFinal = Math.max(startYear, endYear);
        setLoading(true);
        getInstitutionRankings(sFinal, eFinal).then(res => setResults(res)).finally(() => setLoading(false));
    }, []);

    return <>
        <MetaTags title={t('AllInstitutionsRanking')} description={t('meta.ranking', { title: t('AllInstitutionsRanking') })} />
        <div className='panel'>
            <p className='title'>{t('AllInstitutionsRanking')}</p>
            <div className='range-container'>
                <div className='range-values'>{startYear} — {endYear}</div>
                <div className='range-track' ref={el => trackRef.current = el}>
                    <div className='range-background' />
                    {(() => {
                        const left = ((Math.min(startYear, endYear) - min) / (max - min)) * 100;
                        const right = ((Math.max(startYear, endYear) - min) / (max - min)) * 100;
                        const width = Math.max(0, right - left);
                        return <div className='range-fill' style={{ left: `${left}%`, width: `${width}%` }} />;
                    })()}
                    {(() => {
                        const left = ((startYear - min) / (max - min)) * 100;
                        const right = ((endYear - min) / (max - min)) * 100;
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
                        <th>{t('Institution')}</th>
                        <th>{t('Region')}</th>
                        <th className='gold' style={{ cursor: 'pointer' }} onClick={() => setSortKey('gold')}>{t('Gold')}</th>
                        <th className='silver' style={{ cursor: 'pointer' }} onClick={() => setSortKey('silver')}>{t('Silver')}</th>
                        <th className='bronze' style={{ cursor: 'pointer' }} onClick={() => setSortKey('bronze')}>{t('Bronze')}</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => setSortKey('medals')}>{t('Medals')}</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => setSortKey('participations')}>{t('Participations')}</th>
                    </tr>
                    {sortedResults.map((r: any) => (
                        <tr key={r.institution.id}>
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
