import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = { className?: string; children?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: Props) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus-visible:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ` +
                    className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
