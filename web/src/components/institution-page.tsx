import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Result, getMedalClass } from '../model/result';
import { getInstitutionById, getResultsForInstitution } from '../rest/rest';
import { Institution } from '../model/institution';
import { useTranslation } from 'react-i18next';
import { Loading } from './loading';
import { MetaTags } from './meta-tags';

export const InstitutionPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        Promise.all([
            getInstitutionById(Number(id))
                .then(institution => {
                    setInstitution(institution);
                }),
            getResultsForInstitution(Number(id))
                .then(setResults)
        ]).finally(() => setLoading(false));
    }, [id]);

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

    return <>
        <MetaTags
            title={institution?.name}
            description={t("meta.institution", { 
                name: institution?.name,
                city: institution?.city,
                region: institution?.region
            })}
        />
        <div className='panel'>
            <p className='title'>{institution && institution.name}</p>
            <p className='subtitle'>{institution && institution.city},  {institution && institution.region}</p >
            <p className='subtitle'><Link to={institution ? `/ranking?institution=${institution.id}` : ''}>{t("Institution Ranking")}</Link></p>
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