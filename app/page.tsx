"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, FEATURES, type Theme } from "./lib/planner-data";

export default function Home() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set(["big3", "content"]));
  const [loading, setLoading] = useState(false);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBuild = () => {
    if (selectedFeatures.size === 0 || loading) return;
    setLoading(true);
    const params = new URLSearchParams({
      theme: selectedTheme.id,
      features: Array.from(selectedFeatures).join(","),
    });
    setTimeout(() => router.push(`/dashboard?${params.toString()}`), 800);
  };

  const theme = selectedTheme;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.soft} font-sans`}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗓️</span>
          <span className={`font-bold text-lg ${theme.text}`}>PlannerAI</span>
        </div>
        <button className={`text-sm px-5 py-2 rounded-full text-white font-medium transition-colors duration-300 ${theme.btn}`}>
          เริ่มต้นฟรี
        </button>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <span className={`inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 ${theme.bg} ${theme.text}`}>
          ✨ Smart Planner สำหรับคนที่อยากโฟกัส
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight mb-5">
          แพลนเนอร์ที่{" "}
          <span className={theme.text}>ออกแบบมาเพื่อคุณ</span>
          <br />โดยเฉพาะ
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          เลือกธีมสีที่ใช่ เลือกฟีเจอร์ที่ชอบ แล้วให้เราสร้าง
          แพลนเนอร์อัจฉริยะที่เหมาะกับไลฟ์สไตล์ของคุณในทันที
        </p>
      </section>

      {/* Interactive Builder */}
      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-10">
        {/* Step 1 — Theme */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${theme.btn}`}>1</span>
            <h2 className="text-xl font-bold text-gray-700">เลือกธีมสีที่ชอบ</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${
                  selectedTheme.id === t.id
                    ? `${t.bg} border-transparent ring-2 ${t.ring} scale-105 shadow-md`
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-full ${t.dot}`} />
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
          <div className={`mt-6 rounded-2xl p-4 flex items-center gap-4 transition-colors duration-500 ${theme.bg}`}>
            <span className="text-2xl">🗒️</span>
            <div>
              <p className={`font-semibold text-sm ${theme.text}`}>ตัวอย่างธีม: {theme.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">สีนี้จะใช้ตลอดทั้งแอปของคุณ</p>
            </div>
            <div className="ml-auto flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`w-3 h-3 rounded-full ${theme.dot}`} style={{ opacity: i === 1 ? 1 : i === 2 ? 0.6 : 0.3 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Step 2 — Features */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${theme.btn}`}>2</span>
            <h2 className="text-xl font-bold text-gray-700">เลือกฟีเจอร์ที่ต้องการ</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6 ml-11">เลือกได้หลายรายการ ปรับได้ทุกเมื่อหลังสร้างแอป</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => {
              const active = selectedFeatures.has(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFeature(f.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    active
                      ? `${theme.bg} border-transparent ring-1 ${theme.ring}`
                      : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                    active ? `${theme.btn} border-transparent` : "border-gray-300 bg-white"
                  }`}>
                    {active && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-xl">{f.emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${active ? theme.text : "text-gray-700"}`}>{f.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedFeatures.size > 0 && (
            <p className={`mt-4 text-xs font-medium ${theme.text}`}>
              ✓ เลือกแล้ว {selectedFeatures.size} ฟีเจอร์
            </p>
          )}
        </div>

        {/* Step 3 — CTA */}
        <div className="text-center">
          <button
            onClick={handleBuild}
            disabled={selectedFeatures.size === 0 || loading}
            className={`inline-flex items-center gap-3 px-10 py-5 rounded-full text-white text-lg font-bold shadow-lg transition-all duration-300 ${
              selectedFeatures.size === 0 || loading
                ? "bg-gray-300 cursor-not-allowed"
                : `${theme.btn} hover:scale-105 hover:shadow-xl active:scale-95`
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              <>
                <span className="text-2xl">✨</span>
                สร้างแอปแพลนเนอร์ส่วนตัวของฉัน
                <span className="text-2xl">→</span>
              </>
            )}
          </button>
          {selectedFeatures.size === 0 && (
            <p className="text-xs text-gray-400 mt-3">กรุณาเลือกฟีเจอร์อย่างน้อย 1 รายการ</p>
          )}
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          {[
            { stat: "12,400+", label: "ผู้ใช้งานแล้ว" },
            { stat: "4.9★", label: "คะแนนความพึงพอใจ" },
            { stat: "ฟรี", label: "ไม่ต้องใช้บัตรเครดิต" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-extrabold ${theme.text}`}>{s.stat}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-400 pb-8">
        © 2026 PlannerAI · Made with ✨ for productive people
      </footer>
    </div>
  );
}
