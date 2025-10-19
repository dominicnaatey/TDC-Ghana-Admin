import type { LabelHTMLAttributes, ReactNode } from 'react';

type InputLabelProps = {
  value?: ReactNode;
  className?: string;
  children?: ReactNode;
} & LabelHTMLAttributes<HTMLLabelElement>;

export default function InputLabel({
  value,
  className = '',
  children,
  ...props
}: InputLabelProps) {
  return (
    <label
      {...props}
      className={
        `mb-1 block text-sm font-medium text-gray-700 ` +
        className
      }
    >
      {value ? value : children}
    </label>
  );
}
