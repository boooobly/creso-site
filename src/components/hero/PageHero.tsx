import type { CSSProperties, ReactNode } from 'react';

type PageHeroProps = {
  className?: string;
  contentClassName?: string;
  mediaClassName?: string;
  media?: ReactNode;
  children: ReactNode;
};

type HeroEyebrowProps = {
  children: ReactNode;
  className?: string;
};

type HeroTitleProps = {
  as?: 'h1' | 'h2';
  children: ReactNode;
  className?: string;
};

type HeroLeadProps = {
  children: ReactNode;
  className?: string;
};

type HeroActionsProps = {
  className?: string;
  children: ReactNode;
};

type HeroChipListProps = {
  className?: string;
  children: ReactNode;
};

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

export function PageHero({ className, contentClassName, mediaClassName, media, children }: PageHeroProps) {
  return (
    <div className={cn('hero-shell', className)}>
      <div className={cn('hero-grid', media ? undefined : 'hero-grid-single')}>
        <div className={cn('hero-content', contentClassName)}>{children}</div>
        {media ? <div className={cn('hero-media', mediaClassName)}>{media}</div> : null}
      </div>
    </div>
  );
}

export function HeroEyebrow({ children, className }: HeroEyebrowProps) {
  return <p className={cn('hero-eyebrow', className)}>{children}</p>;
}

export function HeroTitle({ as: Tag = 'h1', children, className }: HeroTitleProps) {
  return <Tag className={cn('hero-title', className)}>{children}</Tag>;
}

export function HeroLead({ children, className }: HeroLeadProps) {
  return <p className={cn('hero-lead', className)}>{children}</p>;
}

export function HeroActions({ className, children }: HeroActionsProps) {
  return <div className={cn('hero-actions', className)}>{children}</div>;
}

export function HeroChipList({ className, children }: HeroChipListProps) {
  return <div className={cn('hero-chip-list', className)}>{children}</div>;
}

export function HeroMediaPanel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('hero-media-panel', className)}>{children}</div>;
}

export function HeroChip({ className, children, style }: { className?: string; children: ReactNode; style?: CSSProperties }) {
  return <span className={cn('hero-chip', className)} style={style}>{children}</span>;
}
