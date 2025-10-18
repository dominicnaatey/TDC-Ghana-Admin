import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent } from 'react';

type PostEditFormData = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    is_published: boolean;
    published_at: string;
    category_id: string | null;
};

export default function Edit({ post, categories }: { post: { id: number; title?: string | null; slug?: string | null; excerpt?: string | null; content?: string | null; is_published?: boolean | number; published_at?: string | null; category_id?: number | null }, categories: Array<{ id: number; name: string }> }) {
    const { data, setData, put, processing, errors } = useForm<PostEditFormData>({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        is_published: !!post.is_published,
        published_at: post.published_at ? post.published_at.replace(' ', 'T') : '',
        category_id: post.category_id ? String(post.category_id) : ''
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('admin.posts.update', post.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Post</h2>}>
            <Head title={`Edit: ${post.title}`} />

            <form onSubmit={submit} className="space-y-4 max-w-3xl">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
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
                    <label className="block text sm font-medium">Excerpt</label>
                    <textarea
                        value={data.excerpt}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('excerpt', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Content</label>
                    <textarea
                        value={data.content}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('content', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300 h-40"
                    />
                    {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select
                        value={data.category_id ?? ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setData('category_id', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
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