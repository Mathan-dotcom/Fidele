"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Patient",
    description: "For personal symptom checking and radar maps",
    price: { monthly: 0, annual: 0 },
    features: [
      "3 triage scans / day",
      "Rule-based fallback check",
      "Live hospital geo-radar",
      "Secure digital health pass",
      "Offline symptoms checker",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Care Team",
    description: "For medical teams and private practices",
    price: { monthly: 79, annual: 65 },
    features: [
      "Unlimited AI triage queries",
      "Gemini & Groq diagnostics",
      "Patient records portal",
      "Google Places API routing",
      "EHR FHIR standard exports",
      "Priority medical support",
      "Vitals trend analysis",
    ],
    cta: "Start trial",
    highlight: true,
  },
  {
    name: "Clinic Network",
    description: "For hospitals and regional provider networks",
    price: { monthly: null, annual: null },
    features: [
      "On-premises secure host",
      "Custom medical model routing",
      "Integrated patient tracking",
      "24/7 dedicated support",
      "Full HIPAA audit trails",
      "Clinic portal widgets",
      "SLA routing guarantee",
      "Active regional radar nodes",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export function PricingSection({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
              <span className="w-12 h-px bg-foreground/30" />
              Pricing
            </span>
            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Triage for
              <br />
              <span className="text-stroke">everyone.</span>
            </h2>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <img
                src="/images/whale.png"
                alt="Organic whale"
                className="w-full h-full object-contain object-center"
              />
            </div>
            
            {/* Toggle */}
            <div className="absolute bottom-0 left-0 flex items-center gap-4 bg-background border border-foreground/10 px-4 py-2 rounded-full">
              <button
                onClick={() => setIsAnnual(false)}
                className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors ${
                  !isAnnual ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors ${
                  isAnnual ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                Annually
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between border p-8 lg:p-12 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              } ${
                plan.highlight
                  ? "border-foreground bg-foreground/5 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                  : "border-foreground/10 hover:border-foreground/30"
              }`}
              style={{ transitionDelay: isVisible ? `${i * 100}ms` : "0ms" }}
            >
              <div>
                {/* Plan Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-display font-medium tracking-tight mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {plan.description}
                    </p>
                  </div>
                  {plan.highlight && (
                    <span className="inline-flex items-center gap-1.5 bg-foreground text-background text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">
                      <Zap className="w-3 h-3 fill-current" />
                      Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.price.monthly !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl lg:text-6xl font-display">
                        ${isAnnual ? plan.price.annual : plan.price.monthly}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-display">Custom</span>
                  )}
                  {plan.price.monthly !== null && plan.price.monthly > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      {isAnnual ? "billed annually" : "billed monthly"}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#eca8d6] mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => onNavigate?.("signup")}
                  className={`w-full py-4 cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                    plan.highlight
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note with icons */}
        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Encrypted execution
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Full audit logs
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Multi-model routing
            </span>
          </div>
          <a href="#" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
            Compare all features
          </a>
        </div>
      </div>
    </section>
  );
}
