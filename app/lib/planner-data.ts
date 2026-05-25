export const THEMES = [
  { id: "rose",   label: "Rose Dream",  bg: "bg-rose-100",    ring: "ring-rose-300",    dot: "bg-rose-300",    text: "text-rose-600",    btn: "bg-rose-400 hover:bg-rose-500",    soft: "bg-rose-50",    header: "from-rose-200 to-rose-100",    badge: "bg-rose-200 text-rose-700" },
  { id: "violet", label: "Violet Mist", bg: "bg-violet-100",  ring: "ring-violet-300",  dot: "bg-violet-300",  text: "text-violet-600",  btn: "bg-violet-400 hover:bg-violet-500",  soft: "bg-violet-50",  header: "from-violet-200 to-violet-100",  badge: "bg-violet-200 text-violet-700" },
  { id: "sky",    label: "Sky Calm",    bg: "bg-sky-100",     ring: "ring-sky-300",     dot: "bg-sky-300",     text: "text-sky-600",     btn: "bg-sky-400 hover:bg-sky-500",     soft: "bg-sky-50",     header: "from-sky-200 to-sky-100",     badge: "bg-sky-200 text-sky-700" },
  { id: "mint",   label: "Mint Fresh",  bg: "bg-emerald-100", ring: "ring-emerald-300", dot: "bg-emerald-300", text: "text-emerald-600", btn: "bg-emerald-400 hover:bg-emerald-500", soft: "bg-emerald-50", header: "from-emerald-200 to-emerald-100", badge: "bg-emerald-200 text-emerald-700" },
  { id: "peach",  label: "Peach Glow",  bg: "bg-orange-100",  ring: "ring-orange-300",  dot: "bg-orange-300",  text: "text-orange-500",  btn: "bg-orange-400 hover:bg-orange-500",  soft: "bg-orange-50",  header: "from-orange-200 to-orange-100",  badge: "bg-orange-200 text-orange-700" },
  { id: "lemon",  label: "Lemon Zest",  bg: "bg-yellow-100",  ring: "ring-yellow-300",  dot: "bg-yellow-300",  text: "text-yellow-600",  btn: "bg-yellow-400 hover:bg-yellow-500",  soft: "bg-yellow-50",  header: "from-yellow-200 to-yellow-100",  badge: "bg-yellow-200 text-yellow-700" },
] as const;

export type Theme = (typeof THEMES)[number];

export const FEATURES = [
  { id: "big3",    emoji: "🎯", label: "ตาราง Big 3",             desc: "โฟกัส 3 งานสำคัญของวัน",              placeholder: ["งานสำคัญที่ 1", "งานสำคัญที่ 2", "งานสำคัญที่ 3"] },
  { id: "content", emoji: "💡", label: "ตารางไอเดียคอนเทนต์",    desc: "รวบรวมไอเดียคอนเทนต์ครีเอทีฟ",        placeholder: ["ไอเดีย A", "ไอเดีย B", "ไอเดีย C"] },
  { id: "habit",   emoji: "✅", label: "Habit Tracker",           desc: "ติดตามนิสัยดีๆ รายวัน",               placeholder: ["ออกกำลังกาย", "อ่านหนังสือ", "ดื่มน้ำ 8 แก้ว"] },
  { id: "goal",    emoji: "🌟", label: "Goal Planner",            desc: "วางแผนเป้าหมายระยะสั้น-ยาว",          placeholder: ["เป้าหมาย 1 เดือน", "เป้าหมาย 3 เดือน", "เป้าหมาย 1 ปี"] },
  { id: "brain",   emoji: "🧠", label: "Brain Dump",              desc: "ระบายความคิดก่อนเริ่มงาน",            placeholder: ["เขียนทุกอย่างที่คิดได้...", "", ""] },
  { id: "weekly",  emoji: "📅", label: "Weekly Review",           desc: "สรุปสัปดาห์ วางแผนสัปดาห์หน้า",      placeholder: ["สิ่งที่ทำได้ดี", "สิ่งที่ต้องปรับปรุง", "แผนสัปดาห์หน้า"] },
  { id: "mood",    emoji: "🌈", label: "Mood Tracker",            desc: "บันทึกอารมณ์และพลังงานรายวัน",        placeholder: ["😊 ดีมาก", "😐 ปกติ", "😴 เหนื่อย"] },
  { id: "finance", emoji: "💰", label: "Budget Snapshot",         desc: "จดรายรับ-รายจ่ายแบบเร็ว",             placeholder: ["รายรับ", "รายจ่ายคงที่", "รายจ่ายผันแปร"] },
] as const;

export type Feature = (typeof FEATURES)[number];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function getFeatures(ids: string[]): Feature[] {
  return ids.map((id) => FEATURES.find((f) => f.id === id)).filter(Boolean) as Feature[];
}
