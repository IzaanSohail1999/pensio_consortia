import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGeolocation } from '@/hooks/useGeolocation';

const UserSignUp = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'landlord' | 'tenant'>('landlord');
  const [invitationCode, setInvitationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const { isLoading, isBlocked, error: geolocationError } = useGeolocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) passwordErrors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) passwordErrors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) passwordErrors.push('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordErrors.push('Password must contain at least one special character');

    if (passwordErrors.length > 0) {
      alert('Password requirements not met:\n' + passwordErrors.join('\n'));
      return;
    }

    // Validate invitation code for tenants
    if (role === 'tenant' && !invitationCode.trim()) {
      alert('Invitation code is required for tenant registration');
      return;
    }

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName,
          username,
          password,
          role,
          invitationCode: role === 'tenant' ? invitationCode : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('User registered successfully!');
        setEmail('')
        setFullName('')
        setUsername('')
        setRole('landlord')
        setInvitationCode('')
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
    <div className="min-h-screen w-full overflow-y-auto flex flex-col items-center justify-start bg-gradient-to-r from-cyan-400 to-blue-600 text-white pt-4 px-4">
      <Image src="/assets/logo.png" alt="PENSIO Logo" width={200} height={200} className="mb-2" />

      <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
        <h2 className="text-2xl font-semibold text-center mb-8">SIGN UP</h2>
        
        {geolocationError && <p className="text-red-400 text-center mb-4">⚠️ {geolocationError}</p>}

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

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Role</label>
            <select 
              value={role} 
              onChange={(e) => {
                setRole(e.target.value as 'landlord' | 'tenant');
                if (e.target.value === 'landlord') {
                  setInvitationCode(''); // Clear invitation code when switching to landlord
                }
              }} 
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            >
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>

          {role === 'tenant' && (
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Invitation Code *</label>
              <input 
                type="text" 
                value={invitationCode} 
                onChange={(e) => setInvitationCode(e.target.value)} 
                placeholder="Enter invitation code from landlord" 
                className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" 
                required 
              />
              <p className="text-xs text-gray-300 mt-1">You need an invitation code from a landlord to sign up as a tenant</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none" required />
            <div className="mt-2 p-3 bg-gray-800 rounded-md border border-gray-600">
              <p className="text-xs text-gray-300 mb-2 font-medium">Password Requirements:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className={`flex items-center ${password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="mr-2">{password.length >= 8 ? '✓' : '○'}</span>
                  At least 8 characters long
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                  Contains uppercase letter (A-Z)
                </li>
                <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="mr-2">{/[a-z]/.test(password) ? '✓' : '○'}</span>
                  Contains lowercase letter (a-z)
                </li>
                <li className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="mr-2">{/[0-9]/.test(password) ? '✓' : 'text-gray-400'}</span>
                  Contains number (0-9)
                </li>
                <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="mr-2">{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'}</span>
                  Contains special character (!@#$%^&*)
                </li>
              </ul>
            </div>
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