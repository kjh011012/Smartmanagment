import { useState } from "react";
import { X, Receipt, CreditCard, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface QuickInputModalProps {
  onClose: () => void;
}

type InputType = "revenue" | "expense" | "receipt";

export function QuickInputModal({ onClose }: QuickInputModalProps) {
  const [type, setType] = useState<InputType>("revenue");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-02-14");

  const types = [
    { key: "revenue" as const, label: "매출 입력", icon: TrendingUp, desc: "오늘 발생한 매출을 기록합니다" },
    { key: "expense" as const, label: "지출 입력", icon: CreditCard, desc: "지출 내역을 직접 기록합니다" },
    { key: "receipt" as const, label: "영수증 올리기", icon: Receipt, desc: "사진을 올리면 자동으로 입력됩니다" },
  ];

  const handleSave = () => {
    toast.success("저장되었습니다");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[#E6E2DB]">
          <h2 className="text-[18px] font-bold text-[#1F2937]">빠른 입력</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="px-7 py-6">
          <div className="flex gap-3 mb-6">
            {types.map(t => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer ${
                  type === t.key
                    ? "border-[#2F4F46] bg-[#F7F3ED]"
                    : "border-[#E6E2DB] hover:bg-[#FBFAF7]"
                }`}
              >
                <t.icon size={22} className={type === t.key ? "text-[#2F4F46]" : "text-[#9CA3AF]"} />
                <span className={`text-[14px] ${type === t.key ? "text-[#2F4F46] font-bold" : "text-[#6B7280]"}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {type === "receipt" ? (
            <div className="border-2 border-dashed border-[#D6D0C8] rounded-xl p-10 text-center">
              <Receipt size={40} className="text-[#D6D0C8] mx-auto mb-3" />
              <p className="text-[16px] text-[#6B7280] mb-4">영수증 사진을 올리면 자동으로 입력됩니다</p>
              <div className="flex gap-3 justify-center">
                <button className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
                  사진 올리기
                </button>
                <button className="h-[48px] px-6 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
                  파일 올리기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-[14px] text-[#6B7280] mb-2">날짜</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[#6B7280] mb-2">
                  {type === "revenue" ? "상품 또는 내용" : "거래처 또는 내용"}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={type === "revenue" ? "예: 감귤 체험 8명" : "예: ○○마트 식자재"}
                  className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[#6B7280] mb-2">금액 (원)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {type !== "receipt" && (
          <div className="px-7 pb-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="h-[48px] px-6 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="h-[48px] px-8 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer"
            >
              저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
