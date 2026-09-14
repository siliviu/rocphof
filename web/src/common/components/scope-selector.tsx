import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RankingScope } from '../../constants';
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

    return (
        <div className='history-selector'>
            {scopes.map(option => option === scope
                ? <span key={option} className='history-selected'>{t(`Scope.${option}`)}</span>
                : <Link key={option} to={scopeLink(option)}>{t(`Scope.${option}`)}</Link>
            )}
        </div>
    );
};
