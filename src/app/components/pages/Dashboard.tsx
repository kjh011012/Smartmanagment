import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, Check, AlertTriangle, ArrowRight, Clock, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const kpis = [
  { label: "오늘 예약 건수", value: "18", unit: "건", trend: "+3건", up: true },
  { label: "오늘 예상 매출", value: "1,320,000", unit: "원", trend: "전월 대비 +12%", up: true },
  { label: "이번 달 총 매출", value: "12,000,000", unit: "원", trend: "전월 대비 +8%", up: true },
  { label: "이번 달 총 비용", value: "6,800,000", unit: "원", trend: "전월 대비 +3%", up: false },
  { label: "이번 달 순수익", value: "5,200,000", unit: "원", trend: "전월 대비 +15%", up: true },
  { label: "평균 남는 비율", value: "43", unit: "%", trend: "전월 대비 +2%p", up: true },
];

const chartData = [
  { month: "9월", value: 3800000 },
  { month: "10월", value: 4200000 },
  { month: "11월", value: 4600000 },
  { month: "12월", value: 3900000 },
  { month: "1월", value: 4500000 },
  { month: "2월", value: 5200000 },
];

const schedules = [
  { time: "10:00", product: "감귤 따기 체험", people: "8명" },
  { time: "13:00", product: "흑돼지 식사", people: "12" },
  { time: "15:00", product: "한옥 숙박 체크인", people: "3팀" },
];

