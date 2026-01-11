import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage, useAuth } from '../context';
import { Input, Button } from '../components';
import { SEO, SEOConfigs } from '../components/SEO';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Lozinke se ne poklapaju');
      setIsLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.message || 'Greška pri registraciji');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <SEO {...SEOConfigs.register} />
      
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.auth.register}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t.auth.createAccount}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-lg dark:shadow-black/20 dark:border dark:border-dark-border space-y-6 transition-colors duration-300">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.auth.firstName}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label={t.auth.lastName}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            type="email"
            label={t.auth.email}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="vas@email.com"
            required
          />

          <Input
            type="password"
            label={t.auth.password}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Input
            type="password"
            label={t.auth.confirmPassword}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <label className="flex items-center">
            <input type="checkbox" className="mr-2 accent-[#e85d45]" required />
            <span className="text-sm text-gray-600 dark:text-gray-300">{t.auth.acceptTermsText}</span>
          </label>

          <Button type="submit" fullWidth isLoading={isLoading}>
            {t.auth.register}
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t.auth.haveAccount}{' '}
            <Link to="/login" className="text-[#e85d45] hover:underline">
              {t.auth.login}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
