import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LikeButton from './LikeButton';

// useTranslation / next/router 는 src/setupTests.tsx 에서 전역 모킹된다.
// jest.mock 의 경로는 상대경로로 지정한다(@/ 별칭은 import 문에서만 SWC 가 재작성하고
// jest.mock 문자열 인자는 재작성하지 않아 해석 실패한다). 해석된 절대경로는 LikeButton
// 이 @/ 로 import 하는 대상과 동일하므로 모킹이 정상 적용된다.
const mockUseAuth = jest.fn();
jest.mock('../auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockCreateClient = jest.fn();
jest.mock('../../lib/supabaseBrowser', () => ({
  createSupabaseBrowserClient: () => mockCreateClient(),
}));

jest.mock('../../lib/memberAuth', () => ({
  safeRedirectPath: (p: string) => p,
}));

interface SelectChain {
  eq: () => SelectChain;
  maybeSingle: () => Promise<{ data: { post_id: string } | null }>;
}

type WriteResult = Promise<{ error: { code?: string } | null }>;

// post_likes 쿼리 체인을 흉내내는 최소 Supabase 클라이언트 목.
// supabase-js 는 오류 시 throw 하지 않고 { error } 를 resolve 하므로 그 계약을 따른다.
function makeClient(opts: {
  likeExists?: boolean;
  insert?: () => WriteResult;
  del?: () => WriteResult;
}) {
  const { likeExists = false, insert, del } = opts;
  const selectChain: SelectChain = {
    eq: () => selectChain,
    maybeSingle: () => Promise.resolve({ data: likeExists ? { post_id: 'p1' } : null }),
  };
  return {
    from: () => ({
      select: () => selectChain,
      insert: () => (insert ? insert() : Promise.resolve({ error: null })),
      delete: () => ({
        eq: () => ({ eq: () => (del ? del() : Promise.resolve({ error: null })) }),
      }),
    }),
  };
}

describe('LikeButton', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, loading: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 좋아요하면 카운트가 오르고 버튼이 다시 활성화된다', async () => {
    const insertSpy = jest.fn<WriteResult, []>(() => Promise.resolve({ error: null }));
    mockCreateClient.mockReturnValue(makeClient({ insert: insertSpy }));

    render(<LikeButton postId="p1" initialCount={3} />);
    const button = screen.getByRole('button');
    await waitFor(() => expect(button).toBeEnabled());

    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveTextContent('4'));
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('좋아요 쓰기가 error 를 반환하면 낙관적 상태를 되돌리고 버튼은 다시 활성화된다', async () => {
    // supabase 가 { error } 를 반환하는(정상 계약) 실패 — try/finally 의 finally 가
    // loading 을 해제하므로 버튼이 비활성으로 고착되지 않아야 한다.
    const insertSpy = jest.fn<WriteResult, []>(() => Promise.resolve({ error: { code: '500' } }));
    mockCreateClient.mockReturnValue(makeClient({ insert: insertSpy }));

    render(<LikeButton postId="p1" initialCount={5} />);
    const button = screen.getByRole('button');
    await waitFor(() => expect(button).toBeEnabled());

    fireEvent.click(button);

    // insert 가 호출됐고(토글 실행됨), 오류 후 카운트/상태가 원복되며 버튼은 활성 유지.
    await waitFor(() => expect(insertSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
    expect(button).toHaveTextContent('5');
    expect(button).toBeEnabled();
  });
});
