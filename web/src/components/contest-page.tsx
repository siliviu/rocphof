import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getContestById, getNextContest, getParticipantsForContest, getPreviousContest, getResultsForContest } from '../rest/rest';
import { Contest } from '../model/contest';
import './contest.css'

export const ContestPage = () => {
    const { id, grade } = useParams();
    const [table, setTable] = useState();
    const [contest, setContest] = useState<Contest | null>();
    const [prevContest, setPrevContest] = useState<Contest | null>(null);
    const [nextContest, setNextContest] = useState<Contest | null>(null);
    const [generationStart, setGenerationStart] = useState(0);
    const [participants, setParticipants] = useState(0);
    useEffect(() => {
        getContestById(Number(id))
            .then(setContest)
        getPreviousContest(Number(id))
            .then(setPrevContest)
            .catch(() => setPrevContest(null))
        getNextContest(Number(id))
            .then(setNextContest)
            .catch(() => setNextContest(null))
    }, [id]);
    useEffect(() => {
        if (contest) {
            setGenerationStart(contest.year - Number(grade));
            document.title = contest.name + " " + contest.year + " " + grade;
        }
        getResultsForContest(Number(id), Number(grade))
            .then(results => {
                setTable(results.map((result: Result) =>
                    <tr className={result.medal == Medal.GOLD ? 'gold' :
                        result.medal == Medal.SILVER ? 'silver' :
                            result.medal == Medal.BRONZE ? 'bronze' : ' '
                    }>
                        <td>{result.place}</td>
                        <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        {
                            contest && contest.name == "ONI" ?
                                <>
                                    <td><Link to={`/region/${result.institution!.region}`}>{result.institution!.region}</Link></td>
                                    <td><Link to={`/institution/${result.institution!.id}`}>{result.institution!.name}</Link></td>
                                </>
                                :
                                <>
                                    <td>{contest && contest.year - result.person.schoolYear}</td>
                                </>
                        }
                        <td>{result.score}</td>
                        {contest && (contest.name == "ONI" || contest.name == "LOT") && <td>{result.prize}</td>}
                        {contest && (contest.name == "ONI" || contest.name != "LOT") && <td>{result.medal}</td>}
                    </tr>
                ))
            })
        getParticipantsForContest(Number(id), Number(grade))
            .then(nr => {
                setParticipants(Number(nr))
            });
    }, [grade, contest])
    const prevGrade = Number(grade) - 1;
    const nextGrade = Number(grade) + 1;
    const prevContestGrade = prevContest ? prevContest.year - generationStart : 0;
    const nextContestGrade = nextContest ? nextContest.year - generationStart : 0;
    return <>
        <div className='panel'>
            <p className='title selector'>
                {prevContest ? <Link className='arrow left' to={`/contest/${prevContest.id}/${grade}`}> &lt;</Link> : <div />}
                <span>{contest && contest.name} {contest && contest.year}</span>
                {nextContest ? <Link className='arrow' to={`/contest/${nextContest.id}/${grade}`}> &gt;</Link> : <div />}
            </p>
            {contest && (contest.name == "ONI" || contest.name == "LOT") && (contest.name == "ONI" ?
                <>
                    <p className='subtitle selector'>
                        {prevGrade >= 5 ? <Link className='arrow left' to={`/contest/${id}/${prevGrade}`}>&lt;  </Link> : <div />}
                        <span>{grade}</span>
                        {nextGrade <= 12 ? <Link className='arrow' to={`/contest/${id}/${nextGrade}`}>  &gt;</Link> : <div />}
                    </p>
                    <p className='subsubtitle selector'>
                        {prevContest && prevContestGrade >= 5 ? <Link className='arrow left' to={`/contest/${prevContest.id}/${prevContestGrade}`}>&lt;&lt;  </Link> : <div />}
                        <span>{generationStart + 5}-{generationStart + 12}</span>
                        {nextContest && nextContestGrade <= 12 ? <Link className='arrow' to={`/contest/${nextContest.id}/${nextContestGrade}`}>&gt;&gt;  </Link> : <div />}

                    </p>
                    <p className='subsubtitle'><Link to={`/ranking?year=${generationStart}`}>Generation Ranking</Link></p>
                </>
                :
                <>
                    <p className='subtitle selector'>
                        {grade == "2" ? <Link className='arrow left' to={`/contest/${id}/1`}>&lt;  </Link> : <div />}
                        <span>{grade == "1" ? "Junior" : "Senior"}</span>
                        {grade == "1" ? <Link className='arrow' to={`/contest/${id}/2`}>&gt;  </Link> : <div />}
                    </p>
                </>)}

            <div>{participants} participants</div>
        </div>
        <table>
            <colgroup>
                <col className="place" />
                <col className="name" />
                {contest && contest.name == "ONI" ? <>
                    <col className="region" />
                    <col className="institution" />
                </>
                    :
                    <col className="grade" />}
                <col className="score" />
                <col className="prize" />
                {contest && contest.name == "ONI" ?
                    <col className="medal" /> : <></>}
            </colgroup>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Name</th>
                    {contest && contest.name == "ONI" ?
                        <>
                            <th>Region</th>
                            <th>Institution</th>
                        </>
                        :
                        <><th>Grade</th></>
                    }
                    <th>Score</th>
                    {contest && (contest.name == "ONI" || contest.name == "LOT") && <th>Prize</th>}
                    {contest && (contest.name == "ONI" || contest.name != "LOT") && <th>Medal</th>}
                </tr>
                {table}
            </tbody>
        </table >
    </>
}