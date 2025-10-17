import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        cover_image: null,
        start_date: '',
        end_date: '',
        is_published: false,
        published_at: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.projects.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Project</h2>}>
            <Head title="Create Project" />

            <form onSubmit={submit} className="space-y-4 max-w-3xl">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Slug</label>
                    <input
                        type="text"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300 h-32"
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Cover Image (optional)</label>
                    <input
                        type="file"
                        onChange={(e) => setData('cover_image', e.target.files[0])}
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
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="mt-1 w-full rounded border-gray-300"
                        />
                        {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
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
                        onChange={(e) => setData('is_published', e.target.checked)}
                    />
                    <label htmlFor="is_published">Publish</label>
                </div>
                <div>
                    <label className="block text-sm font-medium">Published At</label>
                    <input
                        type="datetime-local"
                        value={data.published_at}
                        onChange={(e) => setData('published_at', e.target.value)}
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
                        Save
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}