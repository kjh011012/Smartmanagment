import { useState, useRef, useCallback } from "react";
import {
  X, Upload, Camera, Image, Check, CheckCircle, AlertTriangle,
  ZoomIn, ZoomOut, ChevronDown, ChevronUp, Smartphone,
  CircleAlert, Loader2
} from "lucide-react";
import { toast } from "sonner";

/* ─── 타입 ─── */
interface ReceiptWizardProps {
  onClose: () => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "analyzing" | "done" | "error";
type FieldStatus = "confirmed" | "needsReview";

interface BatchFile {
  id: number;
  name: string;
  status: "waiting" | "analyzing" | "done" | "current";
}

/* ─── 더미 분석 결과 ─── */
const MOCK_RESULT = {
  date: "2026-02-14",
  vendor: "한라산농산물마트",
  amount: "150,000",
  category: "재료/식자재",
  vatIncluded: true,
  paymentMethod: "카드",
  items: [
    { name: "감귤 10kg", qty: 2, price: 40000 },
    { name: "당근 5kg", qty: 1, price: 15000 },
    { name: "돼지고기 목살", qty: 3, price: 30000 },
    { name: "양파 3kg", qty: 2, price: 8000 },
    { name: "고구마 5kg", qty: 1, price: 12000 },
    { name: "배추 2포기", qty: 1, price: 7000 },
    { name: "대파 1단", qty: 2, price: 5000 },
  ],
};

const FIELD_STATUSES: Record<string, FieldStatus> = {
  date: "confirmed",
  vendor: "needsReview",
  amount: "confirmed",
  category: "confirmed",
  vat: "confirmed",
  payment: "needsReview",
};

const CATEGORIES = [
  "재료/식자재",
  "체험 자재",
  "공과금",
  "유지보수",
  "마케팅",
  "기타",
];

const SUGGESTED_VENDORS = ["한라산농산물마트(본점)", "한라산식자재", "한라산마트"];

const STEP_LABELS = ["올리기", "확인하기", "저장하기"];

/* ─── 컴포넌트 ─── */
export function ReceiptWizard({ onClose }: ReceiptWizardProps) {
  /* 공통 */
  const [step, setStep] = useState(1);

  /* 1단계 */
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [currentBatchIdx, setCurrentBatchIdx] = useState(0);
  const [showPhoneGuide, setShowPhoneGuide] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  /* 2단계 */
  const [formDate, setFormDate] = useState(MOCK_RESULT.date);
  const [formVendor, setFormVendor] = useState(MOCK_RESULT.vendor);
  const [formAmount, setFormAmount] = useState(MOCK_RESULT.amount);
  const [formCategory, setFormCategory] = useState(MOCK_RESULT.category);
  const [formVat, setFormVat] = useState<"included" | "separate">("included");
  const [formPayment, setFormPayment] = useState(MOCK_RESULT.paymentMethod);
  const [showItemBreakdown, setShowItemBreakdown] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [addToInventory, setAddToInventory] = useState(false);
  const [inventoryQty, setInventoryQty] = useState("1");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showHighlight, setShowHighlight] = useState(true);
  const [duplicateDetected] = useState(true);
  const [duplicateAction, setDuplicateAction] = useState<"merge" | "new" | null>(null);
  const [fieldStatuses, setFieldStatuses] = useState(FIELD_STATUSES);
  const [itemGroupMode, setItemGroupMode] = useState<"grouped" | "detail">("grouped");

  /* 3단계 */
  const [saveViewAfter, setSaveViewAfter] = useState(false);
  const [saveContinuous, setSaveContinuous] = useState(false);

  /* ─── 업로드 시뮬레이션 ─── */
  const simulateAnalysis = useCallback(() => {
    setUploadState("uploading");
    setTimeout(() => {
      setUploadState("analyzing");
      setAnalyzeProgress(0);
      let p = 0;
      const timer = setInterval(() => {
        p += Math.random() * 20 + 10;
        if (p >= 100) {
          p = 100;
          clearInterval(timer);
          setTimeout(() => {
            setUploadState("done");
            setStep(2);
          }, 400);
        }
        setAnalyzeProgress(Math.min(p, 100));
      }, 350);
    }, 600);
  }, []);

