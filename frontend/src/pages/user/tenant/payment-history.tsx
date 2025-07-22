import React, { useEffect, useState } from 'react';
import styles from '@/styles/style.module.css';
import { useUser } from '@/context/UserContext';

interface Invoice {
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  rentAddress: string;
  rentAmount: number;
  leaseTerm: string;
  landlordFirstName: string;
  landlordLastName: string;
  screenshotUrl?: string;
}

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState<Invoice[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices/getAllInvoices');
        const data = await res.json();
        if (res.ok && data.success) {
          const userInvoices = data.data.filter((t: Invoice) => t.email === user?.email);
          setTransactions(userInvoices);
        } else {
          console.error('Failed to fetch invoices:', data.message);
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    };

    fetchInvoices();
  }, [user?.email]);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Payment History</h1>
      <p className={styles.pageSubtitle}>View your payment history and NFTs</p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tenant Name</th>
              <th>Email</th>
              <th>Rent Address</th>
              <th>Amount</th>
              <th>Lease Term</th>
              <th>Landlord</th>
              {/* <th>Status</th> */}
              {/* <th>Invoice</th> */}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t: Invoice, i: number) => (
                <tr key={i}>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>{t.firstName} {t.lastName}</td>
                  <td>{t.email}</td>
                  <td>{t.rentAddress}</td>
                  <td>${t.rentAmount}</td>
                  <td>{t.leaseTerm}</td>
                  <td>{t.landlordFirstName} {t.landlordLastName}</td>
                  {/* <td>Completed</td> */}
                  {/* <td> */}
                    {/* {t.screenshotUrl ? (
                      <a className={styles.link} href={t.screenshotUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      'No File'
                    )} */}
                  {/* </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center' }}>No payment history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;