/* app/edit/[id]/page.js */
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function Edit(props){
    let db = (await connectDB).db("board");
    let result = await db.collection('post')
    .findOne({_id: new ObjectId(props.params.id)})

    return(

<form action="/api/post/edit" method="POST">
  <input name="title" defaultValue={result.title} />
  <input name="content" defaultValue={result.content} />
  <input type="hidden" name="_id" defaultValue={result._id.toString()} />
</form>
)
}