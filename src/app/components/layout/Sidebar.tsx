import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, CalendarDays, Wallet, Package, Receipt,
  Users, BarChart3, Lightbulb, Bot, Zap, Settings, Building2
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

const menuItems = [
  { path: "/ai-assistant", label: "인공지능 경영 비서", icon: Bot },
  { path: "/", label: "종합 현황", icon: LayoutDashboard },
  { path: "/operations", label: "운영 관리", icon: CalendarDays },
  { path: "/revenue", label: "매출·정산", icon: Wallet },
  { path: "/products", label: "상품·원가 관리", icon: Package },
  { path: "/fixed-costs", label: "고정비·운영비", icon: Building2 },
  { path: "/expense-input", label: "지출 자동 입력", icon: Receipt },
  { path: "/customers", label: "고객 관리", icon: Users },
  { path: "/reports", label: "분석 리포트", icon: BarChart3 },
  { path: "/smart-center", label: "스마트 경영 센터", icon: Lightbulb },
  { path: "/automation", label: "자동화 설정", icon: Zap },
  { path: "/settings", label: "설정", icon: Settings },
];

export function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`h-screen bg-white border-r border-[#E6E2DB] flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 ${
        collapsed ? "w-[64px] min-w-[64px]" : "w-[240px] min-w-[240px]"
      }`}
    >
      {/* 로고 영역 */}
      <div className={`pt-7 pb-2 ${collapsed ? "px-3" : "px-6"}`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-lg bg-[#2F4F46] flex items-center justify-center mx-auto">
            <span className="text-white text-[14px]" style={{ fontWeight: 700 }}>우</span>
          </div>
        ) : (
          <>
            <div className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>이웃우리 Pro</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[14px] text-[#6B7280]">고라데이마을</span>
              <span className="text-[12px] bg-[#F7F3ED] text-[#6B7280] px-2 py-0.5 rounded-md">2026년 2월</span>
            </div>
          </>
        )}
      </div>
      <div className={`border-b border-[#E6E2DB] mt-4 ${collapsed ? "mx-2" : "mx-4"}`} />

      {/* 메뉴 */}
      <nav className={`flex-1 mt-4 overflow-y-auto overflow-x-hidden ${collapsed ? "px-1.5" : "px-2"}`}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-lg text-left relative transition-colors cursor-pointer ${
                  collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
                } ${
                  isActive
                    ? "text-[#2F4F46]"
                    : "text-[#6B7280] hover:bg-[#F7F3ED]"
                }`}
                style={{ fontWeight: isActive ? 700 : 400 }}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2F4F46] rounded-r" />
                )}
                <Icon size={20} className={`shrink-0 ${isActive ? "text-[#2F4F46]" : "text-[#9CA3AF]"}`} />
                {!collapsed && <span className="text-[15px]">{item.label}</span>}
              </button>
              {/* 접힌 상태에서 호버 시 툴팁 */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#1F2937] text-white text-[12px] rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}