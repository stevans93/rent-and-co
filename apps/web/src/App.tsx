import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider as HelmetProviderComponent } from 'react-helmet-async';
import { Layout } from './components/layout';
import { LanguageProvider, ThemeProvider, AuthProvider } from './context';
import { OrganizationSchema, WebSiteSchema } from './components/SchemaOrg';
import ProtectedRoute from './components/ProtectedRoute';

// Workaround for React 18 type compatibility
const HelmetProvider = HelmetProviderComponent as any;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages for code splitting and better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const CreateResourcePage = lazy(() => import('./pages/CreateResourcePage'));

// Dashboard pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const MyListings = lazy(() => import('./pages/dashboard/MyListings'));
const AddListing = lazy(() => import('./pages/dashboard/AddListing'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardPayments = lazy(() => import('./pages/dashboard/DashboardPayments'));
const DashboardHelp = lazy(() => import('./pages/dashboard/DashboardHelp'));
const AdminUsers = lazy(() => import('./pages/dashboard/AdminUsers'));
const AdminAllListings = lazy(() => import('./pages/dashboard/AdminAllListings'));

// Loading component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-gray-400">Učitavanje...</p>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              {/* Global Schema.org structured data */}
              <OrganizationSchema />
              <WebSiteSchema />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={
                      <Suspense fallback={<PageLoader />}>
                      <HomePage />
                  </Suspense>
                } />
                <Route path="categories" element={
                  <Suspense fallback={<PageLoader />}>
                    <CategoriesPage />
                  </Suspense>
                } />
                <Route path="search" element={
                  <Suspense fallback={<PageLoader />}>
                    <SearchPage />
                  </Suspense>
                } />
                <Route path="resources/:slug" element={
                  <Suspense fallback={<PageLoader />}>
                    <ResourceDetailPage />
                  </Suspense>
                } />
                <Route path="about" element={
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                } />
                <Route path="contact" element={
                  <Suspense fallback={<PageLoader />}>
                    <ContactPage />
                  </Suspense>
                } />
                <Route path="login" element={
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                } />
                <Route path="register" element={
                  <Suspense fallback={<PageLoader />}>
                    <RegisterPage />
                  </Suspense>
                } />
                <Route path="favorites" element={
                  <Suspense fallback={<PageLoader />}>
                    <FavoritesPage />
                  </Suspense>
                } />
                <Route path="create" element={
                  <Suspense fallback={<PageLoader />}>
                    <CreateResourcePage />
                  </Suspense>
                } />
              </Route>
              
              {/* Dashboard Routes - Protected */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardLayout />
                  </Suspense>
                </ProtectedRoute>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardOverview />
                  </Suspense>
                } />
                <Route path="my-listings" element={
                  <Suspense fallback={<PageLoader />}>
                    <MyListings />
                  </Suspense>
                } />
                <Route path="add-listing" element={
                  <Suspense fallback={<PageLoader />}>
                    <AddListing />
                  </Suspense>
                } />
                <Route path="analytics" element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardAnalytics />
                  </Suspense>
                } />
                <Route path="payments" element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPayments />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardSettings />
                  </Suspense>
                } />
                <Route path="help" element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardHelp />
                  </Suspense>
                } />
                {/* Admin Routes */}
                <Route path="users" element={
                  <ProtectedRoute requireAdmin>
                    <Suspense fallback={<PageLoader />}>
                      <AdminUsers />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="all-listings" element={
                  <ProtectedRoute requireAdmin>
                    <Suspense fallback={<PageLoader />}>
                      <AdminAllListings />
                    </Suspense>
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
</HelmetProvider>
  );
}

export default App;
