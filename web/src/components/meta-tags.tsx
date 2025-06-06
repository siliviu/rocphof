import { useEffect } from 'react';

interface MetaTagsProps {
    title?: string;
    description: string;
}

export const MetaTags = ({ title, description }: MetaTagsProps) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);
        
        return () => {
            if (metaDescription && metaDescription.parentNode) {
                metaDescription.parentNode.removeChild(metaDescription);
            }
        };
    }, [title, description]);

    return null;
};
