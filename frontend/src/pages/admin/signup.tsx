import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminSignUp = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Admin registered successfully!');
        router.push('/admin/signin');
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Something went wrong');
      } else {
        setErrorMsg('Something went wrong');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-cyan-400 to-blue-600 text-white pt-4">
      <Image src="/assets/logo.png" alt="PENSIO Logo" width={200} height={200} className="mb-2" />

      <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
        <h2 className="text-3xl font-bold text-center mb-1">ADMIN</h2>
        <h3 className="text-2xl font-semibold text-center mb-6">SIGN UP</h3>

        {errorMsg && (
          <p className="text-red-400 text-center mb-4 text-sm">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Repeat Password</label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-transparent border border-white py-2 rounded-full hover:bg-white hover:text-[#030b25] transition"
          >
            Sign Up
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-white">
          Already have an account?{' '}
          <Link href="/admin/signin" className="text-blue-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSignUp;