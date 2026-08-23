import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllContests, getResultsForContestName } from '../api/rest';
import { Contest, isInternational } from '../model/contest';
import { Result, getMedalClass } from '../model/result';
import { CONTEST_DEFAULT_HISTORY, GRADE_INTERNATIONAL } from '../constants';
import { InfoTooltip, Loading, MedalTally, MetaTags } from '../common/components';
import { MedalChart, toMedalChartEntries } from '../common/components/medal-chart';
import { NotFoundPanel } from '../common/components/NotFoundPanel';import './contest-history-page.css';

interface Edition {
    contest: Contest;
    results: Result[];
}

export const ContestHistoryPage = () => {
    const { name: nameParam } = useParams();
    const { t } = useTranslation();
    const [results, setResults] = useState<Result[]>([]);
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const name = nameParam ?? CONTEST_DEFAULT_HISTORY;

    useEffect(() => {
        setLoading(true);
        getResultsForContestName(name)
            .then(setResults)
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [name]);

    useEffect(() => {
        getAllContests()
            .then((contests: Contest[]) => setNames(
                [...new Set(contests.filter(isInternational).map(contest => contest.name))].sort()
            ))
            .catch(() => setNames([]));
    }, []);

    /* One call returns every edition; the nested contest on each result is
       enough to group them, newest first. */
    const editions = useMemo(() => {
        const byContest = new Map<number, Edition>();
        results.forEach(result => {
            const edition = byContest.get(result.contest.id);
            if (edition) edition.results.push(result);
            else byContest.set(result.contest.id, { contest: result.contest, results: [result] });
        });
        return [...byContest.values()].sort((a, b) => b.contest.year - a.contest.year);
    }, [results]);

    const chartEntries = useMemo(() => toMedalChartEntries(results), [results]);

    const selector = (
        <div className='history-selector'>
            {names.map(other => other === name
                ? <span key={other} className='history-selected'>{other}</span>
                : <Link key={other} to={`/history/${other}`}>{other}</Link>
            )}
        </div>
    );

    if (loading) {
        return <>
            <MetaTags title={t('ContestHistory', { name })} description={t('meta.contest_history', { name })} />
            <Loading />
        </>;
    }

    if (!editions.length) {
        return <NotFoundPanel messageKey={'ContestNotFound'} />;
    }

    return <>
        <MetaTags title={t('ContestHistory', { name })} description={t('meta.contest_history', { name })} />
        <div className='panel'>
            <p className='title'>
                <span>{t('ContestHistory', { name })}</span>
                <InfoTooltip translationKey='tooltip.firstTeamOnly' />
            </p>
            {selector}
        </div>
        <div className='panel'>
            <p className='subtitle'>{t('MedalEvolution')}</p>
            <MedalChart entries={chartEntries} />
            <MedalTally entries={chartEntries} />
        </div>
        <table>
            <colgroup>
                <col className='year' />
                <col className='place' />
                <col className='name' />
                <col className='grade' />
                <col className='score' />
                <col className='medal' />
            </colgroup>
            <tbody>
                <tr>
                    <th>{t('Year')}</th>
                    <th>{t('Place')}</th>
                    <th>{t('Name')}</th>
                    <th>{t('Grade')}</th>
                    <th>{t('Score')}</th>
                    <th>{t('Medal')}</th>
                </tr>
                {editions.map(({ contest, results: editionResults }) =>
                    editionResults.map((result, index) => (
                        <tr key={result.id} className={getMedalClass(result.medal)}>
                            {index === 0 && (
                                <td className='history-year' rowSpan={editionResults.length}>
                                    <Link className='link-bold' to={`/contest/${contest.id}/${GRADE_INTERNATIONAL}`}>
                                        {contest.year}
                                    </Link>
                                </td>
                            )}
                            <td>{result.place}</td>
                            <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                            <td>{contest.year - result.person.schoolYear}</td>
                            <td>{result.score}</td>
                            <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </>;
}
