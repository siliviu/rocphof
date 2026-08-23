import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { RankingNumber, RankingResult } from '../model/result';
import { getInstitutionById, getPeopleRanking } from '../api/rest';
import { Institution } from '../model/institution';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags } from '../common/components';
import { NotFoundPanel } from '../common/components/NotFoundPanel';
import { useGenerationBounds } from '../common/hooks/useContestYearBounds';
import { MIN_GRADE, MAX_GRADE } from '../constants';
import './contest-page.css';
import './ranking-page.css';

export const RankingPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState<RankingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [institution, setInstitution] = useState<Institution | null>();

    const yearParam = searchParams.get("year");
    const generation = yearParam ? Number(yearParam) : null;

    const { minGeneration, maxGeneration, loading: boundsLoading } = useGenerationBounds(MIN_GRADE, MAX_GRADE);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getPeopleRanking(
                searchParams.get("region"),
                searchParams.get("institution"),
                generation
            ).then(setResults),
            searchParams.has("institution") 
                ? getInstitutionById(Number(searchParams.get("institution")))
                    .then(setInstitution)
                : Promise.resolve()
        ]).finally(() => setLoading(false));
    }, [searchParams]);

    /* Other filters are preserved, so stepping years keeps any region or
       institution already applied. */
    const generationLink = (start: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("year", String(start));
        return `?${params}`;
    };

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
                generation ? `${generation + MIN_GRADE} - ${generation + MAX_GRADE}` : "")
        }) : t("All-time Ranking")
    , [searchParams, institution, generation, t]);

    return <>
        <MetaTags
            title={title}
            description={t("meta.ranking", { title: title })}
        />
        <div className='panel'>
            {generation !== null ? (
                <>
                    <p className='title selector wide-selector'>
                        {generation > minGeneration
                            ? <Link className='arrow' to={generationLink(generation - 1)}>&lt; </Link>
                            : <div />}
                        <span>{title}</span>
                        {generation < maxGeneration
                            ? <Link className='arrow' to={generationLink(generation + 1)}> &gt;</Link>
                            : <div />}
                    </p>
                    <p className='subsubtitle'>
                        <Link to='/rankings/people'>{t("All-time Ranking")}</Link>
                    </p>
                </>
            ) : (
                <>
                    <p className='title'> {title}</p>
                    {!searchParams.size && !boundsLoading && <p className='subsubtitle'>
                        <Link to={`/rankings/people?year=${maxGeneration}`}>{t("Generation Ranking")}</Link>
                    </p>}
                </>
            )}
        </div>
        {loading ? (
            <Loading />
        ) : (
            <> 
                {searchParams.has("institution") && !institution ? (
                    <NotFoundPanel messageKey={'InstitutionNotFound'} />
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
            </>
        )}
    </>;
}
