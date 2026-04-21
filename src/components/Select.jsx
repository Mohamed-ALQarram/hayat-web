import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ className = '', label, error, options = [], ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full bg-slate-100 border text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 appearance-none outline-none pr-3 pl-10 ${
            error ? 'border-red-500' : 'border-transparent'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>اختر الاختيار</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          <ChevronDown size={18} />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
