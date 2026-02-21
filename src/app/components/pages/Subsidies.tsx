import { useState, useMemo } from "react";
import {
  Landmark, Plus, Edit2, Trash2, X, Check, ChevronDown, ChevronRight,
  Info, AlertTriangle, Download, Search, Calendar, FileText,
  Upload, Image, Eye, Clock, Shield, CheckCircle2, XCircle,
  AlertCircle, TrendingUp, Wallet, PieChart as PieIcon,
  BarChart3, Moon, Sun, ArrowLeft, ExternalLink, Filter
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "sonner";

/* ══════════════════════════════════════════
   Types
   ══════════════════════════════════════════ */
interface SubsidyExpense {
  id: number;
  date: string;
  vendor: string;
  item: string;
  amount: number;
  type: "정부지원" | "자부담";
  category: string;
  receiptId: number | null;
  status: "정상" | "증빙누락" | "검토필요";
}

interface SubsidyReceipt {
  id: number;
  uploadDate: string;
  amount: number;
  expenseId: number | null;
  status: "정상" | "누락" | "중복" | "불일치";
  fileName: string;
  ocrVendor: string;
  ocrAmount: number;
  ocrDate: string;
}

interface Subsidy {
  id: number;
  name: string;
  agency: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  govRatio: number;
  selfRatio: number;
  allowedCategories: string[];
  requireEvidence: boolean;
  status: "진행중" | "종료" | "정산중";
  memo: string;
  expenses: SubsidyExpense[];
  receipts: SubsidyReceipt[];
}

/* ══════════════════════════════════════════
   Dummy Data
   ══════════════════════════════════════════ */
const CATEGORIES = ["시설", "장비", "재료", "홍보", "교육", "인건비", "운영비", "기타"];

const INITIAL_SUBSIDIES: Subsidy[] = [
  {
    id: 1,
    name: "농촌체험·휴양마을 활성화 사업",
    agency: "농림축산식품부",
    startDate: "2025-03-01",
    endDate: "2026-12-31",
    totalAmount: 80000000,
    govRatio: 70,
    selfRatio: 30,
    allowedCategories: ["시설", "장비", "홍보", "교육"],
    requireEvidence: true,
    status: "진행중",
    memo: "2차년도 사업. 중간보고 2026년 6월 예정.",
    expenses: [
      { id: 101, date: "2025-04-15", vendor: "한국농촌공사", item: "체험장 리모델링 설계비", amount: 5500000, type: "정부지원", category: "시설", receiptId: 201, status: "정상" },
      { id: 102, date: "2025-05-20", vendor: "삼성인테리어", item: "체험관 내부 인테리어 공사", amount: 18000000, type: "정부지원", category: "시설", receiptId: 202, status: "정상" },
      { id: 103, date: "2025-06-10", vendor: "농협마트", item: "체험 재료 구입 (종자·비료)", amount: 1200000, type: "자부담", category: "재료", receiptId: null, status: "증빙누락" },
      { id: 104, date: "2025-07-01", vendor: "디자인팜", item: "마을 브로슈어·배너 제작", amount: 3200000, type: "정부지원", category: "홍보", receiptId: 203, status: "정상" },
      { id: 105, date: "2025-08-15", vendor: "한국관광공사", item: "관광마을 운영 교육 수수료", amount: 2000000, type: "정부지원", category: "교육", receiptId: 204, status: "정상" },
      { id: 106, date: "2025-09-20", vendor: "현대농기계", item: "소형 트랙터 구입", amount: 12000000, type: "정부지원", category: "장비", receiptId: 205, status: "정상" },
      { id: 107, date: "2025-10-05", vendor: "마을 자체", item: "주민 자부담 출자금", amount: 8000000, type: "자부담", category: "운영비", receiptId: 206, status: "정상" },
      { id: 108, date: "2026-01-10", vendor: "네이버클라우드", item: "예약시스템 구축비", amount: 4500000, type: "정부지원", category: "장비", receiptId: null, status: "증빙누락" },
      { id: 109, date: "2026-02-05", vendor: "지역신문사", item: "지역 홍보 광고비", amount: 1500000, type: "자부담", category: "홍보", receiptId: 207, status: "정상" },
    ],
    receipts: [
      { id: 201, uploadDate: "2025-04-16", amount: 5500000, expenseId: 101, status: "정상", fileName: "설계비_영수증.jpg", ocrVendor: "한국농촌공사", ocrAmount: 5500000, ocrDate: "2025-04-15" },
      { id: 202, uploadDate: "2025-05-21", amount: 18000000, expenseId: 102, status: "정상", fileName: "인테리어_세금계산서.pdf", ocrVendor: "삼성인테리어", ocrAmount: 18000000, ocrDate: "2025-05-20" },
      { id: 203, uploadDate: "2025-07-02", amount: 3200000, expenseId: 104, status: "정상", fileName: "홍보물_영수증.jpg", ocrVendor: "디자인팜", ocrAmount: 3200000, ocrDate: "2025-07-01" },
      { id: 204, uploadDate: "2025-08-16", amount: 2000000, expenseId: 105, status: "정상", fileName: "교육수수료_영수증.pdf", ocrVendor: "한국관광공사", ocrAmount: 2000000, ocrDate: "2025-08-15" },
      { id: 205, uploadDate: "2025-09-21", amount: 12000000, expenseId: 106, status: "정상", fileName: "트랙터_세금계산서.pdf", ocrVendor: "현대농기계", ocrAmount: 12000000, ocrDate: "2025-09-20" },
      { id: 206, uploadDate: "2025-10-06", amount: 8000000, expenseId: 107, status: "정상", fileName: "자부담_입금내역.png", ocrVendor: "마을 자체", ocrAmount: 8000000, ocrDate: "2025-10-05" },
      { id: 207, uploadDate: "2026-02-06", amount: 1500000, expenseId: 109, status: "정상", fileName: "광고비_영수증.jpg", ocrVendor: "지역신문사", ocrAmount: 1500000, ocrDate: "2026-02-05" },
    ],
  },
  {
    id: 2,
    name: "치유농업 육성 지원사업",
    agency: "전라남도청",
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    totalAmount: 30000000,
    govRatio: 80,
    selfRatio: 20,
    allowedCategories: ["시설", "재료", "교육", "인건비"],
    requireEvidence: true,
    status: "진행중",
    memo: "치유농업사 자격증 취득 지원 포함",
    expenses: [
      { id: 201, date: "2025-07-10", vendor: "숲치유협회", item: "치유농업사 교육 수강료", amount: 2500000, type: "정부지원", category: "교육", receiptId: 301, status: "정상" },
      { id: 202, date: "2025-08-20", vendor: "가든하우스", item: "치유 정원 조성 공사", amount: 8000000, type: "정부지원", category: "시설", receiptId: 302, status: "정상" },
      { id: 203, date: "2025-10-01", vendor: "아로마팜", item: "치유 원예 재료 구입", amount: 1200000, type: "자부담", category: "재료", receiptId: null, status: "증빙누락" },
      { id: 204, date: "2025-12-15", vendor: "마을 자체", item: "강사 인건비 (3개월)", amount: 4500000, type: "정부지원", category: "인건비", receiptId: 303, status: "정상" },
      { id: 205, date: "2026-01-20", vendor: "목공방", item: "목공 체험 도구 구입", amount: 800000, type: "자부담", category: "재료", receiptId: 304, status: "정상" },
    ],
    receipts: [
      { id: 301, uploadDate: "2025-07-11", amount: 2500000, expenseId: 201, status: "정상", fileName: "교육수강료_영수증.pdf", ocrVendor: "숲치유협회", ocrAmount: 2500000, ocrDate: "2025-07-10" },
      { id: 302, uploadDate: "2025-08-21", amount: 8000000, expenseId: 202, status: "정상", fileName: "정원공사_세금계산서.pdf", ocrVendor: "가든하우스", ocrAmount: 8000000, ocrDate: "2025-08-20" },
      { id: 303, uploadDate: "2025-12-16", amount: 4500000, expenseId: 204, status: "정상", fileName: "인건비_지급내역.pdf", ocrVendor: "마을 자체", ocrAmount: 4500000, ocrDate: "2025-12-15" },
      { id: 304, uploadDate: "2026-01-21", amount: 800000, expenseId: 205, status: "정상", fileName: "목공도구_영수증.jpg", ocrVendor: "목공방", ocrAmount: 800000, ocrDate: "2026-01-20" },
    ],
  },
  {
    id: 3,
    name: "농촌 신활력 플러스 사업",
    agency: "행정안전부",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    totalAmount: 50000000,
    govRatio: 60,
    selfRatio: 40,
    allowedCategories: ["시설", "장비", "홍보", "운영비"],
    requireEvidence: true,
    status: "정산중",
    memo: "사업 종료. 2026년 3월까지 정산 완료 필요.",
    expenses: [
      { id: 301, date: "2024-03-10", vendor: "건설업체A", item: "마을 안내판 설치", amount: 6000000, type: "정부지원", category: "시설", receiptId: 401, status: "정상" },
      { id: 302, date: "2024-06-15", vendor: "인쇄소B", item: "홍보 리플렛 3000부", amount: 1800000, type: "정부지원", category: "홍보", receiptId: 402, status: "정상" },
      { id: 303, date: "2024-09-20", vendor: "마을 자체", item: "자부담 운영비", amount: 15000000, type: "자부담", category: "운영비", receiptId: 403, status: "정상" },
      { id: 304, date: "2025-02-10", vendor: "가구공방", item: "야외 벤치·테이블 구입", amount: 4500000, type: "정부지원", category: "장비", receiptId: 404, status: "정상" },
      { id: 305, date: "2025-06-30", vendor: "디자인회사C", item: "마을 로고·사인물 디자인", amount: 2200000, type: "정부지원", category: "홍보", receiptId: null, status: "검토필요" },
      { id: 306, date: "2025-11-20", vendor: "마을 자체", item: "자부담 추가 출자", amount: 5000000, type: "자부담", category: "운영비", receiptId: 405, status: "정상" },
    ],
    receipts: [
      { id: 401, uploadDate: "2024-03-11", amount: 6000000, expenseId: 301, status: "정상", fileName: "안내판_계약서.pdf", ocrVendor: "건설업체A", ocrAmount: 6000000, ocrDate: "2024-03-10" },
      { id: 402, uploadDate: "2024-06-16", amount: 1800000, expenseId: 302, status: "정상", fileName: "리플렛_영수증.jpg", ocrVendor: "인쇄소B", ocrAmount: 1800000, ocrDate: "2024-06-15" },
      { id: 403, uploadDate: "2024-09-21", amount: 15000000, expenseId: 303, status: "정상", fileName: "자부담_통장사본.png", ocrVendor: "마을 자체", ocrAmount: 15000000, ocrDate: "2024-09-20" },
      { id: 404, uploadDate: "2025-02-11", amount: 4500000, expenseId: 304, status: "정상", fileName: "가구_세금계산서.pdf", ocrVendor: "가구공방", ocrAmount: 4500000, ocrDate: "2025-02-10" },
      { id: 405, uploadDate: "2025-11-21", amount: 5000000, expenseId: 306, status: "정상", fileName: "추가출자_입금확인.png", ocrVendor: "마을 자체", ocrAmount: 5000000, ocrDate: "2025-11-20" },
    ],
  },
  {
    id: 4,
    name: "로컬크리에이터 육성사업",
    agency: "중소벤처기업부",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    totalAmount: 20000000,
    govRatio: 75,
    selfRatio: 25,
    allowedCategories: ["재료", "홍보", "교육", "장비"],
    requireEvidence: true,
    status: "진행중",
    memo: "특산품 브랜딩·온라인 판로 개척 목적",
    expenses: [
      { id: 401, date: "2026-01-20", vendor: "브랜드컨설팅", item: "특산품 브랜드 개발", amount: 3000000, type: "정부지원", category: "홍보", receiptId: 501, status: "정상" },
      { id: 402, date: "2026-02-10", vendor: "포장업체", item: "친환경 포장재 구입", amount: 1500000, type: "정부지원", category: "재료", receiptId: null, status: "증빙누락" },
    ],
    receipts: [
      { id: 501, uploadDate: "2026-01-21", amount: 3000000, expenseId: 401, status: "정상", fileName: "브랜드개발_계약서.pdf", ocrVendor: "브랜드컨설팅", ocrAmount: 3000000, ocrDate: "2026-01-20" },
    ],
  },
  {
    id: 5,
    name: "6차산업 인증업체 지원사업",
    agency: "도농업기술원",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    totalAmount: 15000000,
    govRatio: 50,
    selfRatio: 50,
    allowedCategories: ["장비", "재료", "홍보"],
    requireEvidence: true,
    status: "종료",
    memo: "정산 완료. 잔액 반환 완료.",
    expenses: [
      { id: 501, date: "2025-03-15", vendor: "가공기계", item: "건조기 구입", amount: 4000000, type: "정부지원", category: "장비", receiptId: 601, status: "정상" },
      { id: 502, date: "2025-05-20", vendor: "포장재료", item: "진공포장기 구입", amount: 2500000, type: "정부지원", category: "장비", receiptId: 602, status: "정상" },
      { id: 503, date: "2025-07-10", vendor: "마을 자체", item: "자부담 매칭 비용", amount: 7500000, type: "자부담", category: "재료", receiptId: 603, status: "정상" },
    ],
    receipts: [
      { id: 601, uploadDate: "2025-03-16", amount: 4000000, expenseId: 501, status: "정상", fileName: "건조기_영수증.pdf", ocrVendor: "가공기계", ocrAmount: 4000000, ocrDate: "2025-03-15" },
      { id: 602, uploadDate: "2025-05-21", amount: 2500000, expenseId: 502, status: "정상", fileName: "포장기_세금계산서.pdf", ocrVendor: "포장재료", ocrAmount: 2500000, ocrDate: "2025-05-20" },
      { id: 603, uploadDate: "2025-07-11", amount: 7500000, expenseId: 503, status: "정상", fileName: "자부담_영수증.jpg", ocrVendor: "마을 자체", ocrAmount: 7500000, ocrDate: "2025-07-10" },
    ],
  },
];

/* ══════════════════════════════════════════
   Constants & Helpers
   ══════════════════════════════════════════ */
type MainTab = "대시보드" | "보조금목록" | "영수증관리" | "보고서";
type DetailTab = "사용내역" | "증빙" | "규정정산";
const MAIN_TABS: { key: MainTab; icon: typeof Landmark }[] = [
  { key: "대시보드", icon: BarChart3 },
  { key: "보조금목록", icon: FileText },
  { key: "영수증관리", icon: Image },
  { key: "보고서", icon: Download },
];

const STATUS_CFG: Record<string, { bg: string; text: string; icon: typeof CheckCircle2; darkBg: string; darkText: string }> = {
  "진행중": { bg: "#ECF7EE", text: "#1B5E20", icon: CheckCircle2, darkBg: "#1B3A20", darkText: "#81C784" },
  "종료": { bg: "#F7F3ED", text: "#6B7280", icon: XCircle, darkBg: "#333", darkText: "#9CA3AF" },
  "정산중": { bg: "#FFF6E6", text: "#8A6A2B", icon: Clock, darkBg: "#3B2E10", darkText: "#FFD54F" },
};

const EXP_STATUS_CFG: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  "정상": { bg: "#ECF7EE", text: "#1B5E20", icon: CheckCircle2 },
  "증빙누락": { bg: "#FDECEC", text: "#C62828", icon: AlertCircle },
  "검토필요": { bg: "#FFF6E6", text: "#8A6A2B", icon: AlertTriangle },
};

