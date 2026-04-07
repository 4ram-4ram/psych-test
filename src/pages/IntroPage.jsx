import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { tests } from '../data/tests';
import Header from '../components/Header';

export default function IntroPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = tests.find(t => t.id === id);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!test) { navigate('/'); return; }
    requestAnimationFrame(() => {
      contentRef.current?.classList.remove('opacity-0', 'translate-y-4');
    });
  }, [test, navigate]);

  if (!test) return null;

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      <main className="flex-1 w-full px-4 md:px-0 max-w-lg mx-auto py-8 md:py-14">
        <div
          ref={contentRef}
          className="opacity-0 translate-y-4 transition-all duration-600 ease-out"
        >

          {/* ── 아이콘 + 제목 ── */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ background: '#F5F8D0' }}
            >
              {test.icon}
            </div>
            <p
              className="text-[0.68rem] font-bold tracking-[0.14em] mb-2"
              style={{ color: '#8A7A00' }}
            >
              심리검사
            </p>
            <h1
              className="font-serif text-2xl md:text-3xl font-bold tracking-tight"
              style={{ color: '#1A3320' }}
            >
              {test.name}
            </h1>
          </div>

          {/* ── 검사 설명 카드 ── */}
          <div
            className="rounded-2xl p-5 md:p-6 mb-4 border"
            style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
          >
            <p
              className="text-sm leading-relaxed font-light whitespace-pre-line"
              style={{ color: '#374151' }}
            >
              {test.desc}
            </p>
          </div>

          {/* ── 검사 정보 ── */}
          <div
            className="rounded-2xl p-4 md:p-5 mb-6 border grid grid-cols-2"
            style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
          >
            <InfoItem label="문항 수" value={`${test.questions.length}문항`} />
            <InfoItem label="소요 시간" value={test.duration} divider />
          </div>

          {/* ── 유의사항 ── */}
          <div
            className="rounded-xl px-4 py-3 mb-6 flex gap-2.5 items-start"
            style={{ background: '#F5F8D0' }}
          >
            <span className="text-base mt-0.5">💡</span>
            <p className="text-[0.78rem] leading-relaxed" style={{ color: '#1A3320' }}>
              솔직하게 응답할수록 더 정확한 결과를 얻을 수 있습니다.
              정답은 없으니 평소 자신의 모습을 떠올리며 편하게 응답해 주세요.
            </p>
          </div>

          {/* ── 시작 버튼 ── */}
          <button
            onClick={() => navigate(`/test/${test.id}`)}
            className="w-full py-4 rounded-2xl font-semibold text-[0.95rem]
                       tracking-wide transition-all duration-200
                       hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #1A3320 0%, #2A4E30 100%)',
              color: '#FFFFFF',
            }}
          >
            검사 시작하기 →
          </button>

          <p className="text-center text-[0.7rem] mt-4" style={{ color: '#9CA3AF' }}>
            본 검사 결과는 참고 자료이며, 임상적 진단을 대체하지 않습니다.
          </p>

        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value, divider }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-3"
      style={divider ? { borderLeft: '1px solid #D8E8A0' } : {}}
    >
      <span className="text-[0.65rem] font-medium" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-[0.88rem] font-bold" style={{ color: '#1A3320' }}>{value}</span>
    </div>
  );
}
