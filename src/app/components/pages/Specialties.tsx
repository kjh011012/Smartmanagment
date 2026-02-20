import { useState, useMemo } from "react";
import {
  Package, ShoppingBag, Gift, Plus, Edit2, Trash2,
  ChevronDown, Search, TrendingUp, AlertTriangle,
  Info, X, BarChart3, Layers,
  Leaf, Cookie, Palette, MoreHorizontal
} from "lucide-react";

/* ═══ 타입 ═══ */
type SpecialtyCategory = "농산물" | "가공식품" | "수공예품" | "기타";

interface SpecialtyCostItem {
  name: string;
  amount: number;
}

interface SpecialtyProduct {
  id: number;
  name: string;
  category: SpecialtyCategory;
  description: string;
  sellingPrice: number;
  costItems: SpecialtyCostItem[];
  unit: string;
  stock: number;
  minStock: number;
  supplier: string;
  origin: string;
  season: string;
  weight: string;
  packaging: string;
  isActive: boolean;
  lastUpdated: string;
  memo: string;
  monthlySales: number;
}

/* ═══ 더미 데이터 ═══ */
const INITIAL_PRODUCTS: SpecialtyProduct[] = [
  {
    id: 1, name: "감귤 선물세트 (5kg)", category: "농산물",
    description: "제주 직영 감귤밭에서 수확한 프리미엄 감귤. 선물용 박스 포장.",
    sellingPrice: 35000,
    costItems: [
      { name: "감귤 (5kg)", amount: 12000 },
      { name: "선물 박스", amount: 3500 },
      { name: "완충재·포장", amount: 1200 },
      { name: "택배비", amount: 4000 },
    ],
    unit: "박스", stock: 45, minStock: 10, supplier: "자체 농장",
    origin: "제주 서귀포시", season: "10월~2월", weight: "5kg",
    packaging: "고급 선물 박스", isActive: true, lastUpdated: "2026.02.18",
    memo: "성수기(추석·설) 한 달 전 사전 주문 접수 시작. 3박스 이상 주문 시 택배비 무료.",
    monthlySales: 32,
  },
  {
    id: 2, name: "한라봉 선물세트 (3kg)", category: "농산물",
    description: "당도 높은 제주 한라봉. 개별 쿠션 포장으로 안전 배송.",
    sellingPrice: 45000,
    costItems: [
      { name: "한라봉 (3kg)", amount: 18000 },
      { name: "선물 박스", amount: 4000 },
      { name: "개별 쿠션 포장", amount: 2000 },
      { name: "택배비", amount: 4000 },
    ],
    unit: "박스", stock: 28, minStock: 8, supplier: "자체 농장",
    origin: "제주 서귀포시", season: "1월~3월", weight: "3kg",
    packaging: "프리미엄 선물 박스", isActive: true, lastUpdated: "2026.02.15",
    memo: "한라봉은 1~3월이 제철. 당도 12brix 이상만 선별 출하.",
    monthlySales: 18,
  },
  {
    id: 3, name: "제주 꿀 (야생화)", category: "농산물",
    description: "제주 중산간 야생화 밀원으로 채취한 순수 천연 벌꿀.",
    sellingPrice: 28000,
    costItems: [
      { name: "벌꿀 원액 (500g)", amount: 10000 },
      { name: "유리병", amount: 1500 },
      { name: "라벨·포장", amount: 800 },
      { name: "택배비", amount: 3000 },
    ],
    unit: "병", stock: 35, minStock: 10, supplier: "○○양봉원",
    origin: "제주 한림읍", season: "연중", weight: "500g",
    packaging: "유리병 + 선물 케이스", isActive: true, lastUpdated: "2026.02.10",
    memo: "여름 채취분과 봄 채취분 풍미 차이 있음. 고객 안내 필수.",
    monthlySales: 22,
  },
  {
    id: 4, name: "감귤잼", category: "가공식품",
    description: "제주 감귤로 직접 만든 수제 잼. 무방부제·무색소.",
    sellingPrice: 12000,
    costItems: [
      { name: "감귤", amount: 2000 },
      { name: "설탕·첨가물", amount: 800 },
      { name: "유리병", amount: 1200 },
      { name: "라벨·포장", amount: 500 },
      { name: "가공 인건비", amount: 1500 },
    ],
    unit: "병", stock: 60, minStock: 15, supplier: "자체 제조",
    origin: "제주 서귀포시", season: "연중", weight: "250g",
    packaging: "유리병 + 스티커 라벨", isActive: true, lastUpdated: "2026.02.12",
    memo: "체험 후 추가 구매 비율 높음. 체험 코너 옆에 진열 권장.",
    monthlySales: 48,
  },
  {
    id: 5, name: "감귤 초콜릿", category: "가공식품",
    description: "감귤 필링이 들어간 수제 초콜릿. 개별 포장 12개입.",
    sellingPrice: 18000,
    costItems: [
      { name: "초콜릿 원료", amount: 3500 },
      { name: "감귤 필링", amount: 1200 },
      { name: "몰드·포장", amount: 2000 },
      { name: "가공 인건비", amount: 2000 },
    ],
    unit: "박스", stock: 40, minStock: 10, supplier: "자체 제조",
    origin: "제주 서귀포시", season: "연중 (여름 제외)", weight: "180g",
    packaging: "12개입 선물 박스", isActive: true, lastUpdated: "2026.02.14",
    memo: "여름철(6~8월)은 배송 중 녹을 수 있어 아이스팩 필수 또는 현장 판매만.",
    monthlySales: 25,
  },
  {
    id: 6, name: "귤피차", category: "가공식품",
    description: "감귤 껍질을 건조·숙성하여 만든 전통 차. 향이 깊고 부드러움.",
    sellingPrice: 15000,
    costItems: [
      { name: "귤피 원료", amount: 2500 },
      { name: "건조·숙성 비용", amount: 1000 },
      { name: "티백·포장", amount: 1800 },
      { name: "가공 인건비", amount: 1200 },
    ],
    unit: "팩", stock: 55, minStock: 15, supplier: "자체 제조",
    origin: "제주 서귀포시", season: "연중", weight: "30g (15티백)",
    packaging: "지퍼백 + 외포장", isActive: true, lastUpdated: "2026.02.08",
    memo: "",
    monthlySales: 30,
  },
  {
    id: 7, name: "흑돼지 육포", category: "가공식품",
    description: "제주산 흑돼지로 만든 프리미엄 수제 육포.",
    sellingPrice: 22000,
    costItems: [
      { name: "흑돼지 원육", amount: 7000 },
      { name: "양념·조미료", amount: 1000 },
      { name: "건조 가공비", amount: 2000 },
      { name: "진공 포장", amount: 1500 },
    ],
    unit: "팩", stock: 30, minStock: 10, supplier: "○○축산",
    origin: "제주 한림읍", season: "연중", weight: "150g",
    packaging: "진공팩 + 선물 슬리브", isActive: true, lastUpdated: "2026.02.16",
    memo: "흑돼지 원가 변동 주의. 월 1회 시세 확인 필요.",
    monthlySales: 15,
  },
  {
    id: 8, name: "말린 감귤칩", category: "가공식품",
    description: "무첨가 동결건조 감귤칩. 간식·디저트 토핑으로 인기.",
    sellingPrice: 8000,
    costItems: [
      { name: "감귤 원물", amount: 1500 },
      { name: "동결건조 가공비", amount: 1800 },
      { name: "포장지", amount: 600 },
    ],
    unit: "팩", stock: 80, minStock: 20, supplier: "자체 제조",
    origin: "제주 서귀포시", season: "연중", weight: "50g",
    packaging: "지퍼백 패키지", isActive: true, lastUpdated: "2026.02.11",
    memo: "체험 참가자에게 시식용으로 제공하면 구매 전환율 높음.",
    monthlySales: 55,
  },
  {
    id: 9, name: "감귤 비누", category: "수공예품",
    description: "제주 감귤 추출물과 천연 재료로 만든 핸드메이드 비누.",
    sellingPrice: 10000,
    costItems: [
      { name: "비누 베이스", amount: 1500 },
      { name: "감귤 추출물·에센셜 오일", amount: 1200 },
      { name: "몰드·건조 비용", amount: 500 },
      { name: "포장재", amount: 800 },
      { name: "제작 인건비", amount: 1000 },
    ],
    unit: "개", stock: 70, minStock: 20, supplier: "자체 제조",
    origin: "제주 서귀포시", season: "연중", weight: "100g",
    packaging: "크래프트 박스 + 리본", isActive: true, lastUpdated: "2026.02.09",
    memo: "체험 연계 상품. '비누 만들기 체험' 후 추가 구매 많음.",
    monthlySales: 38,
  },
  {
    id: 10, name: "제주 현무암 화분", category: "수공예품",
    description: "제주 현무암을 조각한 미니 화분. 다육식물 포함.",
    sellingPrice: 25000,
    costItems: [
      { name: "현무암 원석", amount: 3000 },
      { name: "조각·가공비", amount: 5000 },
      { name: "다육식물", amount: 2000 },
      { name: "포장·완충재", amount: 1500 },
    ],
    unit: "개", stock: 15, minStock: 5, supplier: "○○공방",
    origin: "제주 한경면", season: "연중", weight: "약 800g",
    packaging: "안전 포장 박스", isActive: true, lastUpdated: "2026.02.06",
    memo: "무게가 있어 택배 파손 주의. 완충 포장 반드시 확인.",
    monthlySales: 8,
  },
  {
    id: 11, name: "감귤 에센셜 오일", category: "가공식품",
    description: "냉압착 방식으로 추출한 100% 순수 감귤 에센셜 오일.",
    sellingPrice: 20000,
    costItems: [
      { name: "감귤 원료 (대량)", amount: 3000 },
      { name: "냉압착 추출 가공비", amount: 4000 },
      { name: "유리 드롭퍼 병", amount: 2000 },
      { name: "라벨·외포장", amount: 800 },
    ],
    unit: "병", stock: 25, minStock: 8, supplier: "자체 제조",
    origin: "제주 서귀포시", season: "연중", weight: "30ml",
    packaging: "드롭퍼 병 + 박스", isActive: true, lastUpdated: "2026.02.05",
    memo: "향기 체험 코너에서 시향 가능하게 운영 중.",
    monthlySales: 12,
  },
  {
    id: 12, name: "제주 도자기 머그컵", category: "수공예품",
    description: "제주 흙으로 구운 핸드메이드 도자기 머그컵. 유약 컬러 3종.",
    sellingPrice: 18000,
    costItems: [
      { name: "도자기 소지", amount: 1500 },
      { name: "유약", amount: 800 },
      { name: "가마 소성 비용", amount: 2000 },
      { name: "제작 인건비", amount: 3000 },
      { name: "포장재", amount: 1200 },
    ],
    unit: "개", stock: 4, minStock: 5, supplier: "○○도예공방",
    origin: "제주 조천읍", season: "연중", weight: "약 350g",
    packaging: "안전 포장 + 박스", isActive: true, lastUpdated: "2026.02.03",
    memo: "현재 재고 부족. 3월 초 입고 예정(30개). 사전 주문 접수 가능.",
    monthlySales: 10,
  },
];

