import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;

function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "Bangkok";

    const sheets = getGoogleSheetsClient();

    // 1. ดึงข้อมูล PAR และ Stadium จาก Name_stadium sheet
    const stadiumResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Name_stadium!A2:S",
    });

    const stadiumRows = stadiumResponse.data.values || [];

    // หาแถวที่ตรงกับ location
    const stadiumRow = stadiumRows.find(
      (row) => row[0]?.toLowerCase().trim() === location.toLowerCase().trim()
    );

    let pars: number[] = [];
    let stadiums: string[] = [];
    let locationNotFound = false;

    // ถ้าไม่เจอ location → return empty data แต่ไม่ error
    if (!stadiumRow) {
      locationNotFound = true;
      pars = [];
      stadiums = Array.from({ length: 18 }, (_, i) => `S.${i + 1}`);
    } else {
      // Column B-S คือ PAR (18 หลุม)
      pars = stadiumRow.slice(1, 19).map((val) => parseInt(val) || 0);

      // Stadium names จาก header (แถว 1)
      const stadiumHeader = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Name_stadium!B1:S1",
      });

      if (stadiumHeader.data.values && stadiumHeader.data.values[0]) {
        stadiums = stadiumHeader.data.values[0];
      } else {
        stadiums = Array.from({ length: 18 }, (_, i) => `S.${i + 1}`);
      }
    }

    // 2. ดึงข้อมูลผู้เล่นจาก Form_Res sheet
    const playersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Form_Res!A2:V",
    });

    const playersRows = playersResponse.data.values || [];

    console.log(`Total rows in Form_Res: ${playersRows.length}`);
    console.log(`Filtering by location: ${location}`);

    // Filter เฉพาะผู้เล่นที่มี location ตรงกัน
    const filteredPlayers = playersRows.filter((row) => {
      const playerLocation = row[21]; // Column V
      console.log(
        `Player: ${row[2] || "Unknown"}, Location: "${playerLocation}"`
      );

      if (!playerLocation) return false;

      return (
        playerLocation.toLowerCase().trim() === location.toLowerCase().trim()
      );
    });

    console.log(`Filtered players: ${filteredPlayers.length}`);

    // แปลงข้อมูลเป็น Player objects
    const players = filteredPlayers.map((row) => {
      const name = row[2] || "Unknown";

      // Scores จาก Column D-U (18 columns)
      const scores: number[] = [];
      for (let i = 3; i <= 20; i++) {
        scores.push(parseInt(row[i]) || 0);
      }

      // คำนวณ total score
      const totalScore = scores.reduce((a, b) => a + b, 0);

      // คำนวณ total par (ถ้ามี)
      const totalPar = pars.length > 0 ? pars.reduce((a, b) => a + b, 0) : 0;

      // สมมติ hcp = 0
      const hcp = 0;
      const net = totalPar > 0 ? totalScore - totalPar : 0;

      return {
        name,
        net,
        hcp,
        scores,
      };
    });

    return NextResponse.json({
      players,
      pars,
      stadiums,
      locationNotFound,
    });
  } catch (error: any) {
    console.error("Error fetching Google Sheets data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
