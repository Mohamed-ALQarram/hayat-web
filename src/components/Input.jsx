import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          className={`input-base ${Icon ? 'pl-10' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-tertiary)]">
            <Icon size={16} />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-[var(--status-error-text)]">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
