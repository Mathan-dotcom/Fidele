import { NextResponse } from "next/server"
import crypto from "crypto"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"

interface User {
  name: string
  email: string
  passwordHash: string
  userId: string
  timestamp: string
  lastLogin: string
}

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION || "us-east-1"
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "HealthBotUsers"

let docClient: DynamoDBDocumentClient | null = null

// Initialize client if credentials are configured
if (
  AWS_ACCESS_KEY_ID && 
  AWS_ACCESS_KEY_ID !== "YOUR_AWS_ACCESS_KEY_ID" && 
  AWS_SECRET_ACCESS_KEY && 
  AWS_SECRET_ACCESS_KEY !== "YOUR_AWS_SECRET_ACCESS_KEY"
) {
  const client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  })
  docClient = DynamoDBDocumentClient.from(client)
}

function checkAWSConfig() {
  if (!docClient) {
    throw new Error(
      "AWS credentials not configured. Please set valid AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env or .env.local file."
    )
  }
}

// Get user by email
async function getUserByEmail(email: string): Promise<User | null> {
  checkAWSConfig()
  const emailLower = email.toLowerCase()
  try {
    const response = await docClient!.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { email: emailLower },
      })
    )
    return (response.Item as User) || null
  } catch (error: any) {
    console.error("DynamoDB GetItem error:", error)
    if (error.name === "ResourceNotFoundException") {
      throw new Error(`DynamoDB table "${TABLE_NAME}" does not exist. Please create it in the AWS console first.`)
    }
    throw error
  }
}

// Save user to DynamoDB
async function saveUser(user: User): Promise<void> {
  checkAWSConfig()
  try {
    await docClient!.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: user,
      })
    )
  } catch (error: any) {
    console.error("DynamoDB PutItem error:", error)
    if (error.name === "ResourceNotFoundException") {
      throw new Error(`DynamoDB table "${TABLE_NAME}" does not exist. Please create it in the AWS console first.`)
    }
    throw error
  }
}

// Hash password with SHA-256
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, name, email, password } = body

    if (!action) {
      return NextResponse.json({ success: false, message: "Action is required", data: null }, { status: 400 })
    }

    // Verify config before running operation
    checkAWSConfig()

    if (action === "register") {
      if (!name || !email || !password) {
        return NextResponse.json({ success: false, message: "All fields are required", data: null }, { status: 400 })
      }

      if (password.length < 6) {
        return NextResponse.json({ success: false, message: "Password must be at least 6 characters", data: null }, { status: 400 })
      }

      const emailLower = email.toLowerCase()
      const existingUser = await getUserByEmail(emailLower)

      if (existingUser) {
        return NextResponse.json({ success: false, message: "Email already registered", data: null }, { status: 400 })
      }

      const passwordHash = hashPassword(password)
      const userId = crypto.randomUUID()
      const timestamp = new Date().toISOString()

      const newUser: User = {
        name,
        email: emailLower,
        passwordHash,
        userId,
        timestamp,
        lastLogin: timestamp,
      }

      await saveUser(newUser)

      return NextResponse.json({
        success: true,
        message: "Registration successful",
        data: {
          userId,
          name,
          email: emailLower,
        },
      })
    } else if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ success: false, message: "Email and password required", data: null }, { status: 400 })
      }

      const emailLower = email.toLowerCase()
      const user = await getUserByEmail(emailLower)

      if (!user) {
        return NextResponse.json({ success: false, message: "User not found", data: null }, { status: 400 })
      }

      const passwordHash = hashPassword(password)

      if (user.passwordHash !== passwordHash) {
        return NextResponse.json({ success: false, message: "Invalid password", data: null }, { status: 401 })
      }

      // Update last login
      const updatedUser: User = {
        ...user,
        lastLogin: new Date().toISOString(),
      }
      await saveUser(updatedUser)

      return NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          userId: user.userId,
          name: user.name,
          email: user.email,
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid action", data: null }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Auth API Error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error", data: null }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
