import { useState, useMemo } from "react";
import {
  Users, UserPlus, Check, ChevronDown, ChevronRight, ChevronUp,
  AlertTriangle, Download, FileText, Clock, Shield,
  CheckCircle2, AlertCircle, TrendingUp, Wallet, Moon, Sun, ArrowLeft,
  Briefcase, CalendarDays, Info, Eye, HelpCircle
} from "lucide-react";
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { toast } from "sonner";

/* ══════════════════════════════ Types ══════════════════════════════ */
interface Employee {
  id: number; name: string; type: "정규직" | "계약직" | "일용직"; position: string;
  startDate: string; status: "재직" | "휴직" | "퇴사"; monthlySalary: number;
  mealAllowance: number; mealTaxFree: boolean; otherAllowance: number;
  insuranceEnrolled: boolean; weeklyWorkDays: number; dailyWorkHours: number;
  payDay: number; contractEnd?: string; memo: string; phone: string;
}

interface PartTimer {
  id: number; name: string; hourlyWage: number; weeklyHours: number;
  workDays: string[]; startDate: string; status: "재직" | "퇴사";
  contractEnd?: string; restMinutes: number; payPeriod: "주급" | "월급";
  insuranceStatus: "가입" | "미가입" | "확인필요"; memo: string; phone: string;
}

/* ══════════════════════════════ Constants ══════════════════════════════ */
const INS = {
  국민연금: { e: 0.0475, c: 0.0475 },
  건강보험: { e: 0.03595, c: 0.03595 },
  장기요양: 0.009448,
  고용보험: { e: 0.009, c: 0.009 },
  산재보험: 0.0147,
};

type Tab = "현황" | "직원" | "알바" | "급여" | "보험" | "퇴직금" | "근무표" | "리스크" | "문서";
const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: "현황", label: "인력현황", icon: Users },
  { key: "직원", label: "직원관리", icon: Briefcase },
  { key: "알바", label: "알바관리", icon: Clock },
  { key: "급여", label: "급여계산", icon: Wallet },
  { key: "보험", label: "4대보험", icon: Shield },
  { key: "퇴직금", label: "퇴직금", icon: TrendingUp },
  { key: "근무표", label: "근무표", icon: CalendarDays },
  { key: "리스크", label: "리스크알림", icon: AlertTriangle },
  { key: "문서", label: "문서/서식", icon: FileText },
];

type EmpDetailTab = "기본정보" | "급여수당" | "보험" | "근무휴가" | "퇴직금";

/* ══════════════════════════════ Dummy Data ══════════════════════════════ */
const EMPLOYEES: Employee[] = [
  { id: 1, name: "김영호", type: "정규직", position: "마을 운영 총괄", startDate: "2021-03-15", status: "재직", monthlySalary: 2800000, mealAllowance: 200000, mealTaxFree: true, otherAllowance: 0, insuranceEnrolled: true, weeklyWorkDays: 5, dailyWorkHours: 8, payDay: 10, memo: "마을이장 추천 채용", phone: "010-****-1234" },
  { id: 2, name: "박수진", type: "정규직", position: "체험 프로그램 담당", startDate: "2022-09-01", status: "재직", monthlySalary: 2500000, mealAllowance: 200000, mealTaxFree: true, otherAllowance: 100000, insuranceEnrolled: true, weeklyWorkDays: 5, dailyWorkHours: 8, payDay: 10, memo: "", phone: "010-****-5678" },
  { id: 3, name: "이민수", type: "계약직", position: "시설 관리", startDate: "2024-06-01", status: "재직", monthlySalary: 2200000, mealAllowance: 150000, mealTaxFree: true, otherAllowance: 0, insuranceEnrolled: true, weeklyWorkDays: 5, dailyWorkHours: 8, payDay: 10, contractEnd: "2026-05-31", memo: "계약 갱신 여부 확인", phone: "010-****-9012" },
  { id: 4, name: "최은정", type: "정규직", position: "숙박·식당 관리", startDate: "2023-01-10", status: "재직", monthlySalary: 2400000, mealAllowance: 200000, mealTaxFree: true, otherAllowance: 50000, insuranceEnrolled: true, weeklyWorkDays: 5, dailyWorkHours: 8, payDay: 10, memo: "", phone: "010-****-3456" },
];

const PARTTIMERS: PartTimer[] = [
  { id: 101, name: "정다은", hourlyWage: 10500, weeklyHours: 20, workDays: ["월", "화", "수", "목"], startDate: "2025-03-01", status: "재직", restMinutes: 30, payPeriod: "월급", insuranceStatus: "가입", memo: "", phone: "010-****-7777" },
  { id: 102, name: "한지우", hourlyWage: 10500, weeklyHours: 12, workDays: ["토", "일"], startDate: "2025-06-15", status: "재직", restMinutes: 0, payPeriod: "주급", insuranceStatus: "미가입", memo: "주말만 근무", phone: "010-****-8888" },
  { id: 103, name: "오세훈", hourlyWage: 11000, weeklyHours: 25, workDays: ["월", "수", "금", "토", "일"], startDate: "2025-01-10", status: "재직", restMinutes: 30, payPeriod: "월급", insuranceStatus: "가입", memo: "성수기 확대 가능", phone: "010-****-9999" },
  { id: 104, name: "김하나", hourlyWage: 10500, weeklyHours: 8, workDays: ["토"], startDate: "2025-09-01", status: "재직", restMinutes: 0, payPeriod: "주급", insuranceStatus: "미가입", memo: "대학생 주말 알바", phone: "010-****-1111" },
  { id: 105, name: "이준혁", hourlyWage: 12000, weeklyHours: 30, workDays: ["월", "화", "수", "목", "금"], startDate: "2025-04-01", status: "재직", restMinutes: 60, payPeriod: "월급", insuranceStatus: "확인필요", memo: "근로시간 증가 가능성", phone: "010-****-2222" },
];

/* ══════════════════════════════ Calc helpers ══════════════════════════════ */
const fmt = (n: number) => n.toLocaleString();
const fmtW = (n: number) => n >= 100000000 ? (n / 100000000).toFixed(1) + "억" : Math.round(n / 10000) + "만";

const calcEmpInsurance = (salary: number) => {
  const base = salary;
  const npE = Math.round(base * INS.국민연금.e);
  const npC = Math.round(base * INS.국민연금.c);
  const hiE = Math.round(base * INS.건강보험.e);
  const hiC = Math.round(base * INS.건강보험.c);
  const ltc = Math.round(base * INS.장기요양);
  const ltcE = Math.round(ltc / 2);
  const ltcC = Math.round(ltc / 2);
  const eiE = Math.round(base * INS.고용보험.e);
  const eiC = Math.round(base * INS.고용보험.c);
  const ia = Math.round(base * INS.산재보험);
  return {
    empTotal: npE + hiE + ltcE + eiE,
    compTotal: npC + hiC + ltcC + eiC + ia,
    breakdown: [
      { name: "국민연금", emp: npE, comp: npC },
      { name: "건강보험", emp: hiE, comp: hiC },
      { name: "장기요양", emp: ltcE, comp: ltcC },
      { name: "고용보험", emp: eiE, comp: eiC },
      { name: "산재보험", emp: 0, comp: ia },
    ],
  };
};

const calcEmpCost = (e: Employee) => {
  const gross = e.monthlySalary + e.mealAllowance + e.otherAllowance;
  const ins = e.insuranceEnrolled ? calcEmpInsurance(e.monthlySalary) : { empTotal: 0, compTotal: 0, breakdown: [] };
  const netPay = gross - ins.empTotal;
  const compBurden = gross + ins.compTotal;
  return { gross, netPay, compBurden, ins };
};

