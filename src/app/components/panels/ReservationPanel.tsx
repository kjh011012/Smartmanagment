import { X, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ReservationPanelProps {
  onClose: () => void;
  reservation?: {
    id: string;
    customer: string;
    phone: string;
    product: string;
    date: string;
    time: string;
    people: number;
    payment: number;
    discount: number;
    status: string;
  };
}

export function ReservationPanel({ onClose, reservation }: ReservationPanelProps) {
  const r = reservation || {
    id: "R-20260214-003",
    customer: "김미영",
    phone: "010-1234-5678",
    product: "감귤 따기 체험",
    date: "2026년 2월 14일",
    time: "10:00",
    people: 8,
    payment: 200000,
    discount: 0,
    status: "확정",
  };

  const costPerPerson = 11000;
  const totalCost = costPerPerson * r.people;
  const remaining = r.payment - totalCost;
  const marginRate = Math.round((remaining / r.payment) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-[480px] h-full bg-white shadow-[-4px_0_20px_rgba(0,0,0,0.08)] overflow-y-auto animate-slide-in"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideIn 0.3s ease-out" }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[#E6E2DB]">
          <h2 className="text-[18px] font-bold text-[#1F2937]">예약 상세</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"><X size={20} /></button>
        </div>

        <div className="px-7 py-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[18px] font-bold text-[#1F2937]">{r.customer}</p>
                <p className="text-[14px] text-[#6B7280] flex items-center gap-1 mt-1"><Phone size={14} /> {r.phone}</p>
              </div>
              <span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-3 py-1 rounded-md">{r.id}</span>
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">예약 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">날짜</span><span className="text-[14px] text-[#1F2937]">{r.date}</span></div>
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">시간</span><span className="text-[14px] text-[#1F2937]">{r.time}</span></div>
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">상품</span><span className="text-[14px] text-[#1F2937]">{r.product}</span></div>
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">인원</span><span className="text-[14px] text-[#1F2937]">{r.people}명</span></div>
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">결제 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">결제 금액</span><span className="text-[14px] text-[#1F2937]">{r.payment.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">할인</span><span className="text-[14px] text-[#1F2937]">{r.discount.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">환불</span><span className="text-[14px] text-[#1F2937]">0원</span></div>
            </div>
          </div>

          <div className="bg-[#F7F3ED] rounded-xl p-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">간단 보기</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">들어간 비용</span><span className="text-[14px] text-[#1F2937]">{totalCost.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-[14px] font-bold text-[#1F2937]">남는 금액</span><span className="text-[16px] font-bold text-[#2F4F46]">{remaining.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span className="text-[14px] text-[#6B7280]">남는 비율</span><span className="text-[14px] font-bold text-[#1B5E20]">{marginRate}%</span></div>
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">준비 체크리스트</h3>
            <div className="space-y-3">
              {["감귤밭 정비", "체험 도구 준비(가위, 바구니)", "음료 및 간식 준비", "주차 안내"].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-[#2F4F46]" />
                  <span className="text-[14px] text-[#1F2937]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">메모</h3>
            <textarea
              placeholder="현장 특이사항을 기록해 주세요"
              className="w-full h-[80px] px-4 py-3 rounded-xl border-[1.5px] border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white resize-none"
            />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-[#E6E2DB] flex gap-3">
          <button className="flex-1 h-[48px] rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
            예약 수정
          </button>
          <button className="h-[48px] px-5 rounded-xl border border-[#E6E2DB] text-[#C62828] text-[14px] hover:bg-[#FDECEC] transition-colors cursor-pointer">
            취소
          </button>
          <button
            onClick={() => toast.success("메시지가 전송되었습니다")}
            className="h-[48px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
          >
            <MessageSquare size={14} /> 문자 보내기
          </button>
        </div>
      </div>
    </div>
  );
}
