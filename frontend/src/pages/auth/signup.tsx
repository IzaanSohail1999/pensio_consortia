// import { GetServerSideProps } from 'next';
// import { getProviders, signIn } from 'next-auth/react';
// import { FcGoogle } from 'react-icons/fc';

// interface Props {
//   providers: any;
// }

// const AdminSignIn = ({ providers }: Props) => {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 text-white">
//       <img src="/pensio-logo-white.png" alt="PENSIO Logo" className="w-40 mb-6 border-2 border-white p-2" />
//       <div className="bg-[#030b25] p-10 rounded-md shadow-lg w-full max-w-md border border-gray-500">
//         <h2 className="text-3xl font-bold text-center mb-8">ADMIN PORTAL</h2>

//         <div className="mb-4">
//           <label className="block mb-1 font-semibold">Username</label>
//           <input
//             type="text"
//             placeholder="Enter username"
//             className="w-full py-2 px-4 rounded-full text-black focus:outline-none"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block mb-1 font-semibold">Password</label>
//           <input
//             type="password"
//             placeholder="Enter password"
//             className="w-full py-2 px-4 rounded-full text-black focus:outline-none"
//           />
//         </div>

//         <div className="text-sm mb-4 text-right text-blue-300 hover:underline cursor-pointer">
//           FORGOT PASSWORD ?
//         </div>

//         <button className="w-full bg-transparent border border-white py-2 rounded-full mb-6 hover:bg-white hover:text-[#030b25] transition">
//           Log In
//         </button>

//         <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
//           <hr className="flex-grow border-gray-600" /> OR <hr className="flex-grow border-gray-600" />
//         </div>

//         {providers &&
//           Object.values(providers).map((provider: any) => (
//             provider.name === 'Google' && (
//               <button
//                 key={provider.name}
//                 onClick={() => signIn(provider.id)}
//                 className="w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-full hover:bg-gray-100"
//               >
//                 <FcGoogle className="w-5 h-5" />
//                 Sign in with {provider.name}
//               </button>
//             )
//           ))}
//       </div>
//     </div>
//   );
// };

// export const getServerSideProps: GetServerSideProps = async () => {
//   const providers = await getProviders();
//   return {
//     props: { providers },
//   };
// };

// export default AdminSignIn;