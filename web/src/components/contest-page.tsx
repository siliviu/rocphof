import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getContestById, getNextContest, getPreviousContest, getResultsForContest } from '../rest/rest';
import { Contest } from '../model/contest';

export const ContestPage = () => {
    const { id, grade } = useParams();
    const [table, setTable] = useState();
    const [contest, setContest] = useState<Contest>({});
    const [prevContest, setPrevContest] = useState<Contest | null>(null);
    const [nextContest, setNextContest] = useState<Contest | null>(null);
    useEffect(() => {
        getContestById(Number(id))
            .then(contest => setContest(contest))
        getPreviousContest(Number(id))
            .then(contest => setPrevContest(contest))
            .catch(() => setPrevContest(null))
        getNextContest(Number(id))
            .then(contest => setNextContest(contest))
            .catch(() => setNextContest(null))
        getResultsForContest(Number(id), Number(grade))
            .then(results => {
                console.log(results);
                setTable(results.map((result: Result) =>
                    <tr className={result.medal == Medal.GOLD ? 'gold' :
                        result.medal == Medal.SILVER ? 'silver' :
                            result.medal == Medal.BRONZE ? 'bronze' : ' '
                    }>
                        <td>{result.place}</td>
                        <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        <td><Link to={`/region/${result.institution.region}`}>{result.institution.region}</Link></td>
                        <td><Link to={`/institution/${result.institution.id}`}>{result.institution.name}</Link></td>
                        <td>{result.score}</td>
                        <td>{result.prize}</td>
                        <td>{result.medal}</td>
                    </tr>
                ))
                console.log(table);
            })

    }, [id, grade])
    const prevGrade = Number(grade) - 1;
    const nextGrade = Number(grade) + 1;
    const generationStart = contest.year - Number(grade);
    const generationEnd = contest.year - Number(grade) + 12;
    const prevContestGrade = prevContest ? prevContest.year - generationStart : 0;
    const nextContestGrade = nextContest ? nextContest.year - generationStart : 0;
    return <>
        <p>
            {prevContest && <Link to={`/contest/${prevContest.id}/${grade}`}> &lt;</Link>}
            {contest.name} {contest.year}
            {nextContest && <Link to={`/contest/${nextContest.id}/${grade}`}> &gt;</Link>}
        </p>
        <p>
            {prevGrade >= 5 && <Link to={`/contest/${id}/${prevGrade}`}>&lt;  </Link>}
            {grade}
            {nextGrade <= 12 && <Link to={`/contest/${id}/${nextGrade}`}>  &gt;</Link>}
        </p>
        <p>
            {prevContestGrade >= 5 && prevContest && <Link to={`/contest/${prevContest.id}/${prevContestGrade}`}>&lt;&lt;  </Link>}
            {generationStart + 5}-{generationEnd}
            {nextContestGrade <= 12 && nextContest && <Link to={`/contest/${nextContest.id}/${nextContestGrade}`}>&gt;&gt;  </Link>}

        </p>
        <table>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Institution</th>
                    <th>Score</th>
                    <th>Prize</th>
                    <th>Medal</th>
                </tr>
                {table}
            </tbody>
        </table>
    </>
}