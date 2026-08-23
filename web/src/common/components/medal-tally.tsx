import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MedalChartEntry } from './medal-chart';
import '../styles/medal-tally.css';

interface MedalTallyProps {
    entries: MedalChartEntry[];
}

/* Totals across every year charted, so it always agrees with the chart above. */
export const MedalTally = ({ entries }: MedalTallyProps) => {
    const { t } = useTranslation();

    const totals = useMemo(() => entries.reduce((acc, entry) => ({
        gold: acc.gold + entry.gold,
        silver: acc.silver + entry.silver,
        bronze: acc.bronze + entry.bronze,
        participations: acc.participations + entry.gold + entry.silver + entry.bronze + entry.none,
    }), { gold: 0, silver: 0, bronze: 0, participations: 0 }), [entries]);

    if (!entries.length) return null;

    return <>
        <p className='subsubtitle'>{t('Total')}</p>
        <p className='medal-tally'>
            <span className='gold'>{t('Gold')}: {totals.gold}</span>
            <span className='silver'>{t('Silver')}: {totals.silver}</span>
            <span className='bronze'>{t('Bronze')}: {totals.bronze}</span>
            <span>{t('Participations')}: {totals.participations}</span>
        </p>
    </>;
};
