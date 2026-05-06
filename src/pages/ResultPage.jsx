import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { tests } from '../data/tests';
import { getLevel, generateInterpretation } from '../data/results';
import { calcGroupScores, calcTotalPct } from '../lib/scoring';
import { drawRadar } from '../lib/radar';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

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

  // ── 결과 저장 (마운트 시 1회, 새로고침 중복 방지) ──────────────
  useEffect(() => {
    if (!test || !rawAnswers.length) return;
    const guardKey = `saved_${id}`;
    if (sessionStorage.getItem(guardKey)) return;

    supabase
      .from('test_results')
      .insert({ test_id: id, answers: rawAnswers })
      .then(({ error }) => {
        if (error) {
          console.error('[supabase] 결과 저장 실패:', error.message);
          return;
        }
        sessionStorage.setItem(guardKey, '1');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
