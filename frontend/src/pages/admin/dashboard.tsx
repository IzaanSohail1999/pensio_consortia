import React, { useEffect, useState } from 'react';
import styles from '@/styles/style.module.css';
import { useRouter } from 'next/router';
import { useAdmin } from '@/context/AdminContext';

const AdminDashboard = () => {
  const router = useRouter();
  const { admin } = useAdmin();
  const [userCount, setUserCount] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);

  const cards = [
    {
      title: "User Management",
      description: "Manage users and their roles",
      buttonText: "View Users",
      labelText: "Total Users",
      statValue: userCount,
      onClick: () => router.push('/admin/users')
    },
    // {
    //   title: "Property Management",
    //   description: "Manage property listings",
    //   buttonText: "View Properties",
    //   onClick: () => router.push('/admin/properties')
    // },
    {
      title: "Transaction Monitoring",
      description: "Monitor transactions and disputes",
      buttonText: "View Transactions",
      labelText: "Transactions",
      statValue: transactionCount,
      onClick: () => router.push('/admin/transactions')
    }
  ]



  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllUsers`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setUserCount(data.length);
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    const fetchTotalTransactionCount = async () => {
      try {
        const res = await fetch('/api/invoices/getAllInvoices');
        const data = await res.json();

        if (res.ok && Array.isArray(data.data)) {
          setTransactionCount(data.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    fetchUserCount();
    fetchTotalTransactionCount();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Hello, {admin?.username || 'Admin'}</h1>
        {/* <div className={styles.searchBar}>
          <span className={styles.searchIcon}>☰</span>
          <input type="text" placeholder="Search" />
          <span className={styles.searchIcon}>🔍</span>
        </div> */}
      </div>

      <div className={styles.cardGrid}>
        {cards.map((card, index) => (
          <div className={styles.card} key={index}>
            <h3 className="text-lg sm:text-lg text-base font-semibold text-white mb-1">{card.title}</h3>
            <p className="text-sm sm:text-sm text-xs text-gray-300 mb-6">{card.description}</p>
            <div className="flex justify-between items-center mt-4">
              <p className="text-white font-semibold text-xs max-[360px]:text-[10px] sm:text-sm">{card.labelText}: {card.statValue}</p>
              <button
                onClick={card.onClick}
                className="px-4 py-1 border border-white rounded-full text-xs max-[360px]:text-[10px] sm:text-sm hover:bg-white hover:text-[#1e2a46] transition"
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;