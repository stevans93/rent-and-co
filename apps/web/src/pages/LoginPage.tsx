import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, useAuth, useToast } from '../context';
import { Input, Button } from '../components';
import { SEO, SEOConfigs } from '../components/SEO';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showRememberMeWarning, setShowRememberMeWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from state or default to dashboard
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show warning if remember me is not checked (first attempt)
    if (!rememberMe && !showRememberMeWarning) {
      setShowRememberMeWarning(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const result = await login(email, password);
    
    if (result.success) {
      success('Uspešna prijava!', 'Dobrodošli nazad na Rent&Co');
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Greška pri prijavi');
      showError('Greška pri prijavi', result.message || 'Proverite vaše podatke i pokušajte ponovo');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <SEO {...SEOConfigs.login} />
      
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.auth.login}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t.auth.welcomeBack}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-lg dark:shadow-black/20 dark:border dark:border-dark-border space-y-6 transition-colors duration-300">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <Input
            type="email"
            label={t.auth.email}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vas@email.com"
            required
          />

          <Input
            type="password"
            label={t.auth.password}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2 accent-[#e85d45]" 
                  checked={rememberMe}
                  onChange={(e) => {
                    setRememberMe(e.target.checked);
                    if (e.target.checked) {
                      setShowRememberMeWarning(false);
                    }
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{t.auth.rememberMe}</span>
              </label>
              <a href="#" className="text-sm text-[#e85d45] hover:underline">
                {t.auth.forgotPassword}
              </a>
            </div>
            {showRememberMeWarning && (
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                {t.auth.rememberMeWarning}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            {t.auth.login}
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t.auth.noAccount}{' '}
            <Link to="/register" className="text-[#e85d45] hover:underline">
              {t.auth.register}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
