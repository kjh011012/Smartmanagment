import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";

const kpis = [
  { label: "총 매출", value: "12,000,000", unit: "원" },
  { label: "총 비용", value: "6,800,000", unit: "원" },
  { label: "순수익", value: "5,200,000", unit: "원" },
  { label: "정산 예정 금액", value: "3,480,000", unit: "원" },
];

const revenueData = [
  { date: "02.14", product: "감귤 따기 체험", channel: "자체", revenue: 200000, cost: 88000, remaining: 112000, status: "완료", proof: "있음" },
  { date: "02.14", product: "흑돼지 식사", channel: "외부", revenue: 360000, cost: 252000, remaining: 108000, status: "완료", proof: "있음" },
  { date: "02.13", product: "한옥 숙박", channel: "자체", revenue: 350000, cost: 140000, remaining: 210000, status: "완료", proof: "있음" },
  { date: "02.13", product: "감귤 따기 체험", channel: "현장", revenue: 160000, cost: 70400, remaining: 89600, status: "완료", proof: "있음" },
  { date: "02.12", product: "해산물 바비큐", channel: "외부", revenue: 420000, cost: null, remaining: null, status: "완료", proof: "없음" },
  { date: "02.12", product: "감귤 따기 체험", channel: "자체", revenue: 200000, cost: 88000, remaining: 112000, status: "완료", proof: "있음" },
];

const expenseData = [
  { date: "02.14", vendor: "○○마트", item: "재료비", amount: 150000, vat: 15000, method: "영수증 자동", proof: "있음" },
  { date: "02.13", vendor: "△△가스", item: "가스비", amount: 85000, vat: 8500, method: "카드 자동", proof: "있음" },
  { date: "02.12", vendor: "□□농장", item: "재료비", amount: 320000, vat: 32000, method: "홈택스 자동", proof: "있음" },
  { date: "02.11", vendor: "현금 구입", item: "소모품", amount: 45000, vat: 0, method: "수동", proof: "없음" },
  { date: "02.10", vendor: "한국전력", item: "전기요금", amount: 128000, vat: 12800, method: "카드 자동", proof: "있음" },
];

