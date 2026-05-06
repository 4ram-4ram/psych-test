import { useEffect, useMemo, useRef } from 'react';
import { calcGroupScores, calcTotalPct } from '../lib/scoring';
import { drawRadar } from '../lib/radar';
import { getLevel } from '../data/results';

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ResultDetailModal({ test, answers, createdAt, onClose }) {
  const canvasRef = useRef(null);

  const totalPct = useMemo(() => calcTotalPct(test, answers), [test, answers]);
  const level = useMemo(() => getLevel(totalPct), [totalPct]);
  const groupScores = useMemo(() => calcGroupScores(test, answers), [test, answers]);
  const groupLabels = useMemo(() => test?.groups?.map(g => g.label) ?? [], [test]);

  // 방사형 그래프 그리기
  useEffect(() => {
    if (!canvasRef.current || groupScores.length === 0) return;
    const canvas = canvasRef.current;
    const size = canvas.offsetWidth * window.devicePixelRatio;
    canvas.width = size;
    canvas.height = size;
    drawRadar(canvas, groupScores, groupLabels);
  }, [groupScores, groupLabels]);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!test) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,51,32,0.45)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-5 md:p-6 border"
        style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
                     text-lg leading-none transition-colors"
          style={{ background: '#F5F8D0', color: '#1A3320' }}
          aria-label="닫기"
        >
          ×
        </button>

        {/* 헤더 */}
        <div className="mb-4 pr-8">
          <p className="text-[0.68rem] font-bold tracking-[0.14em] mb-1" style={{ color: '#8A7A00' }}>
            검사 결과 상세
          </p>
          <h2 className="font-serif text-xl font-bold tracking-tight" style={{ color: '#1A3320' }}>
            {test.icon} {test.name}
          </h2>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            {formatDateTime(createdAt)}
          </p>
        </div>

        {/* 최종 점수 */}
        <div
          className="rounded-xl p-4 mb-4 border flex items-center justify-between"
          style={{ background: '#F8FAF2', borderColor: '#D8E8A0' }}
        >
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.14em]" style={{ color: '#8A7A00' }}>
              최종 점수
            </p>
            <p className="font-serif text-2xl font-bold mt-1" style={{ color: '#1A3320' }}>
              {totalPct}
              <span className="text-base font-semibold" style={{ color: '#6B7280' }}> / 100</span>
            </p>
          </div>
          <span
            className="text-[0.72rem] font-bold tracking-wide px-3 py-1.5 rounded-full"
            style={{ background: level.bg, color: level.text }}
          >
            {level.label}
          </span>
        </div>

        {/* 방사형 그래프 */}
        {groupScores.length > 0 && (
          <div
            className="rounded-xl p-4 mb-4 border"
            style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
          >
            <p className="text-[0.7rem] font-bold tracking-[0.1em] mb-3" style={{ color: '#8A7A00' }}>
              영역별 분석
            </p>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', aspectRatio: '1 / 1', display: 'block' }}
            />
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {groupLabels.map((label, i) => (
                <div
                  key={label}
                  className="flex justify-between items-center px-2 py-1 rounded-md text-xs"
                  style={{ background: '#F8FAF2' }}
                >
                  <span style={{ color: '#1A3320' }}>{label}</span>
                  <span className="font-bold" style={{ color: '#1A3320' }}>{groupScores[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 문항별 답변 */}
        <div
          className="rounded-xl p-4 border"
          style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
        >
          <p className="text-[0.7rem] font-bold tracking-[0.1em] mb-3" style={{ color: '#8A7A00' }}>
            문항별 답변 ({test.questions.length}문항)
          </p>
          <ol className="flex flex-col gap-2.5">
            {test.questions.map((q, i) => {
              const answerIdx = answers[i];
              const answerLabel = test.options[answerIdx]?.label ?? '(미응답)';
              return (
                <li
                  key={i}
                  className="rounded-lg p-2.5 border"
                  style={{ borderColor: '#E5E7EB', background: '#F8FAF2' }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex-shrink-0 text-[0.68rem] font-bold w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: '#D8E8A0', color: '#1A3320' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: '#1A3320' }}>
                      {q.text}
                      {q.reverse && (
                        <span
                          className="ml-1.5 text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: '#FEF3C7', color: '#92400E' }}
                          title="역채점 문항"
                        >
                          역
                        </span>
                      )}
                    </p>
                  </div>
                  <p
                    className="text-xs font-semibold mt-1.5 ml-8"
                    style={{ color: '#1A3320' }}
                  >
                    → {answerLabel}
                    <span className="ml-1.5 text-[0.65rem] font-normal" style={{ color: '#6B7280' }}>
                      (선택지 {answerIdx + 1})
                    </span>
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
