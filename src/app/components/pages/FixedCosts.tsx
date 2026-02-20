import { useState, useMemo, useRef, useEffect } from "react";
import {
  Building2, Wrench, Wallet, Plus, Edit2, Trash2, Check, X,
  TrendingUp, TrendingDown, Calendar, Info, ChevronDown, Search,
  Landmark, ShieldCheck, CreditCard, Users, Wifi, Car, Droplets,
  Flame, Zap, TreePine, Bug, Hammer, ThermometerSun, Phone, Printer,
  Download, FileSpreadsheet, FileText as FileTextIcon
} from "lucide-react";
import * as XLSX from "xlsx";

/* ═══ 타입 ═══ */
type CostCategory = "고정비" | "시설관리" | "운영비";

interface FixedCostItem {
  id: number;
  name: string;
  category: CostCategory;
  subcategory: string;
  monthlyAmount: number;
  paymentDay: number;
  paymentMethod: string;
  memo: string;
  isActive: boolean;
  lastUpdated: string;
  trend: number; // 전월 대비 변동률 (%)
}

/* ═══ 더미 데이터 ═══ */
const INITIAL_COSTS: FixedCostItem[] = [
  // 고정비
  { id: 1, name: "건물 임대료", category: "고정비", subcategory: "임대료", monthlyAmount: 1500000, paymentDay: 1, paymentMethod: "자동이체", memo: "매월 1일 자동이체 (계약 2027.03까지)", isActive: true, lastUpdated: "2026.01.01", trend: 0 },
  { id: 2, name: "화재보험", category: "고정비", subcategory: "보험료", monthlyAmount: 120000, paymentDay: 15, paymentMethod: "자��이체", memo: "삼성화재 영업배상 포함", isActive: true, lastUpdated: "2026.01.15", trend: 0 },
  { id: 3, name: "시설 대출 이자", category: "고정비", subcategory: "대출이자", monthlyAmount: 350000, paymentDay: 25, paymentMethod: "자동이체", memo: "농협 시설자금 대출 (잔액 4,200만원)", isActive: true, lastUpdated: "2026.02.01", trend: -2 },
  { id: 4, name: "정규직 인건비 (2명)", category: "고정비", subcategory: "인건비", monthlyAmount: 4800000, paymentDay: 10, paymentMethod: "계좌이체", memo: "매니저 1명 + 조리사 1명, 4대보험 포함", isActive: true, lastUpdated: "2026.02.10", trend: 0 },
  { id: 5, name: "POS 시스템 이용료", category: "고정비", subcategory: "구독료", monthlyAmount: 55000, paymentDay: 5, paymentMethod: "카드결제", memo: "○○POS 월정액", isActive: true, lastUpdated: "2026.02.05", trend: 0 },
  { id: 6, name: "예약 플랫폼 수수료", category: "고정비", subcategory: "구독료", monthlyAmount: 33000, paymentDay: 1, paymentMethod: "카드결제", memo: "이웃우리 Pro 구독", isActive: true, lastUpdated: "2026.02.01", trend: 0 },
  { id: 7, name: "차량 리스비", category: "고정비", subcategory: "리스비", monthlyAmount: 450000, paymentDay: 20, paymentMethod: "자동이체", memo: "스타리아 9인승 (36개월 리스)", isActive: true, lastUpdated: "2026.02.20", trend: 0 },

  // 시설관리
  { id: 8, name: "건물 유지보수", category: "시설관리", subcategory: "유지보수", monthlyAmount: 200000, paymentDay: 0, paymentMethod: "현금/카드", memo: "소규모 수리, 페인트칠 등 평균 비용", isActive: true, lastUpdated: "2026.02.08", trend: 15 },
  { id: 9, name: "조경 관리", category: "시설관리", subcategory: "조경", monthlyAmount: 150000, paymentDay: 1, paymentMethod: "계좌이체", memo: "○○조경 월 1회 정기 관리", isActive: true, lastUpdated: "2026.02.01", trend: 0 },
  { id: 10, name: "정화조 관리", category: "시설관리", subcategory: "위생", monthlyAmount: 80000, paymentDay: 0, paymentMethod: "계좌이체", memo: "분기 1회 (월 배분)", isActive: true, lastUpdated: "2026.01.15", trend: 0 },
  { id: 11, name: "방역 소독", category: "시설관리", subcategory: "방역", monthlyAmount: 60000, paymentDay: 0, paymentMethod: "계좌이체", memo: "격월 1회 (월 배분)", isActive: true, lastUpdated: "2026.01.20", trend: 0 },
  { id: 12, name: "소방 점검", category: "시설관리", subcategory: "안전", monthlyAmount: 40000, paymentDay: 0, paymentMethod: "계좌이체", memo: "연 2회 법정 점검 (월 배분)", isActive: true, lastUpdated: "2025.12.15", trend: 0 },
  { id: 13, name: "냉난방 시설 점검", category: "시설관리", subcategory: "유지보수", monthlyAmount: 50000, paymentDay: 0, paymentMethod: "계좌이체", memo: "반기 1회 (월 배분)", isActive: true, lastUpdated: "2026.01.10", trend: 0 },

  // 운영비
  { id: 14, name: "전기요금", category: "운영비", subcategory: "공과금", monthlyAmount: 380000, paymentDay: 20, paymentMethod: "자동이체", memo: "한전 자동이체", isActive: true, lastUpdated: "2026.02.20", trend: 8 },
  { id: 15, name: "수도요금", category: "운영비", subcategory: "공과금", monthlyAmount: 120000, paymentDay: 20, paymentMethod: "자동이체", memo: "", isActive: true, lastUpdated: "2026.02.20", trend: -3 },
  { id: 16, name: "가스비 (LPG)", category: "운영비", subcategory: "공과금", monthlyAmount: 250000, paymentDay: 15, paymentMethod: "자동이체", memo: "조리 + 난방용", isActive: true, lastUpdated: "2026.02.15", trend: 12 },
  { id: 17, name: "인터넷 + 전화", category: "운영비", subcategory: "통신비", monthlyAmount: 66000, paymentDay: 25, paymentMethod: "자동이체", memo: "KT 기가인터넷 + 전화 2회선", isActive: true, lastUpdated: "2026.02.25", trend: 0 },
  { id: 18, name: "차량 유류비", category: "운영비", subcategory: "차량비", monthlyAmount: 180000, paymentDay: 0, paymentMethod: "카드결제", memo: "셔틀 운행 + 장보기 등", isActive: true, lastUpdated: "2026.02.14", trend: 5 },
  { id: 19, name: "차량 보험료", category: "운영비", subcategory: "차량비", monthlyAmount: 95000, paymentDay: 10, paymentMethod: "자동이체", memo: "연납 월 배분 (1,140,000원/년)", isActive: true, lastUpdated: "2026.01.10", trend: 0 },
  { id: 20, name: "사무용품·소모품", category: "운영비", subcategory: "소모품", monthlyAmount: 80000, paymentDay: 0, paymentMethod: "카드결제", memo: "프린터 잉크, A4, 청소용품 등", isActive: true, lastUpdated: "2026.02.12", trend: -10 },
  { id: 21, name: "세탁 외주비", category: "운영비", subcategory: "외주비", monthlyAmount: 150000, paymentDay: 0, paymentMethod: "계좌이체", memo: "침구류 세탁 (숙박 운영)", isActive: true, lastUpdated: "2026.02.08", trend: 0 },
];

