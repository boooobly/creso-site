import type { PropsWithChildren } from 'react';

export default function Container({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}>{children}</div>;
}
