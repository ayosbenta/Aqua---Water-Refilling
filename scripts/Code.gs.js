// ===============================================================
// AquaFlow - Water Refilling Station Booking Platform Backend v2
// ===============================================================
// This version includes robust error handling for empty sheets and
// prevents race conditions using LockService.
// ===============================================================


// --- CONFIGURATION ---
// This script will use the spreadsheet it is attached to. No need to set an ID.
const USER_SHEET_NAME = "Users";
const BOOKING_SHEET_NAME = "Bookings";
const SETTINGS_SHEET_NAME = "Settings";

// --- DEFAULT HEADERS (for auto-initialization of empty sheets) ---
const USER_HEADERS = ['id', 'fullName', 'mobile', 'email', 'password', 'type'];
const BOOKING_HEADERS = ['id', 'userId', 'gallonCount', 'newGallonPurchaseCount', 'gallonType', 'pickupAddress', 'pickupDate', 'timeSlot', 'notes', 'status', 'deliveryOption', 'createdAt', 'completedAt', 'price', 'paymentMethod', 'items'];
const SETTINGS_HEADERS = ['key', 'value'];


/**
 * Handles all GET requests. The primary action is to fetch all data.
 */
function doGet(e) {
  try {
    // Making getAllData the default action to prevent "Invalid GET action" errors.
    const result = getAllData();
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', ...result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`doGet Error: ${error.toString()}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles all POST requests to save or update data.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds for the lock

  try {
    const requestData = JSON.parse(e.postData.contents);
    const { dataType, payload } = requestData;

    if (!dataType || !payload) {
      throw new Error("Missing 'dataType' or 'payload' in POST request.");
    }
    
    let sheet, headers;

    switch (dataType) {
      case 'user':
        ({ sheet, headers } = getSheetAndHeaders(USER_SHEET_NAME, USER_HEADERS));
        saveData(sheet, headers, payload);
        break;
      case 'booking':
        ({ sheet, headers } = getSheetAndHeaders(BOOKING_SHEET_NAME, BOOKING_HEADERS));
        saveData(sheet, headers, payload);
        break;
      case 'settings':
        saveSettingsData(payload);
        break;
      default:
        throw new Error(`Invalid dataType: ${dataType}`);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: `${dataType} data saved successfully.` }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`doPost Error: ${error.toString()} | Payload: ${e.postData.contents}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Robustly gets a sheet and its headers.
 * If the sheet is empty, it writes the default headers, fixing the "number of columns" error.
 * @param {string} sheetName The name of the sheet.
 * @param {string[]} defaultHeaders An array of header strings.
 * @returns {{sheet: GoogleAppsScript.Spreadsheet.Sheet, headers: string[]}}
 */
function getSheetAndHeaders(sheetName, defaultHeaders) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // If sheet is completely empty (no columns), create headers.
  if (sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    SpreadsheetApp.flush(); 
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return { sheet, headers };
}

/**
 * Generic function to save a new row or update an existing one based on its ID.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet object.
 * @param {string[]} headers The array of headers.
 * @param {Object} payload The data object to save.
 */
function saveData(sheet, headers, payload) {
  if (!payload.id) {
    throw new Error("Payload must have an 'id' property to save data.");
  }
  
  const idColumnIndex = headers.indexOf('id') + 1;
  if (idColumnIndex === 0) throw new Error("Sheet is missing 'id' header.");

  const lastRow = sheet.getLastRow();
  let rowToUpdate = -1;

  // Find existing row if data is present
  if (lastRow > 1) {
    const idValues = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues();
    for(let i = 0; i < idValues.length; i++) {
      if(idValues[i][0] == payload.id) { // Use '==' for type flexibility with sheet data
        rowToUpdate = i + 2; // +2 for 1-based index and header row
        break;
      }
    }
  }

  // Create an array that matches the header order
  const rowData = headers.map(header => {
      // Handle Date objects correctly for Sheets
      if ((header === 'createdAt' || header === 'completedAt' || header === 'pickupDate') && payload[header]) {
          const date = new Date(payload[header]);
          return isNaN(date.getTime()) ? "" : date;
      }
      return payload[header] !== undefined && payload[header] !== null ? payload[header] : "";
  });

  if (rowToUpdate !== -1) {
    // Update existing row
    sheet.getRange(rowToUpdate, 1, 1, headers.length).setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
  }
}

/**
 * Special function to save settings data as key-value pairs.
 * @param {Object} payload The settings object to save.
 */
function saveSettingsData(payload) {
  const { sheet } = getSheetAndHeaders(SETTINGS_SHEET_NAME, SETTINGS_HEADERS);
  const lastRow = sheet.getLastRow();
  
  Object.keys(payload).forEach(key => {
    const value = payload[key];
    // Stringify objects/arrays for storage in a single cell
    const valueToStore = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value;
    
    let found = false;
    // Check if key already exists to update it
    if (lastRow > 1) {
      for (let i = 2; i <= lastRow; i++) {
        if (sheet.getRange(i, 1).getValue() === key) {
          sheet.getRange(i, 2).setValue(valueToStore);
          found = true;
          break;
        }
      }
    }
    // If not found, add as a new key-value pair
    if (!found) {
      sheet.appendRow([key, valueToStore]);
    }
  });
}

/**
 * Converts a 2D array from a sheet into an array of objects.
 * Assumes the first row is the header.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet object to read from.
 * @returns {Object[]} An array of data objects.
 */
function sheetDataToObjectArray(sheet) {
    if (!sheet || sheet.getLastRow() < 2) {
      return []; // Return empty array if sheet is empty or has only a header
    }
    const data = sheet.getDataRange().getValues();
    const headers = data.shift().map(header => String(header).trim());
    
    return data.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            if (header) {
                const value = row[index];
                // Convert dates to ISO strings for JSON compatibility
                obj[header] = value instanceof Date ? value.toISOString() : value;
            }
        });
        return obj;
    });
}

/**
 * Fetches all data from Users, Bookings, and Settings sheets.
 */
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(USER_SHEET_NAME);
  const bookingSheet = ss.getSheetByName(BOOKING_SHEET_NAME);
  const settingsSheet = ss.getSheetByName(SETTINGS_SHEET_NAME);

  const users = userSheet ? sheetDataToObjectArray(userSheet) : [];
  const bookings = bookingSheet ? sheetDataToObjectArray(bookingSheet) : [];
  
  // Settings are stored as key-value pairs and need special handling
  const settings = {};
  if (settingsSheet && settingsSheet.getLastRow() > 1) {
    const settingsData = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 2).getValues();
    settingsData.forEach(row => {
      const key = row[0];
      const value = row[1];
      if (key) {
        try {
          // Attempt to parse values that might be JSON strings (like gallonTypes array)
          settings[key] = JSON.parse(value);
        } catch (e) {
          // If not JSON, use the raw value
          settings[key] = value;
        }
      }
    });
  }

  return { users, bookings, settings };
}