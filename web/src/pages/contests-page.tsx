import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getAllContests } from '../api/rest';
import { useTranslation } from 'react-i18next';
import { CONTEST_ONI, CONTEST_LOT } from '../constants';
import { Contest } from '../model/contest';
import { MetaTags } from '../common/components';
import './contests-page.css';

export const ContestPages = () => {
    const { t } = useTranslation();
    const [contests, setContests] = useState<Contest[]>([]);

    useEffect(() => {
        getAllContests().then(setContests);
    }, []);

    const contestsONI = useMemo(() => 
        contests
            .filter(contest => contest.name === CONTEST_ONI)
            .map(contest => (
                <li key={contest.id}>
                    <Link to={`/contest/${contest.id}/9`}>{contest.name} {contest.year}</Link>
                </li>
            ))
    , [contests]);

    const contestsLOT = useMemo(() => 
        contests
            .filter(contest => contest.name === CONTEST_LOT)
            .map(contest => (
                <li key={contest.id}>
                    <Link to={`/contest/${contest.id}/2`}>{contest.name} {contest.year}</Link>
                </li>
            ))
    , [contests]);

    const groupedContestsInternational = useMemo(() => 
        contests
            .filter(contest => contest.name !== CONTEST_ONI && contest.name !== CONTEST_LOT)
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
                {baseName} <span className="arrow">{isOpen ? "\u25b2" : "\u25bc"}</span>
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
