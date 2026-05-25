import { Card } from '@/components/ui/Card'

const STEPS = [
  {
    step: 1,
    title: '출발·도착역 선택',
    desc: '「AI 경로 추천」 탭에서 출발역·도착역을 입력하세요. 역명 검색과 즐겨찾기(☆)로 자주 쓰는 역을 빠르게 넣을 수 있습니다. 휠체어·유모차·노약자·일반 중 사용자 유형을 선택하면 추천 가중치가 달라집니다.',
  },
  {
    step: 2,
    title: 'AI 경로 추천',
    desc: '「AI 경로 추천하기」를 누르면 엘리베이터 상태·환승·경로 복잡도·사용자 유형을 반영한 경로가 분석됩니다. 역 간 이동 시간은 역당 약 2분으로 표시됩니다.',
  },
  {
    step: 3,
    title: '지도에서 확인',
    desc: '역 마커 색은 부산 지하철 호선 색(1~4호선)입니다. 마커를 누르면 엘리베이터 상태(정상·일부 장애·고장), 이동 방향, 대체 경로 등 공공데이터 상세가 표시됩니다. 환승역은 같은 위치에 마커가 하나만 보이며, 클릭 시 해당 역의 모든 호선 정보를 함께 볼 수 있습니다.',
  },
  {
    step: 4,
    title: '대체 경로·다른 탭',
    desc: '추천 결과 패널에서 환승·승차 구간과 단계별 대체 엘리베이터 안내를 확인하세요. 「역별 정보」에서는 호선·상태별로 역을 검색하고, 「장애 현황」에서는 엘리베이터 단위 목록을 볼 수 있습니다.',
  },
]

const TABS = [
  { name: 'AI 경로 추천', desc: '검색·지도·추천 결과를 한 화면에서 이용 (모바일은 하단 탭으로 전환)' },
  { name: '역별 정보', desc: '역명·호선·상태 필터로 역 카드 목록 조회, 클릭 시 지도로 이동' },
  { name: '장애 현황', desc: '엘리베이터·경로 단위 장애·대체 경로 유형 상세 테이블' },
  { name: '이용 안내', desc: '서비스 사용법 및 FAQ (현재 화면)' },
]

const FAQ = [
  {
    q: '데이터는 어디서 오나요?',
    a: '부산교통공사 「엘리베이터 고장 시 대체 이동 경로」 공공데이터(ODcloud)를 사용합니다. 배포 환경에서는 Render 백엔드를 통해 안전하게 불러옵니다.',
  },
  {
    q: '지도 마커 색이 고장 여부를 뜻하나요?',
    a: '아닙니다. 마커 색은 1~4호선 공식 상징색이며, 정상·일부 장애·고장은 역을 클릭했을 때 나오는 상세 카드와 「장애 현황」 탭에서 확인할 수 있습니다.',
  },
  {
    q: '「일부 장애」는 어떻게 판단하나요?',
    a: 'API에 별도 “일부 장애” 항목은 없습니다. 경로 이용 가능 여부, 학습라벨(부분·점검 등), 대체경로 유형 등 공공데이터 필드를 조합해 추론하며, “대체” 문구만으로는 일부 장애로 처리하지 않습니다.',
  },
  {
    q: 'AI는 실제 딥러닝 모델인가요?',
    a: '현재는 엘리베이터 상태·환승·복잡도·사용자 유형별 가중치를 반영한 규칙 기반 추천입니다. 추후 ML 모델 연동이 가능한 구조입니다.',
  },
  {
    q: '역별 정보와 장애 현황의 차이는?',
    a: '역별 정보는 역·호선 단위 요약(고장·일부·정상 건수)입니다. 장애 현황은 엘리베이터·경로 단위로 학습라벨·대체 경로 등을 나열합니다.',
  },
  {
    q: '즐겨찾기는 어디에 저장되나요?',
    a: '브라우저 localStorage에 저장되며, 같은 기기·브라우저에서만 유지됩니다. 출발역 입력란 옆 ☆로 추가·삭제할 수 있습니다.',
  },
]

export function GuideView() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900">이용 안내</h2>
        <p className="mt-2 text-sm text-slate-600">
          SafeMetro 부산은 교통약자를 위한 AI 기반 부산 지하철 접근성·엘리베이터
          경로 추천 서비스입니다. 공공데이터를 지도와 함께 제공합니다.
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
            <strong>유의사항:</strong> 2026 부산광역시 공공데이터·AI 활용
            창업경진대회 출품 서비스입니다. 일부 역 좌표·호선 정보는 공공데이터
            오류를 보정해 표시합니다. 실제 이동 전 역사 안내 방송·직원 안내·현장
            표지를 반드시 함께 확인해 주세요.
          </p>
        </Card>
      </div>
    </div>
  )
}
