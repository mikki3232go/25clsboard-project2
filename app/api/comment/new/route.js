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

  const body = await request.json();

  const 입력내용 = {
    content: body.content,
    parent: new ObjectId(body.parent),
    author: session.user.email,
  };
  const db = (await connectDB).db("board");
  const result = await db.collection("comment").insertOne(입력내용);
  return new Response(JSON.stringify(result));
}
