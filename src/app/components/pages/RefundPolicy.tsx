import { useState, useMemo } from "react";
import {
  RotateCcw, Plus, Edit2, Trash2, X, Check,
  ChevronDown, Info, AlertTriangle, Calculator,
  Clock, Shield, ShoppingBag, Home, Tent, Package,
  BarChart3, Percent, CalendarDays
} from "lucide-react";
import { toast } from "sonner";

/* ───── Types ───── */
interface RefundRule {
  id: number;
  productType: "체험" | "숙박" | "특산품" | "기타";
  name: string;
  description: string;
  isActive: boolean;
  brackets: RefundBracket[];
  memo: string;
}

interface RefundBracket {
  id: number;
  label: string;
  daysBeforeMin: number;     // 최소 일수 (이상)
  daysBeforeMax: number | null; // 최대 일수 (미만), null = 무제한
  refundRate: number;        // 환불 비율 (%)
}

/* ───── Dummy Data ───── */
const DEFAULT_BRACKETS_EXPERIENCE: RefundBracket[] = [
  { id: 1, label: "7일 이전", daysBeforeMin: 7, daysBeforeMax: null, refundRate: 100 },
  { id: 2, label: "5~6일 전", daysBeforeMin: 5, daysBeforeMax: 7, refundRate: 90 },
  { id: 3, label: "3~4일 전", daysBeforeMin: 3, daysBeforeMax: 5, refundRate: 70 },
  { id: 4, label: "1~2일 전", daysBeforeMin: 1, daysBeforeMax: 3, refundRate: 50 },
  { id: 5, label: "당일", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
];

const DEFAULT_BRACKETS_STAY: RefundBracket[] = [
  { id: 1, label: "10일 이전", daysBeforeMin: 10, daysBeforeMax: null, refundRate: 100 },
  { id: 2, label: "7~9일 전", daysBeforeMin: 7, daysBeforeMax: 10, refundRate: 90 },
  { id: 3, label: "5~6일 전", daysBeforeMin: 5, daysBeforeMax: 7, refundRate: 70 },
  { id: 4, label: "3~4일 전", daysBeforeMin: 3, daysBeforeMax: 5, refundRate: 50 },
  { id: 5, label: "1~2일 전", daysBeforeMin: 1, daysBeforeMax: 3, refundRate: 30 },
  { id: 6, label: "당일", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
];

const DEFAULT_BRACKETS_SPECIALTY: RefundBracket[] = [
  { id: 1, label: "발송 전", daysBeforeMin: 1, daysBeforeMax: null, refundRate: 100 },
  { id: 2, label: "수령 후 7일 이내 (미개봉)", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 100 },
  { id: 3, label: "수령 후 7일 이내 (개봉)", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 50 },
];

const DEFAULT_BRACKETS_ETC: RefundBracket[] = [
  { id: 1, label: "7일 이전", daysBeforeMin: 7, daysBeforeMax: null, refundRate: 100 },
  { id: 2, label: "3~6일 전", daysBeforeMin: 3, daysBeforeMax: 7, refundRate: 70 },
  { id: 3, label: "1~2일 전", daysBeforeMin: 1, daysBeforeMax: 3, refundRate: 50 },
  { id: 4, label: "당일", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
];

const INITIAL_RULES: RefundRule[] = [
  {
    id: 1, productType: "체험", name: "농촌 체험 프로그램 (일반)",
    description: "논농사, 밭농사, 수확 체험 등 일반 농촌 체험 프로그램에 적용되는 환불 규정",
    isActive: true, brackets: [...DEFAULT_BRACKETS_EXPERIENCE],
    memo: "소비자분쟁해결기준(관광·레저) 준용"
  },
  {
    id: 2, productType: "체험", name: "치유 프로그램",
    description: "명상, 숲 치유, 요가 등 치유 목적 프로그램 환불 규정. 전문 강사 섭외 비용 고려.",
    isActive: true, brackets: [
      { id: 1, label: "10일 이전", daysBeforeMin: 10, daysBeforeMax: null, refundRate: 100 },
      { id: 2, label: "7~9일 전", daysBeforeMin: 7, daysBeforeMax: 10, refundRate: 80 },
      { id: 3, label: "3~6일 전", daysBeforeMin: 3, daysBeforeMax: 7, refundRate: 50 },
      { id: 4, label: "1~2일 전", daysBeforeMin: 1, daysBeforeMax: 3, refundRate: 30 },
      { id: 5, label: "당일", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
    ],
    memo: "강사 취소 위약금 반영 필요"
  },
  {
    id: 3, productType: "숙박", name: "농가민박 (비수기)",
    description: "비수기(3~6월, 9~11월) 농가민박 환불 규정",
    isActive: true, brackets: [...DEFAULT_BRACKETS_STAY],
    memo: ""
  },
  {
    id: 4, productType: "숙박", name: "농가민박 (성수기)",
    description: "성수기(7~8월, 12~2월, 명절 연휴) 적용. 비수기 대비 환불 조건이 엄격합니다.",
    isActive: true, brackets: [
      { id: 1, label: "14일 이전", daysBeforeMin: 14, daysBeforeMax: null, refundRate: 100 },
      { id: 2, label: "10~13일 전", daysBeforeMin: 10, daysBeforeMax: 14, refundRate: 80 },
      { id: 3, label: "7~9일 전", daysBeforeMin: 7, daysBeforeMax: 10, refundRate: 50 },
      { id: 4, label: "3~6일 전", daysBeforeMin: 3, daysBeforeMax: 7, refundRate: 30 },
      { id: 5, label: "1~2일 전", daysBeforeMin: 1, daysBeforeMax: 3, refundRate: 10 },
      { id: 6, label: "당일", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
    ],
    memo: "성수기는 예약 대기 수요가 높아 조기 취소 유도"
  },
  {
    id: 5, productType: "체험", name: "코스 세트 (체험+숙박+식사)",
    description: "복합 코스 상품 환불 규정. 전체 코스 금액 기준 환불 비율 적용.",
    isActive: true, brackets: [
      { id: 1, label: "10일 이전", daysBeforeMin: 10, daysBeforeMax: null, refundRate: 100 },
      { id: 2, label: "7~9일 전", daysBeforeMin: 7, daysBeforeMax: 10, refundRate: 80 },
      { id: 3, label: "5~6일 전", daysBeforeMin: 5, daysBeforeMax: 7, refundRate: 60 },
      { id: 4, label: "3~4일 전", daysBeforeMin: 3, daysBeforeMax: 5, refundRate: 40 },
      { id: 5, label: "1~2일 전", daysBeforeMin: 1, daysBeforeMax: 3, refundRate: 20 },
      { id: 6, label: "당일", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
    ],
    memo: "개별 항목 부분 취소 불가"
  },
  {
    id: 6, productType: "특산품", name: "농산물 (신선식품)",
    description: "쌀, 채소, 과일 등 신선 농산물의 환불 규정. 신선도 문제 시 전액 환불.",
    isActive: true, brackets: [
      { id: 1, label: "발송 전", daysBeforeMin: 1, daysBeforeMax: null, refundRate: 100 },
      { id: 2, label: "수령 후 당일 (하자)", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 100 },
      { id: 3, label: "수령 후 3일 이내 (단순변심)", daysBeforeMin: 0, daysBeforeMax: 1, refundRate: 0 },
    ],
    memo: "식품은 단순 변심 반품 불가 (식품위생법)"
  },
  {
    id: 7, productType: "특산품", name: "가공식품·수공예품",
    description: "잼, 절임, 건조식품 및 수공예품 환불 규정",
    isActive: true, brackets: [...DEFAULT_BRACKETS_SPECIALTY],
    memo: "미개봉 상태만 반품 가능"
  },
  {
    id: 8, productType: "기타", name: "기본 환불 규정",
    description: "별도 규정이 없는 상품에 적용되는 기본 환불 정책",
    isActive: true, brackets: [...DEFAULT_BRACKETS_ETC],
    memo: "신규 상품 등록 시 기본 적용"
  },
];

/* ───── Constants ───── */
type TabKey = "rules" | "simulator";

const PRODUCT_TYPE_CONFIG: Record<string, { icon: typeof Tent; bg: string; text: string }> = {
  "체험": { icon: Tent, bg: "#ECF7EE", text: "#1B5E20" },
  "숙박": { icon: Home, bg: "#FFF6E6", text: "#8A6A2B" },
  "특산품": { icon: ShoppingBag, bg: "#F3E8F9", text: "#7B1FA2" },
  "기타": { icon: Package, bg: "#F7F3ED", text: "#6B7280" },
};

const REFUND_BAR_COLOR = (rate: number) => {
  if (rate >= 80) return "#1B5E20";
  if (rate >= 50) return "#2F4F46";
  if (rate >= 30) return "#8A6A2B";
  if (rate > 0) return "#C62828";
  return "#D6D0C8";
};

/* ───── Component ───── */
export function RefundPolicy() {
  const [activeTab, setActiveTab] = useState<TabKey>("rules");
  const [rules, setRules] = useState<RefundRule[]>(INITIAL_RULES);
  const [typeFilter, setTypeFilter] = useState("전체");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /* Rule form */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    productType: "체험" as RefundRule["productType"],
    name: "",
    description: "",
    memo: "",
    brackets: [...DEFAULT_BRACKETS_EXPERIENCE] as RefundBracket[],
  });

  /* Bracket edit within form */
  const [showBracketForm, setShowBracketForm] = useState(false);
  const [editingBracketIdx, setEditingBracketIdx] = useState<number | null>(null);
  const [bracketForm, setBracketForm] = useState({ label: "", daysBeforeMin: 0, daysBeforeMax: null as number | null, refundRate: 100 });

  /* Simulator state */
  const [simRuleId, setSimRuleId] = useState(1);
  const [simAmount, setSimAmount] = useState(150000);
  const [simDaysBefore, setSimDaysBefore] = useState(5);

  /* Delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  /* ───── Stats ───── */
  const stats = useMemo(() => {
    const active = rules.filter(r => r.isActive);
    const byType = {
      "체험": rules.filter(r => r.productType === "체험").length,
      "숙박": rules.filter(r => r.productType === "숙박").length,
      "특산품": rules.filter(r => r.productType === "특산품").length,
      "기타": rules.filter(r => r.productType === "기타").length,
    };
    const allBrackets = active.flatMap(r => r.brackets);
    const avgRate = allBrackets.length > 0
      ? Math.round(allBrackets.reduce((s, b) => s + b.refundRate, 0) / allBrackets.length)
      : 0;
    return { total: rules.length, active: active.length, byType, avgRate };
  }, [rules]);

  /* ───── Filters ───── */
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      if (typeFilter !== "전체" && r.productType !== typeFilter) return false;
      return true;
    });
  }, [rules, typeFilter]);

  /* ───── CRUD ───── */
  const openForm = (rule?: RefundRule) => {
    if (rule) {
      setEditingId(rule.id);
      setForm({
        productType: rule.productType,
        name: rule.name,
        description: rule.description,
        memo: rule.memo,
        brackets: rule.brackets.map(b => ({ ...b })),
      });
    } else {
      setEditingId(null);
      setForm({
        productType: "체험",
        name: "",
        description: "",
        memo: "",
        brackets: [...DEFAULT_BRACKETS_EXPERIENCE],
      });
    }
    setShowForm(true);
  };

  const saveRule = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setRules(prev => prev.map(r => r.id === editingId
        ? { ...r, productType: form.productType, name: form.name, description: form.description, memo: form.memo, brackets: form.brackets }
        : r
      ));
      toast.success("환불 규정이 수정되었습니다.");
    } else {
      setRules(prev => [...prev, {
        id: Date.now(),
        productType: form.productType,
        name: form.name,
        description: form.description,
        memo: form.memo,
        brackets: form.brackets,
        isActive: true,
      }]);
      toast.success("새 환불 규정이 추가되었습니다.");
    }
    setShowForm(false);
  };

  const deleteRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setDeleteTarget(null);
    toast.success("환불 규정이 삭제되었습니다.");
  };

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  /* Bracket CRUD within form */
  const openBracketForm = (idx?: number) => {
    if (idx !== undefined) {
      const b = form.brackets[idx];
      setEditingBracketIdx(idx);
      setBracketForm({ label: b.label, daysBeforeMin: b.daysBeforeMin, daysBeforeMax: b.daysBeforeMax, refundRate: b.refundRate });
    } else {
      setEditingBracketIdx(null);
      setBracketForm({ label: "", daysBeforeMin: 0, daysBeforeMax: null, refundRate: 100 });
    }
    setShowBracketForm(true);
  };

  const saveBracket = () => {
    if (!bracketForm.label.trim()) return;
    const newBracket: RefundBracket = { id: Date.now(), ...bracketForm };
    if (editingBracketIdx !== null) {
      const updated = [...form.brackets];
      updated[editingBracketIdx] = { ...updated[editingBracketIdx], ...bracketForm };
      setForm(f => ({ ...f, brackets: updated }));
    } else {
      setForm(f => ({ ...f, brackets: [...f.brackets, newBracket] }));
    }
    setShowBracketForm(false);
  };

  const deleteBracket = (idx: number) => {
    setForm(f => ({ ...f, brackets: f.brackets.filter((_, i) => i !== idx) }));
  };

  const applyDefaultBrackets = (type: RefundRule["productType"]) => {
    const defaults: Record<string, RefundBracket[]> = {
      "체험": DEFAULT_BRACKETS_EXPERIENCE,
      "숙박": DEFAULT_BRACKETS_STAY,
      "특산품": DEFAULT_BRACKETS_SPECIALTY,
      "기타": DEFAULT_BRACKETS_ETC,
    };
    setForm(f => ({ ...f, brackets: (defaults[type] || DEFAULT_BRACKETS_ETC).map(b => ({ ...b })) }));
  };

  /* ───── Simulator calc ───── */
  const simResult = useMemo(() => {
    const rule = rules.find(r => r.id === simRuleId);
    if (!rule) return { refundRate: 0, refundAmount: 0, penalty: 0, matchedBracket: "규정 없음" };
    const sorted = [...rule.brackets].sort((a, b) => b.daysBeforeMin - a.daysBeforeMin);
    let matched = sorted.find(b => simDaysBefore >= b.daysBeforeMin);
    if (!matched && sorted.length > 0) matched = sorted[sorted.length - 1];
    const refundRate = matched ? matched.refundRate : 0;
    const refundAmount = Math.round(simAmount * refundRate / 100);
    return {
      refundRate,
      refundAmount,
      penalty: simAmount - refundAmount,
      matchedBracket: matched ? matched.label : "해당 구간 없음",
    };
  }, [simRuleId, simAmount, simDaysBefore, rules]);

  /* ───── Render ───── */
  return (
    <div className="max-w-[1160px] space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "전체 환불 규정", value: stats.total + "개", icon: Shield, color: "#2F4F46", desc: "활성 " + stats.active + "개 / 비활성 " + (stats.total - stats.active) + "개" },
          { label: "체험 / 숙박 규정", value: stats.byType["체험"] + " / " + stats.byType["숙박"], icon: Tent, color: "#1B5E20", desc: "체험 " + stats.byType["체험"] + "개 · 숙박 " + stats.byType["숙박"] + "개" },
          { label: "특산품 / 기타", value: stats.byType["특산품"] + " / " + stats.byType["기타"], icon: ShoppingBag, color: "#7B1FA2", desc: "특산품 " + stats.byType["특산품"] + "개 · 기타 " + stats.byType["기타"] + "개" },
          { label: "평균 환불 비율", value: stats.avgRate + "%", icon: Percent, color: "#8A6A2B", desc: "전체 환불 구간 평균" },
        ].map((item, i) => {
          const IconComp = item.icon;
          return (
            <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-2.5">
                <IconComp size={16} className="text-[#9CA3AF]" />
                <span className="text-[13px] text-[#6B7280]">{item.label}</span>
              </div>
              <p className="text-[22px]" style={{ fontWeight: 700, color: item.color }}>{item.value}</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        {([
          { key: "rules" as TabKey, label: "환불 규정 관리", icon: Shield },
          { key: "simulator" as TabKey, label: "환불 시뮬레이터", icon: Calculator },
        ]).map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={"flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all cursor-pointer " + (activeTab === tab.key ? "border-[#2F4F46] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]" : "border-[#E6E2DB] bg-white/60 hover:bg-white")}
            >
              <TabIcon size={18} className={activeTab === tab.key ? "text-[#2F4F46]" : "text-[#9CA3AF]"} />
              <span className={"text-[14px] " + (activeTab === tab.key ? "text-[#2F4F46]" : "text-[#6B7280]")} style={{ fontWeight: activeTab === tab.key ? 700 : 400 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══════ Rules Tab ═══════ */}
      {activeTab === "rules" && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {["전체", "체험", "숙박", "특산품", "기타"].map(f => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className={"text-[12px] px-3 py-1.5 rounded-lg transition-all cursor-pointer " + (typeFilter === f ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]")}
                  style={{ fontWeight: typeFilter === f ? 700 : 400 }}>{f}</button>
              ))}
            </div>
            <button onClick={() => openForm()} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
              <Plus size={16} /> 환불 규정 추가
            </button>
          </div>

          {/* Rule Cards */}
          <div className="space-y-3">
            {filteredRules.map(rule => {
              const config = PRODUCT_TYPE_CONFIG[rule.productType] || PRODUCT_TYPE_CONFIG["기타"];
              const TypeIcon = config.icon;
              const isExpanded = expandedId === rule.id;

              return (
                <div key={rule.id} className={"bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden transition-all " + (!rule.isActive ? "opacity-50" : "")}>
                  {/* Header row */}
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#FBFAF7] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: config.bg }}>
                      <TypeIcon size={18} style={{ color: config.text }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{rule.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ backgroundColor: config.bg, color: config.text, fontWeight: 700 }}>{rule.productType}</span>
                        {!rule.isActive && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F3EFE8] text-[#9CA3AF]">비활성</span>}
                      </div>
                      <p className="text-[13px] text-[#6B7280] truncate">{rule.description}</p>
                    </div>
                    {/* Mini bracket preview */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {rule.brackets.slice(0, 5).map((b, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <span className="text-[10px] text-[#9CA3AF] mb-0.5 whitespace-nowrap">{b.label.length > 4 ? b.label.slice(0, 4) + ".." : b.label}</span>
                          <div className="w-[28px] h-[4px] rounded-full" style={{ backgroundColor: REFUND_BAR_COLOR(b.refundRate) }} />
                          <span className="text-[10px] mt-0.5" style={{ color: REFUND_BAR_COLOR(b.refundRate), fontWeight: 700 }}>{b.refundRate}%</span>
                        </div>
                      ))}
                      {rule.brackets.length > 5 && <span className="text-[10px] text-[#9CA3AF]">+{rule.brackets.length - 5}</span>}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={e => { e.stopPropagation(); toggleRule(rule.id); }}
                        className={"w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer"}
                        style={{ backgroundColor: rule.isActive ? "#2F4F46" : "#D6D0C8" }}
                      >
                        <div className={"w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm " + (rule.isActive ? "right-[2px]" : "left-[2px]")} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); openForm(rule); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget(rule.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                      <ChevronDown size={14} className={"text-[#9CA3AF] transition-transform " + (isExpanded ? "rotate-180" : "")} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-[#F3EFE8]">
                      {/* Bracket table */}
                      <div className="mt-4 bg-[#FBFAF7] rounded-xl overflow-hidden border border-[#E6E2DB]">
                        <div className="px-4 py-2.5 bg-[#F7F3ED] border-b border-[#E6E2DB] grid items-center gap-3" style={{ gridTemplateColumns: "1fr 120px 120px" }}>
                          <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>취소 시점</span>
                          <span className="text-[12px] text-[#9CA3AF] text-center" style={{ fontWeight: 700 }}>환불 비율</span>
                          <span className="text-[12px] text-[#9CA3AF] text-center" style={{ fontWeight: 700 }}>비율 시각화</span>
                        </div>
                        <div className="divide-y divide-[#F3EFE8]">
                          {rule.brackets.map(b => (
                            <div key={b.id} className="px-4 py-3 grid items-center gap-3" style={{ gridTemplateColumns: "1fr 120px 120px" }}>
                              <div className="flex items-center gap-2">
                                <Clock size={13} className="text-[#9CA3AF]" />
                                <span className="text-[14px] text-[#1F2937]">{b.label}</span>
                              </div>
                              <div className="text-center">
                                <span className="text-[16px]" style={{ fontWeight: 700, color: REFUND_BAR_COLOR(b.refundRate) }}>
                                  {b.refundRate}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-[10px] bg-[#F3EFE8] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: b.refundRate + "%", backgroundColor: REFUND_BAR_COLOR(b.refundRate) }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Memo */}
                      {rule.memo && (
                        <div className="mt-3 flex items-start gap-2 text-[13px] text-[#9CA3AF]">
                          <Info size={12} className="mt-0.5 shrink-0" />
                          <span>{rule.memo}</span>
                        </div>
                      )}

                      {/* Refund timeline visual */}
                      <div className="mt-4">
                        <h4 className="text-[13px] text-[#6B7280] mb-2" style={{ fontWeight: 700 }}>환불 비율 타임라인</h4>
                        <div className="flex items-end gap-0 h-[80px]">
                          {rule.brackets.map((b, i) => {
                            const w = 100 / rule.brackets.length;
                            return (
                              <div key={i} className="flex flex-col items-center justify-end" style={{ width: w + "%" }}>
                                <span className="text-[10px] mb-1" style={{ color: REFUND_BAR_COLOR(b.refundRate), fontWeight: 700 }}>{b.refundRate}%</span>
                                <div
                                  className="w-full rounded-t-md transition-all mx-px"
                                  style={{
                                    height: Math.max(b.refundRate * 0.6, 4) + "px",
                                    backgroundColor: REFUND_BAR_COLOR(b.refundRate),
                                    opacity: 0.8,
                                  }}
                                />
                                <span className="text-[9px] text-[#9CA3AF] mt-1 whitespace-nowrap truncate w-full text-center">{b.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info card */}
          <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-start gap-2.5">
            <Info size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#9CA3AF] leading-relaxed">
              <p>환불 규정은 <strong className="text-[#6B7280]">상품·원가 관리</strong>의 코스 세트 상품과 연동되어 고객 안내에 자동 반영됩니다.</p>
              <p className="mt-1"><strong className="text-[#6B7280]">소비자분쟁해결기준</strong>을 참고하여 설정하시되, 마을 운영 상황에 맞게 조정해 주세요. 정확한 규정은 법률 전문가와 상의하세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Simulator Tab ═══════ */}
      {activeTab === "simulator" && (
        <div className="space-y-5">
          <div className="bg-white rounded-[14px] border border-[#2F4F46] p-6 shadow-[0_2px_12px_rgba(47,79,70,0.08)]">
            <div className="flex items-center gap-2 mb-5">
              <Calculator size={18} className="text-[#2F4F46]" />
              <h3 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>환불 시뮬레이터</h3>
              <span className="text-[12px] text-[#9CA3AF] ml-1">결제 금액과 취소 시점을 입력하면 환불 예상 금액을 계산합니다</span>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {/* Left: Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>적용 환불 규정</label>
                  <div className="relative">
                    <select value={simRuleId} onChange={e => setSimRuleId(Number(e.target.value))}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                      {rules.filter(r => r.isActive).map(r => (
                        <option key={r.id} value={r.id}>[{r.productType}] {r.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>결제 금액 (원)</label>
                  <input
                    type="number"
                    value={simAmount || ""}
                    onChange={e => setSimAmount(Number(e.target.value))}
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>
                    취소 시점 (예약일 기준 <strong className="text-[#2F4F46]">{simDaysBefore}일 전</strong>)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={simDaysBefore}
                    onChange={e => setSimDaysBefore(Number(e.target.value))}
                    className="w-full h-2 bg-[#E6E2DB] rounded-full appearance-none cursor-pointer accent-[#2F4F46]"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-[#C62828]">당일</span>
                    <span className="text-[11px] text-[#1B5E20]">30일 전</span>
                  </div>
                  {/* Quick buttons */}
                  <div className="flex gap-1.5 mt-2">
                    {[0, 1, 3, 5, 7, 10, 14].map(d => (
                      <button key={d} onClick={() => setSimDaysBefore(d)}
                        className={"text-[11px] px-2.5 py-1 rounded-lg cursor-pointer transition-all " + (simDaysBefore === d ? "bg-[#2F4F46] text-white" : "bg-[#F7F3ED] text-[#6B7280] hover:bg-[#E6E2DB]")}
                        style={{ fontWeight: simDaysBefore === d ? 700 : 400 }}>
                        {d === 0 ? "당일" : d + "일전"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle: Result */}
              <div className="bg-[#F7F3ED] rounded-xl p-5 flex flex-col justify-center">
                <p className="text-[12px] text-[#9CA3AF] mb-1">적용 구간</p>
                <p className="text-[15px] text-[#1F2937] mb-4" style={{ fontWeight: 700 }}>{simResult.matchedBracket}</p>

                <p className="text-[12px] text-[#9CA3AF] mb-1">환불 비율</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-[32px]" style={{ fontWeight: 700, color: REFUND_BAR_COLOR(simResult.refundRate) }}>
                    {simResult.refundRate}%
                  </span>
                </div>

                <div className="w-full h-[10px] bg-[#E6E2DB] rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all" style={{ width: simResult.refundRate + "%", backgroundColor: REFUND_BAR_COLOR(simResult.refundRate) }} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[#9CA3AF]">결제 금액</p>
                    <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{simAmount.toLocaleString()}원</p>
                  </div>
                  <RotateCcw size={14} className="text-[#9CA3AF]" />
                  <div className="text-right">
                    <p className="text-[11px] text-[#9CA3AF]">환불 금액</p>
                    <p className="text-[14px]" style={{ fontWeight: 700, color: REFUND_BAR_COLOR(simResult.refundRate) }}>{simResult.refundAmount.toLocaleString()}원</p>
                  </div>
                </div>
              </div>

              {/* Right: Breakdown */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#E6E2DB] p-4">
                  <p className="text-[12px] text-[#9CA3AF] mb-3" style={{ fontWeight: 700 }}>정산 내역</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-[#6B7280]">결제 금액</span>
                      <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{simAmount.toLocaleString()}원</span>
                    </div>
                    <div className="border-t border-[#F3EFE8]" />
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-[#1B5E20]">환불 금액 ({simResult.refundRate}%)</span>
                      <span className="text-[14px] text-[#1B5E20]" style={{ fontWeight: 700 }}>{simResult.refundAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-[#C62828]">취소 수수료</span>
                      <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>{simResult.penalty.toLocaleString()}원</span>
                    </div>
                    <div className="border-t border-[#E6E2DB]" />
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-[#6B7280]">마을 실 수익 (위약금)</span>
                      <span className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{simResult.penalty.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>

                {/* Visual: full bracket of selected rule */}
                <div className="bg-white rounded-xl border border-[#E6E2DB] p-4">
                  <p className="text-[12px] text-[#9CA3AF] mb-2" style={{ fontWeight: 700 }}>전체 구간 비율</p>
                  {(() => {
                    const rule = rules.find(r => r.id === simRuleId);
                    if (!rule) return null;
                    return (
                      <div className="space-y-1.5">
                        {rule.brackets.map((b, i) => {
                          const isMatch = b.label === simResult.matchedBracket;
                          return (
                            <div key={i} className={"flex items-center gap-2 px-2 py-1 rounded-lg transition-colors " + (isMatch ? "bg-[#F7F3ED]" : "")}>
                              <span className={"text-[11px] w-[80px] shrink-0 truncate " + (isMatch ? "text-[#2F4F46]" : "text-[#9CA3AF]")} style={{ fontWeight: isMatch ? 700 : 400 }}>{b.label}</span>
                              <div className="flex-1 h-[6px] bg-[#F3EFE8] rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: b.refundRate + "%", backgroundColor: REFUND_BAR_COLOR(b.refundRate), opacity: isMatch ? 1 : 0.5 }} />
                              </div>
                              <span className="text-[11px] w-[32px] text-right" style={{ color: REFUND_BAR_COLOR(b.refundRate), fontWeight: 700 }}>{b.refundRate}%</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Reference info */}
          <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-[#9CA3AF]" />
              <h3 className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>소비자분쟁해결기준 참고 (관광·숙박)</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#FFF6E6] text-[#8A6A2B]" style={{ fontWeight: 700 }}>참고용</span>
            </div>
            <div className="bg-[#FBFAF7] rounded-xl overflow-hidden border border-[#E6E2DB]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F3ED]">
                    {["기준", "관광(국내여행)", "숙박(비수기)", "숙박(성수기)"].map(h => (
                      <th key={h} className="text-[12px] text-[#9CA3AF] px-4 py-2.5 text-left" style={{ fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { period: "여행 시작 30일 전", tour: "전액 환급", nonpeak: "전액 환급", peak: "전액 환급" },
                    { period: "여행 시작 20일 전", tour: "10% 배상", nonpeak: "전액 환급", peak: "10% 공제" },
                    { period: "여행 시작 10일 전", tour: "15% 배상", nonpeak: "10% 공제", peak: "20% 공제" },
                    { period: "여행 시작 7일 전", tour: "20% 배상", nonpeak: "10% 공제", peak: "30% 공제" },
                    { period: "여행 시작 3일 전", tour: "30% 배상", nonpeak: "30% 공제", peak: "50% 공제" },
                    { period: "여행 시작 1일 전", tour: "50% 배상", nonpeak: "50% 공제", peak: "80% 공제" },
                    { period: "당일 / 연락 없음", tour: "전액 배상", nonpeak: "환불 불가", peak: "환불 불가" },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-[#F3EFE8]">
                      <td className="text-[14px] text-[#1F2937] px-4 py-2.5" style={{ fontWeight: 700 }}>{row.period}</td>
                      <td className="text-[14px] text-[#6B7280] px-4 py-2.5">{row.tour}</td>
                      <td className="text-[14px] text-[#6B7280] px-4 py-2.5">{row.nonpeak}</td>
                      <td className="text-[14px] text-[#6B7280] px-4 py-2.5">{row.peak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-3 flex items-center gap-1.5">
              <AlertTriangle size={11} /> 위 기준은 공정거래위원회 고시를 참고한 것이며, 마을 특성에 따라 합리적으로 조정 가능합니다.
            </p>
          </div>

          <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-start gap-2.5">
            <Info size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#9CA3AF] leading-relaxed">
              <p>시뮬레이터 결과는 <strong className="text-[#6B7280]">예상 금액</strong>으로, 실제 환불 시에는 PG사 수수료 환급 여부, 부분 취소 가능 여부 등을 추가로 고려해야 합니다.</p>
              <p className="mt-1">환불 규정은 <strong className="text-[#6B7280]">매출·정산</strong> 페이지의 환불 처리 내역과 연동되어 자동 계산됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Rule Form Modal ═══════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[620px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-[#E6E2DB] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECF7EE] flex items-center justify-center"><Shield size={20} className="text-[#1B5E20]" /></div>
                  <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>{editingId ? "환불 규정 수정" : "새 환불 규정 추가"}</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer"><X size={20} /></button>
              </div>
            </div>
            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>규정명</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 농촌 체험 일반 환불 규정"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>상품 유형</label>
                  <div className="relative">
                    <select value={form.productType} onChange={e => {
                      const v = e.target.value as RefundRule["productType"];
                      setForm(f => ({ ...f, productType: v }));
                    }}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                      <option value="체험">체험</option>
                      <option value="숙박">숙박</option>
                      <option value="특산품">특산품</option>
                      <option value="기타">기타</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>설명</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="환불 규정에 대한 설명" rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none resize-none leading-relaxed" />
              </div>

              {/* Bracket list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>환불 비율 구간</label>
                  <div className="flex gap-2">
                    <button onClick={() => applyDefaultBrackets(form.productType)}
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-[#F7F3ED] text-[#6B7280] hover:bg-[#E6E2DB] cursor-pointer transition-colors">
                      <RotateCcw size={10} className="inline mr-1" />기본값 적용
                    </button>
                    <button onClick={() => openBracketForm()}
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-[#2F4F46] text-white hover:bg-[#243f38] cursor-pointer transition-colors">
                      <Plus size={10} className="inline mr-1" />구간 추가
                    </button>
                  </div>
                </div>
                <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] divide-y divide-[#F3EFE8]">
                  {form.brackets.map((b, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-center gap-3">
                      <Clock size={13} className="text-[#9CA3AF] shrink-0" />
                      <span className="text-[14px] text-[#1F2937] flex-1">{b.label}</span>
                      <div className="w-[60px] h-[6px] bg-[#F3EFE8] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: b.refundRate + "%", backgroundColor: REFUND_BAR_COLOR(b.refundRate) }} />
                      </div>
                      <span className="text-[14px] w-[40px] text-right" style={{ fontWeight: 700, color: REFUND_BAR_COLOR(b.refundRate) }}>{b.refundRate}%</span>
                      <button onClick={() => openBracketForm(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer"><Edit2 size={11} /></button>
                      <button onClick={() => deleteBracket(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer"><Trash2 size={11} /></button>
                    </div>
                  ))}
                  {form.brackets.length === 0 && (
                    <div className="px-4 py-6 text-center text-[13px] text-[#9CA3AF]">
                      환불 비율 구간을 추가하세요
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
                <input value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} placeholder="적용 기간, 특이사항 등"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
            </div>
            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-end gap-3 shrink-0">
              <button onClick={() => setShowForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] cursor-pointer">취소</button>
              <button onClick={saveRule} disabled={!form.name.trim() || form.brackets.length === 0} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {editingId ? "수정 완료" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Bracket Form Sub-Modal ═══════ */}
      {showBracketForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.25)" }} onClick={() => setShowBracketForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-[420px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E6E2DB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#2F4F46]" />
                  <h3 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{editingBracketIdx !== null ? "구간 수정" : "새 구간 추가"}</h3>
                </div>
                <button onClick={() => setShowBracketForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer"><X size={16} /></button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>구간 이름</label>
                <input value={bracketForm.label} onChange={e => setBracketForm(f => ({ ...f, label: e.target.value }))} placeholder="예: 7일 이전, 당일 등"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>최소 일수 (이상)</label>
                  <input type="number" min={0} value={bracketForm.daysBeforeMin} onChange={e => setBracketForm(f => ({ ...f, daysBeforeMin: Number(e.target.value) }))}
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>최대 일수 (미만)</label>
                  <input type="number" min={0} value={bracketForm.daysBeforeMax ?? ""} onChange={e => setBracketForm(f => ({ ...f, daysBeforeMax: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="무제한"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>환불 비율 (%)</label>
                <div className="flex items-center gap-3">
                  <input type="number" min={0} max={100} value={bracketForm.refundRate} onChange={e => setBracketForm(f => ({ ...f, refundRate: Number(e.target.value) }))}
                    className="w-[100px] h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                  <div className="flex-1 h-[10px] bg-[#F3EFE8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: bracketForm.refundRate + "%", backgroundColor: REFUND_BAR_COLOR(bracketForm.refundRate) }} />
                  </div>
                  <span className="text-[16px]" style={{ fontWeight: 700, color: REFUND_BAR_COLOR(bracketForm.refundRate) }}>{bracketForm.refundRate}%</span>
                </div>
                {/* Quick presets */}
                <div className="flex gap-1.5 mt-2">
                  {[0, 10, 30, 50, 70, 80, 90, 100].map(v => (
                    <button key={v} onClick={() => setBracketForm(f => ({ ...f, refundRate: v }))}
                      className={"text-[11px] px-2 py-1 rounded-lg cursor-pointer transition-colors " + (bracketForm.refundRate === v ? "bg-[#2F4F46] text-white" : "bg-[#F7F3ED] text-[#6B7280] hover:bg-[#E6E2DB]")}>
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-end gap-3">
              <button onClick={() => setShowBracketForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] cursor-pointer">취소</button>
              <button onClick={saveBracket} disabled={!bracketForm.label.trim()} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {editingBracketIdx !== null ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Delete Confirm Modal ═══════ */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[400px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#E6E2DB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDECEC] flex items-center justify-center"><Trash2 size={20} className="text-[#C62828]" /></div>
                <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>환불 규정 삭제</h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[15px] text-[#6B7280]">
                이 환불 규정을 삭제하시겠습니까?<br />
                삭제된 규정은 복구할 수 없으며, 해당 규정이 적용된 상품의 환불 정책을 다시 설정해야 합니다.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] cursor-pointer">취소</button>
              <button onClick={() => deleteRule(deleteTarget)} className="h-[48px] px-7 rounded-xl bg-[#C62828] text-white text-[14px] hover:bg-[#B71C1C] cursor-pointer">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
