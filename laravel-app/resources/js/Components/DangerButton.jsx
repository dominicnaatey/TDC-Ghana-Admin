export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ` +
                    className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
