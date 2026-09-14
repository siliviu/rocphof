import { useLocation, useSearchParams } from 'react-router-dom';
import { RankingScope, SCOPES, SCOPE_DEFAULT } from '../../constants';

/* Keeps the ranking scope in the URL, like the year range, so a scoped ranking
   stays shareable and browser history steps back through it. */
export const useScopeParam = () => {
    const [searchParams] = useSearchParams();
    const { pathname } = useLocation();

    const raw = searchParams.get('scope');
    const scope = (SCOPES.includes(raw as RankingScope) ? raw : SCOPE_DEFAULT) as RankingScope;

    /* A link rather than a handler, so the selector can be the same markup as the
       contest selector on the history page. The default is left out of the URL,
       so the plain ranking links stay clean. */
    const scopeLink = (next: RankingScope) => {
        const params = new URLSearchParams(searchParams);
        if (next !== SCOPE_DEFAULT) params.set('scope', next);
        else params.delete('scope');
        const query = params.toString();
        return query ? `${pathname}?${query}` : pathname;
    };

    return { scope, scopeLink, scopes: SCOPES };
};
