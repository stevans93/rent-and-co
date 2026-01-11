import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">{label}</label>
        )}
        <select
          ref={ref}
          className={`
            border rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-300
            focus:border-[#e85d45] focus:ring-2 focus:ring-[#e85d45]/20
            bg-white dark:bg-[#1e1e2e] text-gray-900 dark:text-white
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="dark:bg-[#1e1e2e]">
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
