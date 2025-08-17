import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useGeolocation } from '@/hooks/useGeolocation';

const UserSignIn = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const { isLoading, isBlocked, error: geolocationError } = useGeolocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const { token, user } = data;

        // Save to localStorage
        localStorage.setItem('userToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role); // tenant or landlord

        // Set context
        setUser(user);

        // Redirect
        router.push(`/user/${user.role}/dashboard`);
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Something went wrong');
      } else {
        setErrorMsg('Something went wrong');
      }
    }
  };

  // Show loading while checking geolocation
  if (isLoading) {
    return (
      <div className="min-h-screen w-full overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Checking access...</p>
        </div>
      </div>
    );
  }

  // If blocked, the hook will redirect to restricted-access page
  if (isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-4">
      <Image src="/assets/logo.png" alt="PENSIO Logo" width={200} height={200} />
      <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
        <h2 className="text-3xl font-bold text-center mb-8">USER PORTAL</h2>

        {geolocationError && <p className="text-red-400 text-center mb-4">⚠️ {geolocationError}</p>}
        {errorMsg && <p className="text-red-400 text-center">{errorMsg}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-transparent border border-white py-2 rounded-full hover:bg-white hover:text-[#030b25] transition"
          >
            Log In
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-white">
          Don’t have an account?{' '}
          <Link href="/user/signup" className="text-blue-300 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserSignIn;