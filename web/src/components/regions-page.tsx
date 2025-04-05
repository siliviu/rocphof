import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapping from '../assets/ro.json';
import map from '../assets/ro.svg';

export const RegionPages = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [svgElement, setSvgElement] = useState<JSX.Element | null>(null);
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    useEffect(() => {
        document.title = t("ROCPHOF");

        fetch(map)
            .then((response) => response.text())
            .then((svg) => {
                const svgDoc = new DOMParser().parseFromString(svg, 'image/svg+xml');
                const paths = Array.from(svgDoc.querySelectorAll('path'));

                setSvgElement((
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox={svgDoc.documentElement.getAttribute('viewBox') || '0 0 1000 1000'}
                            className="romania-map"
                        >
                            {paths.map((path, index) => {
                                const region = mapping.features.find(feature => feature.properties.id === path.id);

                                return (
                                    <path
                                        key={index}
                                        d={path.getAttribute('d') || ''}
                                        fill="#ccc"
                                        stroke="#000"
                                        onMouseOver={() => region && setHoveredRegion(region.properties.name)}
                                        onMouseOut={() => setHoveredRegion(null)}
                                        onClick={() => region && navigate(`/region/${region.properties.name}`)}
                                        style={{ cursor: 'pointer' }} />
                                );
                            })}
                        </svg>
                    ));
            });
    }, [i18n.language]);

    return (
        <>
            <div className='panel'>
                <div className='map-container'>
                    <div className="hover-label title">{hoveredRegion ?? t("Region")}</div>
                    {svgElement}
                </div>
            </div>
        </>
    );
};