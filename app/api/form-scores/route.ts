import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;
const SHEET_NAME = "Form_Res";

function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// GET: ดึงข้อมูลทั้งหมด
export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:V`,
    });

    const rows = response.data.values || [];

    const scores = rows
      .filter((row) => row.length > 0 && row[2])
      .map((row, index) => ({
        rowIndex: index + 2,
        timestamp: row[0] || "",
        email: row[1] || "",
        playerName: row[2] || "", // ✅ เปลี่ยนจาก username
        scores: [
          parseInt(row[3]) || 0,
          parseInt(row[4]) || 0,
          parseInt(row[5]) || 0,
          parseInt(row[6]) || 0,
          parseInt(row[7]) || 0,
          parseInt(row[8]) || 0,
          parseInt(row[9]) || 0,
          parseInt(row[10]) || 0,
          parseInt(row[11]) || 0,
          parseInt(row[12]) || 0,
          parseInt(row[13]) || 0,
          parseInt(row[14]) || 0,
          parseInt(row[15]) || 0,
          parseInt(row[16]) || 0,
          parseInt(row[17]) || 0,
          parseInt(row[18]) || 0,
          parseInt(row[19]) || 0,
          parseInt(row[20]) || 0,
        ],
        location: row[21] || "", // ✅ เปลี่ยนจาก studentName
      }));

    return NextResponse.json({ scores });
  } catch (error: any) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores", details: error.message },
      { status: 500 }
    );
  }
}

// POST: เพิ่มข้อมูลใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, playerName, scores, userEmail } = body; // ✅ เปลี่ยนชื่อ

    console.log("📥 Received data:", {
      location,
      playerName,
      userEmail,
      scoresLength: scores?.length,
    });

    // Validation
    if (!location || !playerName || !scores || scores.length !== 18) {
      return NextResponse.json(
        { error: "Invalid data: location, playerName and 18 scores required" },
        { status: 400 }
      );
    }

    const email = userEmail || "anonymous@example.com";
    const sheets = getGoogleSheetsClient();

    // สร้าง timestamp
    const now = new Date();
    const thaiDate = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
    );

    const month = thaiDate.getMonth() + 1;
    const day = thaiDate.getDate();
    const year = thaiDate.getFullYear();
    const hours = String(thaiDate.getHours()).padStart(2, "0");
    const minutes = String(thaiDate.getMinutes()).padStart(2, "0");
    const seconds = String(thaiDate.getSeconds()).padStart(2, "0");

    const timestamp = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;

    // เตรียมข้อมูล
    const rowData = [
      timestamp, // A: ประทับเวลา
      email, // B: ที่อยู่อีเมล
      playerName, // C: ชื่อผู้เล่น ✅
      ...scores, // D-U: คะแนน 18 หลุม
      location, // V: Location/Stadium ✅
    ];

    console.log("📝 Appending row:", {
      timestamp,
      email,
      playerName,
      location,
      rowLength: rowData.length,
    });

    // Append ข้อมูล
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:V`,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    console.log("✅ Append successful:", appendResponse.data.updates);

    return NextResponse.json({
      success: true,
      message: "เพิ่มข้อมูลสำเร็จ",
      updatedRange: appendResponse.data.updates?.updatedRange,
    });
  } catch (error: any) {
    console.error("❌ Error adding score:", error);
    return NextResponse.json(
      {
        error: "Failed to add score",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

// PUT: แก้ไขข้อมูล
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, location, playerName, scores } = body; // ✅ เปลี่ยนชื่อ

    console.log("📝 Updating row:", { rowIndex, playerName, location });

    if (
      !rowIndex ||
      !location ||
      !playerName ||
      !scores ||
      scores.length !== 18
    ) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const sheets = getGoogleSheetsClient();

    // อัปเดตข้อมูล
    const rowData = [playerName, ...scores, location]; // ✅

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!C${rowIndex}:V${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    console.log("✅ Update successful");

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อมูลสำเร็จ",
    });
  } catch (error: any) {
    console.error("❌ Error updating score:", error);
    return NextResponse.json(
      { error: "Failed to update score", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: ลบข้อมูล
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rowIndex = searchParams.get("rowIndex");

    if (!rowIndex) {
      return NextResponse.json(
        { error: "Row index is required" },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting row:", rowIndex);

    const sheets = getGoogleSheetsClient();

    // หา sheetId
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const formResSheet = sheetMetadata.data.sheets?.find(
      (sheet) => sheet.properties?.title === SHEET_NAME
    );

    const sheetId = formResSheet?.properties?.sheetId || 0;

    console.log("📋 Found sheetId:", sheetId);

    // ลบแถว
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: parseInt(rowIndex) - 1,
                endIndex: parseInt(rowIndex),
              },
            },
          },
        ],
      },
    });

    console.log("✅ Delete successful");

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (error: any) {
    console.error("❌ Error deleting score:", error);
    return NextResponse.json(
      { error: "Failed to delete score", details: error.message },
      { status: 500 }
    );
  }
}
