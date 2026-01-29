"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

// --- Particle Animation Component ---
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouse = { x: -100, y: -100, radius: 150 };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        // Clinical colors: teal, blue, white
        const colors = ['#2dd4bf', '#3b82f6', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            let dxBase = this.x - this.baseX;
            this.x -= dxBase / 10;
          }
          if (this.y !== this.baseY) {
            let dyBase = this.y - this.baseY;
            this.y -= dyBase / 10;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      const particleCount = (window.innerWidth * window.innerHeight) / 9000;
      for (let i = 0; i < particleCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Connect particles with lines for "neural network" look
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - (distance / 100) * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    handleResize();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};

// --- Form Components ---
const InputField = ({ label, type, placeholder, value, onChange, icon }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder:text-slate-600"
        placeholder={placeholder}
      />
    </div>
  </div>
);

// --- Main Page ---
export default function Home() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err,setError] = useState("");
  const router = useRouter();
   const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if(isRegister){
  try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email,password,name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        console.log(data.message);
        return;
      }

      // Login success → for now just redirect
      setIsRegister(false);
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
    }
    else{
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // Login success → for now just redirect
      router.push("/main");
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  }
  };

  const toggleMode = () => setIsRegister(!isRegister);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#050B14] relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-medical.png')" }}
      />

      {/* Interactive Particle Layer */}
      <ParticleBackground />

      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />

      {/* Main Container */}
      <div className="z-10 w-full max-w-md p-8 mx-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">
          <div className="p-8">
            {/* Logo and Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transition-transform hover:scale-105 active:scale-95 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 2v20M2 12h20" />
                  <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Medi<span className="text-teal-400">AI</span></h1>
              <p className="text-slate-400 text-sm mt-1">{isRegister ? "Practitioner Onboarding" : "Clinical Access Portal"}</p>
            </div>

            {/* Dynamic Form Content */}
            <form className="space-y-5" onSubmit={handleSubmitLogin}>
              {isRegister && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <InputField
                    label="Full Medical Name"
                    placeholder="Dr. Jane Smith"
                    value={name}
                    onChange={setName}
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />

                </div>
              )}

              <InputField
                label="Professional Email"
                type="email"
                placeholder="name@hospital.com"
                value={email}
                onChange={setEmail}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
              />

              <InputField
                label="Secure Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              />

              {!isRegister && (
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded bg-white/5 border-white/10" id="remember" />
                    <label htmlFor="remember" className="text-slate-400">Secure session</label>
                  </div>
                  <a href="#" className="text-blue-400 hover:text-blue-300">Forgot key?</a>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {isRegister ? "Register Credentials" : "Authorize Access"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-slate-500">
                {isRegister ? "Already verified? " : "New practitioner? "}
                <button
                  onClick={toggleMode}
                  className="font-medium text-teal-400 hover:text-teal-300 transition-colors focus:outline-none"
                >
                  {isRegister ? "Login to account" : "Submit credentials"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
            AI Verfied
          </span>
        </div>
      </div>
    </main>
  );
}
