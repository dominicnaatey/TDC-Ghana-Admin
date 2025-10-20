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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const allSelected = posts?.data?.length > 0 && selectedIds.length === posts.data.length;

    const { counts } = usePage<{ counts?: { posts_deleted?: number; posts_total?: number } }>().props;
    const deletedCount = counts?.posts_deleted ?? 0;
    const totalCount = counts?.posts_total ?? posts?.meta?.total ?? posts?.total ?? posts?.data?.length ?? 0;

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

    // Selection and bulk handlers
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(posts.data.map((p: any) => p.id));
        }
    };

    const bulkMoveToDeleted = async () => {
        if (selectedIds.length === 0) return;
        setBulkProcessing(true);
        try {
            for (const id of selectedIds) {
                await new Promise<void>((resolve, reject) => {
                    router.delete(route('admin.posts.destroy', id), {
                        preserveScroll: true,
                        onSuccess: () => resolve(),
                        onError: () => reject(new Error('Failed to move post to Deleted')),
                    });
                });
            }
        } finally {
            setBulkProcessing(false);
            setSelectedIds([]);
        }
    };

    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const openBulkDeleteModal = () => setShowBulkDeleteModal(true);
    const closeBulkDeleteModal = () => setShowBulkDeleteModal(false);
    const confirmBulkDelete = () => {
        closeBulkDeleteModal();
        bulkMoveToDeleted();
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Posts</h2>}
        >
            <Head title="Posts" />

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    All Posts
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-700 text-sm">{totalCount}</span>
                </h3>
                <div className="flex items-center gap-2">
                    {deletedCount > 0 ? (
                        <Link
                            href={route('admin.posts.deleted')}
                            className="rounded bg-gray-200 px-3 py-2 text-gray-800 hover:bg-gray-300"
                        >
                            Deleted Posts <span className="rounded bg-indigo-100 px-2 py-0.5 text-red-700 text-sm">{deletedCount}</span>
                        </Link>
                    ) : (
                        <span
                            className="rounded bg-gray-100 px-3 py-2 text-gray-400 cursor-not-allowed hover:cursor-not-allowed"
                            aria-disabled="true"
                            title="No deleted posts"
                        >
                            Deleted Posts <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-700 text-sm">0</span>
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

            {selectedIds.length > 0 && (
                <div className="mb-3 flex items-center justify-between rounded border border-indigo-200 bg-indigo-50 p-3">
                    <span className="text-sm text-indigo-700">{selectedIds.length} selected</span>
                    <div className="flex gap-2">
                        <DangerButton onClick={openBulkDeleteModal} disabled={bulkProcessing}>
                            {bulkProcessing ? 'Moving…' : 'Move selected to Deleted'}
                        </DangerButton>
                        <SecondaryButton onClick={() => setSelectedIds([])} disabled={bulkProcessing}>
                            Clear selection
                        </SecondaryButton>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 w-8">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    aria-label="Select all posts on page"
                                />
                            </th>
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
                                <td className="px-4 py-2 w-8">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedIds.includes(post.id)}
                                        onChange={() => toggleSelect(post.id)}
                                        aria-label={`Select post ${post.title}`}
                                    />
                                </td>
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

            {/* Bulk Move Confirmation Modal */}
            <Modal show={showBulkDeleteModal} onClose={closeBulkDeleteModal}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Move selected posts to Deleted?</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        The selected posts will be moved to the Deleted Posts folder. You can restore them later.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeBulkDeleteModal} disabled={bulkProcessing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmBulkDelete} disabled={bulkProcessing}>
                            {bulkProcessing ? 'Moving…' : `Move ${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''}`}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

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