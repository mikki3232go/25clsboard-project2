 /* app/api/post/edit/route.js */
 import { connectDB } from "@/util/database.js";
 import { NextResponse } from "next/server";
 import { ObjectId } from "mongodb";
 
 // App Router 방식에 맞게 POST 메서드로 작성
 export async function POST(request) {
   try {
     const formData = await request.formData();// 폼 데이터 파싱
     // 기본 검증(body._id, body.title)
     if (!body._id){
        return NextResponse.json("id가 필요합니다.");
     }
     // DB 업데이트
     let client = await connectDB;  //1. 
     const db = client.db('board'); //db명
     await db.collection("post").updateOne(
       { _id: new ObjectId(body._id) },
       // body.content ?? "": 폼에서 content 값이 없으면 빈 문자열로 대체
       { $set: { title: body.title, content: body.content ?? "" } }
     );
     
   } catch (error) {
     //에러 처리
     console.error(error);
     return NextResponse.json("서버 오류", { status: 500 });
   }
 }
 