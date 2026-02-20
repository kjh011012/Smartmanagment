import { useState, useMemo } from "react";
import {
  Zap, Receipt, CreditCard, Landmark, PackageSearch, BarChart3,
  FileText, CalendarCheck, Settings, ChevronDown,
  Clock, TrendingUp, AlertTriangle, Activity, History,
  ExternalLink, Info, CheckCircle2, XCircle, Minus, Plus
} from "lucide-react";
import { toast } from "sonner";

/* ═══ 타입 ═══ */
type Category = "reservation" | "cost" | "alert" | "report";

interface RunLog {
  time: string;
  result: "success" | "fail";
  detail: string;
}

interface AutoItem {
  id: string;
  category: Category;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  shortDesc: string;
  enabled: boolean;
  needsLink: boolean;
  linked: boolean;
  hasSettings: boolean;
  lastRun?: string;
  runCount: number;
  savedMinutes: number;
  logs: RunLog[];
}

const CATEGORIES: { key: Category; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "reservation", label: "예약 자동화", icon: CalendarCheck, color: "text-[#1B5E20]", bg: "bg-[#ECF7EE]" },
  { key: "cost", label: "비용 자동화", icon: CreditCard, color: "text-[#2F4F46]", bg: "bg-[#F0F5F4]" },
  { key: "alert", label: "알림 자동화", icon: AlertTriangle, color: "text-[#8A6A2B]", bg: "bg-[#FFF6E6]" },
  { key: "report", label: "보고서 자동화", icon: FileText, color: "text-[#2F4F46]", bg: "bg-[#F0F5F4]" },
];

