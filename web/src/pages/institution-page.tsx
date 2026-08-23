import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { NotFoundPanel } from '../common/components/NotFoundPanel';
import './ranking.css';
import './institution-page.css';
import { Result, getMedalClass } from '../model/result';
import { getInstitutionById, getResultsForInstitution } from '../api/rest';
import { Institution } from '../model/institution';
import { useTranslation } from 'react-i18next';
import { Loading, MedalTally, MetaTags } from '../common/components';
import { MedalChart, toMedalChartEntries } from '../common/components/medal-chart';

export const InstitutionPage = () => {
    const { id: idParam } = useParams();
    const { t } = useTranslation();
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const id = Number(idParam);

    useEffect(() => {
        Promise.all([
            getInstitutionById(id)
                .then(institution => {
                    setInstitution(institution);
                }),
            getResultsForInstitution(id)
                .then(setResults)
        ]).finally(() => setLoading(false));
    }, [id]);

    const chartEntries = useMemo(() => toMedalChartEntries(results), [results]);

    const table = useMemo(() =>
        results.map(result =>
            <tr key={result.id} className={getMedalClass(result.medal)}>
                <td>{result.contest.year}</td>
                <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                <td>{result.score}</td>
                <td>{result.place}</td>
                <td>{result.prize ? t(`Prize.${result.prize}`) : ''}</td>
                <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>
            </tr>
        )
        , [results, t]);

    if (loading) {
        return <>
            <MetaTags
                title={institution?.name}
                description={t("meta.institution", {
                    name: institution?.name,
                    city: institution?.city,
                    region: institution?.region
                })}
            />
            <Loading />
        </>;
    }

    if (!institution) {
        return <NotFoundPanel messageKey={'InstitutionNotFound'} />;
    }

    return <>
        <div className='panel'>
            <p className='title'>{institution.name}</p>
            <p className='subtitle'>{institution.city ? `${institution.city}, ` : ''}{institution.region}</p>
            <p className='subtitle'><Link to={`/rankings/people?institution=${institution.id}`}>{t("TopPeopleAtInstitution")}</Link></p>
            <div className='institution-links'>
                <Link className='subsubtitle' to={`/region/${encodeURIComponent(institution.region)}`}>
                    {t("RegionResults", { region: institution.region })}
                </Link>
                <Link className='subsubtitle' to={`/rankings/institutions`}>{t("AllInstitutionsRanking")}</Link>
            </div>
        </div>
        {chartEntries.length > 0 && <div className='panel'>
            <p className='subtitle'>{t('MedalEvolution')}</p>
            <MedalChart entries={chartEntries} />
            <MedalTally entries={chartEntries} />
        </div>}
        <table>
            <tbody>
                <tr>
                    <th>{t("Year")}</th>
                    <th>{t("Grade")}</th>
                    <th>{t("Name")}</th>
                    <th>{t("Score")}</th>
                    <th>{t("Place")}</th>
                    <th>{t("Prize")}</th>
                    <th>{t("Medal")}</th>
                </tr>
                {table}
            </tbody>
        </table>
    </>;
}
