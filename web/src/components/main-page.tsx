import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPeopleByName } from '../rest/rest';
import { Person } from '../model/person';

export const MainPage = () => {
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
    useEffect(() => {
        if (!input || input.trim() == "") {
            setTable(undefined);
            return;
        }
        search();
    }, [input]);
    document.title = "ROCPHOF";
    return <>
        <div className='panel'>
            <p className='subtitle'>Results By</p>
            <Link className='subtitle' to="/contests">Contest </Link>  <span className='title'>     |     </span>
            <Link className='subtitle' to="/regions"> Region</Link>
            <p><Link className='subtitle' to="/ranking">All-time Ranking</Link></p>
        </div>
        <div className='panel'>
            <p className='subtitle'>Find People</p>
            <div className="search-bar">
                <input
                    onInput={e => {
                        setInput((e.target as HTMLInputElement).value)
                    }}
                ></input>
            </div>
            <table>
                <tbody>
                    {table &&
                        <tr>
                            <th>Name</th>
                            <th>Generation</th>
                        </tr>
                    }
                    {table}
                </tbody>
            </table>
        </div>
        <div className='panel'>
            <p><strong>Archive for Romanian informatics competitions where you can see past results from ONI, LOT and International Competitions</strong></p>
            <p>Made by Liviu Silion</p>
            <p>Contact me on Discord @starlights_ for any mistakes</p>
        </div>
    </>
}