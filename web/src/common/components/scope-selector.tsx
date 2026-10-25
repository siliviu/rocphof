import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RankingScope, SCOPE_ONI } from '../../constants';
import { nationalContestsFor } from '../../model/contest';
import { useSubject } from '../subject';
import '../styles/selector.css';

interface ScopeSelectorProps {
    scope: RankingScope;
    scopes: readonly RankingScope[];
    scopeLink: (scope: RankingScope) => string;
}

/* Same markup and styling as the contest selector on the history page: links
   side by side, with the active one an inert span. */
export const ScopeSelector = ({ scope, scopes, scopeLink }: ScopeSelectorProps) => {
    const { t } = useTranslation();
    const { subject } = useSubject();
    /* The national scope's key stays "ONI" in the API; show the olympiads it
       counts for the selected subject: "ONI", "ONM", or "ONI + ONM". */
    const label = (option: RankingScope) => option === SCOPE_ONI
        ? nationalContestsFor(subject).join(' + ')
        : t(`Scope.${option}`);

    return (
        <div className='history-selector'>
            {scopes.map(option => option === scope
                ? <span key={option} className='history-selected'>{label(option)}</span>
                : <Link key={option} to={scopeLink(option)}>{label(option)}</Link>
            )}
        </div>
    );
};
