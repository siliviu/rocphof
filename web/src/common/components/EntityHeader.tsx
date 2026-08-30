import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/entity-header.css';

type SecondaryLink = {
    href: string;
    text: string;
}

type Props = {
    title: string | null | undefined;
    subtitleHref?: string;
    subtitleText?: string;
    /* A list rather than a single pair, so a page can offer several related
       rankings without the header growing a prop per link. */
    secondaryLinks?: SecondaryLink[];
}

export const EntityHeader: React.FC<Props> = ({ title, subtitleHref, subtitleText, secondaryLinks }) => {
    return (
        <div className='panel'>
            <p className='title'>{title}</p>
            {subtitleHref && subtitleText && (
                <p className='subtitle'><Link to={subtitleHref}>{subtitleText}</Link></p>
            )}
            {secondaryLinks && secondaryLinks.length > 0 && (
                <div className='entity-links'>
                    {secondaryLinks.map(link => (
                        <Link className='subsubtitle' to={link.href} key={link.href}>{link.text}</Link>
                    ))}
                </div>
            )}
        </div>
    );
};
