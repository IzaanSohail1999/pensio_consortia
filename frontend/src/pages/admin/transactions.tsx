// pages/admin/transactions.tsx
import React, { useEffect, useState } from 'react';
import styles from '@/styles/style.module.css';

type Transaction = {
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
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/getAllInvoices`);
        const data = await res.json();
        if (res.ok && data.success) {
          setTransactions(data.data);
        } else {
          console.error('Failed to fetch invoices:', data.message);
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    };

    fetchInvoices();
  }, []);

  // Filter transactions by full tenant name
  const filteredTransactions = transactions.filter((t: Transaction) =>
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Transaction Monitoring</h1>
      <p className={styles.pageSubtitle}>Monitor transactions and manage disputes</p>

      <div className="bg-[#1e2a46] px-4 py-2 rounded-full max-w-full md:w-96 flex items-center gap-2 mb-6">
        <span className="text-lg">📋</span>
        <input
          type="text"
          placeholder="Search Tenant Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none"
        />
        <span className="text-sm">🔍</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className="text-white border-b border-gray-600">
            <tr>
              <th>Date</th>
              <th>Tenant Name</th>
              <th>Email</th>
              <th>Rent Address</th>
              <th>Amount</th>
              <th>Lease Term</th>
              <th>Landlord</th>
              {/* <th>Status</th> */}
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t: Transaction, i: number) => (
                <tr key={i}>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>{t.firstName} {t.lastName}</td>
                  <td>{t.email}</td>
                  <td>{t.rentAddress}</td>
                  <td>${t.rentAmount}</td>
                  <td>{t.leaseTerm}</td>
                  <td>{t.landlordFirstName} {t.landlordLastName}</td>
                  <td>
                    {t.screenshotUrl ? (
                      <a className={styles.link} href={t.screenshotUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      'No File'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>No matching transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;