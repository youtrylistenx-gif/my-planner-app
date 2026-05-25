"use client";

import { useState, useEffect, useCallback } from "react";
import { GridLayout, useContainerWidth, noCompactor, type Layout, type LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useRouter } from "next/navigation";
import { getTheme, type Theme } from "../lib/planner-data";
const LS_KEY = "planner-dashboard-v1";

// ── Types ──────────────────────────────────────────────────────────────────────

type WidgetType = "big3" | "brain" | "calendar" | "habit" | "goal" | "weekly" | "mood" | "finance";

interface CatalogItem {
  type: WidgetType;
  emoji: string;
  label: string;
  w: number; h: number;
  minW: number; minH: number;
}

const CATALOG: CatalogItem[] = [
  { type: "big3",     emoji: "🎯", label: "Big 3",          w: 4, h: 4, minW: 3, minH: 3 },
  { type: "brain",    emoji: "🧠", label: "Brain Dump",     w: 5, h: 4, minW: 3, minH: 3 },
  { type: "calendar", emoji: "📅", label: "Calendar",       w: 4, h: 5, minW: 3, minH: 4 },
  { type: "habit",    emoji: "✅", label: "Habit Tracker",  w: 4, h: 5, minW: 3, minH: 3 },
  { type: "goal",     emoji: "🌟", label: "Goal Planner",   w: 4, h: 4, minW: 3, minH: 3 },
  { type: "weekly",   emoji: "📋", label: "Weekly Review",  w: 6, h: 5, minW: 4, minH: 4 },
  { type: "mood",     emoji: "🌈", label: "Mood Tracker",   w: 3, h: 3, minW: 2, minH: 2 },
  { type: "finance",  emoji: "💰", label: "Budget",         w: 4, h: 4, minW: 3, minH: 3 },
];

interface WidgetInstance { id: string; type: WidgetType; }

interface WidgetData {
  lines: string[];
  checked: boolean[];
  text: string;
  mood: string;
}

type DataMap = Record<string, WidgetData>;

interface Saved {
  layouts: LayoutItem[];
  widgets: WidgetInstance[];
  data: DataMap;
  themeId: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const genId = () => `w${Date.now()}${Math.random().toString(36).slice(2, 5)}`;

function defaultData(type: WidgetType): WidgetData {
  switch (type) {
    case "big3":     return { lines: ["", "", ""],                            checked: [false, false, false], text: "", mood: "" };
    case "habit":    return { lines: ["ออกกำลังกาย", "อ่านหนังสือ", "ดื่มน้ำ"], checked: [false, false, false], text: "", mood: "" };
    case "goal":     return { lines: ["", "", ""],                            checked: [false, false, false], text: "", mood: "" };
    case "weekly":   return { lines: ["", "", ""],                            checked: [],                    text: "", mood: "" };
    case "brain":    return { lines: [],                                      checked: [],                    text: "",  mood: "" };
    case "mood":     return { lines: [],                                      checked: [],                    text: "", mood: "" };
    case "finance":  return { lines: ["", ""],                                checked: [],                    text: "", mood: "" };
    default:         return { lines: [],                                      checked: [],                    text: "", mood: "" };
  }
}

function findFreeY(layouts: LayoutItem[]): number {
  return layouts.reduce((m, l) => Math.max(m, l.y + l.h), 0);
}

// ── Widget content components ──────────────────────────────────────────────────

interface WProps { data: WidgetData; theme: Theme; onChange: (d: Partial<WidgetData>) => void; }

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Big3Content({ data, theme, onChange }: WProps) {
  const lines = data.lines.length >= 3 ? data.lines : ["", "", ""];
  const checked = data.checked.length >= 3 ? data.checked : [false, false, false];
  return (
    <div className="p-3 space-y-3">
      {[0, 1, 2].map((i) => (
        <label key={i} className="flex items-center gap-2.5 cursor-pointer">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { const n = [...checked]; n[i] = !n[i]; onChange({ checked: n }); }}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${checked[i] ? `${theme.btn} border-transparent` : "border-gray-300 bg-white"}`}
          >
            {checked[i] && <CheckIcon />}
          </button>
          <input
            value={lines[i] ?? ""}
            onChange={(e) => { const n = [...lines]; n[i] = e.target.value; onChange({ lines: n }); }}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={`งานสำคัญที่ ${i + 1}`}
            className={`flex-1 bg-transparent border-b text-sm outline-none py-1 placeholder-gray-300 transition-colors ${checked[i] ? "line-through text-gray-300 border-gray-100" : "text-gray-700 border-gray-200 focus:border-gray-400"}`}
          />
        </label>
      ))}
    </div>
  );
}

function BrainDumpContent({ data, onChange }: WProps) {
  return (
    <div className="p-3 h-full">
      <textarea
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="เขียนทุกอย่างที่คิดอยู่ในหัว..."
        className="w-full h-full resize-none bg-transparent text-sm text-gray-700 outline-none placeholder-gray-300 leading-relaxed"
      />
    </div>
  );
}

function CalendarContent({ theme }: WProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return (
    <div className="p-3 overflow-auto select-none">
      <p className={`text-xs font-bold text-center mb-2 ${theme.text}`}>{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
          <span key={d} className="text-[9px] text-gray-400 font-semibold py-0.5">{d}</span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`text-[11px] rounded-full w-5 h-5 flex items-center justify-center mx-auto leading-none ${
              d === today.getDate() ? `${theme.btn} text-white font-bold` : d ? "text-gray-600 hover:bg-gray-100 cursor-pointer" : ""
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

function HabitContent({ data, theme, onChange }: WProps) {
  const habits = data.lines.length > 0 ? data.lines : ["ออกกำลังกาย", "อ่านหนังสือ", "ดื่มน้ำ 8 แก้ว"];
  const checked = habits.map((_, i) => data.checked[i] ?? false);
  return (
    <div className="p-3 space-y-2 overflow-auto">
      {habits.map((h, i) => (
        <label key={i} className="flex items-center gap-2 cursor-pointer">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { const n = [...checked]; n[i] = !n[i]; onChange({ checked: n }); }}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${checked[i] ? `${theme.btn} border-transparent` : "border-gray-300 bg-white"}`}
          >
            {checked[i] && <CheckIcon />}
          </button>
          <input
            value={h}
            onChange={(e) => { const n = [...habits]; n[i] = e.target.value; onChange({ lines: n }); }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`flex-1 bg-transparent text-sm outline-none py-0.5 ${checked[i] ? "line-through text-gray-300" : "text-gray-700"}`}
          />
        </label>
      ))}
      {habits.length < 7 && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onChange({ lines: [...habits, ""], checked: [...checked, false] })}
          className={`text-xs font-medium mt-1 ${theme.text} opacity-60 hover:opacity-100 transition-opacity`}
        >
          + เพิ่มนิสัย
        </button>
      )}
    </div>
  );
}

function GoalContent({ data, theme, onChange }: WProps) {
  const goals = data.lines.length >= 3 ? data.lines : ["", "", ""];
  const checked = goals.map((_, i) => data.checked[i] ?? false);
  return (
    <div className="p-3 space-y-2.5 overflow-auto">
      {goals.map((g, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { const n = [...checked]; n[i] = !n[i]; onChange({ checked: n }); }}
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${checked[i] ? `${theme.btn} border-transparent` : "border-gray-300 bg-white"}`}
          >
            {checked[i] && <CheckIcon />}
          </button>
          <input
            value={g}
            onChange={(e) => { const n = [...goals]; n[i] = e.target.value; onChange({ lines: n }); }}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={`เป้าหมายที่ ${i + 1}`}
            className={`flex-1 bg-transparent text-sm outline-none py-1 border-b border-gray-100 focus:border-gray-300 placeholder-gray-300 transition-colors ${checked[i] ? "line-through text-gray-300" : "text-gray-700"}`}
          />
        </div>
      ))}
    </div>
  );
}

function WeeklyContent({ data, theme, onChange }: WProps) {
  const sections = ["🏆 สิ่งที่ทำได้ดี", "🔧 สิ่งที่ต้องปรับ", "📌 แผนสัปดาห์หน้า"];
  const lines = data.lines.length >= 3 ? data.lines : ["", "", ""];
  return (
    <div className="p-3 grid grid-rows-3 gap-2 h-full overflow-auto">
      {sections.map((s, i) => (
        <div key={i} className={`rounded-xl p-2 ${theme.soft}`}>
          <p className={`text-[10px] font-bold mb-1 ${theme.text}`}>{s}</p>
          <textarea
            value={lines[i]}
            onChange={(e) => { const n = [...lines]; n[i] = e.target.value; onChange({ lines: n }); }}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="เขียนที่นี่..."
            rows={2}
            className="w-full bg-transparent text-xs text-gray-600 outline-none resize-none placeholder-gray-300 leading-relaxed"
          />
        </div>
      ))}
    </div>
  );
}

function MoodContent({ data, theme, onChange }: WProps) {
  const moods = ["😊", "😄", "😌", "😐", "😔", "😩"];
  return (
    <div className="p-3 flex flex-col items-center justify-center gap-3 h-full">
      <p className="text-xs text-gray-400 font-medium">วันนี้รู้สึกอย่างไร?</p>
      <div className="flex gap-1.5 flex-wrap justify-center">
        {moods.map((m) => (
          <button
            key={m}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onChange({ mood: m })}
            className={`text-xl rounded-xl p-1.5 transition-all ${data.mood === m ? `${theme.bg} scale-125 shadow-sm` : "hover:scale-110"}`}
          >
            {m}
          </button>
        ))}
      </div>
      {data.mood && <p className={`text-sm font-bold ${theme.text}`}>{data.mood} วันนี้</p>}
    </div>
  );
}

function FinanceContent({ data, theme, onChange }: WProps) {
  const income  = parseFloat(data.lines[0] ?? "") || 0;
  const expense = parseFloat(data.lines[1] ?? "") || 0;
  const balance = income - expense;
  const rows = [
    { label: "💚 รายรับ",   idx: 0 },
    { label: "❤️ รายจ่าย", idx: 1 },
  ];
  return (
    <div className="p-3 space-y-2.5 overflow-auto">
      {rows.map(({ label, idx }) => (
        <div key={idx}>
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <div className={`flex items-center gap-1 rounded-xl px-3 py-2 ${theme.soft}`}>
            <span className="text-xs font-semibold text-gray-500">฿</span>
            <input
              type="number"
              value={data.lines[idx] ?? ""}
              onChange={(e) => { const n = [...(data.lines.length >= 2 ? data.lines : ["", ""])]; n[idx] = e.target.value; onChange({ lines: n }); }}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="0"
              className="flex-1 bg-transparent text-sm font-medium text-gray-700 outline-none"
            />
          </div>
        </div>
      ))}
      <div className={`rounded-xl px-3 py-2.5 ${balance >= 0 ? theme.bg : "bg-rose-100"}`}>
        <p className="text-[10px] text-gray-500 mb-0.5">คงเหลือ</p>
        <p className={`text-base font-bold ${balance >= 0 ? theme.text : "text-rose-600"}`}>
          ฿{balance.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ── Widget frame ───────────────────────────────────────────────────────────────

function WidgetFrame({
  id, type, theme, data, onRemove, onDataChange,
}: {
  id: string; type: WidgetType; theme: Theme;
  data: WidgetData;
  onRemove: (id: string) => void;
  onDataChange: (id: string, d: Partial<WidgetData>) => void;
}) {
  const cat = CATALOG.find((c) => c.type === type)!;
  const handleChange = (d: Partial<WidgetData>) => onDataChange(id, d);

  function renderContent() {
    const props: WProps = { data, theme, onChange: handleChange };
    switch (type) {
      case "big3":     return <Big3Content     {...props} />;
      case "brain":    return <BrainDumpContent {...props} />;
      case "calendar": return <CalendarContent  {...props} />;
      case "habit":    return <HabitContent     {...props} />;
      case "goal":     return <GoalContent      {...props} />;
      case "weekly":   return <WeeklyContent    {...props} />;
      case "mood":     return <MoodContent      {...props} />;
      case "finance":  return <FinanceContent   {...props} />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Drag handle */}
      <div className={`drag-handle flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing select-none flex-shrink-0 ${theme.bg}`}>
        <span className="text-sm">{cat.emoji}</span>
        <span className={`text-xs font-bold flex-1 ${theme.text}`}>{cat.label}</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(id)}
          className="w-5 h-5 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-gray-400 hover:text-rose-400 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">{renderContent()}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props { themeId: string; initialFeatureIds: string[]; }

export default function DashboardCanvas({ themeId, initialFeatureIds }: Props) {
  const router  = useRouter();
  const theme   = getTheme(themeId);
  const [layouts, setLayouts]   = useState<LayoutItem[]>([]);
  const [widgets, setWidgets]   = useState<WidgetInstance[]>([]);
  const [dataMap, setDataMap]   = useState<DataMap>({});
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [mounted, setMounted]   = useState(false);
  const { width: canvasWidth, containerRef } = useContainerWidth({ measureBeforeMount: false, initialWidth: 1200 });

  useEffect(() => {
    setMounted(true);
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (raw) {
      try {
        const stored: Saved = JSON.parse(raw);
        setLayouts(stored.layouts ?? []);
        setWidgets(stored.widgets ?? []);
        setDataMap(stored.data ?? {});
        return;
      } catch { /* ignore corrupt data */ }
    }
    // First visit — seed from selected features
    const types = initialFeatureIds.filter((id): id is WidgetType =>
      CATALOG.some((c) => c.type === id)
    );
    if (types.length === 0) return;
    const newWidgets: WidgetInstance[] = types.map((type) => ({ id: genId(), type }));
    const newLayouts: LayoutItem[] = [];
    const newData: DataMap = {};
    let cx = 0, cy = 0;
    newWidgets.forEach(({ id, type }) => {
      const cat = CATALOG.find((c) => c.type === type)!;
      if (cx + cat.w > 12) { cx = 0; cy += cat.h + 1; }
      newLayouts.push({ i: id, x: cx, y: cy, w: cat.w, h: cat.h, minW: cat.minW, minH: cat.minH });
      newData[id] = defaultData(type);
      cx += cat.w;
    });
    setWidgets(newWidgets);
    setLayouts(newLayouts);
    setDataMap(newData);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(() => {
    const payload: Saved = { layouts, widgets, data: dataMap, themeId };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2200);
  }, [layouts, widgets, dataMap, themeId]);

  const addWidget = (type: WidgetType) => {
    const cat = CATALOG.find((c) => c.type === type)!;
    const id  = genId();
    const y   = findFreeY(layouts);
    setWidgets((p) => [...p, { id, type }]);
    setLayouts((p): LayoutItem[] => [...p, { i: id, x: 0, y, w: cat.w, h: cat.h, minW: cat.minW, minH: cat.minH }]);
    setDataMap((p) => ({ ...p, [id]: defaultData(type) }));
  };

  const removeWidget = (id: string) => {
    setWidgets((p) => p.filter((w) => w.id !== id));
    setLayouts((p) => p.filter((l) => l.i !== id));
    setDataMap((p) => { const n = { ...p }; delete n[id]; return n; });
  };

  const handleDataChange = (id: string, patch: Partial<WidgetData>) => {
    setDataMap((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  };

  if (!mounted) return null;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${theme.soft}`}>
      {/* ── Top bar ── */}
      <header className={`flex items-center gap-3 px-5 py-3 bg-gradient-to-r ${theme.header} border-b border-white/70 flex-shrink-0 shadow-sm`}>
        <span className="text-xl">🗓️</span>
        <span className={`font-extrabold text-base ${theme.text} flex-1`}>PlannerAI</span>
        <span className={`hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>{theme.label}</span>
        <button
          onClick={save}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white transition-all duration-300 ${saveState === "saved" ? "bg-emerald-400 scale-95" : `${theme.btn} hover:scale-105`}`}
        >
          {saveState === "saved" ? "✓ บันทึกแล้ว!" : "💾 บันทึก"}
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← กลับ
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-48 flex-shrink-0 bg-white/80 border-r border-gray-100 overflow-y-auto">
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Widget</p>
            <div className="space-y-1">
              {CATALOG.map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => addWidget(cat.type)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left bg-gray-50 border border-gray-100 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 flex-1">{cat.label}</span>
                  <span className={`text-xs font-bold ${theme.text}`}>+</span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
              <button
                onClick={save}
                className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all ${theme.btn} hover:opacity-90`}
              >
                💾 บันทึก Layout
              </button>
              <button
                onClick={() => {
                  if (!window.confirm("ล้าง Layout ทั้งหมด?")) return;
                  setWidgets([]);
                  setLayouts([]);
                  setDataMap({});
                  localStorage.removeItem(LS_KEY);
                }}
                className="w-full py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                🗑 ล้างทั้งหมด
              </button>
            </div>
          </div>
        </aside>

        {/* ── Canvas ── */}
        <main className="flex-1 overflow-auto relative" ref={containerRef}>
          {widgets.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
              <span className="text-7xl opacity-20 select-none">📋</span>
              <p className="text-gray-400 text-sm font-medium max-w-xs">
                เลือก Widget จากแถบด้านซ้ายแล้วลากจัดวางได้อิสระ
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CATALOG.slice(0, 3).map((c) => (
                  <button
                    key={c.type}
                    onClick={() => addWidget(c.type)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${theme.badge} hover:opacity-80 transition-opacity`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <GridLayout
              width={canvasWidth}
              layout={layouts as Layout}
              gridConfig={{ cols: 12, rowHeight: 56, margin: [12, 12] as [number,number], containerPadding: [16, 16] as [number,number], maxRows: Infinity }}
              dragConfig={{ enabled: true, handle: ".drag-handle", bounded: false, threshold: 3 }}
              resizeConfig={{ enabled: true, handles: ["se"] }}
              compactor={noCompactor}
              onLayoutChange={(newLayout) => setLayouts([...newLayout])}
            >
              {widgets.map((w) => (
                <div key={w.id}>
                  <WidgetFrame
                    id={w.id}
                    type={w.type}
                    theme={theme}
                    data={dataMap[w.id] ?? defaultData(w.type)}
                    onRemove={removeWidget}
                    onDataChange={handleDataChange}
                  />
                </div>
              ))}
            </GridLayout>
          )}
        </main>
      </div>
    </div>
  );
}
