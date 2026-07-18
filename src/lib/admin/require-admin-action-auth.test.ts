import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isAdminAuthenticatedMock, redirectMock } = vi.hoisted(() => ({
  isAdminAuthenticatedMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: isAdminAuthenticatedMock,
}));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

describe('requireAdminActionAuth', () => {
  beforeEach(() => {
    isAdminAuthenticatedMock.mockReset();
    redirectMock.mockClear();
  });

  it('allows authenticated admin actions', async () => {
    isAdminAuthenticatedMock.mockResolvedValue(true);
    const { requireAdminActionAuth } = await import('./require-admin-action-auth');

    await expect(requireAdminActionAuth()).resolves.toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated action calls before mutation', async () => {
    isAdminAuthenticatedMock.mockResolvedValue(false);
    const { requireAdminActionAuth } = await import('./require-admin-action-auth');

    await expect(requireAdminActionAuth()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenCalledWith('/admin/login');
  });
});
