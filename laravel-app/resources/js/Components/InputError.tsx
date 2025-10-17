import type { HTMLAttributes } from 'react';

type InputErrorProps = {
  message?: string;
  className?: string;
} & HTMLAttributes<HTMLParagraphElement>;

export default function InputError({ message, className = '', ...props }: InputErrorProps) {
  return message ? (
    <p
      {...props}
      className={'mt-1 text-sm text-red-600 ' + className}
    >
      {message}
    </p>
  ) : null;
}
