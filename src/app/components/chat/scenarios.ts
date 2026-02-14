import type { ChatThread } from "./types";

/* ═══════════════════════════════════════════════
   시나리오 1: 영수증 첨부 → 분석 → 저장
   ═══════════════════════════════════════════════ */
export const receiptScenario: ChatThread = {
  id: "scenario-receipt",
  title: "영수증 지출 입력",
  scenario: "receipt",
  createdAt: new Date("2026-02-14T14:00:00"),
  updatedAt: new Date("2026-02-14T14:02:00"),
  messages: [
    {
      id: "r-1",
      role: "user",
      content: "귀찮아서 그런데요. 영수증 첨부할게요. 지출 내역에 넣어줘요.",
      timestamp: new Date("2026-02-14T14:00:00"),
      attachment: {
        name: "영수증_0214.jpg",
        type: "image",
      },
    },
    {
      id: "r-2",
      role: "assistant",
      content: "영수증을 읽고 있어요…",
      timestamp: new Date("2026-02-14T14:00:05"),
      progress: {
        label: "분석 중…",
        percent: 100,
        done: true,
      },
    },
    {
      id: "r-3",
      role: "assistant",
      content: "영수증을 읽어냈습니다. 아래 내용으로 지출에 저장할까요?",
      timestamp: new Date("2026-02-14T14:00:15"),
      actionCard: {
        title: "이 내용으로 지출에 저장할까요?",
        status: "saved",
        checkLabel: "내용을 확인했고 저장합니다",
        fields: [
          { label: "날짜", value: "2026-02-14", confidence: "확실함" },
          { label: "거래처", value: "○○마트", confidence: "확인 필요" },
          { label: "금액", value: "150,000원", confidence: "확실함" },
          { label: "지출 항목", value: "재료/식자재 (자동 추천)", confidence: "확인 필요" },
          { label: "부가세", value: "포함 (추천)", confidence: "확실함" },
          { label: "결제 방법", value: "카드 (자동)", confidence: "확실함" },
        ],
      },
    },
    {
      id: "r-4",
      role: "assistant",
      content: "저장되었습니다.",
      timestamp: new Date("2026-02-14T14:01:30"),
      summary: {
        items: [
          { label: "이번 달 총 비용", value: "+150,000원", trend: "up" },
          { label: "이번 달 순수익", value: "-150,000원", trend: "down" },
        ],
        actions: [{ label: "지출 내역에서 보기", path: "/revenue" }],
      },
    },
    {
      id: "r-5",
      role: "assistant",
      content: "",
      timestamp: new Date("2026-02-14T14:01:35"),
      duplicate: {
        message: "비슷한 내역이 이미 있어요. 같은 영수증이면 '합치기'를 추천합니다.",
        actions: [
          { label: "합치기", variant: "primary" },
          { label: "새로 저장", variant: "outline" },
        ],
      },
    },
  ],
};

/* ═══════════════════════════════════════════════
   시나리오 2: 분석 + 제안 + 실행
   ═══════════════════════════════════════════════ */
export const analysisScenario: ChatThread = {
  id: "scenario-analysis",
  title: "이번 달 남는 돈이 왜 줄었어?",
  scenario: "analysis",
  createdAt: new Date("2026-02-14T10:00:00"),
  updatedAt: new Date("2026-02-14T10:01:00"),
  messages: [
    {
      id: "a-1",
      role: "user",
      content: "이번 달 남는 돈이 왜 줄었어?",
      timestamp: new Date("2026-02-14T10:00:00"),
    },
    {
      id: "a-2",
      role: "assistant",
      content: "",
      timestamp: new Date("2026-02-14T10:00:08"),
      analysis: {
        title: "이번 달 순수익은 지난달보다 12% 줄었습니다.",
        reasons: [
          "식자재 비용이 8% 늘었습니다.",
          "감귤 체험 인원이 12명 줄었습니다.",
          "환불이 1건 있었습니다 (28,000원).",
        ],
        recommendations: [
          "흑돼지 식사 들어간 비용을 점검해 보세요.",
          "식자재 구매처를 한 번 비교해 보세요.",
          "예약이 약한 날짜에 패키지 구성을 추천합니다.",
        ],
        actions: [
          { label: "상품 비용 점검하기", path: "/products" },
          { label: "식자재 지출 보기", path: "/revenue" },
          { label: "환불 내역 보기", path: "/revenue" },
        ],
        evidence: [
          "02-14 ○○마트 150,000원 (재료/식자재)",
          "02-12 Meta 광고 200,000원 (마케팅)",
          "02-11 환불 -28,000원 (외부 플랫폼)",
        ],
      },
    },
    {
      id: "a-3",
      role: "assistant",
      content: "참고로 '흑돼지 식사' 상품의 현재 상태입니다.",
      timestamp: new Date("2026-02-14T10:00:12"),
      productSnapshot: {
        name: "흑돼지 식사",
        margin: 40,
        target: 45,
        cost: "18,000원",
        revenue: "30,000원",
        warning: true,
      },
    },
  ],
};

