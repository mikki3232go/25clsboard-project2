/* app/detail/[id]/comment.js */
"use client";
import { useState } from "react";

export default function Comment(props) {
  let [comment, setComment] = useState("");
  //1. 댓글리스트  state
  //refresh가 변경될때마다 fetch 실행
  //2. fetchComments함수 작성("/api/comment/list/" + _id)
  //3. useEffect로  fetchComment실행
  return (
    <div>
      <input onChange={(e) => setComment(e.target.value)} />
      <button
        onClick={() => {
          fetch("/api/comment/new", {
            method: "POST",
            body: JSON.stringify({ comment, _id: props._id }),
          });
        }}
      >
        댓글전송
      </button>
    </div>
  );
}
