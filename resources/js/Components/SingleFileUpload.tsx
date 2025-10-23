import React, { useRef, useState } from 'react';

export type SingleFileUploadProps = {
  actionUrl?: string; // POST endpoint
  accept?: string; // input accept attr
  maxSizeMB?: number; // client-side limit
  instructions?: string; // helper text
  buttonLabel?: string;
  onSuccess?: (payload: any) => void; // callback with server JSON
};

const defaultInstructions = 'Select a file to upload. Allowed: images (jpeg, png, gif, webp) or PDF. Max size: 5MB.';

export default function SingleFileUpload({
  actionUrl = '/upload',
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  instructions = defaultInstructions,
  buttonLabel = 'Upload',
  onSuccess,
}: SingleFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setProgress(0);
    setIsUploading(false);
    setError(null);
    setSuccess(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validateFile = (f: File): string | null => {
    if (!f) return 'No file selected.';
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (f.size > maxBytes) return `File is too large. Max ${maxSizeMB}MB.`;

    // Basic type validation: accept images or pdf.
    const allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedMime.includes(f.type)) {
      // Fallback: check extension if type is empty or uncommon
      const ext = f.name.split('.').pop()?.toLowerCase();
      const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
      if (!ext || !allowedExt.includes(ext)) return 'Unsupported file type.';
    }
    return null;
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    setSuccess(null);
    setFile(f);
    if (f) {
      const vErr = validateFile(f);
      if (vErr) {
        setError(vErr);
      }
    }
  };

  const handleUpload = async () => {
    setError(null);
    setSuccess(null);
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    const vErr = validateFile(file);
    if (vErr) {
      setError(vErr);
      return;
    }

    const form = new FormData();
    form.append('file', file);

    const token = document.querySelector('meta[name=\'csrf-token\']')?.getAttribute('content') ?? '';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', actionUrl, true);
    xhr.setRequestHeader('X-CSRF-TOKEN', token);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setProgress(pct);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setError('Network error during upload. Please try again.');
    };

    xhr.onload = () => {
      setIsUploading(false);
      const status = xhr.status;
      try {
        const payload = JSON.parse(xhr.responseText || '{}');
        if (status >= 200 && status < 300) {
          setSuccess('Upload complete.');
          if (onSuccess) onSuccess(payload);
        } else if (status === 422) {
          const msg = payload?.message || payload?.error || 'Validation failed.';
          setError(msg);
        } else if (status === 413) {
          setError('File is too large for server.');
        } else if (status === 401 || status === 403) {
          setError('You are not authorized to upload.');
        } else {
          setError('Upload failed. Please try again.');
        }
      } catch (e) {
        setError('Unexpected server response.');
      }
    };

    setIsUploading(true);
    setProgress(0);
    xhr.send(form);
  };

  return (
    <div className="max-w-xl rounded border bg-white p-4">
      <h3 className="mb-2 text-lg font-medium">Single File Upload</h3>
      <p className="mb-3 text-sm text-gray-600">{instructions}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="mb-3 block w-full rounded border px-3 py-2"
      />

      {progress > 0 && (
        <div className="mb-3">
          <div className="h-2 w-full rounded bg-gray-200">
            <div
              className="h-2 rounded bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-600">{progress}%</p>
        </div>
      )}

      {error && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

      <div className="flex items-center gap-2">
        <button
          disabled={isUploading || !!(file && validateFile(file))}
          onClick={handleUpload}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {file && (
        <div className="mt-3 text-xs text-gray-500">
          <div>Selected: {file.name}</div>
          <div>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
          <div>Type: {file.type || 'n/a'}</div>
        </div>
      )}
    </div>
  );
}