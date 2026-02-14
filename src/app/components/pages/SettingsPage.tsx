import { toast } from "sonner";

export function SettingsPage() {
  const handleSave = () => {
    toast.success("저장되었습니다");
  };

  return (
    <div className="max-w-[860px] space-y-8">
      {/* 사업자 정보 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">사업자 정보</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[14px] text-[#6B7280] mb-2">상호</label>
            <input defaultValue="고라데이마을" className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white" />
          </div>
          <div>
            <label className="block text-[14px] text-[#6B7280] mb-2">대표</label>
            <input defaultValue="홍길동" className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-[14px] text-[#6B7280] mb-2">사업자등록번호</label>
            <input defaultValue="123-45-67890" className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleSave} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
            저장하기
          </button>
        </div>
      </div>

      {/* 정산 계좌 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">정산 계좌</h2>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="block text-[14px] text-[#6B7280] mb-2">은행</label>
            <select defaultValue="농협" className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white appearance-none cursor-pointer">
              <option>농협</option>
              <option>국민</option>
              <option>신한</option>
              <option>우리</option>
              <option>하나</option>
            </select>
          </div>
          <div>
            <label className="block text-[14px] text-[#6B7280] mb-2">계좌번호</label>
            <input defaultValue="301-1234-5678-90" className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white" />
          </div>
          <div>
            <label className="block text-[14px] text-[#6B7280] mb-2">예금주</label>
            <input defaultValue="홍길동" className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[16px] focus:border-[#2F4F46] focus:outline-none bg-white" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleSave} className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
            저장하기
          </button>
        </div>
      </div>

      {/* 세금 설정 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">세금 설정</h2>
        <div>
          <label className="block text-[14px] text-[#6B7280] mb-3">부가세 기본값</label>
          <div className="flex gap-3">
            {["부가세 포함", "부가세 별도"].map(opt => (
              <label key={opt} className="flex items-center gap-3 px-5 py-4 bg-[#FBFAF7] rounded-xl cursor-pointer border border-[#E6E2DB] hover:bg-[#F7F3ED] transition-colors">
                <input type="radio" name="vat" defaultChecked={opt === "부가세 포함"} className="w-5 h-5 accent-[#2F4F46]" />
                <span className="text-[14px] text-[#1F2937]">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 사용자 권한 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">사용자 권한</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-[#FBFAF7]">
              {["이름", "역할", "상태"].map(h => (
                <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "홍길동", role: "관리자", status: "활성" },
              { name: "김직원", role: "직원", status: "활성" },
            ].map((u, i) => (
              <tr key={i} className="border-b border-[#EFEAE2]">
                <td className="px-4 py-4 text-[14px] text-[#1F2937]">{u.name}</td>
                <td className="px-4 py-4">
                  <span className={`text-[12px] px-2 py-1 rounded ${u.role === "관리자" ? "bg-[#ECF7EE] text-[#1B5E20]" : "bg-[#F7F3ED] text-[#6B7280]"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-1 rounded">{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">알림 설정</h2>
        <div className="space-y-4">
          {[
            { label: "중요 알림 (남는 비율 급락, 재고 부족)", checked: true },
            { label: "주의 알림 (비용 증가, 원가 미입력)", checked: true },
            { label: "정보 알림 (보고서 생성, 연동 성공)", checked: false },
          ].map((n, i) => (
            <label key={i} className="flex items-center justify-between py-3 px-5 bg-[#FBFAF7] rounded-xl cursor-pointer">
              <span className="text-[14px] text-[#1F2937]">{n.label}</span>
              <div className={`w-[44px] h-[24px] rounded-full relative transition-colors ${n.checked ? "bg-[#2F4F46]" : "bg-[#D6D0C8]"}`}>
                <div className={`w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${n.checked ? "right-[2px]" : "left-[2px]"}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 요금제 정보 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">요금제 정보</h2>
        <div className="bg-[#F7F3ED] rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] text-[#6B7280]">현재 요금제</p>
              <p className="text-[20px] font-bold text-[#2F4F46] mt-1">프리미엄 인공지능</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] text-[#6B7280]">다음 결제일</p>
              <p className="text-[16px] font-bold text-[#1F2937] mt-1">2026년 3월 14일</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[14px] text-[#6B7280]">
            <span>월 99,000원</span>
            <span>·</span>
            <span>영수증 인식, 인공지능 비서, 예측 분석 포함</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="h-[48px] px-6 rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
            결제 관리
          </button>
          <button className="h-[48px] px-6 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
            요금제 변경
          </button>
        </div>
      </div>
    </div>
  );
}
