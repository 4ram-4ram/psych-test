import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tests } from '../data/tests';
import { supabase } from '../lib/supabase';
import { calcTotalPct } from '../lib/scoring';
import { getLevel } from '../data/results';
import { exportResultsToExcel } from '../lib/exportExcel';
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

  // 데이터 / 페이지네이션
  const PAGE_SIZE = 50;
  const [rows, setRows] = useState([]);     // 현재 페이지(최대 50개)
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);    // 필터된 전체 건수
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // 모달
  const [openRow, setOpenRow] = useState(null);

  // tests.js → id 로 빠르게 찾기 위한 맵
  const testMap = useMemo(() => {
    const m = new Map();
    tests.forEach(t => m.set(t.id, t));
    return m;
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 현재 필터를 적용한 쿼리 빌더 (페이지 조회 / 전체 조회 공용)
  function buildFilteredQuery(selectArg, opts) {
    let query = supabase
      .from('test_results')
      .select(selectArg, opts)
      .order('created_at', { ascending: false });
    if (selectedTestId) query = query.eq('test_id', selectedTestId);
    if (startTime) query = query.gte('created_at', new Date(startTime).toISOString());
    if (endTime)   query = query.lte('created_at', new Date(endTime).toISOString());
    return query;
  }

  // 특정 페이지(50개) 조회
  async function fetchRows(targetPage) {
    if (!authChecked) return;
    setLoading(true);
    setErrMsg('');

    const from = (targetPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await buildFilteredQuery('*', { count: 'exact' }).range(from, to);
    setLoading(false);

    if (error) {
      setErrMsg(`조회 실패: ${error.message}`);
      setRows([]);
      setTotal(0);
      return;
    }
    setRows(data ?? []);
    setTotal(count ?? 0);
    setPage(targetPage);
  }

  // 필터 변경 시 1페이지부터 다시 조회
  useEffect(() => {
    if (authChecked) fetchRows(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, selectedTestId, startTime, endTime]);

  // 엑셀 다운로드: 페이지와 무관하게 필터된 전체 기록을 청크로 모두 모아 내보냄
  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setErrMsg('');
    try {
      const CHUNK = 1000;
      const all = [];
      let from = 0;
      for (;;) {
        const { data, error } = await buildFilteredQuery('*', {}).range(from, from + CHUNK - 1);
        if (error) throw error;
        all.push(...(data ?? []));
        if (!data || data.length < CHUNK) break;
        from += CHUNK;
      }
      if (all.length === 0) return;
      await exportResultsToExcel(all, selectedTestId);
    } catch (e) {
      console.error('[export]', e);
      setErrMsg(`내보내기 실패: ${e?.message ?? e}`);
    } finally {
      setExporting(false);
    }
  }

  // 페이지 번호 윈도우 (최대 7개)
  function pageWindow() {
    const size = 7;
    let start = Math.max(1, page - Math.floor(size / 2));
    const end = Math.min(totalPages, start + size - 1);
    start = Math.max(1, end - size + 1);
    const arr = [];
    for (let n = start; n <= end; n++) arr.push(n);
    return arr;
  }

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
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: '#1A3320' }}>
            검사 결과 통계
          </h1>
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
                className="appearance-none pl-3 pr-9 py-2 rounded-lg border outline-none text-sm"
                style={{
                  borderColor: '#D8E8A0',
                  backgroundColor: '#F8FAF2',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%231A3320' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '0.75rem',
                }}
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
              {loading ? '불러오는 중...' : `총 ${total}건`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={loading || exporting || total === 0}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#1A3320', color: '#1A3320', background: '#FFFFFF' }}
              >
                {exporting ? '내보내는 중...' : '⬇ 엑셀 다운로드'}
              </button>
              <button
                onClick={() => { setSelectedTestId(''); setStartTime(''); setEndTime(''); }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
              >
                초기화
              </button>
              <button
                onClick={() => fetchRows(page)}
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

        {/* 결과 표 */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: '#D8E8A0', background: '#FFFFFF' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: '#F5F8D0' }}>
                  {!selectedTestId && (
                    <th className="px-3 py-2.5 text-[0.7rem] font-bold tracking-wide whitespace-nowrap" style={{ color: '#8A7A00' }}>검사</th>
                  )}
                  <th className="px-3 py-2.5 text-[0.7rem] font-bold tracking-wide whitespace-nowrap" style={{ color: '#8A7A00' }}>완료 시각</th>
                  <th className="px-3 py-2.5 text-[0.7rem] font-bold tracking-wide whitespace-nowrap text-right" style={{ color: '#8A7A00' }}>총점</th>
                  <th className="px-3 py-2.5 text-[0.7rem] font-bold tracking-wide whitespace-nowrap" style={{ color: '#8A7A00' }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const test = testMap.get(row.test_id);
                  // 검사 정의가 사라진 경우(예: 과거 데이터): 그래도 row 표시
                  const totalPct = test ? calcTotalPct(test, row.answers) : null;
                  const level = totalPct !== null ? getLevel(totalPct) : null;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => test && setOpenRow(row)}
                      className={`border-t transition-colors ${test ? 'cursor-pointer hover:bg-[#F8FAF2]' : 'opacity-60'}`}
                      style={{ borderColor: '#F0F0F0' }}
                    >
                      {!selectedTestId && (
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-sm font-semibold" style={{ color: '#1A3320' }}>
                            {test?.name ?? `(알 수 없음: ${row.test_id})`}
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs" style={{ color: '#6B7280' }}>
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right">
                        {totalPct !== null ? (
                          <span className="font-serif text-sm font-bold" style={{ color: '#1A3320' }}>
                            {totalPct}
                            <span className="text-[0.65rem] font-semibold" style={{ color: '#9CA3AF' }}>/100</span>
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {level ? (
                          <span
                            className="text-[0.68rem] font-bold tracking-wide px-2 py-0.5 rounded-full"
                            style={{ background: level.bg, color: level.text }}
                          >
                            {level.label}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && rows.length === 0 && (
            <div className="p-8 text-center" style={{ color: '#6B7280' }}>
              <p className="text-sm">조건에 맞는 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-4">
            <button
              onClick={() => fetchRows(page - 1)}
              disabled={page <= 1 || loading}
              className="w-8 h-8 rounded-lg border text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            {pageWindow().map((n) => (
              <button
                key={n}
                onClick={() => fetchRows(n)}
                disabled={loading}
                aria-current={n === page ? 'page' : undefined}
                className="min-w-8 h-8 px-2 rounded-lg border text-xs font-semibold"
                style={
                  n === page
                    ? { borderColor: '#1A3320', background: '#1A3320', color: '#FFFFFF' }
                    : { borderColor: '#D8E8A0', background: '#FFFFFF', color: '#1A3320' }
                }
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => fetchRows(page + 1)}
              disabled={page >= totalPages || loading}
              className="w-8 h-8 rounded-lg border text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: '#D8E8A0', color: '#1A3320', background: '#FFFFFF' }}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className="text-center text-[0.7rem] mt-2" style={{ color: '#9CA3AF' }}>
            {page} / {totalPages} 페이지 · 전체 {total}건
          </p>
        )}
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
