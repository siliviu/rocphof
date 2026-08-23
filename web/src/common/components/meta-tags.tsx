import { useEffect } from 'react';

interface MetaTagsProps {
    title?: string;
    description: string;
}

const SITE_NAME = 'ROCPHOF';

/* Tags are reused across navigations rather than removed on unmount, so a page
   is never left without a description while the next one mounts. */
const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
    const selector = `meta[${attribute}="${key}"]`;
    let tag = document.head.querySelector(selector);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
};

const setCanonical = (url: string) => {
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    link.setAttribute('href', url);
};

export const MetaTags = ({ title, description }: MetaTagsProps) => {
    useEffect(() => {
        const fullTitle = title ? (title === SITE_NAME ? title : `${title} | ${SITE_NAME}`) : SITE_NAME;
        document.title = fullTitle;

        const url = window.location.href;
        const image = new URL('/trophy.svg', window.location.origin).href;

        setMeta('name', 'description', description);

        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:site_name', SITE_NAME);
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:image', image);

        setMeta('name', 'twitter:card', 'summary');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', description);
        setMeta('name', 'twitter:image', image);

        setCanonical(url);
    }, [title, description]);

    return null;
};
