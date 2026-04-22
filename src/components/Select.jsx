import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ className = '', label, error, options = [], ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`input-base appearance-none cursor-pointer pr-4 pl-9 ${error ? 'input-error' : ''} ${className}`}
          {...props}
        >
          <option value="" disabled>اختر...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-tertiary)]">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-[var(--status-error-text)]">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
