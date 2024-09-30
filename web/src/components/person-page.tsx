import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getPersonById, getResultsForPerson } from '../rest/rest';
import { Person } from '../model/person';

export const PersonPage = () => {
    const { id } = useParams();
    const [table, setTable] = useState();
    const [person, setPerson] = useState<Person|null>(null);
    useEffect(() => {
        getPersonById(Number(id))
            .then(person => {
                console.log(person);
                setPerson(person);
            })
        getResultsForPerson(Number(id))
            .then(results => {
                console.log(results);
                setTable(results.map((result: Result) =>
                    <tr className={result.medal == Medal.GOLD ? 'gold' :
                        result.medal == Medal.SILVER ? 'silver' :
                            result.medal == Medal.BRONZE ? 'bronze' : ' '
                    }>
                        <td>{result.contest.year}</td>
                        <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                        <td><Link to={`/region/${result.institution.region}`}>{result.institution.region}</Link></td>
                        <td><Link to={`/institution/${result.institution.id}`}>{result.institution.name}</Link></td>
                        <td>{result.score}</td>
                        <td>{result.place}</td>
                        <td>{result.prize}</td>
                        <td>{result.medal}</td>
                    </tr>
                ))
                console.log(table);
            })

    }, [])
    return <>
        <div className='panel'>
            <p className='title'>{person ? person.name : ''}</p>
        </div>
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
                {table}
            </tbody>
        </table>
    </>
}