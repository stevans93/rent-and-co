import { useLanguage } from '../context';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (onSearch) {
      onSearch(input.value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
        <div className="flex-1 flex items-center border rounded-lg px-4 py-2">
          <svg
            className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder={t.home.searchPlaceholder}
            className="flex-1 outline-none text-gray-700 min-w-0 leading-none"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-start">
          <button type="button" className="sm:ml-2 px-4 py-2 text-gray-600 inline-flex items-center gap-1">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>{t.home.filters}</span>
          </button>
          <button type="submit" className="sm:ml-2 bg-[#e85d45] text-white p-3 rounded-lg hover:bg-[#d54d35] transition-colors inline-flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
