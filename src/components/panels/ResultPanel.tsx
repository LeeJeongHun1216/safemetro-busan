import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { LINE_COLORS } from '@/utils/statusColors'

export function ResultPanel() {
  const { recommendation, isRecommending } = useAppStore()

  if (isRecommending) {
    return (
      <aside className="flex w-full shrink-0 flex-col border-l border-slate-100 bg-white p-4 lg:w-[340px] xl:w-[380px]">
        <h2 className="text-base font-bold text-slate-900">AI 추천 결과</h2>
        <div className="mt-8 flex flex-col items-center gap-4 py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
          <p className="text-sm text-slate-500">AI가 최적 경로를 분석하고 있습니다...</p>
        </div>
      </aside>
    )
  }

  if (!recommendation) {
    return (
      <aside className="flex w-full shrink-0 flex-col border-l border-slate-100 bg-white p-4 lg:w-[340px] xl:w-[380px]">
        <h2 className="text-base font-bold text-slate-900">AI 추천 결과</h2>
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-3xl">🤖</p>
          <p className="mt-3 text-sm font-medium text-slate-700">
            출발역과 도착역을 입력한 후
          </p>
          <p className="mt-1 text-xs text-slate-500">
            AI 경로 추천하기 버튼을 눌러주세요
          </p>
        </div>
      </aside>
    )
  }

  const { steps, estimatedMinutes, transferCount, convenienceScore } =
    recommendation

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-y-auto border-l border-slate-100 bg-white p-4 lg:w-[340px] xl:w-[380px]">
      <h2 className="text-base font-bold text-slate-900">AI 추천 결과</h2>

      <div className="mt-3 animate-slide-up rounded-xl border border-green-100 bg-green-50 p-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-green-800">
          <span className="text-base">👍</span>
          <span>
            <strong>추천 경로.</strong> {recommendation.aiInsight}
          </span>
        </p>
      </div>

      <div className="mt-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            {recommendation.departureStation}역 → {recommendation.arrivalStation}역
          </h3>
          <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            추천 경로
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
          <div className="text-center">
            <p className="text-[10px] text-slate-500">예상 소요 시간</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {estimatedMinutes}분
            </p>
          </div>
          <div className="border-x border-slate-200 text-center">
            <p className="text-[10px] text-slate-500">환승</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {transferCount}회
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500">이동 편의성 점수</p>
            <p className="mt-0.5 text-sm font-bold text-green-600">
              {convenienceScore} / 5.0
            </p>
          </div>
        </div>
      </div>

      <Card className="mt-4 p-4 animate-slide-up">
        <h4 className="text-sm font-bold text-slate-900">경로 상세</h4>
        <ol className="mt-4 space-y-0">
          {steps.map((step, idx) => (
            <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              {idx < steps.length - 1 && (
                <span className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200" />
              )}
              <span
                className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{
                  backgroundColor: step.lineNumber
                    ? LINE_COLORS[step.lineNumber]
                    : '#94a3b8',
                }}
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900">{step.title}</p>
                {step.alert && (
                  <p
                    className={`mt-1 text-[10px] font-medium ${
                      step.alert.level === 'warning'
                        ? 'text-red-600'
                        : step.alert.level === 'success'
                          ? 'text-green-600'
                          : 'text-slate-600'
                    }`}
                  >
                    {step.alert.message}
                  </p>
                )}
                {step.subSteps?.map((sub) => (
                  <p key={sub} className="mt-0.5 text-[10px] text-slate-500">
                    · {sub}
                  </p>
                ))}
                {step.durationMinutes && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    약 {step.durationMinutes}분
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-4 animate-fade-in rounded-xl border border-primary-100 bg-primary-50 p-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-primary-800">
          <span className="text-base">🧠</span>
          <span>
            <strong>AI 분석 요약.</strong> {recommendation.aiSummary}
          </span>
        </p>
      </div>
    </aside>
  )
}
