import NavLink from '@/Components/NavLink';
import { Link } from '@inertiajs/react';

export default function Sidebar() {
    return (
        <div className="sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 bg-white p-4">
            <div className="mb-6 flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 text-gray-800">
                    <span className="font-semibold">TDC Admin</span>
                </Link>
            </div>

            <nav className="flex flex-col space-y-1">
                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                    Dashboard
                </NavLink>
                <NavLink href={route('profile.edit')} active={route().current('profile.edit')}>
                    Profile
                </NavLink>
                <NavLink href={route('admin.posts.index')} active={route().current('admin.posts.*')}>
                    Posts
                </NavLink>
                <NavLink href={route('admin.gallery.index')} active={route().current('admin.gallery.*')}>
                    Gallery
                </NavLink>
                <NavLink href={route('admin.projects.index')} active={route().current('admin.projects.*')}>
                    Projects
                </NavLink>
            </nav>
        </div>
    );
}