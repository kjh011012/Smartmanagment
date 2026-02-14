import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  X, Check, Search, ChevronDown, ChevronUp, ArrowRight,
  MoreHorizontal, Lightbulb, TrendingUp,
  Bell, Settings2, CheckCheck, EyeOff,
  Clock, ShieldAlert, BadgeInfo, Zap
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

/* ═══ 더미 알림 데이터 ═══ */
const INITIAL_ALERTS: Alert[] = [
  // 중요 - 경고
  {
    id: 1, priority: "critical", type: "경고",
    title: "감귤 재고가 3일 안에 소진됩니다",
    desc: "현재 3박스 남았고, 이번 주 예약 기준 4일 이내 소진 예상입니다.",
    reason: [
      "최근 2주간 하루 평균 0.8박스 사용 중입니다.",
      "이번 주 예약 12건(감귤 체험 포함) 기준으로 계산했습니다.",
      "지금 주문하면 배송까지 2일 걸립니다.",
    ],
    impact: "예상 손해: 375,000원 (체험 취소 시)",
    impactType: "loss",
    time: "방금",
    section: "warn",
    actionLabel: "재료 주문하기",
    actionPath: "/products",
    read: false, hidden: false,
  },
  {
    id: 2, priority: "critical", type: "경고",
    title: "흑돼지 식사 남는 비율이 목표보다 15% 낮습니다",
    desc: "현재 30%로, 목표(45%) 대비 크게 낮습니다. 이번 달 매출 1위 상품이라 영향이 큽니다.",
    reason: [
      "고기 단가가 2주 전보다 8% 올랐습니다.",
      "해당 상품이 이번 달 전체 매출의 28%를 차지합니다.",
      "판매가를 35,000원으로 올리면 남는 비율 40%를 회복할 수 있습니다.",
    ],
    impact: "예상 손해: 월 약 420,000원",
    impactType: "loss",
    time: "1시간 전",
    section: "warn",
    actionLabel: "상품·원가 조정",
    actionPath: "/products",
    read: false, hidden: false,
  },
  {
    id: 3, priority: "critical", type: "할 일",
    title: "미확인 카드 지출이 35건 쌓여 있습니다",
    desc: "확인하지 않은 카드 내역이 많으면 비용 집계가 부정확해집니다.",
    reason: [
      "2월 1일 이후 확인 안 된 카드 내역이 35건입니다.",
      "총 미확인 금액은 약 1,580,000원입니다.",
      "지금 확인하면 이번 달 비용 보고서가 정확해집니다.",
    ],
    impact: "미확인 금액: 1,580,000원",
    impactType: "loss",
    time: "2시간 전",
    section: "warn",
    actionLabel: "카드 내역 확인",
    actionPath: "/expense-input",
    read: false, hidden: false,
  },
  // 중요 - 예측
  {
    id: 4, priority: "critical", type: "예측",
    title: "세무 자료 정리까지 12일 남았습니다",
    desc: "홈택스 자료가 아직 연동되지 않았습니다. 기한 내 정리가 필요합니다.",
    reason: [
      "부가세 신고 마감일은 2월 25일입니다.",
      "현재 홈택스 연동이 안 된 상태입니다.",
      "지금 연동하면 자동으로 자료를 정리할 수 있습니다.",
    ],
    impact: "기한 초과 시 가산세 위험",
    impactType: "loss",
    time: "오늘 오전",
    section: "predict",
    actionLabel: "홈택스 연동",
    actionPath: "/expense-input",
    read: false, hidden: false,
  },
  // 주의 - 경고
  {
    id: 5, priority: "warning", type: "경고",
    title: "가스 비용이 전월보다 12% 증가했습니다",
    desc: "이번 달 가스비 420,000원으로, 지난달(375,000원)보다 높습니다.",
    reason: [
      "최근 2주 평균보다 비용이 늘었습니다.",
      "해당 항목이 이번 달 비용에서 차지하는 비율이 커지고 있습니다.",
      "지금 점검하면 추가 비용 증가를 막을 수 있습니다.",
    ],
    impact: "추가 비용: 월 약 45,000원",
    impactType: "loss",
    time: "3시간 전",
    section: "warn",
    actionLabel: "지출 내역 확인",
    actionPath: "/revenue",
    read: false, hidden: false,
  },
  {
    id: 6, priority: "warning", type: "경고",
    title: "다음 2주 예약이 22% 감소했습니다",
    desc: "지난 2주 대비 예약 건수가 줄어드는 추세입니다.",
    reason: [
      "지난 2주: 28건 → 다음 2주: 22건으로 감소.",
      "특히 평일 체험 예약이 크게 줄었습니다.",
      "할인 패키지나 평일 이벤트로 보완할 수 있습니다.",
    ],
    impact: "예상 매출 감소: 약 600,000원",
    impactType: "loss",
    time: "오전 10시",
    section: "warn",
    actionLabel: "예약 현황 보기",
    actionPath: "/operations",
    read: false, hidden: false,
  },
  // 주의 - 추천
  {
    id: 7, priority: "warning", type: "추천",
    title: "2월 17일(화) 예약이 2건뿐입니다",
    desc: "감귤 체험 + 식사 패키지를 10% 할인하면 평일 매출을 높일 수 있습니다.",
    reason: [
      "평일 평균 예약은 5건인데, 이 날은 2건입니다.",
      "비슷한 날짜에 패키지 할인을 했을 때 예약이 2배 늘었습니다.",
      "패키지 판매가는 49,500원(10% 할인)이 적당합니다.",
    ],
    impact: "예상 추가 수익: 약 200,000원",
    impactType: "gain",
    time: "오전 9시",
    section: "recommend",
    actionLabel: "패키지 만들기",
    actionPath: "/products",
    read: false, hidden: false,
  },
  {
    id: 8, priority: "warning", type: "할 일",
    title: "영수증 확인 대기 12건",
    desc: "자동 분석 후 '확인 필요' 상태의 영수증이 쌓여 있습니다.",
    reason: [
      "최근 3일간 올린 영수증 중 12건이 미확인입니다.",
      "확인하면 이번 달 비용이 더 정확해집니다.",
      "'확인하기' 버튼을 누르면 한 건씩 빠르게 처리할 수 있습니다.",
    ],
    time: "4시간 전",
    section: "recent",
    actionLabel: "영수증 확인",
    actionPath: "/expense-input",
    read: false, hidden: false,
  },
  // 주의 - 예측
  {
    id: 9, priority: "warning", type: "예측",
    title: "체험 키트가 7일 이내 소진 예상",
    desc: "현재 12세트 남아 있고, 주간 사용량 기준 7일 내 소진됩니다.",
    reason: [
      "주간 평균 사용량은 1.7세트입니다.",
      "다음 주 감귤잼 체험 예약이 8건 있습니다.",
      "지금 주문하면 소진 전에 도착합니다.",
    ],
    impact: "예상 손해: 약 240,000원 (체험 취소 시)",
    impactType: "loss",
    time: "5시간 전",
    section: "predict",
    actionLabel: "재료 주문",
    actionPath: "/products",
    read: false, hidden: false,
  },
  // 정보
  {
    id: 10, priority: "info", type: "추천",
    title: "단골 고객 3명이 새로 등록되었습니다",
    desc: "최근 3회 이상 예약한 고객이 단골로 전환되었습니다.",
    reason: [
      "김○○, 이○○, 박○○ 고객이 단골 조건을 충족했습니다.",
      "단골 고객에게 감사 메시지를 보내면 재방문율이 올라갑니다.",
      "고객 관리 메뉴에서 확인할 수 있습니다.",
    ],
    time: "오전 8시",
    section: "recommend",
    actionLabel: "고객 관리",
    actionPath: "/customers",
    read: false, hidden: false,
  },
  {
    id: 11, priority: "info", type: "예측",
    title: "다음 달 예상 매출이 갱신되었습니다",
    desc: "3월 예상 매출: 13,500,000원 (이번 달 대비 +12%)",
    reason: [
      "과거 3개월 데이터와 현재 예약 추세를 바탕으로 계산했습니다.",
      "3월은 계절적으로 예약이 늘어나는 시기입니다.",
      "예상 순수익은 5,800,000원입니다.",
    ],
    time: "어제",
    section: "predict",
    actionLabel: "보고서 보기",
    actionPath: "/reports",
    read: true, hidden: false,
  },
  {
    id: 12, priority: "info", type: "할 일",
    title: "월간 보고서가 생성되었습니다",
    desc: "1월 경영 보고서가 자동으로 만들어졌습니다. 확인해 주세요.",
    reason: [
      "매월 초에 전월 보고서가 자동 생성됩니다.",
      "매출, 비용, 순수익, 고객 현황이 포함되어 있습니다.",
      "PDF로 내려받을 수 있습니다.",
    ],
    time: "2일 전",
    section: "recent",
    actionLabel: "보고서 열기",
    actionPath: "/reports",
    read: true, hidden: false,
  },
  {
    id: 13, priority: "info", type: "할 일",
    title: "자동화 규칙이 정상 작동 중입니다",
    desc: "설정한 3개의 자동화 규칙이 모두 정상적으로 실행되고 있습니다.",
    reason: [
      "'예약 확인 문자 발송'이 오늘 5건 실행되었습니다.",
      "'재고 부족 알림'이 정상 모니터링 중입니다.",
      "'일일 매출 정리'가 어제 자동 실행되었습니다.",
    ],
    time: "3일 전",
    section: "recent",
    actionLabel: "자동화 관리",
    actionPath: "/automation",
    read: true, hidden: false,
  },
];

