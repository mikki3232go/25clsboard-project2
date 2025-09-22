import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import Comment from "./comment"; //2-0. 댓글 컴포넌트 임포트
//주요기능
//0. db 접속하기
//1. id를 전달받아 조건에 맞는 레코드 가져오기
//2. 댓글 컴포넌트 보여주기
export default async function Detail(props) {
  const client = await connectDB;
  const db = client.db("board"); //0. forum db 접속하기

  let result = await db //1. id가 일치하는 레코드 가져오기
    .collection("post")
    .findOne({ _id: new ObjectId(props.params.id) });

  // props의 모든 속성과 값을 출력하려면 아래와 같이 작성할 수 있습니다.
  console.log("props의 모든 속성과 값:", JSON.stringify(props));
  //{"params":{"id":"6899487af6ba27b144f48e56"},"searchParams":{}}
  return (
    <div className="detail-page-container">
      <div className="detail-card">
        <h2 className="detail-title">상세페이지</h2>

        <div className="detail-meta">
          <span className="detail-author">{result?.author}</span>
        </div>
        <h4 className="detail-post-title">{result.title}</h4>
        <div className="detail-content">{result.content}</div>
        <div style={{ marginTop: "30px" }}>
          {/*2-2. 댓글 컴포넌트 보여주기*/}
          <Comment _id={result._id.toString()} author={result.author} />{" "}
        </div>
      </div>
    </div>
  );
}
