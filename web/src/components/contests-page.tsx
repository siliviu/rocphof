import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllContests } from '../rest/rest';
import { Contest } from '../model/contest';

export const ContestPages = () => {
    const [contestsONI, setContestsONI] = useState();
    const [contestsLOT, setContestsLOT] = useState();
    const [contestsInternational, setContestsInternational] = useState();
    document.title = "Contests"
    useEffect(() => {
        getAllContests().then(data => {
            setContestsONI(data
                .filter((contest: Contest) => contest.name == "ONI")
                .map((contest: Contest) => <li><Link to={`/contest/${contest.id}/5`}>{contest.name} {contest.year}</Link></li>))
            setContestsLOT(data
                .filter((contest: Contest) => contest.name == "LOT")
                .map((contest: Contest) => <li><Link to={`/contest/${contest.id}/2`}>{contest.name} {contest.year}</Link></li>))
            setContestsInternational(data
                .filter((contest: Contest) => contest.name != "ONI" && contest.name != "LOT")
                .map((contest: Contest) => <li><Link to={`/contest/${contest.id}/1`}>{contest.name} {contest.year}</Link></li>))
        })
    }, []);
    return <>
        <div className='panel'>
            <div className='contest-list'>
                <ul>
                    <span className='title'>ONI</span>
                    {contestsONI}
                </ul>
                <ul>
                    <span className='title'>LOT</span>
                    {contestsLOT}
                </ul>
                <ul>
                    <span className='title'>GLOBAL</span>
                    {contestsInternational}
                </ul>
            </div>
        </div>
    </>
}