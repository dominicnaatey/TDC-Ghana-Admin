import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ posts }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Posts</h2>}
        >
            <Head title="Posts" />

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">All Posts</h3>
                <Link
                    href={route('admin.posts.create')}
                    className="rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                >
                    New Post
                </Link>
            </div>

            <div className="overflow-hidden rounded border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
+                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {posts.data.map((post) => (
                            <tr key={post.id}>
                                <td className="px-4 py-2">{post.title}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{post.slug}</td>
+                               <td className="px-4 py-2 text-sm text-gray-700">{post.category?.name ?? '-'}</td>
                                <td className="px-4 py-2">
                                    {post.is_published ? (
                                        <span className="rounded bg-green-100 px-2 py-1 text-green-700 text-xs">Published</span>
                                    ) : (
                                        <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-700 text-xs">Draft</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <Link
                                        href={route('admin.posts.edit', post.id)}
                                        className="mr-2 text-indigo-600 hover:text-indigo-800"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => router.delete(route('admin.posts.destroy', post.id))}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex gap-2">
                {posts.links?.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url || ''}
                        className={`px-3 py-1 rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}