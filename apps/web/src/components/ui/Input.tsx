import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            border rounded-xl px-4 py-3 outline-none transition-all duration-300
            focus:border-[#e85d45] focus:ring-2 focus:ring-[#e85d45]/20
            bg-white dark:bg-[#1e1e2e] text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
