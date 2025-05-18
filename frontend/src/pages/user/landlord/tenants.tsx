// src/pages/user/tenants.tsx
import React from 'react';

const TenantManagementPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Tenant Management</h2>
      <p className="text-sm text-gray-400 mb-6">Manage your tenants</p>

      <div className="bg-[#1e2a46] p-6 rounded-md">
        <h3 className="text-lg font-semibold mb-4">Add New Tenant</h3>
        <form className="space-y-4">
        <h2>Name</h2>
          <input
            type="text"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
        <h2>Email</h2>
          <input
            type="email"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
        <h2>Phone</h2>
          <input
            type="text"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
          <button
            type="submit"
            className="bg-white text-[#1e2a46] py-2 px-6 rounded-full hover:bg-gray-200"
          >
            Add Tenant
          </button>
        </form>

        <h4 className="mt-6 font-semibold">Current Tenants</h4>
        <table className="w-full mt-4 text-sm text-left border border-gray-600">
          <thead className="bg-[#1a253b]">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-700">
              <td className="p-2">John Doe</td>
              <td className="p-2">john.doe@example.com</td>
              <td className="p-2">123-456-789</td>
            </tr>
            <tr className="border-t border-gray-700">
              <td className="p-2">Jane Smith</td>
              <td className="p-2">jane.smith@example.com</td>
              <td className="p-2">123-456-789</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantManagementPage;