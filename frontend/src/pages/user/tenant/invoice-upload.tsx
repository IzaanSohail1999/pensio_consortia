import React from 'react';
import styles from '@/styles/style.module.css';

const InvoiceUpload = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Payment Invoice Upload</h1>
      <p className={styles.pageSubtitle}>Upload your payment invoice for verification</p>

      <div className={styles.formCard}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Invoice</label>
          <input type="file" className={styles.input} />
        </div>

        <button className={styles.button}>Upload Invoice</button>
      </div>
    </div>
  );
};

export default InvoiceUpload;