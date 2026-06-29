"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, MapPin, ExternalLink, Navigation, AlertCircle } from "lucide-react"

interface Hospital {
  id: string
  name: string
  distance: number
  address: string
  phone: string
  rating: number
  reviews: number
  type: string
  latitude: number
  longitude: number
  specialties: string[]
}

interface RecommendationsPageProps {
  onNavigate: (page: string) => void
  riskLevel: string
  specialty: string
}

export function RecommendationsPage({ onNavigate, riskLevel, specialty }: RecommendationsPageProps) {
  const [userLocation, setUserLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All")

  // Auto-select dropdown specialty based on the incoming recommended specialty prop
  useEffect(() => {
    if (specialty) {
      const specLower = specialty.toLowerCase()
      if (specLower.includes("cardio")) setSelectedSpecialty("Cardiology")
      else if (specLower.includes("pulmono")) setSelectedSpecialty("Pulmonology")
      else if (specLower.includes("neuro")) setSelectedSpecialty("Neurology")
      else if (specLower.includes("dermato")) setSelectedSpecialty("Dermatology")
      else if (specLower.includes("ortho")) setSelectedSpecialty("Orthopedics")
      else if (specLower.includes("pediatri")) setSelectedSpecialty("Pediatrics")
      else if (specLower.includes("general") || specLower.includes("physician")) setSelectedSpecialty("General Medicine")
      else if (specLower.includes("trauma")) setSelectedSpecialty("Minor Trauma")
      else if (specLower.includes("family")) setSelectedSpecialty("Family Care")
      else setSelectedSpecialty("All")
    }
  }, [specialty])

  const fetchHospitals = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lon=${lon}`)
      if (!res.ok) throw new Error("Failed to search nearby hospitals")
      const data = await res.json()
      setHospitals(data)
    } catch (err) {
      console.error("Failed to fetch hospitals:", err)
      // Fallback in case of API failure
      setHospitals([
        {
          id: "h1",
          name: "St. Jude Memorial Hospital (Offline Fallback)",
          distance: 1.8,
          address: "452 Medical Center Pkwy, Cityville",
          phone: "+1 (555) 019-2834",
          rating: 4.6,
          reviews: 312,
          type: "Emergency Hospital",
          latitude: lat + 0.005,
          longitude: lon + 0.005,
          specialties: ["Cardiology", "Pulmonology", "General Medicine"],
        }
      ])
    }
  }

  const handleGetLocation = () => {
    setLoading(true)
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: {
              "User-Agent": "Fidele-Health-Assistant/1.0"
            }
          })
          if (revRes.ok) {
            const revData = await revRes.json()
            const name = revData.address?.city || revData.address?.town || revData.address?.suburb || "Your Coordinates"
            setUserLocation(name)
          } else {
            setUserLocation("Current Location")
          }
        } catch (e) {
          setUserLocation("Current Location")
        }

        await fetchHospitals(latitude, longitude)
        setLoading(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to retrieve location. Please check your browser's location permission or enter a city manually.")
        setLoading(false)
      }
    )
  }

  const handleManualCity = async () => {
    const city = prompt("Enter your city or ZIP code:")
    if (!city || !city.trim()) return

    setLoading(true)
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
        headers: {
          "User-Agent": "Fidele-Health-Assistant/1.0"
        }
      })
      if (!geoRes.ok) throw new Error("Geocoding failed")
      const geoData = await geoRes.json()
      if (geoData && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat)
        const lon = parseFloat(geoData[0].lon)
        setUserLocation(geoData[0].display_name.split(",")[0])
        setCoords({ latitude: lat, longitude: lon })
        await fetchHospitals(lat, lon)
      } else {
        alert("Could not locate that address. Try entering a larger city name.")
      }
    } catch (err) {
      console.error(err)
      setUserLocation(`${city} (Fallback)`)
      const fallbackLat = 37.7749
      const fallbackLon = -122.4194
      setCoords({ latitude: fallbackLat, longitude: fallbackLon })
      await fetchHospitals(fallbackLat, fallbackLon)
    } finally {
      setLoading(false)
    }
  }

  // Filter hospitals based on dropdown selection
  const filteredHospitals = hospitals.filter((h) => {
    if (selectedSpecialty === "All") return true
    return h.specialties.some(
      (s) => s.toLowerCase() === selectedSpecialty.toLowerCase() || 
             (selectedSpecialty === "General Medicine" && s.toLowerCase() === "general medicine")
    )
  })

  // Determine if we need to fall back to general hospitals because filtering returned zero items
  const showFallbackNotice = selectedSpecialty !== "All" && filteredHospitals.length === 0 && hospitals.length > 0
  const activeHospitalsList = showFallbackNotice ? hospitals : filteredHospitals

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white pb-16 relative font-sans">
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
      <div className="absolute top-1/4 right-1/4 w-[35rem] h-[35rem] rounded-full bg-[#eca8d6]/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate("starter")}
            className="flex items-center gap-1.5 border border-white/15 bg-white/[0.02] hover:bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="text-sm font-semibold tracking-wider uppercase text-white/90">Find Healthcare</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Emergency Banner (if HIGH risk) */}
        {riskLevel === "HIGH" && (
          <div className="bg-red-500/10 border border-red-500/20 p-5 mb-6 rounded-2xl text-red-200">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 animate-bounce text-red-500" />
              <div>
                <h3 className="font-semibold text-lg text-white">⚠️ URGENT: Seek Immediate Care</h3>
                <p className="text-xs text-red-300/80 leading-relaxed mt-1">
                  Your assessment indicates a potential critical condition. Please call emergency services or visit the nearest emergency facility.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Specialty Selection Dropdown */}
        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 rounded-3xl mb-8">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Choose Specialist / Doctor Type</h3>
          <div className="w-full">
            <label className="block text-xs font-semibold text-white/70 mb-2">Select the type of doctor you need:</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="All">All Care Facilities / General Care</option>
              <option value="General Medicine">General Medicine / Family Doctor</option>
              <option value="Cardiology">Cardiologist / Cardiology</option>
              <option value="Pulmonology">Pulmonologist / Pulmonology</option>
              <option value="Neurology">Neurologist / Neurology</option>
              <option value="Dermatology">Dermatologist / Dermatology</option>
              <option value="Orthopedics">Orthopedist / Orthopedics</option>
              <option value="Pediatrics">Pediatrician / Pediatrics</option>
              <option value="Emergency Medicine">Emergency Medicine / ER Doctor</option>
              <option value="Family Care">Family Care Specialist</option>
              <option value="Minor Trauma">Minor Trauma / First Aid Care</option>
            </select>
          </div>
        </div>

        {/* Location Request Panel */}
        {!userLocation && (
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl mx-auto mb-6">
              <MapPin className="w-6 h-6 text-[#eca8d6]" />
            </div>
            <h3 className="font-display font-semibold text-2xl text-white mb-2">Enable Location Access</h3>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
              Allow location access or search your city to view nearby emergency care networks and medical providers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="px-6 py-3 bg-white hover:bg-white/90 text-black rounded-full font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                    Locating...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    Use My Location
                  </>
                )}
              </button>
              <button
                onClick={handleManualCity}
                disabled={loading}
                className="px-6 py-3 bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-full font-semibold transition-all text-sm active:scale-[0.98]"
              >
                Enter City Manually
              </button>
            </div>
          </div>
        )}

        {/* Recommendations Details */}
        {userLocation && (
          <>
            {/* Specialty Recommendation */}
            {specialty && (
              <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 rounded-3xl mb-8">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Recommended Specialist</h3>
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="text-4xl bg-white/[0.03] border border-white/10 p-4 rounded-2xl shrink-0">👨‍⚕️</div>
                  <div>
                    <h4 className="text-2xl font-display font-semibold text-white tracking-tight">{specialty}</h4>
                    <p className="text-white/60 text-sm leading-relaxed mt-2">
                      Specialist trained in diagnosing and treating conditions related to your analyzed symptoms. We recommend scheduling an online or offline consultation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Radar / Mock Map */}
            <div className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 rounded-3xl mb-8">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Interactive Location Radar</h3>
              <div className="w-full h-64 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                {/* Radar Grid Animation */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="absolute w-56 h-56 rounded-full border border-[#eca8d6]/10 animate-ping opacity-60"></div>
                <div className="absolute w-36 h-36 rounded-full border border-[#eca8d6]/20"></div>
                <div className="absolute w-16 h-16 rounded-full border border-white/10"></div>
                <div className="absolute w-2.5 h-2.5 bg-white rounded-full border border-black shadow-lg"></div>
                
                {/* Real Hospital Markers (shows active listings) */}
                {activeHospitalsList.map((h, index) => {
                  let top = "50%"
                  let left = "50%"
                  
                  if (coords) {
                    const latDiff = h.latitude - coords.latitude
                    const lonDiff = h.longitude - coords.longitude
                    
                    // Normalize the coordinates scale so it spreads nicely within the radar screen (35% radius bounds)
                    const maxDiff = Math.max(...activeHospitalsList.map(item => Math.max(Math.abs(item.latitude - coords.latitude), Math.abs(item.longitude - coords.longitude))), 0.001)
                    const yOffset = (latDiff / maxDiff) * -35 // lat is Y, invert for CSS top
                    const xOffset = (lonDiff / maxDiff) * 35  // lon is X
                    
                    top = `${50 + yOffset}%`
                    left = `${50 + xOffset}%`
                  } else {
                    const offsets = [
                      { top: "25%", left: "60%" },
                      { top: "70%", left: "75%" },
                      { top: "60%", left: "25%" },
                      { top: "18%", left: "30%" },
                    ]
                    const offset = offsets[index % offsets.length]
                    top = offset.top
                    left = offset.left
                  }

                  return (
                    <div
                      key={h.id}
                      className="absolute group flex flex-col items-center cursor-pointer"
                      style={{ top, left }}
                    >
                      <div className="w-5 h-5 bg-emerald-500 rounded-full border border-black flex items-center justify-center text-[9px] text-black font-bold animate-pulse">
                        H
                      </div>
                      <span className="absolute top-7 bg-[#141416] text-[10px] text-white px-2 py-1.5 rounded-xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {h.name} ({h.distance} km)
                      </span>
                    </div>
                  )
                })}
                <span className="absolute bottom-4 right-4 text-[10px] text-white/40 font-mono tracking-widest uppercase">
                  Radar Feed Active
                </span>
              </div>
            </div>

            {/* Care Facilities Listings */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Hospitals & Clinics Near You</h3>
              
              {showFallbackNotice && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-200/80 text-xs flex gap-2 mb-6">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>No facilities listing the specific specialty <strong>"{selectedSpecialty}"</strong> were found within search range. Displaying all general care facilities instead.</span>
                </div>
              )}

              <div className="space-y-6">
                {activeHospitalsList.length > 0 ? (
                  activeHospitalsList.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 rounded-3xl border-l-4 border-l-[#eca8d6] hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{hospital.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-amber-400">
                              ★ {hospital.rating} ({hospital.reviews} reviews)
                            </span>
                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
                              {hospital.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-2xl font-semibold text-white">{hospital.distance} <span className="text-xs font-normal text-white/40">KM</span></p>
                        </div>
                      </div>

                      <div className="mb-4 text-white/60 text-sm space-y-1.5">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-white/40" />
                          {hospital.address}
                        </p>
                      </div>

                      <div className="mb-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                        {hospital.specialties.map((spec) => (
                          <span key={spec} className="text-[10px] bg-white/[0.03] border border-white/10 text-white/70 px-2.5 py-0.5 rounded-full font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
                              "_blank"
                            )
                          }}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-white/90 font-semibold rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
                        >
                          <Navigation className="w-4 h-4" />
                          Navigate
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-white/5 border-dashed rounded-3xl p-8 text-center text-white/40 text-xs">
                    No medical facilities found. Try changing location manually.
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Platforms Portal */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Book Online Doctor Appointments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Practo Card */}
                <div className="border border-white/10 bg-white/[0.02] p-6 rounded-3xl flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Practo</h4>
                    <p className="text-white/50 text-xs leading-relaxed mb-6">
                      Book clinic appointments or live video calls with verified doctors. Read clinic reviews, check consultation prices, and get secure booking.
                    </p>
                  </div>
                  <a
                    href="https://www.practo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/[0.03] border border-white/10 text-white font-semibold rounded-full text-xs hover:bg-white hover:text-black transition-all uppercase tracking-wider"
                  >
                    Find Doctors on Practo
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Lybrate Card */}
                <div className="border border-white/10 bg-white/[0.02] p-6 rounded-3xl flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Lybrate</h4>
                    <p className="text-white/50 text-xs leading-relaxed mb-6">
                      Consult with specialized doctors online 24/7. Access private chat rooms, voice calls, and have prescriptions delivered to your doorstep.
                    </p>
                  </div>
                  <a
                    href="https://www.lybrate.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/[0.03] border border-white/10 text-white font-semibold rounded-full text-xs hover:bg-white hover:text-black transition-all uppercase tracking-wider"
                  >
                    Find Doctors on Lybrate
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Triage */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 text-center text-red-200">
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2 text-white">
                <span>🚑</span> Emergency Action Needed?
              </h3>
              <p className="text-xs text-red-300/80 leading-relaxed mb-5 max-w-lg mx-auto font-medium">
                If you are experiencing life-threatening symptoms (severe shortness of breath, sudden chest pressure, heavy bleeding), click below to call emergency services.
              </p>
              <a
                href="tel:108"
                className="inline-flex items-center justify-center px-10 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all"
              >
                CALL 108 NOW
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
