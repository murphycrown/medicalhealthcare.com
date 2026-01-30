"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User, Send, Brain, ChevronRight, Loader2, Menu, X } from "lucide-react";

// --- Particle Animation Component (Reused from landing page for consistency) ---
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
            const particleCount = (window.innerWidth * window.innerHeight) / 10000;
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

            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(59, 130, 246, ${1 - (distance / 100) * 0.3})`;
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
            className="absolute inset-0 pointer-events-none z-0 opacity-30"
        />
    );
};

// --- Dashboard Components ---

const SidebarItem = ({ icon, label, id, active, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${active
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
    >
        <div className={`${active ? "text-blue-400" : "text-slate-500"}`}>{icon}</div>
        <span className="font-medium">{label}</span>
    </button>
);

const StatCard = ({ title, value, unit, icon, color, trend }: any) => (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-3xl group hover:border-white/20 transition-all duration-500">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            {trend && (
                <span className={`text-[10px] px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trend}
                </span>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                <span className="text-slate-500 text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

const MessageBubble = ({ role, content, time }: any) => (
    <div className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} mb-6 group animate-in slide-in-from-bottom-2 duration-300`}>
        <div className={`flex items-start gap-3 max-w-[85%] ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${role === 'user'
                ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                : "bg-teal-500/20 border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                }`}>
                {role === 'user' ? <User size={14} /> : <Brain size={14} />}
            </div>

            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${role === 'user'
                ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10"
                : "bg-white/[0.03] border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md shadow-xl"
                }`}>
                <div className={`prose prose-invert prose-sm max-w-none ${role === 'user' ? '[&_p]:text-white' : '[&_p]:text-slate-200'}`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="mb-0 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 my-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 my-2">{children}</ol>,
                            code: (props: any) => {
                                const { children, className, node, ...rest } = props;
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto my-2 border border-white/5">
                                        <code className={className} {...rest}>{children}</code>
                                    </pre>
                                ) : (
                                    <code className="bg-white/10 px-1 py-0.5 rounded text-teal-300" {...rest}>{children}</code>
                                )
                            },
                            table: ({ children }) => (
                                <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
                                    <table className="w-full text-left border-collapse">{children}</table>
                                </div>
                            ),
                            th: ({ children }) => <th className="bg-white/5 p-2 text-xs font-bold border-b border-white/10">{children}</th>,
                            td: ({ children }) => <td className="p-2 text-xs border-b border-white/5">{children}</td>,
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
        <span className={`text-[10px] text-slate-500 mt-2 px-11 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            {time}
        </span>
    </div>
);

// --- Main Page Component ---

