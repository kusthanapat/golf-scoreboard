import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;

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

// ฟังก์ชันสุ่ม index ของ par ตามเงื่อนไข
function randomizeParIndexes(pars: number[]): number[] {
  const result = [...pars];

  // หา indexes ของ 5, 4, 3 ใน index 0-8
  const front9Indexes: { [key: number]: number[] } = { 5: [], 4: [], 3: [] };
  for (let i = 0; i <= 8; i++) {
    if ([3, 4, 5].includes(pars[i])) {
      front9Indexes[pars[i]].push(i);
    }
  }

  // สุ่มให้เป็น 0 (อย่างละ 1 อัน)
  [5, 4, 3].forEach((parValue) => {
    if (front9Indexes[parValue].length > 0) {
      const randomIdx =
        front9Indexes[parValue][
          Math.floor(Math.random() * front9Indexes[parValue].length)
        ];
      result[randomIdx] = 0;
    }
  });

  // หา indexes ของ 5, 4, 3 ใน index 9-17
  const back9Indexes: { [key: number]: number[] } = { 5: [], 4: [], 3: [] };
  for (let i = 9; i <= 17; i++) {
    if ([3, 4, 5].includes(pars[i])) {
      back9Indexes[pars[i]].push(i);
    }
  }

  // สุ่มให้เป็น 0 (อย่างละ 1 อัน)
  [5, 4, 3].forEach((parValue) => {
    if (back9Indexes[parValue].length > 0) {
      const randomIdx =
        back9Indexes[parValue][
          Math.floor(Math.random() * back9Indexes[parValue].length)
        ];
      result[randomIdx] = 0;
    }
  });

  return result;
}

// ฟังก์ชันคำนวณ 差點 (Difference)
function calculateDifference(
  randomizedScores: number[],
  totalPar: number
): number {
  const sumScores = randomizedScores.reduce((a, b) => a + b, 0);
  return (sumScores * 1.5 - totalPar) * 0.8;
}

// ฟังก์ชันคำนวณ 確定 (Confirmed Handicap)
function calculateConfirmed(difference: number): number {
  // ให้สามารถติดลบได้ แต่จำกัดไม่ให้ต่ำกว่า -50
  if (difference < -50) return -50;
  if (difference > 36) return 36;
  return Math.round(difference * 10) / 10; // ปัดทศนิยม 1 ตำแหน่ง
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location } = body;

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();

    // 1. ดึง PAR จาก Name_stadium
    const stadiumResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Name_stadium!A2:S",
    });

    const stadiumRows = stadiumResponse.data.values || [];
    const stadiumRow = stadiumRows.find(
      (row) => row[0]?.toLowerCase().trim() === location.toLowerCase().trim()
    );

    if (!stadiumRow) {
      return NextResponse.json(
        { error: "Stadium not found for this location" },
        { status: 404 }
      );
    }

    const pars = stadiumRow.slice(1, 19).map((val) => parseInt(val) || 4);
    const totalPar = pars.reduce((a, b) => a + b, 0);

    // 2. ดึงข้อมูลผู้เล่นจาก Form_Res
    const playersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Form_Res!A2:V",
    });

    const playersRows = playersResponse.data.values || [];
    const filteredPlayers = playersRows.filter((row) => {
      const playerLocation = row[21];
      return (
        playerLocation?.toLowerCase().trim() === location.toLowerCase().trim()
      );
    });

    // 3. คำนวณ Ranking สำหรับแต่ละผู้เล่น
    const rankings = filteredPlayers.map((row) => {
      const name = row[2] || "Unknown";

      // Scores จาก Column D-U
      const scores: number[] = [];
      for (let i = 3; i <= 20; i++) {
        scores.push(parseInt(row[i]) || 0);
      }

      // สุ่ม PAR
      const randomizedPar = randomizeParIndexes(pars);

      // สุ่ม Scores ตาม index ของ PAR ที่เป็น 0
      const randomizedScores = scores.map((score, idx) =>
        randomizedPar[idx] === 0 ? 0 : score
      );

      // คำนวณ 差點
      const difference = calculateDifference(randomizedScores, totalPar);

      // คำนวณ 確定 (ตอนนี้สามารถติดลบได้แล้ว)
      const confirmed = calculateConfirmed(difference);

      return {
        name,
        difference: Math.round(difference * 10) / 10,
        confirmed,
        randomizedPar,
        randomizedScores,
      };
    });

    // 4. แบ่งกลุ่มตาม confirmed value
    // Group A: รวมทั้งค่าติดลบและ 0-12
    const groupA = rankings
      .filter((r) => r.confirmed <= 12)
      .sort((a, b) => a.difference - b.difference); // เรียงจากน้อยไปมาก (ติดลบมากสุดอันดับ 1)

    const groupB = rankings
      .filter((r) => r.confirmed > 12 && r.confirmed <= 24)
      .sort((a, b) => a.difference - b.difference);

    const groupC = rankings
      .filter((r) => r.confirmed > 24 && r.confirmed <= 36)
      .sort((a, b) => a.difference - b.difference);

    // เพิ่มอันดับ
    groupA.forEach((player, idx) => {
      (player as any).rank = idx + 1;
    });

    groupB.forEach((player, idx) => {
      (player as any).rank = idx + 1;
    });

    groupC.forEach((player, idx) => {
      (player as any).rank = idx + 1;
    });

    return NextResponse.json({
      groupA,
      groupB,
      groupC,
      totalPar,
    });
  } catch (error: any) {
    console.error("Error calculating ranking:", error);
    return NextResponse.json(
      { error: "Failed to calculate ranking", details: error.message },
      { status: 500 }
    );
  }
}
