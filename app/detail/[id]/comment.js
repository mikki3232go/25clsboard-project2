/* app/detail/[id]/comment.js */
"use client";
import { useState, useEffect } from "react";

export default function Comment({ _id, author }) {
  let [comment, setComment] = useState("");
  let [commentList, setCommentList] = useState([]); //1. 댓글리스트  state
  let [refresh, setRefresh] = useState(true); //refresh가 변경될때마다 fetch실행

  useEffect(() => {
    fetchComments();
  }, [_id, refresh]);

  const fetchComments = () => {
    fetch("/api/comment/list/" + _id)
      // fetch('/api/comment/listq?id=' + _id)
      .then((res) => {
        if (!res.ok) {
          throw new Error("댓글을 불러오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        setCommentList(data);
        setRefresh(false);
      })
      .catch((error) => {
        console.error("댓글 로드 중 오류 발생:", error);
      });
  };

  // 임시 데이터: 실제로는 item에 ip, date, mention 등이 있어야 함
  // const getMeta = (item) => {
  //   return {
  //     author: item.author || "익명",
  //     ip: item.ip || "127.0.0.1",
  //     date: item.date || "2024-05-04 14:14",
  //   };
  // };

  // 멘션 파싱 예시: @닉네임 내용
  // const parseMention = (content) => {
  //   if (content && content.startsWith("@")) {
  //     const spaceIdx = content.indexOf(" ");
  //     if (spaceIdx > 0) {
  //       return [content.slice(0, spaceIdx), content.slice(spaceIdx + 1)];
  //     }
  //   }
  //   return [null, content];
  // };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto" }}>
      {commentList.length > 0 ? (
        commentList.map((item, i) => {
          //const meta = getMeta(item);
          // const [mention, restContent] = parseMention(item.content);
          return (
            <div className="comment-card" key={i}>
              <div className="comment-meta">
                <span className="comment-author">{item.comment}</span>
              </div>
              <div className="comment-content-box">
                <span className="mention">{item.content}</span>
              </div>
              <div className="comment-actions">
                <button>답변</button>
                <button>수정</button>
                <button>삭제</button>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ color: "#6c757d", fontStyle: "italic" }}>
          댓글이 없습니다.
        </div>
      )}

      <div className="write-form" style={{ marginTop: "30px" }}>
        <input
          className="write-input"
          placeholder="댓글을 입력하세요"
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
        <button
          className="write-btn"
          onClick={() => {
            fetch("/api/comment/new", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: comment,
                author: author,
                parent: _id,
              }),
            });
            setRefresh(true);
          }}
        >
          댓글 작성
        </button>
      </div>
    </div>
  );
}
