import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider as HelmetProviderComponent } from 'react-helmet-async';
import { Layout } from './components/layout';
import { LanguageProvider, ThemeProvider, AuthProvider, ToastProvider, FavoritesProvider } from './context';
import { OrganizationSchema, WebSiteSchema } from './components/SchemaOrg';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import { PublicLoader, DashboardLoader, LoaderWrapper } from './components/loaders';

/**
 * LOADER CONFIGURATION
 * ====================
 * Loaderi su centralizovani u LoaderWrapper komponenti.
 * 
 * Da promeniš vreme trajanja loadera:
 * Idi na: src/components/loaders/LoaderWrapper.tsx
 * Promeni: LOADER_DURATION = 3000 (trenutno 3 sekunde za testiranje)
 * 
 * Svaka stranica je wrapovana sa LoaderWrapper u App.tsx
 */

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
const PricingPage = lazy(() => import('./pages/PricingPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PartnerPage = lazy(() => import('./pages/PartnerPage'));

// Dashboard pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const MyListings = lazy(() => import('./pages/dashboard/MyListings'));
const AddListing = lazy(() => import('./pages/dashboard/AddListing'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardPayments = lazy(() => import('./pages/dashboard/DashboardPayments'));
const DashboardFavorites = lazy(() => import('./pages/dashboard/DashboardFavorites'));
const DashboardHelp = lazy(() => import('./pages/dashboard/DashboardHelp'));
const AdminUsers = lazy(() => import('./pages/dashboard/AdminUsers'));
const AdminAllListings = lazy(() => import('./pages/dashboard/AdminAllListings'));
const EditListing = lazy(() => import('./pages/dashboard/EditListing'));

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <ThemeProvider>
              <LanguageProvider>
                {/* Global Schema.org structured data */}
                <OrganizationSchema />
                <WebSiteSchema />
                <ToastProvider>
                  <BrowserRouter>
                    <ScrollToTop />
                    {/* Scroll to top button */}
                    <ScrollToTopButton />
                    <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={
                      <LoaderWrapper variant="public">
                        <Suspense fallback={<PublicLoader />}>
                          <HomePage />
                        </Suspense>
                      </LoaderWrapper>
                    } />
                <Route path="categories" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <CategoriesPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="search" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <SearchPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="category/:categorySlug" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <SearchPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="resources/:slug" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <ResourceDetailPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="about" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <AboutPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="contact" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <ContactPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="login" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <LoginPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="register" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <RegisterPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="favorites" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <FavoritesPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="pricing" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <PricingPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="terms" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <TermsPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="privacy" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <PrivacyPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="faq" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <FAQPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="partner" element={
                  <LoaderWrapper variant="public">
                    <Suspense fallback={<PublicLoader />}>
                      <PartnerPage />
                    </Suspense>
                  </LoaderWrapper>
                } />
              </Route>
              
              {/* Dashboard Routes - Protected */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardLoader />}>
                    <DashboardLayout />
                  </Suspense>
                </ProtectedRoute>
              }>
                <Route index element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <DashboardOverview />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="my-listings" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <MyListings />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="add-listing" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <AddListing />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="edit-listing/:id" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <EditListing />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="favorites" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <DashboardFavorites />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="analytics" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <DashboardAnalytics />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="payments" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <DashboardPayments />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="settings" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <DashboardSettings />
                    </Suspense>
                  </LoaderWrapper>
                } />
                <Route path="help" element={
                  <LoaderWrapper variant="dashboard">
                    <Suspense fallback={<DashboardLoader />}>
                      <DashboardHelp />
                    </Suspense>
                  </LoaderWrapper>
                } />
                {/* Admin Routes */}
                <Route path="users" element={
                  <ProtectedRoute requireAdmin>
                    <LoaderWrapper variant="dashboard">
                      <Suspense fallback={<DashboardLoader />}>
                        <AdminUsers />
                      </Suspense>
                    </LoaderWrapper>
                  </ProtectedRoute>
                } />
                <Route path="all-listings" element={
                  <ProtectedRoute requireAdmin>
                    <LoaderWrapper variant="dashboard">
                      <Suspense fallback={<DashboardLoader />}>
                        <AdminAllListings />
                      </Suspense>
                    </LoaderWrapper>
                  </ProtectedRoute>
                } />
                </Route>
                    </Routes>
                  </BrowserRouter>
                </ToastProvider>
              </LanguageProvider>
            </ThemeProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
