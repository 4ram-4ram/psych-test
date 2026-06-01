import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';

// 시행일자 — 변경 시 이 값을 수정하세요.
const EFFECTIVE_DATE = '2026년 6월 1일';

function Article({ no, title, children }) {
  return (
    <section className="mb-7">
      <h2
        className="font-serif text-[1.05rem] font-bold tracking-tight mb-2.5"
        style={{ color: '#1A3320' }}
      >
        제{no}조 ({title})
      </h2>
      <div className="text-[0.86rem] leading-relaxed space-y-2" style={{ color: '#4B5563' }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAF2' }}>
      <Header />

      <main className="flex-1 w-full px-4 md:px-0 max-w-2xl mx-auto py-8 md:py-12">
        {/* 타이틀 */}
        <div className="mb-8">
          <p className="text-[0.68rem] font-bold tracking-[0.14em] mb-1" style={{ color: '#8A7A00' }}>
            PRIVACY POLICY
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight mb-2" style={{ color: '#1A3320' }}>
            개인정보 처리방침
          </h1>
          <p className="text-[0.78rem] leading-relaxed" style={{ color: '#6B7280' }}>
            본 서비스는 이용자를 식별할 수 있는 개인정보를 수집하지 않는 익명 심리검사 서비스입니다.
            본 방침은 서비스가 어떤 정보를 어떻게 처리하는지 투명하게 안내하기 위해 마련되었습니다.
          </p>
        </div>

        {/* 본문 */}
        <div
          className="rounded-2xl p-5 md:p-7 border"
          style={{ background: '#FFFFFF', borderColor: '#D8E8A0' }}
        >
          <Article no="1" title="총칙">
            <p>
              본 개인정보 처리방침(이하 “본 방침”)은 온라인 심리검사 서비스(이하 “서비스”)가
              검사 결과 데이터를 처리함에 있어 그 항목과 목적, 보유 기간 등을 명확히 하기 위한 것입니다.
            </p>
            <p>
              서비스는 회원가입이나 로그인 없이 누구나 익명으로 이용할 수 있으며,
              이용자 개인을 식별할 수 있는 어떠한 정보도 수집하지 않습니다.
            </p>
          </Article>

          <Article no="2" title="수집하는 정보 및 수집 방법">
            <p>서비스는 검사 완료 시 다음의 익명 데이터를 자동으로 저장합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>검사 종류 (예: 불안 검사, 우울 검사 등)</li>
              <li>검사 완료 시각</li>
              <li>각 문항에서 선택한 답변(선택지 번호)</li>
            </ul>
            <p>
              위 데이터는 누가 응답했는지 알 수 없는 형태로만 저장되며,
              특정 개인과 연결할 수 있는 정보를 포함하지 않습니다.
            </p>
            <p>
              또한 검사 진행 중에는 응답 내용을 이용자의 브라우저 임시 저장소(sessionStorage)에
              일시적으로 보관하며, 이는 브라우저(탭)를 닫으면 자동으로 삭제됩니다.
            </p>
          </Article>

          <Article no="3" title="수집하지 않는 정보">
            <p>서비스는 다음과 같은 개인 식별 정보를 일절 수집하지 않습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>이름, 생년월일, 성별, 연락처, 이메일, 주소</li>
              <li>회원 정보 및 로그인 정보 (회원가입 절차가 없습니다)</li>
              <li>이용자를 식별하기 위한 IP 주소 또는 기기 식별자</li>
              <li>위치정보, 광고 식별자, 추적용 쿠키</li>
            </ul>
          </Article>

          <Article no="4" title="수집·이용 목적">
            <p>수집된 익명 데이터는 다음 목적으로만 이용됩니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>검사 종류별·기간별 통계 분석</li>
              <li>검사 서비스의 품질 개선</li>
            </ul>
            <p>서비스는 위 통계 목적 외의 어떠한 용도로도 데이터를 이용하지 않습니다.</p>
          </Article>

          <Article no="5" title="보유 및 이용 기간">
            <p>
              수집된 익명 데이터는 통계 분석을 위해 기간의 제한 없이 보관됩니다.
              해당 데이터는 개인을 식별할 수 있는 정보를 포함하지 않으므로,
              보관에 따른 개인정보 침해의 위험이 없습니다.
            </p>
            <p>
              데이터가 익명으로 저장되는 특성상, 특정 이용자의 데이터만을
              선별하여 조회하거나 삭제하는 것은 기술적으로 불가능합니다.
            </p>
          </Article>

          <Article no="6" title="데이터 처리의 위탁">
            <p>
              서비스는 데이터의 안정적인 저장 및 관리를 위해 클라우드 데이터베이스
              서비스(Supabase)를 이용합니다. 위탁되는 정보는 본 방침 제2조의 익명 데이터에 한합니다.
            </p>
          </Article>

          <Article no="7" title="이용자의 권리">
            <p>
              서비스가 수집하는 데이터는 익명이며 이용자와 연결할 수 있는 정보를 포함하지 않으므로,
              개별 이용자에 대한 열람·정정·삭제 요청에 응하는 것이 기술적으로 불가능합니다.
            </p>
            <p>
              다만 검사 진행 중 브라우저에 임시 저장되는 응답은 브라우저(탭)를 닫으면
              자동으로 삭제되므로, 이용자는 검사를 완료하지 않고 종료함으로써 데이터 저장을 방지할 수 있습니다.
            </p>
          </Article>

          <Article no="8" title="만 14세 미만 아동의 개인정보">
            <p>
              서비스는 개인을 식별할 수 있는 정보를 수집하지 않으므로, 만 14세 미만 아동의
              개인정보를 별도로 처리하지 않습니다. 따라서 법정대리인의 동의가 필요한
              개인정보 처리가 발생하지 않습니다.
            </p>
          </Article>

          <Article no="9" title="자동 수집 장치">
            <p>
              서비스는 광고 또는 이용자 추적을 목적으로 하는 쿠키를 사용하지 않습니다.
              검사 진행에 필요한 범위에서 브라우저 임시 저장소(sessionStorage)만을 사용하며,
              이는 브라우저(탭)를 닫으면 자동으로 삭제됩니다.
            </p>
          </Article>

          <Article no="10" title="방침의 변경">
            <p>
              본 방침의 내용이 변경되는 경우, 변경 사항을 본 페이지를 통해 공지합니다.
            </p>
            <p className="font-semibold" style={{ color: '#1A3320' }}>
              시행일자: {EFFECTIVE_DATE}
            </p>
          </Article>
        </div>

        {/* 돌아가기 */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full py-3.5 rounded-xl text-[0.9rem] font-semibold text-white
                     transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #1A3320 0%, #2A4E30 100%)' }}
        >
          메인으로 돌아가기
        </button>
      </main>
    </div>
  );
}
