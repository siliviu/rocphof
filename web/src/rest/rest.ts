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

export function getResultsForContest(id: number, grade: number) {
    return fetch(`${url}/contests/${id}/results/${grade}`)
        .then(response => response.json())
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