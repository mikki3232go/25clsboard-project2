import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb"; //1-2. ObjectId 임포트
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/api/auth/[...nextauth]/route";
//주요기능
//1. 부모게시물 id를 요청 파라미터로 받아서  댓글 입력

export async function GET(request, { params }) {
  //params는 폴더명[id]로 전송
  try {
    // params.id에서 id 추출 (app router 방식)

    const id = params.id;
    const session = await getServerSession(authOptions);
    console.log("$$$$$$$$$app router변경" + JSON.stringify(params));
    //{id: 'dfjadkfa'}
    if (!session) {
      return new Response(JSON.stringify("로그인이 필요합니다"), {
        status: 401,
      });
    }

    if (!id) {
      return new Response(JSON.stringify("id가 필요합니다"), { status: 400 });
    }

    const db = (await connectDB).db("board");
    const comments = await db
      .collection("comment")
      .find({ parent: new ObjectId(id) })
      .toArray();

    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("서버 오류:", error);
    return new Response(JSON.stringify("서버오류"), { status: 500 });
  }
}
