import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Result, getMedalClass } from '../model/result';
import { SUBJECT_ALL } from '../constants';
import { isInternational, isLOT, matchesSubject, nationalContestsFor } from '../model/contest';
import { useSubject } from '../common/subject';
import { getParticipantsForContest, getPersonById, getResultsForPerson } from '../api/rest';
import { Person } from '../model/person';
import { useTranslation } from 'react-i18next';
import { Loading } from '../common/components/loading';
import { MetaTags } from '../common/components/meta-tags';

export const PersonPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const [results, setResults] = useState<Result[]>([]);
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const { subject } = useSubject();

    useEffect(() => {
        Promise.all([
            getPersonById(Number(id)).then(setPerson),
            getResultsForPerson(Number(id))
                .then(async results => {
                    const withParticipants = await Promise.all(
                        results.map(async (result: Result) => ({
                            ...result,
                            total: await getParticipantsForContest(result.contest.id, result.year)
                        }))
                    );
                    setResults(withParticipants);
                })
        ]).finally(() => setLoading(false));
    }, [id]);

    const shownResults = useMemo(() =>
        results.filter(result => matchesSubject(result.contest, subject))
        , [results, subject]);

    /* With a single subject its national olympiad always gets a panel, as ONI
       did before; combined, only the olympiads the person took part in. */
    const tablesNational = useMemo(() =>
        nationalContestsFor(subject).map(name => ({
            name,
            rows: shownResults
                .filter(result => result.contest.name === name)
                .map(result => (
                    <tr key={result.id} className={getMedalClass(result.medal)}>
                        <td>{result.contest.year}</td>
                        <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                        <td><Link to={`/region/${result.institution!.region}`}>{result.institution!.region}</Link></td>
                        <td><Link to={`/institution/${result.institution!.id}`}>{result.institution!.name}</Link></td>
                        <td>{result.score}</td>
                        <td>{result.place} / {result.total}</td>
                        <td>{result.prize ? t(`Prize.${result.prize}`) : ''}</td>
                        <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>
                    </tr>
                ))
        })).filter(({ rows }) => subject !== SUBJECT_ALL || rows.length > 0)
        , [shownResults, subject, t]);

    const tableLOT = useMemo(() =>
        shownResults
            .filter(result => isLOT(result.contest))
            .map(result => (
                <tr key={result.id}>
                    <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.contest.year}</Link></td>
                    <td>{t(["Girl", "Junior", "Senior"][result.year])}</td>
                    <td>{person && result.contest.year - person.schoolYear}</td>
                    <td>{result.score}</td>
                    <td>{result.place}</td>
                    <td>{result.prize ? t("Final.Yes") : ''}</td>
                </tr>
            ))
        , [shownResults, person, t]);

    const tableInternational = useMemo(() =>
        shownResults
            .filter(result => isInternational(result.contest))
            .map(result => (
                <tr key={result.id} className={getMedalClass(result.medal)}>
                    <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.contest.year}</Link></td>
                    <td>{result.contest.name}</td>
                    <td>{person && result.contest.year - person.schoolYear}</td>
                    <td>{result.score}</td>
                    <td>{result.place}</td>
                    <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>
                </tr>
            ))
        , [shownResults, person, t]);

    return <>
        <MetaTags
            title={person?.name}
            description={t("meta.person", { name: person?.name })}
        />
        <div className='panel'>
            {loading ? <Loading /> : person ?
                <p className='title'>{person.name}</p>
                    : <p className='title'>{t('PersonNotFound')}</p>}
        </div>

        {!loading && !person ? <div className='panel'><p>{t('NoDataOrNotFound') ?? 'No data found for this person.'}</p></div> : (
            <>
                {tablesNational.map(({ name, rows }) => <div key={name} className='panel'>
                    <p className='title'>{name}</p>
                    {loading ? <Loading /> : (
                        <table>
                            <tbody>
                                <tr>
                                    <th>{t("Year")}</th>
                                    <th>{t("Grade")}</th>
                                    <th>{t("Region")}</th>
                                    <th>{t("Institution")}</th>
                                    <th>{t("Score")}</th>
                                    <th>{t("Place")}</th>
                                    <th>{t("Prize")}</th>
                                    <th>{t("Medal")}</th>
                                </tr>
                                {rows}
                            </tbody>
                        </table>
                    )}
                </div>)}
                {tableLOT && tableLOT.length > 0 && <div className='panel'>
                    <p className='title'>LOT</p>
                    {loading ? <Loading /> : (
                        <table>
                            <tbody>
                                <tr>
                                    <th>{t("Year")}</th>
                                    <th>{t("Level")}</th>
                                    <th>{t("Grade")}</th>
                                    <th>{t("Score")}</th>
                                    <th>{t("Place")}</th>
                                    <th>{t("Final")}</th>
                                </tr>
                                {tableLOT}
                            </tbody>
                        </table>
                    )}
                </div>}
                {tableInternational && tableInternational.length > 0 && <div className='panel'>
                    <p className='title'>INTERNATIONAL</p>
                    {loading ? <Loading /> : (
                        <table>
                            <tbody>
                                <tr>
                                    <th>{t("Year")}</th>
                                    <th>{t("Contest")}</th>
                                    <th>{t("Grade")}</th>
                                    <th>{t("Score")}</th>
                                    <th>{t("Place")}</th>
                                    <th>{t("Medal")}</th>
                                </tr>
                                {tableInternational}
                            </tbody>
                        </table>
                    )}
                </div>}
            </>
        )}
    </>;
};
