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
    send: async ({ to, text }) => {
      sentTo.push(`${to}:${text}`);
      return { id: `rid-${to}` };
    },
    record: async (row) => {
      records.push(row);
    },
  });
  expect(result.sent).toBe(2);
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
    send: async ({ to }) => {
      if (to === 'b@example.com') throw new Error('bounce');
      return { id: 'rid' };
    },
    record: async (row) => {
      records.push({ to_email: row.to_email, send_error: row.send_error });
    },
  });
  expect(result.sent).toBe(1);
  expect(result.failed).toEqual([{ email: 'b@example.com', error: 'bounce' }]);
  expect(records).toHaveLength(2);
  expect(records.find((r) => r.to_email === 'b@example.com')?.send_error).toBe('bounce');
});
