type AnimatedBlurHeadlineProps = {
  className?: string;
  text: string;
  breakAfterWord?: number;
};

export default function AnimatedBlurHeadline({ className, text, breakAfterWord }: AnimatedBlurHeadlineProps) {
  const words = text.trim().split(/\s+/);
  return (
    <h1 className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          {word}{index < words.length - 1 ? ' ' : ''}
          {breakAfterWord === index ? <br className="hidden md:block" /> : null}
        </span>
      ))}
    </h1>
  );
}
