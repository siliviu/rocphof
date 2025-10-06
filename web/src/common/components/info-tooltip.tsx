import { useTranslation } from 'react-i18next';
import infoIcon from '../../assets/info.png';
import '../styles/tooltip.css';

interface InfoTooltipProps {
    translationKey: string;
}

export const InfoTooltip = ({ translationKey }: InfoTooltipProps) => {
    const { t } = useTranslation();
    return (
        <img 
            src={infoIcon}
            className="tooltip invertable"
            title={t(translationKey)}
            alt="info"
        />
    );
};
