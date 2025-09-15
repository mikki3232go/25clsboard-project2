import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import { connectDB } from "@/util/database";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
//주요기능
//1. 깃헙 로그인기능 만들기 (OAuth 로그인)
//2. 몽고DB 어댑터 로그인(session)
//3. 사용자 id,비번+ JWT로그인
export const authOptions = {
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }),
    ],
    secret : process.env.NEXTAUTH_SECRET,
    adapter : MongoDBAdapter(connectDB)
  };
 const handler = NextAuth(authOptions); 
 export {handler as GET, handler as POST};