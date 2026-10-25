import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { EntityHeader } from '../common/components/EntityHeader';
import { NotFoundPanel } from '../common/components/NotFoundPanel';
import './ranking.css';
import { Result, getMedalClass } from '../model/result';
import { getResultsForRegion } from '../api/rest';
import { matchesSubject } from '../model/contest';
import { useSubject } from '../common/subject';
import { useTranslation } from 'react-i18next';
import { Loading, MedalTally, MetaTags } from '../common/components';
import { MedalChart, toMedalChartEntries } from '../common/components/medal-chart';

export const RegionPage = () => {
    const { region } = useParams();
    const { t } = useTranslation();
    const [allResults, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const { subject } = useSubject();

    useEffect(() => {
        getResultsForRegion(region!)
            .then(setResults)
            .finally(() => setLoading(false));
    }, [region]);

    /* Fetched once for every subject; switching subject only re-filters. */
    const results = useMemo(() =>
        allResults.filter(result => matchesSubject(result.contest, subject))
        , [allResults, subject]);

    const chartEntries = useMemo(() => toMedalChartEntries(results), [results]);

    const table = useMemo(() => 
        results.map((result: Result) =>
            <tr key={result.id} className={getMedalClass(result.medal)}>
                <td>{result.contest.year}</td>
                <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                <td>{result.institution!.city}</td>
                <td><Link to={`/institution/${result.institution!.id}`}>{result.institution!.name}</Link></td>
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
                title={region ?? ""}
                description={t("meta.region", {region: region ?? ""})}
            />
            <Loading />
        </>;
    }

    if (!region || allResults.length === 0) {
        return <NotFoundPanel messageKey={'RegionNotFound'} />;
    }

    return <>
        <EntityHeader
            title={region}
            subtitleHref={`/rankings/people?region=${region}`}
            subtitleText={t("TopPeopleInRegion")}
            secondaryLinks={[
                { href: `/rankings/institutions?region=${encodeURIComponent(region)}`, text: t("TopInstitutionsInRegion") },
                { href: `/rankings/regions`, text: t("AllRegionsRanking") },
            ]}
        />
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
                    <th>{t("City")}</th>
                    <th>{t("Institution")}</th>
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
