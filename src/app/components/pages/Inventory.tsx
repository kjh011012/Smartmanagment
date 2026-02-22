import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Package, Search, Plus, Edit2, Trash2, AlertTriangle,
  ArrowUpDown, ChevronDown, ChevronUp, X, Check, Info,
  TrendingDown, TrendingUp, Archive, RotateCcw,
  Filter, Download, ShoppingBag, UtensilsCrossed,
  Home, Leaf, History, Minus, AlertCircle, CheckCircle,
  ClipboardList, BarChart3, Truck, Calendar, ChevronRight
} from "lucide-react";

/* ═══ 타입 ═══ */
type TabKey = "specialty" | "experience" | "accommodation" | "material";
type StockStatus = "정상" | "부족" | "긴급" | "품절";
type AdjustReason = "입고" | "판매" | "폐기" | "반품" | "체험소모" | "재고조사" | "기타";

interface StockHistory {
  id: number;
  date: string;
  type: "입고" | "출고" | "조정";
  quantity: number;
  reason: AdjustReason;
  note: string;
  by: string;
}

interface InventoryItem {
  id: number;
  name: string;
  tab: TabKey;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  expiryDate: string | null;
  location: string;
  supplier: string;
  lastUpdated: string;
  lastInDate: string;
  isActive: boolean;
  memo: string;
  history: StockHistory[];
}

/* ═══ 탭 정�� ═══ */
const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "specialty", label: "특산품", icon: ShoppingBag },
  { key: "experience", label: "체험·식사", icon: UtensilsCrossed },
  { key: "accommodation", label: "숙박", icon: Home },
  { key: "material", label: "특산품 재료", icon: Leaf },
];

