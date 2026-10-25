import { baseUrl as url } from './constants';
import { RankingScope, SCOPE_DEFAULT, SUBJECT_SELECTED_DEFAULT, Subject } from '../constants';

export function getPersonById(id: number) {
    return fetch(`${url}/people/${id}`)
        .then(response => response.json())
}
export function getContestById(id: number) {
    return fetch(`${url}/contests/${id}`)
        .then(response => response.json())
}
export function getInstitutionById(id: number) {
    return fetch(`${url}/institutions/${id}`)
        .then(response => response.json())
}

export function getAllContests() {
    return fetch(`${url}/contests`)
        .then(response => response.json());
}

export function getPreviousContest(id: number) {
    return fetch(`${url}/contests/${id}/previous`)
        .then(response => response.json());
}

export function getNextContest(id: number) {
    return fetch(`${url}/contests/${id}/next`)
        .then(response => response.json());
}

export function getResultsForContest(id: number, grade: number) {
    return fetch(`${url}/contests/${id}/results/${grade}`)
        .then(response => response.json())
}

export function getResultsForContestName(name: string) {
    return fetch(`${url}/contests/name/${encodeURIComponent(name)}/results`)
        .then(response => response.json())
}

export function getParticipantsForContest(id: number, grade: number) {
    return fetch(`${url}/contests/${id}/participants/${grade}`)
        .then(response => response.text())
        .then(result => Number(result))
}

export function getResultsForPerson(id: number) {
    return fetch(`${url}/people/${id}/results`)
        .then(response => response.json())
}

export function getResultsForRegion(name: string) {
    return fetch(`${url}/regions/${name}/results`)
        .then(response => response.json())
}

export function getResultsForInstitution(id: number) {
    return fetch(`${url}/institutions/${id}/results`)
        .then(response => response.json())
}

export function getPeopleByName(search: string) {
    return fetch(`${url}/people?` + new URLSearchParams({ name: search }))
        .then(response => response.json())
}

/* Rankings count the selected subject, or every subject with SUBJECT_ALL, which
   the backend accepts as-is. The scope selects which contests are counted. */
export function getPeopleRanking(region: string | null, institution: string | null, generation: number | null, scope: RankingScope = SCOPE_DEFAULT, subject: Subject = SUBJECT_SELECTED_DEFAULT) {
    const obj: any = { subject, scope };
    if (region)
        obj.region = region;
    if (institution)
        obj.institution = institution;
    if (generation)
        obj.year = generation;
    return fetch(`${url}/rankings/people?` + new URLSearchParams(obj))
        .then(response => response.json())
}

export function getInstitutionRankings(startYear: number | null, endYear: number | null, scope: RankingScope = SCOPE_DEFAULT, subject: Subject = SUBJECT_SELECTED_DEFAULT) {
    const obj: any = { subject, scope };
    if (startYear !== null && startYear !== undefined)
        obj.startYear = String(startYear);
    if (endYear !== null && endYear !== undefined)
        obj.endYear = String(endYear);
    return fetch(`${url}/rankings/institutions?` + new URLSearchParams(obj))
        .then(response => response.json())
}

export function getRegionRankings(startYear: number | null, endYear: number | null, scope: RankingScope = SCOPE_DEFAULT, subject: Subject = SUBJECT_SELECTED_DEFAULT) {
    const obj: any = { subject, scope };
    if (startYear !== null && startYear !== undefined)
        obj.startYear = String(startYear);
    if (endYear !== null && endYear !== undefined)
        obj.endYear = String(endYear);
    return fetch(`${url}/rankings/regions?` + new URLSearchParams(obj))
        .then(response => response.json())
}

/* Per-contest breakdown of the international ranking. The region and institution
   filters match on where the person competed at ONI, since international results
   record no institution of their own. */
export function getInternationalRanking(startYear: number | null, endYear: number | null, region: string | null = null, institution: string | null = null, generation: number | null = null, subject: Subject = SUBJECT_SELECTED_DEFAULT) {
    const obj: any = { subject };
    if (startYear !== null && startYear !== undefined)
        obj.startYear = String(startYear);
    if (endYear !== null && endYear !== undefined)
        obj.endYear = String(endYear);
    if (region)
        obj.region = region;
    if (institution)
        obj.institution = institution;
    if (generation)
        obj.year = generation;
    return fetch(`${url}/rankings/international?` + new URLSearchParams(obj))
        .then(response => response.json())
}

/* Column display order, plus which of those columns award no medals. */
/* The columns of the selected subject: IMO for maths, the informatics contests
   and LOT for informatics, all of them combined. */
export function getInternationalColumns(subject: Subject = SUBJECT_SELECTED_DEFAULT) {
    return fetch(`${url}/rankings/international/columns?subject=${encodeURIComponent(subject)}`)
        .then(response => response.json())
}
