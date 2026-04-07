import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { tests } from '../data/tests';
import { getLevel, calcResult, generateInterpretation } from '../data/results';
import Header from '../components/Header';

// ── 방사형 그래프 그리기 ──────────────────────────────────────
function drawRadar(canvas, groupScores, groupLabels) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) * 0.62;
  const n = groupLabels.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  ctx.clearRect(0, 0, W, H);

  // 배경 그리드 (5단계)
  for (let step = 1; step <= 5; step++) {
    const r = (R * step) / 5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = cx + r * Math.cos(angle(i));
      const y = cy + r * Math.sin(angle(i));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = step === 5 ? 'rgba(26,51,32,0.15)' : 'rgba(26,51,32,0.08)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = step % 2 === 0 ? 'rgba(245,248,208,0.25)' : 'transparent';
    ctx.fill();
  }

  // 축선
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle(i)), cy + R * Math.sin(angle(i)));
    ctx.strokeStyle = 'rgba(26,51,32,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // 데이터 영역
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const r = (R * groupScores[i]) / 100;
    const x = cx + r * Math.cos(angle(i));
    const y = cy + r * Math.sin(angle(i));
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(26,51,32,0.18)';
  ctx.fill();
  ctx.strokeStyle = '#1A3320';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 데이터 점
  for (let i = 0; i < n; i++) {
    const r = (R * groupScores[i]) / 100;
    const x = cx + r * Math.cos(angle(i));
    const y = cy + r * Math.sin(angle(i));
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1A3320';
    ctx.fill();
    ctx.strokeStyle = '#F5F8D0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 레이블
  const LABEL_PAD = 20;
  ctx.font = `500 ${Math.round(W * 0.035)}px 'Noto Sans KR', sans-serif`;
  ctx.fillStyle = '#1A3320';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const x = cx + (R + LABEL_PAD) * Math.cos(angle(i));
    const y = cy + (R + LABEL_PAD) * Math.sin(angle(i));
    ctx.textAlign =
      Math.abs(Math.cos(angle(i))) < 0.1 ? 'center'
        : Math.cos(angle(i)) > 0 ? 'left' : 'right';
    ctx.fillText(groupLabels[i], x, y);
  }
}

// ── 역채점 적용 점수 계산 ─────────────────────────────────────
function applyReverse(raw, reverse, maxOpt) {
  return reverse ? maxOpt - raw : raw;
}

// ── 그룹별 점수 계산 (0~100) ───────────────────────────────────
function calcGroupScores(test, answers) {
  const maxOpt = Math.max(...test.options.map(o => o.score));
  return test.groups.map(({ indices }) => {
    const groupScores = indices.map(idx => {
      const a = answers[idx];
      if (a === null) return 0;
      const raw = test.options[a].score;
      return applyReverse(raw, test.questions[idx].reverse, maxOpt);
    });
    const { pct } = calcResult(groupScores, indices.length * maxOpt);
    return pct;
  });
}

// ── 전체 점수 계산 (레벨 판정용) ─────────────────────────────
function calcTotalPct(test, answers) {
  const maxOpt = Math.max(...test.options.map(o => o.score));
  const scores = answers.map((a, idx) => {
    if (a === null) return 0;
    const raw = test.options[a].score;
    return applyReverse(raw, test.questions[idx].reverse, maxOpt);
  });
  const { pct } = calcResult(scores, test.questions.length * maxOpt);
  return pct;
}

// ── 컴포넌트 ──────────────────────────────────────────────────
export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = tests.find(t => t.id === id);

  const contentRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const rawAnswers = JSON.parse(sessionStorage.getItem('answers') || '[]');
  const groupScores = test ? calcGroupScores(test, rawAnswers) : [];
  const groupLabels = test ? test.groups.map(g => g.label) : [];
  const pct = test ? calcTotalPct(test, rawAnswers) : 0;
  const level = getLevel(pct);
  const interp = test
    ? generateInterpretation({ id, pct, level, groupLabels, groupScores })
    : '';

  useEffect(() => {
    if (!test || !rawAnswers.length) { navigate('/'); return; }
    requestAnimationFrame(() => {
      contentRef.current?.classList.remove('opacity-0', 'translate-y-4');
      setTimeout(() => setReady(true), 400);
    });
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current || groupScores.length === 0) return;
    const canvas = canvasRef.current;
    const size = canvas.offsetWidth * window.devicePixelRatio;
    canvas.width = size;
    canvas.height = size;
    drawRadar(canvas, groupScores, groupLabels);
  }, [ready]);

  if (!test) return null;

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      <main className="flex-1 w-full px-4 md:px-0 max-w-lg mx-auto py-8 md:py-12">
        <div
          ref={contentRef}
          className="opacity-0 translate-y-4 transition-all duration-600 ease-out"
        >
          {/* ── 타이틀 ── */}
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: '#F5F8D0' }}
            >
              {test.icon}
            </div>
            <p className="text-[0.68rem] font-bold tracking-[0.14em] mb-1" style={{ color: '#8A7A00' }}>
              검사 완료
            </p>
            <h1 className="font-serif text-2xl font-bold tracking-tight mb-3" style={{ color: '#1A3320' }}>
              {test.name} 결과
            </h1>
            <span
              className="inline-block text-[0.72rem] font-bold tracking-wide px-3 py-1 rounded-full"
              style={{ background: level.bg, color: level.text }}
            >
              {level.label}
            </span>
          </div>

          {/* ── 방사형 그래프 ── */}
          <div
            className="rounded-2xl p-4 mb-4 border"
            style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
          >
            <p className="text-[0.7rem] font-bold tracking-[0.1em] mb-3" style={{ color: '#8A7A00' }}>
              영역별 분석
            </p>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', aspectRatio: '1 / 1', display: 'block' }}
            />
          </div>

          {/* ── 해석 ── */}
          <div
            className="rounded-2xl p-5 mb-6 border"
            style={{ background: '#F5F8D0', borderColor: '#D8E8A0' }}
          >
            <p className="text-[0.7rem] font-bold tracking-[0.1em] mb-2" style={{ color: '#8A7A00' }}>
              결과 해석
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#1A3320' }}>
              {interp}
            </p>
          </div>

          {/* ── 버튼 ── */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/test/${id}`)}
              className="w-full py-3.5 rounded-xl text-[0.88rem] font-medium border
                         transition-all duration-150 active:scale-[0.98]"
              style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
            >
              다시 검사하기
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 rounded-xl text-[0.9rem] font-semibold text-white
                         transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1A3320 0%, #2A4E30 100%)' }}
            >
              다른 검사 보기
            </button>
          </div>

          <p className="text-center text-[0.7rem] mt-5" style={{ color: '#9CA3AF' }}>
            본 검사 결과는 참고 자료이며, 임상적 진단을 대체하지 않습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
