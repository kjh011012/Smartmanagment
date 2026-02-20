import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronUp, ChevronRight, Plus, Check, AlertTriangle, Star,
  Edit2, Package, Layers, FileText, TrendingUp, TrendingDown, Users, Calendar,
  Clock, Copy, Archive, BarChart3, Eye, EyeOff, X, Info, Minus,
  UtensilsCrossed, Trash2, ChefHat
} from "lucide-react";
import { ProductWizard } from "../modals/ProductWizard";

/* ═══ 타입 ═══ */
interface CostItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface MonthlyStat {
  month: string;
  salesCount: number;
  revenue: number;
  avgMargin: number;
}

interface SeasonPrice {
  season: string;
  period: string;
  price: number;
  active: boolean;
}

interface Product {
  id: number;
  name: string;
  type: "체험" | "식사" | "숙박";
  description: string;
  price: number;
  duration: string;
  maxCapacity: number;
  unitBasis: string;
  costStatus: "완료" | "미완료";
  isActive: boolean;
  lastCostUpdate: string;

  materials: CostItem[];
  laborCost: number;
  utilityCost: { gas: number; electric: number; water: number };
  suppliesCost: CostItem[];

  monthlyStats: MonthlyStat[];
  seasonPrices: SeasonPrice[];
  memo: string;
  costAlert: string | null;
}

/* ═══ 상세 더미 데이터 ═══ */
const PRODUCTS: Product[] = [
  {
    id: 1, name: "감귤 따기 체험", type: "체험",
    description: "제주 감귤밭에서 직접 감귤을 수확하는 체험. 바구니 1개 포함.",
    price: 25000, duration: "약 1시간 30분", maxCapacity: 20, unitBasis: "1인 기준",
    costStatus: "완료", isActive: true, lastCostUpdate: "2026.02.10",
    materials: [
      { name: "감귤 (수확용)", quantity: 1.5, unit: "kg", unitPrice: 4000 },
      { name: "체험 장갑", quantity: 1, unit: "개", unitPrice: 500 },
      { name: "포장 상자", quantity: 1, unit: "개", unitPrice: 800 },
    ],
    laborCost: 3000,
    utilityCost: { gas: 0, electric: 300, water: 200 },
    suppliesCost: [
      { name: "가위 (소모 비용)", quantity: 1, unit: "건당", unitPrice: 200 },
    ],
    monthlyStats: [
      { month: "2025.12", salesCount: 85, revenue: 2125000, avgMargin: 54 },
      { month: "2026.01", salesCount: 120, revenue: 3000000, avgMargin: 56 },
      { month: "2026.02", salesCount: 68, revenue: 1700000, avgMargin: 56 },
    ],
    seasonPrices: [
      { season: "비수기 (3~5월)", period: "03.01 ~ 05.31", price: 20000, active: true },
      { season: "성수기 (10~12월)", period: "10.01 ~ 12.31", price: 30000, active: true },
      { season: "일반 (그 외)", period: "연중", price: 25000, active: true },
    ],
    memo: "감귤 수확 시기에 따라 가격 조정 필요. 단체(15명+) 10% 할인 적용 중.",
    costAlert: null,
  },
  {
    id: 2, name: "흑돼지 식사", type: "식사",
    description: "제주산 흑돼지 목살과 삼겹살 구이. 밑반찬 5종 포함.",
    price: 30000, duration: "약 1시간", maxCapacity: 40, unitBasis: "1인 기준",
    costStatus: "완료", isActive: true, lastCostUpdate: "2026.02.12",
    materials: [
      { name: "돼지고기 목살", quantity: 0.25, unit: "kg", unitPrice: 15000 },
      { name: "돼지고기 삼겹", quantity: 0.15, unit: "kg", unitPrice: 13000 },
      { name: "양파", quantity: 0.1, unit: "kg", unitPrice: 2000 },
      { name: "당근", quantity: 0.05, unit: "kg", unitPrice: 3000 },
      { name: "쌈채소", quantity: 0.1, unit: "kg", unitPrice: 5000 },
      { name: "밑반찬 세트", quantity: 1, unit: "인분", unitPrice: 3000 },
      { name: "숯", quantity: 0.05, unit: "상자", unitPrice: 8000 },
    ],
    laborCost: 7000,
    utilityCost: { gas: 1500, electric: 500, water: 300 },
    suppliesCost: [
      { name: "냅킨/물티슈", quantity: 1, unit: "세트", unitPrice: 200 },
      { name: "나무젓가락", quantity: 1, unit: "세트", unitPrice: 100 },
    ],
    monthlyStats: [
      { month: "2025.12", salesCount: 150, revenue: 4500000, avgMargin: 28 },
      { month: "2026.01", salesCount: 180, revenue: 5400000, avgMargin: 30 },
      { month: "2026.02", salesCount: 95, revenue: 2850000, avgMargin: 30 },
    ],
    seasonPrices: [
      { season: "일반", period: "연중", price: 30000, active: true },
      { season: "주말/공휴일", period: "주말, 공휴일", price: 33000, active: false },
    ],
    memo: "돼지고기 시세 변동 주의. 2월 중순 단가 인상 예정(15,000→16,500원/kg).",
    costAlert: "돼지고기 목살 단가가 10% 상승 예정입니다.",
  },
  {
    id: 3, name: "한옥 숙박", type: "숙박",
    description: "전통 한옥에서의 1박. 조식 포함, 어메니티 제공.",
    price: 120000, duration: "1박 2일", maxCapacity: 4, unitBasis: "1박 기준",
    costStatus: "완료", isActive: true, lastCostUpdate: "2026.02.05",
    materials: [
      { name: "조식 재료", quantity: 1, unit: "세트", unitPrice: 8000 },
    ],
    laborCost: 15000,
    utilityCost: { gas: 3000, electric: 4000, water: 1500 },
    suppliesCost: [
      { name: "어메니티 세트", quantity: 1, unit: "세트", unitPrice: 2500 },
      { name: "세탁 세제 (배분)", quantity: 0.1, unit: "개", unitPrice: 12000 },
      { name: "청소 용품 (배분)", quantity: 0.1, unit: "세트", unitPrice: 5000 },
      { name: "침구 교체 비용", quantity: 1, unit: "건", unitPrice: 3000 },
    ],
    monthlyStats: [
      { month: "2025.12", salesCount: 28, revenue: 3360000, avgMargin: 58 },
      { month: "2026.01", salesCount: 30, revenue: 3600000, avgMargin: 60 },
      { month: "2026.02", salesCount: 18, revenue: 2160000, avgMargin: 60 },
    ],
    seasonPrices: [
      { season: "비수기 (1~3월)", period: "01.01 ~ 03.31", price: 100000, active: true },
      { season: "성수기 (7~8월)", period: "07.01 ~ 08.31", price: 150000, active: true },
      { season: "일반", period: "그 외", price: 120000, active: true },
    ],
    memo: "최대 4인 기준. 추가 인원 시 20,000원/인 추가.",
    costAlert: null,
  },
  {
    id: 4, name: "해산물 바비큐", type: "식사",
    description: "제주 해산물과 고기를 함께 즐기는 바비큐 세트.",
    price: 35000, duration: "약 1시간 30분", maxCapacity: 30, unitBasis: "1인 기준",
    costStatus: "미완료", isActive: true, lastCostUpdate: "—",
    materials: [],
    laborCost: 0,
    utilityCost: { gas: 0, electric: 0, water: 0 },
    suppliesCost: [],
    monthlyStats: [
      { month: "2025.12", salesCount: 40, revenue: 1400000, avgMargin: 0 },
      { month: "2026.01", salesCount: 55, revenue: 1925000, avgMargin: 0 },
      { month: "2026.02", salesCount: 22, revenue: 770000, avgMargin: 0 },
    ],
    seasonPrices: [
      { season: "일반", period: "연중", price: 35000, active: true },
    ],
    memo: "",
    costAlert: "비용 설정이 아직 완료되지 않았습니다.",
  },
  {
    id: 5, name: "감귤잼 만들기", type: "체험",
    description: "직접 만든 감귤잼을 병에 담아가는 체험. 잼 1병 포함.",
    price: 20000, duration: "약 1시간", maxCapacity: 15, unitBasis: "1인 기준",
    costStatus: "완료", isActive: true, lastCostUpdate: "2026.01.28",
    materials: [
      { name: "감귤", quantity: 0.5, unit: "kg", unitPrice: 4000 },
      { name: "설탕", quantity: 0.2, unit: "kg", unitPrice: 1500 },
      { name: "유리병", quantity: 1, unit: "개", unitPrice: 1200 },
      { name: "체험 키트(감귤잼)", quantity: 1, unit: "세트", unitPrice: 3000 },
    ],
    laborCost: 2000,
    utilityCost: { gas: 500, electric: 300, water: 200 },
    suppliesCost: [
      { name: "포장 상자", quantity: 1, unit: "개", unitPrice: 800 },
      { name: "라벨 스티커", quantity: 1, unit: "장", unitPrice: 100 },
    ],
    monthlyStats: [
      { month: "2025.12", salesCount: 60, revenue: 1200000, avgMargin: 55 },
      { month: "2026.01", salesCount: 75, revenue: 1500000, avgMargin: 57 },
      { month: "2026.02", salesCount: 40, revenue: 800000, avgMargin: 57 },
    ],
    seasonPrices: [
      { season: "일반", period: "연중", price: 20000, active: true },
      { season: "성수기", period: "10~12월", price: 22000, active: true },
    ],
    memo: "유리병 재고 확인 필요. 단체 체험 시 보조 인력 1명 추가.",
    costAlert: "감귤잼 체험 키트 재고가 10세트 이하입니다.",
  },
  {
    id: 6, name: "승마 체험", type: "체험",
    description: "제주 조랑말과 함께하는 승마 체험. 안전 장비 제공.",
    price: 40000, duration: "약 40분", maxCapacity: 8, unitBasis: "1인 기준",
    costStatus: "완료", isActive: true, lastCostUpdate: "2026.02.03",
    materials: [
      { name: "말 사료 (배분)", quantity: 1, unit: "회", unitPrice: 5000 },
      { name: "안전모 소독", quantity: 1, unit: "건", unitPrice: 300 },
    ],
    laborCost: 12000,
    utilityCost: { gas: 0, electric: 200, water: 500 },
    suppliesCost: [
      { name: "마장 유지비 (배분)", quantity: 1, unit: "건", unitPrice: 2000 },
      { name: "보험료 (배분)", quantity: 1, unit: "건", unitPrice: 2000 },
    ],
    monthlyStats: [
      { month: "2025.12", salesCount: 45, revenue: 1800000, avgMargin: 44 },
      { month: "2026.01", salesCount: 52, revenue: 2080000, avgMargin: 45 },
      { month: "2026.02", salesCount: 28, revenue: 1120000, avgMargin: 45 },
    ],
    seasonPrices: [
      { season: "일반", period: "연중", price: 40000, active: true },
      { season: "성수기", period: "7~8월", price: 45000, active: false },
    ],
    memo: "현재 말 3마리 운영. 1마리 건강 검진 예정(2월 말).",
    costAlert: null,
  },
];

