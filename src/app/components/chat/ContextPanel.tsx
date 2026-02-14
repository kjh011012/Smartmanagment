import { CalendarDays, Building2, RefreshCw, Shield } from "lucide-react";

/* ═══ 좌측 컨텍스트 요약 패널 ═══ */
interface ContextPanelProps {
  show: boolean;
}

export function ContextPanel({ show }: ContextPanelProps) {
  if (!show) return null;

  return (
    <div className="w-[300px] shrink-0 border-r border-[#E6E2DB] bg-white p-5 flex flex-col gap-4 overflow-y-auto">
      <p className="text-[14px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>
        현재 컨텍스트
      </p>

      {/* 현재 기간 */}
      <div className="bg-[#FBFAF7] rounded-xl p-4 flex items-start gap-3">
        <CalendarDays size={18} className="text-[#2F4F46] mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] text-[#9CA3AF]">현재 기간</p>
          <p className="text-[14px] text-[#1F2937] mt-0.5" style={{ fontWeight: 600 }}>2026년 2월</p>
        </div>
      </div>

      {/* 사업장 */}
      <div className="bg-[#FBFAF7] rounded-xl p-4 flex items-start gap-3">
        <Building2 size={18} className="text-[#2F4F46] mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] text-[#9CA3AF]">사업장</p>
          <p className="text-[14px] text-[#1F2937] mt-0.5" style={{ fontWeight: 600 }}>고라데이마을</p>
        </div>
      </div>

      {/* 데이터 갱신 */}
      <div className="bg-[#FBFAF7] rounded-xl p-4 flex items-start gap-3">
        <RefreshCw size={18} className="text-[#2F4F46] mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] text-[#9CA3AF]">데이터 갱신</p>
          <p className="text-[14px] text-[#1F2937] mt-0.5" style={{ fontWeight: 600 }}>방금 전 업데이트</p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-[#E6E2DB] my-1" />

      {/* 보안 안내 */}
      <div className="flex items-start gap-2.5 px-1">
        <Shield size={14} className="text-[#9CA3AF] mt-0.5 shrink-0" />
        <p className="text-[12px] text-[#9CA3AF] leading-[1.5]">
          저장은 저장 전에 꼭 확인을 받습니다.
        </p>
      </div>

      {/* 빠른 요약 */}
      <div className="border-t border-[#E6E2DB] my-1" />
      <p className="text-[12px] text-[#9CA3AF]" style={{ fontWeight: 700 }}>이번 달 요약</p>

      <div className="space-y-2.5">
        {[
          { label: "총 매출", value: "12,000,000원" },
          { label: "총 비용", value: "6,800,000원" },
          { label: "순수익", value: "5,200,000원" },
          { label: "남는 비율", value: "43%" },
          { label: "예약 건수", value: "142건" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-[12px] text-[#9CA3AF]">{item.label}</span>
            <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
