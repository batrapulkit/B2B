import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { Plane, ArrowRight, Sparkles, Globe2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  // --- Cursor parallax effect ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      x.set(e.clientX - innerWidth / 2);
      y.set(e.clientY - innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-screen overflow-hidden bg-[#050507] text-white perspective-[1200px]"
    >
      {/* --- Animated background lighting --- */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(255,100,200,0.25), transparent 60%)",
            "radial-gradient(circle at 70% 60%, rgba(100,150,255,0.25), transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(255,100,200,0.25), transparent 60%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* --- Hero content layout --- */}
      <section className="absolute inset-0 flex flex-col md:flex-row items-center justify-between w-full h-full px-10 md:px-24">
        {/* LEFT SIDE */}
        <motion.div
          className="flex flex-col justify-center w-full md:w-1/2 h-full space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/40">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Triponic</h1>
          </div>

          <h2 className="text-6xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-pink-400 via-blue-400 to-cyan-300 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-x">
            The Intelligence <br /> Behind Modern Travel
          </h2>

          <p className="text-gray-300 text-lg max-w-md leading-relaxed">
            Triponic automates travel planning, analytics, and operations for
            agencies and explorers — powered by adaptive AI and real-time data.
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-4">
            <a
              href={isAuthenticated ? "/dashboard" : "/signin"}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-full font-semibold text-white shadow-lg hover:scale-105 hover:shadow-pink-500/40 transition-all duration-300"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 rounded-full text-white/80 font-medium hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* RIGHT SIDE GLOBE VISUAL */}
        <motion.div
          className="relative flex items-center justify-center w-full md:w-1/2 h-full"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Pulsing ring */}
          <motion.div
            className="absolute w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-400/10 blur-[100px]"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Rotating glass orb */}
          <motion.div
            className="relative w-[400px] h-[400px] rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_0_80px_-10px_rgba(255,255,255,0.25)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
          />
          <Globe2 className="absolute w-48 h-48 text-white/30" />
        </motion.div>
      </section>

      {/* ---- Bottom Feature Bar ---- */}
      <div className="absolute bottom-0 left-0 w-full h-20 flex items-center justify-around bg-black/20 backdrop-blur-lg border-t border-white/10">
        {[
          { icon: "🧠", label: "AI Planner", color: "text-pink-400" },
          { icon: "💼", label: "Agency CRM", color: "text-purple-400" },
          { icon: "📊", label: "Analytics", color: "text-blue-400" },
          { icon: "🌍", label: "Live Bookings", color: "text-cyan-400" },
          { icon: "⚙️", label: "Automation", color: "text-indigo-400" },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-2 text-sm md:text-base ${item.color} hover:scale-110 transition-transform duration-300`}
            whileHover={{ y: -3 }}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </motion.div>
        ))}
      </div>

      {/* Gradient animation keyframes */}
      <style jsx>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </motion.div>
  );
}