export default function MainPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: 'Hi, I am your MediAI assistant. How can I help you today?', time: '10:30 AM' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading]);

    useEffect(() => {
        fetch("/api/me")
            .then(res => {
                if (!res.ok) throw new Error("Not logged in");
                return res.json();
            })
            .then(data => { setName(data.user.name); setEmail(data.user.email) })
            .catch(() => router.push("/login"));
    }, [router]);
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistory(prev => [...prev, userMessage]);
        const currentMessage = message;
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: currentMessage }),
            });

            if (!response.ok) throw new Error("API call failed");

            const aiText = await response.json();

            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: typeof aiText === 'string' ? aiText : (aiText.message || "I encountered an error."),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to the medical clinical system right now. Please try again later.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };


    const Signout = () => {
        fetch("/api/logout", { method: "POST" })
            .then(() => router.push("/"))
            .catch(() => alert("Failed to sign out"));
    };
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-200 flex overflow-hidden relative">
            <ParticleBackground />

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-30 p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 backdrop-blur-md hover:bg-white/10 transition-colors"
            >
                <Menu size={20} />
            </button>

            {/* Backdrop */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Navigation Sidebar */}
            <aside className={`w-72 border-r border-white/10 backdrop-blur-2xl bg-black/20 flex flex-col p-6 z-50 fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M12 2v20M2 12h20" /><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Medi<span className="text-teal-400">AI</span></h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        id="overview"
                        label="Overview"
                        active={activeTab === "overview"}
                        onClick={setActiveTab}
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                    />
                    <SidebarItem
                        id="chat"
                        label="AI Assistant"
                        active={activeTab === "chat"}
                        onClick={setActiveTab}
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                    />
                    <SidebarItem
                        id="profile"
                        label="User Profile"
                        active={activeTab === "profile"}
                        onClick={setActiveTab}
                        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                    />
                </nav>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 border border-white/20 p-0.5">
                            <div className="w-full h-full rounded-full bg-[#050B14] flex items-center justify-center text-xs font-bold text-white">AC</div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-white">{name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{email}</p>
                        </div>
                    </div>
                    <button onClick={Signout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all text-sm font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <section className="flex-1 overflow-y-auto p-6 md:p-10 pt-20 lg:pt-10 z-10 relative">
                <div className="max-w-6xl mx-auto">

                    {activeTab === "overview" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <header className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Clinical Dashboard</h2>
                                    <p className="text-slate-400 mt-1">Systems are nominal. 12 data points analyzed today.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </header>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Heart Rate"
                                    value="72"
                                    unit="bpm"
                                    color="rose"
                                    trend="+2.4%"
                                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
                                />
                                <StatCard
                                    title="Sleep Efficiency"
                                    value="94"
                                    unit="%"
                                    color="blue"
                                    trend="+1.2%"
                                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
                                />
                                <StatCard
                                    title="Spo2 Levels"
                                    value="98"
                                    unit="%"
                                    color="teal"
                                    trend="+0.5%"
                                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16V8M8 12h8" /></svg>}
                                />
                                <StatCard
                                    title="Daily Activity"
                                    value="8,432"
                                    unit="steps"
                                    color="amber"
                                    trend="-4.1%"
                                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
                                />
                            </div>

                            {/* Main Analytics Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-colors duration-700" />
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                        AI Diagnostic Analysis Results
                                    </h3>

                                    <div className="space-y-6 relative z-10">
                                        {[
                                            { area: "Neurological Stability", score: 92, status: "Optimal", color: "text-blue-400" },
                                            { area: "Cardiovascular Rhythm", score: 85, status: "Monitor", color: "text-teal-400" },
                                            { area: "Metabolic Activity Index", score: 78, status: "Alert", color: "text-amber-400" },
                                        ].map((item, i) => (
                                            <div key={i} className="group/item">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-slate-300 font-medium">{item.area}</span>
                                                    <span className={`text-sm font-bold ${item.color}`}>{item.status}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-1000 ease-out`}
                                                        style={{ width: `${item.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">AI Recommendation</p>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">System suggests increasing hydration levels and scheduling a supplementary HRV scan by Friday.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
                                    <h3 className="text-xl font-bold text-white mb-6">Patient Pipeline</h3>
                                    <div className="space-y-4">
                                        {[
                                            { name: "John Doe", type: "Radiology", time: "09:00" },
                                            { name: "Sarah Smith", type: "Pathology", time: "11:30" },
                                            { name: "Mark Wilson", type: "General", time: "14:15" },
                                            { name: "Ellen White", type: "Genetics", time: "16:00" },
                                        ].map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-none">{p.name}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">{p.type}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-medium text-slate-600 group-hover:text-blue-400 transition-colors uppercase">{p.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                                        View All Rounds
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "chat" && (
                        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in zoom-in-[0.98] duration-700">
                            <div className="mb-8 flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)] animate-pulse" />
                                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">System Active</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                        AI Clinical Assistant
                                        <div className="px-2 py-0.5 rounded text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/20 uppercase tracking-tighter">v3.5-flash</div>
                                    </h2>
                                    <p className="text-slate-400 mt-1">Real-time medical reasoning and database retrieval.</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6 pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <div className="space-y-2">
                                    {chatHistory.map((chat, i) => (
                                        <MessageBubble key={i} {...chat} />
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3 mb-6 animate-pulse">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-teal-500/20 border-teal-500/30 text-teal-400">
                                                <Brain size={14} className="animate-spin-slow" />
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 rounded-tl-none backdrop-blur-md flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span className="text-xs font-medium italic">MediAI is analyzing...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            <div className="relative">
                                <form onSubmit={handleSendMessage} className="relative z-10">
                                    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 p-2 rounded-[32px] focus-within:border-blue-500/50 focus-within:bg-white/[0.05] transition-all shadow-2xl group/input">
                                        <div className="flex items-center gap-2">
                                            <div className="pl-4 text-slate-500">
                                                <Sparkles size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                disabled={isLoading}
                                                placeholder="Ask about patient records, diagnostic criteria, or medical literature..."
                                                className="flex-1 bg-transparent border-none outline-none py-4 text-sm text-white placeholder:text-slate-600 disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isLoading || !message.trim()}
                                                className="mr-1 p-3.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-800 disabled:to-slate-900 text-white rounded-[24px] transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:cursor-not-allowed group-hover/input:scale-105"
                                            >
                                                <Send size={18} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                                        {[
                                            { label: "Patient Summary", icon: <User size={12} /> },
                                            { label: "Analyze Lab Results", icon: <Brain size={12} /> },
                                            { label: "Search Literature", icon: <Sparkles size={12} /> }
                                        ].map((tag) => (
                                            <button
                                                key={tag.label}
                                                onClick={() => setMessage(tag.label)}
                                                disabled={isLoading}
                                                type="button"
                                                className="text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 px-4 py-2 rounded-xl transition-all bg-white/[0.02] hover:bg-white/[0.05] flex items-center gap-2"
                                            >
                                                {tag.icon}
                                                {tag.label}
                                            </button>
                                        ))}
                                    </div>
                                </form>
                                <div className="absolute -inset-4 bg-blue-500/5 blur-3xl rounded-full pointer-events-none -z-10" />
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center mb-10">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-teal-400 p-1 mb-6">
                                        <div className="w-full h-full rounded-[20px] bg-[#050B14] flex items-center justify-center text-4xl font-bold text-white">AC</div>
                                    </div>
                                    <button className="absolute bottom-4 right-[-10px] p-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl text-blue-400 hover:text-white hover:bg-blue-600 transition-all shadow-xl">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </button>
                                </div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{name}</h2>
                                <p className="text-teal-400 font-medium mt-1">Senior AI Clinician & Researcher</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-1">
                                        <p className="text-xs text-slate-500 uppercase font-black">Professional Email</p>
                                        <p className="text-white font-medium">{email}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-1">
                                        <p className="text-xs text-slate-500 uppercase font-black">Medical ID</p>
                                        <p className="text-white font-medium">MC-84920-AI</p>
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-6">Clinical Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["Advanced Cardiology", "AI Diagnostics", "Predictive Hematology", "Neural Imaging", "Genomic Sequencing"].map((s) => (
                                            <span key={s} className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-6">System Preferences</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-slate-300">Biometric Login</span>
                                            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                                <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-slate-300">AI Autopilot Analysis</span>
                                            <div className="w-12 h-6 bg-slate-800 rounded-full flex items-center px-1">
                                                <div className="w-4 h-4 bg-white/20 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-slate-300">HIPAA Data Masking</span>
                                            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                                <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        </main>
    );
}