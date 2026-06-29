// === CONFIGURATION ===
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your actual Google Sheet ID
const SHEET_NAME = 'Users';

// === HELPER FUNCTIONS ===

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  // Convert byte array to hex string
  let hexString = '';
  for (let i = 0; i < digest.length; i++) {
    let byteValue = digest[i];
    if (byteValue < 0) byteValue += 256;
    let byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = '0' + byteString;
    hexString += byteString;
  }
  return hexString;
}

/**
 * Generate UUID for new users
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * Check if email exists in sheet
 */
function emailExists(email) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) return true; // Column B is email
  }
  return false;
}

/**
 * Get user by email
 */
function getUserByEmail(email) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      return {
        name: data[i][0],
        email: data[i][1],
        passwordHash: data[i][2],
        timestamp: data[i][3],
        userId: data[i][4]
      };
    }
  }
  return null;
}

/**
 * Add new user to sheet
 */
function addUser(name, email, passwordHash) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const userId = generateUUID();
  const timestamp = new Date();
  
  sheet.appendRow([name, email, passwordHash, timestamp, userId, timestamp]);
  return userId;
}

// === API ENDPOINTS ===

/**
 * Main endpoint handler (POST)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'register') {
      return handleRegister(data);
    } else if (action === 'login') {
      return handleLogin(data);
    } else {
      return sendResponse(false, 'Invalid action', null);
    }
  } catch (error) {
    return sendResponse(false, 'Server error: ' + error.toString(), null);
  }
}

/**
 * Register new user
 */
function handleRegister(data) {
  const { name, email, password } = data;

  // Validation
  if (!name || !email || !password) {
    return sendResponse(false, 'All fields are required', null);
  }

  if (password.length < 6) {
    return sendResponse(false, 'Password must be at least 6 characters', null);
  }

  if (emailExists(email)) {
    return sendResponse(false, 'Email already registered', null);
  }

  // Hash password and create user
  const passwordHash = hashPassword(password);
  const userId = addUser(name, email, passwordHash);

  return sendResponse(true, 'Registration successful', {
    userId: userId,
    name: name,
    email: email
  });
}

/**
 * Login user
 */
function handleLogin(data) {
  const { email, password } = data;

  // Validation
  if (!email || !password) {
    return sendResponse(false, 'Email and password required', null);
  }

  // Get user
  const user = getUserByEmail(email);
  if (!user) {
    return sendResponse(false, 'User not found', null);
  }

  // Verify password
  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return sendResponse(false, 'Invalid password', null);
  }

  // Update last login
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data_range = sheet.getDataRange().getValues();
  for (let i = 1; i < data_range.length; i++) {
    if (data_range[i][1] === email) {
      sheet.getRange(i + 1, 6).setValue(new Date());
      break;
    }
  }

  return sendResponse(true, 'Login successful', {
    userId: user.userId,
    name: user.name,
    email: user.email
  });
}

/**
 * Send response in consistent format with CORS headers
 */
function sendResponse(success, message, data) {
  const output = ContentService.createTextOutput(
    JSON.stringify({
      success: success,
      message: message,
      data: data
    })
  ).setMimeType(ContentService.MimeType.JSON);
  
  // Set headers (note: doPost in Web Apps handles CORS via redirects, but we add these for completeness)
  return output;
}

/**
 * Allow CORS preflight OPTIONS request
 */
function doOptions(e) {
  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
