// 검사 출처표시 컴포넌트
// 각 검사(test) 객체에 source 정보가 있을 때만 IntroPage 하단에 표기된다.
//
// 두 가지 모드:
//  - 공공누리 모드: source.koglType (1~4) 있으면 공공누리 마크 + 유형 문구 표시
//  - 학술/일반 모드: koglType 없으면 마크·공공누리 문구 없이 "출처: …"만 표시
//
// source 양식:
//   source: {
//     title:    '저작물명',     // 예: 대인관계 문제 원인 검사 / 한국형 불안 선별도구 (MHS:A)
//     org:      '제공기관/개발기관', // 예: 한국청소년상담복지개발원 / 고려대학교 KU 마음건강연구소
//     sponsor:  '개발/후원 …',  // 개발·후원 기관 (선택)
//     reference:'원척도/원전 학술 출처 …', // 학술 인용 (선택)
//     year:     '2020',         // 작성연도 (선택)
//     koglType: 4,              // 공공누리 유형 1~4 (있을 때만 공공누리 표기)
//   }

const KOGL_CONDITIONS = {
  1: '출처표시',
  2: '출처표시 + 상업적 이용금지',
  3: '출처표시 + 변경금지',
  4: '출처표시 + 상업적 이용금지 + 변경금지',
};

export default function SourceAttribution({ source }) {
  if (!source || !source.title) return null;

  const { title, org, sponsor, reference, year, koglType } = source;
  const isKogl = !!koglType;

  return (
    <div className="mt-6 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
      {isKogl ? (
        <>
          {/* 공공누리 유형 마크 — /public/kogl/type{N}.jpg 에 두면 표시됨 (없으면 자동 숨김) */}
          <img
            src={`/kogl/type${koglType}.jpg`}
            alt={`공공누리 제${koglType}유형`}
            className="block w-44 h-auto mb-2"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <p className="text-[0.68rem] leading-relaxed" style={{ color: '#9CA3AF' }}>
            『{title}』{org ? `(제공기관: ${org})` : ''}은(는) “공공누리 제{koglType}유형:{' '}
            {KOGL_CONDITIONS[koglType] ?? KOGL_CONDITIONS[1]}” 조건에 따라 이용할 수 있습니다.
            {year ? ` (${year} 작성)` : ''}
          </p>
        </>
      ) : (
        <p className="text-[0.68rem] leading-relaxed" style={{ color: '#9CA3AF' }}>
          출처: 『{title}』{org ? ` · ${org}` : ''}
        </p>
      )}

      {sponsor && (
        <p className="text-[0.66rem] leading-relaxed mt-0.5" style={{ color: '#9CA3AF' }}>
          {sponsor}
        </p>
      )}
      {reference && (
        <p className="text-[0.66rem] leading-relaxed mt-0.5" style={{ color: '#9CA3AF' }}>
          {isKogl ? '원척도 출처' : '원전'}: {reference}
        </p>
      )}
    </div>
  );
}
