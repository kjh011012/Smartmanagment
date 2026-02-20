import { useState, useMemo } from "react";
import {
  CreditCard, Globe, Receipt, Plus, Edit2, Trash2,
  ChevronDown, Search, AlertTriangle, Info, X, Check,
  BarChart3, Calculator, Landmark,
  TrendingDown, Wallet, Smartphone, Monitor, Phone
} from "lucide-react";
import { toast } from "sonner";

/* Types */
interface CardFee {
  id: number;
  name: string;
  feeRate: number;
  type: "신용" | "체크" | "공통";
  monthlyVolume: number;
  isActive: boolean;
  memo: string;
}

interface PlatformFee {
  id: number;
  name: string;
  category: "온라인" | "오프라인" | "자체";
  feeRate: number;
  fixedFee: number;
  settlementCycle: string;
  monthlyVolume: number;
  isActive: boolean;
  memo: string;
}

interface TaxItem {
  id: number;
  name: string;
  rate: number;
  type: "비율" | "고정" | "구간";
  description: string;
  isApplied: boolean;
  category: "부가세" | "소득세" | "지방세" | "기타";
  memo: string;
}

/* Dummy data */
const INITIAL_CARDS: CardFee[] = [
  { id: 1, name: "BC카드", feeRate: 1.5, type: "공통", monthlyVolume: 1850000, isActive: true, memo: "영세·중소가맹점 우대 수수료 적용 중" },
  { id: 2, name: "신한카드", feeRate: 1.6, type: "신용", monthlyVolume: 2400000, isActive: true, memo: "" },
  { id: 3, name: "KB국민카드", feeRate: 1.5, type: "신용", monthlyVolume: 1920000, isActive: true, memo: "" },
  { id: 4, name: "삼성카드", feeRate: 1.6, type: "신용", monthlyVolume: 1100000, isActive: true, memo: "" },
  { id: 5, name: "현대카드", feeRate: 1.7, type: "신용", monthlyVolume: 680000, isActive: true, memo: "프리미엄 카드 비율 높아 수수료 주의" },
  { id: 6, name: "롯데카드", feeRate: 1.6, type: "공통", monthlyVolume: 520000, isActive: true, memo: "" },
  { id: 7, name: "NH농협카드", feeRate: 1.4, type: "공통", monthlyVolume: 3100000, isActive: true, memo: "농촌 우대 수수료 적용 (2026.06까지)" },
  { id: 8, name: "하나카드", feeRate: 1.5, type: "신용", monthlyVolume: 450000, isActive: true, memo: "" },
  { id: 9, name: "우리카드", feeRate: 1.5, type: "신용", monthlyVolume: 380000, isActive: true, memo: "" },
  { id: 10, name: "체크카드 (전체)", feeRate: 0.8, type: "체크", monthlyVolume: 2200000, isActive: true, memo: "체크카드 통합 적용 수수료율" },
];

const INITIAL_PLATFORMS: PlatformFee[] = [
  { id: 1, name: "네이버 예약", category: "온라인", feeRate: 4.5, fixedFee: 0, settlementCycle: "주 1회 (목)", monthlyVolume: 3200000, isActive: true, memo: "네이버 스마트플레이스 연동" },
  { id: 2, name: "카카오 예약", category: "온라인", feeRate: 3.5, fixedFee: 0, settlementCycle: "주 1회 (수)", monthlyVolume: 1800000, isActive: true, memo: "" },
  { id: 3, name: "야놀자", category: "온라인", feeRate: 8.0, fixedFee: 0, settlementCycle: "월 2회", monthlyVolume: 960000, isActive: true, memo: "숙박 상품만 등록 중" },
  { id: 4, name: "여기어때", category: "온라인", feeRate: 7.0, fixedFee: 0, settlementCycle: "월 2회", monthlyVolume: 720000, isActive: true, memo: "숙박 상품만 등록 중" },
  { id: 5, name: "에어비앤비", category: "온라인", feeRate: 3.0, fixedFee: 0, settlementCycle: "체크아웃 24시간 후", monthlyVolume: 480000, isActive: true, memo: "체험+숙박 등록" },
  { id: 6, name: "쿠팡", category: "온라인", feeRate: 10.5, fixedFee: 0, settlementCycle: "주 1회 (금)", monthlyVolume: 650000, isActive: true, memo: "특산품 판매 전용. 수수료 높음" },
  { id: 7, name: "스마트스토어", category: "온라인", feeRate: 5.5, fixedFee: 0, settlementCycle: "주 1회 (금)", monthlyVolume: 1400000, isActive: true, memo: "특산품 온라인 판매" },
  { id: 8, name: "자체 홈페이지", category: "자체", feeRate: 0, fixedFee: 0, settlementCycle: "즉시", monthlyVolume: 2800000, isActive: true, memo: "PG사 수수료 별도 (토스페이먼츠 2.2%)" },
  { id: 9, name: "전화/현장 예약", category: "오프라인", feeRate: 0, fixedFee: 0, settlementCycle: "즉시", monthlyVolume: 4500000, isActive: true, memo: "현금/계좌이체 결제 포함" },
  { id: 10, name: "당근마켓", category: "온라인", feeRate: 3.5, fixedFee: 0, settlementCycle: "주 1회", monthlyVolume: 280000, isActive: false, memo: "테스트 중" },
];

