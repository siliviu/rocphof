import { useTranslation } from 'react-i18next';
import { SUBJECTS } from '../../constants';
import { useSubject } from '../subject';
import '../styles/subject-selector.css';

/* Site-wide switch between Informatics, Maths and both, shown under the title
   in the top panel on every page. Buttons rather than links, since the choice is not part
   of the page's URL. */
export const SubjectSelector = () => {
    const { t } = useTranslation();
    const { subject, setSubject } = useSubject();

    return (
        <div className='subject-selector' role='radiogroup' aria-label={t('Subject.label')}>
            {SUBJECTS.map(option => (
                <button
                    key={option}
                    type='button'
                    role='radio'
                    aria-checked={option === subject}
                    className={option === subject ? 'subject-option subject-selected' : 'subject-option'}
                    onClick={() => setSubject(option)}
                >
                    {t(`Subject.${option}`)}
                </button>
            ))}
        </div>
    );
};
