// import { GetServerSideProps } from 'next';
// import { getProviders } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
// import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAdmin } from '@/context/AdminContext'; // ✅ use the context

// interface Props {
//     providers: any;
// }

const AdminSignIn = () => {
  const router = useRouter();
  const { setAdmin } = useAdmin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const { token, admin } = data;

        localStorage.setItem('adminToken', token);
        if (admin) {
            localStorage.setItem('admin', JSON.stringify(admin));
        }


        // ✅ Set in context
        setAdmin(admin);

        // ✅ Redirect
        router.push('/admin/dashboard');
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 text-white">
      <Image
        src="/assets/logo.png"
        alt="PENSIO Logo"
        width={200}
        height={200}
      />

      <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
        <h2 className="text-3xl font-bold text-center mb-8">ADMIN PORTAL</h2>

        {errorMsg && (
          <p className="mb-4 text-red-500 text-sm text-center">{errorMsg}</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-2 px-4 rounded-full text-black focus:outline-none bg-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 px-4 rounded-full text-black focus:outline-none bg-white"
              required
            />
          </div>

          {/* <div className="text-sm mb-4 text-right text-blue-300 hover:underline cursor-pointer">
            FORGOT PASSWORD?
          </div> */}

          <button
            type="submit"
            className="w-full bg-transparent border border-white py-2 rounded-full mb-6 hover:bg-white hover:text-[#030b25] transition"
          >
            Log In
          </button>
        </form>

        {/* <div className="text-center mt-4 text-sm text-white">
          Don’t have an account?{' '}
          <Link href="/admin/signup" className="text-blue-300 hover:underline">
            Sign Up
          </Link>
        </div> */}
      </div>
    </div>
  );
};

// export const getServerSideProps: GetServerSideProps = async () => {
//   const providers = await getProviders();
//   return {
//     props: { providers },
//   };
// };

export default AdminSignIn;