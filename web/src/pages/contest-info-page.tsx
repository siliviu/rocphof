import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContestById, getNextContest, getPreviousContest } from "../api/rest";
import { Contest } from "../model/contest";
import { Loading, MetaTags } from "../common/components";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CONTEST_LOT, CONTEST_ONI } from "../constants";
import './contest-page.css'

export const ContestInfoPage = () => {
    const { id: idParam } = useParams();
    const { t } = useTranslation();
    const [contest, setContest] = useState<Contest | null>(null);
    const [prevContest, setPrevContest] = useState<Contest | null>(null);
    const [nextContest, setNextContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);

    const id = Number(idParam);
    const isONI = contest?.name === CONTEST_ONI;
    const isLOT = contest?.name === CONTEST_LOT;
    const isInternational = contest && !isONI && !isLOT;
    const grades =
        isONI ? [5, 6, 7, 8, 9, 10, 11, 12] :
            isLOT ? [1, 2] : [];

    useEffect(() => {
        Promise.all([
            getContestById(id).then(setContest),
            getPreviousContest(id)
                .then(setPrevContest)
                .catch(() => setPrevContest(null)),
            getNextContest(id)
                .then(setNextContest)
                .catch(() => setNextContest(null))
        ]).finally(() => setLoading(false));
    }, [id]);

    return <>
        <MetaTags
            title={contest ? `${contest.name} ${contest.year}` : ''}
            description={t('meta.contest_info', { name: contest?.name, year: contest?.year })}
        />
        <div className='panel'>
            {!loading && contest ? <>
                <p className='title selector'>
                    {prevContest ? <Link className='arrow' to={`/contest/${prevContest.id}`}> &lt;</Link> : <div />}
                    <span>{contest.name} {contest.year}</span>
                    {nextContest ? <Link className='arrow' to={`/contest/${nextContest.id}`}> &gt;</Link> : <div />}
                </p>
                <div className={'info-header'}>
                    {contest.city && `${contest.city}, `}{contest.country}
                    {contest.start && <p>{contest.start} - {contest.end}</p>}
                    {contest.site && <p className='info-small-links'> {
                        contest.site.split('+').map((s, i) => (
                            <a key={i} href={s.trim()} target="_blank" rel="noreferrer">{s.trim()}</a>
                        ))}
                    </p>}
                    {contest.participants && <p>
                        {t(contest.participants >= 20 ? "Participants_many" : "Participants", { count: contest.participants })}
                    </p>}
                </div>
                <div className='info-content'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{contest.desc!}</ReactMarkdown>
                </div>
                <div className='results-box'> {
                    isInternational ?
                        <Link className='subtitle' to={`/contest/${contest.id}/1`}>{t('info.results')}</Link> :
                        <>
                            <p className='subtitle'> {t('info.results_grade')}</p>
                            <div className="info-links">
                                {grades.map(grade =>
                                    <Link key={grade} className='spaced link-bold' to={`/contest/${contest.id}/${grade}`}>
                                        {isONI ? grade : t(["Girl", "Junior", "Senior"][grade])}
                                    </Link>)}
                            </div>
                        </>
                } </div>
            </> : <Loading />}
        </div>
        <div className="panel">
            {!loading && contest ? <>
                <p className="title">{t('info.header', { name: contest.name })}</p>
                <div className='info-content'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{t(`info.${contest.name}`)}</ReactMarkdown>
                </div>
            </> : <Loading />}
        </div>
    </>
}