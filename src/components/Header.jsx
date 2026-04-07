import { useNavigate, useLocation } from 'react-router-dom';

const BACK_ROUTES = {
  '/intro': () => '/',
  '/quiz': (id) => `/intro/${id}`,
  '/result': (id) => `/quiz/${id}`,
};

function getBackTarget(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const base = `/${segments[0]}`;
  const id = segments[1];
  const target = BACK_ROUTES[base];
  if (!target) return null;
  return target(id);
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const backTo = getBackTarget(pathname);

  return (
    <header
      className="sticky top-0 z-50 px-4 md:px-12 h-14 md:h-16
                 flex items-center justify-between"
      style={{ background: '#1A3320' }}
    >
      {/* 서비스명 텍스트 — 홈 이동 */}
      <button
        onClick={() => navigate('/')}
        className="font-serif font-bold tracking-tight text-white
                   active:opacity-70 transition-opacity duration-150"
        style={{ fontSize: '1.05rem' }}
      >
        {/* 사람과 사람 */}
      </button>

      {/* 뒤로가기 버튼 — 홈이 아닐 때만 */}
      {!isHome && backTo && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs
                     px-3 py-1.5 rounded-full
                     active:scale-95 transition-all duration-200"
          style={{ color: '#E8D44D', border: '1px solid rgba(232,212,77,0.35)' }}
        >
          ← <span>목록으로</span>
        </button>
      )}
    </header>
  );
}
