import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { getLineColor } from '@/utils/statusColors'

export function ResultPanel() {
  const routeComparison = useAppStore((s) => s.routeComparison)
  const isRecommending = useAppStore((s) => s.isRecommending)

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

  if (!routeComparison) {
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

  const { recommended, shortest, pathsAreEqual, whyRecommended, comparisonSummary } =
    routeComparison
  const { steps, estimatedMinutes, transferCount, convenienceScore } = recommended

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-y-auto border-l border-slate-100 bg-white p-4 lg:w-[340px] xl:w-[380px]">
      <h2 className="text-base font-bold text-slate-900">AI 추천 결과</h2>

      <div className="mt-3 animate-slide-up rounded-xl border border-green-100 bg-green-50 p-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-green-800">
          <span className="text-base">👍</span>
          <span>
            <strong>추천 경로.</strong> {recommended.aiInsight}
          </span>
        </p>
      </div>

      <Card className="mt-3 p-3">
        <h3 className="text-xs font-bold text-slate-800">경로 비교</h3>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
          {comparisonSummary}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-lg border-2 border-primary-200 bg-primary-50/50 p-2">
            <p className="font-bold text-primary-800">접근성 우선 (추천)</p>
            <p className="mt-1 text-slate-700">
              {recommended.pathStationNames.length}개 역 · {recommended.estimatedMinutes}분 ·
              환승 {recommended.transferCount}회
            </p>
          </div>
          <div
            className={`rounded-lg border p-2 ${
              pathsAreEqual
                ? 'border-slate-200 bg-slate-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <p className="font-bold text-slate-700">최단 경로</p>
            <p className="mt-1 text-slate-600">
              {shortest.pathStationNames.length}개 역 · {shortest.estimatedMinutes}분 · 환승{' '}
              {shortest.transferCount}회
            </p>
            {pathsAreEqual && (
              <p className="mt-1 text-[9px] text-slate-500">추천과 동일</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="mt-3 border-primary-100 bg-primary-50/30 p-3">
        <h3 className="text-xs font-bold text-primary-900">왜 이 경로인가요?</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[10px] leading-relaxed text-primary-900">
          {whyRecommended.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <div className="mt-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">
            {recommended.departureStation}역 → {recommended.arrivalStation}역
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
        <h4 className="text-sm font-bold text-slate-900">경로 상세 (추천)</h4>
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
                    ? getLineColor(step.lineNumber)
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
            <strong>AI 분석 요약.</strong> {recommended.aiSummary}
          </span>
        </p>
      </div>
    </aside>
  )
}
