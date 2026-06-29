"use client"

import { useState, useEffect } from "react"
import { Heart, LogOut, MessageCircle, MapPin, AlertCircle, FileText, X, Loader2, Users, Database, FileHeart, TrendingUp, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getMedicalRecords, addMedicalRecord, getPlatformStats } from "@/lib/api-client"

interface StarterPageProps {
  user: { name: string; email: string }
  onNavigate: (page: string) => void
  onLogout: () => void
}

interface MedicalRecord {
  medicalId: string
  timestamp: string
  age: string
  gender: string
  bloodType: string
  allergies: string
  conditions: string
  medications: string
  weight?: string
  systolic?: number | null
  diastolic?: number | null
  heartRate?: number | null
  temperature?: number | null
}

export function StarterPage({ user, onNavigate, onLogout }: StarterPageProps) {
  const [showMedicalModal, setShowMedicalModal] = useState(false)
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submittingRecord, setSubmittingRecord] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Platform statistics
  const [platformStats, setPlatformStats] = useState({ totalUsers: 0, totalRecords: 0 })
  const [loadingStats, setLoadingStats] = useState(false)

  // Form states
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [allergies, setAllergies] = useState("")
  const [conditions, setConditions] = useState("")
  const [medications, setMedications] = useState("")
  const [weight, setWeight] = useState("")
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [temperature, setTemperature] = useState("")

  // Fetch records
  const fetchRecords = async () => {
    if (!user?.email) return
    setLoadingHistory(true)
    const res = await getMedicalRecords(user.email)
    if (res.success) {
      setMedicalHistory(res.data || [])
    }
    setLoadingHistory(false)
  }

  // Fetch stats
  const fetchStats = async () => {
    setLoadingStats(true)
    const res = await getPlatformStats()
    if (res.success && res.data) {
      setPlatformStats(res.data)
    }
    setLoadingStats(false)
  }

  useEffect(() => {
    fetchRecords()
    fetchStats()
  }, [user?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    setSubmittingRecord(true)
    setErrorMsg("")

    const res = await addMedicalRecord(user.email, {
      age,
      gender,
      bloodType,
      allergies,
      conditions,
      medications,
      weight,
      systolic: systolic ? systolic : undefined,
      diastolic: diastolic ? diastolic : undefined,
      heartRate: heartRate ? heartRate : undefined,
      temperature: temperature ? temperature : undefined,
    })

    if (res.success) {
      await fetchRecords()
      await fetchStats() // Refresh platform counts!
      // Clear form inputs
      setAge("")
      setGender("")
      setBloodType("")
      setAllergies("")
      setConditions("")
      setMedications("")
      setWeight("")
      setSystolic("")
      setDiastolic("")
      setHeartRate("")
      setTemperature("")
    } else {
      setErrorMsg(res.message)
    }
    setSubmittingRecord(false)
  }

  // Map medical entries chronologically (oldest first) for Recharts plotting
  const chartData = [...medicalHistory]
    .reverse()
    .filter((r) => r.heartRate || r.temperature || r.systolic)
    .map((record) => {
      const dateObj = new Date(record.timestamp)
      const label = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) + " " + dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      })
      return {
        name: label,
        HeartRate: record.heartRate || null,
        Temperature: record.temperature || null,
        SystolicBP: record.systolic || null,
        DiastolicBP: record.diastolic || null,
      }
    })

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden font-sans">
      {/* Live Background Video */}
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
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-[#eca8d6]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer transition-all hover:opacity-90" onClick={() => onNavigate("starter")}>
            <Heart className="w-6 h-6 text-[#eca8d6] fill-[#eca8d6]/10" />
            <h1 className="text-xl font-display font-bold tracking-tight text-white">Fidele</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-white/60 text-xs md:text-sm">
              User: <strong className="text-white">{user.name}</strong>
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/20 bg-red-500/5 text-red-400 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Hero Welcome */}
        <div className="text-center mb-12 md:mb-16 pb-8 border-b border-white/10">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-4">
            Welcome to Fidele
          </h2>
          <p className="text-sm text-white/50 max-w-2xl mx-auto leading-relaxed">
            Your intelligent health assistant powered by clinical-grade AI. Get instant symptom assessments and local care options.
          </p>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Platform Users */}
          <div className="border border-white/10 bg-white/[0.01] backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] hover:border-[#eca8d6]/20 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-white/[0.03] border border-white/10 rounded-xl">
              <Users className="w-5 h-5 text-[#eca8d6]" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold">Active Members</span>
              <span className="text-2xl font-bold font-display text-white mt-0.5 block">
                {loadingStats ? "..." : platformStats.totalUsers}
              </span>
            </div>
          </div>

          {/* Card 2: Platform Records */}
          <div className="border border-white/10 bg-white/[0.01] backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] hover:border-emerald-500/20 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-white/[0.03] border border-white/10 rounded-xl">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold">Clinical Files Filed</span>
              <span className="text-2xl font-bold font-display text-white mt-0.5 block">
                {loadingStats ? "..." : platformStats.totalRecords}
              </span>
            </div>
          </div>

          {/* Card 3: Personal Submissions */}
          <div className="border border-white/10 bg-white/[0.01] backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 hover:bg-white/[0.02] hover:border-violet-500/20 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-white/[0.03] border border-white/10 rounded-xl">
              <FileHeart className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold">Your Uploaded Entries</span>
              <span className="text-2xl font-bold font-display text-white mt-0.5 block">
                {loadingHistory ? "..." : medicalHistory.length}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 md:mb-16">
          {/* Card 1: Chatbot */}
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl hover:border-[#eca8d6]/30 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
                <MessageCircle className="w-6 h-6 text-[#eca8d6]" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-3 tracking-tight">
                AI Health Chat
              </h3>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Describe your symptoms in natural language. Get instant health guidance and structured risk assessments powered by advanced AI models.
              </p>
            </div>
            <button
              onClick={() => onNavigate("chatbot")}
              className="w-full bg-white hover:bg-white/90 text-black rounded-full font-semibold py-3 px-4 transition-all duration-300 text-center text-sm active:scale-[0.98] shadow-lg hover:shadow-white/5"
            >
              Start Chatting
            </button>
          </div>

          {/* Card 2: Recommendations */}
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-3 tracking-tight">
                Find Care
              </h3>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Get personalized specialist recommendations and locate nearby verified hospitals using high-accuracy geolocation mapping.
              </p>
            </div>
            <button
              onClick={() => onNavigate("recommendations")}
              className="w-full bg-white hover:bg-white/90 text-black rounded-full font-semibold py-3 px-4 transition-all duration-300 text-center text-sm active:scale-[0.98] shadow-lg hover:shadow-white/5"
            >
              Get Recommendations
            </button>
          </div>

          {/* Card 3: Medical Profile */}
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-3 tracking-tight">
                Medical Profile
              </h3>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Securely store and update your personal medical profile, including allergies, conditions, and medications, and track your clinical history entries.
              </p>
            </div>
            <button
              onClick={() => setShowMedicalModal(true)}
              className="w-full bg-white hover:bg-white/90 text-black rounded-full font-semibold py-3 px-4 transition-all duration-300 text-center text-sm active:scale-[0.98] shadow-lg hover:shadow-white/5"
            >
              Manage Profile
            </button>
          </div>
        </div>

        {/* Vital Trends Chart Section */}
        {chartData.length >= 2 ? (
          <div className="border border-white/10 bg-white/[0.01] backdrop-blur-xl p-8 rounded-3xl mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                  Personal Vital Sign Trends
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Visualize your historical vital signs recorded across medical snapshots.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-white/60">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Heart Rate (bpm)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> Temp (°F)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Systolic BP</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Diastolic BP</span>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121214",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Line type="monotone" dataKey="HeartRate" stroke="#f87171" strokeWidth={2} dot={{ fill: "#f87171" }} name="Heart Rate (bpm)" connectNulls />
                  <Line type="monotone" dataKey="Temperature" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa" }} name="Temp (°F)" connectNulls />
                  <Line type="monotone" dataKey="SystolicBP" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399" }} name="Systolic BP" connectNulls />
                  <Line type="monotone" dataKey="DiastolicBP" stroke="#60a5fa" strokeWidth={2} dot={{ fill: "#60a5fa" }} name="Diastolic BP" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="border border-white/5 bg-white/[0.01] border-dashed p-8 rounded-3xl mb-12 text-center flex flex-col items-center justify-center min-h-[220px]">
            <Activity className="w-10 h-10 text-white/20 mb-3" />
            <h3 className="text-md font-semibold text-white mb-1">Vital Sign Trend Chart</h3>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-4">
              Add at least two medical entries containing Heart Rate, Temperature, or Blood Pressure details to unlock your health trend visualisations.
            </p>
            <button
              onClick={() => setShowMedicalModal(true)}
              className="px-5 py-2 border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-semibold rounded-full hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-300 active:scale-[0.98]"
            >
              Update Medical Profile
            </button>
          </div>
        )}

        {/* Features Quick Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-white/10 bg-white/[0.01] p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="text-3xl mb-3">🩺</div>
            <h4 className="font-semibold text-white mb-2 text-sm">Symptom Analysis</h4>
            <p className="text-xs text-white/50 leading-relaxed">Quick assessment of symptoms with dynamic risk indicators</p>
          </div>
          <div className="border border-white/10 bg-white/[0.01] p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="text-3xl mb-3">📍</div>
            <h4 className="font-semibold text-white mb-2 text-sm">Local Hospitals</h4>
            <p className="text-xs text-white/50 leading-relaxed">Find and navigate to nearby emergency clinics in seconds</p>
          </div>
          <div className="border border-white/10 bg-white/[0.01] p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="text-3xl mb-3">👨‍⚕️</div>
            <h4 className="font-semibold text-white mb-2 text-sm">Doctor Platforms</h4>
            <p className="text-xs text-white/50 leading-relaxed">Directly connect with specialists on trusted online consultation platforms</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 text-amber-200/80">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <h4 className="font-semibold text-amber-300 mb-1 text-sm">Important Disclaimer</h4>
              <p className="text-xs leading-relaxed">
                Fidele provides health information and guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for serious health concerns or emergencies.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Medical Profile Modal */}
      {showMedicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-[#121214] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">Medical Profile & History</h3>
              </div>
              <button
                onClick={() => setShowMedicalModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Record Entry */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">Record New Medical Entry</h4>
                  <p className="text-xs text-white/50">Keep your health file up to date. These records are securely stored on AWS DynamoDB.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Age</label>
                      <input
                        type="text"
                        placeholder="e.g. 25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Gender</label>
                      <input
                        type="text"
                        placeholder="e.g. Female"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Blood Type</label>
                      <input
                        type="text"
                        placeholder="e.g. O+, A-"
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Weight</label>
                      <input
                        type="text"
                        placeholder="e.g. 70 kg"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-3">Vitals & Bio-Metrics</h5>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1.5">Heart Rate</label>
                        <input
                          type="number"
                          placeholder="bpm"
                          value={heartRate}
                          onChange={(e) => setHeartRate(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1.5">Systolic BP</label>
                        <input
                          type="number"
                          placeholder="mmHg"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1.5">Diastolic BP</label>
                        <input
                          type="number"
                          placeholder="mmHg"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 98.6"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Known Allergies</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Penicillin, Peanuts (or None)"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Chronic Conditions</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Asthma, Type 2 Diabetes"
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Current Medications</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Albuterol inhaler, Metformin"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRecord}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white rounded-xl py-3 px-4 transition-all duration-300 font-semibold text-sm active:scale-[0.98]"
                  >
                    {submittingRecord ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Entry...
                      </>
                    ) : (
                      "Save Medical Entry"
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: History List */}
              <div className="flex flex-col h-full border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 overflow-hidden">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-2">History & Timestamps</h4>
                  <p className="text-xs text-white/50">List of all historical medical submissions.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] lg:max-h-none pr-2">
                  {loadingHistory ? (
                    <div className="h-40 flex items-center justify-center text-white/40 text-xs gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading medical history...
                    </div>
                  ) : medicalHistory.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-white/40 text-xs p-6 text-center">
                      <p className="mb-2">No medical entries found.</p>
                      <p className="text-[10px]">Complete the form to log your first medical snapshot.</p>
                    </div>
                  ) : (
                    medicalHistory.map((record) => {
                      const dateObj = new Date(record.timestamp)
                      const formattedDate = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      const formattedTime = dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })

                      return (
                        <div key={record.medicalId} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/10 transition-all duration-300">
                          <div className="flex justify-between items-start border-b border-white/5 pb-2">
                            <div>
                              <div className="text-xs font-semibold text-white/80">{formattedDate} at {formattedTime}</div>
                              <div className="text-[9px] text-white/30 font-mono mt-0.5">ID: {record.medicalId}</div>
                            </div>
                            <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full font-semibold">
                              Entry Saved
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-[11px] bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">Age:</span>
                              <span className="text-white/95 font-semibold">{record.age}</span>
                            </div>
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">Gender:</span>
                              <span className="text-white/95 font-semibold">{record.gender}</span>
                            </div>
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">Blood Type:</span>
                              <span className="text-white/95 font-semibold">{record.bloodType}</span>
                            </div>
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">Weight:</span>
                              <span className="text-white/95 font-semibold">{record.weight || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">BP (mmHg):</span>
                              <span className="text-white/95 font-semibold font-mono">
                                {record.systolic && record.diastolic 
                                  ? `${record.systolic}/${record.diastolic}` 
                                  : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">Heart Rate:</span>
                              <span className="text-white/95 font-semibold">
                                {record.heartRate ? `${record.heartRate} bpm` : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/40 block text-[9px] uppercase">Temp:</span>
                              <span className="text-white/95 font-semibold">
                                {record.temperature ? `${record.temperature}°F` : "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[11px] border-t border-white/5 pt-2">
                            <div>
                              <span className="text-white/40 block font-semibold">Allergies:</span>
                              <p className="text-white/90 leading-normal">{record.allergies}</p>
                            </div>
                            <div>
                              <span className="text-white/40 block font-semibold">Conditions:</span>
                              <p className="text-white/90 leading-normal">{record.conditions}</p>
                            </div>
                            <div>
                              <span className="text-white/40 block font-semibold">Medications:</span>
                              <p className="text-white/90 leading-normal">{record.medications}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
