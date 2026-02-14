import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Send, Plus, Bot, Sparkles, Clock,
  Trash2, MoreHorizontal, X, Paperclip, Mic,
  Package, Wallet, CalendarDays, Users as UsersIcon,
  PanelLeftClose, PanelLeft, LayoutGrid,
  Receipt as ReceiptIcon, FileText, CreditCard
} from "lucide-react";
import { ChatBubble, TypingIndicator, DateSeparator } from "../chat/ChatBubble";
import { SuggestionChips, QuickActionButtons } from "../chat/QuickActions";
import {
  receiptScenario, analysisScenario, cardImportScenario,
  pastThreads, AI_RESPONSES
} from "../chat/scenarios";
import type { ChatMessage, ChatThread } from "../chat/types";

/* ═══ 빠른 질문 카드 ═══ */
const QUICK_CARDS = [
  { icon: Wallet, color: "text-[#8A6A2B]", bg: "bg-[#FFF6E6]", question: "이번 달 남은 돈은?", label: "남은 돈 확인" },
  { icon: Package, color: "text-[#1B5E20]", bg: "bg-[#ECF7EE]", question: "남는 비율 낮은 상품", label: "수익 분석" },
  { icon: CalendarDays, color: "text-[#2F4F46]", bg: "bg-[#F7F3ED]", question: "정산 예정 금액", label: "정산 확인" },
  { icon: UsersIcon, color: "text-[#C62828]", bg: "bg-[#FDECEC]", question: "재고 위험 알려줘", label: "재고 점검" },
];

/* ═══ 나리오  ══ */
const SCENARIO_TABS = [
  { id: "receipt" as const, label: "영수증 입력", icon: ReceiptIcon, thread: receiptScenario },
  { id: "analysis" as const, label: "분석·실행", icon: FileText, thread: analysisScenario },
  { id: "card" as const, label: "카드·홈택스", icon: CreditCard, thread: cardImportScenario },
];

