import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllContests } from '../rest/rest';
import { Contest } from '../model/contest';

export const ContestPages = () => {
    const [contests, setContests] = useState();
    useEffect(() => {
        getAllContests().then(data => {
            setContests(data.map((contest: Contest) => <li><Link to={`/contest/${contest.id}/${contest.name == "ONI" ? 5 : 2}`}>{contest.name} {contest.year}</Link></li>))
        })
    }, []);
    return <>
        <div className='panel'>
            <ul className='contest-list'>
                {contests}
            </ul>
        </div>
    </>
}