import { getProviders, signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function SignIn({ providers }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030b25] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">PENSIO</h1>
        <h2 className="text-3xl font-semibold mb-8">ADMIN PORTAL</h2>

        <div className="bg-[#0a132f] p-10 rounded-lg border border-gray-600 max-w-lg w-full mx-auto">
          <div className="text-left mb-6">
            <label className="block mb-2 font-semibold">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-96 pl-4 py-3 rounded-full bg-white text-black text-left focus:outline-none"
            />
          </div>
          <div className="text-left mb-6">
            <label className="block mb-2 font-semibold">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-96 pl-4 py-3 rounded-full bg-white text-black text-left focus:outline-none"
            />
          </div>
          <div className="text-right text-sm mb-6 text-blue-400 hover:underline cursor-pointer">
            FORGOT PASSWORD ?
          </div>
          <button className="w-full bg-transparent border border-white py-3 rounded-full mb-6 hover:bg-white hover:text-[#0a132f] transition">
            Log In
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-500"></div>
            <div className="px-4 text-sm">OR</div>
            <div className="flex-grow h-px bg-gray-500"></div>
          </div>

          {providers &&
            Object.values(providers).map((provider: any) => (
              provider.name === "Google" && (
                <div key={provider.name}>
                  <button
                    onClick={() => signIn(provider.id)}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium px-5 py-3 rounded-full"
                  >
                    <FcGoogle className="w-5 h-5" />
                    Sign in with {provider.name}
                  </button>
                </div>
              )
            ))}

             {/* Register Now Button */}
          <button
            onClick={() => {
              window.location.href = "/register";
            }}
            className="w-full bg-white text-[#0a132f] py-2.5 px-7 rounded-full border border-gray-300 hover:bg-gray-100 transition mt-4"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}