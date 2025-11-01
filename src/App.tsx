
import { BrowserRouter, useRoutes, Navigate, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import routes from './router/config';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Navigation from './components/feature/Navigation';
import Footer from './components/feature/Footer';

// 로딩 컴포넌트
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthProvider();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// 인증이 필요한 경로들
const protectedPaths = [
  '/dashboard',
  '/chat',
  '/settings',
  '/settings/account',
  '/settings/ecount',
  '/settings/ecount-setup',
  '/orders/ai-entry'
];

// 라우트 래퍼
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
      <main className="flex-1">
        {routing}
      </main>
      {!isAuthPath && <Footer />}
    </div>
  );
}

function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter basename={__BASE_PATH__}>
        <Suspense fallback={<LoadingSpinner />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