/* ═══ 색상/라벨 매핑 ═══ */
const PRIORITY_CONFIG = {
  critical: { line: "#C62828", badge: "중요", badgeBg: "#FDECEC", badgeText: "#C62828" },
  warning: { line: "#8A6A2B", badge: "주의", badgeBg: "#FFF6E6", badgeText: "#8A6A2B" },
  info: { line: "#9CA3AF", badge: "정보", badgeBg: "#F7F3ED", badgeText: "#6B7280" },
};

const TYPE_CONFIG: Record<AlertType, { badgeBg: string; badgeText: string }> = {
  "경고": { badgeBg: "#FDECEC", badgeText: "#C62828" },
  "추천": { badgeBg: "#ECF7EE", badgeText: "#1B5E20" },
  "예측": { badgeBg: "#F7F3ED", badgeText: "#2F4F46" },
  "할 일": { badgeBg: "#FFF6E6", badgeText: "#8A6A2B" },
};

/* ═══ 컴포넌트 ═══ */
export function SmartCenter() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filterPriority, setFilterPriority] = useState<"all" | Priority>("all");
  const [filterType, setFilterType] = useState<string>("전체");
  const [sortMode, setSortMode] = useState<"priority" | "latest">("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [showAllTop, setShowAllTop] = useState(false);
  const [showAllRecommend, setShowAllRecommend] = useState(false);
  const [showAllWarn, setShowAllWarn] = useState(false);
  const [showAllPredict, setShowAllPredict] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const [settings, setSettings] = useState<PrioritySettings>({
    stockDays: 3, marginDrop: 10, costIncrease: 10, dailyLimit: 10,
  });
  const [draftSettings, setDraftSettings] = useState<PrioritySettings>(settings);

  /* 필터링 */
  const visibleAlerts = useMemo(() => {
    return alerts
      .filter(a => !a.hidden)
      .filter(a => filterPriority === "all" || a.priority === filterPriority)
      .filter(a => filterType === "전체" || a.type === filterType)
      .filter(a => !searchQuery || a.title.includes(searchQuery) || a.desc.includes(searchQuery))
      .sort((a, b) => {
        if (sortMode === "priority") {
          const order = { critical: 0, warning: 1, info: 2 };
          return order[a.priority] - order[b.priority];
        }
        return b.id - a.id;
      });
  }, [alerts, filterPriority, filterType, searchQuery, sortMode]);

  /* 오늘의 핵심 3가지 */
  const topAlerts = useMemo(() => {
    const sorted = [...visibleAlerts.filter(a => !a.read)].sort((a, b) => {
      const score = (al: Alert) => {
        if (al.priority === "critical" && al.type === "경고") return 0;
        if (al.priority === "critical" && al.type === "예측") return 1;
        if (al.priority === "warning" && al.type === "경고") return 2;
        if (al.priority === "critical") return 3;
        if (al.priority === "warning") return 4;
        return 5;
      };
      return score(a) - score(b);
    });
    return sorted;
  }, [visibleAlerts]);

  const top3 = showAllTop ? topAlerts : topAlerts.slice(0, 3);

  /* 섹션별 */
  const sectionAlerts = (section: string) => visibleAlerts.filter(a => a.section === section);
  const recommendAlerts = sectionAlerts("recommend");
  const warnAlerts = sectionAlerts("warn");
  const predictAlerts = sectionAlerts("predict");
  const recentAlerts = sectionAlerts("recent");

  /* 액션 */
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const markRead = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setMenuOpenId(null);
  };

  const hideAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, hidden: true } : a));
    setMenuOpenId(null);
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

  const unreadCount = alerts.filter(a => !a.read && !a.hidden).length;

  /* ═══ 알림 카드 ═══ */
  const AlertCard = ({ alert }: { alert: Alert }) => {
    const pc = PRIORITY_CONFIG[alert.priority];
    const tc = TYPE_CONFIG[alert.type];
    const isExpanded = expandedIds.has(alert.id);

    return (
      <div className={`bg-white rounded-xl border border-[#E6E2DB] overflow-hidden transition-all ${
        alert.read ? "opacity-75" : ""
      }`} style={{ borderLeft: `4px solid ${pc.line}` }}>
        <div className="px-5 py-4">
          {/* 상단: 배지 + 시간 */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: pc.badgeBg, color: pc.badgeText, fontWeight: 700 }}>
                {pc.badge}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: tc.badgeBg, color: tc.badgeText }}>
                {alert.type}
              </span>
              {!alert.read && <span className="w-2 h-2 rounded-full bg-[#C62828]" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#9CA3AF]">{alert.time}</span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpenId(menuOpenId === alert.id ? null : alert.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
                >
                  <MoreHorizontal size={15} />
                </button>
                {menuOpenId === alert.id && (
                  <div className="absolute right-0 top-8 w-[180px] bg-white border border-[#E6E2DB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1.5 z-10">
                    <button onClick={() => hideAlert(alert.id)} className="w-full text-left px-4 py-2 text-[13px] text-[#1F2937] hover:bg-[#F7F3ED] cursor-pointer flex items-center gap-2">
                      <EyeOff size={13} /> 오늘은 숨기기
                    </button>
                    <button onClick={() => { hideAlert(alert.id); }} className="w-full text-left px-4 py-2 text-[13px] text-[#1F2937] hover:bg-[#F7F3ED] cursor-pointer flex items-center gap-2">
                      <Clock size={13} /> 일주일 후 다시 보기
                    </button>
                    <button onClick={() => markRead(alert.id)} className="w-full text-left px-4 py-2 text-[13px] text-[#1F2937] hover:bg-[#F7F3ED] cursor-pointer flex items-center gap-2">
                      <Check size={13} /> 읽음 처리
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 제목 + 설명 */}
          <h3 className="text-[16px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>{alert.title}</h3>
          <p className="text-[14px] text-[#6B7280] leading-[1.5]">{alert.desc}</p>

          {/* 예상 영향 */}
          {alert.impact && (
            <p className={`text-[13px] mt-2 ${
              alert.impactType === "loss" ? "text-[#C62828]" : "text-[#1B5E20]"
            }`} style={{ fontWeight: 700 }}>
              {alert.impact}
            </p>
          )}

          {/* 근거 펼치기 */}
          {isExpanded && (
            <div className="mt-3 bg-[#FBFAF7] rounded-lg p-4">
              <p className="text-[13px] text-[#6B7280] mb-2" style={{ fontWeight: 700 }}>왜 이런가요?</p>
              <div className="space-y-1.5">
                {alert.reason.map((r, i) => (
                  <p key={i} className="text-[13px] text-[#6B7280] leading-[1.5] flex gap-2">
                    <span className="text-[#9CA3AF] shrink-0">·</span>
                    <span>{r}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => toggleExpand(alert.id)}
              className="text-[13px] text-[#2F4F46] cursor-pointer hover:underline flex items-center gap-1"
            >
              {isExpanded ? "접기" : "왜 이런가요?"}
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <div className="flex gap-2">
              {alert.actionPath && (
                <button
                  onClick={() => navigate(alert.actionPath!)}
                  className="h-[36px] px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {alert.actionLabel} <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ 섹션 렌더러 ═══ */
  const Section = ({
    title,
    icon: Icon,
    iconColor,
    items,
    showAll,
    setShowAll,
    defaultCount = 3,
  }: {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    items: Alert[];
    showAll: boolean;
    setShowAll: (v: boolean) => void;
    defaultCount?: number;
  }) => {
    if (items.length === 0) return null;
    const visible = showAll ? items : items.slice(0, defaultCount);

    return (
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Icon size={18} className={iconColor} />
          <h2 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>{title}</h2>
          <span className="text-[13px] text-[#9CA3AF]">{items.length}건</span>
        </div>
        <div className="space-y-3">
          {visible.map(a => <AlertCard key={a.id} alert={a} />)}
        </div>
        {items.length > defaultCount && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 text-[13px] text-[#2F4F46] flex items-center gap-1 cursor-pointer hover:underline"
          >
            {showAll ? "접기" : `${items.length - defaultCount}건 더 보기`}
            {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>
    );
  };

  /* ═══ 우선순위 설정 패널 ═══ */
  const renderSettingsPanel = () => {
    if (!showSettings) return null;

    const Stepper = ({
      label,
      hint,
      value,
      min,
      max,
      step,
      suffix,
      onChange,
    }: {
      label: string;
      hint: string;
      value: number;
      min: number;
      max: number;
      step: number;
      suffix: string;
      onChange: (v: number) => void;
    }) => (
      <div className="py-4 border-b border-[#F3EFE8] last:border-0">
        <p className="text-[14px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>{label}</p>
        <p className="text-[13px] text-[#6B7280] mb-3 leading-[1.5]">{hint}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange(Math.max(min, value - step))}
            className="w-9 h-9 rounded-lg border border-[#D6D0C8] flex items-center justify-center text-[16px] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
          >
            −
          </button>
          <div className="w-[80px] h-[40px] rounded-lg border border-[#D6D0C8] flex items-center justify-center text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>
            {value}{suffix}
          </div>
          <button
            onClick={() => onChange(Math.min(max, value + step))}
            className="w-9 h-9 rounded-lg border border-[#D6D0C8] flex items-center justify-center text-[16px] text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
          >
            +
          </button>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(60, 55, 45, 0.3)" }} onClick={() => setShowSettings(false)}>
        <div className="bg-white w-[420px] h-full shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E6E2DB] shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>우선순위 기준</h2>
              <button onClick={() => setShowSettings(false)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-[14px] text-[#6B7280] mt-2 leading-[1.5]">
              알림이 너무 많거나 너무 적으면, 여기서 기준을 바꿀 수 있어요.
            </p>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Stepper
              label="중요 알림: 재고 부족 기준"
              hint="재고 부족을 '몇 일 전'부터 중요로 볼까요?"
              value={draftSettings.stockDays}
              min={1} max={7} step={1} suffix="일"
              onChange={v => setDraftSettings(p => ({ ...p, stockDays: v }))}
            />
            <Stepper
              label="중요 알림: 남는 비율 기준"
              hint="남는 비율이 목표보다 '얼마나 낮으면' 중요로 볼까요?"
              value={draftSettings.marginDrop}
              min={5} max={20} step={5} suffix="%"
              onChange={v => setDraftSettings(p => ({ ...p, marginDrop: v }))}
            />
            <Stepper
              label="주의 알림: 비용 증가 기준"
              hint="비용이 전월보다 '얼마나 늘면' 주의로 볼까요?"
              value={draftSettings.costIncrease}
              min={5} max={30} step={5} suffix="%"
              onChange={v => setDraftSettings(p => ({ ...p, costIncrease: v }))}
            />
            <Stepper
              label="알림 개수 제한"
              hint="하루에 보여줄 알림 개수를 설정합니다. 중요 알림은 항상 먼저 보여드립니다."
              value={draftSettings.dailyLimit}
              min={5} max={15} step={5} suffix="개"
              onChange={v => setDraftSettings(p => ({ ...p, dailyLimit: v }))}
            />
          </div>

          {/* 풋터 */}
          <div className="px-6 py-4 border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
            <button
              onClick={() => setDraftSettings({ stockDays: 3, marginDrop: 10, costIncrease: 10, dailyLimit: 10 })}
              className="h-[44px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              기본값으로
            </button>
            <button
              onClick={saveSettings}
              className="h-[44px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══ 메인 렌더 ═══ */
  return (
    <div className="max-w-[1160px] space-y-6">
      {/* 상단 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] text-[#1F2937]" style={{ fontWeight: 700 }}>스마트 경영 센터</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">오늘 필요한 알림과 추천을 모아 보여드립니다.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => { setDraftSettings(settings); setShowSettings(true); }}
            className="h-[40px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <Settings2 size={15} /> 우선순위 기준
          </button>
          <button
            onClick={markAllRead}
            className="h-[40px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <CheckCheck size={15} /> 모두 읽음 처리
          </button>
        </div>
      </div>

      {/* 현재 기준 표시 */}
      <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
        <BadgeInfo size={13} />
        <span>현재 기준: 재고 {settings.stockDays}일 / 남는 비율 {settings.marginDrop}% / 비용 증가 {settings.costIncrease}% / 하루 최대 {settings.dailyLimit}건</span>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-xl border border-[#E6E2DB] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 우선순위 탭 */}
          <div className="flex gap-1.5">
            {[
              { key: "all" as const, label: "전체", count: alerts.filter(a => !a.hidden).length },
              { key: "critical" as const, label: "중요", count: alerts.filter(a => a.priority === "critical" && !a.hidden).length },
              { key: "warning" as const, label: "주의", count: alerts.filter(a => a.priority === "warning" && !a.hidden).length },
              { key: "info" as const, label: "정보", count: alerts.filter(a => a.priority === "info" && !a.hidden).length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterPriority(tab.key)}
                className={`h-[34px] px-3.5 rounded-lg text-[13px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterPriority === tab.key
                    ? "bg-[#2F4F46] text-white"
                    : "bg-[#FBFAF7] text-[#6B7280] hover:bg-[#F7F3ED]"
                }`}
              >
                {tab.label}
                <span className={`text-[11px] ${filterPriority === tab.key ? "text-white/70" : "text-[#9CA3AF]"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* 구분선 */}
          <div className="w-[1px] h-[20px] bg-[#E6E2DB]" />

          {/* 유형 필터 */}
          <div className="flex gap-1.5">
            {["전체", "추천", "경고", "예측", "할 일"].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`h-[30px] px-2.5 rounded-lg text-[12px] transition-all cursor-pointer ${
                  filterType === t
                    ? "bg-[#F7F3ED] text-[#2F4F46] border border-[#2F4F46]"
                    : "text-[#9CA3AF] hover:text-[#6B7280]"
                }`}
                style={{ fontWeight: filterType === t ? 700 : 400 }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 구분선 */}
          <div className="w-[1px] h-[20px] bg-[#E6E2DB]" />

          {/* 정렬 */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setSortMode("priority")}
              className={`h-[30px] px-2.5 rounded-lg text-[12px] cursor-pointer transition-all ${
                sortMode === "priority" ? "text-[#2F4F46]" : "text-[#9CA3AF]"
              }`}
              style={{ fontWeight: sortMode === "priority" ? 700 : 400 }}
            >
              우선순위순
            </button>
            <button
              onClick={() => setSortMode("latest")}
              className={`h-[30px] px-2.5 rounded-lg text-[12px] cursor-pointer transition-all ${
                sortMode === "latest" ? "text-[#2F4F46]" : "text-[#9CA3AF]"
              }`}
              style={{ fontWeight: sortMode === "latest" ? 700 : 400 }}
            >
              최신순
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="알림 검색"
            className="h-[34px] w-[160px] pl-8 pr-3 rounded-lg border border-[#D6D0C8] bg-white text-[12px] focus:border-[#2F4F46] focus:outline-none"
          />
        </div>
      </div>

      {/* 읽지 않은 알림 수 */}
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Bell size={14} className="text-[#2F4F46]" />
          <span className="text-[13px] text-[#2F4F46]" style={{ fontWeight: 700 }}>
            읽지 않은 알림 {unreadCount}건
          </span>
        </div>
      )}

      {/* ═══ 오늘의 핵심 3가지 ═══ */}
      {topAlerts.length > 0 && (
        <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Zap size={18} className="text-[#C62828]" />
            <h2 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>오늘의 핵심 {Math.min(3, topAlerts.length)}가지</h2>
            <span className="text-[12px] text-[#9CA3AF]">가장 먼저 확인이 필요합니다</span>
          </div>
          <div className="space-y-3">
            {top3.map(a => <AlertCard key={`top-${a.id}`} alert={a} />)}
          </div>
          {topAlerts.length > 3 && (
            <button
              onClick={() => setShowAllTop(!showAllTop)}
              className="mt-3 text-[13px] text-[#2F4F46] flex items-center gap-1 cursor-pointer hover:underline"
            >
              {showAllTop ? "접기" : `${topAlerts.length - 3}건 더 보기`}
              {showAllTop ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      )}

      {/* ═══ 추천 (매출 늘리기) ═══ */}
      <Section
        title="추천 (매출 늘리기)"
        icon={Lightbulb}
        iconColor="text-[#1B5E20]"
        items={recommendAlerts}
        showAll={showAllRecommend}
        setShowAll={setShowAllRecommend}
      />

      {/* ═══ 경고 (손해 막기) ═══ */}
      <Section
        title="경고 (손해 막기)"
        icon={ShieldAlert}
        iconColor="text-[#C62828]"
        items={warnAlerts}
        showAll={showAllWarn}
        setShowAll={setShowAllWarn}
      />

      {/* ═══ 예측 (미리 준비하기) ═══ */}
      <Section
        title="예측 (미리 준비하기)"
        icon={TrendingUp}
        iconColor="text-[#2F4F46]"
        items={predictAlerts}
        showAll={showAllPredict}
        setShowAll={setShowAllPredict}
      />

      {/* ═══ 최근 알림 (접힘/펼치기) ═══ */}
      {recentAlerts.length > 0 && (
        <div className="border-t border-[#E6E2DB] pt-5">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center gap-2.5 cursor-pointer group mb-4"
          >
            <Bell size={16} className="text-[#9CA3AF]" />
            <h2 className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>최근 알림</h2>
            <span className="text-[13px] text-[#9CA3AF]">{recentAlerts.length}건</span>
            {showRecent ? <ChevronUp size={14} className="text-[#9CA3AF]" /> : <ChevronDown size={14} className="text-[#9CA3AF]" />}
          </button>
          {showRecent && (
            <div className="space-y-3">
              {recentAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
            </div>
          )}
        </div>
      )}

      {/* 알림 없음 */}
      {visibleAlerts.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E6E2DB] p-12 text-center">
          <Bell size={36} className="text-[#D6D0C8] mx-auto mb-3" />
          <p className="text-[16px] text-[#6B7280]" style={{ fontWeight: 700 }}>알림이 없습니다</p>
          <p className="text-[14px] text-[#9CA3AF] mt-1">새로운 알림이 생기면 여기에 표시됩니다.</p>
        </div>
      )}

      {/* 설정 패널 */}
      {renderSettingsPanel()}
    </div>
  );
}