const activities = [
  { time: "15:12", text: "영수증 자동 입력 완료 (○○마트 150,000원)", type: "success" },
  { time: "14:30", text: "예약 접수 (감귤 체험 4명)", type: "info" },
  { time: "13:10", text: "카드 사용 내역 불러오기 완료", type: "success" },
  { time: "11:05", text: "정산 예정 금액 업데이트", type: "info" },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* KPI 카드 */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#E6E2DB] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[120px]">
            <p className="text-[13px] text-[#6B7280] mb-3">{kpi.label}</p>
            <p className="text-[#1F2937] tracking-[-0.2px] leading-tight">
              <span className="text-[22px]" style={{ fontWeight: 900 }}>{kpi.value}</span>
              <span className="text-[14px] text-[#6B7280] ml-1" style={{ fontWeight: 400 }}>{kpi.unit}</span>
            </p>
            <div className={`flex items-center gap-1 mt-2 text-[13px] ${kpi.up ? "text-[#1B5E20]" : "text-[#C62828]"}`}>
              {kpi.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* 중단 2열 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 스마트 분석 요약 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">스마트 분석 요약</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Check size={18} className="text-[#1B5E20] mt-0.5 shrink-0" />
              <p className="text-[15px] text-[#1F2937] leading-[1.6]">이번 달 가장 수익이 높은 상품은 <strong>'감귤 체험'</strong>입니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <Check size={18} className="text-[#1B5E20] mt-0.5 shrink-0" />
              <p className="text-[15px] text-[#1F2937] leading-[1.6]">식자재 비용이 지난달보다 <strong>8%</strong> 늘었습니다.</p>
            </div>
            <div className="flex items-start gap-3">
              <Check size={18} className="text-[#1B5E20] mt-0.5 shrink-0" />
              <p className="text-[15px] text-[#1F2937] leading-[1.6]">다음 달 매출은 늘어날 가능성이 있습니다.</p>
            </div>
            <div className="flex items-start gap-3 bg-[#FFF6E6] px-3 py-3 rounded-lg -mx-1">
              <AlertTriangle size={18} className="text-[#8A6A2B] mt-0.5 shrink-0" />
              <p className="text-[15px] text-[#1F2937] leading-[1.6]"><strong>'흑돼지 식사'</strong>는 남는 비율이 낮습니다. 가격 또는 비용을 확인해 주세요.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/smart-center")}
            className="mt-5 h-[44px] px-5 rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            자세히 보기 <ArrowRight size={14} />
          </button>
        </div>

        {/* 이번 달 수익 구조 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">이번 달 수익 구조</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2">
              <span className="text-[15px] text-[#6B7280]">총 매출</span>
              <span className="text-[18px] font-bold text-[#1F2937]">12,000,000원</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#E6E2DB]">
              <span className="text-[15px] text-[#6B7280]">들어간 비용</span>
              <span className="text-[18px] font-bold text-[#1F2937]">6,800,000원</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[15px] font-bold text-[#1F2937]">남은 금액</span>
              <span className="text-[24px] font-black text-[#1F2937] tracking-[-0.2px] leading-tight">5,200,000원</span>
            </div>
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`${(value / 10000).toFixed(0)}만원`, "남은 금액"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6E2DB", fontSize: 13, fontFamily: "'Noto Serif KR', serif" }}
                />
                <Bar dataKey="value" fill="#2F4F46" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 하단 2열 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 오늘 일정 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5 flex items-center gap-2">
            <Clock size={18} className="text-[#6B7280]" /> 오늘 일정
          </h2>
          <div className="space-y-4">
            {schedules.map((s, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-[#F3EFE8] last:border-0">
                <span className="text-[16px] font-bold text-[#2F4F46] w-[56px]">{s.time}</span>
                <span className="text-[15px] text-[#1F2937] flex-1">{s.product}</span>
                <span className="text-[14px] text-[#6B7280] bg-[#F7F3ED] px-3 py-1 rounded-lg">{s.people}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/operations")}
            className="mt-5 h-[44px] px-5 rounded-xl border-[1.5px] border-[#2F4F46] text-[#2F4F46] text-[14px] flex items-center gap-2 hover:bg-[#F7F3ED] transition-colors cursor-pointer"
          >
            운영 관리로 이동 <ArrowRight size={14} />
          </button>
        </div>

        {/* 최근 활동 기록 */}
        <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-bold text-[#1F2937] mb-5 flex items-center gap-2">
            <Activity size={18} className="text-[#6B7280]" /> 최근 활동 기록
          </h2>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-4 py-2 border-b border-[#F3EFE8] last:border-0">
                <span className="text-[14px] text-[#9CA3AF] w-[48px] shrink-0">{a.time}</span>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === "success" ? "bg-[#1B5E20]" : "bg-[#6B7280]"}`} />
                  <p className="text-[14px] text-[#1F2937] leading-[1.5]">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => navigate("/expense-input")} className="h-[40px] px-4 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[13px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              지출 자동 입력
            </button>
            <button onClick={() => navigate("/revenue")} className="h-[40px] px-4 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[13px] hover:bg-[#F7F3ED] transition-colors cursor-pointer">
              매출·정산
            </button>
          </div>
        </div>
      </div>

      {/* 처음 시작하기 */}
      <div className="bg-white rounded-[14px] border border-[#E6E2DB] p-7 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-bold text-[#1F2937] mb-5">처음 시작하기 (3단계)</h2>
        <div className="grid grid-cols-3 gap-5">
          {[
            { step: 1, label: "카드/홈택스 연동하기", done: false, path: "/expense-input" },
            { step: 2, label: "상품별 들어간 비용 설정하기", done: false, path: "/products" },
            { step: 3, label: "자동화 켜기", done: true, path: "/automation" },
          ].map(s => (
            <button
              key={s.step}
              onClick={() => navigate(s.path)}
              className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all cursor-pointer ${
                s.done ? "border-[#1B5E20] bg-[#ECF7EE]" : "border-[#E6E2DB] hover:bg-[#F7F3ED]"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] shrink-0 ${
                s.done ? "bg-[#1B5E20] text-white" : "bg-[#F7F3ED] text-[#6B7280]"
              }`}>
                {s.done ? <Check size={16} /> : s.step}
              </div>
              <span className={`text-[14px] ${s.done ? "text-[#1B5E20]" : "text-[#1F2937]"}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}