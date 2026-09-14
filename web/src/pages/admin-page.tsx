import { useEffect, useState } from 'react';
import { getAllContests } from '../api/rest';
import { addContest, updateContest, addResult, ContestInput } from '../api/admin';
import { Contest } from '../model/contest';
import { Medal, Prize } from '../model/result';
import { Person } from '../model/person';
import { PersonPicker } from '../common/components/person-picker';
import { Loading } from '../common/components';
import { SUBJECT_DEFAULT } from '../constants';
import './admin-page.css';

/* Editable text fields, in the order they appear on the contest row. */
const CONTEST_FIELDS = [
    'name', 'year', 'desc', 'country', 'city', 'participants', 'site', 'start', 'end',
] as const;
type ContestField = typeof CONTEST_FIELDS[number];

const NUMERIC_FIELDS: ContestField[] = ['year', 'participants'];

const emptyContest = (): Record<ContestField, string> => ({
    name: '', year: '', desc: '', country: '', city: '', participants: '',
    site: '', start: '', end: '',
});

/* Blank strings become null so a field left empty is not stored as "".
   Subject is not editable here; every contest is stored under the single
   subject fixed in constants.ts. */
const toContestInput = (values: Record<ContestField, string>): ContestInput => ({
    name: values.name.trim(),
    subject: SUBJECT_DEFAULT,
    year: Number(values.year),
    desc: values.desc.trim() || null,
    country: values.country.trim() || null,
    city: values.city.trim() || null,
    participants: values.participants.trim() ? Number(values.participants) : null,
    site: values.site.trim() || null,
    start: values.start.trim() || null,
    end: values.end.trim() || null,
});

export const AdminPage = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<Record<ContestField, string>>(emptyContest());
    const [newContest, setNewContest] = useState<Record<ContestField, string>>(emptyContest());

    const [resultContestId, setResultContestId] = useState<number | null>(null);
    const [person, setPerson] = useState<Person | null>(null);
    const [resultYear, setResultYear] = useState('');
    const [score, setScore] = useState('');
    const [place, setPlace] = useState('');
    const [prize, setPrize] = useState<string>('');
    const [medal, setMedal] = useState<string>('');

    const reload = () =>
        getAllContests()
            .then(setContests)
            .catch(() => setError('Could not load contests'))
            .finally(() => setLoading(false));

    useEffect(() => { reload(); }, []);

    const report = (message: string) => {
        setStatus(message);
        setError(null);
    };

    const fail = (e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setStatus(null);
    };

    const startEdit = (contest: Contest) => {
        setEditingId(contest.id);
        setEditValues({
            name: contest.name ?? '',
            year: String(contest.year ?? ''),
            desc: contest.desc ?? '',
            country: contest.country ?? '',
            city: contest.city ?? '',
            participants: contest.participants === null ? '' : String(contest.participants),
            site: contest.site ?? '',
            start: contest.start ?? '',
            end: contest.end ?? '',
        });
    };

    const saveEdit = async () => {
        if (editingId === null) return;
        try {
            await updateContest(editingId, toContestInput(editValues));
            report(`Updated contest ${editingId}`);
            setEditingId(null);
            await reload();
        } catch (e) { fail(e); }
    };

    const createContest = async () => {
        if (!newContest.name.trim() || !newContest.year.trim()) {
            fail(new Error('Name and year are required'));
            return;
        }
        try {
            const created = await addContest(toContestInput(newContest));
            report(`Added contest ${created.name} ${created.year}`);
            setNewContest(emptyContest());
            await reload();
        } catch (e) { fail(e); }
    };

    const createResult = async () => {
        if (resultContestId === null || !person) {
            fail(new Error('Pick a contest and a person'));
            return;
        }
        try {
            await addResult(resultContestId, person.id, null, {
                year: resultYear.trim() ? Number(resultYear) : 0,
                score: score.trim() ? Number(score) : null,
                place: place.trim() ? Number(place) : null,
                prize: prize ? (prize as Prize) : null,
                medal: medal ? (medal as Medal) : null,
                unofficial: null,
            });
            report(`Added result for ${person.name}`);
            setPerson(null);
            setScore('');
            setPlace('');
            setPrize('');
            setMedal('');
        } catch (e) { fail(e); }
    };

    if (loading) return <Loading />;

    return <>
        <div className='panel'>
            <p className='title'>Admin</p>
            <p className='admin-warning'>
                Local only. Requires the backend running with SPRING_PROFILES_ACTIVE=admin.
            </p>
            {status && <p className='admin-status'>{status}</p>}
            {error && <p className='admin-error'>{error}</p>}
        </div>

        <div className='panel'>
            <p className='subtitle'>Add contest</p>
            <div className='admin-form'>
                {CONTEST_FIELDS.map(field => (
                    <label key={field}>
                        {field}
                        <input
                            type={NUMERIC_FIELDS.includes(field) ? 'number' : 'text'}
                            value={newContest[field]}
                            onChange={e => setNewContest({ ...newContest, [field]: e.target.value })}
                        />
                    </label>
                ))}
            </div>
            <button type='button' onClick={createContest}>Add contest</button>
        </div>

        <div className='panel'>
            <p className='subtitle'>Add result</p>
            <div className='admin-form'>
                <label>
                    contest
                    <select
                        value={resultContestId ?? ''}
                        onChange={e => setResultContestId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value=''>Select...</option>
                        {contests.map(contest => (
                            <option key={contest.id} value={contest.id}>
                                {contest.name} {contest.year}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    person
                    <PersonPicker selected={person} onSelect={setPerson} />
                </label>
                <label>
                    grade / level
                    <input type='number' value={resultYear} onChange={e => setResultYear(e.target.value)} />
                </label>
                <label>
                    score
                    <input type='number' step='any' value={score} onChange={e => setScore(e.target.value)} />
                </label>
                <label>
                    place
                    <input type='number' value={place} onChange={e => setPlace(e.target.value)} />
                </label>
                <label>
                    prize
                    <select value={prize} onChange={e => setPrize(e.target.value)}>
                        <option value=''>None</option>
                        {Object.values(Prize).map(value => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </label>
                <label>
                    medal
                    <select value={medal} onChange={e => setMedal(e.target.value)}>
                        <option value=''>None</option>
                        {Object.values(Medal).map(value => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </label>
            </div>
            <button type='button' onClick={createResult}>Add result</button>
        </div>

        <div className='panel'>
            <p className='subtitle'>Contests</p>
        </div>
        <table className='admin-table'>
            <tbody>
                <tr>
                    <th>id</th>
                    {CONTEST_FIELDS.map(field => <th key={field}>{field}</th>)}
                    <th />
                </tr>
                {contests.map(contest => editingId === contest.id ? (
                    <tr key={contest.id}>
                        <td>{contest.id}</td>
                        {CONTEST_FIELDS.map(field => (
                            <td key={field}>
                                <input
                                    type={NUMERIC_FIELDS.includes(field) ? 'number' : 'text'}
                                    value={editValues[field]}
                                    onChange={e => setEditValues({ ...editValues, [field]: e.target.value })}
                                />
                            </td>
                        ))}
                        <td className='admin-actions'>
                            <button type='button' onClick={saveEdit}>Save</button>
                            <button type='button' onClick={() => setEditingId(null)}>Cancel</button>
                        </td>
                    </tr>
                ) : (
                    <tr key={contest.id}>
                        <td>{contest.id}</td>
                        {CONTEST_FIELDS.map(field => (
                            <td key={field}>{contest[field] ?? ''}</td>
                        ))}
                        <td className='admin-actions'>
                            <button type='button' onClick={() => startEdit(contest)}>Edit</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>;
};