const INITIAL_TAXES: TaxItem[] = [
  { id: 1, name: "부가가치세 (VAT)", rate: 10, type: "비율", description: "재화/용역 공급에 부과되는 간접세. 매출세액 - 매입세액.", category: "부가세", isApplied: true, memo: "1월/7월 확정, 4월/10월 예정 신고" },
  { id: 2, name: "간이과세 부가세", rate: 1.5, type: "비율", description: "연 매출 8,000만원 미만 간이과세자 적용. 업종별 상이.", category: "부가세", isApplied: false, memo: "현재 일반과세자 - 해당 없음" },
  { id: 3, name: "종합소득세 (6%)", rate: 6, type: "구간", description: "과세표준 1,400만원 이하 구간", category: "소득세", isApplied: true, memo: "" },
  { id: 4, name: "종합소득세 (15%)", rate: 15, type: "구간", description: "과세표준 1,400만~5,000만원 구간", category: "소득세", isApplied: true, memo: "" },
  { id: 5, name: "종합소득세 (24%)", rate: 24, type: "구간", description: "과세표준 5,000만~8,800만원 구간", category: "소득세", isApplied: true, memo: "현재 이 구간 해당 추정" },
  { id: 6, name: "종합소득세 (35%)", rate: 35, type: "구간", description: "과세표준 8,800만~1.5억원 구간", category: "소득세", isApplied: false, memo: "" },
  { id: 7, name: "지방소득세", rate: 10, type: "비율", description: "종합소득세의 10%를 추가 납부 (소득세 x 0.1)", category: "지방세", isApplied: true, memo: "종합소득세 확정 후 자동 계산" },
  { id: 8, name: "원천징수 (사업소득)", rate: 3.3, type: "비율", description: "프리랜서/외주 인력 지급 시 원천징수 (소득세 3% + 지방세 0.3%)", category: "기타", isApplied: true, memo: "계절 도우미, 체험 강사 등 적용" },
  { id: 9, name: "농어촌특별세", rate: 0.15, type: "비율", description: "감면세액 대비 부과되는 목적세", category: "기타", isApplied: false, memo: "해당 시에만 적용" },
  { id: 10, name: "4대보험 사업주부담", rate: 9.5, type: "비율", description: "국민연금 4.5% + 건강보험 3.545% + 고용보험 0.9% + 산재보험 0.6% (예시)", category: "기타", isApplied: true, memo: "상시근로자 기준. 업종별 산재보험료 다름." },
];

type TabKey = "cards" | "platforms" | "taxes";

const TAB_LIST: Array<{ key: TabKey; label: string; icon: typeof CreditCard }> = [
  { key: "cards", label: "카드사 수수료", icon: CreditCard },
  { key: "platforms", label: "플랫폼 수수료", icon: Globe },
  { key: "taxes", label: "세금 설정", icon: Receipt },
];

const CARD_TYPE_COLORS: Record<string, string> = {
  "신용": "bg-[#FFF6E6] text-[#8A6A2B]",
  "체크": "bg-[#ECF7EE] text-[#1B5E20]",
  "공통": "bg-[#F7F3ED] text-[#6B7280]",
};

const PLATFORM_CAT_COLORS: Record<string, { bg: string; text: string; icon: typeof CreditCard }> = {
  "온라인": { bg: "#ECF7EE", text: "#1B5E20", icon: Monitor },
  "오프라인": { bg: "#FFF6E6", text: "#8A6A2B", icon: Phone },
  "자체": { bg: "#F7F3ED", text: "#2F4F46", icon: Smartphone },
};

const TAX_CAT_COLORS: Record<string, string> = {
  "부가세": "bg-[#FDECEC] text-[#C62828]",
  "소득세": "bg-[#FFF6E6] text-[#8A6A2B]",
  "지방세": "bg-[#F3E8F9] text-[#7B1FA2]",
  "기타": "bg-[#F7F3ED] text-[#6B7280]",
};

