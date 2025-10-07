import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import infoIcon from '../../assets/info.png';
import '../styles/tooltip.css';

interface InfoTooltipProps {
    translationKey: string;
}

export const InfoTooltip = ({translationKey}: InfoTooltipProps) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <div
            className={`tooltip-container ${open ? 'open' : ''}`}
            onBlur={() => setOpen(false)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <img
                src={infoIcon}
                className="tooltip-icon invertible"
                aria-hidden="true"
                alt={""}
            />

            <div
                className={`tooltip-popup ${open ? 'open' : ''}`}
                role="tooltip"
                aria-hidden={!open}
            >
                {t(translationKey)}
            </div>
        </div>
    );
};