/* ═══ 재료 라이브러리 ═══ */
const materialsLibrary = [
  { id: 1, name: "감귤", unit: "킬로", price: 4000, category: "식자재", vendor: "한라산농산물마트", lastPurchase: "02.14", stock: 45, alert: 10, favorite: true },
  { id: 2, name: "당근", unit: "킬로", price: 3000, category: "식자재", vendor: "한라산농산물마트", lastPurchase: "02.14", stock: 20, alert: 5, favorite: true },
  { id: 3, name: "돼지고기 목살", unit: "킬로", price: 15000, category: "식자재", vendor: "○○마트", lastPurchase: "02.12", stock: 12, alert: 5, favorite: true },
  { id: 4, name: "양파", unit: "킬로", price: 2000, category: "식자재", vendor: "한라산마트", lastPurchase: "02.10", stock: 30, alert: 10, favorite: false },
  { id: 5, name: "고구마", unit: "킬로", price: 3500, category: "식자재", vendor: "농협마트", lastPurchase: "02.08", stock: 15, alert: 5, favorite: false },
  { id: 6, name: "체험 장갑", unit: "개", price: 500, category: "체험 자재", vendor: "다이소", lastPurchase: "02.05", stock: 200, alert: 50, favorite: true },
  { id: 7, name: "체험 키트(감귤잼)", unit: "세트", price: 3000, category: "체험 자재", vendor: "○○공방", lastPurchase: "01.28", stock: 35, alert: 10, favorite: false },
  { id: 8, name: "포장 상자", unit: "개", price: 800, category: "소모품", vendor: "포장마트", lastPurchase: "02.01", stock: 120, alert: 30, favorite: false },
  { id: 9, name: "어메니티 세트", unit: "세트", price: 2500, category: "소모품", vendor: "○○유통", lastPurchase: "02.03", stock: 50, alert: 15, favorite: false },
  { id: 10, name: "숯", unit: "상자", price: 8000, category: "식자재", vendor: "농협마트", lastPurchase: "02.06", stock: 8, alert: 5, favorite: false },
  { id: 11, name: "세탁 세제", unit: "개", price: 12000, category: "청소/세탁", vendor: "이마트", lastPurchase: "01.25", stock: 3, alert: 2, favorite: false },
  { id: 12, name: "청소 용품", unit: "세트", price: 5000, category: "청소/세탁", vendor: "다이소", lastPurchase: "01.20", stock: 6, alert: 3, favorite: false },
];

/* ═══ 등록 메뉴 (레시피) 타입 및 데이터 ═══ */
type MenuCategory = "메인" | "국/찌개" | "밥/죽" | "반찬" | "에피타이저" | "후식" | "소스/양념" | "기타";

