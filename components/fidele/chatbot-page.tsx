"use client"

import { useState, useRef, useEffect } from "react"
import { Send, AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react"

interface Message {
  id: number
  type: "user" | "bot"
  text: string
  timestamp: Date
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
}

interface ChatbotPageProps {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onNavigate: (page: string) => void
  onRiskUpdate: (risk: "LOW" | "MEDIUM" | "HIGH", specialty: string) => void
}

export function ChatbotPage({ messages, setMessages, onNavigate, onRiskUpdate }: ChatbotPageProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showVitalsModal, setShowVitalsModal] = useState(false)
  const [vitals, setVitals] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    spo2: "",
    heart_rate: "",
    temperature: "",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Get current risk level from latest messages
  const getCurrentRiskLevel = (): "LOW" | "MEDIUM" | "HIGH" => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].riskLevel) return messages[i].riskLevel!
    }
    return "LOW"
  };

  const analyzeSymptoms = (symptomText: string) => {
    const text = symptomText.toLowerCase()
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW"
    let response = ""
    let specialty = "General Physician"

    // Keyword-based analysis
    if (text.includes("chest pain") || text.includes("heart")) {
      riskLevel = "HIGH"
      specialty = "Cardiologist"
      response = `I understand you're experiencing chest pain or heart-related concerns. This requires immediate medical attention.

🔴 Risk Level: HIGH

Symptoms indicating cardiac concerns can be extremely serious. 

⚡ URGENT RECOMMENDATIONS:
- Call emergency services (911) immediately if experiencing severe chest pain, difficulty breathing, or dizziness.
- Do not drive yourself to the emergency room.

Recommended Specialist: Cardiologist

I will automatically redirect you to the Hospital recommendations finder now.`
    } else if (text.includes("fever") && text.includes("headache")) {
      riskLevel = "MEDIUM"
      specialty = "General Physician"
      response = `I understand you're experiencing headache and fever. These symptoms commonly indicate:
- Common cold or flu
- Viral infection
- Mild dehydration

🟡 Risk Level: MEDIUM

RECOMMENDATIONS:
✓ Rest and stay hydrated
✓ Monitor your temperature
✓ Take over-the-counter pain relievers if needed (e.g. acetaminophen/ibuprofen)
✓ Avoid heavy physical activity

Would you like to record your vital signs (BP, temperature, SpO₂) using the Vitals panel for a better assessment?`
    } else if (text.includes("fever")) {
      riskLevel = "MEDIUM"
      specialty = "General Physician"
      response = `Fever can indicate various conditions. Let me help you understand better.

🟡 Risk Level: MEDIUM

IMPORTANT: Record your temperature using the vitals tracker for better assessment.

General fever management:
✓ Stay hydrated with fluids
✓ Monitor other symptoms
✓ Rest adequately
✓ Use fever-reducing medication if needed

When to seek help:
⚠️ Contact a doctor if fever persists > 3 days
⚠️ Fever > 103°F requires immediate medical attention`
    } else if (text.includes("cough") && text.includes("shortness")) {
      riskLevel = "HIGH"
      specialty = "Pulmonologist"
      response = `Cough with shortness of breath requires immediate clinical evaluation.

🔴 Risk Level: HIGH

Respiratory concerns can progress rapidly.

Seek immediate emergency care if:
🚨 Severe difficulty breathing
🚨 Chest pain with breathing
🚨 Blue lips or fingernails
🚨 Confusion or altered consciousness

Recommended Specialist: Pulmonologist

I will automatically redirect you to the Hospital finder now.`
    } else if (text.includes("headache")) {
      riskLevel = "MEDIUM"
      specialty = "Neurologist"
      response = `I understand you're experiencing a headache. 

🟡 Risk Level: MEDIUM

TIPS FOR RELIEF:
✓ Sit or lie down in a quiet, dark room
✓ Apply a cold compress to your forehead
✓ Stay hydrated (dehydration is a common cause)
✓ Monitor if the headache worsens or is accompanied by other symptoms

Recommended Specialist: Neurologist (if chronic or severe)`
    } else if (text.includes("cut") || text.includes("bruise")) {
      riskLevel = "LOW"
      specialty = "General Physician"
      response = `I understand you have a minor cut or bruise. Let me provide first aid guidance.

🟢 Risk Level: LOW

FIRST AID:
1. Wash the wound with clean water and soap.
2. Apply gentle pressure with a clean cloth to stop bleeding.
3. Apply antibiotic ointment.
4. Cover with a sterile bandage.
5. Change the bandage daily.

Seek medical attention if:
⚠️ Bleeding doesn't stop after 10 minutes of direct pressure
⚠️ The wound is deep, gaping, or exposes muscle/bone
⚠️ Signs of infection develop (redness, pus, swelling)`
    } else {
      riskLevel = "MEDIUM"
      specialty = "General Physician"
      response = `Thank you for sharing your symptoms. Based on what you've told me, I am analyzing your condition.

To provide better guidance, it would help to know:
- Duration of symptoms (hours/days)
- Other associated symptoms (nausea, fatigue, etc.)
- Any existing health conditions

Please enter more details, and you can also record your vital signs (BP, SpO₂, temperature) for a better assessment.`
    }

    return { riskLevel, response, specialty }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      text: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            type: m.type,
            text: m.text
          }))
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to communicate with AI endpoint")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        text: data.text,
        timestamp: new Date(),
        riskLevel: data.riskLevel,
      }

      setMessages((prev) => [...prev, botMessage])
      onRiskUpdate(data.riskLevel, data.specialty)

      if (data.riskLevel === "HIGH") {
        setTimeout(() => {
          onNavigate("recommendations")
        }, 3000)
      }
    } catch (err) {
      console.error("AI chatbot API query failed. Running offline fallback.", err)
      const { riskLevel, response: fallbackText, specialty } = analyzeSymptoms(currentInput)

      const botMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        text: `⚠️ [API Offline Mode]\n\n${fallbackText}`,
        timestamp: new Date(),
        riskLevel,
      }

      setMessages((prev) => [...prev, botMessage])
      onRiskUpdate(riskLevel, specialty)

      if (riskLevel === "HIGH") {
        setTimeout(() => {
          onNavigate("recommendations")
        }, 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check for concerning vitals
    let updatedRisk: "LOW" | "MEDIUM" | "HIGH" = getCurrentRiskLevel()
    let warnings: string[] = []

    const sys = parseInt(vitals.bp_systolic)
    const dia = parseInt(vitals.bp_diastolic)
    const ox = parseInt(vitals.spo2)
    const hr = parseInt(vitals.heart_rate)
    const temp = parseFloat(vitals.temperature)

    if (sys > 140 || dia > 90) {
      updatedRisk = "HIGH"
      warnings.push("⚠️ High blood pressure detected.")
    }
    if (ox > 0 && ox < 95) {
      updatedRisk = "HIGH"
      warnings.push("⚠️ Low oxygen saturation detected.")
    }
    if (hr > 100 || (hr > 0 && hr < 60)) {
      if (updatedRisk !== "HIGH") updatedRisk = "MEDIUM"
      warnings.push("⚠️ Abnormal heart rate detected.")
    }
    if (temp > 100.4) {
      if (updatedRisk !== "HIGH") updatedRisk = "MEDIUM"
      warnings.push("⚠️ High fever detected.")
    }

    const warningText = warnings.join("\n")
    const isHigh = updatedRisk === "HIGH"

    const botMessage: Message = {
      id: messages.length + 1,
      type: "bot",
      text: `Vital Signs Recorded:
- Blood Pressure: ${vitals.bp_systolic || "N/A"}/${vitals.bp_diastolic || "N/A"} mmHg
- Oxygen Saturation (SpO₂): ${vitals.spo2 ? vitals.spo2 + "%" : "N/A"}
- Heart Rate: ${vitals.heart_rate ? vitals.heart_rate + " bpm" : "N/A"}
- Temperature: ${vitals.temperature ? vitals.temperature + "°F" : "N/A"}

${warningText ? warningText + "\n" : ""}
${isHigh
          ? "Your vital signs indicate you should seek medical attention immediately. I am redirecting you to find hospitals near you."
          : "Continue monitoring these vitals and seek clinical care if symptoms worsen."
        }`,
      timestamp: new Date(),
      riskLevel: updatedRisk,
    }

    setMessages((prev) => [...prev, botMessage])
    setShowVitalsModal(false)

    // Map specialist if high risk vitals
    let specialty = "General Physician"
    if (sys > 140 || dia > 90 || (hr > 100 || hr < 60)) {
      specialty = "Cardiologist"
    } else if (ox > 0 && ox < 95) {
      specialty = "Pulmonologist"
    }

    onRiskUpdate(updatedRisk, specialty)

    if (isHigh) {
      setTimeout(() => {
        onNavigate("recommendations")
      }, 3000)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0B0B0C] text-white relative font-sans">
      {/* Live Background Video (Opacity 100%) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-100"
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-[#eca8d6]/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate("starter")}
            className="flex items-center gap-1.5 border border-white/15 bg-white/[0.02] hover:bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="text-sm font-semibold tracking-wider uppercase text-white/90">Chat with Fidele</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-white/80 text-xs font-semibold">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            AI Online
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md px-5 py-3.5 rounded-2xl border transition-all ${message.type === "user"
                    ? "bg-white text-black border-white/10 rounded-tr-none font-medium"
                    : "bg-white/[0.02] text-white/90 border-white/5 rounded-tl-none"
                  }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>

                {message.riskLevel && (
                  <div className={`mt-3 pt-2 border-t flex items-center gap-2 ${message.type === "user" ? "border-black/10" : "border-white/5"}`}>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Risk Assessment:</span>
                    {message.riskLevel === "LOW" && (
                      <span className="text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                        🟢 LOW RISK
                      </span>
                    )}
                    {message.riskLevel === "MEDIUM" && (
                      <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase">
                        🟡 MEDIUM RISK
                      </span>
                    )}
                    {message.riskLevel === "HIGH" && (
                      <span className="text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase animate-pulse">
                        🔴 HIGH RISK
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#eca8d6] rounded-full animate-ping" />
              </div>
              <p className="text-white/40 text-xs tracking-wider italic">Fidele is analyzing symptoms...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#141416] border border-white/10 p-6 w-full max-w-md rounded-3xl shadow-2xl relative">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-display font-semibold text-white tracking-tight">Record Vital Signs</h2>
            </div>

            <form onSubmit={handleVitalsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.bp_systolic}
                    onChange={(e) => setVitals({ ...vitals, bp_systolic: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 text-sm"
                    placeholder="120"
                    min="60"
                    max="250"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.bp_diastolic}
                    onChange={(e) => setVitals({ ...vitals, bp_diastolic: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 text-sm"
                    placeholder="80"
                    min="40"
                    max="150"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Oxygen Saturation (SpO₂ %)
                </label>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 text-sm"
                  placeholder="98"
                  min="50"
                  max="100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={vitals.heart_rate}
                  onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 text-sm"
                  placeholder="72"
                  min="30"
                  max="220"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 text-sm"
                  placeholder="98.6"
                  min="90"
                  max="110"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="flex-1 px-4 py-2.5 border border-white/15 bg-transparent hover:bg-white/5 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-black hover:bg-white/90 font-semibold rounded-full text-xs uppercase tracking-wider transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input Form Footer */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 w-full">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe symptoms (e.g. chest pain, headache, fever...)"
              disabled={loading}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-full text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all text-sm disabled:opacity-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowVitalsModal(true)}
              className="px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-full hover:bg-emerald-500/20 transition-all text-xs flex items-center gap-1.5 uppercase tracking-wider shrink-0"
              disabled={loading}
            >
              <span>📊</span>
              <span className="hidden sm:inline">Vitals</span>
            </button>
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-6 bg-white text-black font-semibold rounded-full hover:bg-white/90 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5 uppercase tracking-wider shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
