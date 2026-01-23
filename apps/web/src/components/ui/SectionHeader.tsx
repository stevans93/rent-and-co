import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkTo?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  linkText,
  linkTo,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 ${className}`}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {linkText && linkTo && (
        <Link
          to={linkTo}
          className="text-[#e85d45] hover:bg-[#e85d45]/10 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-medium transition-colors self-start sm:self-auto border border-[#e85d45]/20 hover:border-[#e85d45]/40"
        >
          <span>{linkText}</span>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
