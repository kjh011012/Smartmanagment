import { useState } from "react";
import { X, CreditCard, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";

interface CardWizardProps {
  onClose: () => void;
}

export function CardWizard({ onClose }: CardWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedCard, setSelectedCard] = useState("");

  const cards = [
    { id: "shinhan", name: "신한카드" },
    { id: "kb", name: "국민카드" },
    { id: "samsung", name: "삼성카드" },
    { id: "hyundai", name: "현대카드" },
    { id: "lotte", name: "롯데카드" },
    { id: "hana", name: "하나카드" },
    { id: "woori", name: "우리카드" },
    { id: "nh", name: "농협카드" },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.12)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[#E6E2DB]">
          <div>
            <h2 className="text-[18px] font-bold text-[#1F2937]">카드 사용 내역 연동</h2>
            <p className="text-[14px] text-[#6B7280] mt-1">{step}단��� / 3단계</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"><X size={20} /></button>
        </div>

        <div className="px-7 py-2">
          <div className="flex gap-2 mt-4 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-[4px] rounded-full ${s <= step ? "bg-[#2F4F46]" : "bg-[#E6E2DB]"}`} />
            ))}
          </div>
        </div>

        <div className="px-7 pb-6">
          {step === 1 && (
            <div>
              <p className="text-[16px] text-[#1F2937] mb-5">연동할 카드를 선택해 주세요</p>
              <div className="grid grid-cols-2 gap-3">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedCard === card.id ? "border-[#2F4F46] bg-[#F7F3ED]" : "border-[#E6E2DB] hover:bg-[#FBFAF7]"
                    }`}
                  >
                    <CreditCard size={20} className={selectedCard === card.id ? "text-[#2F4F46]" : "text-[#9CA3AF]"} />
                    <span className={`text-[14px] ${selectedCard === card.id ? "text-[#2F4F46] font-bold" : "text-[#6B7280]"}`}>
                      {card.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-start gap-3 p-5 bg-[#F7F3ED] rounded-xl mb-5">
                <Shield size={24} className="text-[#2F4F46] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[16px] font-bold text-[#1F2937] mb-2">안전하게 연동됩니다</p>
                  <p className="text-[14px] text-[#6B7280] leading-[1.6]">
                    카드 사용 내역만 불러오며, 결제나 이체는 할 수 없습니다.
                    개인정보는 안전하게 보호됩니다.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-[#FBFAF7] rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 accent-[#2F4F46]" />
                  <span className="text-[14px] text-[#1F2937]">카드 사용 내역 조회에 동의합니다</span>
                </label>
                <label className="flex items-start gap-3 p-4 bg-[#FBFAF7] rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 accent-[#2F4F46]" />
                  <span className="text-[14px] text-[#1F2937]">개인정보 처리 방침에 동의합니다</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle size={56} className="text-[#1B5E20] mx-auto mb-4" />
              <p className="text-[18px] font-bold text-[#1F2937] mb-2">연동이 완료되었습니다</p>
              <p className="text-[14px] text-[#6B7280] leading-[1.6]">
                이제 카드 사용 내역이 자동으로 불러와집니다.<br />
                '지출 자동 입력' 화면에서 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        <div className="px-7 pb-6 flex justify-between">
          {step > 1 && step < 3 ? (
            <button onClick={() => setStep(step - 1)} className="h-[48px] px-6 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">이전</button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="h-[48px] px-8 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
              {step === 2 ? "연동하기" : "다음"}
            </button>
          ) : (
            <button onClick={() => { toast.success("연동이 완료되었습니다"); onClose(); }} className="h-[48px] px-8 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
              완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
