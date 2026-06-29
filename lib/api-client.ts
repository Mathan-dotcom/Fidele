// API URL for Google Apps Script, falling back to local Next.js API route if not set
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
const LOCAL_API_URL = "/api/auth"

interface APIResponse<T = any> {
  success: boolean
  message: string
  data: T | null
}

/**
 * Call the authentication backend API
 */
async function callAPI<T = any>(action: string, payload: Record<string, any>): Promise<APIResponse<T>> {
  // If the Google Apps Script URL is set, we call it; otherwise we fall back to the local Next.js API
  const url = APPS_SCRIPT_URL || LOCAL_API_URL

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // When calling local Next.js API or Google Apps Script, we pass action in body
      body: JSON.stringify({
        action,
        ...payload,
      }),
      // Apps Script web apps usually perform redirects (status 302), fetch follows redirects automatically
      redirect: "follow",
    })

    if (!response.ok) {
      try {
        const errorData = await response.json()
        if (errorData && errorData.message) {
          throw new Error(errorData.message)
        }
      } catch (e) {
        // Fallback if response is not JSON or does not have a message
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result as APIResponse<T>
  } catch (error: any) {
    console.error("API call error:", error)
    return {
      success: false,
      message: error.message || "Connection failed. Please check your network and try again.",
      data: null,
    }
  }
}

/**
 * Register a new user
 */
export async function registerUser(name: string, email: string, password: string): Promise<APIResponse> {
  return callAPI("register", { name, email, password })
}

/**
 * Log in an existing user
 */
export async function loginUser(email: string, password: string): Promise<APIResponse> {
  return callAPI("login", { email, password })
}

/**
 * Fetch all medical records for a user
 */
export async function getMedicalRecords(email: string): Promise<APIResponse> {
  try {
    const response = await fetch(`/api/medical?email=${encodeURIComponent(email)}`)
    if (!response.ok) {
      try {
        const errorData = await response.json()
        if (errorData && errorData.message) {
          throw new Error(errorData.message)
        }
      } catch (e) {}
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result as APIResponse
  } catch (error: any) {
    console.error("getMedicalRecords error:", error)
    return {
      success: false,
      message: error.message || "Failed to retrieve medical records.",
      data: null,
    }
  }
}

/**
 * Save a new medical record for a user
 */
export async function addMedicalRecord(
  email: string,
  record: {
    age?: string
    gender?: string
    bloodType?: string
    allergies?: string
    conditions?: string
    medications?: string
    weight?: string
    systolic?: string
    diastolic?: string
    heartRate?: string
    temperature?: string
  }
): Promise<APIResponse> {
  try {
    const response = await fetch(`/api/medical`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        ...record,
      }),
    })
    if (!response.ok) {
      try {
        const errorData = await response.json()
        if (errorData && errorData.message) {
          throw new Error(errorData.message)
        }
      } catch (e) {}
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result as APIResponse
  } catch (error: any) {
    console.error("addMedicalRecord error:", error)
    return {
      success: false,
      message: error.message || "Failed to save medical record.",
      data: null,
    }
  }
}

/**
 * Fetch platform stats
 */
export async function getPlatformStats(): Promise<APIResponse<{ totalUsers: number; totalRecords: number }>> {
  try {
    const response = await fetch(`/api/stats`)
    if (!response.ok) {
      try {
        const errorData = await response.json()
        if (errorData && errorData.message) {
          throw new Error(errorData.message)
        }
      } catch (e) {}
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    return result as APIResponse<{ totalUsers: number; totalRecords: number }>
  } catch (error: any) {
    console.error("getPlatformStats error:", error)
    return {
      success: false,
      message: error.message || "Failed to retrieve platform stats.",
      data: null,
    }
  }
}
