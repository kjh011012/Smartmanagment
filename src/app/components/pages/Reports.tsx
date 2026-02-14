import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const monthlyData = [
  { month: "9월", revenue: 9200000, cost: 5400000, profit: 3800000, margin: 41 },
  { month: "10월", revenue: 10500000, cost: 6300000, profit: 4200000, margin: 40 },
  { month: "11월", revenue: 11200000, cost: 6600000, profit: 4600000, margin: 41 },
  { month: "12월", revenue: 9800000, cost: 5900000, profit: 3900000, margin: 40 },
  { month: "1월", revenue: 11000000, cost: 6500000, profit: 4500000, margin: 41 },
  { month: "2월", revenue: 12000000, cost: 6800000, profit: 5200000, margin: 43 },
];

const productData = [
  { name: "감귤 따기 체험", remaining: 3500000 },
  { name: "한옥 숙박", remaining: 2800000 },
  { name: "흑돼지 식사", remaining: 1800000 },
  { name: "감귤잼 만들기", remaining: 920000 },
  { name: "승마 체험", remaining: 680000 },
];

const costBreakdown = [
  { name: "재료비", value: 2800000 },
  { name: "인건비", value: 1600000 },
  { name: "공과금", value: 980000 },
  { name: "소모품", value: 720000 },
  { name: "기타", value: 700000 },
];

const costColors = ["#2F4F46", "#6B7280", "#D6D0C8", "#9CA3AF", "#E6E2DB"];

const topCostIncrease = [
  { item: "재료비 (식자재)", increase: "+8%", amount: "2,800,000원" },
  { item: "가스비", increase: "+12%", amount: "420,000원" },
  { item: "인건비", increase: "+3%", amount: "1,600,000원" },
];

export function Reports() {
  const [period, setPeriod] = useState("이번 달");

  const reportCards = [
    { label: "월별 순수익", value: "5,200,000", unit: "원", sub: "전월 대비 +15%" },
    { label: "상품별 수익 1위", value: "감귤 체험", unit: "", sub: "남는 금액 3,500,000원" },
    { label: "남는 비율 변화", value: "43", unit: "%", sub: "전월 대비 +2%p" },
    { label: "비용 증가 1위", value: "가스비", unit: "", sub: "전월 대비 +12%" },
  ];

  return (
    <div className="max-w-[1160px] space-y-8">
      {/* 기간 선택 */}
      <div className="flex gap-2">
        {["이번 달", "최근 3개월", "올해", "직접 선택"].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`h-[40px] px-5 rounded-xl text-[14px] cursor-pointer transition-all ${
              period === p
                ? "bg-[#2F4F46] text-white"
                : "bg-white border border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 핵심 리포트 카드 */}
      <div className="grid grid-cols-4 gap-5">
        {reportCards.map((card, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <p className="text-[13px] text-[#6B7280] mb-2">{card.label}</p>
            <p className="text-[24px] font-black text-[#1F2937] tracking-[-0.2px]">
              {card.value}<span className="text-[14px] font-normal text-[#6B7280] ml-1">{card.unit}</span>
            </p>
            <p className="text-[13px] text-[#6B7280] mt-2">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 그래프 영역 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 월별 순수익 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">월별 순수익</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`${(value / 10000).toFixed(0)}만원`]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6E2DB", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}
                />
                <Bar dataKey="profit" fill="#2F4F46" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 상품별 남는 금액 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">상품별 남는 금액</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#6B7280" }} />
                <Tooltip
                  formatter={(value: number) => [`${(value / 10000).toFixed(0)}만원`]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6E2DB", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}
                />
                <Bar dataKey="remaining" fill="#2F4F46" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 비용 구성 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">비용 구성</h2>
          <div className="h-[200px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costBreakdown} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={2}>
                  {costBreakdown.map((_, i) => <Cell key={i} fill={costColors[i]} />)}
                </Pie>
                <Legend
                  formatter={(value: string) => <span style={{ fontSize: 13, color: "#6B7280" }}>{value}</span>}
                />
                <Tooltip
                  formatter={(value: number) => [`${(value / 10000).toFixed(0)}만원`]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6E2DB", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 비용 증가 항목 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">비용 증가 항목 상위 3</h2>
          <div className="space-y-4">
            {topCostIncrease.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 px-5 bg-[#FBFAF7] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-[28px] h-[28px] rounded-full bg-[#F7F3ED] flex items-center justify-center text-[13px] text-[#6B7280]">{i + 1}</span>
                  <span className="text-[15px] text-[#1F2937]">{item.item}</span>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-bold text-[#C62828]">{item.increase}</span>
                  <span className="text-[13px] text-[#6B7280] ml-3">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 표 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">월별 상세</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-[#FBFAF7]">
              {["월", "총 매출", "총 비용", "순수익", "남는 비율", "전월 대비"].map(h => (
                <th key={h} className="text-left text-[13px] font-bold text-[#6B7280] px-5 py-3 first:rounded-l-lg last:rounded-r-lg">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((m, i) => (
              <tr key={i} className="border-b border-[#EFEAE2] hover:bg-[#F7F3ED] transition-colors">
                <td className="px-5 py-4 text-[14px] text-[#1F2937]">{m.month}</td>
                <td className="px-5 py-4 text-[14px] text-[#1F2937] text-right">{m.revenue.toLocaleString()}원</td>
                <td className="px-5 py-4 text-[14px] text-[#1F2937] text-right">{m.cost.toLocaleString()}원</td>
                <td className="px-5 py-4 text-[14px] font-bold text-[#2F4F46] text-right">{m.profit.toLocaleString()}원</td>
                <td className="px-5 py-4 text-[14px] text-[#1F2937] text-right">{m.margin}%</td>
                <td className="px-5 py-4 text-[14px] text-right">
                  {i > 0 ? (
                    <span className={`${m.profit > monthlyData[i-1].profit ? "text-[#1B5E20]" : "text-[#C62828]"}`}>
                      {m.profit > monthlyData[i-1].profit ? "+" : ""}{((m.profit - monthlyData[i-1].profit) / monthlyData[i-1].profit * 100).toFixed(0)}%
                    </span>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