const initialItems: AutoItem[] = [
  {
    id: "cost-calc", category: "reservation",
    icon: CalendarCheck, iconColor: "text-[#1B5E20]", iconBg: "bg-[#ECF7EE]",
    label: "예약 시 비용 자동 계산", shortDesc: "예약 접수 → 비용 자동 차감",
    enabled: true, needsLink: false, linked: true, hasSettings: false,
    lastRun: "오늘 14:20", runCount: 128, savedMinutes: 384,
    logs: [
      { time: "오늘 14:20", result: "success", detail: "감귤 체험 예약 — 비용 88,000원 자동 차감" },
      { time: "오늘 11:05", result: "success", detail: "흑돼지 식사 예약 — 비용 252,000원 자동 차감" },
      { time: "어제 16:40", result: "success", detail: "한옥 숙박 예약 — 비용 140,000원 자동 차감" },
    ],
  },
  {
    id: "receipt-auto", category: "cost",
    icon: Receipt, iconColor: "text-[#2F4F46]", iconBg: "bg-[#F0F5F4]",
    label: "영수증 자동 입력", shortDesc: "사진 촬영 → 거래처·금액 자동 인식",
    enabled: true, needsLink: false, linked: true, hasSettings: false,
    lastRun: "오늘 09:30", runCount: 247, savedMinutes: 494,
    logs: [
      { time: "오늘 09:30", result: "success", detail: "농협마트 — 식재료 152,000원 자동 입력" },
      { time: "어제 17:10", result: "success", detail: "제주수산 — 해산물 88,000원 자동 입력" },
      { time: "어제 10:25", result: "fail", detail: "영수증 이미지 흐림 — 수동 확인 필요" },
    ],
  },
  {
    id: "card-auto", category: "cost",
    icon: CreditCard, iconColor: "text-[#2F4F46]", iconBg: "bg-[#F0F5F4]",
    label: "카드 내역 자동 불러오기", shortDesc: "카드 연동 → 매일 자동 수집",
    enabled: false, needsLink: true, linked: false, hasSettings: true,
    lastRun: undefined, runCount: 0, savedMinutes: 0,
    logs: [],
  },
  {
    id: "homtax-auto", category: "cost",
    icon: Landmark, iconColor: "text-[#2F4F46]", iconBg: "bg-[#F0F5F4]",
    label: "홈택스 자료 자동 정리", shortDesc: "세금계산서·매입 자료 자동 분류",
    enabled: false, needsLink: true, linked: false, hasSettings: true,
    lastRun: undefined, runCount: 0, savedMinutes: 0,
    logs: [],
  },
  {
    id: "stock-alert", category: "alert",
    icon: PackageSearch, iconColor: "text-[#8A6A2B]", iconBg: "bg-[#FFF6E6]",
    label: "재고 부족 알림", shortDesc: "소진 예상 → 사전 알림 발송",
    enabled: true, needsLink: false, linked: true, hasSettings: true,
    lastRun: "오늘 08:00", runCount: 45, savedMinutes: 135,
    logs: [
      { time: "오늘 08:00", result: "success", detail: "감귤 재고 3일 이내 소진 예상 — 알림 발송" },
      { time: "어제 08:00", result: "success", detail: "모든 재고 정상 — 알림 없음" },
      { time: "2일 전 08:00", result: "success", detail: "체험 키트 5일 이내 소진 예상 — 알림 발송" },
    ],
  },
  {
    id: "margin-alert", category: "alert",
    icon: BarChart3, iconColor: "text-[#8A6A2B]", iconBg: "bg-[#FFF6E6]",
    label: "남는 비율 경고", shortDesc: "기준 이하 시 자동 경고",
    enabled: true, needsLink: false, linked: true, hasSettings: true,
    lastRun: "오늘 08:00", runCount: 38, savedMinutes: 76,
    logs: [
      { time: "오늘 08:00", result: "success", detail: "흑돼지 식사 남는 비율 30% — 목표(45%) 미달 경고" },
      { time: "어제 08:00", result: "success", detail: "모든 상품 기준 충족 — 경고 없음" },
    ],
  },
  {
    id: "monthly-report", category: "report",
    icon: FileText, iconColor: "text-[#2F4F46]", iconBg: "bg-[#F0F5F4]",
    label: "월간 보고서 자동 생성", shortDesc: "매월 1일 경영 보고서 생성",
    enabled: true, needsLink: false, linked: true, hasSettings: false,
    lastRun: "2/1 오전 6:00", runCount: 8, savedMinutes: 1440,
    logs: [
      { time: "2/1 오전 6:00", result: "success", detail: "2026년 1월 경영 보고서 생성 완료" },
      { time: "1/1 오전 6:00", result: "success", detail: "2025년 12월 경영 보고서 생성 완료" },
    ],
  },
];

