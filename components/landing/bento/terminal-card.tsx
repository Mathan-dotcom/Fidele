"use client"

import { useEffect, useState } from "react"

const LOG_LINES = [
  "> Initializing Fidele AI Health Engine...",
  "> Loading medical NLP dictionary...",
  "> Checking symptom databases...",
  "> User reports: fever, chills, fatigue",
  "> Symptom analyzer: running assessment...",
  "> Analysis pass: keyword extraction...",
  "> Risk score calculation: 0.45 (MEDIUM)",
  "> Mapping symptoms to specialties...",
  "> Suggested specialist: General Physician",
  "> Fetching nearby clinics via geo-API...",
  "> Located 4 care centers within 5km",
  "> System: READY FOR CONSULTATION",
  "> Response latency: 24ms",
  "> Uptime: 99.99%",
  "> --------- HEALTH CYCLE COMPLETE ---------",
]

export function TerminalCard() {
  const [lines, setLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const next = prev + 1
        if (next >= LOG_LINES.length) {
          setLines([])
          return 0
        }
        setLines((l) => [...l.slice(-8), LOG_LINES[next]])
        return next
      })
    }, 600)

    // Add first line
    setLines([LOG_LINES[0]])

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b-2 border-foreground px-4 py-2">
        <span className="h-2 w-2 bg-[#3b82f6]" />
        <span className="h-2 w-2 bg-foreground" />
        <span className="h-2 w-2 border border-foreground" />
        <span className="ml-auto text-[10px] tracking-widest text-muted-foreground uppercase">
          fidele.engine
        </span>
      </div>
      <div className="flex-1 bg-foreground p-4 overflow-hidden">
        <div className="flex flex-col gap-1">
          {lines.map((line, i) => (
            <span
              key={`${currentLine}-${i}`}
              className="text-xs text-background font-mono block"
              style={{ opacity: i === lines.length - 1 ? 1 : 0.6 }}
            >
              {line}
            </span>
          ))}
          <span className="text-xs text-[#3b82f6] font-mono animate-blink">{"_"}</span>
        </div>
      </div>
    </div>
  )
}
