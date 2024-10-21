import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { RankingNumber, RankingResult } from '../model/result';
import { getInstitutionById, getRanking, } from '../rest/rest';
import { Institution } from '../model/institution';

export const RankingPage = () => {
    const [searchParams, _] = useSearchParams();
    const [table, setTable] = useState();
    const [institution, setInstitution] = useState<Institution | null>();
    useEffect(() => {
        getRanking(searchParams.get("region")!, searchParams.get("institution")!, Number(searchParams.get("year")!))
            .then(results => {
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
            })
        if (searchParams.has("institution"))
            getInstitutionById(Number(searchParams.get("institution")))
                .then(institution => setInstitution(institution));
    }, []);

    return <>
        <div className='panel'>
            <p className='title'> {
                searchParams.has("region") ? searchParams.get("region") :
                    searchParams.has("institution") && institution ? institution.name :
                        searchParams.get("year") ? `${Number(searchParams.get("year")!) + 5} - ${Number(searchParams.get("year")!) + 12}` :
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