/* ═══ 유틸 ═══ */
function fmtMin(min: number): string {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

/* ═══ 컴포넌트 ═══ */
export function Automation() {
  const [items, setItems] = useState(initialItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* 설정값 */
  const [marginThreshold, setMarginThreshold] = useState(45);
  const [stockDays, setStockDays] = useState(5);
  const [cardTime, setCardTime] = useState("오전 8시");
  const [homtaxCycle, setHomtaxCycle] = useState("매주 월요일");

  /* 요약 */
  const activeCount = items.filter(i => i.enabled).length;
  const totalCount = items.length;
  const totalRuns = items.reduce((s, i) => s + i.runCount, 0);
  const totalSaved = items.reduce((s, i) => s + i.savedMinutes, 0);

  /* 토글 */
  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (item.needsLink && !item.linked) {
        toast("연동이 필요합니다. '지출 자동 입력' 화면에서 연동해 주세요.", {
          duration: 3000,
          style: { background: "#FFF6E6", color: "#8A6A2B", border: "1px solid #E6D9B8", fontFamily: "'Noto Serif KR', serif" },
        });
        return item;
      }
      const newEnabled = !item.enabled;
      toast.success(newEnabled ? `'${item.label}' 켜짐` : `'${item.label}' 꺼짐`, {
        style: { background: "#ECF7EE", color: "#1B5E20", border: "1px solid #C8E6C9", fontFamily: "'Noto Serif KR', serif" },
      });
      return { ...item, enabled: newEnabled };
    }));
  };

  /* 저장 */
  const handleSave = (label: string) => {
    toast.success(`${label} 설정이 저장되었습니다`, {
      style: { background: "#ECF7EE", color: "#1B5E20", border: "1px solid #C8E6C9", fontFamily: "'Noto Serif KR', serif" },
    });
  };

  /* 행 확장 */
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  /* 카테고리별 그룹 */
  const grouped = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      items: items.filter(i => i.category === cat.key),
    })).filter(g => g.items.length > 0);
  }, [items]);

  /* ═══ Stepper ═══ */
  const Stepper = ({ value, min, max, step, suffix, onChange }: {
    value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void;
  }) => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-lg border border-[#D6D0C8] flex items-center justify-center text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
      >
        <Minus size={13} />
      </button>
      <div className="w-[60px] h-8 rounded-lg border border-[#D6D0C8] flex items-center justify-center text-[15px] text-[#1F2937] bg-[#FBFAF7]" style={{ fontWeight: 700 }}>
        {value}{suffix}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-8 h-8 rounded-lg border border-[#D6D0C8] flex items-center justify-center text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
      >
        <Plus size={13} />
      </button>
    </div>
  );

  /* ═══ 설정+로그 패널 ═══ */
  const renderExpandPanel = (item: AutoItem) => (
    <div className="bg-[#FBFAF7] border-t border-[#E6E2DB]">
      <div className="px-5 py-4 flex gap-6">
        {/* 좌: 설정 */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-[#6B7280] leading-relaxed mb-3">{item.shortDesc}</p>

          {/* 설정 컨트롤 */}
          {item.id === "margin-alert" && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] text-[#6B7280]">남는 비율이</span>
              <Stepper value={marginThreshold} min={10} max={60} step={5} suffix="%" onChange={setMarginThreshold} />
              <span className="text-[14px] text-[#6B7280]">이하일 때 경고</span>
              <button onClick={() => handleSave("기준값")} className="h-8 px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer ml-auto">저장</button>
            </div>
          )}
          {item.id === "stock-alert" && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] text-[#6B7280]">소진 예상</span>
              <Stepper value={stockDays} min={1} max={14} step={1} suffix="일" onChange={setStockDays} />
              <span className="text-[14px] text-[#6B7280]">전에 알림</span>
              <button onClick={() => handleSave("알림 기준일")} className="h-8 px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer ml-auto">저장</button>
            </div>
          )}
          {item.id === "card-auto" && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] text-[#6B7280]">자동 불러오기</span>
              <div className="relative">
                <select value={cardTime} onChange={e => setCardTime(e.target.value)}
                  className="h-8 pl-3 pr-7 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                  style={{ fontWeight: 700 }}
                >
                  <option>오전 8시</option><option>오후 6시</option><option>자정</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
              <button onClick={() => handleSave("불러오기 시간")} className="h-8 px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer ml-auto">저장</button>
            </div>
          )}
          {item.id === "homtax-auto" && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] text-[#6B7280]">정리 주기</span>
              <div className="relative">
                <select value={homtaxCycle} onChange={e => setHomtaxCycle(e.target.value)}
                  className="h-8 pl-3 pr-7 rounded-lg border border-[#D6D0C8] bg-white text-[14px] text-[#1F2937] appearance-none cursor-pointer focus:border-[#2F4F46] focus:outline-none"
                  style={{ fontWeight: 700 }}
                >
                  <option>매주 월요일</option><option>매월 1일</option><option>매일</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
              <button onClick={() => handleSave("정리 주기")} className="h-8 px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer ml-auto">저장</button>
            </div>
          )}

          {/* 통계 */}
          {item.runCount > 0 && (
            <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[#E6E2DB]">
              <span className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF]">
                <Activity size={12} /> 실행 {item.runCount}회
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[#1B5E20]" style={{ fontWeight: 700 }}>
                <TrendingUp size={12} /> 절약 {fmtMin(item.savedMinutes)}
              </span>
            </div>
          )}
        </div>

        {/* 우: 최근 실행 내역 */}
        {item.logs.length > 0 && (
          <div className="w-[340px] shrink-0 rounded-xl border border-[#E6E2DB] bg-white overflow-hidden">
            <div className="px-3.5 py-2 border-b border-[#E6E2DB] flex items-center gap-1.5">
              <History size={12} className="text-[#9CA3AF]" />
              <span className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>최근 실행</span>
            </div>
            <div className="divide-y divide-[#F3EFE8]">
              {item.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5">
                  {log.result === "success" ? (
                    <CheckCircle2 size={13} className="text-[#1B5E20] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={13} className="text-[#C62828] shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1 text-[13px] text-[#6B7280] leading-snug">{log.detail}</span>
                  <span className="text-[11px] text-[#9CA3AF] shrink-0 mt-0.5">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ═══ 메인 ═══ */
  return (
    <div className="max-w-[1060px]">

      {/* ── 헤더 ── */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] text-[#1F2937]" style={{ fontWeight: 700 }}>자동화 설정</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">반복 작업을 자동으로 처리합니다. 토글로 간편하게 켜고 끄세요.</p>
        </div>
      </div>

      {/* ── 요약 카드 ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-[#E6E2DB] px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#ECF7EE] flex items-center justify-center">
            <Zap size={20} className="text-[#1B5E20]" />
          </div>
          <div>
            <p className="text-[13px] text-[#9CA3AF]">활성 자동화</p>
            <p className="text-[22px] text-[#1F2937] mt-0.5" style={{ fontWeight: 700 }}>
              {activeCount}<span className="text-[14px] text-[#9CA3AF]" style={{ fontWeight: 400 }}> / {totalCount}개</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6E2DB] px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#F0F5F4] flex items-center justify-center">
            <Activity size={20} className="text-[#2F4F46]" />
          </div>
          <div>
            <p className="text-[13px] text-[#9CA3AF]">총 실행 횟수</p>
            <p className="text-[22px] text-[#1F2937] mt-0.5" style={{ fontWeight: 700 }}>
              {totalRuns.toLocaleString()}<span className="text-[14px] text-[#9CA3AF]" style={{ fontWeight: 400 }}>회</span>
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6E2DB] px-5 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FFF6E6] flex items-center justify-center">
            <TrendingUp size={20} className="text-[#8A6A2B]" />
          </div>
          <div>
            <p className="text-[13px] text-[#9CA3AF]">절약한 시간</p>
            <p className="text-[22px] text-[#1F2937] mt-0.5" style={{ fontWeight: 700 }}>
              {fmtMin(totalSaved)}
            </p>
          </div>
        </div>
      </div>

      {/* ── 카테고리별 테이블 ── */}
      <div className="space-y-4">
        {grouped.map(group => {
          const groupActive = group.items.filter(i => i.enabled).length;
          return (
            <div key={group.key} className="bg-white rounded-2xl border border-[#E6E2DB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">

              {/* 카테고리 헤더 */}
              <div className="px-5 py-3 bg-[#FBFAF7] border-b border-[#E6E2DB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${group.bg} flex items-center justify-center`}>
                    <group.icon size={14} className={group.color} />
                  </div>
                  <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{group.label}</span>
                </div>
                <span className="text-[12px] text-[#9CA3AF]">
                  <span className="text-[#2F4F46]" style={{ fontWeight: 700 }}>{groupActive}</span> / {group.items.length} 활성
                </span>
              </div>

              {/* 컬럼 헤더 */}
              <div className="px-5 py-2 border-b border-[#F3EFE8] grid items-center"
                style={{ gridTemplateColumns: "1fr 160px 120px 80px 56px" }}
              >
                <span className="text-[11px] text-[#9CA3AF] tracking-wide" style={{ fontWeight: 700 }}>자동화 항목</span>
                <span className="text-[11px] text-[#9CA3AF] tracking-wide text-center" style={{ fontWeight: 700 }}>작동 방식</span>
                <span className="text-[11px] text-[#9CA3AF] tracking-wide text-center" style={{ fontWeight: 700 }}>마지막 실행</span>
                <span className="text-[11px] text-[#9CA3AF] tracking-wide text-center" style={{ fontWeight: 700 }}>상태</span>
                <span className="text-[11px] text-[#9CA3AF] tracking-wide text-right" style={{ fontWeight: 700 }}>켜기/끄기</span>
              </div>

              {/* 행 */}
              {group.items.map((item, idx) => {
                const isExpanded = expandedId === item.id;
                const isLast = idx === group.items.length - 1;
                return (
                  <div key={item.id}>
                    {/* 메인 로우 */}
                    <div
                      onClick={() => (item.hasSettings || item.logs.length > 0) && toggleExpand(item.id)}
                      className={`px-5 py-3 grid items-center transition-colors ${
                        isExpanded ? "bg-[#F7F3ED]" : "hover:bg-[#FBFAF7]"
                      } ${!isLast && !isExpanded ? "border-b border-[#F3EFE8]" : ""} ${
                        (item.hasSettings || item.logs.length > 0) ? "cursor-pointer" : ""
                      }`}
                      style={{ gridTemplateColumns: "1fr 160px 120px 80px 56px", opacity: item.enabled ? 1 : 0.55 }}
                    >
                      {/* 항목명 */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                          <item.icon size={17} className={item.iconColor} />
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[15px] text-[#1F2937] truncate" style={{ fontWeight: 700 }}>{item.label}</span>
                          {(item.hasSettings || item.logs.length > 0) && (
                            <ChevronDown size={13} className={`text-[#9CA3AF] shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </div>

                      {/* 작동 방식 */}
                      <span className="text-[13px] text-[#6B7280] text-center truncate px-1">{item.shortDesc}</span>

                      {/* 마지막 실행 */}
                      <div className="flex items-center justify-center gap-1.5">
                        {item.lastRun ? (
                          <>
                            <Clock size={12} className="text-[#9CA3AF] shrink-0" />
                            <span className="text-[13px] text-[#6B7280]">{item.lastRun}</span>
                          </>
                        ) : (
                          <span className="text-[13px] text-[#D6D0C8]">—</span>
                        )}
                      </div>

                      {/* 상태 뱃지 */}
                      <div className="flex justify-center">
                        {item.needsLink && !item.linked ? (
                          <span className="flex items-center gap-1 text-[11px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-0.5 rounded-md whitespace-nowrap" style={{ fontWeight: 700 }}>
                            <ExternalLink size={10} /> 연동필요
                          </span>
                        ) : item.enabled ? (
                          <span className="w-2 h-2 rounded-full bg-[#1B5E20]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#D6D0C8]" />
                        )}
                      </div>

                      {/* 토글 */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => toggleItem(item.id, e)}
                          className={`w-[48px] h-[28px] rounded-full relative transition-colors cursor-pointer shrink-0 ${
                            item.enabled ? "bg-[#2F4F46]" : "bg-[#D6D0C8]"
                          }`}
                          style={{ opacity: 1 }}
                          aria-label={item.enabled ? "끄기" : "켜기"}
                        >
                          <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${
                            item.enabled ? "right-[3px]" : "left-[3px]"
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* 확장 패널 */}
                    {isExpanded && (
                      <div className={!isLast ? "border-b border-[#E6E2DB]" : ""}>
                        {renderExpandPanel(item)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── 하단 안내 ── */}
      <div className="mt-4 px-4 py-3 bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] flex items-center gap-2.5">
        <Info size={14} className="text-[#9CA3AF] shrink-0" />
        <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
          자동화는 설정한 조건에 맞게 자동으로 실행됩니다. 행을 클릭하면 세부 설정과 실행 내역을 확인할 수 있어요.
        </p>
      </div>
    </div>
  );
}
