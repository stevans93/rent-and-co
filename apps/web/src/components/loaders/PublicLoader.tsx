/**
 * PublicLoader - Fancy animated loader with logo for public pages
 * Used on: Home, Categories, Search, ResourceDetail, About, Contact, Login, Register, Favorites, Pricing, Terms, FAQ, Partner
 * 
 * TESTING: Duration set to 3 seconds - change back to 800ms for production
 */
export const PUBLIC_LOADER_DURATION = 3000; // 3 seconds for testing

export default function PublicLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
      <div className="flex flex-col items-center">
        {/* Animated Logo */}
        <div className="relative mb-6">
          {/* Pulsing background */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#e85d45]/20 animate-ping" style={{ animationDuration: '1.5s' }} />
          
          {/* Main circle with gradient */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#e85d45] to-[#d14d35] flex items-center justify-center shadow-xl">
            {/* R& Logo */}
            <div className="text-white font-bold text-2xl tracking-tight">
              R<span className="text-white/80">&</span>
            </div>
          </div>
          
          {/* Rotating ring */}
          <svg 
            className="absolute inset-0 w-20 h-20 animate-spin" 
            style={{ animationDuration: '2s' }}
            viewBox="0 0 100 100"
          >
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="url(#publicLoaderGradient)" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="100 200"
            />
            <defs>
              <linearGradient id="publicLoaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e85d45" stopOpacity="1" />
                <stop offset="50%" stopColor="#e85d45" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e85d45" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Brand name */}
        <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          RENT<span className="text-[#e85d45]">&</span>CO
        </div>
        
        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#e85d45] to-[#ff7b5f] rounded-full animate-loading-bar"
          />
        </div>
        
        {/* Loading text */}
        <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm">
          Učitavanje...
        </p>
      </div>

      {/* CSS Animation for loading bar */}
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
