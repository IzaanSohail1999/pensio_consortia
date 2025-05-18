// src/pages/user/tenant/payment-history.tsx
import React from 'react';
import styles from '@/styles/style.module.css';

const PaymentHistory = () => {
  const transactions = Array.from({ length: 10 }).map((_, i) => ({
    date: '2024-06-01',
    amount: '1500',
    status: 'Completed',
  }));

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Payment History</h1>
      <p className={styles.pageSubtitle}>View your payment history and NFTs</p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td>${t.amount}</td>
                <td>{t.status}</td>
                <td><a className={styles.link} href="#">View Invoice</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;