/* ═══ 유틸 ═══ */
const formatDate = (d: Date) => {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/* ═══ 메인 컴포넌트 ═══ */
export function AIAssistant() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([
    receiptScenario, analysisScenario, cardImportScenario, ...pastThreads,
  ]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [menuThreadId, setMenuThreadId] = useState<string | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages.length, isTyping, scrollToBottom]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    if (showPlusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlusMenu]);

  const handleSend = (question?: string) => {
    const q = (question || input).trim();
    if (!q || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: q,
      timestamp: new Date(),
    };

    if (activeThread) {
      const updated = {
        ...activeThread,
        messages: [...activeThread.messages, userMsg],
        updatedAt: new Date(),
      };
      setActiveThread(updated);
      setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const newThread: ChatThread = {
        id: `t-${Date.now()}`,
        title: q.length > 20 ? q.slice(0, 20) + "..." : q,
        messages: [userMsg],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setActiveThread(newThread);
      setThreads((prev) => [newThread, ...prev]);
    }

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const matched = AI_RESPONSES[q];
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: "assistant",
        content: matched?.content ?? `"${q}"에 대해 분석했습니다.\n\n현재 데이터를 기반으로 보면, 더 정확한 분석을 위해 최근 3개월 데이터를 참고했습니다.`,
        timestamp: new Date(),
        analysis: matched?.analysis,
      };

      setActiveThread((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          title:
            prev.messages.length <= 1
              ? q.length > 20
                ? q.slice(0, 20) + "..."
                : q
              : prev.title,
          messages: [...prev.messages, aiMsg],
          updatedAt: new Date(),
        };
        setThreads((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
        return updated;
      });
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const newChat = () => {
    setActiveThread(null);
    setInput("");
    setIsTyping(false);
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThread?.id === id) setActiveThread(null);
    setMenuThreadId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (key: string) => {
    const map: Record<string, string> = {
      receipt: "영수증을 올려서 지출에 넣어줘.",
      expense: "지출을 새로 입력하고 싶어.",
      card: "이번 달 카드 쓴 내역 불러와줘.",
      tax: "홈택스에서 내역 불러와줘.",
      report: "월간 보고서 만들어줘.",
    };
    handleSend(map[key] || "");
  };

  /* ═══ 빈 상태(새 채팅 화면) ═══ */
  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="max-w-[680px] w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2F4F46] flex items-center justify-center mx-auto mb-5">
          <Bot size={32} className="text-white" />
        </div>
        <h2 className="text-[22px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>
          무엇을 도와드릴까요?
        </h2>
        <p className="text-[14px] text-[#9CA3AF] mb-8">
          질문하면 분석하고, 바로 처리까지 도와드려요.
        </p>

        {/* 빠른 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {QUICK_CARDS.map((card) => (
            <button
              key={card.question}
              onClick={() => handleSend(card.question)}
              className="bg-white rounded-xl border border-[#E6E2DB] p-5 text-left hover:border-[#2F4F46] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon size={20} className={card.color} />
              </div>
              <p className="text-[15px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>
                {card.label}
              </p>
              <p className="text-[13px] text-[#9CA3AF] leading-[1.4]">{card.question}</p>
            </button>
          ))}
        </div>

        {/* 시나리오 예시 */}
        <div className="flex justify-center gap-2 mb-6">
          {SCENARIO_TABS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveThread(s.thread);
              }}
              className="h-[40px] px-4 rounded-xl border border-[#E6E2DB] bg-white text-[13px] text-[#6B7280] flex items-center gap-2 hover:bg-[#F7F3ED] hover:border-[#D6D0C8] transition-all cursor-pointer"
            >
              <s.icon size={14} /> {s.label} 예시 보기
            </button>
          ))}
        </div>

        {/* 추천 질문 칩 */}
        {/* removed */}
      </div>
    </div>
  );

  /* ═══ 대화 내역 사이드바 ═══ */
  const renderHistorySidebar = () => (
    <div
      className={`bg-white border-r border-[#E6E2DB] flex flex-col shrink-0 transition-all overflow-hidden ${
        showHistory ? "w-[260px]" : "w-0"
      }`}
    >
      <div className="p-3 border-b border-[#E6E2DB] shrink-0">
        <button
          onClick={newChat}
          className="w-full h-[44px] rounded-xl border border-[#D6D0C8] text-[14px] text-[#1F2937] flex items-center justify-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
        >
          <Plus size={16} /> 새 채팅
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {threads.length > 0 ? (
          <>
            {/* 오늘 */}
            {threads.filter((t) => formatDate(t.updatedAt) === "오늘").length > 0 && (
              <div className="px-3 pt-3 pb-1">
                <p className="text-[11px] text-[#9CA3AF] px-2" style={{ fontWeight: 700 }}>
                  오늘
                </p>
              </div>
            )}
            {threads
              .filter((t) => formatDate(t.updatedAt) === "오늘")
              .map((t) => renderThreadItem(t))}

            {/* 이전 */}
            {threads.filter((t) => formatDate(t.updatedAt) !== "오늘").length > 0 && (
              <div className="px-3 pt-4 pb-1">
                <p className="text-[11px] text-[#9CA3AF] px-2" style={{ fontWeight: 700 }}>
                  이전 대화
                </p>
              </div>
            )}
            {threads
              .filter((t) => formatDate(t.updatedAt) !== "오늘")
              .map((t) => renderThreadItem(t))}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-[13px] text-[#9CA3AF]">대화 내역이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderThreadItem = (t: ChatThread) => (
    <div key={t.id} className="px-2 mb-0.5 relative group">
      <button
        onClick={() => {
          setActiveThread(t);
          setInput("");
        }}
        className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all cursor-pointer flex items-center gap-2 ${
          activeThread?.id === t.id
            ? "bg-[#F7F3ED] text-[#1F2937]"
            : "text-[#6B7280] hover:bg-[#FBFAF7]"
        }`}
        style={{ fontWeight: activeThread?.id === t.id ? 700 : 400 }}
      >
        {t.scenario && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F4F46] shrink-0" />
        )}
        <span className="truncate flex-1">{t.title}</span>
        <span className="text-[10px] text-[#9CA3AF] shrink-0 group-hover:hidden">
          {formatDate(t.updatedAt)}
        </span>
      </button>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuThreadId(menuThreadId === t.id ? null : t.id);
          }}
          className="w-6 h-6 rounded flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
      {menuThreadId === t.id && (
        <div className="absolute right-2 top-full mt-1 bg-white border border-[#E6E2DB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 z-10 w-[140px]">
          <button
            onClick={() => deleteThread(t.id)}
            className="w-full text-left px-3 py-2 text-[12px] text-[#C62828] hover:bg-[#FDECEC] cursor-pointer flex items-center gap-2"
          >
            <Trash2 size={12} /> 대화 삭제
          </button>
        </div>
      )}
    </div>
  );

  /* ═══ 입력 바 ═══ */
  const PLUS_MENU_ITEMS = [
    { key: "receipt", icon: ReceiptIcon, label: "영수증 올리기", msg: "영수증을 올려서 지출에 넣어줘." },
    { key: "expense", icon: Wallet, label: "지출 입력", msg: "지출을 새로 입력하고 싶어." },
    { key: "card", icon: CreditCard, label: "카드 내역 불러오기", msg: "이번 달 카드 쓴 내역 불러와줘." },
    { key: "tax", icon: FileText, label: "홈택스 불러오기", msg: "홈택스에서 내역 불러와줘." },
    { key: "report", icon: CalendarDays, label: "월간 보고서", msg: "월간 보고서 만들어줘." },
  ];

  const renderInputBar = () => (
    <div className="bg-[#F3EFE8] px-6 py-3 shrink-0">
      <div className="max-w-[760px] mx-auto" ref={plusMenuRef}>
        <div className="relative bg-white rounded-full border border-[#D6D0C8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] focus-within:border-[#2F4F46] focus-within:shadow-[0_2px_16px_rgba(47,79,70,0.12)] transition-all flex items-end">
          {/* + 버튼 (입력창 안 왼쪽) */}
          <button
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className={`shrink-0 w-10 h-10 ml-1.5 mb-1 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showPlusMenu
                ? "bg-[#2F4F46] text-white rotate-45"
                : "bg-[#F3EFE8] text-[#6B7280] hover:bg-[#E6E2DB]"
            }`}
          >
            <Plus size={20} />
          </button>

          {/* 팝업 메뉴 */}
          {showPlusMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-[#E6E2DB] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-2 w-[220px] z-20">
              {PLUS_MENU_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setShowPlusMenu(false);
                    handleSend(item.msg);
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F3EFE8] flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-[#2F4F46]" />
                  </div>
                  <span className="text-[14px] text-[#1F2937]">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 텍스트 입력 */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="무엇이든 물어보세요"
            rows={1}
            className="flex-1 resize-none px-3 py-3 text-[15px] rounded-full focus:outline-none bg-transparent min-h-[48px] max-h-[160px]"
          />

          {/* 보내기 버튼 (입력창 안 오른쪽) */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`shrink-0 w-10 h-10 mr-1.5 mb-1 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              input.trim() && !isTyping
                ? "bg-[#2F4F46] text-white hover:bg-[#243f38]"
                : "bg-[#E6E2DB] text-[#9CA3AF]"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
          더미 데이터 기반으로 동작합니다. 실제 연동 시 더 정확한 답변을 받으실 수 있습니다.
        </p>
      </div>
    </div>
  );

  /* ═══ 메인 렌더 ═══ */
  return (
    <div className="h-full flex">
      {/* 대화 내역 사이드바 */}
      {renderHistorySidebar()}

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F3EFE8]">
        {/* 채팅 헤더 */}
        <div className="h-[52px] flex items-center justify-between px-5 border-b border-[#E6E2DB] bg-white/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center hover:bg-[#F7F3ED] cursor-pointer transition-colors"
              title={showHistory ? "화 목록 닫기" : "대화 목록 열기"}
            >
              {showHistory ? (
                <PanelLeftClose size={14} className="text-[#6B7280]" />
              ) : (
                <PanelLeft size={14} className="text-[#6B7280]" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#2F4F46]" />
              <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                {activeThread ? activeThread.title : "새 채팅"}
              </span>
              {activeThread?.scenario && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ECF7EE] text-[#1B5E20]">
                  예시
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20] animate-pulse" />
              연결됨
            </span>
            {activeThread && (
              <button
                onClick={newChat}
                className="h-[32px] px-3 rounded-lg border border-[#D6D0C8] text-[12px] text-[#6B7280] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
              >
                <Plus size={13} /> 새 채팅
              </button>
            )}
          </div>
        </div>

        {/* 메시지 영역 */}
        {!activeThread || activeThread.messages.length === 0 ? (
          renderWelcome()
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-[760px] mx-auto">
              <DateSeparator label="오늘" />
              {activeThread.messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* 입력 바 */}
        {renderInputBar()}
      </div>
    </div>
  );
}