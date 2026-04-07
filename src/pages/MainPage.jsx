import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { tests } from '../data/tests';
import Header from '../components/Header';

// B: 딥 포레스트 #1A3320 + 레몬 옐로 #E8D44D
const cardTheme = {
  num: 'text-[#8A7A00]',
  border: 'hover:border-[#E8D44D]',
  arrow: 'bg-[#E8D44D]',
  tint: 'bg-[#F5F8D0]',
  icon: 'bg-[#F5F8D0]',
  arrowText: 'text-[#1A3320]',
};

export default function MainPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    requestAnimationFrame(() => {
      heroRef.current?.classList.remove('opacity-0', 'translate-y-4');
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        setTimeout(() => card.classList.remove('opacity-0', 'translate-y-5'), 260 + i * 90);
      });
    });
  }, []);

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      {/* Hero */}
      <div
        className="w-full py-10 md:py-16 px-4 text-center"
        style={{ background: 'linear-gradient(160deg, #1A3320 0%, #2A4E30 100%)' }}
      >
        <section
          ref={heroRef}
          className="max-w-lg mx-auto opacity-0 translate-y-4 transition-all duration-700 ease-out"
        >
          <span
            className="inline-block text-[0.68rem] font-semibold tracking-[0.1em] px-3.5 py-1.5 rounded-full mb-5"
            style={{ color: '#E8D44D', border: '1px solid rgba(232,212,77,0.35)' }}
          >
            온라인 심리검사 서비스
          </span>
          <h1 className="font-serif text-[1.75rem] md:text-4xl font-bold leading-snug tracking-tight mb-4 text-white">
            마음을 이해하는<br />
            <em className="not-italic" style={{ color: '#E8D44D' }}>첫걸음</em>
          </h1>
          <p className="text-sm md:text-[0.95rem] text-white/55 leading-loose font-light">
            아동·청소년의 심리적 건강을 위한<br className="hidden md:block" />
            전문 심리검사를 제공합니다.
          </p>
        </section>
      </div>

      {/* Cards */}
      <main className="flex-1 w-full px-4 md:px-8 lg:px-0 max-w-2xl lg:max-w-4xl mx-auto py-6 md:py-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {tests.map((test, i) => (
            <button
              key={test.id}
              ref={el => (cardRefs.current[i] = el)}
              onClick={() => navigate(`/intro/${test.id}`)}
              className={[
                'group relative text-left bg-white border border-stone-200 rounded-2xl',
                'px-5 py-5 md:px-6 md:py-6 overflow-hidden w-full',
                'transition-all duration-250 ease-out',
                'hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]',
                'opacity-0 translate-y-5',
                cardTheme.border,
              ].join(' ')}
            >
              <div className={`absolute inset-0 rounded-2xl pointer-events-none
                               opacity-0 group-hover:opacity-100 transition-opacity duration-250
                               ${cardTheme.tint}`} />
              <div className="relative z-10 flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${cardTheme.icon}`}>
                  {test.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[0.62rem] font-bold tracking-[0.14em] mb-1 ${cardTheme.num}`}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h2
                    className="font-serif text-[1.05rem] md:text-[1.1rem] font-bold tracking-tight mb-1.5 leading-snug"
                    style={{ color: '#1A3320' }}
                  >
                    {test.name}
                  </h2>
                  <p
                    className="text-[0.78rem] leading-relaxed font-light line-clamp-2"
                    style={{ color: '#6B7280' }}
                  >
                    {test.shortDesc}
                  </p>
                </div>
                <div className={`flex-shrink-0 self-center w-8 h-8 rounded-full
                                  flex items-center justify-center text-sm font-bold
                                  opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                                  transition-all duration-200 ${cardTheme.arrow} ${cardTheme.arrowText}`}>
                  →
                </div>
              </div>
            </button>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer
        className="flex flex-col items-center gap-3 px-6 py-8 border-t"
        style={{ borderColor: '#D8E8A0' }}
      >
        <img
          src="/logo1.png"
          alt="사람과 사람"
          className="h-8 w-auto object-contain"
        />
        <p className="text-[0.72rem]" style={{ color: '#9CA3AF' }}>
          본 검사 결과는 참고 자료이며, 임상적 진단을 대체하지 않습니다.
        </p>
      </footer>
    </div>
  );
}
