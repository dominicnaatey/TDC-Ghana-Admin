import { Link } from '@inertiajs/react';
import type { ComponentProps, ReactNode } from 'react';

type ResponsiveNavLinkProps = {
  active?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentProps<typeof Link>;

export default function ResponsiveNavLink({
  active = false,
  className = '',
  children,
  ...props
}: ResponsiveNavLinkProps) {
  return (
    <Link
      {...props}
      className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
        active
          ? 'border-blue-400 bg-blue-50 text-blue-700 focus-visible:border-blue-700 focus-visible:bg-blue-100 focus-visible:text-blue-800'
          : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus-visible:border-gray-300 focus-visible:bg-gray-50 focus-visible:text-gray-800'
      } text-base font-medium transition duration-150 ease-in-out focus-visible:outline-none ${className}`}
    >
      {children}
    </Link>
  );
}
