import {
  personalizeBody,
  parseContactsCsv,
  normalizeGroupType,
  normalizeCohorts,
  validateContactName,
  validateBroadcastSubject,
  validateBroadcastBody,
  parseManualRecipients,
} from './mailContactsForms';

test('parseManualRecipients는 줄바꿈/콤마와 이름<이메일> 형식을 파싱하고 소문자화·중복제거한다', () => {
  const { recipients, errors } = parseManualRecipients(
    '까르 <Kkar@example.com>\njung@example.com, KKAR@example.com\n잘못된주소'
  );
  expect(recipients).toEqual([
    { name: '까르', email: 'kkar@example.com' },
    { name: '', email: 'jung@example.com' },
  ]);
  expect(errors).toEqual(['잘못된주소']);
});

test('personalizeBody는 {이름}을 이름으로 치환한다', () => {
  expect(personalizeBody('안녕하세요 {이름}님', '홍길동')).toBe('안녕하세요 홍길동님');
});

test('personalizeBody는 여러 {이름}을 모두 치환한다', () => {
  expect(personalizeBody('{이름}, {이름}', '가')).toBe('가, 가');
});

test('normalizeGroupType은 한글/영문 그룹명을 코드로 바꾼다', () => {
  expect(normalizeGroupType('뮤지션')).toBe('musician');
  expect(normalizeGroupType('기획단')).toBe('planning');
  expect(normalizeGroupType('후원단체')).toBe('sponsor');
  expect(normalizeGroupType('sponsor')).toBe('sponsor');
  expect(normalizeGroupType('알수없음')).toBeNull();
});

test('normalizeCohorts는 콤마/공백 구분 문자열을 배열로 만든다', () => {
  expect(normalizeCohorts('2026, 2025')).toEqual(['2026', '2025']);
  expect(normalizeCohorts(['2026', '', ' 2025 '])).toEqual(['2026', '2025']);
});

test('validateContactName은 빈 이름을 거부한다', () => {
  expect(validateContactName('').ok).toBe(false);
  expect(validateContactName('홍길동')).toEqual({ ok: true, value: '홍길동' });
});

test('parseContactsCsv는 헤더 있는 CSV를 파싱하고 잘못된 행은 errors로 보고한다', () => {
  const csv = [
    '이름,이메일,그룹,회차',
    '홍길동,hong@example.com,뮤지션,2026',
    '단체A,a@example.com,후원단체,"2025,2026"',
    '깨진행,not-an-email,기획단,2026',
  ].join('\n');
  const { rows, errors } = parseContactsCsv(csv);
  expect(rows).toHaveLength(2);
  expect(rows[0]).toEqual({
    name: '홍길동',
    email: 'hong@example.com',
    group_type: 'musician',
    cohorts: ['2026'],
  });
  expect(rows[1].cohorts).toEqual(['2025', '2026']);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('not-an-email');
});

test('validateBroadcastSubject는 빈 제목을 거부하고 정상 제목을 받는다', () => {
  expect(validateBroadcastSubject('').ok).toBe(false);
  expect(validateBroadcastSubject('공지사항')).toEqual({
    ok: true,
    value: '공지사항',
  });
});

test('validateBroadcastBody는 빈 본문을 거부하고 정상 본문을 받는다', () => {
  expect(validateBroadcastBody('   ').ok).toBe(false);
  expect(validateBroadcastBody('안녕하세요').ok).toBe(true);
});
