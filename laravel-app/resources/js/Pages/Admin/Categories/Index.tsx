import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Index({ categories }: { categories: { data: Array<{ id: number; name: string; description?: string | null }>, links: any } }) {
    const { data, setData, post, processing, errors, reset } = useForm<{ name: string; description: string }>({
        name: '',
        description: '',
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const editForm = useForm<{ name: string; description: string }>({ name: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const startEdit = (c: { id: number; name: string; description?: string | null }) => {
        setEditingId(c.id);
        editForm.setData({ name: c.name, description: c.description || '' });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const handleSave = () => {
        if (!editingId) return;
        editForm.put(route('admin.categories.update', editingId), {
            onSuccess: () => cancelEdit(),
        });
    };

    const openDeleteConfirm = (c: { id: number; name: string }) => {
        setConfirmDelete({ id: c.id, name: c.name });
    };

    const performDelete = () => {
        if (!confirmDelete) return;
        setDeleting(true);
        router.delete(route('admin.categories.destroy', confirmDelete.id), {
            onSuccess: () => {
                setConfirmDelete(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Categories</h2>}>
            <Head title="Categories" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <form onSubmit={submit} className="space-y-4 bg-white rounded border p-4">
                    <h3 className="text-lg font-medium">Add New Category</h3>
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                            className="mt-1 w-full rounded border-gray-300"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description (optional)</label>
                        <textarea
                            value={data.description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                            className="mt-1 w-full rounded border-gray-300"
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        >
                            Create
                        </button>
                    </div>
                </form>

                <div className="bg-white rounded border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.data.map((c) => (
                                editingId === c.id ? (
                                    <tr key={c.id}>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => editForm.setData('name', e.target.value)}
                                                className="mt-1 w-full rounded border-gray-300"
                                            />
                                            {editForm.errors.name && <p className="text-sm text-red-600">{editForm.errors.name}</p>}
                                        </td>
                                        <td className="px-4 py-2">
                                            <textarea
                                                value={editForm.data.description}
                                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => editForm.setData('description', e.target.value)}
                                                className="mt-1 w-full rounded border-gray-300"
                                            />
                                            {editForm.errors.description && <p className="text-sm text-red-600">{editForm.errors.description}</p>}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={handleSave}
                                                disabled={editForm.processing}
                                                className="mr-2 rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={c.id}>
                                        <td className="px-4 py-2">{c.name}</td>
                                        <td className="px-4 py-2 text-gray-600">{c.description || ''}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                aria-label="Edit category"
                                                onClick={() => startEdit(c)}
                                                className="mr-2 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                aria-label="Delete category"
                                                onClick={() => openDeleteConfirm(c)}
                                                className="inline-flex items-center text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Modal */}
                <Modal show={!!confirmDelete} onClose={() => !deleting && setConfirmDelete(null)} maxWidth="sm">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete "<span className="font-semibold">{confirmDelete?.name}</span>"?
                            This action cannot be undone. Posts assigned to this category will be uncategorized.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setConfirmDelete(null)} disabled={deleting}>
                                Cancel
                            </SecondaryButton>
                            <DangerButton onClick={performDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Delete'}
                            </DangerButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}