// pages/admin/transactions.tsx
import React from 'react';

const TransactionsPage = () => {
  return (
    <div className="p-4 md:p-10 text-white w-full overflow-x-auto">
      <h1 className="text-3xl font-bold mb-2 ml-7">Transaction Monitoring</h1>
      <p className="text-sm text-gray-300 mb-6 ml-7">Monitor transactions and manage disputes</p>

      <div className="bg-[#1e2a46] px-4 py-2 rounded-full max-w-full md:w-96 flex items-center gap-2 mb-6">
        <span className="text-lg">📋</span>
        <input
          type="text"
          placeholder="Search Transactions"
          className="w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none"
        />
        <span className="text-sm">🔍</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-left bg-[#1e2a46] rounded-md">
          <thead className="text-white border-b border-gray-600">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {Array(5).fill(null).map((_, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="px-4 py-3">123 Main Street, Abc Apartment, NY</td>
                <td className="px-4 py-3">John Doe</td>
                <td className="px-4 py-3">1500</td>
                <td className="px-4 py-3">2024-06-01</td>
                <td className="px-4 py-3">{i === 1 ? 'Pending' : 'Completed'}</td>
                <td className="px-4 py-3">
                  {i === 1 ? (
                    <button className="px-3 py-1 border border-white rounded-full text-sm">Resolve Dispute</button>
                  ) : (
                    <span className="text-sm">No Dispute</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;