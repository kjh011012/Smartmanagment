import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bot, ChevronDown, ChevronUp, ArrowRight, AlertTriangle,
  CheckCircle, Lightbulb, FileImage, FileText,
  Check, Edit3, CreditCard, CircleDot
} from "lucide-react";
import type {
  ChatMessage, AnalysisData, ActionCardData, AttachmentData,
  ProgressData, WizardData, TableResultData, SummaryData,
  DuplicateData, ProductSnapshotData
} from "./types";

/* ═══ 유틸 ═══ */
const formatTime = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h < 12 ? "오전" : "오후";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period} ${hour}:${m}`;
};

/* ═══ 분석 카드 (4단 구성) ═══ */
function AnalysisCardView({ data }: { data: AnalysisData }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* (1) 요약 */}
      <p className="text-[15px] text-[#1F2937] leading-[1.6]" style={{ fontWeight: 700 }}>
        {data.title}
      </p>

      {/* (2) 이유 */}
      <div className="bg-[#FBFAF7] rounded-xl p-4">
        <p className="text-[13px] text-[#9CA3AF] mb-2.5" style={{ fontWeight: 700 }}>이유</p>
        <div className="space-y-2">
          {data.reasons.map((r, i) => (
            <div key={i} className="flex gap-2.5 text-[14px] text-[#1F2937] leading-[1.6]">
              <span className="text-[#D6D0C8] shrink-0 mt-0.5">•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* (3) 추천 */}
      <div className="bg-[#ECF7EE] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <Lightbulb size={14} className="text-[#1B5E20]" />
          <p className="text-[13px] text-[#1B5E20]" style={{ fontWeight: 700 }}>추천</p>
        </div>
        <div className="space-y-2">
          {data.recommendations.map((r, i) => (
            <div key={i} className="flex gap-2.5 text-[14px] text-[#1B5E20] leading-[1.6]">
              <span className="text-[#1B5E20]/40 shrink-0 mt-0.5">•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* (4) 바로 실행 버튼 */}
      <div className="flex flex-wrap gap-2 pt-1">
        {data.actions.map((a, i) => (
          <button
            key={i}
            onClick={() => navigate(a.path)}
            className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
          >
            {a.label} <ArrowRight size={14} />
          </button>
        ))}
      </div>

      {/* 근거 보기 (접힘) */}
      {data.evidence.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer"
          >
            {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            근거 보기
          </button>
          {showEvidence && (
            <div className="mt-2 bg-[#FBFAF7] rounded-lg p-3 space-y-1.5">
              {data.evidence.map((e, i) => (
                <p key={i} className="text-[13px] text-[#6B7280] leading-[1.5]">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══ 실행 카드 ═══ */
function ActionCardView({ data, onStatusChange }: { data: ActionCardData; onStatusChange?: (s: ActionCardData["status"]) => void }) {
  const [checked, setChecked] = useState(data.status === "saved");
  const isSaved = data.status === "saved";

  return (
    <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] p-5 space-y-4">
      <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{data.title}</p>

      {/* 필드들 */}
      <div className="space-y-2.5">
        {data.fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[14px] text-[#6B7280]">{f.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 600 }}>{f.value}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                f.confidence === "확실함"
                  ? "bg-[#ECF7EE] text-[#1B5E20]"
                  : "bg-[#FFF6E6] text-[#8A6A2B]"
              }`}>
                {f.confidence}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 확인 체크박스 */}
      {!isSaved && data.checkLabel && (
        <label className="flex items-center gap-3 pt-2 cursor-pointer">
          <div
            onClick={() => setChecked(!checked)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checked ? "bg-[#2F4F46] border-[#2F4F46]" : "border-[#D6D0C8] bg-white"
            }`}
          >
            {checked && <Check size={12} className="text-white" />}
          </div>
          <span className="text-[13px] text-[#6B7280]">{data.checkLabel}</span>
        </label>
      )}

      {/* 버튼들 */}
      {!isSaved ? (
        <div className="flex gap-2 pt-1">
          <button
            disabled={!checked}
            onClick={() => onStatusChange?.("saved")}
            className={`h-[44px] px-5 rounded-xl text-[14px] flex items-center gap-2 transition-all cursor-pointer ${
              checked
                ? "bg-[#2F4F46] text-white hover:bg-[#243f38]"
                : "bg-[#E6E2DB] text-[#9CA3AF] cursor-not-allowed"
            }`}
          >
            <Check size={14} /> 저장하기
          </button>
          <button
            onClick={() => onStatusChange?.("idle")}
            className="h-[44px] px-5 rounded-xl border border-[#D6D0C8] text-[14px] text-[#6B7280] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <Edit3 size={14} /> 수정하기
          </button>
          <button
            onClick={() => onStatusChange?.("cancelled")}
            className="h-[44px] px-5 rounded-xl text-[14px] text-[#9CA3AF] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[13px] text-[#1B5E20]">
          <CheckCircle size={14} /> 저장 완료
        </div>
      )}
    </div>
  );
}

/* ═══ 첨부 파일 카드 ═══ */
function AttachmentView({ data }: { data: AttachmentData }) {
  return (
    <div className="mt-2 inline-flex items-center gap-3 bg-[#FBFAF7] border border-[#E6E2DB] rounded-xl px-4 py-3">
      <div className="w-10 h-10 rounded-lg bg-[#F7F3ED] flex items-center justify-center">
        {data.type === "image" ? (
          <FileImage size={18} className="text-[#6B7280]" />
        ) : (
          <FileText size={18} className="text-[#6B7280]" />
        )}
      </div>
      <div>
        <p className="text-[13px] text-[#1F2937]" style={{ fontWeight: 600 }}>{data.name}</p>
        <p className="text-[11px] text-[#9CA3AF]">{data.type === "image" ? "이미지 파일" : "문서 파일"}</p>
      </div>
    </div>
  );
}

/* ═══ 진행 상태 ═══ */
function ProgressView({ data }: { data: ProgressData }) {
  return (
    <div className="mt-2">
      <div className="w-full h-1.5 bg-[#E6E2DB] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2F4F46] rounded-full transition-all duration-500"
          style={{ width: `${data.percent}%` }}
        />
      </div>
      <p className="text-[12px] text-[#9CA3AF] mt-1.5">
        {data.done ? "완료" : data.label}
      </p>
    </div>
  );
}

/* ═══ 연동 마법사 ═══ */
function WizardView({ data }: { data: WizardData }) {
  return (
    <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard size={16} className="text-[#2F4F46]" />
        <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{data.title}</p>
      </div>
      <div className="space-y-3">
        {data.steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              s.done ? "bg-[#1B5E20]" : "bg-[#E6E2DB]"
            }`}>
              {s.done ? (
                <Check size={12} className="text-white" />
              ) : (
                <span className="text-[10px] text-[#6B7280]">{i + 1}</span>
              )}
            </div>
            <div>
              <p className="text-[13px] text-[#1F2937]" style={{ fontWeight: 600 }}>{s.label}</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">{s.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 테이블 결과 ═══ */
function TableResultView({ data }: { data: TableResultData }) {
  return (
    <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] p-5 space-y-4">
      <p className="text-[15px] text-[#1F2937]" style={{ fontWeight: 700 }}>{data.title}</p>
      <p className="text-[13px] text-[#6B7280]">{data.subtitle}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E6E2DB]">
              {data.columns.map((c, i) => (
                <th key={i} className="text-left py-2 pr-4 text-[#9CA3AF]" style={{ fontWeight: 600 }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-[#F3EFE8] last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="py-2.5 pr-4 text-[#1F2937]">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 pt-1">
        {data.actions.map((a, i) => (
          <button
            key={i}
            className={`h-[44px] px-5 rounded-xl text-[14px] flex items-center gap-2 transition-colors cursor-pointer ${
              a.variant === "primary"
                ? "bg-[#2F4F46] text-white hover:bg-[#243f38]"
                : "border border-[#D6D0C8] text-[#6B7280] hover:bg-[#F7F3ED]"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ 요약 카드 (저장 후) ═══ */
function SummaryView({ data }: { data: SummaryData }) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#FBFAF7] rounded-xl border border-[#E6E2DB] p-4 space-y-3 mt-2">
      {data.items.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-[13px] text-[#6B7280]">{item.label}</span>
          <span className={`text-[14px] ${
            item.trend === "up" ? "text-[#C62828]" : item.trend === "down" ? "text-[#1B5E20]" : "text-[#1F2937]"
          }`} style={{ fontWeight: 600 }}>
            {item.value}
          </span>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        {data.actions.map((a, i) => (
          <button
            key={i}
            onClick={() => navigate(a.path)}
            className="h-[36px] px-4 rounded-lg border border-[#D6D0C8] text-[13px] text-[#6B7280] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            {a.label} <ArrowRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ 중복 감지 ═══ */
function DuplicateView({ data }: { data: DuplicateData }) {
  return (
    <div className="bg-[#FFF6E6] rounded-xl border border-[#E6D5A8] p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-[#8A6A2B] shrink-0 mt-0.5" />
        <p className="text-[14px] text-[#8A6A2B] leading-[1.5]">{data.message}</p>
      </div>
      <div className="flex gap-2">
        {data.actions.map((a, i) => (
          <button
            key={i}
            className={`h-[40px] px-4 rounded-xl text-[13px] flex items-center gap-2 transition-colors cursor-pointer ${
              a.variant === "primary"
                ? "bg-[#8A6A2B] text-white hover:bg-[#7A5D25]"
                : "border border-[#E6D5A8] text-[#8A6A2B] hover:bg-[#FFF0D6]"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══ 상품 스냅샷 ═══ */
function ProductSnapshotView({ data }: { data: ProductSnapshotData }) {
  return (
    <div className={`rounded-xl border p-4 mt-2 ${
      data.warning ? "border-[#E6D5A8] bg-[#FFFCF5]" : "border-[#E6E2DB] bg-[#FBFAF7]"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CircleDot size={14} className={data.warning ? "text-[#C62828]" : "text-[#1B5E20]"} />
          <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>{data.name}</span>
        </div>
        {data.warning && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FDECEC] text-[#C62828]">
            목표 미달
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-[#9CA3AF]">판매가</p>
          <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 600 }}>{data.revenue}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#9CA3AF]">들어간 비용</p>
          <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 600 }}>{data.cost}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#9CA3AF]">남는 비율</p>
          <p className={`text-[14px] ${data.warning ? "text-[#C62828]" : "text-[#1B5E20]"}`} style={{ fontWeight: 700 }}>
            {data.margin}%
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[#9CA3AF]">목표</p>
          <p className="text-[14px] text-[#6B7280]" style={{ fontWeight: 600 }}>{data.target}%</p>
        </div>
      </div>
    </div>
  );
}

/* ═══ 메인 ChatBubble 컴포넌트 ═══ */
interface ChatBubbleProps {
  message: ChatMessage;
  compact?: boolean;
}

export function ChatBubble({ message, compact = false }: ChatBubbleProps) {
  const isUser = message.role === "user";

  /* 사용자 말풍선 */
  if (isUser) {
    return (
      <div className={`flex flex-col items-end ${compact ? "mb-3" : "mb-5"}`}>
        <p className="text-[13px] text-[#9CA3AF] mb-1.5 mr-1">사장님</p>
        <div className={`${compact ? "max-w-full" : "max-w-[560px]"}`}>
          <div className="bg-white rounded-2xl rounded-br-md border border-[#E6E2DB] px-5 py-4">
            <p className="text-[14px] text-[#1F2937] leading-[1.7] whitespace-pre-wrap">{message.content}</p>
            {message.attachment && <AttachmentView data={message.attachment} />}
          </div>
          <p className="text-[13px] text-[#9CA3AF] mt-1.5 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  /* 비서 말풍선 */
  return (
    <div className={`flex gap-3 ${compact ? "mb-3" : "mb-6"}`}>
      <div className={`${compact ? "w-7 h-7" : "w-8 h-8"} rounded-lg bg-[#2F4F46] flex items-center justify-center shrink-0 mt-6`}>
        <Bot size={compact ? 14 : 16} className="text-white" />
      </div>
      <div className={`flex-1 ${compact ? "max-w-full" : "max-w-[640px]"}`}>
        <p className="text-[13px] text-[#9CA3AF] mb-1.5">이웃우리 비서</p>
        <div className="bg-white rounded-2xl rounded-tl-md border border-[#E6E2DB] px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          {/* 텍스트 본문 */}
          {message.content && (
            <p className="text-[14px] text-[#1F2937] leading-[1.7] whitespace-pre-wrap mb-3 last:mb-0">
              {message.content}
            </p>
          )}

          {/* 진행 상태 */}
          {message.progress && <ProgressView data={message.progress} />}

          {/* 분석 카드 */}
          {message.analysis && <AnalysisCardView data={message.analysis} />}

          {/* 실행 카드 */}
          {message.actionCard && <ActionCardView data={message.actionCard} />}

          {/* 연동 마법사 */}
          {message.wizard && <WizardView data={message.wizard} />}

          {/* 테이블 결과 */}
          {message.tableResult && <TableResultView data={message.tableResult} />}

          {/* 요약 카드 */}
          {message.summary && <SummaryView data={message.summary} />}

          {/* 중복 감지 */}
          {message.duplicate && <DuplicateView data={message.duplicate} />}

          {/* 상품 스냅샷 */}
          {message.productSnapshot && <ProductSnapshotView data={message.productSnapshot} />}
        </div>
        <p className="text-[13px] text-[#9CA3AF] mt-1.5">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}

/* ═══ 타이핑 애니메이션 ═══ */
export function TypingIndicator({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 mb-6">
      <div className={`${compact ? "w-7 h-7" : "w-8 h-8"} rounded-lg bg-[#2F4F46] flex items-center justify-center shrink-0 mt-6`}>
        <Bot size={compact ? 14 : 16} className="text-white" />
      </div>
      <div>
        <p className="text-[13px] text-[#9CA3AF] mb-1.5">이웃우리 비서</p>
        <div className="bg-white rounded-2xl rounded-tl-md border border-[#E6E2DB] px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-[12px] text-[#9CA3AF] mt-2">분석 중입니다...</p>
        </div>
      </div>
    </div>
  );
}

/* ═══ 날짜 구분선 ═══ */
export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-[#E6E2DB]" />
      <span className="text-[12px] text-[#9CA3AF] px-2">{label}</span>
      <div className="flex-1 h-px bg-[#E6E2DB]" />
    </div>
  );
}