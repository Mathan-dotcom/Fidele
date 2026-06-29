const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// 1. Read environment variables from .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^["']|["']$)/g, '');
      process.env[key] = val;
    }
  });
}

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "eu-north-1";
const USERS_TABLE = process.env.DYNAMODB_TABLE_NAME || "HealthBotUsers";
const MEDICAL_TABLE = process.env.DYNAMODB_MEDICAL_TABLE_NAME || "HealthBotMedicalData";

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error("Error: AWS credentials are not set in .env.local!");
  process.exit(1);
}

// 2. Initialize AWS DynamoDB Document Client
const client = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

// 3. Helper to hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// 4. Random generator helpers
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const bloodTypes = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const genders = ["Male", "Female", "Non-binary"];
const allergyOptions = ["None", "Penicillin", "Peanuts", "Pollen", "Sulfa drugs", "Aspirin"];
const conditionOptions = ["None", "Hypertension", "Asthma", "Diabetes Type 2", "Migraine", "High Cholesterol"];
const medicationOptions = ["None", "Lisinopril", "Albuterol inhaler", "Metformin", "Atorvastatin", "Amlodipine"];

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloatBetween = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

async function seed() {
  console.log(`Starting database seed using region ${AWS_REGION}...`);
  console.log(`Writing to tables:\n - Users: ${USERS_TABLE}\n - Medical: ${MEDICAL_TABLE}\n`);

  const totalUsers = 100;
  const hashPass = hashPassword("password123");

  // Seed a static known demo user
  const staticDemoUser = {
    email: "demo.user@google.com",
    name: "Demo User",
    passwordHash: hashPass,
    userId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  try {
    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: staticDemoUser }));
    
    const medicalRecord1 = {
      email: "demo.user@google.com",
      medicalId: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 48*60*60*1000).toISOString(),
      age: "30",
      gender: "Male",
      bloodType: "O+",
      allergies: "None",
      conditions: "Asthma",
      medications: "Albuterol inhaler",
      weight: "75 kg",
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      temperature: 98.6,
    };

    const medicalRecord2 = {
      email: "demo.user@google.com",
      medicalId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      age: "30",
      gender: "Male",
      bloodType: "O+",
      allergies: "None",
      conditions: "Asthma",
      medications: "Albuterol inhaler",
      weight: "74 kg",
      systolic: 118,
      diastolic: 78,
      heartRate: 68,
      temperature: 98.4,
    };

    await docClient.send(new PutCommand({ TableName: MEDICAL_TABLE, Item: medicalRecord1 }));
    await docClient.send(new PutCommand({ TableName: MEDICAL_TABLE, Item: medicalRecord2 }));
    console.log("Seeded static demo user: demo.user@google.com");
  } catch (err) {
    console.error("Failed seeding static user:", err);
  }

  for (let i = 1; i <= totalUsers; i++) {
    const fName = randItem(firstNames);
    const lName = randItem(lastNames);
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@google.com`;
    const userId = crypto.randomUUID();
    
    // Timestamp for registration (between 10 days ago and 2 days ago)
    const registerDaysAgo = randBetween(2, 10);
    const registerDate = new Date();
    registerDate.setDate(registerDate.getDate() - registerDaysAgo);
    const timestampStr = registerDate.toISOString();

    const userObj = {
      email,
      name,
      passwordHash: hashPass,
      userId,
      timestamp: timestampStr,
      lastLogin: timestampStr,
    };

    try {
      // Seed user record
      await docClient.send(new PutCommand({
        TableName: USERS_TABLE,
        Item: userObj,
      }));

      // Generate 2 medical snapshots (entries) per user to feed charts
      const entry1Date = new Date(registerDate);
      entry1Date.setHours(entry1Date.getHours() + 1); // shortly after registration
      
      const entry2Date = new Date(); // today
      entry2Date.setHours(entry2Date.getHours() - randBetween(1, 12));

      const ageVal = String(randBetween(20, 75));
      const genderVal = randItem(genders);
      const bloodVal = randItem(bloodTypes);
      const allergyVal = randItem(allergyOptions);
      const conditionVal = randItem(conditionOptions);
      const medVal = randItem(medicationOptions);
      const baseWeight = randBetween(55, 95);

      // Snapshot 1 (Older entry)
      const medicalRecord1 = {
        email,
        medicalId: crypto.randomUUID(),
        timestamp: entry1Date.toISOString(),
        age: ageVal,
        gender: genderVal,
        bloodType: bloodVal,
        allergies: allergyVal,
        conditions: conditionVal,
        medications: medVal,
        weight: `${baseWeight} kg`,
        systolic: randBetween(115, 135),
        diastolic: randBetween(75, 88),
        heartRate: randBetween(65, 85),
        temperature: randFloatBetween(98.0, 99.1),
      };

      // Snapshot 2 (Newer entry - varying vitals slightly)
      const weightDiff = randBetween(-2, 2);
      const medicalRecord2 = {
        email,
        medicalId: crypto.randomUUID(),
        timestamp: entry2Date.toISOString(),
        age: ageVal,
        gender: genderVal,
        bloodType: bloodVal,
        allergies: allergyVal,
        conditions: conditionVal,
        medications: medVal,
        weight: `${baseWeight + weightDiff} kg`,
        systolic: randBetween(110, 130),
        diastolic: randBetween(70, 85),
        heartRate: randBetween(60, 90),
        temperature: randFloatBetween(97.8, 98.9),
      };

      await docClient.send(new PutCommand({ TableName: MEDICAL_TABLE, Item: medicalRecord1 }));
      await docClient.send(new PutCommand({ TableName: MEDICAL_TABLE, Item: medicalRecord2 }));

      if (i % 10 === 0) {
        console.log(`Progress: Seeded ${i}/${totalUsers} users and ${i * 2} medical records...`);
      }
    } catch (err) {
      console.error(`Failed seeding user ${email}:`, err);
    }
  }

  console.log("\nSuccess! Seeding of 100 users and 200 medical entries complete.");
  console.log("All dummy users have password set to 'password123'.");
}

seed();
