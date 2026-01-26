import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSheetData, appendSheetData, updateSheetData, deleteSheetRows, getSheetIdByName } from "@/lib/google-sheets";
import { validatePlayerName, validateScoreArray, validateLocation, sanitizeString } from "@/lib/validation";
import { createErrorResponse, AppError, validateRequiredFields } from "@/lib/errors";
import { logger } from "@/lib/logger";

const SHEET_NAME = env.sheetNameFormRes;

interface ScoreRow {
  rowIndex: number;
  timestamp: string;
  email: string;
  playerName: string;
  scores: number[];
  location: string;
}

interface PostScoreBody {
  location: string;
  playerName: string;
  scores: number[];
  userEmail?: string;
}

interface PutScoreBody {
  rowIndex: number;
  location: string;
  playerName: string;
  scores: number[];
}

// GET: Fetch all scores
export async function GET(): Promise<NextResponse> {
  try {
    const rows = await getSheetData(`${SHEET_NAME}!A2:V`);

    const scores: ScoreRow[] = rows
      .filter((row) => row.length > 0 && row[2])
      .map((row, index) => ({
        rowIndex: index + 2,
        timestamp: String(row[0] || ""),
        email: String(row[1] || ""),
        playerName: sanitizeString(String(row[2] || "")),
        scores: Array.from({ length: 18 }, (_, i) => {
          const value = row[i + 3];
          const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
          return isNaN(parsed) ? 0 : parsed;
        }),
        location: sanitizeString(String(row[21] || "")),
      }));

    return NextResponse.json({ scores });
  } catch (error) {
    logger.error("Failed to fetch scores", { error });
    return createErrorResponse(error, "Failed to fetch scores");
  }
}

// POST: Add new score
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as PostScoreBody;

    // Validate required fields
    validateRequiredFields(body, ['location', 'playerName', 'scores']);

    const { location, playerName, scores, userEmail } = body;

    // Validate player name
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      throw new AppError(nameValidation.errors.join(', '), 400, 'INVALID_PLAYER_NAME');
    }

    // Validate location
    const locationValidation = validateLocation(location);
    if (!locationValidation.valid) {
      throw new AppError(locationValidation.errors.join(', '), 400, 'INVALID_LOCATION');
    }

    // Validate scores array
    const scoresValidation = validateScoreArray(scores);
    if (!scoresValidation.valid) {
      throw new AppError(scoresValidation.errors.join(', '), 400, 'INVALID_SCORES');
    }

    // Sanitize inputs
    const sanitizedPlayerName = sanitizeString(playerName);
    const sanitizedLocation = sanitizeString(location);
    const email = userEmail ? sanitizeString(userEmail) : "anonymous@example.com";

    // Create timestamp in Thai timezone
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

    // Prepare row data
    const rowData = [
      timestamp,
      email,
      sanitizedPlayerName,
      ...scores,
      sanitizedLocation,
    ];

    logger.info("Adding new score", {
      playerName: sanitizedPlayerName,
      location: sanitizedLocation
    });

    // Append data to sheet
    await appendSheetData(`${SHEET_NAME}!A:V`, [rowData]);

    return NextResponse.json({
      success: true,
      message: "Score added successfully",
    });
  } catch (error) {
    logger.error("Failed to add score", { error });
    return createErrorResponse(error, "Failed to add score");
  }
}

// PUT: Update existing score
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as PutScoreBody;

    // Validate required fields
    validateRequiredFields(body, ['rowIndex', 'location', 'playerName', 'scores']);

    const { rowIndex, location, playerName, scores } = body;

    // Validate row index
    if (!Number.isInteger(rowIndex) || rowIndex < 2) {
      throw new AppError("Invalid row index", 400, 'INVALID_ROW_INDEX');
    }

    // Validate player name
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      throw new AppError(nameValidation.errors.join(', '), 400, 'INVALID_PLAYER_NAME');
    }

    // Validate location
    const locationValidation = validateLocation(location);
    if (!locationValidation.valid) {
      throw new AppError(locationValidation.errors.join(', '), 400, 'INVALID_LOCATION');
    }

    // Validate scores array
    const scoresValidation = validateScoreArray(scores);
    if (!scoresValidation.valid) {
      throw new AppError(scoresValidation.errors.join(', '), 400, 'INVALID_SCORES');
    }

    // Sanitize inputs
    const sanitizedPlayerName = sanitizeString(playerName);
    const sanitizedLocation = sanitizeString(location);

    // Prepare row data
    const rowData = [sanitizedPlayerName, ...scores, sanitizedLocation];

    logger.info("Updating score", {
      rowIndex,
      playerName: sanitizedPlayerName,
      location: sanitizedLocation
    });

    // Update data in sheet
    await updateSheetData(`${SHEET_NAME}!C${rowIndex}:V${rowIndex}`, [rowData]);

    return NextResponse.json({
      success: true,
      message: "Score updated successfully",
    });
  } catch (error) {
    logger.error("Failed to update score", { error });
    return createErrorResponse(error, "Failed to update score");
  }
}

// DELETE: Delete score
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rowIndexParam = searchParams.get("rowIndex");

    if (!rowIndexParam) {
      throw new AppError("Row index is required", 400, 'MISSING_ROW_INDEX');
    }

    const rowIndex = parseInt(rowIndexParam, 10);

    if (isNaN(rowIndex) || rowIndex < 2) {
      throw new AppError("Invalid row index", 400, 'INVALID_ROW_INDEX');
    }

    logger.info("Deleting score", { rowIndex });

    // Get sheet ID by name (don't assume it's 0)
    const sheetId = await getSheetIdByName(SHEET_NAME);

    // Delete row from sheet
    await deleteSheetRows(sheetId, rowIndex - 1, rowIndex);

    return NextResponse.json({
      success: true,
      message: "Score deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete score", { error });
    return createErrorResponse(error, "Failed to delete score");
  }
}
