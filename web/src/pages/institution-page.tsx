import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Result, getMedalClass } from '../model/result';
import { getInstitutionById, getResultsForInstitution } from '../api/rest';
import { Institution } from '../model/institution';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags } from '../common/components';

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
        return <>
            <MetaTags title={t('InstitutionNotFound') ?? 'Institution not found'} description={t('InstitutionNotFound') ?? 'Institution not found'} />
            <div className='panel'>
                <p className='title'>Institution not found</p>
            </div>
        </>;
    }

    return <>
        <MetaTags
            title={institution.name}
            description={t("meta.institution", {
                name: institution.name,
                city: institution.city,
                region: institution.region
            })}
        />
        <div className='panel'>
            <p className='title'>{institution.name}</p>
            <p className='subtitle'>{institution.city},  {institution.region}</p >
            <p className='subtitle'><Link to={`/rankings/people?institution=${institution.id}`}>{t("TopPeopleAtInstitution")}</Link></p>
            <p className='subsubtitle'><Link to={`/rankings/institutions`}>{t("AllInstitutionsRanking")}</Link></p>
        </div>
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
