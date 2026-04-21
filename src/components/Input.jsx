import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full bg-slate-100 border text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 pr-4 outline-none ${
            error ? 'border-red-500' : 'border-transparent'
          } ${Icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
