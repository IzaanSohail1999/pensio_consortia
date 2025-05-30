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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // const storedRole = localStorage.getItem('userRole');
      // if (storedRole) setUserRole(storedRole); commented to only set tenant
      setUserRole('tenant')
    }
  }, []);

  const isAdminRoute = router.pathname.startsWith('/admin') &&
    !router.pathname.includes('/signin') &&
    !router.pathname.includes('/signup');

  const isUserRoute = router.pathname.startsWith('/user') &&
    !router.pathname.includes('/signin') &&
    !router.pathname.includes('/signup');

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