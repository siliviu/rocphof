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
        <div className='panel'>
            <p><Link className='subtitle' to="/contest/6/5">ONI 2024</Link></p>
            <p><Link className='subtitle' to="/ranking">All-time Ranking</Link></p>
        </div>
        <div className='panel'>
            <div className="search-bar">
                <input
                    onInput={e => setInput((e.target as HTMLInputElement).value)}
                    onKeyDown={e => {
                        if (e.key == 'Enter')
                            search();
                    }} />
                <button onClick={search}>Search</button>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Generation</th>
                    </tr>
                    {table}
                </tbody>
            </table>
        </div>
        <div className='panel'>
            <p>Made by Liviu Silion</p>
            <p>Contact me on Discord @starlights_ for any mistakes</p>
        </div>
    </>
}