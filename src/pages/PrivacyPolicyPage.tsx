import React from 'react';
import { useTranslation } from 'next-i18next';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';

// 강정피스앤뮤직캠프 개인정보처리방침 (한국어 단일).
// 수집 경로: ① 참여자 설문(직접) ② 웹사이트 이용 분석(Google Analytics 쿠키, 자동).
// 보유기간·위탁업체 등 법적 세부는 운영자 검토 후 갱신 필요.
const CONTACT_EMAIL = 'gpmc0625@gmail.com';
const H2 = 'mb-3 font-display text-xl font-bold text-deep-ocean';
const UL = 'list-disc space-y-1 pl-5';

const PrivacyPolicyPage: React.FC = () => {
  // 본문은 한국어 단일이나, 검색결과 노출 메타(title/description)는 로케일 언어로 제공한다.
  const { t } = useTranslation('translation');
  return (
    <PageLayout
      title={t('privacy.seoTitle')}
      description={t('privacy.seoDescription')}
      background="white"
    >
      <Section>
        <Container size="content">
          <h1 className="mb-2 font-display text-3xl font-bold text-deep-ocean">개인정보처리방침</h1>
          <p className="mb-10 text-sm text-coastal-gray">시행일: 2026년 6월 11일</p>

          <div className="space-y-8 leading-relaxed text-deep-ocean/90">
            <p>
              강정피스앤뮤직캠프(이하 ‘캠프’)는 「개인정보 보호법」을 준수하며 이용자의 개인정보를
              보호합니다. 캠프는 ① 참여자 설문을 통한 직접 수집과 ② 웹사이트 이용 분석을 위한 자동
              수집(쿠키)을 통해 개인정보를 처리합니다.
            </p>

            <section>
              <h2 className={H2}>1. 수집하는 개인정보 항목</h2>
              <p className="mb-2 font-medium">가. 참여자 설문(/camps/2026/survey)</p>
              <ul className={UL}>
                <li>필수: 이름 또는 활동명(팀명)</li>
                <li>선택: 연락처(인스타그램 아이디·이메일·전화번호), 응답자 유형</li>
                <li>설문 응답 내용(평가 점수 및 자유 서술)</li>
              </ul>
              <p className="mb-2 mt-4 font-medium">나. 자동 수집</p>
              <ul className={UL}>
                <li>
                  접속 기기·브라우저 정보(User-Agent), 방문·이용 기록, 쿠키 — Google Analytics를
                  통한 이용 분석
                </li>
                <li>언어 설정을 저장하기 위한 기능 쿠키</li>
              </ul>
            </section>

            <section>
              <h2 className={H2}>2. 수집·이용 목적</h2>
              <ul className={UL}>
                <li>설문: 결과 분석, 행사 운영 개선, 다음 회차 캠프 안내 및 참여 요청</li>
                <li>자동 수집: 웹사이트 이용 통계 분석 및 서비스 개선</li>
              </ul>
            </section>

            <section>
              <h2 className={H2}>3. 보유 및 이용 기간</h2>
              <p>
                설문 응답은 수집 목적을 달성할 때까지 보유하며, 늦어도 제4회 캠프 종료 시 또는
                정보주체의 삭제·동의 철회 요청 시 지체 없이 파기합니다. 이용 분석 데이터는 Google
                Analytics의 데이터 보관 정책에 따릅니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>4. 처리 위탁 및 국외 이전</h2>
              <p>
                캠프는 아래 업체에 개인정보 처리를 위탁하며, 데이터 일부는 국외에 저장·이전됩니다.
              </p>
              <ul className={`${UL} mt-2`}>
                <li>Supabase, Inc. — 설문 응답 데이터베이스 저장·관리 (인도 뭄바이 리전)</li>
                <li>Vercel, Inc. — 웹사이트 호스팅 (미국 등)</li>
                <li>Google LLC — 웹사이트 이용 분석(Google Analytics) (미국 등)</li>
              </ul>
            </section>

            <section>
              <h2 className={H2}>5. 쿠키의 설치·운영 및 거부</h2>
              <p>
                캠프는 이용 분석을 위해 쿠키를 사용합니다. 이용자는 웹브라우저 설정에서 쿠키 저장을
                거부할 수 있으며, Google Analytics 차단 브라우저 부가기능(
                <span className="whitespace-nowrap">tools.google.com/dlpage/gaoptout</span>)으로
                분석을 거부할 수 있습니다. 쿠키 저장을 거부하면 일부 기능 이용에 제약이 있을 수
                있습니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>6. 제3자 제공</h2>
              <p>
                캠프는 이용자의 개인정보를 제3자에게 제공하지 않습니다(위 처리 위탁의 경우는
                제외합니다).
              </p>
            </section>

            <section>
              <h2 className={H2}>7. 정보주체의 권리와 행사 방법</h2>
              <p>
                이용자는 언제든지 본인의 개인정보에 대한 열람·정정·삭제·처리정지 및 동의 철회를
                요청할 수 있습니다. 아래 연락처로 요청하시면 지체 없이 조치합니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>8. 개인정보의 안전성 확보 조치</h2>
              <p>
                설문 데이터는 행 수준 보안(RLS)으로 외부 조회가 차단되어 운영진만 열람할 수 있으며,
                전송 구간은 HTTPS로 암호화됩니다.
              </p>
            </section>

            <section>
              <h2 className={H2}>9. 개인정보 보호책임자</h2>
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
              <h2 className={H2}>10. 권익침해 구제 방법</h2>
              <p>개인정보 침해에 대한 신고·상담이 필요하면 아래 기관에 문의할 수 있습니다.</p>
              <ul className={`${UL} mt-2`}>
                <li>개인정보침해신고센터 — privacy.kisa.or.kr / 국번 없이 118</li>
                <li>개인정보분쟁조정위원회 — kopico.go.kr / 1833-6972</li>
                <li>경찰청 사이버범죄 신고시스템 — ecrm.police.go.kr / 182</li>
              </ul>
            </section>

            <section>
              <h2 className={H2}>11. 방침의 변경</h2>
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
