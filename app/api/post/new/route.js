/* app/api/post/new/route.js */
import { connectDB } from "@/util/database.js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

// App Router 방식에 맞게 POST 메서드로 작성
export async function POST(request) {
  let session = await getServerSession(authOptions); //2-1. 로그인 session 정보 가져오기
  console.log(session.user.email);
  try {
      // formData를 비동기로 파싱 (POST 요청의 form 데이터 받기)
      const formData = await request.formData();
      // formData의 entries를 객체로 변환 (key-value 쌍으로 변환)
      let body = Object.fromEntries(formData.entries());
    //}
    if (session) {
      body.author = session.user.email; //2-2. body 정보에 author 추가
    }
   //body로 전송된 데이터를 DB에 저장
   const db = (await connectDB).db("board");
   await db.collection('post').insertOne(body);

    // App Router에서는 redirect를 NextResponse.redirect로 처리
    return NextResponse.redirect(new URL("/list", request.url), 302);
  } catch (error) {
    console.error(error);
    return NextResponse.json("서버 오류", { status: 500 });
  }
}