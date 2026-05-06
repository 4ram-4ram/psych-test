import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tests } from '../data/tests';
import { supabase } from '../lib/supabase';
import { calcGroupScores, calcTotalPct } from '../lib/scoring';
import { getLevel } from '../data/results';
import Header from '../components/Header';
import ResultDetailModal from '../components/ResultDetailModal';

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

export default function AdminPage() {
  const navigate = useNavigate();

  // 인증 체크
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setAuthChecked(true);
    });
  }, [navigate]);

  // 필터
  const [selectedTestId, setSelectedTestId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // 데이터
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // 모달
  const [openRow, setOpenRow] = useState(null);

  // tests.js → id 로 빠르게 찾기 위한 맵
  const testMap = useMemo(() => {
    const m = new Map();
    tests.forEach(t => m.set(t.id, t));
    return m;
  }, []);

  async function fetchRows() {
    if (!authChecked) return;
    setLoading(true);
    setErrMsg('');

    let query = supabase
      .from('test_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (selectedTestId) query = query.eq('test_id', selectedTestId);
    if (startTime) query = query.gte('created_at', new Date(startTime).toISOString());
    if (endTime)   query = query.lte('created_at', new Date(endTime).toISOString());

    const { data, error } = await query;
    setLoading(false);

    if (error) {
      setErrMsg(`조회 실패: ${error.message}`);
      setRows([]);
      return;
    }
    setRows(data ?? []);
  }

  useEffect(() => {
    if (authChecked) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, selectedTestId, startTime, endTime]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAF2' }}>
        <p className="text-sm" style={{ color: '#6B7280' }}>인증 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      <main className="flex-1 w-full px-4 md:px-0 max-w-3xl mx-auto py-6 md:py-10">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.14em] mb-1" style={{ color: '#8A7A00' }}>
              ADMIN
            </p>
            <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: '#1A3320' }}>
              검사 결과 통계
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-2 rounded-lg border transition-colors"
            style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
          >
            로그아웃
          </button>
        </div>

        {/* 필터 바 */}
        <div
          className="rounded-2xl p-4 mb-4 border"
          style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-bold tracking-wide" style={{ color: '#8A7A00' }}>
                검사 종류
              </span>
              <select
                value={selectedTestId}
                onChange={e => setSelectedTestId(e.target.value)}
                className="px-3 py-2 rounded-lg border outline-none text-sm"
                style={{ borderColor: '#D8E8A0', background: '#F8FAF2' }}
              >
                <option value="">전체</option>
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-bold tracking-wide" style={{ color: '#8A7A00' }}>
                시작 시간
              </span>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="px-3 py-2 rounded-lg border outline-none text-sm"
                style={{ borderColor: '#D8E8A0', background: '#F8FAF2' }}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-bold tracking-wide" style={{ color: '#8A7A00' }}>
                종료 시간
              </span>
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="px-3 py-2 rounded-lg border outline-none text-sm"
                style={{ borderColor: '#D8E8A0', background: '#F8FAF2' }}
              />
            </label>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: '#F0F0F0' }}>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              {loading ? '불러오는 중...' : `총 ${rows.length}건`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedTestId(''); setStartTime(''); setEndTime(''); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
              >
                초기화
              </button>
              <button
                onClick={fetchRows}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, #1A3320 0%, #2A4E30 100%)' }}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {errMsg && (
          <div
            className="rounded-xl p-3 mb-4 text-sm border"
            style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}
          >
            {errMsg}
          </div>
        )}

        {/* 결과 목록 */}
        <div className="flex flex-col gap-2.5">
          {!loading && rows.length === 0 && (
            <div
              className="rounded-xl p-8 text-center border"
              style={{ background: '#FFFFFF', borderColor: '#D8E8A0', color: '#6B7280' }}
            >
              <p className="text-sm">조건에 맞는 결과가 없습니다.</p>
            </div>
          )}

          {rows.map(row => {
            const test = testMap.get(row.test_id);
            // 검사 정의가 사라진 경우(예: 과거 데이터): 그래도 row 표시
            const totalPct = test ? calcTotalPct(test, row.answers) : null;
            const level = totalPct !== null ? getLevel(totalPct) : null;
            const groupScores = test ? calcGroupScores(test, row.answers) : [];
            const groupLabels = test?.groups?.map(g => g.label) ?? [];

            return (
              <button
                key={row.id}
                onClick={() => test && setOpenRow(row)}
                disabled={!test}
                className="text-left rounded-xl p-4 border transition-all
                           hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* 좌측: 검사명 + 시간 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{test?.icon ?? '❓'}</span>
                      <p className="text-sm font-semibold truncate" style={{ color: '#1A3320' }}>
                        {test?.name ?? `(알 수 없는 검사: ${row.test_id})`}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {formatDateTime(row.created_at)}
                    </p>
                  </div>

                  {/* 우측: 총점 + 레벨 배지 */}
                  {totalPct !== null && (
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span
                        className="text-[0.68rem] font-bold tracking-wide px-2 py-0.5 rounded-full mb-1"
                        style={{ background: level.bg, color: level.text }}
                      >
                        {level.label}
                      </span>
                      <p className="font-serif text-lg font-bold leading-none" style={{ color: '#1A3320' }}>
                        {totalPct}
                        <span className="text-xs font-semibold" style={{ color: '#6B7280' }}> /100</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* 하단: 그룹별 점수 */}
                {groupScores.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t" style={{ borderColor: '#F0F0F0' }}>
                    {groupLabels.map((label, i) => (
                      <span
                        key={`${label}-${i}`}
                        className="text-[0.68rem] font-medium px-2 py-0.5 rounded-md"
                        style={{ background: '#F5F8D0', color: '#1A3320' }}
                      >
                        {label} <span className="font-bold">{groupScores[i]}</span>
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* 상세 모달 */}
      {openRow && (
        <ResultDetailModal
          test={testMap.get(openRow.test_id)}
          answers={openRow.answers}
          createdAt={openRow.created_at}
          onClose={() => setOpenRow(null)}
        />
      )}
    </div>
  );
}
