import { useEffect, useState } from 'react';
import geoJson from '../assets/ro.json';
import { useTranslation } from 'react-i18next';

export const RegionPages = () => {
    const { t, i18n } = useTranslation();
    const [svgContent, setSvgContent] = useState<string | null>(null);

    useEffect(() => {
        document.title = "ROCPHOF";

        fetch('/src/assets/ro.svg')
            .then((response) => response.text())
            .then((svg) => setSvgContent(svg));
    }, [i18n.language]);

    const attachEventHandlers = (svg: string): string => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
        const paths = svgDoc.querySelectorAll('path');

        paths.forEach((path) => {
            const regionId = path.id;
            const region = geoJson.features.find(
                (feature) => feature.properties.id === regionId
            );
            if (region) {
                path.setAttribute(
                    'onclick',
                    `window.location.href='/region/${region.properties.name}'`
                );
                path.setAttribute('style', 'cursor: pointer;');

                path.setAttribute(
                    'onmouseover',
                    `document.querySelector('.hover-label').textContent='${region.properties.name}'`
                );
                path.setAttribute(
                    'onmouseout',
                    `document.querySelector('.hover-label').textContent='${t("Region")}'`
                );
            }
        });

        return new XMLSerializer().serializeToString(svgDoc);
    };

    return (
        <>
            <div className='panel'>
                <div className='map-container'>
                    <div className="hover-label title">{t("Region")}</div>
                    {svgContent && (
                        <div
                            className="romania-map"
                            dangerouslySetInnerHTML={{
                                __html: attachEventHandlers(svgContent),
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
};