import { useState } from "react";
import { X, FileText, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";

interface HomtaxWizardProps {
  onClose: () => void;
}

export function HomtaxWizard({ onClose }: HomtaxWizardProps) {
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState("");

  const purposes = [
    { id: "tax", label: "세금계산서", desc: "발행·수취한 세금계산서를 불러옵니다" },
    { id: "card", label: "카드 매입", desc: "사업용 카드 매입 내역을 불러옵니다" },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,0.12)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[#E6E2DB]">
          <div>
            <h2 className="text-[18px] font-bold text-[#1F2937]">홈택스 연동</h2>
            <p className="text-[14px] text-[#6B7280] mt-1">{step}단계 / 3단계</p>
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
              <p className="text-[16px] text-[#1F2937] mb-5">어떤 자료를 불러올까요?</p>
              <div className="space-y-3">
                {purposes.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPurpose(p.id)}
                    className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all cursor-pointer ${
                      purpose === p.id ? "border-[#2F4F46] bg-[#F7F3ED]" : "border-[#E6E2DB] hover:bg-[#FBFAF7]"
                    }`}
                  >
                    <FileText size={22} className={purpose === p.id ? "text-[#2F4F46]" : "text-[#9CA3AF]"} />
                    <div>
                      <p className={`text-[16px] ${purpose === p.id ? "text-[#2F4F46] font-bold" : "text-[#1F2937]"}`}>{p.label}</p>
                      <p className="text-[13px] text-[#6B7280] mt-1">{p.desc}</p>
                    </div>
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
                  <p className="text-[16px] font-bold text-[#1F2937] mb-2">홈택스 자료만 조회합니다</p>
                  <p className="text-[14px] text-[#6B7280] leading-[1.6]">
                    세금계산서와 카드 매입 자료만 불러오며, 신고나 납부는 하지 않습니다.
                    세무 정리가 훨씬 쉬워집니다.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-[#FBFAF7] rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 accent-[#2F4F46]" />
                  <span className="text-[14px] text-[#1F2937]">홈택스 자료 조회에 동의합니다</span>
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
                이제 홈택스 자료가 자동으로 정리됩니다.<br />
                세무 정리가 훨씬 쉬워집니다.
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
