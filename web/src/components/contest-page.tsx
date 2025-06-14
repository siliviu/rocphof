import { useParams, Link } from 'react-router-dom';
import { Result, getMedalClass } from '../model/result';
import { useEffect, useState, useMemo } from 'react'
import { getContestById, getNextContest, getParticipantsForContest, getPreviousContest, getResultsForContest } from '../rest/rest';
import { Contest } from '../model/contest';
import { useTranslation } from 'react-i18next';
import './contest.css'
import { Loading } from './loading';
import { MetaTags } from './meta-tags';

export const ContestPage = () => {
    const { id: idParam, grade: gradeParam } = useParams();
    const { t } = useTranslation();
    const [results, setResults] = useState<Result[]>([]);
    const [contest, setContest] = useState<Contest | null>();
    const [prevContest, setPrevContest] = useState<Contest | null>(null);
    const [nextContest, setNextContest] = useState<Contest | null>(null);
    const [participants, setParticipants] = useState(0);
    const [loading, setLoading] = useState(true);

    const id = Number(idParam);
    const grade = Number(gradeParam);

    const isONI = contest?.name === "ONI";
    const isLOT = contest?.name === "LOT";
    const isInternational = contest && !isONI && !isLOT;
    const generationStart = contest ? contest.year - grade : 0;

    useEffect(() => {
        Promise.all([
            getContestById(id).then(setContest),
            getPreviousContest(id)
                .then(setPrevContest)
                .catch(() => setPrevContest(null)),
            getNextContest(id)
                .then(setNextContest)
                .catch(() => setNextContest(null))
        ]);
    }, [id]);

    useEffect(() => {
        if (contest) {
            setLoading(true);

            Promise.all([
                getResultsForContest(id, grade)
                    .then(setResults),
                getParticipantsForContest(id, grade)
                    .then(nr => setParticipants(Number(nr)))
            ]).finally(() => setLoading(false));
        }
    }, [grade, contest]);

    const table = useMemo(() =>
        results.map(result =>
            <tr key={result.id} className={getMedalClass(result.medal)}>
                <td>{result.place}</td>
                <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                {isONI ? (
                    <>
                        <td><Link to={`/region/${result.institution!.region}`}>{result.institution!.region}</Link></td>
                        <td><Link to={`/institution/${result.institution!.id}`}>{result.institution!.name}</Link></td>
                    </>
                ) : (
                    <td>{contest!.year - result.person.schoolYear}</td>
                )}
                <td>{result.score}</td>
                {(isONI || isLOT) && <td>{result.prize ? t(isONI ? `Prize.${result.prize}` : 'Final.Yes') : ''}</td>}
                {(isONI || isInternational) && <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>}
            </tr>
        )
        , [results, isONI, isLOT, isInternational, contest, t]);

    const prevGrade = grade - 1;
    const nextGrade = grade + 1;
    const [hasPrevGrade, setHasPrevGrade] = useState(false);
    const [hasNextGrade, setHasNextGrade] = useState(false);

    useEffect(() => {
        getParticipantsForContest(id, prevGrade).then(number => setHasPrevGrade(number != 0));
    }, [id, prevGrade]);

    useEffect(() => {
        getParticipantsForContest(id, nextGrade).then(number => setHasNextGrade(number != 0));
    }, [id, nextGrade]);

    const prevContestGrade = prevContest ? prevContest.year - generationStart : 0;
    const nextContestGrade = nextContest ? nextContest.year - generationStart : 0;

    return <>
        <MetaTags
            title={contest ? `${contest.name} ${contest.year}` + (isONI ? ` ${grade}` : '') : ""}
            description={t(isONI ? "meta.contest_oni" : isLOT ? "meta.contest_lot" : "meta.contest", {
                name: contest?.name,
                year: contest?.year,
                grade: isONI ? grade : ''
            })}
        />
        <div className='panel'>
            <p className='title selector'>
                {prevContest ? <Link className='arrow' to={`/contest/${prevContest.id}/${grade}`}> &lt;</Link> : <div />}
                <span>{contest && contest.name} {contest && contest.year}</span>
                {nextContest ? <Link className='arrow' to={`/contest/${nextContest.id}/${grade}`}> &gt;</Link> : <div />}
            </p>
            {contest && (isONI || isLOT) && (isONI ? (
                <>
                    <p className='subtitle selector'>
                        {prevGrade >= 5 ? <Link className='arrow' to={`/contest/${id}/${prevGrade}`}>&lt;  </Link> : <div />}
                        <span>{grade}</span>
                        {nextGrade <= 12 ? <Link className='arrow' to={`/contest/${id}/${nextGrade}`}>  &gt;</Link> : <div />}
                    </p>
                    <p className='subsubtitle selector'>
                        {prevContest && prevContestGrade >= 5 ? <Link className='arrow' to={`/contest/${prevContest.id}/${prevContestGrade}`}>&lt;&lt;  </Link> : <div />}
                        <span>{generationStart + 5}-{generationStart + 12}</span>
                        {nextContest && nextContestGrade <= 12 ? <Link className='arrow' to={`/contest/${nextContest.id}/${nextContestGrade}`}>&gt;&gt;  </Link> : <div />}
                    </p>
                    <p className='subsubtitle'><Link to={`/ranking?year=${generationStart}`}>{t("Generation Ranking")}</Link></p>
                </>
            ) : (
                <>
                    <p className='subtitle selector'>
                        {prevGrade >= 0 && hasPrevGrade ? <Link className='arrow' to={`/contest/${id}/${prevGrade}`}>&lt;  </Link> : <div />}
                        <span>{t(["Girl", "Junior", "Senior"][grade])}</span>
                        {nextGrade <= 2 && hasNextGrade ? <Link className='arrow' to={`/contest/${id}/${nextGrade}`}>&gt;  </Link> : <div />}
                    </p>
                </>
            ))}
            <div>{contest && (isONI || isLOT) && <>{t(participants >= 20 ? "Participants_many" : "Participants", { count: participants })}</>}</div>
        </div>
        {loading ? (
            <Loading />
        ) : (
            <table>
                <colgroup>
                    <col className="place" />
                    <col className="name" />
                    {contest && isONI ? (
                        <>
                            <col className="region" />
                            <col className="institution" />
                        </>
                    ) : (
                        <col className="grade" />
                    )}
                    <col className="score" />
                    <col className="prize" />
                    {contest && isONI && <col className="medal" />}
                </colgroup>
                <tbody>
                    <tr>
                        <th>{t("Place")}</th>
                        <th>{t("Name")}</th>
                        {contest && isONI ? (
                            <>
                                <th>{t("Region")}</th>
                                <th>{t("Institution")}</th>
                            </>
                        ) : (
                            <th>{t("Grade")}</th>
                        )}
                        <th>{t("Score")}</th>
                        {(isONI || isLOT) && <th>{t(isONI ? "Prize" : "Final")}</th>}
                        {(isONI || isInternational) && <th>{t("Medal")}</th>}
                    </tr>
                    {table}
                </tbody>
            </table>
        )}
    </>;
}