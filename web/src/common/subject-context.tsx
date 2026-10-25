import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SUBJECTS, SUBJECT_SELECTED_DEFAULT, Subject } from '../constants';
import { SubjectContext } from './subject';

const STORAGE_KEY = 'subject';

const parseSubject = (raw: string | null): Subject | null =>
    SUBJECTS.includes(raw as Subject) ? raw as Subject : null;

/* The subject every page shows: Informatics, Maths, or both. Kept site-wide
   rather than per page, so moving from a ranking to a person or an institution
   keeps the same view. Remembered across visits like the theme and language.
   A ?subject= in the URL wins on load, so a shared link opens on the subject
   it was shared with; it is then dropped from the URL, since the choice lives
   in the provider from there on. */
export const SubjectProvider = ({ children }: { children: ReactNode }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const fromUrl = parseSubject(searchParams.get(STORAGE_KEY));

    const [subject, setSubjectState] = useState<Subject>(() =>
        fromUrl ?? parseSubject(localStorage.getItem(STORAGE_KEY)) ?? SUBJECT_SELECTED_DEFAULT);

    const setSubject = useCallback((next: Subject) => {
        setSubjectState(next);
        localStorage.setItem(STORAGE_KEY, next);
    }, []);

    useEffect(() => {
        if (!searchParams.has(STORAGE_KEY)) return;
        if (fromUrl) setSubject(fromUrl);
        const params = new URLSearchParams(searchParams);
        params.delete(STORAGE_KEY);
        setSearchParams(params, { replace: true });
    }, [searchParams, fromUrl, setSearchParams, setSubject]);

    return <SubjectContext.Provider value={{ subject, setSubject }}>{children}</SubjectContext.Provider>;
};

