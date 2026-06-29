"use client"

import { useState } from "react"
import { Heart, User, Mail, Lock, AlertCircle } from "lucide-react"
import { registerUser } from "@/lib/api-client"

interface SignupPageProps {
  onNavigate: (page: string) => void
  onSignupSuccess: (user: { name: string; email: string; userId: string }) => void
}

export function SignupPage({ onNavigate, onSignupSuccess }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\~`]/.test(password)) strength++
    return strength
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Clientside validation
    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters.")
      return
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.")
      return
    }

    setLoading(true)

    try {
      const result = await registerUser(formData.name, formData.email, formData.password)
      if (result.success && result.data) {
        onSignupSuccess(result.data)
      } else {
        setError(result.message || "Registration failed.")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: "Weak", colorClass: "bg-red-500", textClass: "text-red-400" }
      case 2:
        return { label: "Fair", colorClass: "bg-amber-500", textClass: "text-amber-400" }
      case 3:
        return { label: "Good", colorClass: "bg-[#eca8d6]", textClass: "text-[#eca8d6]" }
      case 4:
        return { label: "Strong", colorClass: "bg-emerald-500", textClass: "text-emerald-400" }
      default:
        return { label: "Weak", colorClass: "bg-red-500", textClass: "text-red-400" }
    }
  }

  const strengthInfo = getStrengthLabel(passwordStrength)

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
      <div className="absolute top-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-[#eca8d6]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[25rem] h-[25rem] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-8 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-white/10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mb-4 transition-all duration-300 hover:scale-105">
            <Heart className="w-8 h-8 text-[#eca8d6] fill-[#eca8d6]/10" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">Fidele</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Create Your Account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/60 flex items-center">
              <User className="w-4 h-4 text-white/40 mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/60 flex items-center">
              <Mail className="w-4 h-4 text-white/40 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/60 flex items-center">
              <Lock className="w-4 h-4 text-white/40 mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                const pass = e.target.value
                setFormData({ ...formData, password: pass })
                setPasswordStrength(calculatePasswordStrength(pass))
              }}
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
              placeholder="••••••••"
              disabled={loading}
              required
            />
            {/* Strength Indicator */}
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${formData.password.length > 0 && level <= passwordStrength
                      ? strengthInfo.colorClass
                      : "bg-white/10"
                    }`}
                />
              ))}
            </div>
            {formData.password.length > 0 && (
              <p className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${strengthInfo.textClass}`}>
                {strengthInfo.label} password
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-white/60 flex items-center">
              <Lock className="w-4 h-4 text-white/40 mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
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

          {/* Terms Checkbox */}
          <label className="flex items-center cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-white/10 text-[#eca8d6] focus:ring-0 mr-2 h-4 w-4 bg-white/5 border"
              disabled={loading}
            />
            <span className="text-xs text-white/60">
              I agree to the Terms of Service
            </span>
          </label>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-white/90 text-black rounded-full font-semibold py-3.5 px-4 transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm tracking-wide shadow-lg hover:shadow-white/5 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 pt-6 border-t border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-wider">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-[#eca8d6] hover:text-[#eca8d6]/80 font-bold transition-colors ml-1"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