const SUBCATEGORIES: Record<CostCategory, string[]> = {
  "고정비": ["임대료", "보험료", "대출이자", "인건비", "구독료", "리스비", "기타"],
  "시설관리": ["유지보수", "조경", "위생", "방역", "안전", "기타"],
  "운영비": ["공과금", "통신비", "차량비", "소모품", "외주비", "기타"],
};

const CAT_CONFIG: Record<CostCategory, { color: string; bgColor: string; lightBg: string; icon: typeof Building2 }> = {
  "고정비": { color: "#2F4F46", bgColor: "#ECF7EE", lightBg: "#F0F5F4", icon: Building2 },
  "시설관리": { color: "#8A6A2B", bgColor: "#FFF6E6", lightBg: "#FFFBF0", icon: Wrench },
  "운영비": { color: "#1B5E20", bgColor: "#ECF7EE", lightBg: "#F7FBF7", icon: Wallet },
};

const SUBCAT_ICONS: Record<string, typeof Building2> = {
  "임대료": Landmark, "보험료": ShieldCheck, "대출이자": CreditCard, "인건비": Users,
  "구독료": Wifi, "리스비": Car, "유지보수": Hammer, "조경": TreePine,
  "위생": Droplets, "방역": Bug, "안전": ShieldCheck, "공과금": Zap,
  "통신비": Phone, "차량비": Car, "소모품": Printer, "외주비": Users,
};

