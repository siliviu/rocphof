import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Result, getMedalClass } from '../model/result';
import { getParticipantsForContest, getPersonById, getResultsForPerson } from '../rest/rest';
import { Person } from '../model/person';
import { useTranslation } from 'react-i18next';
import { Loading } from './loading';

export const PersonPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const [tableONI, setTableONI] = useState();
    const [tableLOT, setTableLOT] = useState<any>();
    const [tableInternational, setTableInternational] = useState<any>();
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPersonById(Number(id))
            .then(person => {
                setPerson(person);
                document.title = person.name;
            });
    }, [id]);

    useEffect(() => {
        setLoading(true);
        getResultsForPerson(Number(id))
            .then(async (results) => {
                await Promise.all(results.map(async (result: Result) => {
                    result.total = await getParticipantsForContest(result.contest.id, result.year);
                    return result;
                }));

                setTableONI(results
                    .filter((result: Result) => result.contest.name === "ONI")
                    .map((result: Result) =>
                        <tr key={result.id} className={getMedalClass(result.medal)}>
                            <td>{result.contest.year}</td>
                            <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.year}</Link></td>
                            <td><Link to={`/region/${result.institution!.region}`}>{result.institution!.region}</Link></td>
                            <td><Link to={`/institution/${result.institution!.id}`}>{result.institution!.name}</Link></td>
                            <td>{result.score}</td>
                            <td>{result.place} / {result.total}</td>
                            <td>{result.prize ? t(`Prize.${result.prize}`) : ''}</td>
                            <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>
                        </tr>
                    ));

                setTableLOT(results
                    .filter((result: Result) => result.contest.name === "LOT")
                    .map((result: Result) =>
                        <tr key={result.id}>
                            <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.contest.year}</Link></td>
                            <td>{result.year === 1 ? t("Junior") : t("Senior")}</td>
                            <td>{person && result.contest.year - person.schoolYear}</td>
                            <td>{result.score}</td>
                            <td>{result.place}</td>
                            <td>{result.prize ? t("Final.Yes") : ''}</td>
                        </tr>
                    ));

                setTableInternational(results
                    .filter((result: Result) => result.contest.name !== "ONI" && result.contest.name !== "LOT")
                    .map((result: Result) =>
                        <tr key={result.id} className={getMedalClass(result.medal)}>
                            <td><Link to={`/contest/${result.contest.id}/${result.year}`}>{result.contest.year}</Link></td>
                            <td>{result.contest.name}</td>
                            <td>{person && result.contest.year - person.schoolYear}</td>
                            <td>{result.score}</td>
                            <td>{result.place}</td>
                            <td>{result.medal ? t(`Medal.${result.medal}`) : ''}</td>
                        </tr>
                    ));
            })
            .finally(() => setLoading(false));
    }, [id, person, i18n.language]);

    return <>
        <div className='panel'>
            <p className='title'>{person && person.name}</p>
        </div>
        <div className='panel'>
            <p className='title'>ONI</p>
            {loading ? <Loading /> : (
                <table>
                    <tbody>
                        <tr>
                            <th>{t("Year")}</th>
                            <th>{t("Grade")}</th>
                            <th>{t("Region")}</th>
                            <th>{t("Institution")}</th>
                            <th>{t("Score")}</th>
                            <th>{t("Place")}</th>
                            <th>{t("Prize")}</th>
                            <th>{t("Medal")}</th>
                        </tr>
                        {tableONI}
                    </tbody>
                </table>
            )}
        </div>
        {tableLOT && tableLOT.length > 0 && <div className='panel'>
            <p className='title'>LOT</p>
            {loading ? <Loading /> : (
                <table>
                    <tbody>
                        <tr>
                            <th>{t("Year")}</th>
                            <th>{t("Level")}</th>
                            <th>{t("Grade")}</th>
                            <th>{t("Score")}</th>
                            <th>{t("Place")}</th>
                            <th>{t("Final")}</th>
                        </tr>
                        {tableLOT}
                    </tbody>
                </table>
            )}
        </div>}
        {tableInternational && tableInternational.length > 0 && <div className='panel'>
            <p className='title'>INTERNATIONAL</p>
            {loading ? <Loading /> : (
                <table>
                    <tbody>
                        <tr>
                            <th>{t("Year")}</th>
                            <th>{t("Contest")}</th>
                            <th>{t("Grade")}</th>
                            <th>{t("Score")}</th>
                            <th>{t("Place")}</th>
                            <th>{t("Medal")}</th>
                        </tr>
                        {tableInternational}
                    </tbody>
                </table>
            )}
        </div>}
    </>;
};