const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyles = 'font-medium rounded-lg text-sm px-5 py-3 text-center focus:ring-4 focus:outline-none transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white bg-[#0052b4] hover:bg-[#004294] focus:ring-blue-300',
    secondary: 'text-[#0052b4] bg-blue-50 hover:bg-blue-100 focus:ring-blue-200',
    outline: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} w-full ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
