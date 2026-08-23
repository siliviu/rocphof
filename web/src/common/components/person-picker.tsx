import { useEffect, useState } from 'react';
import { getPeopleByName } from '../../api/rest';
import { Person } from '../../model/person';
import './person-picker.css';

interface PersonPickerProps {
    selected: Person | null;
    onSelect: (person: Person | null) => void;
}

/* Reuses the public name search, which already does fuzzy and diacritic
   matching, so the admin form agrees with what the site considers a match. */
export const PersonPicker = ({ selected, onSelect }: PersonPickerProps) => {
    const [search, setSearch] = useState('');
    const [matches, setMatches] = useState<Person[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (selected || search.trim().length < 3) {
            setMatches([]);
            return;
        }
        /* Debounced so typing does not fire a request per keystroke. */
        const handle = setTimeout(() => {
            setSearching(true);
            getPeopleByName(search.trim())
                .then(setMatches)
                .catch(() => setMatches([]))
                .finally(() => setSearching(false));
        }, 250);
        return () => clearTimeout(handle);
    }, [search, selected]);

    if (selected) {
        return (
            <div className='person-picker'>
                <span className='person-picker-selected'>
                    {selected.name} ({selected.schoolYear + 5}-{selected.schoolYear + 12})
                </span>
                <button type='button' onClick={() => { onSelect(null); setSearch(''); }}>
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className='person-picker'>
            <input
                type='text'
                placeholder='Type a name...'
                value={search}
                onChange={event => setSearch(event.target.value)}
            />
            {searching && <span className='person-picker-hint'>Searching...</span>}
            {!searching && matches.length > 0 && (
                <ul className='person-picker-results'>
                    {matches.map(person => (
                        <li key={person.id}>
                            <button type='button' onClick={() => onSelect(person)}>
                                {person.name}
                                <span className='person-picker-years'>
                                    {person.schoolYear + 5}-{person.schoolYear + 12}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!searching && search.trim().length >= 3 && matches.length === 0 && (
                <span className='person-picker-hint'>No match</span>
            )}
        </div>
    );
};
