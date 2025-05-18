import Image from 'next/image';
import Link from 'next/link';

const UserSignUp = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-cyan-400 to-blue-600 text-white pt-4">
      {/* Logo */}
      <Image
        src="/assets/logo.png"
        alt="PENSIO Logo"
        width={200}
        height={200}
        className="mb-2"
      />

      {/* Sign Up Box */}
      <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
        <h2 className="text-2xl font-semibold text-center mb-8">SIGN UP</h2>

        {/* Form Fields */}
        <form>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Repeat Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              className="w-full py-2 px-4 rounded-full text-black bg-white focus:outline-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-transparent border border-white py-2 rounded-full hover:bg-white hover:text-[#030b25] transition"
          >
            Sign Up
          </button>
        </form>

        {/* Link to Sign In */}
        <div className="text-center mt-4 text-sm text-white">
          Already have an account?{' '}
          <Link href="/user/signin" className="text-blue-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;