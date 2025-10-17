import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';

type TextInputProps = {
  type?: string;
  className?: string;
  isFocused?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default forwardRef<{ focus: () => void }, TextInputProps>(function TextInput(
  { type = 'text', className = '', isFocused = false, ...props }: TextInputProps,
  ref,
) {
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={
        'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ' +
        className
      }
      ref={localRef}
    />
  );
});
