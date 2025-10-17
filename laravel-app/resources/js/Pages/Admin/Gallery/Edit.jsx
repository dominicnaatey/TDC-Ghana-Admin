import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ image }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        title: image.title || '',
        image: null,
        caption: image.caption || '',
        sort_order: image.sort_order ?? 0,
        is_published: !!image.is_published,
        published_at: image.published_at ? image.published_at.replace(' ', 'T') : '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.gallery.update', image.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Image</h2>}>
            <Head title={`Edit: ${image.title}`} />

            <form onSubmit={submit} className="space-y-4 max-w-3xl">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Image (optional)</label>
                    <input
                        type="file"
                        onChange={(e) => setData('image', e.target.files[0])}
                        className="mt-1 w-full"
                    />
                    {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Caption</label>
                    <textarea
                        value={data.caption}
                        onChange={(e) => setData('caption', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.caption && <p className="text-sm text-red-600">{errors.caption}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Sort Order</label>
                    <input
                        type="number"
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', Number(e.target.value))}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.sort_order && <p className="text-sm text-red-600">{errors.sort_order}</p>}
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
                        Update
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}