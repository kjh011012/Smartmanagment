import { X, Star, MessageSquare, Gift } from "lucide-react";
import { toast } from "sonner";

interface CustomerPanelProps {
  onClose: () => void;
  customer?: {
    name: string;
    phone: string;
    visits: number;
    totalSpent: number;
    grade: string;
    lastVisit: string;
    memo: string;
  };
}

export function CustomerPanel({ onClose, customer }: CustomerPanelProps) {
  const c = customer || {
    name: "김미영",
    phone: "010-1234-5678",
    visits: 12,
    totalSpent: 1840000,
    grade: "단골",
    lastVisit: "2026년 2월 10일",
    memo: "감귤 알레르기 없음. 체험 선호.",
  };

  const visitHistory = [
    { date: "2026.02.10", product: "감귤 따기 체험", amount: 200000 },
    { date: "2026.01.25", product: "흑돼지 식사", amount: 150000 },
    { date: "2026.01.12", product: "한옥 숙박", amount: 350000 },
    { date: "2025.12.28", product: "감귤 따기 체험", amount: 160000 },
    { date: "2025.12.15", product: "흑돼지 식사", amount: 120000 },
  ];

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
          <h2 className="text-[18px] font-bold text-[#1F2937]">고객 상세</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"><X size={20} /></button>
        </div>

        <div className="px-7 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-[#F7F3ED] rounded-full flex items-center justify-center text-[20px] font-bold text-[#2F4F46]">
              {c.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[18px] font-bold text-[#1F2937]">{c.name}</p>
                <span className="text-[12px] px-2 py-0.5 rounded-md bg-[#ECF7EE] text-[#1B5E20]">
                  <Star size={10} className="inline mr-1" />{c.grade}
                </span>
              </div>
              <p className="text-[14px] text-[#6B7280] mt-1">{c.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F7F3ED] rounded-xl p-4 text-center">
              <p className="text-[12px] text-[#6B7280]">방문 횟수</p>
              <p className="text-[20px] font-bold text-[#1F2937] mt-1">{c.visits}회</p>
            </div>
            <div className="bg-[#F7F3ED] rounded-xl p-4 text-center">
              <p className="text-[12px] text-[#6B7280]">총 결제</p>
              <p className="text-[20px] font-bold text-[#1F2937] mt-1">{(c.totalSpent / 10000).toFixed(0)}만</p>
            </div>
            <div className="bg-[#F7F3ED] rounded-xl p-4 text-center">
              <p className="text-[12px] text-[#6B7280]">최근 방문</p>
              <p className="text-[14px] font-bold text-[#1F2937] mt-2">02.10</p>
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">방문 이력 (최근 5건)</h3>
            <div className="space-y-3">
              {visitHistory.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F3EFE8] last:border-0">
                  <div>
                    <p className="text-[14px] text-[#1F2937]">{v.product}</p>
                    <p className="text-[12px] text-[#9CA3AF]">{v.date}</p>
                  </div>
                  <p className="text-[14px] text-[#1F2937]">{v.amount.toLocaleString()}원</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">이용 상품</h3>
            <div className="flex flex-wrap gap-2">
              {["감귤 따기 체험", "흑돼지 식사", "한옥 숙박"].map(p => (
                <span key={p} className="text-[13px] text-[#6B7280] bg-[#FBFAF7] border border-[#E6E2DB] px-3 py-1.5 rounded-lg">{p}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E6E2DB] pt-5">
            <h3 className="text-[14px] font-bold text-[#6B7280] mb-3">메모</h3>
            <textarea
              defaultValue={c.memo}
              className="w-full h-[80px] px-4 py-3 rounded-xl border-[1.5px] border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white resize-none"
            />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-[#E6E2DB] flex gap-3">
          <button
            onClick={() => toast.success("메시지가 전송되었습니다")}
            className="flex-1 h-[48px] rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center justify-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer"
          >
            <MessageSquare size={14} /> 감사 메시지 보내기
          </button>
          <button
            onClick={() => toast.success("혜택 안내가 전송되었습니다")}
            className="flex-1 h-[48px] rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] flex items-center justify-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            <Gift size={14} /> 다음 방문 혜택 안내
          </button>
        </div>
      </div>
    </div>
  );
}
