import { connectDB } from "@/util/database";
import { NextResponse } from "next/server";
export async function GET(request){
    try{
        const db = (await connectDB).db("board");
        const result = await db.collection("post").find().toArray();
        const resultStr = result.map((item)=>({
            ...item,
            _id :item._id.toString(),
        }));
        return NextResponse.json(resultStr);
    }
    catch(error){
        console.error("DB접속에러 : ",error);
        return NextResponse.json({error:"DB접속에러"},{status:500})

    }
}