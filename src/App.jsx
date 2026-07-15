import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
} from "lucide-react";

// ---------- Utility ----------
const formatMoney = (n) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const STORAGE_KEY = "debt-tracker:records";

// ---------- Main Component ----------
export default function DebtTracker() {
  const [tab, setTab] = useState("owe"); // "owe" = เราติดหนี้เขา, "owed" = เขาติดหนี้เรา
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [saveError, setSaveError] = useState("");

  // Load from localStorage (ข้อมูลจะถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRecords(JSON.parse(raw));
      }
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  const persist = (next) => {
    setRecords(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      setSaveError("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setTimeout(() => setSaveError(""), 3000);
    }
  };

  const filtered = useMemo(
    () =>
      records
        .filter((r) => r.type === tab)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [records, tab],
  );

  const totals = useMemo(() => {
    const owe = records
      .filter((r) => r.type === "owe")
      .reduce((s, r) => s + Number(r.amount), 0);
    const owed = records
      .filter((r) => r.type === "owed")
      .reduce((s, r) => s + Number(r.amount), 0);
    return { owe, owed, net: owed - owe };
  }, [records]);

  const openAddForm = () => {
    setEditingId(null);
    setNameInput("");
    setAmountInput("");
    setNoteInput("");
    setShowForm(true);
  };

  const openEditForm = (r) => {
    setEditingId(r.id);
    setNameInput(r.name);
    setAmountInput(String(r.amount));
    setNoteInput(r.note || "");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const submitForm = () => {
    const trimmedName = nameInput.trim();
    const amt = parseFloat(amountInput);
    if (!trimmedName) {
      setSaveError("กรุณากรอกชื่อ");
      setTimeout(() => setSaveError(""), 2500);
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setSaveError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      setTimeout(() => setSaveError(""), 2500);
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      const next = records.map((r) =>
        r.id === editingId
          ? {
              ...r,
              name: trimmedName,
              amount: amt,
              note: noteInput.trim(),
              updatedAt: now,
            }
          : r,
      );
      persist(next);
    } else {
      const newRecord = {
        id: uid(),
        type: tab,
        name: trimmedName,
        amount: amt,
        note: noteInput.trim(),
        createdAt: now,
        updatedAt: now,
      };
      persist([newRecord, ...records]);
    }
    closeForm();
  };

  const deleteRecord = (id) => {
    persist(records.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
  };

  const isOweTab = tab === "owe";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(180deg,#EAF4FF 0%,#DCEBFC 40%,#EAF4FF 100%)",
      }}
    >
      <div className="max-w-md mx-auto pb-28">
        {/* Header */}
        <header
          className="sticky top-0 z-20 pt-14 pb-4 px-5"
          style={{
            background: "linear-gradient(180deg,#1E4FA8 0%,#2C63C7 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Wallet size={18} className="text-white" strokeWidth={2.2} />
            </div>
            <h1
              className="text-white font-semibold text-lg tracking-tight"
              style={{ fontFamily: "'Sarabun', sans-serif" }}
            >
              บันทึกหนี้สิน
            </h1>
          </div>
          <p className="text-blue-100 text-xs pt-2 pl-0 -mt-0.5">
            จัดการยอดหนี้ของคุณอย่างเป็นระบบ
          </p>

          {/* Net summary card */}
          <div className="mt-4 rounded-2xl bg-white/95 shadow-lg shadow-blue-900/20 px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
                ยอดสุทธิ
              </p>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: totals.net >= 0 ? "#0F9D58" : "#E0332B" }}
              >
                {totals.net >= 0 ? "+" : "-"}฿
                {formatMoney(Math.abs(totals.net))}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[11px] text-slate-400">เขาติดเรา</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#0F9D58" }}
                >
                  ฿{formatMoney(totals.owed)}
                </span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[11px] text-slate-400">เราติดเขา</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#E0332B" }}
                >
                  ฿{formatMoney(totals.owe)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-5 mt-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/70 p-1.5 shadow-sm border border-white">
            <button
              onClick={() => setTab("owe")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "owe"
                  ? "bg-white shadow text-slate-800"
                  : "text-slate-500"
              }`}
            >
              <TrendingDown
                size={15}
                style={{ color: tab === "owe" ? "#E0332B" : "#94A3B8" }}
              />
              เจ้าหนี้
            </button>
            <button
              onClick={() => setTab("owed")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "owed"
                  ? "bg-white shadow text-slate-800"
                  : "text-slate-500"
              }`}
            >
              <TrendingUp
                size={15}
                style={{ color: tab === "owed" ? "#0F9D58" : "#94A3B8" }}
              />
              ลูกหนี้
            </button>
          </div>
        </div>

        {/* Tab subtotal */}
        <div className="px-5 mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isOweTab ? "รายชื่อคนที่เราติดหนี้" : "รายชื่อคนที่ติดหนี้เรา"}
            <span className="ml-1.5 text-slate-400">({filtered.length})</span>
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: isOweTab ? "#E0332B" : "#0F9D58" }}
          >
            ฿{formatMoney(isOweTab ? totals.owe : totals.owed)}
          </p>
        </div>

        {/* List */}
        <div className="px-5 mt-3 space-y-2.5">
          {!loaded && (
            <div className="text-center py-16 text-slate-400 text-sm">
              กำลังโหลดข้อมูล...
            </div>
          )}

          {loaded && filtered.length === 0 && (
            <div className="text-center py-16 px-6 rounded-2xl bg-white/60 border border-dashed border-blue-200">
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
                style={{ background: isOweTab ? "#FDECEC" : "#E8F8EF" }}
              >
                {isOweTab ? (
                  <TrendingDown size={20} style={{ color: "#E0332B" }} />
                ) : (
                  <TrendingUp size={20} style={{ color: "#0F9D58" }} />
                )}
              </div>
              <p className="text-slate-500 text-sm">
                {isOweTab
                  ? "ยังไม่มีรายการเจ้าหนี้"
                  : "ยังไม่มีรายการลูกหนี้"}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                แตะปุ่ม + ด้านล่างเพื่อเพิ่มรายการ
              </p>
            </div>
          )}

          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-white shadow-sm border border-blue-50 px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-[15px] truncate">
                    {r.name}
                  </p>
                  {r.note && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {r.note}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
                    <Calendar size={11} />
                    <span>{formatDateTime(r.updatedAt)}</span>
                  </div>
                </div>
                <p
                  className="text-lg font-bold tabular-nums whitespace-nowrap"
                  style={{ color: isOweTab ? "#E0332B" : "#0F9D58" }}
                >
                  ฿{formatMoney(r.amount)}
                </p>
              </div>

              {confirmDeleteId === r.id ? (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 flex-1">
                    ลบรายการนี้ใช่ไหม?
                  </p>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => deleteRecord(r.id)}
                    className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                    style={{ background: "#E0332B" }}
                  >
                    ลบ
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openEditForm(r)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-medium"
                    style={{ background: "#EAF2FF", color: "#2C63C7" }}
                  >
                    <Pencil size={12} /> แก้ไข
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(r.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-medium"
                    style={{ background: "#FDECEC", color: "#E0332B" }}
                  >
                    <Trash2 size={12} /> ลบ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openAddForm}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white active:scale-95 active:-translate-x-1/2 transition-transform z-30"
        style={{
          background: "linear-gradient(135deg,#2C63C7,#1E4FA8)",
          boxShadow: "0 8px 24px rgba(30,79,168,0.4)",
        }}
        aria-label="เพิ่มรายการ"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Toast error */}
      {saveError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-4 py-2 rounded-full shadow-lg z-40">
          {saveError}
        </div>
      )}
      {loadError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-4 py-2 rounded-full shadow-lg z-40">
          โหลดข้อมูลเดิมไม่สำเร็จ เริ่มต้นใหม่
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeForm}
          />
        <div
          className="
            relative
            w-[calc(100%-4rem)]
            max-w-sm
            mx-auto
            box-border
            bg-white
            rounded-t-3xl
            sm:rounded-3xl
            px-5
            pt-5
            pb-6
            shadow-2xl
            animate-[slideUp_0.2s_ease-out]
          "
>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-base">
                {editingId
                  ? "แก้ไขรายการ"
                  : isOweTab
                    ? "เพิ่มคนที่เราติดหนี้"
                    : "เพิ่มคนที่ติดหนี้เรา"}
              </h2>
              <button
                onClick={closeForm}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  ชื่อ
                </label>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="เช่น ยืมค่าอาหาร"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            {saveError && (
              <p className="text-xs mt-2.5" style={{ color: "#E0332B" }}>
                {saveError}
              </p>
            )}

            <button
              onClick={submitForm}
              className="w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              style={{ background: "linear-gradient(135deg,#2C63C7,#1E4FA8)" }}
            >
              <Check size={16} /> {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
