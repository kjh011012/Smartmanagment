import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Plus, Bell, HelpCircle, X, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onQuickInput?: () => void;
}

const notifications = {
  important: [
    { id: 1, text: "남는 비율이 급격히 낮아졌습니다", time: "10분 전", type: "error" as const },
    { id: 2, text: "감귤 체험 재료 재고가 부족합니다", time: "1시간 전", type: "error" as const },
  ],
  warning: [
    { id: 3, text: "가스비가 지난달보다 늘고 있습니다", time: "오늘", type: "warning" as const },
    { id: 4, text: "원가 미입력 상품이 2건 있습니다", time: "오늘", type: "warning" as const },
  ],
  info: [
    { id: 5, text: "월간 보고서 생성이 완료되었습니다", time: "어제", type: "info" as const },
    { id: 6, text: "카드 사용 내역 연동에 성공했습니다", time: "2일 전", type: "info" as const },
  ],
};

export function Header({ title, subtitle, onQuickInput }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<"important" | "warning" | "info">("important");
  const [showHelp, setShowHelp] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { key: "important" as const, label: "중요", count: notifications.important.length },
    { key: "warning" as const, label: "주의", count: notifications.warning.length },
    { key: "info" as const, label: "정보", count: notifications.info.length },
  ];

  const currentNotifs = notifications[activeTab];

  return (
    <header className="h-[72px] bg-[#F3EFE8] flex items-center justify-between px-8 border-b border-[#E6E2DB]">
      <div>
        <h1 className="text-[24px] font-bold text-[#1F2937] leading-[1.3]">{title}</h1>
        {subtitle && <p className="text-[14px] text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="빠른 검색"
            className="h-[42px] w-[200px] pl-10 pr-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] focus:border-[#2F4F46] focus:outline-none transition-colors"
          />
        </div>
        <button className="h-[42px] px-4 rounded-xl border border-[#D6D0C8] bg-white text-[14px] text-[#6B7280] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer">
          이번 달 <ChevronDown size={14} />
        </button>
        <button
          onClick={onQuickInput}
          className="h-[42px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
        >
          <Plus size={16} /> 빠른 입력
        </button>
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-[42px] h-[42px] rounded-xl border border-[#D6D0C8] bg-white flex items-center justify-center hover:bg-[#F7F3ED] transition-colors relative cursor-pointer"
          >
            <Bell size={18} className="text-[#6B7280]" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C62828] text-white text-[10px] rounded-full flex items-center justify-center">
              {notifications.important.length}
            </span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-[52px] w-[380px] bg-white rounded-xl border border-[#E6E2DB] shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50">
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <span className="text-[16px] font-bold text-[#1F2937]">알림 센터</span>
                <button onClick={() => setShowNotifications(false)} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <div className="flex border-b border-[#E6E2DB]">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 text-[14px] text-center cursor-pointer transition-colors ${
                      activeTab === tab.key
                        ? "text-[#2F4F46] font-bold border-b-2 border-[#2F4F46]"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {currentNotifs.map(n => (
                  <div key={n.id} className="px-5 py-4 border-b border-[#F3EFE8] last:border-0 hover:bg-[#F7F3ED] transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      {n.type === "error" && <AlertTriangle size={16} className="text-[#C62828] mt-0.5 shrink-0" />}
                      {n.type === "warning" && <AlertTriangle size={16} className="text-[#8A6A2B] mt-0.5 shrink-0" />}
                      {n.type === "info" && <Info size={16} className="text-[#2F4F46] mt-0.5 shrink-0" />}
                      <div>
                        <p className="text-[14px] text-[#1F2937]">{n.text}</p>
                        <p className="text-[12px] text-[#9CA3AF] mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            className="w-[42px] h-[42px] rounded-xl border border-[#D6D0C8] bg-white flex items-center justify-center hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <HelpCircle size={18} className="text-[#6B7280]" />
          </button>
          {showHelp && (
            <div className="absolute right-0 top-[52px] w-[260px] bg-white rounded-xl border border-[#E6E2DB] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 z-50">
              <p className="text-[14px] text-[#1F2937] font-bold mb-2">쉬운 사용 안내</p>
              <p className="text-[13px] text-[#6B7280] leading-[1.6]">
                상단의 '빠른 입력' 버튼으로 매출이나 지출을 바로 기록할 수 있습니다.
                궁금한 점은 '인공지능 경영 비서'에 물어보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
