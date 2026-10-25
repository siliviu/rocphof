import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getAllContests } from '../api/rest';
import { useTranslation } from 'react-i18next';
import { Contest, isInternational, isLOT, matchesSubject, nationalContestsFor } from '../model/contest';
import { useSubject } from '../common/subject';
import { MetaTags } from '../common/components';
import './contests-page.css';

export const ContestPages = () => {
    const { t } = useTranslation();
    const [contests, setContests] = useState<Contest[]>([]);
    const { subject } = useSubject();

    useEffect(() => {
        getAllContests().then(setContests);
    }, []);

    const shown = useMemo(() => contests.filter(contest => matchesSubject(contest, subject)), [contests, subject]);

    const contestsNational = useMemo(() =>
        nationalContestsFor(subject).map(name => ({
            name,
            items: shown
                .filter(contest => contest.name === name)
                .map(contest => (
                    <li key={contest.id}>
                        <Link to={`/contest/${contest.id}/9`}>{contest.name} {contest.year}</Link>
                    </li>
                ))
        })).filter(({ items }) => items.length > 0)
    , [shown, subject]);

    const contestsLOT = useMemo(() => 
        shown
            .filter(isLOT)
            .map(contest => (
                <li key={contest.id}>
                    <Link to={`/contest/${contest.id}/2`}>{contest.name} {contest.year}</Link>
                </li>
            ))
    , [shown]);

    const groupedContestsInternational = useMemo(() => 
        shown
            .filter(isInternational)
            .reduce((groups: Record<string, Contest[]>, contest) => {
                const baseName = contest.name.replace(/\d{4}/, "").trim();
                if (!groups[baseName]) groups[baseName] = [];
                groups[baseName].push(contest);
                return groups;
            }, {})
    , [shown]);

    return <>
        <MetaTags
            title={t("Contests")}
            description={t("meta.contests")}
        />
        <div className='panel'>
            <div className='contest-list'>
                {contestsNational.map(({ name, items }) => (
                    <ul key={name}>
                        <span className='title'>{name}</span>
                        {items}
                    </ul>
                ))}
                {contestsLOT.length > 0 && <ul>
                    <span className='title'>LOT</span>
                    {contestsLOT}
                </ul>}
                {Object.keys(groupedContestsInternational).length > 0 && <ul>
                    <span className='title'>GLOBAL</span>
                    {Object.entries(groupedContestsInternational).map(([baseName, contests]) => (
                        <Dropdown key={baseName} baseName={baseName} contests={contests} />
                    ))}
                </ul>}
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
