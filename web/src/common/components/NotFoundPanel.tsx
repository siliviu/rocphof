import React from 'react';
import { MetaTags } from './meta-tags';
import { useTranslation } from 'react-i18next';

type Props = {
    messageKey?: string;
    defaultMessage?: string;
}

export const NotFoundPanel: React.FC<Props> = ({ messageKey, defaultMessage }) => {
    const { t } = useTranslation();
    const msg = messageKey ? (t(messageKey) ?? defaultMessage) : (defaultMessage ?? 'Not found');
    return (
        <>
            <MetaTags title={msg} description={msg} />
            <div className='panel'>
                <p className='title'>{msg}</p>
            </div>
        </>
    );
};
