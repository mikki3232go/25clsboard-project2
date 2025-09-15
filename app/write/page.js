/* app/write/page.js */
export default function Write() {
  return (
    <div className="write-form-container">
      <h4 className="write-form-title">글작성</h4>
      <form action="/api/post/new" method="POST" className="write-form">
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
  );
}
