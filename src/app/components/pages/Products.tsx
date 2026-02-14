import { useState } from "react";
import { Search, ChevronDown, Plus, Check, AlertTriangle, Star, Edit2, Package, Layers, FileText } from "lucide-react";
import { ProductWizard } from "../modals/ProductWizard";

/* ─── 더미 데이터 ─── */
const products = [
  { id: 1, name: "감귤 따기 체험", type: "체험", price: 25000, cost: 11000, remaining: 14000, margin: 56, status: "완료" },
  { id: 2, name: "흑돼지 식사", type: "식사", price: 30000, cost: 21000, remaining: 9000, margin: 30, status: "완료" },
  { id: 3, name: "한옥 숙박", type: "숙박", price: 120000, cost: 48000, remaining: 72000, margin: 60, status: "완료" },
  { id: 4, name: "해산물 바비큐", type: "식사", price: 35000, cost: null, remaining: null, margin: null, status: "미완료" },
  { id: 5, name: "감귤잼 만들기", type: "체험", price: 20000, cost: 8500, remaining: 11500, margin: 57, status: "완료" },
  { id: 6, name: "승마 체험", type: "체험", price: 40000, cost: 22000, remaining: 18000, margin: 45, status: "완료" },
];

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

const templatesData = [
  {
    id: "exp-basic", name: "체험 기본", type: "체험", desc: "장갑, 소모품, 인건비 포함",
    items: ["체험 장갑", "체험 키트", "포장 상자"], laborIncluded: true, utilityIncluded: true,
    totalCost: 9800,
  },
  {
    id: "food-basic", name: "식사 기본", type: "식사", desc: "주재료, 부재료, 가스, 인건비 포함",
    items: ["돼지고기 목살", "양파", "당근", "숯"], laborIncluded: true, utilityIncluded: true,
    totalCost: 16300,
  },
  {
    id: "stay-basic", name: "숙박 기본", type: "숙박", desc: "청소, 세탁, 어메니티, 공과금 포함",
    items: ["어메니티 세트", "세탁 세제", "청소 용품"], laborIncluded: true, utilityIncluded: true,
    totalCost: 14200,
  },
  {
    id: "exp-premium", name: "프리미엄 체험", type: "체험", desc: "고급 재료 + 선물 포장 포함",
    items: ["체험 키트(감귤잼)", "포장 상자", "감귤"], laborIncluded: true, utilityIncluded: true,
    totalCost: 12500,
  },
];

const MATERIAL_FILTERS = ["전체", "식자재", "체험 자재", "소모품", "청소/세탁"];

/* ─── 컴포넌트 ─── */
export function Products() {
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "materials" | "templates">("products");

  /* 상품 목록 */
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("전체");

  /* 재료 목록 */
  const [matSearch, setMatSearch] = useState("");
  const [matFilter, setMatFilter] = useState("전체");
  const [matData, setMatData] = useState(materialsLibrary);

  const filtered = products.filter(p => {
    if (search && !p.name.includes(search)) return false;
    if (filter !== "전체" && p.type !== filter) return false;
    return true;
  });

  const filteredMats = matData.filter(m => {
    if (matSearch && !m.name.includes(matSearch)) return false;
    if (matFilter !== "전체" && m.category !== matFilter) return false;
    return true;
  });

  const toggleFav = (id: number) => {
    setMatData(prev => prev.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m));
  };

  const tabs = [
    { key: "products" as const, label: "상품 목록", icon: Package },
    { key: "materials" as const, label: "재료·자재 목록", icon: Layers },
    { key: "templates" as const, label: "템플릿", icon: FileText },
  ];

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
      </div>

      {/* ─── 상품 목록 탭 ─── */}
      {activeTab === "products" && (
        <>
          {/* 검색/필터 */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="상품 검색"
                className="h-[44px] w-[240px] pl-10 pr-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="h-[44px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer"
              >
                <option>전체</option>
                <option>체험</option>
                <option>식사</option>
                <option>숙박</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>

          {/* 상품 카드 그리드 */}
          <div className="grid grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-[14px] border border-[#E6E2DB] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-0.5 rounded">{p.type}</span>
                    <h3 className="text-[16px] text-[#1F2937] mt-2" style={{ fontWeight: 700 }}>{p.name}</h3>
                  </div>
                  {p.status === "완료" ? (
                    <span className="text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-0.5 rounded flex items-center gap-1">
                      <Check size={12} /> 비용 설정 완료
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle size={12} /> 미완료
                    </span>
                  )}
                </div>
                <div className="space-y-3 border-t border-[#F3EFE8] pt-4">
                  <div className="flex justify-between">
                    <span className="text-[14px] text-[#6B7280]">판매가</span>
                    <span className="text-[14px] text-[#1F2937]">{p.price.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[14px] text-[#6B7280]">들어간 비용</span>
                    <span className="text-[14px] text-[#1F2937]">{p.cost !== null ? `${p.cost.toLocaleString()}원` : "—"}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#F3EFE8] pt-3">
                    <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>남는 금액</span>
                    <span className="text-[16px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{p.remaining !== null ? `${p.remaining.toLocaleString()}원` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[14px] text-[#6B7280]">남는 비율</span>
                    {p.margin !== null ? (
                      <span className={`text-[14px] ${p.margin >= 40 ? "text-[#1B5E20]" : p.margin >= 25 ? "text-[#8A6A2B]" : "text-[#C62828]"}`} style={{ fontWeight: 700 }}>
                        {p.margin}%
                      </span>
                    ) : (
                      <span className="text-[14px] text-[#9CA3AF]">—</span>
                    )}
                  </div>
                </div>
                {p.status === "미완료" && (
                  <button
                    onClick={() => setShowWizard(true)}
                    className="mt-4 w-full h-[44px] rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
                  >
                    비용 설정하기
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── 재료·자재 목록 탭 ─── */}
      {activeTab === "materials" && (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* 상단 컨트롤 */}
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
                      matFilter === f
                        ? "bg-[#2F4F46] text-white"
                        : "bg-[#F7F3ED] text-[#6B7280] hover:bg-[#E6E2DB]"
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

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FBFAF7]">
                  {["", "재료명", "분류", "단위", "최근 단가", "거래처", "최근 구매", "재고", "알림 기준", ""].map((h, i) => (
                    <th key={i} className="text-left text-[13px] text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg whitespace-nowrap" style={{ fontWeight: 700 }}>
                      {h}
                    </th>
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
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-0.5 rounded">{m.category}</span>
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#6B7280]">{m.unit}</td>
                    <td className="px-4 py-3 text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{m.price.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-[14px] text-[#6B7280]">{m.vendor}</td>
                    <td className="px-4 py-3 text-[14px] text-[#9CA3AF]">{m.lastPurchase}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[14px] ${m.stock <= m.alert ? "text-[#C62828]" : "text-[#1F2937]"}`} style={{ fontWeight: m.stock <= m.alert ? 700 : 400 }}>
                        {m.stock}{m.unit === "킬로" ? "kg" : m.unit}
                      </span>
                      {m.stock <= m.alert && (
                        <span className="ml-1.5 text-[11px] text-[#C62828] bg-[#FDECEC] px-1.5 py-0.5 rounded">부족</span>
                      )}
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

          {/* 하단 요약 */}
          <div className="px-6 py-4 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center gap-6">
            <span className="text-[13px] text-[#6B7280]">전체 재료: <strong className="text-[#1F2937]">{matData.length}개</strong></span>
            <span className="text-[13px] text-[#6B7280]">즐겨찾기: <strong className="text-[#1F2937]">{matData.filter(m => m.favorite).length}개</strong></span>
            <span className="text-[13px] text-[#C62828]">재고 부족: <strong>{matData.filter(m => m.stock <= m.alert).length}개</strong></span>
          </div>
        </div>
      )}

      {/* ─── 템플릿 탭 ─── */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-[#6B7280]">
              템플릿을 사용하면 상품 등록 시 기본 비용 항목이 자동으로 채워집니다.
            </p>
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
      )}

      {showWizard && <ProductWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}