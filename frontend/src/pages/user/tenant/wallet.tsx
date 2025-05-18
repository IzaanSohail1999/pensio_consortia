// src/pages/user/tenant/wallet.tsx
import React from 'react';
import styles from '@/styles/style.module.css';

const WalletPage = () => {
  const transactions = [
    { type: 'Reward', amount: '+100', date: '2024-01-01', status: 'Completed' },
    { type: 'Payment', amount: '-50', date: '2024-01-01', status: 'Completed' },
    { type: 'Payment', amount: '-50', date: '2024-01-01', status: 'Completed' },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Wallet Management</h1>
      <p className={styles.pageSubtitle}>View your wallet balance and transaction history</p>

      <div className={styles.formCard}>
        <h3 className={styles.walletBalance}>Wallet Balance: $500</h3>
        <h2>Transaction History</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td>{t.type}</td>
                  <td>{t.amount}</td>
                  <td>{t.date}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;