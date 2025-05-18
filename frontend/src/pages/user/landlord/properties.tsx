// src/pages/user/properties.tsx
import React from 'react';

const PropertiesPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">List Properties</h2>
      <p className="text-sm text-gray-400 mb-6">List your properties for rent</p>

      <div className="bg-[#1e2a46] p-6 rounded-md">
        <h3 className="text-lg font-semibold mb-4">Add New Property</h3>
        <form className="space-y-4">
        <h2>Address</h2>
          <input
            type="text"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
        <h2>Type</h2>
          <input
            type="text"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
          <h2>Bedrooms</h2>
          <input
            type="number"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
          <h2>Rent</h2>
          <input
            type="number"
            placeholder=""
            className="w-full px-4 rounded-full text-black bg-white"
          />
          <button
            type="submit"
            className="bg-white text-[#1e2a46] py-2 px-6 rounded-full hover:bg-gray-200"
          >
            List Property
          </button>
        </form>

        <h4 className="mt-6 font-semibold">Listed Property</h4>
        <table className="w-full mt-4 text-sm text-left border border-gray-600">
          <thead className="bg-[#1a253b]">
            <tr>
              <th className="p-2">Address</th>
              <th className="p-2">Type</th>
              <th className="p-2">Bedrooms</th>
              <th className="p-2">Rent</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-700">
              <td className="p-2">123 Main St.</td>
              <td className="p-2">Apartment</td>
              <td className="p-2">2</td>
              <td className="p-2">1500</td>
            </tr>
            <tr className="border-t border-gray-700">
              <td className="p-2">123 Main St.</td>
              <td className="p-2">House</td>
              <td className="p-2">3</td>
              <td className="p-2">2600</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertiesPage;