import { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    children?: ReactNode;
};

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: Props) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ` +
                    className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
