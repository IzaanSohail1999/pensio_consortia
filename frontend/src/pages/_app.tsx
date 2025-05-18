import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import UserLayout from '@/components/UserLayout';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith('/admin') &&
                  !router.pathname.includes('/signin') &&
                  !router.pathname.includes('/signup');

const isUser = router.pathname.startsWith('/user') &&
!router.pathname.includes('/signin') &&
!router.pathname.includes('/signup');

  if (isAdmin) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  if(isUser) {
    return (
      <UserLayout role="tenant">
        <Component {...pageProps} />
      </UserLayout>
    )
  }

  return <Component {...pageProps} />;
}