const REC_STATUS_CFG: Record<string, { bg: string; text: string }> = {
  "정상": { bg: "#ECF7EE", text: "#1B5E20" },
  "누락": { bg: "#FDECEC", text: "#C62828" },
  "중복": { bg: "#FFF6E6", text: "#8A6A2B" },
  "불일치": { bg: "#F3E8F9", text: "#7B1FA2" },
};

const PIE_COLORS = ["#2F4F46", "#4CAF50", "#8A6A2B", "#C62828", "#7B1FA2", "#1976D2", "#FF8F00", "#6B7280"];

const fmt = (n: number) => n.toLocaleString();
const fmtM = (n: number) => (n / 10000).toFixed(0) + "만";
const fmtW = (n: number) => n >= 100000000 ? (n / 100000000).toFixed(1) + "억" : fmtM(n) + "원";

const calcSub = (sub: Subsidy) => {
  const govLimit = Math.round(sub.totalAmount * sub.govRatio / 100);
  const selfNeed = Math.round(sub.totalAmount * sub.selfRatio / 100);
  const govUsed = sub.expenses.filter(e => e.type === "정부지원").reduce((s, e) => s + e.amount, 0);
  const selfUsed = sub.expenses.filter(e => e.type === "자부담").reduce((s, e) => s + e.amount, 0);
  const totalUsed = govUsed + selfUsed;
  const balance = sub.totalAmount - totalUsed;
  const missingReceipts = sub.expenses.filter(e => e.status === "증빙누락").length;
  const reviewNeeded = sub.expenses.filter(e => e.status === "검토필요").length;
  const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000);
  return { govLimit, selfNeed, govUsed, selfUsed, totalUsed, balance, missingReceipts, reviewNeeded, daysLeft };
};

