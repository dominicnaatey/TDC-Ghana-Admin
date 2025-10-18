import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Index({ posts }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const { counts } = usePage<{ counts?: { posts_deleted?: number } }>().props;
    const deletedCount = counts?.posts_deleted ?? 0;

    const openDeleteModal = (id: number) => {
        setPostToDelete(id);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPostToDelete(null);
    };

    const confirmDelete = () => {
        if (!postToDelete) return;
        router.delete(route('admin.posts.destroy', postToDelete), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => closeDeleteModal(),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Posts</h2>}
        >
            <Head title="Posts" />

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">All Posts</h3>
                <div className="flex items-center gap-2">
                    {deletedCount > 0 ? (
                        <Link
                            href={route('admin.posts.deleted')}
                            className="rounded bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300"
                        >
                            Deleted Posts ({deletedCount})
                        </Link>
                    ) : (
                        <span
                            className="rounded bg-gray-100 px-3 py-2 text-gray-400 cursor-not-allowed pointer-events-none"
                            aria-disabled="true"
                            title="No deleted posts"
                        >
                            Deleted Posts (0)
                        </span>
                    )}
                    <Link
                        href={route('admin.posts.create')}
                        className="rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                    >
                        New Post
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {posts.data.map((post) => (
                            <tr key={post.id}>
                                <td className="px-4 py-2">{post.title}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{post.slug}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{post.category?.name ?? '-'}</td>
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
                                        className="mr-2 inline-flex items-center rounded p-1 text-indigo-600 hover:text-indigo-800"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </Link>
                                    <button
                                        onClick={() => openDeleteModal(post.id)}
                                        className="inline-flex items-center rounded p-1 text-red-600 hover:text-red-800"
                                        title="Move to Deleted"
                                    >
                                        <TrashIcon className="h-5 w-5" />
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

            {/* Soft Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={closeDeleteModal}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Move post to Deleted Posts?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        The post will be moved to the Deleted Posts folder. You can restore it later.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Moving…' : 'Move to Deleted'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}