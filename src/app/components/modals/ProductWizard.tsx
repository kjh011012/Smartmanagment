import { useState, useMemo } from "react";
import {
  X, Check, Plus, Trash2, Search, Star, ChevronDown, ChevronUp,
  HelpCircle, AlertTriangle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

/* ─── 타입 ─── */
interface ProductWizardProps {
  onClose: () => void;
}

interface CostItem {
  id: number;
  name: string;
  quantity: string;
  unitPrice: string;
  unit: string;
}

interface LibraryItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  category: string;
  vendor: string;
  favorite: boolean;
  lastPurchase: string;
}

/* ─── 재료 라이브러리 더미 ─── */
const LIBRARY_DATA: LibraryItem[] = [
  { id: 1, name: "감귤", unit: "킬로", price: 4000, category: "식자재", vendor: "한라산농산물마트", favorite: true, lastPurchase: "02.14" },
  { id: 2, name: "당근", unit: "킬로", price: 3000, category: "식자재", vendor: "한라산농산물마트", favorite: true, lastPurchase: "02.14" },
  { id: 3, name: "돼지고기 목살", unit: "킬로", price: 15000, category: "식자재", vendor: "○○마트", favorite: true, lastPurchase: "02.12" },
  { id: 4, name: "양파", unit: "킬로", price: 2000, category: "식자재", vendor: "한라산마트", favorite: false, lastPurchase: "02.10" },
  { id: 5, name: "고구마", unit: "킬로", price: 3500, category: "식자재", vendor: "농협마트", favorite: false, lastPurchase: "02.08" },
  { id: 6, name: "체험 장갑", unit: "개", price: 500, category: "체험 자재", vendor: "다이소", favorite: true, lastPurchase: "02.05" },
  { id: 7, name: "체험 키트(감귤잼)", unit: "세트", price: 3000, category: "체험 자재", vendor: "○○공방", favorite: false, lastPurchase: "01.28" },
  { id: 8, name: "포장 상자", unit: "개", price: 800, category: "소모품", vendor: "포장마트", favorite: false, lastPurchase: "02.01" },
  { id: 9, name: "세탁 세제", unit: "개", price: 12000, category: "청소/세탁", vendor: "이마트", favorite: false, lastPurchase: "01.25" },
  { id: 10, name: "어메니티 세트", unit: "세트", price: 2500, category: "소모품", vendor: "○○유통", favorite: false, lastPurchase: "02.03" },
  { id: 11, name: "숯", unit: "상자", price: 8000, category: "식자재", vendor: "농협마트", favorite: false, lastPurchase: "02.06" },
  { id: 12, name: "청소 용품", unit: "세트", price: 5000, category: "청소/세탁", vendor: "다이소", favorite: false, lastPurchase: "01.20" },
];

const LIBRARY_FILTERS = ["전체", "식자재", "체험 자재", "소모품", "청소/세탁", "기타"];

/* ─── 템플릿 ─── */
interface Template {
  id: string;
  label: string;
  desc: string;
  materials: { name: string; qty: string; unit: string; price: string }[];
  labor: string;
  gas: string;
  electric: string;
  water: string;
  supplies: { name: string; qty: string; unit: string; price: string }[];
}

const TEMPLATES: Template[] = [
  {
    id: "experience",
    label: "체험 기본",
    desc: "장갑/소모품/인건비 포함",
    materials: [
      { name: "체험 장갑", qty: "1", unit: "개", price: "500" },
      { name: "체험 키트(감귤잼)", qty: "1", unit: "세트", price: "3000" },
    ],
    labor: "5000",
    gas: "500", electric: "500", water: "200",
    supplies: [{ name: "포장 상자", qty: "1", unit: "개", price: "800" }],
  },
  {
    id: "food",
    label: "식사 기본",
    desc: "주재료/부재료/가스/인건비 포함",
    materials: [
      { name: "돼지고기 목살", qty: "0.3", unit: "킬로", price: "15000" },
      { name: "양파", qty: "0.2", unit: "킬로", price: "2000" },
      { name: "당근", qty: "0.1", unit: "킬로", price: "3000" },
      { name: "숯", qty: "0.1", unit: "상자", price: "8000" },
    ],
    labor: "7000",
    gas: "1500", electric: "500", water: "300",
    supplies: [],
  },
  {
    id: "stay",
    label: "숙박 기본",
    desc: "청소/세탁/어메니티/공과금 포함",
    materials: [],
    labor: "3000",
    gas: "3000", electric: "4000", water: "1500",
    supplies: [
      { name: "어메니티 세트", qty: "1", unit: "세트", price: "2500" },
      { name: "세탁 세제", qty: "0.1", unit: "개", price: "12000" },
      { name: "청소 용품", qty: "0.1", unit: "세트", price: "5000" },
    ],
  },
];

