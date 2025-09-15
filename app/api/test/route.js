/* app/api/test/route.js */
import { NextResponse } from 'next/server';

export async function GET(request) {
   
  console.log('GET /api/test');
  // { message: 'OK' } 형태로 JSON 응답 반환
  return NextResponse.json({ message: '성공함' });
}

export async function POST(request) {
  /*
    - POST 요청시 request 객체에서 body를 JSON 형태로 파싱함
    - 파싱한 body 데이터를 { received: body } 형태로 응답에 담아 반환
    - 클라이언트가 보낸 데이터를 서버가 잘 받았는지 확인할 때 사용
  */
  const body = await request.json().catch(() => null);
  return NextResponse.json({ received: body }, { status: 201 });
}
