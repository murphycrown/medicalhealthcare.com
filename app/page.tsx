"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ChevronRight, Sparkles, Activity, Shield, Users, Mail, Globe, ArrowRight, Menu, X } from "lucide-react";

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: any[] = [];
        let animationFrameId: number;

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;

            constructor() {
                this.x = Math.random() * (canvas?.width || 0);
                this.y = Math.random() * (canvas?.height || 0);
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                const colors = ['#3b82f6', '#2dd4bf', '#1e293b'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (canvas && this.x > canvas.width) this.x = 0;
                if (canvas && this.x < 0) this.x = canvas.width;
                if (canvas && this.y > canvas.height) this.y = 0;
                if (canvas && this.y < 0) this.y = canvas.height;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            const count = (window.innerWidth * window.innerHeight) / 15000;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
};

export default function LandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const sections = [
        { id: "home", label: "Home" },
        { id: "about", label: "About Us" },
        { id: "contact", label: "Contact" }
    ];

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-200 selection:bg-blue-500/30 font-sans">
            <ParticleBackground />

            {/* Navigation */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#050B14]/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Brain size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white uppercase">Medi<span className="text-teal-400">AI</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {sections.map(s => (
                            <a key={s.id} href={`#${s.id}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{s.label}</a>
                        ))}
                        <button
                            onClick={() => router.push("/login")}
                            className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/10"
                        >
                            Investor Portal
                        </button>
                    </nav>

                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-[#050B14] border-b border-white/10 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top duration-300">
                        {sections.map(s => (
                            <a key={s.id} href={`#${s.id}`} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-400 hover:text-white">{s.label}</a>
                        ))}
                        <button onClick={() => router.push("/login")} className="w-full py-3 bg-white text-black rounded-xl font-bold">Investor Portal</button>
                    </div>
                )}
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section id="home" className="min-h-screen flex items-center pt-20">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Sparkles size={14} />
                                Next Generation Healthcare
                            </div>
                            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                                Intelligence that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Heals.</span>
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                Medi AI is redefining clinical diagnostic infrastructure. We provide institutional-grade medical reasoning and predictive analysis to healthcare systems globally.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                                <button onClick={() => router.push("/login")} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20">
                                    Get Started
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <a href="#about" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all flex items-center justify-center">
                                    Learn More
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[80%] hidden lg:block opacity-50 blur-[100px] pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full animate-pulse delay-700" />
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about" className="py-32 relative border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Pioneering the Future of <span className="text-blue-400">Precision Medicine</span>.</h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Founded with a mission to eliminate diagnostic errors, Medi AI combines advanced neural networks with rigorous clinical expertise. Our systems analyze millions of data points in milliseconds to assist clinicians in providing the highest standard of care.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        { icon: <Activity size={20} />, title: "Clinical Reasoning", desc: "Advanced AI models trained on verified medical data." },
                                        { icon: <Shield size={20} />, title: "Enterprise Security", desc: "HIPAA and GDPR compliant data processing." },
                                        { icon: <Users size={20} />, title: "Collaborative Care", desc: "Integrated tools for medical professional teams." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                                <p className="text-sm text-slate-500">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square rounded-[40px] bg-gradient-to-tr from-blue-600/20 to-teal-400/20 border border-white/10 backdrop-blur-3xl p-1 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
                                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                                        <div className="p-8 backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Diagnostics</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="w-3/4 h-full bg-blue-500" />
                                                </div>
                                                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="w-1/2 h-full bg-teal-400" />
                                                </div>
                                                <div className="w-56 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="w-5/6 h-full bg-blue-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600 blur-[80px] rounded-full opacity-30 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-32 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-12 tracking-tighter">Ready to partner with the <span className="italic">Frontier.</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                            {[
                                { icon: <Mail />, label: "Investor Relations", value: "medicalhealthcare2026@gmail.com" },
                                { icon: <Globe />, label: "Global Presence", value: "Azerbaijan • Baku • Ganja" },
                                { icon: <Users />, label: "Enterprise Support", value: "medicalhealthcare2026@gmail.com" }
                            ].map((c, i) => (
                                <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 flex flex-col items-center group">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                        {c.icon}
                                    </div>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">{c.label}</p>
                                    <p className="text-lg md:text-xl text-white font-medium break-all md:break-normal">{c.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-12 rounded-[40px] bg-gradient-to-br from-blue-600 to-teal-500 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                            <h3 className="text-3xl font-bold text-white mb-6 relative z-10">Limited Access Investor Portal</h3>
                            <p className="text-blue-50 mb-10 max-w-xl mx-auto relative z-10 opacity-90 text-lg">
                                Access our performance data, clinical validation studies, and upcoming Series B roadmap. Credentials required.
                            </p>
                            <button onClick={() => router.push("/login")} className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all active:scale-95 relative z-10">
                                Access Dashboard
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Brain size={24} className="text-blue-500" />
                        <span className="text-lg font-bold text-white uppercase tracking-tighter">MediAI <span className="text-slate-500 font-normal">Corp.</span></span>
                    </div>
                    <div className="flex gap-10 text-sm font-medium text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Ethics & AI</a>
                    </div>
                    <p className="text-sm text-slate-600">© 2026 Medi AI Clinical Research. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
