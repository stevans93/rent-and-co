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
    <div className={`flex justify-between items-center mb-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      {linkText && linkTo && (
        <Link
          to={linkTo}
          className="text-[#e85d45] hover:underline inline-flex items-center gap-1"
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
