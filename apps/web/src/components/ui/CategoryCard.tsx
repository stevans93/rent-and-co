import { Link } from 'react-router-dom';

interface CategoryCardProps {
  id: number | string;
  name: string;
  count: number;
  icon?: React.ReactNode;
}

export default function CategoryCard({ id, name, count, icon }: CategoryCardProps) {
  return (
    <Link
      to={`/categories/${id}`}
      className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-white/5 rounded-xl p-6 text-center hover:shadow-lg transition-shadow block"
    >
      <div className="w-14 h-14 bg-[#e85d45]/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
        {icon || (
          <svg
            className="w-7 h-7 text-[#e85d45]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{count} resursa</p>
    </Link>
  );
}
