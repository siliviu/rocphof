import { useParams, Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { Medal, Result } from '../model/result';
import { getPeopleByName, getPersonById, getResultsForPerson } from '../rest/rest';
import { Person } from '../model/person';

export const SearchPage = () => {
    const [input, setInput] = useState('');
    const [table, setTable] = useState();
    const search = () => {
        getPeopleByName(input)
            .then(results => {
                setTable(
                    results.map((person: Person) =>
                        <tr>
                            <td><Link to={`/person/${person.id}`}>{person.name}</Link></td>
                            <td>{person.schoolYear + 5}-{person.schoolYear + 12}</td>
                        </tr>
                    ));
            })
    }
    return <>
        <input onInput={e => setInput((e.target as HTMLInputElement).value)}></input>
        <button onClick={search}>Search</button>
        <table>
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>Generation</th>
                </tr>
                {table}
            </tbody>
        </table>
    </>
}