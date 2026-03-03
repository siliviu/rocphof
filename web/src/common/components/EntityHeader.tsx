import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
    title: string | null | undefined;
    subtitleHref?: string;
    subtitleText?: string;
    subsubtitleHref?: string;
    subsubtitleText?: string;
}

export const EntityHeader: React.FC<Props> = ({ title, subtitleHref, subtitleText, subsubtitleHref, subsubtitleText }) => {
    return (
        <div className='panel'>
            <p className='title'>{title}</p>
            {subtitleHref && subtitleText && (
                <p className='subtitle'><Link to={subtitleHref}>{subtitleText}</Link></p>
            )}
            {subsubtitleHref && subsubtitleText && (
                <p className='subsubtitle'><Link to={subsubtitleHref}>{subsubtitleText}</Link></p>
            )}
        </div>
    );
};