/* ═══════════════════════════════════════════════
   시나리오 3: 카드/홈택스 불러오기
   ═══════════════════════════════════════════════ */
export const cardImportScenario: ChatThread = {
  id: "scenario-card-import",
  title: "카드 내역 불러오기",
  scenario: "card-import",
  createdAt: new Date("2026-02-14T11:00:00"),
  updatedAt: new Date("2026-02-14T11:05:00"),
  messages: [
    {
      id: "c-1",
      role: "user",
      content: "이번 달 카드 쓴 내역 불러와줘.",
      timestamp: new Date("2026-02-14T11:00:00"),
    },
    {
      id: "c-2",
      role: "assistant",
      content: "한 번만 연동하면 다음부터 자동으로 불러올 수 있어요.",
      timestamp: new Date("2026-02-14T11:00:05"),
      wizard: {
        title: "카드 연동하기",
        currentStep: 3,
        totalSteps: 3,
        steps: [
          { label: "카드 선택", content: "농협 사업자 카드 (****-1234)", done: true },
          { label: "불러올 내역 확인", content: "2026년 2월 1일 ~ 2월 14일 사용 내역", done: true },
          { label: "연동 완료", content: "연동이 완료되었습니다. 바로 불러올 수 있습니다.", done: true },
        ],
      },
    },
    {
      id: "c-3",
      role: "assistant",
      content: "불러오는 중…",
      timestamp: new Date("2026-02-14T11:01:00"),
      progress: {
        label: "카드 내역 불러오는 중…",
        percent: 100,
        done: true,
      },
    },
    {
      id: "c-4",
      role: "assistant",
      content: "10건 불러왔어요. 자동으로 항목을 나눠두었습니다.",
      timestamp: new Date("2026-02-14T11:01:30"),
      tableResult: {
        title: "카드 사용 내역",
        subtitle: "10건 불러왔어요. 자동으로 항목을 나눠두었습니다.",
        columns: ["날짜", "사용처", "금액", "항목(자동)"],
        rows: [
          ["02-14", "○○마트", "150,000원", "재료/식자재"],
          ["02-13", "○○가스", "85,000원", "시설/가스"],
          ["02-12", "Meta 광고", "200,000원", "마케팅"],
          ["02-10", "배달의민족", "45,000원", "재료/식자재"],
          ["02-09", "네이버 예약", "12,000원", "수수료"],
        ],
        actions: [
          { label: "확인 후 저장", variant: "primary" },
          { label: "항목 바꾸기", variant: "outline" },
        ],
      },
    },
  ],
};

/* ═══ 일반 대화 더미 ═══ */
export const pastThreads: ChatThread[] = [
  {
    id: "t-past-1",
    title: "이번 달 매출이 왜 줄었는지",
    createdAt: new Date("2026-02-13T09:00:00"),
    updatedAt: new Date("2026-02-13T09:00:05"),
    messages: [
      {
        id: "p1-1", role: "user",
        content: "이번 달 돈이 왜 줄었어?",
        timestamp: new Date("2026-02-13T09:00:00"),
      },
      {
        id: "p1-2", role: "assistant",
        content: "",
        timestamp: new Date("2026-02-13T09:00:05"),
        analysis: {
          title: "이번 달 순수익은 지난달보다 12% 줄었습니다.",
          reasons: ["식자재 비용이 8% 늘었습니다.", "감귤 체험 인원이 12명 줄었습니다."],
          recommendations: ["흑돼지 식사 비용을 점검하세요."],
          actions: [{ label: "상품 관리로 이동", path: "/products" }],
          evidence: ["식자재 비용 +8%", "감귤 체험 인원 -12명"],
        },
      },
    ],
  },
  {
    id: "t-past-2",
    title: "재료 주문 시기 확인",
    createdAt: new Date("2026-02-12T14:00:00"),
    updatedAt: new Date("2026-02-12T14:00:05"),
    messages: [
      {
        id: "p2-1", role: "user",
        content: "다음 달 준비해야 할 재료는?",
        timestamp: new Date("2026-02-12T14:00:00"),
      },
      {
        id: "p2-2", role: "assistant",
        content: "3월에는 감귤, 고기, 포장재를 미리 준비하시면 좋겠습니다. 특히 감귤은 4일 후 소진 예상이라 이번 주 안에 주문하셔야 합니다.",
        timestamp: new Date("2026-02-12T14:00:05"),
      },
    ],
  },
  {
    id: "t-past-3",
    title: "가스비 증가 원인 분석",
    createdAt: new Date("2026-02-11T11:00:00"),
    updatedAt: new Date("2026-02-11T11:00:05"),
    messages: [
      {
        id: "p3-1", role: "user",
        content: "비용이 가장 많이 늘어난 항목은?",
        timestamp: new Date("2026-02-11T11:00:00"),
      },
      {
        id: "p3-2", role: "assistant",
        content: "",
        timestamp: new Date("2026-02-11T11:00:05"),
        analysis: {
          title: "가스비가 전월 대비 12%로 가장 많이 늘었습니다.",
          reasons: ["가스비: 375,000원 → 420,000원 (+12%)", "재료비 +8%"],
          recommendations: ["가스 공급사 변경을 검토해 보세요."],
          actions: [{ label: "지출 내역 확인", path: "/revenue" }],
          evidence: ["가스비 +12%", "재료비 +8%", "인건비 +3%"],
        },
      },
    ],
  },
];

