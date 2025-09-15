export default function Register() {
  return (
    <div className="write-form-container">
      <h4 className="write-form-title">회원가입</h4>
      <form method="POST" action="/api/auth/signup" className="write-form">
        <input
          name="name"
          type="text"
          placeholder="이름"
          className="write-input"
        />
        <input
          name="email"
          type="text"
          placeholder="이메일"
          className="write-input"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          className="write-input"
        />
        <button type="submit" className="write-btn">
          가입하기
        </button>
      </form>
    </div>
  );
}
