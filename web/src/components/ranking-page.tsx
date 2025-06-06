import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { RankingNumber, RankingResult } from '../model/result';
import { getInstitutionById, getRanking, } from '../rest/rest';
import { Institution } from '../model/institution';
import { useTranslation } from 'react-i18next';
import { Loading } from './loading';
import { MetaTags } from './meta-tags';

export const RankingPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState<RankingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [institution, setInstitution] = useState<Institution | null>();
    
    useEffect(() => {
        setLoading(true);
        Promise.all([
            getRanking(
                searchParams.get("region")!, 
                searchParams.get("institution")!, 
                Number(searchParams.get("year")!)
            ).then(setResults),
            searchParams.has("institution") 
                ? getInstitutionById(Number(searchParams.get("institution")))
                    .then(setInstitution)
                : Promise.resolve()
        ]).finally(() => setLoading(false));
    }, [searchParams]);

    const table = useMemo(() => {
        let display = 0;
        let count = 0;
        let last: RankingNumber;
        
        return results.map(result => {
            let cur = { ...result };
            cur.person = { id: 0, name: '', schoolYear: 0 };
            count += 1;
            if (JSON.stringify(cur) != JSON.stringify(last)) {
                display = count;
            }
            last = cur;
            return (
                <tr key={result.person.id}>
                    <td>{display}</td>
                    <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                    <td className='gold'>{result.gold}</td>
                    <td className='silver'>{result.silver}</td>
                    <td className='bronze'>{result.bronze}</td>
                    <td>{result.medals}</td>
                    <td>{result.participations}</td>
                </tr>
            );
        });
    }, [results, t]);

    const title = useMemo(() => 
        searchParams.size ? t("Title Ranking", {
            title: (searchParams.has("region") ? searchParams.get("region") :
                searchParams.has("institution") && institution ? institution.name :
                searchParams.get("year") ? `${Number(searchParams.get("year")!) + 5} - ${Number(searchParams.get("year")!) + 12}` : "")
        }) : t("All-time Ranking")
    , [searchParams, institution, t]);

    return <>
        <MetaTags
            title={title}
            description={t("meta.ranking", { title: title })}
        />
        <div className='panel'>
            <p className='title'> {title}</p>
        </div>
        {loading ? (
            <Loading />
        ) : (
            <table>
                <tbody>
                    <tr>
                        <th>{t("Position")}</th>
                        <th>{t("Name")}</th>
                        <th className='gold'>{t("Gold")}</th>
                        <th className='silver'>{t("Silver")}</th>
                        <th className='bronze'>{t("Bronze")}</th>
                        <th>{t("Medals")}</th>
                        <th>{t("Participations")}</th>
                    </tr>
                    {table}
                </tbody>
            </table>
        )}
    </>;
}