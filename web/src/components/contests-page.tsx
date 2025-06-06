import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getAllContests } from '../rest/rest';
import { useTranslation } from 'react-i18next';
import { Contest } from '../model/contest';
import { MetaTags } from './meta-tags';

export const ContestPages = () => {
    const { t } = useTranslation();
    const [contests, setContests] = useState<Contest[]>([]);

    useEffect(() => {
        getAllContests().then(setContests);
    }, []);

    const contestsONI = useMemo(() => 
        contests
            .filter(contest => contest.name === "ONI")
            .map(contest => (
                <li key={contest.id}>
                    <Link to={`/contest/${contest.id}/5`}>{contest.name} {contest.year}</Link>
                </li>
            ))
    , [contests]);

    const contestsLOT = useMemo(() => 
        contests
            .filter(contest => contest.name === "LOT")
            .map(contest => (
                <li key={contest.id}>
                    <Link to={`/contest/${contest.id}/2`}>{contest.name} {contest.year}</Link>
                </li>
            ))
    , [contests]);

    const groupedContestsInternational = useMemo(() => 
        contests
            .filter(contest => contest.name !== "ONI" && contest.name !== "LOT")
            .reduce((groups: Record<string, Contest[]>, contest) => {
                const baseName = contest.name.replace(/\d{4}/, "").trim();
                if (!groups[baseName]) groups[baseName] = [];
                groups[baseName].push(contest);
                return groups;
            }, {})
    , [contests]);

    return <>
        <MetaTags
            title={t("Contests")}
            description={t("meta.contests")}
        />
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