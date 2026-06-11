import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';

// 강정피스앤뮤직캠프 개인정보처리방침 (한국어 단일).
// 현재 개인정보 수집 경로는 참여자 설문(/camps/2026/survey)이 유일하므로 그에 맞춰 작성.
// 법령·운영 변경 시 운영자 검토 후 갱신 필요.
const CONTACT_EMAIL = 'gpmc0625@gmail.com';
const H2 = 'mb-3 font-display text-xl font-bold text-deep-ocean';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout
      title="개인정보처리방침 — 강정피스앤뮤직캠프"
      description="강정피스앤뮤직캠프가 설문에서 수집하는 개인정보의 처리 방침을 안내합니다."
      background="white"
    >
      <Section>
        <Container size="content">
          <h1 className="mb-2 font-display text-3xl font-bold text-deep-ocean">개인정보처리방침</h1>
          <p className="mb-10 text-sm text-coastal-gray">시행일: 2026년 6월 11일</p>

          <div className="space-y-8 leading-relaxed text-deep-ocean/90">
            <p>
              강정피스앤뮤직캠프(이하 ‘캠프’)는 「개인정보 보호법」을 준수하며 이용자의 개인정보를
              소중히 보호합니다. 현재 캠프가 개인정보를 수집하는 경로는 참여자 설문(
              <span className="whitespace-nowrap">/camps/2026/survey</span>)이 유일하며, 본 방침은
              해당 설문에서 수집·이용하는 개인정보에 적용됩니다.
            </p>

            <section>
              <h2 className={H2}>1. 수집하는 개인정보 항목</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>필수: 이름 또는 활동명(팀명)</li>
                <li>선택: 연락처(인스타그램 아이디·이메일·전화번호), 응답자 유형</li>
                <li>설문 응답 내용(평가 점수 및 자유 서술)</li>
                <li>자동 수집: 접속 기기 정보(User-Agent)</li>
              </ul>
            </section>

            <section>
              <h2 className={H2}>2. 수집·이용 목적</h2>
              <p>설문 결과 분석, 행사 운영 개선, 다음 회차 캠프 안내 및 참여 요청을 위해 이용합니다.</p>
            </section>

            <section>
              <h2 className={H2}>3. 보유 및 이용 기간</h2>
              <p>
                수집 목적을 달성할 때까지 보유하며, 늦어도 제4회 캠프 종료 시 또는 정보주체의 삭제·동의
                철회 요청 시 지체 없이 파기합니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>4. 처리 위탁 및 국외 이전</h2>
              <p>
                캠프는 설문 응답의 저장·관리를 위해 아래 업체에 처리를 위탁하며, 데이터는 국외에
                저장됩니다.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Supabase, Inc. — 응답 데이터베이스 저장·관리 (저장 위치: 인도 뭄바이 리전)</li>
                <li>Vercel, Inc. — 웹사이트 호스팅</li>
              </ul>
            </section>

            <section>
              <h2 className={H2}>5. 제3자 제공</h2>
              <p>
                캠프는 이용자의 개인정보를 제3자에게 제공하지 않습니다(위 처리 위탁의 경우는
                제외합니다).
              </p>
            </section>

            <section>
              <h2 className={H2}>6. 정보주체의 권리와 행사 방법</h2>
              <p>
                이용자는 언제든지 본인의 개인정보에 대한 열람·정정·삭제·처리정지 및 동의 철회를 요청할
                수 있습니다. 아래 연락처로 요청하시면 지체 없이 조치합니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>7. 개인정보의 안전성 확보 조치</h2>
              <p>
                설문 데이터는 행 수준 보안(RLS)으로 외부 조회가 차단되어 운영진만 열람할 수 있으며,
                전송 구간은 HTTPS로 암호화됩니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>8. 개인정보 보호책임자</h2>
              <p>
                문의 및 권리 행사: 강정피스앤뮤직캠프 운영팀
                <br />
                이메일:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-jeju-ocean underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>

            <section>
              <h2 className={H2}>9. 방침의 변경</h2>
              <p>
                본 방침은 법령이나 운영 사정에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해
                공지합니다.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default PrivacyPolicyPage;
