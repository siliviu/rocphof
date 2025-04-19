import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Result, getMedalClass } from '../model/result';
import { getResultsForRegion } from '../rest/rest';
import { useTranslation } from 'react-i18next';
import { Loading } from './loading';

export const RegionPage = () => {
    const { region } = useParams();
    const { t, i18n } = useTranslation();
    const [table, setTable] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getResultsForRegion(region!)
            .then(results => {
                setTable(results.map((result: Result) =>
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
                ))
            })
            .finally(() => setLoading(false));
    }, [i18n.language]);

    document.title = region ?? "";
    
    return <>
        <div className='panel'>
            <p className='title'>{region}</p>
            <p className='subtitle'><Link to={`/ranking?region=${region}`}>{t("Region Ranking")}</Link></p>
        </div>
        {loading ? (
            <Loading />
        ) : (
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
        )}
    </>;
}