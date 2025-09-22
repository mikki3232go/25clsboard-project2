import { authOptions } from "@/api/auth/[...nextauth]/route";
import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
// body: JSON.stringify({ //Object를 body로 전송시 문자열로 변환
//     content: comment, // 댓글 내용
//     author: author, // 부모글 작성자
//     parent: _id, // 부모 게시글의 ID
//   }),

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify("로그인이 필요합니다"), { status: 401 });
  }
  const body = await request.json();
  if (!body.content || !body.parent) {
    return new Response(JSON.stringify("필수 데이터가 누락되었습니다"), {
      status: 400,
    });
  }
  const 입력내용 = {
    content: body.content,
    parent: new ObjectId(body.parent),
    author: session.user.email,
  };
  const db = (await connectDB).db("board");
  const result = await db.collection("comment").insertOne(입력내용);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
