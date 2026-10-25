import { createContext, useContext } from 'react';
import { SUBJECT_SELECTED_DEFAULT, Subject } from '../constants';

interface SubjectState {
    subject: Subject;
    setSubject: (next: Subject) => void;
}

/* Provided by SubjectProvider in subject-context.tsx; kept apart from it so
   that file exports only a component. */
export const SubjectContext = createContext<SubjectState>({
    subject: SUBJECT_SELECTED_DEFAULT,
    setSubject: () => { },
});

/* The subject selected site-wide: Informatics, Maths, or SUBJECT_ALL. */
export const useSubject = () => useContext(SubjectContext);
