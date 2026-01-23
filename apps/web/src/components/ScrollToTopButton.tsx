import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopButton - Floating button that appears after 30% scroll
 * and scrolls the page to top when clicked
 * Hidden on dashboard pages
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  
  // Hide on dashboard pages
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isDashboard) {
      setIsVisible(false);
      return;
    }

    const toggleVisibility = () => {
      // Calculate 30% of page height
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollPercentage = (scrolled / scrollHeight) * 100;

      if (scrollPercentage >= 30) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Check initial state
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [isDashboard]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#e85d45] hover:bg-[#d14d35] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#e85d45] focus:ring-offset-2 dark:focus:ring-offset-[#121212] ${
        isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Vrati se na vrh"
      title="Vrati se na vrh"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M5 15l7-7 7 7" 
        />
      </svg>
    </button>
  );
}