const STEP_LABELS = ["기본 정보", "판매 가격", "들어간 비용", "확인 및 저장"];
const PRICE_CHIPS = [20000, 25000, 30000, 50000, 80000, 120000];

/* ────────────────────────────────────── */
export function ProductWizard({ onClose }: ProductWizardProps) {
  const [step, setStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [showPriceSuggest, setShowPriceSuggest] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  /* 1단계 */
  const [productType, setProductType] = useState("");
  const [productName, setProductName] = useState("");
  const [unitType, setUnitType] = useState("1인 기준");

  /* 2단계 */
  const [sellPrice, setSellPrice] = useState("");

  /* 3단계 — 재료 */
  const [materials, setMaterials] = useState<CostItem[]>([]);
  const [supplies, setSupplies] = useState<CostItem[]>([]);
  const [laborMode, setLaborMode] = useState<"perItem" | "hourly">("perItem");
  const [laborCost, setLaborCost] = useState("");
  const [gasCost, setGasCost] = useState("");
  const [electricCost, setElectricCost] = useState("");
  const [waterCost, setWaterCost] = useState("");
  const [utilityAvgMode, setUtilityAvgMode] = useState(true);
  const [showUtilityAdv, setShowUtilityAdv] = useState(false);
  const [showReceiptHint, setShowReceiptHint] = useState(true);

  /* 3단계 — 라이브러리 */
  const [libSearch, setLibSearch] = useState("");
  const [libFilter, setLibFilter] = useState("전체");
  const [libraryData, setLibraryData] = useState(LIBRARY_DATA);

  /* 3단계 — 섹션 */
  const [sectionOpen, setSectionOpen] = useState({
    materials: true, labor: true, utility: true, supplies: true,
  });

  /* 4단계 */
  const [favProduct, setFavProduct] = useState(false);
  const [alertEmpty, setAlertEmpty] = useState(true);

  /* ─── 자동 단위 설정 ─── */
  const handleTypeSelect = (type: string) => {
    setProductType(type);
    if (type === "stay") setUnitType("1박 기준");
    else setUnitType("1인 기준");
  };

  /* ─── 템플릿 적용 ─── */
  const applyTemplate = (tmpl: Template) => {
    setMaterials(tmpl.materials.map((m, i) => ({
      id: Date.now() + i, name: m.name, quantity: m.qty, unitPrice: m.price, unit: m.unit,
    })));
    setSupplies(tmpl.supplies.map((s, i) => ({
      id: Date.now() + 100 + i, name: s.name, quantity: s.qty, unitPrice: s.price, unit: s.unit,
    })));
    setLaborCost(tmpl.labor);
    setGasCost(tmpl.gas);
    setElectricCost(tmpl.electric);
    setWaterCost(tmpl.water);
  };

  /* ─── 재료 조작 ─── */
  const addMaterialFromLib = (item: LibraryItem) => {
    if (materials.some(m => m.name === item.name)) return;
    setMaterials(prev => [...prev, {
      id: Date.now(), name: item.name, quantity: "1", unitPrice: String(item.price), unit: item.unit,
    }]);
  };

  const addBlankMaterial = () => {
    setMaterials(prev => [...prev, { id: Date.now(), name: "", quantity: "1", unitPrice: "", unit: "개" }]);
  };

  const updateMaterial = (id: number, field: keyof CostItem, value: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMaterial = (id: number) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addBlankSupply = () => {
    setSupplies(prev => [...prev, { id: Date.now(), name: "", quantity: "1", unitPrice: "", unit: "개" }]);
  };

  const updateSupply = (id: number, field: keyof CostItem, value: string) => {
    setSupplies(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSupply = (id: number) => {
    setSupplies(prev => prev.filter(s => s.id !== id));
  };

  /* ─── 계산 ─── */
  const calcTotal = (items: CostItem[]) =>
    items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);

  const materialsCost = calcTotal(materials);
  const suppliesCost = calcTotal(supplies);
  const laborNum = parseFloat(laborCost) || 0;
  const gasNum = parseFloat(gasCost) || 0;
  const elecNum = parseFloat(electricCost) || 0;
  const waterNum = parseFloat(waterCost) || 0;
  const utilityCost = gasNum + elecNum + waterNum;
  const totalCost = materialsCost + laborNum + utilityCost + suppliesCost;
  const sellNum = parseFloat(sellPrice) || 0;
  const remaining = sellNum - totalCost;
  const marginRate = sellNum > 0 ? Math.round((remaining / sellNum) * 100) : 0;

  /* ─── 라이브러리 필터 ─── */
  const filteredLib = useMemo(() => {
    return libraryData.filter(item => {
      if (libSearch && !item.name.includes(libSearch)) return false;
      if (libFilter !== "전체" && item.category !== libFilter) return false;
      return true;
    });
  }, [libraryData, libSearch, libFilter]);

  const favoriteLib = filteredLib.filter(i => i.favorite);
  const normalLib = filteredLib.filter(i => !i.favorite);

  const toggleFavorite = (id: number) => {
    setLibraryData(prev => prev.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i));
  };

  /* ─── 저장 ─── */
  const handleSave = () => {
    toast.success("저장되었습니다", {
      style: { background: "#ECF7EE", color: "#1B5E20", border: "1px solid #C8E6C9", fontFamily: "'Noto Serif KR', serif" },
    });
    setSavedSuccess(true);
  };

  /* ─── 진행 바 ─── */
  const renderStepBar = () => (
    <div className="flex items-center gap-0 mt-4">
      {STEP_LABELS.map((label, i) => {
        const sNum = i + 1;
        const isActive = sNum === step;
        const isDone = sNum < step;
        return (
          <div key={sNum} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0 transition-colors ${
                isDone || isActive ? "bg-[#2F4F46] text-white" : "bg-[#E6E2DB] text-[#9CA3AF]"
              }`}>
                {isDone ? <Check size={14} /> : sNum}
              </div>
              <span className={`text-[13px] whitespace-nowrap ${
                isActive ? "text-[#2F4F46]" : isDone ? "text-[#2F4F46]" : "text-[#9CA3AF]"
              }`} style={{ fontWeight: isActive ? 700 : 400 }}>
                {label}
              </span>
            </div>
            {i < 3 && <div className={`flex-1 h-[1px] mx-2 ${isDone ? "bg-[#2F4F46]" : "bg-[#E6E2DB]"}`} />}
          </div>
        );
      })}
    </div>
  );

  /* ─── 새 재료 등록 미니 모달 ─── */
  const renderNewMaterialModal = () => {
    if (!showNewMaterial) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.25)" }} onClick={() => setShowNewMaterial(false)}>
        <div className="bg-white rounded-[16px] border border-[#E6E2DB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] w-[440px]" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-[#E6E2DB] flex items-center justify-between">
            <p className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>새 재료 등록</p>
            <button onClick={() => setShowNewMaterial(false)} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"><X size={18} /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-[14px] text-[#6B7280] mb-1.5 block">재료명</label>
              <input className="w-full h-[44px] px-4 rounded-xl border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white" placeholder="예: 감귤" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[14px] text-[#6B7280] mb-1.5 block">단위</label>
                <select className="w-full h-[44px] px-3 rounded-xl border border-[#D6D0C8] text-[14px] bg-white cursor-pointer">
                  <option>개</option><option>킬로</option><option>상자</option><option>세트</option><option>리터</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[14px] text-[#6B7280] mb-1.5 block">대표 단가 (원)</label>
                <input className="w-full h-[44px] px-4 rounded-xl border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="text-[14px] text-[#6B7280] mb-1.5 block">거래처 (선택)</label>
              <input className="w-full h-[44px] px-4 rounded-xl border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white" placeholder="예: ○○마트" />
            </div>
            <div>
              <label className="text-[14px] text-[#6B7280] mb-2 block">재고로 관리할까요?</label>
              <div className="flex gap-3">
                <label className="flex-1 h-[44px] rounded-xl border border-[#E6E2DB] flex items-center justify-center gap-2 cursor-pointer text-[14px] text-[#6B7280] hover:bg-[#F7F3ED] transition-all">
                  <input type="radio" name="inv" className="sr-only" defaultChecked /> 예
                </label>
                <label className="flex-1 h-[44px] rounded-xl border border-[#E6E2DB] flex items-center justify-center gap-2 cursor-pointer text-[14px] text-[#6B7280] hover:bg-[#F7F3ED] transition-all">
                  <input type="radio" name="inv" className="sr-only" /> 아니오
                </label>
              </div>
            </div>
            <div>
              <label className="text-[14px] text-[#6B7280] mb-1.5 block">부족 알림 기준</label>
              <input className="w-full h-[44px] px-4 rounded-xl border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white" placeholder="예: 5" defaultValue="5" />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#E6E2DB] flex justify-end">
            <button onClick={() => setShowNewMaterial(false)} className="h-[44px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">저장하기</button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── 가격 제안 팝업 ─── */
  const renderPriceSuggest = () => {
    if (!showPriceSuggest) return null;
    const suggestedPrice = totalCost > 0 ? Math.ceil(totalCost / 0.6 / 1000) * 1000 : 0;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.2)" }} onClick={() => setShowPriceSuggest(false)}>
        <div className="bg-white rounded-[16px] border border-[#E6E2DB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] w-[360px] p-6 text-center" onClick={e => e.stopPropagation()}>
          <p className="text-[16px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>권장 판매가</p>
          <p className="text-[14px] text-[#6B7280] mb-4">남는 비율 40% 기준</p>
          <p className="text-[28px] text-[#2F4F46] mb-4" style={{ fontWeight: 700 }}>{suggestedPrice.toLocaleString()}원</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSellPrice(String(suggestedPrice)); setShowPriceSuggest(false); }} className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">이 가격으로 적용</button>
            <button onClick={() => setShowPriceSuggest(false)} className="h-[44px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">닫기</button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════ */
  /* 1단계 */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <p className="text-[16px] text-[#1F2937] mb-4" style={{ fontWeight: 700 }}>상품 종류를 선택해 주세요</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "experience", label: "체험", desc: "인원수 기준이 많아요" },
            { id: "food", label: "식사", desc: "재료비가 중요해요" },
            { id: "stay", label: "숙박", desc: "청소/세탁이 들어가요" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTypeSelect(t.id)}
              className={`flex flex-col items-center gap-2 py-7 rounded-xl border-[1.5px] transition-all cursor-pointer ${
                productType === t.id
                  ? "border-[#2F4F46] bg-[#F7F3ED]"
                  : "border-[#E6E2DB] hover:bg-[#FBFAF7]"
              }`}
            >
              <span className={`text-[18px] ${productType === t.id ? "text-[#2F4F46]" : "text-[#1F2937]"}`} style={{ fontWeight: 700 }}>{t.label}</span>
              <span className="text-[13px] text-[#6B7280]">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[14px] text-[#6B7280] mb-2">상품명</label>
        <input
          value={productName}
          onChange={e => setProductName(e.target.value)}
          placeholder="예: 감귤 따기 체험"
          className="w-full h-[52px] px-5 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white"
        />
      </div>

      <div>
        <label className="block text-[14px] text-[#6B7280] mb-2">기준 단위</label>
        <div className="flex gap-3">
          {["1인 기준", "1팀 기준", "1박 기준"].map(u => (
            <button
              key={u}
              onClick={() => setUnitType(u)}
              className={`flex-1 h-[48px] rounded-xl border text-[14px] transition-all cursor-pointer ${
                unitType === u
                  ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]"
                  : "border-[#E6E2DB] text-[#6B7280] hover:bg-[#FBFAF7]"
              }`}
              style={{ fontWeight: unitType === u ? 700 : 400 }}
            >
              {u}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-[#9CA3AF] mt-2">체험/식사는 1인 기준, 숙박은 1박 기준을 추천합니다.</p>
      </div>
    </div>
  );

  /* 2단계 */
  const renderStep2 = () => (
    <div className="max-w-[560px] mx-auto space-y-6">
      <div>
        <label className="block text-[14px] text-[#6B7280] mb-2">판매가 (원)</label>
        <div className="relative">
          <input
            value={sellPrice}
            onChange={e => setSellPrice(e.target.value)}
            placeholder="0"
            className="w-full h-[56px] px-5 rounded-xl border-[1.5px] border-[#D6D0C8] text-[22px] focus:border-[#2F4F46] focus:outline-none bg-white"
            style={{ fontWeight: 700 }}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[16px] text-[#9CA3AF]">원</span>
        </div>
      </div>

      <div>
        <p className="text-[13px] text-[#6B7280] mb-2">자주 쓰는 가격</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_CHIPS.map(p => (
            <button
              key={p}
              onClick={() => setSellPrice(String(p))}
              className={`h-[40px] px-4 rounded-xl border text-[14px] transition-all cursor-pointer ${
                sellPrice === String(p)
                  ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]"
                  : "border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
              }`}
            >
              {p.toLocaleString()}원
            </button>
          ))}
        </div>
      </div>

      <p className="text-[13px] text-[#9CA3AF]">판매가는 나중에 언제든지 바꿀 수 있어요.</p>
    </div>
  );

  /* ─── 3단계 섹션 토글 ─── */
  const SectionHeader = ({ sKey, title, total }: { sKey: keyof typeof sectionOpen; title: string; total?: number }) => (
    <button
      onClick={() => setSectionOpen(prev => ({ ...prev, [sKey]: !prev[sKey] }))}
      className="w-full flex items-center justify-between py-3 cursor-pointer group"
    >
      <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{title}</span>
      <div className="flex items-center gap-3">
        {total !== undefined && <span className="text-[13px] text-[#9CA3AF]">{total.toLocaleString()}원</span>}
        {sectionOpen[sKey] ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
      </div>
    </button>
  );

  /* 3단계 */
  const renderStep3 = () => (
    <div className="space-y-4">
      {/* 상단 템플릿 바 */}
      <div className="bg-[#FBFAF7] rounded-xl p-4 border border-[#E6E2DB]">
        <p className="text-[14px] text-[#1F2937] mb-3" style={{ fontWeight: 700 }}>빠른 시작 (추천)</p>
        <div className="flex gap-3">
          {TEMPLATES.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => applyTemplate(tmpl)}
              className="flex-1 py-3 px-4 rounded-xl border border-[#E6E2DB] bg-white hover:bg-[#F7F3ED] transition-all cursor-pointer text-left"
            >
              <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{tmpl.label}</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">{tmpl.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-[#9CA3AF] mt-2">템플릿을 선택하면 기본 항목이 자동으로 채워집니다.</p>
      </div>

      {/* 3영역: 라이브러리 + 비용 구성 */}
      <div className="flex gap-5">
        {/* 좌측 재료 라이브러리 (38%) */}
        <div className="w-[36%] shrink-0">
          <div className="bg-white rounded-xl border border-[#E6E2DB] overflow-hidden" style={{ maxHeight: "520px" }}>
            <div className="px-4 pt-4 pb-3">
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={libSearch}
                  onChange={e => setLibSearch(e.target.value)}
                  placeholder="재료 이름 검색"
                  className="w-full h-[38px] pl-9 pr-3 rounded-lg border border-[#D6D0C8] text-[13px] focus:border-[#2F4F46] focus:outline-none bg-white"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {LIBRARY_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setLibFilter(f)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      libFilter === f
                        ? "bg-[#2F4F46] text-white"
                        : "bg-[#F7F3ED] text-[#6B7280] hover:bg-[#E6E2DB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 pb-3 overflow-y-auto" style={{ maxHeight: "380px" }}>
              {/* 자주 쓰는 재료 */}
              {favoriteLib.length > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] text-[#9CA3AF] mb-1.5" style={{ fontWeight: 700 }}>자주 쓰는 재료</p>
                  <div className="space-y-1.5">
                    {favoriteLib.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 px-2.5 bg-[#FBFAF7] rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => toggleFavorite(item.id)} className="cursor-pointer shrink-0">
                              <Star size={12} className="text-[#8A6A2B] fill-[#8A6A2B]" />
                            </button>
                            <span className="text-[13px] text-[#1F2937] truncate" style={{ fontWeight: 700 }}>{item.name}</span>
                          </div>
                          <p className="text-[11px] text-[#9CA3AF] ml-[18px]">{item.price.toLocaleString()}원/{item.unit}</p>
                        </div>
                        <button
                          onClick={() => addMaterialFromLib(item)}
                          className="text-[11px] text-[#2F4F46] bg-[#ECF7EE] px-2.5 py-1 rounded-lg hover:bg-[#D4ECD7] cursor-pointer transition-colors shrink-0"
                        >
                          추가
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 전체 */}
              <div className="space-y-1.5">
                {normalLib.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-[#FBFAF7] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleFavorite(item.id)} className="cursor-pointer shrink-0">
                          <Star size={12} className="text-[#D6D0C8]" />
                        </button>
                        <span className="text-[13px] text-[#1F2937] truncate">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] ml-[18px]">{item.price.toLocaleString()}원/{item.unit} · {item.vendor}</p>
                    </div>
                    <button
                      onClick={() => addMaterialFromLib(item)}
                      className="text-[11px] text-[#2F4F46] bg-[#ECF7EE] px-2.5 py-1 rounded-lg hover:bg-[#D4ECD7] cursor-pointer transition-colors shrink-0"
                    >
                      추가
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#E6E2DB]">
              <button
                onClick={() => setShowNewMaterial(true)}
                className="w-full h-[36px] rounded-lg border border-[#D6D0C8] text-[13px] text-[#6B7280] hover:bg-[#F7F3ED] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> 새 재료 등록
              </button>
            </div>
          </div>
        </div>

        {/* 우측 비용 구성 (62%) */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "520px" }}>
          {/* 단가 자동 추천 배너 */}
          {showReceiptHint && materials.some(m => m.name === "감귤") && (
            <div className="bg-[#ECF7EE] rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-[13px] text-[#1B5E20]">
                최근 영수증에서 '감귤' 단가가 확인되었습니다. 적용할까요?
              </p>
              <div className="flex gap-2 shrink-0 ml-3">
                <button
                  onClick={() => {
                    setMaterials(prev => prev.map(m => m.name === "감귤" ? { ...m, unitPrice: "4000" } : m));
                    setShowReceiptHint(false);
                  }}
                  className="text-[12px] text-[#1B5E20] bg-white px-3 py-1 rounded-lg hover:bg-[#D4ECD7] cursor-pointer transition-colors border border-[#C8E6C9]"
                >
                  적용
                </button>
                <button onClick={() => setShowReceiptHint(false)} className="text-[12px] text-[#6B7280] cursor-pointer hover:underline">닫기</button>
              </div>
            </div>
          )}

          {/* ① 재료/자재 */}
          <div className="border border-[#E6E2DB] rounded-xl overflow-hidden">
            <div className="px-4 border-b border-[#E6E2DB]">
              <SectionHeader sKey="materials" title="재료 / 자재" total={materialsCost} />
            </div>
            {sectionOpen.materials && (
              <div className="p-4">
                {materials.length > 0 ? (
                  <div className="space-y-2">
                    {/* 헤더 */}
                    <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] px-1">
                      <span className="flex-[2.5]">재료명</span>
                      <span className="flex-1 text-center">수량</span>
                      <span className="flex-1 text-center">단가</span>
                      <span className="flex-1 text-right">합계</span>
                      <span className="w-7"></span>
                    </div>
                    {materials.map(m => {
                      const lineTotal = (parseFloat(m.quantity) || 0) * (parseFloat(m.unitPrice) || 0);
                      return (
                        <div key={m.id} className="flex items-center gap-2">
                          <input value={m.name} onChange={e => updateMaterial(m.id, "name", e.target.value)} placeholder="품목명" className="flex-[2.5] h-[38px] px-2.5 rounded-lg border border-[#D6D0C8] text-[13px] focus:border-[#2F4F46] focus:outline-none bg-white" />
                          <input value={m.quantity} onChange={e => updateMaterial(m.id, "quantity", e.target.value)} placeholder="0" className="flex-1 h-[38px] px-2.5 rounded-lg border border-[#D6D0C8] text-[13px] text-center focus:border-[#2F4F46] focus:outline-none bg-white" />
                          <input value={m.unitPrice} onChange={e => updateMaterial(m.id, "unitPrice", e.target.value)} placeholder="0" className="flex-1 h-[38px] px-2.5 rounded-lg border border-[#D6D0C8] text-[13px] text-center focus:border-[#2F4F46] focus:outline-none bg-white" />
                          <span className="flex-1 text-[13px] text-[#1F2937] text-right" style={{ fontWeight: 700 }}>{lineTotal.toLocaleString()}</span>
                          <button onClick={() => removeMaterial(m.id)} className="w-7 flex items-center justify-center text-[#D6D0C8] hover:text-[#C62828] cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9CA3AF] text-center py-4">왼쪽 라이브러리에서 재료를 추가하거나 직접 입력하세요.</p>
                )}
                <button onClick={addBlankMaterial} className="mt-3 text-[13px] text-[#2F4F46] flex items-center gap-1 cursor-pointer hover:underline">
                  <Plus size={13} /> 재료 직접 추가
                </button>
              </div>
            )}
          </div>

          {/* ② 인건비 */}
          <div className="border border-[#E6E2DB] rounded-xl overflow-hidden">
            <div className="px-4 border-b border-[#E6E2DB]">
              <SectionHeader sKey="labor" title="인건비" total={laborNum} />
            </div>
            {sectionOpen.labor && (
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  <label className={`flex-1 h-[42px] rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-[13px] transition-all ${
                    laborMode === "perItem" ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]" : "border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
                  }`}>
                    <input type="radio" name="laborMode" checked={laborMode === "perItem"} onChange={() => setLaborMode("perItem")} className="sr-only" />
                    1건당 인건비 (추천)
                  </label>
                  <label className={`flex-1 h-[42px] rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-[13px] transition-all ${
                    laborMode === "hourly" ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]" : "border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
                  }`}>
                    <input type="radio" name="laborMode" checked={laborMode === "hourly"} onChange={() => setLaborMode("hourly")} className="sr-only" />
                    시간 기준 (고급)
                  </label>
                </div>
                <div className="relative">
                  <input
                    value={laborCost}
                    onChange={e => setLaborCost(e.target.value)}
                    placeholder="0"
                    className="w-full h-[44px] px-4 rounded-xl border border-[#D6D0C8] text-[15px] focus:border-[#2F4F46] focus:outline-none bg-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#9CA3AF]">원</span>
                </div>
                <p className="text-[12px] text-[#9CA3AF]">잘 모르겠으면 3,000~7,000원 사이로 시작해도 좋아요.</p>
              </div>
            )}
          </div>

          {/* ③ 공과금 */}
          <div className="border border-[#E6E2DB] rounded-xl overflow-hidden">
            <div className="px-4 border-b border-[#E6E2DB]">
              <SectionHeader sKey="utility" title="공과금 (가스/전기/수도)" total={utilityCost} />
            </div>
            {sectionOpen.utility && (
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={utilityAvgMode} onChange={e => setUtilityAvgMode(e.target.checked)} className="w-4 h-4 rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer" />
                  <span className="text-[13px] text-[#1F2937]">평균으로 넣기 (추천)</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { label: "가스", val: gasCost, set: setGasCost },
                    { label: "전기", val: electricCost, set: setElectricCost },
                    { label: "수도", val: waterCost, set: setWaterCost },
                  ].map(u => (
                    <div key={u.label} className="flex-1">
                      <label className="text-[12px] text-[#6B7280] mb-1 block">{u.label} (원)</label>
                      <input
                        value={u.val}
                        onChange={e => u.set(e.target.value)}
                        placeholder="0"
                        className="w-full h-[40px] px-3 rounded-lg border border-[#D6D0C8] text-[14px] text-center focus:border-[#2F4F46] focus:outline-none bg-white"
                      />
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowUtilityAdv(!showUtilityAdv)} className="text-[12px] text-[#2F4F46] cursor-pointer hover:underline">
                  {showUtilityAdv ? "자동 나누기 닫기" : "자동 나누기 (고급)"}
                </button>
                {showUtilityAdv && (
                  <div className="bg-[#FBFAF7] rounded-lg p-3 space-y-2">
                    <p className="text-[12px] text-[#6B7280]">나누기 기준:</p>
                    <div className="flex gap-2">
                      {["예약 건수 기준", "인원수 기준", "1박 기준"].map(opt => (
                        <button key={opt} className="text-[11px] px-3 py-1.5 rounded-lg border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors">{opt}</button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#9CA3AF]">자동 나누기는 나중에 설정에서 바꿀 수 있어요.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ④ 소모품/기타 */}
          <div className="border border-[#E6E2DB] rounded-xl overflow-hidden">
            <div className="px-4 border-b border-[#E6E2DB]">
              <SectionHeader sKey="supplies" title="소모품 / 기타" total={suppliesCost} />
            </div>
            {sectionOpen.supplies && (
              <div className="p-4">
                {supplies.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] px-1">
                      <span className="flex-[2.5]">품목명</span>
                      <span className="flex-1 text-center">수량</span>
                      <span className="flex-1 text-center">단가</span>
                      <span className="flex-1 text-right">합계</span>
                      <span className="w-7"></span>
                    </div>
                    {supplies.map(s => {
                      const lineTotal = (parseFloat(s.quantity) || 0) * (parseFloat(s.unitPrice) || 0);
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <input value={s.name} onChange={e => updateSupply(s.id, "name", e.target.value)} placeholder="품목명" className="flex-[2.5] h-[38px] px-2.5 rounded-lg border border-[#D6D0C8] text-[13px] focus:border-[#2F4F46] focus:outline-none bg-white" />
                          <input value={s.quantity} onChange={e => updateSupply(s.id, "quantity", e.target.value)} placeholder="0" className="flex-1 h-[38px] px-2.5 rounded-lg border border-[#D6D0C8] text-[13px] text-center focus:border-[#2F4F46] focus:outline-none bg-white" />
                          <input value={s.unitPrice} onChange={e => updateSupply(s.id, "unitPrice", e.target.value)} placeholder="0" className="flex-1 h-[38px] px-2.5 rounded-lg border border-[#D6D0C8] text-[13px] text-center focus:border-[#2F4F46] focus:outline-none bg-white" />
                          <span className="flex-1 text-[13px] text-[#1F2937] text-right" style={{ fontWeight: 700 }}>{lineTotal.toLocaleString()}</span>
                          <button onClick={() => removeSupply(s.id)} className="w-7 flex items-center justify-center text-[#D6D0C8] hover:text-[#C62828] cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9CA3AF] text-center py-3">항목이 없습니다.</p>
                )}
                <button onClick={addBlankSupply} className="mt-3 text-[13px] text-[#2F4F46] flex items-center gap-1 cursor-pointer hover:underline">
                  <Plus size={13} /> 소모품 추가
                </button>
              </div>
            )}
          </div>

          {/* 실시간 계산 카드 */}
          <div className="bg-[#F7F3ED] rounded-xl p-5 border border-[#E6E2DB] sticky bottom-0">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[14px] text-[#6B7280]">판매가</span>
                <span className="text-[14px] text-[#1F2937]">{sellNum.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#6B7280]">들어간 비용</span>
                <span className="text-[14px] text-[#1F2937]">{totalCost.toLocaleString()}원</span>
              </div>
              <div className="border-t border-[#E6E2DB] pt-2 flex justify-between">
                <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>남는 금액</span>
                <span className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{remaining.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#6B7280]">남는 비율</span>
                <span className={`text-[14px] ${marginRate >= 40 ? "text-[#1B5E20]" : marginRate >= 20 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{marginRate}%</span>
              </div>
            </div>

            {sellNum > 0 && marginRate < 25 && (
              <div className="mt-3 bg-[#FFF6E6] rounded-lg px-3 py-2.5 flex items-center justify-between">
                <p className="text-[12px] text-[#8A6A2B]">남는 비율이 낮습니다. 가격 또는 비용을 확인해 주세요.</p>
                <button onClick={() => setShowPriceSuggest(true)} className="text-[11px] text-[#2F4F46] bg-white px-2.5 py-1 rounded-lg border border-[#E6E2DB] hover:bg-[#F7F3ED] cursor-pointer transition-colors shrink-0 ml-2">가격 제안 보기</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* 4단계 */
  const renderStep4 = () => {
    if (savedSuccess) {
      return (
        <div className="max-w-[520px] mx-auto text-center py-8">
          <CheckCircle size={48} className="text-[#1B5E20] mx-auto mb-4" />
          <p className="text-[18px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>저장이 완료되었습니다</p>
          <p className="text-[14px] text-[#6B7280] mb-6">'{productName}'의 비용 설정이 저장되었습니다.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="h-[48px] px-6 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">상품 목록으로</button>
            <button onClick={() => { setStep(1); setProductType(""); setProductName(""); setSellPrice(""); setMaterials([]); setSupplies([]); setLaborCost(""); setGasCost(""); setElectricCost(""); setWaterCost(""); setSavedSuccess(false); }} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">같은 방식으로 다른 상품 추가</button>
          </div>
        </div>
      );
    }

    const hasLabor = laborNum > 0;
    const hasUtility = utilityCost > 0;
    const itemsSummary = [
      materials.length > 0 ? `재료 ${materials.length}개` : null,
      hasLabor ? "인건비" : null,
      hasUtility ? "공과금" : null,
      supplies.length > 0 ? `소모품 ${supplies.length}개` : null,
    ].filter(Boolean).join(", ");

    return (
      <div className="max-w-[560px] mx-auto py-2 space-y-5">
        {/* 요약 카드 1 */}
        <div className="bg-white rounded-xl border border-[#E6E2DB] overflow-hidden">
          <div className="px-6 py-4 bg-[#FBFAF7] border-b border-[#E6E2DB]">
            <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>이 상품은 이렇게 계산됩니다</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#6B7280]">판매가</span>
              <span className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{sellNum.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#6B7280]">들어간 비용</span>
              <span className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{totalCost.toLocaleString()}원</span>
            </div>
            <div className="border-t border-[#F3EFE8] pt-3 flex justify-between items-center">
              <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>남는 금액</span>
              <span className="text-[20px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{remaining.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#6B7280]">남는 비율</span>
              <span className={`text-[16px] ${marginRate >= 40 ? "text-[#1B5E20]" : marginRate >= 20 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{marginRate}%</span>
            </div>
          </div>
        </div>

        {/* 요약 카드 2 */}
        <div className="bg-white rounded-xl border border-[#E6E2DB] overflow-hidden">
          <div className="px-6 py-4 bg-[#FBFAF7] border-b border-[#E6E2DB]">
            <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>포함된 항목</p>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[14px] text-[#6B7280]">상품명</span>
                <span className="text-[14px] text-[#1F2937]">{productName || "미입력"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#6B7280]">종류 / 기준</span>
                <span className="text-[14px] text-[#1F2937]">{productType === "experience" ? "체험" : productType === "food" ? "식사" : productType === "stay" ? "숙박" : "미선택"} · {unitType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#6B7280]">구성 항목</span>
                <span className="text-[14px] text-[#1F2937]">{itemsSummary || "없음"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 체크박스 */}
        <div className="space-y-3 px-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={favProduct} onChange={e => setFavProduct(e.target.checked)} className="w-[18px] h-[18px] rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer" />
            <span className="text-[14px] text-[#1F2937]">이 상품을 즐겨찾기 (자주 쓰는 상품)로 등록</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={alertEmpty} onChange={e => setAlertEmpty(e.target.checked)} className="w-[18px] h-[18px] rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer" />
            <span className="text-[14px] text-[#1F2937]">비용이 비어 있는 항목이 있으면 알려주기</span>
          </label>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(60, 55, 45, 0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] border border-[#E6E2DB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col"
        style={{ width: "1040px", maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-8 pt-6 pb-4 border-b border-[#E6E2DB] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>새 상품 등록</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="h-8 px-3 rounded-lg border border-[#E6E2DB] text-[13px] text-[#6B7280] flex items-center gap-1.5 hover:bg-[#F7F3ED] cursor-pointer transition-colors"
                >
                  <HelpCircle size={14} /> 쉬운 설명
                </button>
                {showHelp && (
                  <div className="absolute right-0 top-10 w-[280px] bg-white border border-[#E6E2DB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-4 z-10">
                    <p className="text-[13px] text-[#1F2937] leading-[1.6]">
                      여기서 설정한 '들어간 비용'은 매출이 생길 때 자동으로 계산됩니다.
                    </p>
                    <button onClick={() => setShowHelp(false)} className="text-[12px] text-[#9CA3AF] mt-2 cursor-pointer hover:underline">닫기</button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#6B7280] cursor-pointer transition-colors" aria-label="닫기">
                <X size={20} />
              </button>
            </div>
          </div>
          {renderStepBar()}
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* 풋터 */}
        {!savedSuccess && (
          <div className="px-8 py-4 border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="h-[48px] px-7 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[16px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">이전</button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="h-[48px] px-8 rounded-xl bg-[#2F4F46] text-white text-[16px] hover:bg-[#243f38] transition-colors cursor-pointer">다음</button>
            ) : (
              <button onClick={handleSave} className="h-[48px] px-10 rounded-xl bg-[#2F4F46] text-white text-[16px] hover:bg-[#243f38] transition-colors cursor-pointer">저장하기</button>
            )}
          </div>
        )}
      </div>

      {renderNewMaterialModal()}
      {renderPriceSuggest()}
    </div>
  );
}