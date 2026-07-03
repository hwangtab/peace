import { personalizeBody } from './mailContactsForms';

export interface BroadcastRecipient {
  id: string;
  name: string;
  email: string;
}

export interface BroadcastRecord {
  to_email: string;
  subject: string;
  text_body: string;
  campaign_id: string;
  send_error: string | null;
  resend_id: string | null;
}

export interface BroadcastResult {
  /** 이번 실행에서 성공(또는 이미 발송돼 건너뜀)한 수신자 이메일 목록. */
  sent: string[];
  failed: { email: string; error: string }[];
}

interface RunBroadcastOptions {
  recipients: BroadcastRecipient[];
  subject: string;
  text: string;
  from: string;
  campaignId: string;
  send: (input: { from: string; to: string; subject: string; text: string }) => Promise<{
    id: string;
  }>;
  record: (row: BroadcastRecord) => Promise<void>;
  /**
   * 이미 발송 완료된 이메일(소문자) 집합. 청크 재호출 시 중복 발송을 막는 멱등성 장치.
   * 여기 포함된 수신자는 Resend 재호출·재기록 없이 성공으로 간주한다.
   */
  skipEmails?: Set<string>;
  /** 수신자 간 발송 간격(ms). Resend 레이트 리밋(기본 ~2req/s) 회피용. 기본 600ms. */
  throttleMs?: number;
  /** 레이트 리밋(429) 발생 시 재시도 횟수. 기본 2회. */
  maxRateLimitRetries?: number;
  /** 테스트 주입용 sleep 구현. 기본은 setTimeout. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (err: unknown): boolean => {
  const message = err instanceof Error ? err.message : String(err);
  return /\b429\b|rate.?limit|too many requests/i.test(message);
};

/**
 * 주어진 수신자(청크)를 개인화 발송한다. 성공/실패와 무관하게 record를 호출해
 * 1행씩 남긴다. 청크 단위 실행이 전제이며, 수신자 명단 슬라이스를 호출자가 넘긴다.
 * skipEmails에 있는 주소는 이미 발송된 것으로 보고 재발송·재기록하지 않는다(멱등성).
 */
export const runBroadcast = async (opts: RunBroadcastOptions): Promise<BroadcastResult> => {
  const result: BroadcastResult = { sent: [], failed: [] };
  const throttleMs = opts.throttleMs ?? 600;
  const maxRetries = opts.maxRateLimitRetries ?? 2;
  const sleep = opts.sleep ?? defaultSleep;
  const skip = opts.skipEmails;

  for (let i = 0; i < opts.recipients.length; i += 1) {
    const r = opts.recipients[i]!;

    // 이미 발송된 수신자는 건너뛴다(중복 발송 방지). 성공으로 집계하되 실제 호출은 생략.
    if (skip?.has(r.email.toLowerCase())) {
      result.sent.push(r.email);
      continue;
    }

    const text = personalizeBody(opts.text, r.name);
    let resendId: string | null = null;
    let sendError: string | null = null;

    for (let attempt = 0; ; attempt += 1) {
      try {
        const sent = await opts.send({ from: opts.from, to: r.email, subject: opts.subject, text });
        resendId = sent.id;
        sendError = null;
        result.sent.push(r.email);
        break;
      } catch (err) {
        // 레이트 리밋이면 점증 대기 후 재시도, 그 외 오류는 즉시 실패 처리
        if (isRateLimitError(err) && attempt < maxRetries) {
          await sleep(throttleMs * (attempt + 2));
          continue;
        }
        sendError = err instanceof Error ? err.message : String(err);
        result.failed.push({ email: r.email, error: sendError });
        break;
      }
    }

    await opts.record({
      to_email: r.email,
      subject: opts.subject,
      text_body: text,
      campaign_id: opts.campaignId,
      send_error: sendError,
      resend_id: resendId,
    });

    // 다음 수신자 전 throttle(마지막 수신자 뒤에는 대기하지 않음)
    if (throttleMs > 0 && i < opts.recipients.length - 1) {
      await sleep(throttleMs);
    }
  }
  return result;
};
