import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getInstitutionById, getResultsForInstitution } from '../rest/rest';
import { Institution } from '../model/institution';

export const InstitutionPage = () => {
    const { id } = useParams();
    const [institution, setInstitution] = useState<Institution>({});
    const [table, setTable] = useState();
    useEffect(() => {
        getInstitutionById(Number(id))
            .then(institution => setInstitution(institution));
        getResultsForInstitution(Number(id))
            .then(results => {
                console.log(results);
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
                console.log(table);
            })

    }, []);
    return <>
        <p>{institution.name}</p>
        <p>{institution.city}, {institution.region}</p >
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