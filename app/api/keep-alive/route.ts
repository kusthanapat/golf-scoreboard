import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Simple query to keep database active
    const { error } = await supabase.from("_keep_alive").select("*").limit(1);

    // ถ้า table ไม่มีก็ไม่เป็นไร แค่ต้องการให้ database ตื่น
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Supabase is alive",
    });
  } catch (error) {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Ping sent",
    });
  }
}
