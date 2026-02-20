import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  X, Check, Search, ChevronDown, ArrowRight,
  Lightbulb, TrendingUp,
  Bell, Settings2, CheckCheck, EyeOff,
  ShieldAlert, BadgeInfo, Zap,
  AlertCircle, ClipboardList
} from "lucide-react";
import { toast } from "sonner";

/* ═══ 타입 ═══ */
type Priority = "critical" | "warning" | "info";
type AlertType = "경고" | "추천" | "예측" | "할 일";

interface Alert {
  id: number;
  priority: Priority;
  type: AlertType;
  title: string;
  desc: string;
  reason: string[];
  impact?: string;
  impactType?: "loss" | "gain";
  time: string;
  section: "recommend" | "warn" | "predict" | "recent";
  actionLabel: string;
  actionPath?: string;
  read: boolean;
  hidden: boolean;
}

interface PrioritySettings {
  stockDays: number;
  marginDrop: number;
  costIncrease: number;
  dailyLimit: number;
}

/* ═══ 더미 데이터 ═══ */
const INITIAL_ALERTS: Alert[] = [
  {
    id: 1, priority: "critical", type: "경고",
    title: "감귤 재고가 3일 안에 소진됩니다",
    desc: "현재 3박스 남았고, 이번 주 예약 기준 4일 이내 소진 예상입니다.",
    reason: ["최근 2주간 하루 평균 0.8박스 사용 중입니다.", "이번 주 예약 12건(감귤 체험 포함) 기준으로 계산했습니다.", "지금 주문하면 배송까지 2일 걸립니다."],
    impact: "−375,000원", impactType: "loss",
    time: "방금", section: "warn", actionLabel: "재료 주문", actionPath: "/products", read: false, hidden: false,
  },
  {
    id: 2, priority: "critical", type: "경고",
    title: "흑돼지 식사 남는 비율이 목표보다 15% 낮습니다",
    desc: "현재 30%로, 목표(45%) 대비 크게 낮습니다. 이번 달 매출 1위 상품이라 영향이 큽니다.",
    reason: ["고기 단가가 2주 전보다 8% 올랐습니다.", "해당 상품이 이번 달 전체 매출의 28%를 차지합니다.", "판매가를 35,000원으로 올리면 남는 비율 40%를 회복할 수 있습니다."],
    impact: "−420,000원/월", impactType: "loss",
    time: "1시간 전", section: "warn", actionLabel: "원가 조정", actionPath: "/products", read: false, hidden: false,
  },
  {
    id: 3, priority: "critical", type: "할 일",
    title: "미확인 카드 지출 35건이 쌓여 있습니다",
    desc: "확인하지 않은 카드 내역이 많으면 비용 집계가 부정확해집니다.",
    reason: ["2월 1일 이후 확인 안 된 카드 내역이 35건입니다.", "총 미확인 금액은 약 1,580,000원입니다.", "지금 확인하면 이번 달 비용 보고서가 정확해집니다."],
    impact: "1,580,000원 미확인", impactType: "loss",
    time: "2시간 전", section: "warn", actionLabel: "내역 확인", actionPath: "/expense-input", read: false, hidden: false,
  },
  {
    id: 4, priority: "critical", type: "예측",
    title: "세무 자료 정리까지 12일 남았습니다",
    desc: "홈택스 자료가 아직 연동되지 않았습니다. 기한 내 정리가 필요합니다.",
    reason: ["부가세 신고 마감일은 2월 25일입니다.", "현재 홈택스 연동이 안 된 상태입니다.", "지금 연동하면 자동으로 자료를 정리할 수 있습니다."],
    impact: "가산세 위험", impactType: "loss",
    time: "오늘", section: "predict", actionLabel: "홈택스 연동", actionPath: "/expense-input", read: false, hidden: false,
  },
  {
    id: 5, priority: "warning", type: "경고",
    title: "가스 비용이 전월보다 12% 증가했습니다",
    desc: "이번 달 가스비 420,000원으로, 지난달(375,000원)보다 높습니다.",
    reason: ["최근 2주 평균보다 비용이 늘었습니다.", "해당 항목이 이번 달 비용에서 차지하는 비율이 커지고 있습니다.", "지금 점검하면 추가 비용 증가를 막을 수 있습니다."],
    impact: "−45,000원/월", impactType: "loss",
    time: "3시간 전", section: "warn", actionLabel: "지출 확인", actionPath: "/revenue", read: false, hidden: false,
  },
  {
    id: 6, priority: "warning", type: "경고",
    title: "다음 2주 예약이 22% 감소했습니다",
    desc: "지난 2주 대비 예약 건수가 줄어드는 추세입니다.",
    reason: ["지난 2주: 28건 → 다음 2주: 22건으로 감소.", "특히 평일 체험 예약이 크게 줄었습니다.", "할인 패키지나 평일 이벤트로 보완할 수 있습니다."],
    impact: "−600,000원 예상", impactType: "loss",
    time: "오전", section: "warn", actionLabel: "예약 현황", actionPath: "/operations", read: false, hidden: false,
  },
  {
    id: 7, priority: "warning", type: "추천",
    title: "2/17(화) 예약이 2건뿐 — 패키지 할인 추천",
    desc: "감귤 체험 + 식사 패키지를 10% 할인하면 평일 매출을 높일 수 있습니다.",
    reason: ["평일 평균 예약은 5건인데, 이 날은 2건입니다.", "비슷한 날짜에 패키지 할인을 했을 때 예약이 2배 늘었습니다.", "패키지 판매가는 49,500원(10% 할인)이 적당합니다."],
    impact: "+200,000원 예상", impactType: "gain",
    time: "오전", section: "recommend", actionLabel: "패키지 만들기", actionPath: "/products", read: false, hidden: false,
  },
  {
    id: 8, priority: "warning", type: "할 일",
    title: "영수증 확인 대기 12건",
    desc: "자동 분석 후 '확인 필요' 상태의 영수증이 쌓여 있습니다.",
    reason: ["최근 3일간 올린 영수증 중 12건이 미확인입니다.", "확인하면 이번 달 비용이 더 정확해집니다.", "'확인하기' 버튼을 누르면 한 건씩 빠르게 처리할 수 있습니다."],
    time: "4시간 전", section: "recent", actionLabel: "영수증 확인", actionPath: "/expense-input", read: false, hidden: false,
  },
  {
    id: 9, priority: "warning", type: "예측",
    title: "체험 키트가 7일 이내 소진 예상",
    desc: "현재 12세트 남아 있고, 주간 사용량 기준 7일 내 소진됩니다.",
    reason: ["주간 평균 사용량은 1.7세트입니다.", "다음 주 감귤잼 체험 예약이 8건 있습니다.", "지금 주문하면 소진 전에 도착합니다."],
    impact: "−240,000원", impactType: "loss",
    time: "5시간 전", section: "predict", actionLabel: "재료 주문", actionPath: "/products", read: false, hidden: false,
  },
  {
    id: 10, priority: "info", type: "추천",
    title: "단골 고객 3명이 새로 등록되었습니다",
    desc: "최근 3회 이상 예약한 고객이 단골로 전환되었습니다.",
    reason: ["김○○, 이○○, 박○○ 고객이 단골 조건을 충족했습니다.", "단골 고객에게 감사 메시지를 보내면 재방문율이 올라갑니다.", "고객 관리 메뉴에서 확인할 수 있습니다."],
    time: "오전", section: "recommend", actionLabel: "고객 관리", actionPath: "/customers", read: false, hidden: false,
  },
  {
    id: 11, priority: "info", type: "예측",
    title: "3월 예상 매출: 1,350만원 (+12%)",
    desc: "과거 3개월 데이터와 현재 예약 추세를 바탕으로 계산했습니다.",
    reason: ["과거 3개월 데이터와 현재 예약 추세를 바탕으로 계산했습니다.", "3월은 계절적으로 예약이 늘어나는 시기입니다.", "예상 순수익은 5,800,000원입니다."],
    time: "어제", section: "predict", actionLabel: "보고서 보기", actionPath: "/reports", read: true, hidden: false,
  },
  {
    id: 12, priority: "info", type: "할 일",
    title: "1월 경영 보고서가 생성되었습니다",
    desc: "매월 초에 전월 보고서가 자동 생성됩니다. 매출, 비용, 순수익, 고객 현황이 포함되어 있습니다.",
    reason: ["매월 초에 전월 보고서가 자동 생성됩니다.", "매출, 비용, 순수익, 고객 현황이 포함되어 있습니다.", "PDF로 내려받을 수 있습니다."],
    time: "2일 전", section: "recent", actionLabel: "보고서 열기", actionPath: "/reports", read: true, hidden: false,
  },
  {
    id: 13, priority: "info", type: "할 일",
    title: "자동화 규칙 3개가 정상 작동 중입니다",
    desc: "설정한 3개의 자동화 규칙이 모두 정상적으로 실행되고 있습니다.",
    reason: ["'예약 확인 문자 발송'이 오늘 5건 실행되었습니다.", "'재고 부족 알림'이 정상 모니터링 중입니다.", "'일일 매출 정리'가 어제 자동 실행되었습니다."],
    time: "3일 전", section: "recent", actionLabel: "자동화 관리", actionPath: "/automation", read: true, hidden: false,
  },
];

