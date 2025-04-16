import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPeopleByName } from '../rest/rest';
import { Person } from '../model/person';
import { useTranslation } from 'react-i18next';

export const MainPage = () => {
    const { t } = useTranslation();
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
    document.title = t("ROCPHOF");
    return <>
        <div className='panel'>
            <p className='subtitle'>{t("Results By")}</p>
            <div className='selector-row'>
                <Link className='subtitle' to="/contests">{t("Contest")} </Link>
                <span className='title'>|</span>
                <Link className='subtitle' to="/regions"> {t("Region")}</Link>
            </div>
            <p><Link className='subtitle' to="/ranking">{t("All-time Ranking")}</Link></p>
        </div>
        <div className='panel'>
            <p className='subtitle'>{t("Find People")}</p>
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
                            <th>{t("Name")}</th>
                            <th>{t("Generation")}</th>
                        </tr>
                    }
                    {table}
                </tbody>
            </table>
        </div>
        <div className='panel'>
            <p><strong>{t("Archive Description")}</strong></p>
            <p>{t("Contact Info")}</p>
        </div>
    </>
}