🏥 Fidele - AI-Powered Health Assistant Web Application
Complete Project Specification

📋 Table of Contents

Project Overview
Tech Stack
Design System
Authentication System
Application Pages
Features & Functionality
Implementation Checklist
Code Structure
Deployment & Testing
Important Reminders


🎯 Project Overview
Fidele is a modern, AI-powered health assistance platform designed to provide users with intelligent health guidance, symptom analysis, and emergency healthcare facility recommendations.
Key Objectives

✅ Provide accessible health information to users
✅ Offer symptom analysis with risk level indicators
✅ Connect users with nearby healthcare facilities
✅ Facilitate doctor consultations through trusted platforms
✅ Maintain user data securely with authentication
✅ Deliver excellent UX on all devices

Target Users

General users seeking health information
People experiencing symptoms wanting guidance
Users needing emergency medical facility information
Mobile-first audience


🛠️ Tech Stack
Frontend

Framework: React (with Hooks: useState, useEffect, useRef, useCallback)
Styling: Tailwind CSS (core utilities only, no custom configuration)
Icons: Lucide React
State Management: React Context/Local State
No Storage: Avoid localStorage/sessionStorage (all data in React state)

Backend

Platform: Google Apps Script (scripts.google.com)
Database: Google Sheets
Authentication: SHA-256 password hashing
API Pattern: REST via Google Apps Script Web App

External APIs

Maps: Google Maps JavaScript API or Mapbox GL JS
Places: Google Places API (for hospital search)
AI/ML (Optional): OpenAI API or Custom Symptom Analysis Engine

Deployment

Frontend: Vercel / Netlify
Backend: Google Apps Script (built-in hosting)


🎨 Design System
Color Palette
UsageColorHexTailwindPrimaryLight Blue#60A5FAbg-blue-400Primary DarkDark Blue#3B82F6bg-blue-500SecondarySoft Green#4ADE80bg-green-400Secondary DarkDark Green#22C55Ebg-green-500BackgroundWhite#FFFFFFbg-whiteBackground AltLight Gray#F9FAFBbg-gray-50Text PrimaryDark Gray#1F2937text-gray-800Text SecondaryMedium Gray#6B7280text-gray-500SuccessGreen#10B981bg-emerald-500WarningAmber#F59E0Bbg-amber-400DangerRed#EF4444bg-red-500BorderLight Gray#E5E7EBborder-gray-200
Typography
css/* Headings */
h1: 32px, 700 weight, text-gray-900
h2: 24px, 700 weight, text-gray-800
h3: 20px, 600 weight, text-gray-800
h4: 18px, 600 weight, text-gray-700

/* Body */
Body Large: 16px, 400 weight, text-gray-700
Body Medium: 14px, 400 weight, text-gray-600
Body Small: 12px, 400 weight, text-gray-500

/* Button Text */
Button: 14px, 600 weight, uppercase, letter-spacing 0.5px
Component Guidelines

Border Radius: 12px (rounded-lg in Tailwind)
Shadows: Soft shadows only

shadow-sm: subtle elements
shadow-md: cards and modals
shadow-lg: dropdowns and overlays


Spacing: Use Tailwind spacing scale (4px base unit)
Transitions: 200ms ease for smooth animations

Design Principles
✨ Minimalist: Remove unnecessary elements

✨ Healthcare-Focused: Convey trust and professionalism

✨ Accessible: WCAG 2.1 AA compliance

✨ Mobile-First: Design for smallest screens first

✨ Responsive: Seamless experience on all devices

✨ Interactive: Smooth animations and micro-interactions

✨ Clear Hierarchy: Visual emphasis on important information

🔐 Authentication System
Architecture Overview
User Frontend (React)
        ↓
    Fetch API (HTTPS)
        ↓
Google Apps Script Web App
        ↓
    Google Sheets Database
Google Sheets Structure
Sheet Name: Users
ColumnTypeDescriptionATextNameBTextEmail (unique)CTextPassword Hash (SHA-256)DDateTimeTimestamp (created)ETextUser ID (UUID)FDateTimeLast Login
Example Row:
John Doe | john@example.com | a9b8c7d6... | 2024-01-15 10:30:00 | user_abc123 | 2024-01-20 14:20:00
Google Apps Script Backend
Setup Instructions

Create New Google Apps Script:

Go to scripts.google.com
Create new project
Name it "Fidele API"


