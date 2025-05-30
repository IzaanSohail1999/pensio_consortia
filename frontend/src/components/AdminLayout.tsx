import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import styles from '@/styles/style.module.css';

const mainNavItems = [
  { icon: '🏠', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: '👤', label: 'User Management', path: '/admin/users' },
  { icon: '💳', label: 'Transaction Monitoring', path: '/admin/transactions' },
];

const footerNavItems = [
  { icon: '🚪', label: 'Logout', path: '/admin/signin' },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#0c1122] text-white">
      {/* Sidebar */}
      <aside
        className={`flex flex-col fixed md:static top-0 left-0 h-full md:h-screen w-64 bg-[#1e253b] border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >

        <div className="flex items-center justify-between md:justify-center p-4">
          {/* Hamburger Icon (only on small screens) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl text-white md:hidden"
          >
            ☰
          </button>

          {/* Logo */}
          <Image
            src="/assets/logo.png"
            alt="PENSIO Logo"
            width={120}
            height={40}
            className="ml-4 md:ml-0"
          />
        </div>

        <nav className="flex-grow overflow-auto px-2">
          {mainNavItems.map((item) => (
            <Link href={item.path} key={item.label}>
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition ${router.pathname === item.path ? 'bg-[#2c324d]' : 'hover:bg-[#2c324d]'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          <hr className={styles.divider} />

          {footerNavItems.map((item) => (
            <div
              key={item.label}
              onClick={() => {
                if (item.label === 'Logout') {
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userToken');
                  router.push(item.path);
                } else {
                  router.push(item.path);
                }
              }}
              className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition ${router.pathname === item.path ? 'bg-[#2c324d]' : 'hover:bg-[#2c324d]'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-[#1e253b] text-white p-2 rounded-md border border-gray-600"
        >
          ☰
        </button>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Page Content */}
      <main className="flex-1 p-4 md:p-8 ml-0 overflow-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;