import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Deleted({ posts }: { posts: any }) {
    const [showForceModal, setShowForceModal] = useState(false);
    const [postToForceDelete, setPostToForceDelete] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const openForceDelete = (id: number) => {
        setPostToForceDelete(id);
        setShowForceModal(true);
    };

    const closeForceModal = () => {
        setShowForceModal(false);
        setPostToForceDelete(null);
    };

    const confirmForceDelete = () => {
        if (!postToForceDelete) return;
        router.delete(route('admin.posts.force', postToForceDelete), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => closeForceModal(),
        });
    };

    const restore = (id: number) => {
        router.post(route('admin.posts.restore', id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Deleted Posts</h2>}
        >
            <Head title="Deleted Posts" />

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Trash</h3>
                <Link
                    href={route('admin.posts.index')}
                    className="rounded bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300"
                >
                    Back to All Posts
                </Link>
            </div>

            <div className="overflow-hidden rounded border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deleted At</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {posts.data.map((post: any) => (
                            <tr key={post.id}>
                                <td className="px-4 py-2">{post.title}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{post.slug}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{post.category?.name ?? '-'}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{post.deleted_at}</td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={() => restore(post.id)}
                                        className="mr-2 inline-flex items-center rounded p-1 text-blue-600 hover:text-blue-800"
                                        title="Restore"
                                    >
                                        <ArrowUturnLeftIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => openForceDelete(post.id)}
                                        className="inline-flex items-center rounded p-1 text-red-600 hover:text-red-800"
                                        title="Delete permanently"
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
                {posts.links?.map((link: any, idx: number) => (
                    <Link
                        key={idx}
                        href={link.url || ''}
                        className={`px-3 py-1 rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>

            {/* Force Delete Confirmation Modal */}
            <Modal show={showForceModal} onClose={closeForceModal}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Permanently delete post?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        This action cannot be undone. The post will be removed permanently.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeForceModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmForceDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete permanently'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}