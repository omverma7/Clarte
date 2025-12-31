
import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme, className = "" }) => {
  const options: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const CurrentIcon = options.find(opt => opt.value === theme)?.icon || Monitor;

  return (
    <div className={`relative group ${className}`}>
      {/* Trigger Button */}
      <button
        className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sub)] rounded-full transition-all flex items-center justify-center"
        aria-label="Select theme"
      >
        <CurrentIcon className="w-[18px] h-[18px]" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] transform translate-y-1 group-hover:translate-y-0">
        <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-[12px] shadow-2xl py-2 min-w-[140px] glass overflow-hidden">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-[var(--bg-sub)] ${
                  isActive ? 'text-[var(--accent-bg)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isActive && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
