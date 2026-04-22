const Button = ({ children, className = '', variant = 'primary', size = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';
  
  const variants = {
    primary: 'text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)] focus-visible:ring-[var(--brand)] shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary: 'text-[var(--brand)] bg-[var(--brand-light)] hover:bg-[var(--brand-100)] focus-visible:ring-[var(--brand)] active:scale-[0.98]',
    outline: 'text-[var(--text-secondary)] bg-white border border-[var(--border)] hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-[var(--brand)] active:scale-[0.98]',
    danger: 'text-white bg-[var(--status-error-text)] hover:bg-red-800 focus-visible:ring-red-500 active:scale-[0.98]',
    ghost: 'text-[var(--text-secondary)] hover:bg-gray-100 hover:text-[var(--text-primary)] focus-visible:ring-[var(--brand)]',
    brand: 'text-[var(--brand)] bg-transparent border border-white/30 hover:bg-white/10 focus-visible:ring-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    default: 'text-sm px-5 py-2.5',
    lg: 'text-sm px-6 py-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
