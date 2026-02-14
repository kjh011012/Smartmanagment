import { useState } from "react";
import { Upload, CreditCard, FileText, Check, ChevronDown, Edit2, RefreshCw } from "lucide-react";
import { ReceiptWizard } from "../modals/ReceiptWizard";
import { CardWizard } from "../modals/CardWizard";
import { HomtaxWizard } from "../modals/HomtaxWizard";

const cardHistory = [
  { date: "02.14", vendor: "○○마트", amount: 150000, category: "재료비", confirmed: true },
  { date: "02.13", vendor: "△△가스", amount: 85000, category: "가스비", confirmed: true },
  { date: "02.13", vendor: "◇◇마트", amount: 67000, category: "재료비", confirmed: false },
  { date: "02.12", vendor: "□□인쇄", amount: 35000, category: "소모품비", confirmed: true },
  { date: "02.11", vendor: "주유소", amount: 80000, category: "차량비", confirmed: false },
];

const homtaxData = [
  { date: "02.10", vendor: "□□농장", type: "세금계산서", amount: 320000, matched: true },
  { date: "02.08", vendor: "△△가스", type: "카드매입", amount: 85000, matched: true },
  { date: "02.05", vendor: "○○수산", type: "세금계산서", amount: 450000, matched: false },
];

export function ExpenseInput() {
  const [activeTab, setActiveTab] = useState<"receipt" | "card" | "homtax">("receipt");
  const [showReceiptWizard, setShowReceiptWizard] = useState(false);
  const [showCardWizard, setShowCardWizard] = useState(false);
  const [showHomtaxWizard, setShowHomtaxWizard] = useState(false);
  const [cardLinked] = useState(true);
  const [homtaxLinked] = useState(false);

  const tabs = [
    { key: "receipt" as const, label: "영수증 올리기", icon: Upload },
    { key: "card" as const, label: "카드 사용 내역", icon: CreditCard },
    { key: "homtax" as const, label: "홈택스 불러오기", icon: FileText },
  ];

  return (
    <div className="max-w-[1160px] space-y-8">
      {/* 탭 */}
      <div className="flex gap-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === tab.key
                ? "border-[#2F4F46] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
                : "border-[#E6E2DB] bg-white/60 hover:bg-white"
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.key ? "text-[#2F4F46]" : "text-[#9CA3AF]"} />
            <span className={`text-[15px] ${activeTab === tab.key ? "text-[#2F4F46] font-bold" : "text-[#6B7280]"}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 영수증 올리기 */}
      {activeTab === "receipt" && (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="border-2 border-dashed border-[#D6D0C8] rounded-xl p-12 text-center">
            <Upload size={48} className="text-[#D6D0C8] mx-auto mb-4" />
            <p className="text-[18px] font-bold text-[#1F2937] mb-2">영수증 사진을 올리면 자동으로 입력됩니다</p>
            <p className="text-[14px] text-[#6B7280] mb-6">글자가 잘 보이게 찍어주세요</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowReceiptWizard(true)}
                className="h-[48px] px-8 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer"
              >
                사진 올리기
              </button>
              <button
                onClick={() => setShowReceiptWizard(true)}
                className="h-[48px] px-8 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
              >
                파일 올리기
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[16px] font-bold text-[#1F2937] mb-4">최근 업로드한 영수증</h3>
            <div className="space-y-3">
              {[
                { file: "영수증_20260214.jpg", vendor: "○○마트", amount: "150,000원", status: "완료" },
                { file: "영수증_20260213.jpg", vendor: "△△가스", amount: "85,000원", status: "완료" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 bg-[#FBFAF7] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[50px] bg-[#E6E2DB] rounded-lg flex items-center justify-center">
                      <FileText size={18} className="text-[#9CA3AF]" />
                    </div>
                    <div>
                      <p className="text-[14px] text-[#1F2937]">{r.file}</p>
                      <p className="text-[12px] text-[#9CA3AF]">{r.vendor} · {r.amount}</p>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-1 rounded flex items-center gap-1">
                    <Check size={12} /> {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 카드 사용 내역 */}
      {activeTab === "card" && (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">카드 연동 상태</h3>
              {cardLinked ? (
                <p className="text-[14px] text-[#1B5E20] mt-1 flex items-center gap-1"><Check size={14} /> 신한카드 연동됨</p>
              ) : (
                <p className="text-[14px] text-[#6B7280] mt-1">아직 연동되지 않았습니다</p>
              )}
            </div>
            {cardLinked ? (
              <button className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] flex items-center gap-2 hover:bg-[#243f38] transition-colors cursor-pointer">
                <RefreshCw size={14} /> 이번 달 불러오기
              </button>
            ) : (
              <button onClick={() => setShowCardWizard(true)} className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
                카드 연동하기
              </button>
            )}
          </div>

          <p className="text-[14px] text-[#6B7280] bg-[#F7F3ED] px-4 py-3 rounded-xl mb-5">
            자동 분류는 최근 사용 내역을 바탕으로 추천됩니다. 항목이 다르면 직접 수정해 주세요.
          </p>

          <table className="w-full">
            <thead>
              <tr className="bg-[#FBFAF7]">
                {["날짜", "사용처", "금액", "자동 분류 항목", "확인 상태", ""].map(h => (
                  <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cardHistory.map((c, i) => (
                <tr key={i} className="border-b border-[#EFEAE2] hover:bg-[#F7F3ED] transition-colors">
                  <td className="px-4 py-4 text-[14px] text-[#1F2937]">{c.date}</td>
                  <td className="px-4 py-4 text-[14px] text-[#1F2937]">{c.vendor}</td>
                  <td className="px-4 py-4 text-[14px] text-[#1F2937] text-right">{c.amount.toLocaleString()}원</td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <select className="h-[36px] pl-3 pr-7 rounded-lg border border-[#D6D0C8] bg-white text-[13px] appearance-none cursor-pointer" defaultValue={c.category}>
                        <option>재료비</option>
                        <option>가스비</option>
                        <option>소모품비</option>
                        <option>차량비</option>
                        <option>기타</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {c.confirmed ? (
                      <span className="text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-1 rounded">확인됨</span>
                    ) : (
                      <span className="text-[12px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-1 rounded">미확인</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-[#9CA3AF] hover:text-[#2F4F46] cursor-pointer"><Edit2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 홈택스 불러오기 */}
      {activeTab === "homtax" && (
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">홈택스/손택스 연동 상태</h3>
              {homtaxLinked ? (
                <p className="text-[14px] text-[#1B5E20] mt-1 flex items-center gap-1"><Check size={14} /> 연동됨</p>
              ) : (
                <p className="text-[14px] text-[#6B7280] mt-1">아직 연동되지 않았습니다</p>
              )}
            </div>
            {!homtaxLinked && (
              <button onClick={() => setShowHomtaxWizard(true)} className="h-[44px] px-5 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer">
                연동하기
              </button>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <button className="h-[44px] px-5 rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              세금계산서 불러오기
            </button>
            <button className="h-[44px] px-5 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              카드 매입 불러오기
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-[#FBFAF7]">
                {["날짜", "거래처", "유형", "금액", "매칭 상태"].map(h => (
                  <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {homtaxData.map((h, i) => (
                <tr key={i} className="border-b border-[#EFEAE2] hover:bg-[#F7F3ED] transition-colors">
                  <td className="px-4 py-4 text-[14px] text-[#1F2937]">{h.date}</td>
                  <td className="px-4 py-4 text-[14px] text-[#1F2937]">{h.vendor}</td>
                  <td className="px-4 py-4"><span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-1 rounded">{h.type}</span></td>
                  <td className="px-4 py-4 text-[14px] text-[#1F2937] text-right">{h.amount.toLocaleString()}원</td>
                  <td className="px-4 py-4">
                    {h.matched ? (
                      <span className="text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2 py-1 rounded">매칭됨</span>
                    ) : (
                      <span className="text-[12px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-1 rounded">같은 내역이 이미 있어요</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReceiptWizard && <ReceiptWizard onClose={() => setShowReceiptWizard(false)} />}
      {showCardWizard && <CardWizard onClose={() => setShowCardWizard(false)} />}
      {showHomtaxWizard && <HomtaxWizard onClose={() => setShowHomtaxWizard(false)} />}
    </div>
  );
}
