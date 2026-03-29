import type { ReactNode } from 'react';
import Container from '@/components/Container';

type SectionProps = {
  id?: string;
  className?: string;
  innerClassName?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  spacing?: 'default' | 'tight' | 'compact' | 'hero';
};

const spacingStyles: Record<NonNullable<SectionProps['spacing']>, string> = {
  default: 'section-rhythm-tight',
  tight: 'section-rhythm-compact',
  compact: 'py-6 md:py-8 lg:py-10',
  hero: 'section-rhythm-hero',
};

export default function Section({
  id,
  className = '',
  innerClassName = '',
  title,
  subtitle,
  children,
  spacing = 'default',
}: SectionProps) {
  return (
    <section id={id} className={`${spacingStyles[spacing]} ${className}`.trim()}>
      <Container className={innerClassName}>
        {(title || subtitle) && (
          <header className="section-header">
            {title ? <h2 className="t-h2">{title}</h2> : null}
            {subtitle ? <p className="t-body text-muted-foreground mt-2">{subtitle}</p> : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