const CATEGORIES: SpecialtyCategory[] = ["농산물", "가공식품", "수공예품", "기타"];

const CAT_CONFIG: Record<SpecialtyCategory, { color: string; bgColor: string; icon: typeof Apple }> = {
  "농산물": { color: "#1B5E20", bgColor: "#ECF7EE", icon: Leaf },
  "가공식품": { color: "#8A6A2B", bgColor: "#FFF6E6", icon: Cookie },
  "수공예품": { color: "#7B1FA2", bgColor: "#F3E8F9", icon: Palette },
  "기타": { color: "#6B7280", bgColor: "#F7F3ED", icon: MoreHorizontal },
};

/* ═══ 유틸 ═══ */
const calcTotalCost = (items: SpecialtyCostItem[]) =>
  items.reduce((s, c) => s + c.amount, 0);

const calcMargin = (price: number, cost: number) =>
  price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

/* ═══ 컴포넌트 ═══ */
export function Specialties() {
  const [products, setProducts] = useState<SpecialtyProduct[]>(INITIAL_PRODUCTS);
  const [viewMode, setViewMode] = useState<"category" | "all">("category");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SpecialtyProduct | null>(null);

  /* 폼 상태 */
  const [fName, setFName] = useState("");
  const [fCategory, setFCategory] = useState<SpecialtyCategory>("농산물");
  const [fDescription, setFDescription] = useState("");
  const [fSellingPrice, setFSellingPrice] = useState(0);
  const [fUnit, setFUnit] = useState("개");
  const [fStock, setFStock] = useState(0);
  const [fMinStock, setFMinStock] = useState(0);
  const [fSupplier, setFSupplier] = useState("");
  const [fOrigin, setFOrigin] = useState("제주 서귀포시");
  const [fSeason, setFSeason] = useState("연중");
  const [fWeight, setFWeight] = useState("");
  const [fPackaging, setFPackaging] = useState("");
  const [fMemo, setFMemo] = useState("");
  const [fCostItems, setFCostItems] = useState<SpecialtyCostItem[]>([
    { name: "", amount: 0 },
  ]);

  /* 필터 */
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!p.isActive) return false;
      if (categoryFilter !== "전체" && p.category !== categoryFilter) return false;
      if (searchQuery && !p.name.includes(searchQuery) && !p.description.includes(searchQuery)) return false;
      return true;
    });
  }, [products, categoryFilter, searchQuery]);

  /* 카테고리 그룹 */
  const groupedByCategory = useMemo(() => {
    const map = new Map<SpecialtyCategory, SpecialtyProduct[]>();
    filtered.forEach(p => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    return Array.from(map.entries());
  }, [filtered]);

  /* 통계 */
  const stats = useMemo(() => {
    const active = products.filter(p => p.isActive);
    const totalRevenue = active.reduce((s, p) => s + p.sellingPrice * p.monthlySales, 0);
    const avgMargin = active.length > 0
      ? Math.round(active.reduce((s, p) => s + calcMargin(p.sellingPrice, calcTotalCost(p.costItems)), 0) / active.length)
      : 0;
    const lowStock = active.filter(p => p.stock <= p.minStock).length;
    const totalItems = active.length;
    return { totalItems, totalRevenue, avgMargin, lowStock };
  }, [products]);

  /* 폼 열기 */
  const openForm = (product?: SpecialtyProduct) => {
    if (product) {
      setEditingProduct(product);
      setFName(product.name);
      setFCategory(product.category);
      setFDescription(product.description);
      setFSellingPrice(product.sellingPrice);
      setFUnit(product.unit);
      setFStock(product.stock);
      setFMinStock(product.minStock);
      setFSupplier(product.supplier);
      setFOrigin(product.origin);
      setFSeason(product.season);
      setFWeight(product.weight);
      setFPackaging(product.packaging);
      setFMemo(product.memo);
      setFCostItems(product.costItems.length > 0 ? [...product.costItems] : [{ name: "", amount: 0 }]);
    } else {
      setEditingProduct(null);
      setFName("");
      setFCategory("농산물");
      setFDescription("");
      setFSellingPrice(0);
      setFUnit("개");
      setFStock(0);
      setFMinStock(0);
      setFSupplier("");
      setFOrigin("제주 서귀포시");
      setFSeason("연중");
      setFWeight("");
      setFPackaging("");
      setFMemo("");
      setFCostItems([{ name: "", amount: 0 }]);
    }
    setShowForm(true);
  };

  const saveProduct = () => {
    if (!fName.trim()) return;
    const validCostItems = fCostItems.filter(c => c.name.trim() && c.amount > 0);
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: fName, category: fCategory, description: fDescription,
        sellingPrice: fSellingPrice, costItems: validCostItems,
        unit: fUnit, stock: fStock, minStock: fMinStock,
        supplier: fSupplier, origin: fOrigin, season: fSeason,
        weight: fWeight, packaging: fPackaging, memo: fMemo,
        lastUpdated: "2026.02.20",
      } : p));
    } else {
      const newProduct: SpecialtyProduct = {
        id: Date.now(), name: fName, category: fCategory, description: fDescription,
        sellingPrice: fSellingPrice, costItems: validCostItems,
        unit: fUnit, stock: fStock, minStock: fMinStock,
        supplier: fSupplier, origin: fOrigin, season: fSeason,
        weight: fWeight, packaging: fPackaging,
        isActive: true, lastUpdated: "2026.02.20", memo: fMemo, monthlySales: 0,
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setShowForm(false);
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addCostItem = () => setFCostItems(prev => [...prev, { name: "", amount: 0 }]);
  const removeCostItem = (idx: number) => setFCostItems(prev => prev.filter((_, i) => i !== idx));
  const updateCostItem = (idx: number, field: keyof SpecialtyCostItem, value: string | number) => {
    setFCostItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const formTotalCost = fCostItems.reduce((s, c) => s + c.amount, 0);

  /* ═══ 렌더 ═══ */
  return (
    <div className="max-w-[1160px] space-y-6">

      {/* ── 상단 요약 카드 ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "전체 특산품", value: `${stats.totalItems}개`, icon: ShoppingBag, color: "#2F4F46", desc: `${CATEGORIES.map(c => products.filter(p => p.isActive && p.category === c).length).filter(n => n > 0).length}개 카테고리` },
          { label: "평균 마진율", value: `${stats.avgMargin}%`, icon: BarChart3, color: stats.avgMargin >= 40 ? "#1B5E20" : "#8A6A2B", desc: stats.avgMargin >= 40 ? "건강한 수준" : "점검 필요" },
          { label: "이번 달 예상 매출", value: `${(stats.totalRevenue / 10000).toFixed(0)}만원`, icon: TrendingUp, color: "#2F4F46", desc: "2026년 2월 기준" },
          { label: "재고 부족", value: `${stats.lowStock}건`, icon: AlertTriangle, color: stats.lowStock > 0 ? "#C62828" : "#9CA3AF", desc: stats.lowStock > 0 ? "최소 재고 이하" : "재고 상태 양호" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-2.5">
              <card.icon size={16} className="text-[#9CA3AF]" />
              <span className="text-[13px] text-[#6B7280]">{card.label}</span>
            </div>
            <p className="text-[22px]" style={{ fontWeight: 700, color: card.color }}>{card.value}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ── 뷰 전환 + 검색 + 추가 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {([
            { key: "category" as const, label: "카테고리별", icon: Layers },
            { key: "all" as const, label: "전체 목록", icon: Package },
          ]).map(v => (
            <button key={v.key} onClick={() => setViewMode(v.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] cursor-pointer transition-all ${viewMode === v.key ? "bg-[#2F4F46] text-white" : "bg-white border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"}`}
            ><v.icon size={14} /> {v.label}</button>
          ))}

          <div className="w-[1px] h-5 bg-[#E6E2DB] mx-1" />

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="특산품 검색"
              className="h-[40px] w-[200px] pl-8 pr-3 rounded-xl border border-[#D6D0C8] bg-white text-[13px] focus:border-[#2F4F46] focus:outline-none" />
          </div>

          {viewMode === "all" && (
            <div className="flex gap-1.5 ml-1">
              {["전체", ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`text-[12px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${categoryFilter === cat ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]"}`}
                  style={{ fontWeight: categoryFilter === cat ? 700 : 400 }}>{cat}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => openForm()} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
          <Plus size={16} /> 새 특산품 등록
        </button>
      </div>

      {/* ══ 카테고리별 뷰 ══ */}
      {viewMode === "category" && (
        <div className="space-y-4">
          {groupedByCategory.length === 0 ? (
            <div className="bg-white rounded-[14px] border border-[#E6E2DB] py-12 text-center">
              <ShoppingBag size={32} className="text-[#D6D0C8] mx-auto mb-3" />
              <p className="text-[15px] text-[#6B7280]" style={{ fontWeight: 700 }}>등록된 특산품이 없습니다</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">'새 특산품 등록' 버튼으로 시작하세요.</p>
            </div>
          ) : (
            groupedByCategory.map(([catName, items]) => {
              const catConf = CAT_CONFIG[catName];
              const CatIcon = catConf.icon;
              const catRevenue = items.reduce((s, p) => s + p.sellingPrice * p.monthlySales, 0);

              return (
                <div key={catName} className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden">
                  {/* 카테고리 헤더 */}
                  <div className="px-6 py-4 bg-[#FBFAF7] border-b border-[#E6E2DB] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: catConf.bgColor }}>
                        <CatIcon size={18} style={{ color: catConf.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{catName}</span>
                          <span className="text-[12px] px-2 py-0.5 rounded-md" style={{ backgroundColor: catConf.bgColor, color: catConf.color, fontWeight: 700 }}>{items.length}개</span>
                        </div>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5">월 예상 매출 {(catRevenue / 10000).toFixed(0)}만원</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#9CA3AF]">평균 마진율</p>
                      <p className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
                        {Math.round(items.reduce((s, p) => s + calcMargin(p.sellingPrice, calcTotalCost(p.costItems)), 0) / items.length)}%
                      </p>
                    </div>
                  </div>

                  {/* 항목 행 */}
                  <div className="divide-y divide-[#F3EFE8]">
                    {items.map(item => {
                      const totalCost = calcTotalCost(item.costItems);
                      const margin = calcMargin(item.sellingPrice, totalCost);
                      const remaining = item.sellingPrice - totalCost;
                      const isExpanded = expandedId === item.id;
                      const isLowStock = item.stock <= item.minStock;

                      return (
                        <div key={item.id}>
                          <div
                            className={`px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors ${isExpanded ? "bg-[#F7F3ED]" : "hover:bg-[#FBFAF7]"}`}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          >
                            {/* 상품 아이콘 */}
                            <div className="w-10 h-10 rounded-xl bg-[#F7F3ED] flex items-center justify-center shrink-0">
                              <Gift size={18} className="text-[#6B7280]" />
                            </div>

                            {/* 상품명 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] text-[#1F2937] truncate" style={{ fontWeight: 700 }}>{item.name}</span>
                                {isLowStock && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#FDECEC] text-[#C62828] flex items-center gap-0.5 shrink-0" style={{ fontWeight: 700 }}>
                                    <AlertTriangle size={10} /> 재고 부족
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-[#9CA3AF] truncate mt-0.5">{item.description}</p>
                            </div>

                            {/* 재고 */}
                            <div className="w-[70px] shrink-0 text-center">
                              <p className={`text-[14px] ${isLowStock ? "text-[#C62828]" : "text-[#1F2937]"}`} style={{ fontWeight: 700 }}>{item.stock}</p>
                              <p className="text-[11px] text-[#9CA3AF]">{item.unit}</p>
                            </div>

                            {/* 판매가 */}
                            <div className="w-[90px] shrink-0 text-right">
                              <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.sellingPrice.toLocaleString()}원</p>
                              <p className="text-[11px] text-[#9CA3AF]">판매가</p>
                            </div>

                            {/* 마진 */}
                            <div className="w-[70px] shrink-0 text-right">
                              <p className={`text-[14px] ${margin >= 40 ? "text-[#1B5E20]" : margin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{margin}%</p>
                              <p className="text-[11px] text-[#9CA3AF]">마진</p>
                            </div>

                            {/* 월 판매 */}
                            <div className="w-[60px] shrink-0 text-right">
                              <p className="text-[14px] text-[#6B7280]" style={{ fontWeight: 700 }}>{item.monthlySales}</p>
                              <p className="text-[11px] text-[#9CA3AF]">월 판매</p>
                            </div>

                            {/* 관리 */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={e => { e.stopPropagation(); openForm(item); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors">
                                <Edit2 size={13} />
                              </button>
                              <ChevronDown size={13} className={`text-[#9CA3AF] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>

                          {/* 확장 상세 */}
                          {isExpanded && (
                            <div className="px-6 py-5 bg-[#FBFAF7] border-t border-[#E6E2DB]">
                              <div className="flex gap-6">
                                {/* 좌측: 원가 상세 */}
                                <div className="flex-1 space-y-4">
                                  {/* 원가 구성 */}
                                  <div>
                                    <h4 className="text-[14px] text-[#1F2937] mb-2.5 flex items-center gap-2" style={{ fontWeight: 700 }}>
                                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F4F46]" /> 원가 구성
                                    </h4>
                                    <div className="bg-white rounded-xl border border-[#E6E2DB] overflow-hidden">
                                      <table className="w-full">
                                        <thead>
                                          <tr>
                                            {["비용 항목", "금액"].map(h => (
                                              <th key={h} className={`text-[12px] text-[#9CA3AF] px-4 py-2.5 ${h === "금액" ? "text-right" : "text-left"}`} style={{ fontWeight: 700 }}>{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {item.costItems.map((c, i) => (
                                            <tr key={i} className="border-t border-[#F3EFE8]">
                                              <td className="text-[14px] text-[#1F2937] px-4 py-2.5">{c.name}</td>
                                              <td className="text-[14px] text-[#1F2937] px-4 py-2.5 text-right" style={{ fontWeight: 700 }}>{c.amount.toLocaleString()}원</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      <div className="border-t border-[#E6E2DB] px-4 py-2.5 flex justify-between bg-[#F7F3ED]">
                                        <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>원가 합계</span>
                                        <span className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{totalCost.toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 원가 비율 바 */}
                                  {item.costItems.length > 0 && (
                                    <div className="space-y-2">
                                      <div className="h-[8px] rounded-full overflow-hidden flex bg-[#E6E2DB]">
                                        {item.costItems.map((c, i) => {
                                          const colors = ["#2F4F46", "#5B8A72", "#D4A843", "#9CA3AF", "#D6D0C8", "#8A6A2B"];
                                          return (
                                            <div key={i} className="h-full transition-all" style={{ width: `${(c.amount / totalCost) * 100}%`, backgroundColor: colors[i % colors.length] }} />
                                          );
                                        })}
                                      </div>
                                      <div className="flex gap-3 flex-wrap">
                                        {item.costItems.map((c, i) => {
                                          const colors = ["#2F4F46", "#5B8A72", "#D4A843", "#9CA3AF", "#D6D0C8", "#8A6A2B"];
                                          return (
                                            <div key={i} className="flex items-center gap-1.5">
                                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                                              <span className="text-[11px] text-[#6B7280]">{c.name} {Math.round((c.amount / totalCost) * 100)}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* 상품 정보 */}
                                  <div className="bg-white rounded-xl border border-[#E6E2DB] p-4 space-y-2.5">
                                    {[
                                      { label: "공급처", value: item.supplier },
                                      { label: "원산지", value: item.origin },
                                      { label: "판매 시즌", value: item.season },
                                      { label: "중량/용량", value: item.weight },
                                      { label: "포장 방식", value: item.packaging },
                                      { label: "최근 수정", value: item.lastUpdated },
                                    ].map(row => (
                                      <div key={row.label} className="flex justify-between">
                                        <span className="text-[13px] text-[#6B7280]">{row.label}</span>
                                        <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>{row.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 우측: 수익·재고·메모 */}
                                <div className="w-[280px] shrink-0 space-y-4">
                                  {/* 수익 구조 */}
                                  <div className="bg-[#F7F3ED] rounded-xl p-5 space-y-3">
                                    <h4 className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>수익 구조</h4>
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between">
                                        <span className="text-[14px] text-[#6B7280]">판매가</span>
                                        <span className="text-[14px] text-[#1F2937]">{item.sellingPrice.toLocaleString()}원</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-[14px] text-[#6B7280]">원가 합계</span>
                                        <span className="text-[14px] text-[#1F2937]">−{totalCost.toLocaleString()}원</span>
                                      </div>
                                      <div className="border-t border-[#E6E2DB] pt-2.5 flex justify-between">
                                        <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>남는 금액</span>
                                        <span className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{remaining.toLocaleString()}원</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-[13px] text-[#6B7280]">마진율</span>
                                        <span className={`text-[16px] ${margin >= 40 ? "text-[#1B5E20]" : margin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{margin}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 재고 현황 */}
                                  <div className={`rounded-xl border p-4 space-y-2 ${isLowStock ? "bg-[#FDECEC] border-[#E6B96E]" : "bg-white border-[#E6E2DB]"}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>재고 현황</span>
                                      {isLowStock && <AlertTriangle size={16} className="text-[#C62828]" />}
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#6B7280]">현재 재고</span>
                                      <span className={`text-[16px] ${isLowStock ? "text-[#C62828]" : "text-[#1F2937]"}`} style={{ fontWeight: 700 }}>{item.stock}{item.unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#6B7280]">최소 재고</span>
                                      <span className="text-[13px] text-[#9CA3AF]">{item.minStock}{item.unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#6B7280]">월 판매량</span>
                                      <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.monthlySales}{item.unit}</span>
                                    </div>
                                    {item.monthlySales > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-[13px] text-[#6B7280]">예상 소진</span>
                                        <span className="text-[13px] text-[#8A6A2B]" style={{ fontWeight: 700 }}>약 {Math.round(item.stock / item.monthlySales * 30)}일</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* 월 실적 */}
                                  <div className="bg-white rounded-xl border border-[#E6E2DB] p-4">
                                    <h4 className="text-[14px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>이번 달 실적</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-[13px] text-[#6B7280]">판매 수량</span>
                                        <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.monthlySales}{item.unit}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-[13px] text-[#6B7280]">매출액</span>
                                        <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{(item.sellingPrice * item.monthlySales).toLocaleString()}원</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-[13px] text-[#6B7280]">순이익 추정</span>
                                        <span className="text-[15px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{(remaining * item.monthlySales).toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 메모 */}
                                  {item.memo && (
                                    <div className="bg-[#FBFAF7] rounded-xl px-4 py-3">
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <Info size={12} className="text-[#9CA3AF]" />
                                        <span className="text-[11px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>메모</span>
                                      </div>
                                      <p className="text-[13px] text-[#6B7280] leading-relaxed">{item.memo}</p>
                                    </div>
                                  )}

                                  {/* 관리 버튼 */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openForm(item)}
                                      className="flex-1 h-[40px] rounded-xl border border-[#2F4F46] text-[#2F4F46] text-[13px] hover:bg-[#F7F3ED] cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <Edit2 size={13} /> 수정
                                    </button>
                                    <button
                                      onClick={() => deleteProduct(item.id)}
                                      className="h-[40px] px-4 rounded-xl border border-[#E6E2DB] text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] hover:border-[#FDECEC] cursor-pointer transition-colors flex items-center justify-center"
                                    >
                                      <Trash2 size={13} />
                                    </button>
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
            })
          )}
        </div>
      )}

      {/* ══ 전체 목록 뷰 ══ */}
      {viewMode === "all" && (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="px-5 py-2.5 bg-[#FBFAF7] border-b border-[#E6E2DB] grid items-center gap-3" style={{ gridTemplateColumns: "1fr 80px 80px 100px 70px 60px 80px" }}>
            {["특산품명", "분류", "재고", "판매가", "원가", "마진", "관리"].map((h, i) => (
              <span key={h} className={`text-[12px] text-[#9CA3AF] ${i >= 3 && i <= 5 ? "text-right" : i === 6 ? "text-right" : ""}`} style={{ fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag size={28} className="text-[#D6D0C8] mx-auto mb-3" />
              <p className="text-[15px] text-[#6B7280]" style={{ fontWeight: 700 }}>등록된 특산품이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3EFE8]">
              {filtered.map(item => {
                const totalCost = calcTotalCost(item.costItems);
                const margin = calcMargin(item.sellingPrice, totalCost);
                const isExpanded = expandedId === item.id;
                const isLowStock = item.stock <= item.minStock;
                const catConf = CAT_CONFIG[item.category];

                return (
                  <div key={item.id}>
                    <div
                      className={`px-5 py-3 grid items-center gap-3 cursor-pointer transition-colors ${isExpanded ? "bg-[#F7F3ED]" : "hover:bg-[#FBFAF7]"}`}
                      style={{ gridTemplateColumns: "1fr 80px 80px 100px 70px 60px 80px" }}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: catConf.bgColor }}>
                          <Gift size={15} style={{ color: catConf.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] text-[#1F2937] truncate" style={{ fontWeight: 700 }}>{item.name}</span>
                            {isLowStock && <AlertTriangle size={11} className="text-[#C62828] shrink-0" />}
                          </div>
                        </div>
                        <ChevronDown size={12} className={`text-[#9CA3AF] shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                      <div className="flex justify-center">
                        <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ backgroundColor: catConf.bgColor, color: catConf.color, fontWeight: 700 }}>{item.category}</span>
                      </div>
                      <span className={`text-[14px] text-center ${isLowStock ? "text-[#C62828]" : "text-[#6B7280]"}`} style={{ fontWeight: isLowStock ? 700 : 400 }}>{item.stock}{item.unit}</span>
                      <span className="text-[14px] text-[#1F2937] text-right" style={{ fontWeight: 700 }}>{item.sellingPrice.toLocaleString()}원</span>
                      <span className="text-[13px] text-[#6B7280] text-right">{totalCost.toLocaleString()}</span>
                      <span className={`text-[14px] text-right ${margin >= 40 ? "text-[#1B5E20]" : margin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{margin}%</span>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={e => { e.stopPropagation(); openForm(item); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                        <button onClick={e => { e.stopPropagation(); deleteProduct(item.id); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>

                    {/* 펼침 상세 */}
                    {isExpanded && (
                      <div className="bg-[#FBFAF7] border-t border-[#E6E2DB] px-5 py-4">
                        <div className="flex gap-5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-[#6B7280] mb-3">{item.description}</p>
                            <table className="w-full">
                              <thead><tr>{["비용 항목", "금액"].map(h => (<th key={h} className={`text-[11px] text-[#9CA3AF] px-2 py-1.5 ${h === "금액" ? "text-right" : "text-left"}`} style={{ fontWeight: 700 }}>{h}</th>))}</tr></thead>
                              <tbody>
                                {item.costItems.map((c, i) => (
                                  <tr key={i} className="border-t border-[#F3EFE8]">
                                    <td className="text-[13px] text-[#1F2937] px-2 py-1.5">{c.name}</td>
                                    <td className="text-[13px] text-[#1F2937] px-2 py-1.5 text-right" style={{ fontWeight: 700 }}>{c.amount.toLocaleString()}원</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="border-t border-[#E6E2DB] mt-1 pt-2 flex justify-between px-2">
                              <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>원가 합계</span>
                              <span className="text-[15px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{totalCost.toLocaleString()}원</span>
                            </div>
                          </div>
                          <div className="w-[240px] shrink-0 space-y-3">
                            <div className="bg-white rounded-lg border border-[#E6E2DB] p-3 space-y-2">
                              {[
                                { label: "공급처", value: item.supplier },
                                { label: "원산지", value: item.origin },
                                { label: "시즌", value: item.season },
                                { label: "중량", value: item.weight },
                                { label: "포장", value: item.packaging },
                              ].map(r => (
                                <div key={r.label} className="flex justify-between">
                                  <span className="text-[12px] text-[#9CA3AF]">{r.label}</span>
                                  <span className="text-[12px] text-[#1F2937]">{r.value}</span>
                                </div>
                              ))}
                            </div>
                            {item.memo && (
                              <div className="bg-white rounded-lg border border-[#E6E2DB] px-3 py-2">
                                <p className="text-[11px] text-[#9CA3AF] mb-1" style={{ fontWeight: 700 }}>메모</p>
                                <p className="text-[12px] text-[#6B7280] leading-relaxed">{item.memo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {filtered.length > 0 && (
            <div className="px-5 py-3 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center gap-6">
              <span className="text-[13px] text-[#6B7280]">전체: <strong className="text-[#1F2937]">{filtered.length}개</strong></span>
              <span className="text-[13px] text-[#6B7280]">평균 마진: <strong className="text-[#1F2937]">{Math.round(filtered.reduce((s, p) => s + calcMargin(p.sellingPrice, calcTotalCost(p.costItems)), 0) / filtered.length)}%</strong></span>
              <span className="text-[13px] text-[#6B7280]">월 매출 합계: <strong className="text-[#1F2937]">{(filtered.reduce((s, p) => s + p.sellingPrice * p.monthlySales, 0) / 10000).toFixed(0)}만원</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ── 하단 안내 ── */}
      <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-center gap-2.5">
        <Info size={14} className="text-[#9CA3AF] shrink-0" />
        <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
          특산품은 체험·식사·숙박과 별도로 판매하는 지역 특산물·가공식품·수공예품입니다. 여기에 등록하면 상품·원가 관리와 스마트 경영 센터에서 통합 분석됩니다.
        </p>
      </div>

      {/* ═══ 등록/수정 모달 ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[680px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="px-6 py-5 border-b border-[#E6E2DB] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECF7EE] flex items-center justify-center">
                    <ShoppingBag size={20} className="text-[#2F4F46]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                      {editingProduct ? "특산품 수정" : "새 특산품 등록"}
                    </h2>
                    <p className="text-[13px] text-[#9CA3AF] mt-0.5">지역 특산물·가공식품·수공예품의 정보와 원가를 등록합니다.</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* 기본 정보 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>특산품명</label>
                  <input
                    value={fName}
                    onChange={e => setFName(e.target.value)}
                    placeholder="예: 감귤 선물세트 (5kg)"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>분류</label>
                  <div className="relative">
                    <select
                      value={fCategory}
                      onChange={e => setFCategory(e.target.value as SpecialtyCategory)}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>상품 설명</label>
                <textarea
                  value={fDescription}
                  onChange={e => setFDescription(e.target.value)}
                  placeholder="특산품에 대한 간단한 설명"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* 가격·단위 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>판매가 (원)</label>
                  <input
                    type="number"
                    value={fSellingPrice || ""}
                    onChange={e => setFSellingPrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>판매 단위</label>
                  <div className="relative">
                    <select
                      value={fUnit}
                      onChange={e => setFUnit(e.target.value)}
                      className="w-full h-[48px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                    >
                      {["개", "박스", "병", "팩", "세트", "봉"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>중량/용량</label>
                  <input
                    value={fWeight}
                    onChange={e => setFWeight(e.target.value)}
                    placeholder="예: 500g, 5kg"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
              </div>

              {/* 재고 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>현재 재고</label>
                  <input
                    type="number"
                    value={fStock || ""}
                    onChange={e => setFStock(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>최소 재고 (알림 기준)</label>
                  <input
                    type="number"
                    value={fMinStock || ""}
                    onChange={e => setFMinStock(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[16px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>판매 시즌</label>
                  <input
                    value={fSeason}
                    onChange={e => setFSeason(e.target.value)}
                    placeholder="예: 연중, 10월~2월"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
              </div>

              {/* 공급처·원산지·포장 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>공급처</label>
                  <input
                    value={fSupplier}
                    onChange={e => setFSupplier(e.target.value)}
                    placeholder="예: 자체 제조, ○○농장"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>원산지</label>
                  <input
                    value={fOrigin}
                    onChange={e => setFOrigin(e.target.value)}
                    placeholder="예: 제주 서귀포시"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>포장 방식</label>
                  <input
                    value={fPackaging}
                    onChange={e => setFPackaging(e.target.value)}
                    placeholder="예: 선물 박스"
                    className="w-full h-[48px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                  />
                </div>
              </div>

              {/* 원가 구성 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>원가 구성</label>
                  <button onClick={addCostItem} className="text-[13px] text-[#2F4F46] flex items-center gap-1 cursor-pointer hover:underline">
                    <Plus size={14} /> 항목 추가
                  </button>
                </div>

                <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] overflow-hidden">
                  <div className="grid gap-3 px-4 py-2.5 bg-[#F7F3ED]" style={{ gridTemplateColumns: "1fr 120px 36px" }}>
                    <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>비용 항목명</span>
                    <span className="text-[12px] text-[#9CA3AF] text-right" style={{ fontWeight: 700 }}>금액 (원)</span>
                    <span />
                  </div>

                  <div className="divide-y divide-[#F3EFE8]">
                    {fCostItems.map((item, idx) => (
                      <div key={idx} className="grid gap-3 px-4 py-2.5 items-center" style={{ gridTemplateColumns: "1fr 120px 36px" }}>
                        <input
                          value={item.name}
                          onChange={e => updateCostItem(idx, "name", e.target.value)}
                          placeholder="예: 감귤 원료"
                          className="h-[40px] px-3 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={item.amount || ""}
                          onChange={e => updateCostItem(idx, "amount", Number(e.target.value))}
                          placeholder="0"
                          className="h-[40px] px-3 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] text-right focus:border-[#2F4F46] focus:outline-none"
                        />
                        <button
                          onClick={() => removeCostItem(idx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#C62828] hover:bg-[#FDECEC] cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E6E2DB] px-4 py-3 flex items-center justify-between bg-[#F7F3ED]">
                    <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>원가 합계</span>
                    <span className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{formTotalCost.toLocaleString()}원</span>
                  </div>
                </div>

                <button onClick={addCostItem} className="mt-3 w-full h-[40px] rounded-xl border border-dashed border-[#D6D0C8] text-[13px] text-[#9CA3AF] hover:text-[#2F4F46] hover:border-[#2F4F46] cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                  <Plus size={14} /> 원가 항목 추가
                </button>

                {fSellingPrice > 0 && formTotalCost > 0 && (
                  <div className="mt-3 flex items-center gap-4 px-4 py-3 bg-[#F7F3ED] rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#6B7280]">마진:</span>
                      <span className={`text-[16px] ${calcMargin(fSellingPrice, formTotalCost) >= 40 ? "text-[#1B5E20]" : calcMargin(fSellingPrice, formTotalCost) >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>
                        {calcMargin(fSellingPrice, formTotalCost)}%
                      </span>
                    </div>
                    <div className="w-[1px] h-5 bg-[#E6E2DB]" />
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#6B7280]">남는 금액:</span>
                      <span className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{(fSellingPrice - formTotalCost).toLocaleString()}원</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
                <textarea
                  value={fMemo}
                  onChange={e => setFMemo(e.target.value)}
                  placeholder="주의사항, 보관 방법 등"
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
                {fSellingPrice > 0 && formTotalCost > 0 && (
                  <span className="text-[14px] text-[#6B7280]">
                    마진 <strong className="text-[#2F4F46] text-[16px]">{calcMargin(fSellingPrice, formTotalCost)}%</strong> · 남는 금액 <strong className="text-[#2F4F46] text-[16px]">{(fSellingPrice - formTotalCost).toLocaleString()}원</strong>
                  </span>
                )}
                <button
                  onClick={saveProduct}
                  disabled={!fName.trim() || fSellingPrice <= 0}
                  className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingProduct ? "수정 완료" : "특산품 등록"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
