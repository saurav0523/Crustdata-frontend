import React, { useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DoubleSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (val: number) => string;
  label?: string;
  className?: string;
}

export function DoubleSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => v.toString(),
  label,
  className
}: DoubleSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease/increase from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (rangeRef.current) {
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease/increase from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (rangeRef.current) {
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Update internal states when props change
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  return (
    <div className={cn("flex flex-col gap-2.5 w-full select-none", className)}>
      {label && (
        <div className="flex items-center justify-between text-[12px] font-bold text-text-secondary">
          <span>{label}</span>
          <span className="text-white bg-white/4 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/6">
            {formatValue(minVal)} - {formatValue(maxVal)}
          </span>
        </div>
      )}
      
      <div className="relative flex items-center h-5 w-full">
        {/* Underlay Track */}
        <div className="absolute w-full h-[4px] rounded bg-white/10" />

        {/* Selected Highlight Track */}
        <div ref={rangeRef} className="absolute h-[4px] rounded bg-accent" />

        {/* Min Input Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(event) => {
            const val = Math.min(Number(event.target.value), maxVal - step);
            setMinVal(val);
            minValRef.current = val;
            onChange([val, maxVal]);
          }}
          className="absolute w-full h-0 pointer-events-none appearance-none outline-none z-20 cursor-pointer 
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(124,92,252,0.4)] [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-115
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-[16px] [&::-moz-range-thumb]:h-[16px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(124,92,252,0.4)] [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:scale-115"
        />

        {/* Max Input Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(event) => {
            const val = Math.max(Number(event.target.value), minVal + step);
            setMaxVal(val);
            maxValRef.current = val;
            onChange([minVal, val]);
          }}
          className="absolute w-full h-0 pointer-events-none appearance-none outline-none z-20 cursor-pointer 
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(124,92,252,0.4)] [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-115
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-[16px] [&::-moz-range-thumb]:h-[16px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(124,92,252,0.4)] [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:scale-115"
        />
      </div>
    </div>
  );
}
export default DoubleSlider;
