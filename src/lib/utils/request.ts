type HeaderSource = {
  get(name: string): string | null;
};

export function getClientIpFromHeaders(headers: HeaderSource): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = headers.get('x-real-ip');
  return realIp?.trim() || 'unknown';
}

export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}
