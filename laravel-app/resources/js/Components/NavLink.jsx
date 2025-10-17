import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus-visible:outline-none ' +
                (active
                    ? 'border-indigo-400 text-gray-900 focus-visible:border-indigo-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus-visible:border-gray-300 focus-visible:text-gray-700') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
