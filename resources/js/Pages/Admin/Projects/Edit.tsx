import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent } from 'react';

type ProjectEditFormData = {
    _method: 'put';
    name: string;
    slug: string;
    description: string;
    cover_image: File | null;
    start_date: string;
    end_date: string;
    is_published: boolean;
    published_at: string;
};

export default function Edit({ project }: { project: { id: number; name?: string | null; slug?: string | null; description?: string | null; start_date?: string | null; end_date?: string | null; is_published?: boolean | number; published_at?: string | null } }) {
    const { data, setData, post, processing, errors } = useForm<ProjectEditFormData>({
        _method: 'put',
        name: project.name || '',
        slug: project.slug || '',
        description: project.description || '',
        cover_image: null,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        is_published: !!project.is_published,
        published_at: project.published_at ? project.published_at.replace(' ', 'T') : '',
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('admin.projects.update', project.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Project</h2>}>
            <Head title={`Edit: ${project.name}`} />

            <form onSubmit={submit} className="space-y-4 max-w-3xl">
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
                    <label className="block text-sm font-medium">Slug</label>
                    <input
                        type="text"
                        value={data.slug}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('slug', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Cover Image (optional)</label>
                    <input
                        type="file"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('cover_image', e.target.files?.[0] ?? null)}
                        className="mt-1 w-full"
                    />
                    {errors.cover_image && <p className="text-sm text-red-600">{errors.cover_image}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Start Date</label>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('start_date', e.target.value)}
                            className="mt-1 w-full rounded border-gray-300"
                        />
                        {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            value={data.end_date}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('end_date', e.target.value)}
                            className="mt-1 w-full rounded border-gray-300"
                        />
                        {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        id="is_published"
                        type="checkbox"
                        checked={data.is_published}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('is_published', e.target.checked)}
                    />
                    <label htmlFor="is_published">Publish</label>
                </div>
                <div>
                    <label className="block text-sm font-medium">Published At</label>
                    <input
                        type="datetime-local"
                        value={data.published_at}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('published_at', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.published_at && <p className="text-sm text-red-600">{errors.published_at}</p>}
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        Update
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}