import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../../context';
import { Language } from '../../i18n';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/categories', label: t.nav.categories },
    { to: '/search', label: t.nav.findProduct },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'sr', label: 'Srpski', flag: '🇷🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ro', label: 'Română', flag: '🇷🇴' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  const currentLang = languages.find(l => l.code === language);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="bg-[#1a1a1a] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">
              RENT<span className="text-[#e85d45]">&</span>CO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }: { isActive: boolean }) =>
                  `text-sm hover:text-[#e85d45] transition-colors ${
                    isActive ? 'text-[#e85d45]' : 'text-gray-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors px-2 py-1 border border-gray-600 rounded-lg"
              >
                <span className="mr-1 leading-none">{currentLang?.flag}</span>
                <span className="leading-none">{currentLang?.code.toUpperCase()}</span>
                <svg
                  className={`w-4 h-4 ml-1 transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg py-1 z-50">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                        language === lang.code ? 'text-[#e85d45]' : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites Icon */}
            <Link
              to="/favorites"
              className="p-2 text-gray-300 hover:text-[#e85d45] transition-colors relative"
              title={t.nav.favorites}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/login"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </div>

            {/* Add Product Button */}
            <Link
              to="/create"
              className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
            >
              <span>{t.nav.addProduct}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            className="lg:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Overlay */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden absolute left-0 right-0 top-16 bg-[#1a1a1a] shadow-lg z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }: { isActive: boolean }) =>
                  `text-sm hover:text-[#e85d45] transition-colors ${
                    isActive ? 'text-[#e85d45]' : 'text-gray-300'
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
              ))}

              <hr className="border-gray-700" />

              {/* Mobile Language Selector */}
              <div className="flex flex-wrap items-center gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1 rounded text-sm ${
                      language === lang.code
                        ? 'bg-[#e85d45] text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {lang.flag} {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>

              <hr className="border-gray-700" />

              <Link
                to="/favorites"
                className="text-sm text-gray-300 hover:text-white flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {t.nav.favorites}
              </Link>

              <Link
                to="/login"
                className="text-sm text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.login}
              </Link>

              <Link
                to="/register"
                className="text-sm text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.register}
              </Link>

              <Link
                to="/create"
                className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-4 py-2 rounded-lg text-sm font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.addProduct}
              </Link>
            </nav>
          </div>
        </div>

      {/* Click outside to close dropdowns */}
      {(isLangOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLangOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
