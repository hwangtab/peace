import { runBroadcast } from './mailBroadcast';

const recipients = [
  { id: '1', name: '가', email: 'a@example.com' },
  { id: '2', name: '나', email: 'b@example.com' },
];

test('각 수신자에게 개인화 본문으로 발송하고 모두 기록한다', async () => {
  const records: unknown[] = [];
  const sentTo: string[] = [];
  const result = await runBroadcast({
    recipients,
    subject: '공지',
    text: '{이름}님 안녕하세요',
    from: 'X <x@y.net>',
    campaignId: 'camp-1',
    throttleMs: 0,
    send: async ({ to, text }) => {
      sentTo.push(`${to}:${text}`);
      return { id: `rid-${to}` };
    },
    record: async (row) => {
      records.push(row);
    },
  });
  expect(result.sent).toEqual(['a@example.com', 'b@example.com']);
  expect(result.failed).toHaveLength(0);
  expect(sentTo).toContain('a@example.com:가님 안녕하세요');
  expect(sentTo).toContain('b@example.com:나님 안녕하세요');
  expect(records).toHaveLength(2);
  const firstRecord = records[0] as { text_body: string };
  expect(firstRecord.text_body).toBe('가님 안녕하세요');
});

test('일부 발송 실패 시 성공분은 기록하고 실패 목록을 반환한다', async () => {
  const records: { to_email: string; send_error: string | null }[] = [];
  const result = await runBroadcast({
    recipients,
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-2',
    throttleMs: 0,
    send: async ({ to }) => {
      if (to === 'b@example.com') throw new Error('bounce');
      return { id: 'rid' };
    },
    record: async (row) => {
      records.push({ to_email: row.to_email, send_error: row.send_error });
    },
  });
  expect(result.sent).toEqual(['a@example.com']);
  expect(result.failed).toEqual([{ email: 'b@example.com', error: 'bounce' }]);
  expect(records).toHaveLength(2);
  expect(records.find((r) => r.to_email === 'b@example.com')?.send_error).toBe('bounce');
});

test('레이트 리밋(429)이면 재시도 후 성공한다', async () => {
  let attempts = 0;
  const sleeps: number[] = [];
  const result = await runBroadcast({
    recipients: [{ id: '1', name: '가', email: 'a@example.com' }],
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-3',
    throttleMs: 10,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    send: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('Too Many Requests (429)');
      return { id: 'rid' };
    },
    record: async () => {},
  });
  expect(attempts).toBe(2);
  expect(result.sent).toEqual(['a@example.com']);
  expect(result.failed).toHaveLength(0);
  expect(sleeps.length).toBeGreaterThan(0);
});

test('레이트 리밋이 재시도 한도를 넘으면 실패로 기록한다', async () => {
  const result = await runBroadcast({
    recipients: [{ id: '1', name: '가', email: 'a@example.com' }],
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-4',
    throttleMs: 0,
    maxRateLimitRetries: 1,
    sleep: async () => {},
    send: async () => {
      throw new Error('rate limit exceeded');
    },
    record: async () => {},
  });
  expect(result.sent).toHaveLength(0);
  expect(result.failed).toHaveLength(1);
});

test('skipEmails에 있는 수신자는 재발송·재기록 없이 성공으로 집계한다(멱등성)', async () => {
  const sentTo: string[] = [];
  const records: { to_email: string }[] = [];
  const result = await runBroadcast({
    recipients,
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-5',
    throttleMs: 0,
    skipEmails: new Set(['a@example.com']),
    send: async ({ to }) => {
      sentTo.push(to);
      return { id: `rid-${to}` };
    },
    record: async (row) => {
      records.push({ to_email: row.to_email });
    },
  });
  // a는 이미 발송됨 → send/record 호출 없음, 성공으로만 집계.
  expect(sentTo).toEqual(['b@example.com']);
  expect(records).toEqual([{ to_email: 'b@example.com' }]);
  expect(result.sent).toEqual(['a@example.com', 'b@example.com']);
  expect(result.failed).toHaveLength(0);
});

test('skipEmails는 수신자 이메일 대소문자와 무관하게 매칭한다', async () => {
  const sentTo: string[] = [];
  const result = await runBroadcast({
    recipients: [{ id: '1', name: '가', email: 'A@Example.com' }],
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-6',
    throttleMs: 0,
    skipEmails: new Set(['a@example.com']),
    send: async ({ to }) => {
      sentTo.push(to);
      return { id: 'rid' };
    },
    record: async () => {},
  });
  expect(sentTo).toHaveLength(0);
  expect(result.sent).toEqual(['A@Example.com']);
});

test('청크 재실행: 전원 skip이면 외부 호출 없이 전원 성공을 반환한다', async () => {
  let sendCalls = 0;
  let recordCalls = 0;
  const result = await runBroadcast({
    recipients,
    subject: '공지',
    text: '본문',
    from: 'X <x@y.net>',
    campaignId: 'camp-7',
    throttleMs: 0,
    skipEmails: new Set(['a@example.com', 'b@example.com']),
    send: async () => {
      sendCalls += 1;
      return { id: 'rid' };
    },
    record: async () => {
      recordCalls += 1;
    },
  });
  expect(sendCalls).toBe(0);
  expect(recordCalls).toBe(0);
  expect(result.sent).toEqual(['a@example.com', 'b@example.com']);
  expect(result.failed).toHaveLength(0);
});