export function Revenue() {
  const [activeTab, setActiveTab] = useState<"revenue" | "expense">("revenue");
  const navigate = useNavigate();

  const getMethodBadge = (method: string) => {
    if (method.includes("자동")) return "bg-[#ECF7EE] text-[#1B5E20]";
    return "bg-[#F7F3ED] text-[#6B7280]";
  };

  return (
    <div className="max-w-[1160px] space-y-8">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <p className="text-[13px] text-[#6B7280] mb-2">{kpi.label}</p>
            <p className={`text-[28px] font-black tracking-[-0.2px] ${i === 2 ? "text-[#2F4F46]" : "text-[#1F2937]"}`}>
              {kpi.value}<span className="text-[14px] font-normal text-[#6B7280] ml-1">{kpi.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 정산 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">정산 계산</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2"><span className="text-[15px] text-[#6B7280]">총 매출</span><span className="text-[15px] text-[#1F2937] text-right">12,000,000원</span></div>
            <div className="flex justify-between py-2"><span className="text-[15px] text-[#6B7280]">환불</span><span className="text-[15px] text-[#C62828] text-right">-120,000원</span></div>
            <div className="flex justify-between py-2"><span className="text-[15px] text-[#6B7280]">수수료</span><span className="text-[15px] text-[#1F2937] text-right">-360,000원</span></div>
            <div className="flex justify-between py-2 border-b border-[#E6E2DB]"><span className="text-[15px] text-[#6B7280]">부가세</span><span className="text-[15px] text-[#1F2937] text-right">-1,040,000원</span></div>
            <div className="flex justify-between py-2">
              <span className="text-[15px] font-bold text-[#1F2937]">최종 정산 금액</span>
              <span className="text-[22px] font-black text-[#2F4F46] tracking-[-0.2px]">10,480,000원</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">정산 일정</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#F3EFE8]">
              <span className="text-[15px] text-[#6B7280]">이번 달 정산일</span>
              <span className="text-[15px] font-bold text-[#1F2937]">03월 05일</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#F3EFE8]">
              <span className="text-[15px] text-[#6B7280]">미정산 금액</span>
              <span className="text-[15px] font-bold text-[#2F4F46]">3,480,000원</span>
            </div>
            <button className="h-[44px] px-5 rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              정산 내역 보기 <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex border-b border-[#E6E2DB]">
          {(["revenue", "expense"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-7 py-4 text-[15px] cursor-pointer transition-colors ${
                activeTab === tab
                  ? "text-[#2F4F46] font-bold border-b-2 border-[#2F4F46]"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              {tab === "revenue" ? "매출 내역" : "지출 내역"}
            </button>
          ))}
        </div>

        <div className="p-7">
          {activeTab === "revenue" ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[#FBFAF7]">
                  {["날짜", "상품", "채널", "매출", "자동 계산 비용", "남은 금액", "상태", "증빙", ""].map(h => (
                    <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueData.map((r, i) => (
                  <tr key={i} className="border-b border-[#EFEAE2] hover:bg-[#F7F3ED] cursor-pointer group transition-colors">
                    <td className="px-4 py-4 text-[14px] text-[#1F2937] relative">
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2F4F46] rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
                      {r.date}
                    </td>
                    <td className="px-4 py-4 text-[14px] text-[#1F2937]">{r.product}</td>
                    <td className="px-4 py-4"><span className="text-[12px] text-[#6B7280] bg-[#F7F3ED] px-2 py-1 rounded">{r.channel}</span></td>
                    <td className="px-4 py-4 text-[14px] text-[#1F2937] text-right">{r.revenue.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-right">
                      {r.cost !== null ? (
                        <span className="text-[14px] text-[#1F2937]">{r.cost.toLocaleString()}원</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[12px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-1 rounded flex items-center gap-1">
                            <AlertTriangle size={12} /> 비용 미설정
                          </span>
                          <button onClick={() => navigate("/products")} className="text-[12px] text-[#2F4F46] underline cursor-pointer">지금 설정</button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {r.remaining !== null ? (
                        <span className="text-[14px] font-bold text-[#2F4F46]">{r.remaining.toLocaleString()}원</span>
                      ) : (
                        <span className="text-[14px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4"><span className="text-[12px] px-2 py-1 rounded-md bg-[#ECF7EE] text-[#1B5E20]">{r.status}</span></td>
                    <td className="px-4 py-4"><span className={`text-[12px] ${r.proof === "있음" ? "text-[#1B5E20]" : "text-[#9CA3AF]"}`}>{r.proof}</span></td>
                    <td className="px-4 py-4 text-[#9CA3AF]"><ChevronRight size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#FBFAF7]">
                  {["날짜", "거래처", "지출 항목", "금액", "부가세", "입력 방식", "증빙", ""].map(h => (
                    <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-4 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenseData.map((e, i) => (
                  <tr key={i} className="border-b border-[#EFEAE2] hover:bg-[#F7F3ED] cursor-pointer group transition-colors">
                    <td className="px-4 py-4 text-[14px] text-[#1F2937] relative">
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2F4F46] rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
                      {e.date}
                    </td>
                    <td className="px-4 py-4 text-[14px] text-[#1F2937]">{e.vendor}</td>
                    <td className="px-4 py-4 text-[14px] text-[#1F2937]">{e.item}</td>
                    <td className="px-4 py-4 text-[14px] text-[#1F2937] text-right">{e.amount.toLocaleString()}원</td>
                    <td className="px-4 py-4 text-[14px] text-[#6B7280] text-right">{e.vat.toLocaleString()}원</td>
                    <td className="px-4 py-4"><span className={`text-[12px] px-2 py-1 rounded ${getMethodBadge(e.method)}`}>{e.method}</span></td>
                    <td className="px-4 py-4"><span className={`text-[12px] ${e.proof === "있음" ? "text-[#1B5E20]" : "text-[#9CA3AF]"}`}>{e.proof}</span></td>
                    <td className="px-4 py-4 text-[#9CA3AF]"><ChevronRight size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
