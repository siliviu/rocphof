import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Result, getMedalClass } from '../model/result';
import { getResultsForRegion } from '../api/rest';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags } from '../common/components';

export const RegionPage = () => {
    const { region } = useParams();
    const { t } = useTranslation();
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getResultsForRegion(region!)
            .then(setResults)
            .finally(() => setLoading(false));
    }, [region]);

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

    if (!region || results.length === 0) {
        return <>
            <MetaTags 
                title={t('RegionNotFound') ?? 'Region not found'}
                description={t('RegionNotFound') ?? 'Region not found'}
            />
            <div className='panel'>
                <p className='title'>{t('RegionNotFound') ?? 'Region not found'}</p>
            </div>
        </>;
    }

    return <>
        <MetaTags 
            title={region}
            description={t("meta.region", {region})}
        />
        <div className='panel'>
            <p className='title'>{region}</p>
            <p className='subtitle'><Link to={`/rankings/people?region=${region}`}>{t("TopPeopleInRegion")}</Link></p>
            <p className='subsubtitle'><Link to={`/rankings/regions`}>{t("AllRegionsRanking")}</Link></p>
        </div>
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
