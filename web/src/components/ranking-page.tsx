import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { RankingResult } from '../model/result';
import { getRanking, } from '../rest/rest';

export const RankingPage = () => {
    const [searchParams, _] = useSearchParams();
    const [table, setTable] = useState();
    console.log(searchParams);
    useEffect(() => {
        getRanking(searchParams.get("region")!, searchParams.get("year")! as unknown as number)
            .then(results => {
                console.log(results);
                setTable(results.map((result: RankingResult) =>
                    <tr>
                        <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        <td className='gold'>{result.gold}</td>
                        <td className='silver'>{result.silver}</td>
                        <td className='bronze'>{result.bronze}</td>
                        <td>{result.medals}</td>
                        <td>{result.participations}</td>
                    </tr>
                ))
                console.log(table);
            })

    }, []);

    return <>
        <div className='panel'>
            <p className='title'> {
                searchParams.get("region") ??
                searchParams.get("year") ??
                "All-time"} Ranking</p>
        </div>
        <table>
            <tbody>
                <tr>
                    <th>Name</th>
                    <th className='gold'>Gold</th>
                    <th className='silver'>Silver</th>
                    <th className='bronze'>Bronze</th>
                    <th>Medals</th>
                    <th>Participations</th>
                </tr>
                {table}
            </tbody>
        </table>
    </>
}