import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;
const SHEET_NAME = "Name_stadium";

// สร้าง Google Sheets API client
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

// GET: ดึงข้อมูลสนามทั้งหมด
export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`, // เริ่มจากแถว 2 (ข้ามหัวตาราง) ถึงคอลัมน์ S (S.18)
    });

    const rows = response.data.values || [];

    // แปลงข้อมูลเป็น Course objects
    const courses = rows
      .filter((row) => row[0]) // มีชื่อสนาม
      .map((row) => ({
        name: row[0], // Column A
        pars: [
          parseInt(row[1]) || 4, // Column B (S.1)
          parseInt(row[2]) || 4, // Column C (S.2)
          parseInt(row[3]) || 4, // Column D (S.3)
          parseInt(row[4]) || 4, // Column E (S.4)
          parseInt(row[5]) || 4, // Column F (S.5)
          parseInt(row[6]) || 4, // Column G (S.6)
          parseInt(row[7]) || 4, // Column H (S.7)
          parseInt(row[8]) || 4, // Column I (S.8)
          parseInt(row[9]) || 4, // Column J (S.9)
          parseInt(row[10]) || 4, // Column K (S.10)
          parseInt(row[11]) || 4, // Column L (S.11)
          parseInt(row[12]) || 4, // Column M (S.12)
          parseInt(row[13]) || 4, // Column N (S.13)
          parseInt(row[14]) || 4, // Column O (S.14)
          parseInt(row[15]) || 4, // Column P (S.15)
          parseInt(row[16]) || 4, // Column Q (S.16)
          parseInt(row[17]) || 4, // Column R (S.17)
          parseInt(row[18]) || 4, // Column S (S.18)
        ],
      }));

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses", details: error.message },
      { status: 500 }
    );
  }
}

// POST: เพิ่มสนามใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, pars } = body;

    if (!name || !pars || pars.length !== 18) {
      return NextResponse.json(
        { error: "Invalid data: name and 18 pars required" },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // ตรวจสอบว่าสนามนี้มีอยู่แล้วหรือไม่
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const existingNames = (existingResponse.data.values || [])
      .flat()
      .map((n) => n.toLowerCase());

    if (existingNames.includes(name.toLowerCase())) {
      return NextResponse.json(
        { error: "สนามนี้ถูกเพิ่มไปแล้ว" },
        { status: 409 } // Conflict
      );
    }

    // เพิ่มสนามใหม่
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:S`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, ...pars]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "เพิ่มสนามสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error adding course:", error);
    return NextResponse.json(
      { error: "Failed to add course", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: แก้ไขสนาม
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldName, name, pars } = body;

    if (!oldName || !name || !pars || pars.length !== 18) {
      return NextResponse.json(
        { error: "Invalid data: oldName, name and 18 pars required" },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // หาแถวที่ต้องการแก้ไข
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => row[0]?.toLowerCase() === oldName.toLowerCase()
    );

    if (rowIndex === -1) {
      return NextResponse.json({ error: "ไม่พบสนามนี้" }, { status: 404 });
    }

    // แก้ไขข้อมูล (แถวที่ rowIndex + 2 เพราะเริ่มจากแถว 2)
    const actualRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${actualRow}:S${actualRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, ...pars]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขสนามสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: ลบสนาม
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // หาแถวที่ต้องการลบ
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => row[0]?.toLowerCase() === name.toLowerCase()
    );

    if (rowIndex === -1) {
      return NextResponse.json({ error: "ไม่พบสนามนี้" }, { status: 404 });
    }

    // ลบแถว (แถวที่ rowIndex + 1 เพราะใน API เริ่มจาก 0)
    const actualRow = rowIndex + 2; // +2 เพราะเริ่มจากแถว 2 และ index เริ่มจาก 0
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // ถ้า Name_stadium ไม่ใช่ sheet แรก ต้องหา sheetId ที่ถูกต้อง
                dimension: "ROWS",
                startIndex: actualRow - 1,
                endIndex: actualRow,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบสนามสำเร็จ",
    });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course", details: error.message },
      { status: 500 }
    );
  }
}
