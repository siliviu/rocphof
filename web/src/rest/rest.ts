const url = "http://localhost:8080/results"


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

export function getParticipantsForContest(id: number, grade: number) {
    return fetch(`${url}/contests/${id}/participants/${grade}`)
        .then(response => response.text())
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

export function getRanking(name: string, generation: number) {
    const obj: any = {};
    if (name)
        obj.region = name;
    if (generation)
        obj.year = generation;
    return fetch(`${url}/ranking?` + new URLSearchParams(obj))
        .then(response => response.json())
}