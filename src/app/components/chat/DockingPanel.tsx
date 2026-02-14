import type { ChatMessage } from "./types";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Bot, X, Maximize2, Send, Paperclip, Mic,
  AlertTriangle, CheckCircle, ArrowRight, Package, Wallet, CalendarDays
} from "lucide-react";
import { ChatBubble, TypingIndicator } from "./ChatBubble";
import { SuggestionChips, QuickActionButtons } from "./QuickActions";
import { AI_RESPONSES } from "./scenarios";

/* ═══ 도킹 패널 (우측 420px) ═══ */
interface DockingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
}

export function DockingPanel({ isOpen, onClose, onExpand }: DockingPanelProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = (question?: string) => {
    const q = (question || input).trim();
    if (!q || isTyping) return;

    const userMsg: ChatMessage = {
      id: `dock-${Date.now()}-u`,
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const matched = AI_RESPONSES[q];
      const aiMsg: ChatMessage = {
        id: `dock-${Date.now()}-a`,
        role: "assistant",
        content: matched?.content ?? `"${q}"에 대해 분석하겠습니다. 더 자세한 분석은 전체 화면에서 확인해 주세요.`,
        timestamp: new Date(),
        analysis: matched?.analysis,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 600);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-[420px] shrink-0 bg-white border-l border-[#E6E2DB] flex flex-col h-full">
      {/* 헤더 */}
      <div className="h-[56px] flex items-center justify-between px-5 border-b border-[#E6E2DB] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2F4F46] flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
            인공지능 경영 비서
          </span>
          <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-pulse" title="연결됨" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onExpand}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            title="전체 화면"
          >
            <Maximize2 size={14} className="text-[#6B7280]" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <X size={14} className="text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* 핀 메시지: 오늘의 핵심 3가지 */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] p-4">
          <p className="text-[13px] text-[#1F2937] mb-3" style={{ fontWeight: 700 }}>
            오늘의 핵심 3가지
          </p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#C62828] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#1F2937] leading-[1.5]">감귤 체험 재료 4일 후 부족 예상</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#8A6A2B] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#1F2937] leading-[1.5]">흑돼지 식사 남는 비율 40% (목표 45% 아래)</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-[#1B5E20] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#1F2937] leading-[1.5]">이번 달 정산일 03월 05일 (미정산 3,480,000원)</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate("/products")}
              className="h-[36px] px-3 rounded-lg border border-[#D6D0C8] text-[12px] text-[#6B7280] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              <Package size={12} /> 재고 확인
            </button>
            <button
              onClick={() => navigate("/products")}
              className="h-[36px] px-3 rounded-lg border border-[#D6D0C8] text-[12px] text-[#6B7280] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              <Wallet size={12} /> 상품 비용 점검
            </button>
            <button
              onClick={() => navigate("/revenue")}
              className="h-[36px] px-3 rounded-lg border border-[#D6D0C8] text-[12px] text-[#6B7280] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              <CalendarDays size={12} /> 정산 내역
            </button>
          </div>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[#2F4F46] flex items-center justify-center mb-3">
              <Bot size={24} className="text-white" />
            </div>
            <p className="text-[14px] text-[#1F2937] mb-1" style={{ fontWeight: 600 }}>
              궁금한 점을 물어보세요
            </p>
            <p className="text-[12px] text-[#9CA3AF] mb-4">
              경영 데이터를 분석해서 쉽게 알려드립니다
            </p>
            <SuggestionChips
              onChipClick={handleSend}
              compact
              limit={3}
            />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} compact />
            ))}
            {isTyping && <TypingIndicator compact />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 빠른 실행 + 추천 질문 */}
      {messages.length > 0 && !isTyping && (
        <div className="px-4 pb-2 shrink-0">
          <SuggestionChips
            onChipClick={handleSend}
            exclude={messages.map((m) => m.content)}
            compact
            limit={3}
          />
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t border-[#E6E2DB] px-4 py-3 shrink-0 space-y-2">
        <QuickActionButtons onAction={handleQuickAction} compact />
        <div className="relative bg-white rounded-2xl border border-[#D6D0C8] focus-within:border-[#2F4F46] transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="궁금한 점을 적어보세요 (예: 이번 달 남은 돈은?)"
            rows={1}
            className="w-full resize-none pl-4 pr-28 py-3.5 text-[13px] rounded-2xl focus:outline-none bg-transparent min-h-[48px] max-h-[120px]"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              <Paperclip size={16} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              <Mic size={16} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                input.trim() && !isTyping
                  ? "bg-[#2F4F46] text-white hover:bg-[#243f38]"
                  : "bg-[#E6E2DB] text-[#9CA3AF]"
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 플로팅 버튼 (비서 열기) ═══ */
interface FloatingButtonProps {
  onClick: () => void;
}

export function FloatingAssistantButton({ onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#2F4F46] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(47,79,70,0.3)] hover:bg-[#243f38] hover:shadow-[0_6px_24px_rgba(47,79,70,0.4)] transition-all cursor-pointer z-50"
      title="인공지능 경영 비서"
    >
      <Bot size={24} />
    </button>
  );
}