import { connectDB } from "@/util/database";
import bcrypt from "bcrypt"; //2-1. bcrypt 모듈 임포트(npm install bcrypt)

export async function POST(request) {
  try {
    //0-0. register.js에서 회원가입 정보 전송시 확인용
    const formData = await request.formData();
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };
    console.log("받은 데이터:", body);

    // 입력값 검증
    if (!body.name || !body.email || !body.password) {
      return new Response(JSON.stringify("모든 필드를 입력해주세요"), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    //1-1. 요청이 POST일 때 insert
    let hash = await bcrypt.hash(body.password, 10); //2-2. 비밀번호 해싱 10은 보안강도
    console.log("hashing:", hash); //2-4. 해싱된 비밀번호 확인용
    body.password = hash; //2-3. 해싱된 비밀번호로 요청

    let db = (await connectDB).db("board"); //1-2.
    console.log("데이터베이스 연결 성공");

    // 이메일 중복 체크
    const existingUser = await db
      .collection("user_cred")
      .findOne({ email: body.email });
    if (existingUser) {
      return new Response(JSON.stringify("이미 존재하는 이메일입니다"), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.collection("user_cred").insertOne(body); // insert
    console.log("회원가입 성공");

    return new Response(JSON.stringify("회원가입 성공"), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    return new Response(JSON.stringify(`회원가입 실패: ${error.message}`), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