/* Component */
export function FeesTaxes() {
  const [activeTab, setActiveTab] = useState<TabKey>("cards");
  const [cards, setCards] = useState<CardFee[]>(INITIAL_CARDS);
  const [platforms, setPlatforms] = useState<PlatformFee[]>(INITIAL_PLATFORMS);
  const [taxes, setTaxes] = useState<TaxItem[]>(INITIAL_TAXES);

  /* Card state */
  const [cardSearch, setCardSearch] = useState("");
  const [cardTypeFilter, setCardTypeFilter] = useState("전체");
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({ name: "", feeRate: 0, type: "공통" as CardFee["type"], memo: "" });

  /* Platform state */
  const [platSearch, setPlatSearch] = useState("");
  const [platCatFilter, setPlatCatFilter] = useState("전체");
  const [editingPlatId, setEditingPlatId] = useState<number | null>(null);
  const [showPlatForm, setShowPlatForm] = useState(false);
  const [platForm, setPlatForm] = useState({ name: "", category: "온라인" as PlatformFee["category"], feeRate: 0, fixedFee: 0, settlementCycle: "", memo: "" });

  /* Tax state */
  const [taxCatFilter, setTaxCatFilter] = useState("전체");
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null);
  const [taxForm, setTaxForm] = useState({ name: "", rate: 0, type: "비율" as TaxItem["type"], description: "", category: "부가세" as TaxItem["category"], memo: "" });

  /* Simulator */
  const [simAmount, setSimAmount] = useState(1000000);
  const [simCardId, setSimCardId] = useState(1);
  const [simPlatId, setSimPlatId] = useState(1);

  /* Stats */
  const cardStats = useMemo(() => {
    const active = cards.filter(c => c.isActive);
    const totalVolume = active.reduce((s, c) => s + c.monthlyVolume, 0);
    const weightedRate = totalVolume > 0
      ? active.reduce((s, c) => s + c.feeRate * c.monthlyVolume, 0) / totalVolume
      : 0;
    const totalFees = active.reduce((s, c) => s + Math.round(c.monthlyVolume * c.feeRate / 100), 0);
    return { count: active.length, weightedRate: Math.round(weightedRate * 100) / 100, totalVolume, totalFees };
  }, [cards]);

  const platStats = useMemo(() => {
    const active = platforms.filter(p => p.isActive);
    const totalVolume = active.reduce((s, p) => s + p.monthlyVolume, 0);
    const weightedRate = totalVolume > 0
      ? active.reduce((s, p) => s + p.feeRate * p.monthlyVolume, 0) / totalVolume
      : 0;
    const totalFees = active.reduce((s, p) => s + Math.round(p.monthlyVolume * p.feeRate / 100) + p.fixedFee, 0);
    return { count: active.length, weightedRate: Math.round(weightedRate * 100) / 100, totalVolume, totalFees };
  }, [platforms]);

  /* Filters */
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      if (cardSearch && !c.name.includes(cardSearch)) return false;
      if (cardTypeFilter !== "전체" && c.type !== cardTypeFilter) return false;
      return true;
    });
  }, [cards, cardSearch, cardTypeFilter]);

  const filteredPlatforms = useMemo(() => {
    return platforms.filter(p => {
      if (platSearch && !p.name.includes(platSearch)) return false;
      if (platCatFilter !== "전체" && p.category !== platCatFilter) return false;
      return true;
    });
  }, [platforms, platSearch, platCatFilter]);

  const filteredTaxes = useMemo(() => {
    return taxes.filter(t => {
      if (taxCatFilter !== "전체" && t.category !== taxCatFilter) return false;
      return true;
    });
  }, [taxes, taxCatFilter]);

  /* Card CRUD */
  const openCardForm = (card?: CardFee) => {
    if (card) {
      setEditingCardId(card.id);
      setCardForm({ name: card.name, feeRate: card.feeRate, type: card.type, memo: card.memo });
    } else {
      setEditingCardId(null);
      setCardForm({ name: "", feeRate: 0, type: "공통", memo: "" });
    }
    setShowCardForm(true);
  };
  const saveCard = () => {
    if (!cardForm.name.trim()) return;
    if (editingCardId) {
      setCards(prev => prev.map(c => c.id === editingCardId ? { ...c, ...cardForm } : c));
    } else {
      setCards(prev => [...prev, { id: Date.now(), ...cardForm, monthlyVolume: 0, isActive: true }]);
    }
    setShowCardForm(false);
    toast.success(editingCardId ? "카드사 수수료가 수정되었습니다." : "새 카드사가 추가되었습니다.");
  };
  const deleteCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.success("카드사가 삭제되었습니다.");
  };
  const toggleCard = (id: number) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  /* Platform CRUD */
  const openPlatForm = (plat?: PlatformFee) => {
    if (plat) {
      setEditingPlatId(plat.id);
      setPlatForm({ name: plat.name, category: plat.category, feeRate: plat.feeRate, fixedFee: plat.fixedFee, settlementCycle: plat.settlementCycle, memo: plat.memo });
    } else {
      setEditingPlatId(null);
      setPlatForm({ name: "", category: "온라인", feeRate: 0, fixedFee: 0, settlementCycle: "", memo: "" });
    }
    setShowPlatForm(true);
  };
  const savePlat = () => {
    if (!platForm.name.trim()) return;
    if (editingPlatId) {
      setPlatforms(prev => prev.map(p => p.id === editingPlatId ? { ...p, ...platForm } : p));
    } else {
      setPlatforms(prev => [...prev, { id: Date.now(), ...platForm, monthlyVolume: 0, isActive: true }]);
    }
    setShowPlatForm(false);
    toast.success(editingPlatId ? "플랫폼 수수료가 수정되었습니다." : "새 플랫폼이 추가되었습니다.");
  };
  const deletePlat = (id: number) => {
    setPlatforms(prev => prev.filter(p => p.id !== id));
    toast.success("플랫폼이 삭제되었습니다.");
  };
  const togglePlat = (id: number) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  /* Tax CRUD */
  const openTaxForm = (tax?: TaxItem) => {
    if (tax) {
      setEditingTaxId(tax.id);
      setTaxForm({ name: tax.name, rate: tax.rate, type: tax.type, description: tax.description, category: tax.category, memo: tax.memo });
    } else {
      setEditingTaxId(null);
      setTaxForm({ name: "", rate: 0, type: "비율", description: "", category: "부가세", memo: "" });
    }
    setShowTaxForm(true);
  };
  const saveTax = () => {
    if (!taxForm.name.trim()) return;
    if (editingTaxId) {
      setTaxes(prev => prev.map(t => t.id === editingTaxId ? { ...t, ...taxForm } : t));
    } else {
      setTaxes(prev => [...prev, { id: Date.now(), ...taxForm, isApplied: true }]);
    }
    setShowTaxForm(false);
    toast.success(editingTaxId ? "세금 항목이 수정되었습니다." : "새 세금 항목이 추가되었습니다.");
  };
  const deleteTax = (id: number) => {
    setTaxes(prev => prev.filter(t => t.id !== id));
    toast.success("세금 항목이 삭제되었습니다.");
  };
  const toggleTax = (id: number) => {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, isApplied: !t.isApplied } : t));
  };

  /* Simulator calc */
  const simResult = useMemo(() => {
    const card = cards.find(c => c.id === simCardId);
    const plat = platforms.find(p => p.id === simPlatId);
    const cardFee = card ? Math.round(simAmount * card.feeRate / 100) : 0;
    const platFee = plat ? Math.round(simAmount * plat.feeRate / 100) + plat.fixedFee : 0;
    const vat = Math.round(simAmount / 11);
    const totalDeduct = cardFee + platFee + vat;
    return { cardFee, platFee, vat, totalDeduct, net: simAmount - totalDeduct, cardRate: card?.feeRate || 0, platRate: plat?.feeRate || 0 };
  }, [simAmount, simCardId, simPlatId, cards, platforms]);

  const fmtW = (n: number) => (n / 10000).toFixed(0);

  /* Render */
  return (
    <div className="max-w-[1160px] space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "카드 가중평균 수수료", value: cardStats.weightedRate + "%", icon: CreditCard, color: "#2F4F46", desc: cardStats.count + "개 카드사 / 월 " + fmtW(cardStats.totalVolume) + "만원" },
          { label: "플랫폼 가중평균 수수료", value: platStats.weightedRate + "%", icon: Globe, color: platStats.weightedRate > 5 ? "#8A6A2B" : "#1B5E20", desc: platStats.count + "개 채널 / 월 " + fmtW(platStats.totalVolume) + "만원" },
          { label: "월 수수료 합계", value: fmtW(cardStats.totalFees + platStats.totalFees) + "만원", icon: TrendingDown, color: "#C62828", desc: "카드 " + fmtW(cardStats.totalFees) + "만 + 플랫폼 " + fmtW(platStats.totalFees) + "만" },
          { label: "적용 세금 항목", value: taxes.filter(t => t.isApplied).length + "개", icon: Receipt, color: "#6B7280", desc: "전체 " + taxes.length + "개 중 활성" },
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
        {TAB_LIST.map(tab => {
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

      {/* Cards Tab */}
      {activeTab === "cards" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input value={cardSearch} onChange={e => setCardSearch(e.target.value)} placeholder="카드사 검색"
                  className="h-[40px] w-[200px] pl-8 pr-3 rounded-xl border border-[#D6D0C8] bg-white text-[13px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
              <div className="flex gap-1.5 ml-1">
                {["전체", "신용", "체크", "공통"].map(f => (
                  <button key={f} onClick={() => setCardTypeFilter(f)}
                    className={"text-[12px] px-3 py-1.5 rounded-lg transition-all cursor-pointer " + (cardTypeFilter === f ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]")}
                    style={{ fontWeight: cardTypeFilter === f ? 700 : 400 }}>{f}</button>
                ))}
              </div>
            </div>
            <button onClick={() => openCardForm()} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
              <Plus size={16} /> 카드사 추가
            </button>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-2.5 bg-[#FBFAF7] border-b border-[#E6E2DB] grid items-center gap-3" style={{ gridTemplateColumns: "1fr 70px 90px 130px 110px 100px" }}>
              {["카드사", "구분", "수수료율", "월 결제액", "월 수수료", "관리"].map((h, i) => (
                <span key={h} className={"text-[12px] text-[#9CA3AF] " + (i >= 2 ? "text-right" : "")} style={{ fontWeight: 700 }}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-[#F3EFE8]">
              {filteredCards.map(card => {
                const fee = Math.round(card.monthlyVolume * card.feeRate / 100);
                return (
                  <div key={card.id} className={"px-5 py-3.5 grid items-center gap-3 transition-colors hover:bg-[#FBFAF7] " + (!card.isActive ? "opacity-50" : "")}
                    style={{ gridTemplateColumns: "1fr 70px 90px 130px 110px 100px" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F7F3ED] flex items-center justify-center shrink-0">
                        <CreditCard size={16} className="text-[#6B7280]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[15px] text-[#1F2937] truncate block" style={{ fontWeight: 700 }}>{card.name}</span>
                        {card.memo && <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{card.memo}</p>}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className={"text-[11px] px-2 py-0.5 rounded-md " + CARD_TYPE_COLORS[card.type]} style={{ fontWeight: 700 }}>{card.type}</span>
                    </div>
                    <span className="text-[16px] text-[#2F4F46] text-right" style={{ fontWeight: 700 }}>{card.feeRate}%</span>
                    <span className="text-[14px] text-[#1F2937] text-right">{card.monthlyVolume.toLocaleString()}원</span>
                    <span className="text-[14px] text-[#C62828] text-right" style={{ fontWeight: 700 }}>{"-" + fee.toLocaleString() + "원"}</span>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleCard(card.id)}
                        className={"w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors " + (card.isActive ? "text-[#1B5E20] hover:bg-[#ECF7EE]" : "text-[#9CA3AF] hover:bg-[#F7F3ED]")}
                        title={card.isActive ? "비활성화" : "활성화"}>
                        {card.isActive ? <Check size={13} /> : <X size={13} />}
                      </button>
                      <button onClick={() => openCardForm(card)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => deleteCard(card.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-[13px] text-[#6B7280]">활성: <strong className="text-[#1F2937]">{cards.filter(c => c.isActive).length}개</strong></span>
                <span className="text-[13px] text-[#6B7280]">가중평균: <strong className="text-[#2F4F46]">{cardStats.weightedRate}%</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#6B7280]">월 총 결제액: <strong className="text-[#1F2937]">{fmtW(cardStats.totalVolume)}만원</strong></span>
                <span className="text-[13px] text-[#C62828]" style={{ fontWeight: 700 }}>월 수수료: -{fmtW(cardStats.totalFees)}만원</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-start gap-2.5">
            <Info size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#9CA3AF] leading-relaxed">
              <p>카드사 수수료율은 매출 규모와 업종에 따라 다릅니다. <strong className="text-[#6B7280]">영세/중소 가맹점</strong>은 여신금융협회에서 우대 수수료를 적용받을 수 있으니 확인하세요.</p>
              <p className="mt-1">여기 설정한 수수료율은 <strong className="text-[#6B7280]">매출/정산, 스마트 경영 센터</strong>에서 자동 계산에 사용됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* Platforms Tab */}
      {activeTab === "platforms" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input value={platSearch} onChange={e => setPlatSearch(e.target.value)} placeholder="플랫폼 검색"
                  className="h-[40px] w-[200px] pl-8 pr-3 rounded-xl border border-[#D6D0C8] bg-white text-[13px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
              <div className="flex gap-1.5 ml-1">
                {["전체", "온라인", "오프라인", "자체"].map(f => (
                  <button key={f} onClick={() => setPlatCatFilter(f)}
                    className={"text-[12px] px-3 py-1.5 rounded-lg transition-all cursor-pointer " + (platCatFilter === f ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]")}
                    style={{ fontWeight: platCatFilter === f ? 700 : 400 }}>{f}</button>
                ))}
              </div>
            </div>
            <button onClick={() => openPlatForm()} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
              <Plus size={16} /> 플랫폼 추가
            </button>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-2.5 bg-[#FBFAF7] border-b border-[#E6E2DB] grid items-center gap-3" style={{ gridTemplateColumns: "1fr 80px 90px 110px 130px 110px 100px" }}>
              {["플랫폼명", "채널", "수수료율", "정산 주기", "월 거래액", "월 수수료", "관리"].map((h, i) => (
                <span key={h} className={"text-[12px] text-[#9CA3AF] " + (i >= 2 && i <= 5 ? "text-right" : i === 1 ? "text-center" : "")} style={{ fontWeight: 700 }}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-[#F3EFE8]">
              {filteredPlatforms.map(plat => {
                const fee = Math.round(plat.monthlyVolume * plat.feeRate / 100) + plat.fixedFee;
                const catConf = PLATFORM_CAT_COLORS[plat.category];
                const CatIcon = catConf.icon;
                return (
                  <div key={plat.id} className={"px-5 py-3.5 grid items-center gap-3 transition-colors hover:bg-[#FBFAF7] " + (!plat.isActive ? "opacity-50" : "")}
                    style={{ gridTemplateColumns: "1fr 80px 90px 110px 130px 110px 100px" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: catConf.bg }}>
                        <CatIcon size={16} style={{ color: catConf.text }} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[15px] text-[#1F2937] truncate block" style={{ fontWeight: 700 }}>{plat.name}</span>
                        {plat.memo && <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{plat.memo}</p>}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ backgroundColor: catConf.bg, color: catConf.text, fontWeight: 700 }}>{plat.category}</span>
                    </div>
                    <span className={"text-[16px] text-right " + (plat.feeRate >= 8 ? "text-[#C62828]" : plat.feeRate >= 5 ? "text-[#8A6A2B]" : "text-[#2F4F46]")} style={{ fontWeight: 700 }}>
                      {plat.feeRate > 0 ? plat.feeRate + "%" : "무료"}
                    </span>
                    <span className="text-[13px] text-[#6B7280] text-right">{plat.settlementCycle}</span>
                    <span className="text-[14px] text-[#1F2937] text-right">{plat.monthlyVolume.toLocaleString()}원</span>
                    <span className={"text-[14px] text-right " + (fee > 0 ? "text-[#C62828]" : "text-[#1B5E20]")} style={{ fontWeight: 700 }}>
                      {fee > 0 ? "-" + fee.toLocaleString() + "원" : "0원"}
                    </span>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePlat(plat.id)}
                        className={"w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors " + (plat.isActive ? "text-[#1B5E20] hover:bg-[#ECF7EE]" : "text-[#9CA3AF] hover:bg-[#F7F3ED]")}>
                        {plat.isActive ? <Check size={13} /> : <X size={13} />}
                      </button>
                      <button onClick={() => openPlatForm(plat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => deletePlat(plat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-[13px] text-[#6B7280]">활성: <strong className="text-[#1F2937]">{platforms.filter(p => p.isActive).length}개</strong></span>
                <span className="text-[13px] text-[#6B7280]">가중평균: <strong className="text-[#2F4F46]">{platStats.weightedRate}%</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-[#6B7280]">월 총 거래액: <strong className="text-[#1F2937]">{fmtW(platStats.totalVolume)}만원</strong></span>
                <span className="text-[13px] text-[#C62828]" style={{ fontWeight: 700 }}>월 수수료: -{fmtW(platStats.totalFees)}만원</span>
              </div>
            </div>
          </div>

          {/* Platform fee comparison chart */}
          <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <h3 className="text-[15px] text-[#1F2937] mb-4" style={{ fontWeight: 700 }}>플랫폼 수수료 비교</h3>
            <div className="space-y-2.5">
              {platforms.filter(p => p.isActive && p.feeRate > 0).sort((a, b) => b.feeRate - a.feeRate).map(plat => (
                <div key={plat.id} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#6B7280] w-[100px] shrink-0 truncate">{plat.name}</span>
                  <div className="flex-1 h-[22px] bg-[#F3EFE8] rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: Math.min((plat.feeRate / 12) * 100, 100) + "%",
                        backgroundColor: plat.feeRate >= 8 ? "#C62828" : plat.feeRate >= 5 ? "#D4A843" : "#2F4F46",
                      }}
                    />
                  </div>
                  <span className={"text-[14px] w-[50px] shrink-0 text-right " + (plat.feeRate >= 8 ? "text-[#C62828]" : plat.feeRate >= 5 ? "text-[#8A6A2B]" : "text-[#2F4F46]")} style={{ fontWeight: 700 }}>
                    {plat.feeRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-start gap-2.5">
            <Info size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#9CA3AF] leading-relaxed">
              <p>플랫폼 수수료는 <strong className="text-[#6B7280]">매출/정산 페이지</strong>에서 채널별 정산 금액 자동 계산에 사용됩니다.</p>
              <p className="mt-1">수수료가 높은 플랫폼(8%+)은 판매가 조정을 고려하세요. <strong className="text-[#6B7280]">스마트 경영 센터</strong>에서 채널별 수익성 비교를 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* Taxes Tab */}
      {activeTab === "taxes" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {["전체", "부가세", "소득세", "지방세", "기타"].map(f => (
                <button key={f} onClick={() => setTaxCatFilter(f)}
                  className={"text-[12px] px-3 py-1.5 rounded-lg transition-all cursor-pointer " + (taxCatFilter === f ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]")}
                  style={{ fontWeight: taxCatFilter === f ? 700 : 400 }}>{f}</button>
              ))}
            </div>
            <button onClick={() => openTaxForm()} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
              <Plus size={16} /> 세금 항목 추가
            </button>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="divide-y divide-[#F3EFE8]">
              {filteredTaxes.map(tax => (
                <div key={tax.id} className={"px-5 py-4 transition-colors hover:bg-[#FBFAF7] " + (!tax.isApplied ? "opacity-50" : "")}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F3ED] flex items-center justify-center shrink-0">
                      <Landmark size={18} className="text-[#6B7280]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{tax.name}</span>
                        <span className={"text-[11px] px-2 py-0.5 rounded-md " + TAX_CAT_COLORS[tax.category]} style={{ fontWeight: 700 }}>{tax.category}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F7F3ED] text-[#9CA3AF]">{tax.type}</span>
                        {!tax.isApplied && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F3EFE8] text-[#9CA3AF]">미적용</span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#6B7280]">{tax.description}</p>
                      {tax.memo && <p className="text-[12px] text-[#9CA3AF] mt-1">{tax.memo}</p>}
                    </div>
                    <div className="text-right shrink-0 mr-2">
                      <span className="text-[22px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{tax.rate}%</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleTax(tax.id)}
                        className="w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer"
                        style={{ backgroundColor: tax.isApplied ? "#2F4F46" : "#D6D0C8" }}
                      >
                        <div className={"w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm " + (tax.isApplied ? "right-[2px]" : "left-[2px]")} />
                      </button>
                      <button onClick={() => openTaxForm(tax)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => deleteTax(tax.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income tax bracket table */}
          <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-[#9CA3AF]" />
              <h3 className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>2026년 종합소득세 세율 구간표</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#ECF7EE] text-[#1B5E20]" style={{ fontWeight: 700 }}>참고용</span>
            </div>
            <div className="bg-[#FBFAF7] rounded-xl overflow-hidden border border-[#E6E2DB]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F3ED]">
                    {["과세표준", "세율", "누진공제", "간편 계산"].map(h => (
                      <th key={h} className="text-[12px] text-[#9CA3AF] px-4 py-2.5 text-left" style={{ fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: "1,400만원 이하", rate: "6%", deduction: "-", formula: "과세표준 x 6%" },
                    { range: "1,400만~5,000만원", rate: "15%", deduction: "126만원", formula: "과세표준 x 15% - 126만" },
                    { range: "5,000만~8,800만원", rate: "24%", deduction: "576만원", formula: "과세표준 x 24% - 576만" },
                    { range: "8,800만~1.5억원", rate: "35%", deduction: "1,544만원", formula: "과세표준 x 35% - 1,544만" },
                    { range: "1.5억~3억원", rate: "38%", deduction: "1,994만원", formula: "과세표준 x 38% - 1,994만" },
                    { range: "3억~5억원", rate: "40%", deduction: "2,594만원", formula: "과세표준 x 40% - 2,594만" },
                    { range: "5억~10억원", rate: "42%", deduction: "3,594만원", formula: "과세표준 x 42% - 3,594만" },
                    { range: "10억원 초과", rate: "45%", deduction: "6,594만원", formula: "과세표준 x 45% - 6,594만" },
                  ].map((row, i) => (
                    <tr key={i} className={"border-t border-[#F3EFE8] " + (row.rate === "24%" ? "bg-[#FFF6E6]" : "")}>
                      <td className="text-[14px] text-[#1F2937] px-4 py-2.5">{row.range}</td>
                      <td className="text-[14px] text-[#2F4F46] px-4 py-2.5" style={{ fontWeight: 700 }}>{row.rate}</td>
                      <td className="text-[14px] text-[#6B7280] px-4 py-2.5">{row.deduction}</td>
                      <td className="text-[13px] text-[#9CA3AF] px-4 py-2.5">{row.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-3 flex items-center gap-1.5">
              <AlertTriangle size={11} /> 노란색 행은 현재 추정 적용 구간입니다. 실제 세금은 세무사와 상담하세요.
            </p>
          </div>

          <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-start gap-2.5">
            <Info size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
            <div className="text-[13px] text-[#9CA3AF] leading-relaxed">
              <p>세금 설정은 <strong className="text-[#6B7280]">매출/정산</strong>의 정산 계산과 <strong className="text-[#6B7280]">스마트 경영 센터</strong>의 세후 순이익 분석에 활용됩니다.</p>
              <p className="mt-1">정확한 세금 계산은 세무 전문가의 확인이 필요합니다. 여기서는 <strong className="text-[#6B7280]">예상 추정값</strong>으로 활용됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* Simulator */}
      <div className="bg-white rounded-[14px] border border-[#2F4F46] p-6 shadow-[0_2px_12px_rgba(47,79,70,0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-[#2F4F46]" />
          <h3 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>수수료/세금 시뮬레이터</h3>
          <span className="text-[12px] text-[#9CA3AF] ml-1">판매 금액을 입력하면 실제 정산액을 미리 계산합니다</span>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>판매 금액 (원)</label>
            <input
              type="number"
              value={simAmount || ""}
              onChange={e => setSimAmount(Number(e.target.value))}
              className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>결제 카드사</label>
            <div className="relative">
              <select value={simCardId} onChange={e => setSimCardId(Number(e.target.value))}
                className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                {cards.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.feeRate}%)</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>판매 채널</label>
            <div className="relative">
              <select value={simPlatId} onChange={e => setSimPlatId(Number(e.target.value))}
                className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                {platforms.filter(p => p.isActive).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.feeRate}%)</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center justify-center px-2 pb-1">
            <span className="text-[20px] text-[#9CA3AF]">=</span>
          </div>
          <div className="bg-[#F7F3ED] rounded-xl p-4">
            <p className="text-[12px] text-[#9CA3AF] mb-1">실 정산 예상액</p>
            <p className="text-[24px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{simResult.net.toLocaleString()}원</p>
          </div>
        </div>
        {/* Detail breakdown */}
        <div className="mt-4 pt-4 border-t border-[#E6E2DB] flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">판매 금액</span>
            <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{simAmount.toLocaleString()}원</span>
          </div>
          <span className="text-[#D6D0C8]">-</span>
          <div className="flex items-center gap-2">
            <CreditCard size={13} className="text-[#9CA3AF]" />
            <span className="text-[13px] text-[#6B7280]">카드 수수료 ({simResult.cardRate}%)</span>
            <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>-{simResult.cardFee.toLocaleString()}원</span>
          </div>
          <span className="text-[#D6D0C8]">-</span>
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-[#9CA3AF]" />
            <span className="text-[13px] text-[#6B7280]">플랫폼 ({simResult.platRate}%)</span>
            <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>-{simResult.platFee.toLocaleString()}원</span>
          </div>
          <span className="text-[#D6D0C8]">-</span>
          <div className="flex items-center gap-2">
            <Receipt size={13} className="text-[#9CA3AF]" />
            <span className="text-[13px] text-[#6B7280]">부가세</span>
            <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>-{simResult.vat.toLocaleString()}원</span>
          </div>
          <span className="text-[#D6D0C8]">=</span>
          <div className="flex items-center gap-2">
            <Wallet size={13} className="text-[#2F4F46]" />
            <span className="text-[13px] text-[#6B7280]">실 정산액</span>
            <span className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{simResult.net.toLocaleString()}원</span>
            <span className="text-[12px] text-[#9CA3AF]">({simAmount > 0 ? Math.round(simResult.net / simAmount * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Card Form Modal */}
      {showCardForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowCardForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[480px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#E6E2DB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F3ED] flex items-center justify-center"><CreditCard size={20} className="text-[#2F4F46]" /></div>
                  <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>{editingCardId ? "카드사 수수료 수정" : "새 카드사 추가"}</h2>
                </div>
                <button onClick={() => setShowCardForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer"><X size={20} /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>카드사명</label>
                <input value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} placeholder="예: KB국민카드"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>수수료율 (%)</label>
                  <input type="number" step="0.1" value={cardForm.feeRate || ""} onChange={e => setCardForm(f => ({ ...f, feeRate: Number(e.target.value) }))}
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>구분</label>
                  <div className="relative">
                    <select value={cardForm.type} onChange={e => setCardForm(f => ({ ...f, type: e.target.value as CardFee["type"] }))}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                      <option value="신용">신용</option>
                      <option value="체크">체크</option>
                      <option value="공통">공통</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
                <input value={cardForm.memo} onChange={e => setCardForm(f => ({ ...f, memo: e.target.value }))} placeholder="우대 수수료 적용 기간 등"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-end gap-3">
              <button onClick={() => setShowCardForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] cursor-pointer">취소</button>
              <button onClick={saveCard} disabled={!cardForm.name.trim()} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {editingCardId ? "수정 완료" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Form Modal */}
      {showPlatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowPlatForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[520px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#E6E2DB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECF7EE] flex items-center justify-center"><Globe size={20} className="text-[#1B5E20]" /></div>
                  <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>{editingPlatId ? "플랫폼 수수료 수정" : "새 플랫폼 추가"}</h2>
                </div>
                <button onClick={() => setShowPlatForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer"><X size={20} /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>플랫폼명</label>
                  <input value={platForm.name} onChange={e => setPlatForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 네이버 예약"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>채널 유형</label>
                  <div className="relative">
                    <select value={platForm.category} onChange={e => setPlatForm(f => ({ ...f, category: e.target.value as PlatformFee["category"] }))}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                      <option value="온라인">온라인</option>
                      <option value="오프라인">오프라인</option>
                      <option value="자체">자체</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>수수료율 (%)</label>
                  <input type="number" step="0.1" value={platForm.feeRate || ""} onChange={e => setPlatForm(f => ({ ...f, feeRate: Number(e.target.value) }))}
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>건당 고정 수수료 (원)</label>
                  <input type="number" value={platForm.fixedFee || ""} onChange={e => setPlatForm(f => ({ ...f, fixedFee: Number(e.target.value) }))} placeholder="0"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>정산 주기</label>
                <input value={platForm.settlementCycle} onChange={e => setPlatForm(f => ({ ...f, settlementCycle: e.target.value }))} placeholder="예: 주 1회 (목)"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
                <input value={platForm.memo} onChange={e => setPlatForm(f => ({ ...f, memo: e.target.value }))} placeholder="특이사항, 계약 조건 등"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-end gap-3">
              <button onClick={() => setShowPlatForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] cursor-pointer">취소</button>
              <button onClick={savePlat} disabled={!platForm.name.trim()} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {editingPlatId ? "수정 완료" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Form Modal */}
      {showTaxForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowTaxForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[520px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#E6E2DB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF6E6] flex items-center justify-center"><Receipt size={20} className="text-[#8A6A2B]" /></div>
                  <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>{editingTaxId ? "세금 항목 수정" : "새 세금 항목 추가"}</h2>
                </div>
                <button onClick={() => setShowTaxForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer"><X size={20} /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>세금 항목명</label>
                <input value={taxForm.name} onChange={e => setTaxForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 부가가치세"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>세율 (%)</label>
                  <input type="number" step="0.1" value={taxForm.rate || ""} onChange={e => setTaxForm(f => ({ ...f, rate: Number(e.target.value) }))}
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] focus:border-[#2F4F46] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>유형</label>
                  <div className="relative">
                    <select value={taxForm.type} onChange={e => setTaxForm(f => ({ ...f, type: e.target.value as TaxItem["type"] }))}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                      <option value="비율">비율</option>
                      <option value="고정">고정</option>
                      <option value="구간">구간</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>분류</label>
                  <div className="relative">
                    <select value={taxForm.category} onChange={e => setTaxForm(f => ({ ...f, category: e.target.value as TaxItem["category"] }))}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none">
                      <option value="부가세">부가세</option>
                      <option value="소득세">소득세</option>
                      <option value="지방세">지방세</option>
                      <option value="기타">기타</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>설명</label>
                <textarea value={taxForm.description} onChange={e => setTaxForm(f => ({ ...f, description: e.target.value }))} placeholder="세금 항목에 대한 설명" rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none resize-none leading-relaxed" />
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
                <input value={taxForm.memo} onChange={e => setTaxForm(f => ({ ...f, memo: e.target.value }))} placeholder="신고 시기, 주의사항 등"
                  className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-end gap-3">
              <button onClick={() => setShowTaxForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] cursor-pointer">취소</button>
              <button onClick={saveTax} disabled={!taxForm.name.trim()} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {editingTaxId ? "수정 완료" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
