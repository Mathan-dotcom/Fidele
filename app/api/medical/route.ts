import { NextResponse } from "next/server"
import crypto from "crypto"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION || "us-east-1"
const TABLE_NAME = process.env.DYNAMODB_MEDICAL_TABLE_NAME || "HealthBotMedicalData"

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Email parameter is required", data: null }, { status: 400 })
    }

    checkAWSConfig()
    const emailLower = email.toLowerCase()

    const response = await docClient!.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": emailLower,
        },
      })
    )

    // Sort items by timestamp descending so the newest records appear first
    const items = (response.Items || []).sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      success: true,
      message: "Medical records retrieved successfully",
      data: items,
    })
  } catch (error: any) {
    console.error("GET /api/medical Error:", error)
    if (error.name === "ResourceNotFoundException") {
      return NextResponse.json(
        {
          success: false,
          message: `DynamoDB table "${TABLE_NAME}" does not exist. Please create it in the AWS console.`,
          data: null,
        },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: false, message: error.message || "Server error", data: null }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      age, 
      gender, 
      bloodType, 
      allergies, 
      conditions, 
      medications,
      weight,
      systolic,
      diastolic,
      heartRate,
      temperature
    } = body

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required", data: null }, { status: 400 })
    }

    checkAWSConfig()
    const emailLower = email.toLowerCase()

    const medicalId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    const newRecord = {
      email: emailLower,
      medicalId,
      timestamp,
      age: age || "N/A",
      gender: gender || "N/A",
      bloodType: bloodType || "N/A",
      allergies: allergies || "N/A",
      conditions: conditions || "N/A",
      medications: medications || "N/A",
      weight: weight || "N/A",
      systolic: systolic ? Number(systolic) : null,
      diastolic: diastolic ? Number(diastolic) : null,
      heartRate: heartRate ? Number(heartRate) : null,
      temperature: temperature ? Number(temperature) : null,
    }

    await docClient!.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newRecord,
      })
    )

    return NextResponse.json({
      success: true,
      message: "Medical record saved successfully",
      data: newRecord,
    })
  } catch (error: any) {
    console.error("POST /api/medical Error:", error)
    if (error.name === "ResourceNotFoundException") {
      return NextResponse.json(
        {
          success: false,
          message: `DynamoDB table "${TABLE_NAME}" does not exist. Please create it in the AWS console.`,
          data: null,
        },
        { status: 500 }
      )
    }
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
