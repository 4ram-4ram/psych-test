import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { tests } from '../data/tests';
import Header from '../components/Header';

export default function QuizPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const test         = tests.find(t => t.id === id);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers]  = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const blockRef = useRef(null);

  useEffect(() => {
    if (!test) { navigate('/'); return; }
    // questions가 { text, reverse } 객체이므로 text만 추출해 셔플
    const arr = test.questions
      .map((q, i) => ({ q: q.text, i }))
      .sort(() => Math.random() - 0.5);
    setShuffled(arr);
    setAnswers(new Array(test.questions.length).fill(null));
  }, [test, navigate]);

  useEffect(() => {
    if (!blockRef.current) return;
    blockRef.current.classList.add('opacity-0', 'translate-y-2');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        blockRef.current?.classList.remove('opacity-0', 'translate-y-2');
      });
    });
  }, [current]);

  if (!test || shuffled.length === 0) return null;

  const total    = shuffled.length;
  const progress = Math.round(((current + 1) / total) * 100);
  const answered = answers[shuffled[current].i] !== null;

  function select(idx) {
    const next = [...answers];
    next[shuffled[current].i] = idx;
    setAnswers(next);
  }

  function goNext() {
    if (!answered) return;
    if (current < total - 1) {
      setCurrent(c => c + 1);
    } else {
      sessionStorage.setItem('answers', JSON.stringify(answers));
      sessionStorage.setItem('testId', id);
      navigate(`/result/${id}`);
    }
  }

  function goPrev() {
    if (current > 0) setCurrent(c => c - 1);
  }

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      {/* ── 진행 바 ── */}
      <div className="w-full h-1" style={{ background: '#D8E8A0' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: '#1A3320' }}
        />
      </div>

      <main className="flex-1 w-full px-4 md:px-0 max-w-lg mx-auto py-6 md:py-10">

        {/* ── 헤더 정보 ── */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[0.75rem] font-medium" style={{ color: '#8A7A00' }}>
            {test.name}
          </span>
          <span className="text-[0.75rem]" style={{ color: '#9CA3AF' }}>
            <span className="font-bold" style={{ color: '#1A3320' }}>{current + 1}</span>
            {' '}/ {total}
          </span>
        </div>

        {/* ── 질문 블록 ── */}
        <div
          ref={blockRef}
          className="transition-all duration-300 ease-out"
        >
          {/* 질문 */}
          <div
            className="rounded-2xl p-5 md:p-6 mb-4 border"
            style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
          >
            <p
              className="text-[0.65rem] font-bold tracking-[0.12em] mb-3"
              style={{ color: '#8A7A00' }}
            >
              Q{String(current + 1).padStart(2, '0')}
            </p>
            <p
              className="font-serif text-[1rem] md:text-[1.05rem] font-semibold leading-relaxed"
              style={{ color: '#1A3320' }}
            >
              {shuffled[current].q}
            </p>
          </div>

          {/* 선택지 */}
          <div className="flex flex-col gap-2.5 mb-6">
            {test.options.map((opt, i) => {
              const selected = answers[shuffled[current].i] === i;
              return (
                <button
                  key={i}
                  onClick={() => select(i)}
                  className="w-full text-left px-4 py-3.5 rounded-xl border
                             flex items-center gap-3
                             transition-all duration-150 active:scale-[0.99]"
                  style={{
                    background:   selected ? '#F5F8D0' : '#FFFFFF',
                    borderColor:  selected ? '#1A3320' : '#D8E8A0',
                    borderWidth:  selected ? '1.5px' : '1px',
                  }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150"
                    style={{
                      borderColor:  selected ? '#1A3320' : '#D8E8A0',
                      background:   selected ? '#1A3320' : 'transparent',
                    }}
                  >
                    {selected && (
                      <span className="w-2 h-2 rounded-full" style={{ background: '#E8D44D' }} />
                    )}
                  </span>
                  <span
                    className="text-[0.85rem] font-medium"
                    style={{ color: selected ? '#1A3320' : '#374151' }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── 네비게이션 버튼 ── */}
          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={goPrev}
                className="flex-shrink-0 px-5 py-3.5 rounded-xl border text-[0.85rem] font-medium
                           transition-all duration-150 active:scale-[0.98]"
                style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
              >
                ← 이전
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!answered}
              className="flex-1 py-3.5 rounded-xl text-[0.9rem] font-semibold
                         transition-all duration-150 active:scale-[0.98]"
              style={{
                background:  answered ? 'linear-gradient(135deg, #1A3320 0%, #2A4E30 100%)' : '#E5E7EB',
                color:       answered ? '#FFFFFF' : '#9CA3AF',
                cursor:      answered ? 'pointer' : 'not-allowed',
              }}
            >
              {current === total - 1 ? '결과 보기 →' : '다음 →'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}