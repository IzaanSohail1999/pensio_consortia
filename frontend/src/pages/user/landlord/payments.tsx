// src/pages/user/payments.tsx
import React from 'react';

const PaymentHistoryPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Payment History</h2>
      <p className="text-sm text-gray-400 mb-6">View your payment history and NFTs</p>

      <div className="bg-[#1e2a46] p-6 rounded-md overflow-auto">
        <table className="w-full text-sm text-left border border-gray-600">
          <thead className="bg-[#1a253b]">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-2">2024-06-01</td>
                <td className="p-2">1500</td>
                <td className="p-2">Completed</td>
                <td className="p-2 text-blue-300 hover:underline cursor-pointer">View Invoice</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;