  const handleFileSelect = useCallback(() => {
    simulateAnalysis();
  }, [simulateAnalysis]);

  const handleBatchSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const batch: BatchFile[] = Array.from(files).map((f, i) => ({
      id: i,
      name: f.name,
      status: i === 0 ? "current" : "waiting",
    }));
    setBatchFiles(batch);
    setBatchMode(true);
    setCurrentBatchIdx(0);
    simulateAnalysis();
  }, [simulateAnalysis]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("idle");
    simulateAnalysis();
  }, [simulateAnalysis]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    setUploadState("idle");
  }, []);

  const handleErrorRetry = () => {
    setUploadState("idle");
  };

  const handleManualInput = () => {
    setFormDate("");
    setFormVendor("");
    setFormAmount("");
    setFormCategory("기타");
    setFormVat("included");
    setFormPayment("카드");
    setFieldStatuses({
      date: "needsReview",
      vendor: "needsReview",
      amount: "needsReview",
      category: "needsReview",
      vat: "needsReview",
      payment: "needsReview",
    });
    setUploadState("done");
    setStep(2);
  };

  const handleSimulateError = () => {
    setUploadState("error");
  };

  /* ─── 저장 ─── */
  const handleSave = () => {
    toast.success("저장되었습니다", {
      style: { background: "#ECF7EE", color: "#1B5E20", border: "1px solid #C8E6C9", fontFamily: "'Noto Serif KR', serif" },
    });

    if (saveContinuous) {
      // 배치 모드일 때 다음 파일
      if (batchMode && currentBatchIdx < batchFiles.length - 1) {
        const updated = [...batchFiles];
        updated[currentBatchIdx].status = "done";
        const nextIdx = currentBatchIdx + 1;
        updated[nextIdx].status = "current";
        setBatchFiles(updated);
        setCurrentBatchIdx(nextIdx);
        setStep(1);
        simulateAnalysis();
      } else {
        setStep(1);
        setUploadState("idle");
        setBatchMode(false);
        setBatchFiles([]);
      }
    } else {
      onClose();
    }
  };

  /* ─── 필드 상태 배지 ─── */
  const StatusBadge = ({ field }: { field: string }) => {
    const s = fieldStatuses[field];
    if (s === "confirmed")
      return (
        <span className="inline-flex items-center gap-1 text-[12px] text-[#1B5E20] bg-[#ECF7EE] px-2.5 py-1 rounded-lg shrink-0">
          <Check size={12} /> 확인 완료
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[12px] text-[#8A6A2B] bg-[#FFF6E6] px-2.5 py-1 rounded-lg shrink-0">
        <CircleAlert size={12} /> 확인 필요
      </span>
    );
  };

  const markConfirmed = (field: string) => {
    setFieldStatuses(prev => ({ ...prev, [field]: "confirmed" }));
  };

  /* ─── 재고 카테고리 체크 ─── */
  const isInventoryCategory = formCategory === "재료/식자재" || formCategory === "체험 자재";

  /* ─── 렌더링: 진행 단계 ─── */
  const renderStepBar = () => (
    <div className="flex items-center gap-0 mt-4">
      {STEP_LABELS.map((label, i) => {
        const sNum = i + 1;
        const isActive = sNum === step;
        const isDone = sNum < step;
        return (
          <div key={sNum} className="flex items-center flex-1">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0 transition-colors ${
                  isDone
                    ? "bg-[#2F4F46] text-white"
                    : isActive
                    ? "bg-[#2F4F46] text-white"
                    : "bg-[#E6E2DB] text-[#9CA3AF]"
                }`}
              >
                {isDone ? <Check size={14} /> : sNum}
              </div>
              <span
                className={`text-[13px] whitespace-nowrap ${
                  isActive ? "text-[#2F4F46]" : isDone ? "text-[#2F4F46]" : "text-[#9CA3AF]"
                }`}
                style={{ fontWeight: isActive ? 700 : 400 }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-[1px] mx-3 ${
                  isDone ? "bg-[#2F4F46]" : "bg-[#E6E2DB]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── 1단계: 올리기 ─── */
  const renderStep1 = () => {
    if (uploadState === "uploading" || uploadState === "analyzing") {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={40} className="text-[#2F4F46] animate-spin mb-5" />
          <p className="text-[16px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>
            읽는 중입니다… 잠시만요
          </p>
          <p className="text-[14px] text-[#9CA3AF] mb-6">영수증의 글자를 분석하고 있어요</p>
          <div className="w-[320px] h-[6px] bg-[#E6E2DB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2F4F46] rounded-full transition-all duration-300"
              style={{ width: `${analyzeProgress}%` }}
            />
          </div>
          <p className="text-[12px] text-[#9CA3AF] mt-2">{Math.round(analyzeProgress)}%</p>
        </div>
      );
    }

    if (uploadState === "error") {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-[520px] bg-[#FDECEC] rounded-xl p-7 text-center">
            <AlertTriangle size={36} className="text-[#C62828] mx-auto mb-4" />
            <p className="text-[16px] text-[#1F2937] mb-2" style={{ fontWeight: 700 }}>
              사진이 흐려서 읽기 어려워요
            </p>
            <p className="text-[14px] text-[#6B7280] mb-6">
              더 선명한 사진으로 다시 올려주세요.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleErrorRetry}
                className="h-[48px] px-6 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer"
              >
                다시 올리기
              </button>
              <button
                onClick={handleManualInput}
                className="h-[48px] px-6 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[14px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
              >
                직접 입력하기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-6">
        {/* 배치 모드 좌측 리스트 */}
        {batchMode && batchFiles.length > 0 && (
          <div className="w-[160px] shrink-0 border-r border-[#E6E2DB] pr-4">
            <p className="text-[12px] text-[#9CA3AF] mb-3" style={{ fontWeight: 700 }}>
              업로드 목록 ({batchFiles.filter(f => f.status === "done").length}/{batchFiles.length})
            </p>
            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {batchFiles.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] ${
                    f.status === "current"
                      ? "bg-[#2F4F46] text-white"
                      : f.status === "done"
                      ? "bg-[#ECF7EE] text-[#1B5E20]"
                      : "bg-[#FBFAF7] text-[#9CA3AF]"
                  }`}
                >
                  {f.status === "done" && <Check size={12} />}
                  {f.status === "current" && <Loader2 size={12} className="animate-spin" />}
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 좌측: 업로드 박스 (60%) */}
        <div className={batchMode ? "flex-1" : "w-[58%]"}>
          <p className="text-[16px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>
            영수증 사진을 올려주세요
          </p>
          <p className="text-[14px] text-[#9CA3AF] mb-5">
            글자가 선명하면 자동 입력이 더 정확해요.
          </p>

          {/* 드래그 앤 드롭 */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              uploadState === "dragging"
                ? "border-[#2F4F46] bg-[#ECF7EE]/30"
                : "border-[#D6D0C8] bg-[#FBFAF7]"
            }`}
          >
            <Upload size={36} className="text-[#D6D0C8] mx-auto mb-3" />
            <p className="text-[15px] text-[#6B7280] mb-1">여기에 끌어다 놓거나</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 h-[48px] px-7 rounded-xl bg-[#2F4F46] text-white text-[14px] hover:bg-[#243f38] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Image size={16} /> 사진/파일 선택
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={() => handleFileSelect()}
            />
            <p className="text-[13px] text-[#9CA3AF] mt-4">
              사진 또는 문서 파일을 올릴 수 있어요 (최대 10메가바이트)
            </p>
          </div>

          {/* 하단 버튼들 */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => batchInputRef.current?.click()}
              className="h-[40px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] hover:bg-[#F7F3ED] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Camera size={14} /> 여러 장 한꺼번에 올리기
            </button>
            <input
              ref={batchInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleBatchSelect}
            />
            <button
              onClick={() => setShowPhoneGuide(true)}
              className="h-[40px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] hover:bg-[#F7F3ED] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Smartphone size={14} /> 휴대폰에서 사진 올리기
            </button>
          </div>

          {/* 휴대폰 안내 */}
          {showPhoneGuide && (
            <div className="mt-4 bg-[#F7F3ED] rounded-xl p-5 relative">
              <button
                onClick={() => setShowPhoneGuide(false)}
                className="absolute top-3 right-3 text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="flex items-start gap-3">
                <Smartphone size={20} className="text-[#2F4F46] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] text-[#1F2937] mb-1" style={{ fontWeight: 700 }}>
                    휴대폰에서 찍은 사진을 여기로 보낼 수 있어요
                  </p>
                  <p className="text-[13px] text-[#6B7280] leading-[1.6]">
                    카카오톡이나 문자로 사진을 보내면 자동으로 올라갑니다.
                    <br />
                    (실제 연동은 설정에서 활성화해 주세요)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 시뮬레이션용 에러 테스트 버튼 (개발용) */}
          {uploadState === "idle" && (
            <button
              onClick={handleSimulateError}
              className="mt-3 text-[12px] text-[#D6D0C8] hover:text-[#9CA3AF] cursor-pointer"
            >
              (분석 실패 테스트)
            </button>
          )}
        </div>

        {/* 우측: 도움 카드 (40%) */}
        {!batchMode && (
          <div className="w-[38%]">
            <div className="bg-[#FBFAF7] rounded-xl p-6 border border-[#E6E2DB]">
              <p className="text-[15px] text-[#1F2937] mb-4" style={{ fontWeight: 700 }}>
                잘 찍는 방법
              </p>
              <div className="space-y-3">
                {[
                  "영수증 전체가 나오게 찍기",
                  "흔들리지 않게 찍기",
                  "어두운 곳 피하기",
                  "구겨진 부분은 펴기",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2.5">
                    <Check size={15} className="text-[#1B5E20] mt-0.5 shrink-0" />
                    <span className="text-[14px] text-[#1F2937] leading-[1.5]">{tip}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#E6E2DB]">
                <p className="text-[13px] text-[#8A6A2B] mb-1" style={{ fontWeight: 700 }}>
                  문제가 생기면?
                </p>
                <p className="text-[13px] text-[#6B7280] leading-[1.6]">
                  사진이 흐리면 자동 입력이 어려울 수 있어요. 그럴 땐 '수정하기'로 고쳐서 저장할 수 있어요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─── 2단계: 확인하기 ─── */
  const renderStep2 = () => (
    <div className="flex gap-6 min-h-[480px]">
      {/* 배치 모드 좌측 리스트 */}
      {batchMode && batchFiles.length > 0 && (
        <div className="w-[140px] shrink-0 border-r border-[#E6E2DB] pr-3">
          <p className="text-[12px] text-[#9CA3AF] mb-3" style={{ fontWeight: 700 }}>
            업로드 목록
          </p>
          <div className="space-y-2 max-h-[440px] overflow-y-auto">
            {batchFiles.map((f) => (
              <div
                key={f.id}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] ${
                  f.status === "current"
                    ? "bg-[#2F4F46] text-white"
                    : f.status === "done"
                    ? "bg-[#ECF7EE] text-[#1B5E20]"
                    : "bg-[#FBFAF7] text-[#9CA3AF]"
                }`}
              >
                {f.status === "done" && <Check size={10} />}
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 좌측 원본 미리보기 (45%) */}
      <div className={batchMode ? "w-[280px] shrink-0" : "w-[43%]"}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>원본 보기</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
              className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[12px] text-[#9CA3AF] w-[36px] text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
              className="w-8 h-8 rounded-lg border border-[#E6E2DB] flex items-center justify-center text-[#6B7280] hover:bg-[#F7F3ED] cursor-pointer"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        {/* 미리보기 영역 */}
        <div className="bg-[#FBFAF7] border border-[#E6E2DB] rounded-xl overflow-hidden" style={{ height: "400px" }}>
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 overflow-auto"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          >
            {/* 더미 영수증 미리보기 */}
            <div className="bg-white w-[220px] rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 text-center relative">
              <p className="text-[11px] text-[#9CA3AF] mb-2">영수증</p>
              <div className="border-b border-dashed border-[#D6D0C8] pb-2 mb-2">
                <p className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>한라산농산물마트</p>
                <p className="text-[11px] text-[#9CA3AF]">제주시 한라로 123</p>
              </div>
              <div className="text-left space-y-1 mb-3">
                {MOCK_RESULT.items.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between text-[10px] text-[#6B7280]">
                    <span>{item.name}</span>
                    <span>{(item.qty * item.price).toLocaleString()}</span>
                  </div>
                ))}
                <p className="text-[10px] text-[#9CA3AF]">…외 2건</p>
              </div>
              <div className="border-t border-dashed border-[#D6D0C8] pt-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#6B7280]" style={{ fontWeight: 700 }}>합계</span>
                  <span className="text-[#1F2937]" style={{ fontWeight: 700 }}>150,000원</span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-1">2026-02-14 14:23</p>
                <p className="text-[10px] text-[#9CA3AF]">신한카드 결제</p>
              </div>

              {/* 하이라이트 표시 */}
              {showHighlight && (
                <>
                  <div className="absolute top-[52px] left-3 right-3 h-[18px] border-2 border-[#2F4F46]/30 rounded-[3px] pointer-events-none" />
                  <div className="absolute bottom-[38px] left-3 right-3 h-[16px] border-2 border-[#2F4F46]/30 rounded-[3px] pointer-events-none" />
                  <div className="absolute bottom-[56px] left-3 right-3 h-[16px] border-2 border-[#1B5E20]/30 rounded-[3px] pointer-events-none" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* 하단 옵션 */}
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHighlight}
              onChange={(e) => setShowHighlight(e.target.checked)}
              className="w-4 h-4 rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer"
            />
            <span className="text-[13px] text-[#6B7280]">글자 영역 표시</span>
          </label>
          <button
            onClick={() => {
              setStep(1);
              setUploadState("idle");
            }}
            className="text-[13px] text-[#2F4F46] hover:underline cursor-pointer"
          >
            다른 사진으로 바꾸기
          </button>
        </div>
      </div>

      {/* 우측 분석 결과 폼 (55%) */}
      <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: "520px" }}>
        {/* 안내 */}
        <div className="bg-[#FFF6E6] rounded-xl px-4 py-3 mb-5 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-[#8A6A2B] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#1F2937] leading-[1.5]">
            자동으로 읽은 내용입니다. <strong>'확인 필요'</strong>가 붙은 항목만 확인해 주세요.
          </p>
        </div>

        {/* 중복 감지 */}
        {duplicateDetected && !duplicateAction && (
          <div className="bg-[#FFF6E6] border border-[#E6D9B8] rounded-xl px-4 py-4 mb-5">
            <div className="flex items-start gap-2.5 mb-3">
              <CircleAlert size={16} className="text-[#8A6A2B] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#1F2937] leading-[1.5]">
                <strong>비슷한 내역이 이미 있어요.</strong> 같은 영수증이면 '합치기'를 추천합니다.
              </p>
            </div>
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => setDuplicateAction("merge")}
                className="h-[38px] px-4 rounded-xl bg-[#2F4F46] text-white text-[13px] hover:bg-[#243f38] transition-colors cursor-pointer"
              >
                기존 내역과 합치기
              </button>
              <button
                onClick={() => setDuplicateAction("new")}
                className="h-[38px] px-4 rounded-xl border border-[#D6D0C8] text-[#6B7280] text-[13px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
              >
                새로 저장하기
              </button>
            </div>
          </div>
        )}

        {duplicateAction === "merge" && (
          <div className="bg-[#ECF7EE] rounded-xl px-4 py-3 mb-5 flex items-center gap-2.5">
            <CheckCircle size={16} className="text-[#1B5E20] shrink-0" />
            <p className="text-[13px] text-[#1B5E20]">
              기존 내역(02.14 한라산농산물마트 150,000원)과 합칩니다.
            </p>
          </div>
        )}

        {/* 필드들 */}
        <div className="space-y-4">
          {/* 1) 날짜 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#6B7280]">날짜</label>
              <StatusBadge field="date" />
            </div>
            <input
              type="date"
              value={formDate}
              onChange={(e) => { setFormDate(e.target.value); markConfirmed("date"); }}
              className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[15px] focus:border-[#2F4F46] focus:outline-none bg-white cursor-pointer"
            />
          </div>

          {/* 2) 거래처 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#6B7280]">거래처 (사용처)</label>
              <StatusBadge field="vendor" />
            </div>
            <input
              value={formVendor}
              onChange={(e) => { setFormVendor(e.target.value); markConfirmed("vendor"); }}
              className="w-full h-[48px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[15px] focus:border-[#2F4F46] focus:outline-none bg-white"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-[12px] text-[#9CA3AF] py-1">비슷한 거래처:</span>
              {SUGGESTED_VENDORS.map((v) => (
                <button
                  key={v}
                  onClick={() => { setFormVendor(v); markConfirmed("vendor"); }}
                  className="text-[12px] text-[#2F4F46] bg-[#ECF7EE] px-3 py-1 rounded-lg hover:bg-[#D4ECD7] cursor-pointer transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 3) 총 금액 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#6B7280]">총 금액</label>
              <StatusBadge field="amount" />
            </div>
            <div className="relative">
              <input
                value={formAmount}
                onChange={(e) => { setFormAmount(e.target.value); markConfirmed("amount"); }}
                className="w-full h-[52px] px-4 rounded-xl border-[1.5px] border-[#D6D0C8] text-[20px] focus:border-[#2F4F46] focus:outline-none bg-white"
                style={{ fontWeight: 700 }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">원</span>
            </div>
          </div>

          {/* 4) 지출 항목 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#6B7280]">지출 항목 (자동 추천)</label>
              <StatusBadge field="category" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFormCategory(cat); markConfirmed("category"); }}
                  className={`h-[48px] rounded-xl text-[14px] transition-all cursor-pointer border ${
                    formCategory === cat
                      ? "border-[#2F4F46] bg-[#2F4F46] text-white"
                      : "border-[#E6E2DB] bg-white text-[#6B7280] hover:bg-[#F7F3ED]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-2">항목이 다르면 눌러서 바꿔주세요.</p>
          </div>

          {/* 5) 부가세 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#6B7280]">부가세 포함 여부</label>
              <StatusBadge field="vat" />
            </div>
            <div className="flex gap-3">
              <label
                className={`flex-1 h-[48px] rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  formVat === "included"
                    ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]"
                    : "border-[#E6E2DB] bg-white text-[#6B7280] hover:bg-[#F7F3ED]"
                }`}
              >
                <input
                  type="radio"
                  name="vat"
                  checked={formVat === "included"}
                  onChange={() => { setFormVat("included"); markConfirmed("vat"); }}
                  className="sr-only"
                />
                <span className="text-[14px]">포함</span>
              </label>
              <label
                className={`flex-1 h-[48px] rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  formVat === "separate"
                    ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]"
                    : "border-[#E6E2DB] bg-white text-[#6B7280] hover:bg-[#F7F3ED]"
                }`}
              >
                <input
                  type="radio"
                  name="vat"
                  checked={formVat === "separate"}
                  onChange={() => { setFormVat("separate"); markConfirmed("vat"); }}
                  className="sr-only"
                />
                <span className="text-[14px]">별도</span>
              </label>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-2">잘 모르겠으면 '포함'을 선택해도 괜찮아요.</p>
          </div>

          {/* 6) 결제 방법 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#6B7280]">결제 방법</label>
              <StatusBadge field="payment" />
            </div>
            <div className="flex gap-3">
              {["카드", "현금", "계좌이체"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setFormPayment(m); markConfirmed("payment"); }}
                  className={`flex-1 h-[48px] rounded-xl text-[14px] transition-all cursor-pointer border ${
                    formPayment === m
                      ? "border-[#2F4F46] bg-[#2F4F46] text-white"
                      : "border-[#E6E2DB] bg-white text-[#6B7280] hover:bg-[#F7F3ED]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 7) 품목 나누기 (접기/펼치기) */}
          <div className="border border-[#E6E2DB] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowItemBreakdown(!showItemBreakdown)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-[#FBFAF7] hover:bg-[#F7F3ED] cursor-pointer transition-colors"
            >
              <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                자세히 보기 (품목 나누기)
              </span>
              {showItemBreakdown ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
            </button>
            {showItemBreakdown && (
              <div className="p-4 border-t border-[#E6E2DB]">
                {/* 묶기 옵션 */}
                <div className="flex gap-3 mb-4">
                  <label
                    className={`flex-1 h-[40px] rounded-lg border flex items-center justify-center gap-2 cursor-pointer text-[13px] transition-all ${
                      itemGroupMode === "grouped"
                        ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]"
                        : "border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
                    }`}
                  >
                    <input type="radio" name="groupMode" checked={itemGroupMode === "grouped"} onChange={() => setItemGroupMode("grouped")} className="sr-only" />
                    대표 항목으로 묶기 (추천)
                  </label>
                  <label
                    className={`flex-1 h-[40px] rounded-lg border flex items-center justify-center gap-2 cursor-pointer text-[13px] transition-all ${
                      itemGroupMode === "detail"
                        ? "border-[#2F4F46] bg-[#ECF7EE] text-[#2F4F46]"
                        : "border-[#E6E2DB] text-[#6B7280] hover:bg-[#F7F3ED]"
                    }`}
                  >
                    <input type="radio" name="groupMode" checked={itemGroupMode === "detail"} onChange={() => setItemGroupMode("detail")} className="sr-only" />
                    품목별로 나누기
                  </label>
                </div>

                {/* 품목 리스트 */}
                {itemGroupMode === "detail" && (
                  <div className="space-y-2">
                    {(showAllItems ? MOCK_RESULT.items : MOCK_RESULT.items.slice(0, 5)).map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 bg-[#FBFAF7] rounded-lg">
                        <span className="text-[13px] text-[#1F2937]">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-[#9CA3AF]">x{item.qty}</span>
                          <span className="text-[13px] text-[#1F2937]" style={{ fontWeight: 700 }}>
                            {(item.qty * item.price).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))}
                    {!showAllItems && MOCK_RESULT.items.length > 5 && (
                      <button
                        onClick={() => setShowAllItems(true)}
                        className="text-[13px] text-[#2F4F46] hover:underline cursor-pointer pl-3"
                      >
                        + 나머지 {MOCK_RESULT.items.length - 5}건 더 보기
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 8) 재고 반영 (조건부) */}
          {isInventoryCategory && (
            <div className="bg-[#FBFAF7] rounded-xl p-4 border border-[#E6E2DB]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToInventory}
                  onChange={(e) => setAddToInventory(e.target.checked)}
                  className="w-5 h-5 rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer"
                />
                <div>
                  <span className="text-[14px] text-[#1F2937]" style={{ fontWeight: 700 }}>재료로 함께 등록하기</span>
                  <span className="text-[13px] text-[#9CA3AF] ml-1">(재고에 더하기)</span>
                </div>
              </label>

              {addToInventory && (
                <div className="mt-4 pl-8 space-y-3">
                  <div>
                    <label className="text-[13px] text-[#6B7280] mb-1 block">재료 선택 (자동 추천)</label>
                    <div className="flex gap-2 flex-wrap">
                      {["감귤", "당근", "돼지고기 목살"].map((item) => (
                        <span key={item} className="text-[12px] text-[#2F4F46] bg-[#ECF7EE] px-3 py-1.5 rounded-lg">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[13px] text-[#6B7280] mb-1 block">수량</label>
                      <input
                        value={inventoryQty}
                        onChange={(e) => setInventoryQty(e.target.value)}
                        className="w-full h-[40px] px-3 rounded-lg border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[13px] text-[#6B7280] mb-1 block">재고 부족 알림 기준</label>
                      <input
                        defaultValue="5"
                        className="w-full h-[40px] px-3 rounded-lg border border-[#D6D0C8] text-[14px] focus:border-[#2F4F46] focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 요약 미니 카드 */}
        <div className="mt-5 bg-[#F7F3ED] rounded-xl p-4 border border-[#E6E2DB]">
          <p className="text-[13px] text-[#6B7280] mb-2" style={{ fontWeight: 700 }}>
            저장하면 이렇게 반영돼요
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#6B7280]">이번 달 총 비용</span>
              <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>+{formAmount || "0"}원</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#6B7280]">이번 달 순수익</span>
              <span className="text-[14px] text-[#C62828]" style={{ fontWeight: 700 }}>-{formAmount || "0"}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── 3단계: 저장하기 ─── */
  const renderStep3 = () => (
    <div className="max-w-[560px] mx-auto py-4">
      {/* 요약 카드 */}
      <div className="bg-white rounded-xl border border-[#E6E2DB] overflow-hidden">
        <div className="px-6 py-4 bg-[#FBFAF7] border-b border-[#E6E2DB]">
          <p className="text-[16px] text-[#1F2937]" style={{ fontWeight: 700 }}>저장 내용 확인</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          {[
            { label: "날짜", value: formDate },
            { label: "거래처", value: formVendor },
            { label: "지출 항목", value: formCategory },
            { label: "총 금액", value: `${formAmount}원`, bold: true },
            { label: "입력 방식", value: "영수증 자동" },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-[#F3EFE8] last:border-0">
              <span className="text-[14px] text-[#6B7280]">{row.label}</span>
              <span
                className={`text-[14px] text-[#1F2937] ${row.bold ? "text-[16px]" : ""}`}
                style={{ fontWeight: row.bold ? 700 : 400 }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="mt-5 bg-[#ECF7EE] rounded-xl px-4 py-3 flex items-center gap-2.5">
        <CheckCircle size={16} className="text-[#1B5E20] shrink-0" />
        <p className="text-[13px] text-[#1B5E20]">이 내역은 '지출 내역'에 저장됩니다.</p>
      </div>

      {/* 저장 옵션 */}
      <div className="mt-5 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={saveViewAfter}
            onChange={(e) => setSaveViewAfter(e.target.checked)}
            className="w-[18px] h-[18px] rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer"
          />
          <span className="text-[14px] text-[#1F2937]">저장 후 지출 내역에서 바로 보기</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={saveContinuous}
            onChange={(e) => setSaveContinuous(e.target.checked)}
            className="w-[18px] h-[18px] rounded border-[#D6D0C8] accent-[#2F4F46] cursor-pointer"
          />
          <span className="text-[14px] text-[#1F2937]">다음 영수증 계속 올리기 (연속 입력)</span>
        </label>
      </div>
    </div>
  );

  /* ─── 메인 렌더 ─── */
  const canGoNext = () => {
    if (step === 1) return uploadState === "done";
    return true;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(60, 55, 45, 0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] border border-[#E6E2DB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col"
        style={{ width: "980px", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── 헤더 (고정) ─── */}
        <div className="px-8 pt-6 pb-4 border-b border-[#E6E2DB] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] text-[#1F2937]" style={{ fontWeight: 700 }}>
              영수증 자동 입력
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F7F3ED] hover:text-[#6B7280] cursor-pointer transition-colors"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>
          {renderStepBar()}
        </div>

        {/* ─── 본문 (스크롤) ─── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* ─── 풋터 (고정) ─── */}
        <div className="px-8 py-4 border-t border-[#E6E2DB] flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="h-[48px] px-7 rounded-xl border border-[#E6E2DB] text-[#6B7280] text-[16px] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              이전
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && uploadState !== "done") return;
                setStep(step + 1);
              }}
              disabled={!canGoNext()}
              className={`h-[48px] px-8 rounded-xl text-[16px] transition-colors cursor-pointer ${
                canGoNext()
                  ? "bg-[#2F4F46] text-white hover:bg-[#243f38]"
                  : "bg-[#D6D0C8] text-white cursor-not-allowed"
              }`}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="h-[48px] px-10 rounded-xl bg-[#2F4F46] text-white text-[16px] hover:bg-[#243f38] transition-colors cursor-pointer"
            >
              저장하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}