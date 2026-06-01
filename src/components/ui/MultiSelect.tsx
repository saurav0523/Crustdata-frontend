import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  label,
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemoveOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-1.5 w-full relative select-none", className)}>
      {label && <label className="text-[12px] font-bold text-text-secondary">{label}</label>}

      {/* Select Capsule Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between min-h-[42px] px-3.5 rounded-xl border bg-surface/50 cursor-pointer transition-all duration-200 hover:border-white/12",
          isOpen ? "border-accent ring-1 ring-accent/35" : "border-white/6"
        )}
      >
        <div className="flex flex-wrap gap-1.5 py-1.5 overflow-hidden">
          {selected.length === 0 ? (
            <span className="text-[13px] text-text-secondary">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 bg-accent/15 text-white border border-accent/20 pl-2 pr-1.5 py-0.5 rounded-lg text-[11.5px] font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveOption(item, e)}
                  className="p-0.5 rounded-md hover:bg-accent/20 hover:text-white text-text-secondary transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-text-secondary transition ml-2", isOpen && "transform rotate-180 text-white")} />
      </div>

      {/* Options Panel Dropdown */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full rounded-xl bg-[#16181D] border border-white/8 p-2.5 shadow-2xl z-30 flex flex-col gap-2 animate-in fade-in duration-100">
          {/* Search Input inside Dropdown */}
          <div className="flex items-center px-2 py-1.5 rounded-lg bg-surface/50 border border-white/6">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-[12.5px] placeholder:text-text-secondary focus:ring-0 p-0 text-white"
            />
            {search && (
              <X
                className="w-3.5 h-3.5 text-text-secondary hover:text-white cursor-pointer"
                onClick={() => setSearch('')}
              />
            )}
          </div>

          {/* Options List */}
          <div className="max-h-[180px] overflow-y-auto flex flex-col gap-0.5 pr-1 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-text-secondary">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => handleToggleOption(option)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition text-[12.5px] font-medium",
                      isSelected
                        ? "bg-accent/10 text-white"
                        : "text-text-secondary hover:bg-white/4 hover:text-white"
                    )}
                  >
                    <span>{option}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default MultiSelect;
