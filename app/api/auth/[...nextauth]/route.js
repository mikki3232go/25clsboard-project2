/*  app/api/auth/[...nextauth]/route.js. */
import { connectDB } from "@/util/database";
//import { MongoDBAdapter } from "@next-auth/mongodb-adapter"; //2-1. 몽고DB 어댑터
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github"; //1-1. 깃헙 Next-Auth로그인 기능
import CredentialsProvider from "next-auth/providers/credentials"; //3-0.아이디/비번 + JWT로그인 폼 자동생성
import bcrypt from "bcrypt"; //3-0-1. bcrypt 모듈 임포트(npm install bcrypt)

//주요기능
//1. 깃헙 로그인기능 만들기 (NextAuth 소셜 로그인)
//2. 몽고DB 어댑터 로그인(session)
//3. 사용자 id,비번+ JWT로그인
export const authOptions = {
  providers: [
    GithubProvider({
      //1-2. 깃헙 로그인 기능 설정
      clientId: process.env.GITHUB_CLIENT_ID, //1-3. 환경변수로 깃헙 클라이언트 아이디 설정
      clientSecret: process.env.GITHUB_CLIENT_SECRET, //1-4. 환경변수로 깃헙 클라이언트 시크릿 설정
    }),

    CredentialsProvider({
      //3-1. 로그인페이지 폼 자동생성해주는 코드
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      //3-2. 로그인요청시 실행되는코드 (중요)
      //직접 DB에서 아이디(이메일),비번 비교하고
      //아이디,비번 맞으면 return 결과, 틀리면 return null 해야함
      async authorize(credentials) {
        try {
          let db = (await connectDB).db("board"); //
          let user = await db
            .collection("user_cred")
            .findOne({ email: credentials.email }); //DB에서 이메일 비교
          if (!user) {
            console.log("해당 이메일은 없습니다.");
            return null;
          }
          const pwcheck = await bcrypt.compare(
            credentials.password, //입력한 password
            user.password //DB password
          );
          if (!pwcheck) {
            console.log("비번이 틀립니다.");
            return null;
          }
          return user;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  //3-3. 아이디 인증시 jwt설정 + jwt 만료일설정
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, //로그인 유지 30일
  },

  callbacks: {
    //3-4. jwt 만들 때 실행되는 코드
    //user변수는 DB의 유저정보담겨있고 token.user에  저장하면 jwt에 들어감
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = {};
        token.user.name = user.name; //JWT에 들어갈 정보
        token.user.email = user.email;
      }
      return token;
    },
    //3-5. 유저 세션이 조회될 때 마다 실행되는 코드
    session: async ({ session, token }) => {
      session.user = token.user; //토큰의 정보->컴포넌트 안에서 보여줄 유저정보
      return session;
    },
  },

  //adapter: MongoDBAdapter(connectDB), //2-2. 몽고DB 어댑터 설정
  secret: process.env.NEXTAUTH_SECRET, //1-5. 환경변수로 시크릿 설정
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