Authorize Google Sheets Access:

javascript   // In Apps Script, add this scope in appsscript.json
   "oauthScopes": [
     "https://www.googleapis.com/auth/spreadsheets",
     "https://www.googleapis.com/auth/script.external_request"
   ]

Create Backend Code:

javascript// === CONFIGURATION ===
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Get from Sheet URL
const SHEET_NAME = 'Users';

// === HELPER FUNCTIONS ===

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
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
 * Main endpoint handler
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
 * Send response in consistent format
 */
function sendResponse(success, message, data) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: success,
      message: message,
      data: data
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Allow CORS
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

Deploy as Web App:

Click "Deploy" → "New Deployment"
Type: Web app
Execute as: Your email
Who has access: Anyone
Copy the deployment URL (e.g., https://script.google.com/macros/d/SCRIPT_ID/userweb...)



Frontend Integration
API Utility Function
javascriptconst API_URL = process.env.REACT_APP_APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_URL_HERE';

/**
 * Call Google Apps Script API
 */
async function callAPI(action, payload) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

/**
 * Register user
 */
export async function registerUser(name, email, password) {
  return callAPI('register', { name, email, password });
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  return callAPI('login', { email, password });
}

📄 Application Pages
Page 1: Login Page
Route/State: currentPage === 'login'
Layout
┌─────────────────────────────┐
│     FIDELE ❤️               │
│  Your AI Health Companion   │
│                             │
│  ┌───────────────────────┐  │
│  │  Email                │  │
│  │  user@example.com     │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Password             │  │
│  │  ••••••••••           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  LOGIN (Blue)         │  │
│  └───────────────────────┘  │
│                             │
│  Don't have account? Sign Up│
│  [Link - Blue]              │
└─────────────────────────────┘
Components
jsx<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
    {/* Header */}
    <div className="text-center mb-8">
      <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-900">Fidele</h1>
      <p className="text-gray-500 mt-2">Your AI Health Companion</p>
    </div>

    {/* Form */}
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
          required
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          Password
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          required
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>

    {/* Signup Link */}
    <div className="text-center mt-6">
      <p className="text-gray-600">
        Don't have an account?{' '}
        <button
          onClick={() => setCurrentPage('signup')}
          className="text-blue-500 hover:text-blue-600 font-semibold"
        >
          Sign Up
        </button>
      </p>
    </div>
  </div>
</div>
Functionality

Validation:

Email format check
Password minimum 6 characters
Both fields required
Display inline error messages


API Integration:

javascript  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result.success) {
        setUser(result.data);
        setCurrentPage('starter');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

Page 2: Sign Up Page
Route/State: currentPage === 'signup'
Layout
Similar to Login page with additional fields
┌─────────────────────────────┐
│     FIDELE ❤️               │
│  Create Your Account        │
│                             │
│  ┌───────────────────────┐  │
│  │  Full Name            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Email                │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Password             │  │
│  │  ■■■■■■ Strong       │  │ (Strength indicator)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Confirm Password     │  │
│  └───────────────────────┘  │
│                             │
│  ☐ I agree to Terms         │
│                             │
│  ┌───────────────────────┐  │
│  │  CREATE ACCOUNT       │  │
│  └───────────────────────┘  │
│                             │
│  Already have account? Login│
└─────────────────────────────┘
Components
jsxconst SignUpPage = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Fidele</h1>
          <p className="text-gray-500 mt-2">Create Your Account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({...formData, password: e.target.value});
                setPasswordStrength(calculatePasswordStrength(e.target.value));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
            {/* Strength Indicator */}
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full ${
                    level <= passwordStrength ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {passwordStrength === 0 && 'Weak password'}
              {passwordStrength === 1 && 'Weak password'}
              {passwordStrength === 2 && 'Fair password'}
              {passwordStrength === 3 && 'Good password'}
              {passwordStrength === 4 && 'Strong password'}
            </p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Terms Checkbox */}
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" required />
            <span className="text-sm text-gray-600">
              I agree to the Terms of Service
            </span>
          </label>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
Validation Logic
javascriptconst handleSignup = async (e) => {
  e.preventDefault();
  setError('');

  // Client-side validation
  if (formData.name.trim().length < 2) {
    setError('Name must be at least 2 characters');
    return;
  }

  if (!formData.email.includes('@')) {
    setError('Please enter a valid email');
    return;
  }

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    const result = await registerUser(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      // Auto-login after registration
      setUser(result.data);
      setCurrentPage('starter');
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError('Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

Page 3: Starter Page (Dashboard)
Route/State: currentPage === 'starter'
Layout
┌─────────────────────────────────────────┐
│  FIDELE  ❤️              Hello, John!   │
│                              [Logout]   │
├─────────────────────────────────────────┤
│                                         │
│         Welcome to Fidele               │
│    Your Intelligent Health Assistant   │
│                                         │
│  ┌─────────────────┬─────────────────┐ │
│  │   💬            │   🏥            │ │
│  │                 │                 │ │
│  │ AI Health Chat  │ Find Care       │ │
│  │                 │                 │ │
│  │ Describe your   │ Get personalized│ │
│  │ symptoms and    │ doctor and      │ │
│  │ get instant     │ hospital        │ │
│  │ guidance        │ recommendations│ │
│  │                 │                 │ │
│  │ [Start Chatting]│ [Get Recommend] │ │
│  └─────────────────┴─────────────────┘ │
│                                         │
│  ⚠️  Disclaimer: Fidele provides health│
│  information, not medical diagnosis.    │
│  Always consult healthcare              │
│  professionals.                         │
│                                         │
└─────────────────────────────────────────┘
Components
jsxconst StarterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Fidele</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Hello, <strong>{user.name}</strong>!
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Fidele
          </h2>
          <p className="text-xl text-gray-600">
            Your intelligent health assistant powered by AI
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Chatbot */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              AI Health Chat
            </h3>
            <p className="text-gray-600 mb-6">
              Describe your symptoms and get instant health guidance powered by artificial intelligence.
            </p>
            <button
              onClick={() => setCurrentPage('chatbot')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              Start Chatting
            </button>
          </div>

          {/* Card 2: Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Find Care
            </h3>
            <p className="text-gray-600 mb-6">
              Get personalized doctor and hospital recommendations based on your location and health needs.
            </p>
            <button
              onClick={() => setCurrentPage('recommendations')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              Get Recommendations
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🩺</div>
            <h4 className="font-semibold text-gray-900 mb-2">Symptom Analysis</h4>
            <p className="text-sm text-gray-600">Quick assessment of symptoms with risk indicators</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">📍</div>
            <h4 className="font-semibold text-gray-900 mb-2">Local Hospitals</h4>
            <p className="text-sm text-gray-600">Find nearby healthcare facilities in seconds</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">👨‍⚕️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Doctor Recommendations</h4>
            <p className="text-sm text-gray-600">Connect with verified doctors on trusted platforms</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Important Disclaimer</h4>
              <p className="text-amber-800 text-sm">
                Fidele provides health information and guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for serious health concerns or emergencies.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
Functionality
javascriptconst handleLogout = () => {
  setUser(null);
  setCurrentPage('login');
  setMessages([]); // Clear chat
  setFormData({...formData, email: '', password: ''}); // Clear form
};

Page 4: Chatbot Page
Route/State: currentPage === 'chatbot'
Layout
┌─────────────────────────────────────────┐
│  ← Chat with Fidele        AI Ready    │
├─────────────────────────────────────────┤
│                                         │
│  [Bot] Hello! I'm Fidele...            │
│        ⚠️ This is not medical...       │
│                                         │
│  [User] I have a headache and fever    │
│                                         │
│  [Bot] I understand you're              │
│        experiencing...                  │
│        Risk: 🟡 MEDIUM                 │
│        [Record Vitals] Button           │
│                                         │
│  [User] Record my vitals               │
│                                         │
│  [Modal] BP: ___ / ___                 │
│         SpO₂: ___%                      │
│         HR: ___ bpm                     │
│         Temp: ___°F                     │
│         [Submit]                        │
│                                         │
│  [Bot] Based on vitals...               │
│                                         │
├─────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ Type your message...        [Send]│   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
Components
jsxconst ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Hello! I'm Fidele, your AI health assistant.\n\nPlease describe your symptoms or health concerns.\n\n⚠️ Disclaimer: This is not a medical diagnosis. Always consult a healthcare professional for serious concerns.`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitals, setVitals] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    spo2: '',
    heart_rate: '',
    temperature: ''
  });
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Analyze symptoms
  const analyzeSymptoms = (symptomText) => {
    const text = symptomText.toLowerCase();
    let riskLevel = 'LOW';
    let response = '';

    // Keyword-based analysis
    if (text.includes('chest pain') || text.includes('heart')) {
      riskLevel = 'HIGH';
      response = `
I understand you're experiencing chest pain or heart-related concerns. This requires immediate attention.

🔴 Risk Level: HIGH

Symptoms indicating cardiac concerns can be serious. 

⚡ URGENT RECOMMENDATIONS:
- Call emergency services (911) immediately if experiencing:
  - Severe chest pain
  - Difficulty breathing
  - Dizziness or loss of consciousness

Recommended Specialist: Cardiologist

[Get Hospital Recommendations] [Call Emergency]
      `;
      setRiskLevel('HIGH');
    } else if (text.includes('fever') && text.includes('headache')) {
      riskLevel = 'MEDIUM';
      response = `
I understand you're experiencing headache and fever. These symptoms commonly indicate:

- Common cold or flu
- Viral infection
- Dehydration

🟡 Risk Level: MEDIUM

RECOMMENDATIONS:
✓ Rest and stay hydrated
✓ Monitor your temperature
✓ Take over-the-counter pain relievers if needed
✓ Avoid heavy physical activity

Would you like to record your vital signs (BP, temperature, SpO₂) for a better assessment?

[Record Vital Signs] [Learn More]
      `;
      setRiskLevel('MEDIUM');
    } else if (text.includes('fever')) {
      riskLevel = 'MEDIUM';
      response = `
Fever can indicate various conditions. Let me help you understand better.

🟡 Risk Level: MEDIUM

IMPORTANT: Record your temperature for better assessment.

General fever management:
✓ Stay hydrated
✓ Monitor symptoms
✓ Rest adequately
✓ Use fever-reducing medication if needed

When to seek help:
⚠️ Contact a doctor if fever persists > 3 days
⚠️ Fever > 103°F requires medical attention

[Record Vital Signs]
      `;
      setRiskLevel('MEDIUM');
    } else if (text.includes('cough') && text.includes('shortness')) {
      riskLevel = 'HIGH';
      response = `
Cough with shortness of breath requires attention.

🔴 Risk Level: HIGH

Respiratory concerns can be serious.

Seek immediate care if:
🚨 Severe difficulty breathing
🚨 Chest pain with breathing
🚨 Blue lips or fingernails
🚨 Confusion or altered consciousness

Recommended Specialist: Pulmonologist

[Get Hospital Recommendations] [Call Emergency]
      `;
      setRiskLevel('HIGH');
    } else if (text.includes('cut') || text.includes('bruise')) {
      riskLevel = 'LOW';
      response = `
I understand you have a cut or bruise. Let me provide first aid guidance.

🟢 Risk Level: LOW

FIRST AID:
1. Wash the wound with clean water
2. Apply gentle pressure to stop bleeding
3. Apply antibiotic ointment
4. Cover with sterile bandage
5. Change bandage daily

Seek medical attention if:
⚠️ Bleeding doesn't stop after 10 minutes
⚠️ Wound is deep or gaping
⚠️ Signs of infection develop

Most minor wounds heal within 1-2 weeks.
      `;
      setRiskLevel('LOW');
    } else {
      response = `
Thank you for sharing your symptoms. Based on what you've told me, I'm analyzing your condition.

To provide better guidance, it would help to know:
- Duration of symptoms (hours/days)
- Other associated symptoms
- Any existing health conditions
- Current medications

Please provide more details, and I can give you a more accurate assessment.

Would you like to record your vital signs?

[Record Vital Signs]
      `;
      setRiskLevel('MEDIUM');
    }

    return { riskLevel, response };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const { riskLevel: level, response } = analyzeSymptoms(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response,
        timestamp: new Date(),
        riskLevel: level
      };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);

      // Auto-show recommendations for HIGH risk
      if (level === 'HIGH') {
        setTimeout(() => {
          setCurrentPage('recommendations');
        }, 3000);
      }
    }, 1000);
  };

  const handleVitalsSubmit = () => {
    // Check for concerning vitals
    let updated_risk = riskLevel;
    let warning = '';

    if (parseInt(vitals.bp_systolic) > 140 || parseInt(vitals.bp_diastolic) > 90) {
      updated_risk = 'HIGH';
      warning += '⚠️ High blood pressure detected. ';
    }
    if (parseInt(vitals.spo2) < 95) {
      updated_risk = 'HIGH';
      warning += '⚠️ Low oxygen saturation detected. ';
    }
    if (parseInt(vitals.heart_rate) > 100 || parseInt(vitals.heart_rate) < 60) {
      updated_risk = 'MEDIUM';
      warning += '⚠️ Abnormal heart rate detected. ';
    }
    if (parseFloat(vitals.temperature) > 100.4) {
      updated_risk = 'MEDIUM';
      warning += '⚠️ High fever detected. ';
    }

    const vitalsMessage = {
      id: messages.length + 1,
      type: 'bot',
      text: `
Vital Signs Recorded:
- BP: ${vitals.bp_systolic}/${vitals.bp_diastolic} mmHg
- SpO₂: ${vitals.spo2}%
- Heart Rate: ${vitals.heart_rate} bpm
- Temperature: ${vitals.temperature}°F

${warning ? warning + '\n' : ''}

${updated_risk === 'HIGH' ? 'Your vital signs indicate you should seek medical attention immediately.\n\n[Get Hospital Recommendations]' : 'Continue monitoring these vitals and seek care if symptoms worsen.'}
      `,
      riskLevel: updated_risk
    };

    setMessages(prev => [...prev, vitalsMessage]);
    setShowVitalsModal(false);
    setRiskLevel(updated_risk);

    if (updated_risk === 'HIGH') {
      setTimeout(() => setCurrentPage('recommendations'), 2000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('starter')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Chat with Fidele</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI Ready
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                {message.riskLevel && (
                  <div className="mt-2 pt-2 border-t border-gray-300 flex items-center gap-2">
                    <span className="text-xs font-semibold">Risk Level:</span>
                    {message.riskLevel === 'LOW' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        🟢 LOW
                      </span>
                    )}
                    {message.riskLevel === 'MEDIUM' && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        🟡 MEDIUM
                      </span>
                    )}
                    {message.riskLevel === 'HIGH' && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        🔴 HIGH
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" />
              </div>
              <p className="text-gray-500 italic self-center">Fidele is typing...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Vital Signs</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.bp_systolic}
                    onChange={(e) => setVitals({...vitals, bp_systolic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.bp_diastolic}
                    onChange={(e) => setVitals({...vitals, bp_diastolic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SpO₂ (%)
                </label>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="98"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={vitals.heart_rate}
                  onChange={(e) => setVitals({...vitals, heart_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="72"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="98.6"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVitalsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVitalsSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your symptoms or health concern..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={() => setShowVitalsModal(true)}
            className="px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-all text-sm"
            disabled={loading}
          >
            📊 Vitals
          </button>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

Page 5: Hospital & Doctor Recommendations
Route/State: currentPage === 'recommendations'
Layout
┌─────────────────────────────────────────┐
│  ← Find Healthcare Nearby              │
├─────────────────────────────────────────┤
│                                         │
│  🚨 URGENT: Seek immediate care        │ (if HIGH risk)
│                                         │
│  📍 Location Permission                 │
│  "Allow location access for results"   │
│  [Enable Location] [Use My City]        │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  Recommended Specialist:                │
│  ┌─────────────────────────────┐       │
│  │ Based on your symptoms,     │       │
│  │ consider consulting:        │       │
│  │                             │       │
│  │ 👨‍⚕️ CARDIOLOGIST            │       │
│  │                             │       │
│  │ Heart and cardiovascular    │       │
│  │ health specialist           │       │
│  └─────────────────────────────┘       │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  🏥 Hospitals Near You                  │
│                                         │
│  [GOOGLE MAPS EMBED]                    │
│                                         │
│  ┌─────────────────────────────┐       │
│  │ 🏥 City General Hospital    │       │
│  │ ⭐4.8 | 24/7 Emergency      │       │
│  │ 2.3 km away                 │       │
│  │ 123 Main St, City           │       │
│  │ (555) 123-4567              │       │
│  │ [Navigate] [Call]           │       │
│  └─────────────────────────────┘       │
│                                         │
│  ┌─────────────────────────────┐       │
│  │ 🏥 St. Mary's Medical Center│       │
│  │ ⭐4.5 | Trauma Center       │       │
│  │ 3.1 km away                 │       │
│  │ 456 Oak Ave, City           │       │
│  │ (555) 456-7890              │       │
│  │ [Navigate] [Call]           │       │
│  └─────────────────────────────┘       │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  👨‍⚕️ Find Doctors Online                │
│                                         │
│  ┌──────────────────┬──────────────────┐│
│  │ Practo           │ Lybrate          ││
│  │ Book appointments│ Online consults  ││
│  │ with verified    │ 24/7 available   ││
│  │ doctors          │                  ││
│  │ [View Doctors]   │ [View Doctors]   ││
│  └──────────────────┴──────────────────┘│
│                                         │
│  🚑 Emergency Hotline                   │
│  [Call 911]                             │
│                                         │
└─────────────────────────────────────────┘
Components
jsxconst RecommendationsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [riskLevel, setRiskLevel] = useState('MEDIUM');
  const [specialty, setSpecialty] = useState('General Physician');
  const mapRef = useRef(null);

  // Request geolocation
  const handleGetLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchNearbyHospitals(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access your location. Please enable location permission.');
        setLoading(false);
      }
    );
  };

  // Mock hospital data (in real app, use Google Places API)
  const fetchNearbyHospitals = async (lat, lng) => {
    // Simulated hospital data
    const mockHospitals = [
      {
        id: 1,
        name: 'City General Hospital',
        rating: 4.8,
        reviews: 2543,
        address: '123 Main Street, City',
        phone: '(555) 123-4567',
        distance: 2.3,
        type: '24/7 Emergency',
        latitude: lat + 0.02,
        longitude: lng + 0.02,
        specialties: ['Cardiology', 'Neurology', 'Emergency']
      },
      {
        id: 2,
        name: "St. Mary's Medical Center",
        rating: 4.5,
        reviews: 1876,
        address: '456 Oak Avenue, City',
        phone: '(555) 456-7890',
        distance: 3.1,
        type: 'Trauma Center',
        latitude: lat - 0.01,
        longitude: lng + 0.01,
        specialties: ['Trauma', 'Surgery', 'Cardiology']
      },
      {
        id: 3,
        name: 'Metropolitan Hospital',
        rating: 4.6,
        reviews: 2156,
        address: '789 Pine Road, City',
        phone: '(555) 789-0123',
        distance: 4.5,
        type: 'Multi-specialty',
        latitude: lat + 0.03,
        longitude: lng - 0.02,
        specialties: ['Cardiology', 'Pulmonology', 'Neurology']
      },
      {
        id: 4,
        name: 'Sunrise Medical Clinic',
        rating: 4.3,
        reviews: 987,
        address: '321 Elm Street, City',
        phone: '(555) 321-6543',
        distance: 1.8,
        type: '24/7 Clinic',
        latitude: lat - 0.02,
        longitude: lng - 0.01,
        specialties: ['General Practice', 'Minor Surgery']
      },
      {
        id: 5,
        name: 'Advanced Cardiac Center',
        rating: 4.9,
        reviews: 3421,
        address: '654 Birch Lane, City',
        phone: '(555) 654-9876',
        distance: 5.2,
        type: 'Specialty Center',
        latitude: lat + 0.01,
        longitude: lng - 0.03,
        specialties: ['Cardiology', 'Cardiac Surgery']
      }
    ];

    setHospitals(mockHospitals.sort((a, b) => a.distance - b.distance));
    setLoading(false);
    setMapLoaded(true);
  };

  const handleManualCity = () => {
    // Fallback for users who don't want to share location
    const city = prompt('Enter your city name:');
    if (city) {
      // In real app, use Google Geocoding API
      setUserLocation({ city: city });
      fetchNearbyHospitals(28.6139, 77.2090); // Default to Delhi as fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => setCurrentPage('starter')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Find Healthcare Nearby</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Emergency Banner (if HIGH risk) */}
        {riskLevel === 'HIGH' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 text-lg">⚠️ URGENT: Seek Immediate Care</h3>
                <p className="text-red-800 mt-1">
                  Your symptoms require immediate medical attention. Call 911 or visit the nearest emergency room.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location Permission */}
        {!userLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Enable Location</h3>
                <p className="text-gray-600 text-sm">Allow location access to find hospitals near you</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    Use My Location
                  </>
                )}
              </button>
              <button
                onClick={handleManualCity}
                className="px-6 py-2 border border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
              >
                Enter City Manually
              </button>
            </div>
          </div>
        )}

        {/* Specialty Recommendation */}
        {userLocation && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Specialist</h3>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">Based on your symptoms, consider consulting a:</p>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">👨‍⚕️</div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{specialty}</h4>
                    <p className="text-gray-600 mt-2">
                      Specialist in diagnosing and treating conditions related to your symptoms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps (Placeholder) */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospitals on Map</h3>
              <div ref={mapRef} className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                <p className="text-gray-500">Google Maps Integration - Shows nearby hospitals</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                In production, integrate Google Maps JavaScript API to show interactive map with hospital markers
              </p>
            </div>

            {/* Hospital List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospitals Near You</h3>
              <div className="space-y-4">
                {hospitals.length > 0 ? (
                  hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{hospital.name}</h4>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-yellow-500">
                              ⭐ {hospital.rating} ({hospital.reviews} reviews)
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                              {hospital.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{hospital.distance} km</p>
                        </div>
                      </div>

                      <div className="mb-4 text-gray-600 text-sm space-y-1">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {hospital.address}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {hospital.phone}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        Specialties: {hospital.specialties.join(', ')}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Open Google Maps with directions
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
                              '_blank'
                            );
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
                        >
                          <Navigation className="w-4 h-4" />
                          Navigate
                        </button>
                        <button
                          onClick={() => window.open(`tel:${hospital.phone}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Loading hospitals...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Platforms */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍⚕️ Find Doctors Online</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Practo */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-all">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Practo</h4>
                  <p className="text-gray-600 mb-4">
                    Book appointments with verified doctors and specialists. Read reviews, compare prices, and book online instantly.
                  </p>
                  
                    href="https://www.practo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
                  >
                    View Doctors on Practo
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Lybrate */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-all">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Lybrate</h4>
                  <p className="text-gray-600 mb-4">
                    Consult experienced doctors online 24/7. Video consultations, chat with doctors, and get prescriptions delivered.
                  </p>
                  
                    href="https://www.lybrate.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
                  >
                    View Doctors on Lybrate
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Action */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-red-900 mb-4">🚑 Emergency</h3>
              <p className="text-red-800 mb-6">If experiencing life-threatening symptoms, call emergency services immediately</p>
              <button
                onClick={() => window.location.href = 'tel:911'}
                className="px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-all"
              >
                CALL 911
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

🎨 Features & Functionality
Chatbot Intelligence
Symptom Analysis Keywords (Keyword-based approach):
SymptomsRisk LevelResponseActionChest pain, Heart palpitationsHIGHCardiac concern detectedAuto-navigate to hospitalsFever + HeadacheMEDIUMPossible flu/viralSuggest vitalsCough + Shortness of breathHIGHRespiratory issueAuto-navigate to hospitalsCut, BruiseLOWFirst aid guidanceNoneHeadache onlyLOW-MEDIUMMonitor, hydrationSuggest vitals if concerned
Risk Level System
🟢 LOW RISK:

Recommendation: Self-care, home remedies
Action: None required
Follow-up: Monitor symptoms

🟡 MEDIUM RISK:

Recommendation: Consider doctor visit if worsening
Action: Record vitals for better assessment
Follow-up: Contact healthcare provider

🔴 HIGH RISK:

Recommendation: Seek immediate medical attention
Action: Auto-navigate to hospital finder
Follow-up: Call emergency services if severe

Vital Signs Analysis
VitalNormal RangeConcerningActionBP90/60 - 120/80> 140/90⚠️ Risk ↑SpO₂≥ 95%< 95%🚨 Risk ↑Heart Rate60-100 bpm> 100 or < 60⚠️ Risk ↑Temperature98.6°F (37°C)> 100.4°F (38°C)⚠️ Risk ↑
Specialty Mapping
Based on symptoms, recommend:

Fever/Flu: General Physician
Chest Pain: Cardiologist
Cough/Breathing: Pulmonologist
Headache/Dizziness: Neurologist
Stomach Issues: Gastroenterologist
Skin Issues: Dermatologist
General: General Physician


🔧 Implementation Checklist
Phase 1: Setup & Configuration ✓

 Initialize React project with Vite/Create React App
 Install dependencies: Tailwind CSS, Lucide React
 Create .env file with API endpoints
 Setup Google Sheets + Apps Script
 Deploy Apps Script as Web App

Phase 2: Authentication (Pages 1-2)

 Build Login page UI
 Build Sign Up page UI
 Implement form validation
 Integrate Google Apps Script API
 Test login/signup flow
 Add error handling

Phase 3: Dashboard (Page 3)

 Build Starter page layout
 Add welcome message with user name
 Create feature cards
 Implement page routing
 Add logout functionality

Phase 4: Chatbot (Page 4)

 Build chat UI with message bubbles
 Implement message state management
 Create symptom analysis logic
 Add risk level indicators
 Build vitals input modal
 Implement auto-scroll
 Test all symptom keywords
 Add typing indicator

Phase 5: Hospital Finder (Page 5)

 Build hospital list UI
 Implement geolocation permission
 Integrate Google Places API (or mock data)
 Add specialty recommendation
 Create hospital cards
 Add navigation buttons
 Add doctor platform links
 Implement emergency call button

Phase 6: Polish & Testing

 Test responsive design (mobile/tablet/desktop)
 Add loading states everywhere
 Implement error boundaries
 Add smooth animations
 Test accessibility (keyboard, screen readers)
 Optimize performance
 Test on real devices
 Security audit
 Final UI polish


💻 Code Structure
fidele-app/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── StarterPage.jsx
│   │   ├── ChatbotPage.jsx
│   │   └── RecommendationsPage.jsx
│   ├── utils/
│   │   ├── api.js (Google Apps Script calls)
│   │   ├── symptomAnalyzer.js
│   │   └── validators.js
│   ├── styles/
│   │   ├── globals.css (Tailwind config)
│   │   └── animations.css
│   ├── App.jsx (Main component with routing)
│   └── index.jsx
├── public/
│   └── index.html
├── .env
├── tailwind.config.js
├── package.json
└── README.md

google-apps-script/
├── Code.gs (Main backend file)
├── appsscript.json (Config)
└── Deployed as Web App

🚀 Deployment & Testing
Frontend Deployment
Option 1: Vercel (Recommended)
bashnpm install -g vercel
vercel
Option 2: Netlify
bashnpm run build
# Upload `dist` folder to Netlify
Option 3: GitHub Pages
bashnpm run build
# Push to gh-pages branch
Backend Deployment
Google Apps Script is self-hosted - just deploy once and it's live.
Environment Variables
envREACT_APP_APPS_SCRIPT_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb...
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
REACT_APP_GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
Testing Checklist
Unit Tests:

 Validation functions
 Symptom analyzer
 Risk calculation logic

Integration Tests:

 API calls to Apps Script
 Authentication flow
 Page routing

Manual Tests:

 Full user signup flow
 Login with existing user
 Chat with various symptoms
 Vital signs recording
 Hospital finder
 Mobile responsiveness
 Error scenarios


⚠️ Important Reminders
Medical Disclaimer
Always display prominently on every health-related page:

⚠️ DISCLAIMER: Fidele provides health information and guidance only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for serious health concerns. In case of emergency, call 911 or your local emergency number immediately.

Data Privacy & Security

Never store sensitive health data in browser storage
Hash passwords server-side (using Google Apps Script)
Use HTTPS for all API communication
Comply with HIPAA regulations (if handling US patient data)
Clear user data on logout

Emergency Protocols

Always provide emergency call button
Direct users to 911 for life-threatening symptoms
Never delay emergency recommendations
Display disclaimers before every health assessment

API Keys

Store API keys in .env file
Don't commit to GitHub
Rotate keys regularly
Restrict API access by domain

Performance Optimization

Lazy load components
Optimize images
Minify CSS/JavaScript
Use service workers for offline support
Cache API responses


📚 Additional Resources
Documentation

React Docs
Tailwind CSS
Lucide Icons
Google Apps Script
Google Maps API
Google Places API

Useful Libraries

Authentication: Firebase (alternative to Google Apps Script)
AI: OpenAI API, Hugging Face (for advanced chatbot)
Maps: Mapbox GL JS (alternative to Google Maps)
State Management: Zustand, Redux
Form Handling: React Hook Form, Formik


🎉 Conclusion
Fidele is a comprehensive health assistant platform that combines AI-powered symptom analysis with practical healthcare facility discovery. By following this specification, you'll create a modern, user-friendly application that helps people access health information and connect with healthcare providers effectively.
Remember:

✅ Always prioritize user safety
✅ Test thoroughly on all devices
✅ Maintain clear medical disclaimers
✅ Focus on excellent UX
✅ Keep security as top priority