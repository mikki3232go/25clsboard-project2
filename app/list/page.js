 /* app/list/page.js */
import { connectDB } from "@/util/database"
import ListItem from "./Listitem"
export default async function List() {
    let client = await connectDB  //1. 
    const db = client.db('board') //db명
    let result = await db.collection('post').find().toArray()
  
  return (
    <div className="list-bg">
      {result.map((item, i) => (
        <ListItem item = {item} i = {i} />
      ))}
    </div>
  )
}

 
