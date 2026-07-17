import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { state, processNotificationJobsMock } = vi.hoisted(() => ({
  state: { cronSecret: undefined as string | undefined },
  processNotificationJobsMock: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({ CRON_SECRET: state.cronSecret }),
}));

vi.mock('@/lib/notifications/outbox', () => ({
  processNotificationJobs: processNotificationJobsMock,
}));

function request(secret?: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/internal/notifications/process', {
    headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
  });
}

describe('notification processor endpoint', () => {
  beforeEach(() => {
    state.cronSecret = undefined;
    processNotificationJobsMock.mockReset();
  });

  it('fails closed when CRON_SECRET is missing', async () => {
    const { GET } = await import('@/app/api/internal/notifications/process/route');
    const response = await GET(request());

    expect(response.status).toBe(503);
    expect(processNotificationJobsMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid bearer token', async () => {
    state.cronSecret = 'correct-secret';
    const { GET } = await import('@/app/api/internal/notifications/process/route');
    const response = await GET(request('wrong-secret'));

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('processes due jobs with a valid bearer token', async () => {
    state.cronSecret = 'correct-secret';
    processNotificationJobsMock.mockResolvedValue({ selected: 2, claimed: 2, completed: 2, failed: 0 });
    const { GET } = await import('@/app/api/internal/notifications/process/route');
    const response = await GET(request('correct-secret'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, selected: 2, claimed: 2, completed: 2, failed: 0 });
    expect(processNotificationJobsMock).toHaveBeenCalledWith({ limit: 20 });
  });
});
