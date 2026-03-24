import React from 'react';

interface RangeSelectorProps {
    startYear: number;
    endYear: number;
    min: number;
    max: number;
    trackRef: React.RefObject<HTMLDivElement>;
    onThumbPointerDown: (type: 'start' | 'end', e: React.PointerEvent) => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
    startYear,
    endYear,
    min,
    max,
    trackRef,
    onThumbPointerDown
}) => {
    return (
        <div className='range-container'>
            <div className='range-values'>{startYear} — {endYear}</div>
            <div className='range-track' ref={trackRef}>
                <div className='range-background' />
                {(() => {
                    const left = ((Math.min(startYear, endYear) - min) / (max - min)) * 100;
                    const right = ((Math.max(startYear, endYear) - min) / (max - min)) * 100;
                    const width = Math.max(0, right - left);
                    return <div className='range-fill' style={{ left: `${left}%`, width: `${width}%` }} />;
                })()}
                {(() => {
                    const left = ((startYear - min) / (max - min)) * 100;
                    const right = ((endYear - min) / (max - min)) * 100;
                    return (
                        <>
                            <div className='thumb' style={{ left: `${left}%` }} onPointerDown={e => onThumbPointerDown('start', e)} />
                            <div className='thumb' style={{ left: `${right}%` }} onPointerDown={e => onThumbPointerDown('end', e)} />
                        </>
                    );
                })()}
            </div>
            <div />
        </div>
    );
};