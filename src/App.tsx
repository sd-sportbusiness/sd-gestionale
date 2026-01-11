import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Magazzino } from './pages/Magazzino';
import { Rubrica } from './pages/Rubrica';
import { Listini } from './pages/Listini';
import { Vendite } from './pages/Vendite';
import { Archivio } from './pages/Archivio';
import { Impostazioni } from './pages/Impostazioni';
import { Catalogo } from './pages/Catalogo';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'client' ? '/catalogo' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53935',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'client' ? '/catalogo' : '/dashboard'} replace /> : <Login />} />

        <Route path="/catalogo" element={<Catalogo />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/magazzino" element={<Magazzino />} />
          <Route path="/rubrica" element={<Rubrica />} />
          <Route path="/listini" element={<Listini />} />
          <Route path="/vendite" element={<Vendite />} />
          <Route path="/archivio" element={<Archivio />} />
          <Route path="/impostazioni" element={<Impostazioni />} />
        </Route>

        <Route path="/" element={<Navigate to={user?.role === 'client' ? '/catalogo' : '/dashboard'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
