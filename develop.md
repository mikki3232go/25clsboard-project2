# 개발 수정 내역

## 1. 로그인 에러 분석

- **문제점**: 이메일/비밀번호가 정확해도 로그인이 실패하고, 서버 로그에 명확한 에러 메시지가 남지 않음.
- **파일명**: `app/api/auth/[...nextauth]/route.js`
- **수정 핵심코드**: `authorize` 함수 내에 `try...catch` 블록을 추가하여 데이터베이스 연결 또는 비밀번호 검증 과정에서 발생하는 숨겨진 에러를 콘솔에 출력하도록 함.

  ```javascript
  async authorize(credentials) {
    try {
      // ... 기존 코드 ...
    } catch (error) {
      console.error("Authorize error:", error);
      return null;
    }
  }
  ```

## 2. NextAuth JWT 세션 설정

- **문제점**: 사용자의 요청에 따라 `MongoDBAdapter`를 사용하지 않고, JWT(JSON Web Token) 방식으로 세션을 관리하도록 설정 변경.
- **파일명**: `app/api/auth/[...nextauth]/route.js`
- **수정 핵심코드**: `MongoDBAdapter` 관련 코드를 주석 처리하여 비활성화.

  ```javascript
  //import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

  // ...
  //adapter: MongoDBAdapter(connectDB),
  ```

## 3. 로그아웃 버튼 에러 및 세션 관리

- **문제점**: 로그아웃 버튼 클릭 시 에러 발생. Next.js App Router 환경에서 클라이언트 컴포넌트(`LogoutBtn`)가 세션 정보에 접근하기 위해 필요한 `SessionProvider`가 누락됨.
- **파일명**: `app/SessionProvider.js` (신규 생성)
- **수정 핵심코드**: `SessionProvider`를 감싸는 클라이언트 컴포넌트를 생성.

  ```javascript
  "use client";
  import { SessionProvider } from "next-auth/react";
  export default function NextAuthProvider({ children, session }) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
  }
  ```

- **파일명**: `app/layout.js`
- **수정 핵심코드**: 생성한 `NextAuthProvider`로 전체 앱을 감싸고, 서버에서 가져온 세션 정보를 `prop`으로 전달하여 클라이언트 측 세션 관리를 일관되게 함.

  ```javascript
  import NextAuthProvider from "./SessionProvider";

  export default async function RootLayout({ children }) {
    let session = await getServerSession(authOptions);
    return (
      <html lang="en">
        <body>
          <NextAuthProvider session={session}>
            {/* ... 기존 navbar 및 children ... */}
          </NextAuthProvider>
        </body>
      </html>
    );
  }
  ```

## 4. 사용자 이름 스타일 수정

- **문제점**: 로그인 시 표시되는 사용자 이름의 색상이 기본값으로 되어 있어 잘 보이지 않음.
- **파일명**: `app/layout.js`
- **수정 핵심코드**: 사용자 이름이 표시되는 `<span>` 태그에 인라인 스타일을 적용하여 글자색을 흰색으로 변경.

  ```javascript
  <span style={{ color: "white" }}>
    {session.user.name} <LogoutBtn />
  </span>
  ```

## 5. Next.js App Router API 라우트 수정

- **문제점**: Next.js App Router에서 API 라우트는 `GET`, `POST` 등 HTTP 메소드에 대한 명명된 내보내기(named export)를 사용해야 함. `export default`를 사용하여 `405 Method Not Allowed` 에러가 발생.
- **파일명**: `app/api/auth/[...nextauth]/route.js`
- **수정 핵심코드**: `export default` 방식 대신, `handler`를 `GET`과 `POST`로 명명하여 내보내는 방식으로 수정.

  ```javascript
  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
  ```
