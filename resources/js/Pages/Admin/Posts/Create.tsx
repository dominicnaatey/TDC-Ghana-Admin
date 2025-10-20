import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ChangeEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';

type PostFormData = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    is_published: boolean;
    published_at: string;
    category_id: string | null;
};

export default function Create({ categories }: { categories: Array<{ id: number; name: string }> }) {
    const { data, setData, post, processing, errors, transform } = useForm<PostFormData>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        is_published: false,
        published_at: '',
        category_id: ''
    });

    // Normalize payload before submission to avoid validation issues
    transform((d) => ({
        ...d,
        category_id: d.category_id ? Number(d.category_id) : null,
        published_at: d.published_at || null,
    }));

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
        return '';
    };
    const xsrfToken = getCookie('XSRF-TOKEN');
    const imagesUploadHandler = async (blobInfo: any, _progress: (percent: number) => void) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        if (csrfToken) {
            formData.append('_token', csrfToken);
        } else if (xsrfToken) {
            formData.append('_token', xsrfToken);
        }
        const res = await fetch(route('admin.editor.upload'), {
            method: 'POST',
            body: formData,
            headers: xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : (csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            credentials: 'same-origin',
        });
        if (!res.ok) throw new Error('Upload failed');
        const json = await res.json();
        if (!json?.location) throw new Error('Invalid upload response');
        return json.location as string;
    };

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('admin.posts.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Post</h2>}>
            <Head title="Create Post" />

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
                    <label className="block text-sm font-medium">Excerpt</label>
                    <textarea
                        value={data.excerpt}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('excerpt', e.target.value)}
                        className="mt-1 w-full rounded border-gray-300"
                    />
                    {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Content</label>
                    <Editor
                        key="create-editor"
                        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                        value={data.content}
                        onEditorChange={(newContent) => setData('content', newContent)}
                        init={{
                            height: 400,
                            menubar: false,
                            branding: false,
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            toolbar_mode: 'sliding',
                            images_upload_handler: imagesUploadHandler,
                            file_picker_types: 'image media',
                            media_live_embeds: true,
                            content_style: 'body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, sans-serif; font-size: 14px; }',
                        }}
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
                        Save
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}