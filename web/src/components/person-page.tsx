import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getParticipantsForContest, getPersonById, getResultsForPerson } from '../rest/rest';
import { Person } from '../model/person';

export const PersonPage = () => {
    const { id } = useParams();
    const [tableONI, setTableONI] = useState();
    const [tableLOT, setTableLOT] = useState<any>();
    const [person, setPerson] = useState<Person | null>(null);
    useEffect(() => {
        getPersonById(Number(id))
            .then(person => {
                setPerson(person);
            })
        getResultsForPerson(Number(id))
            .then(async (results) => {
                await Promise.all(results
                    .map(async (result: Result) => {
                        result.total = await getParticipantsForContest(result.contest.id, result.year);
                        return result;
                    }));
                setTableONI(results
                    .filter((result: Result) => result.contest.name == "ONI")
                    .map((result: Result) =>
                        <tr className={result.medal == Medal.GOLD ? 'gold' :
                            result.medal == Medal.SILVER ? 'silver' :
                                result.medal == Medal.BRONZE ? 'bronze' : ' '
                        }>
                            <td>{result.contest.year}</td>
                            <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                            <td><Link to={`/region/${result.institution.region}`}>{result.institution.region}</Link></td>
                            <td><Link to={`/institution/${result.institution.id}`}>{result.institution.name}</Link></td>
                            <td>{result.score}</td>
                            <td>{result.place} / {result.total}</td>
                            <td>{result.prize}</td>
                            <td>{result.medal}</td>
                        </tr>
                    ))
                setTableLOT(results
                    .filter((result: Result) => result.contest.name == "LOT")
                    .map((result: Result) =>
                        <tr className={result.medal == Medal.GOLD ? 'gold' :
                            result.medal == Medal.SILVER ? 'silver' :
                                result.medal == Medal.BRONZE ? 'bronze' : ' '
                        }>
                            <td>{result.contest.year}</td>
                            <td>{result.year == 1 ? "JUNIOR" : "SENIOR"}</td>
                            <td>{result.score}</td>
                            <td>{result.place}</td>
                            <td>{result.prize}</td>
                        </tr>
                    ))
            })

    }, [])
    return <>
        <div className='panel'>
            <p className='title'>{person ? person.name : ''}</p>
        </div>
        <div className='panel'>
            <p className='title'>ONI</p>
            <table>
                <tbody>
                    <tr>
                        <th>Year</th>
                        <th>Grade</th>
                        <th>Region</th>
                        <th>Institution</th>
                        <th>Score</th>
                        <th>Place</th>
                        <th>Prize</th>
                        <th>Medal</th>
                    </tr>
                    {tableONI}

                </tbody>
            </table>
        </div>
        {
            tableLOT && tableLOT.length > 0 && <div className='panel'>
                <p className='title'>LOT</p>
                <table>
                    <tbody>
                        <tr>
                            <th>Year</th>
                            <th>Grade</th>
                            <th>Score</th>
                            <th>Place</th>
                            <th>Prize</th>
                        </tr>
                        {tableLOT}
                    </tbody>
                </table>
            </div>
        }
    </>
}