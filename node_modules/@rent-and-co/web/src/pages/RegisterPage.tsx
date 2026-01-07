import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import { Input, Button } from '../components';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
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
    // TODO: Implement registration with API
    console.log('Register:', formData);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t.auth.register}</h1>
          <p className="text-gray-500 mt-2">{t.auth.createAccount}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm space-y-6">
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
            <input type="checkbox" className="mr-2" required />
            <span className="text-sm text-gray-600">{t.auth.acceptTermsText}</span>
          </label>

          <Button type="submit" fullWidth isLoading={isLoading}>
            {t.auth.register}
          </Button>

          <p className="text-center text-sm text-gray-500">
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
