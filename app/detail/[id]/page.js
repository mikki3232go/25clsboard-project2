//detail page
/* app/detail/[id]/page.js */
import { connectDB } from "@/util/database"
import { ObjectId } from "mongodb"
//props = {params: {id:값},searchParams:{}}
export default async function Detail(props) { //_id가 넘어옴
    const client = await connectDB;
    const db = client.db('board');
    let result = await db.collection('post').findOne({_id: new ObjectId(props.params.id)})
    console.log(props);
    console.log(JSON.stringify(props));

//조회하는 코드 작성

  return (
    <div>
      <h4>{result.title}</h4>
      <p>{result.content}</p>
    </div>
  )
}
