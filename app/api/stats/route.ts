import { NextResponse } from "next/server"
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION || "us-east-1"
const USERS_TABLE = process.env.DYNAMODB_TABLE_NAME || "HealthBotUsers"
const MEDICAL_TABLE = process.env.DYNAMODB_MEDICAL_TABLE_NAME || "HealthBotMedicalData"

let client: DynamoDBClient | null = null

// Initialize client if credentials are configured
if (
  AWS_ACCESS_KEY_ID && 
  AWS_ACCESS_KEY_ID !== "YOUR_AWS_ACCESS_KEY_ID" && 
  AWS_SECRET_ACCESS_KEY && 
  AWS_SECRET_ACCESS_KEY !== "YOUR_AWS_SECRET_ACCESS_KEY"
) {
  client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  })
}

function checkAWSConfig() {
  if (!client) {
    throw new Error(
      "AWS credentials not configured. Please set valid AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env or .env.local file."
    )
  }
}

export async function GET() {
  try {
    checkAWSConfig()

    // Get count of registered users
    const usersResult = await client!.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        Select: "COUNT",
      })
    )

    // Get count of medical records
    const medicalResult = await client!.send(
      new ScanCommand({
        TableName: MEDICAL_TABLE,
        Select: "COUNT",
      })
    )

    return NextResponse.json({
      success: true,
      message: "Platform statistics retrieved successfully",
      data: {
        totalUsers: usersResult.Count || 0,
        totalRecords: medicalResult.Count || 0,
      },
    })
  } catch (error: any) {
    console.error("GET /api/stats Error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error", data: null }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