/* ══════════════════════════════════════════
   Component
   ══════════════════════════════════════════ */
export function Subsidies() {
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("대시보드");
  const [subsidies, setSubsidies] = useState<Subsidy[]>(INITIAL_SUBSIDIES);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("사용내역");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [searchQ, setSearchQ] = useState("");
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [showReceiptDetail, setShowReceiptDetail] = useState<SubsidyReceipt | null>(null);

  /* Registration form */
  const [regForm, setRegForm] = useState({
    name: "", agency: "", startDate: "", endDate: "",
    totalAmount: 0, govRatio: 70, selfRatio: 30,
    allowedCategories: ["시설", "장비"] as string[],
    requireEvidence: true, memo: "",
  });

  /* Dark mode classes */
  const bg = dark ? "bg-[#0F172A]" : "bg-transparent";
  const cardBg = dark ? "bg-[#1E293B]" : "bg-white";
  const cardBorder = dark ? "border-[#334155]" : "border-[#E6E2DB]";
  const textP = dark ? "text-[#F1F5F9]" : "text-[#1F2937]";
  const textS = dark ? "text-[#94A3B8]" : "text-[#6B7280]";
  const textT = dark ? "text-[#64748B]" : "text-[#9CA3AF]";
  const mutedBg = dark ? "bg-[#1E293B]" : "bg-[#FBFAF7]";
  const subBg = dark ? "bg-[#0F172A]" : "bg-[#F7F3ED]";
  const hoverBg = dark ? "hover:bg-[#334155]" : "hover:bg-[#FBFAF7]";
  const inputCls = `h-[48px] px-4 rounded-xl border ${dark ? "border-[#334155] bg-[#0F172A] text-[#F1F5F9]" : "border-[#D6D0C8] bg-white text-[#1F2937]"} text-[16px] focus:border-[#2F4F46] focus:outline-none`;
  const divider = dark ? "divide-[#334155]" : "divide-[#F3EFE8]";

  /* ─── Global stats ─── */
  const globalStats = useMemo(() => {
    const all = subsidies.map(s => ({ sub: s, c: calcSub(s) }));
    const totalAlloc = subsidies.reduce((s, b) => s + b.totalAmount, 0);
    const totalUsed = all.reduce((s, { c }) => s + c.totalUsed, 0);
    const totalBalance = totalAlloc - totalUsed;
    const totalGovUsed = all.reduce((s, { c }) => s + c.govUsed, 0);
    const totalSelfUsed = all.reduce((s, { c }) => s + c.selfUsed, 0);
    const totalMissing = all.reduce((s, { c }) => s + c.missingReceipts, 0);
    const totalReview = all.reduce((s, { c }) => s + c.reviewNeeded, 0);
    const riskItems: string[] = [];
    all.forEach(({ sub, c }) => {
      if (c.missingReceipts > 0) riskItems.push(`[${sub.name}] 증빙 누락 ${c.missingReceipts}건`);
      if (c.selfUsed < c.selfNeed * 0.5 && sub.status === "진행중") riskItems.push(`[${sub.name}] 자부담 비율 부족 (${Math.round(c.selfUsed / c.selfNeed * 100)}%)`);
      if (c.daysLeft > 0 && c.daysLeft <= 90 && sub.status === "진행중") riskItems.push(`[${sub.name}] 만료 ${c.daysLeft}일 전`);
      if (c.govUsed > c.govLimit) riskItems.push(`[${sub.name}] 정부지원 한도 초과!`);
    });
    return { totalAlloc, totalUsed, totalBalance, totalGovUsed, totalSelfUsed, totalMissing, totalReview, riskItems };
  }, [subsidies]);

  /* Chart data */
  const barData = useMemo(() => subsidies.filter(s => s.status !== "종료").map(s => {
    const c = calcSub(s);
    return { name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name, 사용액: c.totalUsed / 10000, 잔액: c.balance / 10000 };
  }), [subsidies]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    subsidies.forEach(s => s.expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      months[m] = (months[m] || 0) + e.amount;
    }));
    return Object.entries(months).sort().slice(-12).map(([m, v]) => ({ month: m.slice(2), 사용액: Math.round(v / 10000) }));
  }, [subsidies]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    subsidies.forEach(s => s.expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    }));
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value / 10000) }));
  }, [subsidies]);

  /* Filtered list */
  const filteredSubs = useMemo(() => {
    return subsidies.filter(s => {
      if (statusFilter !== "전체" && s.status !== statusFilter) return false;
      if (searchQ && !s.name.includes(searchQ) && !s.agency.includes(searchQ)) return false;
      return true;
    });
  }, [subsidies, statusFilter, searchQ]);

  const selectedSub = subsidies.find(s => s.id === selectedSubId) || null;
  const selectedCalc = selectedSub ? calcSub(selectedSub) : null;

  /* ─── CRUD ─── */
  const openRegModal = (sub?: Subsidy) => {
    if (sub) {
      setEditingSubId(sub.id);
      setRegForm({
        name: sub.name, agency: sub.agency, startDate: sub.startDate, endDate: sub.endDate,
        totalAmount: sub.totalAmount, govRatio: sub.govRatio, selfRatio: sub.selfRatio,
        allowedCategories: [...sub.allowedCategories], requireEvidence: sub.requireEvidence, memo: sub.memo,
      });
    } else {
      setEditingSubId(null);
      setRegForm({ name: "", agency: "", startDate: "", endDate: "", totalAmount: 0, govRatio: 70, selfRatio: 30, allowedCategories: ["시설", "장비"], requireEvidence: true, memo: "" });
    }
    setShowRegModal(true);
  };

  const saveReg = () => {
    if (!regForm.name.trim()) return;
    if (editingSubId) {
      setSubsidies(prev => prev.map(s => s.id === editingSubId ? { ...s, ...regForm } : s));
      toast.success("보조금 정보가 수정되었습니다.");
    } else {
      setSubsidies(prev => [...prev, { id: Date.now(), ...regForm, status: "진행중" as const, expenses: [], receipts: [] }]);
      toast.success("새 보조금이 등록되었습니다.");
    }
    setShowRegModal(false);
  };

  const deleteSub = (id: number) => {
    setSubsidies(prev => prev.filter(s => s.id !== id));
    if (selectedSubId === id) setSelectedSubId(null);
    toast.success("보조금이 삭제되었습니다.");
  };

  const handleDownload = (label: string) => {
    toast.success(`${label} 다운로드가 시작되었습니다.`);
  };

  const toggleCategory = (cat: string) => {
    setRegForm(f => ({
      ...f,
      allowedCategories: f.allowedCategories.includes(cat)
        ? f.allowedCategories.filter(c => c !== cat)
        : [...f.allowedCategories, cat],
    }));
  };

  /* ══════════════════════════════════════════
     Render
     ══════════════════════════════════════════ */
  return (
    <div className={`max-w-[1160px] space-y-6 ${bg} transition-colors`}>
      {/* Dark mode toggle + Page tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {MAIN_TABS.map(tab => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedSubId(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all cursor-pointer ${active ? `${cardBg} ${cardBorder} shadow-[0_1px_6px_rgba(0,0,0,0.04)] border-[#2F4F46]` : `${dark ? "border-[#334155] bg-[#1E293B]/60" : "border-[#E6E2DB] bg-white/60"} ${hoverBg}`}`}>
                <TabIcon size={18} className={active ? "text-[#2F4F46]" : textT} />
                <span className={`text-[14px] ${active ? "text-[#2F4F46]" : textS}`} style={{ fontWeight: active ? 700 : 400 }}>{tab.key}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setDark(!dark)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${dark ? "bg-[#334155] text-[#FFD54F]" : "bg-[#F7F3ED] text-[#6B7280]"}`}
          title={dark ? "라이트 모드" : "다크 모드"}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* ═══════════════════════
         대시보드
         ═══════════════════════ */}
      {activeTab === "대시보드" && !selectedSubId && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "총 배정액", value: fmtW(globalStats.totalAlloc), icon: Landmark, color: "#2F4F46" },
              { label: "총 사용액", value: fmtW(globalStats.totalUsed), icon: TrendingUp, color: "#1B5E20" },
              { label: "잔액", value: fmtW(globalStats.totalBalance), icon: Wallet, color: globalStats.totalBalance < 0 ? "#C62828" : "#2F4F46" },
            ].map((item, i) => {
              const Ic = item.icon;
              return (
                <div key={i} className={`${cardBg} rounded-[14px] border ${cardBorder} p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]`}>
                  <div className="flex items-center gap-2 mb-2.5"><Ic size={16} className={textT} /><span className={`text-[13px] ${textS}`}>{item.label}</span></div>
                  <p className="text-[24px]" style={{ fontWeight: 700, color: item.color }}>{item.value}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "정부지원 사용액", value: fmtW(globalStats.totalGovUsed), color: "#2F4F46" },
              { label: "자부담 사용액", value: fmtW(globalStats.totalSelfUsed), color: "#8A6A2B" },
              { label: "규정 위험 알림", value: globalStats.riskItems.length + "건", color: globalStats.riskItems.length > 0 ? "#C62828" : "#1B5E20" },
            ].map((item, i) => (
              <div key={i} className={`${cardBg} rounded-[14px] border ${cardBorder} p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]`}>
                <span className={`text-[13px] ${textS}`}>{item.label}</span>
                <p className="text-[22px] mt-1" style={{ fontWeight: 700, color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-5">
            {/* Bar chart */}
            <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
              <h3 className={`text-[15px] ${textP} mb-4`} style={{ fontWeight: 700 }}>보조금별 사용률 (만원)</h3>
              <div style={{ width: "100%", minWidth: 0, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#E6E2DB"} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? "#94A3B8" : "#9CA3AF" }} />
                    <YAxis tick={{ fontSize: 11, fill: dark ? "#94A3B8" : "#9CA3AF" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13, backgroundColor: dark ? "#1E293B" : "#fff", borderColor: dark ? "#334155" : "#E6E2DB", color: dark ? "#F1F5F9" : "##1F2937" }} />
                    <Bar dataKey="사용액" fill="#2F4F46" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="잔액" fill={dark ? "#334155" : "#E6E2DB"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Line chart */}
            <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
              <h3 className={`text-[15px] ${textP} mb-4`} style={{ fontWeight: 700 }}>월별 사용 추이 (만원)</h3>
              <div style={{ width: "100%", minWidth: 0, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#E6E2DB"} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "#94A3B8" : "#9CA3AF" }} />
                    <YAxis tick={{ fontSize: 11, fill: dark ? "#94A3B8" : "#9CA3AF" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13, backgroundColor: dark ? "#1E293B" : "#fff", borderColor: dark ? "#334155" : "#E6E2DB", color: dark ? "#F1F5F9" : "#1F2937" }} />
                    <Line type="monotone" dataKey="사용액" stroke="#2F4F46" strokeWidth={2} dot={{ r: 4, fill: "#2F4F46" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie chart */}
          <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
            <h3 className={`text-[15px] ${textP} mb-4`} style={{ fontWeight: 700 }}>카테고리별 지출 비중 (만원)</h3>
            <div className="flex items-center">
              <div style={{ width: "50%", minWidth: 0, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13, backgroundColor: dark ? "#1E293B" : "#fff", borderColor: dark ? "#334155" : "#E6E2DB", color: dark ? "#F1F5F9" : "#1F2937" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 pl-4">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className={`text-[13px] ${textS} flex-1`}>{c.name}</span>
                    <span className={`text-[13px] ${textP}`} style={{ fontWeight: 700 }}>{fmt(c.value)}만원</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {globalStats.riskItems.length > 0 && (
            <div className={`${cardBg} rounded-[14px] border border-[#C62828]/30 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-[#C62828]" />
                <h3 className={`text-[15px] ${textP}`} style={{ fontWeight: 700 }}>주의·알림 ({globalStats.riskItems.length}건)</h3>
              </div>
              <div className="space-y-2">
                {globalStats.riskItems.map((msg, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${dark ? "bg-[#2D1515]" : "bg-[#FDECEC]"}`}>
                    <AlertCircle size={14} className="text-[#C62828] shrink-0" />
                    <span className={`text-[14px] ${dark ? "text-[#EF9A9A]" : "text-[#C62828]"}`}>{msg}</span>
                    <button onClick={() => { setActiveTab("보조금목록"); }} className="ml-auto text-[12px] text-[#C62828] underline cursor-pointer">확인</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════
         보조금 목록
         ═══════════════════════ */}
      {activeTab === "보조금목록" && !selectedSubId && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textT}`} />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="보조금명, 기관 검색"
                  className={`w-[240px] pl-8 pr-3 ${inputCls}`} />
              </div>
              <div className="flex gap-1.5 ml-1">
                {["전체", "진행중", "정산중", "종료"].map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className={`text-[12px] px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === f ? `${subBg} text-[#2F4F46] border border-[#2F4F46]` : `${textT} hover:${textS}`}`}
                    style={{ fontWeight: statusFilter === f ? 700 : 400 }}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDownload("보조금 목록 엑셀")} className={`h-[48px] px-5 rounded-xl border ${cardBorder} ${textS} text-[14px] flex items-center gap-2 ${hoverBg} cursor-pointer`}>
                <Download size={16} /> 엑셀 내려받기
              </button>
              <button onClick={() => openRegModal()} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
                <Plus size={16} /> 보조금 등록
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={`${cardBg} rounded-[14px] border ${cardBorder} shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden`}>
            <div className={`px-5 py-2.5 ${mutedBg} border-b ${cardBorder} grid items-center gap-2`} style={{ gridTemplateColumns: "1fr 100px 100px 120px 120px 80px 70px" }}>
              {["보조금명/기관", "기간", "총 배정액", "사용액", "잔액", "상태", "관리"].map(h => (
                <span key={h} className={`text-[12px] ${textT}`} style={{ fontWeight: 700 }}>{h}</span>
              ))}
            </div>
            <div className={`divide-y ${divider}`}>
              {filteredSubs.map(sub => {
                const c = calcSub(sub);
                const stCfg = STATUS_CFG[sub.status];
                const StIcon = stCfg.icon;
                return (
                  <div key={sub.id} className={`px-5 py-3.5 grid items-center gap-2 transition-colors cursor-pointer ${hoverBg}`}
                    style={{ gridTemplateColumns: "1fr 100px 100px 120px 120px 80px 70px" }}
                    onClick={() => { setSelectedSubId(sub.id); setDetailTab("사용내역"); }}>
                    <div className="min-w-0">
                      <span className={`text-[15px] ${textP} block truncate`} style={{ fontWeight: 700 }}>{sub.name}</span>
                      <span className={`text-[12px] ${textT}`}>{sub.agency}</span>
                    </div>
                    <div>
                      <span className={`text-[12px] ${textS}`}>{sub.startDate.slice(2)}</span>
                      <span className={`text-[12px] ${textT} block`}>~{sub.endDate.slice(2)}</span>
                    </div>
                    <span className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{fmtM(sub.totalAmount)}원</span>
                    <div>
                      <span className={`text-[14px] ${textP}`}>{fmtM(c.totalUsed)}원</span>
                      <div className="w-full h-[4px] rounded-full mt-1 overflow-hidden" style={{ backgroundColor: dark ? "#334155" : "#F3EFE8" }}>
                        <div className="h-full rounded-full bg-[#2F4F46]" style={{ width: Math.min(c.totalUsed / sub.totalAmount * 100, 100) + "%" }} />
                      </div>
                    </div>
                    <span className={`text-[14px] ${c.balance < 0 ? "text-[#C62828]" : textP}`} style={{ fontWeight: 700 }}>{fmtM(c.balance)}원</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: dark ? stCfg.darkBg : stCfg.bg, color: dark ? stCfg.darkText : stCfg.text, fontWeight: 700 }}>
                      <StIcon size={10} />{sub.status}
                    </span>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openRegModal(sub)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${textT} ${hoverBg} cursor-pointer`}><Edit2 size={13} /></button>
                      <button onClick={() => deleteSub(sub.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════
         보조금 상세
         ═══════════════════════ */}
      {selectedSubId && selectedSub && selectedCalc && (
        <div className="space-y-5">
          {/* Back button */}
          <button onClick={() => setSelectedSubId(null)} className={`flex items-center gap-2 text-[14px] ${textS} cursor-pointer ${hoverBg} px-3 py-2 rounded-lg`}>
            <ArrowLeft size={16} /> 목록으로 돌아가기
          </button>

          {/* Detail header */}
          <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-[20px] ${textP}`} style={{ fontWeight: 700 }}>{selectedSub.name}</h2>
                <span className={`text-[14px] ${textS}`}>{selectedSub.agency} · {selectedSub.startDate} ~ {selectedSub.endDate}</span>
              </div>
              {(() => {
                const stCfg = STATUS_CFG[selectedSub.status];
                const StIcon = stCfg.icon;
                return <span className="text-[13px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5" style={{ backgroundColor: dark ? stCfg.darkBg : stCfg.bg, color: dark ? stCfg.darkText : stCfg.text, fontWeight: 700 }}><StIcon size={14} />{selectedSub.status}</span>;
              })()}
            </div>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "총 배정액", value: fmtW(selectedSub.totalAmount), color: "#2F4F46" },
                { label: "정부지원 사용/한도", value: fmtM(selectedCalc.govUsed) + " / " + fmtM(selectedCalc.govLimit), color: selectedCalc.govUsed > selectedCalc.govLimit ? "#C62828" : "#1B5E20" },
                { label: "자부담 사용/필요", value: fmtM(selectedCalc.selfUsed) + " / " + fmtM(selectedCalc.selfNeed), color: selectedCalc.selfUsed < selectedCalc.selfNeed * 0.5 ? "#C62828" : "#8A6A2B" },
                { label: selectedCalc.daysLeft > 0 ? `만료까지 ${selectedCalc.daysLeft}일` : "기간 만료", value: selectedSub.endDate, color: selectedCalc.daysLeft <= 90 && selectedCalc.daysLeft > 0 ? "#C62828" : "#6B7280" },
                { label: "증빙 누락", value: selectedCalc.missingReceipts + "건", color: selectedCalc.missingReceipts > 0 ? "#C62828" : "#1B5E20" },
              ].map((item, i) => (
                <div key={i} className={`${subBg} rounded-xl p-3`}>
                  <p className={`text-[12px] ${textT} mb-1`}>{item.label}</p>
                  <p className="text-[16px]" style={{ fontWeight: 700, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detail tabs */}
          <div className="flex gap-2">
            {(["사용내역", "증빙", "규정정산"] as DetailTab[]).map(t => (
              <button key={t} onClick={() => setDetailTab(t)}
                className={`px-5 py-2.5 rounded-xl text-[14px] border cursor-pointer transition-all ${detailTab === t ? `${cardBg} border-[#2F4F46] shadow-sm` : `${dark ? "border-[#334155]" : "border-[#E6E2DB]"} ${hoverBg}`} ${detailTab === t ? "text-[#2F4F46]" : textS}`}
                style={{ fontWeight: detailTab === t ? 700 : 400 }}>{t}</button>
            ))}
          </div>

          {/* A) 사용 내역 */}
          {detailTab === "사용내역" && (
            <div className={`${cardBg} rounded-[14px] border ${cardBorder} shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden`}>
              <div className={`px-5 py-2.5 ${mutedBg} border-b ${cardBorder} grid items-center gap-2`} style={{ gridTemplateColumns: "90px 1fr 1fr 100px 80px 80px 70px" }}>
                {["날짜", "거래처", "품목", "금액", "구분", "카테고리", "상태"].map(h => (
                  <span key={h} className={`text-[12px] ${textT}`} style={{ fontWeight: 700 }}>{h}</span>
                ))}
              </div>
              <div className={`divide-y ${divider}`}>
                {selectedSub.expenses.map(exp => {
                  const sCfg = EXP_STATUS_CFG[exp.status];
                  const SIcon = sCfg.icon;
                  return (
                    <div key={exp.id} className={`px-5 py-3 grid items-center gap-2 ${hoverBg}`} style={{ gridTemplateColumns: "90px 1fr 1fr 100px 80px 80px 70px" }}>
                      <span className={`text-[13px] ${textS}`}>{exp.date.slice(2)}</span>
                      <span className={`text-[14px] ${textP} truncate`}>{exp.vendor}</span>
                      <span className={`text-[13px] ${textS} truncate`}>{exp.item}</span>
                      <span className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{fmtM(exp.amount)}원</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md ${exp.type === "정부지원" ? "bg-[#ECF7EE] text-[#1B5E20]" : "bg-[#FFF6E6] text-[#8A6A2B]"}`} style={{ fontWeight: 700 }}>{exp.type}</span>
                      <span className={`text-[12px] ${textT}`}>{exp.category}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: sCfg.bg, color: sCfg.text, fontWeight: 700 }}>
                        <SIcon size={10} />{exp.status === "증빙누락" ? "누락" : exp.status === "검토필요" ? "검토" : "정상"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B) 증빙 */}
          {detailTab === "증빙" && (
            <div className="space-y-4">
              {/* Upload area */}
              <div className={`${cardBg} rounded-[14px] border-2 border-dashed ${cardBorder} p-8 text-center`}>
                <Upload size={32} className={`mx-auto ${textT} mb-3`} />
                <p className={`text-[16px] ${textP} mb-1`} style={{ fontWeight: 700 }}>영수증 업로드</p>
                <p className={`text-[13px] ${textT}`}>파일을 끌어다 놓거나 클릭하여 업로드하세요 (이미지, 문서 파일)</p>
                <button className="mt-3 h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] cursor-pointer hover:bg-[#243f38]">파일 선택</button>
              </div>
              {/* Gallery */}
              <div className="grid grid-cols-3 gap-4">
                {selectedSub.receipts.map(rec => {
                  const rCfg = REC_STATUS_CFG[rec.status];
                  return (
                    <div key={rec.id} className={`${cardBg} rounded-[14px] border ${cardBorder} p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] cursor-pointer ${hoverBg} transition-colors`}
                      onClick={() => setShowReceiptDetail(rec)}>
                      <div className={`w-full h-[100px] rounded-xl ${subBg} flex items-center justify-center mb-3`}>
                        <FileText size={32} className={textT} />
                      </div>
                      <p className={`text-[14px] ${textP} truncate mb-1`} style={{ fontWeight: 700 }}>{rec.fileName}</p>
                      <p className={`text-[12px] ${textT} mb-2`}>{rec.uploadDate} · {fmt(rec.amount)}원</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] px-2 py-0.5 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: rCfg.bg, color: rCfg.text, fontWeight: 700 }}>
                          {rec.status === "정상" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}{rec.status}
                        </span>
                        <div className="flex gap-1">
                          <button className={`w-7 h-7 rounded-lg flex items-center justify-center ${textT} ${hoverBg}`}><Eye size={12} /></button>
                          <button className={`w-7 h-7 rounded-lg flex items-center justify-center ${textT} ${hoverBg}`}><Download size={12} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C) 규정·정산 */}
          {detailTab === "규정정산" && (
            <div className="space-y-5">
              {/* Checklist */}
              <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
                <h3 className={`text-[16px] ${textP} mb-4`} style={{ fontWeight: 700 }}>규정 충족 상태 점검</h3>
                <div className="space-y-3">
                  {[
                    { label: "자부담 비율 충족", ok: selectedCalc.selfUsed >= selectedCalc.selfNeed * 0.5, detail: `필요 ${fmtM(selectedCalc.selfNeed)}원 중 ${fmtM(selectedCalc.selfUsed)}원 사용 (${Math.round(selectedCalc.selfUsed / selectedCalc.selfNeed * 100)}%)` },
                    { label: "기간 내 집행", ok: selectedCalc.daysLeft > 0 || selectedSub.status === "종료", detail: selectedCalc.daysLeft > 0 ? `만료까지 ${selectedCalc.daysLeft}일` : "기간 만료" },
                    { label: "증빙 첨부율", ok: selectedCalc.missingReceipts === 0, detail: `전체 ${selectedSub.expenses.length}건 중 ${selectedSub.expenses.length - selectedCalc.missingReceipts}건 첨부 (${selectedSub.expenses.length > 0 ? Math.round((selectedSub.expenses.length - selectedCalc.missingReceipts) / selectedSub.expenses.length * 100) : 100}%)` },
                    { label: "허용 카테고리 사용", ok: selectedSub.expenses.every(e => selectedSub.allowedCategories.includes(e.category)), detail: `허용: ${selectedSub.allowedCategories.join(", ")}` },
                    { label: "정부지원 한도 준수", ok: selectedCalc.govUsed <= selectedCalc.govLimit, detail: `한도 ${fmtM(selectedCalc.govLimit)}원 / 사용 ${fmtM(selectedCalc.govUsed)}원` },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${item.ok ? (dark ? "bg-[#1B3A20]" : "bg-[#ECF7EE]") : (dark ? "bg-[#2D1515]" : "bg-[#FDECEC]")}`}>
                      {item.ok ? <CheckCircle2 size={18} className="text-[#1B5E20] shrink-0" /> : <AlertCircle size={18} className="text-[#C62828] shrink-0" />}
                      <div className="flex-1">
                        <span className={`text-[15px] ${item.ok ? "text-[#1B5E20]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{item.label}</span>
                        <p className={`text-[13px] ${textS} mt-0.5`}>{item.detail}</p>
                      </div>
                      <span className={`text-[12px] px-2 py-1 rounded-lg ${item.ok ? "bg-[#1B5E20]/10 text-[#1B5E20]" : "bg-[#C62828]/10 text-[#C62828]"}`} style={{ fontWeight: 700 }}>
                        {item.ok ? "충족" : "미충족"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement summary */}
              <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
                <h3 className={`text-[16px] ${textP} mb-4`} style={{ fontWeight: 700 }}>정산 요약</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${subBg} rounded-xl p-4 space-y-2`}>
                    <p className={`text-[13px] ${textT}`} style={{ fontWeight: 700 }}>정부지원 정산</p>
                    <div className="flex justify-between"><span className={`text-[14px] ${textS}`}>한도 금액</span><span className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{fmt(selectedCalc.govLimit)}원</span></div>
                    <div className="flex justify-between"><span className={`text-[14px] ${textS}`}>사용 금액</span><span className="text-[14px] text-[#1B5E20]" style={{ fontWeight: 700 }}>{fmt(selectedCalc.govUsed)}원</span></div>
                    <div className="border-t border-[#E6E2DB] pt-2 flex justify-between"><span className={`text-[14px] ${textS}`}>잔액</span><span className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{fmt(selectedCalc.govLimit - selectedCalc.govUsed)}원</span></div>
                  </div>
                  <div className={`${subBg} rounded-xl p-4 space-y-2`}>
                    <p className={`text-[13px] ${textT}`} style={{ fontWeight: 700 }}>자부담 정산</p>
                    <div className="flex justify-between"><span className={`text-[14px] ${textS}`}>필요 금액</span><span className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{fmt(selectedCalc.selfNeed)}원</span></div>
                    <div className="flex justify-between"><span className={`text-[14px] ${textS}`}>사용 금액</span><span className="text-[14px] text-[#8A6A2B]" style={{ fontWeight: 700 }}>{fmt(selectedCalc.selfUsed)}원</span></div>
                    <div className="border-t border-[#E6E2DB] pt-2 flex justify-between">
                      <span className={`text-[14px] ${textS}`}>{selectedCalc.selfUsed >= selectedCalc.selfNeed ? "초과 충족" : "부족"}</span>
                      <span className={`text-[14px] ${selectedCalc.selfUsed >= selectedCalc.selfNeed ? "text-[#1B5E20]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>
                        {fmt(Math.abs(selectedCalc.selfNeed - selectedCalc.selfUsed))}원
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDownload("정산용 자료")} className="mt-4 h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] cursor-pointer w-full justify-center">
                  <Download size={16} /> 정산용 자료 내려받기 (엑셀 + 증빙 첨부)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════
         영수증 관리 (전체)
         ═══════════════════════ */}
      {activeTab === "영수증관리" && (
        <div className="space-y-5">
          {/* Upload */}
          <div className={`${cardBg} rounded-[14px] border-2 border-dashed ${cardBorder} p-8 text-center`}>
            <Upload size={36} className={`mx-auto ${textT} mb-3`} />
            <p className={`text-[16px] ${textP} mb-1`} style={{ fontWeight: 700 }}>영수증·증빙 파일 업로드</p>
            <p className={`text-[13px] ${textT} mb-3`}>이미지·문서 파일을 끌어다 놓거나 클릭하세요. 업로드 후 보조금에 자동 연결을 추천합니다.</p>
            <button className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] cursor-pointer hover:bg-[#243f38]">파일 선택</button>
          </div>

          {/* All receipts */}
          <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-[15px] ${textP}`} style={{ fontWeight: 700 }}>전체 영수증 ({subsidies.reduce((s, b) => s + b.receipts.length, 0)}건)</h3>
              <div className="flex gap-1.5">
                {["전체", "정상", "누락", "불일치"].map(f => (
                  <button key={f} className={`text-[12px] px-3 py-1.5 rounded-lg cursor-pointer ${textT} hover:${textS}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {subsidies.flatMap(sub => sub.receipts.map(r => ({ ...r, subName: sub.name }))).map(rec => {
                const rCfg = REC_STATUS_CFG[rec.status];
                return (
                  <div key={rec.id + "-" + rec.fileName} className={`${subBg} rounded-xl p-4 cursor-pointer ${hoverBg} transition-colors`}
                    onClick={() => setShowReceiptDetail(rec)}>
                    <div className={`w-full h-[70px] rounded-lg ${dark ? "bg-[#334155]" : "bg-[#E6E2DB]"} flex items-center justify-center mb-3`}>
                      <FileText size={24} className={textT} />
                    </div>
                    <p className={`text-[13px] ${textP} truncate`} style={{ fontWeight: 700 }}>{rec.fileName}</p>
                    <p className={`text-[11px] ${textT} truncate mb-1`}>{rec.subName}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] ${textS}`}>{fmt(rec.amount)}원</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5" style={{ backgroundColor: rCfg.bg, color: rCfg.text, fontWeight: 700 }}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-linking info */}
          <div className={`px-4 py-3 ${mutedBg} rounded-xl border ${cardBorder} flex items-start gap-2.5`}>
            <Info size={14} className={`${textT} shrink-0 mt-0.5`} />
            <div className={`text-[13px] ${textT} leading-relaxed`}>
              <p>영수증 업로드 시 자동으로 보조금 항목과 연결을 추천합니다. <strong className={textS}>추천 보조금·카테고리·구분(정부지원/자부담)</strong>을 확인 후 "적용" 버튼을 눌러주세요.</p>
              <p className="mt-1"><strong className={textS}>지출 자동 입력</strong> 페이지에서 등록한 영수증도 보조금과 자동 연결됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════
         보고서·다운로드
         ═══════════════════════ */}
      {activeTab === "보고서" && (
        <div className="space-y-5">
          {/* Download sections */}
          {[
            { title: "보조금별 사용 내역 다운로드", desc: "선택한 보조금의 전체 사용 내역을 엑셀 또는 시트 파일로 내려받습니다.", options: ["엑셀 (정부지원/자부담 분리)", "시트 (통합)"] },
            { title: "기간별 집행 내역 다운로드", desc: "지정한 기간의 모든 보조금 사용 내역을 한 파일로 내려받습니다.", options: ["올해 전체", "최근 6개월", "직접 기간 선택"] },
            { title: "증빙 파일 일괄 다운로드", desc: "영수증·세금계산서 등 증빙 파일을 압축 파일(ZIP)로 내려받습니다.", options: ["전체 증빙", "증빙 누락 항목만 표시"] },
          ].map((section, i) => (
            <div key={i} className={`${cardBg} rounded-[14px] border ${cardBorder} p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <h3 className={`text-[16px] ${textP} mb-1`} style={{ fontWeight: 700 }}>{section.title}</h3>
                  <p className={`text-[14px] ${textS} mb-3`}>{section.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {section.options.map(opt => (
                      <button key={opt} onClick={() => handleDownload(opt)}
                        className={`h-[48px] px-5 rounded-xl border ${cardBorder} ${textS} text-[14px] flex items-center gap-2 ${hoverBg} cursor-pointer transition-colors`}>
                        <Download size={14} /> {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <FileText size={40} className={textT} />
              </div>
            </div>
          ))}

          {/* Settlement preview */}
          <div className={`${cardBg} rounded-[14px] border ${cardBorder} p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className={textT} />
              <h3 className={`text-[16px] ${textP}`} style={{ fontWeight: 700 }}>정산 요약표 미리보기</h3>
            </div>
            <div className={`${mutedBg} rounded-xl overflow-hidden border ${cardBorder}`}>
              <table className="w-full">
                <thead>
                  <tr className={subBg}>
                    {["보조금명", "기관", "총 배정액", "정부지원 사용", "자부담 사용", "잔액", "증빙율", "상태"].map(h => (
                      <th key={h} className={`text-[12px] ${textT} px-3 py-2.5 text-left`} style={{ fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subsidies.map(sub => {
                    const c = calcSub(sub);
                    const evidRate = sub.expenses.length > 0 ? Math.round((sub.expenses.length - c.missingReceipts) / sub.expenses.length * 100) : 100;
                    return (
                      <tr key={sub.id} className={`border-t ${dark ? "border-[#334155]" : "border-[#F3EFE8]"}`}>
                        <td className={`text-[13px] ${textP} px-3 py-2.5`} style={{ fontWeight: 700 }}>{sub.name.length > 12 ? sub.name.slice(0, 12) + "…" : sub.name}</td>
                        <td className={`text-[13px] ${textS} px-3 py-2.5`}>{sub.agency}</td>
                        <td className={`text-[13px] ${textP} px-3 py-2.5`}>{fmtM(sub.totalAmount)}원</td>
                        <td className="text-[13px] text-[#1B5E20] px-3 py-2.5">{fmtM(c.govUsed)}원</td>
                        <td className="text-[13px] text-[#8A6A2B] px-3 py-2.5">{fmtM(c.selfUsed)}원</td>
                        <td className={`text-[13px] ${textP} px-3 py-2.5`} style={{ fontWeight: 700 }}>{fmtM(c.balance)}원</td>
                        <td className={`text-[13px] px-3 py-2.5 ${evidRate === 100 ? "text-[#1B5E20]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{evidRate}%</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ backgroundColor: STATUS_CFG[sub.status].bg, color: STATUS_CFG[sub.status].text, fontWeight: 700 }}>{sub.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleDownload("정산 요약표 엑셀")} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] cursor-pointer">
                <Download size={16} /> 엑셀 다운로드
              </button>
              <button onClick={() => handleDownload("정산 요약표 + 증빙 ZIP")} className={`h-[48px] px-6 rounded-xl border ${cardBorder} ${textS} text-[14px] flex items-center gap-2 ${hoverBg} cursor-pointer`}>
                <Download size={16} /> 증빙 포함 내려받기
              </button>
            </div>
          </div>

          {/* Download options */}
          <div className={`px-4 py-3 ${mutedBg} rounded-xl border ${cardBorder} flex items-start gap-2.5`}>
            <Info size={14} className={`${textT} shrink-0 mt-0.5`} />
            <div className={`text-[13px] ${textT} leading-relaxed`}>
              <p>다운로드 시 <strong className={textS}>"정부지원/자부담 분리 포함"</strong>, <strong className={textS}>"증빙 파일 포함"</strong>, <strong className={textS}>"증빙 누락 항목 표시 포함"</strong> 옵션을 선택할 수 있습니다.</p>
              <p className="mt-1">정산 보고서는 정부 제출 양식에 맞게 자동 구성됩니다. 세부 양식은 지원기관 안내를 확인하세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════
         등록/수정 모달
         ═══════════════════════ */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowRegModal(false)}>
          <div className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[600px] max-h-[85vh] flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-5 border-b ${cardBorder} shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECF7EE] flex items-center justify-center"><Landmark size={20} className="text-[#1B5E20]" /></div>
                  <h2 className={`text-[18px] ${textP}`} style={{ fontWeight: 700 }}>{editingSubId ? "보조금 수정" : "보조금 등록"}</h2>
                </div>
                <button onClick={() => setShowRegModal(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${textT} ${hoverBg} cursor-pointer`}><X size={20} /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>보조금명 (필수)</label>
                <input value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 농촌체험 활성화 사업"
                  className={`w-full ${inputCls}`} />
              </div>
              <div>
                <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>지원기관</label>
                <input value={regForm.agency} onChange={e => setRegForm(f => ({ ...f, agency: e.target.value }))} placeholder="예: 농림축산식품부"
                  className={`w-full ${inputCls}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>사업 시작일</label>
                  <input type="date" value={regForm.startDate} onChange={e => setRegForm(f => ({ ...f, startDate: e.target.value }))}
                    className={`w-full ${inputCls}`} />
                </div>
                <div>
                  <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>사업 종료일</label>
                  <input type="date" value={regForm.endDate} onChange={e => setRegForm(f => ({ ...f, endDate: e.target.value }))}
                    className={`w-full ${inputCls}`} />
                </div>
              </div>
              <div>
                <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>총 배정액 (필수)</label>
                <input type="number" value={regForm.totalAmount || ""} onChange={e => setRegForm(f => ({ ...f, totalAmount: Number(e.target.value) }))} placeholder="0"
                  className={`w-full ${inputCls}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>정부지원 비율 (%)</label>
                  <input type="number" min={0} max={100} value={regForm.govRatio} onChange={e => {
                    const v = Number(e.target.value);
                    setRegForm(f => ({ ...f, govRatio: v, selfRatio: 100 - v }));
                  }} className={`w-full ${inputCls}`} />
                </div>
                <div>
                  <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>자부담 비율 (%)</label>
                  <input type="number" min={0} max={100} value={regForm.selfRatio} onChange={e => {
                    const v = Number(e.target.value);
                    setRegForm(f => ({ ...f, selfRatio: v, govRatio: 100 - v }));
                  }} className={`w-full ${inputCls}`} />
                </div>
              </div>
              {/* Auto calc */}
              {regForm.totalAmount > 0 && (
                <div className={`${subBg} rounded-xl p-4 grid grid-cols-2 gap-3`}>
                  <div>
                    <p className={`text-[12px] ${textT}`}>정부지원 한도</p>
                    <p className="text-[16px] text-[#1B5E20]" style={{ fontWeight: 700 }}>{fmt(Math.round(regForm.totalAmount * regForm.govRatio / 100))}원</p>
                  </div>
                  <div>
                    <p className={`text-[12px] ${textT}`}>자부담 필요</p>
                    <p className="text-[16px] text-[#8A6A2B]" style={{ fontWeight: 700 }}>{fmt(Math.round(regForm.totalAmount * regForm.selfRatio / 100))}원</p>
                  </div>
                </div>
              )}
              <div>
                <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>사용 가능 항목 (카테고리)</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => toggleCategory(cat)}
                      className={`text-[13px] px-3 py-2 rounded-lg border cursor-pointer transition-all ${regForm.allowedCategories.includes(cat) ? "border-[#2F4F46] bg-[#ECF7EE] text-[#1B5E20]" : `${cardBorder} ${textT}`}`}
                      style={{ fontWeight: regForm.allowedCategories.includes(cat) ? 700 : 400 }}>
                      {regForm.allowedCategories.includes(cat) && <Check size={12} className="inline mr-1" />}{cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className={`text-[13px] ${textS}`} style={{ fontWeight: 700 }}>증빙 필수 여부</label>
                <button onClick={() => setRegForm(f => ({ ...f, requireEvidence: !f.requireEvidence }))}
                  className="w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer"
                  style={{ backgroundColor: regForm.requireEvidence ? "#2F4F46" : "#D6D0C8" }}>
                  <div className={`w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${regForm.requireEvidence ? "right-[2px]" : "left-[2px]"}`} />
                </button>
                <span className={`text-[13px] ${textT}`}>{regForm.requireEvidence ? "필수" : "선택"}</span>
              </div>
              <div>
                <label className={`block text-[13px] ${textS} mb-1.5`} style={{ fontWeight: 700 }}>메모 (선택)</label>
                <input value={regForm.memo} onChange={e => setRegForm(f => ({ ...f, memo: e.target.value }))} placeholder="사업 특이사항, 정산 일정 등"
                  className={`w-full ${inputCls}`} />
              </div>
            </div>
            <div className={`px-6 py-4 border-t ${cardBorder} flex items-center justify-end gap-3 shrink-0`}>
              <button onClick={() => setShowRegModal(false)} className={`h-[48px] px-5 rounded-xl border ${cardBorder} ${textS} text-[14px] ${hoverBg} cursor-pointer`}>취소</button>
              <button onClick={saveReg} disabled={!regForm.name.trim() || regForm.totalAmount <= 0} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {editingSubId ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════
         영수증 상세 모달
         ═══════════════════════ */}
      {showReceiptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowReceiptDetail(null)}>
          <div className={`${dark ? "bg-[#1E293B]" : "bg-white"} rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[520px] flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-5 border-b ${cardBorder}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF6E6] flex items-center justify-center"><FileText size={20} className="text-[#8A6A2B]" /></div>
                  <h2 className={`text-[18px] ${textP}`} style={{ fontWeight: 700 }}>영수증 상세</h2>
                </div>
                <button onClick={() => setShowReceiptDetail(null)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${textT} ${hoverBg} cursor-pointer`}><X size={20} /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Image placeholder */}
              <div className={`w-full h-[200px] rounded-xl ${subBg} flex items-center justify-center`}>
                <div className="text-center">
                  <Image size={40} className={textT} />
                  <p className={`text-[13px] ${textT} mt-2`}>{showReceiptDetail.fileName}</p>
                </div>
              </div>

              {/* OCR results */}
              <div className={`${subBg} rounded-xl p-4 space-y-3`}>
                <p className={`text-[13px] ${textT}`} style={{ fontWeight: 700 }}>자동 인식 결과</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className={`text-[11px] ${textT}`}>거래처</p>
                    <p className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{showReceiptDetail.ocrVendor}</p>
                  </div>
                  <div>
                    <p className={`text-[11px] ${textT}`}>금액</p>
                    <p className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{fmt(showReceiptDetail.ocrAmount)}원</p>
                  </div>
                  <div>
                    <p className={`text-[11px] ${textT}`}>거래일</p>
                    <p className={`text-[14px] ${textP}`} style={{ fontWeight: 700 }}>{showReceiptDetail.ocrDate}</p>
                  </div>
                </div>
              </div>

              {/* Auto-suggest */}
              <div className={`${dark ? "bg-[#1B3A20]" : "bg-[#ECF7EE]"} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-[#1B5E20]" />
                  <span className="text-[13px] text-[#1B5E20]" style={{ fontWeight: 700 }}>자동 추천</span>
                </div>
                <div className="space-y-1.5">
                  <p className={`text-[14px] ${dark ? "text-[#81C784]" : "text-[#1B5E20]"}`}>추천 보조금: <strong>{subsidies[0]?.name || "-"}</strong></p>
                  <p className={`text-[14px] ${dark ? "text-[#81C784]" : "text-[#1B5E20]"}`}>추천 구분: <strong>정부지원</strong></p>
                  <p className={`text-[14px] ${dark ? "text-[#81C784]" : "text-[#1B5E20]"}`}>추천 카테고리: <strong>시설</strong></p>
                </div>
                <button className="mt-3 h-[48px] px-6 rounded-xl bg-[#1B5E20] text-white text-[14px] cursor-pointer hover:bg-[#145218] w-full flex items-center justify-center gap-2">
                  <Check size={16} /> 추천대로 적용
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] ${textS}`}>상태:</span>
                  {(() => {
                    const rCfg = REC_STATUS_CFG[showReceiptDetail.status];
                    return <span className="text-[12px] px-2 py-0.5 rounded-md" style={{ backgroundColor: rCfg.bg, color: rCfg.text, fontWeight: 700 }}>{showReceiptDetail.status}</span>;
                  })()}
                </div>
                <button onClick={() => handleDownload(showReceiptDetail.fileName)} className={`h-[40px] px-4 rounded-xl border ${cardBorder} ${textS} text-[13px] flex items-center gap-2 ${hoverBg} cursor-pointer`}>
                  <Download size={14} /> 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
