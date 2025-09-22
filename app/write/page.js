/* app/write/page.js */
"use client";
import { useSession } from "next-auth/react"; //1. useSession 훅 임포트

export default function Write({ children }) {
  let { data: session } = useSession();
  console.log("글작성페이지", JSON.stringify(session));

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/post/new", {
      method: "POST",
      body: new FormData(e.target),
    }).then((res) => {
      if (res.ok) {
        alert("글이 등록되었습니다.");
        window.location.href = "/list";
      } else {
        alert("글 등록에 실패했습니다.");
      }
    });
  };

  return (
    <div>
      {session && session.user && session.user.name ? (
        <div>
          <div>환영합니다 {session.user.name}님</div>
          <div className="write-form-container">
            <h4 className="write-form-title">글작성</h4>
            <form
              action="/api/post/new"
              method="POST"
              className="write-form"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="title"
                placeholder="글제목"
                className="write-input"
              />
              <input
                type="text"
                name="content"
                placeholder="글내용"
                className="write-input"
              />
              <button type="submit" className="write-btn">
                버튼
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>로그인 해주세요</div>
      )}
    </div>
  );
}
