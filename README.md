# Fidele: Clinical-Grade AI Health Assistant

Fidele is an intelligent, high-fidelity medical health companion built on Next.js. It integrates advanced AI symptom assessment, local hospital/care facility navigation, and live clinical-grade biometric history tracking.

---

## 🌟 Key Features

1. **AI Health Chatbot**: Natural language symptom assessment powered by Google Gemini, recommending specialist doctors based on risk levels.
2. **Find Care Network**: High-accuracy geolocation radar identifying local hospitals, clinic types, ratings, and navigation options. Includes doctor appointment portals (Practo/Lybrate) and emergency hotlines (`108`).
3. **Biometric Dashboard**: Displays live global statistics (**Active Members** and **Clinical Files Filed**) loaded dynamically from AWS DynamoDB.
4. **Clinical Profile Snapshots**: Securely stores personal patient info (allergies, chronic conditions, medications) and numeric vitals (Heart Rate, blood pressure, weight, body temperature).
5. **Recharts Vital Trends**: Dynamically plots historical health metrics chronologically on an interactive line graph to observe bio-trends across snapshots.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Styling**: Tailwind CSS
- **Visualisations**: Recharts (Responsive Line Charts)
- **Database**: AWS DynamoDB (utilizing `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`)
- **AI Triage**: Google Gemini API

---

## 🗄️ Database Schema & Configuration

All environment configurations are defined in `.env.local`.

### 1. DynamoDB Tables

#### **`HealthBotUsers`** (User Authentication Table)
- **Partition Key**: `email` (String, lowercase)
- **Attributes**:
  - `name`: User's full name (String)
  - `passwordHash`: SHA-256 password hash (String)
  - `userId`: UUID identifier (String)
  - `timestamp`: Registration ISO timestamp (String)
  - `lastLogin`: Last active session timestamp (String)

#### **`HealthBotMedicalData`** (Clinical Snapshots Table)
- **Partition Key**: `email` (String, lowercase)
- **Sort Key**: `medicalId` (String, UUID)
- **Attributes**:
  - `timestamp`: Record creation timestamp (String, ISO format)
  - `age`: Patient age (String)
  - `gender`: Patient gender (String)
  - `bloodType`: ABO/Rh blood group (String)
  - `allergies`: Known medication/food allergies (String)
  - `conditions`: Chronic medical conditions (String)
  - `medications`: Active drug therapies (String)
  - `weight`: Patient body weight (String)
  - `heartRate`: Beats per minute (Number / Null)
  - `systolic`: Systolic blood pressure in mmHg (Number / Null)
  - `diastolic`: Diastolic blood pressure in mmHg (Number / Null)
  - `temperature`: Body temperature in °F (Number / Null)

---

## ⚡ Setup and Seeding

### 1. Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory:
```env
# Gemini AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# AWS Configuration
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=eu-north-1
DYNAMODB_TABLE_NAME=HealthBotUsers
DYNAMODB_MEDICAL_TABLE_NAME=HealthBotMedicalData
```

### 2. Populate Mock Clinical Data
We have provided a seeder script to populate your DynamoDB tables with **100 dummy users** (e.g. `james.smith57@google.com`) and **200 clinical vital history records** (2 snapshots per user to feed charts).

Run the seeder with:
```bash
node scripts/seed.js
```
*Note: All seeded users use the password `password123`.*

---

## 🚀 Running the App

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build
To build and optimize the bundle:
```bash
npm run build
```
