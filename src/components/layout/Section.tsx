import type { ReactNode } from 'react';
import Container from '@/components/Container';

type SectionProps = {
  id?: string;
  className?: string;
  innerClassName?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
};

export default function Section({
  id,
  className = '',
  innerClassName = '',
  title,
  subtitle,
  children,
}: SectionProps) {
  return (
    <section id={id} className={`py-10 md:py-14 ${className}`.trim()}>
      <Container className={innerClassName}>
        {(title || subtitle) && (
          <header className="mb-6 md:mb-8">
            {title ? <h2 className="t-h2">{title}</h2> : null}
            {subtitle ? <p className="t-body text-muted-foreground mt-2">{subtitle}</p> : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
