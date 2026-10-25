import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RankingScope, SCOPE_ONI } from '../../constants';
import { nationalContestsFor } from '../../model/contest';
import { useSubject } from '../subject';
import '../styles/segmented.css';

interface ScopeSelectorProps {
    scope: RankingScope;
    scopes: readonly RankingScope[];
    scopeLink: (scope: RankingScope) => string;
}

/* The ranking's contest scope, in the same box as the subject selector. Links
   rather than buttons, since the scope is part of the URL; the active one is
   an inert span. */
export const ScopeSelector = ({ scope, scopes, scopeLink }: ScopeSelectorProps) => {
    const { t } = useTranslation();
    const { subject } = useSubject();
    /* The national scope's key stays "ONI" in the API; show the olympiads it
       counts for the selected subject: "ONI", "ONM", or "ONI + ONM". */
    const label = (option: RankingScope) => option === SCOPE_ONI
        ? nationalContestsFor(subject).join(' + ')
        : t(`Scope.${option}`);

    return (
        <div className='segmented scope'>
            {scopes.map(option => option === scope
                ? <span key={option} className='segmented-option segmented-selected' aria-current='true'>{label(option)}</span>
                : <Link key={option} className='segmented-option' to={scopeLink(option)}>{label(option)}</Link>
            )}
        </div>
    );
};
