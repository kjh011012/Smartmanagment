import { X, FileText } from "lucide-react";

interface ExpensePanelProps {
  onClose: () => void;
}

export function ExpensePanel({ onClose }: ExpensePanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-[480px] h-full bg-white shadow-[-4px_0_20px_rgba(0,0,0,0.08)] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideIn 0.3s ease-out" }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[#E6E2DB]">
          <h2 className="text-[18px] font-bold text-[#1F2937]">지출 상세</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"><X size={20} /></button>
        </div>

        <div className="px-7 py-6 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[#F3EFE8]">
              <span className="text-[14px] text-[#6B7280]">거래처</span>
              <span className="text-[14px] text-[#1F2937]">○○마트</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F3EFE8]">
              <span className="text-[14px] text-[#6B7280]">날짜</span>
              <span className="text-[14px] text-[#1F2937]">2026년 2월 14일</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F3EFE8]">
              <span className="text-[14px] text-[#6B7280]">지출 항목</span>
              <span className="text-[14px] text-[#1F2937]">재료비</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F3EFE8]">
              <span className="text-[14px] text-[#6B7280]">금액</span>
              <span className="text-[16px] font-bold text-[#1F2937]">150,000원</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F3EFE8]">
              <span className="text-[14px] text-[#6B7280]">부가세</span>
              <span className="text-[14px] text-[#1F2937]">15,000원 (포함)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[14px] text-[#6B7280]">입력 방식</span>
              <span className="text-[14px] text-[#2F4F46] bg-[#ECF7EE] px-2 py-0.5 rounded">영수증 자동</span>
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">증빙 자료</h3>
            <div className="bg-[#F7F3ED] rounded-xl p-5 flex items-center gap-4">
              <div className="w-[60px] h-[80px] bg-[#E6E2DB] rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-[#9CA3AF]" />
              </div>
              <div>
                <p className="text-[14px] text-[#1F2937]">영수증_20260214.jpg</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">2026.02.14 15:12 업로드</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">메모</h3>
            <textarea
              defaultValue="이번 주 체험 재료 구입"
              className="w-full h-[80px] px-4 py-3 rounded-xl border-[1.5px] border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white resize-none"
            />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-[#E6E2DB] flex gap-3">
          <button className="flex-1 h-[48px] rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
            수정하기
          </button>
          <button className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#C62828] text-[14px] hover:bg-[#FDECEC] transition-colors cursor-pointer">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
