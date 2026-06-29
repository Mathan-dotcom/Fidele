"use client"

import { useState } from "react"
import { Navigation } from "@/components/landing/navigation"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { InfrastructureSection } from "@/components/landing/infrastructure-section"
import { MetricsSection } from "@/components/landing/metrics-section"
import { IntegrationsSection } from "@/components/landing/integrations-section"
import { SecuritySection } from "@/components/landing/security-section"
import { DevelopersSection } from "@/components/landing/developers-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CtaSection } from "@/components/landing/cta-section"
import { FooterSection } from "@/components/landing/footer-section"

// Fidele screens
import { LoginPage } from "@/components/fidele/login-page"
import { SignupPage } from "@/components/fidele/signup-page"
import { StarterPage } from "@/components/fidele/starter-page"
import { ChatbotPage } from "@/components/fidele/chatbot-page"
import { RecommendationsPage } from "@/components/fidele/recommendations-page"

interface User {
  name: string
  email: string
  userId: string
}

interface Message {
  id: number
  type: "user" | "bot"
  text: string
  timestamp: Date
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<string>("landing")
  const [user, setUser] = useState<User | null>(null)
  
  // Chat message state (resides in page.tsx so it stays in React state, as required)
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text: `Hello! I'm Fidele, your AI health assistant.

Please describe your symptoms or health concerns.

⚠️ Disclaimer: This is not a medical diagnosis. Always consult a healthcare professional for serious concerns.`,
      timestamp: new Date(),
    },
  ])

  // Risk and specialist recommendation state (passed from chatbot to recommendations)
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW")
  const [specialty, setSpecialty] = useState<string>("General Physician")

  const handleLoginSuccess = (userData: User) => {
    setUser(userData)
    setCurrentPage("starter")
  }

  const handleLogout = () => {
    setUser(null)
    setChatMessages([
      {
        id: 1,
        type: "bot",
        text: `Hello! I'm Fidele, your AI health assistant.

Please describe your symptoms or health concerns.

⚠️ Disclaimer: This is not a medical diagnosis. Always consult a healthcare professional for serious concerns.`,
        timestamp: new Date(),
      },
    ])
    setRiskLevel("LOW")
    setSpecialty("General Physician")
    setCurrentPage("landing")
  }

  const handleRiskUpdate = (newRisk: "LOW" | "MEDIUM" | "HIGH", recommendedSpecialty: string) => {
    setRiskLevel(newRisk)
    setSpecialty(recommendedSpecialty)
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <>
            <Navigation onNavigate={setCurrentPage} />
            <main className="relative min-h-screen overflow-x-hidden bg-transparent">
              <HeroSection />
              <FeaturesSection />
              <HowItWorksSection />
              <InfrastructureSection />
              <MetricsSection />
              <IntegrationsSection />
              <SecuritySection />
              <DevelopersSection />
              <TestimonialsSection />
              <CtaSection onNavigate={setCurrentPage} />
            </main>
            <FooterSection />
          </>
        )
      case "login":
        return <LoginPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
      case "signup":
        return <SignupPage onNavigate={setCurrentPage} onSignupSuccess={handleLoginSuccess} />
      case "starter":
        if (!user) {
          setCurrentPage("login")
          return null
        }
        return <StarterPage user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
      case "chatbot":
        if (!user) {
          setCurrentPage("login")
          return null
        }
        return (
          <ChatbotPage
            messages={chatMessages}
            setMessages={setChatMessages}
            onNavigate={setCurrentPage}
            onRiskUpdate={handleRiskUpdate}
          />
        )
      case "recommendations":
        if (!user) {
          setCurrentPage("login")
          return null
        }
        return <RecommendationsPage riskLevel={riskLevel} specialty={specialty} onNavigate={setCurrentPage} />
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
            <div className="text-center">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
              <button
                onClick={() => setCurrentPage("landing")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded font-semibold"
              >
                Go to Landing Page
              </button>
            </div>
          </div>
        )
    }
  }

  const activeContent = renderActivePage()
  if (!activeContent) return null

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0B0B0C] text-white">
      {activeContent}
    </div>
  )
}