/* 섹션 정의 */
const SECTIONS = [
  { key: "warn", label: "경고", subLabel: "손해를 막아야 합니다", icon: ShieldAlert, color: "text-[#C62828]", bg: "bg-[#FDECEC]", accentBorder: "border-l-[#C62828]" },
  { key: "recommend", label: "추천", subLabel: "매출을 늘릴 수 있습니다", icon: Lightbulb, color: "text-[#1B5E20]", bg: "bg-[#ECF7EE]", accentBorder: "border-l-[#2E7D32]" },
  { key: "predict", label: "예측", subLabel: "미리 준비하세요", icon: TrendingUp, color: "text-[#2F4F46]", bg: "bg-[#F0F5F4]", accentBorder: "border-l-[#2F4F46]" },
  { key: "recent", label: "할 일", subLabel: "처리가 필요합니다", icon: ClipboardList, color: "text-[#8A6A2B]", bg: "bg-[#FFF6E6]", accentBorder: "border-l-[#C69C3C]" },
] as const;

/* ═══ 컴포넌트 ═══ */
export function SmartCenter() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState<PrioritySettings>({ stockDays: 3, marginDrop: 10, costIncrease: 10, dailyLimit: 10 });
  const [draftSettings, setDraftSettings] = useState<PrioritySettings>(settings);

  /* 필터링 */
  const visibleAlerts = useMemo(() => {
    return alerts
      .filter(a => !a.hidden)
      .filter(a => filterPriority === "all" || a.priority === filterPriority)
      .filter(a => !searchQuery || a.title.includes(searchQuery) || a.desc.includes(searchQuery))
      .sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.priority] - order[b.priority];
      });
  }, [alerts, filterPriority, searchQuery]);

  const unreadCount = alerts.filter(a => !a.read && !a.hidden).length;
  const criticalCount = alerts.filter(a => a.priority === "critical" && !a.hidden && !a.read).length;
  const warningCount = alerts.filter(a => a.priority === "warning" && !a.hidden && !a.read).length;

  /* 섹션별 알림 */
  const sectionAlerts = (section: string) => visibleAlerts.filter(a => a.section === section);

  /* 오늘 핵심 3가지 */
  const topAlerts = useMemo(() => {
    return [...alerts.filter(a => !a.hidden && !a.read)].sort((a, b) => {
      const score = (al: Alert) => {
        if (al.priority === "critical" && al.type === "경고") return 0;
        if (al.priority === "critical") return 1;
        if (al.priority === "warning" && al.type === "경고") return 2;
        return 3;
      };
      return score(a) - score(b);
    }).slice(0, 3);
  }, [alerts]);

  /* 액션 */
  const markRead = (id: number) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  const hideAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, hidden: true } : a));
    if (expandedId === id) setExpandedId(null);
  };
  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    toast.success("모두 읽음 처리되었습니다", {
      style: { background: "#ECF7EE", color: "#1B5E20", border: "1px solid #C8E6C9", fontFamily: "'Noto Serif KR', serif" },
    });
  };
  const saveSettings = () => {
    setSettings(draftSettings);
    setShowSettings(false);
    toast.success("저장되었습니다", {
      style: { background: "#ECF7EE", color: "#1B5E20", border: "1px solid #C8E6C9", fontFamily: "'Noto Serif KR', serif" },
    });
  };

  /* 색상 맵 */
  const priorityLabel: Record<Priority, { label: string; dot: string }> = {
    critical: { label: "긴급", dot: "bg-[#C62828]" },
    warning: { label: "주의", dot: "bg-[#D4A520]" },
    info: { label: "정보", dot: "bg-[#9CA3AF]" },
  };

  /* ═══ 핵심 카드 ═══ */
  const TopCard = ({ alert, rank }: { alert: Alert; rank: number }) => {
    const borderColors = ["border-l-[#C62828]", "border-l-[#D4A520]", "border-l-[#2F4F46]"];
    const rankBgs = ["bg-[#C62828]", "bg-[#D4A520]", "bg-[#2F4F46]"];

    return (
      <div
        className={`bg-white rounded-2xl border border-[#E6E2DB] border-l-[3px] ${borderColors[rank]} shadow-[0_1px_4px_rgba(0,0,0,0.03)] p-4 cursor-pointer hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between`}
        onClick={() => { if (alert.actionPath) navigate(alert.actionPath); }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-5 h-5 rounded-md ${rankBgs[rank]} flex items-center justify-center text-[11px] text-white`} style={{ fontWeight: 700 }}>{rank + 1}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded ${
              alert.priority === "critical" ? "bg-[#FDECEC] text-[#C62828]" : alert.priority === "warning" ? "bg-[#FFF6E6] text-[#8A6A2B]" : "bg-[#F0F5F4] text-[#2F4F46]"
            }`} style={{ fontWeight: 700 }}>{alert.type}</span>
          </div>
          <p className="text-[15px] text-[#1F2937] leading-snug mb-2" style={{ fontWeight: 700 }}>{alert.title}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          {alert.impact ? (
            <span className={`text-[14px] ${alert.impactType === "loss" ? "text-[#C62828]" : "text-[#1B5E20]"}`} style={{ fontWeight: 700 }}>
              {alert.impact}
            </span>
          ) : <span />}
          <span className="flex items-center gap-1 text-[13px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
            {alert.actionLabel} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    );
  };

  /* ═══ 알림 행 ═══ */
  const AlertRow = ({ alert, accentBorder }: { alert: Alert; accentBorder: string }) => {
    const isOpen = expandedId === alert.id;
    const p = priorityLabel[alert.priority];

    return (
      <div className={`${alert.read ? "opacity-50" : ""} transition-all`}>
        <div
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-l-[3px] ${
            isOpen ? `${accentBorder} bg-[#F7F3ED]` : "border-l-transparent hover:bg-[#FBFAF7]"
          }`}
          onClick={() => setExpandedId(isOpen ? null : alert.id)}
        >
          {/* 우선순위 점 */}
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.dot}`} />

          {/* 미읽음 */}
          {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-[#C62828] shrink-0" />}

          {/* 제목 */}
          <span className="flex-1 text-[15px] text-[#1F2937] truncate" style={{ fontWeight: alert.read ? 400 : 700 }}>
            {alert.title}
          </span>

          {/* 영향 */}
          {alert.impact && (
            <span className={`text-[13px] shrink-0 px-2 py-0.5 rounded-md ${
              alert.impactType === "loss" ? "bg-[#FDECEC] text-[#C62828]" : "bg-[#ECF7EE] text-[#1B5E20]"
            }`} style={{ fontWeight: 700 }}>
              {alert.impact}
            </span>
          )}

          {/* 시간 */}
          <span className="text-[12px] text-[#9CA3AF] shrink-0 w-[56px] text-right">{alert.time}</span>

          {/* 바로가기 */}
          {alert.actionPath && (
            <button
              onClick={e => { e.stopPropagation(); navigate(alert.actionPath!); }}
              className="text-[13px] text-[#2F4F46] px-2.5 py-1 rounded-lg hover:bg-[#ECF7EE] cursor-pointer transition-colors shrink-0 flex items-center gap-1"
              style={{ fontWeight: 700 }}
            >
              {alert.actionLabel} <ArrowRight size={11} />
            </button>
          )}

          <ChevronDown size={13} className={`text-[#9CA3AF] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>

        {/* 펼침 */}
        {isOpen && (
          <div className="mx-4 mb-3 mt-1 bg-white rounded-xl border border-[#E6E2DB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-4">
              <p className="text-[14px] text-[#6B7280] leading-relaxed mb-3">{alert.desc}</p>
              <div className="bg-[#FBFAF7] rounded-lg p-3.5 mb-3">
                <p className="text-[13px] text-[#2F4F46] mb-2" style={{ fontWeight: 700 }}>왜 이런가요?</p>
                <div className="space-y-1.5">
                  {alert.reason.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[12px] text-[#9CA3AF] shrink-0 mt-0.5" style={{ fontWeight: 700 }}>{i + 1}.</span>
                      <p className="text-[14px] text-[#6B7280] leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-[#FBFAF7] border-t border-[#E6E2DB]">
              <div className="flex gap-3">
                <button onClick={() => markRead(alert.id)} className="text-[13px] text-[#6B7280] hover:text-[#2F4F46] cursor-pointer flex items-center gap-1">
                  <Check size={13} /> 읽음
                </button>
                <button onClick={() => hideAlert(alert.id)} className="text-[13px] text-[#6B7280] hover:text-[#2F4F46] cursor-pointer flex items-center gap-1">
                  <EyeOff size={13} /> 숨기기
                </button>
              </div>
              {alert.actionPath && (
                <button
                  onClick={() => navigate(alert.actionPath!)}
                  className="h-[36px] px-4 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {alert.actionLabel} <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══ 우선순위 설정 패널 ═══ */
  const renderSettingsPanel = () => {
    if (!showSettings) return null;

    const Stepper = ({ label, hint, value, min, max, step, suffix, onChange }: {
      label: string; hint: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void;
    }) => (
      <div className="py-5 border-b border-[#F3EFE8] last:border-0">
        <p className="text-[15px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>{label}</p>
        <p className="text-[14px] text-[#6B7280] mb-3 leading-relaxed">{hint}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange(Math.max(min, value - step))} className="w-10 h-10 rounded-xl border border-[#D6D0C8] flex items-center justify-center text-[18px] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors">−</button>
          <div className="w-[90px] h-[44px] rounded-xl border border-[#D6D0C8] flex items-center justify-center text-[17px] text-[#1F2937] bg-[#FBFAF7]" style={{ fontWeight: 700 }}>{value}{suffix}</div>
          <button onClick={() => onChange(Math.min(max, value + step))} className="w-10 h-10 rounded-xl border border-[#D6D0C8] flex items-center justify-center text-[18px] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors">+</button>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(60,55,45,0.3)" }} onClick={() => setShowSettings(false)}>
        <div className="bg-white w-[440px] h-full shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="px-6 pt-6 pb-5 border-b border-[#E6E2DB] shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>우선순위 기준</h2>
              <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer transition-colors"><X size={20} /></button>
            </div>
            <p className="text-[14px] text-[#6B7280] mt-2 leading-relaxed">알림이 너무 많거나 너무 적으면, 여기서 기준을 바꿀 수 있어요.</p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Stepper label="재고 부족 기준" hint="재고 부족을 '몇 일 전'부터 중요로 볼까요?" value={draftSettings.stockDays} min={1} max={7} step={1} suffix="일" onChange={v => setDraftSettings(p => ({ ...p, stockDays: v }))} />
            <Stepper label="남는 비율 기준" hint="남는 비율이 목표보다 '얼마나 낮으면' 중요로 볼까요?" value={draftSettings.marginDrop} min={5} max={20} step={5} suffix="%" onChange={v => setDraftSettings(p => ({ ...p, marginDrop: v }))} />
            <Stepper label="비용 증가 기준" hint="비용이 전월보다 '얼마나 늘면' 주의로 볼까요?" value={draftSettings.costIncrease} min={5} max={30} step={5} suffix="%" onChange={v => setDraftSettings(p => ({ ...p, costIncrease: v }))} />
            <Stepper label="알림 개수 제한" hint="하루에 보여줄 알림 개수를 설정합니다." value={draftSettings.dailyLimit} min={5} max={15} step={5} suffix="개" onChange={v => setDraftSettings(p => ({ ...p, dailyLimit: v }))} />
          </div>
          <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
            <button onClick={() => setDraftSettings({ stockDays: 3, marginDrop: 10, costIncrease: 10, dailyLimit: 10 })} className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">기본값으로</button>
            <button onClick={saveSettings} className="h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">저장하기</button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ 메인 렌더 ═══ */
  return (
    <div className="max-w-[1100px]">

      {/* ── 헤더 ── */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] text-[#1F2937]" style={{ fontWeight: 700 }}>스마트 경영 센터</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">AI가 분석한 경영 알림과 추천을 한눈에 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setDraftSettings(settings); setShowSettings(true); }} className="h-[40px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer">
            <Settings2 size={15} /> 기준 설정
          </button>
          <button onClick={markAllRead} className="h-[40px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer">
            <CheckCheck size={15} /> 모두 읽음
          </button>
        </div>
      </div>

      {/* ── 오늘의 핵심 3가지 ── */}
      {topAlerts.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#2F4F46] flex items-center justify-center">
              <Zap size={14} className="text-[#FFD54F]" />
            </div>
            <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>오늘의 핵심</span>
            <span className="text-[12px] text-[#9CA3AF]">가장 먼저 확인하세요</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {topAlerts.map((a, i) => <TopCard key={`top-${a.id}`} alert={a} rank={i} />)}
          </div>
        </div>
      )}

      {/* ── 요약 스트립 ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "전체 알림", count: alerts.filter(a => !a.hidden).length, icon: Bell, color: "text-[#2F4F46]", bg: "bg-[#F0F5F4]", active: filterPriority === "all", key: "all" as const },
          { label: "긴급", count: criticalCount, icon: AlertCircle, color: "text-[#C62828]", bg: "bg-[#FDECEC]", active: filterPriority === "critical", key: "critical" as const },
          { label: "주의", count: warningCount, icon: ShieldAlert, color: "text-[#8A6A2B]", bg: "bg-[#FFF6E6]", active: filterPriority === "warning", key: "warning" as const },
          { label: "정보", count: alerts.filter(a => a.priority === "info" && !a.hidden).length, icon: BadgeInfo, color: "text-[#6B7280]", bg: "bg-[#F7F3ED]", active: filterPriority === "info", key: "info" as const },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilterPriority(s.key === filterPriority ? "all" : s.key as any)}
            className={`rounded-2xl border px-4 py-3 flex items-center gap-3 cursor-pointer transition-all text-left ${
              s.active ? "border-[#2F4F46] bg-white shadow-[0_0_0_1px_#2F4F46]" : "border-[#E6E2DB] bg-white hover:border-[#D6D0C8]"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div>
              <p className="text-[12px] text-[#9CA3AF]">{s.label}</p>
              <p className="text-[20px] text-[#1F2937]" style={{ fontWeight: 700 }}>{s.count}<span className="text-[13px] text-[#9CA3AF]" style={{ fontWeight: 400 }}>건</span></p>
            </div>
          </button>
        ))}
      </div>

      {/* ── 검색 ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[13px] text-[#9CA3AF]">
          <BadgeInfo size={13} />
          <span>기준: 재고 {settings.stockDays}일 / 비율 {settings.marginDrop}% / 비용 {settings.costIncrease}%</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="알림 검색"
            className="h-[36px] w-[180px] pl-8 pr-3 rounded-xl border border-[#D6D0C8] bg-white text-[13px] focus:border-[#2F4F46] focus:outline-none"
          />
        </div>
      </div>

      {/* ── 카테고리별 알림 테이블 ── */}
      <div className="space-y-4">
        {SECTIONS.map(sec => {
          const items = sectionAlerts(sec.key);
          if (items.length === 0) return null;
          const unreadInSection = items.filter(a => !a.read).length;

          return (
            <div key={sec.key} className="bg-white rounded-2xl border border-[#E6E2DB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* 섹션 헤더 */}
              <div className="px-5 py-3 bg-[#FBFAF7] border-b border-[#E6E2DB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${sec.bg} flex items-center justify-center`}>
                    <sec.icon size={14} className={sec.color} />
                  </div>
                  <span className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{sec.label}</span>
                  <span className="text-[13px] text-[#9CA3AF]">{sec.subLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadInSection > 0 && (
                    <span className="text-[12px] text-[#C62828] bg-[#FDECEC] px-2 py-0.5 rounded-md" style={{ fontWeight: 700 }}>
                      {unreadInSection}건 미읽음
                    </span>
                  )}
                  <span className="text-[12px] text-[#9CA3AF]">총 {items.length}건</span>
                </div>
              </div>

              {/* 알림 행 */}
              <div className="divide-y divide-[#F3EFE8]">
                {items.map(a => <AlertRow key={a.id} alert={a} accentBorder={sec.accentBorder} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 빈 상태 */}
      {visibleAlerts.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E6E2DB] py-16 text-center">
          <Bell size={28} className="text-[#D6D0C8] mx-auto mb-3" />
          <p className="text-[16px] text-[#6B7280]" style={{ fontWeight: 700 }}>알림이 없습니다</p>
          <p className="text-[14px] text-[#9CA3AF] mt-1">새로운 알림이 생기면 여기에 표시됩니다.</p>
        </div>
      )}

      <div className="h-4" />

      {/* 설정 패널 */}
      {renderSettingsPanel()}
    </div>
  );
}
