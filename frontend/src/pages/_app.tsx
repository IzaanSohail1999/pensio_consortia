import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import UserLayout from '@/components/UserLayout';
import { UserProvider } from '@/context/UserContext';
import { AdminProvider } from '@/context/AdminContext';
// import 'react-phone-input-2/lib/style.css';
// import '@/styles/phone-input.css';


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) setUserRole(storedRole);
      setIsLoading(false);
    }
  }, []);

  const isAdminRoute = router.pathname.startsWith('/admin') &&
    !router.pathname.includes('/signin') &&
    !router.pathname.includes('/signup');

  const isUserRoute = router.pathname.startsWith('/user') &&
    !router.pathname.includes('/signin') &&
    !router.pathname.includes('/signup');

  // Show loading state while determining user role
  if (isLoading && (isUserRoute || isAdminRoute)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAdminRoute ? (
        <AdminProvider>
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        </AdminProvider>
      ) : isUserRoute && userRole ? (
        <UserProvider>
          <UserLayout role={userRole as 'tenant' | 'landlord'}>
            <Component {...pageProps} />
          </UserLayout>
        </UserProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}