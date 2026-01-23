import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import { Button } from '../components';

export default function ServerErrorPage() {
  const { t } = useLanguage();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#121212] dark:to-[#1a1a2e] px-4">
      <div className="text-center max-w-lg">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          {/* Animated pulse */}
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">500</h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {t.errors?.serverError || 'Server nije dostupan'}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t.errors?.serverErrorDescription || 'Izvinjavamo se, ali naš server trenutno nije dostupan. Molimo pokušajte ponovo za nekoliko trenutaka.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRetry} size="lg">
            {t.common.tryAgain}
          </Button>
          <Link to="/">
            <Button variant="outline" size="lg">
              {t.errors?.backToHome || 'Nazad na početnu'}
            </Button>
          </Link>
        </div>

        {/* Support info */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          {t.errors?.persistsContact || 'Ako se problem nastavi, kontaktirajte nas na'}{' '}
          <a href="mailto:support@rentandco.rs" className="text-[#e85d45] hover:underline">
            support@rentandco.rs
          </a>
        </p>
      </div>
    </div>
  );
}
