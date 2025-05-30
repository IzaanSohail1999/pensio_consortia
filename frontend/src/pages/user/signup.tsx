import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const UserSignUp = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  // const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName,
          username,
          password,
          role: "tenant",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('User registered successfully!');
        setEmail('')
        setFullName('')
        setUsername('')
        // setRole('')
        setPassword('')
        setConfirmPassword('')
        router.push('/user/signin');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Something went wrong');
      } else {
        alert('Something went wrong');
      }
      alert('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto flex flex-col items-center justify-start bg-gradient-to-r from-cyan-400 to-blue-600 text-white pt-4 px-4">
      <Image src="/assets/logo.png" alt="PENSIO Logo" width={200} height={200} className="mb-2" />

      <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
        <h2 className="text-2xl font-semibold text-center mb-8">SIGN UP</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required />
          </div>

          {/* <div className="mb-4">
            <label className="block mb-1 font-semibold">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required>
              <option value="">Select role</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div> */}

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required />
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-semibold">Repeat Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required />
          </div>

          <button type="submit" className="w-full bg-transparent border border-white py-2 rounded-full hover:bg-white hover:text-[#030b25] transition">
            Sign Up
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-white">
          Already have an account? <Link href="/user/signin" className="text-blue-300 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;