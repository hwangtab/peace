import { ROLE_RANK, canEditContent, hasAdminRole, isOwner } from './adminAuth';

describe('admin role helpers', () => {
  it('ranks roles owner > editor > viewer', () => {
    expect(ROLE_RANK.owner).toBeGreaterThan(ROLE_RANK.editor);
    expect(ROLE_RANK.editor).toBeGreaterThan(ROLE_RANK.viewer);
  });

  describe('hasAdminRole', () => {
    it('passes when the role meets the minimum', () => {
      expect(hasAdminRole('owner', 'editor')).toBe(true);
      expect(hasAdminRole('editor', 'editor')).toBe(true);
      expect(hasAdminRole('owner', 'owner')).toBe(true);
    });

    it('fails when the role is below the minimum', () => {
      expect(hasAdminRole('viewer', 'editor')).toBe(false);
      expect(hasAdminRole('editor', 'owner')).toBe(false);
      expect(hasAdminRole('viewer', 'owner')).toBe(false);
    });
  });

  describe('canEditContent', () => {
    it('allows owner and editor', () => {
      expect(canEditContent({ role: 'owner' })).toBe(true);
      expect(canEditContent({ role: 'editor' })).toBe(true);
    });

    it('blocks viewer', () => {
      expect(canEditContent({ role: 'viewer' })).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('only matches owner', () => {
      expect(isOwner({ role: 'owner' })).toBe(true);
      expect(isOwner({ role: 'editor' })).toBe(false);
      expect(isOwner({ role: 'viewer' })).toBe(false);
    });
  });
});
