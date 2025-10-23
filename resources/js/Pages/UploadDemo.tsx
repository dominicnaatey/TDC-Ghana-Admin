import { Head } from '@inertiajs/react';
import SingleFileUpload from '@/Components/SingleFileUpload';

export default function UploadDemo() {
  const action = (typeof route !== 'undefined') ? route('upload.store') : '/upload';
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Head title="Upload Demo" />
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-4 text-2xl font-semibold text-gray-800">Upload Demo</h1>
        <p className="mb-6 text-gray-600">
          This page demonstrates a minimal, secure single-file upload component.
          It validates file type and size, shows progress, and reports errors clearly.
        </p>

        <SingleFileUpload
          actionUrl={action}
          accept="image/*,application/pdf"
          maxSizeMB={5}
          instructions="Choose an image (jpeg, png, gif, webp) or PDF up to 5MB."
          onSuccess={(payload) => {
            // eslint-disable-next-line no-console
            console.log('Uploaded:', payload);
          }}
        />

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Notes:
            <br />
            - This endpoint requires authentication by default. If you are not logged in,
            uploading will return an authorization error.
            <br />
            - Ensure you run <code>php artisan storage:link</code> in production to expose uploaded files.
          </p>
        </div>
      </div>
    </div>
  );
}