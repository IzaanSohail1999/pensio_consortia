// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import EmailProvider from "next-auth/providers/email"
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";
// import nodemailer from 'nodemailer'

// const prisma = new PrismaClient();

// const handler = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       redirectUri: "http://localhost:3000/api/auth/callback/google",  // Add this line
//     }),
//     EmailProvider({
//       server: {
//         host: "smtp.gmail.com", // Or another SMTP server if using something else
//         port: 587,
//         auth: {
//           user: process.env.GMAIL_USER, // Your Gmail email
//           pass: process.env.GMAIL_PASSWORD, // Gmail password or app-specific password
//         },
//       },
//       from: process.env.EMAIL_FROM,
//       sendVerificationRequest: async ({ identifier, url }) => {
//         const transporter = nodemailer.createTransport({
//           host: "smtp.gmail.com", // Using Gmail SMTP
//           port: 587,
//           auth: {
//             user: process.env.GMAIL_USER, // Gmail username
//             pass: process.env.GMAIL_PASSWORD, // Gmail app password if 2FA enabled
//           },
//         })

//         await transporter.sendMail({
//           from: process.env.EMAIL_FROM!,
//           to: identifier,
//           subject: "Sign in to your account",
//           html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
//         })
//       },
//     }),
//   ],
//   session: {
//     strategy: "database",
//   },
//   pages: {
//     signIn: "/auth/signin",
//     error: "/auth/error",
//     verifyRequest: "/auth/verify-request",
//   },
// });

// export default handler;