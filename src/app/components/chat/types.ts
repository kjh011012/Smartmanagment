/* ═══ 채팅 시스템 공통 타입 ═══ */

export type MessageRole = "user" | "assistant" | "system";
export type ConfidenceLevel = "확실함" | "확인 필요";
export type CardStatus = "idle" | "confirmed" | "saved" | "cancelled";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  /* 분석형 답변 */
  analysis?: AnalysisData;
  /* 실행 카드 */
  actionCard?: ActionCardData;
  /* 첨부 파일 */
  attachment?: AttachmentData;
  /* 진행 상태 */
  progress?: ProgressData;
  /* 연동 마법사 */
  wizard?: WizardData;
  /* 테이블 결과 */
  tableResult?: TableResultData;
  /* 간단 요약(저장 후) */
  summary?: SummaryData;
  /* 중복 감지 */
  duplicate?: DuplicateData;
  /* 상품 스냅샷 */
  productSnapshot?: ProductSnapshotData;
}

export interface AnalysisData {
  title: string;
  reasons: string[];
  recommendations: string[];
  actions: { label: string; path: string }[];
  evidence: string[];
}

export interface ActionCardData {
  title: string;
  fields: { label: string; value: string; confidence: ConfidenceLevel }[];
  status: CardStatus;
  checkLabel?: string;
}

export interface AttachmentData {
  name: string;
  type: "image" | "document";
  thumbnail?: string;
}

export interface ProgressData {
  label: string;
  percent: number;
  done: boolean;
}

export interface WizardData {
  title: string;
  currentStep: number;
  totalSteps: number;
  steps: { label: string; content: string; done: boolean }[];
}

export interface TableResultData {
  title: string;
  subtitle: string;
  columns: string[];
  rows: string[][];
  actions: { label: string; variant: "primary" | "outline" }[];
}

export interface SummaryData {
  items: { label: string; value: string; trend?: "up" | "down" }[];
  actions: { label: string; path: string }[];
}

export interface DuplicateData {
  message: string;
  actions: { label: string; variant: "primary" | "outline" }[];
}

export interface ProductSnapshotData {
  name: string;
  margin: number;
  target: number;
  cost: string;
  revenue: string;
  warning: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  scenario?: "receipt" | "analysis" | "card-import";
}
