import { useEffect, useRef, useState } from 'react';

type Options = {
    min: number;
    max: number;
    initialStart: number;
    initialEnd: number;
    onChange?: (start: number, end: number) => void;
}

export const useRangeSlider = ({ min, max, initialStart, initialEnd, onChange }: Options) => {
    const [startYear, setStartYear] = useState<number>(initialStart);
    const [endYear, setEndYear] = useState<number>(initialEnd);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const dragging = useRef<'start'|'end'|null>(null);
    /* When both thumbs overlap, the one that gets picked up is decided by the
       drag direction instead of by DOM order, which would always win. */
    const pendingDown = useRef<number | null>(null);

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
        if (pendingDown.current !== null) {
            if (e.clientX === pendingDown.current) return;
            dragging.current = e.clientX < pendingDown.current ? 'start' : 'end';
            pendingDown.current = null;
        }
        if (!dragging.current) return;
        const value = clientXToValue(e.clientX);
        if (dragging.current === 'start') setStartYear(Math.min(value, endRef.current));
        else setEndYear(Math.max(value, startRef.current));
    };

    const onPointerUp = () => {
        dragging.current = null;
        pendingDown.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        const s = Math.min(startRef.current, endRef.current);
        const e = Math.max(startRef.current, endRef.current);
        if (onChange) onChange(s, e);
    };

    const onThumbPointerDown = (which: 'start'|'end', e: any) => {
        e.preventDefault();
        if (startRef.current === endRef.current) {
            dragging.current = null;
            pendingDown.current = e.clientX;
        } else {
            dragging.current = which;
            pendingDown.current = null;
        }
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    /* Keeps the thumbs in step when the range changes externally, so browser
       back and forward navigation moves them. */
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