interface MenuIngredient {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface RegisteredMenu {
  id: number;
  name: string;
  category: MenuCategory;
  servings: string;
  ingredients: MenuIngredient[];
  memo: string;
  usedInProducts: string[];
  createdAt: string;
}

const MENU_CATEGORIES: MenuCategory[] = ["메인", "국/찌개", "밥/죽", "반찬", "에피타이저", "후식", "소스/양념", "기타"];

const MENU_CAT_COLORS: Record<MenuCategory, string> = {
  "메인": "bg-[#FDECEC] text-[#C62828]",
  "국/찌개": "bg-[#FFF6E6] text-[#8A6A2B]",
  "밥/죽": "bg-[#F0F5F4] text-[#2F4F46]",
  "반찬": "bg-[#ECF7EE] text-[#1B5E20]",
  "에피타이저": "bg-[#F7F3ED] text-[#6B7280]",
  "후식": "bg-[#F3E8F9] text-[#7B1FA2]",
  "소스/양념": "bg-[#FFF6E6] text-[#8A6A2B]",
  "기타": "bg-[#F7F3ED] text-[#6B7280]",
};

const INITIAL_MENUS: RegisteredMenu[] = [
  {
    id: 1, name: "비지찌개", category: "국/찌개", servings: "1인분",
    ingredients: [
      { name: "비지", quantity: 150, unit: "g", unitPrice: 3 },
      { name: "묵은지", quantity: 80, unit: "g", unitPrice: 8 },
      { name: "들기름", quantity: 5, unit: "ml", unitPrice: 12 },
      { name: "치킨스톡", quantity: 5, unit: "g", unitPrice: 6 },
      { name: "다시다", quantity: 3, unit: "g", unitPrice: 4 },
      { name: "두부", quantity: 100, unit: "g", unitPrice: 4 },
      { name: "간장", quantity: 5, unit: "ml", unitPrice: 3 },
      { name: "소금", quantity: 2, unit: "g", unitPrice: 1 },
    ],
    memo: "묵은지는 잘 익은 것 사용. 비지는 당일 구매 권장.",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.10",
  },
  {
    id: 2, name: "미역감자죽", category: "에피타이저", servings: "1인분",
    ingredients: [
      { name: "불린 미역", quantity: 30, unit: "g", unitPrice: 10 },
      { name: "감자", quantity: 100, unit: "g", unitPrice: 3 },
      { name: "참기름", quantity: 5, unit: "ml", unitPrice: 15 },
      { name: "쌀", quantity: 50, unit: "g", unitPrice: 3 },
      { name: "소금", quantity: 2, unit: "g", unitPrice: 1 },
      { name: "다진마늘", quantity: 3, unit: "g", unitPrice: 8 },
    ],
    memo: "에피타이저로 소량 제공. 감자는 잘 으깨서 부드럽게.",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.10",
  },
  {
    id: 3, name: "삼겹살 쌈 세트", category: "메인", servings: "1인분",
    ingredients: [
      { name: "삼겹살", quantity: 200, unit: "g", unitPrice: 13 },
      { name: "쌈채소(상추,깻잎,배추)", quantity: 80, unit: "g", unitPrice: 6 },
      { name: "마늘", quantity: 15, unit: "g", unitPrice: 8 },
      { name: "고추", quantity: 10, unit: "g", unitPrice: 6 },
      { name: "쌈장", quantity: 20, unit: "g", unitPrice: 5 },
    ],
    memo: "삼겹살은 국내산 냉장만 사용.",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.10",
  },
  {
    id: 4, name: "무우보쌈", category: "반찬", servings: "1인분",
    ingredients: [
      { name: "무", quantity: 100, unit: "g", unitPrice: 2 },
      { name: "설탕", quantity: 10, unit: "g", unitPrice: 2 },
      { name: "식초", quantity: 10, unit: "ml", unitPrice: 2 },
      { name: "고춧가루", quantity: 5, unit: "g", unitPrice: 10 },
      { name: "매실청", quantity: 5, unit: "ml", unitPrice: 8 },
    ],
    memo: "",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.11",
  },
  {
    id: 5, name: "당근라페", category: "반찬", servings: "1인분",
    ingredients: [
      { name: "당근", quantity: 80, unit: "g", unitPrice: 3 },
      { name: "올리브오일", quantity: 5, unit: "ml", unitPrice: 10 },
      { name: "레몬즙", quantity: 3, unit: "ml", unitPrice: 15 },
      { name: "설탕", quantity: 3, unit: "g", unitPrice: 2 },
      { name: "소금", quantity: 1, unit: "g", unitPrice: 1 },
    ],
    memo: "",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.11",
  },
  {
    id: 6, name: "고추장아찌", category: "반찬", servings: "1인분",
    ingredients: [
      { name: "풋고추", quantity: 50, unit: "g", unitPrice: 6 },
      { name: "간장", quantity: 15, unit: "ml", unitPrice: 3 },
      { name: "식초", quantity: 10, unit: "ml", unitPrice: 2 },
      { name: "설탕", quantity: 8, unit: "g", unitPrice: 2 },
    ],
    memo: "일주일 전 미리 절여두기",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.11",
  },
  {
    id: 7, name: "밥 + 김치 세트", category: "밥/죽", servings: "1인분",
    ingredients: [
      { name: "쌀", quantity: 150, unit: "g", unitPrice: 3 },
      { name: "배추김치", quantity: 80, unit: "g", unitPrice: 5 },
    ],
    memo: "밥은 압력솥으로 지음",
    usedInProducts: ["항아리 바베큐", "흑돼지 식사"],
    createdAt: "2026.02.10",
  },
  {
    id: 8, name: "수정과", category: "후식", servings: "1인분",
    ingredients: [
      { name: "계피", quantity: 3, unit: "g", unitPrice: 20 },
      { name: "생강", quantity: 5, unit: "g", unitPrice: 10 },
      { name: "설탕", quantity: 20, unit: "g", unitPrice: 2 },
      { name: "잣", quantity: 3, unit: "g", unitPrice: 30 },
      { name: "곶감", quantity: 15, unit: "g", unitPrice: 20 },
    ],
    memo: "전날 미리 끓여서 냉장 보관",
    usedInProducts: ["항아리 바베큐"],
    createdAt: "2026.02.10",
  },
];

const calcMenuCost = (menu: RegisteredMenu) =>
  menu.ingredients.reduce((s, ing) => s + ing.quantity * ing.unitPrice, 0);

/* ═══ 템플릿 데이터 ═══ */
const templatesData = [
  { id: "exp-basic", name: "체험 기본", type: "체험", desc: "장갑, 소모품, 인건비 포함", items: ["체험 장갑", "체험 키트", "포장 상자"], laborIncluded: true, utilityIncluded: true, totalCost: 9800 },
  { id: "food-basic", name: "식사 기본", type: "식사", desc: "주재료, 부재료, 가스, 인건비 포함", items: ["돼지고기 목살", "양파", "당근", "숯"], laborIncluded: true, utilityIncluded: true, totalCost: 16300 },
  { id: "stay-basic", name: "숙박 기본", type: "숙박", desc: "청소, 세탁, 어메니티, 공과금 포함", items: ["어메니티 세트", "세탁 세제", "청소 용품"], laborIncluded: true, utilityIncluded: true, totalCost: 14200 },
  { id: "exp-premium", name: "프리미엄 체험", type: "체험", desc: "고급 재료 + 선물 포장 포함", items: ["체험 키트(감귤잼)", "포장 상자", "감귤"], laborIncluded: true, utilityIncluded: true, totalCost: 12500 },
];

const MATERIAL_FILTERS = ["전체", "식자재", "체험 자재", "소모품", "청소/세탁"];

const TYPE_COLORS: Record<string, string> = {
  "체험": "bg-[#ECF7EE] text-[#1B5E20]",
  "식사": "bg-[#FFF6E6] text-[#8A6A2B]",
  "숙박": "bg-[#F7F3ED] text-[#2F4F46]",
};

/* ═══ 유틸 함수 ═══ */
const calcProductTotalCost = (p: Product) => {
  const matCost = p.materials.reduce((s, m) => s + m.quantity * m.unitPrice, 0);
  const utilCost = p.utilityCost.gas + p.utilityCost.electric + p.utilityCost.water;
  const supCost = p.suppliesCost.reduce((s, s2) => s + s2.quantity * s2.unitPrice, 0);
  return matCost + p.laborCost + utilCost + supCost;
};

const calcCostBreakdown = (p: Product) => {
  const matCost = p.materials.reduce((s, m) => s + m.quantity * m.unitPrice, 0);
  const utilCost = p.utilityCost.gas + p.utilityCost.electric + p.utilityCost.water;
  const supCost = p.suppliesCost.reduce((s, s2) => s + s2.quantity * s2.unitPrice, 0);
  return { matCost, laborCost: p.laborCost, utilCost, supCost };
};

/* ═══ 컴포넌트 ═══ */
export function Products() {
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "materials" | "menus" | "templates">("products");
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<"cost" | "stats" | "season">("cost");

  /* 상품 목록 */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [sortBy, setSortBy] = useState<"name" | "margin" | "revenue">("name");

  /* 재료 목록 */
  const [matSearch, setMatSearch] = useState("");
  const [matFilter, setMatFilter] = useState("전체");
  const [matData, setMatData] = useState(materialsLibrary);

  /* 등록 메뉴 */
  const [menus, setMenus] = useState<RegisteredMenu[]>(INITIAL_MENUS);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("전체");
  const [expandedMenuId, setExpandedMenuId] = useState<number | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<RegisteredMenu | null>(null);

  /* 메뉴 등록 폼 상태 */
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<MenuCategory>("메인");
  const [formServings, setFormServings] = useState("1인분");
  const [formMemo, setFormMemo] = useState("");
  const [formUsedInProducts, setFormUsedInProducts] = useState("");
  const [formIngredients, setFormIngredients] = useState<MenuIngredient[]>([
    { name: "", quantity: 0, unit: "g", unitPrice: 0 },
  ]);

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter(p => {
      if (search && !p.name.includes(search) && !p.description.includes(search)) return false;
      if (typeFilter !== "전체" && p.type !== typeFilter) return false;
      if (statusFilter === "설정 완료" && p.costStatus !== "완료") return false;
      if (statusFilter === "미완료" && p.costStatus !== "미완료") return false;
      if (statusFilter === "주의" && !p.costAlert) return false;
      return true;
    });
    if (sortBy === "margin") {
      result = [...result].sort((a, b) => {
        const mA = a.costStatus === "완료" ? Math.round(((a.price - calcProductTotalCost(a)) / a.price) * 100) : -1;
        const mB = b.costStatus === "완료" ? Math.round(((b.price - calcProductTotalCost(b)) / b.price) * 100) : -1;
        return mB - mA;
      });
    } else if (sortBy === "revenue") {
      result = [...result].sort((a, b) => {
        const rA = a.monthlyStats[a.monthlyStats.length - 1]?.revenue || 0;
        const rB = b.monthlyStats[b.monthlyStats.length - 1]?.revenue || 0;
        return rB - rA;
      });
    }
    return result;
  }, [search, typeFilter, statusFilter, sortBy]);

  const filteredMats = matData.filter(m => {
    if (matSearch && !m.name.includes(matSearch)) return false;
    if (matFilter !== "전체" && m.category !== matFilter) return false;
    return true;
  });

  const toggleFav = (id: number) => {
    setMatData(prev => prev.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m));
  };

  /* 통계 요약 */
  const summaryStats = useMemo(() => {
    const completed = PRODUCTS.filter(p => p.costStatus === "완료");
    const avgMargin = completed.length > 0
      ? Math.round(completed.reduce((s, p) => s + ((p.price - calcProductTotalCost(p)) / p.price) * 100, 0) / completed.length)
      : 0;
    const thisMonthRevenue = PRODUCTS.reduce((s, p) => s + (p.monthlyStats[p.monthlyStats.length - 1]?.revenue || 0), 0);
    const alertCount = PRODUCTS.filter(p => p.costAlert).length;
    return {
      total: PRODUCTS.length,
      completed: completed.length,
      incomplete: PRODUCTS.filter(p => p.costStatus === "미완료").length,
      avgMargin,
      thisMonthRevenue,
      alertCount,
    };
  }, []);

  const tabs = [
    { key: "products" as const, label: "상품 목록", icon: Package, count: PRODUCTS.length },
    { key: "materials" as const, label: "재료·자재 목록", icon: Layers, count: matData.length },
    { key: "menus" as const, label: "등록 메뉴", icon: UtensilsCrossed, count: menus.length },
    { key: "templates" as const, label: "템플릿", icon: FileText, count: templatesData.length },
  ];

  /* ─── 비용 구성 시각화 바 ─── */
  const CostBar = ({ product }: { product: Product }) => {
    const total = calcProductTotalCost(product);
    if (total === 0) return null;
    const { matCost, laborCost, utilCost, supCost } = calcCostBreakdown(product);
    const segments = [
      { label: "재료", value: matCost, color: "#2F4F46" },
      { label: "인건비", value: laborCost, color: "#5B8A72" },
      { label: "공과금", value: utilCost, color: "#9CA3AF" },
      { label: "소모품", value: supCost, color: "#D6D0C8" },
    ].filter(s => s.value > 0);
    return (
      <div className="space-y-2">
        <div className="h-[8px] rounded-full overflow-hidden flex bg-[#F3EFE8]">
          {segments.map(seg => (
            <div key={seg.label} className="h-full transition-all" style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }} />
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] text-[#6B7280]">{seg.label} {Math.round((seg.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ─── 마진 건강도 표시 ─── */
  const MarginBadge = ({ margin }: { margin: number }) => {
    if (margin >= 50) return <span className="text-[13px] px-2.5 py-1 rounded-lg bg-[#ECF7EE] text-[#1B5E20]" style={{ fontWeight: 700 }}>매우 좋음</span>;
    if (margin >= 40) return <span className="text-[13px] px-2.5 py-1 rounded-lg bg-[#ECF7EE] text-[#1B5E20]" style={{ fontWeight: 700 }}>좋음</span>;
    if (margin >= 25) return <span className="text-[13px] px-2.5 py-1 rounded-lg bg-[#FFF6E6] text-[#8A6A2B]" style={{ fontWeight: 700 }}>보통</span>;
    return <span className="text-[13px] px-2.5 py-1 rounded-lg bg-[#FDECEC] text-[#C62828]" style={{ fontWeight: 700 }}>주의</span>;
  };

  /* ─── 미니 월간 차트 ─── */
  const MiniChart = ({ stats }: { stats: MonthlyStat[] }) => {
    const maxRev = Math.max(...stats.map(s => s.revenue), 1);
    return (
      <div className="flex items-end gap-1.5 h-[40px]">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className="w-[18px] rounded-t-sm bg-[#2F4F46] transition-all"
              style={{ height: `${Math.max((s.revenue / maxRev) * 36, 3)}px`, opacity: i === stats.length - 1 ? 1 : 0.4 }}
            />
            <span className="text-[9px] text-[#9CA3AF]">{s.month.split(".")[1]}월</span>
          </div>
        ))}
      </div>
    );
  };

  /* ═══ 상품 목록 렌더링 ═══ */
  const renderProductsTab = () => (
    <div className="space-y-5">
      {/* 요약 대시보드 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "전체 상품", value: `${summaryStats.total}개`, sub: `완료 ${summaryStats.completed} · 미완료 ${summaryStats.incomplete}`, icon: Package, color: "#2F4F46" },
          { label: "평균 남는 비율", value: `${summaryStats.avgMargin}%`, sub: summaryStats.avgMargin >= 40 ? "건강한 수준" : "점검 필요", icon: BarChart3, color: summaryStats.avgMargin >= 40 ? "#1B5E20" : "#8A6A2B" },
          { label: "이번 달 매출", value: `${(summaryStats.thisMonthRevenue / 10000).toFixed(0)}만원`, sub: "2026년 2월 기준", icon: TrendingUp, color: "#2F4F46" },
          { label: "주의 항목", value: `${summaryStats.alertCount}건`, sub: "비용 변동·재고 알림", icon: AlertTriangle, color: summaryStats.alertCount > 0 ? "#C62828" : "#9CA3AF" },
          { label: "최근 비용 수정", value: "02.12", sub: "흑돼지 식사", icon: Clock, color: "#6B7280" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-2.5">
              <card.icon size={16} className="text-[#9CA3AF]" />
              <span className="text-[13px] text-[#6B7280]">{card.label}</span>
            </div>
            <p className="text-[20px]" style={{ fontWeight: 700, color: card.color }}>{card.value}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 필터 + 정렬 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="상품명 또는 설명 검색"
              className="h-[44px] w-[260px] pl-10 pr-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["전체", "체험", "식사", "숙박"].map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`text-[13px] px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  typeFilter === f ? "bg-[#2F4F46] text-white" : "bg-white border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="w-[1px] h-[24px] bg-[#E6E2DB]" />
          <div className="flex gap-2">
            {[
              { key: "전체", label: "전체" },
              { key: "설정 완료", label: "설정 완료" },
              { key: "미완료", label: "미완료" },
              { key: "주의", label: "주의" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`text-[12px] px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === f.key ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#9CA3AF]">정렬:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="h-[36px] pl-3 pr-7 rounded-lg border border-[#D6D0C8] bg-white text-[13px] appearance-none cursor-pointer"
            >
              <option value="name">이름순</option>
              <option value="margin">남는 비율순</option>
              <option value="revenue">매출순</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 상품 카드 리스트 */}
      <div className="space-y-4">
        {filteredProducts.map(p => {
          const totalCost = calcProductTotalCost(p);
          const remaining = p.price - totalCost;
          const margin = p.costStatus === "완료" ? Math.round((remaining / p.price) * 100) : null;
          const isExpanded = expandedProduct === p.id;
          const lastStat = p.monthlyStats[p.monthlyStats.length - 1];
          const prevStat = p.monthlyStats.length >= 2 ? p.monthlyStats[p.monthlyStats.length - 2] : null;
          const revenueTrend = prevStat ? ((lastStat.revenue - prevStat.revenue) / prevStat.revenue) * 100 : 0;

          return (
            <div key={p.id} className={`bg-white rounded-[14px] border shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all ${
              p.costAlert ? "border-[#E6B96E]" : "border-[#E6E2DB]"
            } ${isExpanded ? "shadow-[0_4px_20px_rgba(0,0,0,0.08)]" : "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"}`}>

              {/* 알림 배너 */}
              {p.costAlert && !isExpanded && (
                <div className="px-6 py-2.5 bg-[#FFF6E6] rounded-t-[14px] border-b border-[#E6E2DB] flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#8A6A2B]" />
                  <span className="text-[13px] text-[#8A6A2B]">{p.costAlert}</span>
                </div>
              )}

              {/* 메인 카드 */}
              <div
                className="px-6 py-5 cursor-pointer"
                onClick={() => { setExpandedProduct(isExpanded ? null : p.id); setDetailTab("cost"); }}
              >
                <div className="flex items-start gap-6">
                  {/* 좌측: 기본 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className={`text-[12px] px-2.5 py-0.5 rounded-lg ${TYPE_COLORS[p.type]}`}>{p.type}</span>
                      {p.costStatus === "완료" ? (
                        <span className="text-[11px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-0.5 rounded flex items-center gap-1"><Check size={10} /> 비용 완료</span>
                      ) : (
                        <span className="text-[11px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle size={10} /> 미완료</span>
                      )}
                      {!p.isActive && (
                        <span className="text-[11px] text-[#9CA3AF] bg-[#F3EFE8] px-2 py-0.5 rounded flex items-center gap-1"><EyeOff size={10} /> 비활성</span>
                      )}
                    </div>
                    <h3 className="text-[17px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>{p.name}</h3>
                    <p className="text-[13px] text-[#9CA3AF] mb-3">{p.description}</p>
                    <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
                      <span className="flex items-center gap-1"><Clock size={13} /> {p.duration}</span>
                      <span className="flex items-center gap-1"><Users size={13} /> 최대 {p.maxCapacity}명</span>
                      <span>{p.unitBasis}</span>
                    </div>
                  </div>

                  {/* 중앙: 가격/원가 정보 */}
                  <div className="w-[240px] shrink-0">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[13px] text-[#6B7280]">판매가</span>
                        <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{p.price.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[13px] text-[#6B7280]">들어간 비용</span>
                        <span className="text-[14px] text-[#1F2937]">{p.costStatus === "완료" ? `${totalCost.toLocaleString()}원` : "—"}</span>
                      </div>
                      <div className="border-t border-[#F3EFE8] pt-2 flex justify-between">
                        <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>남는 금액</span>
                        <span className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
                          {p.costStatus === "완료" ? `${remaining.toLocaleString()}원` : "—"}
                        </span>
                      </div>
                      {margin !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-[#6B7280]">남는 비율</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[14px] ${margin >= 40 ? "text-[#1B5E20]" : margin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>{margin}%</span>
                            <MarginBadge margin={margin} />
                          </div>
                        </div>
                      )}
                    </div>
                    {p.costStatus === "완료" && (
                      <div className="mt-3">
                        <CostBar product={p} />
                      </div>
                    )}
                  </div>

                  {/* 우측: 실적 + 펼치기 */}
                  <div className="w-[160px] shrink-0 flex flex-col items-end">
                    <MiniChart stats={p.monthlyStats} />
                    <div className="mt-2 text-right">
                      <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                        {lastStat ? `${(lastStat.revenue / 10000).toFixed(0)}만원` : "—"}
                      </p>
                      <p className="text-[12px] text-[#9CA3AF]">이번 달 매출</p>
                      {prevStat && (
                        <p className={`text-[11px] flex items-center justify-end gap-0.5 mt-0.5 ${revenueTrend >= 0 ? "text-[#1B5E20]" : "text-[#C62828]"}`}>
                          {revenueTrend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          전월 대비 {Math.abs(Math.round(revenueTrend))}%
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[12px] text-[#9CA3AF]">
                      {isExpanded ? "접기" : "상세 보기"} <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 확장 상세 영역 */}
              {isExpanded && (
                <div className="border-t border-[#E6E2DB]">
                  {/* 상세 탭 */}
                  <div className="px-6 py-3 border-b border-[#F3EFE8] flex items-center gap-1">
                    {[
                      { key: "cost" as const, label: "원가 상세" },
                      { key: "stats" as const, label: "월간 실적" },
                      { key: "season" as const, label: "계절별 가격" },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={e => { e.stopPropagation(); setDetailTab(tab.key); }}
                        className={`text-[13px] px-4 py-2 rounded-lg transition-all cursor-pointer ${
                          detailTab === tab.key
                            ? "bg-[#2F4F46] text-white"
                            : "text-[#6B7280] hover:bg-[#F7F3ED]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setShowWizard(true); }}
                        className="text-[13px] px-4 py-2 rounded-lg border border-[#2F4F46] text-[#2F4F46] hover:bg-[#F7F3ED] cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 size={13} /> 비용 수정
                      </button>
                      <button onClick={e => e.stopPropagation()} className="text-[13px] px-3 py-2 rounded-lg border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors flex items-center gap-1.5">
                        <Copy size={13} /> 복제
                      </button>
                      <button onClick={e => e.stopPropagation()} className="text-[13px] px-3 py-2 rounded-lg border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors flex items-center gap-1.5">
                        <Archive size={13} /> 보관
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-5" onClick={e => e.stopPropagation()}>
                    {/* 원가 상세 */}
                    {detailTab === "cost" && p.costStatus === "완료" && (
                      <div className="grid grid-cols-2 gap-6">
                        {/* 좌측: 비용 항목 테이블 */}
                        <div className="space-y-4">
                          {/* 재료/자재 */}
                          <div>
                            <h4 className="text-[14px] text-[#1F2937] mb-2.5 flex items-center gap-2" style={{ fontWeight: 700 }}>
                              <span className="w-2.5 h-2.5 rounded-full bg-[#2F4F46]" /> 재료 / 자재
                            </h4>
                            <div className="bg-[#FBFAF7] rounded-xl overflow-hidden">
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    {["품목", "수량", "단가", "합계"].map(h => (
                                      <th key={h} className="text-[12px] text-[#9CA3AF] px-3 py-2 text-left" style={{ fontWeight: 700 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.materials.map((m, i) => (
                                    <tr key={i} className="border-t border-[#F3EFE8]">
                                      <td className="text-[13px] text-[#1F2937] px-3 py-2">{m.name}</td>
                                      <td className="text-[13px] text-[#6B7280] px-3 py-2">{m.quantity}{m.unit}</td>
                                      <td className="text-[13px] text-[#6B7280] px-3 py-2">{m.unitPrice.toLocaleString()}원</td>
                                      <td className="text-[13px] text-[#1F2937] px-3 py-2" style={{ fontWeight: 700 }}>{(m.quantity * m.unitPrice).toLocaleString()}원</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="border-t border-[#E6E2DB] px-3 py-2 flex justify-between">
                                <span className="text-[12px] text-[#6B7280]">소계</span>
                                <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                                  {p.materials.reduce((s, m) => s + m.quantity * m.unitPrice, 0).toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 인건비 */}
                          <div className="flex items-center justify-between bg-[#FBFAF7] rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#5B8A72]" />
                              <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>인건비</span>
                            </div>
                            <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{p.laborCost.toLocaleString()}원</span>
                          </div>

                          {/* 공과금 */}
                          <div className="bg-[#FBFAF7] rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" />
                                <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>공과금</span>
                              </div>
                              <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                                {(p.utilityCost.gas + p.utilityCost.electric + p.utilityCost.water).toLocaleString()}원
                              </span>
                            </div>
                            <div className="flex gap-4 text-[12px] text-[#6B7280]">
                              <span>가스 {p.utilityCost.gas.toLocaleString()}원</span>
                              <span>전기 {p.utilityCost.electric.toLocaleString()}원</span>
                              <span>수도 {p.utilityCost.water.toLocaleString()}원</span>
                            </div>
                          </div>

                          {/* 소모품 */}
                          {p.suppliesCost.length > 0 && (
                            <div>
                              <h4 className="text-[14px] text-[#1F2937] mb-2.5 flex items-center gap-2" style={{ fontWeight: 700 }}>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D6D0C8]" /> 소모품 / 기타
                              </h4>
                              <div className="bg-[#FBFAF7] rounded-xl overflow-hidden">
                                <table className="w-full">
                                  <tbody>
                                    {p.suppliesCost.map((s, i) => (
                                      <tr key={i} className={i > 0 ? "border-t border-[#F3EFE8]" : ""}>
                                        <td className="text-[13px] text-[#1F2937] px-3 py-2">{s.name}</td>
                                        <td className="text-[13px] text-[#6B7280] px-3 py-2">{s.quantity}{s.unit}</td>
                                        <td className="text-[13px] text-[#1F2937] px-3 py-2 text-right" style={{ fontWeight: 700 }}>{(s.quantity * s.unitPrice).toLocaleString()}원</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="border-t border-[#E6E2DB] px-3 py-2 flex justify-between">
                                  <span className="text-[12px] text-[#6B7280]">소계</span>
                                  <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                                    {p.suppliesCost.reduce((s, s2) => s + s2.quantity * s2.unitPrice, 0).toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 우측: 수익 분석 요약 */}
                        <div className="space-y-4">
                          {/* 수익 구조 카드 */}
                          <div className="bg-[#F7F3ED] rounded-xl p-5 space-y-3">
                            <h4 className="text-[14px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>수익 구조 요약</h4>
                            <div className="space-y-2.5">
                              <div className="flex justify-between">
                                <span className="text-[14px] text-[#6B7280]">판매가</span>
                                <span className="text-[14px] text-[#1F2937]">{p.price.toLocaleString()}원</span>
                              </div>
                              {(() => {
                                const { matCost, laborCost: lc, utilCost, supCost } = calcCostBreakdown(p);
                                return (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#9CA3AF] pl-3">− 재료/자재</span>
                                      <span className="text-[13px] text-[#6B7280]">{matCost.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#9CA3AF] pl-3">− 인건비</span>
                                      <span className="text-[13px] text-[#6B7280]">{lc.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#9CA3AF] pl-3">− 공���금</span>
                                      <span className="text-[13px] text-[#6B7280]">{utilCost.toLocaleString()}원</span>
                                    </div>
                                    {supCost > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-[13px] text-[#9CA3AF] pl-3">− 소모품/기타</span>
                                        <span className="text-[13px] text-[#6B7280]">{supCost.toLocaleString()}원</span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                              <div className="border-t border-[#E6E2DB] pt-2.5 flex justify-between">
                                <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>남는 금액</span>
                                <span className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{remaining.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[14px] text-[#6B7280]">남는 비율</span>
                                {margin !== null && (
                                  <span className={`text-[16px] ${margin >= 40 ? "text-[#1B5E20]" : margin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>
                                    {margin}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 손익분기점 */}
                          <div className="bg-white rounded-xl border border-[#E6E2DB] p-5 space-y-3">
                            <h4 className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>손익분기 분석</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-[13px] text-[#6B7280]">1건당 순이익</span>
                                <span className="text-[14px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{remaining.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[13px] text-[#6B7280]">이번 달 판매</span>
                                <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{lastStat?.salesCount || 0}건</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[13px] text-[#6B7280]">이번 달 순이익 추정</span>
                                <span className="text-[15px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
                                  {((lastStat?.salesCount || 0) * remaining).toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 메모 */}
                          {p.memo && (
                            <div className="bg-[#FBFAF7] rounded-xl px-4 py-3.5">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Info size={13} className="text-[#9CA3AF]" />
                                <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>메모</span>
                              </div>
                              <p className="text-[13px] text-[#6B7280]">{p.memo}</p>
                            </div>
                          )}

                          <p className="text-[12px] text-[#9CA3AF]">마지막 비용 수정: {p.lastCostUpdate}</p>
                        </div>
                      </div>
                    )}

                    {detailTab === "cost" && p.costStatus === "미완료" && (
                      <div className="text-center py-10">
                        <AlertTriangle size={36} className="text-[#D6D0C8] mx-auto mb-3" />
                        <p className="text-[16px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>비용 설정이 아직 완료되지 않았습니다</p>
                        <p className="text-[14px] text-[#9CA3AF] mb-5">비용을 설정하면 남는 금액과 수익률을 확인할 수 있습니다.</p>
                        <button
                          onClick={() => setShowWizard(true)}
                          className="h-[48px] px-8 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer"
                        >
                          비용 설정 시작하기
                        </button>
                      </div>
                    )}

                    {/* 월간 실적 */}
                    {detailTab === "stats" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-3 gap-4">
                          {p.monthlyStats.map((s, i) => {
                            const prev = i > 0 ? p.monthlyStats[i - 1] : null;
                            const trend = prev ? ((s.revenue - prev.revenue) / prev.revenue) * 100 : 0;
                            const isCurrent = i === p.monthlyStats.length - 1;
                            return (
                              <div key={s.month} className={`rounded-xl p-5 border ${isCurrent ? "border-[#2F4F46] bg-white" : "border-[#E6E2DB] bg-[#FBFAF7]"}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                                    {s.month.split(".")[0]}년 {parseInt(s.month.split(".")[1])}월
                                  </span>
                                  {isCurrent && <span className="text-[11px] text-[#2F4F46] bg-[#ECF7EE] px-2 py-0.5 rounded">진행중</span>}
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[13px] text-[#6B7280]">판매 건수</span>
                                    <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{s.salesCount}건</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[13px] text-[#6B7280]">매출</span>
                                    <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{(s.revenue / 10000).toFixed(0)}만원</span>
                                  </div>
                                  {p.costStatus === "완료" && (
                                    <div className="flex justify-between">
                                      <span className="text-[13px] text-[#6B7280]">추정 순이익</span>
                                      <span className="text-[14px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
                                        {((s.salesCount * remaining) / 10000).toFixed(0)}만원
                                      </span>
                                    </div>
                                  )}
                                  {prev && (
                                    <div className="border-t border-[#F3EFE8] pt-2">
                                      <span className={`text-[12px] flex items-center gap-0.5 ${trend >= 0 ? "text-[#1B5E20]" : "text-[#C62828]"}`}>
                                        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        전월 대비 {Math.abs(Math.round(trend))}% {trend >= 0 ? "증가" : "감소"}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 매출 바 시각화 */}
                                <div className="mt-3 h-[6px] rounded-full bg-[#F3EFE8]">
                                  <div
                                    className="h-full rounded-full bg-[#2F4F46] transition-all"
                                    style={{ width: `${Math.min((s.revenue / Math.max(...p.monthlyStats.map(ms => ms.revenue))) * 100, 100)}%`, opacity: isCurrent ? 1 : 0.5 }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 계절별 가격 */}
                    {detailTab === "season" && (
                      <div className="space-y-5">
                        <p className="text-[14px] text-[#6B7280]">시기별로 다른 가격을 설정할 수 있습니다. 활성화된 가격이 해당 기간에 자동 적용됩니다.</p>
                        <div className="space-y-3">
                          {p.seasonPrices.map((sp, i) => {
                            const seasonCost = p.costStatus === "완료" ? totalCost : 0;
                            const seasonRemaining = sp.price - seasonCost;
                            const seasonMargin = sp.price > 0 && p.costStatus === "완료" ? Math.round((seasonRemaining / sp.price) * 100) : null;
                            return (
                              <div key={i} className={`rounded-xl border p-5 ${sp.active ? "border-[#2F4F46] bg-white" : "border-[#E6E2DB] bg-[#FBFAF7]"}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${sp.active ? "bg-[#1B5E20]" : "bg-[#D6D0C8]"}`} />
                                    <div>
                                      <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{sp.season}</p>
                                      <p className="text-[13px] text-[#9CA3AF]">{sp.period}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-right">
                                      <p className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{sp.price.toLocaleString()}원</p>
                                      {seasonMargin !== null && (
                                        <p className={`text-[12px] ${seasonMargin >= 40 ? "text-[#1B5E20]" : seasonMargin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`}>
                                          남는 비율 {seasonMargin}%
                                        </p>
                                      )}
                                    </div>
                                    <span className={`text-[12px] px-3 py-1 rounded-lg ${sp.active ? "bg-[#ECF7EE] text-[#1B5E20]" : "bg-[#F3EFE8] text-[#9CA3AF]"}`}>
                                      {sp.active ? "활성" : "비활성"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button className="text-[13px] text-[#2F4F46] flex items-center gap-1.5 cursor-pointer hover:underline">
                          <Plus size={14} /> 새 시즌 가격 추가
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══ 재료·자재 목록 ═══ */
  const renderMaterialsTab = () => (
    <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E6E2DB] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={matSearch}
              onChange={e => setMatSearch(e.target.value)}
              placeholder="재료 이름 검색"
              className="h-[40px] w-[220px] pl-9 pr-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {MATERIAL_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setMatFilter(f)}
                className={`text-[13px] px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  matFilter === f ? "bg-[#2F4F46] text-white" : "bg-[#F7F3ED] text-[#6B7280] hover:bg-[#E6E2DB]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="h-[40px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
          <Plus size={14} /> 새 재료 등록
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FBFAF7]">
              {["", "재료명", "분류", "단위", "최근 단가", "거래처", "최근 구매", "재고", "알림 기준", ""].map((h, i) => (
                <th key={i} className="text-left text-[13px] text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg whitespace-nowrap" style={{ fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMats.map(m => (
              <tr key={m.id} className="border-b border-[#F3EFE8] hover:bg-[#FBFAF7] transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => toggleFav(m.id)} className="cursor-pointer">
                    <Star size={15} className={m.favorite ? "text-[#8A6A2B] fill-[#8A6A2B]" : "text-[#D6D0C8]"} />
                  </button>
                </td>
                <td className="px-4 py-3 text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{m.name}</td>
                <td className="px-4 py-3"><span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-0.5 rounded">{m.category}</span></td>
                <td className="px-4 py-3 text-[14px] text-[#6B7280]">{m.unit}</td>
                <td className="px-4 py-3 text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{m.price.toLocaleString()}원</td>
                <td className="px-4 py-3 text-[14px] text-[#6B7280]">{m.vendor}</td>
                <td className="px-4 py-3 text-[14px] text-[#9CA3AF]">{m.lastPurchase}</td>
                <td className="px-4 py-3">
                  <span className={`text-[14px] ${m.stock <= m.alert ? "text-[#C62828]" : "text-[#1F2937]"}`} style={{ fontWeight: m.stock <= m.alert ? 700 : 400 }}>
                    {m.stock}{m.unit === "킬로" ? "kg" : m.unit}
                  </span>
                  {m.stock <= m.alert && <span className="ml-1.5 text-[11px] text-[#C62828] bg-[#FDECEC] px-1.5 py-0.5 rounded">부족</span>}
                </td>
                <td className="px-4 py-3 text-[14px] text-[#9CA3AF]">{m.alert}{m.unit === "킬로" ? "kg" : m.unit} 이하</td>
                <td className="px-4 py-3">
                  <button className="text-[#9CA3AF] hover:text-[#2F4F46] cursor-pointer"><Edit2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center gap-6">
        <span className="text-[13px] text-[#6B7280]">전체 재료: <strong className="text-[#1F2937]">{matData.length}개</strong></span>
        <span className="text-[13px] text-[#6B7280]">즐겨찾기: <strong className="text-[#1F2937]">{matData.filter(m => m.favorite).length}개</strong></span>
        <span className="text-[13px] text-[#C62828]">재고 부족: <strong>{matData.filter(m => m.stock <= m.alert).length}개</strong></span>
      </div>
    </div>
  );

  /* ═══ 등록 메뉴 탭 ═══ */
  const filteredMenus = menus.filter(m => {
    if (menuSearch && !m.name.includes(menuSearch)) return false;
    if (menuCatFilter !== "전체" && m.category !== menuCatFilter) return false;
    return true;
  });

  const openMenuForm = (menu?: RegisteredMenu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormName(menu.name);
      setFormCategory(menu.category);
      setFormServings(menu.servings);
      setFormMemo(menu.memo);
      setFormUsedInProducts(menu.usedInProducts.join(", "));
      setFormIngredients([...menu.ingredients]);
    } else {
      setEditingMenu(null);
      setFormName("");
      setFormCategory("메인");
      setFormServings("1인분");
      setFormMemo("");
      setFormUsedInProducts("");
      setFormIngredients([{ name: "", quantity: 0, unit: "g", unitPrice: 0 }]);
    }
    setShowMenuForm(true);
  };

  const addFormIngredient = () => {
    setFormIngredients(prev => [...prev, { name: "", quantity: 0, unit: "g", unitPrice: 0 }]);
  };

  const updateFormIngredient = (index: number, field: keyof MenuIngredient, value: string | number) => {
    setFormIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, [field]: value } : ing));
  };

  const removeFormIngredient = (index: number) => {
    setFormIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const saveMenu = () => {
    const validIngredients = formIngredients.filter(ing => ing.name.trim() !== "");
    if (!formName.trim()) return;

    const parsedProducts = formUsedInProducts.split(",").map(s => s.trim()).filter(s => s.length > 0);
    if (editingMenu) {
      setMenus(prev => prev.map(m => m.id === editingMenu.id ? {
        ...m, name: formName, category: formCategory, servings: formServings,
        memo: formMemo, ingredients: validIngredients, usedInProducts: parsedProducts,
      } : m));
    } else {
      const newMenu: RegisteredMenu = {
        id: Date.now(), name: formName, category: formCategory, servings: formServings,
        ingredients: validIngredients, memo: formMemo,
        usedInProducts: parsedProducts, createdAt: "2026.02.20",
      };
      setMenus(prev => [newMenu, ...prev]);
    }
    setShowMenuForm(false);
  };

  const deleteMenu = (id: number) => {
    setMenus(prev => prev.filter(m => m.id !== id));
    if (expandedMenuId === id) setExpandedMenuId(null);
  };

  const formTotalCost = formIngredients.reduce((s, ing) => s + ing.quantity * ing.unitPrice, 0);

  /* 코스 순서 정렬용 */
  const COURSE_ORDER: Record<MenuCategory, number> = {
    "에피타이저": 0, "메인": 1, "반찬": 2, "국/찌개": 3,
    "밥/죽": 4, "소스/양념": 5, "후식": 6, "기타": 7,
  };

  /* 세트 자동 구성 — usedInProducts 기준 그룹핑 */
  const menuSets = useMemo(() => {
    const setMap = new Map<string, RegisteredMenu[]>();
    menus.forEach(m => {
      m.usedInProducts.forEach(prod => {
        if (!setMap.has(prod)) setMap.set(prod, []);
        setMap.get(prod)!.push(m);
      });
    });
    return Array.from(setMap.entries()).map(([name, items]) => ({
      name,
      items: [...items].sort((a, b) => COURSE_ORDER[a.category] - COURSE_ORDER[b.category]),
      totalCost: items.reduce((s, m) => s + calcMenuCost(m), 0),
      totalIngredients: items.reduce((s, m) => s + m.ingredients.length, 0),
    }));
  }, [menus]);

  const unassignedMenus = menus.filter(m => m.usedInProducts.length === 0);
  const [expandedSetName, setExpandedSetName] = useState<string | null>(null);
  const [menuSubView, setMenuSubView] = useState<"sets" | "all">("sets");

  const renderMenusTab = () => (
    <div className="space-y-5">
      {/* ── 상단 요약 ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "코스 세트", value: `${menuSets.length}개`, icon: Layers, color: "#2F4F46" },
          { label: "등록 메뉴", value: `${menus.length}개`, icon: UtensilsCrossed, color: "#8A6A2B" },
          { label: "평균 세트 원가", value: menuSets.length > 0 ? `${Math.round(menuSets.reduce((s, st) => s + st.totalCost, 0) / menuSets.length).toLocaleString()}원` : "—", icon: BarChart3, color: "#1B5E20" },
          { label: "단독 메뉴", value: `${unassignedMenus.length}개`, icon: ChefHat, color: "#6B7280" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={15} className="text-[#9CA3AF]" />
              <span className="text-[13px] text-[#6B7280]">{card.label}</span>
            </div>
            <p className="text-[20px]" style={{ fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── 뷰 전환 + 검색 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {([
            { key: "sets" as const, label: "코스 세트", icon: Layers },
            { key: "all" as const, label: "전체 메뉴", icon: UtensilsCrossed },
          ]).map(v => (
            <button key={v.key} onClick={() => setMenuSubView(v.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] cursor-pointer transition-all ${menuSubView === v.key ? "bg-[#2F4F46] text-white" : "bg-white border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"}`}
            ><v.icon size={14} /> {v.label}</button>
          ))}
          {menuSubView === "all" && (<>
            <div className="w-[1px] h-5 bg-[#E6E2DB] mx-1" />
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={menuSearch} onChange={e => setMenuSearch(e.target.value)} placeholder="메뉴명 검색"
                className="h-[36px] w-[180px] pl-8 pr-3 rounded-xl border border-[#D6D0C8] bg-white text-[13px] focus:border-[#2F4F46] focus:outline-none" />
            </div>
            <div className="flex gap-1.5">
              {["전체", ...MENU_CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setMenuCatFilter(cat)}
                  className={`text-[12px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${menuCatFilter === cat ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]" : "text-[#9CA3AF] hover:text-[#6B7280]"}`}
                  style={{ fontWeight: menuCatFilter === cat ? 700 : 400 }}>{cat}</button>
              ))}
            </div>
          </>)}
        </div>
        <button onClick={() => openMenuForm()} className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
          <Plus size={15} /> 새 메뉴 등록
        </button>
      </div>

      {/* ══ 코스 세트 뷰 ══ */}
      {menuSubView === "sets" && (
        <div className="space-y-4">
          {menuSets.length === 0 ? (
            <div className="bg-white rounded-[14px] border border-[#E6E2DB] py-12 text-center">
              <Layers size={28} className="text-[#D6D0C8] mx-auto mb-3" />
              <p className="text-[15px] text-[#6B7280]" style={{ fontWeight: 700 }}>코스 세트가 없습니다</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">메뉴 등록 시 '사용 상품'을 입력하면 자동으로 세트가 만들어집니다.</p>
            </div>
          ) : (
            menuSets.map(set => {
              const isOpen = expandedSetName === set.name;
              return (
                <div key={set.name} className={`bg-white rounded-[14px] border shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all ${isOpen ? "border-[#2F4F46] shadow-[0_4px_20px_rgba(0,0,0,0.08)]" : "border-[#E6E2DB] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"}`}>
                  {/* 세트 헤더 */}
                  <div className="px-6 py-5 cursor-pointer" onClick={() => setExpandedSetName(isOpen ? null : set.name)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#2F4F46] flex items-center justify-center shrink-0">
                          <ChefHat size={22} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <h3 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>{set.name} 코스</h3>
                            <span className="text-[12px] text-[#2F4F46] bg-[#ECF7EE] px-2.5 py-0.5 rounded-lg" style={{ fontWeight: 700 }}>{set.items.length}가지 메뉴</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {set.items.map((m, i) => (
                              <span key={m.id} className="text-[12px] text-[#6B7280]">
                                {m.name}{i < set.items.length - 1 && <span className="text-[#D6D0C8] ml-2">→</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-[12px] text-[#9CA3AF]">1인분 원가 합계</p>
                          <p className="text-[20px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{set.totalCost.toLocaleString()}원</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={e => { e.stopPropagation(); setShowWizard(true); }}
                            className="h-[40px] px-4 rounded-xl bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] cursor-pointer transition-colors flex items-center gap-1.5">
                            <Copy size={13} /> 상품에 적용
                          </button>
                          <ChevronDown size={16} className={`text-[#9CA3AF] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 세트 펼침 */}
                  {isOpen && (
                    <div className="border-t border-[#E6E2DB]">
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-[32px_1fr] gap-0">
                          {set.items.map((menu, idx) => {
                            const cost = calcMenuCost(menu);
                            const isMenuOpen = expandedMenuId === menu.id;
                            return (
                              <div key={menu.id} className="contents">
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] text-white ${idx === 0 ? "bg-[#2F4F46]" : "bg-[#9CA3AF]"}`} style={{ fontWeight: 700 }}>{idx + 1}</div>
                                  {idx < set.items.length - 1 && <div className="w-[2px] flex-1 bg-[#E6E2DB] my-1" />}
                                </div>
                                <div className={`ml-3 mb-3 rounded-xl border transition-all ${isMenuOpen ? "border-[#2F4F46] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]" : "border-[#E6E2DB] bg-[#FBFAF7] hover:bg-white"}`}>
                                  <div className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedMenuId(isMenuOpen ? null : menu.id)}>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-md shrink-0 ${MENU_CAT_COLORS[menu.category]}`} style={{ fontWeight: 700 }}>{menu.category}</span>
                                    <span className="text-[15px] text-[#1F2937] flex-1" style={{ fontWeight: 700 }}>{menu.name}</span>
                                    <span className="text-[12px] text-[#9CA3AF] shrink-0">{menu.ingredients.length}가지 재료</span>
                                    <span className="text-[15px] text-[#1F2937] shrink-0" style={{ fontWeight: 700 }}>{cost.toLocaleString()}원</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button onClick={e => { e.stopPropagation(); openMenuForm(menu); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={12} /></button>
                                      <ChevronDown size={12} className={`text-[#9CA3AF] transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                                    </div>
                                  </div>
                                  {isMenuOpen && (
                                    <div className="border-t border-[#E6E2DB] px-4 py-3 bg-white rounded-b-xl">
                                      <div className="flex gap-4">
                                        <div className="flex-1 min-w-0">
                                          <table className="w-full">
                                            <thead><tr>{["재료명", "수량", "단가", "소계"].map(h => (<th key={h} className="text-[11px] text-[#9CA3AF] px-2 py-1.5 text-left" style={{ fontWeight: 700 }}>{h}</th>))}</tr></thead>
                                            <tbody>
                                              {menu.ingredients.map((ing, i) => (
                                                <tr key={i} className="border-t border-[#F3EFE8]">
                                                  <td className="text-[13px] text-[#1F2937] px-2 py-1.5">{ing.name}</td>
                                                  <td className="text-[13px] text-[#6B7280] px-2 py-1.5">{ing.quantity}{ing.unit}</td>
                                                  <td className="text-[13px] text-[#6B7280] px-2 py-1.5">{ing.unitPrice}원</td>
                                                  <td className="text-[13px] text-[#1F2937] px-2 py-1.5" style={{ fontWeight: 700 }}>{(ing.quantity * ing.unitPrice).toLocaleString()}원</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                        {menu.memo && (
                                          <div className="w-[180px] shrink-0 bg-[#FBFAF7] rounded-lg px-3 py-2">
                                            <p className="text-[11px] text-[#9CA3AF] mb-1" style={{ fontWeight: 700 }}>메모</p>
                                            <p className="text-[12px] text-[#6B7280] leading-relaxed">{menu.memo}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* 세트 합계 바 */}
                      <div className="px-6 py-4 bg-[#F7F3ED] border-t border-[#E6E2DB] flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div><p className="text-[12px] text-[#9CA3AF]">메뉴</p><p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{set.items.length}가지</p></div>
                          <div className="w-[1px] h-8 bg-[#E6E2DB]" />
                          <div><p className="text-[12px] text-[#9CA3AF]">총 재료</p><p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{set.totalIngredients}가지</p></div>
                          <div className="w-[1px] h-8 bg-[#E6E2DB]" />
                          <div><p className="text-[12px] text-[#9CA3AF]">1인분 원가 합계</p><p className="text-[20px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{set.totalCost.toLocaleString()}원</p></div>
                        </div>
                        <button onClick={() => setShowWizard(true)} className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer transition-colors flex items-center gap-2">
                          <Copy size={14} /> 이 세트로 상품 만들기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* 단독 메뉴 */}
          {unassignedMenus.length > 0 && (
            <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="px-5 py-3 bg-[#FBFAF7] border-b border-[#E6E2DB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={14} className="text-[#9CA3AF]" />
                  <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>단독 메뉴</span>
                  <span className="text-[12px] text-[#9CA3AF]">아직 세트에 배정되지 않은 메뉴</span>
                </div>
                <span className="text-[12px] text-[#9CA3AF] bg-[#F7F3ED] px-2 py-0.5 rounded" style={{ fontWeight: 700 }}>{unassignedMenus.length}개</span>
              </div>
              <div className="divide-y divide-[#F3EFE8]">
                {unassignedMenus.map(menu => {
                  const cost = calcMenuCost(menu);
                  return (
                    <div key={menu.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[#FBFAF7] transition-colors">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md shrink-0 ${MENU_CAT_COLORS[menu.category]}`} style={{ fontWeight: 700 }}>{menu.category}</span>
                      <span className="text-[14px] text-[#1F2937] flex-1" style={{ fontWeight: 700 }}>{menu.name}</span>
                      <span className="text-[12px] text-[#9CA3AF] shrink-0">{menu.ingredients.length}가지</span>
                      <span className="text-[14px] text-[#1F2937] shrink-0" style={{ fontWeight: 700 }}>{cost.toLocaleString()}원</span>
                      <button onClick={() => openMenuForm(menu)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => deleteMenu(menu.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-center gap-2.5">
            <Info size={14} className="text-[#9CA3AF] shrink-0" />
            <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
              메뉴를 등록할 때 '사용 상품'을 같은 이름으로 입력하면 자동으로 코스 세트가 만들어집니다. 같은 메뉴를 여러 상품에 넣으면 자동으로 중복 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {/* ══ 전체 메뉴 뷰 ══ */}
      {menuSubView === "all" && (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 py-2.5 bg-[#FBFAF7] border-b border-[#E6E2DB] grid items-center gap-3" style={{ gridTemplateColumns: "1fr 80px 70px 90px 100px 140px 80px" }}>
            {["메뉴명", "분류", "기준", "재료 수", "원가", "사용 세트", "관리"].map((h, i) => (
              <span key={h} className={`text-[12px] text-[#9CA3AF] ${i === 4 ? "text-right" : i === 0 ? "" : i === 6 ? "text-right" : "text-center"}`} style={{ fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          {filteredMenus.length === 0 ? (
            <div className="py-12 text-center">
              <UtensilsCrossed size={28} className="text-[#D6D0C8] mx-auto mb-3" />
              <p className="text-[15px] text-[#6B7280]" style={{ fontWeight: 700 }}>등록된 메뉴가 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3EFE8]">
              {filteredMenus.map(menu => {
                const cost = calcMenuCost(menu);
                const isExpanded = expandedMenuId === menu.id;
                return (
                  <div key={menu.id}>
                    <div className={`px-5 py-3 grid items-center gap-3 cursor-pointer transition-colors ${isExpanded ? "bg-[#F7F3ED]" : "hover:bg-[#FBFAF7]"}`}
                      style={{ gridTemplateColumns: "1fr 80px 70px 90px 100px 140px 80px" }} onClick={() => setExpandedMenuId(isExpanded ? null : menu.id)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF6E6] flex items-center justify-center shrink-0"><ChefHat size={15} className="text-[#8A6A2B]" /></div>
                        <span className="text-[14px] text-[#1F2937] truncate" style={{ fontWeight: 700 }}>{menu.name}</span>
                        <ChevronDown size={12} className={`text-[#9CA3AF] shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                      <div className="flex justify-center"><span className={`text-[11px] px-2 py-0.5 rounded-md ${MENU_CAT_COLORS[menu.category]}`} style={{ fontWeight: 700 }}>{menu.category}</span></div>
                      <span className="text-[13px] text-[#6B7280] text-center">{menu.servings}</span>
                      <span className="text-[13px] text-[#6B7280] text-center">{menu.ingredients.length}가지</span>
                      <span className="text-[14px] text-[#1F2937] text-right" style={{ fontWeight: 700 }}>{cost.toLocaleString()}원</span>
                      <div className="flex justify-center gap-1 flex-wrap">
                        {menu.usedInProducts.length > 0 ? menu.usedInProducts.map(prod => (
                          <span key={prod} className="text-[11px] text-[#2F4F46] bg-[#ECF7EE] px-2 py-0.5 rounded-md" style={{ fontWeight: 700 }}>{prod}</span>
                        )) : <span className="text-[12px] text-[#9CA3AF]">—</span>}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={e => { e.stopPropagation(); openMenuForm(menu); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#2F4F46] cursor-pointer transition-colors"><Edit2 size={13} /></button>
                        <button onClick={e => { e.stopPropagation(); deleteMenu(menu.id); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FDECEC] hover:text-[#C62828] cursor-pointer transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-[#FBFAF7] border-t border-[#E6E2DB] px-5 py-3">
                        <table className="w-full">
                          <thead><tr>{["재료명", "수량", "단가", "소계"].map(h => (<th key={h} className="text-[11px] text-[#9CA3AF] px-2 py-1.5 text-left" style={{ fontWeight: 700 }}>{h}</th>))}</tr></thead>
                          <tbody>{menu.ingredients.map((ing, i) => (
                            <tr key={i} className="border-t border-[#F3EFE8]">
                              <td className="text-[13px] text-[#1F2937] px-2 py-1.5">{ing.name}</td>
                              <td className="text-[13px] text-[#6B7280] px-2 py-1.5">{ing.quantity}{ing.unit}</td>
                              <td className="text-[13px] text-[#6B7280] px-2 py-1.5">{ing.unitPrice}원</td>
                              <td className="text-[13px] text-[#1F2937] px-2 py-1.5" style={{ fontWeight: 700 }}>{(ing.quantity * ing.unitPrice).toLocaleString()}원</td>
                            </tr>
                          ))}</tbody>
                        </table>
                        <div className="border-t border-[#E6E2DB] mt-1 pt-2 flex justify-between px-2">
                          <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>합계</span>
                          <span className="text-[15px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{cost.toLocaleString()}원</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {filteredMenus.length > 0 && (
            <div className="px-5 py-3 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center gap-6">
              <span className="text-[13px] text-[#6B7280]">전체: <strong className="text-[#1F2937]">{filteredMenus.length}개</strong></span>
              <span className="text-[13px] text-[#6B7280]">평균 원가: <strong className="text-[#1F2937]">{Math.round(filteredMenus.reduce((s, m) => s + calcMenuCost(m), 0) / filteredMenus.length).toLocaleString()}원</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ═══ 메뉴 등록/수정 폼 모달 ═══ */
  const renderMenuFormModal = () => {
    if (!showMenuForm) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(60,55,45,0.35)" }} onClick={() => setShowMenuForm(false)}>
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[680px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="px-6 py-5 border-b border-[#E6E2DB] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF6E6] flex items-center justify-center">
                  <ChefHat size={20} className="text-[#8A6A2B]" />
                </div>
                <div>
                  <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                    {editingMenu ? "메뉴 수정" : "새 메뉴 등록"}
                  </h2>
                  <p className="text-[13px] text-[#9CA3AF] mt-0.5">재료와 원가를 등록하면 상품에서 바로 불러올 수 있습니다.</p>
                </div>
              </div>
              <button onClick={() => setShowMenuForm(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* 기본 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메뉴명</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="예: 비지찌개"
                  className="w-full h-[44px] px-3.5 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>분류</label>
                <div className="relative">
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as MenuCategory)}
                    className="w-full h-[44px] pl-3.5 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                  >
                    {MENU_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>기준</label>
                <div className="relative">
                  <select
                    value={formServings}
                    onChange={e => setFormServings(e.target.value)}
                    className="w-full h-[44px] pl-3.5 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                  >
                    <option>1인분</option>
                    <option>2인분</option>
                    <option>4인분</option>
                    <option>10인분</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 재료 목록 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>재료 목록</label>
                <button onClick={addFormIngredient} className="text-[13px] text-[#2F4F46] flex items-center gap-1 cursor-pointer hover:underline">
                  <Plus size={14} /> 재료 추가
                </button>
              </div>

              <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] overflow-hidden">
                {/* 컬럼 헤더 */}
                <div className="grid gap-2 px-3 py-2 bg-[#F7F3ED]" style={{ gridTemplateColumns: "1fr 80px 60px 80px 80px 36px" }}>
                  <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>재료명</span>
                  <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>수량</span>
                  <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>단위</span>
                  <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>단가</span>
                  <span className="text-[12px] text-[#9CA3AF] text-right" style={{ fontWeight: 700 }}>소계</span>
                  <span />
                </div>

                {/* 재료 행 */}
                <div className="divide-y divide-[#F3EFE8]">
                  {formIngredients.map((ing, idx) => (
                    <div key={idx} className="grid gap-2 px-3 py-2 items-center" style={{ gridTemplateColumns: "1fr 80px 60px 80px 80px 36px" }}>
                      <input
                        value={ing.name}
                        onChange={e => updateFormIngredient(idx, "name", e.target.value)}
                        placeholder="재료명"
                        className="h-[36px] px-2.5 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
                      />
                      <input
                        type="number"
                        value={ing.quantity || ""}
                        onChange={e => updateFormIngredient(idx, "quantity", Number(e.target.value))}
                        placeholder="0"
                        className="h-[36px] px-2 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] text-center focus:border-[#2F4F46] focus:outline-none"
                      />
                      <div className="relative">
                        <select
                          value={ing.unit}
                          onChange={e => updateFormIngredient(idx, "unit", e.target.value)}
                          className="h-[36px] w-full pl-2 pr-5 rounded-lg border border-[#D6D0C8] bg-white text-[13px] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                        >
                          <option>g</option>
                          <option>ml</option>
                          <option>개</option>
                          <option>장</option>
                          <option>kg</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                      </div>
                      <input
                        type="number"
                        value={ing.unitPrice || ""}
                        onChange={e => updateFormIngredient(idx, "unitPrice", Number(e.target.value))}
                        placeholder="0"
                        className="h-[36px] px-2 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] text-center focus:border-[#2F4F46] focus:outline-none"
                      />
                      <span className="text-[13px] text-[#1F2937] text-right" style={{ fontWeight: 700 }}>
                        {(ing.quantity * ing.unitPrice).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFormIngredient(idx)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#C62828] hover:bg-[#FDECEC] cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 합계 */}
                <div className="border-t border-[#E6E2DB] px-3 py-3 flex items-center justify-between bg-[#F7F3ED]">
                  <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>재료 원가 합계</span>
                  <span className="text-[18px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{formTotalCost.toLocaleString()}원</span>
                </div>
              </div>

              {/* 빠른 추가 버튼 */}
              <button onClick={addFormIngredient} className="mt-3 w-full h-[40px] rounded-xl border border-dashed border-[#D6D0C8] text-[13px] text-[#9CA3AF] hover:text-[#2F4F46] hover:border-[#2F4F46] cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                <Plus size={14} /> 재료 한 줄 추가
              </button>
            </div>

            {/* 사용 상품 */}
            <div>
              <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>사용 상품 (세트 구성)</label>
              <input
                value={formUsedInProducts}
                onChange={e => setFormUsedInProducts(e.target.value)}
                placeholder="예: 항아리 바베큐 (여러 상품은 쉼표로 구분)"
                className="w-full h-[44px] px-3.5 rounded-xl border border-[#D6D0C8] bg-white text-[15px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none"
              />
              <p className="text-[12px] text-[#9CA3AF] mt-1">같은 상품명을 입력한 메뉴끼리 자동으로 코스 세트가 됩니다.</p>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-[13px] text-[#6B7280] mb-1.5" style={{ fontWeight: 700 }}>메모 (선택)</label>
              <textarea
                value={formMemo}
                onChange={e => setFormMemo(e.target.value)}
                placeholder="조리 팁이나 주의사항을 적어주세요"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] focus:border-[#2F4F46] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
            <button onClick={() => setShowMenuForm(false)} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              취소
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-[#6B7280]">
                원가 합계: <strong className="text-[#2F4F46] text-[16px]">{formTotalCost.toLocaleString()}원</strong>
              </span>
              <button
                onClick={saveMenu}
                disabled={!formName.trim() || formIngredients.filter(i => i.name.trim()).length === 0}
                className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingMenu ? "수정 완료" : "메뉴 등록"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ 템플릿 탭 ═══ */
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-[#6B7280]">템플릿을 사용하면 상품 등록 시 기본 비용 항목이 자동으로 채워집니다.</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {templatesData.map(tmpl => (
          <div key={tmpl.id} className="bg-white rounded-[14px] border border-[#E6E2DB] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-0.5 rounded">{tmpl.type}</span>
                <h3 className="text-[16px] text-[#1F2937] mt-2" style={{ fontWeight: 700 }}>{tmpl.name}</h3>
                <p className="text-[13px] text-[#9CA3AF] mt-1">{tmpl.desc}</p>
              </div>
            </div>
            <div className="border-t border-[#F3EFE8] pt-3 mt-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {tmpl.items.map(item => (
                  <span key={item} className="text-[12px] text-[#2F4F46] bg-[#ECF7EE] px-2.5 py-1 rounded-lg">{item}</span>
                ))}
                {tmpl.laborIncluded && <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2.5 py-1 rounded-lg">인건비</span>}
                {tmpl.utilityIncluded && <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2.5 py-1 rounded-lg">공과금</span>}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[14px] text-[#6B7280]">기본 비용 합계</span>
                <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{tmpl.totalCost.toLocaleString()}원</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowWizard(true)}
                className="flex-1 h-[44px] rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer"
              >
                이 템플릿으로 상품 만들기
              </button>
              <button className="h-[44px] px-4 rounded-xl border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
                <Edit2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1160px] space-y-6">
      {/* 탭 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-[#2F4F46] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
                  : "border-[#E6E2DB] bg-white/60 hover:bg-white"
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.key ? "text-[#2F4F46]" : "text-[#9CA3AF]"} />
              <span className={`text-[14px] ${activeTab === tab.key ? "text-[#2F4F46]" : "text-[#6B7280]"}`} style={{ fontWeight: activeTab === tab.key ? 700 : 400 }}>
                {tab.label}
              </span>
              <span className={`text-[12px] px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? "bg-[#ECF7EE] text-[#2F4F46]" : "bg-[#F7F3ED] text-[#9CA3AF]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <button
            onClick={() => setShowWizard(true)}
            className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
          >
            <Plus size={16} /> 새 상품 등록
          </button>
        )}
        {activeTab === "menus" && (
          <button
            onClick={() => openMenuForm()}
            className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
          >
            <Plus size={16} /> 새 메뉴 등록
          </button>
        )}
      </div>

      {activeTab === "products" && renderProductsTab()}
      {activeTab === "materials" && renderMaterialsTab()}
      {activeTab === "menus" && renderMenusTab()}
      {activeTab === "templates" && renderTemplatesTab()}

      {showWizard && <ProductWizard onClose={() => setShowWizard(false)} />}
      {renderMenuFormModal()}
    </div>
  );
}
