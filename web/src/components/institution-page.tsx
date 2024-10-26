import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getInstitutionById, getResultsForInstitution } from '../rest/rest';
import { Institution } from '../model/institution';

export const InstitutionPage = () => {
    const { id } = useParams();
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [table, setTable] = useState();
    useEffect(() => {
        getInstitutionById(Number(id))
            .then(institution => {
                setInstitution(institution)
                document.title = institution.name;
            });
        getResultsForInstitution(Number(id))
            .then(results => {
                setTable(results.map((result: Result) =>
                    <tr className={result.medal == Medal.GOLD ? 'gold' :
                        result.medal == Medal.SILVER ? 'silver' :
                            result.medal == Medal.BRONZE ? 'bronze' : ' '
                    }>
                        <td>{result.contest.year}</td>
                        <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                        <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        <td>{result.score}</td>
                        <td>{result.place}</td>
                        <td>{result.prize}</td>
                        <td>{result.medal}</td>
                    </tr>
                ))
            })

    }, []);
    return <>
        <div className='panel'>
            <p className='title'>{institution && institution.name }</p>
            <p className='subtitle'>{institution && institution.city},  {institution && institution.region}</p >
            <p className='subtitle'><Link to={institution ? `/ranking?institution=${institution.id}` : ''}>Institution Ranking</Link></p>
        </div>
        <table>
            <tbody>
                <tr>
                    <th>Year</th>
                    <th>Grade</th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Place</th>
                    <th>Prize</th>
                    <th>Medal</th>
                </tr>
                {table}
            </tbody>
        </table>
    </>
}