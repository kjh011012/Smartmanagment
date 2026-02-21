import { useState, Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { QuickInputModal } from "../modals/QuickInputModal";
import { DockingPanel, FloatingAssistantButton } from "../chat/DockingPanel";
import { Toaster } from "sonner";

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "종합 현황", subtitle: "한눈에 보는 경영 요약" },
  "/operations": { title: "운영 관리", subtitle: "달력과 예약 관리" },
  "/revenue": { title: "매출·정산", subtitle: "매출, 지출, 남는 금액을 한 화면에" },
  "/products": { title: "상품·원가 관리", subtitle: "상품별 들어간 비용을 쉽게 설정" },
  "/expense-input": { title: "지출 자동 입력", subtitle: "영수증, 카드, 홈택스로 자동 입력" },
  "/customers": { title: "고객 관리", subtitle: "기억하기 쉬운 고객장부" },
  "/reports": { title: "분석 리포트", subtitle: "숫자 중심 경영 보고서" },
  "/smart-center": { title: "스마트 경영 센터", subtitle: "추천, 경고, 예측을 한곳에" },
  "/ai-assistant": { title: "인공지능 경영 비서", subtitle: "질문하면 분석하고, 바 ���리 도와드려요." },
  "/automation": { title: "자동화 설정", subtitle: "토글 하나로 자동화" },
  "/fixed-costs": { title: "고정비·시설관리·운영비", subtitle: "매월 발생하는 비용을 한눈에 관리" },
  "/specialties": { title: "특산품 관리", subtitle: "지역 특산물·가공식품·수공예품 등록과 원가 관리" },
  "/fees-taxes": { title: "수수료·세금 관리", subtitle: "카드사·플랫폼 수수료와 세금을 설정하고 정산에 활용" },
  "/refund-policy": { title: "환불 규정 관리", subtitle: "상품 유형별 환불 비율과 규정을 설정하고 관리" },
  "/subsidies": { title: "보조금 관리", subtitle: "정부지원 보조금·지원금을 체계적으로 관리하고 정산" },
  "/workforce": { title: "인력·노무 관리", subtitle: "직원·알바 급여, 보험, 퇴직금을 쉽게 관리" },
  "/settings": { title: "설정", subtitle: "사업장 정보와 요금제 관리" },
};

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [showDockingPanel, setShowDockingPanel] = useState(false);
  const [hideFloatingButton, setHideFloatingButton] = useState(false);
  const pageInfo = pageTitles[location.pathname] || { title: "이웃우리 Pro" };
  const isAIPage = location.pathname === "/ai-assistant";
  const isDashboard = location.pathname === "/";

  /* 종합 현황에서는 도킹 패널 기본 열림 */
  const [dashboardPanelDismissed, setDashboardPanelDismissed] = useState(false);
  const showDock = isAIPage
    ? false
    : isDashboard && !dashboardPanelDismissed
    ? true
    : showDockingPanel;

  const handleCloseDock = () => {
    if (isDashboard) setDashboardPanelDismissed(true);
    setShowDockingPanel(false);
  };

  const handleOpenDock = () => {
    if (isDashboard) setDashboardPanelDismissed(false);
    setShowDockingPanel(true);
  };

  const handleExpandDock = () => {
    handleCloseDock();
    navigate("/ai-assistant");
  };

  return (
    <div className="flex min-h-screen bg-[#F3EFE8]">
      <Sidebar collapsed={isAIPage} />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isAIPage ? "ml-[64px]" : "ml-[240px]"
        }`}
      >
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onQuickInput={() => setShowQuickInput(true)}
        />
        <div className="flex-1 flex overflow-hidden">
          <main className={`flex-1 min-w-0 ${isAIPage ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden p-8'}`}>
            <Suspense fallback={<div className="flex items-center justify-center p-12 text-[#9CA3AF]">불러오는 중...</div>}>
              <Outlet context={{ setHideFloatingButton }} />
            </Suspense>
          </main>
          {/* 도킹 패널 (AI 전체화면 아닐 때) */}
          {!isAIPage && showDock && (
            <DockingPanel
              isOpen={showDock}
              onClose={handleCloseDock}
              onExpand={handleExpandDock}
            />
          )}
        </div>
      </div>

      {/* 플로팅 버튼 (도킹 패널이 닫혀있고, AI 전체화면이 아닐 때) */}
      {!isAIPage && !showDock && !hideFloatingButton && (
        <FloatingAssistantButton onClick={handleOpenDock} />
      )}

      {showQuickInput && <QuickInputModal onClose={() => setShowQuickInput(false)} />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'Noto Serif KR', serif",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
}