const calcPtMonthly = (p: PartTimer) => {
  const monthlyHours = p.weeklyHours * 4.345;
  const basePay = Math.round(p.hourlyWage * monthlyHours);
  const isWeeklyPay = p.weeklyHours >= 15;
  const weeklyPayHours = isWeeklyPay ? (p.weeklyHours / p.workDays.length) * 1 : 0;
  const monthlyWeeklyPay = Math.round(p.hourlyWage * weeklyPayHours * 4.345);
  const totalPay = basePay + monthlyWeeklyPay;
  const ins = p.insuranceStatus === "가입" ? calcEmpInsurance(totalPay) : { empTotal: 0, compTotal: 0, breakdown: [] };
  return { basePay, weeklyPayHours: isWeeklyPay, monthlyWeeklyPay, totalPay, netPay: totalPay - ins.empTotal, compBurden: totalPay + ins.compTotal, ins };
};

const monthsSince = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
};

const calcSeverance = (salary: number, startDate: string) => {
  const months = monthsSince(startDate);
  if (months < 12) return 0;
  return Math.round(salary * (months / 12));
};

/* ══════════════════════════════ Component ══════════════════════════════ */
export function Workforce() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<Tab>("현황");
  const [simpleMode, setSimpleMode] = useState(false);
  const [selEmpId, setSelEmpId] = useState<number | null>(null);
  const [selPtId, setSelPtId] = useState<number | null>(null);
  const [empDetailTab, setEmpDetailTab] = useState<EmpDetailTab>("기본정보");
  const [empFilter, setEmpFilter] = useState("전체");
  const [ptFilter, setPtFilter] = useState("전체");
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showAddPt, setShowAddPt] = useState(false);
  const [expandedPayroll, setExpandedPayroll] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState("전체");

  /* Theme helpers */
  const cardBg = dark ? "bg-[#1E293B]" : "bg-white";
  const cardBd = dark ? "border-[#334155]" : "border-[#E6E2DB]";
  const t1 = dark ? "text-[#F1F5F9]" : "text-[#1F2937]";
  const t2 = dark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const t3 = dark ? "text-[#64748B]" : "text-[#9CA3AF]";
  const mBg = dark ? "bg-[#0F172A]" : "bg-[#FBFAF7]";
  const sBg = dark ? "bg-[#0F172A]" : "bg-[#F7F3ED]";
  const hov = dark ? "hover:bg-[#334155]" : "hover:bg-[#FBFAF7]";
  const inp = `h-[48px] px-4 rounded-xl border ${dark ? "border-[#334155] bg-[#0F172A] text-[#F1F5F9]" : "border-[#D6D0C8] bg-white text-[#1F2937]"} text-[16px] focus:border-[#2F4F46] focus:outline-none`;

  /* ─── Global stats ─── */
  const stats = useMemo(() => {
    const empCosts = EMPLOYEES.filter(e => e.status === "재직").map(e => ({ e, c: calcEmpCost(e) }));
    const ptCosts = PARTTIMERS.filter(p => p.status === "재직").map(p => ({ p, c: calcPtMonthly(p) }));
    const totalEmpPay = empCosts.reduce((s, { c }) => s + c.gross, 0);
    const totalPtPay = ptCosts.reduce((s, { c }) => s + c.totalPay, 0);
    const totalCompIns = empCosts.reduce((s, { c }) => s + c.ins.compTotal, 0) + ptCosts.reduce((s, { c }) => s + c.ins.compTotal, 0);
    const totalWeeklyPay = ptCosts.reduce((s, { c }) => s + c.monthlyWeeklyPay, 0);
    const totalCompBurden = empCosts.reduce((s, { c }) => s + c.compBurden, 0) + ptCosts.reduce((s, { c }) => s + c.compBurden, 0);
    const activeEmp = EMPLOYEES.filter(e => e.status === "재직").length;
    const activePt = PARTTIMERS.filter(p => p.status === "재직").length;

    const pieData = [
      { name: "기본급(직원)", value: Math.round(totalEmpPay / 10000) },
      { name: "알바 급여", value: Math.round(totalPtPay / 10000) },
      { name: "주휴수당", value: Math.round(totalWeeklyPay / 10000) },
      { name: "회사부담(보험)", value: Math.round(totalCompIns / 10000) },
    ];

    return { totalEmpPay, totalPtPay, totalCompIns, totalWeeklyPay, totalCompBurden, activeEmp, activePt, pieData };
  }, []);

  /* Risk items */
  const risks = useMemo(() => {
    const items: { level: "참고" | "주의" | "심각"; msg: string; action: string; tab: Tab }[] = [];
    PARTTIMERS.filter(p => p.status === "재직").forEach(p => {
      if (p.weeklyHours >= 15) items.push({ level: "주의", msg: `${p.name}님은 주 ${p.weeklyHours}시간 근무 → 주휴수당 대상이에요`, action: "급여에 자동 반영됩니다", tab: "알바" });
      if (p.insuranceStatus === "확인필요") items.push({ level: "주의", msg: `${p.name}님의 4대보험 가입 여부를 확인해주세요`, action: "주 근무시간 기준으로 판단이 필요해요", tab: "보험" });
      const m = monthsSince(p.startDate);
      if (m >= 10 && m < 12) items.push({ level: "주의", msg: `${p.name}님이 1년 근속 예정 → 퇴직금 가능성`, action: "근무형태를 확인해주세요", tab: "퇴직금" });
    });
    EMPLOYEES.filter(e => e.status === "재직").forEach(e => {
      if (e.type === "계약직" && e.contractEnd) {
        const d = Math.ceil((new Date(e.contractEnd).getTime() - Date.now()) / 86400000);
        if (d > 0 && d <= 90) items.push({ level: "주의", msg: `${e.name}님 계약 만료 ${d}일 전`, action: "갱신 여부를 결정해주세요", tab: "직원" });
      }
      const m = monthsSince(e.startDate);
      if (m >= 12) {
        const sev = calcSeverance(e.monthlySalary, e.startDate);
        if (sev > 0) items.push({ level: "참고", msg: `${e.name}님 퇴직금 예상: ${fmt(sev)}원 (${Math.floor(m / 12)}년 ${m % 12}개월)`, action: "매달 적립하면 부담이 줄어요", tab: "퇴직금" });
      }
    });
    items.push({ level: "참고", msg: "급여 지급일(매월 10일)이 가까워요", action: "이번달 급여를 확인해주세요", tab: "급여" });
    items.push({ level: "참고", msg: "이번달 인건비/매출 비율: 약 32%", action: "35% 미만으로 양호합니다", tab: "현황" });
    return items;
  }, []);

  const PIE_COLORS = ["#2F4F46", "#4CAF50", "#FF8F00", "#8A6A2B"];
  const RISK_COLORS = { "참고": { bg: "#EBF5FB", text: "#1976D2", icon: Info, darkBg: "#0F2A3B", darkText: "#64B5F6" }, "주의": { bg: "#FFF6E6", text: "#E67E22", icon: AlertTriangle, darkBg: "#3B2E10", darkText: "#FFD54F" }, "심각": { bg: "#FDECEC", text: "#C62828", icon: AlertCircle, darkBg: "#2D1515", darkText: "#EF9A9A" } };

  const selEmp = EMPLOYEES.find(e => e.id === selEmpId);
  const selPt = PARTTIMERS.find(p => p.id === selPtId);

  /* ─── Badge helper ─── */
  const Badge = ({ label, color, bg: bgC }: { label: string; color: string; bg: string }) => (
    <span className="text-[11px] px-2 py-0.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: bgC, color, fontWeight: 700 }}>{label}</span>
  );

  const Tip = ({ text }: { text: string }) => (
    <span className="inline-flex items-center gap-0.5 group relative cursor-help">
      <HelpCircle size={13} className={t3} />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-3 py-2 bg-[#1F2937] text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">{text}</span>
    </span>
  );

  /* ══════════════════════════════ Render ══════════════════════════════ */
  return (
    <div className={`max-w-[1160px] space-y-5 ${dark ? "bg-[#0F172A]" : ""} transition-colors`}>
      {/* Tab bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {TABS.map(t => {
            const TIcon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => { setTab(t.key); setSelEmpId(null); setSelPtId(null); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap text-[13px] ${active ? `${cardBg} border-[#2F4F46] shadow-sm` : `${dark ? "border-[#334155] bg-[#1E293B]/60" : "border-[#E6E2DB] bg-white/60"} ${hov}`} ${active ? "text-[#2F4F46]" : t2}`}
                style={{ fontWeight: active ? 700 : 400 }}>
                <TIcon size={15} className={active ? "text-[#2F4F46]" : t3} />{t.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <label className={`flex items-center gap-1.5 text-[12px] ${t2} cursor-pointer`}>
            <input type="checkbox" checked={simpleMode} onChange={() => setSimpleMode(!simpleMode)} className="accent-[#2F4F46] w-4 h-4" />
            초간단 보기
          </label>
          <button onClick={() => setDark(!dark)} className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${dark ? "bg-[#334155] text-[#FFD54F]" : "bg-[#F7F3ED] text-[#6B7280]"}`}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* ═══════════════════════ 인력현황 대시보드 ═══════════════════════ */}
      {tab === "현황" && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "현재 인원", value: `총 ${stats.activeEmp + stats.activePt}명`, sub: `직원 ${stats.activeEmp} / 알바 ${stats.activePt}`, color: "#2F4F46", icon: Users },
              { label: "이번달 회사 실부담", value: fmt(stats.totalCompBurden) + "원", sub: "급여 + 수당 + 회사부담 보험", color: "#2F4F46", icon: Wallet },
              { label: "급여 지급 예정일", value: "2월 10일", sub: "11일 남음", color: "#8A6A2B", icon: CalendarDays },
            ].map((k, i) => {
              const KIcon = k.icon;
              return (
                <div key={i} className={`${cardBg} rounded-[14px] border ${cardBd} p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]`}>
                  <div className="flex items-center gap-2 mb-2"><KIcon size={16} className={t3} /><span className={`text-[13px] ${t2}`}>{k.label}</span></div>
                  <p className="text-[24px]" style={{ fontWeight: 700, color: k.color }}>{k.value}</p>
                  <p className={`text-[12px] ${t3} mt-1`}>{k.sub}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "4대보험 회사부담", value: fmt(stats.totalCompIns) + "원", color: "#1B5E20" },
              { label: "주휴수당 포함 예상", value: fmt(stats.totalWeeklyPay) + "원", color: "#E67E22" },
              { label: "법적 리스크", value: `주의 ${risks.filter(r => r.level === "주의").length}건`, color: "#E67E22" },
            ].map((k, i) => (
              <div key={i} className={`${cardBg} rounded-[14px] border ${cardBd} p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]`}>
                <span className={`text-[13px] ${t2}`}>{k.label}</span>
                <p className="text-[22px] mt-1" style={{ fontWeight: 700, color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Chart - payroll composition + Risk alerts */}
          <div className="flex gap-4">
            {!simpleMode && (
              <div className={`flex-1 min-w-0 ${cardBg} rounded-[14px] border ${cardBd} p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
                <h3 className={`text-[15px] ${t1} mb-1`} style={{ fontWeight: 700 }}>이번달 인건비 구성 (만원)</h3>
                <p className={`text-[13px] ${t3} mb-4`}>이번달은 알바 근무시간 증가로 주휴수당이 늘었어요.</p>
                <div className="flex items-center">
                  <div style={{ width: "55%", minWidth: 0, height: 200, overflow: "visible" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                        <Pie data={stats.pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" label={({ name, percent, x, y, textAnchor }) => (<text x={x} y={y} textAnchor={textAnchor} fill={dark ? "#E2E8F0" : "#374151"} fontSize={13} dominantBaseline="central">{`${name} ${(percent * 100).toFixed(0)}%`}</text>)}>
                          {stats.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value.toLocaleString()}만원`]} contentStyle={{ borderRadius: 12, fontSize: 14, backgroundColor: dark ? "#1E293B" : "#fff", borderColor: dark ? "#334155" : "#E6E2DB", color: dark ? "#F1F5F9" : "#1F2937" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 pl-4 flex flex-col items-end justify-center">
                    {stats.pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 w-[88%]">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className={`text-[13px] ${t2} shrink-0`}>{d.name}</span>
                        <span className={`text-[13px] ${t1} shrink-0 ml-auto tabular-nums`} style={{ fontWeight: 700 }}>{fmt(d.value)}만원</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Risk alerts (side panel) */}
            <div className={`${simpleMode ? 'w-full' : 'w-[280px] shrink-0'} ${cardBg} rounded-[14px] border ${cardBd} p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
              <h3 className={`text-[13px] ${t2} mb-3`} style={{ fontWeight: 700 }}>⚠ 법적 리스크 알림</h3>
              <div className="space-y-2">
                {risks.filter(r => r.level !== "참고" || !simpleMode).slice(0, simpleMode ? 3 : 5).map((r, i) => {
                  const cfg = RISK_COLORS[r.level];
                  const RIcon = cfg.icon;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cardBd}`} style={{ backgroundColor: dark ? cfg.darkBg : cfg.bg }}>
                      <RIcon size={13} style={{ color: dark ? cfg.darkText : cfg.text }} className="shrink-0" />
                      <p className="text-[11px] flex-1 min-w-0 truncate" style={{ color: dark ? cfg.darkText : cfg.text, fontWeight: 600 }}>{r.msg}</p>
                      <button onClick={() => setTab(r.tab)} className="text-[10px] px-1.5 py-0.5 rounded-md border cursor-pointer whitespace-nowrap" style={{ borderColor: dark ? cfg.darkText : cfg.text, color: dark ? cfg.darkText : cfg.text }}>확인</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Staff cards */}
          <div>
            <h3 className={`text-[15px] ${t1} mb-3`} style={{ fontWeight: 700 }}>인력 리스트</h3>
            <div className="grid grid-cols-2 gap-3">
              {EMPLOYEES.filter(e => e.status === "재직").map(e => {
                const c = calcEmpCost(e);
                const hasRisk = risks.some(r => r.msg.includes(e.name));
                return (
                  <div key={e.id} className={`${cardBg} rounded-[14px] border ${cardBd} p-4 cursor-pointer ${hov} transition-colors`}
                    onClick={() => { setTab("직원"); setSelEmpId(e.id); setEmpDetailTab("기본정보"); }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#2F4F46] flex items-center justify-center text-white text-[13px]" style={{ fontWeight: 700 }}>{e.name[0]}</div>
                        <div><p className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{e.name}</p><p className={`text-[12px] ${t3}`}>{e.position}</p></div>
                      </div>
                      <div className="flex gap-1">
                        <Badge label="직원" color="#1B5E20" bg={dark ? "#1B3A20" : "#ECF7EE"} />
                        {hasRisk && <Badge label="주의" color="#E67E22" bg={dark ? "#3B2E10" : "#FFF6E6"} />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><p className={`text-[11px] ${t3}`}>예상 급여(세전)</p><p className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(c.gross)}원</p></div>
                      <div><p className={`text-[11px] ${t3}`}>회사 실부담</p><p className="text-[14px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.compBurden)}원</p></div>
                    </div>
                  </div>
                );
              })}
              {PARTTIMERS.filter(p => p.status === "재직").map(p => {
                const c = calcPtMonthly(p);
                const hasRisk = risks.some(r => r.msg.includes(p.name));
                return (
                  <div key={p.id} className={`${cardBg} rounded-[14px] border ${cardBd} p-4 cursor-pointer ${hov} transition-colors`}
                    onClick={() => { setTab("알바"); setSelPtId(p.id); }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#FF8F00] flex items-center justify-center text-white text-[13px]" style={{ fontWeight: 700 }}>{p.name[0]}</div>
                        <div><p className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{p.name}</p><p className={`text-[12px] ${t3}`}>시급 {fmt(p.hourlyWage)}원 · 주 {p.weeklyHours}시간</p></div>
                      </div>
                      <div className="flex gap-1">
                        <Badge label="알바" color="#E67E22" bg={dark ? "#3B2E10" : "#FFF6E6"} />
                        {c.weeklyPayHours && <Badge label="주휴대상" color="#1976D2" bg={dark ? "#0F2A3B" : "#EBF5FB"} />}
                        {hasRisk && <Badge label="주의" color="#E67E22" bg={dark ? "#3B2E10" : "#FFF6E6"} />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><p className={`text-[11px] ${t3}`}>예상 월급여</p><p className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(c.totalPay)}원</p></div>
                      <div><p className={`text-[11px] ${t3}`}>회사 실부담</p><p className="text-[14px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.compBurden)}원</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ 직원관리 ═══════════════════════ */}
      {tab === "직원" && !selEmpId && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {["전체", "재직", "정규직", "계약직"].map(f => (
                <button key={f} onClick={() => setEmpFilter(f)} className={`text-[12px] px-3 py-1.5 rounded-lg cursor-pointer transition-all ${empFilter === f ? `${sBg} text-[#2F4F46] border border-[#2F4F46]` : `${t3}`}`} style={{ fontWeight: empFilter === f ? 700 : 400 }}>{f}</button>
              ))}
            </div>
            <button onClick={() => { setShowAddEmp(true); toast.success("직원 등록 화면은 준비 중이에요."); }} className="h-[48px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 cursor-pointer hover:bg-[#243f38]"><UserPlus size={16} />직원 등록</button>
          </div>
          <div className="space-y-3">
            {EMPLOYEES.filter(e => empFilter === "전체" || e.status === empFilter || e.type === empFilter).map(e => {
              const c = calcEmpCost(e);
              const m = monthsSince(e.startDate);
              const sev = calcSeverance(e.monthlySalary, e.startDate);
              return (
                <div key={e.id} className={`${cardBg} rounded-[14px] border ${cardBd} p-5 cursor-pointer ${hov} transition-colors`}
                  onClick={() => { setSelEmpId(e.id); setEmpDetailTab("기본정보"); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#2F4F46] flex items-center justify-center text-white text-[15px]" style={{ fontWeight: 700 }}>{e.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[16px] ${t1}`} style={{ fontWeight: 700 }}>{e.name}</span>
                          <span className={`text-[13px] ${t2}`}>{e.position}</span>
                        </div>
                        <p className={`text-[12px] ${t3}`}>{e.startDate} 입사 · {Math.floor(m / 12)}년 {m % 12}개월</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-[12px] ${t3}`}>회사 실부담</p>
                        <p className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.compBurden)}원</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge label={e.type} color="#1B5E20" bg={dark ? "#1B3A20" : "#ECF7EE"} />
                        {e.insuranceEnrolled && <Badge label="보험가입" color="#1976D2" bg={dark ? "#0F2A3B" : "#EBF5FB"} />}
                        {sev > 0 && <Badge label="퇴직금" color="#E67E22" bg={dark ? "#3B2E10" : "#FFF6E6"} />}
                      </div>
                      <ChevronRight size={16} className={t3} />
                    </div>
                  </div>
                  {!simpleMode && (
                    <div className={`grid grid-cols-4 gap-3 mt-3 pt-3 border-t ${cardBd}`}>
                      <div><p className={`text-[11px] ${t3}`}>월급(세전)</p><p className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(e.monthlySalary)}원</p></div>
                      <div><p className={`text-[11px] ${t3}`}>보험 회사부담</p><p className="text-[14px] text-[#1B5E20]">{fmt(c.ins.compTotal)}원</p></div>
                      <div><p className={`text-[11px] ${t3}`}>예상 실수령</p><p className={`text-[14px] ${t1}`}>{fmt(c.netPay)}원</p></div>
                      <div><p className={`text-[11px] ${t3}`}>퇴직금 예상</p><p className="text-[14px] text-[#E67E22]">{sev > 0 ? fmt(sev) + "원" : "-"}</p></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 직원 상세 ─── */}
      {tab === "직원" && selEmpId && selEmp && (() => {
        const c = calcEmpCost(selEmp);
        const m = monthsSince(selEmp.startDate);
        const sev = calcSeverance(selEmp.monthlySalary, selEmp.startDate);
        return (
          <div className="space-y-5">
            <button onClick={() => setSelEmpId(null)} className={`flex items-center gap-2 text-[14px] ${t2} cursor-pointer ${hov} px-3 py-2 rounded-lg`}><ArrowLeft size={16} />목록으로</button>
            {/* Profile header */}
            <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#2F4F46] flex items-center justify-center text-white text-[20px]" style={{ fontWeight: 700 }}>{selEmp.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2"><h2 className={`text-[20px] ${t1}`} style={{ fontWeight: 700 }}>{selEmp.name}</h2><Badge label={selEmp.type} color="#1B5E20" bg={dark ? "#1B3A20" : "#ECF7EE"} /><Badge label={selEmp.status} color="#2F4F46" bg={dark ? "#1B3A20" : "#ECF7EE"} /></div>
                    <p className={`text-[14px] ${t2}`}>{selEmp.position} · {selEmp.startDate} 입사 ({Math.floor(m / 12)}년 {m % 12}개월)</p>
                  </div>
                </div>
                <p className="text-[22px] text-[#2F4F46]" style={{ fontWeight: 700 }}>이번달 회사 부담 {fmt(c.compBurden)}원</p>
              </div>
            </div>
            {/* Sub-tabs */}
            <div className="flex gap-2">
              {(["기본정보", "급여수당", "보험", "근무휴가", "퇴직금"] as EmpDetailTab[]).map(dt => (
                <button key={dt} onClick={() => setEmpDetailTab(dt)} className={`px-4 py-2.5 rounded-xl text-[13px] border cursor-pointer transition-all ${empDetailTab === dt ? `${cardBg} border-[#2F4F46] shadow-sm text-[#2F4F46]` : `${dark ? "border-[#334155]" : "border-[#E6E2DB]"} ${t2} ${hov}`}`} style={{ fontWeight: empDetailTab === dt ? 700 : 400 }}>{dt}</button>
              ))}
            </div>

            {empDetailTab === "기본정보" && (
              <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6 space-y-4`}>
                {[["이름", selEmp.name], ["직책", selEmp.position], ["고용형태", selEmp.type], ["입사일", selEmp.startDate], ["계약 종료일", selEmp.contractEnd || "해당 없음"], ["연락처", selEmp.phone], ["급여 지급일", `매월 ${selEmp.payDay}일`], ["메모", selEmp.memo || "-"]].map(([l, v]) => (
                  <div key={l} className={`flex items-center py-2 border-b ${cardBd}`}>
                    <span className={`text-[14px] ${t2} w-[140px] shrink-0`}>{l}</span>
                    <span className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {empDetailTab === "급여수당" && (
              <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6 space-y-4`}>
                <p className={`text-[13px] ${t3} mb-2`}>월급(세전)만 적어주세요. 나머지는 자동으로 계산해드려요.</p>
                {[
                  ["월급(세전)", fmt(selEmp.monthlySalary) + "원"],
                  ["식대" + (selEmp.mealTaxFree ? " (비과세)" : " (과세)"), fmt(selEmp.mealAllowance) + "원"],
                  ["기타 수당", fmt(selEmp.otherAllowance) + "원"],
                  ["세전 총 급여", fmt(c.gross) + "원"],
                ].map(([l, v], i) => (
                  <div key={l} className={`flex items-center justify-between py-2 ${i < 3 ? `border-b ${cardBd}` : ""}`}>
                    <span className={`text-[14px] ${t2}`}>{l}</span>
                    <span className={`text-[16px] ${i === 3 ? "text-[#2F4F46]" : t1}`} style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div className={`${sBg} rounded-xl p-4 mt-4 space-y-2`}>
                  <p className={`text-[13px] ${t3}`} style={{ fontWeight: 700 }}>자동 계산 결과</p>
                  <div className="flex justify-between"><span className={`text-[14px] ${t2}`}>연봉 환산</span><span className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(selEmp.monthlySalary * 12)}원</span></div>
                  <div className="flex justify-between"><span className={`text-[14px] ${t2}`}>예상 실수령(월)</span><span className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(c.netPay)}원</span></div>
                  <div className="flex justify-between"><span className={`text-[14px] ${t2}`}>회사 실부담(월)</span><span className="text-[15px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.compBurden)}원</span></div>
                  <p className={`text-[11px] ${t3} pt-2`}>회사 실부담 = 세전급여 + 회사부담 보험(국민연금·건강·장기요양·고용·산재)</p>
                </div>
              </div>
            )}

            {empDetailTab === "보험" && (
              <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6 space-y-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>4대보험 가입 상태</span>
                  <Badge label={selEmp.insuranceEnrolled ? "가입" : "미가입"} color={selEmp.insuranceEnrolled ? "#1B5E20" : "#C62828"} bg={selEmp.insuranceEnrolled ? (dark ? "#1B3A20" : "#ECF7EE") : (dark ? "#2D1515" : "#FDECEC")} />
                </div>
                {c.ins.breakdown.map(b => (
                  <div key={b.name} className={`flex items-center justify-between py-2 border-b ${cardBd}`}>
                    <span className={`text-[14px] ${t2}`}>{b.name}</span>
                    <div className="flex gap-6">
                      <span className={`text-[13px] ${t3}`}>근로자 {fmt(b.emp)}원</span>
                      <span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>회사 {fmt(b.comp)}원</span>
                    </div>
                  </div>
                ))}
                <div className={`${sBg} rounded-xl p-4 flex justify-between`}>
                  <span className={`text-[14px] ${t2}`} style={{ fontWeight: 700 }}>이번달 회사부담 총액</span>
                  <span className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.ins.compTotal)}원</span>
                </div>
              </div>
            )}

            {empDetailTab === "근무휴가" && (
              <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6 space-y-4`}>
                {[["주 근무일", selEmp.weeklyWorkDays + "일"], ["일 근무시간", selEmp.dailyWorkHours + "시간"], ["주 총 근무시간", (selEmp.weeklyWorkDays * selEmp.dailyWorkHours) + "시간"]].map(([l, v]) => (
                  <div key={l} className={`flex items-center justify-between py-2 border-b ${cardBd}`}>
                    <span className={`text-[14px] ${t2}`}>{l}</span>
                    <span className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div className={`px-4 py-3 ${dark ? "bg-[#0F2A3B]" : "bg-[#EBF5FB]"} rounded-xl flex items-start gap-2`}>
                  <Info size={14} className={`${dark ? "text-[#64B5F6]" : "text-[#1976D2]"} shrink-0 mt-0.5`} />
                  <span className={`text-[13px] ${dark ? "text-[#64B5F6]" : "text-[#1976D2]"}`}>연차 발생, 휴게시간 규정 등은 사업장 규모와 근로형태에 따라 달라질 수 있어요. 정확한 내용은 관할 노동청에 문의하시면 좋아요.</span>
                </div>
              </div>
            )}

            {empDetailTab === "퇴직금" && (
              <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6 space-y-4`}>
                <div className={`${sBg} rounded-xl p-5 text-center`}>
                  <p className={`text-[13px] ${t3}`}>예상 퇴직금 (대략)</p>
                  <p className="text-[28px] text-[#2F4F46] mt-1" style={{ fontWeight: 700 }}>{sev > 0 ? fmt(sev) + "원" : "해당 없음"}</p>
                  <p className={`text-[12px] ${t3} mt-2`}>1년 이상 근무하면 퇴직금이 생길 수 있어요. 평균임금 기준으로 계산됩니다.</p>
                </div>
                {sev > 0 && (
                  <div className={`px-4 py-3 ${dark ? "bg-[#3B2E10]" : "bg-[#FFF6E6]"} rounded-xl`}>
                    <p className="text-[14px] text-[#E67E22]" style={{ fontWeight: 700 }}>💡 준비 가이드</p>
                    <p className={`text-[13px] ${t2} mt-1`}>이번달부터 매달 약 {fmt(Math.round(sev / Math.max(m, 1)))}원씩 적립하면 부담이 줄어요.</p>
                  </div>
                )}
                <p className={`text-[11px] ${t3}`}>정확한 퇴직금 산정은 평균임금·근무일수에 따라 달라질 수 있어요.</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════════════════ 알바관리 ══════════════════���════ */}
      {tab === "알바" && !selPtId && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {["전체", "주휴대상", "보험확인"].map(f => (
                <button key={f} onClick={() => setPtFilter(f)} className={`text-[12px] px-3 py-1.5 rounded-lg cursor-pointer ${ptFilter === f ? `${sBg} text-[#2F4F46] border border-[#2F4F46]` : t3}`} style={{ fontWeight: ptFilter === f ? 700 : 400 }}>{f}</button>
              ))}
            </div>
            <button onClick={() => toast.success("알바 등록 화면은 준비 중이에요.")} className="h-[48px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 cursor-pointer hover:bg-[#243f38]"><UserPlus size={16} />알바 등록</button>
          </div>
          <div className="space-y-3">
            {PARTTIMERS.filter(p => {
              if (ptFilter === "전체") return p.status === "재직";
              if (ptFilter === "주휴대상") return p.weeklyHours >= 15 && p.status === "재직";
              return p.insuranceStatus === "확인필요" && p.status === "재직";
            }).map(p => {
              const c = calcPtMonthly(p);
              return (
                <div key={p.id} className={`${cardBg} rounded-[14px] border ${cardBd} p-5 cursor-pointer ${hov} transition-colors`} onClick={() => setSelPtId(p.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#FF8F00] flex items-center justify-center text-white text-[15px]" style={{ fontWeight: 700 }}>{p.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-2"><span className={`text-[16px] ${t1}`} style={{ fontWeight: 700 }}>{p.name}</span></div>
                        <p className={`text-[12px] ${t3}`}>시급 {fmt(p.hourlyWage)}원 · 주 {p.weeklyHours}시간 · {p.workDays.join("·")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-[12px] ${t3}`}>월 예상</p>
                        <p className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.totalPay)}원</p>
                      </div>
                      <div className="flex gap-1 flex-col items-end">
                        {c.weeklyPayHours && <Badge label="주휴수당 대상" color="#1976D2" bg={dark ? "#0F2A3B" : "#EBF5FB"} />}
                        {p.insuranceStatus === "확인필요" && <Badge label="보험 확인필요" color="#E67E22" bg={dark ? "#3B2E10" : "#FFF6E6"} />}
                      </div>
                      <ChevronRight size={16} className={t3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 알바 상세 ─── */}
      {tab === "알바" && selPtId && selPt && (() => {
        const c = calcPtMonthly(selPt);
        return (
          <div className="space-y-5">
            <button onClick={() => setSelPtId(null)} className={`flex items-center gap-2 text-[14px] ${t2} cursor-pointer ${hov} px-3 py-2 rounded-lg`}><ArrowLeft size={16} />목록으로</button>
            <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#FF8F00] flex items-center justify-center text-white text-[20px]" style={{ fontWeight: 700 }}>{selPt.name[0]}</div>
                <div>
                  <h2 className={`text-[20px] ${t1}`} style={{ fontWeight: 700 }}>{selPt.name}</h2>
                  <p className={`text-[14px] ${t2}`}>{selPt.startDate} 시작 · {selPt.workDays.join("·")} 근무</p>
                </div>
              </div>
              <p className={`text-[13px] ${t3} mb-3`}>시급, 주 근무시간, 시작일만 입력하면 나머지는 자동 계산돼요.</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`${sBg} rounded-xl p-3`}><p className={`text-[11px] ${t3}`}>시급</p><p className={`text-[18px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(selPt.hourlyWage)}원</p></div>
                <div className={`${sBg} rounded-xl p-3`}><p className={`text-[11px] ${t3}`}>주 근무시간</p><p className={`text-[18px] ${t1}`} style={{ fontWeight: 700 }}>{selPt.weeklyHours}시간</p></div>
                <div className={`${sBg} rounded-xl p-3`}><p className={`text-[11px] ${t3}`}>근무 시작일</p><p className={`text-[16px] ${t1}`} style={{ fontWeight: 700 }}>{selPt.startDate}</p></div>
              </div>
            </div>
            {/* Auto calc results */}
            <div className={`${cardBg} rounded-[14px] border ${cardBd} p-6 space-y-3`}>
              <h3 className={`text-[15px] ${t1} mb-2`} style={{ fontWeight: 700 }}>자동 계산 결과</h3>
              {[
                ["월 기본급 (시급×시간)", fmt(c.basePay) + "원"],
                ["주휴수당 (월 환산)", c.weeklyPayHours ? fmt(c.monthlyWeeklyPay) + "원" : "해당 없음"],
                ["월 총 지급 예상", fmt(c.totalPay) + "원"],
                ["회사 실부담", fmt(c.compBurden) + "원"],
              ].map(([l, v], i) => (
                <div key={l} className={`flex items-center justify-between py-2 ${i < 3 ? `border-b ${cardBd}` : ""}`}>
                  <span className={`text-[14px] ${t2}`}>{l}</span>
                  <span className={`text-[16px] ${i === 3 ? "text-[#2F4F46]" : t1}`} style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            {/* Notices */}
            <div className="space-y-2">
              {c.weeklyPayHours && (
                <div className={`px-4 py-3 ${dark ? "bg-[#0F2A3B]" : "bg-[#EBF5FB]"} rounded-xl flex items-start gap-2`}>
                  <Info size={14} className={`${dark ? "text-[#64B5F6]" : "text-[#1976D2]"} shrink-0 mt-0.5`} />
                  <span className={`text-[13px] ${dark ? "text-[#64B5F6]" : "text-[#1976D2]"}`}>주 15시간 이상이면 주휴수당 대상이에요 → 주휴 포함 급여가 자동 반영돼요</span>
                </div>
              )}
              {selPt.insuranceStatus === "확인필요" && (
                <div className={`px-4 py-3 ${dark ? "bg-[#3B2E10]" : "bg-[#FFF6E6]"} rounded-xl flex items-start gap-2`}>
                  <AlertTriangle size={14} className="text-[#E67E22] shrink-0 mt-0.5" />
                  <span className="text-[13px] text-[#E67E22]">고용보험·산재 적용 가능성이 있어요. 근무시간과 계약형태를 확인해주세요.</span>
                </div>
              )}
              <div className={`px-4 py-3 ${mBg} rounded-xl border ${cardBd} flex items-start gap-2`}>
                <Info size={14} className={`${t3} shrink-0 mt-0.5`} />
                <span className={`text-[12px] ${t3}`}>이 안내는 일반 기준이에요. 정확한 판단은 근로형태·계약에 따라 달라질 수 있어요.</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════ 급여계산 ═══════════════════════ */}
      {tab === "급여" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[13px] ${t3}`}>2026년 2월 급여</p>
              <p className={`text-[13px] ${t2}`}>상태: <span className="text-[#E67E22]" style={{ fontWeight: 700 }}>미확정</span></p>
            </div>
            <button onClick={() => toast.success("급여가 확정되었습니다.")} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 cursor-pointer hover:bg-[#243f38]"><Check size={16} />한 번에 확정</button>
          </div>
          {/* Total cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { l: "직원 급여 합계", v: fmt(stats.totalEmpPay), c: "#2F4F46" },
              { l: "알바 급여 합계", v: fmt(stats.totalPtPay), c: "#FF8F00" },
              { l: "주휴수당 합계", v: fmt(stats.totalWeeklyPay), c: "#E67E22" },
              { l: "회사부담(보험)", v: fmt(stats.totalCompIns), c: "#1B5E20" },
              { l: "최종 실부담 총액", v: fmt(stats.totalCompBurden), c: "#2F4F46" },
            ].map(k => (
              <div key={k.l} className={`${cardBg} rounded-[14px] border ${cardBd} p-4 text-center`}>
                <p className={`text-[11px] ${t3} mb-1`}>{k.l}</p>
                <p className="text-[18px]" style={{ fontWeight: 700, color: k.c }}>{k.v}원</p>
              </div>
            ))}
          </div>
          {/* Per person */}
          <div className={`${cardBg} rounded-[14px] border ${cardBd} overflow-hidden`}>
            <div className={`px-5 py-2.5 ${mBg} border-b ${cardBd} grid items-center`} style={{ gridTemplateColumns: "1fr 100px 100px 100px 100px 50px" }}>
              {["이름/형태", "세전급여", "공제", "실지급", "회사부담", ""].map(h => <span key={h} className={`text-[12px] ${t3}`} style={{ fontWeight: 700 }}>{h}</span>)}
            </div>
            {EMPLOYEES.filter(e => e.status === "재직").map(e => {
              const c = calcEmpCost(e);
              const open = expandedPayroll === e.id;
              return (
                <div key={e.id}>
                  <div className={`px-5 py-3 grid items-center cursor-pointer ${hov}`} style={{ gridTemplateColumns: "1fr 100px 100px 100px 100px 50px" }} onClick={() => setExpandedPayroll(open ? null : e.id)}>
                    <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#2F4F46] flex items-center justify-center text-white text-[11px]" style={{ fontWeight: 700 }}>{e.name[0]}</div><span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{e.name}</span><span className={`text-[11px] ${t3}`}>직원</span></div>
                    <span className={`text-[13px] ${t1}`}>{fmt(c.gross)}</span>
                    <span className={`text-[13px] ${t2}`}>{fmt(c.ins.empTotal)}</span>
                    <span className={`text-[13px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(c.netPay)}</span>
                    <span className="text-[13px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.compBurden)}</span>
                    <span className={t3}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                  </div>
                  {open && (
                    <div className={`px-5 pb-4 ${mBg}`}>
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <div className="space-y-1">
                          <p className={t3} style={{ fontWeight: 700 }}>급여 항목</p>
                          <div className="flex justify-between"><span className={t2}>기본급</span><span className={t1}>{fmt(e.monthlySalary)}원</span></div>
                          <div className="flex justify-between"><span className={t2}>식대{e.mealTaxFree ? "(비과세)" : ""}</span><span className={t1}>{fmt(e.mealAllowance)}원</span></div>
                          {e.otherAllowance > 0 && <div className="flex justify-between"><span className={t2}>기타수당</span><span className={t1}>{fmt(e.otherAllowance)}원</span></div>}
                        </div>
                        <div className="space-y-1">
                          <p className={t3} style={{ fontWeight: 700 }}>공제 항목(근로자)</p>
                          {c.ins.breakdown.filter(b => b.emp > 0).map(b => <div key={b.name} className="flex justify-between"><span className={t2}>{b.name}</span><span className={t1}>{fmt(b.emp)}원</span></div>)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={`border-b ${cardBd}`} />
                </div>
              );
            })}
            {PARTTIMERS.filter(p => p.status === "재직").map(p => {
              const c = calcPtMonthly(p);
              const open = expandedPayroll === p.id;
              return (
                <div key={p.id}>
                  <div className={`px-5 py-3 grid items-center cursor-pointer ${hov}`} style={{ gridTemplateColumns: "1fr 100px 100px 100px 100px 50px" }} onClick={() => setExpandedPayroll(open ? null : p.id)}>
                    <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#FF8F00] flex items-center justify-center text-white text-[11px]" style={{ fontWeight: 700 }}>{p.name[0]}</div><span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{p.name}</span><span className={`text-[11px] ${t3}`}>알바</span></div>
                    <span className={`text-[13px] ${t1}`}>{fmt(c.totalPay)}</span>
                    <span className={`text-[13px] ${t2}`}>{fmt(c.ins.empTotal)}</span>
                    <span className={`text-[13px] ${t1}`} style={{ fontWeight: 700 }}>{fmt(c.netPay)}</span>
                    <span className="text-[13px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(c.compBurden)}</span>
                    <span className={t3}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                  </div>
                  {open && (
                    <div className={`px-5 pb-4 ${mBg}`}>
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <div className="space-y-1">
                          <p className={t3} style={{ fontWeight: 700 }}>급여 항목</p>
                          <div className="flex justify-between"><span className={t2}>기본급</span><span className={t1}>{fmt(c.basePay)}원</span></div>
                          {c.weeklyPayHours && <div className="flex justify-between"><span className={t2}>주휴수당</span><span className={t1}>{fmt(c.monthlyWeeklyPay)}원</span></div>}
                        </div>
                        <div className="space-y-1">
                          <p className={t3} style={{ fontWeight: 700 }}>기본 정보</p>
                          <div className="flex justify-between"><span className={t2}>시급</span><span className={t1}>{fmt(p.hourlyWage)}원</span></div>
                          <div className="flex justify-between"><span className={t2}>주 근무시간</span><span className={t1}>{p.weeklyHours}시간</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={`border-b ${cardBd}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════ 4대보험 ═══════════════════════ */}
      {tab === "보험" && (
        <div className="space-y-5">
          <div className={`px-4 py-3 ${dark ? "bg-[#0F2A3B]" : "bg-[#EBF5FB]"} rounded-xl flex items-start gap-2`}>
            <Info size={14} className={`${dark ? "text-[#64B5F6]" : "text-[#1976D2]"} shrink-0 mt-0.5`} />
            <span className={`text-[13px] ${dark ? "text-[#64B5F6]" : "text-[#1976D2]"}`}>기본 요율은 2026년 기준으로 자동 적용됩니다. 업종·회사규모에 따라 달라질 수 있어요.</span>
          </div>
          {/* Rates */}
          <div className={`${cardBg} rounded-[14px] border ${cardBd} p-5`}>
            <h3 className={`text-[15px] ${t1} mb-3`} style={{ fontWeight: 700 }}>2026년 보험 요율</h3>
            <div className="space-y-2">
              {[
                ["국민연금", "총 9.5%", "근로자 4.75% / 회사 4.75%"],
                ["건강보험", "총 7.19%", "근로자 3.595% / 회사 3.595%"],
                ["장기요양", "0.9448%", "건강보험료에 연동되어 계산"],
                ["고용보험(실업급여)", "총 1.8%", "근로자 0.9% / 회사 0.9%"],
                ["산재보험", "약 1.47%", "회사 전액 (업종별 상이)"],
              ].map(([n, r, d]) => (
                <div key={n} className={`flex items-center justify-between py-2 border-b ${cardBd}`}>
                  <span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{n}</span>
                  <div className="text-right">
                    <span className={`text-[14px] ${t1}`}>{r}</span>
                    <p className={`text-[11px] ${t3}`}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Enrolled list */}
          <div className={`${cardBg} rounded-[14px] border ${cardBd} p-5`}>
            <h3 className={`text-[15px] ${t1} mb-3`} style={{ fontWeight: 700 }}>대상자 현황</h3>
            <div className="space-y-2">
              {[...EMPLOYEES.filter(e => e.status === "재직").map(e => ({ name: e.name, status: e.insuranceEnrolled ? "가입" as const : "미가입" as const, reason: "", compBurden: calcEmpCost(e).ins.compTotal })),
              ...PARTTIMERS.filter(p => p.status === "재직").map(p => ({ name: p.name, status: p.insuranceStatus, reason: p.insuranceStatus === "확인필요" ? "주 근무시간 입력이 충분하지 않아 판단이 어려워요 → 근무시간을 확인해주세요" : "", compBurden: calcPtMonthly(p).ins.compTotal })),
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl ${item.status === "확인필요" ? (dark ? "bg-[#3B2E10]" : "bg-[#FFF6E6]") : mBg}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{item.name}</span>
                    <Badge label={item.status} color={item.status === "가입" ? "#1B5E20" : item.status === "확인필요" ? "#E67E22" : "#C62828"} bg={item.status === "가입" ? (dark ? "#1B3A20" : "#ECF7EE") : item.status === "확인필요" ? (dark ? "#3B2E10" : "#FFF6E6") : (dark ? "#2D1515" : "#FDECEC")} />
                  </div>
                  <div className="text-right">
                    <span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>회사부담 {fmt(item.compBurden)}원</span>
                    {item.reason && <p className={`text-[11px] ${t3} max-w-[280px]`}>{item.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Company burden summary */}
          <div className={`${sBg} rounded-xl p-5 flex items-center justify-between`}>
            <span className={`text-[16px] ${t1}`} style={{ fontWeight: 700 }}>이번달 회사부담 총액</span>
            <span className="text-[24px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{fmt(stats.totalCompIns)}원</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════ 퇴직금 ═══════════════════════ */}
      {tab === "퇴직금" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const allPeople = [...EMPLOYEES.filter(e => e.status === "재직").map(e => ({ name: e.name, months: monthsSince(e.startDate), salary: e.monthlySalary, sev: calcSeverance(e.monthlySalary, e.startDate) }))];
              const over12 = allPeople.filter(p => p.months >= 12);
              const near12 = allPeople.filter(p => p.months >= 10 && p.months < 12);
              const totalSev = over12.reduce((s, p) => s + p.sev, 0);
              return [
                { l: "퇴직금 발생 가능 인원", v: over12.length + "명", c: "#2F4F46" },
                { l: "1년 도달 예정 (90일 이내)", v: near12.length + "명", c: "#E67E22" },
                { l: "퇴직금 예상 총액", v: fmt(totalSev) + "원", c: "#2F4F46" },
              ].map(k => (
                <div key={k.l} className={`${cardBg} rounded-[14px] border ${cardBd} p-5`}>
                  <span className={`text-[13px] ${t2}`}>{k.l}</span>
                  <p className="text-[22px] mt-1" style={{ fontWeight: 700, color: k.c }}>{k.v}</p>
                </div>
              ));
            })()}
          </div>
          {/* Per person */}
          <div className={`${cardBg} rounded-[14px] border ${cardBd} p-5 space-y-3`}>
            <h3 className={`text-[15px] ${t1} mb-2`} style={{ fontWeight: 700 }}>개인별 퇴직금 예상</h3>
            {EMPLOYEES.filter(e => e.status === "재직").map(e => {
              const m = monthsSince(e.startDate);
              const sev = calcSeverance(e.monthlySalary, e.startDate);
              return (
                <div key={e.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${mBg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2F4F46] flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 700 }}>{e.name[0]}</div>
                    <div>
                      <span className={`text-[14px] ${t1}`} style={{ fontWeight: 700 }}>{e.name}</span>
                      <p className={`text-[12px] ${t3}`}>{Math.floor(m / 12)}년 {m % 12}개월 근속</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{sev > 0 ? fmt(sev) + "원" : "미발생"}</p>
                    {sev > 0 && <p className={`text-[11px] ${t3}`}>매달 약 {fmt(Math.round(sev / Math.max(m, 1)))}원 적립 추천</p>}
                  </div>
                </div>
              );
            })}
            <p className={`text-[11px] ${t3} mt-2`}>정확한 산정은 평균임금·근무일수에 따라 달라질 수 있어요.</p>
          </div>
          {/* Checklist */}
          <div className={`${cardBg} rounded-[14px] border ${cardBd} p-5`}>
            <h3 className={`text-[15px] ${t1} mb-3`} style={{ fontWeight: 700 }}>퇴직 처리 체크리스트</h3>
            {["퇴직일 확정", "미지급 급여 정산", "퇴직금 산정 및 지급", "4대보험 자격 상실 신고", "퇴직증명서 발급"].map(item => (
              <label key={item} className={`flex items-center gap-3 py-2 cursor-pointer`}>
                <input type="checkbox" className="accent-[#2F4F46] w-5 h-5" />
                <span className={`text-[14px] ${t1}`}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════ 근무표 ══════════════════════�� */}
      {tab === "근무표" && (
        <div className="space-y-5">
          <div className={`px-4 py-3 ${dark ? "bg-[#0F2A3B]" : "bg-[#EBF5FB]"} rounded-xl flex items-start gap-2`}>
            <Info size={14} className={`${dark ? "text-[#64B5F6]" : "text-[#1976D2]"} shrink-0 mt-0.5`} />
            <span className={`text-[13px] ${dark ? "text-[#64B5F6]" : "text-[#1976D2]"}`}>근무표에 시간을 입력하면 주휴수당·보험 대상 여부가 자동으로 판별되고 급여계산에 반영돼요.</span>
          </div>
          <div className={`${cardBg} rounded-[14px] border ${cardBd} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>2026년 2월 3주차 근무표</h3>
              <div className="flex gap-2">
                <button className={`text-[12px] px-3 py-1.5 rounded-lg ${sBg} text-[#2F4F46] border border-[#2F4F46] cursor-pointer`} style={{ fontWeight: 700 }}>주간</button>
                <button className={`text-[12px] px-3 py-1.5 rounded-lg ${t3} cursor-pointer`}>월간</button>
              </div>
            </div>
            <div className={`grid grid-cols-8 gap-px ${dark ? "bg-[#334155]" : "bg-[#E6E2DB]"} rounded-xl overflow-hidden`}>
              {/* Header */}
              <div className={`p-2 ${mBg}`}></div>
              {["월", "화", "수", "목", "금", "토", "일"].map(d => (
                <div key={d} className={`p-2 ${mBg} text-center`}><span className={`text-[12px] ${t3}`} style={{ fontWeight: 700 }}>{d}</span></div>
              ))}
              {/* Rows */}
              {[...EMPLOYEES.filter(e => e.status === "재직"), ...PARTTIMERS.filter(p => p.status === "재직")].map(person => {
                const isEmp = "monthlySalary" in person;
                const workDays = isEmp ? ["월", "화", "수", "목", "금"] : (person as PartTimer).workDays;
                const hours = isEmp ? (person as Employee).dailyWorkHours : Math.round((person as PartTimer).weeklyHours / (person as PartTimer).workDays.length);
                return (
                  <div key={person.id} className="contents">
                    <div className={`p-2 ${cardBg} flex items-center gap-1`}>
                      <div className={`w-5 h-5 rounded-full ${isEmp ? "bg-[#2F4F46]" : "bg-[#FF8F00]"} flex items-center justify-center text-white text-[9px]`} style={{ fontWeight: 700 }}>{person.name[0]}</div>
                      <span className={`text-[11px] ${t1} truncate`}>{person.name}</span>
                    </div>
                    {["월", "화", "수", "목", "금", "토", "일"].map(d => (
                      <div key={d} className={`p-2 ${cardBg} text-center`}>
                        {workDays.includes(d) ? (
                          <span className={`text-[12px] px-1.5 py-0.5 rounded ${isEmp ? "bg-[#ECF7EE] text-[#1B5E20]" : "bg-[#FFF6E6] text-[#E67E22]"}`} style={{ fontWeight: 700 }}>{hours}h</span>
                        ) : (
                          <span className={`text-[11px] ${t3}`}>-</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className={`mt-3 flex gap-4 text-[12px] ${t3}`}>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#ECF7EE]" />직원</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#FFF6E6]" />알바</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ 리스크 알림 ═══════════════════════ */}
      {tab === "리스크" && (
        <div className="space-y-5">
          <div className="flex gap-1.5">
            {["전체", "참고", "주의", "심각"].map(f => (
              <button key={f} onClick={() => setRiskFilter(f)} className={`text-[12px] px-3 py-1.5 rounded-lg cursor-pointer ${riskFilter === f ? `${sBg} text-[#2F4F46] border border-[#2F4F46]` : t3}`} style={{ fontWeight: riskFilter === f ? 700 : 400 }}>{f} {f !== "전체" && `(${risks.filter(r => r.level === f).length})`}</button>
            ))}
          </div>
          <div className="space-y-3">
            {risks.filter(r => riskFilter === "전체" || r.level === riskFilter).map((r, i) => {
              const cfg = RISK_COLORS[r.level];
              const RIcon = cfg.icon;
              return (
                <div key={i} className={`${cardBg} rounded-[14px] border ${cardBd} p-5`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: dark ? cfg.darkBg : cfg.bg }}>
                      <RIcon size={18} style={{ color: dark ? cfg.darkText : cfg.text }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge label={r.level} color={dark ? cfg.darkText : cfg.text} bg={dark ? cfg.darkBg : cfg.bg} />
                      </div>
                      <p className={`text-[15px] ${t1} mb-1`} style={{ fontWeight: 700 }}>{r.msg}</p>
                      <p className={`text-[13px] ${t2}`}>{r.action}</p>
                    </div>
                    <button onClick={() => setTab(r.tab)} className={`h-[40px] px-4 rounded-xl border ${cardBd} ${t2} text-[13px] flex items-center gap-1.5 ${hov} cursor-pointer shrink-0`}>
                      바로가기 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`text-[11px] ${t3}`}>이 안내는 일반적인 기준이에요. 정확한 판단은 근로형태·계약에 따라 달라질 수 있어요.</p>
        </div>
      )}

      {/* ═══════════════════════ 문서/서식 ═══════════════════════ */}
      {tab === "문서" && (
        <div className="space-y-4">
          {[
            { title: "근로계약서 (표준)", desc: "정규직·계약직용 표준 근로계약서", icon: FileText },
            { title: "단시간 근로계약서", desc: "알바·시간제 근로자용 계약서", icon: FileText },
            { title: "급여명세서", desc: "개인별 급여 내역 명세서 (이번달)", icon: Wallet },
            { title: "4대보험 가입/상실 체크리스트", desc: "입사·퇴사 시 보험 신고 체크리스트", icon: Shield },
            { title: "퇴직금 정산서", desc: "퇴직금 산정 내역 확인서", icon: TrendingUp },
            { title: "출퇴근 기록부", desc: "월별 출퇴근 시간 기록부", icon: Clock },
            { title: "재직증명서", desc: "재직 확인용 증명서 양식", icon: CheckCircle2 },
          ].map((doc, i) => {
            const DIcon = doc.icon;
            return (
              <div key={i} className={`${cardBg} rounded-[14px] border ${cardBd} p-5 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${sBg} flex items-center justify-center`}><DIcon size={20} className={t3} /></div>
                  <div>
                    <p className={`text-[15px] ${t1}`} style={{ fontWeight: 700 }}>{doc.title}</p>
                    <p className={`text-[13px] ${t2}`}>{doc.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.success(`${doc.title} 미리보기`)} className={`h-[44px] px-4 rounded-xl border ${cardBd} ${t2} text-[13px] flex items-center gap-1.5 ${hov} cursor-pointer`}><Eye size={14} />미리보기</button>
                  <button onClick={() => toast.success(`${doc.title} 다운로드 시작`)} className="h-[44px] px-4 rounded-xl bg-[#2F4F46] text-white text-[13px] flex items-center gap-1.5 cursor-pointer hover:bg-[#243f38]"><Download size={14} />다운로드</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
