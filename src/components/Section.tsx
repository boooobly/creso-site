import type { PropsWithChildren } from 'react';
import Container from '@/components/Container';

type SectionProps = PropsWithChildren<{
  className?: string;
  containerClassName?: string;
  id?: string;
  background?: 'default' | 'muted';
}>;

const backgroundStyles: Record<NonNullable<SectionProps['background']>, string> = {
  default: 'bg-white',
  muted: 'bg-neutral-50/70',
};

export default function Section({
  children,
  className = '',
  containerClassName = '',
  id,
  background = 'default',
}: SectionProps) {
  return (
    <section id={id} className={`py-12 md:py-20 ${backgroundStyles[background]} ${className}`.trim()}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
