export type JsonArrayStatus = 'ok' | 'empty' | 'not_found';

export interface JsonArrayResult<T> {
  status: JsonArrayStatus;
  data: T[];
}

/**
 * JSON 문자열을 파싱해 배열 결과로 반환한다.
 * - 빈 문자열 → { status: 'empty', data: [] }
 * - 파싱 실패  → throw (cause 포함)
 * - 배열 아님  → throw
 * - 빈 배열   → { status: 'empty', data: [] }
 * - 정상      → { status: 'ok',    data }
 *
 * @param raw     파싱할 JSON 문자열
 * @param context 에러 메시지에 포함할 경로/URL 등 식별자
 */
export function parseJsonArray<T>(raw: string, context = '<unknown>'): JsonArrayResult<T> {
  if (!raw.trim()) {
    return { status: 'empty', data: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    const error = new Error(`Invalid JSON at ${context}`);
    Object.assign(error, { cause });
    throw error;
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array JSON at ${context}`);
  }

  const data = parsed as T[];
  if (data.length === 0) {
    return { status: 'empty', data };
  }

  return { status: 'ok', data };
}
