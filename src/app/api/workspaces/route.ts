import { NextRequest, NextResponse } from "next/server";




// route that will return all workspaces of a user 
export const GET = async (req: NextRequest) => {
    // get the bearer token from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return NextResponse.json({error: "Unauthorized"}, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return NextResponse.json({error: "Unauthorized"}, { status: 401 });
    }

    // query supabase for the workspaces of a user 
    


}