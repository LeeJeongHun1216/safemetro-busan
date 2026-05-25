import { Card } from '@/components/ui/Card'

const STEPS = [
  {
    step: 1,
    title: '출발·도착역 선택',
    desc: '좌측 패널에서 출발역과 도착역을 입력하고, 휠체어·노약자·유모차·일반 중 본인에 맞는 사용자 유형을 선택하세요.',
  },
  {
    step: 2,
    title: 'AI 경로 추천',
    desc: '「AI 경로 추천하기」를 누르면 엘리베이터 상태·환승·복잡도를 반영한 최적 경로가 분석됩니다.',
  },
  {
    step: 3,
    title: '지도에서 확인',
    desc: '역 마커 색상으로 정상(초록)·일부 장애(주황)·고장(빨강)을 확인하고, 마커를 클릭하면 상세 정보를 볼 수 있습니다.',
  },
  {
    step: 4,
    title: '대체 경로 안내',
    desc: '고장 구간이 있어도 대체 엘리베이터 경로가 단계별로 안내됩니다. 경로 상세 타임라인을 따라 이동하세요.',
  },
]

const FAQ = [
  {
    q: '데이터는 어디서 오나요?',
    a: '부산교통공사 「엘리베이터 고장 시 대체 이동 경로」 공공데이터를 활용합니다. (공공데이터포털 ODcloud)',
  },
  {
    q: 'AI는 실제 딥러닝 모델인가요?',
    a: '현재는 엘리베이터 상태·환승·복잡도·사용자 유형별 가중치를 반영한 규칙 기반 추천 시스템입니다. 추후 ML 모델 연동이 가능합니다.',
  },
  {
    q: '역별 정보와 장애 현황의 차이는?',
    a: '역별 정보는 역 단위 요약, 장애 현황은 엘리베이터·경로 단위 상세 목록입니다.',
  },
]

export function GuideView() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900">이용 안내</h2>
        <p className="mt-2 text-sm text-slate-600">
          SafeMetro 부산은 교통약자를 위한 AI 기반 지하철 접근성 경로 추천
          서비스입니다.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {STEPS.map((item) => (
            <Card key={item.step} className="p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {item.step}
              </span>
              <h3 className="mt-3 font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-5">
          <h3 className="font-bold text-slate-900">자주 묻는 질문</h3>
          <dl className="mt-4 space-y-4">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-sm font-semibold text-slate-800">{item.q}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="mt-6 border-primary-100 bg-primary-50/50 p-5">
          <p className="text-xs leading-relaxed text-primary-800">
            <strong>문의·제안:</strong> 2026 부산광역시 공공데이터·AI 활용
            창업경진대회 출품 서비스입니다. 실제 이동 전 역사 안내 방송·직원
            안내를 함께 확인해 주세요.
          </p>
        </Card>
      </div>
    </div>
  )
}
