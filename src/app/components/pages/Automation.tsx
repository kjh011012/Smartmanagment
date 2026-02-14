import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { toast } from "sonner";

interface AutoItem {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
  needsLink: boolean;
  linked: boolean;
  hasSettings: boolean;
  settingLabel?: string;
}

const initialItems: AutoItem[] = [
  { id: "cost-calc", label: "예약 시 들어간 비용 자동 계산", desc: "예약이 들어오면 상품에 설정된 비용이 자동으로 차감됩니다", enabled: true, needsLink: false, linked: true, hasSettings: false },
  { id: "receipt-auto", label: "영수증 올리면 자동 입력", desc: "영수증 사진을 올리면 거래처, 금액, 항목이 자동으로 입력됩니다", enabled: true, needsLink: false, linked: true, hasSettings: false },
  { id: "card-auto", label: "카드 사용 내역 자동 불러오기", desc: "연동된 카드의 사용 내역을 매일 자동으로 불러옵니다", enabled: false, needsLink: true, linked: false, hasSettings: true, settingLabel: "불러오기 시간 설정" },
  { id: "homtax-auto", label: "홈택스 자료 자동 정리", desc: "홈택스에서 세금계산서와 카드 매입 자료를 자동으로 정리합니다", enabled: false, needsLink: true, linked: false, hasSettings: true, settingLabel: "정리 주기 설정" },
  { id: "stock-alert", label: "재고 부족 알림", desc: "재료 재고가 부족할 것으로 예상되면 알림을 보냅니다", enabled: true, needsLink: false, linked: true, hasSettings: true, settingLabel: "알림 기준일 설정" },
  { id: "margin-alert", label: "남는 비율 기준 이하 경고", desc: "상품의 남는 비율이 설정한 기준 아래로 내려가면 경고합니다", enabled: true, needsLink: false, linked: true, hasSettings: true, settingLabel: "기준값 변경" },
  { id: "monthly-report", label: "월간 보고서 자동 생성", desc: "매달 1일에 지난달 경영 보고서를 자동으로 만들어 드립니다", enabled: true, needsLink: false, linked: true, hasSettings: false },
];

export function Automation() {
  const [items, setItems] = useState(initialItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [marginThreshold, setMarginThreshold] = useState("45");
  const [stockDays, setStockDays] = useState("5");

  const toggleItem = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (item.needsLink && !item.linked) {
          toast("연동이 필요합니다. '지출 자동 입력' 화면에서 연동해 주세요.", { duration: 3000 });
          return item;
        }
        const newEnabled = !item.enabled;
        toast.success(newEnabled ? "자동화가 켜졌습니다" : "자동화가 꺼졌습니다");
        return { ...item, enabled: newEnabled };
      }
      return item;
    }));
  };

  return (
    <div className="max-w-[860px] space-y-5">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-[14px] border border-[#E6E2DB] shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-[#1F2937]">{item.label}</h3>
                  {item.needsLink && !item.linked && (
                    <span className="text-[11px] text-[#8A6A2B] bg-[#FFF6E6] px-2 py-0.5 rounded">연동 필요</span>
                  )}
                </div>
                <p className="text-[14px] text-[#6B7280] mt-2 leading-[1.6]">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-[52px] h-[28px] rounded-full relative transition-colors cursor-pointer shrink-0 mt-1 ${
                  item.enabled ? "bg-[#2F4F46]" : "bg-[#D6D0C8]"
                }`}
              >
                <div className={`w-[24px] h-[24px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${
                  item.enabled ? "right-[2px]" : "left-[2px]"
                }`} />
              </button>
            </div>

            {item.hasSettings && (
              <div className="mt-3">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="text-[13px] text-[#2F4F46] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Settings size={13} />
                  {item.settingLabel || "설정하기"}
                  <ChevronDown size={13} className={`transition-transform ${expandedId === item.id ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {expandedId === item.id && (
            <div className="px-6 pb-6 pt-0 border-t border-[#F3EFE8]">
              <div className="pt-4">
                {item.id === "margin-alert" && (
                  <div className="flex items-center gap-4">
                    <label className="text-[14px] text-[#6B7280]">기준 남는 비율</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={marginThreshold}
                        onChange={e => setMarginThreshold(e.target.value)}
                        className="w-[80px] h-[40px] px-3 rounded-lg border border-[#D6D0C8] text-[14px] text-center focus:border-[#2F4F46] focus:outline-none"
                      />
                      <span className="text-[14px] text-[#6B7280]">% 이하일 때 경고</span>
                    </div>
                    <button onClick={() => toast.success("저장되었습니다")} className="h-[40px] px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer">저장</button>
                  </div>
                )}
                {item.id === "stock-alert" && (
                  <div className="flex items-center gap-4">
                    <label className="text-[14px] text-[#6B7280]">알림 기준일</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={stockDays}
                        onChange={e => setStockDays(e.target.value)}
                        className="w-[80px] h-[40px] px-3 rounded-lg border border-[#D6D0C8] text-[14px] text-center focus:border-[#2F4F46] focus:outline-none"
                      />
                      <span className="text-[14px] text-[#6B7280]">일 전에 알림</span>
                    </div>
                    <button onClick={() => toast.success("저장되었습니다")} className="h-[40px] px-4 rounded-lg bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer">저장</button>
                  </div>
                )}
                {item.id === "card-auto" && (
                  <div className="flex items-center gap-4">
                    <label className="text-[14px] text-[#6B7280]">자동 불러오기 시간</label>
                    <select className="h-[40px] pl-3 pr-8 rounded-lg border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer">
                      <option>매일 오전 8시</option>
                      <option>매일 오후 6시</option>
                      <option>매일 자정</option>
                    </select>
                  </div>
                )}
                {item.id === "homtax-auto" && (
                  <div className="flex items-center gap-4">
                    <label className="text-[14px] text-[#6B7280]">정리 주기</label>
                    <select className="h-[40px] pl-3 pr-8 rounded-lg border border-[#D6D0C8] bg-white text-[14px] appearance-none cursor-pointer">
                      <option>매주 월요일</option>
                      <option>매월 1일</option>
                      <option>매일</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
