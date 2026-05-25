import { Card } from '@/components/ui/Card'

const STEPS = [
  {
    step: 1,
    title: '출발·도착역 선택',
    desc: '「AI 경로 추천」 탭에서 출발역·도착역을 입력하세요. 역명 검색과 즐겨찾기(☆)로 자주 쓰는 역을 빠르게 넣을 수 있습니다. 휠체어·유모차·노약자·일반 중 사용자 유형을 선택하면 추천 기준이 달라집니다.',
  },
  {
    step: 2,
    title: 'AI 경로 추천·비교',
    desc: '「AI 경로 추천하기」를 누르면 최단 경로와 접근성 우선 추천 경로를 함께 분석합니다. 「왜 이 경로인가요?」에서 고장·환승·소요 시간 차이를 확인할 수 있고, 예상 소요 시간은 역 간 이동·환승·출입 시간을 합산합니다.',
  },
  {
    step: 3,
    title: '지도에서 확인',
    desc: '역 마커는 1~4호선 공식 색입니다. 추천 후 지도에 호선 색 경로선이 표시되며(다를 때 점선은 최단 경로), 역을 누르면 엘리베이터·대체 경로 상세를 볼 수 있습니다. 환승역은 마커가 하나만 표시되며, 클릭 시 모든 호선 정보를 함께 보여 줍니다.',
  },
  {
    step: 4,
    title: '경로 상세·데이터 갱신',
    desc: '경로 상세에서 환승·호선 이동(○○ 방면)·대체 엘리베이터 안내를 단계별로 확인하세요. 상단 「데이터 새로고침」으로 최신 공공데이터를 불러올 수 있으며, 고장·일부 장애가 있으면 알림 배너가 표시됩니다.',
  },
]

const TABS = [
  {
    name: 'AI 경로 추천',
    desc: '검색·지도·AI 결과 패널(경로 비교·상세). 모바일은 하단 탭으로 화면 전환',
  },
  { name: '역별 정보', desc: '역명·호선·상태 필터, 카드 클릭 시 지도에서 해당 역 표시' },
  { name: '장애 현황', desc: '엘리베이터·경로 단위 장애·대체 경로 유형 목록' },
  { name: '이용 안내', desc: '서비스 사용법·FAQ (현재 화면)' },
]

const FAQ = [
  {
    q: '데이터는 어디서 오나요?',
    a: '부산교통공사 「엘리베이터 고장 시 대체 이동 경로」 공공데이터(ODcloud)입니다. 서비스 상단에서 마지막 갱신 시각을 확인하고 「데이터 새로고침」으로 다시 불러올 수 있습니다.',
  },
  {
    q: '최단 경로와 추천 경로의 차이는?',
    a: '최단 경로는 역 개수·환승을 최소화한 경로입니다. 추천 경로는 엘리베이터 고장·일부 장애·복잡도·사용자 유형 가중치를 반영한 접근성 우선 경로입니다. 두 경로가 다르면 지도에 추천(실선)·최단(점선)이 함께 표시됩니다.',
  },
  {
    q: '지도 마커 색이 고장 여부를 뜻하나요?',
    a: '아닙니다. 마커 색은 호선 상징색이며, 장애 여부는 역 클릭 시 상세 카드와 「장애 현황」에서 확인합니다.',
  },
  {
    q: '「일부 장애」는 어떻게 판단하나요?',
    a: '공공데이터에 별도 항목은 없습니다. 경로 이용 가능 여부, 학습라벨(부분·점검 등), 대체경로 유형을 조합해 추론하며, “대체” 문구만으로는 일부 장애로 처리하지 않습니다.',
  },
  {
    q: '예상 소요 시간은 어떻게 계산되나요?',
    a: '출발·도착 역 출입(각 약 2분), 같은 호선 인접 역 이동(약 1.5분/구간), 환승(약 4분/회), 고장·일부 장애 역 소량 가산을 합산합니다. 실제 대기 시간과는 차이가 있을 수 있습니다.',
  },
  {
    q: 'AI는 실제 딥러닝 모델인가요?',
    a: '현재는 공공데이터와 규칙·가중치 기반 경로 분석입니다. 엘리베이터 상태·환승·복잡도·사용자 유형을 반영해 경로를 추천하고, 이유를 문장으로 설명합니다.',
  },
  {
    q: '역별 정보와 장애 현황의 차이는?',
    a: '역별 정보는 역·호선 단위 요약입니다. 장애 현황은 엘리베이터·경로 단위 상세 목록입니다.',
  },
  {
    q: '요약 숫자(고장·일부 장애)는 어떻게 세나요?',
    a: '공공데이터 원본은 900건 이상이나, 동일 경로·안내가 여러 행으로 들어올 수 있습니다. AI 경로 탭·상단 배너·장애 현황은 같은 기준으로 중복을 통합한 건수를 표시합니다.',
  },
  {
    q: '즐겨찾기는 어디에 저장되나요?',
    a: '브라우저에 저장되며, 같은 기기·브라우저에서만 유지됩니다. 출발역 옆 ☆로 추가·삭제할 수 있습니다.',
  },
]

export function GuideView() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900">이용 안내</h2>
        <p className="mt-2 text-sm text-slate-600">
          SafeMetro 부산은 교통약자를 위한 부산 지하철 접근성·엘리베이터 경로
          추천 서비스입니다. 공공데이터를 지도·경로 비교와 함께 제공합니다.
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
          <h3 className="font-bold text-slate-900">메뉴 구성</h3>
          <ul className="mt-4 space-y-3">
            {TABS.map((tab) => (
              <li key={tab.name} className="text-xs leading-relaxed">
                <span className="font-semibold text-slate-800">{tab.name}</span>
                <span className="text-slate-600"> — {tab.desc}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-6 p-5">
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
            <strong>유의사항:</strong> 일부 역 좌표·호선 정보는 공공데이터 오류를
            보정해 표시합니다. 예상 소요 시간·추천 경로는 참고용이며, 실제 이동
            전 역사 안내 방송·직원 안내·현장 표지를 반드시 함께 확인해 주세요.
          </p>
        </Card>
      </div>
    </div>
  )
}
