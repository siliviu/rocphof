import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { RankingNumber, RankingResult } from '../model/result';
import { getRanking, } from '../rest/rest';

export const RankingPage = () => {
    const [searchParams, _] = useSearchParams();
    const [table, setTable] = useState();
    console.log(searchParams);
    useEffect(() => {
        getRanking(searchParams.get("region")!, searchParams.get("year")! as unknown as number)
            .then(results => {
                console.log(results);
                let display = 0;
                let count = 0;
                let last: RankingNumber;
                setTable(results.map((result: RankingResult) => {
                    let cur = { ...result };
                    cur.person = { id: 0, name: '', schoolYear: 0 };
                    count += 1;
                    if (JSON.stringify(cur) != JSON.stringify(last)) {
                        display = count;
                    }
                    last = cur;
                    return <tr>
                        <td>{display}</td>
                        <td><Link to={`/person/${result.person.id}`}>{result.person.name}</Link></td>
                        <td className='gold'>{result.gold}</td>
                        <td className='silver'>{result.silver}</td>
                        <td className='bronze'>{result.bronze}</td>
                        <td>{result.medals}</td>
                        <td>{result.participations}</td>
                    </tr>
                }
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
                    <th>Position</th>
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