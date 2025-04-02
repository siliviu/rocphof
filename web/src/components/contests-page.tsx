import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllContests } from '../rest/rest';
import { Contest } from '../model/contest';

export const ContestPages = () => {
    const [contestsONI, setContestsONI] = useState();
    const [contestsLOT, setContestsLOT] = useState();
    const [groupedContestsInternational, setGroupedContestsInternational] = useState<Record<string, Contest[]>>({});
    document.title = "Contests";

    useEffect(() => {
        getAllContests().then(data => {
            setContestsONI(data
                .filter((contest: Contest) => contest.name === "ONI")
                .map((contest: Contest) => (
                    <li key={contest.id}>
                        <Link to={`/contest/${contest.id}/5`}>{contest.name} {contest.year}</Link>
                    </li>
                )));
            setContestsLOT(data
                .filter((contest: Contest) => contest.name === "LOT")
                .map((contest: Contest) => (
                    <li key={contest.id}>
                        <Link to={`/contest/${contest.id}/2`}>{contest.name} {contest.year}</Link>
                    </li>
                )));

            const groupedInternational = data
                .filter((contest: Contest) => contest.name !== "ONI" && contest.name !== "LOT")
                .reduce((groups: any, contest: Contest) => {
                    const baseName = contest.name.replace(/\d{4}/, "").trim();
                    if (!groups[baseName]) groups[baseName] = [];
                    groups[baseName].push(contest);
                    return groups;
                }, {});
            setGroupedContestsInternational(groupedInternational);
        });
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
                    {Object.entries(groupedContestsInternational).map(([baseName, contests]) => (
                        <Dropdown key={baseName} baseName={baseName} contests={contests} />
                    ))}
                </ul>
            </div>
        </div>
    </>
}

const Dropdown = ({ baseName, contests }: { baseName: string, contests: Contest[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <li className="dropdown">
            <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
                {baseName} <span className="arrow">{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
                <ul className="dropdown-content">
                    {contests.map(contest =>
                        <li key={contest.id}>
                            <Link to={`/contest/${contest.id}/1`}>{contest.name} {contest.year}</Link>
                        </li>
                    )}
                </ul>
            )}
        </li>
    );
};