'use client';

import { motion, useReducedMotion } from 'framer-motion';

type AnimatedBlurHeadlineProps = {
  className?: string;
  text: string;
  breakAfterWord?: number;
};

export default function AnimatedBlurHeadline({ className, text, breakAfterWord }: AnimatedBlurHeadlineProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.trim().split(/\s+/);

  if (shouldReduceMotion) {
    return (
      <h1 className={className}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            {word}
            {index < words.length - 1 ? ' ' : ''}
            {breakAfterWord === index ? <br className="hidden md:block" /> : null}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <motion.h1
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.8 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.25,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <motion.span
            variants={{
              hidden: {
                opacity: 0,
                y: 18,
                filter: 'blur(7px)',
              },
              show: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  duration: 0.76,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            className="inline-block will-change-transform"
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? ' ' : ''}
          {breakAfterWord === index ? <br className="hidden md:block" /> : null}
        </span>
      ))}
    </motion.h1>
  );
}
