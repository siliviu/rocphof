import { useEffect, useRef, useState } from 'react';

type Options = {
    min?: number;
    max?: number;
    initialStart?: number;
    initialEnd?: number;
    onChange?: (start: number, end: number) => void;
}

export const useRangeSlider = ({ min = 2010, max = 2030, initialStart = 2010, initialEnd = 2030, onChange }: Options) => {
    const [startYear, setStartYear] = useState<number>(initialStart);
    const [endYear, setEndYear] = useState<number>(initialEnd);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const dragging = useRef<'start'|'end'|null>(null);

    const startRef = useRef<number>(startYear);
    const endRef = useRef<number>(endYear);

    useEffect(() => { startRef.current = startYear; }, [startYear]);
    useEffect(() => { endRef.current = endYear; }, [endYear]);

    const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)));

    const clientXToValue = (clientX: number) => {
        const track = trackRef.current;
        if (!track) return min;
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.min(1, Math.max(0, x / rect.width));
        return clamp(min + pct * (max - min));
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!dragging.current) return;
        const value = clientXToValue(e.clientX);
        if (dragging.current === 'start') setStartYear(Math.min(value, endRef.current));
        else setEndYear(Math.max(value, startRef.current));
    };

    const onPointerUp = () => {
        dragging.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        const s = Math.min(startRef.current, endRef.current);
        const e = Math.max(startRef.current, endRef.current);
        if (onChange) onChange(s, e);
    };

    const onThumbPointerDown = (which: 'start'|'end', e: any) => {
        e.preventDefault();
        dragging.current = which;
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // allow external reset if needed
    useEffect(() => {
        setStartYear(initialStart);
        setEndYear(initialEnd);
        startRef.current = initialStart;
        endRef.current = initialEnd;
    }, [initialStart, initialEnd]);

    return {
        startYear,
        endYear,
        setStartYear,
        setEndYear,
        trackRef,
        onThumbPointerDown,
        min,
        max,
    };
};
