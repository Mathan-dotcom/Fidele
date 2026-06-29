import { NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const SYSTEM_INSTRUCTION = `You are Fidele, an intelligent, empathetic, and professional AI-powered health assistant.
Your goal is to help users understand their symptoms and provide initial clinical triage advice in a clear, concise, and helpful markdown format.
Always include a clear disclaimer stating that this is not a formal medical diagnosis and they should consult a healthcare professional for serious concerns.

At the very end of your response, you MUST append a single JSON block on its own line containing the risk classification and recommended specialist. Use EXACTLY this format:
{"riskLevel": "LOW" | "MEDIUM" | "HIGH", "specialty": "Specialist Name"}

Available specialties include: General Physician, Cardiologist, Pulmonologist, Neurologist, Dermatologist, Orthopedist, Gastroenterologist, Pediatrician, Psychiatrist, ENT Specialist, etc.

Example of the end of your message:
Please rest well and stay hydrated.
{"riskLevel": "LOW", "specialty": "General Physician"}

Keep the JSON on its own single line at the absolute end of the response. DO NOT wrap the JSON in code block markers (like \`\`\`json). Just write the raw JSON line.`

// Rule-based fallback if API key is not set
function getFallbackResponse(symptomText: string) {
  const text = symptomText.toLowerCase()
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW"
  let responseText = ""
  let specialty = "General Physician"

  if (text.includes("chest pain") || text.includes("heart")) {
    riskLevel = "HIGH"
    specialty = "Cardiologist"
    responseText = `I understand you're experiencing chest pain or heart-related concerns. This requires immediate medical attention.

🔴 Risk Level: HIGH

Symptoms indicating cardiac concerns can be extremely serious. 

⚡ URGENT RECOMMENDATIONS:
- Call emergency services (911) immediately if experiencing severe chest pain, difficulty breathing, or dizziness.
- Do not drive yourself to the emergency room.

Disclaimer: This is not a medical diagnosis. Always consult a healthcare professional immediately.`
  } else if (text.includes("fever") && text.includes("headache")) {
    riskLevel = "MEDIUM"
    specialty = "General Physician"
    responseText = `I understand you're experiencing headache and fever. These symptoms commonly indicate:
- Common cold or flu
- Viral infection
- Mild dehydration

🟡 Risk Level: MEDIUM

RECOMMENDATIONS:
✓ Rest and stay hydrated
✓ Monitor your temperature
✓ Take over-the-counter pain relievers if needed (e.g. acetaminophen/ibuprofen)
✓ Avoid heavy physical activity

Disclaimer: This is not a medical diagnosis. Consult a doctor if symptoms persist.`
  } else if (text.includes("cough") && text.includes("shortness")) {
    riskLevel = "HIGH"
    specialty = "Pulmonologist"
    responseText = `Cough with shortness of breath requires immediate clinical evaluation.

🔴 Risk Level: HIGH

Respiratory concerns can progress rapidly. Seek immediate emergency care if you have severe difficulty breathing, blue lips, or chest pressure.

Disclaimer: This is not a medical diagnosis. Seek medical attention immediately.`
  } else {
    riskLevel = "MEDIUM"
    specialty = "General Physician"
    responseText = `Thank you for sharing your concerns. Based on the symptoms described, this appears to be of moderate risk.

🟡 Risk Level: MEDIUM

Please continue to monitor your symptoms closely. Ensure you rest and keep hydrated. If you experience severe symptoms like shortness of breath or persistent chest discomfort, seek professional care.

Disclaimer: This is not a medical diagnosis. Consult a doctor for any persistent symptoms.`
  }

  return { text: responseText, riskLevel, specialty }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 })
    }

    // Get the last user message to use for the fallback analysis
    const lastUserMessage = [...messages].reverse().find((m) => m.type === "user")?.text || ""

    // Detect if key is Groq or Gemini
    const apiKey = process.env.GROQ_API_KEY || GEMINI_API_KEY
    const isGroq = apiKey?.startsWith("gsk_")

    if (!apiKey) {
      console.warn("No AI API key found. Falling back to local symptom analyzer.")
      const fallback = getFallbackResponse(lastUserMessage)
      return NextResponse.json(fallback)
    }

    let rawText = ""

    if (isGroq) {
      console.log("Routing request to Groq API (model: llama-3.3-70b-versatile)...")
      const groqMessages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...messages.map((msg: any) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text,
        }))
      ]

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          temperature: 0.2,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Groq API Error:", errorText)
        throw new Error(`Groq API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      rawText = data.choices?.[0]?.message?.content || ""
    } else {
      console.log("Routing request to Gemini API (model: gemini-2.0-flash-lite)...")
      // Map history to Gemini's format: user -> user, bot -> model
      const contents = messages.map((msg: any) => {
        return {
          role: msg.type === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }
      })

      // Prepend system instructions to the first user message
      if (contents.length > 0) {
        const firstUserMsgIndex = contents.findIndex((c: any) => c.role === "user")
        if (firstUserMsgIndex !== -1) {
          contents[firstUserMsgIndex].parts[0].text = `${SYSTEM_INSTRUCTION}\n\nUser Input: ${contents[firstUserMsgIndex].parts[0].text}`
        }
      }

      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Gemini API Error:", errorText)
        throw new Error(`Gemini API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    }

    if (!rawText) {
      throw new Error("Empty response received from AI model")
    }

    // Parse the response to extract the JSON block at the end
    let cleanText = rawText.trim()
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM"
    let specialty = "General Physician"

    // Search for a JSON-like structure at the end of the text
    const jsonMatch = cleanText.match(/\{"riskLevel"\s*:\s*"[^"]+",\s*"specialty"\s*:\s*"[^"]+"\}/)
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        riskLevel = parsed.riskLevel || "MEDIUM"
        specialty = parsed.specialty || "General Physician"
        // Strip the JSON string from the clean text
        cleanText = cleanText.replace(jsonMatch[0], "").trim()
      } catch (e) {
        console.error("Failed to parse matched JSON block:", e)
      }
    } else {
      // Fallback regex scan in case spacing/formatting was slightly different
      const lines = cleanText.split("\n")
      const lastLine = lines[lines.length - 1].trim()
      if (lastLine.startsWith("{") && lastLine.endsWith("}")) {
        try {
          const parsed = JSON.parse(lastLine)
          riskLevel = parsed.riskLevel || "MEDIUM"
          specialty = parsed.specialty || "General Physician"
          cleanText = lines.slice(0, -1).join("\n").trim()
        } catch (e) {
          console.error("Failed to parse final line JSON:", e)
        }
      }
    }

    // Validate parsed riskLevel values
    if (!["LOW", "MEDIUM", "HIGH"].includes(riskLevel)) {
      riskLevel = "MEDIUM"
    }

    return NextResponse.json({
      text: cleanText,
      riskLevel,
      specialty,
    })
  } catch (error: any) {
    console.error("Error in chat route:", error)
    // Return standard error response
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
