import { baseUrl as url } from './constants';
import { Contest } from '../model/contest';
import { Person } from '../model/person';
import { Medal, Prize, Result } from '../model/result';

const adminUrl = `${url}/admin`;

const send = async <T>(path: string, method: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${adminUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(await response.text() || `Request failed (${response.status})`);
    }
    return response.json();
};

export type ContestInput = Omit<Contest, 'id'>;

export function addContest(contest: ContestInput) {
    return send<Contest>('/contests', 'POST', contest);
}

/* Only the changed fields are sent; omitted ones are left as they are. */
export function updateContest(id: number, changes: Partial<ContestInput>) {
    return send<Contest>(`/contests/${id}`, 'PATCH', changes);
}

export function addPerson(person: { name: string; schoolYear: number }) {
    return send<Person>('/people', 'POST', person);
}

export interface ResultInput {
    year: number;
    score: number | null;
    place: number | null;
    prize: Prize | null;
    medal: Medal | null;
    unofficial: boolean | null;
}

export function addResult(
    contestId: number,
    personId: number,
    institutionId: number | null,
    result: ResultInput
) {
    const params = new URLSearchParams({
        contestId: String(contestId),
        personId: String(personId),
    });
    if (institutionId !== null) params.set('institutionId', String(institutionId));
    return send<Result>(`/results?${params}`, 'POST', result);
}
