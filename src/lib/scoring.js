// 검사 채점 공통 로직
// ResultPage 와 AdminPage(상세 모달) 양쪽에서 같은 결과를 보장하기 위해 분리.
// reverse: false → 부정 문항 (그렇다 = 나쁜 상태) → 원점수 그대로
// reverse: true  → 긍정 문항 (그렇다 = 좋은 상태) → 점수 반전 (MAX - raw)

import { calcResult } from '../data/results';

// ── 역채점 적용 점수 계산 ─────────────────────────────────────
export function applyReverse(raw, reverse, maxOpt) {
  return reverse ? maxOpt - raw : raw;
}

// ── 그룹별 점수 계산 (0~100) ──────────────────────────────────
export function calcGroupScores(test, answers) {
  if (!test?.groups?.length) return [];
  const maxOpt = Math.max(...test.options.map(o => o.score));
  return test.groups.map(({ indices }) => {
    const groupScores = indices.map(idx => {
      const a = answers[idx];
      if (a === null || a === undefined) return 0;
      const raw = test.options[a]?.score ?? 0;
      return applyReverse(raw, test.questions[idx].reverse, maxOpt);
    });
    const { pct } = calcResult(groupScores, indices.length * maxOpt);
    return pct;
  });
}

// ── 전체 점수 계산 (레벨 판정용) ──────────────────────────────
export function calcTotalPct(test, answers) {
  if (!test) return 0;
  const maxOpt = Math.max(...test.options.map(o => o.score));
  const scores = answers.map((a, idx) => {
    if (a === null || a === undefined) return 0;
    const raw = test.options[a]?.score ?? 0;
    return applyReverse(raw, test.questions[idx].reverse, maxOpt);
  });
  const { pct } = calcResult(scores, test.questions.length * maxOpt);
  return pct;
}
