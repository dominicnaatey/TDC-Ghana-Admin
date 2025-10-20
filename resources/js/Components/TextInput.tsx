import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type TextInputProps = {
  type?: string;
  className?: string;
  isFocused?: boolean;
  showPasswordToggle?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default forwardRef<{ focus: () => void }, TextInputProps>(function TextInput(
  { type = 'text', className = '', isFocused = false, showPasswordToggle = true, ...props }: TextInputProps,
  ref,
) {
  const localRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  const isPassword = type === 'password';
  const inputType = isPassword ? (visible ? 'text' : 'password') : type;
  const baseClasses = 'rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ';
  const finalClassName = baseClasses + className + (isPassword && showPasswordToggle ? ' pr-10' : '');

  return (
    <div className="relative">
      <input
        {...props}
        type={inputType}
        className={finalClassName}
        ref={localRef}
      />
      {isPassword && showPasswordToggle && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          disabled={props.disabled}
        >
          {visible ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
});
