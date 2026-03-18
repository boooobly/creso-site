import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonVariantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