/* ═══ AI 더미 응답 매핑 ═══ */
export const AI_RESPONSES: Record<string, Partial<import("./types").ChatMessage>> = {
  "이번 달 남은 돈은?": {
    content: "",
    analysis: {
      title: "이번 달 순수익(남은 돈)은 5,200,000원입니다.",
      reasons: [
        "총 매출 12,000,000원에서 총 비용 6,800,000원을 뺀 금액입니다.",
        "지난달(4,500,000원) 대비 15% 늘었습니다.",
      ],
      recommendations: [
        "식자재 비용을 조금 줄이면 순수익이 더 늘어납니다.",
        "평일 예약을 늘려보세요.",
      ],
      actions: [
        { label: "매출·정산 보기", path: "/revenue" },
        { label: "비용 내역 확인", path: "/revenue" },
      ],
      evidence: [
        "총 매출: 12,000,000원",
        "총 비용: 6,800,000원",
        "순수익: 5,200,000원 (남는 비율 43%)",
      ],
    },
  },
  "남는 비율 낮은 상품": {
    content: "",
    analysis: {
      title: "'흑돼지 식사'가 남는 비율 30%로 가장 낮습니다.",
      reasons: [
        "고기 원가가 전체 비용의 60%를 차지합니다.",
        "최근 식자재 가격 상승의 영향입니다.",
      ],
      recommendations: [
        "단가를 5,000원 올리면 남는 비율이 47%로 회복됩니다.",
        "식자재 구매처를 비교해 보세요.",
      ],
      actions: [
        { label: "상품 비용 점검하기", path: "/products" },
      ],
      evidence: [
        "흑돼지 식사: 판매가 30,000원, 들어간 비용 21,000원",
        "감귤 체험: 판매가 25,000원, 들어간 비용 11,000원",
      ],
    },
  },
  "비용이 늘어난 이유": {
    content: "",
    analysis: {
      title: "이번 달 비용은 전월 대비 3% 늘었습니다.",
      reasons: [
        "식자재 비용이 8% 증가 (224,000원↑)",
        "가스비가 12% 증가 (45,000원↑)",
        "인건비는 3% 소폭 증가",
      ],
      recommendations: [
        "식자재 공급처 2곳 비교 견적을 추천합니다.",
        "가스 절약 방안을 검토해 보세요.",
      ],
      actions: [
        { label: "지출 내역 확인", path: "/revenue" },
        { label: "상품 비용 점검", path: "/products" },
      ],
      evidence: [
        "식자재: 2,600,000원 → 2,824,000원",
        "가스: 375,000원 → 420,000원",
        "인건비: 1,550,000원 → 1,597,000원",
      ],
    },
  },
  "재고 위험 알려줘": {
    content: "",
    analysis: {
      title: "감귤 체험 재료가 4일 후 부족 예상입니다.",
      reasons: [
        "감귤 10kg 박스 현재 3박스 남음",
        "일평균 소비량: 0.7박스",
        "포장 박스도 12일 후 소진 예상",
      ],
      recommendations: [
        "감귤은 이번 주 내로 주문하세요.",
        "포장 박스는 다음 주까지 주문하면 됩니다.",
      ],
      actions: [
        { label: "재고 관리로 이동", path: "/products" },
      ],
      evidence: [
        "감귤: 3박스 남음 → 4일 후 소진",
        "포장 박스: 50개 남음 → 12일 후 소진",
        "흑돼지 고기: 7일분 충분",
      ],
    },
  },
  "정산 예정 금액": {
    content: "",
    analysis: {
      title: "다음 정산일(3월 5일) 예정 금액은 3,480,000원입니다.",
      reasons: [
        "네이버 예약 정산: 2,100,000원",
        "야놀자 정산: 880,000원",
        "직접 예약 미정산: 500,000원",
      ],
      recommendations: [
        "직접 예약 미정산 건을 확인해 주세요.",
        "정산 주기를 월 2회로 변경하면 현금 흐름이 좋아집니다.",
      ],
      actions: [
        { label: "정산 내역 보기", path: "/revenue" },
      ],
      evidence: [
        "네이버 예약: 12건 / 2,100,000원",
        "야놀자: 8건 / 880,000원",
        "직접 예약: 3건 / 500,000원 (미정산)",
      ],
    },
  },
};
