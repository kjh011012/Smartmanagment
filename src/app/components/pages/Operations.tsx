import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  Search, Users, CreditCard, Clock, CalendarDays, List
} from "lucide-react";
import { ReservationPanel } from "../panels/ReservationPanel";

/* ═══ 타입 ═══ */
interface Reservation {
  id: string;
  day: number;
  time: string;
  product: string;
  type: "체험" | "식사" | "숙박";
  customer: string;
  phone: string;
  people: number;
  payment: number;
  payStatus: "완료" | "대기" | "미결제";
  prepStatus: "완료" | "준비중" | "미시작";
  discount: number;
  memo: string;
}

interface DaySummary {
  count: number;
  people: number;
  revenue: number;
  types: { type: string; count: number }[];
}

/* ═══ 더미 데이터 ═══ */
const ALL_RESERVATIONS: Reservation[] = [
  // 14일 (오늘)
  { id: "R-001", day: 14, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "김미영", phone: "010-1234-5678", people: 8, payment: 200000, payStatus: "완료", prepStatus: "준비중", discount: 0, memo: "아이 3명 포함" },
  { id: "R-002", day: 14, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "이상호", phone: "010-2345-6789", people: 4, payment: 100000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-003", day: 14, time: "11:30", product: "감귤잼 만들기", type: "체험", customer: "한수정", phone: "010-9988-7766", people: 6, payment: 120000, payStatus: "완료", prepStatus: "준비중", discount: 0, memo: "재료 2세트 추가 요청" },
  { id: "R-004", day: 14, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "박지은", phone: "010-3456-7890", people: 12, payment: 360000, payStatus: "완료", prepStatus: "준비중", discount: 0, memo: "단체석 필요" },
  { id: "R-005", day: 14, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "최영수", phone: "010-4567-8901", people: 6, payment: 180000, payStatus: "대기", prepStatus: "미시작", discount: 0, memo: "알러지: 갑각류" },
  { id: "R-006", day: 14, time: "13:00", product: "해산물 바비큐", type: "식사", customer: "윤서연", phone: "010-5566-7788", people: 4, payment: 140000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-007", day: 14, time: "15:00", product: "한옥 숙박 체크인", type: "숙박", customer: "정하나", phone: "010-5678-9012", people: 3, payment: 120000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "얼리 체크인 요청" },
  { id: "R-008", day: 14, time: "15:00", product: "감귤 따기 체험", type: "체험", customer: "강동원", phone: "010-6789-0123", people: 5, payment: 125000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  // 15일
  { id: "R-009", day: 15, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "오민지", phone: "010-1111-2222", people: 10, payment: 250000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-010", day: 15, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "서준혁", phone: "010-3333-4444", people: 8, payment: 240000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-011", day: 15, time: "14:00", product: "승마 체험", type: "체험", customer: "임하늘", phone: "010-5555-6666", people: 3, payment: 120000, payStatus: "대기", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-012", day: 15, time: "15:00", product: "한옥 숙박 체크인", type: "숙박", customer: "조은비", phone: "010-7777-8888", people: 2, payment: 120000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  // 16일
  { id: "R-013", day: 16, time: "10:00", product: "감귤잼 만들기", type: "체험", customer: "김태희", phone: "010-1212-3434", people: 5, payment: 100000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-014", day: 16, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "이수진", phone: "010-5656-7878", people: 6, payment: 180000, payStatus: "대기", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-015", day: 16, time: "15:00", product: "한옥 숙박 체크인", type: "숙박", customer: "박민수", phone: "010-9090-1010", people: 4, payment: 240000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  // 17일
  { id: "R-016", day: 17, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "홍길동", phone: "010-0000-1111", people: 6, payment: 150000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-017", day: 17, time: "14:00", product: "승마 체험", type: "체험", customer: "나은별", phone: "010-2222-3333", people: 2, payment: 80000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  // 기타 날짜 요약용
  { id: "R-018", day: 5, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "고은솔", phone: "010-4444-5555", people: 10, payment: 250000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-019", day: 5, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "장세윤", phone: "010-6666-7777", people: 8, payment: 240000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-020", day: 5, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "배수아", phone: "010-8888-9999", people: 6, payment: 180000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-021", day: 5, time: "14:00", product: "감귤잼 만들기", type: "체험", customer: "송지훈", phone: "010-1010-2020", people: 4, payment: 80000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-022", day: 5, time: "15:00", product: "한옥 숙박 체크인", type: "숙박", customer: "유하린", phone: "010-3030-4040", people: 2, payment: 120000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-023", day: 12, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "문도현", phone: "010-5050-6060", people: 15, payment: 375000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-024", day: 12, time: "11:00", product: "감귤잼 만들기", type: "체험", customer: "권예린", phone: "010-7070-8080", people: 8, payment: 160000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-025", day: 12, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "신동욱", phone: "010-9090-0000", people: 20, payment: 600000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "단체 예약" },
  { id: "R-026", day: 12, time: "14:00", product: "승마 체험", type: "체험", customer: "차민서", phone: "010-1122-3344", people: 4, payment: 160000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-027", day: 12, time: "15:00", product: "한옥 숙박 체크인", type: "숙박", customer: "양서현", phone: "010-5566-7788", people: 3, payment: 120000, payStatus: "완료", prepStatus: "완료", discount: 0, memo: "" },
  { id: "R-028", day: 20, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "류지원", phone: "010-1234-4321", people: 6, payment: 150000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-029", day: 20, time: "12:00", product: "해산물 바비큐", type: "식사", customer: "안소희", phone: "010-5678-8765", people: 8, payment: 280000, payStatus: "대기", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-030", day: 20, time: "14:00", product: "승마 체험", type: "체험", customer: "구현수", phone: "010-9012-2109", people: 4, payment: 160000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-031", day: 25, time: "10:00", product: "감귤 따기 체험", type: "체험", customer: "피유정", phone: "010-3456-6543", people: 12, payment: 300000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-032", day: 25, time: "11:00", product: "감귤잼 만들기", type: "체험", customer: "하지안", phone: "010-7890-0987", people: 6, payment: 120000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-033", day: 25, time: "12:00", product: "흑돼지 식사", type: "식사", customer: "진서윤", phone: "010-1357-7531", people: 10, payment: 300000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-034", day: 25, time: "14:00", product: "승마 체험", type: "체험", customer: "노해찬", phone: "010-2468-8642", people: 3, payment: 120000, payStatus: "완료", prepStatus: "미시작", discount: 0, memo: "" },
  { id: "R-035", day: 25, time: "15:00", product: "한옥 숙박 체크인", type: "숙박", customer: "남지유", phone: "010-1593-3951", people: 4, payment: 240000, payStatus: "대기", prepStatus: "미시작", discount: 0, memo: "" },
];

const DAYS_IN_MONTH = 28;
const TODAY = 14;
const FIRST_DAY_OFFSET = 6; // 2026년 2월 1일 = 토요일
const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* ═══ 유틸 ═══ */
const buildDaySummaries = (reservations: Reservation[]): Record<number, DaySummary> => {
  const map: Record<number, DaySummary> = {};
  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const dayRes = reservations.filter(r => r.day === d);
    if (dayRes.length === 0) continue;
    const typeMap: Record<string, number> = {};
    dayRes.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
    map[d] = {
      count: dayRes.length,
      people: dayRes.reduce((s, r) => s + r.people, 0),
      revenue: dayRes.reduce((s, r) => s + r.payment, 0),
      types: Object.entries(typeMap).map(([type, count]) => ({ type, count })),
    };
  }
  return map;
};

const TYPE_COLORS: Record<string, string> = {
  "체험": "bg-[#ECF7EE] text-[#1B5E20]",
  "식사": "bg-[#FFF6E6] text-[#8A6A2B]",
  "숙박": "bg-[#F7F3ED] text-[#2F4F46]",
};

const getBadgeStyle = (status: string) => {
  if (status === "완료") return "bg-[#ECF7EE] text-[#1B5E20]";
  if (status === "대기" || status === "준비중") return "bg-[#FFF6E6] text-[#8A6A2B]";
  if (status === "미결제") return "bg-[#FDECEC] text-[#C62828]";
  return "bg-[#F7F3ED] text-[#6B7280]";
};

/* ═══ 컴포넌트 ═══ */
export function Operations() {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [panelReservation, setPanelReservation] = useState<Reservation | null>(null);

  // 패널 접기 상태
  const [listCollapsed, setListCollapsed] = useState(false);
  const [calCollapsed, setCalCollapsed] = useState(false);

  // 필터
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");

  const daySummaries = useMemo(() => buildDaySummaries(ALL_RESERVATIONS), []);

  // 선택 날짜 예약
  const dayReservations = useMemo(() => {
    return ALL_RESERVATIONS
      .filter(r => r.day === selectedDay)
      .filter(r => !search || r.customer.includes(search) || r.product.includes(search) || r.id.includes(search))
      .filter(r => typeFilter === "전체" || r.type === typeFilter)
      .filter(r => {
        if (statusFilter === "전체") return true;
        if (statusFilter === "결제완료") return r.payStatus === "완료";
        if (statusFilter === "결제대기") return r.payStatus === "대기" || r.payStatus === "미결제";
        if (statusFilter === "준비완료") return r.prepStatus === "완료";
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDay, search, typeFilter, statusFilter]);

  const daySummary = daySummaries[selectedDay];
  const allDayRes = ALL_RESERVATIONS.filter(r => r.day === selectedDay);

  // 패널 열기
  const openPanel = (r: Reservation) => setPanelReservation(r);

  /* ═══ 예약 목록 (좌측) ═══ */
  const renderList = () => {
    if (listCollapsed) {
      return (
        <div className="w-[48px] shrink-0 bg-white rounded-xl border border-[#E6E2DB] flex flex-col items-center py-4 gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => setListCollapsed(false)}
            className="w-9 h-9 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors"
            title="예약 목록 펼치기"
          >
            <PanelLeftOpen size={16} className="text-[#6B7280]" />
          </button>
          <div className="writing-mode-vertical text-[13px] text-[#6B7280] mt-2" style={{ writingMode: "vertical-rl" }}>
            예약 목록
          </div>
          {daySummary && (
            <div className="mt-auto text-center">
              <span className="text-[14px] text-[#2F4F46]" style={{ fontWeight: 700 }}>{daySummary.count}</span>
              <span className="text-[11px] text-[#9CA3AF] block">건</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-xl border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden transition-all ${
        calCollapsed ? "flex-1" : "w-[480px] shrink-0"
      }`}>
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-[#E6E2DB] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <List size={18} className="text-[#2F4F46]" />
              <h2 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                2월 {selectedDay}일 예약
              </h2>
              {daySummary && (
                <span className="text-[13px] text-[#9CA3AF]">{daySummary.count}건</span>
              )}
            </div>
            <button
              onClick={() => setListCollapsed(true)}
              className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors"
              title="예약 목록 접기"
            >
              <PanelLeftClose size={15} className="text-[#6B7280]" />
            </button>
          </div>

          {/* 요약 카드 */}
          {daySummary && (
            <div className="flex gap-3 mb-3">
              <div className="flex-1 bg-[#FBFAF7] rounded-lg px-3 py-2.5 flex items-center gap-2">
                <Users size={14} className="text-[#2F4F46]" />
                <div>
                  <p className="text-[12px] text-[#9CA3AF]">총 인원</p>
                  <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{daySummary.people}명</p>
                </div>
              </div>
              <div className="flex-1 bg-[#FBFAF7] rounded-lg px-3 py-2.5 flex items-center gap-2">
                <CreditCard size={14} className="text-[#2F4F46]" />
                <div>
                  <p className="text-[12px] text-[#9CA3AF]">예상 매출</p>
                  <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{(daySummary.revenue / 10000).toFixed(0)}만원</p>
                </div>
              </div>
              <div className="flex-1 bg-[#FBFAF7] rounded-lg px-3 py-2.5">
                <p className="text-[12px] text-[#9CA3AF] mb-1">구성</p>
                <div className="flex gap-1 flex-wrap">
                  {daySummary.types.map(t => (
                    <span key={t.type} className={`text-[11px] px-1.5 py-0.5 rounded ${TYPE_COLORS[t.type] || "bg-[#F7F3ED] text-[#6B7280]"}`}>
                      {t.type} {t.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 필터 */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="고객명/상품 검색"
                className="w-full h-[34px] pl-8 pr-3 rounded-lg border border-[#D6D0C8] bg-white text-[13px] focus:border-[#2F4F46] focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="h-[34px] pl-3 pr-7 rounded-lg border border-[#D6D0C8] bg-white text-[12px] appearance-none cursor-pointer"
              >
                <option>전체</option>
                <option>체험</option>
                <option>식사</option>
                <option>숙박</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-[34px] pl-3 pr-7 rounded-lg border border-[#D6D0C8] bg-white text-[12px] appearance-none cursor-pointer"
              >
                <option>전체</option>
                <option>결제완료</option>
                <option>결제대기</option>
                <option>준비완료</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 예약 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {dayReservations.length > 0 ? (
            <div>
              {/* 시간대별 그룹 */}
              {(() => {
                const timeGroups = new Map<string, Reservation[]>();
                dayReservations.forEach(r => {
                  if (!timeGroups.has(r.time)) timeGroups.set(r.time, []);
                  timeGroups.get(r.time)!.push(r);
                });

                return Array.from(timeGroups.entries()).map(([time, group]) => (
                  <div key={time}>
                    {/* 시간대 헤더 */}
                    <div className="px-5 py-2 bg-[#FBFAF7] border-b border-[#F3EFE8] flex items-center gap-2">
                      <Clock size={13} className="text-[#9CA3AF]" />
                      <span className="text-[13px] text-[#6B7280]" style={{ fontWeight: 700 }}>{time}</span>
                      <span className="text-[12px] text-[#9CA3AF]">{group.length}건 · {group.reduce((s, r) => s + r.people, 0)}명</span>
                    </div>
                    {/* 예약 카드 */}
                    {group.map(r => (
                      <button
                        key={r.id}
                        onClick={() => openPanel(r)}
                        className="w-full text-left px-5 py-3.5 border-b border-[#F3EFE8] hover:bg-[#F7F3ED] cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[11px] px-1.5 py-0.5 rounded ${TYPE_COLORS[r.type]}`}>{r.type}</span>
                              <span className="text-[14px] text-[#1F2937] truncate" style={{ fontWeight: 700 }}>{r.product}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[13px] text-[#6B7280]">
                              <span>{r.customer}</span>
                              <span>{r.people}명</span>
                              <span>{r.payment.toLocaleString()}원</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-3">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded ${getBadgeStyle(r.payStatus)}`}>{r.payStatus === "완료" ? "결제완료" : r.payStatus}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded ${getBadgeStyle(r.prepStatus)}`}>{r.prepStatus}</span>
                            <ChevronRight size={14} className="text-[#D6D0C8] group-hover:text-[#9CA3AF] transition-colors" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays size={32} className="text-[#D6D0C8] mb-3" />
              <p className="text-[14px] text-[#9CA3AF]">이 날은 예약이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 하단 요약 */}
        {allDayRes.length > 0 && (
          <div className="px-5 py-3 bg-[#FBFAF7] border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
            <span className="text-[12px] text-[#9CA3AF]">
              총 {allDayRes.length}건 · {allDayRes.reduce((s, r) => s + r.people, 0)}명
            </span>
            <span className="text-[12px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
              {allDayRes.reduce((s, r) => s + r.payment, 0).toLocaleString()}원
            </span>
          </div>
        )}
      </div>
    );
  };

  /* ═══ 캘린더 (우측) ═══ */
  const renderCalendar = () => {
    if (calCollapsed) {
      return (
        <div className="w-[48px] shrink-0 bg-white rounded-xl border border-[#E6E2DB] flex flex-col items-center py-4 gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => setCalCollapsed(false)}
            className="w-9 h-9 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors"
            title="캘린더 펼치기"
          >
            <PanelRightOpen size={16} className="text-[#6B7280]" />
          </button>
          <div className="text-[13px] text-[#6B7280] mt-2" style={{ writingMode: "vertical-rl" }}>
            캘린더
          </div>
          <div className="mt-auto text-center">
            <span className="text-[14px] text-[#2F4F46]" style={{ fontWeight: 700 }}>2월</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-xl border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden transition-all ${
        listCollapsed ? "flex-1" : "flex-1"
      }`}>
        {/* 캘린더 헤더 */}
        <div className="px-5 py-4 border-b border-[#E6E2DB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors">
              <ChevronLeft size={15} className="text-[#6B7280]" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#2F4F46]" />
              <h2 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>2026년 2월</h2>
            </div>
            <button className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors">
              <ChevronRight size={15} className="text-[#6B7280]" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDay(TODAY)}
              className="h-[32px] px-3 rounded-lg border border-[#D6D0C8] text-[12px] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
            >
              오늘
            </button>
            <button
              onClick={() => setCalCollapsed(true)}
              className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors"
              title="캘린더 접기"
            >
              <PanelRightClose size={15} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* 캘린더 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-7 gap-0">
            {/* 요일 헤더 */}
            {WEEK_DAYS.map((d, i) => (
              <div key={d} className={`text-center text-[12px] py-2 border-b border-[#E6E2DB] ${
                i === 0 ? "text-[#C62828]" : i === 6 ? "text-[#2F4F46]" : "text-[#9CA3AF]"
              }`} style={{ fontWeight: 700 }}>
                {d}
              </div>
            ))}

            {/* 빈 칸 */}
            {Array.from({ length: FIRST_DAY_OFFSET }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-[#F3EFE8]" />
            ))}

            {/* 날짜 */}
            {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
              const day = i + 1;
              const summary = daySummaries[day];
              const isSelected = day === selectedDay;
              const isToday = day === TODAY;
              const dayOfWeek = (FIRST_DAY_OFFSET + i) % 7;
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[90px] border-b border-r border-[#F3EFE8] p-1.5 text-left transition-all cursor-pointer relative flex flex-col ${
                    isSelected
                      ? "bg-[#F7F3ED] ring-1 ring-[#2F4F46] ring-inset rounded-sm"
                      : "hover:bg-[#FBFAF7]"
                  }`}
                >
                  {/* 날짜 숫자 */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[13px] w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-[#2F4F46] text-white"
                        : isSunday
                          ? "text-[#C62828]"
                          : isSaturday
                            ? "text-[#2F4F46]"
                            : "text-[#1F2937]"
                    }`} style={{ fontWeight: isToday || isSelected ? 700 : 400 }}>
                      {day}
                    </span>
                    {summary && summary.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        summary.count >= 6 ? "bg-[#2F4F46] text-white" : "bg-[#ECF7EE] text-[#1B5E20]"
                      }`} style={{ fontWeight: 700 }}>
                        {summary.count}건
                      </span>
                    )}
                  </div>

                  {/* 요약 정보 */}
                  {summary && (
                    <div className="flex-1 flex flex-col gap-0.5 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Users size={10} className="text-[#9CA3AF] shrink-0" />
                        <span className="text-[10px] text-[#6B7280]">{summary.people}명</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard size={10} className="text-[#9CA3AF] shrink-0" />
                        <span className="text-[10px] text-[#6B7280]">{(summary.revenue / 10000).toFixed(0)}만</span>
                      </div>
                      <div className="flex gap-0.5 flex-wrap mt-0.5">
                        {summary.types.slice(0, 2).map(t => (
                          <span key={t.type} className="text-[9px] px-1 py-[1px] rounded bg-[#F7F3ED] text-[#6B7280]">
                            {t.type}{t.count}
                          </span>
                        ))}
                        {summary.types.length > 2 && (
                          <span className="text-[9px] text-[#9CA3AF]">+{summary.types.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="flex items-center gap-4 mt-4 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#2F4F46] text-white text-[10px] flex items-center justify-center" style={{ fontWeight: 700 }}>14</span>
              <span className="text-[11px] text-[#9CA3AF]">오늘</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2F4F46] text-white" style={{ fontWeight: 700 }}>6+건</span>
              <span className="text-[11px] text-[#9CA3AF]">많음</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ECF7EE] text-[#1B5E20]">5건</span>
              <span className="text-[11px] text-[#9CA3AF]">보통</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ 메인 렌더 ═══ */
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-[22px] text-[#1F2937]" style={{ fontWeight: 700 }}>운영 관리</h1>
        <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
          <span>
            2월 전체: <strong className="text-[#1F2937]">{ALL_RESERVATIONS.length}건</strong>
          </span>
          <span>
            오늘: <strong className="text-[#2F4F46]">{ALL_RESERVATIONS.filter(r => r.day === TODAY).length}건</strong>
          </span>
        </div>
      </div>

      {/* 메인 2패널 레이아웃 */}
      <div className="flex-1 flex gap-4 min-h-0">
        {renderList()}
        {renderCalendar()}
      </div>

      {/* 상세 패널 (우측 슬라이드) */}
      {panelReservation && (
        <ReservationPanel
          onClose={() => setPanelReservation(null)}
          reservation={{
            id: panelReservation.id,
            customer: panelReservation.customer,
            phone: panelReservation.phone,
            product: panelReservation.product,
            date: `2026년 2월 ${panelReservation.day}일`,
            time: panelReservation.time,
            people: panelReservation.people,
            payment: panelReservation.payment,
            discount: panelReservation.discount,
            status: panelReservation.payStatus === "완료" ? "확정" : "대기",
          }}
        />
      )}
    </div>
  );
}