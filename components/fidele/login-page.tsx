"use client"

import { useState } from "react"
import { Heart, Mail, Lock, AlertCircle } from "lucide-react"
import { loginUser } from "@/lib/api-client"

interface LoginPageProps {
  onNavigate: (page: string) => void
  onLoginSuccess: (user: { name: string; email: string; userId: string }) => void
}

export function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Clientside validation
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    try {
      const result = await loginUser(formData.email, formData.password)
      if (result.success && result.data) {
        onLoginSuccess(result.data)
      } else {
        setError(result.message || "Invalid credentials.")
      }
    } catch (err) {
      setError("Connection error. Please check if backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
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
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-[#eca8d6]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-8 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-white/10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mb-4 transition-all duration-300 hover:scale-105">
            <Heart className="w-8 h-8 text-[#eca8d6] fill-[#eca8d6]/10" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">Fidele</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Your AI Health Companion</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/60 flex items-center">
              <Mail className="w-4 h-4 text-white/40 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/60 flex items-center">
              <Lock className="w-4 h-4 text-white/40 mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start text-red-400">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-white/90 text-black rounded-full font-semibold py-3.5 px-4 transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm tracking-wide shadow-lg hover:shadow-white/5 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wider">
            Don't have an account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-[#eca8d6] hover:text-[#eca8d6]/80 font-bold transition-colors ml-1"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
