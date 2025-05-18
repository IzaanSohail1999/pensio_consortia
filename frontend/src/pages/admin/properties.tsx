// pages/admin/properties.tsx
import React from 'react';

const PropertiesPage = () => {
  return (
    <div className="p-4 md:p-10 text-white w-full overflow-x-auto">
      <h1 className="text-3xl font-bold mb-2 ml-7">Property Listing Management</h1>
      <p className="text-sm text-gray-300 mb-6 ml-7">Manage property listings and their details</p>

      <div className="bg-[#1e2a46] px-4 py-2 rounded-full max-w-full md:w-96 flex items-center gap-2 mb-6">
        <span className="text-lg">📋</span>
        <input
          type="text"
          placeholder="Search Properties"
          className="w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none"
        />
        <span className="text-sm">🔍</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-left bg-[#1e2a46] rounded-md">
          <thead className="text-white border-b border-gray-600">
            <tr>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Bedrooms</th>
              <th className="px-4 py-3">Rent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {Array(5).fill(null).map((_, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="px-4 py-3">123 Main Street, Abc Apartment, NY</td>
                <td className="px-4 py-3">Apartment</td>
                <td className="px-4 py-3">2</td>
                <td className="px-4 py-3">1500</td>
                <td className="px-4 py-3">Active</td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="px-3 py-1 border border-white rounded-full text-sm">Edit</button>
                  <button className="px-3 py-1 bg-red-500 rounded-full text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertiesPage;