import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Star } from "lucide-react";
import { CustomerPanel } from "../panels/CustomerPanel";

const customers = [
  { id: 1, name: "김미영", visits: 12, totalSpent: 1840000, lastVisit: "2026.02.10", grade: "단골", memo: "감귤 알레르기 없음" },
  { id: 2, name: "이상호", visits: 8, totalSpent: 920000, lastVisit: "2026.02.14", grade: "단골", memo: "흑돼지 선호" },
  { id: 3, name: "박지은", visits: 5, totalSpent: 650000, lastVisit: "2026.02.14", grade: "단골", memo: "" },
  { id: 4, name: "최영수", visits: 3, totalSpent: 420000, lastVisit: "2026.02.14", grade: "신규", memo: "채식 가능 문의" },
  { id: 5, name: "정하나", visits: 2, totalSpent: 350000, lastVisit: "2026.02.14", grade: "신규", memo: "" },
  { id: 6, name: "강동원", visits: 15, totalSpent: 2450000, lastVisit: "2026.02.14", grade: "단골", memo: "가족 체험 선호" },
  { id: 7, name: "윤서현", visits: 1, totalSpent: 120000, lastVisit: "2026.02.08", grade: "신규", memo: "" },
  { id: 8, name: "홍길동", visits: 6, totalSpent: 780000, lastVisit: "2026.01.28", grade: "단골", memo: "숙박 선호" },
];

export function Customers() {
  const [showPanel, setShowPanel] = useState(false);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [visitFilter, setVisitFilter] = useState("전체");

  const filtered = customers.filter(c => {
    if (search && !c.name.includes(search) && !c.memo.includes(search)) return false;
    if (gradeFilter !== "전체" && c.grade !== gradeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-[1160px] space-y-8">
      {/* 검색 & 필터 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[320px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호로 검색"
            className="w-full h-[44px] pl-10 pr-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="h-[44px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer"
          >
            <option>전체</option>
            <option>단골</option>
            <option>신규</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={visitFilter}
            onChange={e => setVisitFilter(e.target.value)}
            className="h-[44px] pl-4 pr-8 rounded-xl border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer"
          >
            <option value="전체">최근 방문</option>
            <option>최근 30일</option>
            <option>최근 3개월</option>
            <option>전체</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
      </div>

      {/* 고객 테이블 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FBFAF7]">
              {["고객명", "등급", "방문 횟수", "총 결제 금액", "최근 방문일", "메모", ""].map(h => (
                <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-5 py-4 first:rounded-tl-[14px] last:rounded-tr-[14px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr
                key={c.id}
                onClick={() => setShowPanel(true)}
                className="border-b border-[#EFEAE2] hover:bg-[#F7F3ED] cursor-pointer group transition-colors"
              >
                <td className="px-5 py-4 text-[14px] text-[#1F2937] relative">
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2F4F46] rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] bg-[#F7F3ED] rounded-full flex items-center justify-center text-[14px] font-bold text-[#2F4F46]">
                      {c.name.charAt(0)}
                    </div>
                    {c.name}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {c.grade === "단골" ? (
                    <span className="text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-1 rounded flex items-center gap-1 w-fit">
                      <Star size={10} /> 단골
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-1 rounded">신규</span>
                  )}
                </td>
                <td className="px-5 py-4 text-[14px] text-[#1F2937]">{c.visits}회</td>
                <td className="px-5 py-4 text-[14px] text-[#1F2937] text-right">{c.totalSpent.toLocaleString()}원</td>
                <td className="px-5 py-4 text-[14px] text-[#6B7280]">{c.lastVisit}</td>
                <td className="px-5 py-4 text-[14px] text-[#9CA3AF] max-w-[160px] truncate">{c.memo || "—"}</td>
                <td className="px-5 py-4 text-[#9CA3AF]"><ChevronRight size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPanel && <CustomerPanel onClose={() => setShowPanel(false)} />}
    </div>
  );
}
