/* app/write/page.js */
 
export default function Write(){
    return (
     <form action="/api/post/new" method="POST">
       <input name="title" placeholder="글제목" />
       <input name="content" placeholder="글내용" />
       <button type="submit">전송</button>
     </form>
  )
  }