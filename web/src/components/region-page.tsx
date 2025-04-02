import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getResultsForRegion } from '../rest/rest';

export const RegionPage = () => {
    const { region } = useParams();
    const [table, setTable] = useState();
    useEffect(() => {
        getResultsForRegion(region!)
            .then(results => {
                setTable(results.map((result: Result) =>
                    <tr key={result.id} className={result.medal == Medal.GOLD ? 'gold' :
                        result.medal == Medal.SILVER ? 'silver' :
                            result.medal == Medal.BRONZE ? 'bronze' : ' '
                    }>
                        <td>{result.contest.year}</td>
                        <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                        <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        <td>{result.institution!.city}</td>
                        <td><Link to={`/institution/${result.institution!.id}`}>{result.institution!.name}</Link></td>
                        <td>{result.score}</td>
                        <td>{result.place}</td>
                        <td>{result.prize}</td>
                        <td>{result.medal}</td>
                    </tr>
                ))
            })

    }, []);
    document.title = region ?? "";
    return <>
        <div className='panel'>
            <p className='title'>{region}</p>
            <p className='subtitle'><Link to={`/ranking?region=${region}`}>Region Ranking</Link></p>
        </div>
        <table>
            <tbody>
                <tr>
                    <th>Year</th>
                    <th>Grade</th>
                    <th>Name</th>
                    <th>City</th>
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