// pages/admin/users.tsx
import React, { useState, useEffect } from 'react';

type User = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
};

const UsersPage = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllUsers`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const deleteUser = async (username: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/username/${username}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('User deleted successfully!');
        fetchAllUsers();
      } else {
        alert('Failed to delete user.');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 text-white w-full overflow-x-auto">
      <h1 className="text-3xl font-bold mb-6 ml-7">User Management</h1>
      {/* <p className="text-sm text-gray-300 mb-6 ml-7">Manage users and their roles</p> */}

      <div className="bg-[#1e2a46] px-4 py-2 rounded-full max-w-full md:w-96 flex items-center gap-2 mb-6">
        <span className="text-lg">📋</span>
         <input
          type="text"
          placeholder="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none"
        />
        <span className="text-sm">🔍</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-left bg-[#1e2a46] rounded-md">
          <thead className="text-white border-b border-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              {/* <th className="px-4 py-3">Role</th> */}
              {/* <th className="px-4 py-3">Status</th> */}
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t border-gray-700">
                <td className="px-4 py-3">{user.fullName}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.username || 'N/A'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    className="px-3 py-1 bg-red-500 rounded-full text-sm"
                    onClick={() => deleteUser(user.username)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;