/* ═══ 컴포넌트 ═══ */
export function FixedCosts() {
  const [costs, setCosts] = useState<FixedCostItem[]>(INITIAL_COSTS);
  const [activeTab, setActiveTab] = useState<CostCategory | "전체">("전체");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedCostItem | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  /* 폼 상태 */
  const [fName, setFName] = useState("");
  const [fCategory, setFCategory] = useState<CostCategory>("고정비");
  const [fSubcategory, setFSubcategory] = useState("");
  const [fAmount, setFAmount] = useState<number>(0);
  const [fPaymentDay, setFPaymentDay] = useState<number>(1);
  const [fPaymentMethod, setFPaymentMethod] = useState("자동이체");
  const [fMemo, setFMemo] = useState("");

  /* 필터 */
  const filtered = useMemo(() => {
    if (activeTab === "전체") return costs.filter(c => c.isActive);
    return costs.filter(c => c.category === activeTab && c.isActive);
  }, [costs, activeTab]);

  /* 요약 통계 */
  const stats = useMemo(() => {
    const active = costs.filter(c => c.isActive);
    const byCat = (cat: CostCategory) => active.filter(c => c.category === cat).reduce((s, c) => s + c.monthlyAmount, 0);
    const total = active.reduce((s, c) => s + c.monthlyAmount, 0);
    const increasing = active.filter(c => c.trend > 0).length;
    return {
      fixed: byCat("고정비"),
      facility: byCat("시설관리"),
      operating: byCat("운영비"),
      total,
      annual: total * 12,
      increasing,
      count: active.length,
    };
  }, [costs]);

  /* 폼 열기 */
  const openForm = (item?: FixedCostItem) => {
    if (item) {
      setEditingItem(item);
      setFName(item.name);
      setFCategory(item.category);
      setFSubcategory(item.subcategory);
      setFAmount(item.monthlyAmount);
      setFPaymentDay(item.paymentDay);
      setFPaymentMethod(item.paymentMethod);
      setFMemo(item.memo);
    } else {
      setEditingItem(null);
      setFName("");
      setFCategory("고정비");
      setFSubcategory("");
      setFAmount(0);
      setFPaymentDay(1);
      setFPaymentMethod("자동이체");
      setFMemo("");
    }
    setShowForm(true);
  };

  const saveItem = () => {
    if (!fName.trim()) return;
    if (editingItem) {
      setCosts(prev => prev.map(c => c.id === editingItem.id ? {
        ...c, name: fName, category: fCategory, subcategory: fSubcategory || SUBCATEGORIES[fCategory][0],
        monthlyAmount: fAmount, paymentDay: fPaymentDay, paymentMethod: fPaymentMethod, memo: fMemo,
        lastUpdated: "2026.02.20",
      } : c));
    } else {
      const newItem: FixedCostItem = {
        id: Date.now(), name: fName, category: fCategory,
        subcategory: fSubcategory || SUBCATEGORIES[fCategory][0],
        monthlyAmount: fAmount, paymentDay: fPaymentDay, paymentMethod: fPaymentMethod,
        memo: fMemo, isActive: true, lastUpdated: "2026.02.20", trend: 0,
      };
      setCosts(prev => [...prev, newItem]);
    }
    setShowForm(false);
  };

  const deleteItem = (id: number) => {
    setCosts(prev => prev.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  /* 카테고리별 그룹핑 */
  const groupedBySubcat = useMemo(() => {
    const map = new Map<string, FixedCostItem[]>();
    filtered.forEach(c => {
      const key = c.subcategory;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const tabs: { key: CostCategory | "전체"; label: string; amount: number }[] = [
    { key: "전체", label: "전체", amount: stats.total },
    { key: "고정비", label: "고정비", amount: stats.fixed },
    { key: "시설관리", label: "시설관리", amount: stats.facility },
    { key: "운영비", label: "운영비", amount: stats.operating },
  ];

  /* 엑셀 다운로드 */
  const downloadExcel = (items?: FixedCostItem[], label?: string) => {
    const wb = XLSX.utils.book_new();
    const today = "2026-02-20";
    const dataToExport = items || filtered;
    const tabLabel = label || (activeTab === "전체" ? "전체" : activeTab);
    const isSingleItem = dataToExport.length === 1;

    if (!isSingleItem) {
      /* ── 요약 시트 ── */
      const summaryData: (string | number)[][] = [
        ["고라데이마을 — 고정비·시설관리·운영비 요약"],
        ["기준일", today],
        ["내보내기 범위", tabLabel],
        [],
        ["분류", "항목 수", "월 합계 (원)", "연간 합계 (원)"],
      ];
      const categories: CostCategory[] = ["고정비", "시설관리", "운영비"];
      categories.forEach(cat => {
        const catItems = dataToExport.filter(c => c.category === cat);
        if (catItems.length > 0) {
          const monthly = catItems.reduce((s, c) => s + c.monthlyAmount, 0);
          summaryData.push([cat, catItems.length, monthly, monthly * 12]);
        }
      });
      const totalMonthly = dataToExport.reduce((s, c) => s + c.monthlyAmount, 0);
      summaryData.push([]);
      summaryData.push(["합계", dataToExport.length, totalMonthly, totalMonthly * 12]);

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "요약");
    }

    /* ── 상세 시트 ── */
    const detailHeader = ["항목명", "분류", "세부 분류", "월 비용 (원)", "연간 비용 (원)", "결제일", "결제 방법", "전월 대비(%)", "최근 수정", "메모"];
    const detailRows = dataToExport.map(c => [
      c.name,
      c.category,
      c.subcategory,
      c.monthlyAmount,
      c.monthlyAmount * 12,
      c.paymentDay > 0 ? `매월 ${c.paymentDay}일` : "수시",
      c.paymentMethod,
      c.trend !== 0 ? `${c.trend > 0 ? "+" : ""}${c.trend}%` : "-",
      c.lastUpdated,
      c.memo,
    ]);
    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows]);
    wsDetail["!cols"] = [
      { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, isSingleItem ? "항목 상세" : "비용 상세");

    /* ── 카테고리별 시트 (전체 탭에서 복수 항목일 때만) ── */
    if (!isSingleItem && !items) {
      const categories: CostCategory[] = ["고정비", "시설관리", "운영비"];
      const catsInData = new Set(dataToExport.map(c => c.category));
      if (catsInData.size > 1) {
        categories.forEach(cat => {
          const catItems = dataToExport.filter(c => c.category === cat);
          if (catItems.length === 0) return;
          const catRows = catItems.map(c => [
            c.name, c.subcategory, c.monthlyAmount, c.monthlyAmount * 12,
            c.paymentDay > 0 ? `매월 ${c.paymentDay}일` : "수시",
            c.paymentMethod, c.memo,
          ]);
          const wsCat = XLSX.utils.aoa_to_sheet([
            ["항목명", "세부 분류", "월 비용 (원)", "연간 비용 (원)", "결제일", "결제 방법", "메모"],
            ...catRows,
            [],
            ["소계", "", catItems.reduce((s, c) => s + c.monthlyAmount, 0), catItems.reduce((s, c) => s + c.monthlyAmount, 0) * 12, "", "", ""],
          ]);
          wsCat["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];
          XLSX.utils.book_append_sheet(wb, wsCat, cat);
        });
      }
    }

    const safeName = isSingleItem ? dataToExport[0].name.replace(/[/\\?*[\]]/g, "_") : tabLabel;
    const fileName = `비용_${safeName}_${today.replace(/-/g, "")}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setShowDownloadMenu(false);
  };

  /* CSV 다운로드 */
  const downloadCSV = (items?: FixedCostItem[], label?: string) => {
    const today = "2026-02-20";
    const dataToExport = items || filtered;
    const tabLabel = label || (activeTab === "전체" ? "전체" : activeTab);

    const BOM = "\uFEFF";
    const header = ["항목명", "분류", "세부 분류", "월 비용 (원)", "연간 비용 (원)", "결제일", "결제 방법", "전월 대비(%)", "최근 수정", "메모"];
    const rows = dataToExport.map(c => [
      `"${c.name}"`,
      `"${c.category}"`,
      `"${c.subcategory}"`,
      String(c.monthlyAmount),
      String(c.monthlyAmount * 12),
      c.paymentDay > 0 ? `"매월 ${c.paymentDay}일"` : `"수시"`,
      `"${c.paymentMethod}"`,
      c.trend !== 0 ? `"${c.trend > 0 ? "+" : ""}${c.trend}%"` : `"-"`,
      `"${c.lastUpdated}"`,
      `"${c.memo.replace(/"/g, '""')}"`,
    ]);

    if (dataToExport.length > 1) {
      const totalMonthly = dataToExport.reduce((s, c) => s + c.monthlyAmount, 0);
      rows.push([]);
      rows.push([`"[합계]"`, "", "", String(totalMonthly), String(totalMonthly * 12), "", "", "", "", ""]);
    }

    const csvContent = BOM + [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = dataToExport.length === 1 ? dataToExport[0].name.replace(/[/\\?*[\]]/g, "_") : tabLabel;
    link.download = `비용_${safeName}_${today.replace(/-/g, "")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  useEffect(() => {
    const currentRef = downloadMenuRef.current;
    const handleClickOutside = (event: MouseEvent) => {
      if (currentRef && !currentRef.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-[1160px] space-y-6">

      {/* ── 상단 요약 카드 ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "고정비", value: stats.fixed, icon: Building2, color: "#2F4F46", desc: `${costs.filter(c => c.category === "고정비" && c.isActive).length}개 항목` },
          { label: "시설관리", value: stats.facility, icon: Wrench, color: "#8A6A2B", desc: `${costs.filter(c => c.category === "시설관리" && c.isActive).length}개 항목` },
          { label: "운영비", value: stats.operating, icon: Wallet, color: "#1B5E20", desc: `${costs.filter(c => c.category === "운영비" && c.isActive).length}개 항목` },
          { label: "월 합계", value: stats.total, icon: Calendar, color: "#C62828", desc: `연간 약 ${(stats.annual / 10000).toFixed(0)}만원` },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-2.5">
              <card.icon size={16} className="text-[#9CA3AF]" />
              <span className="text-[13px] text-[#6B7280]">{card.label}</span>
            </div>
            <p className="text-[22px]" style={{ fontWeight: 700, color: card.color }}>
              {(card.value / 10000).toFixed(0)}<span className="text-[14px] text-[#6B7280]" style={{ fontWeight: 400 }}>만원</span>
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ── 비율 시각화 바 ── */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>월별 비용 구성</span>
          <span className="text-[13px] text-[#9CA3AF]">2026년 2월 기준</span>
        </div>
        <div className="h-[12px] rounded-full overflow-hidden flex bg-[#F3EFE8]">
          {stats.total > 0 && (
            <>
              <div className="h-full bg-[#2F4F46] transition-all" style={{ width: `${(stats.fixed / stats.total) * 100}%` }} />
              <div className="h-full bg-[#D4A843] transition-all" style={{ width: `${(stats.facility / stats.total) * 100}%` }} />
              <div className="h-full bg-[#5B8A72] transition-all" style={{ width: `${(stats.operating / stats.total) * 100}%` }} />
            </>
          )}
        </div>
        <div className="flex gap-6 mt-2.5">
          {[
            { label: "고정비", pct: stats.total > 0 ? Math.round((stats.fixed / stats.total) * 100) : 0, color: "#2F4F46" },
            { label: "시설관리", pct: stats.total > 0 ? Math.round((stats.facility / stats.total) * 100) : 0, color: "#D4A843" },
            { label: "운영비", pct: stats.total > 0 ? Math.round((stats.operating / stats.total) * 100) : 0, color: "#5B8A72" },
          ].map(seg => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[13px] text-[#6B7280]">{seg.label} {seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 탭 + 내보내기 + 추가 버튼 ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-[#2F4F46] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
                  : "border-[#E6E2DB] bg-white/60 hover:bg-white"
              }`}
            >
              <span className={`text-[14px] ${activeTab === tab.key ? "text-[#2F4F46]" : "text-[#6B7280]"}`} style={{ fontWeight: activeTab === tab.key ? 700 : 400 }}>
                {tab.label}
              </span>
              <span className={`text-[12px] px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? "bg-[#ECF7EE] text-[#2F4F46]" : "bg-[#F7F3ED] text-[#9CA3AF]"}`} style={{ fontWeight: 700 }}>
                {(tab.amount / 10000).toFixed(0)}만
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          {/* 다운로드 드롭다운 */}
          <div ref={downloadMenuRef} className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="h-[48px] px-5 rounded-xl border border-[#D6D0C8] bg-white text-[#1F2937] text-[14px] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <Download size={16} className="text-[#2F4F46]" />
              <span style={{ fontWeight: 700 }}>내보내기</span>
              <ChevronDown size={13} className={`text-[#9CA3AF] transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 top-[56px] w-[280px] bg-white rounded-xl border border-[#E6E2DB] shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                {/* 헤더 */}
                <div className="px-4 py-3 border-b border-[#E6E2DB] bg-[#FBFAF7]">
                  <p className="text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>
                    {activeTab === "전체" ? "전체 비용 항목" : `${activeTab} 항목`} ({filtered.length}개) 내보내기
                  </p>
                </div>

                {/* 엑셀 */}
                <button
                  onClick={() => downloadExcel()}
                  className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-[#F7F3ED] transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#ECF7EE] flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={16} className="text-[#2F4F46]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>엑셀 파일 (.xlsx)</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5">요약 + 상세 + 분류별 시트 포함</p>
                  </div>
                </button>

                <div className="mx-4 border-b border-[#F3EFE8]" />

                {/* CSV */}
                <button
                  onClick={() => downloadCSV()}
                  className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-[#F7F3ED] transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FFF6E6] flex items-center justify-center shrink-0">
                    <FileTextIcon size={16} className="text-[#8A6A2B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>CSV 파일 (.csv)</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5">다른 프로그램에서 열 수 있는 범용 형식</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => openForm()}
            className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
          >
            <Plus size={16} /> 비용 항목 추가
          </button>
        </div>
      </div>

      {/* ── 비용 항목 목록 ── */}
      {groupedBySubcat.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] py-12 text-center">
          <Wallet size={32} className="text-[#D6D0C8] mx-auto mb-3" />
          <p className="text-[15px] text-[#6B7280]" style={{ fontWeight: 700 }}>등록된 비용 항목이 없습니다</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">'비용 항목 추가' 버튼으로 시작하세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedBySubcat.map(([subcatName, items]) => {
            const subcatTotal = items.reduce((s, c) => s + c.monthlyAmount, 0);
            const SubIcon = SUBCAT_ICONS[subcatName] || Wallet;
            return (
              <div key={subcatName} className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* 소분류 헤더 */}
                <div className="px-5 py-3 bg-[#FBFAF7] border-b border-[#E6E2DB] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <SubIcon size={15} className="text-[#9CA3AF]" />
                    <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{subcatName}</span>
                    <span className="text-[12px] text-[#9CA3AF] bg-[#F7F3ED] px-2 py-0.5 rounded" style={{ fontWeight: 700 }}>{items.length}개</span>
                  </div>
                  <span className="text-[15px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{subcatTotal.toLocaleString()}원</span>
                </div>

                {/* 항목 행 */}
                <div className="divide-y divide-[#F3EFE8]">
                  {items.map(item => {
                    const isExpanded = expandedId === item.id;
                    const catConf = CAT_CONFIG[item.category];
                    return (
                      <div key={item.id}>
                        <div
                          className={`px-5 py-3.5 flex items-center gap-4 cursor-pointer transition-colors ${isExpanded ? "bg-[#F7F3ED]" : "hover:bg-[#FBFAF7]"}`}
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {/* 카테고리 뱃지 */}
                          <span className="text-[11px] px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: catConf.bgColor, color: catConf.color, fontWeight: 700 }}>
                            {item.category}
                          </span>

                          {/* 항목명 */}
                          <span className="text-[15px] text-[#1F2937] flex-1 min-w-0 truncate" style={{ fontWeight: 700 }}>{item.name}</span>

                          {/* 결제일 */}
                          <span className="text-[12px] text-[#9CA3AF] shrink-0 w-[70px] text-center">
                            {item.paymentDay > 0 ? `매월 ${item.paymentDay}일` : "수시"}
                          </span>

                          {/* 결제 방법 */}
                          <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-0.5 rounded shrink-0">{item.paymentMethod}</span>

                          {/* 변동 */}
                          <div className="w-[60px] shrink-0 text-right">
                            {item.trend !== 0 && (
                              <span className={`text-[12px] flex items-center justify-end gap-0.5 ${item.trend > 0 ? "text-[#C62828]" : "text-[#1B5E20]"}`}>
                                {item.trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                {Math.abs(item.trend)}%
                              </span>
                            )}
                          </div>

                          {/* 금액 */}
                          <span className="text-[16px] text-[#1F2937] shrink-0 w-[120px] text-right" style={{ fontWeight: 700 }}>
                            {item.monthlyAmount.toLocaleString()}원
                          </span>

                          {/* 관리 */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={e => { e.stopPropagation(); downloadExcel([item], item.name); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECF7EE] hover:text-[#2F4F46] cursor-pointer transition-colors" title="엑셀 다운로드">
                              <Download size={13} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); openForm(item); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <ChevronDown size={13} className={`text-[#9CA3AF] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        {/* 확장 상세 */}
                        {isExpanded && (
                          <div className="px-5 py-4 bg-[#FBFAF7] border-t border-[#E6E2DB]">
                            <div className="flex gap-5">
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-white rounded-xl border border-[#E6E2DB] p-3.5">
                                    <p className="text-[12px] text-[#9CA3AF] mb-1">월 비용</p>
                                    <p className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{item.monthlyAmount.toLocaleString()}원</p>
                                  </div>
                                  <div className="bg-white rounded-xl border border-[#E6E2DB] p-3.5">
                                    <p className="text-[12px] text-[#9CA3AF] mb-1">연간 비용</p>
                                    <p className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>{(item.monthlyAmount * 12).toLocaleString()}원</p>
                                  </div>
                                  <div className="bg-white rounded-xl border border-[#E6E2DB] p-3.5">
                                    <p className="text-[12px] text-[#9CA3AF] mb-1">전월 대비</p>
                                    <p className={`text-[18px] ${item.trend > 0 ? "text-[#C62828]" : item.trend < 0 ? "text-[#1B5E20]" : "text-[#6B7280]"}`} style={{ fontWeight: 700 }}>
                                      {item.trend === 0 ? "변동 없음" : `${item.trend > 0 ? "+" : ""}${item.trend}%`}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white rounded-xl border border-[#E6E2DB] p-3.5 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[13px] text-[#6B7280]">결제일</span>
                                    <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.paymentDay > 0 ? `매월 ${item.paymentDay}일` : "수시 지출"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[13px] text-[#6B7280]">결제 방법</span>
                                    <span className="text-[13px] text-[#1F2937]">{item.paymentMethod}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[13px] text-[#6B7280]">최근 수정</span>
                                    <span className="text-[13px] text-[#9CA3AF]">{item.lastUpdated}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="w-[220px] shrink-0 space-y-3">
                                {item.memo && (
                                  <div className="bg-white rounded-xl border border-[#E6E2DB] px-3.5 py-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Info size={12} className="text-[#9CA3AF]" />
                                      <span className="text-[11px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>메모</span>
                                    </div>
                                    <p className="text-[13px] text-[#6B7280] leading-relaxed">{item.memo}</p>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openForm(item)}
                                    className="flex-1 h-[40px] rounded-xl border border-[#2F4F46] text-[#2F4F46] text-[13px] hover:bg-[#F7F3ED] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    <Edit2 size={13} /> 수정
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item.id)}
                                    className="h-[40px] px-4 rounded-xl border border-[#E6E2DB] text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] hover:border-[#FDECEC] cursor-pointer transition-colors flex items-center justify-center"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                {/* 개별 항목 내보내기 */}
                                <div className="bg-white rounded-xl border border-[#E6E2DB] p-2.5">
                                  <p className="text-[11px] text-[#9CA3AF] mb-2 px-1" style={{ fontWeight: 700 }}>이 항목 내보내기</p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => downloadExcel([item], item.name)}
                                      className="flex-1 h-[34px] rounded-lg border border-[#E6E2DB] text-[12px] text-[#2F4F46] hover:bg-[#ECF7EE] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <FileSpreadsheet size={12} /> 엑셀
                                    </button>
                                    <button
                                      onClick={() => downloadCSV([item], item.name)}
                                      className="flex-1 h-[34px] rounded-lg border border-[#E6E2DB] text-[12px] text-[#8A6A2B] hover:bg-[#FFF6E6] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <FileTextIcon size={12} /> CSV
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 하단 안내 + 다운로드 ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-center gap-2.5">
          <Info size={14} className="text-[#9CA3AF] shrink-0" />
          <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
            고정비·시설관리·운영비는 상품 원가와 별도로 매월 발생하는 비용입니다. 여기에 등록하면 분석 리포트와 스마트 경영 센터에서 전체 수익성을 정확하게 파악할 수 있습니다.
          </p>
        </div>
      </div>

      {/* ═══ 등록/수정 모달 ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[560px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="px-6 py-5 border-b border-[#E6E2DB] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F5F4] flex items-center justify-center">
                    <Building2 size={20} className="text-[#2F4F46]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                      {editingItem ? "비용 항목 수정" : "새 비용 항목 추가"}
                    </h2>
                    <p className="text-[13px] text-[#9CA3AF] mt-0.5">매월 발생하는 고정비, 시설관리비, 운영비를 등록합니다.</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* 항목명 */}
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>항목명</label>
                <input
                  value={fName}
                  onChange={e => setFName(e.target.value)}
                  placeholder="예: 건물 임대료"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                />
              </div>

              {/* 분류 + 소분류 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>분류</label>
                  <div className="relative">
                    <select
                      value={fCategory}
                      onChange={e => { setFCategory(e.target.value as CostCategory); setFSubcategory(""); }}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                    >
                      <option value="고정비">고정비</option>
                      <option value="시설관리">시설관리</option>
                      <option value="운영비">운영비</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>세부 분류</label>
                  <div className="relative">
                    <select
                      value={fSubcategory}
                      onChange={e => setFSubcategory(e.target.value)}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                    >
                      <option value="">선택해주세요</option>
                      {SUBCATEGORIES[fCategory].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 월 비용 */}
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>월 비용 (원)</label>
                <input
                  type="number"
                  value={fAmount || ""}
                  onChange={e => setFAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                />
                {fAmount > 0 && (
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    연간 약 <strong className="text-[#1F2937]">{(fAmount * 12).toLocaleString()}원</strong> ({(fAmount * 12 / 10000).toFixed(0)}만원)
                  </p>
                )}
              </div>

              {/* 결제일 + 결제 방법 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>결제일</label>
                  <div className="relative">
                    <select
                      value={fPaymentDay}
                      onChange={e => setFPaymentDay(Number(e.target.value))}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                    >
                      <option value={0}>수시 (비정기)</option>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>매월 {d}일</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>결제 방법</label>
                  <div className="relative">
                    <select
                      value={fPaymentMethod}
                      onChange={e => setFPaymentMethod(e.target.value)}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                    >
                      {["자동이체", "카드결제", "계좌이체", "현금", "현금/카드"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
                <textarea
                  value={fMemo}
                  onChange={e => setFMemo(e.target.value)}
                  placeholder="계약 정보, 참고사항 등"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
              <button onClick={() => setShowForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
                취소
              </button>
              <div className="flex items-center gap-3">
                {fAmount > 0 && (
                  <span className="text-[14px] text-[#6B7280]">
                    월 <strong className="text-[#2F4F46] text-[16px]">{fAmount.toLocaleString()}원</strong>
                  </span>
                )}
                <button
                  onClick={saveItem}
                  disabled={!fName.trim() || fAmount <= 0}
                  className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingItem ? "수정 완료" : "항목 추가"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}