import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import { Input, Button } from '../components';

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement login with API
    console.log('Login:', { email, password });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t.auth.login}</h1>
          <p className="text-gray-500 mt-2">{t.auth.welcomeBack}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm space-y-6">
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

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-600">{t.auth.rememberMe}</span>
            </label>
            <a href="#" className="text-sm text-[#e85d45] hover:underline">
              {t.auth.forgotPassword}
            </a>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            {t.auth.login}
          </Button>

          <p className="text-center text-sm text-gray-500">
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
