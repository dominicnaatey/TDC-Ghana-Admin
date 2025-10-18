import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent } from 'react';

export default function Index({ categories }: { categories: { data: Array<{ id: number; name: string; description?: string | null }>, links: any } }) {
    const { data, setData, post, processing, errors, reset } = useForm<{ name: string; description: string }>({
        name: '',
        description: '',
    });

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.data.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-4 py-2">{c.name}</td>
                                    <td className="px-4 py-2 text-gray-600">{c.description || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}