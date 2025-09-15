/*  app/list/Listitem.js */
"use client";
import Link from "next/link";
//주요기능
//1. 클릭한 제목의 데이터를 하나의 div안에 제목과 내용 보여주기
//2-1. 삭제
export default function ListItem({item}) {
  console.log('item 넘어온거' + item)
  return (
    
    <div className="list-item-card" >
     
        <div className="list-item-header">
          <Link href={"/detail/" + item._id} className="list-item-title-link">
            <h4 className="list-item-title">{item.title}</h4>
          </Link>
        </div>
          <div className="list-item-actions">
            <button className="list-btn edit-btn">
              <Link href={"/edit/" + item._id} >수정</Link>
            </button>
            <button
              className="list-btn delete-btn"
              onClick={(e) => {
                fetch("/api/post/delete", {//fetch는 client 컴포넌트에서 이용
                  //삭제 기능 1-1 만들기(method POST또는 DELETE이용)
                  method: "DELETE",
                  body: item._id, //서버로 객체(array )보낼때는 JSON.stringify({})
                })
                  .then((r) => {
                    //성공하면 '1-2 서버에서 보내준 메시지 받기
                    return r.json();
                  })
                  .then((r) => {
                    //성공하면 '1-2 받은 메시지 있으면 출력
                    alert(r)
                    e.target.closest('.list-item-card').opacity = 0; //1-3. 가까운 클래스 이름 탐색
                    setTimeout(() => {
                      e.target.closest('.list-item-card').style.display = "none"; //1-4.item도 사라지게 하기
                    }, 1000);
                  });
              }}
            >
              삭제
            </button>
            <button
              className="list-btn test-btn"
              onClick={() => {
                fetch("api/test?name=kim&age=20")
                .then(r=> { return r.json()})
                .then(r=> alert(JSON.stringify(r))) // 2-1. get요청시 query로 데이터 전송하기)
               // fetch("api/abc/kim"); //2-2. 다이렉트 라우터로 값('kim') <api/abc/[query].js
              }}
            >
              쿼리 & 다이나믹 라우터 연습
            </button>
            <button
              className="list-btn dynamic-btn"
              onClick={() => {
                fetch("/api/post/" + item._id, { method: "DELETE" })
                  .then((r) => r.json())
                  .then((result) => {
                    alert(result);
                    // 삭제 성공 후 페이지 새로고침
                    window.location.reload();
                  });
              }} //3-2. /api/post/[id].js작성하기
            >
              다이나믹 라우터로 삭제해보기
            </button>
          </div>
        
        <p className="list-item-content">{item.content}</p> 
        <p className="list-item-content">{item.author}</p> 
      </div>
   
  ) 
}
