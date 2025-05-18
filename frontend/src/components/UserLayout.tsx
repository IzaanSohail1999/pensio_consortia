import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import styles from '@/styles/style.module.css';
import { navItems, footerNavItems } from '@/constants/userNav';

const UserLayout = ({ 
    children, 
    role, 
}: { 
    children: ReactNode,
    role: 'tenant' | 'landlord';
 }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentNavItems = navItems[role];

  return (
    <div className={styles.adminLayout}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={styles.hamburgerIcon}
      >
        ☰
      </button>

      <aside
        className={`fixed md:static top-0 left-0 h-screen min-h-screen w-64 bg-[#1e253b] border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >

        <Image src="/assets/logo.png" alt="PENSIO Logo" width={120} height={40} className="mb-6" />

        <nav className={styles.navbar}>
          {currentNavItems.map((item) => (
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
        </nav>

        <hr className={styles.divider} />

        <nav className={styles.navbar}>
          {footerNavItems.map((item) => (
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
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-0 overflow-auto w-full">{children}</main>
    </div>
  );
};

export default UserLayout;