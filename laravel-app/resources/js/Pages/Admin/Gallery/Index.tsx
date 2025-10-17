import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ images }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gallery</h2>}>
            <Head title="Gallery" />

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">All Images</h3>
                <Link
                    href={route('admin.gallery.create')}
                    className="rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                >
                    Upload Image
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.data.map((img) => (
                    <div key={img.id} className="rounded border bg-white p-2">
                        <img src={`/storage/${img.image_path}`} alt={img.title} className="h-40 w-full object-cover rounded" />
                        <div className="mt-2 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium">{img.title}</p>
                                {img.caption && <p className="text-xs text-gray-500">{img.caption}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={route('admin.gallery.edit', img.id)} className="text-indigo-600 hover:text-indigo-800 text-sm">Edit</Link>
                                <button
                                    onClick={() => router.delete(route('admin.gallery.destroy', img.id))}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex gap-2">
                {images.links?.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url || ''}
                        className={`px-3 py-1 rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}