/* ═══ 더미 데이터 ═══ */
const INITIAL_ITEMS: InventoryItem[] = [
  // 특산품
  {
    id: 1, name: "유기농 상추", tab: "specialty", category: "야채",
    stock: 54, minStock: 20, maxStock: 150, unit: "개",
    unitPrice: 2500, expiryDate: "2026.03.05", location: "냉장고 A",
    supplier: "자체 농장", lastUpdated: "2026.02.22", lastInDate: "2026.02.20",
    isActive: true, memo: "유기농 인증 농산물",
    history: [
      { id: 1, date: "2026.02.20", type: "입고", quantity: 30, reason: "입고", note: "자체 농장 수확", by: "김마을" },
      { id: 2, date: "2026.02.19", type: "출고", quantity: -8, reason: "판매", note: "현장 판매", by: "이체험" },
      { id: 3, date: "2026.02.18", type: "출고", quantity: -5, reason: "체험소모", note: "샐러드 체험 재료", by: "박도움" },
    ]
  },
  {
    id: 2, name: "유기농 시금치", tab: "specialty", category: "야채",
    stock: 29, minStock: 25, maxStock: 100, unit: "개",
    unitPrice: 3000, expiryDate: "2026.03.01", location: "냉장고 A",
    supplier: "자체 농장", lastUpdated: "2026.02.21", lastInDate: "2026.02.19",
    isActive: true, memo: "주 2회 수확. 유통기한 짧으므로 빠른 소진 필요",
    history: [
      { id: 1, date: "2026.02.19", type: "입고", quantity: 20, reason: "입고", note: "자체 농장 수확", by: "김마을" },
      { id: 2, date: "2026.02.18", type: "출고", quantity: -6, reason: "판매", note: "직거래 판매", by: "이체험" },
    ]
  },
  {
    id: 3, name: "유기농 당근", tab: "specialty", category: "야채",
    stock: 39, minStock: 15, maxStock: 100, unit: "개",
    unitPrice: 2000, expiryDate: "2026.03.15", location: "냉장고 B",
    supplier: "자체 농장", lastUpdated: "2026.02.20", lastInDate: "2026.02.18",
    isActive: true, memo: "",
    history: [
      { id: 1, date: "2026.02.18", type: "입고", quantity: 25, reason: "입고", note: "자체 농장 수확", by: "김마을" },
    ]
  },
  {
    id: 4, name: "사과", tab: "specialty", category: "과일",
    stock: 21, minStock: 20, maxStock: 80, unit: "개",
    unitPrice: 3500, expiryDate: "2026.03.20", location: "상온 창고",
    supplier: "○○과수원", lastUpdated: "2026.02.22", lastInDate: "2026.02.15",
    isActive: true, memo: "부사 품종. 일주일 이내 추가 입고 필요",
    history: [
      { id: 1, date: "2026.02.15", type: "입고", quantity: 40, reason: "입고", note: "○○과수원 납품", by: "김마을" },
      { id: 2, date: "2026.02.20", type: "출고", quantity: -12, reason: "판매", note: "직거래", by: "이체험" },
      { id: 3, date: "2026.02.21", type: "출고", quantity: -7, reason: "체험소모", note: "사과잼 만들기 체험", by: "박도움" },
    ]
  },
  {
    id: 5, name: "배", tab: "specialty", category: "과일",
    stock: 20, minStock: 15, maxStock: 60, unit: "개",
    unitPrice: 5000, expiryDate: "2026.03.25", location: "상온 창고",
    supplier: "○○과수원", lastUpdated: "2026.02.19", lastInDate: "2026.02.14",
    isActive: true, memo: "신고배. 선물세트 포장 가능",
    history: [
      { id: 1, date: "2026.02.14", type: "입고", quantity: 30, reason: "입고", note: "○○과수원 납품", by: "김마을" },
    ]
  },
  {
    id: 6, name: "현미", tab: "specialty", category: "곡물",
    stock: 100, minStock: 30, maxStock: 200, unit: "개",
    unitPrice: 8000, expiryDate: null, location: "건조 창고",
    supplier: "자체 농장", lastUpdated: "2026.02.18", lastInDate: "2026.02.10",
    isActive: true, memo: "10kg 단위 포장. 도정일자 확인 필요",
    history: [
      { id: 1, date: "2026.02.10", type: "입고", quantity: 50, reason: "입고", note: "자체 도정", by: "김마을" },
    ]
  },
  {
    id: 7, name: "보리", tab: "specialty", category: "곡물",
    stock: 78, minStock: 25, maxStock: 150, unit: "개",
    unitPrice: 6000, expiryDate: null, location: "건조 창고",
    supplier: "자체 농장", lastUpdated: "2026.02.17", lastInDate: "2026.02.08",
    isActive: true, memo: "",
    history: []
  },
  {
    id: 8, name: "천연 벌꿀", tab: "specialty", category: "벌꿀",
    stock: 11, minStock: 10, maxStock: 50, unit: "개",
    unitPrice: 28000, expiryDate: "2027.06.30", location: "상온 진열대",
    supplier: "○○양봉원", lastUpdated: "2026.02.22", lastInDate: "2026.02.05",
    isActive: true, memo: "야생화 밀원. 계절별 풍미 차이 안내 필요",
    history: [
      { id: 1, date: "2026.02.05", type: "입고", quantity: 20, reason: "입고", note: "○○양봉원 납품", by: "김마을" },
      { id: 2, date: "2026.02.18", type: "출고", quantity: -9, reason: "판매", note: "온라인 주문", by: "이체험" },
    ]
  },
  {
    id: 9, name: "프로폴리스", tab: "specialty", category: "벌꿀",
    stock: 10, minStock: 10, maxStock: 40, unit: "개",
    unitPrice: 45000, expiryDate: "2027.03.15", location: "상온 진열대",
    supplier: "○○양봉원", lastUpdated: "2026.02.20", lastInDate: "2026.02.01",
    isActive: true, memo: "고가 상품. 파손 주의",
    history: []
  },
  {
    id: 10, name: "사과잼", tab: "specialty", category: "가공품",
    stock: 23, minStock: 15, maxStock: 60, unit: "개",
    unitPrice: 12000, expiryDate: "2026.08.20", location: "상온 진열대",
    supplier: "자체 제조", lastUpdated: "2026.02.21", lastInDate: "2026.02.16",
    isActive: true, memo: "무방부제 수제잼. 체험 후 추가 구매 비율 높음",
    history: [
      { id: 1, date: "2026.02.16", type: "입고", quantity: 15, reason: "입고", note: "자체 제조 완료", by: "박도움" },
    ]
  },
  {
    id: 11, name: "감귤 초콜릿", tab: "specialty", category: "가공품",
    stock: 5, minStock: 10, maxStock: 40, unit: "개",
    unitPrice: 18000, expiryDate: "2026.05.10", location: "냉장 진열대",
    supplier: "자체 제조", lastUpdated: "2026.02.22", lastInDate: "2026.02.10",
    isActive: true, memo: "여름 배송 시 아이스팩 필수. 현재 재고 부족!",
    history: [
      { id: 1, date: "2026.02.10", type: "입고", quantity: 20, reason: "입고", note: "자체 제조", by: "박도움" },
      { id: 2, date: "2026.02.20", type: "출고", quantity: -15, reason: "판매", note: "설 선물세트 판매", by: "이체험" },
    ]
  },
  // 체험·식사
  {
    id: 12, name: "감귤 따기 체험 바구니", tab: "experience", category: "체험 용품",
    stock: 45, minStock: 10, maxStock: 60, unit: "개",
    unitPrice: 3000, expiryDate: null, location: "체험장 창고",
    supplier: "○○산업", lastUpdated: "2026.02.15", lastInDate: "2026.01.20",
    isActive: true, memo: "파손된 바구니 분기별 교체. 현재 5개 파손",
    history: []
  },
  {
    id: 13, name: "체험용 앞치마", tab: "experience", category: "체험 용품",
    stock: 30, minStock: 20, maxStock: 50, unit: "개",
    unitPrice: 8000, expiryDate: null, location: "체험장 창고",
    supplier: "○○섬유", lastUpdated: "2026.02.10", lastInDate: "2026.01.15",
    isActive: true, memo: "세탁 후 재사용. 월 1회 세탁비 발생",
    history: []
  },
  {
    id: 14, name: "일회용 장갑", tab: "experience", category: "소모품",
    stock: 200, minStock: 100, maxStock: 500, unit: "개",
    unitPrice: 50, expiryDate: null, location: "체험장 창고",
    supplier: "○○유통", lastUpdated: "2026.02.18", lastInDate: "2026.02.05",
    isActive: true, memo: "라텍스 프리 제품 사용 (알레르기 대응)",
    history: []
  },
  {
    id: 15, name: "식사 재료 (흑돼지)", tab: "experience", category: "식재료",
    stock: 8, minStock: 10, maxStock: 30, unit: "kg",
    unitPrice: 25000, expiryDate: "2026.02.28", location: "냉동고",
    supplier: "○○축산", lastUpdated: "2026.02.22", lastInDate: "2026.02.15",
    isActive: true, memo: "주말 수요 급증. 수요일까지 추가 발주 필요",
    history: [
      { id: 1, date: "2026.02.15", type: "입고", quantity: 15, reason: "입고", note: "○○축산 납품", by: "김마을" },
      { id: 2, date: "2026.02.22", type: "출고", quantity: -7, reason: "체험소모", note: "흑돼지 BBQ 체험", by: "박도움" },
    ]
  },
  {
    id: 16, name: "식사 재료 (채소 세트)", tab: "experience", category: "식재료",
    stock: 12, minStock: 8, maxStock: 25, unit: "세트",
    unitPrice: 15000, expiryDate: "2026.02.26", location: "냉장고 C",
    supplier: "자체 농장", lastUpdated: "2026.02.21", lastInDate: "2026.02.20",
    isActive: true, memo: "유기농 채소 세트. 자체 농장 당일 수확",
    history: []
  },
  {
    id: 17, name: "체험키트 (비누 만들기)", tab: "experience", category: "체험 키트",
    stock: 3, minStock: 10, maxStock: 40, unit: "세트",
    unitPrice: 5000, expiryDate: null, location: "체험장 창고",
    supplier: "자체 제조", lastUpdated: "2026.02.22", lastInDate: "2026.02.01",
    isActive: true, memo: "비누 베이스+에센셜 오일+몰드 구성. 긴급 제조 필요!",
    history: [
      { id: 1, date: "2026.02.01", type: "입고", quantity: 20, reason: "입고", note: "자체 제조", by: "박도움" },
      { id: 2, date: "2026.02.20", type: "출고", quantity: -17, reason: "체험소모", note: "비누만들기 체험 10회차", by: "박도움" },
    ]
  },
  // 숙박
  {
    id: 18, name: "침구 세트", tab: "accommodation", category: "비품",
    stock: 15, minStock: 8, maxStock: 20, unit: "세트",
    unitPrice: 80000, expiryDate: null, location: "린넨실",
    supplier: "○○침구", lastUpdated: "2026.02.10", lastInDate: "2026.01.05",
    isActive: true, memo: "분기별 교체. 다음 교체 예정: 2026년 4월",
    history: []
  },
  {
    id: 19, name: "수건 세트", tab: "accommodation", category: "비품",
    stock: 40, minStock: 20, maxStock: 60, unit: "세트",
    unitPrice: 15000, expiryDate: null, location: "린넨실",
    supplier: "○○섬유", lastUpdated: "2026.02.15", lastInDate: "2026.01.20",
    isActive: true, memo: "대형+소형 각 2장 세트",
    history: []
  },
  {
    id: 20, name: "어메니티 세트", tab: "accommodation", category: "소모품",
    stock: 25, minStock: 30, maxStock: 100, unit: "세트",
    unitPrice: 3500, expiryDate: "2027.01.01", location: "창고 D",
    supplier: "○○유통", lastUpdated: "2026.02.22", lastInDate: "2026.02.01",
    isActive: true, memo: "친환경 제품. 재고 부족으로 즉시 발주 필요!",
    history: [
      { id: 1, date: "2026.02.01", type: "입고", quantity: 50, reason: "입고", note: "○○유통 납품", by: "김마을" },
      { id: 2, date: "2026.02.22", type: "출고", quantity: -25, reason: "체험소모", note: "2월 숙박객 사용", by: "이체험" },
    ]
  },
  {
    id: 21, name: "슬리퍼", tab: "accommodation", category: "비품",
    stock: 18, minStock: 10, maxStock: 30, unit: "켤레",
    unitPrice: 5000, expiryDate: null, location: "린넨실",
    supplier: "○○유통", lastUpdated: "2026.02.05", lastInDate: "2026.01.10",
    isActive: true, memo: "",
    history: []
  },
  // 특산품 재료
  {
    id: 22, name: "감귤 (가공용)", tab: "material", category: "원재료",
    stock: 35, minStock: 20, maxStock: 100, unit: "kg",
    unitPrice: 2400, expiryDate: "2026.03.10", location: "냉장고 B",
    supplier: "자체 농장", lastUpdated: "2026.02.20", lastInDate: "2026.02.18",
    isActive: true, memo: "잼·초콜릿·말린칩 제조용. B급 감귤 활용",
    history: []
  },
  {
    id: 23, name: "설탕 (가공용)", tab: "material", category: "부재료",
    stock: 18, minStock: 10, maxStock: 50, unit: "kg",
    unitPrice: 2800, expiryDate: null, location: "건조 창고",
    supplier: "○○식품", lastUpdated: "2026.02.15", lastInDate: "2026.02.01",
    isActive: true, memo: "비정제 원당 사용",
    history: []
  },
  {
    id: 24, name: "유리병 (250ml)", tab: "material", category: "포장재",
    stock: 120, minStock: 50, maxStock: 300, unit: "개",
    unitPrice: 1200, expiryDate: null, location: "포장재 창고",
    supplier: "○○유리", lastUpdated: "2026.02.12", lastInDate: "2026.02.05",
    isActive: true, memo: "잼용 유리병. 뚜껑 포함",
    history: []
  },
  {
    id: 25, name: "선물 박스 (중)", tab: "material", category: "포장재",
    stock: 8, minStock: 20, maxStock: 100, unit: "개",
    unitPrice: 3500, expiryDate: null, location: "포장재 창고",
    supplier: "○○인쇄", lastUpdated: "2026.02.22", lastInDate: "2026.02.01",
    isActive: true, memo: "고급 포장 박스. 긴급 발주 필요!",
    history: [
      { id: 1, date: "2026.02.01", type: "입고", quantity: 30, reason: "입고", note: "○○인쇄 납품", by: "김마을" },
      { id: 2, date: "2026.02.20", type: "출고", quantity: -22, reason: "판매", note: "설 선물세트 포장", by: "이체험" },
    ]
  },
  {
    id: 26, name: "비누 베이스", tab: "material", category: "원재료",
    stock: 6, minStock: 10, maxStock: 40, unit: "kg",
    unitPrice: 12000, expiryDate: "2026.12.01", location: "체험장 창고",
    supplier: "○○화학", lastUpdated: "2026.02.22", lastInDate: "2026.01.20",
    isActive: true, memo: "MP비누 베이스. 체험키트 제조 필수 재료",
    history: []
  },
  {
    id: 27, name: "에센셜 오일 (감귤)", tab: "material", category: "부재료",
    stock: 4, minStock: 5, maxStock: 20, unit: "병",
    unitPrice: 18000, expiryDate: "2027.06.01", location: "체험장 창고",
    supplier: "○○아로마", lastUpdated: "2026.02.21", lastInDate: "2026.01.15",
    isActive: true, memo: "비누·캔들 체험 겸용. 천연 100%",
    history: []
  },
  {
    id: 28, name: "택배 박스 (소)", tab: "material", category: "포장재",
    stock: 45, minStock: 30, maxStock: 150, unit: "개",
    unitPrice: 800, expiryDate: null, location: "포장재 창고",
    supplier: "○○박스", lastUpdated: "2026.02.19", lastInDate: "2026.02.10",
    isActive: true, memo: "",
    history: []
  },
];

/* ═══ 유틸 ═══ */
function getStockStatus(item: InventoryItem): StockStatus {
  if (item.stock === 0) return "품절";
  if (item.stock < item.minStock * 0.5) return "긴급";
  if (item.stock <= item.minStock) return "부족";
  return "정상";
}

function getStockPercent(item: InventoryItem) {
  return Math.min(100, Math.round((item.stock / item.maxStock) * 100));
}

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const parts = expiryDate.split(".");
  const expiry = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = new Date(2026, 1, 22); // 2026.02.22
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

const STATUS_CONFIG: Record<StockStatus, { bg: string; text: string; border: string; label: string }> = {
  "정상": { bg: "bg-[#ECF7EE]", text: "text-[#1B5E20]", border: "border-[#A5D6A7]", label: "정상" },
  "부족": { bg: "bg-[#FFF6E6]", text: "text-[#8A6A2B]", border: "border-[#FFD54F]", label: "부족" },
  "긴급": { bg: "bg-[#FDECEC]", text: "text-[#C62828]", border: "border-[#EF9A9A]", label: "긴급" },
  "품절": { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#D1D5DB]", label: "품절" },
};

const ADJUST_REASONS: AdjustReason[] = ["입고", "판매", "폐기", "반품", "체험소모", "재고조사", "기타"];

/* ═══ 컴포넌트 ═══ */
export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [activeTab, setActiveTab] = useState<TabKey>("specialty");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "전체">("전체");
  const [categoryFilter, setCategoryFilter] = useState<string>("전체");
  const [sortField, setSortField] = useState<"name" | "stock" | "status" | "expiry">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"입고" | "출고">("입고");
  const [adjustReason, setAdjustReason] = useState<AdjustReason>("입고");
  const [adjustNote, setAdjustNote] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside to close modals
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowAdjustModal(false);
        setShowHistoryModal(false);
      }
    }
    if (showAdjustModal || showHistoryModal) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showAdjustModal, showHistoryModal]);

  /* ── 파생 데이터 ── */
  const tabItems = useMemo(() => items.filter(it => it.tab === activeTab), [items, activeTab]);

  const categories = useMemo(() => {
    const cats = [...new Set(tabItems.map(it => it.category))];
    return ["전체", ...cats];
  }, [tabItems]);

  const filteredItems = useMemo(() => {
    let result = tabItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(it => it.name.toLowerCase().includes(q) || it.category.toLowerCase().includes(q) || it.supplier.toLowerCase().includes(q));
    }
    if (statusFilter !== "전체") {
      result = result.filter(it => getStockStatus(it) === statusFilter);
    }
    if (categoryFilter !== "전체") {
      result = result.filter(it => it.category === categoryFilter);
    }
    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name, "ko");
      else if (sortField === "stock") cmp = a.stock - b.stock;
      else if (sortField === "status") {
        const order: Record<StockStatus, number> = { "품절": 0, "긴급": 1, "부족": 2, "정상": 3 };
        cmp = order[getStockStatus(a)] - order[getStockStatus(b)];
      } else if (sortField === "expiry") {
        const da = getDaysUntilExpiry(a.expiryDate) ?? 9999;
        const db = getDaysUntilExpiry(b.expiryDate) ?? 9999;
        cmp = da - db;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [tabItems, searchQuery, statusFilter, categoryFilter, sortField, sortDir]);

  // 통계
  const stats = useMemo(() => {
    const total = items.length;
    const normal = items.filter(it => getStockStatus(it) === "정상").length;
    const low = items.filter(it => getStockStatus(it) === "부족").length;
    const critical = items.filter(it => getStockStatus(it) === "긴급").length;
    const outOfStock = items.filter(it => getStockStatus(it) === "품절").length;
    const totalValue = items.reduce((s, it) => s + it.stock * it.unitPrice, 0);
    return { total, normal, low, critical, outOfStock, totalValue };
  }, [items]);

  // Tab별 통계
  const tabStats = useMemo(() => {
    const t = tabItems;
    return {
      total: t.length,
      normal: t.filter(it => getStockStatus(it) === "정상").length,
      low: t.filter(it => getStockStatus(it) === "부족" || getStockStatus(it) === "긴급").length,
      value: t.reduce((s, it) => s + it.stock * it.unitPrice, 0),
    };
  }, [tabItems]);

  /* ── 핸들러 ── */
  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredItems.map(it => it.id)));
  }

  function openAdjust(item: InventoryItem) {
    setAdjustItem(item);
    setAdjustQty("");
    setAdjustType("입고");
    setAdjustReason("입고");
    setAdjustNote("");
    setShowAdjustModal(true);
  }

  function handleAdjust() {
    if (!adjustItem || !adjustQty) return;
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty <= 0) return;
    const delta = adjustType === "입고" ? qty : -qty;
    const newHistory: StockHistory = {
      id: Date.now(),
      date: "2026.02.22",
      type: adjustType === "입고" ? "입고" : "출고",
      quantity: delta,
      reason: adjustReason,
      note: adjustNote,
      by: "관리자",
    };
    setItems(prev => prev.map(it => {
      if (it.id !== adjustItem.id) return it;
      return {
        ...it,
        stock: Math.max(0, it.stock + delta),
        lastUpdated: "2026.02.22",
        lastInDate: adjustType === "입고" ? "2026.02.22" : it.lastInDate,
        history: [newHistory, ...it.history],
      };
    }));
    setShowAdjustModal(false);
  }

  function openHistory(item: InventoryItem) {
    setHistoryItem(item);
    setShowHistoryModal(true);
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-[#9CA3AF]" />;
    return sortDir === "asc" ? <ChevronUp size={14} className="text-[#2F4F46]" /> : <ChevronDown size={14} className="text-[#2F4F46]" />;
  };

  return (
    <div className="space-y-6">
      {/* ═══ 상단 KPI 카드 ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} className="text-[#2F4F46]" />
            <span className="text-[13px] text-[#6B7280]">전체 품목</span>
          </div>
          <p className="text-[24px] text-[#1F2937]" style={{ fontWeight: 900 }}>{stats.total}<span className="text-[14px] text-[#6B7280] ml-1" style={{ fontWeight: 400 }}>종</span></p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-[#1B5E20]" />
            <span className="text-[13px] text-[#6B7280]">정상 재고</span>
          </div>
          <p className="text-[24px] text-[#1B5E20]" style={{ fontWeight: 900 }}>{stats.normal}<span className="text-[14px] text-[#6B7280] ml-1" style={{ fontWeight: 400 }}>종</span></p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-[#8A6A2B]" />
            <span className="text-[13px] text-[#6B7280]">부족 / 긴급</span>
          </div>
          <p className="text-[24px] text-[#8A6A2B]" style={{ fontWeight: 900 }}>{stats.low + stats.critical}<span className="text-[14px] text-[#6B7280] ml-1" style={{ fontWeight: 400 }}>종</span></p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-[#C62828]" />
            <span className="text-[13px] text-[#6B7280]">품절</span>
          </div>
          <p className="text-[24px] text-[#C62828]" style={{ fontWeight: 900 }}>{stats.outOfStock}<span className="text-[14px] text-[#6B7280] ml-1" style={{ fontWeight: 400 }}>종</span></p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-[#2F4F46]" />
            <span className="text-[13px] text-[#6B7280]">총 재고 자산</span>
          </div>
          <p className="text-[20px] text-[#1F2937]" style={{ fontWeight: 900 }}>{fmt(stats.totalValue)}<span className="text-[14px] text-[#6B7280] ml-1" style={{ fontWeight: 400 }}>원</span></p>
        </div>
      </div>

      {/* ═══ 탭 영역 ═══ */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        {/* 탭 */}
        <div className="flex border-b border-[#E6E2DB]">
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = items.filter(it => it.tab === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setStatusFilter("전체"); setCategoryFilter("전체"); setSearchQuery(""); setSelectedIds(new Set()); }}
                className={`flex items-center gap-2 px-6 py-4 text-[15px] transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? "text-[#2F4F46] border-[#2F4F46]"
                    : "text-[#6B7280] border-transparent hover:text-[#1F2937]"
                }`}
                style={{ fontWeight: isActive ? 700 : 400 }}
              >
                <TabIcon size={18} />
                {tab.label}
                <span className={`text-[12px] px-1.5 py-0.5 rounded-md ${isActive ? "bg-[#2F4F46] text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* 탭 서브 통계 */}
        <div className="flex items-center gap-6 px-6 py-4 border-b border-[#F3EFE8] bg-[#FBFAF7]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">품목 수</span>
            <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{tabStats.total}종</span>
          </div>
          <div className="w-px h-4 bg-[#E6E2DB]" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">정상</span>
            <span className="text-[14px] text-[#1B5E20]" style={{ fontWeight: 700 }}>{tabStats.normal}종</span>
          </div>
          <div className="w-px h-4 bg-[#E6E2DB]" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">부족/긴급</span>
            <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>{tabStats.low}종</span>
          </div>
          <div className="w-px h-4 bg-[#E6E2DB]" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">재고 자산</span>
            <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{fmt(tabStats.value)}원</span>
          </div>
        </div>

        {/* 검색·필터·액션 바 */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-[#E6E2DB]">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="상품명, 카테고리, 공급처 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-[42px] pl-9 pr-4 rounded-lg border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none transition-colors"
            />
          </div>
          {/* 상태 필터 */}
          <div className="flex items-center gap-1.5">
            {(["전체", "정상", "부족", "긴급", "품절"] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`h-[36px] px-3 rounded-lg text-[13px] transition-colors cursor-pointer border ${
                  statusFilter === st
                    ? "bg-[#2F4F46] text-white border-[#2F4F46]"
                    : "bg-white text-[#6B7280] border-[#D6D0C8] hover:bg-[#F7F3ED]"
                }`}
                style={{ fontWeight: statusFilter === st ? 700 : 400 }}
              >
                {st}
              </button>
            ))}
          </div>
          {/* 카테고리 필터 */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-[36px] px-3 rounded-lg border border-[#D6D0C8] bg-white text-[13px] text-[#6B7280] cursor-pointer focus:outline-none focus:border-[#2F4F46]"
          >
            {categories.map(c => <option key={c} value={c}>{c === "전체" ? "카테고리 전체" : c}</option>)}
          </select>
          <div className="flex-1" />
          {/* 일괄 작업 */}
          {selectedIds.size > 0 && (
            <span className="text-[13px] text-[#2F4F46] bg-[#ECF7EE] px-3 py-1.5 rounded-lg" style={{ fontWeight: 700 }}>
              {selectedIds.size}개 선택됨
            </span>
          )}
          <button
            className="h-[36px] px-4 rounded-lg border border-[#D6D0C8] bg-white text-[13px] text-[#6B7280] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <Download size={14} /> 내보내기
          </button>
        </div>

        {/* ═══ 테이블 ═══ */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E2DB] bg-[#FBFAF7]">
                <th className="w-[40px] px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3">
                  <button onClick={() => handleSort("status")} className="flex items-center gap-1 text-[13px] text-[#6B7280] cursor-pointer" style={{ fontWeight: 700 }}>
                    상태 <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-left px-4 py-3">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-[13px] text-[#6B7280] cursor-pointer" style={{ fontWeight: 700 }}>
                    상품명 <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>카테고리</th>
                <th className="text-left px-4 py-3">
                  <button onClick={() => handleSort("stock")} className="flex items-center gap-1 text-[13px] text-[#6B7280] cursor-pointer" style={{ fontWeight: 700 }}>
                    보유 재고 <SortIcon field="stock" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>재고 상태</th>
                <th className="text-left px-4 py-3">
                  <button onClick={() => handleSort("expiry")} className="flex items-center gap-1 text-[13px] text-[#6B7280] cursor-pointer" style={{ fontWeight: 700 }}>
                    유통기한 <SortIcon field="expiry" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>보관 위치</th>
                <th className="text-left px-4 py-3 text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>최근 입고</th>
                <th className="text-center px-4 py-3 text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-[14px] text-[#9CA3AF]">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredItems.flatMap(item => {
                  const st = getStockStatus(item);
                  const cfg = STATUS_CONFIG[st];
                  const pct = getStockPercent(item);
                  const days = getDaysUntilExpiry(item.expiryDate);
                  const isExpanded = showDetailId === item.id;
                  const rows: React.ReactNode[] = [];
                  rows.push(
                      <tr
                        key={item.id}
                        className={`border-b border-[#F3EFE8] hover:bg-[#FBFAF7] transition-colors cursor-pointer ${isExpanded ? "bg-[#FBFAF7]" : ""}`}
                        onClick={() => setShowDetailId(isExpanded ? null : item.id)}
                      >
                        <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4 rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[12px] px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.text} border ${cfg.border}`} style={{ fontWeight: 700 }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.name}</span>
                            {st === "긴급" && <AlertTriangle size={14} className="text-[#C62828] animate-pulse" />}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] text-[#6B7280] bg-[#F7F3ED] px-2 py-0.5 rounded-md">{item.category}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{fmt(item.stock)}{item.unit}</span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  st === "정상" ? "bg-[#4CAF50]" : st === "부족" ? "bg-[#FFB74D]" : st === "긴급" ? "bg-[#EF5350]" : "bg-[#BDBDBD]"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[12px] text-[#9CA3AF] w-[32px] text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.expiryDate ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[13px] ${days !== null && days <= 7 ? "text-[#C62828]" : days !== null && days <= 30 ? "text-[#8A6A2B]" : "text-[#6B7280]"}`} style={{ fontWeight: days !== null && days <= 7 ? 700 : 400 }}>
                                {item.expiryDate}
                              </span>
                              {days !== null && days <= 7 && days > 0 && (
                                <span className="text-[11px] text-[#C62828] bg-[#FDECEC] px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>D-{days}</span>
                              )}
                              {days !== null && days <= 0 && (
                                <span className="text-[11px] text-white bg-[#C62828] px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>만료</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[13px] text-[#9CA3AF]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[#6B7280]">{item.location}</td>
                        <td className="px-4 py-3.5 text-[13px] text-[#6B7280]">{item.lastInDate}</td>
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openAdjust(item)}
                              className="w-8 h-8 rounded-lg bg-[#ECF7EE] flex items-center justify-center hover:bg-[#D4EDDA] transition-colors cursor-pointer"
                              title="입출고"
                            >
                              <RotateCcw size={14} className="text-[#1B5E20]" />
                            </button>
                            <button
                              onClick={() => openHistory(item)}
                              className="w-8 h-8 rounded-lg bg-[#F7F3ED] flex items-center justify-center hover:bg-[#EDE8E0] transition-colors cursor-pointer"
                              title="이력 보기"
                            >
                              <History size={14} className="text-[#6B7280]" />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg bg-[#F7F3ED] flex items-center justify-center hover:bg-[#EDE8E0] transition-colors cursor-pointer"
                              title="수정"
                            >
                              <Edit2 size={14} className="text-[#6B7280]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  );
                  {/* 상세 펼침 */}
                  if (isExpanded) {
                    rows.push(
                        <tr key={`${item.id}-detail`} className="bg-[#FBFAF7] border-b border-[#E6E2DB]">
                          <td colSpan={10} className="px-6 py-5">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <p className="text-[12px] text-[#9CA3AF] mb-1">공급처</p>
                                <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.supplier}</p>
                              </div>
                              <div>
                                <p className="text-[12px] text-[#9CA3AF] mb-1">단가</p>
                                <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{fmt(item.unitPrice)}원/{item.unit}</p>
                              </div>
                              <div>
                                <p className="text-[12px] text-[#9CA3AF] mb-1">최소 재고 / 최대 재고</p>
                                <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{item.minStock}{item.unit} / {item.maxStock}{item.unit}</p>
                              </div>
                              <div>
                                <p className="text-[12px] text-[#9CA3AF] mb-1">재고 자산 가치</p>
                                <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{fmt(item.stock * item.unitPrice)}원</p>
                              </div>
                              {item.memo && (
                                <div className="col-span-2 lg:col-span-4">
                                  <p className="text-[12px] text-[#9CA3AF] mb-1">메모</p>
                                  <p className="text-[14px] text-[#6B7280] bg-[#F3EFE8] px-4 py-2.5 rounded-lg">{item.memo}</p>
                                </div>
                              )}
                              {/* 최근 이력 미리보기 */}
                              {item.history.length > 0 && (
                                <div className="col-span-2 lg:col-span-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-[12px] text-[#9CA3AF]">최근 입출고 이력</p>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openHistory(item); }}
                                      className="text-[12px] text-[#2F4F46] hover:underline cursor-pointer"
                                    >
                                      전체 보기
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {item.history.slice(0, 3).map(h => (
                                      <div key={h.id} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-[#E6E2DB]">
                                        <span className={`text-[12px] px-2 py-0.5 rounded-md ${h.type === "입고" ? "bg-[#ECF7EE] text-[#1B5E20]" : h.type === "출고" ? "bg-[#FDECEC] text-[#C62828]" : "bg-[#F7F3ED] text-[#6B7280]"}`} style={{ fontWeight: 700 }}>
                                          {h.type}
                                        </span>
                                        <span className="text-[13px] text-[#6B7280]">{h.date}</span>
                                        <span className={`text-[13px] ${h.quantity > 0 ? "text-[#1B5E20]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>
                                          {h.quantity > 0 ? "+" : ""}{h.quantity}{item.unit}
                                        </span>
                                        <span className="text-[13px] text-[#6B7280]">{h.note}</span>
                                        <span className="text-[12px] text-[#9CA3AF] ml-auto">{h.by}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                    );
                  }
                  return rows;
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 하단 합계 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6E2DB] bg-[#FBFAF7] rounded-b-[14px]">
          <span className="text-[13px] text-[#6B7280]">
            총 {filteredItems.length}개 품목 표시 중
          </span>
          <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
            표시 항목 재고 자산: {fmt(filteredItems.reduce((s, it) => s + it.stock * it.unitPrice, 0))}원
          </span>
        </div>
      </div>

      {/* ═══ 재고 조정 모달 ═══ */}
      {showAdjustModal && adjustItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E2DB]">
              <div>
                <h3 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>재고 조정</h3>
                <p className="text-[14px] text-[#6B7280] mt-1">{adjustItem.name}</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="w-9 h-9 rounded-lg bg-[#F7F3ED] flex items-center justify-center hover:bg-[#EDE8E0] transition-colors cursor-pointer">
                <X size={18} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* 현재 재고 */}
              <div className="flex items-center justify-between p-4 bg-[#FBFAF7] rounded-lg border border-[#E6E2DB]">
                <span className="text-[14px] text-[#6B7280]">현재 보유 재고</span>
                <span className="text-[18px] text-[#1F2937]" style={{ fontWeight: 900 }}>{fmt(adjustItem.stock)}{adjustItem.unit}</span>
              </div>
              {/* 입고/출고 선택 */}
              <div>
                <label className="text-[14px] text-[#1F2937] mb-2 block" style={{ fontWeight: 700 }}>조정 유형</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAdjustType("입고"); setAdjustReason("입고"); }}
                    className={`flex-1 h-[48px] rounded-lg text-[15px] transition-colors cursor-pointer border ${
                      adjustType === "입고"
                        ? "bg-[#ECF7EE] text-[#1B5E20] border-[#A5D6A7]"
                        : "bg-white text-[#6B7280] border-[#D6D0C8]"
                    }`}
                    style={{ fontWeight: adjustType === "입고" ? 700 : 400 }}
                  >
                    <Plus size={16} className="inline mr-1" /> 입고
                  </button>
                  <button
                    onClick={() => { setAdjustType("출고"); setAdjustReason("판매"); }}
                    className={`flex-1 h-[48px] rounded-lg text-[15px] transition-colors cursor-pointer border ${
                      adjustType === "출고"
                        ? "bg-[#FDECEC] text-[#C62828] border-[#EF9A9A]"
                        : "bg-white text-[#6B7280] border-[#D6D0C8]"
                    }`}
                    style={{ fontWeight: adjustType === "출고" ? 700 : 400 }}
                  >
                    <Minus size={16} className="inline mr-1" /> 출고
                  </button>
                </div>
              </div>
              {/* 수량 */}
              <div>
                <label className="text-[14px] text-[#1F2937] mb-2 block" style={{ fontWeight: 700 }}>수량 ({adjustItem.unit})</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  placeholder="수량을 입력하세요"
                  className="w-full h-[48px] px-4 rounded-lg border border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none"
                  min="1"
                />
                {adjustQty && !isNaN(parseInt(adjustQty)) && (
                  <p className="text-[13px] text-[#6B7280] mt-2">
                    조정 후 예상 재고: <span style={{ fontWeight: 700 }} className={
                      Math.max(0, adjustItem.stock + (adjustType === "입고" ? parseInt(adjustQty) : -parseInt(adjustQty))) <= adjustItem.minStock
                        ? "text-[#C62828]" : "text-[#1B5E20]"
                    }>
                      {fmt(Math.max(0, adjustItem.stock + (adjustType === "입고" ? parseInt(adjustQty) : -parseInt(adjustQty))))}{adjustItem.unit}
                    </span>
                  </p>
                )}
              </div>
              {/* 사유 */}
              <div>
                <label className="text-[14px] text-[#1F2937] mb-2 block" style={{ fontWeight: 700 }}>사유</label>
                <div className="flex flex-wrap gap-2">
                  {ADJUST_REASONS.filter(r => {
                    if (adjustType === "입고") return ["입고", "반품", "재고조사", "기타"].includes(r);
                    return ["판매", "폐기", "체험소모", "재고조사", "기타"].includes(r);
                  }).map(r => (
                    <button
                      key={r}
                      onClick={() => setAdjustReason(r)}
                      className={`h-[36px] px-4 rounded-lg text-[13px] transition-colors cursor-pointer border ${
                        adjustReason === r
                          ? "bg-[#2F4F46] text-white border-[#2F4F46]"
                          : "bg-white text-[#6B7280] border-[#D6D0C8] hover:bg-[#F7F3ED]"
                      }`}
                      style={{ fontWeight: adjustReason === r ? 700 : 400 }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {/* 비고 */}
              <div>
                <label className="text-[14px] text-[#1F2937] mb-2 block" style={{ fontWeight: 700 }}>비고 (선택)</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={e => setAdjustNote(e.target.value)}
                  placeholder="추가 메모를 입력하세요"
                  className="w-full h-[48px] px-4 rounded-lg border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-[#E6E2DB]">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 h-[48px] rounded-lg border border-[#D6D0C8] text-[15px] text-[#6B7280] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleAdjust}
                disabled={!adjustQty || isNaN(parseInt(adjustQty)) || parseInt(adjustQty) <= 0}
                className="flex-1 h-[48px] rounded-lg bg-[#2F4F46] text-white text-[15px] hover:bg-[#243f38] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
              >
                {adjustType === "입고" ? "입고 처리" : "출고 처리"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 입출고 이력 모달 ═══ */}
      {showHistoryModal && historyItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[560px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E2DB]">
              <div>
                <h3 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>입출고 이력</h3>
                <p className="text-[14px] text-[#6B7280] mt-1">{historyItem.name} · 현재 {fmt(historyItem.stock)}{historyItem.unit}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="w-9 h-9 rounded-lg bg-[#F7F3ED] flex items-center justify-center hover:bg-[#EDE8E0] transition-colors cursor-pointer">
                <X size={18} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="px-6 py-5">
              {historyItem.history.length === 0 ? (
                <div className="text-center py-10">
                  <History size={32} className="text-[#D6D0C8] mx-auto mb-3" />
                  <p className="text-[14px] text-[#9CA3AF]">아직 기록된 이력이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItem.history.map(h => (
                    <div key={h.id} className="flex items-start gap-4 p-4 bg-[#FBFAF7] rounded-lg border border-[#E6E2DB]">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        h.type === "입고" ? "bg-[#ECF7EE]" : h.type === "출고" ? "bg-[#FDECEC]" : "bg-[#F7F3ED]"
                      }`}>
                        {h.type === "입고" ? <Plus size={18} className="text-[#1B5E20]" /> : h.type === "출고" ? <Minus size={18} className="text-[#C62828]" /> : <RotateCcw size={18} className="text-[#6B7280]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[14px] ${h.type === "입고" ? "text-[#1B5E20]" : h.type === "출고" ? "text-[#C62828]" : "text-[#6B7280]"}`} style={{ fontWeight: 700 }}>
                            {h.type} {h.quantity > 0 ? "+" : ""}{h.quantity}{historyItem.unit}
                          </span>
                          <span className="text-[12px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">{h.reason}</span>
                        </div>
                        {h.note && <p className="text-[13px] text-[#6B7280]">{h.note}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[12px] text-[#9CA3AF]">{h.date}</span>
                          <span className="text-[12px] text-[#9CA3AF]">처리자: {h.by}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
