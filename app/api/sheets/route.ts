import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    // ตั้งค่า Authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ดึงข้อมูล PAR และชื่อสนามจากแถว 1
    const parsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "SUM!D1:U2", // ดึงแถว 1-2 เพื่อเอาทั้งชื่อสนามและ PAR
    });

    const headerRows = parsResponse.data.values || [];

    // แถวที่ 1 = PAR (ถ้ามี "PAR" ก็ใช้แถวที่ 2)
    const parsRow =
      headerRows[0]?.[0]?.toString().toUpperCase() === "PAR"
        ? headerRows[1]
        : headerRows[0];
    const pars = parsRow?.map((val: any) => parseInt(val) || 4) || [];

    // แถวที่ 2 = ชื่อสนาม (S.1, S.2, ...)
    const stadiumsRow =
      headerRows[0]?.[0]?.toString().toUpperCase() === "PAR"
        ? headerRows[0]
        : headerRows[1];
    const stadiums =
      stadiumsRow?.map((val: any) => val?.toString() || "") || [];

    // ดึงข้อมูลผู้เล่นจากแถว 2 หรือ 3 เป็นต้นไป
    const startRow =
      headerRows[0]?.[0]?.toString().toUpperCase() === "PAR" ? 3 : 2;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: `SUM!A${startRow}:Y`, // ปรับ startRow ตามโครงสร้าง Sheet
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // กรอง header row ออก (แถวที่มี "姓名", "淨杆", "差點" หรือคำว่า "name", "net", "hcp")
    const dataRows = rows.filter((row: any[]) => {
      const firstCell = row[0]?.toString().toLowerCase() || "";
      // ถ้าเซลล์แรกเป็น header keywords ให้ข้าม
      return !["姓名", "名字", "name", "player", "姓名", "ชื่อ"].includes(
        firstCell.toLowerCase().trim()
      );
    });

    // แปลงข้อมูลเป็น JSON แบบ dynamic
    const players = dataRows.map((row: any[]) => {
      // ดึงคะแนนจากคอลัมน์ที่ 3 เป็นต้นไป (index 3-20 สำหรับ 18 หลุม)
      const scores: number[] = [];
      for (let i = 3; i < 21; i++) {
        scores.push(parseInt(row[i]) || 0);
      }

      return {
        name: row[0] || "Unknown",
        net: parseFloat(row[1]) || 0,
        hcp: parseFloat(row[2]) || 0,
        scores: scores,
      };
    });

    return NextResponse.json({ players, pars, stadiums });
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
