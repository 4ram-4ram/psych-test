import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 이미 세션 있으면 /admin 으로
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message || '로그인에 실패했습니다.');
      setSubmitting(false);
      return;
    }
    navigate('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      <main className="flex-1 w-full px-4 md:px-0 max-w-sm mx-auto py-12 md:py-16">
        <div className="text-center mb-6">
          <p className="text-[0.68rem] font-bold tracking-[0.14em] mb-1" style={{ color: '#8A7A00' }}>
            ADMIN
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight" style={{ color: '#1A3320' }}>
            관리자 로그인
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 border flex flex-col gap-3"
          style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
        >
          <label className="flex flex-col gap-1">
            <span className="text-[0.72rem] font-bold tracking-wide" style={{ color: '#1A3320' }}>
              이메일
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-3 py-2.5 rounded-lg border outline-none text-sm"
              style={{ borderColor: '#D8E8A0', background: '#F8FAF2' }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[0.72rem] font-bold tracking-wide" style={{ color: '#1A3320' }}>
              비밀번호
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-3 py-2.5 rounded-lg border outline-none text-sm"
              style={{ borderColor: '#D8E8A0', background: '#F8FAF2' }}
            />
          </label>

          {error && (
            <p className="text-xs" style={{ color: '#991B1B' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full py-3 rounded-xl text-[0.88rem] font-semibold text-white
                       transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1A3320 0%, #2A4E30 100%)' }}
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </main>
    </div>
  );
}
