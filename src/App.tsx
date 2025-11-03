import { BrowserRouter, useRoutes, Navigate, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import routes from './router/config';
import { AuthContext, useAuthProvider, useAuth } from './hooks/useAuth';
import Navigation from './components/feature/Navigation';
import Footer from './components/feature/Footer';
import { featureFlags } from './config/featureFlags';
import ChunkErrorBoundary from './components/common/ChunkErrorBoundary';

function LoadingSpinner() {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShowRetry(true), 8000);
    return () => clearTimeout(id);
  }, []);

  const hardRefresh = () => {
    const url = `${window.location.origin}${window.location.pathname}?nocache=${Date.now()}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      {showRetry && (
        <button
          type="button"
          onClick={hardRefresh}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          새로고침
        </button>
      )}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

const protectedPaths = [
  '/dashboard',
  '/settings',
  '/settings/account',
  '/settings/ecount',
  '/settings/ecount-setup',
  '/orders/ai-entry',
  ...(featureFlags.aiChat ? ['/chat'] : []),
];

function AppRoutes() {
  const location = useLocation();
  const isProtectedPath = protectedPaths.some(path => location.pathname.startsWith(path));
  const isAuthPath = location.pathname.startsWith('/auth/');

  const routing = useRoutes(routes);

  if (isProtectedPath) {
    return <ProtectedRoute>{routing}</ProtectedRoute>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPath && <Navigation />}
      <main className="flex-1">{routing}</main>
      {!isAuthPath && <Footer />}
    </div>
  );
}

function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter basename={__BASE_PATH__}>
        <ChunkErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <AppRoutes />
          </Suspense>
        </ChunkErrorBoundary>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
