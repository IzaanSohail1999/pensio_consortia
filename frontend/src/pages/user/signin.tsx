import { GetServerSideProps } from 'next';
import { getProviders } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
    providers: any;
}

const UserSignIn = ({ providers }: Props) => {

    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); // prevent page reload
        // TODO: Add actual auth check here if needed
        const landlord = false;
        if(landlord) {
            router.push('/user/landlord/dashboard');
        } else {
            router.push('/user/tenant/dashboard');
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
                <h2 className="text-3xl font-bold text-center mb-8">USER PORTAL</h2>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        className="w-full py-2 px-4 rounded-full text-black focus:outline-none bg-white"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full py-2 px-4 rounded-full text-black focus:outline-none bg-white"
                    />
                </div>

                <div className="text-sm mb-4 text-right text-blue-300 hover:underline cursor-pointer">
                    FORGOT PASSWORD ?
                </div>

                <button onClick={handleLogin} className="w-full bg-transparent border border-white py-2 rounded-full mb-6 hover:bg-white hover:text-[#030b25] transition">
                    Log In
                </button>
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

export const getServerSideProps: GetServerSideProps = async () => {
    const providers = await getProviders();
    return {
        props: { providers },
    };
};

export default UserSignIn;