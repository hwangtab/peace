import { parseJsonArray } from './jsonReader';

describe('parseJsonArray', () => {
  it('유효한 JSON 배열 → status ok, data 반환', () => {
    const result = parseJsonArray<{ id: number }>('[{"id":1},{"id":2}]');
    expect(result.status).toBe('ok');
    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('빈 배열 → status empty, data 빈 배열', () => {
    const result = parseJsonArray('[]');
    expect(result.status).toBe('empty');
    expect(result.data).toEqual([]);
  });

  it('빈 문자열(공백 포함) → status empty', () => {
    expect(parseJsonArray('').status).toBe('empty');
    expect(parseJsonArray('   ').status).toBe('empty');
  });

  it('배열이 아닌 JSON(객체) → Error throw', () => {
    expect(() => parseJsonArray('{"key":"value"}', '/some/path')).toThrow(
      'Expected array JSON at /some/path'
    );
  });

  it('잘못된 JSON 문자열 → Error throw (Invalid JSON)', () => {
    expect(() => parseJsonArray('{bad json', '/api/data')).toThrow('Invalid JSON at /api/data');
  });

  it('잘못된 JSON 에러에 cause 첨부', () => {
    let thrown: unknown;
    try {
      parseJsonArray('not-json', 'ctx');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error & { cause?: unknown }).cause).toBeDefined();
  });

  it('context 기본값 <unknown> 사용', () => {
    expect(() => parseJsonArray('null')).toThrow('<unknown>');
  });

  it('요소가 있는 배열 data 길이 검증', () => {
    const result = parseJsonArray<string>('["a","b","c"]');
    expect(result.data).toHaveLength(3);
  });
});
