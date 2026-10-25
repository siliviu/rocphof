import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { RankingByColumn, RankingResult } from '../model/result';
import { getInstitutionById, getInternationalColumns, getInternationalRanking, getPeopleRanking } from '../api/rest';
import { Institution } from '../model/institution';
import { useTranslation } from 'react-i18next';
import { Loading, MetaTags, ScopeSelector } from '../common/components';
import { ColumnLayout, ColumnRankingTable } from '../common/components/column-ranking-table';
import { NotFoundPanel } from '../common/components/NotFoundPanel';
import { useGenerationBounds } from '../common/hooks/useContestYearBounds';
import { useScopeParam } from '../common/hooks/useScopeParam';
import { useSubject } from '../common/subject';
import { useSorting } from '../common/hooks/useSorting';
import { MIN_GRADE, MAX_GRADE, SCOPE_INTERNATIONAL } from '../constants';
import './contest-page.css';

export const RankingPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState<RankingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [institution, setInstitution] = useState<Institution | null>();

    const yearParam = searchParams.get("year");
    const generation = yearParam ? Number(yearParam) : null;

    const { minGeneration, maxGeneration, loading: boundsLoading } = useGenerationBounds(MIN_GRADE, MAX_GRADE);

    const { scope, scopeLink, scopes } = useScopeParam();
    const { subject } = useSubject();
    const isInternational = scope === SCOPE_INTERNATIONAL;

    /* The international scope is a per-contest breakdown, so it has its own
       results shape and its own request. */
    const [columnResults, setColumnResults] = useState<RankingByColumn[]>([]);
    const [layout, setLayout] = useState<ColumnLayout>({ order: [], participationOnly: [] });

    useEffect(() => {
        if (!isInternational) return;
        getInternationalColumns(subject)
            .then(setLayout)
            .catch(() => setLayout({ order: [], participationOnly: [] }));
    }, [isInternational, subject]);

    useEffect(() => {
        /* Switching subject or scope can leave an older request in flight;
           only the latest one may set the table. */
        let active = true;
        const keep = <T,>(set: (value: T) => void) => (value: T) => { if (active) set(value); };
        setLoading(true);
        if (isInternational) {
            Promise.all([
                getInternationalRanking(
                    null,
                    null,
                    searchParams.get("region"),
                    searchParams.get("institution"),
                    generation,
                    subject
                ).then(keep(setColumnResults))
                    .catch(() => keep(setColumnResults)([])),
                searchParams.has("institution")
                    ? getInstitutionById(Number(searchParams.get("institution")))
                        .then(keep(setInstitution))
                    : Promise.resolve()
            ]).finally(() => keep(setLoading)(false));
            return () => { active = false; };
        }
        Promise.all([
            getPeopleRanking(
                searchParams.get("region"),
                searchParams.get("institution"),
                generation,
                scope,
                subject
            ).then(keep(setResults)),
            searchParams.has("institution") 
                ? getInstitutionById(Number(searchParams.get("institution")))
                    .then(keep(setInstitution))
                : Promise.resolve()
        ]).finally(() => keep(setLoading)(false));
        return () => { active = false; };
    }, [searchParams, generation, scope, isInternational, subject]);

    /* Other filters are preserved, so stepping years keeps any region or
       institution already applied. */
    const generationLink = (start: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("year", String(start));
        return `?${params}`;
    };

    /* Drops only the generation, so the scope and any place filter survive. */
    const allTimeLink = (() => {
        const params = new URLSearchParams(searchParams);
        params.delete("year");
        const query = params.toString();
        return query ? `?${query}` : '/rankings/people';
    })();

    const { sortedItems: sortedResults, setSortKey, positions } = useSorting(
        results, 'gold', (item: RankingResult) => item.person.name
    );

    const table = useMemo(() =>
        sortedResults.map((result: RankingResult, index: number) => (
            <tr key={result.person.id}>
                <td>{positions[index]}</td>
                <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                <td className='gold'>{result.gold}</td>
                <td className='silver'>{result.silver}</td>
                <td className='bronze'>{result.bronze}</td>
                <td>{result.medals}</td>
                <td>{result.participations}</td>
            </tr>
        ))
    , [sortedResults, positions]);


    /* Scope is not a filter on the ranking's subject, so it must not turn the
       all-time title into a filtered one. */
    const hasFilter = searchParams.has("region") || searchParams.has("institution") || generation !== null;

    const title = useMemo(() => 
        hasFilter ? t("Title Ranking", {
            title: (searchParams.has("region") ? searchParams.get("region") :
                searchParams.has("institution") && institution ? institution.name :
                generation ? `${generation + MIN_GRADE} - ${generation + MAX_GRADE}` : "")
        }) : t("All-time Ranking")
    , [hasFilter, searchParams, institution, generation, t]);

    return <>
        <MetaTags
            title={title}
            description={t("meta.ranking", { title: title })}
        />
        <div className='panel'>
            {generation !== null ? (
                <>
                    <p className='title selector'>
                        {generation > minGeneration
                            ? <Link className='arrow' to={generationLink(generation - 1)}>&lt; </Link>
                            : <div />}
                        <span>{title}</span>
                        {generation < maxGeneration
                            ? <Link className='arrow' to={generationLink(generation + 1)}> &gt;</Link>
                            : <div />}
                    </p>
                    <p className='subsubtitle'>
                        <Link to={allTimeLink}>{t("All-time Ranking")}</Link>
                    </p>
                </>
            ) : (
                <>
                    <p className='title'> {title}</p>
                    {!hasFilter && !boundsLoading && <p className='subsubtitle'>
                        <Link to={`/rankings/people?year=${maxGeneration}`}>{t("Generation Ranking")}</Link>
                    </p>}
                </>
            )}
            <ScopeSelector scope={scope} scopes={scopes} scopeLink={scopeLink} />
        </div>
        {loading ? (
            <Loading />
        ) : searchParams.has("institution") && !institution ? (
            <NotFoundPanel messageKey={'InstitutionNotFound'} />
        ) : isInternational ? (
            <ColumnRankingTable results={columnResults} layout={layout} />
        ) : (
            <table>
                <tbody>
                    <tr>
                        <th>{t("Position")}</th>
                        <th>{t("Name")}</th>
                        <th className='gold' onClick={() => setSortKey('gold')}>{t("Gold")}</th>
                        <th className='silver' onClick={() => setSortKey('silver')}>{t("Silver")}</th>
                        <th className='bronze' onClick={() => setSortKey('bronze')}>{t("Bronze")}</th>
                        <th onClick={() => setSortKey('medals')}>{t("Medals")}</th>
                        <th onClick={() => setSortKey('participations')}>{t("Participations")}</th>
                    </tr>
                    {table}
                </tbody>
            </table>
        )}
    </>;
}

