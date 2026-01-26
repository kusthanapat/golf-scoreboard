// Google Sheets API client utilities

import { google } from 'googleapis';
import { env } from './env';

let cachedSheetsClient: ReturnType<typeof google.sheets> | null = null;

/**
 * Get or create a Google Sheets API client
 */
export function getSheetsClient() {
  if (cachedSheetsClient) {
    return cachedSheetsClient;
  }

  try {
    const auth = new google.auth.JWT({
      email: env.googleServiceAccountEmail,
      key: env.googlePrivateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    cachedSheetsClient = google.sheets({ version: 'v4', auth });
    return cachedSheetsClient;
  } catch (error) {
    throw new Error('Failed to initialize Google Sheets client');
  }
}

/**
 * Get data from a specific sheet range
 */
export async function getSheetData(range: string) {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.googleSheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read sheet data: ${error.message}`);
    }
    throw new Error('Failed to read sheet data');
  }
}

/**
 * Append data to a sheet
 */
export async function appendSheetData(range: string, values: unknown[][]) {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: env.googleSheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to append sheet data: ${error.message}`);
    }
    throw new Error('Failed to append sheet data');
  }
}

/**
 * Update data in a sheet
 */
export async function updateSheetData(range: string, values: unknown[][]) {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: env.googleSheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update sheet data: ${error.message}`);
    }
    throw new Error('Failed to update sheet data');
  }
}

/**
 * Delete rows from a sheet
 */
export async function deleteSheetRows(sheetId: number, startIndex: number, endIndex: number) {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.googleSheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex,
                endIndex,
              },
            },
          },
        ],
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete sheet rows: ${error.message}`);
    }
    throw new Error('Failed to delete sheet rows');
  }
}

/**
 * Get sheet ID by name
 */
export async function getSheetIdByName(sheetName: string): Promise<number> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: env.googleSheetId,
    });

    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet || sheet.properties?.sheetId === undefined || sheet.properties?.sheetId === null) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    return sheet.properties.sheetId;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get sheet ID: ${error.message}`);
    }
    throw new Error('Failed to get sheet ID');
  }
}
