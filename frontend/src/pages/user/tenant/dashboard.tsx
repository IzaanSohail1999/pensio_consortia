import React from 'react';
import styles from '@/styles/style.module.css';
import { useRouter } from 'next/router';
import { useUser } from '@/context/UserContext';

const TenantDashboard = () => {
  const router = useRouter();
  const { user } = useUser();

  const cards = [
    {
      title: 'View Rented Property',
      desc: 'View details of the property you are currently renting',
      button: 'View Property',
      onClick: () => router.push('/user/tenant/rented-property'),
    },
    // {
    //   title: 'Payment Invoice Upload',
    //   desc: 'Upload your payment invoice for verification',
    //   button: 'Upload Now',
    //   onClick: () => router.push('/user/tenant/invoice-upload'),
    // },
    // {
    //   title: 'Payment History',
    //   desc: 'View your payment history and NFTs',
    //   button: 'View History',
    //   onClick: () => router.push('/user/tenant/payment-history'),
    // },
    // {
    //   title: 'Wallet Management',
    //   desc: 'View your wallet balance and transaction history',
    //   button: 'View Wallet',
    //   onClick: () => router.push('/user/tenant/wallet'),
    // },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{user ? `Hello, ${user.fullName}` : 'Hello, Tenant'}</h1>
        {/* <div className={styles.searchBar}>
          <span className={styles.searchIcon}>☰</span>
          <input type="text" placeholder="Search" />
          <span className={styles.searchIcon}>🔍</span>
        </div> */}
      </div>

      <div className={styles.cardGrid}>
        {cards.map((card, index) => (
          <div className={styles.card} key={index}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDesc}>{card.desc}</p>
            <button className={styles.cardButton} onClick={card.onClick}>
              {card.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantDashboard;