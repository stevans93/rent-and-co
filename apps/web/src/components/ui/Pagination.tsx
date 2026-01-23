interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults?: number;
  resultsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
  resultsPerPage = 12,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const startResult = totalResults && totalResults > 0 ? (currentPage - 1) * resultsPerPage + 1 : 0;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults || 0);

  // Don't render if only 1 page
  if (totalPages <= 1) {
    return totalResults !== undefined && totalResults > 0 ? (
      <div className="mt-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Prikazano {startResult} - {endResult} od {totalResults} {totalResults === 1 ? 'rezultat' : totalResults < 5 ? 'rezultata' : 'rezultata'}
        </p>
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col items-center mt-8 space-y-4">
      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Prva stranica"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Prethodna stranica"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
                page === currentPage
                  ? 'bg-[#e85d45] text-white shadow-md'
                  : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 sm:px-2 text-gray-400 dark:text-gray-500">•••</span>
          )
        ))}
        
        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Sledeća stranica"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Poslednja stranica"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Results Info */}
      {totalResults !== undefined && totalResults > 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Prikazano <span className="font-medium text-gray-700 dark:text-gray-300">{startResult} - {endResult}</span> od <span className="font-medium text-gray-700 dark:text-gray-300">{totalResults}</span> {totalResults === 1 ? 'rezultat' : totalResults < 5 ? 'rezultata' : 'rezultata'}
        </p>
      )}
    </div>
  );
}
