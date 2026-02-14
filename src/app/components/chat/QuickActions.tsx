import { Receipt, PenLine, CreditCard, Building2, FileBarChart } from "lucide-react";

/* ═══ 빠른 실행 버튼 (입력창 위) ═══ */
const quickActions = [
  { icon: Receipt, label: "영수증 올리기", key: "receipt" },
  { icon: PenLine, label: "지출 입력", key: "expense" },
  { icon: CreditCard, label: "카드 내역 불러오기", key: "card" },
  { icon: Building2, label: "홈택스 불러오기", key: "tax" },
  { icon: FileBarChart, label: "월간 보고서", key: "report" },
];

interface QuickActionsProps {
  onAction: (key: string) => void;
  compact?: boolean;
}

export function QuickActionButtons({ onAction, compact = false }: QuickActionsProps) {
  return (
    <div className={`flex gap-2 ${compact ? "flex-wrap" : "overflow-x-auto"} pb-1`}>
      {quickActions.map((a) => (
        <button
          key={a.key}
          onClick={() => onAction(a.key)}
          className={`flex items-center gap-2 rounded-xl border border-[#D6D0C8] bg-white text-[#6B7280] hover:bg-[#F7F3ED] hover:border-[#2F4F46] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            compact ? "h-[40px] px-3 text-[12px]" : "h-[44px] px-4 text-[13px]"
          }`}
        >
          <a.icon size={compact ? 14 : 16} className="text-[#9CA3AF]" />
          {a.label}
        </button>
      ))}
    </div>
  );
}

/* ═══ 추천 질문 칩 ═══ */
const suggestionChips = [
  "이번 달 남은 돈은?",
  "남는 비율 낮은 상품",
  "비용이 늘어난 이유",
  "재고 위험 알려줘",
  "정산 예정 금액",
];

interface SuggestionChipsProps {
  onChipClick: (question: string) => void;
  exclude?: string[];
  compact?: boolean;
  limit?: number;
}

export function SuggestionChips({ onChipClick, exclude = [], compact = false, limit }: SuggestionChipsProps) {
  const chips = suggestionChips.filter((c) => !exclude.includes(c));
  const visible = limit ? chips.slice(0, limit) : chips;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((q) => (
        <button
          key={q}
          onClick={() => onChipClick(q)}
          className={`rounded-full border border-[#E6E2DB] bg-[#FBFAF7] text-[#6B7280] hover:bg-[#F7F3ED] hover:border-[#D6D0C8] transition-all cursor-pointer ${
            compact ? "px-3 py-1.5 text-[12px]" : "px-4 py-2 text-[13px]"
          }`}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
